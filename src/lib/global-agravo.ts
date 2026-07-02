/**
 * Shared "global agravo" filter used across the Painel analysis tabs and the
 * Fichas de Investigação list. A single source of truth guarantees that
 * clearing the filter in one place (e.g. the Limpar filtros button on the
 * Fichas screen) immediately resets the Painel selection and its dependent
 * tabs.
 *
 * The value is persisted to localStorage so a page refresh keeps the current
 * selection, and cleared values propagate across tabs via the storage event.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "lovable:global-agravo";

type Listener = () => void;
const listeners = new Set<Listener>();

function readInitial(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

let current = readInitial();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    current = e.newValue ?? "";
    notify();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getGlobalAgravo(): string {
  return current;
}

export function setGlobalAgravo(value: string): void {
  const next = value ?? "";
  if (current === next) return;
  current = next;
  if (typeof window !== "undefined") {
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / privacy errors */
    }
  }
  notify();
}

export function useGlobalAgravo(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, getGlobalAgravo, () => "");
  return [value, setGlobalAgravo];
}

/** Testing helper — resets both the in-memory value and localStorage. */
export function __resetGlobalAgravoForTests(): void {
  current = "";
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  notify();
}
