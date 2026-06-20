// Opções (enums) para a ficha de Difteria

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

export const CONTATO_CASO = [
  opt("domicilio", "Domicílio"),
  opt("vizinhanca", "Vizinhança"),
  opt("trabalho", "Trabalho"),
  opt("creche_escola", "Creche/Escola"),
  opt("posto_saude_hospital", "Posto de Saúde/Hospital"),
  opt("outro_estado_municipio", "Outro estado/município"),
  opt("outro", "Outro"),
  opt("sem_historia_contato", "Sem história de contato"),
  opt("ignorado", "Ignorado"),
];

export const DOSES_VACINA = [
  opt("uma", "1 dose"),
  opt("duas", "2 doses"),
  opt("tres", "3 doses"),
  opt("tres_um_reforco", "3 doses + 1 reforço"),
  opt("tres_dois_reforcos", "3 doses + 2 reforços"),
  opt("nunca_vacinado", "Nunca vacinado"),
  opt("ignorado", "Ignorado"),
];

export const MATERIAL_COLETADO = [
  opt("orofaringe", "Orofaringe"),
  opt("nasofaringe", "Nasofaringe"),
  opt("orofaringe_nasofaringe", "Orofaringe e nasofaringe"),
  opt("nao_coletado", "Não coletado"),
  opt("ignorado", "Ignorado"),
];

export const RESULTADO_EXAME = [
  opt("positiva", "Positiva"),
  opt("negativa", "Negativa"),
  opt("nao_realizada", "Não realizada"),
  opt("ignorado", "Ignorado"),
];

export const CASOS_SECUNDARIOS = [
  opt("nenhum", "Nenhum"),
  opt("um", "Um"),
  opt("dois_ou_mais", "Dois ou mais"),
  opt("ignorado", "Ignorado"),
];

export const MEDIDAS_PREVENCAO = [
  opt("bloqueio_vacinal", "Bloqueio vacinal"),
  opt("quimioprofilaxia", "Quimioprofilaxia"),
  opt("ambos", "Ambos"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const CLASSIFICACAO_FINAL = [
  opt("confirmado", "Confirmado"),
  opt("descartado", "Descartado"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("cultura_com_toxigenicidade", "Cultura c/ toxigenicidade"),
  opt("cultura_sem_toxigenicidade", "Cultura s/ toxigenicidade"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("morte_pos_clinica_compativel", "Morte pós-clínica compatível"),
  opt("clinico", "Clínico"),
  opt("necropsia", "Necropsia"),
];

export const EVOLUCAO = [
  opt("cura_com_sequela", "Cura com sequela"),
  opt("cura_sem_sequela", "Cura sem sequela"),
  opt("obito_difteria", "Óbito por difteria"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "edema_ganglionar", label: "Edema ganglionar" },
  { key: "prostacao", label: "Prostração" },
  { key: "edema_pescoco", label: "Edema de pescoço" },
  { key: "pseudomembrana", label: "Pseudomembrana" },
  { key: "febre", label: "Febre" },
  { key: "palidez", label: "Palidez" },
] as const;

export const PSEUDOMEMBRANA_KEYS = [
  { key: "cavidade_nasal", label: "Cavidade nasal" },
  { key: "amigdalas", label: "Amígdalas" },
  { key: "cordao_umbilical", label: "Cordão umbilical" },
  { key: "faringe", label: "Faringe" },
  { key: "laringe", label: "Laringe" },
  { key: "orgaos_genitais", label: "Órgãos genitais" },
  { key: "palato", label: "Palato" },
  { key: "conduto_auditivo", label: "Conduto auditivo" },
  { key: "traqueia", label: "Traqueia" },
  { key: "pele", label: "Pele" },
  { key: "conjuntiva", label: "Conjuntiva" },
] as const;

export const COMPLICACOES_KEYS = [
  { key: "existiram", label: "Existiram complicações" },
  { key: "miocardite", label: "Miocardite" },
  { key: "nefrite", label: "Nefrite" },
  { key: "arritmias_cardiacas", label: "Arritmias cardíacas" },
  { key: "paralisia_musculos_intercostais", label: "Paralisia músculos intercostais" },
  { key: "paralisia_palato", label: "Paralisia do palato" },
  { key: "paralisia_bilateral_extremidades", label: "Paralisia bilateral extremidades" },
] as const;
