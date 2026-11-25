import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { project, projectLabel } from "../lib/project.ts";
import {
  sentQuestions,
  questionPath,
} from "../lib/election2026.ts";
import {
  DEMO_DATA_BANNER_TEXT,
  candidates2026,
  isDemoData,
} from "../lib/candidates2026.ts";
import { publicPagePaths } from "../lib/seo.ts";
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
  // デモ表示中（isDemoData）は候補者A〜Dを意図して出しているため、名前の検査は通常運用時のみ。
  if (!isDemoData) {
    assert.doesNotMatch(content, /候補者[ＡＢＣＤABCD]/, pathname);
  }
  assert.doesNotMatch(
    content,
    /一致度\s*[:：]?\s*\d|\d+\s*[%％]|近い候補者が見つかり/,
    pathname,
  );
}

test("home reflects the current recording status and the 12/4 publication plan", async () => {
  assert.equal(project.electionYear, 2026);
  assert.deepEqual(project.districts, ["つくば市選挙区", "土浦市選挙区"]);
  if (!isDemoData) {
    assert.equal(candidates2026.length, 0, "no real candidates before 12/4");
  }
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /lang="ja"/);
  assert.match(html, /政治家の/);
  assert.match(html, /href="\/diagnosis"/);
  assert.match(html, /href="\/candidates"/);
  assert.match(html, /href="\/talk"/);
  assert.match(html, /プロトタイプ/);
  assert.match(html, /つくば市選挙区/);
  assert.ok(html.includes(projectLabel));
  assert.match(html, /インタビュー収録を進めています/);
  assert.match(html, /12月4日（告示日）以降、立候補届出順に公開します/);
  assert.match(html, /候補者と同じ質問/);
  if (isDemoData) {
    assert.match(html, /デモ表示中/);
  } else {
    assert.match(html, /12月4日から掲載/);
  }
  assert.match(html, /インタビュー動画/);
  assert.doesNotMatch(html, /Podcast/);
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
    "/news",
    "/diagnosis",
    "/questions",
    "/results",
    "/candidates",
    "/compare",
    "/saved",
    "/issues",
    "/talk",
    "/q/p01",
    "/q/t01",
    "/q/u02",
    "/about",
    "/method",
    "/sources",
    "/neutrality",
    "/privacy",
    "/interests",
    "/stories",
    "/research",
    "/policy-register",
    "/guides/high-school-election",
    "/tsukuba/elections",
    "/tsuchiura/elections",
    "/ibaraki-2026/tsukuba",
    "/ibaraki-2026/tsuchiura",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<main\b/, path);
    assert.match(html, /id="main"/, path);
    assertNoCandidateFixturesOrScores(html, path);
    if (path !== "/questions") {
      assert.match(html, /つくば市選挙区・土浦市選挙区/, path);
    }
  }
});

test("question pages serve the sent wording, level switching and the 12/4 notice", async () => {
  for (const question of sentQuestions) {
    const pathname = questionPath(question);
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.ok(html.includes(question.text), `${pathname}: original text`);
    assert.ok(html.includes(question.textNormal), `${pathname}: normal text`);
    assert.ok(html.includes(question.themeLabel), pathname);
    assert.match(html, /候補者が答えた原文を見る/, pathname);
    assert.match(html, /候補者にも、この文のまま聞いています（7段階＋理由400〜600字）/, pathname);
    assert.match(html, /あなたならどう答える？/, pathname);
    if (isDemoData) {
      assert.match(html, /候補者の回答（届出順）/, pathname);
    } else {
      assert.match(
        html,
        /候補者の回答は12月4日（告示日）以降、届出順にここに並びます/,
        pathname,
      );
    }
    assert.ok(
      html.includes(`/share/q-${question.slug}.png`),
      `${pathname}: per-question share image`,
    );
    assertNoCandidateFixturesOrScores(html, pathname);
  }
  // 旧版の草案の文言は、どのページにも出ない。
  const issues = await (await render("/issues")).text();
  assert.doesNotMatch(issues, /公共交通への行政支援を、今より増やすべきだと思う/);
  assert.match(issues, /候補者送付版（2026年10月30日）/);
  for (const question of sentQuestions) {
    assert.ok(issues.includes(`href="${questionPath(question)}"`), question.id);
  }
});

test("old draft-theme pages redirect to the question list", async () => {
  for (const legacy of [
    "/ibaraki-2026/tsukuba/issues/transport",
    "/ibaraki-2026/tsukuba/issues/education",
    "/ibaraki-2026/tsukuba/issues/administration",
  ]) {
    const response = await render(legacy);
    assert.ok(
      response.status === 307 || response.status === 302,
      `${legacy}: ${response.status}`,
    );
    const location = response.headers.get("location") ?? "";
    assert.ok(location.endsWith("/issues"), `${legacy} -> ${location}`);
  }
});

test("both district hubs and the questionnaire reflect the sent version", async () => {
  for (const [hubPath, districtLabel] of [
    ["/ibaraki-2026/tsukuba", "つくば市"],
    ["/ibaraki-2026/tsuchiura", "土浦市"],
  ]) {
    const response = await render(hubPath);
    assert.equal(response.status, 200, hubPath);
    const html = await response.text();
    assert.ok(html.includes(districtLabel), hubPath);
    assert.match(html, /インタビュー収録を進めています/, hubPath);
    assert.match(html, /候補者送付版（2026年10月30日）/, hubPath);
    assert.doesNotMatch(html, /Podcast/, hubPath);
    assert.ok(html.includes('href="/q/p01"'), hubPath);
    assertNoCandidateFixturesOrScores(html, hubPath);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, hubPath);
  }
  const diagnosis = await (await render("/diagnosis")).text();
  assert.match(diagnosis, /7段階（候補者と同じ）/);
  assert.match(diagnosis, /候補者にも同じ質問をしています。回答は12月4日から並びます。/);
  assert.doesNotMatch(diagnosis, /全8問は確認中の草案です/);
  const register = await (await render("/policy-register")).text();
  assert.match(register, /候補者送付版（2026年10月30日）/);
  for (const question of sentQuestions) {
    assert.ok(register.includes(`id="${question.id}"`), question.id);
    assert.ok(register.includes(question.text), question.id);
  }
  assert.doesNotMatch(register, /question-ledger-2026-09-18-v1/);
});

test("demo fixture data is unmistakably labeled, or absent in normal operation", async () => {
  if (isDemoData) {
    // デモ表示中：全ページ上部にバナー、架空の候補者ページは noindex。
    for (const pathname of ["/", "/candidates", "/q/p01", "/talk", "/results"]) {
      const html = await (await render(pathname)).text();
      assert.ok(html.includes(DEMO_DATA_BANNER_TEXT), `${pathname}: demo banner`);
    }
    const candidateIds = candidates2026.map((candidate) => candidate.id);
    assert.ok(candidateIds.length > 0);
    for (const id of candidateIds) {
      const html = await (await render(`/candidates/${id}`)).text();
      assert.ok(html.includes(DEMO_DATA_BANNER_TEXT), `${id}: demo banner`);
      assert.match(
        html,
        /<meta name="robots" content="noindex, follow"\s*\/?\s*>/,
        `${id}: fictional pages stay out of search`,
      );
    }
  } else {
    for (const pathname of ["/", "/candidates", "/q/p01", "/talk"]) {
      const html = await (await render(pathname)).text();
      assert.ok(
        !html.includes(DEMO_DATA_BANNER_TEXT),
        `${pathname}: no demo banner in normal operation`,
      );
    }
  }
});

test("Sites serves a crawlable robots file and a sitemap that excludes personal tools and unpublished candidates", async () => {
  const publicOrigin = new URL(
    process.env.SITE_URL || "https://www.oshisen.com",
  ).origin;
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(robots.headers.get("content-type"), /text\/plain/);
  const robotsText = await robots.text();
  assert.match(robotsText, /^User-Agent: \*$/m);
  assert.match(robotsText, /^Allow: \/$/m);
  assert.doesNotMatch(robotsText, /^Disallow:\s*\//m);
  assert.ok(robotsText.includes(`Sitemap: ${publicOrigin}/sitemap.xml`));

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  const xml = await sitemap.text();
  assert.match(
    xml,
    /<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/,
  );
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const expectedPaths = [
    ...publicPagePaths,
    ...sentQuestions.map((question) => questionPath(question)),
  ];
  assert.equal(urls.length, new Set(urls).size, "no duplicate sitemap URLs");
  assert.deepEqual(
    [...urls].sort(),
    expectedPaths
      .map((pathname) => new URL(pathname, publicOrigin).href)
      .sort(),
  );

  for (const pathname of [
    "/candidates",
    "/compare",
    "/diagnosis",
    "/questions",
    "/results",
    "/saved",
    "/interests",
    "/research",
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(
      await response.text(),
      /<meta name="robots" content="noindex, follow"\s*\/?\s*>/,
      pathname,
    );
    assert.ok(!urls.includes(new URL(pathname, publicOrigin).href), pathname);
  }
});

test("Sites renders election guides with readable content, breadcrumbs and crawlable links", async () => {
  const guidePaths = [
    "/guides/high-school-election",
    "/tsukuba/elections",
    "/tsuchiura/elections",
  ];
  const expectedKeyword = [/高校生/, /つくば市/, /土浦市/];
  const publicOrigin = new URL(
    process.env.SITE_URL || "https://www.oshisen.com",
  ).origin;
  const home = await (await render("/")).text();
  const homeMain = home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  const homeLinks = [
    ...homeMain.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g),
  ].map(([, href]) => href);

  for (const [index, pathname] of guidePaths.entries()) {
    assert.ok(
      homeLinks.includes(pathname),
      `${pathname}: linked from home content`,
    );
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    const main = html
      .match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
      ?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.ok(main, pathname);
    const text = main.replace(/<[^>]+>/g, " ");
    assert.match(text, expectedKeyword[index], pathname);
    assert.match(text, /投票/, pathname);
    assert.equal([...main.matchAll(/<h1\b/g)].length, 1, pathname);
    assertNoCandidateFixturesOrScores(html, pathname);
    const anchors = [...main.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(
      ([, href]) => href,
    );
    assert.ok(
      anchors.some((href) => guidePaths.includes(href) && href !== pathname),
      `${pathname}: related guide`,
    );
    assert.ok(
      anchors.some((href) => href.startsWith("/ibaraki-2026/")),
      `${pathname}: election hub`,
    );
    assert.ok(
      anchors.some((href) =>
        /^https:\/\/[^/]+(?:\.go\.jp|\.lg\.jp|\.pref\.[a-z]+\.jp)\//.test(href),
      ),
      `${pathname}: official source`,
    );
    const canonical = html.match(
      /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/,
    );
    assert.equal(canonical?.[1], `${publicOrigin}${pathname}`, pathname);
    const structuredData = [
      ...html.matchAll(
        /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map(([, json]) => JSON.parse(json));
    const breadcrumb = structuredData.find(
      (item) => item["@type"] === "BreadcrumbList",
    );
    assert.ok(breadcrumb, pathname);
    assert.equal(
      breadcrumb.itemListElement.at(-1).item,
      `${publicOrigin}${pathname}`,
      pathname,
    );
  }
});

test("research preparation and interview pages stay transparent about recording", async () => {
  const stories = await (await render("/stories")).text();
  assert.match(stories, /取材・掲載の準備状況/);
  assert.match(stories, /インタビューの収録を進めています/);
  assert.match(stories, /仮の発言は掲載しません/);
  assert.match(stories, /共通11問/);
  assert.doesNotMatch(stories, /共通20問/);
  assert.doesNotMatch(stories, /Podcast/);
  for (let index = 1; index <= 6; index++) {
    assert.ok(stories.includes(`id="H0${index}"`));
  }
  assert.doesNotMatch(stories, /<iframe/);
  const talk = await (await render("/talk")).text();
  assert.match(talk, /オシセン！トーク/);
  assert.match(talk, /12月4日（告示日）以降、選挙区ごとに立候補届出順で公開します/);
  assert.doesNotMatch(talk, /<iframe/);
});

test("former demo candidates and unknown pages return genuine 404 responses", async () => {
  for (const pathname of [
    "/candidates/sato-misaki",
    "/candidates/takahashi-ken",
    "/candidates/tanaka-aya",
    "/candidates/yamada-taro",
    "/candidates/not-a-candidate",
    "/q/p99",
    "/q/not-a-question",
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
    "大屋諒",
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
  assert.match(html, /インタビュー収録を進めています/);
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
      "https://www.youtube.com/@%E3%82%AA%E3%82%B7%E3%82%BB%E3%83%B3%E5%85%AC%E5%BC%8F%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB",
      "mailto:info@oshisen.com",
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
  const home = await (await render("/")).text();
  assert.match(home, /@オシセン公式チャンネル/);
});
