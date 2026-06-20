// Opções para a ficha de Epizootia
export const opt = (value: string, label: string) => ({ value, label });

export const SIM_NAO_IGN = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const ZONA = [
  opt("urbana", "Urbana"),
  opt("rural", "Rural"),
  opt("periurbana", "Periurbana"),
  opt("ignorado", "Ignorado"),
];

export const AMBIENTE = [
  opt("domicilio", "Domicílio"),
  opt("parque_praca_zoologico", "Parque/Praça/Zoológico"),
  opt("area_silvestre", "Área silvestre"),
  opt("reserva_ecologica", "Reserva ecológica"),
  opt("outro", "Outro"),
];

export const TIPO_ANIMAL = [
  opt("ave", "Ave"),
  opt("bovideo", "Bovídeo"),
  opt("canino", "Canino"),
  opt("equideo", "Equídeo"),
  opt("felino", "Felino"),
  opt("morcego", "Morcego"),
  opt("primata_nao_humano", "Primata não humano"),
  opt("canideo_selvagem", "Canídeo selvagem"),
  opt("outros", "Outros"),
];

export const SUSPEITA = [
  opt("raiva", "Raiva"),
  opt("encefalite_equina", "Encefalite equina"),
  opt("febre_virus_nilo", "Febre do vírus do Nilo"),
  opt("encefalite_espongiforme_bovina", "Encefalite espongiforme bovina"),
  opt("febre_amarela", "Febre amarela"),
  opt("influenza_aviaria", "Influenza aviária"),
  opt("outro", "Outro"),
];

export const RESULTADO_LAB = [
  opt("positivo", "Positivo"),
  opt("negativo", "Negativo"),
  opt("inconclusivo", "Inconclusivo"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const MATERIAL_KEYS = [
  { key: "figado", label: "Fígado" },
  { key: "rim", label: "Rim" },
  { key: "baco", label: "Baço" },
  { key: "cerebro", label: "Cérebro" },
  { key: "coracao", label: "Coração" },
  { key: "fezes", label: "Fezes" },
  { key: "soro", label: "Soro" },
  { key: "sangue_total", label: "Sangue total" },
] as const;

export const RESULTADO_KEYS = [
  { key: "raiva", label: "Raiva" },
  { key: "encefalite_equina", label: "Encefalite equina" },
  { key: "febre_nilo", label: "Febre do Nilo" },
  { key: "encefalite_espongiforme", label: "Encefalite espongiforme" },
  { key: "febre_amarela", label: "Febre amarela" },
  { key: "influenza_aviaria", label: "Influenza aviária" },
] as const;
