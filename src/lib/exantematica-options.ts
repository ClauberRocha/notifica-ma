// Opções (enums) para fichas de Sarampo e Rubéola (exantemáticas)
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

export const CONTATO_CASO = [
  opt("domicilio", "Domicílio"),
  opt("vizinhanca", "Vizinhança"),
  opt("trabalho", "Trabalho"),
  opt("creche_escola", "Creche/Escola"),
  opt("posto_saude_hospital", "Posto de Saúde/Hospital"),
  opt("outro_estado_municipio", "Outro estado/município"),
  opt("sem_historia_contato", "Sem história de contato"),
  opt("outro_pais", "Outro país"),
  opt("ignorado", "Ignorado"),
];

export const SOROLOGIA = [
  opt("reagente", "Reagente"),
  opt("nao_reagente", "Não reagente"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const BLOQUEIO_VACINAL = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("nao_todos_vacinados", "Não, todos vacinados"),
  opt("nao_sem_historia", "Não, sem história"),
  opt("ignorado", "Ignorado"),
];

export const CLASSIFICACAO_FINAL = [
  opt("sarampo", "Sarampo"),
  opt("rubeola", "Rubéola"),
  opt("descartado", "Descartado"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("laboratorial", "Laboratorial"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("clinico", "Clínico"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito_doencas_exantematicas", "Óbito por doenças exantemáticas"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "tosse", label: "Tosse" },
  { key: "coriza", label: "Coriza" },
  { key: "conjuntivite", label: "Conjuntivite" },
  { key: "artralgia_artrite", label: "Artralgia/Artrite" },
  { key: "ganglios_retroauriculares", label: "Gânglios retroauriculares" },
  { key: "dor_retro_ocular", label: "Dor retro-ocular" },
] as const;
