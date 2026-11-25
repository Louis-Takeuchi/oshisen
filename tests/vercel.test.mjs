// Run after `npm run build:vercel`; starts a local server, never deploys.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { project, projectLabel } from "../lib/project.ts";
import { candidates as candidateRegistry } from "../lib/data.ts";
import {
  DEMO_DATA_BANNER_TEXT,
  isDemoData,
} from "../lib/candidates2026.ts";
import { registerSeoHttpTests } from "./seo-http.test.mjs";

let server;
let origin;
async function startServer(vercelEnvironment = "production") {
  let logs = "";
  const child = spawn(
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
      env: {
        ...process.env,
        SITE_URL: "",
        VERCEL_ENV: vercelEnvironment,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const address = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Next.js did not become ready: ${logs}`));
    }, 30000);
    const onData = (chunk) => {
      logs += chunk.toString();
      const address = logs.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (address && /Ready in/.test(logs)) {
        clearTimeout(timer);
        resolve(address[0]);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Next.js exited ${code}: ${logs}`));
    });
  });
  return {
    origin: address,
    async stop() {
      if (child.exitCode === null) {
        const closed = once(child, "exit");
        child.kill("SIGTERM");
        await closed;
      }
    },
  };
}
before(async () => {
  server = await startServer();
  origin = server.origin;
});
after(async () => {
  await server?.stop();
});

function assertNoCandidateFixturesOrScores(html, pathname) {
  let content = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
  // These policy pages explain why excluded candidates must never receive 0%.
  if (pathname === "/neutrality" || pathname === "/method") {
    content = content.replace(
      /0％(?=その他の評価値を付与しません|や中立に置き換えません)/gu,
      "",
    );
  }
  assert.doesNotMatch(
    content,
    /山田\s*太郎|佐藤\s*美咲|高橋\s*健|田中\s*彩/,
    pathname,
  );
  // デモ表示中（isDemoData）は候補者A〜Dを意図して出しているため、通常運用時のみ検査する。
  if (!isDemoData) {
    assert.doesNotMatch(content, /候補者[ＡＢＣＤABCD]/, pathname);
  }
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
    "/talk",
    "/q/p01",
    "/q/u02",
    "/interests",
    "/stories",
    "/research",
    "/policy-register",
    "/about",
    "/method",
    "/sources",
    "/neutrality",
    "/privacy",
    "/tsuchiura/elections",
    "/ibaraki-2026/tsuchiura",
  ]) {
    const response = await fetch(`${origin}${path}`, {
      headers: { "User-Agent": "Twitterbot" },
    });
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("referrer-policy"), "origin");
    assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /noindex/);
    const html = await response.text();
    assert.match(html, /lang="ja"/, path);
    assert.match(html, /name="referrer" content="origin"/, path);
    assert.match(html, /id="main"/, path);
    assert.match(html, /rel="icon"[^>]*href="\/favicon\.ico\?v=sns-1"/, path);
    assert.match(html, /rel="icon"[^>]*href="\/icon-192\.png\?v=sns-1"/, path);
    assert.match(
      html,
      /rel="apple-touch-icon"[^>]*href="\/apple-touch-icon\.png\?v=sns-1"/,
      path,
    );
    assert.match(
      html,
      /rel="manifest"[^>]*href="\/site\.webmanifest\?v=sns-1"/,
      path,
    );
    assert.doesNotMatch(
      html,
      /rel="(?:icon|apple-touch-icon)"[^>]*href="\/(?:favicon\.ico|icon-192\.png|apple-touch-icon\.png)"/,
      path,
    );
    assert.match(html, /name="theme-color" content="#fffdf7"/, path);
    if (path.startsWith("/q/")) {
      assert.ok(
        html.includes(
          `https://www.oshisen.com/share/q-${path.slice(3)}.png?v=1`,
        ),
        path,
      );
    } else {
      assert.ok(html.includes("https://www.oshisen.com/og.png?v=logo-2"), path);
      assert.match(html, /property="og:image:width" content="1733"/, path);
      assert.match(html, /property="og:image:height" content="907"/, path);
    }
    assert.match(html, /src="\/brand-logo\.png"/, path);
    assert.doesNotMatch(html, /vinext|Starter Project|codex-preview/, path);
    assertNoCandidateFixturesOrScores(html, path);
    if (path !== "/questions") {
      assert.match(html, /つくば市選挙区・土浦市選挙区/, path);
    }
  }
});

test("full brand logo, favicon, home screen icons, manifest and social card are served", async () => {
  for (const path of [
    "/favicon.ico",
    "/favicon.ico?v=sns-1",
    "/apple-touch-icon.png",
    "/apple-touch-icon.png?v=sns-1",
    "/icon-192.png",
    "/icon-192.png?v=sns-1",
    "/icon-512.png",
    "/icon-512.png?v=sns-1",
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
  const manifestResponse = await fetch(`${origin}/site.webmanifest?v=sns-1`);
  assert.equal(manifestResponse.status, 200);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.short_name, "オシセン");
  assert.equal(manifest.theme_color, "#fffdf7");
  assert.equal(manifest.background_color, "#fffdf7");
  assert.deepEqual(
    manifest.icons.map(({ src }) => src),
    ["/icon-192.png?v=sns-1", "/icon-512.png?v=sns-1"],
  );
  assert.deepEqual(
    manifest,
    await (await fetch(`${origin}/site.webmanifest`)).json(),
    "versioned manifest requests serve the current manifest without changing its identity",
  );
});

test("publication rules links serve the supplied PDF with matching edition and size", async () => {
  const rules = JSON.parse(
    await readFile(new URL("../lib/publication-rules.json", import.meta.url), "utf8"),
  );
  const config = JSON.parse(
    await readFile(new URL("../documents/publication-rules/document.json", import.meta.url), "utf8"),
  );
  const response = await fetch(`${origin}${rules.href}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/pdf/);
  const pdf = Buffer.from(await response.arrayBuffer());
  assert.equal(pdf.length, rules.bytes);
  assert.deepEqual(
    pdf,
    await readFile(new URL(`../documents/publication-rules/${config.sourcePdf}`, import.meta.url)),
    "the public download must preserve the supplied PDF",
  );
  for (const path of ["/", "/about", "/method", "/neutrality"]) {
    const html = await (await fetch(`${origin}${path}`)).text();
    assert.ok(html.includes(`href="${rules.href}"`), path);
    if (path !== "/") assert.ok(html.includes(rules.edition), path);
    if (path === "/about") {
      assert.ok(html.includes(`${Math.ceil(rules.bytes / 1024)}`));
      assert.doesNotMatch(html, /PDF・A4/);
    }
  }
});

test("client navigation receives React payloads and loadable JavaScript", async () => {
  for (const path of [
    "/diagnosis",
    "/questions",
    "/results",
    "/compare",
    "/saved",
    "/issues",
    "/q/p01",
    "/talk",
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

test("sent questions and empty candidate registry survive production rendering", async () => {
  assert.equal(project.electionYear, 2026);
  assert.deepEqual(project.districts, ["つくば市選挙区", "土浦市選挙区"]);
  assert.equal(candidateRegistry.length, 0);
  const issues = await (await fetch(`${origin}/issues`)).text();
  assert.match(issues, /候補者送付版（2026年10月30日）/);
  assert.ok(issues.includes('href="/q/p01"'));
  assert.ok(issues.includes('href="/q/u02"'));
  assert.doesNotMatch(issues, /確認中の質問案|指定されたテーマが見つからない/);
  const question = await (await fetch(`${origin}/q/p01`)).text();
  assert.match(question, /路線バス/);
  assert.match(question, /候補者が答えた原文を見る/);
  if (isDemoData) {
    assert.match(question, /候補者の回答（届出順）/);
    assert.ok(question.includes(DEMO_DATA_BANNER_TEXT), "demo banner on /q");
  } else {
    assert.match(
      question,
      /候補者の回答は12月4日（告示日）以降、届出順にここに並びます/,
    );
    assert.doesNotMatch(question, /サンプル回答|href="\/candidates\//);
  }
  const candidates = await (await fetch(`${origin}/candidates`)).text();
  assertNoCandidateFixturesOrScores(candidates, "/candidates");
  if (isDemoData) {
    assert.ok(candidates.includes(DEMO_DATA_BANNER_TEXT), "demo banner");
    assert.match(candidates, /href="\/candidates\//);
  } else {
    assert.match(candidates, /候補者情報の掲載準備/);
    assert.doesNotMatch(candidates, /href="\/candidates\//);
  }
  const home = await (await fetch(origin)).text();
  assert.match(home, /つくば市選挙区/);
  assert.ok(home.includes(projectLabel));
  assert.match(home, /インタビュー収録を進めています/);
  assert.match(home, /12月4日（告示日）以降、立候補届出順に公開します/);
  assert.doesNotMatch(home, /Podcast/);
  for (const href of [
    "/compare",
    "/saved",
    "/issues",
    "/stories",
    "/talk",
    "/interests",
    "/research",
    "/policy-register",
  ])
    assert.ok(home.includes(`href="${href}"`), href);
});

test("new research entrances preserve the sent-version and pre-publication boundaries", async () => {
  const register = await (await fetch(`${origin}/policy-register`)).text();
  assert.match(register, /候補者送付版（2026年10月30日）/);
  assert.match(register, /一字一句変更しません/);
  for (const id of ["P01", "P06", "T01", "T02", "U01", "U02"]) {
    assert.ok(register.includes(`id="${id}"`), id);
  }
  assert.doesNotMatch(register, /question-ledger-2026-09-18-v1/);
  const stories = await (await fetch(`${origin}/stories`)).text();
  assert.match(stories, /取材・掲載の準備状況/);
  assert.match(stories, /インタビューの収録を進めています/);
  assert.match(stories, /仮の発言は掲載しません/);
  assert.match(stories, /共通11問/);
  for (let index = 1; index <= 6; index++) {
    assert.ok(stories.includes(`id="H0${index}"`));
  }
  assert.doesNotMatch(stories, /<iframe/);
  const talk = await (await fetch(`${origin}/talk`)).text();
  assert.match(talk, /オシセン！トーク/);
  assert.doesNotMatch(talk, /<iframe/);
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
    "大屋諒",
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
      assert.ok(page.includes("大屋諒"), path);
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
      "https://www.youtube.com/@%E3%82%AA%E3%82%B7%E3%82%BB%E3%83%B3%E5%85%AC%E5%BC%8F%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB",
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
        tag.includes('href="mailto:info@oshisen.com"'),
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

registerSeoHttpTests({ getOrigin: () => origin, startServer });
