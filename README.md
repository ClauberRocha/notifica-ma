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
