import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SINTOMAS_OPCOES: { value: string; label: string }[] = [
  { value: "febre", label: "Febre" },
  { value: "calafrios", label: "Calafrios" },
  { value: "sudorese", label: "Sudorese" },
  { value: "cefaleia", label: "Cefaleia" },
  { value: "mialgia", label: "Mialgia" },
  { value: "artralgia", label: "Artralgia" },
  { value: "dor_retroocular", label: "Dor retroocular" },
  { value: "tosse", label: "Tosse" },
  { value: "coriza", label: "Coriza" },
  { value: "dor_garganta", label: "Dor de garganta" },
  { value: "dispneia", label: "Dispneia" },
  { value: "dor_toracica", label: "Dor torácica" },
  { value: "nausea", label: "Náusea" },
  { value: "vomito", label: "Vômito" },
  { value: "diarreia", label: "Diarreia" },
  { value: "dor_abdominal", label: "Dor abdominal" },
  { value: "exantema", label: "Exantema" },
  { value: "prurido", label: "Prurido" },
  { value: "conjuntivite", label: "Conjuntivite" },
  { value: "rigidez_nuca", label: "Rigidez de nuca" },
  { value: "convulsao", label: "Convulsão" },
  { value: "alteracao_consciencia", label: "Alteração da consciência" },
  { value: "petequias", label: "Petéquias" },
  { value: "hemorragia", label: "Hemorragia" },
  { value: "ictericia", label: "Icterícia" },
  { value: "perda_olfato_paladar", label: "Perda de olfato/paladar" },
  { value: "fadiga", label: "Fadiga / astenia" },
  { value: "linfadenopatia", label: "Linfadenopatia" },
  { value: "hepatoesplenomegalia", label: "Hepato/esplenomegalia" },
  { value: "lesao_pele", label: "Lesão de pele" },
];

export const EVOLUCAO_CLINICA_OPCOES: { value: string; label: string }[] = [
  { value: "em_curso", label: "Em curso" },
  { value: "melhora", label: "Melhora" },
  { value: "piora", label: "Piora" },
  { value: "cura", label: "Cura" },
  { value: "obito", label: "Óbito" },
  { value: "ignorado", label: "Ignorado" },
];

const SIM_NAO_IGN = [
  { value: "1", label: "Sim" },
  { value: "2", label: "Não" },
  { value: "9", label: "Ignorado" },
];

const parseCsv = (v?: string): string[] =>
  (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const toCsv = (arr: string[]): string => Array.from(new Set(arr)).join(",");

type FormState = Record<string, string>;
type SetForm = React.Dispatch<React.SetStateAction<FormState>>;

export function DadosClinicosPanel({
  form,
  setForm,
}: {
  form: FormState;
  setForm: SetForm;
}) {
  const sintomas = useMemo(() => parseCsv(form.dc_sintomas), [form.dc_sintomas]);

  const toggle = (value: string) => {
    const next = sintomas.includes(value)
      ? sintomas.filter((d) => d !== value)
      : [...sintomas, value];
    setForm((p) => ({ ...p, dc_sintomas: toCsv(next) }));
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const limparTodos = () => setForm((p) => ({ ...p, dc_sintomas: "" }));

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Sinais e sintomas</h3>
            <p className="text-xs text-muted-foreground">
              Marque todos os sinais e sintomas apresentados pelo paciente.
            </p>
          </div>
          {sintomas.length > 0 && (
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={limparTodos}>
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/30">
          {SINTOMAS_OPCOES.map((o) => {
            const checked = sintomas.includes(o.value);
            return (
              <label
                key={o.value}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-background transition-colors ${checked ? "bg-background" : ""}`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(o.value)} />
                <span className="text-sm">{o.label}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-3">
          <Label htmlFor="dc_sintomas_outros" className="text-xs">Outros sintomas (descrever)</Label>
          <Textarea
            id="dc_sintomas_outros"
            value={form.dc_sintomas_outros ?? ""}
            onChange={(e) => set("dc_sintomas_outros", e.target.value.toUpperCase())}
            rows={2}
            className="mt-1"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dc_data_primeiros_sintomas" className="text-xs">Data dos primeiros sintomas</Label>
          <Input
            id="dc_data_primeiros_sintomas"
            type="date"
            value={form.dc_data_primeiros_sintomas ?? ""}
            onChange={(e) => set("dc_data_primeiros_sintomas", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="dc_houve_hospitalizacao" className="text-xs">Houve hospitalização?</Label>
          <Select
            value={form.dc_houve_hospitalizacao || undefined}
            onValueChange={(v) => set("dc_houve_hospitalizacao", v)}
          >
            <SelectTrigger id="dc_houve_hospitalizacao" className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SIM_NAO_IGN.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dc_data_internacao" className="text-xs">Data de internação</Label>
          <Input
            id="dc_data_internacao"
            type="date"
            value={form.dc_data_internacao ?? ""}
            onChange={(e) => set("dc_data_internacao", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="dc_evolucao_clinica" className="text-xs">Evolução clínica</Label>
          <Select
            value={form.dc_evolucao_clinica || undefined}
            onValueChange={(v) => set("dc_evolucao_clinica", v)}
          >
            <SelectTrigger id="dc_evolucao_clinica" className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {EVOLUCAO_CLINICA_OPCOES.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
