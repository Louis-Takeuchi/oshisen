// Run after `npm run build:vercel`; starts a local server, never deploys.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";

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
    "/candidates/sato-misaki",
    "/candidates/takahashi-ken",
    "/candidates/tanaka-aya",
    "/candidates/yamada-taro",
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
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    const html = await response.text();
    assert.match(html, /lang="ja"/, path);
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
    "/candidates/sato-misaki",
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

test("issue selection, comparison entry points and source notices survive production rendering", async () => {
  const issue = await (await fetch(`${origin}/issues?theme=healthcare`)).text();
  assert.match(issue, /地域医療/);
  assert.match(issue, /#policy-healthcare/);
  assert.match(issue, /サンプル回答/);
  const invalid = await (await fetch(`${origin}/issues?theme=unknown`)).text();
  assert.match(invalid, /指定されたテーマが見つからない/);
  const duplicate = await (
    await fetch(`${origin}/issues?theme=education&theme=healthcare`)
  ).text();
  assert.match(duplicate, /指定されたテーマが見つからない/);
  const candidate = await (
    await fetch(`${origin}/candidates/sato-misaki`)
  ).text();
  assert.match(candidate, /id="policy-transport"/);
  assert.match(candidate, /この政策の情報源・本人の説明/);
  assert.match(candidate, /一次情報は未掲載/);
  assert.doesNotMatch(candidate, /<iframe/);
  const home = await (await fetch(origin)).text();
  for (const path of ["/compare", "/saved", "/issues"])
    assert.ok(home.includes(`href="${path}"`));
});

test("unknown candidate and missing page have real 404 responses", async () => {
  for (const path of ["/candidates/not-a-candidate", "/page-does-not-exist"]) {
    const response = await fetch(`${origin}${path}`, {
      headers: { "User-Agent": "Twitterbot" },
    });
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /ページが見つかりません/);
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
