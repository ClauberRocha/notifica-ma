/**
 * Chart export helpers extracted from the Painel so that they can be
 * unit/integration tested outside of the full dashboard tree.
 *
 * PNG uses `html2canvas-pro` (dynamically imported so the module stays
 * SSR-safe). SVG serialisation reads the Recharts <svg> that already
 * contains the labels and axis ticks rendered in the DOM, so the exported
 * file mirrors what the user sees, including the black value labels.
 * Tooltips are portalled into <body>, so they are not part of the export
 * surface — that matches user expectation (an export is a static frame).
 */

export function triggerDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export interface ExportResult {
  ok: boolean;
  reason?: "no-svg" | "error";
  filename: string;
}

export async function exportChartPng(
  el: HTMLElement,
  filename: string,
): Promise<ExportResult> {
  try {
    const mod = await import("html2canvas-pro");
    const html2canvas = mod.default;
    const bg =
      (typeof getComputedStyle === "function" &&
        getComputedStyle(document.body).backgroundColor) ||
      "#ffffff";
    const canvas = await html2canvas(el, {
      backgroundColor: bg,
      scale: 2,
      useCORS: true,
    });
    triggerDownload(canvas.toDataURL("image/png"), `${filename}.png`);
    return { ok: true, filename: `${filename}.png` };
  } catch {
    return { ok: false, reason: "error", filename: `${filename}.png` };
  }
}

export function exportChartSvg(
  el: HTMLElement,
  filename: string,
): ExportResult {
  try {
    const svg = el.querySelector("svg.recharts-surface") as SVGSVGElement | null;
    if (!svg) return { ok: false, reason: "no-svg", filename: `${filename}.svg` };

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!clone.getAttribute("width"))
      clone.setAttribute("width", String(svg.clientWidth || 600));
    if (!clone.getAttribute("height"))
      clone.setAttribute("height", String(svg.clientHeight || 300));
    const data = new XMLSerializer().serializeToString(clone);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', data], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true, filename: `${filename}.svg` };
  } catch {
    return { ok: false, reason: "error", filename: `${filename}.svg` };
  }
}
