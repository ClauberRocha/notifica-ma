import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuários" }] }),
  component: () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Usuários</h1>
      <p className="text-muted-foreground mb-6">Gerenciamento em construção.</p>
      <Link to="/" className="text-primary underline">← Voltar</Link>
    </div>
  ),
});
