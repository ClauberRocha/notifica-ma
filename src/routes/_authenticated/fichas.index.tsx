import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bug,
  Syringe,
  Trash2,
  Printer,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/fichas/")({
  head: () => ({ meta: [{ title: "Fichas de Investigação" }] }),
  component: FichasListPage,
});

const PAGE_SIZES = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

type AgravoDef = {
  table: string;
  slug: string;
  tipo: string;
  label: string;
  dateField: string;
  listPath:
    | "/fichas/coqueluche"
    | "/fichas/dengue"
    | "/fichas/chikungunya"
    | "/fichas/difteria"
    | "/fichas/epizootia"
    | "/fichas/sarampo"
    | "/fichas/rubeola"
    | "/fichas/febre-amarela"
    | "/fichas/hanseniase"
    
    | "/fichas/outras-meningites"
    | "/fichas/raiva-humana"
    | "/fichas/srag"
    | "/fichas/surto-dta"
    | "/fichas/tetano-acidental"
    | "/fichas/tetano-neonatal"
    | "/fichas/tuberculose";
};

const AGRAVOS: AgravoDef[] = [
  { table: "coqueluche_cases", slug: "coqueluche", tipo: "coqueluche", label: "Coqueluche", dateField: "data_notificacao", listPath: "/fichas/coqueluche" },
  { table: "dengue_chikungunya_cases", slug: "dengue", tipo: "dengue", label: "Dengue/Chikungunya", dateField: "data_notificacao", listPath: "/fichas/dengue" },
  { table: "difteria_cases", slug: "difteria", tipo: "difteria", label: "Difteria", dateField: "data_notificacao", listPath: "/fichas/difteria" },
  { table: "epizootia_cases", slug: "epizootia", tipo: "epizootia", label: "Epizootia", dateField: "data_notificacao", listPath: "/fichas/epizootia" },
  { table: "exantematica_cases", slug: "sarampo", tipo: "sarampo", label: "Sarampo/Rubéola", dateField: "data_notificacao", listPath: "/fichas/sarampo" },
  { table: "febre_amarela_cases", slug: "febre-amarela", tipo: "febre_amarela", label: "Febre Amarela", dateField: "data_notificacao", listPath: "/fichas/febre-amarela" },
  { table: "hanseniase_cases", slug: "hanseniase", tipo: "hanseniase", label: "Hanseníase", dateField: "data_notificacao", listPath: "/fichas/hanseniase" },
  { table: "meningite_cases", slug: "doenca-meningococica", tipo: "meningite", label: "Meningite", dateField: "data_notificacao", listPath: "/fichas/doenca-meningococica" },
  { table: "raiva_humana_cases", slug: "raiva-humana", tipo: "raiva_humana", label: "Raiva Humana", dateField: "data_notificacao", listPath: "/fichas/raiva-humana" },
  { table: "srag_cases", slug: "srag", tipo: "srag_influenza", label: "SRAG/Influenza", dateField: "data_preenchimento", listPath: "/fichas/srag" },
  { table: "surto_dta_cases", slug: "surto-dta", tipo: "surto_dta", label: "Surto DTA", dateField: "data_notificacao", listPath: "/fichas/surto-dta" },
  { table: "tetano_acidental_cases", slug: "tetano-acidental", tipo: "tetano_acidental", label: "Tétano Acidental", dateField: "data_notificacao", listPath: "/fichas/tetano-acidental" },
  { table: "tetano_neonatal_cases", slug: "tetano-neonatal", tipo: "tetano_neonatal", label: "Tétano Neonatal", dateField: "data_notificacao", listPath: "/fichas/tetano-neonatal" },
  { table: "tuberculose_cases", slug: "tuberculose", tipo: "tuberculose", label: "Tuberculose", dateField: "data_notificacao", listPath: "/fichas/tuberculose" },
];

const ICON_BY_TIPO: Record<
  string,
  { icon: typeof Shield; color: string; bg: string }
> = {
  meningite: { icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  coqueluche: { icon: Bug, color: "text-fuchsia-600", bg: "bg-fuchsia-500/10" },
  difteria: { icon: Syringe, color: "text-amber-600", bg: "bg-amber-500/10" },
};

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string | null;
  municipio_notificacao: string | null;
  data_notificacao: string | null;
  status: string | null;
  created_at: string | null;
  _tipo: string;
  _slug: string;
  _label: string;
  _table: string;
  _listPath: AgravoDef["listPath"];
};

async function fetchAll(): Promise<CaseRow[]> {
  const results = await Promise.all(
    AGRAVOS.map(async (a) => {
      const { data, error } = await supabase
        .from(a.table as never)
        .select(
          `id, numero_ficha, nome_paciente, municipio_notificacao, status, created_at, ${a.dateField}`,
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return [];
      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        numero_ficha: (r.numero_ficha as string) ?? null,
        nome_paciente: (r.nome_paciente as string) ?? null,
        municipio_notificacao: (r.municipio_notificacao as string) ?? null,
        status: (r.status as string) ?? null,
        created_at: (r.created_at as string) ?? null,
        data_notificacao: (r[a.dateField] as string) ?? null,
        _tipo: a.tipo,
        _slug: a.slug,
        _label: a.label,
        _table: a.table,
        _listPath: a.listPath,
      }));
    }),
  );
  return results.flat();
}

function printFicha(caso: CaseRow) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = Object.entries(caso)
    .filter(([k]) => !k.startsWith("_") && k !== "id")
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const val =
        v === null || v === undefined
          ? "—"
          : typeof v === "object"
            ? JSON.stringify(v)
            : String(v);
      return `<tr><td style="padding:6px 10px;font-weight:600;border:1px solid #ddd;width:35%">${label}</td><td style="padding:6px 10px;border:1px solid #ddd">${val}</td></tr>`;
    })
    .join("");
  w.document.write(`<html><head><title>Ficha — ${caso.nome_paciente || caso.id}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}h2{text-align:center;margin-bottom:16px}</style></head>
<body><h2>Ficha de Investigação — ${caso._label}</h2><table>${rows}</table>
<script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

function FichasListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: allCases = [], isLoading } = useQuery({
    queryKey: ["fichas-all"],
    queryFn: fetchAll,
  });

  const [search, setSearch] = useState("");
  const [agravoFilter, setAgravoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const sorted = [...allCases].sort((a, b) => {
    const da = new Date(a.data_notificacao || a.created_at || 0).getTime();
    const db = new Date(b.data_notificacao || b.created_at || 0).getTime();
    return dateSort === "desc" ? db - da : da - db;
  });

  const filtered = sorted.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.nome_paciente?.toLowerCase().includes(q) ?? false) ||
      (c.municipio_notificacao?.toLowerCase().includes(q) ?? false);
    const matchAgravo = agravoFilter === "all" || c._tipo === agravoFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchAgravo && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  async function handleDelete(caso: CaseRow) {
    const { error } = await supabase
      .from(caso._table as never)
      .delete()
      .eq("id", caso.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ficha excluída.");
    queryClient.invalidateQueries({ queryKey: ["fichas-all"] });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fichas de Investigação
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} registro(s)
          </p>
        </div>
        <Link to="/nova-ficha">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Nova Ficha
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou município..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10 h-10"
          />
        </div>
        <Select
          value={agravoFilter}
          onValueChange={(v) => {
            setAgravoFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-52 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os agravos</SelectItem>
            {AGRAVOS.map((a) => (
              <SelectItem key={a.tipo} value={a.tipo}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="em_investigacao">Em Aberto</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            setPageSize(Number(v));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-32 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} / página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={dateSort}
          onValueChange={(v) => setDateSort(v as "asc" | "desc")}
        >
          <SelectTrigger className="w-48 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais recentes primeiro</SelectItem>
            <SelectItem value="asc">Mais antigas primeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Paciente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Agravo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Município
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Data Notif.
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Nº Ficha
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nenhuma ficha encontrada.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const iconInfo =
                    ICON_BY_TIPO[c._tipo] ?? {
                      icon: Shield,
                      color: "text-muted-foreground",
                      bg: "bg-muted",
                    };
                  const IconComp = iconInfo.icon;
                  return (
                    <tr
                      key={`${c._tipo}-${c.id}`}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${iconInfo.color}`} />
                          </div>
                          <span className="font-medium">
                            {c.nome_paciente || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {c._label}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {c.municipio_notificacao || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.data_notificacao
                          ? format(new Date(c.data_notificacao), "dd/MM/yyyy")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        {c.numero_ficha || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            c.status === "encerrado"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 border"
                              : "bg-amber-500/10 text-amber-700 border-amber-500/20 border"
                          }
                        >
                          {c.status === "em_investigacao"
                            ? "Em Aberto"
                            : c.status === "encerrado"
                              ? "Encerrado"
                              : c.status || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ver lista do agravo"
                            aria-label="Ver lista do agravo"
                            onClick={() => navigate({ to: c._listPath })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            title="Imprimir"
                            aria-label="Imprimir ficha"
                            onClick={() => printFicha(c)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                title="Excluir"
                                aria-label="Excluir ficha"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Ficha</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a ficha de{" "}
                                  <strong>
                                    {c.nome_paciente || "este paciente"}
                                  </strong>
                                  ? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(c)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
