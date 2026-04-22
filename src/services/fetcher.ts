import { CACHE_TTL, CACHE_VERSION, toDataUrl } from "../config";
import { api } from "../plugins/axios";

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

const cacheMemory = new Map<string, CacheEntry>();
const CACHE_NAMESPACE = "5etools-builder";

function now(): number {
  return Date.now();
}

function getCacheKey(path: string): string {
  return `${CACHE_NAMESPACE}:${CACHE_VERSION}:${path}`;
}

function canUseSessionStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

function readSessionCache(key: string): CacheEntry | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "expiresAt" in parsed &&
      "value" in parsed
    ) {
      const candidate = parsed as { expiresAt: unknown; value: unknown };
      if (typeof candidate.expiresAt === "number") {
        return {
          expiresAt: candidate.expiresAt,
          value: candidate.value,
        };
      }
    }
  } catch {
    window.sessionStorage.removeItem(key);
  }

  return null;
}

function writeSessionCache(key: string, entry: CacheEntry): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore quota errors; memory cache still works.
  }
}

function isFresh(entry: CacheEntry): boolean {
  return entry.expiresAt > now();
}

async function fetchJsonInternal<T>(
  cachePath: string,
  url: string,
): Promise<T> {
  const cacheKey = getCacheKey(cachePath);
  const inMemory = cacheMemory.get(cacheKey);
  if (inMemory && isFresh(inMemory)) {
    return inMemory.value as T;
  }

  const fromSession = readSessionCache(cacheKey);
  if (fromSession && isFresh(fromSession)) {
    cacheMemory.set(cacheKey, fromSession);
    return fromSession.value as T;
  }

  let payload: unknown;
  try {
    const response = await api.get<unknown>(url);
    payload = response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }

    throw new Error(`Failed to fetch ${url}`);
  }

  const entry: CacheEntry = {
    expiresAt: now() + CACHE_TTL,
    value: payload,
  };

  cacheMemory.set(cacheKey, entry);
  writeSessionCache(cacheKey, entry);

  return payload as T;
}

export async function fetchJson<T>(relativePath: string): Promise<T> {
  return fetchJsonInternal(relativePath, toDataUrl(relativePath));
}

export async function fetchJsonByUrl<T>(url: string): Promise<T> {
  return fetchJsonInternal(url, url);
}

export function clearFetchCache(): void {
  cacheMemory.clear();
}
