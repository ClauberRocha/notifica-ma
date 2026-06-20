import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FilePlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/nova-ficha/")({
  head: () => ({ meta: [{ title: "Nova Ficha — Selecionar Agravo" }] }),
  component: SelectAgravoPage,
});

const agravos = [
  {
    label: "Coqueluche",
    desc: "Notificação individual de coqueluche",
    to: "/nova-ficha/coqueluche" as const,
    color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
  },
  {
    label: "Dengue",
    desc: "Notificação individual de dengue",
    to: "/nova-ficha/dengue" as const,
    color: "bg-chart-3/20 text-yellow-700 border-chart-3/30 hover:bg-chart-3/30",
  },
  {
    label: "Chikungunya",
    desc: "Notificação individual de chikungunya",
    to: "/nova-ficha/chikungunya" as const,
    color: "bg-chart-5/10 text-chart-5 border-chart-5/20 hover:bg-chart-5/15",
  },
  {
    label: "Difteria",
    desc: "Notificação individual de difteria",
    to: "/nova-ficha/difteria" as const,
    color: "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/15",
  },
  {
    label: "Epizootia",
    desc: "Notificação de epizootia em animais",
    to: "/nova-ficha/epizootia" as const,
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20 hover:bg-chart-4/15",
  },
  {
    label: "Sarampo",
    desc: "Notificação individual de sarampo",
    to: "/nova-ficha/sarampo" as const,
    color: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  },
  {
    label: "Rubéola",
    desc: "Notificação individual de rubéola",
    to: "/nova-ficha/rubeola" as const,
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20 hover:bg-chart-1/15",
  },
  {
    label: "Febre Amarela",
    desc: "Notificação individual de febre amarela",
    to: "/nova-ficha/febre-amarela" as const,
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15",
  },
  {
    label: "Hanseníase",
    desc: "Notificação individual de hanseníase",
    to: "/nova-ficha/hanseniase" as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/15",
  },
  {
    label: "Doença Meningocócica",
    desc: "Notificação individual de doença meningocócica",
    to: "/nova-ficha/doenca-meningococica" as const,
    color: "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15",
  },
  {
    label: "Outras Meningites",
    desc: "Notificação individual de outras meningites",
    to: "/nova-ficha/outras-meningites" as const,
    color: "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/15",
  },
  {
    label: "Raiva Humana",
    desc: "Notificação individual de raiva humana",
    to: "/nova-ficha/raiva-humana" as const,
    color: "bg-red-600/10 text-red-700 border-red-600/20 hover:bg-red-600/15",
  },
  {
    label: "SRAG",
    desc: "Síndrome Respiratória Aguda Grave / Influenza",
    to: "/nova-ficha/srag" as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-500/20 hover:bg-teal-500/15",
  },
  {
    label: "Surto DTA",
    desc: "Surto de Doença Transmitida por Alimentos",
    to: "/nova-ficha/surto-dta" as const,
    color: "bg-lime-500/10 text-lime-700 border-lime-500/20 hover:bg-lime-500/15",
  },
  {
    label: "Tétano Acidental",
    desc: "Notificação individual de tétano acidental",
    to: "/nova-ficha/tetano-acidental" as const,
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/15",
  },
  {
    label: "Tétano Neonatal",
    desc: "Notificação individual de tétano neonatal",
    to: "/nova-ficha/tetano-neonatal" as const,
    color: "bg-violet-500/10 text-violet-700 border-violet-500/20 hover:bg-violet-500/15",
  },
];




function SelectAgravoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2">Nova notificação</h1>
      <p className="text-sm text-muted-foreground mb-6">Selecione o agravo a notificar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {agravos.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${a.color}`}
          >
            <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-base">{a.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
