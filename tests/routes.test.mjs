import assert from "node:assert/strict";
import test from "node:test";
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
test("unknown candidate is a genuine 404, not another candidate", async () => {
  const response = await render("/candidates/not-a-candidate");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /ページが見つかりません/);
});
