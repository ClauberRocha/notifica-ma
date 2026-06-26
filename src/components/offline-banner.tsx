import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { subscribeQueue } from "@/lib/offline/queue";
import { syncPending } from "@/lib/offline/sync";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Banner persistente exibido no topo da área autenticada:
 *  - mostra estado offline e o número de operações pendentes
 *  - quando volta a internet, dispara a sincronização automaticamente
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => subscribeQueue(setPending), []);

  useEffect(() => {
    if (!online) {
      toast.warning(
        "Você está sem conexão. As alterações serão salvas localmente e enviadas automaticamente quando a internet voltar.",
        { id: "offline-warning", duration: 6000 },
      );
      return;
    }
    if (pending === 0) return;
    void runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  async function runSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await syncPending();
      if (res.processed > 0) {
        toast.success(
          `${res.processed} operação(ões) sincronizada(s) com o servidor.`,
        );
        queryClient.invalidateQueries();
      }
      if (res.failed > 0) {
        toast.error(
          `${res.failed} operação(ões) falharam — tentaremos novamente.`,
        );
      }
    } finally {
      setSyncing(false);
    }
  }

  if (online && pending === 0 && !syncing) return null;

  return (
    <div
      role="status"
      className={
        "flex items-center justify-between gap-3 px-4 py-2 text-sm border-b " +
        (online
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
          : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300")
      }
    >
      <div className="flex items-center gap-2">
        {online ? (
          syncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )
        ) : (
          <CloudOff className="w-4 h-4" />
        )}
        <span>
          {online
            ? syncing
              ? `Sincronizando ${pending} alteração(ões) pendente(s)...`
              : `${pending} alteração(ões) aguardando envio.`
            : "Sem conexão — você ainda pode visualizar e cadastrar fichas; tudo será enviado quando a internet voltar."}
        </span>
      </div>
      {online && pending > 0 && (
        <button
          type="button"
          onClick={runSync}
          disabled={syncing}
          className="underline hover:no-underline disabled:opacity-50"
        >
          Sincronizar agora
        </button>
      )}
    </div>
  );
}
