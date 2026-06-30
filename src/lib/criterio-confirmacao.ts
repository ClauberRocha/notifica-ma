/**
 * Mapeamento canônico de Critérios de Confirmação.
 *
 * A ordem e as chaves desta lista são CONTRATO: o gráfico de Critérios de
 * Confirmação (painel.tsx) e quaisquer relatórios devem sempre usar
 * exatamente estas labels, nesta ordem. Alterações exigem atualização dos
 * testes em `criterio-confirmacao.test.ts`.
 */
export const CRITERIO_CONFIRMACAO_KEYS = [
  "QUIMIOCITOLOGICO",
  "PCR",
  "CLINICO",
  "CULTURA",
  "NECROPSIA",
  "OUTROS",
  "EM INVESTIGAÇÃO",
  "ISOLAMENTO VIRAL",
  "BACTERIOSCOPIA",
] as const;

export type CriterioConfirmacaoKey = (typeof CRITERIO_CONFIRMACAO_KEYS)[number];

/** Cria um contador inicializado em zero, preservando a ordem canônica. */
export function createCriterioCounts(): Record<CriterioConfirmacaoKey, number> {
  const counts = {} as Record<CriterioConfirmacaoKey, number>;
  for (const key of CRITERIO_CONFIRMACAO_KEYS) counts[key] = 0;
  return counts;
}

/**
 * Classifica um registro em uma das chaves canônicas.
 * Usado para TODOS os agravos — não há ramo específico por doença.
 */
export function classifyCriterio(record: {
  status?: string | null;
  criterio_confirmacao?: string | null;
}): CriterioConfirmacaoKey {
  if (
    record.status === "em_investigacao" ||
    record.status === "EM INVESTIGAÇÃO"
  ) {
    return "EM INVESTIGAÇÃO";
  }

  const crit = String(record.criterio_confirmacao || "").toLowerCase().trim();

  if (!crit) return "OUTROS";
  if (crit === "bacterioscopia" || crit.includes("bacterio")) return "BACTERIOSCOPIA";
  if (
    crit === "clinico" ||
    crit === "clinico_epidemiologico" ||
    crit.includes("clinico") ||
    crit.includes("epidemio")
  ) return "CLINICO";
  if (crit === "cultura") return "CULTURA";
  if (crit === "isolamento_viral" || crit.includes("viral")) return "ISOLAMENTO VIRAL";
  if (crit === "necropsia" || crit.includes("necro")) return "NECROPSIA";
  if (crit === "pcr") return "PCR";
  if (
    crit === "quimiocitologico_liquor" ||
    crit.includes("quimio") ||
    crit.includes("liquor")
  ) return "QUIMIOCITOLOGICO";
  return "OUTROS";
}

/**
 * Agrega registros em pares [label, count] preservando a ordem canônica.
 * Retorno tipado como tupla para compatibilidade com consumidores que
 * dependem da ordem (gráfico de Critérios de Confirmação).
 */
export function buildCriterioData(
  records: ReadonlyArray<{ status?: string | null; criterio_confirmacao?: string | null }>,
): Array<[CriterioConfirmacaoKey, number]> {
  const counts = createCriterioCounts();
  for (const r of records) counts[classifyCriterio(r)]++;
  return CRITERIO_CONFIRMACAO_KEYS.map((k) => [k, counts[k]]);
}

/**
 * Guarda de runtime: valida que um conjunto de pares respeita a ordem e as
 * chaves canônicas. Lança em desenvolvimento para prevenir regressões.
 */
export function assertCriterioOrder(
  data: ReadonlyArray<readonly [string, number]>,
): void {
  if (data.length !== CRITERIO_CONFIRMACAO_KEYS.length) {
    throw new Error(
      `[criterio-confirmacao] esperado ${CRITERIO_CONFIRMACAO_KEYS.length} chaves, recebido ${data.length}`,
    );
  }
  for (let i = 0; i < CRITERIO_CONFIRMACAO_KEYS.length; i++) {
    if (data[i][0] !== CRITERIO_CONFIRMACAO_KEYS[i]) {
      throw new Error(
        `[criterio-confirmacao] ordem incorreta em ${i}: esperado "${CRITERIO_CONFIRMACAO_KEYS[i]}", recebido "${data[i][0]}"`,
      );
    }
  }
}
