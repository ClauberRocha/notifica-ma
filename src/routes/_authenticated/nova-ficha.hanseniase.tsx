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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderSmartField } from "@/components/smart-fields";
import {
  TIPO_IDADE,
  SEXO,
  GESTANTE,
  RACA_COR,
  ESCOLARIDADE,
  ZONA,
  FORMA_CLINICA,
  CLASSIFICACAO_OPERACIONAL,
  GRAU_INCAPACIDADE,
  MODO_ENTRADA,
  MODO_DETECCAO,
  BACILOSCOPIA,
  ESQUEMA_TERAPEUTICO,
  STATUS,
} from "@/lib/hanseniase-options";

export const Route = createFileRoute("/_authenticated/nova-ficha/hanseniase")({
  head: () => ({ meta: [{ title: "Nova Ficha de Hanseníase" }] }),
  component: NovaFichaHanseniasePage,
});

type Opt = { value: string; label: string };

type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields: FieldDef[];
};

const STEPS: Step[] = [
  {
    title: "Notificação",
    description: "Dados da notificação e unidade.",
    fields: [
      { name: "numero_ficha", label: "Nº da ficha", type: "text" },
      { name: "numero_prontuario", label: "Nº do prontuário", type: "text" },
      { name: "data_notificacao", label: "Data da notificação", type: "date", required: true },
      { name: "data_diagnostico", label: "Data do diagnóstico", type: "date" },
      { name: "uf_notificacao", label: "UF da notificação", type: "text" },
      { name: "municipio_notificacao", label: "Município da notificação", type: "text" },
      { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
      { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
      { name: "codigo_unidade_saude", label: "Código da unidade", type: "text" },
    ],
  },
  {
    title: "Paciente",
    fields: [
      { name: "nome_paciente", label: "Nome do paciente", type: "text", required: true, col: 2 },
      { name: "data_nascimento", label: "Data de nascimento", type: "date" },
      { name: "idade", label: "Idade", type: "number" },
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
    fields: [
      { name: "uf_residencia", label: "UF", type: "text" },
      { name: "municipio_residencia", label: "Município", type: "text" },
      { name: "bairro", label: "Bairro", type: "text" },
      { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
      { name: "numero_endereco", label: "Número", type: "text" },
      { name: "cep", label: "CEP", type: "text" },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "zona", label: "Zona", type: "select", options: ZONA },
      { name: "ocupacao", label: "Ocupação", type: "text", col: 2 },
    ],
  },
  {
    title: "Avaliação Clínica",
    description: "Forma clínica e classificação operacional.",
    fields: [
      { name: "numero_lesoes_cutaneas", label: "Nº de lesões cutâneas", type: "number" },
      { name: "forma_clinica", label: "Forma clínica", type: "select", options: FORMA_CLINICA },
      { name: "classificacao_operacional", label: "Classificação operacional", type: "select", options: CLASSIFICACAO_OPERACIONAL },
      { name: "numero_nervos_afetados", label: "Nº de nervos afetados", type: "number" },
      { name: "grau_incapacidade_fisica", label: "Grau de incapacidade física", type: "select", options: GRAU_INCAPACIDADE, col: 2 },
      { name: "modo_entrada", label: "Modo de entrada", type: "select", options: MODO_ENTRADA },
      { name: "modo_deteccao", label: "Modo de detecção", type: "select", options: MODO_DETECCAO },
    ],
  },
  {
    title: "Laboratório e Tratamento",
    fields: [
      { name: "baciloscopia", label: "Baciloscopia", type: "select", options: BACILOSCOPIA },
      { name: "data_inicio_tratamento", label: "Data de início do tratamento", type: "date" },
      { name: "esquema_terapeutico", label: "Esquema terapêutico", type: "select", options: ESQUEMA_TERAPEUTICO, col: 2 },
      { name: "numero_contatos_registrados", label: "Nº de contatos registrados", type: "number" },
    ],
  },
  {
    title: "Conclusão",
    description: "Encerramento e investigador.",
    fields: [
      { name: "status", label: "Status", type: "select", options: STATUS },
      { name: "observacoes_adicionais", label: "Observações adicionais", type: "textarea", col: 3 },
      { name: "municipio_unidade_investigador", label: "Município da unidade do investigador", type: "text", col: 2 },
      { name: "codigo_unidade_investigador", label: "Código da unidade do investigador", type: "text" },
      { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
      { name: "funcao_investigador", label: "Função do investigador", type: "text" },
    ],
  },
];

type FormState = Record<string, string>;

const NUMERIC_FIELDS = new Set([
  "idade",
  "numero_lesoes_cutaneas",
  "numero_nervos_afetados",
  "numero_contatos_registrados",
]);

function NovaFichaHanseniasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    agravo: "hanseniase",
    status: "em_investigacao",
  });
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (): boolean => {
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
      const payload: Record<string, unknown> = { user_id: user.id };
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        if (NUMERIC_FIELDS.has(k)) {
          const n = Number(v);
          if (!Number.isNaN(n)) payload[k] = n;
        } else {
          payload[k] = v;
        }
      }
      const { error } = await supabase
        .from("hanseniase_cases")
        .insert(payload as never);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: "/fichas/hanseniase" });
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
        <h1 className="text-2xl font-bold mt-2">Nova ficha de Hanseníase</h1>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {current.fields.map((f) => (
            {renderSmartField(f, form, setForm) ?? (<FieldRenderer key={f.name} field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />)}
          ))}
        </div>
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
  const colClass =
    field.col === 3 ? "sm:col-span-3" : field.col === 2 ? "sm:col-span-2" : "sm:col-span-1";

  return (
    <div className={colClass}>
      <Label htmlFor={field.name} className="text-xs">
        {field.label}
        {"required" in field && field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "text" || field.type === "number" || field.type === "date" ? (
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1"
        />
      ) : field.type === "textarea" ? (
        <Textarea
          id={field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1"
        />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={field.name} className="mt-1">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
