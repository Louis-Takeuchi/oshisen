import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { project, projectLabel } from "../lib/project.ts";
import { candidates as candidateRegistry } from "../lib/data.ts";
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

test("home explains the question-level flow and Tsukuba preparation status", async () => {
  assert.equal(project.electionYear, 2026);
  assert.equal(project.district, "つくば市選挙区");
  assert.equal(candidateRegistry.length, 0);
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /lang="ja"/);
  assert.match(html, /政治家の/);
  assert.match(html, /href="\/diagnosis"/);
  assert.match(html, /href="\/candidates"/);
  assert.match(html, /プロトタイプ/);
  assert.match(html, /つくば市選挙区/);
  assert.ok(html.includes(projectLabel));
  assert.match(html, /候補者情報は未掲載/);
  assert.match(html, /Podcast取材はこれから/);
  assert.match(html, /一問ずつ/);
  assertNoCandidateFixturesOrScores(html, "/");
  assert.doesNotMatch(
    html,
    /codex-preview|react-loading-skeleton|Starter Project|Your site is taking shape/,
  );
  assert.match(html, /property="og:image"/);
});
test("all current public routes render without fictional candidates or match scores", async () => {
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
    "/interests",
    "/stories",
    "/research",
    "/policy-register",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<main\b/, path);
    assert.match(html, /id="main"/, path);
    assertNoCandidateFixturesOrScores(html, path);
    assert.doesNotMatch(html, /土浦市選挙区/, path);
    if (path !== "/questions") assert.match(html, /つくば市選挙区/, path);
  }
});

test("issue deep links show draft questions and genuinely empty candidate answers", async () => {
  const issue = await (await render("/issues?theme=education")).text();
  assert.match(issue, /県立高校/);
  assert.match(issue, /確認中の質問案/);
  assert.match(issue, /本人の回答は、まだありません/);
  assert.match(issue, /href="\/policy-register"/);
  assert.doesNotMatch(issue, /サンプル回答|href="\/candidates\//);
  const invalid = await (await render("/issues?theme=unknown")).text();
  assert.match(invalid, /指定されたテーマが見つからない/);
  const duplicate = await (
    await render("/issues?theme=education&theme=healthcare")
  ).text();
  assert.match(duplicate, /指定されたテーマが見つからない/);
  const candidates = await (await render("/candidates")).text();
  assert.match(candidates, /候補者の情報は、これから/);
  assertNoCandidateFixturesOrScores(candidates, "/candidates");
  assert.doesNotMatch(candidates, /href="\/candidates\//);
  const home = await (await render("/")).text();
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

test("research preparation keeps the question register and unrecorded interviews transparent", async () => {
  const register = await (await render("/policy-register")).text();
  assert.match(register, /まだ草案/);
  assert.match(register, /question-ledger-2026-09-18-v1/);
  assert.match(register, /保留/);
  assert.match(register, /id="P01"/);
  assert.match(register, /id="P08"/);
  const stories = await (await render("/stories")).text();
  assert.match(stories, /取材・掲載の準備中/);
  assert.match(stories, /ヒアリングはまだ実施していません/);
  for (let index = 1; index <= 6; index++) {
    assert.ok(stories.includes(`id="H0${index}"`));
  }
  assert.doesNotMatch(stories, /<iframe/);
});

test("former demo candidates and unknown pages return genuine 404 responses", async () => {
  for (const pathname of [
    "/candidates/sato-misaki",
    "/candidates/takahashi-ken",
    "/candidates/tanaka-aya",
    "/candidates/yamada-taro",
    "/candidates/not-a-candidate",
    "/page-does-not-exist",
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 404, pathname);
    const html = await response.text();
    assert.match(html, /ページが見つかりません/, pathname);
    assertNoCandidateFixturesOrScores(html, pathname);
  }
});

test("operator profiles and self-reported Q&A render on Sites without client-side state", async () => {
  const html = await (await render("/about")).text();
  for (const id of [
    "team",
    "team-qa",
    "team-oya",
    "team-takeuchi",
    "our-idea",
    "operations",
  ]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  for (const text of [
    "Ryo",
    "Louis",
    "大屋涼",
    "竹内琉瑛",
    "クレイジーネゴシエーター",
    "政策提言立案",
    "サッカー観戦、ランニング",
    "見習い科学哲学者",
    "本と論文を読む",
    "認知科学、AI開発、日本古代史探究",
  ]) {
    assert.ok(html.includes(text), text);
  }
  for (const member of ["oya", "takeuchi"]) {
    assert.ok(html.includes(`src="/team/${member}.jpg"`));
    assert.ok(html.includes(`href="/team/${member}.jpg"`));
  }
  assert.match(html, /<details\b/);
  assert.match(html, /もう少し深く、聞いてみる/);
  assert.match(html, /本人の回答を準備中/);
  assert.doesNotMatch(html, /運営主体・責任者<\/dt>\s*<dd>未確定/);
  const home = await (await render("/")).text();
  assert.match(home, /href="\/about#team"/);
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

test("official social and contact links render on Sites with no obsolete closed-contact notice", async () => {
  for (const path of ["/", "/about", "/privacy", "/method", "/sources"]) {
    const html = await (await render(path)).text();
    for (const href of [
      "https://www.instagram.com/oshisen.official/",
      "https://x.com/OshisenOfficial",
      "mailto:oshisen0914@gmail.com",
    ]) {
      assert.ok(html.includes(`href="${href}"`), `${path}: ${href}`);
    }
    assert.doesNotMatch(html, /[?&]stkn=/, path);
    assert.doesNotMatch(
      html,
      /受付先はありません|受付先は設置していません|問い合わせ・訂正窓口の案内は準備中/,
      path,
    );
  }
  const about = await (await render("/about")).text();
  assert.match(about, /id="contact"/);
  assert.match(about, /アドレスをコピー/);
  assert.match(about, /メールアプリが開かない場合/);
});
