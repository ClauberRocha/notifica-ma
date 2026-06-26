import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
import { insertCase } from "@/lib/offline/db";
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
  SEXO,
  GESTANTE,
  RACA_COR,
  ZONA,
  USO_ANTIVIRAL,
  RAIO_X,
  SUPORTE_VENTILATORIO,
  TIPO_AMOSTRA,
  RESULTADO_LAB,
  SUBTIPO_INFLUENZA_A,
  CLASSIFICACAO_FINAL,
  CRITERIO_CONFIRMACAO,
  EVOLUCAO,
  STATUS,
  SINAIS_SINTOMAS_KEYS,
  FATORES_RISCO_KEYS,
  DIAG_ETIOLOGICO_KEYS,
} from "@/lib/srag-options";

export const Route = createFileRoute("/_authenticated/nova-ficha/srag")({
  head: () => ({ meta: [{ title: "Nova Ficha de SRAG" }] }),
  component: NovaFichaSragPage,
});

type Opt = { value: string; label: string };
type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: "sintomas" | "fatores" | "diag" | "antecedentes_epi" | "dados_clinicos";
};

const STEPS: Step[] = [
  {
    title: "Notificação",
    fields: [
      { name: "numero_ficha", label: "Nº da ficha", type: "text" },
      { name: "data_preenchimento", label: "Data do preenchimento", type: "date", required: true },
      { name: "data_primeiros_sintomas", label: "Data dos primeiros sintomas", type: "date" },
      { name: "uf_notificacao", label: "UF da notificação", type: "text" },
      { name: "municipio_notificacao", label: "Município da notificação", type: "text" },
      { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
      { name: "regional", label: "Regional", type: "text" },
      { name: "macroregiao", label: "Macroregião", type: "text" },
      { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
      { name: "codigo_cnes", label: "Código CNES", type: "text" },
    ],
  },
  {
    title: "Paciente",
    fields: [
      { name: "nome_paciente", label: "Nome do paciente", type: "text", required: true, col: 2 },
      { name: "data_nascimento", label: "Data de nascimento", type: "date" },
      { name: "idade", label: "Idade", type: "number" },
      { name: "faixa_etaria", label: "Faixa Etária", type: "text" },
      { name: "sexo", label: "Sexo", type: "select", options: SEXO },
      { name: "gestante", label: "Gestante", type: "select", options: GESTANTE },
      { name: "raca_cor", label: "Raça/Cor", type: "select", options: RACA_COR },
      { name: "escolaridade", label: "Escolaridade", type: "text", col: 2 },
      { name: "numero_cartao_sus", label: "Cartão SUS", type: "text" },
      { name: "nome_mae", label: "Nome da mãe", type: "text", col: 2 },
    ],
  },
  {
    title: "Endereço",
    fields: [
      { name: "uf_residencia", label: "UF", type: "text" },
      { name: "municipio_residencia", label: "Município", type: "text" },
      { name: "cep", label: "CEP", type: "text" },
      { name: "bairro", label: "Bairro", type: "text" },
      { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
      { name: "numero_endereco", label: "Número", type: "text" },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "zona", label: "Zona", type: "select", options: ZONA },
    ],
  },
  {
    title: "Vacinação contra gripe",
    fields: [
      { name: "recebeu_vacina_gripe", label: "Recebeu vacina contra gripe?", type: "select", options: SIM_NAO_IGN },
      { name: "data_ultima_dose_vacina", label: "Data da última dose", type: "date" },
    ],
  },
  {
    title: "Fatores de risco",
    description: "Marque os fatores de risco presentes.",
    custom: "fatores",
    fields: [{ name: "imc", label: "IMC", type: "number" }],
  },
  {
    title: "Tratamento",
    fields: [
      { name: "uso_antiviral", label: "Uso de antiviral", type: "select", options: USO_ANTIVIRAL, col: 2 },
      { name: "data_inicio_tratamento", label: "Data de início do tratamento", type: "date" },
    ],
  },
  {
    title: "Internação",
    fields: [
      { name: "ocorreu_internacao", label: "Ocorreu internação?", type: "select", options: SIM_NAO_IGN },
      { name: "data_internacao", label: "Data da internação", type: "date" },
      { name: "uf_hospital", label: "UF do hospital", type: "text" },
      { name: "municipio_hospital", label: "Município do hospital", type: "text" },
      { name: "nome_hospital", label: "Nome do hospital", type: "text", col: 2 },
    ],
  },
  {
    title: "Raio-X e suporte ventilatório",
    fields: [
      { name: "raio_x_torax", label: "Raio-X de tórax", type: "select", options: RAIO_X, col: 2 },
      { name: "data_raio_x", label: "Data do raio-X", type: "date" },
      { name: "suporte_ventilatorio", label: "Suporte ventilatório", type: "select", options: SUPORTE_VENTILATORIO, col: 2 },
    ],
  },
  {
    title: "UTI",
    fields: [
      { name: "internado_uti", label: "Internado em UTI?", type: "select", options: SIM_NAO_IGN },
      { name: "data_entrada_uti", label: "Data de entrada na UTI", type: "date" },
      { name: "data_saida_uti", label: "Data de saída da UTI", type: "date" },
    ],
  },
  {
    title: "Amostra laboratorial",
    fields: [
      { name: "tipo_amostra", label: "Tipo de amostra", type: "select", options: TIPO_AMOSTRA, col: 2 },
      { name: "data_coleta", label: "Data da coleta", type: "date" },
    ],
  },
  {
    title: "Diagnóstico etiológico",
    description: "Resultado dos exames laboratoriais.",
    custom: "diag",
    fields: [
      { name: "subtipo_influenza_a", label: "Subtipo de Influenza A", type: "select", options: SUBTIPO_INFLUENZA_A, col: 3 },
    ],
  },
  {
    title: "Conclusão",
    fields: [
      { name: "classificacao_final", label: "Classificação final", type: "select", options: CLASSIFICACAO_FINAL, col: 2 },
      { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO },
      { name: "evolucao", label: "Evolução", type: "select", options: EVOLUCAO },
      { name: "data_alta_obito", label: "Data de alta/óbito", type: "date" },
      { name: "data_encerramento", label: "Data de encerramento", type: "date" },
      { name: "status", label: "Status", type: "select", options: STATUS },
      { name: "observacoes_adicionais", label: "Observações adicionais", type: "textarea", col: 3 },
      { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
      { name: "funcao_investigador", label: "Função do investigador", type: "text" },
    ],
  },
  { title: "Dados Clínicos", description: "Sinais, sintomas, hospitalização e evolução.", custom: "dados_clinicos" },
  { title: "Antecedentes Epidemiológicos", description: "Doenças pré-existentes e vacinas recebidas.", custom: "antecedentes_epi" },
];

type FormState = Record<string, string>;

const NUMERIC_FIELDS = new Set(["idade", "imc"]);

function NovaFichaSragPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    agravo: "srag_influenza",
    status: "em_investigacao",
  });
  const [sintomas, setSintomas] = useState<Record<string, string>>({});
  const [fatores, setFatores] = useState<Record<string, string>>({});
  const [diag, setDiag] = useState<Record<string, string>>({});
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
    if (!form.nome_paciente?.trim() || !form.data_preenchimento?.trim()) {
      toast.error("Nome do paciente e data do preenchimento são obrigatórios.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { user_id: user.id };
      const fatoresPayload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        if (k === "imc") {
          const n = Number(v);
          if (!Number.isNaN(n)) fatoresPayload.imc = n;
          continue;
        }
        if (NUMERIC_FIELDS.has(k)) {
          const n = Number(v);
          if (!Number.isNaN(n)) payload[k] = n;
        } else {
          payload[k] = v;
        }
      }
      payload.sinais_sintomas = sintomas;
      payload.fatores_risco = { ...fatores, ...fatoresPayload };
      payload.diagnostico_etiologico = diag;

      const { error } = await insertCase("srag_cases", payload as Record<string, unknown>);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: "/fichas/srag" });
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
        <h1 className="text-2xl font-bold mt-2">Nova ficha de SRAG</h1>
        <p className="text-sm text-muted-foreground">Síndrome Respiratória Aguda Grave / Influenza</p>
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
          <SimNaoGrid items={SINAIS_SINTOMAS_KEYS} values={sintomas} onChange={setSintomas} />
        )}
        {current.custom === "fatores" && (
          <div className="mb-4">
            <SimNaoGrid items={FATORES_RISCO_KEYS} values={fatores} onChange={setFatores} />
          </div>
        )}
        {current.custom === "diag" && (
          <div className="space-y-3 mb-4">
            {DIAG_ETIOLOGICO_KEYS.map((it) => (
              <div key={it.key}>
                <Label className="text-xs">{it.label}</Label>
                <Select
                  value={diag[it.key] || undefined}
                  onValueChange={(v) => setDiag({ ...diag, [it.key]: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {RESULTADO_LAB.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

function SimNaoGrid({
  items,
  values,
  onChange,
}: {
  items: readonly { key: string; label: string }[];
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.key} className="flex items-center justify-between gap-3 border rounded-lg p-3">
          <span className="text-sm font-medium">{it.label}</span>
          <div className="flex gap-1">
            {SIM_NAO_IGN.map((o) => {
              const sel = values[it.key] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ ...values, [it.key]: o.value })}
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
  );
}
