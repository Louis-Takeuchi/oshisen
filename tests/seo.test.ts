import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata, publicSiteOrigin, serializeJsonLd } from "../lib/seo.ts";
import { visitorAnalyticsPath } from "../lib/visitor-analytics.ts";

test("JSON-LD cannot be closed by authored content", () => {
  const payload = { name: "</script><script>alert(1)</script>" };
  const json = serializeJsonLd(payload);
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), payload);
});

test("canonical and social metadata use one configured public origin", () => {
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = "https://www.oshisen.com/ignored-path";
    assert.equal(publicSiteOrigin().origin, "https://www.oshisen.com");
    const page = pageMetadata("/about", {
      title: "About",
      description: "About page",
      index: true,
    });
    assert.equal(page.alternates?.canonical, "https://www.oshisen.com/about");
    assert.equal(page.openGraph?.url, "https://www.oshisen.com/about");
    assert.equal(page.robots, undefined, "inherit runtime preview exclusion");
    assert.deepEqual(
      pageMetadata("/saved", {
        title: "Saved",
        description: "Local saved list",
      }).robots,
      { index: false, follow: true },
    );
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("SEO routes are counted without sending the selected policy question", () => {
  for (const path of [
    "/guides/high-school-election",
    "/tsukuba/elections",
    "/tsuchiura/elections",
  ]) {
    assert.equal(visitorAnalyticsPath(path), path);
    assert.equal(visitorAnalyticsPath(`${path}/`), path);
    assert.equal(visitorAnalyticsPath(`${path}/not-a-guide`), null);
    assert.equal(visitorAnalyticsPath(`${path}?answer=private`), null);
  }
  for (const hub of ["/ibaraki-2026/tsukuba", "/ibaraki-2026/tsuchiura"]) {
    assert.equal(visitorAnalyticsPath(hub), hub);
  }
  for (const slug of [
    "p01",
    "p02",
    "p03",
    "p04",
    "p05",
    "p06",
    "t01",
    "t02",
    "u01",
    "u02",
  ])
    assert.equal(visitorAnalyticsPath(`/q/${slug}`), "/q/[id]");
  assert.equal(visitorAnalyticsPath("/q/p07"), null);
  assert.equal(visitorAnalyticsPath("/q/not-a-question"), null);
  assert.equal(visitorAnalyticsPath("/talk"), "/talk");
});
