// Run after `npm run build:vercel`; starts a local server, never deploys.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { project, projectLabel } from "../lib/project.ts";
import { candidates as candidateRegistry } from "../lib/data.ts";

let server;
let origin;
let logs = "";
before(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "0",
    ],
    {
      env: { ...process.env, SITE_URL: "", NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Next.js did not become ready: ${logs}`)),
      30000,
    );
    const onData = (chunk) => {
      logs += chunk.toString();
      const address = logs.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (address && /Ready in/.test(logs)) {
        origin = address[0];
        clearTimeout(timer);
        resolve();
      }
    };
    server.stdout.on("data", onData);
    server.stderr.on("data", onData);
    server.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Next.js exited ${code}: ${logs}`));
    });
  });
});
after(async () => {
  if (server && server.exitCode === null) {
    const closed = once(server, "exit");
    server.kill("SIGTERM");
    await closed;
  }
});

function assertNoCandidateFixturesOrScores(html, pathname) {
  const content = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(
    content,
    /山田\s*太郎|佐藤\s*美咲|高橋\s*健|田中\s*彩/,
    pathname,
  );
  assert.doesNotMatch(
    content,
    /一致度\s*[:：]?\s*\d|\d+\s*[%％]|近い候補者が見つかり/,
    pathname,
  );
}

test("all application routes render on the Vercel Next.js runtime", async () => {
  for (const path of [
    "/",
    "/diagnosis",
    "/questions",
    "/results",
    "/candidates",
    "/compare",
    "/saved",
    "/issues",
    "/issues?theme=education",
    "/interests",
    "/stories",
    "/research",
    "/policy-register",
    "/about",
    "/method",
    "/sources",
    "/privacy",
  ]) {
    const response = await fetch(`${origin}${path}`, {
      headers: { "User-Agent": "Twitterbot" },
    });
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("referrer-policy"), "origin");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    const html = await response.text();
    assert.match(html, /lang="ja"/, path);
    assert.match(html, /name="referrer" content="origin"/, path);
    assert.match(html, /id="main"/, path);
    assert.match(html, /rel="icon"[^>]*href="\/favicon\.ico\?v=logo-2"/, path);
    assert.match(html, /rel="icon"[^>]*href="\/icon-192\.png\?v=logo-2"/, path);
    assert.match(
      html,
      /rel="apple-touch-icon"[^>]*href="\/apple-touch-icon\.png\?v=logo-2"/,
      path,
    );
    assert.match(
      html,
      /rel="manifest"[^>]*href="\/site\.webmanifest\?v=logo-2"/,
      path,
    );
    assert.doesNotMatch(
      html,
      /rel="(?:icon|apple-touch-icon)"[^>]*href="\/(?:favicon\.ico|icon-192\.png|apple-touch-icon\.png)"/,
      path,
    );
    assert.match(html, /name="theme-color" content="#fffdf7"/, path);
    assert.ok(html.includes(`${origin}/og.png?v=logo-2`), path);
    assert.match(html, /property="og:image:width" content="1733"/, path);
    assert.match(html, /property="og:image:height" content="907"/, path);
    assert.match(html, /src="\/brand-logo\.png"/, path);
    assert.doesNotMatch(html, /vinext|Starter Project|codex-preview/, path);
    assertNoCandidateFixturesOrScores(html, path);
    assert.doesNotMatch(html, /土浦市選挙区/, path);
    if (path !== "/questions") assert.match(html, /つくば市選挙区/, path);
  }
});

test("full brand logo, favicon, home screen icons, manifest and social card are served", async () => {
  for (const path of [
    "/favicon.ico",
    "/favicon.ico?v=logo-2",
    "/apple-touch-icon.png",
    "/apple-touch-icon.png?v=logo-2",
    "/icon-192.png",
    "/icon-192.png?v=logo-2",
    "/icon-512.png",
    "/icon-512.png?v=logo-2",
    "/brand-logo.png",
    "/og.png",
    "/og.png?v=logo-2",
  ]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    const data = Buffer.from(await response.arrayBuffer());
    if (new URL(path, origin).pathname.endsWith(".ico")) {
      assert.equal(data.readUInt16LE(2), 1);
      assert.equal(data.readUInt16LE(4), 3);
    } else {
      assert.equal(data.subarray(1, 4).toString(), "PNG", path);
      if (path.startsWith("/og.png")) {
        assert.equal(data.readUInt32BE(16), 1733);
        assert.equal(data.readUInt32BE(20), 907);
      }
    }
    assert.match(response.headers.get("content-type"), /image\//, path);
  }
  const manifestResponse = await fetch(`${origin}/site.webmanifest?v=logo-2`);
  assert.equal(manifestResponse.status, 200);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.short_name, "オシセン");
  assert.equal(manifest.theme_color, "#fffdf7");
  assert.equal(manifest.background_color, "#fffdf7");
  assert.deepEqual(
    manifest.icons.map(({ src }) => src),
    ["/icon-192.png?v=logo-2", "/icon-512.png?v=logo-2"],
  );
  assert.deepEqual(
    manifest,
    await (await fetch(`${origin}/site.webmanifest`)).json(),
    "versioned manifest requests serve the current manifest without changing its identity",
  );
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Disallow: \//);
});

test("client navigation receives React payloads and loadable JavaScript", async () => {
  for (const path of [
    "/diagnosis",
    "/questions",
    "/results",
    "/compare",
    "/saved",
    "/issues?theme=healthcare",
    "/candidates",
    "/interests",
    "/stories",
    "/research",
    "/policy-register",
  ]) {
    const response = await fetch(`${origin}${path}`, { headers: { RSC: "1" } });
    assert.equal(response.status, 200, path);
    assert.match(
      response.headers.get("content-type"),
      /text\/x-component/,
      path,
    );
    assert.ok((await response.text()).length > 0, path);
  }
  const html = await (await fetch(origin)).text();
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.ok(scripts.length > 0, "the page includes client JavaScript");
  for (const script of scripts) {
    const url = new URL(script.replaceAll("&amp;", "&"), origin);
    assert.equal(url.origin, origin);
    const response = await fetch(url);
    assert.equal(response.status, 200, script);
    assert.match(response.headers.get("content-type"), /javascript/);
  }
});

test("draft issues and empty candidate registry survive production rendering", async () => {
  assert.equal(project.electionYear, 2026);
  assert.equal(project.district, "つくば市選挙区");
  assert.equal(candidateRegistry.length, 0);
  const issue = await (await fetch(`${origin}/issues?theme=healthcare`)).text();
  assert.match(issue, /地域医療/);
  assert.match(issue, /確認中の質問案/);
  assert.match(issue, /本人の回答は、まだありません/);
  assert.match(issue, /href="\/policy-register"/);
  assert.doesNotMatch(issue, /サンプル回答|href="\/candidates\//);
  const invalid = await (await fetch(`${origin}/issues?theme=unknown`)).text();
  assert.match(invalid, /指定されたテーマが見つからない/);
  const duplicate = await (
    await fetch(`${origin}/issues?theme=education&theme=healthcare`)
  ).text();
  assert.match(duplicate, /指定されたテーマが見つからない/);
  const candidates = await (await fetch(`${origin}/candidates`)).text();
  assert.match(candidates, /候補者の情報は、これから/);
  assertNoCandidateFixturesOrScores(candidates, "/candidates");
  assert.doesNotMatch(candidates, /href="\/candidates\//);
  const home = await (await fetch(origin)).text();
  assert.match(home, /つくば市選挙区/);
  assert.ok(home.includes(projectLabel));
  assert.match(home, /候補者情報は未掲載/);
  assert.match(home, /Podcast取材はこれから/);
  for (const href of [
    "/compare",
    "/saved",
    "/issues",
    "/stories",
    "/interests",
    "/research",
    "/policy-register",
  ])
    assert.ok(home.includes(`href="${href}"`), href);
});

test("new research entrances preserve the draft and pre-interview boundaries", async () => {
  const register = await (await fetch(`${origin}/policy-register`)).text();
  assert.match(register, /まだ草案/);
  assert.match(register, /question-ledger-2026-09-18-v1/);
  assert.match(register, /保留/);
  assert.match(register, /id="P01"/);
  assert.match(register, /id="P08"/);
  const stories = await (await fetch(`${origin}/stories`)).text();
  assert.match(stories, /取材・掲載の準備中/);
  assert.match(stories, /ヒアリングはまだ実施していません/);
  for (let index = 1; index <= 6; index++) {
    assert.ok(stories.includes(`id="H0${index}"`));
  }
  assert.doesNotMatch(stories, /<iframe/);
});

test("former demo candidates, unknown candidates and missing pages return real 404s", async () => {
  for (const path of [
    "/candidates/sato-misaki",
    "/candidates/takahashi-ken",
    "/candidates/tanaka-aya",
    "/candidates/yamada-taro",
    "/candidates/not-a-candidate",
    "/page-does-not-exist",
  ]) {
    const response = await fetch(`${origin}${path}`, {
      headers: { "User-Agent": "Twitterbot" },
    });
    assert.equal(response.status, 404, path);
    const html = await response.text();
    assert.match(html, /ページが見つかりません/);
    assertNoCandidateFixturesOrScores(html, path);
  }
});

test("operator profiles, self-reported answers and the supplied portraits are served", async () => {
  const html = await (await fetch(`${origin}/about`)).text();
  for (const text of [
    "Ryo",
    "Louis",
    "大屋涼",
    "竹内琉瑛",
    "クレイジーネゴシエーター",
    "見習い科学哲学者",
    "政策提言立案",
    "本と論文を読む",
    "サッカー観戦、ランニング",
    "認知科学、AI開発、日本古代史探究",
  ]) {
    assert.ok(html.includes(text), text);
  }
  for (const member of ["oya", "takeuchi"]) {
    assert.ok(html.includes(`id="team-${member}"`));
    assert.ok(html.includes(`src="/team/${member}.jpg"`));
    const response = await fetch(`${origin}/team/${member}.jpg`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /image\/jpeg/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(
      bytes,
      await readFile(new URL(`../public/team/${member}.jpg`, import.meta.url)),
    );
  }
  assert.match(html, /id="team-qa"/);
  assert.match(html, /<details\b/);
  assert.match(html, /本人の回答を準備中/);
  for (const path of ["/privacy", "/method", "/sources"]) {
    const page = await (await fetch(`${origin}${path}`)).text();
    if (path === "/privacy") {
      assert.ok(page.includes("大屋涼"), path);
      assert.ok(page.includes("竹内琉瑛"), path);
    }
    assert.ok(page.includes('href="/about#team"'), path);
    assert.doesNotMatch(page, /運営主体・責任者は未確定/, path);
  }
});

test("Vercel selects the Next.js build instead of the Sites build", async () => {
  const config = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.equal(config.framework, "nextjs");
  assert.equal(config.buildCommand, "npm run build:vercel");
  assert.equal(config.installCommand, "npm ci");
});

test("official links open safely and contact details remain usable without email integration", async () => {
  for (const path of ["/", "/about", "/privacy", "/method", "/sources"]) {
    const html = await (await fetch(`${origin}${path}`)).text();
    const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => tag);
    for (const href of [
      "https://www.instagram.com/oshisen.official/",
      "https://x.com/OshisenOfficial",
    ]) {
      const links = anchors.filter((tag) => tag.includes(`href="${href}"`));
      assert.ok(links.length > 0, `${path}: ${href}`);
      for (const link of links) {
        assert.match(link, /target="_blank"/);
        assert.match(link, /rel="noopener noreferrer"/);
      }
    }
    assert.ok(
      anchors.some((tag) =>
        tag.includes('href="mailto:oshisen0914@gmail.com"'),
      ),
      path,
    );
    assert.ok(html.includes('href="/about#contact"'), path);
    assert.doesNotMatch(html, /[?&]stkn=/, path);
    assert.doesNotMatch(
      html,
      /受付先はありません|受付先は設置していません/,
      path,
    );
    assert.doesNotMatch(
      html,
      /<iframe|instagram\.com\/embed|platform\.twitter\.com/,
      path,
    );
  }
  const about = await (await fetch(`${origin}/about`)).text();
  assert.match(about, /id="contact"/);
  assert.match(about, /アドレスをコピー/);
});
