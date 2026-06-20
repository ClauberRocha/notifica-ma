import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, List } from "lucide-react";

export const Route = createFileRoute("/_authenticated/fichas/")({
  head: () => ({ meta: [{ title: "Fichas — Selecionar Agravo" }] }),
  component: SelectAgravoListPage,
});

const agravos = [
  {
    label: "Coqueluche",
    desc: "Fichas cadastradas de coqueluche",
    to: "/fichas/coqueluche" as const,
    color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
  },
  {
    label: "Dengue",
    desc: "Fichas cadastradas de dengue",
    to: "/fichas/dengue" as const,
    color: "bg-chart-3/20 text-yellow-700 border-chart-3/30 hover:bg-chart-3/30",
  },
  {
    label: "Chikungunya",
    desc: "Fichas cadastradas de chikungunya",
    to: "/fichas/chikungunya" as const,
    color: "bg-chart-5/10 text-chart-5 border-chart-5/20 hover:bg-chart-5/15",
  },
  {
    label: "Difteria",
    desc: "Fichas cadastradas de difteria",
    to: "/fichas/difteria" as const,
    color: "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/15",
  },
  {
    label: "Epizootia",
    desc: "Fichas cadastradas de epizootia",
    to: "/fichas/epizootia" as const,
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20 hover:bg-chart-4/15",
  },
  {
    label: "Sarampo",
    desc: "Fichas cadastradas de sarampo",
    to: "/fichas/sarampo" as const,
    color: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  },
  {
    label: "Rubéola",
    desc: "Fichas cadastradas de rubéola",
    to: "/fichas/rubeola" as const,
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20 hover:bg-chart-1/15",
  },
  {
    label: "Febre Amarela",
    desc: "Fichas cadastradas de febre amarela",
    to: "/fichas/febre-amarela" as const,
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15",
  },
  {
    label: "Hanseníase",
    desc: "Fichas cadastradas de hanseníase",
    to: "/fichas/hanseniase" as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/15",
  },
  {
    label: "Doença Meningocócica",
    desc: "Fichas cadastradas de doença meningocócica",
    to: "/fichas/doenca-meningococica" as const,
    color: "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15",
  },
  {
    label: "Outras Meningites",
    desc: "Fichas cadastradas de outras meningites",
    to: "/fichas/outras-meningites" as const,
    color: "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/15",
  },
  {
    label: "Raiva Humana",
    desc: "Fichas cadastradas de raiva humana",
    to: "/fichas/raiva-humana" as const,
    color: "bg-red-600/10 text-red-700 border-red-600/20 hover:bg-red-600/15",
  },
  {
    label: "SRAG",
    desc: "Fichas cadastradas de SRAG / Influenza",
    to: "/fichas/srag" as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-500/20 hover:bg-teal-500/15",
  },
  {
    label: "Surto DTA",
    desc: "Fichas cadastradas de surtos de DTA",
    to: "/fichas/surto-dta" as const,
    color: "bg-lime-500/10 text-lime-700 border-lime-500/20 hover:bg-lime-500/15",
  },
  {
    label: "Tétano Acidental",
    desc: "Fichas cadastradas de tétano acidental",
    to: "/fichas/tetano-acidental" as const,
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/15",
  },
  {
    label: "Tétano Neonatal",
    desc: "Fichas cadastradas de tétano neonatal",
    to: "/fichas/tetano-neonatal" as const,
    color: "bg-violet-500/10 text-violet-700 border-violet-500/20 hover:bg-violet-500/15",
  },
];




function SelectAgravoListPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2">Fichas cadastradas</h1>
      <p className="text-sm text-muted-foreground mb-6">Selecione o agravo para consultar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {agravos.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${a.color}`}
          >
            <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0">
              <List className="w-6 h-6" />
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
