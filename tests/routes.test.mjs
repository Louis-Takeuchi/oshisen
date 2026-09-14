import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const { default: worker } = await import("../dist/server/index.js");
async function render(path) {
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}
test("home explains the policy-first flow without prototype infrastructure", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /lang="ja"/);
  assert.match(html, /政治家の/);
  assert.match(html, /href="\/diagnosis"/);
  assert.match(html, /href="\/candidates"/);
  assert.match(html, /プロトタイプ/);
  assert.doesNotMatch(
    html,
    /codex-preview|react-loading-skeleton|Starter Project|Your site is taking shape/,
  );
  assert.match(html, /property="og:image"/);
});
test("all required pages server-render and individual candidates have distinct metadata", async () => {
  for (const path of [
    "/diagnosis",
    "/questions",
    "/results",
    "/candidates",
    "/compare",
    "/saved",
    "/issues",
    "/issues?theme=education",
    "/about",
    "/method",
    "/sources",
    "/privacy",
    "/candidates/sato-misaki",
    "/candidates/takahashi-ken",
    "/candidates/tanaka-aya",
    "/candidates/yamada-taro",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<main\b/, path);
    assert.match(html, /id="main"/, path);
    if (path.includes("/candidates/")) {
      assert.match(html, /仮名/);
      assert.match(html, /実際の候補者回答は未掲載/);
      assert.match(html, /name="twitter:title"/);
      assert.doesNotMatch(html, /<iframe/);
    }
  }
});

test("issue deep links and candidate policy sources are rendered transparently", async () => {
  const issue = await (await render("/issues?theme=education")).text();
  assert.match(issue, /県立高校/);
  assert.match(issue, /サンプル回答/);
  assert.match(issue, /#policy-education/);
  const invalid = await (await render("/issues?theme=unknown")).text();
  assert.match(invalid, /指定されたテーマが見つからない/);
  const candidate = await (await render("/candidates/sato-misaki")).text();
  assert.match(candidate, /id="policy-transport"/);
  assert.match(candidate, /この政策の情報源・本人の説明/);
  assert.match(candidate, /一次情報は未掲載/);
  assert.doesNotMatch(candidate, /<iframe/);
  const home = await (await render("/")).text();
  for (const path of ["/compare", "/saved", "/issues"])
    assert.ok(home.includes(`href="${path}"`));
});
test("unknown candidate is a genuine 404, not another candidate", async () => {
  const response = await render("/candidates/not-a-candidate");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /ページが見つかりません/);
});

test("production navigation does not import the side-effect-only browser bootstrap", async () => {
  const clientRoot = new URL("../dist/client/", import.meta.url);
  const manifest = JSON.parse(
    await readFile(
      new URL("vinext-client-entry-manifest.json", clientRoot),
      "utf8",
    ),
  );
  const chunkDirectory = path.posix.dirname(manifest.appBrowserEntry);
  const files = await readdir(new URL(`${chunkDirectory}/`, clientRoot));
  let dynamicImports = 0;
  for (const filename of files.filter((name) => name.endsWith(".js"))) {
    const source = await readFile(
      new URL(`${chunkDirectory}/${filename}`, clientRoot),
      "utf8",
    );
    for (const match of source.matchAll(
      /\bimport\(\s*(["'`])([^"'`]+)\1\s*\)/g,
    )) {
      if (!match[2].startsWith(".")) continue;
      dynamicImports++;
      const target = path.posix.normalize(
        path.posix.join(chunkDirectory, match[2]),
      );
      assert.notEqual(
        target,
        manifest.appBrowserEntry,
        `${filename} dynamically imports the bootstrap instead of a runtime module; helper exports may be lost`,
      );
    }
  }
  assert.ok(dynamicImports > 0, "validate real production dynamic imports");
});
