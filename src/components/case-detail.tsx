import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Children, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2, CheckCircle, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
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

type AnyObj = Record<string, unknown>;
type TableName = keyof Database["public"]["Tables"];

const LABEL_MAP: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  ignorado: "Ignorado",
  masculino: "Masculino",
  feminino: "Feminino",
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
  confirmado: "Confirmado",
  descartado: "Descartado",
  cura: "Cura",
  obito: "Óbito",
  laboratorial: "Laboratorial",
  clinico_epidemiologico: "Clínico-epidemiológico",
  clinico: "Clínico",
  positiva: "Positiva",
  negativa: "Negativa",
  nao_realizada: "Não Realizada",
  urbana: "Urbana",
  rural: "Rural",
  periurbana: "Periurbana",
  branca: "Branca",
  preta: "Preta",
  amarela: "Amarela",
  parda: "Parda",
  indigena: "Indígena",
  anos: "anos",
  meses: "meses",
  dias: "dias",
  horas: "horas",
  individual: "Individual",
  surto: "Surto",
};

const lbl = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v);
  return LABEL_MAP[s] ?? s.replace(/_/g, " ");
};

const humanizeLabel = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bUf\b/g, "UF")
    .replace(/\bCep\b/g, "CEP")
    .replace(/\bIbge\b/g, "IBGE")
    .replace(/\bSus\b/g, "SUS");
};

const isDateField = (k: string) => k.startsWith("data_");

const fmtDate = (d: unknown): string | null => {
  if (!d || typeof d !== "string") return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, "dd/MM/yyyy");
};

const SKIP_KEYS = new Set([
  "id",
  "user_id",
  "created_at",
  "updated_at",
  "agravo",
  "status",
  "nome_paciente",
]);

// Field grouping by prefix/keyword
const SECTIONS: Array<{ title: string; match: (k: string) => boolean }> = [
  {
    title: "Dados Gerais",
    match: (k) =>
      [
        "numero_ficha",
        "tipo_notificacao",
        "data_notificacao",
        "uf_notificacao",
        "municipio_notificacao",
        "codigo_ibge_notificacao",
        "unidade_saude",
        "codigo_unidade_saude",
        "data_primeiros_sintomas",
        "data_investigacao",
      ].includes(k),
  },
  {
    title: "Paciente",
    match: (k) =>
      [
        "data_nascimento",
        "idade",
        "tipo_idade",
        "sexo",
        "gestante",
        "raca_cor",
        "escolaridade",
        "numero_cartao_sus",
        "nome_mae",
        "ocupacao",
      ].includes(k),
  },
  {
    title: "Residência",
    match: (k) =>
      [
        "uf_residencia",
        "municipio_residencia",
        "codigo_ibge_residencia",
        "distrito",
        "bairro",
        "logradouro",
        "numero_endereco",
        "complemento",
        "cep",
        "ponto_referencia",
        "telefone",
        "zona",
        "pais",
      ].includes(k),
  },
  {
    title: "Antecedentes / Vacinação",
    match: (k) =>
      k.startsWith("vacina") ||
      k.startsWith("doses_") ||
      k.startsWith("data_ultima_dose") ||
      k.startsWith("contato_") ||
      k.startsWith("nome_contato") ||
      k.startsWith("endereco_contato") ||
      k.startsWith("antecedente"),
  },
  {
    title: "Hospitalização",
    match: (k) =>
      k.includes("hospital") ||
      k === "data_internacao" ||
      k === "uf_hospital" ||
      k === "municipio_hospital",
  },
  {
    title: "Laboratório",
    match: (k) =>
      k.startsWith("resultado_") ||
      k.startsWith("exame_") ||
      k.startsWith("coleta_") ||
      k.startsWith("data_coleta") ||
      k.startsWith("material_") ||
      k.includes("toxigenicidade") ||
      k.startsWith("provas_"),
  },
  {
    title: "Tratamento",
    match: (k) =>
      k.startsWith("utilizou_") ||
      k.startsWith("antibiotico") ||
      k.startsWith("data_aplicacao") ||
      k.startsWith("data_adm_") ||
      k.startsWith("medidas_") ||
      k.startsWith("quimioprofilaxia") ||
      k.startsWith("tratamento"),
  },
  {
    title: "Investigação Epidemiológica",
    match: (k) =>
      k.startsWith("numero_comunicantes") ||
      k.startsWith("casos_secundarios") ||
      k.startsWith("quantidade_comunicantes") ||
      k.startsWith("portadores_") ||
      k.startsWith("identificacao_"),
  },
  {
    title: "Conclusão",
    match: (k) =>
      k.startsWith("classificacao") ||
      k.startsWith("criterio") ||
      k === "evolucao" ||
      k === "data_obito" ||
      k === "data_encerramento" ||
      k === "doenca_relacionada_trabalho" ||
      k.startsWith("especificacao_"),
  },
  {
    title: "Investigador",
    match: (k) =>
      k.startsWith("nome_investigador") ||
      k.startsWith("funcao_investigador") ||
      k.startsWith("municipio_unidade_investigador") ||
      k.startsWith("codigo_unidade_investigador"),
  },
];

const JSON_SECTIONS: Record<string, string> = {
  sinais_sintomas: "Sinais e Sintomas",
  complicacoes: "Complicações",
  doencas_preexistentes: "Doenças Preexistentes",
  vacinacao: "Vacinação",
  resultados_laboratoriais: "Resultados Laboratoriais",
  exame_quimiocitologico: "Exame Quimiocitológico",
  localizacao_pseudomembrana: "Localização da Pseudomembrana",
  manifestacoes: "Manifestações",
  avaliacao_neurologica: "Avaliação Neurológica",
  exame_fisico: "Exame Físico",
};

function InfoItem({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean" && !value) return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">
        {typeof value === "boolean" ? "Sim" : String(value)}
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const hasContent = Children.toArray(children).some(Boolean);
  if (!hasContent) return null;
  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

function renderField(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const label = humanizeLabel(key);
  if (isDateField(key)) {
    return <InfoItem key={key} label={label} value={fmtDate(value)} />;
  }
  return <InfoItem key={key} label={label} value={lbl(value)} />;
}

export interface CaseDetailProps {
  tableName: TableName;
  agravo: string;
  agravoLabel: string;
  listPath: string;
  id: string;
  /** Extra filter when one table holds multiple agravos */
  agravoColumnValue?: string;
}

export function CaseDetail({
  tableName,
  agravo,
  agravoLabel,
  listPath,
  id,
}: CaseDetailProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryKey = [agravo, "case", id];
  const listKey = [agravo, "cases"];

  const { data: ficha, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as AnyObj | null) ?? null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from(tableName as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
      toast.success("Ficha excluída.");
      navigate({ to: listPath });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from(tableName as never)
        .update({
          status: "encerrado",
          data_encerramento: new Date().toISOString().split("T")[0],
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: listKey });
      toast.success("Caso encerrado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Ficha não encontrada.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to={listPath}>Voltar</Link>
        </Button>
      </div>
    );
  }

  const status = ficha.status as string | undefined;
  const obs = ficha.observacoes_adicionais as string | undefined;

  const allKeys = Object.keys(ficha).filter((k) => !SKIP_KEYS.has(k));

  const jsonGroups: Array<{ title: string; obj: AnyObj }> = [];
  const flatKeys: string[] = [];

  for (const k of allKeys) {
    if (k === "observacoes_adicionais") continue;
    const v = ficha[k];
    if (JSON_SECTIONS[k] && v && typeof v === "object") {
      jsonGroups.push({ title: JSON_SECTIONS[k], obj: v as AnyObj });
    } else {
      flatKeys.push(k);
    }
  }

  const encerDias =
    ficha.data_encerramento && ficha.data_primeiros_sintomas
      ? differenceInDays(
          new Date(ficha.data_encerramento as string),
          new Date(ficha.data_primeiros_sintomas as string),
        )
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to={listPath}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {(ficha.nome_paciente as string) || "(sem nome)"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  {agravoLabel}
                </Badge>
                <Badge
                  variant={status === "encerrado" ? "secondary" : "default"}
                >
                  {lbl(status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {status !== "encerrado" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => encerrarMutation.mutate()}
              disabled={encerrarMutation.isPending}
            >
              <CheckCircle className="w-4 h-4" /> Encerrar
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir ficha?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const keys = flatKeys.filter((k) => section.match(k));
        if (keys.length === 0) return null;
        return (
          <SectionCard key={section.title} title={section.title}>
            <>
              {section.title === "Paciente" ? (
                <InfoItem label="Nome" value={ficha.nome_paciente} />
              ) : null}
              {keys.map((k) => renderField(k, ficha[k]))}
              {section.title === "Conclusão" && encerDias !== null ? (
                <InfoItem label="Encer./Dias" value={String(encerDias)} />
              ) : null}
            </>
          </SectionCard>
        );
      })}

      {/* Outros campos não categorizados */}
      {(() => {
        const used = new Set<string>();
        SECTIONS.forEach((s) => flatKeys.forEach((k) => s.match(k) && used.add(k)));
        const leftover = flatKeys.filter((k) => !used.has(k));
        if (leftover.length === 0) return null;
        return (
          <SectionCard title="Outras Informações">
            <>{leftover.map((k) => renderField(k, ficha[k]))}</>
          </SectionCard>
        );
      })()}

      {jsonGroups.map(({ title, obj }) => (
        <SectionCard key={title} title={title}>
          <>
            {Object.entries(obj).map(([k, v]) =>
              v === null || v === undefined || v === "" ? null : (
                <InfoItem key={k} label={humanizeLabel(k)} value={lbl(v)} />
              ),
            )}
          </>
        </SectionCard>
      ))}

      {obs ? (
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-primary">
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{obs}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
