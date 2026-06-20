// Opções (enums) para a ficha de Hanseníase

export const opt = (value: string, label: string) => ({ value, label });

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

export const FORMA_CLINICA = [
  opt("I", "Indeterminada (I)"),
  opt("T", "Tuberculoide (T)"),
  opt("D", "Dimorfa (D)"),
  opt("V", "Virchowiana (V)"),
  opt("nao_classificado", "Não classificado"),
];

export const CLASSIFICACAO_OPERACIONAL = [
  opt("PB", "Paucibacilar (PB)"),
  opt("MB", "Multibacilar (MB)"),
];

export const GRAU_INCAPACIDADE = [
  opt("grau_zero", "Grau 0"),
  opt("grau_I", "Grau I"),
  opt("grau_II", "Grau II"),
  opt("nao_avaliado", "Não avaliado"),
];

export const MODO_ENTRADA = [
  opt("caso_novo", "Caso novo"),
  opt("transferencia_mesmo_municipio", "Transferência mesmo município"),
  opt("transferencia_outro_municipio", "Transferência outro município"),
  opt("transferencia_outro_estado", "Transferência outro estado"),
  opt("transferencia_outro_pais", "Transferência outro país"),
  opt("recidiva", "Recidiva"),
  opt("outros_reingressos", "Outros reingressos"),
  opt("ignorado", "Ignorado"),
];

export const MODO_DETECCAO = [
  opt("encaminhamento", "Encaminhamento"),
  opt("demanda_espontanea", "Demanda espontânea"),
  opt("exame_coletividade", "Exame de coletividade"),
  opt("exame_contatos", "Exame de contatos"),
  opt("outros_modos", "Outros modos"),
  opt("ignorado", "Ignorado"),
];

export const BACILOSCOPIA = [
  opt("positiva", "Positiva"),
  opt("negativa", "Negativa"),
  opt("nao_realizada", "Não realizada"),
  opt("ignorado", "Ignorado"),
];

export const ESQUEMA_TERAPEUTICO = [
  opt("pqt_pb_6doses", "PQT-PB / 6 doses"),
  opt("pqt_mb_12doses", "PQT-MB / 12 doses"),
  opt("outros_esquemas_substitutos", "Outros esquemas substitutos"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];
