/**
 * @vitest-environment jsdom
 *
 * Testes da rotina de exportação de PDF.
 *
 * Foco: garantir que cores modernas do Tailwind v4 (oklch/lab/lch) não
 * quebram a exportação. As libs pesadas (html2canvas-pro, jspdf) são
 * injetadas via _loadHtml2Canvas / _loadJsPdf — jsdom não tem canvas real,
 * então a unidade testada é a orquestração, validação, logs e tratamento
 * de erros de parser de cor. A compatibilidade real com `oklch` vem do
 * fork html2canvas-pro (declarado em package.json).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  detectModernColorFns,
  exportElementToPdf,
  type PdfExportLogEntry,
} from "./pdf-export";

function mountWith(style: Record<string, string>) {
  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.id = "pdf-root";
  Object.assign(root.style, style);
  root.textContent = "conteúdo";
  // filho com cor diferente
  const child = document.createElement("span");
  Object.assign(child.style, { color: style.color ?? "rgb(0,0,0)" });
  child.textContent = "filho";
  root.appendChild(child);
  document.body.appendChild(root);
  return root;
}

function fakeLibs() {
  const addImage = vi.fn();
  const addPage = vi.fn();
  const save = vi.fn();
  const JsPdfCtor = vi.fn().mockImplementation(() => ({
    addImage,
    addPage,
    save,
    internal: {
      pageSize: { getWidth: () => 595, getHeight: () => 842 },
    },
  }));
  const html2canvas = vi.fn().mockResolvedValue({
    width: 1190,
    height: 1684,
    toDataURL: () => "data:image/png;base64,AAAA",
  });
  return {
    _loadHtml2Canvas: () => Promise.resolve(html2canvas as never),
    _loadJsPdf: () => Promise.resolve(JsPdfCtor as never),
    spies: { html2canvas, JsPdfCtor, addImage, addPage, save },
  };
}

describe("detectModernColorFns", () => {
  beforeEach(() => (document.body.innerHTML = ""));

  it("detecta oklch quando o navegador devolve a função literal", () => {
    const root = mountWith({ color: "oklch(0.7 0.2 250)" });
    // jsdom serializa cores; forçamos via getComputedStyle stub
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (p: string) =>
        p === "color" ? "oklch(0.7 0.2 250)" : "",
    } as unknown as CSSStyleDeclaration);
    expect(detectModernColorFns(root)).toContain("oklch");
  });

  it("retorna lista vazia quando só há rgb", () => {
    const root = mountWith({ color: "rgb(0,0,0)" });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "rgb(0,0,0)",
    } as unknown as CSSStyleDeclaration);
    expect(detectModernColorFns(root)).toEqual([]);
  });
});

describe("exportElementToPdf", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("falha graciosamente quando o nó é nulo", async () => {
    const r = await exportElementToPdf(null);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/inexistente/);
    expect(r.logs.find((l) => l.step === "validate")?.level).toBe("error");
  });

  it("gera 1 página quando conteúdo cabe", async () => {
    const root = mountWith({ color: "rgb(0,0,0)" });
    const libs = fakeLibs();
    const r = await exportElementToPdf(root, {
      filename: "Teste 01",
      onLog: () => {},
      ...libs,
    });
    expect(r.ok).toBe(true);
    expect(r.pages).toBe(1);
    expect(r.filename).toBe("teste_01.pdf");
    expect(libs.spies.html2canvas).toHaveBeenCalledOnce();
    expect(libs.spies.addImage).toHaveBeenCalledTimes(1);
    expect(libs.spies.save).toHaveBeenCalledWith("teste_01.pdf");
  });

  it("pagina quando a imagem excede a altura A4", async () => {
    const root = mountWith({});
    const libs = fakeLibs();
    // canvas muito alto → várias páginas
    libs.spies.html2canvas.mockResolvedValueOnce({
      width: 1190,
      height: 1684 * 3,
      toDataURL: () => "data:image/png;base64,AAAA",
    });
    const r = await exportElementToPdf(root, { onLog: () => {}, ...libs });
    expect(r.ok).toBe(true);
    expect(r.pages).toBeGreaterThanOrEqual(3);
    expect(libs.spies.addPage).toHaveBeenCalled();
  });

  it("não lança quando o elemento tem oklch/lab — html2canvas-pro processa", async () => {
    const root = mountWith({ color: "oklch(0.7 0.2 250)" });
    const libs = fakeLibs();
    const r = await exportElementToPdf(root, { onLog: () => {}, ...libs });
    expect(r.ok).toBe(true);
  });

  it("captura erro do parser de cor e marca isColorParseError nos logs", async () => {
    const root = mountWith({ color: "oklch(0.7 0.2 250)" });
    const libs = fakeLibs();
    libs.spies.html2canvas.mockRejectedValueOnce(
      new Error('Attempting to parse an unsupported color function "oklch"'),
    );
    const entries: PdfExportLogEntry[] = [];
    const r = await exportElementToPdf(root, {
      onLog: (e) => entries.push(e),
      ...libs,
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/oklch/);
    const fail = entries.find((l) => l.step === "fail");
    expect(fail?.meta?.isColorParseError).toBe(true);
    expect(fail?.meta?.hint).toMatch(/html2canvas-pro/);
  });

  it("emite logs de etapa: preflight → load-libs → rasterize → save → done", async () => {
    const root = mountWith({});
    const libs = fakeLibs();
    const entries: PdfExportLogEntry[] = [];
    await exportElementToPdf(root, { onLog: (e) => entries.push(e), ...libs });
    const steps = entries.map((e) => e.step);
    expect(steps).toEqual(
      expect.arrayContaining(["preflight", "load-libs", "rasterize", "save", "done"]),
    );
  });
});
