import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { insertCase } from "@/lib/offline/db";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderSmartField } from "@/components/smart-fields";
import { AntecedentesEpidemiologicosPanel } from "@/components/antecedentes-epi";
import { DadosClinicosPanel } from "@/components/dados-clinicos";
import {
  SIM_NAO_IGN,
  LOCAL_INICIAL_OCORRENCIA,
  ZONA,
  MODO_TRANSMISSAO,
  VEICULO_TRANSMISSAO,
  CRITERIO_CONFIRMACAO,
  STATUS,
  SINAIS_SINTOMAS_KEYS,
  FATORES_CAUSAIS_KEYS,
} from "@/lib/surto-dta-options";

export const Route = createFileRoute("/_authenticated/nova-ficha/surto-dta")({
  head: () => ({ meta: [{ title: "Nova Ficha de Surto DTA" }] }),
  component: NovaFichaSurtoDtaPage,
});

type Opt = { value: string; label: string };
type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: "sintomas" | "fatores" | "antecedentes_epi" | "dados_clinicos";
};

const STEPS: Step[] = [
  {
    title: "Notificação",
    fields: [
      { name: "numero_ficha", label: "Nº da Notificação", type: "text" },
      { name: "data_notificacao", label: "Data da notificação", type: "date", required: true },
      { name: "semana_epidemiologica", label: "Semana Epidemiológica", type: "text" },
      { name: "data_1os_sintomas_1o_caso", label: "Data dos 1ºs sintomas do 1º caso", type: "date" },
      { name: "uf_notificacao", label: "UF da notificação", type: "text" },
      { name: "municipio_notificacao", label: "Município da notificação", type: "text", required: true },
      { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
      { name: "regional", label: "Regional", type: "text" },
      { name: "macroregiao", label: "Macroregião", type: "text" },
      { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
      { name: "codigo_unidade_saude", label: "Código da unidade", type: "text" },
      { name: "numero_casos_suspeitos", label: "Nº de casos suspeitos", type: "number" },
      { name: "local_inicial_ocorrencia", label: "Local inicial da ocorrência", type: "select", options: LOCAL_INICIAL_OCORRENCIA, col: 2 },
    ],
  },
  {
    title: "Endereço da ocorrência",
    fields: [
      { name: "uf_ocorrencia", label: "UF", type: "text" },
      { name: "municipio_ocorrencia", label: "Município", type: "text" },
      { name: "cep", label: "CEP", type: "text" },
      { name: "bairro", label: "Bairro", type: "text" },
      { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
      { name: "numero_endereco", label: "Número", type: "text" },
      { name: "complemento", label: "Complemento", type: "text" },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "zona", label: "Zona", type: "select", options: ZONA },
    ],
  },
  {
    title: "Investigação epidemiológica",
    fields: [
      { name: "data_investigacao", label: "Data da investigação", type: "date" },
      { name: "modo_transmissao", label: "Modo de transmissão", type: "select", options: MODO_TRANSMISSAO },
      { name: "veiculo_transmissao", label: "Veículo de transmissão", type: "select", options: VEICULO_TRANSMISSAO },
      { name: "numero_entrevistados", label: "Nº de entrevistados", type: "number" },
      { name: "numero_doentes_entrevistados", label: "Nº de doentes entrevistados", type: "number" },
      { name: "numero_total_doentes", label: "Nº total de doentes", type: "number" },
      { name: "numero_total_hospitalizados", label: "Nº total de hospitalizados", type: "number" },
      { name: "numero_obitos", label: "Nº de óbitos", type: "number" },
    ],
  },
  {
    title: "Período de incubação",
    fields: [
      { name: "periodo_incubacao_minimo", label: "Mínimo (horas)", type: "number" },
      { name: "periodo_incubacao_maximo", label: "Máximo (horas)", type: "number" },
      { name: "mediana_periodo_incubacao", label: "Mediana (horas)", type: "number" },
      { name: "local_producao_preparacao", label: "Local de produção/preparação", type: "text", col: 2 },
      { name: "local_ingestao", label: "Local de ingestão", type: "text" },
    ],
  },
  {
    title: "Fatores causais",
    description: "Identifique os fatores que contribuíram para o surto.",
    custom: "fatores",
    fields: [
      { name: "fatores_causais_outros", label: "Outros fatores causais", type: "textarea", col: 3 },
    ],
  },
  {
    title: "Amostras clínicas",
    fields: [
      { name: "coletadas_amostras_clinicas", label: "Coletadas amostras clínicas?", type: "select", options: SIM_NAO_IGN },
      { name: "numero_amostras_clinicas", label: "Nº de amostras clínicas", type: "number" },
      { name: "resultado_clinico_1", label: "Resultado clínico 1", type: "text", col: 3 },
      { name: "resultado_clinico_2", label: "Resultado clínico 2", type: "text", col: 3 },
    ],
  },
  {
    title: "Amostras de alimentos",
    fields: [
      { name: "coletadas_amostras_alimentos", label: "Coletadas amostras de alimentos?", type: "select", options: SIM_NAO_IGN },
      { name: "numero_amostras_alimentos", label: "Nº de amostras de alimentos", type: "number" },
      { name: "resultado_bromatologico_1", label: "Resultado bromatológico", type: "text", col: 3 },
    ],
  },
  {
    title: "Agente e alimento",
    fields: [
      { name: "agente_etiologico", label: "Agente etiológico", type: "text", col: 2 },
      { name: "alimento_causador", label: "Alimento causador", type: "text" },
      { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO, col: 3 },
    ],
  },
  {
    title: "Conclusão",
    fields: [
      { name: "medidas_adotadas", label: "Medidas adotadas", type: "textarea", col: 3 },
      { name: "data_encerramento", label: "Data de encerramento", type: "date" },
      { name: "status", label: "Status", type: "select", options: STATUS },
      { name: "observacoes", label: "Observações", type: "textarea", col: 3 },
      { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
      { name: "funcao_investigador", label: "Função do investigador", type: "text" },
    ],
  },
  { title: "Dados Clínicos", description: "Sinais, sintomas, hospitalização e evolução.", custom: "dados_clinicos" },
  { title: "Antecedentes Epidemiológicos", description: "Doenças pré-existentes e vacinas recebidas.", custom: "antecedentes_epi" },
];

type FormState = Record<string, string>;

const NUMERIC_FIELDS = new Set([
  "numero_casos_suspeitos",
  "numero_entrevistados",
  "numero_doentes_entrevistados",
  "numero_total_doentes",
  "numero_total_hospitalizados",
  "numero_obitos",
  "periodo_incubacao_minimo",
  "periodo_incubacao_maximo",
  "mediana_periodo_incubacao",
  "numero_amostras_clinicas",
  "numero_amostras_alimentos",
]);

function NovaFichaSurtoDtaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    agravo: "surto_dta",
    status: "em_investigacao",
  });
  const [sintomas, setSintomas] = useState<Record<string, string>>({});
  const [fatores, setFatores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const updateField = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validateStep = (): boolean => {
    if (!current.fields) return true;
    for (const f of current.fields) {
      if ("required" in f && f.required && !form[f.name]?.trim()) {
        toast.error(`Preencha: ${f.label}`);
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!form.data_notificacao?.trim() || !form.municipio_notificacao?.trim()) {
      toast.error("Data da notificação e município são obrigatórios.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { user_id: user.id };
      let fatoresOutros = "";
      const sintomasNum: Record<string, number> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        if (k === "fatores_causais_outros") {
          fatoresOutros = v;
          continue;
        }
        if (NUMERIC_FIELDS.has(k)) {
          const n = Number(v);
          if (!Number.isNaN(n)) payload[k] = n;
        } else {
          payload[k] = v;
        }
      }
      for (const [k, v] of Object.entries(sintomas)) {
        if (v === "" || v === undefined) continue;
        const n = Number(v);
        if (!Number.isNaN(n)) sintomasNum[k] = n;
      }
      payload.sinais_sintomas = sintomasNum;
      payload.fatores_causais = { ...fatores, outros: fatoresOutros };

      const { error } = await insertCase("surto_dta_cases", payload as Record<string, unknown>);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: "/fichas/surto-dta" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar ficha");
    } finally {
      setSaving(false);
    }
  };

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/nova-ficha" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nova ficha de Surto DTA</h1>
        <p className="text-sm text-muted-foreground">Surto de Doença Transmitida por Alimentos</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Etapa {step + 1} de {STEPS.length}: <span className="text-foreground font-medium">{current.title}</span></span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        {current.description && (
          <p className="text-sm text-muted-foreground mb-4">{current.description}</p>
        )}

        {current.custom === "sintomas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {SINAIS_SINTOMAS_KEYS.map((it) => (
              <div key={it.key}>
                <Label htmlFor={`sint-${it.key}`} className="text-xs">{it.label}</Label>
                <Input
                  id={`sint-${it.key}`}
                  type="number"
                  min={0}
                  value={sintomas[it.key] ?? ""}
                  onChange={(e) => setSintomas({ ...sintomas, [it.key]: e.target.value })}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        )}

        {current.custom === "fatores" && (
          <div className="grid grid-cols-1 gap-3 mb-4">
            {FATORES_CAUSAIS_KEYS.map((it) => (
              <div key={it.key} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                <span className="text-sm font-medium">{it.label}</span>
                <div className="flex gap-1">
                  {SIM_NAO_IGN.map((o) => {
                    const sel = fatores[it.key] === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setFatores({ ...fatores, [it.key]: o.value })}
                        className={`text-xs px-2.5 py-1 rounded-md border transition ${
                          sel ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {current.fields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {current.fields.map((f) => renderSmartField(f, form, setForm) ?? (
              <FieldRenderer key={f.name} field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />
            ))}
          </div>
        )}
                {current.custom === "dados_clinicos" && (
          <DadosClinicosPanel form={form} setForm={setForm} />
        )}

        {current.custom === "antecedentes_epi" && (
          <AntecedentesEpidemiologicosPanel form={form} setForm={setForm} />
        )}

      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={prev} disabled={step === 0 || saving}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {isLast ? (
          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            Salvar ficha
          </Button>
        ) : (
          <Button type="button" onClick={next} disabled={saving}>
            Próximo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const colClass = field.col === 3 ? "sm:col-span-3" : field.col === 2 ? "sm:col-span-2" : "sm:col-span-1";
  return (
    <div className={colClass}>
      <Label htmlFor={field.name} className="text-xs">
        {field.label}
        {"required" in field && field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "text" || field.type === "number" || field.type === "date" ? (
        <Input id={field.name} type={field.type} value={value} onChange={(e) => onChange(field.type === "text" || field.type === "textarea" ? e.target.value.toUpperCase() : e.target.value)} className="mt-1" />
      ) : field.type === "textarea" ? (
        <Textarea id={field.name} value={value} onChange={(e) => onChange(field.type === "text" || field.type === "textarea" ? e.target.value.toUpperCase() : e.target.value)} rows={3} className="mt-1" />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={field.name} className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
