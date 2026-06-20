import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

/** Estados (UF) do Brasil */
export const BR_UFS: { sigla: string; nome: string; codigo_ibge: string }[] = [
  { sigla: "AC", nome: "Acre", codigo_ibge: "12" },
  { sigla: "AL", nome: "Alagoas", codigo_ibge: "27" },
  { sigla: "AP", nome: "Amapá", codigo_ibge: "16" },
  { sigla: "AM", nome: "Amazonas", codigo_ibge: "13" },
  { sigla: "BA", nome: "Bahia", codigo_ibge: "29" },
  { sigla: "CE", nome: "Ceará", codigo_ibge: "23" },
  { sigla: "DF", nome: "Distrito Federal", codigo_ibge: "53" },
  { sigla: "ES", nome: "Espírito Santo", codigo_ibge: "32" },
  { sigla: "GO", nome: "Goiás", codigo_ibge: "52" },
  { sigla: "MA", nome: "Maranhão", codigo_ibge: "21" },
  { sigla: "MT", nome: "Mato Grosso", codigo_ibge: "51" },
  { sigla: "MS", nome: "Mato Grosso do Sul", codigo_ibge: "50" },
  { sigla: "MG", nome: "Minas Gerais", codigo_ibge: "31" },
  { sigla: "PA", nome: "Pará", codigo_ibge: "15" },
  { sigla: "PB", nome: "Paraíba", codigo_ibge: "25" },
  { sigla: "PR", nome: "Paraná", codigo_ibge: "41" },
  { sigla: "PE", nome: "Pernambuco", codigo_ibge: "26" },
  { sigla: "PI", nome: "Piauí", codigo_ibge: "22" },
  { sigla: "RJ", nome: "Rio de Janeiro", codigo_ibge: "33" },
  { sigla: "RN", nome: "Rio Grande do Norte", codigo_ibge: "24" },
  { sigla: "RS", nome: "Rio Grande do Sul", codigo_ibge: "43" },
  { sigla: "RO", nome: "Rondônia", codigo_ibge: "11" },
  { sigla: "RR", nome: "Roraima", codigo_ibge: "14" },
  { sigla: "SC", nome: "Santa Catarina", codigo_ibge: "42" },
  { sigla: "SP", nome: "São Paulo", codigo_ibge: "35" },
  { sigla: "SE", nome: "Sergipe", codigo_ibge: "28" },
  { sigla: "TO", nome: "Tocantins", codigo_ibge: "17" },
];

type FormState = Record<string, string>;
type SetForm = (updater: (prev: FormState) => FormState) => void;

type ColSpan = 1 | 2 | 3;
function colClass(col?: ColSpan) {
  return col === 3 ? "sm:col-span-3" : col === 2 ? "sm:col-span-2" : "sm:col-span-1";
}

/** Cache de municípios IBGE por UF */
const muniCache = new Map<string, { id: number; nome: string }[]>();
async function fetchMunicipios(uf: string) {
  if (!uf) return [];
  if (muniCache.has(uf)) return muniCache.get(uf)!;
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { id: number; nome: string }[];
    muniCache.set(uf, data);
    return data;
  } catch {
    return [];
  }
}

/* ============== UF Select ============== */

export function UfSelect({
  label,
  value,
  onChange,
  col,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  col?: ColSpan;
  required?: boolean;
}) {
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Selecione a UF" />
        </SelectTrigger>
        <SelectContent>
          {BR_UFS.map((u) => (
            <SelectItem key={u.sigla} value={u.sigla}>
              {u.sigla} — {u.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ============== Município Combobox ============== */

export function MunicipioCombobox({
  label,
  uf,
  value,
  onSelect,
  col,
  required,
}: {
  label: string;
  uf: string;
  value: string;
  onSelect: (nome: string, codigoIbge: string) => void;
  col?: ColSpan;
  required?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ id: number; nome: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!uf) {
        setItems([]);
        return;
      }
      setLoading(true);
      const data = await fetchMunicipios(uf);
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [uf]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 50);
    return items.filter((m) => m.nome.toLowerCase().includes(q)).slice(0, 50);
  }, [items, query]);

  return (
    <div className={colClass(col)} ref={containerRef}>
      <Label className="text-xs">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="relative mt-1">
        <Input
          value={query}
          disabled={!uf}
          placeholder={uf ? "Digite para buscar..." : "Selecione a UF primeiro"}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {loading && (
          <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {open && uf && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover shadow-md">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  onSelect(m.nome, String(m.id));
                  setQuery(m.nome);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{m.nome}</span>
                <span className="text-muted-foreground ml-2 text-xs">IBGE {m.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== Código IBGE (readonly) ============== */

export function CodigoIbgeField({
  label,
  value,
  col,
}: {
  label: string;
  value: string;
  col?: ColSpan;
}) {
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">{label}</Label>
      <Input value={value} readOnly placeholder="Preenchido pelo município" className="mt-1 bg-muted/40" />
    </div>
  );
}

/* ============== Unidade de Saúde (autocomplete) ============== */

const unidadesCache = new Map<string, string[]>();

async function fetchUnidadesCadastradas(tables: string[]) {
  const key = tables.join(",");
  if (unidadesCache.has(key)) return unidadesCache.get(key)!;
  const all = new Set<string>();
  await Promise.all(
    tables.map(async (t) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from(t as never) as any)
          .select("unidade_saude")
          .not("unidade_saude", "is", null)
          .limit(500);
        if (Array.isArray(data)) {
          for (const row of data) {
            const v = (row as { unidade_saude?: string }).unidade_saude;
            if (v && v.trim()) all.add(v.trim());
          }
        }
      } catch {
        /* ignore */
      }
    }),
  );
  const list = Array.from(all).sort((a, b) => a.localeCompare(b, "pt-BR"));
  unidadesCache.set(key, list);
  return list;
}

const UNIDADE_TABLES = [
  "coqueluche_cases",
  "dengue_chikungunya_cases",
  "difteria_cases",
  "epizootia_cases",
  "exantematica_cases",
  "febre_amarela_cases",
  "hanseniase_cases",
  "meningite_cases",
  "raiva_humana_cases",
  "srag_cases",
  "surto_dta_cases",
  "tetano_acidental_cases",
  "tetano_neonatal_cases",
  "tuberculose_cases",
];

export function UnidadeSaudeAutocomplete({
  label,
  value,
  onChange,
  col,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  col?: ColSpan;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnidadesCadastradas(UNIDADE_TABLES).then(setItems);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return items.slice(0, 20);
    return items.filter((n) => n.toLowerCase().includes(q)).slice(0, 20);
  }, [items, value]);

  return (
    <div className={colClass(col)} ref={containerRef}>
      <Label className="text-xs">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="relative mt-1">
        <Input
          value={value}
          placeholder="Digite o nome da unidade..."
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        {open && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
            {filtered.map((n) => (
              <button
                key={n}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== CEP (ViaCEP) ============== */

type ViaCepResp = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  erro?: boolean;
};

export function CepInput({
  label,
  value,
  onChange,
  onAutoFill,
  col,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onAutoFill: (data: ViaCepResp) => void;
  col?: ColSpan;
  required?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const lookup = async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) return;
      const data = (await res.json()) as ViaCepResp;
      if (!data.erro) onAutoFill(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const format = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  return (
    <div className={colClass(col)}>
      <Label className="text-xs">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="relative mt-1">
        <Input
          value={value}
          placeholder="00000-000"
          onChange={(e) => {
            const f = format(e.target.value);
            onChange(f);
            if (f.replace(/\D/g, "").length === 8) lookup(f);
          }}
          onBlur={(e) => lookup(e.target.value)}
          inputMode="numeric"
        />
        {loading && (
          <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

/* ============== Smart Field dispatcher ============== */

type FieldLike = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  col?: ColSpan;
};

/**
 * Returns a ReactNode for "smart" fields (UF/Município/IBGE, Unidade de Saúde, CEP).
 * Returns null when the field is not handled — caller renders the default input.
 */
export function renderSmartField(
  field: FieldLike,
  form: FormState,
  setForm: SetForm,
): ReactNode | null {
  const { name } = field;

  // UF (notificação / residência / hospital / ocorrencia)
  const ufMatch = name.match(/^uf_(notificacao|residencia|hospital|ocorrencia|infeccao)$/);
  if (ufMatch) {
    const scope = ufMatch[1];
    return (
      <UfSelect
        key={name}
        label={field.label}
        value={form[name] ?? ""}
        required={field.required}
        col={field.col}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            [name]: v,
            [`municipio_${scope}`]: "",
            [`codigo_ibge_${scope}`]: "",
          }))
        }
      />
    );
  }

  const muniMatch = name.match(/^municipio_(notificacao|residencia|hospital|ocorrencia|infeccao)$/);
  if (muniMatch) {
    const scope = muniMatch[1];
    const uf = form[`uf_${scope}`] ?? "";
    return (
      <MunicipioCombobox
        key={name}
        label={field.label}
        uf={uf}
        value={form[name] ?? ""}
        required={field.required}
        col={field.col}
        onSelect={(nome, codigoIbge) =>
          setForm((prev) => ({
            ...prev,
            [name]: nome,
            [`codigo_ibge_${scope}`]: codigoIbge,
          }))
        }
      />
    );
  }

  if (/^codigo_ibge_(notificacao|residencia|hospital|ocorrencia|infeccao)$/.test(name)) {
    return <CodigoIbgeField key={name} label={field.label} value={form[name] ?? ""} col={field.col} />;
  }

  if (name === "unidade_saude") {
    return (
      <UnidadeSaudeAutocomplete
        key={name}
        label={field.label}
        value={form[name] ?? ""}
        required={field.required}
        col={field.col}
        onChange={(v) => setForm((prev) => ({ ...prev, [name]: v }))}
      />
    );
  }

  if (name === "cep") {
    return (
      <CepInput
        key={name}
        label={field.label}
        value={form[name] ?? ""}
        required={field.required}
        col={field.col}
        onChange={(v) => setForm((prev) => ({ ...prev, [name]: v }))}
        onAutoFill={(data) =>
          setForm((prev) => ({
            ...prev,
            cep: data.cep ?? prev.cep ?? "",
            logradouro: data.logradouro || prev.logradouro || "",
            bairro: data.bairro || prev.bairro || "",
            uf_residencia: data.uf || prev.uf_residencia || "",
            municipio_residencia: data.localidade || prev.municipio_residencia || "",
            codigo_ibge_residencia: data.ibge || prev.codigo_ibge_residencia || "",
          }))
        }
      />
    );
  }

  return null;
}
