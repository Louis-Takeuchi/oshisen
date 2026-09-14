"use client";
import { useSyncExternalStore } from "react";
import {
  createConsiderationStore,
  considerationKeys,
  emptyConsideration,
} from "../lib/consideration";

const store = createConsiderationStore(
  () => (typeof window === "undefined" ? null : window.localStorage),
  () => (typeof window === "undefined" ? null : window.sessionStorage),
);
function subscribe(callback: () => void) {
  const unsubscribe = store.subscribe(callback);
  const sync = (event: StorageEvent) => {
    if (event.key === considerationKeys.saved || event.key === null)
      store.refreshSaved();
  };
  window.addEventListener("storage", sync);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", sync);
  };
}
export function useConsideration() {
  const snapshot = useSyncExternalStore(
    subscribe,
    store.getSnapshot,
    () => emptyConsideration,
  );
  return {
    ...snapshot,
    toggleSaved: store.toggleSaved,
    toggleCompare: store.toggleCompare,
    togglePriority: store.togglePriority,
    clearSaved: store.clearSaved,
    clearCompare: store.clearCompare,
    clearAll: store.clearAll,
  };
}
