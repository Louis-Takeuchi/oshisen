import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteOrigin } from "../lib/site-origin.ts";

test("metadata origin follows Vercel preview or custom host over HTTPS", () => {
  for (const host of [
    "oshisen-preview.vercel.app",
    "oshisen.example.com",
    "localhost.evil.example",
  ]) {
    assert.equal(
      resolveSiteOrigin(new Headers({ host })).origin,
      `https://${host}`,
    );
  }
});
test("local metadata uses HTTP including IPv6 loopback", () => {
  for (const host of ["localhost:3000", "127.0.0.1:3000", "[::1]:3000"]) {
    assert.equal(
      resolveSiteOrigin(new Headers({ host })).origin,
      `http://${host}`,
    );
  }
});
test("optional production URL overrides the host and strips paths", () => {
  assert.equal(
    resolveSiteOrigin(new Headers(), "https://oshisen.example.com/path/")
      .origin,
    "https://oshisen.example.com",
  );
  assert.equal(
    resolveSiteOrigin(new Headers(), "").origin,
    "http://localhost:3000",
  );
  assert.throws(() => resolveSiteOrigin(new Headers(), "not-a-url"));
  assert.throws(() => resolveSiteOrigin(new Headers(), "javascript:alert(1)"));
  assert.throws(() =>
    resolveSiteOrigin(new Headers(), "https://user:password@example.com"),
  );
});
