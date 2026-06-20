import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Children, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2, CheckCircle } from "lucide-react";
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

export const Route = createFileRoute(
  "/_authenticated/fichas/doenca-meningococica/$id",
)({
  head: () => ({ meta: [{ title: "Detalhes da Ficha — Meningite" }] }),
  component: FichaDetalhesPage,
});

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
  obito_outras_causas: "Óbito por outras causas",
  ignorado_evolucao: "Ignorado",
  anos: "anos",
  meses: "meses",
  dias: "dias",
  horas: "horas",
  urbana: "Urbana",
  rural: "Rural",
  periurbana: "Periurbana",
};

const lbl = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v);
  return LABEL_MAP[s] ?? s;
};

function InfoItem({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{lbl(value)}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const hasContent = Children.toArray(children).some(Boolean);
  if (!hasContent) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

type AnyObj = Record<string, unknown>;

const asObj = (v: unknown): AnyObj => (v && typeof v === "object" ? (v as AnyObj) : {});

function fmtDate(d: unknown): string | null {
  if (!d || typeof d !== "string") return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, "dd/MM/yyyy");
}

function FichaDetalhesPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ficha, isLoading } = useQuery({
    queryKey: ["meningite-case", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meningite_cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as AnyObj | null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("meningite_cases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meningite-cases"] });
      toast.success("Ficha excluída.");
      navigate({ to: "/fichas/doenca-meningococica" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("meningite_cases")
        .update({
          status: "encerrado",
          data_encerramento: new Date().toISOString().split("T")[0],
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meningite-case", id] });
      queryClient.invalidateQueries({ queryKey: ["meningite-cases"] });
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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/fichas/doenca-meningococica" })}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const sinais = asObj(ficha.sinais_sintomas);
  const doencas = asObj(ficha.doencas_preexistentes);
  const quimio = asObj(ficha.exame_quimiocitologico);

  const encerDias =
    ficha.data_encerramento && ficha.data_primeiros_sintomas
      ? differenceInDays(
          new Date(ficha.data_encerramento as string),
          new Date(ficha.data_primeiros_sintomas as string),
        )
      : null;
  const prazo =
    encerDias === null
      ? null
      : encerDias <= 30
        ? "Até 30 dias"
        : encerDias <= 60
          ? "Até 60 dias"
          : "Mais de 60 dias";

  const status = ficha.status as string | undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: "/fichas/doenca-meningococica" })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {(ficha.nome_paciente as string) || "(sem nome)"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  status === "encerrado"
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 border"
                    : "bg-amber-500/10 text-amber-700 border-amber-500/20 border"
                }
              >
                {lbl(status)}
              </Badge>
              {ficha.classificacao_caso ? (
                <Badge variant="outline">{lbl(ficha.classificacao_caso)}</Badge>
              ) : null}
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

      <SectionCard title="Dados Gerais">
        <InfoItem label="Agravo" value={ficha.agravo} />
        <InfoItem label="Data Notificação" value={fmtDate(ficha.data_notificacao)} />
        <InfoItem label="UF" value={ficha.uf_notificacao} />
        <InfoItem label="Município" value={ficha.municipio_notificacao} />
        <InfoItem label="Unidade de Saúde" value={ficha.unidade_saude} />
        <InfoItem
          label="Data Primeiros Sintomas"
          value={fmtDate(ficha.data_primeiros_sintomas)}
        />
        <InfoItem label="Nº Ficha" value={ficha.numero_ficha} />
      </SectionCard>

      <SectionCard title="Paciente">
        <InfoItem label="Nome" value={ficha.nome_paciente} />
        <InfoItem label="Data Nascimento" value={fmtDate(ficha.data_nascimento)} />
        <InfoItem
          label="Idade"
          value={
            ficha.idade
              ? `${ficha.idade} ${lbl(ficha.tipo_idade)}`.trim()
              : null
          }
        />
        <InfoItem label="Sexo" value={ficha.sexo} />
        <InfoItem label="Raça/Cor" value={ficha.raca_cor} />
        <InfoItem label="Nome da Mãe" value={ficha.nome_mae} />
        <InfoItem label="Cartão SUS" value={ficha.numero_cartao_sus} />
      </SectionCard>

      <SectionCard title="Residência">
        <InfoItem label="UF" value={ficha.uf_residencia} />
        <InfoItem label="Município" value={ficha.municipio_residencia} />
        <InfoItem label="Bairro" value={ficha.bairro} />
        <InfoItem label="Logradouro" value={ficha.logradouro} />
        <InfoItem label="Número" value={ficha.numero_endereco} />
        <InfoItem label="CEP" value={ficha.cep} />
        <InfoItem label="Telefone" value={ficha.telefone} />
        <InfoItem label="Zona" value={ficha.zona} />
      </SectionCard>

      <SectionCard title="Sinais e Sintomas">
        <InfoItem label="Cefaleia" value={sinais.cefaleia} />
        <InfoItem label="Febre" value={sinais.febre} />
        <InfoItem label="Vômitos" value={sinais.vomitos} />
        <InfoItem label="Convulsões" value={sinais.convulsoes} />
        <InfoItem label="Rigidez de Nuca" value={sinais.rigidez_nuca} />
        <InfoItem label="Kernig/Brudzinski" value={sinais.kernig_brudzinski} />
        <InfoItem
          label="Abaulamento Fontanela"
          value={sinais.abaulamento_fontanela}
        />
        <InfoItem label="Petéquias/Sufusões" value={sinais.petequias_sufusoes} />
        <InfoItem label="Coma" value={sinais.coma} />
      </SectionCard>

      <SectionCard title="Doenças Pré-existentes">
        <InfoItem label="AIDS/HIV+" value={doencas.aids_hiv} />
        <InfoItem
          label="Outras Imunodepressoras"
          value={doencas.outras_imunodepressoras}
        />
        <InfoItem label="IRA" value={doencas.ira} />
        <InfoItem label="Tuberculose" value={doencas.tuberculose} />
        <InfoItem label="Traumatismo" value={doencas.traumatismo} />
        <InfoItem
          label="Infecção Hospitalar"
          value={doencas.infeccao_hospitalar}
        />
      </SectionCard>

      {ficha.ocorreu_hospitalizacao === "sim" && (
        <SectionCard title="Hospitalização">
          <InfoItem label="Data Internação" value={fmtDate(ficha.data_internacao)} />
          <InfoItem label="UF Hospital" value={ficha.uf_hospital} />
          <InfoItem label="Município" value={ficha.municipio_hospital} />
          <InfoItem label="Nome do Hospital" value={ficha.nome_hospital} />
        </SectionCard>
      )}

      <SectionCard title="Exame Quimiocitológico">
        <InfoItem
          label="Hemácias"
          value={quimio.hemacias ? `${quimio.hemacias} mm³` : null}
        />
        <InfoItem
          label="Leucócitos"
          value={quimio.leucocitos ? `${quimio.leucocitos} mm³` : null}
        />
        <InfoItem
          label="Monócitos"
          value={quimio.monocitos ? `${quimio.monocitos}%` : null}
        />
        <InfoItem
          label="Neutrófilos"
          value={quimio.neutrofilos ? `${quimio.neutrofilos}%` : null}
        />
        <InfoItem
          label="Linfócitos"
          value={quimio.linfocitos ? `${quimio.linfocitos}%` : null}
        />
        <InfoItem
          label="Glicose"
          value={quimio.glicose ? `${quimio.glicose} mg` : null}
        />
        <InfoItem
          label="Proteínas"
          value={quimio.proteinas ? `${quimio.proteinas} mg` : null}
        />
        <InfoItem
          label="Cloreto"
          value={quimio.cloreto ? `${quimio.cloreto} mg` : null}
        />
      </SectionCard>

      <SectionCard title="Classificação / Conclusão">
        <InfoItem label="Status" value={status} />
        <InfoItem label="Classificação" value={ficha.classificacao_caso} />
        <InfoItem label="Evolução" value={ficha.evolucao_caso} />
        <InfoItem label="Data Evolução" value={fmtDate(ficha.data_evolucao)} />
        <InfoItem
          label="Data Encerramento"
          value={fmtDate(ficha.data_encerramento)}
        />
        {encerDias !== null && (
          <InfoItem label="Encer./Dias" value={String(encerDias)} />
        )}
        {prazo && <InfoItem label="Prazo" value={prazo} />}
        <InfoItem
          label="Critério Confirmação"
          value={ficha.criterio_confirmacao}
        />
        <InfoItem label="Sorogrupo" value={ficha.sorogrupo_meningitidis} />
        <InfoItem label="Nº Comunicantes" value={ficha.numero_comunicantes} />
        <InfoItem
          label="Quimioprofilaxia"
          value={ficha.quimioprofilaxia_comunicantes}
        />
      </SectionCard>

      {ficha.observacoes_adicionais ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {String(ficha.observacoes_adicionais)}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
