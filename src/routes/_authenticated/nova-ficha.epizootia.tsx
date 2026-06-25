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
import { Checkbox } from "@/components/ui/checkbox";
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
  ZONA,
  AMBIENTE,
  SIM_NAO_IGN,
  TIPO_ANIMAL,
  SUSPEITA,
  RESULTADO_LAB,
  STATUS,
  MATERIAL_KEYS,
  RESULTADO_KEYS,
} from "@/lib/epizootia-options";

export const Route = createFileRoute("/_authenticated/nova-ficha/epizootia")({
  head: () => ({ meta: [{ title: "Nova Ficha de Epizootia" }] }),
  component: NovaFichaEpizootiaPage,
});

type Opt = { value: string; label: string };
type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: "material" | "animais" | "suspeita" | "resultado" | "antecedentes_epi" | "dados_clinicos";
};

const STEPS: Step[] = [
  {
    title: "Notificação",
    fields: [
      { name: "numero_ficha", label: "Nº da ficha", type: "text" },
      { name: "data_notificacao", label: "Data da notificação", type: "date", required: true },
      { name: "semana_epidemiologica", label: "Semana Epidemiológica", type: "text" },
      { name: "data_inicio_epizootia", label: "Início da epizootia", type: "date" },
      { name: "uf_notificacao", label: "UF da notificação", type: "text" },
      { name: "municipio_notificacao", label: "Município da notificação", type: "text", required: true },
      { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
      { name: "regional", label: "Regional", type: "text" },
      { name: "macroregiao", label: "Macroregião", type: "text" },
      { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
      { name: "codigo_unidade_saude", label: "Código da unidade", type: "text" },
      { name: "fonte_informacao", label: "Fonte da informação", type: "text", col: 2 },
      { name: "telefone_fonte", label: "Telefone da fonte", type: "text" },
    ],
  },
  {
    title: "Ocorrência",
    description: "Local da epizootia.",
    fields: [
      { name: "uf_ocorrencia", label: "UF", type: "text" },
      { name: "municipio_ocorrencia", label: "Município", type: "text" },
      { name: "codigo_ibge_ocorrencia", label: "Código IBGE", type: "text" },
      { name: "cep", label: "CEP", type: "text" },
      { name: "distrito", label: "Distrito", type: "text" },
      { name: "bairro", label: "Bairro", type: "text" },
      { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
      { name: "numero_endereco", label: "Número", type: "text" },
      { name: "complemento", label: "Complemento", type: "text" },
      { name: "ponto_referencia", label: "Ponto de referência", type: "text", col: 2 },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "geocampo1", label: "Geocampo 1", type: "text" },
      { name: "geocampo2", label: "Geocampo 2", type: "text" },
      { name: "zona", label: "Zona", type: "select", options: ZONA },
      { name: "ambiente", label: "Ambiente", type: "select", options: AMBIENTE, col: 2 },
    ],
  },
  { title: "Animais acometidos", custom: "animais" },
  { title: "Suspeita diagnóstica", custom: "suspeita" },
  {
    title: "Coleta de material",
    fields: [
      { name: "houve_coleta", label: "Houve coleta?", type: "select", options: SIM_NAO_IGN },
      { name: "data_coleta", label: "Data da coleta", type: "date" },
    ],
    custom: "material",
  },
  { title: "Resultado laboratorial", custom: "resultado" },
  {
    title: "Conclusão",
    fields: [
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

function NovaFichaEpizootiaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    tipo_notificacao: "individual",
    agravo: "epizootia",
    status: "em_investigacao",
  });
  const [material, setMaterial] = useState<Record<string, boolean>>({});
  const [materialOutro, setMaterialOutro] = useState("");
  const [animais, setAnimais] = useState<{ tipo: string; especificar: string; doentes: string; mortos: string }>({
    tipo: "", especificar: "", doentes: "", mortos: "",
  });
  const [suspeita, setSuspeita] = useState<{ primeira: string; segunda: string; terceira: string; especificar_outro: string }>({
    primeira: "", segunda: "", terceira: "", especificar_outro: "",
  });
  const [resultado, setResultado] = useState<Record<string, string>>({});
  const [resultadoOutro, setResultadoOutro] = useState("");
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
      toast.error("Data e município de notificação são obrigatórios.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { user_id: user.id };
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        payload[k] = v;
      }
      payload.material_coletado = {
        ...material,
        ...(materialOutro ? { outro_material: materialOutro } : {}),
      };
      payload.animais_acometidos = {
        ...(animais.tipo ? { tipo: animais.tipo } : {}),
        ...(animais.especificar ? { especificar: animais.especificar } : {}),
        ...(animais.doentes ? { doentes: Number(animais.doentes) } : {}),
        ...(animais.mortos ? { mortos: Number(animais.mortos) } : {}),
      };
      payload.suspeita_diagnostica = {
        ...(suspeita.primeira ? { primeira: suspeita.primeira } : {}),
        ...(suspeita.segunda ? { segunda: suspeita.segunda } : {}),
        ...(suspeita.terceira ? { terceira: suspeita.terceira } : {}),
        ...(suspeita.especificar_outro ? { especificar_outro: suspeita.especificar_outro } : {}),
      };
      payload.resultado_laboratorial = {
        ...resultado,
        ...(resultadoOutro ? { outro_especificar: resultadoOutro } : {}),
      };

      const { error } = await supabase
        .from("epizootia_cases")
        .insert(payload as never);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: "/fichas/epizootia" });
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
        <h1 className="text-2xl font-bold mt-2">Nova ficha de Epizootia</h1>
        <p className="text-sm text-muted-foreground">Notificação individual</p>
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

        {current.fields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {current.fields.map((f) => renderSmartField(f, form, setForm) ?? (
              <FieldRenderer key={f.name} field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />
            ))}
          </div>
        )}

        {current.custom === "animais" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="sm:col-span-2">
              <Label className="text-xs">Tipo de animal</Label>
              <Select value={animais.tipo || undefined} onValueChange={(v) => setAnimais({ ...animais, tipo: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TIPO_ANIMAL.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Especificar</Label>
              <Input value={animais.especificar} onChange={(e) => setAnimais({ ...animais, especificar: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Nº doentes</Label>
              <Input type="number" value={animais.doentes} onChange={(e) => setAnimais({ ...animais, doentes: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Nº mortos</Label>
              <Input type="number" value={animais.mortos} onChange={(e) => setAnimais({ ...animais, mortos: e.target.value })} className="mt-1" />
            </div>
          </div>
        )}

        {current.custom === "suspeita" && (
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <Label className="text-xs">1ª suspeita</Label>
              <Select value={suspeita.primeira || undefined} onValueChange={(v) => setSuspeita({ ...suspeita, primeira: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SUSPEITA.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">2ª suspeita</Label>
              <Input value={suspeita.segunda} onChange={(e) => setSuspeita({ ...suspeita, segunda: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">3ª suspeita</Label>
              <Input value={suspeita.terceira} onChange={(e) => setSuspeita({ ...suspeita, terceira: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Especificar (se outro)</Label>
              <Input value={suspeita.especificar_outro} onChange={(e) => setSuspeita({ ...suspeita, especificar_outro: e.target.value })} className="mt-1" />
            </div>
          </div>
        )}

        {current.custom === "material" && (
          <div className="mt-4">
            <Label className="text-xs mb-2 block">Material coletado</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MATERIAL_KEYS.map((m) => (
                <label key={m.key} className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                  <Checkbox
                    checked={!!material[m.key]}
                    onCheckedChange={(v) => setMaterial({ ...material, [m.key]: !!v })}
                  />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Outro material</Label>
              <Input value={materialOutro} onChange={(e) => setMaterialOutro(e.target.value)} className="mt-1" />
            </div>
          </div>
        )}

        {current.custom === "resultado" && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESULTADO_KEYS.map((r) => (
                <div key={r.key} className="border rounded-lg p-3">
                  <Label className="text-xs">{r.label}</Label>
                  <Select value={resultado[r.key] || undefined} onValueChange={(v) => setResultado({ ...resultado, [r.key]: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {RESULTADO_LAB.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Outro (especificar)</Label>
              <Input value={resultadoOutro} onChange={(e) => setResultadoOutro(e.target.value)} className="mt-1" />
            </div>
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
