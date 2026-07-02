/**
 * Gating helpers for the Painel screen.
 *
 * The global "agravo" filter drives whether analysis tabs render content
 * or their empty-state placeholder, and whether per-agravo queries execute.
 * Keeping these rules in a pure module makes it possible to verify the
 * select/clear cycle without booting the full dashboard.
 */

export const ANALYSIS_TABS = [
  "dashboard",
  "analise",
  "mapa",
  "alertas",
  "indicadores",
  "municipios",
  "relatorios",
] as const;

export type AnalysisTab = (typeof ANALYSIS_TABS)[number];

/** Normalises the sentinel values used by the Select ("", "all"). */
export function hasAgravoSelected(selectedAgravo: string | null | undefined): boolean {
  return !!selectedAgravo && selectedAgravo !== "all";
}

/** True when the tab should render its "select an agravo" placeholder. */
export function shouldShowPlaceholder(
  tab: AnalysisTab,
  selectedAgravo: string | null | undefined,
): boolean {
  return !hasAgravoSelected(selectedAgravo);
}

/** True when the per-agravo query for `agravoKey` should execute. */
export function shouldRunAgravoQuery(
  selectedAgravo: string | null | undefined,
  agravoKey: string,
): boolean {
  return hasAgravoSelected(selectedAgravo) && selectedAgravo === agravoKey;
}
