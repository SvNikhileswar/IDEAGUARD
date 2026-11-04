import { useSyncExternalStore } from "react";
import { api, ApiError, type Idea } from "./api";

/* The submit endpoint is ONE blocking request: it embeds the idea, ranks the dataset, runs two
   Gemini calls and only then returns. There are no intermediate server events, so this store
   exposes only states the app can genuinely verify:
     preparing → request being validated/serialised in the browser
     waiting   → request sent; the server is working
     done      → the server returned a report (its id is verified)
     error     → the request failed (message from the server where it gave one) */

export type Phase = "idle" | "preparing" | "waiting" | "done" | "error";
export interface AnalysisState {
  phase: Phase; idea: Idea | null; rid: string | null; error: string | null;
  startedAt: number | null; finishedAt: number | null;
  /** facts verified from the returned report, never guessed */
  verified: { matches: number; scored: boolean; recommendations: boolean } | null;
}
const PENDING_KEY = "ideaguard.pending";
const initial: AnalysisState = { phase: "idle", idea: null, rid: null, error: null, startedAt: null, finishedAt: null, verified: null };
let state: AnalysisState = initial;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();
const set = (patch: Partial<AnalysisState>) => { state = { ...state, ...patch }; listeners.forEach(l => l()); };

export function loadPendingIdea(): Idea | null {
  try { const raw = sessionStorage.getItem(PENDING_KEY); return raw ? (JSON.parse(raw) as Idea) : null; } catch { return null; }
}
const savePendingIdea = (idea: Idea | null) => {
  try { idea ? sessionStorage.setItem(PENDING_KEY, JSON.stringify(idea)) : sessionStorage.removeItem(PENDING_KEY); } catch { /* storage unavailable */ }
};

export function validateIdea(i: Idea): string | null {
  if (!i.title.trim()) return "Give your project a title.";
  if (i.problem.trim().length < 15) return "Describe the problem in a sentence or two (at least 15 characters).";
  return null;
}

/** Returns false (and does nothing) when an analysis is already running — duplicate-submit guard. */
export function startAnalysis(idea: Idea): boolean {
  if (state.phase === "preparing" || state.phase === "waiting") return false;
  const problem = validateIdea(idea);
  if (problem) { set({ ...initial, phase: "error", idea, error: problem }); return false; }
  const clean: Idea = {
    title: idea.title.trim(), problem: idea.problem.trim(), solution: idea.solution.trim(),
    features: idea.features.map(f => f.trim()).filter(Boolean), tech_stack: idea.tech_stack.map(f => f.trim()).filter(Boolean),
    target_users: idea.target_users.trim(),
  };
  savePendingIdea(clean);
  set({ ...initial, phase: "preparing", idea: clean, startedAt: Date.now() });
  controller = new AbortController();
  const signal = controller.signal;
  set({ phase: "waiting" });
  api.submit(clean, signal).then(
    report => {
      if (typeof report?.id !== "string" || !report.id) { set({ phase: "error", error: "The server answered without a report id." }); return; }
      savePendingIdea(null);
      set({
        phase: "done", rid: report.id, finishedAt: Date.now(),
        verified: { matches: report.matches?.length ?? 0, scored: typeof report.originality_score === "number", recommendations: !!report.recommendations },
      });
    },
    err => {
      if ((err as Error).name === "AbortError") { set({ phase: "idle", error: null }); return; }
      set({ phase: "error", finishedAt: Date.now(), error: err instanceof ApiError ? err.message : "The analysis could not be completed." });
    },
  );
  return true;
}

export function cancelAnalysis() { controller?.abort(); controller = null; }
export function retryAnalysis(): boolean { const idea = state.idea ?? loadPendingIdea(); return idea ? startAnalysis(idea) : false; }
export function resetAnalysis() { controller = null; set({ ...initial }); }

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useAnalysis(): AnalysisState { return useSyncExternalStore(subscribe, () => state, () => initial); }
