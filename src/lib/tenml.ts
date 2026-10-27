import "server-only";
import { cacheLife } from "next/cache";

// Server-side client for the 10ML Fragrance Index (https://mcp.10ml.com/openapi.json).
// Cached fetchers throw on outages so failures are never cached; the exported
// wrappers turn every call into ok / empty / unavailable for the UI.

const BASE_URL = "https://mcp.10ml.com/api/v1";
const TIMEOUT_MS = 8000;

export type PerfumeSummary = {
  id: string;
  name: string;
  house: string | null;
  year?: number | null;
  family?: string | null;
  accords: string[];
  key_notes: string[];
  character?: string | null;
  links?: { type: string; title: string; url: string }[];
};

export type PerfumeDetail = PerfumeSummary & {
  pyramid?: { top?: string[]; heart?: string[]; base?: string[] } | null;
  gender?: "men" | "women" | "unisex" | null;
  concentration?: string | null;
  seasons?: string[];
  occasions?: string[];
  longevity?: number | null; // 1 (short) to 5 (very long)
  projection?: number | null; // 1 (skin scent) to 5 (fills a room)
  perfumers?: string[];
};

export type SimilarResult = {
  perfume: PerfumeSummary;
  closeness: string;
  shared_notes: string[];
  shared_accords: string[];
  why: string;
};

export type ApiResult<T> =
  | { status: "ok"; data: T }
  | { status: "empty"; message?: string }
  | { status: "unavailable" };

class ApiUnavailableError extends Error {}

async function getJson(path: string): Promise<{ status: number; body: unknown }> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiUnavailableError("network");
  }
  // 404 is a real "not found"; anything else non-2xx (429, 5xx) is an outage.
  if (!res.ok && res.status !== 404) throw new ApiUnavailableError(String(res.status));
  try {
    return { status: res.status, body: await res.json() };
  } catch {
    throw new ApiUnavailableError("bad json");
  }
}

// Any failure is shown as "unavailable". Errors thrown inside "use cache" come back
// as plain Errors, so `instanceof ApiUnavailableError` can't be relied on here.
async function guard<T>(fn: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  try {
    return await fn();
  } catch (err) {
    console.error("10ML API", err);
    return { status: "unavailable" };
  }
}

async function fetchSearch(q: string, limit: number): Promise<ApiResult<PerfumeSummary[]>> {
  "use cache";
  cacheLife("minutes");
  const params = new URLSearchParams({ q, limit: String(limit) });
  const { body } = await getJson(`/perfumes?${params}`);
  const data = body as { results?: PerfumeSummary[]; message?: string };
  // Uncovered brands come back as { error: { code: "invalid_request" } }: treat as not in catalog.
  if (!data.results?.length) return { status: "empty", message: data.message };
  return { status: "ok", data: data.results };
}

async function fetchPerfume(id: string): Promise<ApiResult<PerfumeDetail>> {
  "use cache";
  cacheLife("hours");
  const { status, body } = await getJson(
    `/perfumes/${encodeURIComponent(id)}?format=detailed`,
  );
  const data = body as { found?: boolean; perfume?: PerfumeDetail };
  if (status === 404 || !data.found || !data.perfume) return { status: "empty" };
  return { status: "ok", data: data.perfume };
}

async function fetchSimilar(query: string): Promise<ApiResult<SimilarResult[]>> {
  "use cache";
  cacheLife("minutes");
  const { body } = await getJson(`/similar?${query}`);
  const data = body as { results?: SimilarResult[]; message?: string };
  if (!data.results?.length) return { status: "empty", message: data.message };
  return { status: "ok", data: data.results };
}

export function searchPerfumes(q: string, limit = 10) {
  return guard(() => fetchSearch(q.trim(), limit));
}

export function getPerfume(id: string) {
  return guard(() => fetchPerfume(id));
}

// /similar rejects longer lists with HTTP 400.
export const MAX_SIMILAR_NOTES = 30;
export const MAX_SIMILAR_ACCORDS = 6;

// Recommendations either from a whole perfume or from a set of notes/accords.
export function findSimilar(
  input: { perfumeId: string } | { notes: string[]; accords: string[] },
  limit = 12,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if ("perfumeId" in input) {
    params.set("perfume", input.perfumeId);
  } else {
    const notes = input.notes.slice(0, MAX_SIMILAR_NOTES);
    const accords = input.accords.slice(0, MAX_SIMILAR_ACCORDS);
    if (notes.length) params.set("notes", notes.join(","));
    if (accords.length) params.set("accords", accords.join(","));
  }
  return guard(() => fetchSimilar(params.toString()));
}

// All notes of a perfume, top to base, without duplicates.
export function allNotes(perfume: PerfumeDetail): string[] {
  const { top = [], heart = [], base = [] } = perfume.pyramid ?? {};
  const notes = [...top, ...heart, ...base];
  return [...new Set(notes.length ? notes : perfume.key_notes)];
}
