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

test("SEO routes are counted without sending the selected policy theme", () => {
  for (const path of ["/guides/high-school-election", "/tsukuba/elections"]) {
    assert.equal(visitorAnalyticsPath(path), path);
    assert.equal(visitorAnalyticsPath(`${path}/`), path);
    assert.equal(visitorAnalyticsPath(`${path}/not-a-guide`), null);
    assert.equal(visitorAnalyticsPath(`${path}?answer=private`), null);
  }
  assert.equal(
    visitorAnalyticsPath("/ibaraki-2026/tsukuba"),
    "/ibaraki-2026/tsukuba",
  );
  for (const theme of [
    "transport",
    "education",
    "childcare",
    "healthcare",
    "disaster",
    "environment",
    "agriculture",
    "administration",
  ])
    assert.equal(
      visitorAnalyticsPath(`/ibaraki-2026/tsukuba/issues/${theme}`),
      "/ibaraki-2026/tsukuba/issues/[theme]",
    );
  assert.equal(
    visitorAnalyticsPath("/ibaraki-2026/tsukuba/issues/not-a-theme"),
    null,
  );
});
