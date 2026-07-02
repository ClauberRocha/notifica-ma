// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  exportChartPng,
  exportChartSvg,
  triggerDownload,
} from "./chart-export";

// html2canvas-pro is dynamically imported inside exportChartPng.
// We mock it to return a fake canvas whose toDataURL is deterministic.
vi.mock("html2canvas-pro", () => ({
  default: vi.fn(async (_el: HTMLElement) => ({
    toDataURL: (mime: string) => `data:${mime};base64,PNG_MOCK`,
  })),
}));

function chartContainer(kind: "sexo" | "faixa" | "raca" | "se" | "mes"): HTMLDivElement {
  // Recharts renders an <svg class="recharts-surface"> with axis text and
  // <text> nodes for the black LabelList values. We reproduce the minimum
  // shape so serialization exercises the same code path as production.
  const div = document.createElement("div");
  div.setAttribute("data-chart", kind);
  div.innerHTML = `
    <svg class="recharts-surface" width="600" height="300">
      <g class="recharts-cartesian-grid"></g>
      <text class="recharts-cartesian-axis-tick-value" x="10" y="290">M</text>
      <text class="recharts-cartesian-axis-tick-value" x="60" y="290">F</text>
      <g class="recharts-label-list">
        <text x="10" y="20" style="fill:#000;font-weight:600">1.234</text>
        <text x="60" y="40" style="fill:#000;font-weight:600">987</text>
      </g>
    </svg>
  `;
  document.body.appendChild(div);
  return div;
}

let clickSpy: ReturnType<typeof vi.fn>;
let createUrlSpy: ReturnType<typeof vi.spyOn>;
let revokeUrlSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  document.body.innerHTML = "";
  clickSpy = vi.fn();
  // Intercept the anchor click that triggerDownload issues so JSDOM
  // doesn't actually navigate.
  const originalCreate = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = originalCreate(tag) as HTMLElement;
    if (tag.toLowerCase() === "a") {
      (el as HTMLAnchorElement).click = clickSpy;
    }
    return el;
  });
  createUrlSpy = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:mock-url");
  revokeUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("triggerDownload", () => {
  it("creates an <a>, sets download filename, clicks it and removes it", () => {
    triggerDownload("blob:xyz", "arquivo.png");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    // The anchor is removed after click.
    expect(document.querySelector("a")).toBeNull();
  });
});

describe("exportChartSvg — labels preserved for all charts", () => {
  for (const kind of ["sexo", "faixa", "raca", "se", "mes"] as const) {
    it(`serializes the ${kind} chart with its black value labels`, () => {
      const el = chartContainer(kind);
      const result = exportChartSvg(el, `distribuicao-${kind}`);
      expect(result).toEqual({ ok: true, filename: `distribuicao-${kind}.svg` });
      expect(createUrlSpy).toHaveBeenCalledTimes(1);
      const blob = createUrlSpy.mock.calls[0][0] as Blob;
      expect(blob.type).toContain("image/svg+xml");
      // Read serialised SVG back and assert labels/ticks are present.
      // Blob.text() is available in jsdom.
      return blob.text().then((text) => {
        expect(text).toContain("<?xml");
        expect(text).toContain("recharts-surface");
        expect(text).toContain("recharts-label-list");
        expect(text).toContain("1.234"); // black value label preserved
        expect(text).toContain("987");
        expect(text).toContain("xmlns=\"http://www.w3.org/2000/svg\"");
      });
    });
  }

  it("returns no-svg when the container is empty (e.g. tooltip-only region)", () => {
    const empty = document.createElement("div");
    document.body.appendChild(empty);
    const result = exportChartSvg(empty, "vazio");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("no-svg");
    expect(createUrlSpy).not.toHaveBeenCalled();
  });
});

describe("exportChartPng — html2canvas called with the chart container", () => {
  it("exports the Distribuição por Gênero chart as PNG", async () => {
    const el = chartContainer("sexo");
    const result = await exportChartPng(el, "distribuicao-por-genero");
    expect(result).toEqual({
      ok: true,
      filename: "distribuicao-por-genero.png",
    });
    const html2canvas = (await import("html2canvas-pro")).default as ReturnType<
      typeof vi.fn
    >;
    expect(html2canvas).toHaveBeenCalledWith(
      el,
      expect.objectContaining({ scale: 2, useCORS: true }),
    );
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("exports every analysis chart via the same PNG path", async () => {
    for (const kind of ["faixa", "raca", "se", "mes"] as const) {
      clickSpy.mockClear();
      const el = chartContainer(kind);
      const result = await exportChartPng(el, `chart-${kind}`);
      expect(result.ok).toBe(true);
      expect(result.filename).toBe(`chart-${kind}.png`);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    }
  });
});
