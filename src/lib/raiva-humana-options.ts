// Opções (enums) para a ficha de Raiva Humana

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

export const FERIMENTO = [
  opt("unico", "Único"),
  opt("multiplo", "Múltiplo"),
  opt("sem_ferimento", "Sem ferimento"),
  opt("ignorado", "Ignorado"),
];

export const TIPO_TRATAMENTO_ANTERIOR = [
  opt("pre_exposicao", "Pré-exposição"),
  opt("pos_exposicao", "Pós-exposição"),
];

export const ESPECIE_ANIMAL = [
  opt("canina", "Canina"),
  opt("felina", "Felina"),
  opt("quioptera_morcego", "Quiróptera (morcego)"),
  opt("primata_macaco", "Primata (macaco)"),
  opt("raposa", "Raposa"),
  opt("herbivora", "Herbívora"),
  opt("outra", "Outra"),
  opt("ignorado", "Ignorado"),
];

export const INFILTRACAO_SORO = [
  opt("sim_total", "Sim, total"),
  opt("sim_parcial", "Sim, parcial"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const RESULTADO_LAB = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const CLASSIFICACAO_FINAL = [
  opt("confirmado", "Confirmado"),
  opt("descartado", "Descartado"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("laboratorio", "Laboratório"),
  opt("obito_clinica_compativel", "Óbito c/ clínica compatível"),
  opt("evolucao_clinica_incompativel", "Evolução clínica incompatível"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito", "Óbito"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const TIPO_EXPOSICAO_KEYS = [
  { key: "arranhao", label: "Arranhão" },
  { key: "lambedura", label: "Lambedura" },
  { key: "mordedura", label: "Mordedura" },
  { key: "contato_indireto", label: "Contato indireto" },
] as const;

export const LOCALIZACAO_EXPOSICAO_KEYS = [
  { key: "mucosa", label: "Mucosa" },
  { key: "cabeca_pescoco", label: "Cabeça/Pescoço" },
  { key: "maos", label: "Mãos" },
  { key: "pes", label: "Pés" },
  { key: "tronco", label: "Tronco" },
  { key: "membros_superiores", label: "Membros superiores" },
  { key: "membros_inferiores", label: "Membros inferiores" },
] as const;

export const TIPO_FERIMENTO_KEYS = [
  { key: "profundo", label: "Profundo" },
  { key: "superficial", label: "Superficial" },
  { key: "dilacerante", label: "Dilacerante" },
] as const;

export const SINAIS_SINTOMAS_KEYS = [
  { key: "aerofobia", label: "Aerofobia" },
  { key: "hidrofobia", label: "Hidrofobia" },
  { key: "disfagia", label: "Disfagia" },
  { key: "parestesia", label: "Parestesia" },
  { key: "paralisia", label: "Paralisia" },
  { key: "agitacao_psicomotora", label: "Agitação psicomotora" },
  { key: "agressividade", label: "Agressividade" },
  { key: "febre", label: "Febre" },
] as const;

export const DIAG_LAB_KEYS = [
  { key: "imunofluorescencia_direta", label: "Imunofluorescência direta" },
  { key: "histologico", label: "Histológico" },
  { key: "prova_biologica", label: "Prova biológica" },
  { key: "imunofluorescencia_indireta", label: "Imunofluorescência indireta" },
] as const;
