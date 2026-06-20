// Opções (enums) para a ficha de Tétano Neonatal

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

export const NUM_CONSULTAS_PRENATAL = [
  opt("uma", "1"),
  opt("duas", "2"),
  opt("de_3_a_5", "3 a 5"),
  opt("6_e_mais", "6 ou mais"),
  opt("nenhuma", "Nenhuma"),
  opt("ignorado", "Ignorado"),
];

export const ANTECEDENTES_VACINAIS_MAE = [
  opt("vacinada_cartao", "Vacinada (cartão)"),
  opt("nao_vacinada", "Não vacinada"),
  opt("ignorado", "Ignorado"),
];

export const NUM_GESTACOES = [
  opt("uma", "1"),
  opt("duas", "2"),
  opt("tres", "3"),
  opt("quatro", "4"),
  opt("cinco_e_mais", "5 ou mais"),
  opt("ignorado", "Ignorado"),
];

export const LOCAL_OCORRENCIA_PARTO = [
  opt("hospital", "Hospital"),
  opt("domicilio", "Domicílio"),
  opt("casa_de_parto", "Casa de parto"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const PARTO_ATENDIDO_POR = [
  opt("medico", "Médico"),
  opt("enfermeiro", "Enfermeiro"),
  opt("auxiliar_enfermagem", "Auxiliar de enfermagem"),
  opt("parteira_treinada", "Parteira treinada"),
  opt("parteira_nao_treinada", "Parteira não treinada"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const ORIGEM_CASO = [
  opt("notificacao", "Notificação"),
  opt("busca_ativa", "Busca ativa"),
  opt("declaracao_obito", "Declaração de óbito"),
];

export const LOCAL_RESIDENCIA_COBERTA = [
  opt("pacs", "PACS"),
  opt("psf", "PSF"),
  opt("pacs_psf", "PACS + PSF"),
  opt("nenhum", "Nenhum"),
  opt("outro", "Outro"),
];

export const CLASSIFICACAO_FINAL = [
  opt("confirmado", "Confirmado"),
  opt("descartado", "Descartado"),
];

export const LOCAL_FONTE_INFECCAO = [
  opt("hospital", "Hospital"),
  opt("domicilio", "Domicílio"),
  opt("casa_de_parto", "Casa de parto"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const CASO_AUTOCTONE = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("indeterminado", "Indeterminado"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito_tetano_neonatal", "Óbito por tétano neonatal"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "dificuldade_mamar", label: "Dificuldade para mamar" },
  { key: "trismo", label: "Trismo" },
  { key: "rigidez_nuca", label: "Rigidez de nuca" },
  { key: "choro_excessivo", label: "Choro excessivo" },
  { key: "contratura_labial", label: "Contratura labial" },
  { key: "rigidez_abdominal", label: "Rigidez abdominal" },
  { key: "processo_inflamatorio_umbilical", label: "Processo inflamatório umbilical" },
  { key: "opistotono", label: "Opistótono" },
  { key: "rigidez_membros", label: "Rigidez de membros" },
  { key: "crises_contraturas", label: "Crises de contraturas" },
] as const;

export const MEDIDAS_ADOTADAS_KEYS = [
  { key: "atualizacao_esquema_vacinal_mae", label: "Atualização do esquema vacinal da mãe" },
  { key: "busca_ativa_outros_casos", label: "Busca ativa de outros casos" },
  { key: "cadastro_capacitacao_parteiras", label: "Cadastro/capacitação de parteiras" },
  { key: "analise_cobertura_vacinal", label: "Análise da cobertura vacinal" },
  { key: "orientacao_parturientes", label: "Orientação a parturientes" },
  { key: "divulgacao_autoridades", label: "Divulgação às autoridades" },
] as const;
