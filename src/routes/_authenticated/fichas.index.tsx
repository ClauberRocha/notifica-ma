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
