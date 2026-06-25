// Helpers para importação de fichas de Meningite de arquivo CSV

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let col = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          col += '"';
          i++; // pular segunda aspa
        } else {
          inQuotes = false;
        }
      } else {
        col += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(col);
        col = "";
      } else if (c === "\r" || c === "\n") {
        row.push(col);
        col = "";
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          lines.push(row);
        }
        row = [];
        if (c === "\r" && next === "\n") {
          i++; // pular \n
        }
      } else {
        col += c;
      }
    }
  }
  if (col !== "" || row.length > 0) {
    row.push(col);
    lines.push(row);
  }
  return lines;
}

export function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9_]/g, " ") // substitui não-alfanumérico por espaço
    .replace(/\s+/g, " ") // colapsa múltiplos espaços
    .trim();
}

export function normalizeText(val: string): string {
  return (val ?? "")
    .trim()
    .toUpperCase();
}

export function normalizeIbge(val: string): string {
  return (val ?? "")
    .replace(/\D/g, "") // remove caracteres não numéricos
    .trim();
}

export function parseDateToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Qualquer outro formato que Date entenda
  const dateObj = new Date(cleaned);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().split("T")[0];
  }
  return null;
}

export const FIELD_MAPPING: Record<string, string[]> = {
  numero_ficha: ["numero_ficha", "nº da ficha", "n da ficha", "ficha", "numero ficha", "n_ficha", "nu_notific"],
  data_notificacao: ["data_notificacao", "data da notificação", "data da notificacao", "data notificacao", "dt_notific", "data_notific"],
  semana_epidemiologica: ["semana_epidemiologica", "semana epidemiológica", "semana epidemiologica", "semana", "sem_not", "semana_notificacao"],
  data_primeiros_sintomas: ["data_primeiros_sintomas", "data dos primeiros sintomas", "primeiros sintomas", "dt_sin_pri", "dt_sintomas"],
  uf_notificacao: ["uf_notificacao", "uf da notificação", "uf da notificacao", "sg_uf_not", "uf_notif"],
  municipio_notificacao: ["municipio_notificacao", "município da notificação", "municipio da notificacao", "id_municip", "municipio_notif"],
  codigo_ibge_notificacao: ["codigo_ibge_notificacao", "código ibge notificação", "codigo ibge notificacao", "co_mun_not", "ibge_notif"],
  regional: ["regional", "regional_saude", "id_rg_res", "regional_notificacao"],
  macroregiao: ["macroregiao", "macrorregiao", "macroregião"],
  unidade_saude: ["unidade_saude", "unidade de saúde", "unidade de saude", "id_unidade", "nome_unidade"],
  codigo_unidade_saude: ["codigo_unidade_saude", "código da unidade", "codigo da unidade", "co_uni_not", "cnes"],
  nome_paciente: ["nome_paciente", "nome do paciente", "paciente", "nome", "nm_paciente"],
  data_nascimento: ["data_nascimento", "data de nascimento", "nascimento", "dt_nasc"],
  idade: ["idade", "faixa_etaria_calculada", "nu_idade_n"],
  sexo: ["sexo", "cs_sexo"],
  gestante: ["gestante", "cs_gestant"],
  raca_cor: ["raca_cor", "raça/cor", "raca/cor", "cs_raca"],
  escolaridade: ["escolaridade", "cs_escola_n"],
  numero_cartao_sus: ["numero_cartao_sus", "cartão sus", "cartao sus", "sus", "num_sus"],
  nome_mae: ["nome_mae", "nome da mãe", "nome da mae", "mae", "nm_mae_pac"],
  uf_residencia: ["uf_residencia", "uf", "sg_uf_res", "uf_res"],
  municipio_residencia: ["municipio_residencia", "município", "municipio", "id_mn_resi", "municipio_res"],
  codigo_ibge_residencia: ["codigo_ibge_residencia", "co_mun_res", "ibge_res"],
  cep: ["cep", "nu_cep"],
  distrito: ["distrito", "id_distrit"],
  bairro: ["bairro", "id_bairro"],
  logradouro: ["logradouro", "nm_logrado"],
  numero_endereco: ["numero_endereco", "número", "numero", "nu_numero"],
  complemento: ["complemento", "nm_complem"],
  ponto_referencia: ["ponto_referencia"],
  telefone: ["telefone", "nu_telefon"],
  zona: ["zona", "cs_zona"],
  pais: ["pais", "id_pais"],
  data_investigacao: ["data_investigacao", "data da investigação", "data da investigacao", "dt_invest"],
  ocupacao: ["ocupacao", "id_ocupa_n", "ocupacao_paciente"]
};
