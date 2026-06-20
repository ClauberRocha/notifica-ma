import { Link, useNavigate } from "@tanstack/react-router";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderSmartField } from "@/components/smart-fields";
import {
  SIM_NAO,
  SIM_NAO_IGN,
  TIPO_IDADE,
  SEXO,
  GESTANTE,
  RACA_COR,
  ESCOLARIDADE,
  ZONA,
  RESULTADO_SOROLOGIA_CHIK,
  RESULTADO_EXAME,
  SOROTIPO,
  CLASSIFICACAO,
  CRITERIO_CONFIRMACAO,
  CASO_AUTOCTONE,
  EVOLUCAO,
  STATUS,
  SINAIS_CLINICOS_KEYS,
  DOENCAS_PREEXISTENTES_KEYS,
} from "@/lib/dengue-chik-options";

type Opt = { value: string; label: string };

type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: "sinais" | "doencas" | "antecedentes_epi";
};

function buildSteps(agravo: "dengue" | "chikungunya"): Step[] {
  const isDengue = agravo === "dengue";
  const labLab: FieldDef[] = isDengue
    ? [
        { name: "sorologia_dengue_data", label: "Sorologia dengue — data", type: "date" },
        { name: "sorologia_dengue_resultado", label: "Sorologia dengue — resultado", type: "select", options: RESULTADO_EXAME },
        { name: "ns1_data", label: "NS1 — data", type: "date" },
        { name: "ns1_resultado", label: "NS1 — resultado", type: "select", options: RESULTADO_EXAME },
        { name: "rt_pcr_data", label: "RT-PCR — data", type: "date" },
        { name: "rt_pcr_resultado", label: "RT-PCR — resultado", type: "select", options: RESULTADO_EXAME },
        { name: "sorotipo", label: "Sorotipo", type: "select", options: SOROTIPO },
      ]
    : [
        { name: "sorologia_chikungunya_s1_data", label: "Sorologia S1 — data", type: "date" },
        { name: "sorologia_chikungunya_resultado_s1", label: "Sorologia S1 — resultado", type: "select", options: RESULTADO_SOROLOGIA_CHIK },
        { name: "sorologia_chikungunya_s2_data", label: "Sorologia S2 — data", type: "date" },
        { name: "sorologia_chikungunya_resultado_s2", label: "Sorologia S2 — resultado", type: "select", options: RESULTADO_SOROLOGIA_CHIK },
        { name: "rt_pcr_data", label: "RT-PCR — data", type: "date" },
        { name: "rt_pcr_resultado", label: "RT-PCR — resultado", type: "select", options: RESULTADO_EXAME },
      ];

  const conclusao: FieldDef[] = isDengue
    ? [
        { name: "dengue_sinais_alarme", label: "Dengue com sinais de alarme?", type: "select", options: SIM_NAO },
        { name: "dengue_grave", label: "Dengue grave?", type: "select", options: SIM_NAO },
        { name: "classificacao", label: "Classificação", type: "select", options: CLASSIFICACAO },
        { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO },
        { name: "caso_autoctone", label: "Caso autóctone", type: "select", options: CASO_AUTOCTONE },
        { name: "evolucao", label: "Evolução", type: "select", options: EVOLUCAO },
        { name: "data_obito", label: "Data do óbito", type: "date" },
        { name: "data_encerramento", label: "Data de encerramento", type: "date" },
        { name: "status", label: "Status", type: "select", options: STATUS },
        { name: "observacoes_adicionais", label: "Observações adicionais", type: "textarea", col: 3 },
        { name: "municipio_unidade_investigador", label: "Município da unidade do investigador", type: "text", col: 2 },
        { name: "codigo_unidade_investigador", label: "Código da unidade do investigador", type: "text" },
        { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
        { name: "funcao_investigador", label: "Função do investigador", type: "text" },
      ]
    : [
        { name: "classificacao", label: "Classificação", type: "select", options: CLASSIFICACAO },
        { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO },
        { name: "caso_autoctone", label: "Caso autóctone", type: "select", options: CASO_AUTOCTONE },
        { name: "evolucao", label: "Evolução", type: "select", options: EVOLUCAO },
        { name: "data_obito", label: "Data do óbito", type: "date" },
        { name: "data_encerramento", label: "Data de encerramento", type: "date" },
        { name: "status", label: "Status", type: "select", options: STATUS },
        { name: "observacoes_adicionais", label: "Observações adicionais", type: "textarea", col: 3 },
        { name: "municipio_unidade_investigador", label: "Município da unidade do investigador", type: "text", col: 2 },
        { name: "codigo_unidade_investigador", label: "Código da unidade do investigador", type: "text" },
        { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
        { name: "funcao_investigador", label: "Função do investigador", type: "text" },
      ];

  return [
    {
      title: "Notificação",
      description: "Dados da notificação e unidade.",
      fields: [
        { name: "numero_ficha", label: "Nº da ficha", type: "text" },
        { name: "data_notificacao", label: "Data da notificação", type: "date", required: true },
        { name: "semana_epidemiologica", label: "Semana Epidemiológica", type: "text" },
        { name: "data_primeiros_sintomas", label: "Data dos primeiros sintomas", type: "date" },
        { name: "uf_notificacao", label: "UF da notificação", type: "text" },
        { name: "municipio_notificacao", label: "Município da notificação", type: "text" },
        { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
        { name: "regional", label: "Regional", type: "text" },
        { name: "macroregiao", label: "Macroregião", type: "text" },
        { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
        { name: "codigo_unidade_saude", label: "Código da unidade", type: "text" },
      ],
    },
    {
      title: "Paciente",
      description: "Identificação do paciente.",
      fields: [
        { name: "nome_paciente", label: "Nome do paciente", type: "text", required: true, col: 2 },
        { name: "data_nascimento", label: "Data de nascimento", type: "date" },
        { name: "idade", label: "Idade", type: "number" },
        { name: "faixa_etaria", label: "Faixa Etária", type: "text" },
        { name: "tipo_idade", label: "Tipo de idade", type: "select", options: TIPO_IDADE },
        { name: "sexo", label: "Sexo", type: "select", options: SEXO },
        { name: "gestante", label: "Gestante", type: "select", options: GESTANTE },
        { name: "raca_cor", label: "Raça/Cor", type: "select", options: RACA_COR },
        { name: "escolaridade", label: "Escolaridade", type: "select", options: ESCOLARIDADE, col: 2 },
        { name: "numero_cartao_sus", label: "Cartão SUS", type: "text" },
        { name: "nome_mae", label: "Nome da mãe", type: "text", col: 2 },
      ],
    },
    {
      title: "Endereço",
      description: "Residência do paciente.",
      fields: [
        { name: "uf_residencia", label: "UF", type: "text" },
        { name: "municipio_residencia", label: "Município", type: "text" },
        { name: "bairro", label: "Bairro", type: "text" },
        { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
        { name: "numero_endereco", label: "Número", type: "text" },
        { name: "cep", label: "CEP", type: "text" },
        { name: "telefone", label: "Telefone", type: "text" },
        { name: "zona", label: "Zona", type: "select", options: ZONA },
      ],
    },
    {
      title: "Investigação",
      fields: [
        { name: "data_investigacao", label: "Data da investigação", type: "date" },
        { name: "ocupacao", label: "Ocupação", type: "text", col: 2 },
      ],
    },
    { title: "Sinais clínicos", description: "Marque a presença de cada sinal.", custom: "sinais" },
    { title: "Doenças preexistentes", description: "Marque as doenças preexistentes.", custom: "doencas" },
    { title: "Antecedentes Epidemiológicos", description: "Doenças pré-existentes e vacinas recebidas.", custom: "antecedentes_epi" },
    { title: "Laboratório", description: "Resultados de exames.", fields: labLab },
    {
      title: "Hospitalização",
      fields: [
        { name: "ocorreu_hospitalizacao", label: "Houve hospitalização?", type: "select", options: SIM_NAO_IGN },
        { name: "data_internacao", label: "Data da internação", type: "date" },
        { name: "uf_hospital", label: "UF do hospital", type: "text" },
        { name: "municipio_hospital", label: "Município do hospital", type: "text" },
        { name: "nome_hospital", label: "Nome do hospital", type: "text", col: 2 },
      ],
    },
    { title: "Conclusão", description: "Classificação e encerramento.", fields: conclusao },
  ];
}

type FormState = Record<string, string>;

export function DengueChikForm({
  agravo,
  backTo,
  redirectTo,
  title,
}: {
  agravo: "dengue" | "chikungunya";
  backTo: string;
  redirectTo: string;
  title: string;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const STEPS = useMemo(() => buildSteps(agravo), [agravo]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ status: "em_investigacao" });
  const [sinais, setSinais] = useState<Record<string, string>>({});
  const [doencas, setDoencas] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const updateField = (name: string, value: string) => setForm((p) => ({ ...p, [name]: value }));

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
    if (!form.nome_paciente?.trim() || !form.data_notificacao?.trim()) {
      toast.error("Nome do paciente e data da notificação são obrigatórios.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { user_id: user.id, agravo };
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        if (k === "idade") {
          const n = Number(v);
          if (!Number.isNaN(n)) payload[k] = n;
        } else {
          payload[k] = v;
        }
      }
      payload.sinais_clinicos = sinais;
      payload.doencas_preexistentes = doencas;

      const { error } = await supabase
        .from("dengue_chikungunya_cases")
        .insert(payload as never);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: redirectTo });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar ficha");
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={backTo} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mt-2">{title}</h1>
        <p className="text-sm text-muted-foreground">Notificação individual</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            Etapa {step + 1} de {STEPS.length}: <span className="text-foreground font-medium">{current.title}</span>
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        {current.description && <p className="text-sm text-muted-foreground mb-4">{current.description}</p>}

        {current.fields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {current.fields.map((f) => renderSmartField(f, form, setForm) ?? (
              <FieldRenderer key={f.name} field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />
            ))}
          </div>
        )}

        {current.custom === "sinais" && <SimNaoGrid items={SINAIS_CLINICOS_KEYS} values={sinais} onChange={setSinais} />}
        {current.custom === "doencas" && <SimNaoGrid items={DOENCAS_PREEXISTENTES_KEYS} values={doencas} onChange={setDoencas} />}
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
          <SelectTrigger id={field.name} className="mt-1">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
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
            {SIM_NAO.map((o) => {
              const selected = values[it.key] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ ...values, [it.key]: o.value })}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    selected ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
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
