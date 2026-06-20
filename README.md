# SINAN — Sistema de Notificação de Agravos

Aplicação para registro e acompanhamento de fichas de notificação epidemiológica (modelo SINAN / Ministério da Saúde), com dashboard, listagens, formulários multi-etapas e visualização detalhada por agravo.

## Funcionalidades

- **Dashboard** com estatísticas e gráficos dos casos notificados.
- **Nova Ficha** — formulário em múltiplas etapas seguindo o padrão SINAN para 17 agravos:
  Coqueluche, Difteria, Dengue, Chikungunya, Sarampo, Rubéola, Febre Amarela,
  Hanseníase, Doença Meningocócica, Outras Meningites, Raiva Humana, SRAG/Influenza,
  Surto DTA, Tétano Acidental, Tétano Neonatal, Tuberculose e Epizootia.
- **Listagem** com busca, filtros e navegação para detalhes.
- **Detalhes da ficha** com visualização completa, encerramento e exclusão.
- **Autenticação** e controle de papéis (usuário / admin) via Lovable Cloud.
- **Logs de auditoria** das ações sobre as fichas.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR, file-based routing)
- [TanStack Query](https://tanstack.com/query) — data fetching
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix)
- [Lovable Cloud](https://lovable.dev) (Supabase: Postgres + Auth + RLS)
- [Recharts](https://recharts.org), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev)

## Desenvolvimento

Tudo é editado direto na [Lovable](https://lovable.dev). Para rodar localmente:

```bash
bun install
bun run dev
```

A app fica disponível em `http://localhost:8080`.

## Estrutura

```
src/
  routes/                    # rotas (file-based)
    _authenticated/          # rotas protegidas por auth
      dashboard.tsx
      fichas.*.tsx           # listagens por agravo
      fichas.*.$id.tsx       # detalhes
      nova-ficha.*.tsx       # formulários
  components/
    ui/                      # shadcn/ui
    form/                    # steps de formulários SINAN
  integrations/supabase/     # client gerado (não editar)
  lib/                       # utilitários
```

## Banco de dados

Cada agravo tem sua própria tabela (`coqueluche_cases`, `dengue_chikungunya_cases`,
`meningite_cases`, etc.) com RLS habilitada — usuários autenticados só veem/editam
os próprios registros. Papéis ficam em `user_roles` (validados via função
`has_role` security-definer).

## Publicação

Pela própria [Lovable](https://lovable.dev) → botão **Publish**.

## Troubleshooting — Base44 vs TanStack Start

Este projeto **não** é Base44. Vários arquivos comuns do template Base44/Vite-puro **não se aplicam** e quebram o build se forem adicionados. Use como referência:

### Arquivos que NÃO devem existir aqui

| Arquivo | Por quê |
| --- | --- |
| `tailwind.config.js` / `.ts` | Tailwind v4 ignora — tokens ficam em `src/styles.css` via `@theme inline`. |
| `postcss.config.js` (com `tailwindcss`) | Tailwind v4 roda via `@tailwindcss/vite` (Lightning CSS), sem PostCSS. |
| `jsconfig.json` | Projeto é TypeScript — usa `tsconfig.json`. |
| `index.html` na raiz com `/src/main.jsx` | SSR é montado por `src/routes/__root.tsx`. |
| `src/main.jsx` / `src/App.jsx` / `src/pages/` / `src/Layout.jsx` | Roteamento é file-based em `src/routes/`. |
| `@base44/sdk`, `@base44/vite-plugin` | Backend é Lovable Cloud (Supabase), não Base44. |
| `react-router-dom` | Use `@tanstack/react-router` (`<Link to="/x" params={{...}} />`, `useNavigate`). |
| `vite.config.js` chamando `base44()` / `react()` diretamente | Já incluídos por `@lovable.dev/vite-tanstack-config`. |

### Configuração correta do Vite

`vite.config.ts` deve permanecer minimal:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
});
```

O preset já inclui: `tanstackStart`, `@vitejs/plugin-react`, `@tailwindcss/vite`,
`vite-tsconfig-paths`, `nitro` (build Cloudflare), alias `@`, dedupe React/TanStack,
injeção `VITE_*`, e detecção do sandbox. Adicionar esses plugins manualmente causa
erro de "duplicate plugins".

### Scripts (já presentes em `package.json`)

```json
{
  "dev": "vite dev",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview"
}
```

A Lovable executa `build` automaticamente após cada edição — não é necessário rodar manualmente.

### Substituições rápidas Base44 → TanStack Start

| Base44 | TanStack Start |
| --- | --- |
| `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from '@tanstack/react-router'` |
| `<Link to={`/x/${id}`}>` | `<Link to="/x/$id" params={{ id }}>` |
| `base44.entities.Foo.list()` | `supabase.from('foo_table').select('*')` |
| `useAuth()` (Base44) | `useAuth()` de `@/lib/AuthContext` (Lovable Cloud) |
