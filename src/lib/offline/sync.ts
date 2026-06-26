// Drena a fila de operações pendentes contra o Supabase.
// Chamado automaticamente quando o navegador volta a ficar online.

import { supabase } from "@/integrations/supabase/client";
import { peek, remove, markFailure, type PendingOp } from "./queue";

let running = false;

export type SyncResult = {
  processed: number;
  failed: number;
  remaining: number;
};

export async function syncPending(): Promise<SyncResult> {
  if (running) return { processed: 0, failed: 0, remaining: (await peek()).length };
  running = true;
  let processed = 0;
  let failed = 0;
  try {
    const items = await peek();
    for (const op of items) {
      const ok = await runOne(op);
      if (ok) {
        await remove(op.id);
        processed++;
      } else {
        failed++;
      }
    }
  } finally {
    running = false;
  }
  return { processed, failed, remaining: (await peek()).length };
}

async function runOne(op: PendingOp): Promise<boolean> {
  try {
    if (op.op === "insert" && op.payload) {
      const { error } = await supabase
        .from(op.table as never)
        .insert(op.payload as never);
      if (error) {
        await markFailure(op.id, error.message);
        return false;
      }
      return true;
    }
    if (op.op === "update" && op.payload && op.rowId) {
      const { error } = await supabase
        .from(op.table as never)
        .update(op.payload as never)
        .eq("id", op.rowId);
      if (error) {
        await markFailure(op.id, error.message);
        return false;
      }
      return true;
    }
    if (op.op === "delete" && op.rowId) {
      const { error } = await supabase
        .from(op.table as never)
        .delete()
        .eq("id", op.rowId);
      if (error) {
        await markFailure(op.id, error.message);
        return false;
      }
      return true;
    }
    // operação inválida — remove
    return true;
  } catch (err) {
    await markFailure(op.id, (err as Error).message);
    return false;
  }
}
