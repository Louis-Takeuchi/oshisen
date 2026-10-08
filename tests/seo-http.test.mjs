// Registered by vercel.test.mjs so SEO and application checks share a build/server.
import assert from "node:assert/strict";
import { get } from "node:http";
import { test } from "node:test";

const publicOrigin = "https://www.oshisen.com";
const districtPath = "/ibaraki-2026/tsukuba";
const guidePaths = ["/guides/high-school-election", "/tsukuba/elections"];
const themePaths = [
  "transport",
  "education",
  "childcare",
  "healthcare",
  "disaster",
  "environment",
  "agriculture",
  "administration",
].map((theme) => `${districtPath}/issues/${theme}`);
const publicPaths = [
  "/",
  "/about",
  "/method",
  "/sources",
  "/privacy",
  "/issues",
  "/stories",
  "/policy-register",
  districtPath,
  ...guidePaths,
  ...themePaths,
];
const excludedPaths = [
  "/research",
  "/interests",
  "/diagnosis",
  "/questions",
  "/results",
  "/compare",
  "/saved",
  "/candidates",
];

function decodeEntities(value) {
  return value.replace(
    /&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi,
    (entity) => {
      const named = {
        "&amp;": "&",
        "&quot;": '"',
        "&apos;": "'",
        "&lt;": "<",
        "&gt;": ">",
      };
      if (named[entity]) return named[entity];
      return String.fromCodePoint(
        entity.startsWith("&#x")
          ? Number.parseInt(entity.slice(3, -1), 16)
          : Number.parseInt(entity.slice(2, -1), 10),
      );
    },
  );
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      decodeEntities(value),
    ]),
  );
}

function meta(html, key) {
  return [...html.matchAll(/<meta\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter((tag) => tag.name === key || tag.property === key)
    .map((tag) => tag.content);
}

function mainContent(html, path) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, `${path}: server-rendered main content`);
  return main
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "");
}

function readableText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
}

function links(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(
    ([, attrs, content]) => ({
      ...attributes(attrs),
      text: readableText(content).trim(),
    }),
  );
}

function canonical(html, path) {
  const urls = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter((tag) => tag.rel === "canonical")
    .map((tag) => tag.href);
  assert.equal(urls.length, 1, `${path}: one canonical link`);
  assert.match(urls[0], /^https:\/\/www\.oshisen\.com(?:\/|$)/, path);
  const actual = new URL(urls[0]);
  assert.equal(
    actual.search,
    "",
    `${path}: canonical excludes query parameters`,
  );
  assert.equal(actual.hash, "", `${path}: canonical excludes fragments`);
  return actual.href;
}

function robotsDirectives(html, path) {
  const tags = meta(html, "robots");
  assert.ok(tags.length > 0, `${path}: explicit robots metadata`);
  return tags.flatMap((value) => value.split(/\s*,\s*/));
}

function assertIndexable(html, response, path) {
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(
    response.headers.get("x-robots-tag") ?? "",
    /noindex/i,
    path,
  );
  const directives = robotsDirectives(html, path);
  assert.ok(directives.includes("index"), `${path}: index`);
  assert.ok(directives.includes("follow"), `${path}: follow`);
  assert.ok(!directives.includes("noindex"), `${path}: no conflicting noindex`);
  assert.ok(
    !directives.includes("nofollow"),
    `${path}: links remain crawlable`,
  );
  assert.doesNotMatch(
    meta(html, "googlebot").join(","),
    /noindex|nofollow/i,
    path,
  );
}

function structuredData(html, path) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs]) => attributes(attrs).type === "application/ld+json")
    .flatMap(([, , content]) => {
      let data;
      assert.doesNotThrow(() => {
        data = JSON.parse(content);
      }, `${path}: valid JSON-LD`);
      const documents = Array.isArray(data) ? data : [data];
      return documents.flatMap((document) => {
        assert.equal(document["@context"], "https://schema.org", path);
        return document["@graph"] ?? [document];
      });
    });
}

async function fetchPage(origin, path) {
  const response = await fetch(`${origin}${path}`, {
    redirect: "manual",
    headers: { "User-Agent": "Twitterbot" },
  });
  return { response, html: await response.text() };
}

// Node's fetch can replace Host with the URL authority. Use HTTP directly to
// exercise the real host-based redirect while connecting only to localhost.
function requestWithHost(origin, path, host) {
  return new Promise((resolve, reject) => {
    const request = get(
      new URL(path, origin),
      { headers: { Host: host } },
      (response) => {
        response.resume();
        response.on("error", reject);
        response.on("end", () =>
          resolve({
            status: response.statusCode,
            location: response.headers.location,
          }),
        );
      },
    );
    request.on("error", reject);
    request.setTimeout(10000, () =>
      request.destroy(new Error("Host redirect request timed out")),
    );
  });
}

export function registerSeoHttpTests({ getOrigin, startServer }) {
  test("public pages have unique searchable metadata and absolute self canonicals", async () => {
    const titles = new Set();
    const descriptions = new Set();
    for (const path of publicPaths) {
      const { response, html } = await fetchPage(getOrigin(), path);
      assertIndexable(html, response, path);
      assert.equal(
        canonical(html, path),
        new URL(path, publicOrigin).href,
        path,
      );
      const pageTitles = [...html.matchAll(/<title>([^<]*)<\/title>/g)];
      assert.equal(pageTitles.length, 1, `${path}: one title`);
      const title = decodeEntities(pageTitles[0][1]);
      assert.match(title, /オシセン/, path);
      assert.ok(!titles.has(title), `${path}: distinct title`);
      titles.add(title);
      const pageDescriptions = meta(html, "description");
      assert.equal(pageDescriptions.length, 1, `${path}: one description`);
      const description = pageDescriptions[0];
      assert.ok(description.length > 20, `${path}: substantive description`);
      assert.ok(
        !descriptions.has(description),
        `${path}: distinct description`,
      );
      descriptions.add(description);
      assert.deepEqual(
        meta(html, "og:url").map((url) => new URL(url).href),
        [new URL(path, publicOrigin).href],
        path,
      );
      assert.equal(meta(html, "og:title").length, 1, path);
      assert.equal(meta(html, "og:description").length, 1, path);
      assert.deepEqual(
        meta(html, "og:image"),
        [`${publicOrigin}/og.png?v=logo-2`],
        path,
      );
      assert.deepEqual(
        meta(html, "twitter:card"),
        ["summary_large_image"],
        path,
      );
      assert.equal(
        [...html.matchAll(/<h1\b/g)].length,
        1,
        `${path}: one primary heading`,
      );
      structuredData(html, path);
    }
  });

  test("tracking and issue-filter URLs retain the clean canonical", async () => {
    for (const [requestPath, canonicalPath] of [
      ["/?utm_source=search&utm_campaign=index-check", "/"],
      ["/about?utm_source=search", "/about"],
      ["/issues?theme=education&utm_source=search", "/issues"],
      ["/issues?theme=unknown", "/issues"],
      ...guidePaths.map((path) => [`${path}?utm_source=search`, path]),
      [`${themePaths[0]}?utm_source=search`, themePaths[0]],
    ]) {
      const { response, html } = await fetchPage(getOrigin(), requestPath);
      assert.equal(response.status, 200, requestPath);
      assert.equal(
        canonical(html, requestPath),
        new URL(canonicalPath, publicOrigin).href,
      );
    }
  });

  test("personalized tools and pages without published entries stay noindex, follow", async () => {
    for (const path of excludedPaths) {
      const { response, html } = await fetchPage(getOrigin(), path);
      assert.equal(response.status, 200, path);
      const directives = robotsDirectives(html, path);
      assert.ok(directives.includes("noindex"), path);
      assert.ok(directives.includes("follow"), path);
      assert.ok(!directives.includes("index"), path);
      assert.ok(!directives.includes("nofollow"), path);
      assert.equal(
        canonical(html, path),
        new URL(path, publicOrigin).href,
        path,
      );
    }
  });

  test("robots allows crawling and sitemap lists only indexable canonical pages", async () => {
    const robotsResponse = await fetch(`${getOrigin()}/robots.txt`);
    assert.equal(robotsResponse.status, 200);
    const robots = await robotsResponse.text();
    assert.match(robots, /^User-Agent: \*$/m);
    assert.match(robots, /^Allow: \/$/m);
    assert.doesNotMatch(robots, /^Disallow:\s*\//m);
    assert.ok(robots.includes(`Sitemap: ${publicOrigin}/sitemap.xml`));
    const sitemapResponse = await fetch(`${getOrigin()}/sitemap.xml`);
    assert.equal(sitemapResponse.status, 200);
    assert.match(sitemapResponse.headers.get("content-type"), /xml/);
    const sitemap = await sitemapResponse.text();
    assert.match(
      sitemap,
      /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/,
    );
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, value]) => decodeEntities(value),
    );
    assert.equal(
      new Set(urls).size,
      urls.length,
      "no duplicate sitemap entries",
    );
    assert.deepEqual(
      urls.map((url) => new URL(url).href).sort(),
      publicPaths.map((path) => new URL(path, publicOrigin).href).sort(),
      "only public information pages enter the sitemap while the candidate registry is empty",
    );
    for (const url of urls) {
      const canonicalUrl = new URL(url);
      assert.equal(canonicalUrl.origin, publicOrigin);
      assert.equal(canonicalUrl.search, "");
      assert.equal(canonicalUrl.hash, "");
      const { response, html } = await fetchPage(
        getOrigin(),
        canonicalUrl.pathname,
      );
      assertIndexable(html, response, url);
      assert.equal(canonical(html, url), canonicalUrl.href, url);
    }
  });

  test("home, operator and election pages expose valid factual structured data", async () => {
    const home = structuredData((await fetchPage(getOrigin(), "/")).html, "/");
    const organization = home.find((item) => item["@type"] === "Organization");
    assert.ok(organization, "home Organization");
    assert.equal(organization.name, "オシセン");
    assert.equal(new URL(organization.url).href, `${publicOrigin}/`);
    const website = home.find((item) => item["@type"] === "WebSite");
    assert.ok(website, "home WebSite");
    assert.equal(new URL(website.url).href, `${publicOrigin}/`);
    const about = structuredData(
      (await fetchPage(getOrigin(), "/about")).html,
      "/about",
    );
    const aboutOrganization = about.find(
      (item) => item["@type"] === "Organization",
    );
    assert.ok(aboutOrganization, "about Organization");
    assert.equal(aboutOrganization["@id"], organization["@id"]);
    for (const path of [districtPath, ...guidePaths, ...themePaths]) {
      const data = structuredData(
        (await fetchPage(getOrigin(), path)).html,
        path,
      );
      const breadcrumbs = data.find(
        (item) => item["@type"] === "BreadcrumbList",
      );
      assert.ok(breadcrumbs, `${path}: breadcrumbs`);
      assert.ok(breadcrumbs.itemListElement.length >= 2, path);
      for (const [index, item] of breadcrumbs.itemListElement.entries()) {
        assert.equal(item["@type"], "ListItem", path);
        assert.equal(item.position, index + 1, path);
        assert.ok(item.name.length > 0, path);
        assert.equal(new URL(item.item).origin, publicOrigin, path);
      }
      assert.equal(
        breadcrumbs.itemListElement.at(-1).item,
        new URL(path, publicOrigin).href,
        path,
      );
    }
  });

  test("election guides answer search intent in rendered content and link to official sources", async () => {
    const topics = [
      ["高校生", "18歳", "選挙", "投票"],
      ["つくば市", "市長", "市議会", "県議会", "投票"],
    ];
    for (const [index, path] of guidePaths.entries()) {
      const { html } = await fetchPage(getOrigin(), path);
      const main = mainContent(html, path);
      const text = readableText(main);
      for (const topic of topics[index]) {
        assert.ok(
          text.includes(topic),
          `${path}: explains ${topic} in the body`,
        );
      }
      const heading = readableText(
        main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "",
      );
      assert.ok(
        heading.includes(topics[index][0]),
        `${path}: descriptive primary heading`,
      );
      const anchors = links(main);
      const officialSources = anchors.filter(({ href, text }) => {
        if (!href || !text) return false;
        const url = new URL(href, publicOrigin);
        return (
          url.protocol === "https:" &&
          /(?:\.go\.jp|\.lg\.jp|\.pref\.[a-z]+\.jp)$/.test(url.hostname)
        );
      });
      assert.ok(
        officialSources.length > 0,
        `${path}: readable official source links`,
      );
      for (const target of [guidePaths[1 - index], districtPath]) {
        assert.ok(
          anchors.some(({ href, text }) => href === target && text.length > 0),
          `${path}: crawlable related guide link to ${target}`,
        );
      }
    }
  });

  test("the home page and election hub expose crawlable entry links to both guides", async () => {
    for (const path of ["/", districtPath]) {
      const { html } = await fetchPage(getOrigin(), path);
      const anchors = links(mainContent(html, path));
      for (const target of guidePaths) {
        assert.ok(
          anchors.some(({ href, text }) => href === target && text.length > 0),
          `${path}: links to ${target} without opening a menu or running JavaScript`,
        );
      }
    }
  });

  test("unknown election themes and candidates return noindex 404 responses", async () => {
    for (const path of [
      `${districtPath}/issues/not-a-theme`,
      "/candidates/not-a-candidate",
      "/page-does-not-exist",
    ]) {
      const { response, html } = await fetchPage(getOrigin(), path);
      assert.equal(response.status, 404, path);
      assert.ok(robotsDirectives(html, path).includes("noindex"), path);
      assert.match(html, /ページが見つかりません/, path);
    }
  });

  test("host and trailing-slash variants permanently redirect without losing paths or queries", async () => {
    for (const path of [
      "/",
      "/about",
      "/issues?theme=education&utm_source=check",
    ]) {
      const response = await requestWithHost(getOrigin(), path, "oshisen.com");
      assert.equal(response.status, 308, path);
      assert.equal(
        new URL(response.location).href,
        new URL(path, publicOrigin).href,
        path,
      );
    }
    for (const path of ["/about/", `${themePaths[0]}/?utm_source=check`]) {
      const response = await fetch(`${getOrigin()}${path}`, {
        redirect: "manual",
      });
      assert.equal(response.status, 308, path);
      const target = new URL(response.headers.get("location"), getOrigin());
      const original = new URL(path, getOrigin());
      assert.equal(target.pathname, original.pathname.replace(/\/$/, ""), path);
      assert.equal(target.search, original.search, path);
    }
  });

  test("a preview deployment remains excluded while keeping canonical URLs on production", async () => {
    const preview = await startServer("preview");
    try {
      for (const path of [
        "/",
        "/about",
        districtPath,
        ...guidePaths,
        themePaths[0],
        "/diagnosis",
      ]) {
        const { response, html } = await fetchPage(preview.origin, path);
        assert.equal(response.status, 200, path);
        const directives = robotsDirectives(html, path);
        assert.ok(directives.includes("noindex"), path);
        assert.ok(!directives.includes("index"), path);
        assert.equal(
          canonical(html, path),
          new URL(path, publicOrigin).href,
          path,
        );
      }
      const sitemapResponse = await fetch(`${preview.origin}/sitemap.xml`);
      assert.equal(sitemapResponse.status, 200);
      assert.doesNotMatch(await sitemapResponse.text(), /<loc>/);
    } finally {
      await preview.stop();
    }
  });
}
