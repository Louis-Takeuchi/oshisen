import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import {
  beforeSendVisitorAnalytics,
  canSendVisitorAnalytics,
  getVisitorAnalyticsStatus,
  hasSafeAnalyticsReferrer,
  isVisitorAnalyticsDeployment,
  setVisitorAnalyticsEnabled,
  subscribeVisitorAnalytics,
  visitorAnalyticsPath,
  VISITOR_PREFERENCE_KEY,
} from "../lib/visitor-analytics.ts";
import { eraseAnalytics } from "../lib/analytics.ts";

function withBrowser(run: (browser: {
  stored: Map<string, string>;
  storage: Storage;
  window: EventTarget & {
    navigator: { doNotTrack: string | null; globalPrivacyControl: boolean };
    location: { origin: string };
  };
  document: { referrer: string };
}) => void) {
  const stored = new Map<string, string>();
  const storage: Storage = {
    get length() { return stored.size; },
    key: (index) => [...stored.keys()][index] ?? null,
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => { stored.set(key, value); },
    removeItem: (key) => { stored.delete(key); },
    clear: () => { stored.clear(); },
  };
  const browserWindow = Object.assign(new EventTarget(), {
    localStorage: storage,
    sessionStorage: storage,
    navigator: { doNotTrack: null as string | null, globalPrivacyControl: false },
    location: { origin: "https://www.oshisen.com" },
  });
  const document = { referrer: "" };
  const originals = ["window", "document"].map((name) =>
    Object.getOwnPropertyDescriptor(globalThis, name),
  );
  Object.defineProperty(globalThis, "window", { configurable: true, value: browserWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  try {
    run({ stored, storage, window: browserWindow, document });
  } finally {
    for (const [index, name] of ["window", "document"].entries()) {
      const original = originals[index];
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
}

const pageview = (url = "https://www.oshisen.com/") => ({ type: "pageview", url });

test("visitor analytics is off during SSR, local development, preview and Sites", () => {
  assert.equal(getVisitorAnalyticsStatus(), "unavailable");
  assert.equal(canSendVisitorAnalytics(), false);
  assert.equal(beforeSendVisitorAnalytics(pageview()), null);
  assert.equal(setVisitorAnalyticsEnabled(true), false);
  for (const nodeEnv of [undefined, "development", "test", "production"]) {
    for (const vercelEnv of [undefined, "development", "preview", "production"]) {
      assert.equal(
        isVisitorAnalyticsDeployment(nodeEnv, vercelEnv),
        nodeEnv === "production" && vercelEnv === "production",
      );
    }
  }
});

test("only known page kinds and a single anonymized candidate path are accepted", () => {
  for (const path of ["/", "/diagnosis", "/questions", "/results", "/candidates", "/compare", "/saved", "/issues", "/about", "/method", "/sources", "/privacy"]) {
    assert.equal(visitorAnalyticsPath(path), path);
  }
  for (const path of ["/candidates/sato-misaki", "/candidates/tanaka-aya/", "/candidates/[id]", "/candidates/private%40example.com"]) {
    assert.equal(visitorAnalyticsPath(path), "/candidates/[id]");
  }
  for (const path of ["/private", "/admin/token", "/api/events", "/candidates/name/private", "/issues?theme=education", "/candidates/a?answer=4", "https://other.test/"]) {
    assert.equal(visitorAnalyticsPath(path), null);
  }
});

test("every event loses queries, hash, candidate IDs and extra fields before sending", () => {
  withBrowser(() => {
    for (const path of ["/candidates/sato-misaki", "/candidates/yamada-taro", "/issues", "/results", "/questions"]) {
      const input = {
        ...pageview(`https://www.oshisen.com${path}?answer=4&score=99&theme=education#private`),
        candidateId: "sato-misaki",
        answer: 4,
        score: 99,
      };
      assert.deepEqual(beforeSendVisitorAnalytics(input), {
        type: "pageview",
        url: `https://www.oshisen.com${visitorAnalyticsPath(path)}`,
      });
    }
    for (const url of ["not a URL", "javascript:alert(1)", "https://other.test/results", "https://name:secret@www.oshisen.com/results", "https://www.oshisen.com/private?token=secret"]) {
      assert.equal(beforeSendVisitorAnalytics(pageview(url)), null);
    }
    assert.equal(beforeSendVisitorAnalytics({ type: "event", url: "https://www.oshisen.com/" }), null);
  });
});

test("only empty or origin-only referrers are safe, including for later sends", () => {
  for (const referrer of ["", "https://example.com", "http://example.com/"]) {
    assert.equal(hasSafeAnalyticsReferrer(referrer), true);
  }
  for (const referrer of ["broken", "javascript:alert(1)", "file:///", "https://name:password@example.com/", "https://example.com/?private=yes", "https://example.com/#private", "https://www.oshisen.com/candidates/sato-misaki", "https://example.com/article"]) {
    assert.equal(hasSafeAnalyticsReferrer(referrer), false, referrer);
    withBrowser(({ document }) => {
      document.referrer = referrer;
      assert.equal(canSendVisitorAnalytics(), false);
      assert.equal(beforeSendVisitorAnalytics(pageview()), null);
    });
  }
});

test("cookie-less visits default on; opting out blocks existing callbacks and persists", () => {
  withBrowser(({ stored }) => {
    assert.equal(getVisitorAnalyticsStatus(), "enabled");
    assert.equal(stored.size, 0, "default collection writes no identifier or preference");
    const alreadyRegisteredCallback = beforeSendVisitorAnalytics;
    assert.ok(alreadyRegisteredCallback(pageview()));
    assert.equal(setVisitorAnalyticsEnabled(false), true);
    assert.equal(getVisitorAnalyticsStatus(), "disabled");
    assert.equal(alreadyRegisteredCallback(pageview()), null);
    assert.equal(stored.get(VISITOR_PREFERENCE_KEY), "1");
    assert.equal(setVisitorAnalyticsEnabled(true), true);
    assert.equal(getVisitorAnalyticsStatus(), "enabled");
    assert.ok(alreadyRegisteredCallback(pageview()));
  });
});

test("DNT and GPC override an enabled preference and block all events", () => {
  withBrowser(({ window }) => {
    for (const value of ["1", "yes"]) {
      window.navigator.doNotTrack = value;
      setVisitorAnalyticsEnabled(true);
      assert.equal(getVisitorAnalyticsStatus(), "browser-disabled");
      assert.equal(beforeSendVisitorAnalytics(pageview()), null);
    }
    window.navigator.doNotTrack = "0";
    assert.equal(getVisitorAnalyticsStatus(), "enabled");
    window.navigator.globalPrivacyControl = true;
    assert.equal(getVisitorAnalyticsStatus(), "browser-disabled");
    assert.equal(beforeSendVisitorAnalytics(pageview()), null);
  });
});

test("blocked reads and corrupt preferences fail closed", () => {
  withBrowser(({ storage, stored }) => {
    stored.set(VISITOR_PREFERENCE_KEY, "unexpected");
    assert.equal(getVisitorAnalyticsStatus(), "unavailable");
    assert.equal(beforeSendVisitorAnalytics(pageview()), null);
    storage.getItem = () => { throw new Error("blocked"); };
    assert.equal(getVisitorAnalyticsStatus(), "unavailable");
    assert.equal(canSendVisitorAnalytics(), false);
  });
});

test("failed preference writes stop immediately without touching user data", () => {
  withBrowser(({ storage, stored }) => {
    stored.set(VISITOR_PREFERENCE_KEY, "0");
    stored.set("unrelated", "preserve");
    const originalSet = storage.setItem;
    storage.setItem = () => { throw new Error("full"); };
    assert.equal(setVisitorAnalyticsEnabled(false), false);
    assert.equal(getVisitorAnalyticsStatus(), "disabled");
    assert.equal(beforeSendVisitorAnalytics(pageview()), null);
    assert.equal(setVisitorAnalyticsEnabled(true), false);
    assert.equal(canSendVisitorAnalytics(), false);
    assert.deepEqual([...stored], [[VISITOR_PREFERENCE_KEY, "0"], ["unrelated", "preserve"]]);
    storage.setItem = originalSet;
    assert.equal(setVisitorAnalyticsEnabled(true), true);
    assert.equal(canSendVisitorAnalytics(), true);
  });
});

test("local changes, cross-tab preferences and browser restoration notify subscribers", () => {
  withBrowser(({ window, stored }) => {
    const states: string[] = [];
    const unsubscribe = subscribeVisitorAnalytics(() => { states.push(getVisitorAnalyticsStatus()); });
    setVisitorAnalyticsEnabled(false);
    stored.set(VISITOR_PREFERENCE_KEY, "0");
    window.dispatchEvent(Object.assign(new Event("storage"), { key: VISITOR_PREFERENCE_KEY }));
    window.dispatchEvent(Object.assign(new Event("storage"), { key: "unrelated" }));
    stored.set(VISITOR_PREFERENCE_KEY, "1");
    // beforeSend observes another tab's stop even before its storage event runs.
    assert.equal(beforeSendVisitorAnalytics(pageview()), null);
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("pageshow"));
    stored.delete(VISITOR_PREFERENCE_KEY);
    window.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
    assert.deepEqual(states, ["disabled", "enabled", "disabled", "disabled", "enabled"]);
    unsubscribe();
    setVisitorAnalyticsEnabled(false);
    window.dispatchEvent(new Event("focus"));
    assert.equal(states.length, 5);
  });
});

test("erasing tab-local events never erases the visitor opt-out", () => {
  withBrowser(({ stored }) => {
    setVisitorAnalyticsEnabled(false);
    stored.set("oshisen.analytics.consent.v1", "true");
    stored.set("oshisen.analytics.events.v1", "[]");
    stored.set("unrelated", "keep");
    assert.equal(eraseAnalytics(), true);
    assert.equal(getVisitorAnalyticsStatus(), "disabled");
    assert.equal(stored.get(VISITOR_PREFERENCE_KEY), "1");
    assert.equal(stored.get("unrelated"), "keep");
  });
});

test("client integration masks SDK route AND path; distinct candidate visits still remount", () => {
  // Evaluate the real component with hook/JSX stubs. No browser or network SDK runs.
  const filename = new URL("../components/visitor-analytics.tsx", import.meta.url);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  let pathname = "/candidates/sato-misaki";
  let allowed = true;
  const exports: { VisitorAnalytics?: (props: { enabled: boolean }) => {
    key: string; props: { path: string; route: string; beforeSend: unknown; configString: string; basePath: string; mode: string };
  } | null } = {};
  const Analytics = () => null;
  runInNewContext(compiled, {
    exports,
    process: { env: { NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH: "/configured", NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG: "config" } },
    require: (name: string) => {
      switch (name) {
        case "react/jsx-runtime": return { jsx: (type: unknown, props: unknown, key: string) => ({ type, props, key }) };
        case "@vercel/analytics/react": return { Analytics };
        case "next/navigation": return { usePathname: () => pathname };
        case "../lib/visitor-analytics": return { visitorAnalyticsPath, beforeSendVisitorAnalytics };
        case "./use-visitor-analytics": return { useCanSendVisitorAnalytics: () => allowed };
        default: throw new Error(`Unexpected dependency: ${name}`);
      }
    },
  });
  const render = () => exports.VisitorAnalytics!({ enabled: true });
  const first = render()!;
  assert.equal(first.props.path, "/candidates/[id]");
  assert.equal(first.props.route, "/candidates/[id]");
  assert.equal(first.props.beforeSend, beforeSendVisitorAnalytics);
  assert.equal(first.props.configString, "config");
  assert.equal(first.props.basePath, "/configured");
  assert.equal(first.props.mode, "production");
  pathname = "/candidates/yamada-taro";
  const second = render()!;
  assert.notEqual(first.key, second.key);
  assert.equal(second.props.path, first.props.path);
  assert.equal(second.props.route, first.props.route);
  assert.doesNotMatch(JSON.stringify(second.props), /yamada-taro/);
  assert.equal(exports.VisitorAnalytics!({ enabled: false }), null);
  allowed = false;
  assert.equal(render(), null);
  allowed = true;
  pathname = "/unknown/private";
  assert.equal(render(), null);
});
