import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateResources } from "../lib/resources.ts";
import {
  contactEmail,
  contactMailto,
  copyContactEmail,
  officialSocialLinks,
} from "../lib/site-contact.ts";

async function withNavigator(value: unknown, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value });
  try {
    await run();
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
}

test("official channels use the exact supplied accounts without sharing parameters", () => {
  assert.equal(contactEmail, "oshisen0914@gmail.com");
  assert.equal(contactMailto, "mailto:oshisen0914@gmail.com");
  assert.deepEqual(
    officialSocialLinks.map(({ href }) => href),
    [
      "https://www.instagram.com/oshisen.official/",
      "https://x.com/OshisenOfficial",
    ],
  );
  for (const { href } of officialSocialLinks) {
    const url = new URL(href);
    assert.equal(url.protocol, "https:");
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
  }
  assert.equal(
    contactMailto.includes("?"),
    false,
    "mail never pre-fills diagnosis data",
  );
});

test("project social accounts are not inserted into candidate resources", () => {
  for (const resources of Object.values(candidateResources)) {
    assert.deepEqual(resources.links, []);
    assert.equal(resources.interview, null);
  }
});

test("clipboard receives only the public address on an explicit copy request", async () => {
  const writes: string[] = [];
  await withNavigator(
    {
      clipboard: {
        writeText: async (value: string) => {
          writes.push(value);
        },
      },
    },
    async () => {
      assert.deepEqual(writes, []);
      assert.equal(await copyContactEmail(), true);
      assert.deepEqual(writes, ["oshisen0914@gmail.com"]);
    },
  );
});

test("unavailable, denied or throwing clipboard access returns a truthful failure", async () => {
  for (const browser of [
    {},
    { clipboard: undefined },
    {
      clipboard: {
        writeText: async () => {
          throw new Error("Permission denied");
        },
      },
    },
    {
      get clipboard() {
        throw new Error("Clipboard unavailable");
      },
    },
  ]) {
    await withNavigator(browser, async () => {
      assert.equal(await copyContactEmail(), false);
    });
  }
});
