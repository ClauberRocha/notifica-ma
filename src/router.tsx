import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Mantém dados em cache por 24h para uso offline
        gcTime: 1000 * 60 * 60 * 24,
        staleTime: 1000 * 30,
      },
    },
  });

  // Persistência das queries no localStorage (somente no navegador).
  // Permite que listas de fichas continuem visíveis mesmo sem internet.
  if (typeof window !== "undefined") {
    try {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: "notifica-ma-query-cache",
        throttleTime: 1000,
      });
      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24h
        buster: "v1",
      });
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem persistência
    }
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
