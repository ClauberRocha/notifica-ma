/**
 * Cache persistente (sessionStorage) de municípios por UF, com TTL.
 * Extraído de smart-fields.tsx para permitir testes isolados.
 *
 * Formato armazenado: { ts: number; data: Municipio[] }
 * Entradas em formato antigo (array puro) ou inválidas são descartadas.
 */
export type Municipio = { id: number; nome: string };

export const MUNI_CACHE_PREFIX = "ibge-muni:v1:";
export const MUNI_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

type MuniCacheEntry = { ts: number; data: Municipio[] };

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readMuniSession(uf: string, now: number = Date.now()): Municipio[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(MUNI_CACHE_PREFIX + uf);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MuniCacheEntry | Municipio[];
    // back-compat: formato antigo era array puro
    if (Array.isArray(parsed)) {
      storage.removeItem(MUNI_CACHE_PREFIX + uf);
      return null;
    }
    if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.data)) return null;
    if (now - parsed.ts > MUNI_CACHE_TTL_MS) {
      storage.removeItem(MUNI_CACHE_PREFIX + uf);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeMuniSession(uf: string, data: Municipio[], now: number = Date.now()): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const entry: MuniCacheEntry = { ts: now, data };
    storage.setItem(MUNI_CACHE_PREFIX + uf, JSON.stringify(entry));
  } catch {
    /* quota / privado — ignora */
  }
}

/** Remove entradas expiradas, malformadas ou em formato antigo do sessionStorage. */
export function cleanupExpiredMuniSession(now: number = Date.now()): number {
  const storage = getStorage();
  if (!storage) return 0;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key || !key.startsWith(MUNI_CACHE_PREFIX)) continue;
      try {
        const raw = storage.getItem(key);
        if (!raw) {
          toRemove.push(key);
          continue;
        }
        const parsed = JSON.parse(raw) as MuniCacheEntry | Municipio[];
        if (Array.isArray(parsed)) {
          toRemove.push(key);
          continue;
        }
        if (!parsed || typeof parsed.ts !== "number" || now - parsed.ts > MUNI_CACHE_TTL_MS) {
          toRemove.push(key);
        }
      } catch {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => storage.removeItem(k));
    return toRemove.length;
  } catch {
    return 0;
  }
}
