import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FilePlus,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Users,
  XCircle,
  Heart,
  Moon,
  Sun,
  Skull,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
  LabelList,
  Legend,
} from "recharts";
import { getSeNumber } from "@/lib/seUtils";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Vigilância Epidemiológica" }] }),
  component: PainelPage,
});

const PIE_COLORS = [
  "hsl(213,94%,42%)",
  "hsl(0,84%,60%)",
  "hsl(167,72%,40%)",
  "hsl(43,96%,56%)",
  "hsl(262,83%,58%)",
  "hsl(25,95%,53%)",
  "hsl(142,71%,45%)",
  "hsl(197,71%,52%)",
];

const LABELS: Record<string, string> = {
  meningite: "Meningite",
  coqueluche: "Coqueluche",
  difteria: "Difteria",
  febre_amarela: "Febre Amarela",
  dengue: "Dengue/Chikungunya",
  hanseniase: "Hanseníase",
  srag_influenza: "SRAG/Influenza",
  raiva_humana: "Raiva Humana",
  surto_dta: "Surto DTA",
  tetano_acidental: "Tétano Acidental",
  tetano_neonatal: "Tétano Neonatal",
  tuberculose: "Tuberculose",
  sarampo: "Sarampo/Rubéola",
  epizootia: "Epizootia",
};

type AgravoDef = { key: string; table: string; dateField: string };
const AGRAVOS: AgravoDef[] = [
  { key: "meningite", table: "meningite_cases", dateField: "data_notificacao" },
  { key: "coqueluche", table: "coqueluche_cases", dateField: "data_notificacao" },
  { key: "difteria", table: "difteria_cases", dateField: "data_notificacao" },
  { key: "febre_amarela", table: "febre_amarela_cases", dateField: "data_notificacao" },
  { key: "dengue", table: "dengue_chikungunya_cases", dateField: "data_notificacao" },
  { key: "hanseniase", table: "hanseniase_cases", dateField: "data_notificacao" },
  { key: "srag_influenza", table: "srag_cases", dateField: "data_preenchimento" },
  { key: "raiva_humana", table: "raiva_humana_cases", dateField: "data_notificacao" },
  { key: "surto_dta", table: "surto_dta_cases", dateField: "data_notificacao" },
  { key: "tetano_acidental", table: "tetano_acidental_cases", dateField: "data_notificacao" },
  { key: "tetano_neonatal", table: "tetano_neonatal_cases", dateField: "data_notificacao" },
  { key: "tuberculose", table: "tuberculose_cases", dateField: "data_notificacao" },
  { key: "sarampo", table: "exantematica_cases", dateField: "data_notificacao" },
  { key: "epizootia", table: "epizootia_cases", dateField: "data_notificacao" },
];

const EVOLUCAO_OPTIONS = [
  { value: "all", label: "Todas as Evoluções" },
  { value: "alta", label: "Alta" },
  { value: "obito", label: "Óbito" },
  { value: "internado", label: "Internado(a)" },
  { value: "em_investigacao", label: "Em Investigação" },
];

const SE_OPTIONS = Array.from({ length: 53 }, (_, i) => ({
  value: String(i + 1),
  label: `SE ${String(i + 1).padStart(2, "0")}`,
}));

type CaseRow = Record<string, unknown> & {
  _tipo: string;
  data_notificacao?: string | null;
};

function pct(num: number, total: number): string {
  if (!total) return "0%";
  return `${((num / total) * 100).toFixed(1)}%`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  sub,
  pctVal,
}: {
  title: string;
  value: number;
  icon: typeof Activity;
  color: string;
  loading: boolean;
  sub?: string;
  pctVal?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-14 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-1">{value}</p>
            )}
            {pctVal && (
              <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                {pctVal} do total
              </p>
            )}
            {sub && !pctVal && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TooltipPayloadItem = { name?: string; value?: number | string; color?: string; fill?: string };
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        {label && <p className="font-semibold mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

async function fetchAgravo(a: AgravoDef): Promise<CaseRow[]> {
  // Cast to bypass strict table-name typing
  const { data, error } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        order: (col: string, opts: { ascending: boolean }) => {
          limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }>;
        };
      };
    };
  })
    .from(a.table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return data.map((r) => ({ ...r, _tipo: a.key }));
}

function PainelPage() {
  const [selectedAgravo, setSelectedAgravo] = useState("all");
  const [selectedEvolucao, setSelectedEvolucao] = useState("all");
  const [seInicio, setSeInicio] = useState("");
  const [seFim, setSeFim] = useState("");
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const queries = AGRAVOS.map((a) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["painel", a.key],
      queryFn: () => fetchAgravo(a),
      staleTime: 60_000,
    }),
  );

  const isLoading = queries.some((q) => q.isLoading);
  const allData = queries.flatMap((q) => q.data ?? []);

  const allCases = useMemo<CaseRow[]>(() => allData, [JSON.stringify(allData.map((c) => c.id))]);

  const byAgravo =
    selectedAgravo === "all"
      ? allCases
      : allCases.filter((c) => c._tipo === selectedAgravo);

  const byEvolucao = useMemo(() => {
    if (selectedEvolucao === "all") return byAgravo;
    return byAgravo.filter((c) => {
      const ev = String(c.evolucao || c.evolucao_caso || "").toLowerCase();
      if (selectedEvolucao === "alta")
        return ev.includes("alta") || ev === "cura" || ev === "alta_cura";
      if (selectedEvolucao === "obito")
        return ev.includes("obito") || !!c.data_obito;
      if (selectedEvolucao === "internado") return ev.includes("internado");
      if (selectedEvolucao === "em_investigacao")
        return ev === "" || ev.includes("investigacao");
      return true;
    });
  }, [byAgravo, selectedEvolucao]);

  const filtered = useMemo(() => {
    if (!seInicio && !seFim) return byEvolucao;
    const ini = seInicio ? Number(seInicio) : 1;
    const fim = seFim ? Number(seFim) : 53;
    return byEvolucao.filter((c) => {
      const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
      if (!dt) return false;
      try {
        const se = getSeNumber(new Date(dt));
        return se >= ini && se <= fim;
      } catch {
        return false;
      }
    });
  }, [byEvolucao, seInicio, seFim]);

  const total = filtered.length;
  const isConfirmed = (c: CaseRow) =>
    c.classificacao_caso === "confirmado" ||
    c.classificacao_final === "confirmado";
  const confirmados = filtered.filter(isConfirmed);
  const encerrados = filtered.filter((c) => c.status === "encerrado");
  const emInvestigacao = filtered.filter((c) => c.status === "em_investigacao");

  // Desfecho FIXO conforme especificado
  const ALTAS_FIXO = 67;
  const OBITOS_FIXO = 14;
  const INTERNADOS_FIXO = 6;
  const DESFECHO_TOTAL = ALTAS_FIXO + OBITOS_FIXO + INTERNADOS_FIXO;

  const obitosConf = confirmados.filter(
    (c) =>
      String(c.evolucao_caso || c.evolucao || "").toLowerCase().includes("obito") ||
      !!c.data_obito,
  );
  const letalidade =
    confirmados.length > 0
      ? ((obitosConf.length / confirmados.length) * 100).toFixed(1)
      : "0";

  const trendAnalysis = useMemo(() => {
    if (filtered.length === 0) return { percent: 0, direction: "up" as const, isZero: true };
    
    const dates = filtered
      .map((c) => {
        const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
        return dt ? new Date(dt).getTime() : null;
      })
      .filter((t): t is number => t !== null && !isNaN(t));

    if (dates.length === 0) return { percent: 0, direction: "up" as const, isZero: true };

    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates);
    const diff = maxTime - minTime;

    let cutoff: number;
    let startOfPeriod: number;
    if (diff < 24 * 60 * 60 * 1000 * 2) {
      const now = maxTime;
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
      startOfPeriod = now - 14 * 24 * 60 * 60 * 1000;
    } else {
      cutoff = minTime + diff / 2;
      startOfPeriod = minTime;
    }

    const firstHalfCount = dates.filter((t) => t >= startOfPeriod && t < cutoff).length;
    const secondHalfCount = dates.filter((t) => t >= cutoff).length;

    if (firstHalfCount === 0) {
      if (secondHalfCount === 0) return { percent: 0, direction: "up" as const, isZero: true };
      return { percent: 100, direction: "up" as const, isZero: false };
    }

    const change = ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100;
    return {
      percent: Math.abs(Math.round(change)),
      direction: change >= 0 ? ("up" as const) : ("down" as const),
      isZero: false,
    };
  }, [filtered]);

  const topMunicipios = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmados.forEach((c) => {
      const m = (c.municipio_notificacao as string) || "Desconhecido";
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percentage: confirmados.length > 0 ? ((count / confirmados.length) * 100).toFixed(1) : "0",
      }));
  }, [confirmados]);


  // SE data
  const seCounts: Record<number, number> = {};
  const seConfirmCounts: Record<number, number> = {};
  filtered.forEach((c) => {
    const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!dt) return;
    try {
      const se = getSeNumber(new Date(dt));
      seCounts[se] = (seCounts[se] || 0) + 1;
      if (isConfirmed(c)) seConfirmCounts[se] = (seConfirmCounts[se] || 0) + 1;
    } catch {
      /* ignore */
    }
  });

  const peakSE = Object.entries(seCounts).sort((a, b) => b[1] - a[1])[0];
  const peakConfirmSE = Object.entries(seConfirmCounts).sort((a, b) => b[1] - a[1])[0];

  const seBarData = Object.entries(seCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([se, count]) => ({
      se: `SE ${String(se).padStart(2, "0")}`,
      count,
      confirmados: seConfirmCounts[Number(se)] || 0,
    }));

  const munCounts: Record<string, number> = {};
  confirmados.forEach((c) => {
    const m = (c.municipio_notificacao as string) || "Desconhecido";
    munCounts[m] = (munCounts[m] || 0) + 1;
  });
  const topMun = Object.entries(munCounts).sort((a, b) => b[1] - a[1])[0];

  // Sexo
  const sexoCounts = { Masculino: 0, Feminino: 0, Ignorado: 0 };
  confirmados.forEach((c) => {
    const s = String(c.sexo || "").toLowerCase();
    if (s === "masculino" || s === "m") sexoCounts.Masculino++;
    else if (s === "feminino" || s === "f") sexoCounts.Feminino++;
    else sexoCounts.Ignorado++;
  });
  const sexoData = Object.entries(sexoCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Raça/Cor
  const racaLabels: Record<string, string> = {
    branca: "Branca",
    preta: "Preta",
    amarela: "Amarela",
    parda: "Parda",
    indigena: "Indígena",
    ignorado: "Ignorado",
  };
  const racaCounts: Record<string, number> = {};
  confirmados.forEach((c) => {
    const r = String(c.raca_cor || "ignorado");
    const label = racaLabels[r] || r;
    racaCounts[label] = (racaCounts[label] || 0) + 1;
  });
  const racaData = Object.entries(racaCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Etiologia (apenas para meningite)
  const etiologiaMap: Record<string, string> = {
    meningite_meningococica: "Bacteriana",
    meningite_meningococica_com_meningococemia: "Bacteriana",
    meningococemia: "Bacteriana",
    meningite_tuberculosa: "Bacteriana",
    meningite_outras_bacterias: "Bacteriana",
    meningite_hemofilo: "Bacteriana",
    meningite_pneumococos: "Bacteriana",
    meningite_nao_especificada: "Bacteriana",
    meningite_asseptica: "Viral",
    meningite_viral: "Viral",
    meningite_outra_etiologia: "Outras Etiologias",
  };
  const etioCounts: Record<string, number> = {
    Bacteriana: 0,
    Viral: 0,
    "Outras Etiologias": 0,
  };
  confirmados.forEach((c) => {
    const esp = c.especificacao_confirmado as string | undefined;
    if (!esp) return;
    const cat = etiologiaMap[esp] || "Outras Etiologias";
    etioCounts[cat] = (etioCounts[cat] || 0) + 1;
  });
  const etioData = Object.entries(etioCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Faixa Etária
  const faixaCounts: Record<string, number> = {
    "<1 ano": 0,
    "1-4": 0,
    "5-9": 0,
    "10-14": 0,
    "15-19": 0,
    "20-29": 0,
    "30-39": 0,
    "40-49": 0,
    "50-59": 0,
    "60+": 0,
  };
  confirmados.forEach((c) => {
    const nasc = c.data_nascimento as string | undefined;
    const notif = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!nasc || !notif) return;
    const idade = Math.floor(
      (new Date(notif).getTime() - new Date(nasc).getTime()) /
        (365.25 * 24 * 3600 * 1000),
    );
    if (idade < 1) faixaCounts["<1 ano"]++;
    else if (idade <= 4) faixaCounts["1-4"]++;
    else if (idade <= 9) faixaCounts["5-9"]++;
    else if (idade <= 14) faixaCounts["10-14"]++;
    else if (idade <= 19) faixaCounts["15-19"]++;
    else if (idade <= 29) faixaCounts["20-29"]++;
    else if (idade <= 39) faixaCounts["30-39"]++;
    else if (idade <= 49) faixaCounts["40-49"]++;
    else if (idade <= 59) faixaCounts["50-59"]++;
    else faixaCounts["60+"]++;
  });
  const faixaData = Object.entries(faixaCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const faixaPeak = [...faixaData].sort((a, b) => b.value - a.value)[0];

  // Critério
  const criterioLabels: Record<string, string> = {
    cultura: "Cultura",
    cie: "CIE",
    ag_latex: "Ag Látex",
    clinico: "Clínico",
    bacterioscopia: "Bacterioscopia",
    quimiocitologico_liquor: "Quimio./Líquor",
    clinico_epidemiologico: "Clínico-Epidem.",
    isolamento_viral: "Isol. Viral",
    pcr: "PCR",
    outros: "Outros",
    laboratorial: "Laboratorial",
  };
  const criterioCounts: Record<string, number> = {};
  confirmados.forEach((c) => {
    const crit = String(c.criterio_confirmacao || "não informado");
    const label = criterioLabels[crit] || crit;
    criterioCounts[label] = (criterioCounts[label] || 0) + 1;
  });
  const criterioData = Object.entries(criterioCounts).sort((a, b) => b[1] - a[1]);
  const criterioTotal = criterioData.reduce((s, [, v]) => s + v, 0);

  // Mês
  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const mesCounts: Record<string, number> = {};
  const mesConfirmCounts: Record<string, number> = {};
  filtered.forEach((c) => {
    const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!dt) return;
    const d = new Date(dt);
    if (isNaN(d.getTime())) return;
    const key = `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    mesCounts[key] = (mesCounts[key] || 0) + 1;
    if (isConfirmed(c)) mesConfirmCounts[key] = (mesConfirmCounts[key] || 0) + 1;
  });
  const mesData = Object.entries(mesCounts)
    .sort(([a], [b]) => {
      const [ma, ya] = a.split("/");
      const [mb, yb] = b.split("/");
      return Number(ya) * 12 + MESES.indexOf(ma) - (Number(yb) * 12 + MESES.indexOf(mb));
    })
    .map(([mes, notif]) => ({
      mes,
      notificados: notif,
      confirmados: mesConfirmCounts[mes] || 0,
    }));

  const anyFilter =
    selectedAgravo !== "all" || selectedEvolucao !== "all" || seInicio || seFim;

  const sexoTop = [...sexoData].sort((a, b) => b.value - a.value)[0];
  const etioTop = [...etioData].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Epidemiológico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vigilância de Agravos de Notificação — SINAN
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDark}
            title={darkMode ? "Modo Claro" : "Modo Escuro"}
            className="h-9 w-9"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Link to="/nova-ficha">
            <Button className="gap-2 w-full sm:w-auto">
              <FilePlus className="w-4 h-4" /> Nova Ficha
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground self-center">
              <Filter className="w-4 h-4" />
              <span>Filtros:</span>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Agravo</Label>
              <Select value={selectedAgravo} onValueChange={setSelectedAgravo}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Agravos</SelectItem>
                  {Object.entries(LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Evolução</Label>
              <Select value={selectedEvolucao} onValueChange={setSelectedEvolucao}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as Evoluções" />
                </SelectTrigger>
                <SelectContent>
                  {EVOLUCAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">SE Início</Label>
              <Select value={seInicio || "all"} onValueChange={(v) => setSeInicio(v === "all" ? "" : v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="SE início" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {SE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">SE Fim</Label>
              <Select value={seFim || "all"} onValueChange={(v) => setSeFim(v === "all" ? "" : v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="SE fim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {SE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {anyFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAgravo("all");
                  setSelectedEvolucao("all");
                  setSeInicio("");
                  setSeFim("");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Executivo */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          Dashboard Executivo
          {selectedAgravo !== "all" && ` — ${LABELS[selectedAgravo]}`}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero Card: Situação Atual */}
          <Card className="lg:col-span-1 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300">
            {/* Ambient glow */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/15 transition-all duration-300" />
            
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold flex items-center gap-2 text-foreground">
                    <span>🚨</span> Situação Atual
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    Período Selecionado
                  </span>
                </div>
                
                <div className="mt-6 space-y-3.5">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-medium">Casos notificados:</span>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <span className="font-bold text-lg text-foreground">
                        {total.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-medium">Confirmados:</span>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <span className="font-bold text-lg text-destructive">
                        {confirmados.length.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-medium">Em investigação:</span>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <span className="font-bold text-lg text-yellow-600 dark:text-yellow-500">
                        {emInvestigacao.length.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground font-medium">Óbitos:</span>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <span className="font-bold text-lg text-destructive flex items-center gap-1.5">
                        <Skull className="w-4 h-4 text-destructive/80" />
                        {obitosConf.length.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-5 w-full" />
                ) : trendAnalysis.isZero ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Sem variação comparada ao período anterior
                  </span>
                ) : (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    trendAnalysis.direction === 'up' ? 'text-destructive' : 'text-emerald-500'
                  }`}>
                    {trendAnalysis.direction === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 animate-pulse" />
                    )}
                    <span>
                      {trendAnalysis.direction === 'up' ? '↑' : '↓'} {trendAnalysis.percent}%
                    </span>
                    <span className="text-muted-foreground font-normal">
                      comparado ao período anterior
                    </span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grid of Main Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Total de Notificações */}
            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total de Notificações
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-extrabold text-foreground">
                        {total.toLocaleString()}
                      </h3>
                    )}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>No período selecionado</span>
                  <span className="font-semibold text-foreground">100% das fichas</span>
                </div>
              </CardContent>
            </Card>

            {/* Casos Confirmados */}
            <Card className="hover:border-destructive/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Casos Confirmados
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-extrabold text-destructive">
                        {confirmados.length.toLocaleString()}
                      </h3>
                    )}
                  </div>
                  <div className="p-2 bg-destructive/10 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Taxa de confirmação</span>
                  <span className="font-semibold text-destructive">
                    {pct(confirmados.length, total)} do total
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Casos em Investigação */}
            <Card className="hover:border-yellow-500/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Casos em Investigação
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-500">
                        {emInvestigacao.length.toLocaleString()}
                      </h3>
                    )}
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-xl">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Aguardando encerramento</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-500">
                    {pct(emInvestigacao.length, total)} do total
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Óbitos */}
            <Card className="hover:border-neutral-500/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Óbitos Confirmados
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-extrabold text-foreground">
                        {obitosConf.length.toLocaleString()}
                      </h3>
                    )}
                  </div>
                  <div className="p-2 bg-neutral-500/10 dark:bg-neutral-500/20 rounded-xl">
                    <Skull className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Evolução para óbito</span>
                  <span className="font-semibold text-foreground">
                    {pct(obitosConf.length, confirmados.length)} dos confirmados
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Letalidade */}
            <Card className="hover:border-red-500/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Taxa de Letalidade
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-extrabold text-destructive">
                        {letalidade}%
                      </h3>
                    )}
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <Skull className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Gravidade no período</span>
                  <span className="font-semibold text-destructive">
                    {obitosConf.length} óbitos em {confirmados.length} conf.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tendência Período */}
            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tendência de Casos
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <h3 className={`text-2xl font-extrabold flex items-center gap-1 ${
                        trendAnalysis.direction === 'up' ? 'text-destructive' : 'text-emerald-500'
                      }`}>
                        {trendAnalysis.direction === 'up' ? '+' : '-'}{trendAnalysis.percent}%
                      </h3>
                    )}
                  </div>
                  <div className={`p-2 rounded-xl ${
                    trendAnalysis.direction === 'up' ? 'bg-destructive/10' : 'bg-emerald-500/10'
                  }`}>
                    {trendAnalysis.direction === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-destructive" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Direção da epidemia</span>
                  <span className={`font-semibold flex items-center gap-0.5 ${
                    trendAnalysis.direction === 'up' ? 'text-destructive' : 'text-emerald-500'
                  }`}>
                    {trendAnalysis.direction === 'up' ? 'Crescimento' : 'Queda'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Municípios de Maior Incidência */}
            <Card className="hover:border-primary/40 transition-colors shadow-sm sm:col-span-2">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Municípios de Maior Incidência (Top 3 Confirmados)
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 bg-muted/40 rounded-xl border border-border/50">
                        <Skeleton className="h-4 w-20 mb-2 animate-pulse" />
                        <Skeleton className="h-6 w-12 animate-pulse" />
                      </div>
                    ))
                  ) : topMunicipios.length === 0 ? (
                    <div className="sm:col-span-3 text-center py-2 text-sm text-muted-foreground">
                      Sem dados de municípios confirmados
                    </div>
                  ) : (
                    topMunicipios.map((mun, idx) => (
                      <div key={mun.name} className="p-3 bg-muted/40 rounded-xl border border-border/50 flex flex-col justify-between hover:bg-muted/60 transition-colors duration-200">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]" title={mun.name}>
                              {mun.name}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-foreground">
                            {mun.count}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {mun.percentage}% do total conf.
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Situação + Desfecho */}
      {!isLoading && total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Situação dos Casos</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm">Encerrados</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{encerrados.length}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({pct(encerrados.length, total)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: pct(encerrados.length, total) }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Em Aberto</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{emInvestigacao.length}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({pct(emInvestigacao.length, total)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: pct(emInvestigacao.length, total) }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Desfecho dos Casos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-green-600" />
                  <span className="text-sm">Altas</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{ALTAS_FIXO}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({pct(ALTAS_FIXO, DESFECHO_TOTAL)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: pct(ALTAS_FIXO, DESFECHO_TOTAL) }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-destructive" />
                  <span className="text-sm">Óbitos</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{OBITOS_FIXO}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({pct(OBITOS_FIXO, DESFECHO_TOTAL)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-destructive h-2 rounded-full"
                  style={{ width: pct(OBITOS_FIXO, DESFECHO_TOTAL) }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span className="text-sm">Internados</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{INTERNADOS_FIXO}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({pct(INTERNADOS_FIXO, DESFECHO_TOTAL)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: pct(INTERNADOS_FIXO, DESFECHO_TOTAL) }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico SE */}
      {!isLoading && total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Notificações por Semana Epidemiológica
              {(seInicio || seFim) && (
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (SE {seInicio || "01"} – SE {seFim || "53"})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seBarData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={seBarData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="se"
                      tick={{ fontSize: 9 }}
                      interval={seBarData.length > 20 ? 3 : 0}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(213,94%,42%)" radius={[3, 3, 0, 0]} name="Notificados">
                      <LabelList dataKey="count" position="top" style={{ fontSize: 9, fill: "hsl(213,94%,42%)" }} />
                    </Bar>
                    <Bar dataKey="confirmados" fill="hsl(0,84%,60%)" radius={[3, 3, 0, 0]} name="Confirmados">
                      <LabelList dataKey="confirmados" position="top" style={{ fontSize: 9, fill: "hsl(0,84%,60%)" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">Pico de Notificações:</strong>{" "}
                    {peakSE ? `SE ${String(peakSE[0]).padStart(2, "0")} com ${peakSE[1]} casos` : "—"}
                  </span>
                  <span>
                    <strong className="text-foreground">Pico de Confirmações:</strong>{" "}
                    {peakConfirmSE
                      ? `SE ${String(peakConfirmSE[0]).padStart(2, "0")} com ${peakConfirmSE[1]} casos`
                      : "—"}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sexo */}
      {!isLoading && confirmados.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Casos Confirmados por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sexoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
                    }
                    labelLine
                  >
                    {sexoData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-3 max-w-xl">
                {sexoTop
                  ? `Entre os casos confirmados, ${sexoTop.name} representa a maior parcela com ${pct(sexoTop.value, confirmados.length)} dos casos. A distribuição por sexo é um indicador relevante para direcionar ações de vigilância e prevenção.`
                  : "Sem dados suficientes para análise."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raça/Cor + Etiologia */}
      {!isLoading && confirmados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Casos Confirmados por Raça/Cor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={racaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="value" name="Confirmados" radius={[4, 4, 0, 0]}>
                    {racaData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                {racaData[0]
                  ? `A raça/cor ${racaData[0].name} concentra o maior número de casos confirmados (${racaData[0].value} casos, ${pct(racaData[0].value, confirmados.length)}), refletindo tanto o perfil populacional da região quanto possíveis desigualdades no acesso à saúde.`
                  : "Sem dados suficientes."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Casos Confirmados por Etiologia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                {etioData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={etioData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ value, percent }) =>
                          `${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
                        }
                        labelLine
                      >
                        {etioData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados de etiologia disponíveis.
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center mt-2 max-w-sm">
                  {etioTop
                    ? `${etioTop.name} é a categoria etiológica predominante (${pct(etioTop.value, confirmados.length)}), sinalizando o perfil de agente etiológico dos casos confirmados no período.`
                    : "Sem dados de etiologia disponíveis."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Faixa Etária + Critério */}
      {!isLoading && confirmados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Casos Confirmados por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={faixaData} layout="vertical" margin={{ top: 4, right: 30, left: 10, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={52} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="value" fill="hsl(213,94%,42%)" radius={[0, 4, 4, 0]} name="Confirmados">
                    <LabelList dataKey="value" position="right" style={{ fontSize: 10 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                {faixaPeak && faixaPeak.value > 0
                  ? `A faixa etária com maior ocorrência de casos confirmados é ${faixaPeak.name} anos (${faixaPeak.value} casos, ${pct(faixaPeak.value, confirmados.length)}), indicando o grupo etário prioritário para intervenções de saúde pública.`
                  : "Sem dados de faixa etária disponíveis."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-foreground">Critério de Confirmação</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {criterioData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
              ) : (
                criterioData.map(([label, count]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({pct(count, criterioTotal)})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: pct(count, criterioTotal) }}
                      />
                    </div>
                  </div>
                ))
              )}
              {criterioData.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  {`O critério "${criterioData[0][0]}" é o mais utilizado para confirmação dos casos (${pct(criterioData[0][1], criterioTotal)}), sinalizando a capacidade diagnóstica laboratorial e clínica da rede de saúde.`}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Casos por Mês */}
      {!isLoading && total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Casos Notificados e Confirmados por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mesData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                    <Legend />
                    <Bar dataKey="notificados" fill="hsl(213,94%,42%)" radius={[3, 3, 0, 0]} name="Notificados">
                      <LabelList dataKey="notificados" position="top" style={{ fontSize: 9, fill: "hsl(213,94%,42%)" }} />
                    </Bar>
                    <Bar dataKey="confirmados" fill="hsl(0,84%,60%)" radius={[3, 3, 0, 0]} name="Confirmados">
                      <LabelList dataKey="confirmados" position="top" style={{ fontSize: 9, fill: "hsl(0,84%,60%)" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  {(() => {
                    const pico = [...mesData].sort((a, b) => b.notificados - a.notificados)[0];
                    const picoConf = [...mesData].sort((a, b) => b.confirmados - a.confirmados)[0];
                    return `O mês de maior notificação foi ${pico.mes} com ${pico.notificados} casos. O mês com mais confirmações foi ${picoConf.mes} com ${picoConf.confirmados} casos confirmados, evidenciando a sazonalidade e a dinâmica de transmissão no período analisado.`;
                  })()}
                </p>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
