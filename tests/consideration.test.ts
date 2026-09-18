import assert from "node:assert/strict";
import { test } from "node:test";
import {
  considerationKeys,
  createConsiderationStore,
  sanitizeSelection,
} from "../lib/consideration.ts";
import { questions, type CandidateId, type QuestionId } from "../lib/data.ts";
import { candidates, demoAnswerFixtures } from "./fixtures/legacy-data.ts";
import { calculateMatch } from "./helpers/legacy-matching.ts";

function memoryStorage() {
  const data = new Map<string, string>();
  const writes: string[] = [];
  const removals: string[] = [];
  const failure = { read: false, write: false, remove: false };
  const storage = {
    getItem(key: string) {
      if (failure.read) throw new Error("Access denied");
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (failure.write) throw new Error("Quota exceeded");
      writes.push(key);
      data.set(key, value);
    },
    removeItem(key: string) {
      if (failure.remove) throw new Error("Removal denied");
      removals.push(key);
      data.delete(key);
    },
  };
  return { data, writes, removals, failure, storage };
}

const candidateIds = candidates.map((candidate) => candidate.id);

function setup() {
  const local = memoryStorage();
  const session = memoryStorage();
  const store = createConsiderationStore(
    () => local.storage,
    () => session.storage,
    candidateIds,
  );
  return { local, session, store };
}

const saved = (ids: readonly string[]) => JSON.stringify({ version: 1, ids });

test("reading and subscribing do not write browser storage before an explicit action", () => {
  const { local, session, store } = setup();
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  assert.deepEqual(store.getSnapshot(), {
    savedIds: [],
    compareIds: [],
    priorityIds: [],
    ready: true,
    storageAvailable: null,
  });
  store.getSnapshot();
  store.refreshSaved();
  unsubscribe();
  assert.equal(notifications, 0);
  assert.deepEqual(local.writes, []);
  assert.deepEqual(session.writes, []);
  assert.deepEqual(local.removals, []);
  assert.deepEqual(session.removals, []);
});

test("saved candidates use local storage while comparisons and priorities stay in session storage", () => {
  const { local, session, store } = setup();
  const result = store.toggleSaved("sato-misaki");
  assert.equal(result.ok, true);
  assert.match(result.message, /保存しました/);
  store.toggleCompare("takahashi-ken");
  store.togglePriority("healthcare");
  assert.deepEqual([...local.data.keys()], [considerationKeys.saved]);
  assert.deepEqual(
    [...session.data.keys()],
    [considerationKeys.compare, considerationKeys.priority],
  );
  assert.deepEqual(JSON.parse(local.data.get(considerationKeys.saved)!), {
    version: 1,
    ids: ["sato-misaki"],
  });
  assert.equal(store.getSnapshot().storageAvailable, true);

  const sameTab = createConsiderationStore(
    () => local.storage,
    () => session.storage,
    candidateIds,
  );
  assert.deepEqual(sameTab.getSnapshot().savedIds, ["sato-misaki"]);
  assert.deepEqual(sameTab.getSnapshot().compareIds, ["takahashi-ken"]);
  assert.deepEqual(sameTab.getSnapshot().priorityIds, ["healthcare"]);
  assert.equal(sameTab.getSnapshot().storageAvailable, null);

  const newSession = memoryStorage();
  const newTab = createConsiderationStore(
    () => local.storage,
    () => newSession.storage,
    candidateIds,
  );
  assert.deepEqual(newTab.getSnapshot().savedIds, ["sato-misaki"]);
  assert.deepEqual(newTab.getSnapshot().compareIds, []);
  assert.deepEqual(newTab.getSnapshot().priorityIds, []);
});

test("restored selections remove unknown and duplicate identifiers and enforce canonical limits", () => {
  const { local, session, store } = setup();
  local.data.set(
    considerationKeys.saved,
    JSON.stringify({
      version: 1,
      ids: ["yamada-taro", "unknown", "sato-misaki", "sato-misaki", 4, null],
    }),
  );
  session.data.set(
    considerationKeys.compare,
    saved(["yamada-taro", "tanaka-aya", "sato-misaki", "unknown"]),
  );
  session.data.set(
    considerationKeys.priority,
    saved(["healthcare", "education", "transport", "childcare", "unknown"]),
  );
  assert.deepEqual(store.getSnapshot().savedIds, [
    "sato-misaki",
    "yamada-taro",
  ]);
  assert.deepEqual(store.getSnapshot().compareIds, [
    "sato-misaki",
    "tanaka-aya",
  ]);
  assert.deepEqual(store.getSnapshot().priorityIds, [
    "transport",
    "education",
    "childcare",
  ]);
  assert.deepEqual(local.writes, [], "reading does not silently rewrite data");
  assert.deepEqual(session.writes, []);
  assert.deepEqual(
    sanitizeSelection(["b", "a", "a", "unknown"], ["a", "b"], 1),
    ["a"],
  );
  assert.deepEqual(sanitizeSelection({ ids: ["a"] }, ["a"], 1), []);
});

test("malformed, old-version and structurally invalid saved records are ignored without writes", () => {
  const invalidRecords = [
    "not-json",
    "null",
    "false",
    "[]",
    '"sato-misaki"',
    JSON.stringify({ version: 0, ids: ["sato-misaki"] }),
    JSON.stringify({ version: 2, ids: ["sato-misaki"] }),
    JSON.stringify({ version: "1", ids: ["sato-misaki"] }),
    JSON.stringify({ ids: ["sato-misaki"] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, ids: "sato-misaki" }),
    JSON.stringify({ version: 1, ids: { 0: "sato-misaki", length: 1 } }),
  ];
  for (const raw of invalidRecords) {
    const { local, session, store } = setup();
    local.data.set(considerationKeys.saved, raw);
    session.data.set(considerationKeys.compare, raw);
    session.data.set(considerationKeys.priority, raw);
    assert.deepEqual(store.getSnapshot().savedIds, [], raw);
    assert.deepEqual(store.getSnapshot().compareIds, [], raw);
    assert.deepEqual(store.getSnapshot().priorityIds, [], raw);
    assert.deepEqual(local.writes, []);
    assert.deepEqual(session.writes, []);
    assert.deepEqual(local.removals, []);
    assert.deepEqual(session.removals, []);
  }
});

test("invalid explicit candidate and theme choices cannot write or change state", () => {
  const { local, session, store } = setup();
  const snapshot = store.getSnapshot();
  for (const id of ["unknown", "__proto__", "", "constructor"]) {
    assert.equal(store.toggleSaved(id as CandidateId).ok, false);
    assert.equal(store.toggleCompare(id as CandidateId).ok, false);
    assert.equal(store.togglePriority(id as QuestionId).ok, false);
  }
  assert.strictEqual(store.getSnapshot(), snapshot);
  assert.deepEqual(local.writes, []);
  assert.deepEqual(session.writes, []);
});

test("the third comparison and fourth priority are rejected without replacing existing choices", () => {
  const { session, store } = setup();
  store.toggleCompare("tanaka-aya");
  store.toggleCompare("yamada-taro");
  store.togglePriority("healthcare");
  store.togglePriority("agriculture");
  store.togglePriority("administration");
  const snapshot = store.getSnapshot();
  const writes = [...session.writes];
  const compareResult = store.toggleCompare("sato-misaki");
  const priorityResult = store.togglePriority("education");
  assert.equal(compareResult.ok, false);
  assert.match(compareResult.message, /2人/);
  assert.equal(priorityResult.ok, false);
  assert.match(priorityResult.message, /3つ/);
  assert.strictEqual(store.getSnapshot(), snapshot);
  assert.deepEqual(session.writes, writes);
  assert.deepEqual(snapshot.compareIds, ["tanaka-aya", "yamada-taro"]);
  assert.deepEqual(snapshot.priorityIds, [
    "healthcare",
    "agriculture",
    "administration",
  ]);

  assert.equal(store.toggleCompare("tanaka-aya").ok, true);
  assert.equal(store.toggleCompare("sato-misaki").ok, true);
  assert.deepEqual(store.getSnapshot().compareIds, [
    "sato-misaki",
    "yamada-taro",
  ]);
  assert.equal(store.togglePriority("healthcare").ok, true);
  assert.equal(store.togglePriority("education").ok, true);
  assert.deepEqual(store.getSnapshot().priorityIds, [
    "education",
    "agriculture",
    "administration",
  ]);
});

test("all candidates can be saved and toggling the last item off removes only its key", () => {
  const { local, store } = setup();
  local.data.set("unrelated", "keep");
  for (const candidate of [...candidates].reverse())
    store.toggleSaved(candidate.id);
  assert.deepEqual(
    store.getSnapshot().savedIds,
    candidates.map((candidate) => candidate.id),
  );
  for (const candidate of candidates) store.toggleSaved(candidate.id);
  assert.deepEqual(store.getSnapshot().savedIds, []);
  assert.deepEqual([...local.data], [["unrelated", "keep"]]);
  assert.deepEqual(local.removals, [considerationKeys.saved]);
});

test("clear actions delete only their targeted keys and preserve diagnosis and analytics data", () => {
  const { local, session, store } = setup();
  local.data.set("unrelated.local", "keep-local");
  session.data.set("oshisen:diagnosis:v1", '{"answers":{"transport":4}}');
  session.data.set("unrelated.analytics", "keep-analytics");
  store.toggleSaved("sato-misaki");
  store.toggleCompare("takahashi-ken");
  store.togglePriority("education");
  assert.equal(store.clearCompare().ok, true);
  assert.deepEqual(store.getSnapshot().savedIds, ["sato-misaki"]);
  assert.deepEqual(store.getSnapshot().priorityIds, ["education"]);
  assert.equal(local.data.has(considerationKeys.saved), true);
  assert.equal(session.data.has(considerationKeys.priority), true);
  assert.equal(store.clearSaved().ok, true);
  assert.deepEqual(store.getSnapshot().priorityIds, ["education"]);
  assert.deepEqual(session.removals, [considerationKeys.compare]);
  store.toggleSaved("tanaka-aya");
  store.toggleCompare("yamada-taro");
  assert.equal(store.clearAll().ok, true);
  assert.deepEqual(store.getSnapshot().savedIds, []);
  assert.deepEqual(store.getSnapshot().compareIds, []);
  assert.deepEqual(store.getSnapshot().priorityIds, []);
  assert.deepEqual([...local.data], [["unrelated.local", "keep-local"]]);
  assert.deepEqual(
    [...session.data],
    [
      ["oshisen:diagnosis:v1", '{"answers":{"transport":4}}'],
      ["unrelated.analytics", "keep-analytics"],
    ],
  );
  assert.ok(local.removals.every((key) => key === considerationKeys.saved));
  assert.ok(
    session.removals.every(
      (key) =>
        key === considerationKeys.compare || key === considerationKeys.priority,
    ),
  );
});

test("denied reads and writes keep current selections in memory with an honest persistence warning", () => {
  const { local, session, store } = setup();
  local.failure.read = session.failure.read = true;
  local.failure.write = session.failure.write = true;
  assert.deepEqual(store.getSnapshot().savedIds, []);
  assert.equal(store.getSnapshot().storageAvailable, null);
  for (const result of [
    store.toggleSaved("sato-misaki"),
    store.toggleCompare("tanaka-aya"),
    store.togglePriority("education"),
  ]) {
    assert.equal(result.ok, true, "the in-memory selection is accepted");
    assert.match(result.message, /保存領域を利用できない/);
    assert.match(result.message, /再読み込み/);
    assert.doesNotMatch(result.message, /保存しました/);
  }
  const snapshot = store.getSnapshot();
  assert.deepEqual(snapshot.savedIds, ["sato-misaki"]);
  assert.deepEqual(snapshot.compareIds, ["tanaka-aya"]);
  assert.deepEqual(snapshot.priorityIds, ["education"]);
  assert.equal(snapshot.storageAvailable, false);
  store.refreshSaved();
  assert.strictEqual(store.getSnapshot(), snapshot);
});

test("null or throwing storage providers still accept in-memory choices and truthfully report failed clearing", () => {
  for (const provider of [
    () => null,
    () => {
      throw new Error("SecurityError");
    },
  ]) {
    const store = createConsiderationStore(provider, provider, candidateIds);
    assert.equal(store.toggleSaved("sato-misaki").ok, true);
    assert.equal(store.toggleCompare("takahashi-ken").ok, true);
    assert.equal(store.togglePriority("transport").ok, true);
    assert.deepEqual(store.getSnapshot().savedIds, ["sato-misaki"]);
    const result = store.clearAll();
    assert.equal(result.ok, false);
    assert.match(result.message, /画面内の選択は解除/);
    assert.match(result.message, /削除を確認できません/);
    assert.deepEqual(store.getSnapshot().savedIds, []);
    assert.deepEqual(store.getSnapshot().compareIds, []);
    assert.deepEqual(store.getSnapshot().priorityIds, []);
  }
});

test("failed key removal clears memory but does not falsely claim persisted data was deleted", () => {
  const { local, session, store } = setup();
  store.toggleSaved("sato-misaki");
  store.toggleCompare("takahashi-ken");
  store.togglePriority("education");
  local.failure.remove = session.failure.remove = true;
  const result = store.clearAll();
  assert.equal(result.ok, false);
  assert.match(result.message, /削除を確認できません/);
  assert.match(result.message, /サイトデータ設定/);
  assert.deepEqual(store.getSnapshot().savedIds, []);
  assert.deepEqual(store.getSnapshot().compareIds, []);
  assert.deepEqual(store.getSnapshot().priorityIds, []);
  assert.equal(store.getSnapshot().storageAvailable, false);
  assert.equal(local.data.has(considerationKeys.saved), true);
  assert.equal(session.data.has(considerationKeys.compare), true);
  assert.equal(session.data.has(considerationKeys.priority), true);
});

test("refreshSaved syncs saved candidates across tabs without touching tab-local selections or writing", () => {
  const { local, store } = setup();
  const otherSession = memoryStorage();
  const other = createConsiderationStore(
    () => local.storage,
    () => otherSession.storage,
    candidateIds,
  );
  other.toggleCompare("yamada-taro");
  other.togglePriority("healthcare");
  let notifications = 0;
  other.subscribe(() => notifications++);
  store.toggleSaved("sato-misaki");
  assert.deepEqual(other.getSnapshot().savedIds, []);
  other.refreshSaved();
  assert.deepEqual(other.getSnapshot().savedIds, ["sato-misaki"]);
  assert.equal(notifications, 1);
  assert.deepEqual(other.getSnapshot().compareIds, ["yamada-taro"]);
  assert.deepEqual(other.getSnapshot().priorityIds, ["healthcare"]);
  const unchanged = other.getSnapshot();
  other.refreshSaved();
  assert.strictEqual(other.getSnapshot(), unchanged);
  assert.equal(notifications, 1);
  store.clearSaved();
  other.refreshSaved();
  assert.deepEqual(other.getSnapshot().savedIds, []);
  assert.equal(notifications, 2);
  assert.deepEqual(local.writes, [considerationKeys.saved]);
  assert.deepEqual(local.removals, [considerationKeys.saved]);
});

test("snapshots stay referentially stable until state changes and unsubscribed listeners stop firing", () => {
  const { store } = setup();
  const first = store.getSnapshot();
  assert.strictEqual(store.getSnapshot(), first);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.toggleSaved("sato-misaki");
  const second = store.getSnapshot();
  assert.notStrictEqual(second, first);
  assert.strictEqual(store.getSnapshot(), second);
  assert.equal(notifications, 1);
  assert.deepEqual(first.savedIds, [], "previous snapshots are not mutated");
  unsubscribe();
  store.toggleSaved("tanaka-aya");
  assert.equal(notifications, 1);
  assert.deepEqual(second.savedIds, ["sato-misaki"]);
});

test("candidate saves, comparisons and priorities cannot change the equal-weight matching result", () => {
  const { store } = setup();
  const userAnswers = Object.freeze({
    transport: 4,
    education: 2,
    healthcare: 1,
    agriculture: null,
  });
  const originals = JSON.stringify({
    userAnswers,
    demoAnswerFixtures,
    candidates,
    questions,
  });
  const before = candidates.map((candidate) =>
    calculateMatch(userAnswers, demoAnswerFixtures[candidate.id]),
  );
  store.toggleSaved("yamada-taro");
  store.toggleCompare("sato-misaki");
  store.toggleCompare("tanaka-aya");
  store.togglePriority("education");
  store.togglePriority("healthcare");
  store.togglePriority("agriculture");
  assert.deepEqual(
    candidates.map((candidate) =>
      calculateMatch(userAnswers, demoAnswerFixtures[candidate.id]),
    ),
    before,
  );
  assert.equal(
    JSON.stringify({ userAnswers, demoAnswerFixtures, candidates, questions }),
    originals,
  );
});

test("refreshSaved cannot roll back a newer in-memory save after a quota failure", () => {
  const { local, store } = setup();
  store.toggleSaved("sato-misaki");
  local.failure.write = true;
  store.toggleSaved("tanaka-aya");
  const snapshot = store.getSnapshot();
  assert.deepEqual(snapshot.savedIds, ["sato-misaki", "tanaka-aya"]);
  assert.equal(snapshot.storageAvailable, false);
  store.refreshSaved();
  assert.strictEqual(
    store.getSnapshot(),
    snapshot,
    "an older persisted record must not replace the current fallback selection",
  );
});

test("refreshSaved preserves memory when the provider is unavailable and after persisted deletion fails", () => {
  const unavailable = createConsiderationStore(
    () => null,
    () => null,
    candidateIds,
  );
  unavailable.toggleSaved("sato-misaki");
  unavailable.refreshSaved();
  assert.deepEqual(unavailable.getSnapshot().savedIds, ["sato-misaki"]);

  const { local, store } = setup();
  store.toggleSaved("sato-misaki");
  local.failure.remove = true;
  store.clearSaved();
  store.refreshSaved();
  assert.deepEqual(
    store.getSnapshot().savedIds,
    [],
    "refresh cannot resurrect a selection the user just cleared in memory",
  );
});
