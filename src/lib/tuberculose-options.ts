// Opções (enums) para a ficha de Tuberculose

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

export const TIPO_ENTRADA = [
  opt("caso_novo", "Caso novo"),
  opt("recidiva", "Recidiva"),
  opt("reingresso_apos_abandono", "Reingresso após abandono"),
  opt("nao_sabe", "Não sabe"),
  opt("transferencia", "Transferência"),
  opt("pos_obito", "Pós-óbito"),
];

export const FORMA = [
  opt("pulmonar", "Pulmonar"),
  opt("extrapulmonar", "Extrapulmonar"),
  opt("pulmonar_extrapulmonar", "Pulmonar + Extrapulmonar"),
];

export const SE_EXTRAPULMONAR = [
  opt("pleural", "Pleural"),
  opt("gang_perif", "Ganglionar periférica"),
  opt("geniturinaria", "Geniturinária"),
  opt("ossea", "Óssea"),
  opt("ocular", "Ocular"),
  opt("miliar", "Miliar"),
  opt("meningoencefalico", "Meningoencefálica"),
  opt("cutanea", "Cutânea"),
  opt("laringea", "Laríngea"),
  opt("outra", "Outra"),
];

export const BACILOSCOPIA_ESCARRO = [
  opt("positiva", "Positiva"),
  opt("negativa", "Negativa"),
  opt("nao_realizada", "Não realizada"),
  opt("nao_se_aplica", "Não se aplica"),
];

export const RADIOGRAFIA_TORAX = [
  opt("suspeito", "Suspeito"),
  opt("normal", "Normal"),
  opt("outra_patologia", "Outra patologia"),
  opt("nao_realizado", "Não realizado"),
];

export const HIV = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("em_andamento", "Em andamento"),
  opt("nao_realizado", "Não realizado"),
];

export const TARV = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const HISTOPATOLOGIA = [
  opt("baar_positivo", "BAAR positivo"),
  opt("sugestivo_tb", "Sugestivo de TB"),
  opt("nao_sugestivo_tb", "Não sugestivo de TB"),
  opt("em_andamento", "Em andamento"),
  opt("nao_realizado", "Não realizado"),
];

export const CULTURA = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("em_andamento", "Em andamento"),
  opt("nao_realizado", "Não realizado"),
];

export const TMR_TB = [
  opt("detectavel_sensivel_rifampicina", "Detectável, sensível à rifampicina"),
  opt("detectavel_resistente_rifampicina", "Detectável, resistente à rifampicina"),
  opt("nao_detectavel", "Não detectável"),
  opt("inconclusivo", "Inconclusivo"),
  opt("nao_realizado", "Não realizado"),
];

export const TESTE_SENSIBILIDADE = [
  opt("resistente_isoniazida", "Resistente à isoniazida"),
  opt("resistente_rifampicina", "Resistente à rifampicina"),
  opt("resistente_isoniazida_rifampicina", "Resistente à isoniazida + rifampicina"),
  opt("resistente_outras_drogas_1a_linha", "Resistente a outras drogas de 1ª linha"),
  opt("sensivel", "Sensível"),
  opt("em_andamento", "Em andamento"),
  opt("nao_realizado", "Não realizado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const POPULACOES_KEYS = [
  { key: "populacao_privada_liberdade", label: "População privada de liberdade" },
  { key: "populacao_situacao_rua", label: "População em situação de rua" },
  { key: "profissional_saude", label: "Profissional de saúde" },
  { key: "imigrante", label: "Imigrante" },
  { key: "beneficiario_programa_renda", label: "Beneficiário de programa de renda" },
] as const;

export const DOENCAS_KEYS = [
  { key: "aids", label: "AIDS" },
  { key: "alcoolismo", label: "Alcoolismo" },
  { key: "diabetes", label: "Diabetes" },
  { key: "doenca_mental", label: "Doença mental" },
  { key: "uso_drogas_ilicitas", label: "Uso de drogas ilícitas" },
  { key: "tabagismo", label: "Tabagismo" },
] as const;
