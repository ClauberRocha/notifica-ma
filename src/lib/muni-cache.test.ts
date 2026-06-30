import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  MUNI_CACHE_PREFIX,
  MUNI_CACHE_TTL_MS,
  cleanupExpiredMuniSession,
  readMuniSession,
  writeMuniSession,
  type Municipio,
} from "./muni-cache";

// In-memory Storage que imita sessionStorage do browser.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  key(i: number) {
    return Array.from(this.map.keys())[i] ?? null;
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
}

const SAMPLE: Municipio[] = [
  { id: 2111300, nome: "São Luís" },
  { id: 2103000, nome: "Caxias" },
];

const NOW = 1_700_000_000_000; // ts fixo p/ determinismo

beforeEach(() => {
  const storage = new MemoryStorage();
  // @ts-expect-error - injetando window mínimo para o módulo sob teste
  globalThis.window = { sessionStorage: storage };
});

afterEach(() => {
  // @ts-expect-error - cleanup
  delete globalThis.window;
});

describe("muni-cache TTL", () => {
  it("retorna dados quando dentro do TTL", () => {
    writeMuniSession("MA", SAMPLE, NOW);
    expect(readMuniSession("MA", NOW + 60_000)).toEqual(SAMPLE);
  });

  it("retorna dados até a borda do TTL (exatamente TTL ms depois)", () => {
    writeMuniSession("MA", SAMPLE, NOW);
    expect(readMuniSession("MA", NOW + MUNI_CACHE_TTL_MS)).toEqual(SAMPLE);
  });

  it("expira (retorna null) quando idade > TTL e remove a entrada", () => {
    writeMuniSession("MA", SAMPLE, NOW);
    const future = NOW + MUNI_CACHE_TTL_MS + 1;
    expect(readMuniSession("MA", future)).toBeNull();
    // deve ter sido removida no ato da leitura expirada
    expect(window.sessionStorage.getItem(MUNI_CACHE_PREFIX + "MA")).toBeNull();
  });

  it("descarta entradas no formato antigo (array puro)", () => {
    window.sessionStorage.setItem(MUNI_CACHE_PREFIX + "PI", JSON.stringify(SAMPLE));
    expect(readMuniSession("PI", NOW)).toBeNull();
    expect(window.sessionStorage.getItem(MUNI_CACHE_PREFIX + "PI")).toBeNull();
  });

  it("retorna null para JSON inválido sem lançar", () => {
    window.sessionStorage.setItem(MUNI_CACHE_PREFIX + "CE", "{nao-json");
    expect(readMuniSession("CE", NOW)).toBeNull();
  });

  it("retorna null quando UF não está no cache", () => {
    expect(readMuniSession("SP", NOW)).toBeNull();
  });
});

describe("cleanupExpiredMuniSession", () => {
  it("remove apenas entradas expiradas/inválidas e preserva válidas + chaves alheias", () => {
    // válidas
    writeMuniSession("MA", SAMPLE, NOW);
    writeMuniSession("PI", SAMPLE, NOW - 60_000);
    // expirada
    writeMuniSession("TO", SAMPLE, NOW - MUNI_CACHE_TTL_MS - 1);
    // formato antigo
    window.sessionStorage.setItem(MUNI_CACHE_PREFIX + "PA", JSON.stringify(SAMPLE));
    // malformada
    window.sessionStorage.setItem(MUNI_CACHE_PREFIX + "CE", "lixo");
    // chave alheia (não deve ser tocada)
    window.sessionStorage.setItem("outra-coisa", "ok");

    const removed = cleanupExpiredMuniSession(NOW);
    expect(removed).toBe(3); // TO, PA, CE

    expect(readMuniSession("MA", NOW)).toEqual(SAMPLE);
    expect(readMuniSession("PI", NOW)).toEqual(SAMPLE);
    expect(window.sessionStorage.getItem(MUNI_CACHE_PREFIX + "TO")).toBeNull();
    expect(window.sessionStorage.getItem(MUNI_CACHE_PREFIX + "PA")).toBeNull();
    expect(window.sessionStorage.getItem(MUNI_CACHE_PREFIX + "CE")).toBeNull();
    expect(window.sessionStorage.getItem("outra-coisa")).toBe("ok");
  });

  it("é no-op (0 remoções) quando storage só tem entradas válidas", () => {
    writeMuniSession("MA", SAMPLE, NOW);
    writeMuniSession("PI", SAMPLE, NOW);
    expect(cleanupExpiredMuniSession(NOW)).toBe(0);
    expect(window.sessionStorage.length).toBe(2);
  });

  it("retorna 0 e não lança quando window é indefinido (SSR)", () => {
    // @ts-expect-error - simula SSR
    delete globalThis.window;
    expect(cleanupExpiredMuniSession(NOW)).toBe(0);
  });
});
