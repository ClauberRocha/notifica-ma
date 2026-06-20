import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/fichas")({
  head: () => ({ meta: [{ title: "Fichas" }] }),
  component: () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Ver Fichas</h1>
      <p className="text-muted-foreground mb-6">Lista em construção.</p>
      <Link to="/" className="text-primary underline">← Voltar</Link>
    </div>
  ),
});
