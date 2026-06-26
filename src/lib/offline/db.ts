// Wrapper Supabase com fallback offline.
// - online: executa a operação normalmente
// - offline: enfileira em IndexedDB e devolve { error: null } para o caller
//
// Também expõe um cache local opcional de linhas (lastKnownRows) usado
// quando o usuário abre uma ficha sem internet.

import { supabase } from "@/integrations/supabase/client";
import { enqueue, type PendingOp } from "./queue";

type Result = { error: { message: string } | null; localOnly?: boolean };

function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export async function insertCase(
  table: string,
  payload: Record<string, unknown>,
): Promise<Result> {
  if (isOnline()) {
    const { error } = await supabase.from(table as never).insert(payload as never);
    if (!error) return { error: null };
    // Falha de rede: ainda enfileira para retry
    if (isNetworkError(error.message)) {
      await enqueue({ table, op: "insert", payload, rowId: null });
      return { error: null, localOnly: true };
    }
    return { error: { message: error.message } };
  }
  await enqueue({ table, op: "insert", payload, rowId: null });
  return { error: null, localOnly: true };
}

export async function updateCase(
  table: string,
  rowId: string,
  payload: Record<string, unknown>,
): Promise<Result> {
  if (isOnline()) {
    const { error } = await supabase
      .from(table as never)
      .update(payload as never)
      .eq("id", rowId);
    if (!error) return { error: null };
    if (isNetworkError(error.message)) {
      await enqueue({ table, op: "update", payload, rowId });
      return { error: null, localOnly: true };
    }
    return { error: { message: error.message } };
  }
  await enqueue({ table, op: "update", payload, rowId });
  return { error: null, localOnly: true };
}

export async function deleteCase(
  table: string,
  rowId: string,
): Promise<Result> {
  if (isOnline()) {
    const { error } = await supabase
      .from(table as never)
      .delete()
      .eq("id", rowId);
    if (!error) return { error: null };
    if (isNetworkError(error.message)) {
      await enqueue({ table, op: "delete", payload: null, rowId });
      return { error: null, localOnly: true };
    }
    return { error: { message: error.message } };
  }
  await enqueue({ table, op: "delete", payload: null, rowId });
  return { error: null, localOnly: true };
}

function isNetworkError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("network request failed") ||
    m.includes("load failed")
  );
}

export type { PendingOp };
