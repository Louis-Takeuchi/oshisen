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
    assert.match(html, /rel="icon"[^>]*href="\/favicon.ico"/, path);
    assert.match(html, /rel="apple-touch-icon"/, path);
    assert.match(html, /name="theme-color" content="#f7f6f2"/, path);
    assert.ok(html.includes(`${origin}/og.png`), path);
    assert.doesNotMatch(html, /vinext|Starter Project|codex-preview/, path);
  }
});

test("favicon, home screen icons, manifest and social card are served", async () => {
  for (const path of [
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/og.png",
  ]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    const data = Buffer.from(await response.arrayBuffer());
    if (path.endsWith(".ico")) {
      assert.equal(data.readUInt16LE(2), 1);
      assert.equal(data.readUInt16LE(4), 3);
    } else assert.equal(data.subarray(1, 4).toString(), "PNG", path);
    assert.match(response.headers.get("content-type"), /image\//, path);
  }
  const manifest = await (await fetch(`${origin}/site.webmanifest`)).json();
  assert.equal(manifest.short_name, "オシセン");
  assert.equal(manifest.icons.length, 2);
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Disallow: \//);
});

test("client navigation receives React payloads and loadable JavaScript", async () => {
  for (const path of [
    "/diagnosis",
    "/questions",
    "/results",
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
