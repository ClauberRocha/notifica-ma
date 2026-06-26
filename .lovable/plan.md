## Objetivo
Permitir que usuários **visualizem, criem e editem fichas mesmo sem internet**, com sincronização automática quando a conexão voltar, e mostrar um aviso claro quando o sistema detectar que está offline.

## O que será entregue

### 1. Detector de conexão (rápido — base de tudo)
- Hook `useOnlineStatus` ouvindo `online` / `offline` do navegador + ping leve periódico (fetch HEAD a cada 30s) para detectar quedas reais.
- Banner fixo no topo do layout autenticado:
  - Offline: faixa âmbar — *"Sem conexão. Você pode continuar criando/editando fichas — tudo será sincronizado automaticamente quando a internet voltar."*
  - Voltando online com fila pendente: faixa azul — *"Sincronizando N ficha(s)…"*
  - Sincronização concluída: toast de sucesso.

### 2. Cache de leitura (fichas já visualizadas funcionam offline)
- Persistir o cache do **TanStack Query** em IndexedDB usando `@tanstack/query-sync-storage-persister` + `idb-keyval`.
- `staleTime` ajustado para que listas e detalhes já abertos continuem aparecendo offline (servidos do cache).
- Pré-aquecimento: ao abrir "Fichas Cadastradas" online, todas as fichas listadas e seus detalhes ficam disponíveis para reabrir offline.

### 3. Fila de gravações offline (a peça central)
- Nova store IndexedDB `pending_ops` (via `idb-keyval` ou `idb`) com registros: `{ id, table, op: "insert"|"update"|"delete", payload, agravo, createdAt, attempts, lastError }`.
- Wrapper `offlineSupabase.from(table).insert/update/delete(...)`:
  - **Online:** chama Supabase direto.
  - **Offline:** grava na fila + grava uma cópia "otimista" no cache do React Query (com flag `_pendingSync: true`) para a ficha aparecer imediatamente nas listas/detalhes.
- IDs locais temporários (`local-<uuid>`) substituídos pelo ID real do servidor após sync.

### 4. Sincronizador
- Serviço `syncQueue()` disparado quando:
  - Evento `online` do navegador.
  - Ao montar o app se já houver internet.
  - Botão manual "Sincronizar agora" no banner.
- Processa a fila em ordem (FIFO), com retry exponencial em caso de erro. Em conflito (mesma ficha editada em outro dispositivo), aplica *last-write-wins* e registra log.
- Após cada sucesso: invalida queries do agravo para refletir o estado final do servidor.

### 5. PWA (Service Worker) — para o app abrir offline
- Adiciona `vite-plugin-pwa` com `generateSW`, `registerType: "autoUpdate"`.
- Wrapper de registro com guardas (não registra em preview/iframe Lovable, suporta `?sw=off` para limpar).
- Estratégias:
  - **NetworkFirst** para navegações HTML (nunca cache-first).
  - **CacheFirst** apenas para assets buildados com hash.
  - Exclui `/~oauth` e chamadas ao Supabase do cache.
- Manifest com nome "Notifica-MA", cores institucionais, ícones (gerados).

### 6. Indicadores visuais nas fichas
- Badge "Aguardando sync" nas fichas que estão na fila local (lista e detalhe).
- Contador no banner: "3 alterações pendentes".

## Limitações conscientes (decisão deliberada)
- **Conflito de edição simultânea** entre 2 usuários: aplicamos *last-write-wins* (quem sincronizar por último vence). Não vamos construir merge campo-a-campo — seria desproporcional.
- **Buscas/relatórios complexos offline** (Painel Executivo, mapas, análise epidemiológica): só funcionam online. Offline cobre **Fichas Cadastradas, Nova Ficha, edição de ficha e visualização**.
- **Anexos / arquivos**: não há upload de arquivos nas fichas hoje, então não há nada a fazer aqui.
- **Cadastro de usuários, logs, configurações**: requerem privilégio admin no servidor — não fazem sentido offline. Bloqueio com mensagem clara.
- **Primeiro acesso precisa ser online** (para baixar o app e autenticar). Depois disso, abre offline.

## Detalhes técnicos

**Novos pacotes:**
- `idb-keyval` — wrapper simples sobre IndexedDB.
- `@tanstack/query-sync-storage-persister` + `@tanstack/react-query-persist-client` — persistência de cache.
- `vite-plugin-pwa` + `workbox-window` — service worker e manifest.

**Novos arquivos:**
- `src/hooks/use-online-status.tsx`
- `src/lib/offline/queue.ts` — API da fila (`enqueue`, `drain`, `count`, `peek`).
- `src/lib/offline/supabase-offline.ts` — wrapper que decide online vs fila.
- `src/lib/offline/sync.ts` — sincronizador com retry.
- `src/components/offline-banner.tsx` — banner + botão "Sincronizar agora".
- `src/lib/pwa/register-sw.ts` — registro guardado do SW.
- `public/manifest.webmanifest` + ícones em `public/icons/`.

**Arquivos modificados:**
- `vite.config.ts` — adicionar `VitePWA`.
- `src/router.tsx` — habilitar `persistQueryClient` apontando para IndexedDB.
- `src/routes/_authenticated/route.tsx` — montar `<OfflineBanner />` no header.
- Formulários de Nova Ficha e o `case-detail.tsx` (edição) — trocar `supabase.from(...)` por `offlineSupabase.from(...)` nas operações de escrita.
- `src/routes/__root.tsx` — registrar SW e disparar `syncQueue()` no `online`.

**Não muda:**
- Esquema do banco. Toda a fila vive no IndexedDB do navegador do usuário.
- RLS / policies. As escritas continuam passando pelas mesmas regras quando sobem.
- Lógica de autenticação. Sessão do Supabase já é persistida em localStorage.

## Ordem de implementação
1. Detector de conexão + banner (entrega valor imediato).
2. Persistência do cache do React Query (leitura offline das fichas já vistas).
3. Fila IndexedDB + wrapper `offlineSupabase` + sincronizador.
4. Plugar wrapper nos formulários de criação e na edição da `case-detail`.
5. Badges "Aguardando sync".
6. PWA / Service Worker (para o app abrir do zero offline).
7. Verificação: build, simular offline no DevTools, criar/editar ficha, voltar online, conferir sync.

Depois que você aprovar, sigo nessa ordem.