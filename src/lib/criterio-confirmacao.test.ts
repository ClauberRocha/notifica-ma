import { describe, it, expect } from "vitest";
import {
  CRITERIO_CONFIRMACAO_KEYS,
  buildCriterioData,
  classifyCriterio,
  assertCriterioOrder,
} from "./criterio-confirmacao";

describe("criterio-confirmacao (contrato fixo p/ todos os agravos)", () => {
  it("mantém as chaves e a ordem canônicas", () => {
    expect(CRITERIO_CONFIRMACAO_KEYS).toEqual([
      "QUIMIOCITOLOGICO",
      "PCR",
      "CLINICO",
      "CULTURA",
      "NECROPSIA",
      "OUTROS",
      "EM INVESTIGAÇÃO",
      "ISOLAMENTO VIRAL",
      "BACTERIOSCOPIA",
    ]);
  });

  it("buildCriterioData preserva ordem mesmo com agravos diferentes", () => {
    const data = buildCriterioData([
      { criterio_confirmacao: "PCR" },
      { criterio_confirmacao: "bacterioscopia" },
      { status: "em_investigacao" },
      { criterio_confirmacao: "quimiocitologico_liquor" },
    ]);
    assertCriterioOrder(data);
    const map = Object.fromEntries(data);
    expect(map["PCR"]).toBe(1);
    expect(map["BACTERIOSCOPIA"]).toBe(1);
    expect(map["EM INVESTIGAÇÃO"]).toBe(1);
    expect(map["QUIMIOCITOLOGICO"]).toBe(1);
  });

  it("classifica variantes textuais comuns", () => {
    expect(classifyCriterio({ criterio_confirmacao: "Clinico_Epidemiologico" })).toBe("CLINICO");
    expect(classifyCriterio({ criterio_confirmacao: "isolamento_viral" })).toBe("ISOLAMENTO VIRAL");
    expect(classifyCriterio({ criterio_confirmacao: "necropsia" })).toBe("NECROPSIA");
    expect(classifyCriterio({ criterio_confirmacao: "algo_desconhecido" })).toBe("OUTROS");
    expect(classifyCriterio({ criterio_confirmacao: "" })).toBe("OUTROS");
  });

  it("assertCriterioOrder rejeita ordem ou chaves incorretas", () => {
    expect(() => assertCriterioOrder([["PCR", 0]] as any)).toThrow();
    const wrong = CRITERIO_CONFIRMACAO_KEYS.map((k) => [k, 0] as [string, number]);
    wrong[0] = ["PCR", 0];
    wrong[1] = ["QUIMIOCITOLOGICO", 0];
    expect(() => assertCriterioOrder(wrong)).toThrow();
  });

  it("não tem ramo específico por agravo (mesmo contrato para meningite e demais)", () => {
    const meningite = buildCriterioData([{ criterio_confirmacao: "quimio" }]);
    const dengue = buildCriterioData([{ criterio_confirmacao: "quimio" }]);
    expect(meningite.map(([k]) => k)).toEqual(dengue.map(([k]) => k));
  });
});
