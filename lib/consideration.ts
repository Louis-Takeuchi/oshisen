import {
  candidates,
  questions,
  type CandidateId,
  type QuestionId,
} from "./data.ts";

export const considerationKeys = {
  saved: "oshisen:saved-candidates:v1",
  compare: "oshisen:compare-candidates:v1",
  priority: "oshisen:priority-themes:v1",
} as const;
export interface ConsiderationState {
  readonly savedIds: readonly CandidateId[];
  readonly compareIds: readonly CandidateId[];
  readonly priorityIds: readonly QuestionId[];
  readonly ready: boolean;
  /** null until an explicit save/delete has tested persistence. */
  readonly storageAvailable: boolean | null;
}
export interface ConsiderationAction {
  readonly ok: boolean;
  readonly message: string;
  readonly persisted?: boolean;
}
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type StorageProvider = () => StorageLike | null;
const candidateIds = candidates.map((candidate) => candidate.id);
const questionIds = questions.map((question) => question.id);
export const emptyConsideration: ConsiderationState = Object.freeze({
  savedIds: [],
  compareIds: [],
  priorityIds: [],
  ready: false,
  storageAvailable: null,
});

export function sanitizeSelection<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  limit: number,
): T[] {
  if (!Array.isArray(raw)) return [];
  const selected = new Set(
    raw.filter((value): value is string => typeof value === "string"),
  );
  return allowed.filter((value) => selected.has(value)).slice(0, limit);
}

/** Isolated factory also permits tests with denied/quota-limited storage. */
export function createConsiderationStore(
  local: StorageProvider,
  session: StorageProvider,
) {
  let state = emptyConsideration;
  const subscribers = new Set<() => void>();
  function read<T extends string>(
    provider: StorageProvider,
    key: string,
    allowed: readonly T[],
    limit: number,
  ): T[] {
    const storage = provider();
    if (!storage) throw new Error("Storage unavailable");
    const raw: unknown = JSON.parse(storage.getItem(key) ?? "null");
    if (
      !raw ||
      typeof raw !== "object" ||
      !("version" in raw) ||
      raw.version !== 1 ||
      !("ids" in raw)
    )
      return [];
    return sanitizeSelection(raw.ids, allowed, limit);
  }
  function safeRead<T extends string>(
    provider: StorageProvider,
    key: string,
    allowed: readonly T[],
    limit: number,
  ) {
    try {
      return read(provider, key, allowed, limit);
    } catch {
      return [];
    }
  }
  function getSnapshot(): ConsiderationState {
    if (!state.ready)
      state = {
        savedIds: safeRead(
          local,
          considerationKeys.saved,
          candidateIds,
          candidateIds.length,
        ),
        compareIds: safeRead(
          session,
          considerationKeys.compare,
          candidateIds,
          2,
        ),
        priorityIds: safeRead(
          session,
          considerationKeys.priority,
          questionIds,
          3,
        ),
        ready: true,
        storageAvailable: null,
      };
    return state;
  }
  function emit(next: ConsiderationState) {
    state = next;
    subscribers.forEach((callback) => callback());
  }
  function persist(
    provider: StorageProvider,
    key: string,
    ids: readonly string[],
  ): boolean {
    try {
      const storage = provider();
      if (!storage) return false;
      if (ids.length) storage.setItem(key, JSON.stringify({ version: 1, ids }));
      else storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
  function toggle<T extends string>(
    id: T,
    allowed: readonly T[],
    field: "savedIds" | "compareIds" | "priorityIds",
    limit: number,
    provider: StorageProvider,
    key: string,
  ): ConsiderationAction {
    const current = getSnapshot();
    if (!allowed.includes(id))
      return { ok: false, message: "この項目は選択できません。" };
    const ids: readonly string[] = current[field];
    const removing = ids.includes(id);
    if (!removing && ids.length >= limit)
      return {
        ok: false,
        message: `${field === "compareIds" ? "比較する候補者は2人" : "重視するテーマは3つ"}までです。先に選択を1つ外してください。`,
      };
    const next = sanitizeSelection(
      removing ? ids.filter((value) => value !== id) : [...ids, id],
      allowed,
      limit,
    );
    const persisted = persist(provider, key, next);
    emit({
      ...current,
      [field]: next,
      ...(field === "savedIds" ? { storageAvailable: persisted } : {}),
    });
    return {
      ok: true,
      persisted,
      message: persisted
        ? removing
          ? "選択から外しました。"
          : field === "savedIds"
            ? "このブラウザの気になる候補に保存しました。"
            : "選択しました。"
        : "保存領域を利用できないため、この画面を開いている間だけ保持します。再読み込みすると失われる場合があります。",
    };
  }
  function clear(
    fields: readonly ("saved" | "compare" | "priority")[],
  ): ConsiderationAction {
    const current = getSnapshot();
    const removed = fields.map((field) =>
      persist(
        field === "saved" ? local : session,
        considerationKeys[field],
        [],
      ),
    );
    const ok = removed.every(Boolean);
    emit({
      ...current,
      ...(fields.includes("saved")
        ? { savedIds: [], storageAvailable: removed[fields.indexOf("saved")] }
        : {}),
      ...(fields.includes("compare") ? { compareIds: [] } : {}),
      ...(fields.includes("priority") ? { priorityIds: [] } : {}),
    });
    return {
      ok,
      persisted: ok,
      message: ok
        ? "保存データを削除しました。"
        : "画面内の選択は解除しましたが、保存領域の削除を確認できません。ブラウザのサイトデータ設定から削除してください。",
    };
  }
  return {
    getSnapshot,
    subscribe(callback: () => void) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    refreshSaved() {
      const current = getSnapshot();
      if (current.storageAvailable === false) return;
      try {
        const savedIds = read(
          local,
          considerationKeys.saved,
          candidateIds,
          candidateIds.length,
        );
        if (JSON.stringify(savedIds) !== JSON.stringify(current.savedIds))
          emit({ ...current, savedIds });
      } catch {
        /* Preserve the newest in-memory selection if storage is denied. */
      }
    },
    toggleSaved: (id: CandidateId) =>
      toggle(
        id,
        candidateIds,
        "savedIds",
        candidateIds.length,
        local,
        considerationKeys.saved,
      ),
    toggleCompare: (id: CandidateId) =>
      toggle(
        id,
        candidateIds,
        "compareIds",
        2,
        session,
        considerationKeys.compare,
      ),
    togglePriority: (id: QuestionId) =>
      toggle(
        id,
        questionIds,
        "priorityIds",
        3,
        session,
        considerationKeys.priority,
      ),
    clearSaved: () => clear(["saved"]),
    clearCompare: () => clear(["compare"]),
    clearAll: () => clear(["saved", "compare", "priority"]),
  };
}
