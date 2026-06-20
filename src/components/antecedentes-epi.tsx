import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/* ============== Listas compartilhadas ============== */

export const DOENCAS_PREEXISTENTES_OPCOES: { value: string; label: string }[] = [
  { value: "diabetes", label: "Diabetes mellitus" },
  { value: "hipertensao", label: "Hipertensão arterial" },
  { value: "obesidade", label: "Obesidade" },
  { value: "cardiopatia", label: "Doença cardiovascular crônica" },
  { value: "pneumopatia", label: "Doença respiratória crônica (DPOC/asma)" },
  { value: "nefropatia", label: "Doença renal crônica" },
  { value: "hepatopatia", label: "Doença hepática crônica" },
  { value: "doenca_neurologica", label: "Doença neurológica crônica" },
  { value: "doenca_hematologica", label: "Doença hematológica crônica" },
  { value: "imunodepressao", label: "Imunodepressão / imunossupressão" },
  { value: "hiv_aids", label: "HIV/AIDS" },
  { value: "tuberculose", label: "Tuberculose" },
  { value: "neoplasia", label: "Neoplasia (câncer)" },
  { value: "transplantado", label: "Transplantado" },
  { value: "gestante_alto_risco", label: "Gestante de alto risco" },
  { value: "puerpera", label: "Puérpera (até 45 dias)" },
  { value: "sindrome_down", label: "Síndrome de Down" },
  { value: "tabagismo", label: "Tabagismo" },
  { value: "etilismo", label: "Etilismo" },
  { value: "desnutricao", label: "Desnutrição" },
];

export const VACINAS_OPCOES: { value: string; label: string }[] = [
  { value: "bcg", label: "BCG" },
  { value: "hepatite_b", label: "Hepatite B" },
  { value: "penta", label: "Penta (DTP+Hib+HepB)" },
  { value: "dtp", label: "DTP (Tríplice bacteriana)" },
  { value: "dt_adulto", label: "dT (Dupla adulto)" },
  { value: "dtpa", label: "dTpa (gestante)" },
  { value: "vip_vop", label: "Poliomielite (VIP/VOP)" },
  { value: "rotavirus", label: "Rotavírus" },
  { value: "pneumo_10", label: "Pneumocócica 10-valente" },
  { value: "pneumo_23", label: "Pneumocócica 23-valente" },
  { value: "meningo_c", label: "Meningocócica C" },
  { value: "meningo_acwy", label: "Meningocócica ACWY" },
  { value: "meningo_b", label: "Meningocócica B" },
  { value: "febre_amarela", label: "Febre amarela" },
  { value: "triplice_viral", label: "Tríplice viral (SCR)" },
  { value: "tetra_viral", label: "Tetra viral (SCRV)" },
  { value: "varicela", label: "Varicela" },
  { value: "hpv", label: "HPV" },
  { value: "influenza", label: "Influenza" },
  { value: "covid_19", label: "COVID-19" },
  { value: "hepatite_a", label: "Hepatite A" },
  { value: "raiva", label: "Raiva (humana)" },
];

/* ============== Helpers ============== */

const parseCsv = (v?: string): string[] =>
  (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const toCsv = (arr: string[]): string => Array.from(new Set(arr)).join(",");

type FormState = Record<string, string>;
type SetForm = React.Dispatch<React.SetStateAction<FormState>>;

/* ============== Painel "Antecedentes Epidemiológicos" ============== */

export function AntecedentesEpidemiologicosPanel({
  form,
  setForm,
}: {
  form: FormState;
  setForm: SetForm;
}) {
  const doencas = useMemo(() => parseCsv(form.antecedentes_doencas), [form.antecedentes_doencas]);
  const vacinas = useMemo(() => parseCsv(form.antecedentes_vacinas), [form.antecedentes_vacinas]);
  
  const [vacOpen, setVacOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const toggleDoenca = (value: string) => {
    const next = doencas.includes(value)
      ? doencas.filter((d) => d !== value)
      : [...doencas, value];
    setForm((p) => ({ ...p, antecedentes_doencas: toCsv(next) }));
  };

  const toggleVacina = (value: string) => {
    const next = vacinas.includes(value)
      ? vacinas.filter((d) => d !== value)
      : [...vacinas, value];
    setForm((p) => ({ ...p, antecedentes_vacinas: toCsv(next) }));
  };

  const removeVacina = (value: string) => {
    setForm((p) => ({
      ...p,
      antecedentes_vacinas: toCsv(vacinas.filter((v) => v !== value)),
    }));
  };

  const limparTodasDoencas = () =>
    setForm((p) => ({ ...p, antecedentes_doencas: "" }));
  const limparTodasVacinas = () =>
    setForm((p) => ({ ...p, antecedentes_vacinas: "" }));

  return (
    <div className="space-y-8">
      {/* DOENÇAS PRÉ-EXISTENTES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Doenças pré-existentes</h3>
            <p className="text-xs text-muted-foreground">
              Marque todas as condições crônicas conhecidas do paciente.
            </p>
          </div>
          {doencas.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={limparTodasDoencas}
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/30">
          {DOENCAS_PREEXISTENTES_OPCOES.map((o) => {
            const checked = doencas.includes(o.value);
            return (
              <label
                key={o.value}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-background transition-colors ${checked ? "bg-background" : ""}`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleDoenca(o.value)}
                />
                <span className="text-sm">{o.label}</span>
              </label>
            );
          })}
        </div>

      </section>

      {/* VACINAS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Vacinas recebidas</h3>
            <p className="text-xs text-muted-foreground">
              Selecione todas as vacinas comprovadas no cartão de vacinação.
            </p>
          </div>
          {vacinas.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={limparTodasVacinas}
            >
              Limpar
            </Button>
          )}
        </div>

        <Popover open={vacOpen} onOpenChange={setVacOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={vacOpen}
              className="w-full justify-between font-normal"
            >
              {vacinas.length > 0
                ? `${vacinas.length} vacina(s) selecionada(s)`
                : "Selecione as vacinas..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(28rem,calc(100vw-2rem))] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar vacina..."
                value={busca}
                onValueChange={setBusca}
              />
              <CommandList>
                <CommandEmpty>Nenhuma vacina encontrada.</CommandEmpty>
                <CommandGroup>
                  {VACINAS_OPCOES.map((o) => {
                    const checked = vacinas.includes(o.value);
                    return (
                      <CommandItem
                        key={o.value}
                        value={o.label}
                        onSelect={() => toggleVacina(o.value)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${checked ? "opacity-100" : "opacity-0"}`}
                        />
                        {o.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {vacinas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {vacinas.map((v) => {
              const opt = VACINAS_OPCOES.find((o) => o.value === v);
              return (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1"
                >
                  {opt?.label ?? v}
                  <button
                    type="button"
                    onClick={() => removeVacina(v)}
                    className="ml-1 rounded hover:bg-destructive/20 hover:text-destructive p-0.5"
                    aria-label={`Remover ${opt?.label ?? v}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
