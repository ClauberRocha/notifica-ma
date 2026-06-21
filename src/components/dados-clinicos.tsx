import { useMemo, useState } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
  const [busca, setBusca] = useState("");

  const validValues = useMemo(() => new Set(SINTOMAS_OPCOES.map((o) => o.value)), []);
  const labelByValue = useMemo(
    () => Object.fromEntries(SINTOMAS_OPCOES.map((o) => [o.value, o.label])),
    []
  );

  const invalidSelections = useMemo(
    () => sintomas.filter((v) => !validValues.has(v)),
    [sintomas, validValues]
  );

  const filtered = useMemo(() => {
    const q = normalize(busca.trim());
    if (!q) return SINTOMAS_OPCOES;
    return SINTOMAS_OPCOES.filter((o) => normalize(o.label).includes(q));
  }, [busca]);

  const toggle = (value: string) => {
    const next = sintomas.includes(value)
      ? sintomas.filter((d) => d !== value)
      : [...sintomas, value];
    setForm((p) => ({ ...p, dc_sintomas: toCsv(next) }));
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const limparTodos = () => setForm((p) => ({ ...p, dc_sintomas: "" }));

  const selecionarVisiveis = () => {
    const next = Array.from(new Set([...sintomas, ...filtered.map((o) => o.value)]));
    setForm((p) => ({ ...p, dc_sintomas: toCsv(next) }));
  };

  const desmarcarVisiveis = () => {
    const visiveis = new Set(filtered.map((o) => o.value));
    setForm((p) => ({
      ...p,
      dc_sintomas: toCsv(sintomas.filter((v) => !visiveis.has(v))),
    }));
  };

  const removerInvalidos = () =>
    setForm((p) => ({
      ...p,
      dc_sintomas: toCsv(sintomas.filter((v) => validValues.has(v))),
    }));

  // Validações cruzadas
  const dataInternMenorSintoma =
    !!form.dc_data_primeiros_sintomas &&
    !!form.dc_data_internacao &&
    form.dc_data_internacao < form.dc_data_primeiros_sintomas;

  const hospSimSemData =
    form.dc_houve_hospitalizacao === "1" && !form.dc_data_internacao;

  const hospNaoComData =
    form.dc_houve_hospitalizacao === "2" && !!form.dc_data_internacao;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="text-sm font-semibold">
              Sinais e sintomas
              {sintomas.length > 0 && (
                <Badge variant="secondary" className="ml-2 align-middle">
                  {sintomas.length} selecionado(s)
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Busque e marque os sinais e sintomas apresentados pelo paciente.
            </p>
          </div>
          <div className="flex gap-1">
            {sintomas.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={limparTodos}
              >
                Limpar tudo
              </Button>
            )}
          </div>
        </div>

        {/* Alerta de seleções inválidas (legacy / valores fora da lista) */}
        {invalidSelections.length > 0 && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">
                {invalidSelections.length} seleção(ões) inválida(s) detectada(s):
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {invalidSelections.map((v) => (
                  <Badge
                    key={v}
                    variant="outline"
                    className="border-destructive/60 text-destructive gap-1"
                  >
                    {v}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          dc_sintomas: toCsv(sintomas.filter((s) => s !== v)),
                        }))
                      }
                      aria-label={`Remover ${v}`}
                      className="rounded hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs border-destructive/60 text-destructive hover:bg-destructive/20"
              onClick={removerInvalidos}
            >
              Remover todos
            </Button>
          </div>
        )}

        {/* Busca + ações */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar sintoma..."
              className="pl-8 h-9"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={selecionarVisiveis}
            disabled={filtered.length === 0}
          >
            Marcar visíveis
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={desmarcarVisiveis}
            disabled={filtered.length === 0}
          >
            Desmarcar visíveis
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/30 min-h-[80px]">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-full text-center py-4">
              Nenhum sintoma encontrado para "{busca}".
            </p>
          ) : (
            filtered.map((o) => {
              const checked = sintomas.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer border transition-colors",
                    checked
                      ? "bg-primary/10 border-primary/40 text-foreground"
                      : "border-transparent hover:bg-background"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(o.value)}
                  />
                  <span className="text-sm">{o.label}</span>
                </label>
              );
            })
          )}
        </div>

        {/* Badges das seleções válidas (atalho para remover) */}
        {sintomas.filter((v) => validValues.has(v)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {sintomas
              .filter((v) => validValues.has(v))
              .map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-0.5"
                >
                  {labelByValue[v]}
                  <button
                    type="button"
                    onClick={() => toggle(v)}
                    className="ml-0.5 rounded hover:bg-destructive/20 hover:text-destructive p-0.5"
                    aria-label={`Remover ${labelByValue[v]}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
          </div>
        )}

        <div className="mt-3">
          <Label htmlFor="dc_sintomas_outros" className="text-xs">
            Outros sintomas (descrever)
          </Label>
          <Textarea
            id="dc_sintomas_outros"
            value={form.dc_sintomas_outros ?? ""}
            onChange={(e) =>
              set("dc_sintomas_outros", e.target.value.toUpperCase())
            }
            rows={2}
            className="mt-1"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dc_data_primeiros_sintomas" className="text-xs">
            Data dos primeiros sintomas
          </Label>
          <Input
            id="dc_data_primeiros_sintomas"
            type="date"
            value={form.dc_data_primeiros_sintomas ?? ""}
            onChange={(e) => set("dc_data_primeiros_sintomas", e.target.value)}
            className={cn(
              "mt-1",
              dataInternMenorSintoma && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        <div>
          <Label htmlFor="dc_houve_hospitalizacao" className="text-xs">
            Houve hospitalização?
          </Label>
          <Select
            value={form.dc_houve_hospitalizacao || undefined}
            onValueChange={(v) => set("dc_houve_hospitalizacao", v)}
          >
            <SelectTrigger
              id="dc_houve_hospitalizacao"
              className={cn(
                "mt-1",
                (hospSimSemData || hospNaoComData) &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SIM_NAO_IGN.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hospSimSemData && (
            <p className="text-xs text-destructive mt-1">
              Informe a data de internação.
            </p>
          )}
          {hospNaoComData && (
            <p className="text-xs text-destructive mt-1">
              Data de internação informada, mas hospitalização = Não.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="dc_data_internacao" className="text-xs">
            Data de internação
          </Label>
          <Input
            id="dc_data_internacao"
            type="date"
            value={form.dc_data_internacao ?? ""}
            onChange={(e) => set("dc_data_internacao", e.target.value)}
            className={cn(
              "mt-1",
              (dataInternMenorSintoma || hospSimSemData || hospNaoComData) &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          {dataInternMenorSintoma && (
            <p className="text-xs text-destructive mt-1">
              Data de internação anterior à data dos primeiros sintomas.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="dc_evolucao_clinica" className="text-xs">
            Evolução clínica
          </Label>
          <Select
            value={form.dc_evolucao_clinica || undefined}
            onValueChange={(v) => set("dc_evolucao_clinica", v)}
          >
            <SelectTrigger id="dc_evolucao_clinica" className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {EVOLUCAO_CLINICA_OPCOES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
