import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FilePlus,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Vigilância Epidemiológica" }] }),
  component: PainelPage,
});

const PIE_COLORS = [
  "hsl(213, 94%, 42%)",
  "hsl(167, 72%, 40%)",
  "hsl(43, 96%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(24, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 80%, 55%)",
  "hsl(199, 89%, 48%)",
  "hsl(340, 82%, 52%)",
  "hsl(48, 96%, 53%)",
  "hsl(173, 80%, 40%)",
  "hsl(231, 78%, 60%)",
  "hsl(15, 86%, 55%)",
  "hsl(95, 60%, 45%)",
  "hsl(310, 70%, 50%)",
  "hsl(190, 85%, 45%)",
];

type AgravoDef = {
  table: string;
  label: string;
  slug: string;
  dateField: string;
};

const AGRAVOS: AgravoDef[] = [
  { table: "coqueluche_cases", label: "Coqueluche", slug: "coqueluche", dateField: "data_notificacao" },
  { table: "dengue_chikungunya_cases", label: "Dengue/Chikungunya", slug: "dengue", dateField: "data_notificacao" },
  { table: "difteria_cases", label: "Difteria", slug: "difteria", dateField: "data_notificacao" },
  { table: "epizootia_cases", label: "Epizootia", slug: "epizootia", dateField: "data_notificacao" },
  { table: "exantematica_cases", label: "Exantemática", slug: "sarampo", dateField: "data_notificacao" },
  { table: "febre_amarela_cases", label: "Febre Amarela", slug: "febre-amarela", dateField: "data_notificacao" },
  { table: "hanseniase_cases", label: "Hanseníase", slug: "hanseniase", dateField: "data_notificacao" },
  { table: "meningite_cases", label: "Meningite", slug: "doenca-meningococica", dateField: "data_notificacao" },
  { table: "raiva_humana_cases", label: "Raiva Humana", slug: "raiva-humana", dateField: "data_notificacao" },
  { table: "srag_cases", label: "SRAG", slug: "srag", dateField: "data_preenchimento" },
  { table: "surto_dta_cases", label: "Surto DTA", slug: "surto-dta", dateField: "data_notificacao" },
  { table: "tetano_acidental_cases", label: "Tétano Acidental", slug: "tetano-acidental", dateField: "data_notificacao" },
  { table: "tetano_neonatal_cases", label: "Tétano Neonatal", slug: "tetano-neonatal", dateField: "data_notificacao" },
  { table: "tuberculose_cases", label: "Tuberculose", slug: "tuberculose", dateField: "data_notificacao" },
];

type CaseRow = {
  id: string;
  nome_paciente: string | null;
  municipio_notificacao: string | null;
  status: string | null;
  classificacao_final: string | null;
  data_notificacao: string | null;
  created_at: string | null;
  _agravo: string;
  _slug: string;
};

async function fetchAll(): Promise<CaseRow[]> {
  const results = await Promise.all(
    AGRAVOS.map(async (a) => {
      const { data, error } = await supabase
        .from(a.table as never)
        .select(
          `id, nome_paciente, municipio_notificacao, status, classificacao_final, ${a.dateField}, created_at`,
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return [];
      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        nome_paciente: (r.nome_paciente as string) ?? null,
        municipio_notificacao: (r.municipio_notificacao as string) ?? null,
        status: (r.status as string) ?? null,
        classificacao_final: (r.classificacao_final as string) ?? null,
        data_notificacao: (r[a.dateField] as string) ?? null,
        created_at: (r.created_at as string) ?? null,
        _agravo: a.label,
        _slug: a.slug,
      }));
    }),
  );
  return results.flat();
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: typeof Activity;
  color: string;
  isLoading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            )}
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PainelPage() {
  const { data: allCases = [], isLoading } = useQuery({
    queryKey: ["painel-all-cases"],
    queryFn: fetchAll,
  });

  const sorted = [...allCases].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime(),
  );

  const stats = {
    total: sorted.length,
    emInvestigacao: sorted.filter((c) => c.status === "em_investigacao").length,
    encerrados: sorted.filter((c) => c.status === "encerrado").length,
    confirmados: sorted.filter((c) => c.classificacao_final === "confirmado")
      .length,
  };

  const agravoCounts = new Map<string, number>();
  for (const c of sorted)
    agravoCounts.set(c._agravo, (agravoCounts.get(c._agravo) ?? 0) + 1);
  const pieData = Array.from(agravoCounts.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const monthCounts: Record<string, number> = {};
  for (const c of sorted) {
    if (c.data_notificacao) {
      const d = new Date(c.data_notificacao);
      if (!isNaN(d.getTime())) {
        const k = format(d, "MM/yyyy");
        monthCounts[k] = (monthCounts[k] ?? 0) + 1;
      }
    }
  }
  const barData = Object.entries(monthCounts)
    .sort(([a], [b]) => {
      const [ma, ya] = a.split("/");
      const [mb, yb] = b.split("/");
      return (ya + ma).localeCompare(yb + mb);
    })
    .slice(-12)
    .map(([month, count]) => ({ month, count }));

  const recentCases = sorted.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Painel de Controle
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vigilância Epidemiológica — Todos os agravos
          </p>
        </div>
        <Link to="/nova-ficha">
          <Button className="gap-2">
            <FilePlus className="w-4 h-4" /> Nova Ficha
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Casos"
          value={stats.total}
          icon={Activity}
          color="bg-primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Em Investigação"
          value={stats.emInvestigacao}
          icon={Clock}
          color="bg-amber-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Encerrados"
          value={stats.encerrados}
          icon={CheckCircle}
          color="bg-emerald-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Confirmados"
          value={stats.confirmados}
          icon={AlertTriangle}
          color="bg-destructive"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Casos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="hsl(213, 94%, 42%)"
                    radius={[6, 6, 0, 0]}
                    name="Casos"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Distribuição por Agravo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <div
                  key={d.name}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-muted-foreground">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Últimas Fichas</CardTitle>
          <Link to="/fichas">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
          ) : recentCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma ficha cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => {
                const initial = (c.nome_paciente || c._agravo || "?")[0].toUpperCase();
                return (
                  <Link
                    key={`${c._slug}-${c.id}`}
                    to="/fichas/$slug"
                    params={{ slug: c._slug }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {c.nome_paciente || "(sem nome)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c._agravo} •{" "}
                          {c.municipio_notificacao || "Município não informado"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {c.data_notificacao
                        ? format(new Date(c.data_notificacao), "dd/MM/yyyy")
                        : "—"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
