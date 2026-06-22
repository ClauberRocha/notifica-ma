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
import { useAuth } from "@/hooks/use-auth";
import { getSemanaEpidemiologica } from "@/data/semana-epd";
import { getRegional, getMacroregiao } from "@/data/regional-macro";

/** Hoje no formato YYYY-MM-DD (timezone local). */
export function todayIso(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Calcula idade em anos a partir de uma data ISO de nascimento. */
export function calcIdade(dataNasc: string): string {
  if (!dataNasc) return "";
  const nasc = new Date(dataNasc);
  if (Number.isNaN(nasc.getTime())) return "";
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return anos >= 0 ? String(anos) : "";
}

/** Faixa etaria padrao Ministerio da Saude. */
export function calcFaixaEtaria(idade: string | number): string {
  const n = typeof idade === "number" ? idade : Number(idade);
  if (!Number.isFinite(n) || n < 0) return "";
  if (n < 1) return "< 1 ano";
  if (n <= 4) return "1-4 anos";
  if (n <= 9) return "5-9 anos";
  if (n <= 14) return "10-14 anos";
  if (n <= 19) return "15-19 anos";
  if (n <= 29) return "20-29 anos";
  if (n <= 39) return "30-39 anos";
  if (n <= 49) return "40-49 anos";
  if (n <= 59) return "50-59 anos";
  if (n <= 69) return "60-69 anos";
  if (n <= 79) return "70-79 anos";
  return "80+ anos";
}

/** Mascara telefone (DDD) 9XXXX-XXXX. */
export function maskTelefone(raw: string): string {
  const d = (raw || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Aplica MAIUSCULAS preservando espaços; ignora vazio. */
export function toUpper(v: string): string {
  return v ? v.toUpperCase() : v;
}

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

/* ============== Auto-computed read-only fields ============== */

function ReadOnlyField({
  label,
  value,
  col,
  placeholder,
}: {
  label: string;
  value: string;
  col?: ColSpan;
  placeholder?: string;
}) {
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">{label}</Label>
      <Input value={value} readOnly placeholder={placeholder ?? "Preenchido automaticamente"} className="mt-1 bg-muted/40" />
    </div>
  );
}

function AutoDateField({ name, label, required, col, form, setForm }: { name: string; label: string; required?: boolean; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const value = form[name] ?? "";
  useEffect(() => {
    if (!value) {
      const t = todayIso();
      setForm((p) => (p[name] ? p : { ...p, [name]: t }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      <Input type="date" value={value} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} className="mt-1" />
    </div>
  );
}

function SemanaEpdField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const data = form.data_notificacao ?? form.data ?? "";
  const se = useMemo(() => getSemanaEpidemiologica(data), [data]);
  const valueStr = se != null ? String(se) : "";
  useEffect(() => {
    if ((form[name] ?? "") !== valueStr) setForm((p) => ({ ...p, [name]: valueStr }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueStr]);
  return <ReadOnlyField label={label} value={valueStr} col={col} placeholder="Calculada pela data" />;
}

function IdadeAutoField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const dn = form.data_nascimento ?? "";
  const idade = useMemo(() => calcIdade(dn), [dn]);
  useEffect(() => {
    if (idade && (form[name] ?? "") !== idade) setForm((p) => ({ ...p, [name]: idade }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idade]);
  return <ReadOnlyField label={label} value={idade} col={col} placeholder="Calculada pela data de nascimento" />;
}

function FaixaEtariaField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const idade = form.idade ?? calcIdade(form.data_nascimento ?? "");
  const faixa = useMemo(() => calcFaixaEtaria(idade), [idade]);
  useEffect(() => {
    if ((form[name] ?? "") !== faixa) setForm((p) => ({ ...p, [name]: faixa }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faixa]);
  return <ReadOnlyField label={label} value={faixa} col={col} placeholder="Calculada pela idade" />;
}

function RegionalAutoField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const mun = form.municipio_notificacao || form.municipio_residencia || form.municipio_ocorrencia || "";
  const reg = useMemo(() => getRegional(mun), [mun]);
  useEffect(() => {
    if ((form[name] ?? "") !== reg) setForm((p) => ({ ...p, [name]: reg }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg]);
  return <ReadOnlyField label={label} value={reg} col={col} placeholder="Definida pelo município de notificação" />;
}

function MacroregiaoAutoField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const mun = form.municipio_notificacao || form.municipio_residencia || form.municipio_ocorrencia || "";
  const reg = form.regional || getRegional(mun);
  const macro = useMemo(() => getMacroregiao(reg), [reg]);
  useEffect(() => {
    if ((form[name] ?? "") !== macro) setForm((p) => ({ ...p, [name]: macro }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macro]);
  return <ReadOnlyField label={label} value={macro} col={col} placeholder="Definida pela regional" />;
}

function ResponsavelDigitacaoField({ name, label, col, form, setForm }: { name: string; label: string; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const { user } = useAuth();
  const nome = user?.full_name || user?.email || "";
  useEffect(() => {
    if (nome && (form[name] ?? "") !== nome) setForm((p) => ({ ...p, [name]: nome }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);
  return <ReadOnlyField label={label} value={nome} col={col} placeholder="Usuario logado" />;
}

function TelefoneInput({ name, label, required, col, form, setForm }: { name: string; label: string; required?: boolean; col?: ColSpan; form: FormState; setForm: SetForm }) {
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      <Input value={form[name] ?? ""} placeholder="(00) 90000-0000" inputMode="tel" onChange={(e) => setForm((p) => ({ ...p, [name]: maskTelefone(e.target.value) }))} className="mt-1" />
    </div>
  );
}

const SEXO_FEMININO_VALUES = new Set(["F", "FEMININO", "Feminino", "feminino", "f"]);

function GestanteSelect({ name, label, required, col, form, setForm }: { name: string; label: string; required?: boolean; col?: ColSpan; form: FormState; setForm: SetForm }) {
  const sexo = form.sexo ?? "";
  const disabled = !SEXO_FEMININO_VALUES.has(sexo);
  useEffect(() => {
    if (disabled && form[name]) setForm((p) => ({ ...p, [name]: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
  const opts = [
    { v: "1", l: "1º Trimestre" }, { v: "2", l: "2º Trimestre" }, { v: "3", l: "3º Trimestre" },
    { v: "4", l: "Idade gestacional ignorada" }, { v: "5", l: "Não" }, { v: "6", l: "Não se aplica" }, { v: "9", l: "Ignorado" },
  ];
  return (
    <div className={colClass(col)}>
      <Label className="text-xs">{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      <Select value={form[name] || undefined} onValueChange={(v) => setForm((p) => ({ ...p, [name]: v }))} disabled={disabled}>
        <SelectTrigger className="mt-1"><SelectValue placeholder={disabled ? "Disponível apenas para sexo Feminino" : "Selecione"} /></SelectTrigger>
        <SelectContent>{opts.map((o) => (<SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>))}</SelectContent>
      </Select>
    </div>
  );
}

/* ============== Smart Field dispatcher ============== */

type FieldLike = { name: string; label: string; type: string; required?: boolean; col?: ColSpan };

/** Returns a ReactNode for "smart" fields. Returns null when the field is not handled. */
export function renderSmartField(field: FieldLike, form: FormState, setForm: SetForm): ReactNode | null {
  const name = field.name;
  const labelRaw = field.label || "";
  const label = name === "numero_ficha" || /n[º°o]?\s*da\s*ficha/i.test(labelRaw) ? "Nº da Notificação" : labelRaw;
  const f = { ...field, label };

  const ufMatch = name.match(/^uf_(notificacao|residencia|hospital|ocorrencia|infeccao)$/);
  if (ufMatch) {
    const scope = ufMatch[1];
    return (
      <UfSelect key={name} label={f.label} value={form[name] ?? ""} required={f.required} col={f.col}
        onChange={(v) => setForm((prev) => ({ ...prev, [name]: v, [`municipio_${scope}`]: "", [`codigo_ibge_${scope}`]: "" }))} />
    );
  }

  const muniMatch = name.match(/^municipio_(notificacao|residencia|hospital|ocorrencia|infeccao)$/);
  if (muniMatch) {
    const scope = muniMatch[1];
    const uf = form[`uf_${scope}`] ?? "";
    return (
      <MunicipioCombobox key={name} label={f.label} uf={uf} value={form[name] ?? ""} required={f.required} col={f.col}
        onSelect={(nome, codigoIbge) => setForm((prev) => ({ ...prev, [name]: nome.toUpperCase(), [`codigo_ibge_${scope}`]: codigoIbge }))} />
    );
  }

  if (/^codigo_ibge_(notificacao|residencia|hospital|ocorrencia|infeccao)$/.test(name)) {
    return <CodigoIbgeField key={name} label={f.label} value={form[name] ?? ""} col={f.col} />;
  }

  if (name === "unidade_saude") {
    return (
      <UnidadeSaudeAutocomplete key={name} label={f.label} value={form[name] ?? ""} required={f.required} col={f.col}
        onChange={(v) => setForm((prev) => ({ ...prev, [name]: v.toUpperCase() }))} />
    );
  }

  if (name === "cep") {
    return (
      <CepInput key={name} label={f.label} value={form[name] ?? ""} required={f.required} col={f.col}
        onChange={(v) => setForm((prev) => ({ ...prev, [name]: v }))}
        onAutoFill={(data) => setForm((prev) => ({
          ...prev,
          cep: data.cep ?? prev.cep ?? "",
          logradouro: toUpper(data.logradouro || prev.logradouro || ""),
          bairro: toUpper(data.bairro || prev.bairro || ""),
          uf_residencia: data.uf || prev.uf_residencia || "",
          municipio_residencia: toUpper(data.localidade || prev.municipio_residencia || ""),
          codigo_ibge_residencia: data.ibge || prev.codigo_ibge_residencia || "",
        }))} />
    );
  }

  if (name === "data_notificacao" || name === "data" || name === "data_diagnostico_notificacao") {
    return <AutoDateField key={name} name={name} label={f.label} required={f.required} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "semana_epidemiologica" || name === "se" || name === "semana_epi") {
    return <SemanaEpdField key={name} name={name} label={f.label} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "idade") {
    return <IdadeAutoField key={name} name={name} label={f.label} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "faixa_etaria") {
    return <FaixaEtariaField key={name} name={name} label={f.label} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "regional") {
    return <RegionalAutoField key={name} name={name} label={f.label} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "macroregiao" || name === "macro_regiao" || name === "macro_regiao_saude") {
    return <MacroregiaoAutoField key={name} name={name} label={f.label} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "responsavel_digitacao" || name === "investigador" || name === "nome_investigador" || name === "responsavel_preenchimento") {
    return <ResponsavelDigitacaoField key={name} name={name} label="Responsável pela Digitação" col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "telefone" || name === "telefone_contato" || name === "telefone_paciente" || name === "ddd_telefone") {
    return <TelefoneInput key={name} name={name} label={f.label} required={f.required} col={f.col} form={form} setForm={setForm} />;
  }
  if (name === "gestante") {
    return <GestanteSelect key={name} name={name} label={f.label} required={f.required} col={f.col} form={form} setForm={setForm} />;
  }

  return null;
}

