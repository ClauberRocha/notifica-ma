// Opções para ficha de Febre Amarela
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

export const SOROLOGIA = [
  opt("reagente", "Reagente"),
  opt("nao_reagente", "Não reagente"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const HISTOPAT = [
  opt("compativel", "Compatível"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const POS_NEG = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const CLASSIFICACAO_FINAL = [
  opt("febre_amarela_silvestre", "Febre amarela silvestre"),
  opt("febre_amarela_urbana", "Febre amarela urbana"),
  opt("descartado", "Descartado"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("laboratorial", "Laboratorial"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
];

export const CASO_AUTOCTONE = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("indeterminado", "Indeterminado"),
];

export const ATIVIDADE_INFECCAO = [
  opt("trabalho", "Trabalho"),
  opt("turismo", "Turismo"),
  opt("lazer", "Lazer"),
  opt("ignorado", "Ignorado"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito_febre_amarela", "Óbito por febre amarela"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "dor_abdominal", label: "Dor abdominal" },
  { key: "sinais_hemorragicos", label: "Sinais hemorrágicos" },
  { key: "sinal_faget", label: "Sinal de Faget" },
  { key: "disturbios_renais", label: "Distúrbios renais" },
] as const;
