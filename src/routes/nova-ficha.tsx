import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/nova-ficha")({
  head: () => ({
    meta: [
      { title: "Nova Ficha — Notificação de Agravo" },
      { name: "description", content: "Registre uma nova ficha de notificação de agravo." },
    ],
  }),
  component: NovaFicha,
});

function NovaFicha() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Nova Notificação</h1>
      <p className="text-muted-foreground mb-6">Formulário de cadastro em construção.</p>
      <Link to="/" className="text-primary underline">← Voltar para o início</Link>
    </div>
  );
}
