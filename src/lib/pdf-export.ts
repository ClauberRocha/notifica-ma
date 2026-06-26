/**
 * Exportação de PDF a partir de um elemento DOM.
 *
 * Usa `html2canvas-pro` (fork compatível com funções de cor modernas:
 * `oklch()`, `lab()`, `lch()`, `color()`), evitando o erro
 * "Attempting to parse an unsupported color function 'oklch'" do html2canvas
 * original ao processar temas do Tailwind v4 / shadcn.
 *
 * Os logs (console.info/warn/error com prefixo [pdf-export]) permitem
 * diagnosticar falhas por etapa em diferentes navegadores.
 */

export type PdfExportLogLevel = "info" | "warn" | "error";

export interface PdfExportLogEntry {
  level: PdfExportLogLevel;
  step: string;
  message: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface PdfExportResult {
  ok: boolean;
  filename?: string;
  pages?: number;
  totalMs: number;
  logs: PdfExportLogEntry[];
  error?: string;
}

export interface PdfExportOptions {
  /** Nome do arquivo sem extensão. */
  filename?: string;
  /** Escala do canvas (default 2). */
  scale?: number;
  /** Cor de fundo do canvas. */
  backgroundColor?: string;
  /** Sink customizado de log (default = console). */
  onLog?: (entry: PdfExportLogEntry) => void;
  /**
   * Injeções para teste — permitem mockar bibliotecas pesadas.
   * Em produção, deixe undefined; o módulo importa dinamicamente.
   */
  _loadHtml2Canvas?: () => Promise<typeof import("html2canvas-pro").default>;
  _loadJsPdf?: () => Promise<typeof import("jspdf").default>;
}

// Funções de cor que o html2canvas (original) não entende. Mantemos uma
// detecção preventiva para emitir warning útil em logs cross-browser.
const MODERN_COLOR_FN = /\b(oklch|oklab|lab|lch|color)\s*\(/i;

/**
 * Faz um diagnóstico rápido de quais funções de cor modernas aparecem
 * no subtree — útil para validar que o navegador realmente devolve
 * `oklch(...)` em getComputedStyle (alguns serializam para rgb).
 */
export function detectModernColorFns(root: Element): string[] {
  const found = new Set<string>();
  const walk = (el: Element) => {
    const cs = (el.ownerDocument.defaultView ?? window).getComputedStyle(el);
    for (const prop of ["color", "background-color", "border-color"]) {
      const v = cs.getPropertyValue(prop);
      const m = v.match(MODERN_COLOR_FN);
      if (m) found.add(m[1].toLowerCase());
    }
    for (const child of Array.from(el.children)) walk(child);
  };
  walk(root);
  return Array.from(found);
}

export async function exportElementToPdf(
  node: HTMLElement | null,
  options: PdfExportOptions = {},
): Promise<PdfExportResult> {
  const t0 = performance.now();
  const logs: PdfExportLogEntry[] = [];
  const log = (entry: PdfExportLogEntry) => {
    logs.push(entry);
    const line = `[pdf-export] ${entry.step}: ${entry.message}`;
    if (options.onLog) options.onLog(entry);
    else if (entry.level === "error") console.error(line, entry.meta ?? "");
    else if (entry.level === "warn") console.warn(line, entry.meta ?? "");
    else console.info(line, entry.meta ?? "");
  };

  if (!node) {
    const totalMs = performance.now() - t0;
    log({ level: "error", step: "validate", message: "Elemento alvo inexistente." });
    return { ok: false, error: "Elemento alvo inexistente.", totalMs, logs };
  }

  try {
    // 1) Pre-flight: detectar funções de cor modernas e UA do navegador
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    const detected = detectModernColorFns(node);
    log({
      level: "info",
      step: "preflight",
      message: `UA="${ua}" cores modernas detectadas=${detected.join(",") || "nenhuma"}`,
      meta: { ua, detected },
    });

    // 2) Carregar libs
    const tLoad = performance.now();
    const loadH2C =
      options._loadHtml2Canvas ??
      (async () => (await import("html2canvas-pro")).default);
    const loadJs =
      options._loadJsPdf ?? (async () => (await import("jspdf")).default);
    const [html2canvas, JsPdfCtor] = await Promise.all([loadH2C(), loadJs()]);
    log({
      level: "info",
      step: "load-libs",
      message: "html2canvas-pro + jspdf carregados",
      durationMs: performance.now() - tLoad,
    });

    // 3) Render canvas
    const tCanvas = performance.now();
    const canvas = await html2canvas(node, {
      scale: options.scale ?? 2,
      backgroundColor: options.backgroundColor ?? "#ffffff",
      useCORS: true,
      logging: false,
    });
    log({
      level: "info",
      step: "rasterize",
      message: `canvas ${canvas.width}x${canvas.height}`,
      durationMs: performance.now() - tCanvas,
      meta: { width: canvas.width, height: canvas.height },
    });

    // 4) Paginação PDF
    const tPdf = performance.now();
    const imgData = canvas.toDataURL("image/png");
    const pdf = new JsPdfCtor({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    let pages = 1;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pages++;
    }
    const safe = (options.filename ?? "documento")
      .replace(/[^a-z0-9_-]+/gi, "_")
      .toLowerCase();
    const filename = `${safe}.pdf`;
    pdf.save(filename);
    log({
      level: "info",
      step: "save",
      message: `PDF salvo (${pages} página(s)) como ${filename}`,
      durationMs: performance.now() - tPdf,
      meta: { pages, filename },
    });

    const totalMs = performance.now() - t0;
    log({ level: "info", step: "done", message: `OK em ${totalMs.toFixed(0)}ms` });
    return { ok: true, filename, pages, totalMs, logs };
  } catch (e) {
    const err = e as Error;
    const totalMs = performance.now() - t0;
    const isColorErr = /color function|oklch|oklab|lab|lch/i.test(err.message);
    log({
      level: "error",
      step: "fail",
      message: err.message,
      meta: {
        name: err.name,
        isColorParseError: isColorErr,
        hint: isColorErr
          ? "Atualize html2canvas-pro ou converta a cor para rgb()."
          : undefined,
      },
    });
    return { ok: false, error: err.message, totalMs, logs };
  }
}
