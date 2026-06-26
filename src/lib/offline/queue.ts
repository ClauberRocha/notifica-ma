// Fila de operações offline persistida em IndexedDB via idb-keyval.
// Cada item representa uma escrita (insert/update/delete) que deve ser
// reproduzida no Supabase assim que houver internet.

import { get, set, createStore } from "idb-keyval";

const QUEUE_KEY = "pending_ops_v1";
const store = createStore("notifica-ma-offline", "kv");

export type PendingOp = {
  id: string;             // id local (uuid) do item na fila
  table: string;          // ex. "meningite_cases"
  op: "insert" | "update" | "delete";
  payload: Record<string, unknown> | null; // null para delete
  rowId?: string | null;  // id da linha (para update/delete). Para insert pode ser id local.
  createdAt: number;
  attempts: number;
  lastError?: string;
};

type Listener = (count: number) => void;
const listeners = new Set<Listener>();

function uuid() {
  return (
    "loc-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

async function readAll(): Promise<PendingOp[]> {
  const data = (await get(QUEUE_KEY, store)) as PendingOp[] | undefined;
  return Array.isArray(data) ? data : [];
}

async function writeAll(items: PendingOp[]) {
  await set(QUEUE_KEY, items, store);
  notify(items.length);
}

function notify(count: number) {
  listeners.forEach((l) => {
    try { l(count); } catch { /* ignore */ }
  });
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  // dispara estado inicial
  void count().then(listener);
  return () => listeners.delete(listener);
}

export async function count(): Promise<number> {
  return (await readAll()).length;
}

export async function peek(): Promise<PendingOp[]> {
  return readAll();
}

export async function enqueue(
  op: Omit<PendingOp, "id" | "createdAt" | "attempts">,
): Promise<PendingOp> {
  const items = await readAll();
  const entry: PendingOp = {
    ...op,
    id: uuid(),
    createdAt: Date.now(),
    attempts: 0,
  };
  items.push(entry);
  await writeAll(items);
  return entry;
}

export async function remove(opId: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((i) => i.id !== opId));
}

export async function markFailure(opId: string, err: string): Promise<void> {
  const items = await readAll();
  const next = items.map((i) =>
    i.id === opId ? { ...i, attempts: i.attempts + 1, lastError: err } : i,
  );
  await writeAll(next);
}

export async function clearAll(): Promise<void> {
  await writeAll([]);
}
