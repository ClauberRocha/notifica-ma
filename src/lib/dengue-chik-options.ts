// Listas de opções (enums) para a ficha de Dengue/Chikungunya

export const opt = (value: string, label: string) => ({ value, label });

export const SIM_NAO = [opt("sim", "Sim"), opt("nao", "Não")];

export const SIM_NAO_IGN = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const AGRAVO = [
  opt("dengue", "Dengue"),
  opt("chikungunya", "Chikungunya"),
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

export const ESCOLARIDADE = [
  opt("analfabeto", "Analfabeto"),
  opt("1a_4a_incompleta", "1ª a 4ª série incompleta"),
  opt("4a_completa", "4ª série completa"),
  opt("5a_8a_incompleta", "5ª a 8ª série incompleta"),
  opt("fundamental_completo", "Ensino fundamental completo"),
  opt("medio_incompleto", "Ensino médio incompleto"),
  opt("medio_completo", "Ensino médio completo"),
  opt("superior_incompleto", "Ensino superior incompleto"),
  opt("superior_completo", "Ensino superior completo"),
  opt("ignorado", "Ignorado"),
  opt("nao_se_aplica", "Não se aplica"),
];

export const ZONA = [
  opt("urbana", "Urbana"),
  opt("rural", "Rural"),
  opt("periurbana", "Periurbana"),
  opt("ignorado", "Ignorado"),
];

export const RESULTADO_SOROLOGIA_CHIK = [
  opt("reagente", "Reagente"),
  opt("nao_reagente", "Não reagente"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const RESULTADO_EXAME = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const SOROTIPO = [
  opt("denv1", "DENV-1"),
  opt("denv2", "DENV-2"),
  opt("denv3", "DENV-3"),
  opt("denv4", "DENV-4"),
];

export const CLASSIFICACAO = [
  opt("descartado", "Descartado"),
  opt("dengue", "Dengue"),
  opt("dengue_sinais_alarme", "Dengue com sinais de alarme"),
  opt("dengue_grave", "Dengue grave"),
  opt("chikungunya", "Chikungunya"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("laboratorio", "Laboratório"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("em_investigacao", "Em investigação"),
];

export const CASO_AUTOCTONE = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("indeterminado", "Indeterminado"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito_agravo", "Óbito pelo agravo"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("obito_em_investigacao", "Óbito em investigação"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_CLINICOS_KEYS = [
  { key: "febre", label: "Febre" },
  { key: "mialgia", label: "Mialgia" },
  { key: "cefaleia", label: "Cefaleia" },
  { key: "nauseas", label: "Náuseas" },
  { key: "vomito", label: "Vômito" },
  { key: "exantema", label: "Exantema" },
  { key: "artrite", label: "Artrite" },
  { key: "artralgia_intensa", label: "Artralgia intensa" },
  { key: "dor_costas", label: "Dor nas costas" },
  { key: "conjuntivite", label: "Conjuntivite" },
  { key: "petequias", label: "Petéquias" },
  { key: "leucopenia", label: "Leucopenia" },
  { key: "prova_laco_positiva", label: "Prova do laço positiva" },
  { key: "dor_retroorbital", label: "Dor retro-orbital" },
] as const;

export const DOENCAS_PREEXISTENTES_KEYS = [
  { key: "diabetes", label: "Diabetes" },
  { key: "hipertensao", label: "Hipertensão" },
  { key: "doencas_autoimunes", label: "Doenças autoimunes" },
  { key: "doencas_hematologicas", label: "Doenças hematológicas" },
  { key: "doenca_acido_peptica", label: "Doença ácido-péptica" },
  { key: "hepatopatias", label: "Hepatopatias" },
  { key: "doenca_renal_cronica", label: "Doença renal crônica" },
] as const;
