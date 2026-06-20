// Opções (enums) para a ficha de SRAG / Influenza

export const opt = (value: string, label: string) => ({ value, label });

export const SIM_NAO_IGN = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const TIPO_IDADE = [
  opt("hora", "Hora"),
  opt("dia", "Dia"),
  opt("mes", "Mês"),
  opt("ano", "Ano"),
];

export const SEXO = [
  opt("masculino", "Masculino"),
  opt("feminino", "Feminino"),
  opt("ignorado", "Ignorado"),
];

export const GESTANTE = [
  opt("1_trimestre", "1º trimestre"),
  opt("2_trimestre", "2º trimestre"),
  opt("3_trimestre", "3º trimestre"),
  opt("idade_gestacional_ignorada", "Idade gestacional ignorada"),
  opt("nao", "Não"),
  opt("nao_se_aplica", "Não se aplica"),
  opt("ignorado", "Ignorado"),
];

export const RACA_COR = [
  opt("branca", "Branca"),
  opt("preta", "Preta"),
  opt("amarela", "Amarela"),
  opt("parda", "Parda"),
  opt("indigena", "Indígena"),
  opt("ignorado", "Ignorado"),
];

export const ZONA = [
  opt("urbana", "Urbana"),
  opt("rural", "Rural"),
  opt("periurbana", "Periurbana"),
  opt("ignorado", "Ignorado"),
];

export const USO_ANTIVIRAL = [
  opt("nao_usou", "Não usou"),
  opt("oseltamivir", "Oseltamivir"),
  opt("zanamivir", "Zanamivir"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const RAIO_X = [
  opt("normal", "Normal"),
  opt("infiltrado_intersticial", "Infiltrado intersticial"),
  opt("consolidacao", "Consolidação"),
  opt("misto", "Misto"),
  opt("outro", "Outro"),
  opt("nao_realizado", "Não realizado"),
  opt("ignorado", "Ignorado"),
];

export const SUPORTE_VENTILATORIO = [
  opt("nao_usou", "Não usou"),
  opt("sim_invasivo", "Sim, invasivo"),
  opt("sim_nao_invasivo", "Sim, não invasivo"),
  opt("ignorado", "Ignorado"),
];

export const TIPO_AMOSTRA = [
  opt("nao_coletou", "Não coletou"),
  opt("secrecao_oro_nasofaringe", "Secreção oro/nasofaringe"),
  opt("tecido_post_mortem", "Tecido post mortem"),
  opt("lavado_bronco_alveolar", "Lavado bronco-alveolar"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const RESULTADO_LAB = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const SUBTIPO_INFLUENZA_A = [
  opt("h1n1pdm09", "H1N1pdm09"),
  opt("h1_sazonal", "H1 sazonal"),
  opt("h3_sazonal", "H3 sazonal"),
  opt("a_nao_subtipado", "A não subtipado"),
  opt("h3n2v", "H3N2v"),
  opt("outro", "Outro"),
];

export const CLASSIFICACAO_FINAL = [
  opt("srag_influenza", "SRAG por Influenza"),
  opt("srag_outros_virus_respiratorios", "SRAG por outros vírus respiratórios"),
  opt("srag_outros_agentes", "SRAG por outros agentes"),
  opt("srag_nao_especificada", "SRAG não especificada"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("laboratorial", "Laboratorial"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("clinico", "Clínico"),
];

export const EVOLUCAO = [
  opt("alta_cura", "Alta / Cura"),
  opt("obito", "Óbito"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "febre", label: "Febre" },
  { key: "tosse", label: "Tosse" },
  { key: "dor_garganta", label: "Dor de garganta" },
  { key: "dispneia", label: "Dispneia" },
  { key: "mialgia", label: "Mialgia" },
  { key: "saturacao_o2_menor_95", label: "Saturação O₂ < 95%" },
  { key: "desconforto_respiratorio", label: "Desconforto respiratório" },
] as const;

export const FATORES_RISCO_KEYS = [
  { key: "pneumopatias_cronicas", label: "Pneumopatias crônicas" },
  { key: "doenca_cardiovascular", label: "Doença cardiovascular" },
  { key: "doenca_hepatica", label: "Doença hepática" },
  { key: "doenca_renal", label: "Doença renal" },
  { key: "doenca_neurologica", label: "Doença neurológica" },
  { key: "sindrome_down", label: "Síndrome de Down" },
  { key: "diabetes", label: "Diabetes" },
  { key: "imunodeficiencia", label: "Imunodeficiência" },
  { key: "puerperio", label: "Puerpério" },
  { key: "obesidade", label: "Obesidade" },
] as const;

export const DIAG_ETIOLOGICO_KEYS = [
  { key: "influenza_a", label: "Influenza A" },
  { key: "influenza_b", label: "Influenza B" },
  { key: "vsr", label: "VSR" },
  { key: "parainfluenza1", label: "Parainfluenza 1" },
  { key: "adenovirus", label: "Adenovírus" },
] as const;
