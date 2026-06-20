// Opções (enums) para a ficha de Tétano Acidental

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

export const POSSIVEL_CAUSA = [
  opt("injecao", "Injeção"),
  opt("laceracao", "Laceração"),
  opt("queimadura", "Queimadura"),
  opt("cirurgica", "Cirúrgica"),
  opt("perfuracao", "Perfuração"),
  opt("escoriacao", "Escoriação"),
  opt("abortamento_septico", "Abortamento séptico"),
  opt("outros", "Outros"),
  opt("ignorado", "Ignorado"),
];

export const LOCAL_LESAO = [
  opt("membros_inferiores", "Membros inferiores"),
  opt("membros_superiores", "Membros superiores"),
  opt("tronco", "Tronco"),
  opt("cabeca_pescoco", "Cabeça/Pescoço"),
  opt("cavidade_oral", "Cavidade oral"),
  opt("ignorado", "Ignorado"),
];

export const SITUACAO_VACINAL = [
  opt("uma", "1 dose"),
  opt("duas", "2 doses"),
  opt("tres", "3 doses"),
  opt("tres_um_reforco", "3 doses + 1 reforço"),
  opt("tres_dois_reforcos", "3 doses + 2 reforços"),
  opt("nunca_vacinado", "Nunca vacinado"),
  opt("ignorado", "Ignorado"),
];

export const ORIGEM_CASO = [
  opt("notificacao", "Notificação"),
  opt("busca_ativa", "Busca ativa"),
  opt("declaracao_obito", "Declaração de óbito"),
];

export const CLASSIFICACAO_FINAL = [
  opt("confirmado", "Confirmado"),
  opt("descartado", "Descartado"),
];

export const LOCAL_FONTE_INFECCAO = [
  opt("domicilio", "Domicílio"),
  opt("trabalho", "Trabalho"),
  opt("via_publica", "Via pública"),
  opt("escola", "Escola"),
  opt("campo", "Campo"),
  opt("unidade_saude", "Unidade de saúde"),
  opt("outro_local", "Outro local"),
  opt("ignorado", "Ignorado"),
];

export const CASO_AUTOCTONE = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("indeterminado", "Indeterminado"),
];

export const EVOLUCAO = [
  opt("cura", "Cura"),
  opt("obito_tetano_acidental", "Óbito por tétano acidental"),
  opt("obito_outras_causas", "Óbito por outras causas"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const PROFILAXIA_KEYS = [
  { key: "soro_antitetanico", label: "Soro antitetânico" },
  { key: "imunoglobulina", label: "Imunoglobulina" },
  { key: "vacina", label: "Vacina" },
  { key: "antibiotico", label: "Antibiótico" },
  { key: "nenhum", label: "Nenhum" },
] as const;

export const MANIFESTACOES_KEYS = [
  { key: "trismo", label: "Trismo" },
  { key: "riso_sardonico", label: "Riso sardônico" },
  { key: "opistotono", label: "Opistótono" },
  { key: "rigidez_nuca", label: "Rigidez de nuca" },
  { key: "rigidez_abdominal", label: "Rigidez abdominal" },
  { key: "rigidez_membros", label: "Rigidez de membros" },
  { key: "crises_contraturas", label: "Crises de contraturas" },
] as const;

export const MEDIDAS_CONTROLE_KEYS = [
  { key: "identificar_populacao_suscetivel", label: "Identificar população suscetível" },
  { key: "vacinacao_populacao", label: "Vacinação da população" },
  { key: "analise_cobertura_vacinal", label: "Análise da cobertura vacinal" },
] as const;
