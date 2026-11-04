/* Typed client for the existing FastAPI backend. Relative URLs: in production the backend
   serves this app; in `vite dev` the proxy in vite.config.ts forwards /api and /health. */

export interface Idea {
  title: string;
  problem: string;
  solution: string;
  features: string[];
  tech_stack: string[];
  target_users: string;
}
export interface CategoryScores { problem?: number; features?: number; tech_stack?: number; users?: number }
export interface Match {
  id: number; title: string; similarity: number; description: string;
  tech_stack: string[]; domain?: string; features?: string[]; source: string; url: string;
  overlapping_features: string[]; partial_features: string[];
  my_unique_features: string[]; their_unique_features: string[];
  explanation: string; category_scores: CategoryScores;
}
export interface Recommendations {
  gaps?: string[]; pivots?: string[]; enhancements?: string[]; usp?: string; rewritten_pitch?: string;
}
export interface Report {
  id: string; title: string; overall_score: number; originality_score: number; verdict: string;
  category_scores: CategoryScores; saturation_count: number; matches: Match[];
  recommendations: Recommendations; rewritten_pitch: string; idea?: Idea; created_at?: string;
}
export interface ReportSummary {
  id: string; title: string; originality_score: number; overall_score: number; verdict: string;
  saturation_count: number; created_at: string | null; top_match: string | null;
}
export interface Health { status: string; projects: number; reports?: number; llm_model?: string }
export interface Landscape {
  points: { x: number; y: number; title: string; cluster: number }[];
  my_idea: { x: number; y: number };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) { super(message); this.status = status; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("Cannot reach the IdeaGuard backend. Is it running (run.bat)?");
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ") || detail;
    } catch { /* non-JSON error body */ }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: (signal?: AbortSignal) => request<Health>("/health", { signal }),
  submit: (idea: Idea, signal?: AbortSignal) => request<Report>("/api/submit", { method: "POST", body: JSON.stringify(idea), signal }),
  extract: (text: string, signal?: AbortSignal) => request<Partial<Idea>>("/api/extract", { method: "POST", body: JSON.stringify({ text }), signal }),
  report: (rid: string, signal?: AbortSignal) => request<Report>(`/api/report/${encodeURIComponent(rid)}`, { signal }),
  reports: (signal?: AbortSignal) => request<ReportSummary[]>("/api/reports", { signal }),
  landscape: (rid: string, signal?: AbortSignal) => request<Landscape>(`/api/landscape/${encodeURIComponent(rid)}`, { signal }),
};

/** Gemini output is JSON but loosely typed — coerce defensively so a odd value never crashes a page. */
export const text = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? Object.values(v as object).filter(x => typeof x === "string").join(" — ") : String(v);
export const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);
export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
