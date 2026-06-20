import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/nova-ficha")({
  head: () => ({ meta: [{ title: "Nova Ficha" }] }),
  component: () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Nova Notificação</h1>
      <p className="text-muted-foreground mb-6">Formulário em construção.</p>
      <Link to="/" className="text-primary underline">← Voltar</Link>
    </div>
  ),
});
