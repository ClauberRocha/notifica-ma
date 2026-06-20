// Opções (enums) para a ficha de Surto de DTA

export const opt = (value: string, label: string) => ({ value, label });

export const SIM_NAO_IGN = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const LOCAL_INICIAL_OCORRENCIA = [
  opt("residencia", "Residência"),
  opt("hospital_unidade_saude", "Hospital / Unidade de saúde"),
  opt("creche_escola", "Creche / Escola"),
  opt("asilo", "Asilo"),
  opt("outras_instituicoes", "Outras instituições"),
  opt("restaurante_padaria", "Restaurante / Padaria"),
  opt("eventos", "Eventos"),
  opt("casos_dispersos_bairro", "Casos dispersos no bairro"),
  opt("casos_dispersos_municipio", "Casos dispersos no município"),
  opt("casos_dispersos_multiplos_municipios", "Casos dispersos em múltiplos municípios"),
  opt("outros", "Outros"),
];

export const ZONA = [
  opt("urbana", "Urbana"),
  opt("rural", "Rural"),
  opt("periurbana", "Periurbana"),
  opt("ignorado", "Ignorado"),
];

export const MODO_TRANSMISSAO = [
  opt("direta_pessoa_pessoa", "Direta (pessoa-pessoa)"),
  opt("indireta_veiculo_vetor", "Indireta (veículo/vetor)"),
  opt("ignorado", "Ignorado"),
];

export const VEICULO_TRANSMISSAO = [
  opt("alimento_agua", "Alimento / Água"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("laboratorial_clinico", "Laboratorial clínico"),
  opt("laboratorial_bromatologico", "Laboratorial bromatológico"),
  opt("laboratorial_clinico_bromatologico", "Laboratorial clínico e bromatológico"),
  opt("inconclusivo", "Inconclusivo"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "nauseas", label: "Náuseas" },
  { key: "vomitos", label: "Vômitos" },
  { key: "diarreia", label: "Diarreia" },
  { key: "cefaleia", label: "Cefaleia" },
  { key: "dor_abdominal", label: "Dor abdominal" },
  { key: "neurologicos", label: "Neurológicos" },
  { key: "febre", label: "Febre" },
  { key: "outros", label: "Outros" },
] as const;

export const FATORES_CAUSAIS_KEYS = [
  { key: "materia_prima_impropria", label: "Matéria-prima imprópria" },
  { key: "manipulacao_preparacao_inadequada", label: "Manipulação/preparação inadequada" },
  { key: "conservacao_inadequada", label: "Conservação inadequada" },
] as const;
