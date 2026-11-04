import { useEffect, useRef, useState } from "react";
import { api, list, text, type Idea } from "@/lib/api";
import { loadPendingIdea, startAnalysis, useAnalysis, validateIdea } from "@/lib/analysis";
import { navigate } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/Bits";
import ElectricBorder from "@/components/original/ElectricBorder";
import { PromptInput } from "@/components/standins/PromptInput";
import { AIButton } from "@/components/standins/AIButton";

const EMPTY: Idea = { title: "", problem: "", solution: "", features: [], tech_stack: [], target_users: "" };

export default function NewAnalysis() {
  const [idea, setIdea] = useState<Idea>(() => loadPendingIdea() ?? EMPTY);
  const [quick, setQuick] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { phase } = useAnalysis();
  const busy = phase === "preparing" || phase === "waiting";
  const ctrl = useRef<AbortController | null>(null);
  useEffect(() => () => ctrl.current?.abort(), []);

  const extract = async () => {
    ctrl.current?.abort(); ctrl.current = new AbortController();
    setExtracting(true); setExtractError(null);
    try {
      const r = await api.extract(quick.trim(), ctrl.current.signal);
      setIdea(cur => ({
        title: text(r.title) || cur.title, problem: text(r.problem) || cur.problem, solution: text(r.solution) || cur.solution,
        features: list(r.features).length ? list(r.features) : cur.features, tech_stack: list(r.tech_stack).length ? list(r.tech_stack) : cur.tech_stack,
        target_users: text(r.target_users) || cur.target_users,
      }));
    } catch (e) { if ((e as Error).name !== "AbortError") setExtractError((e as Error).message); }
    finally { setExtracting(false); }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) { navigate("/analyzing"); return; }          // duplicate-submit guard: just follow the running job
    const problem = validateIdea(idea);
    if (problem) { setFormError(problem); return; }
    setFormError(null);
    if (startAnalysis(idea)) navigate("/analyzing");
  };

  return (
    <AppShell>
      <PageHeader eyebrow="New analysis" title="Analyse your idea" subtitle="Tell us about your project. We compare it with real existing projects and report how original it is." />
      <form onSubmit={submit} noValidate className="analysis-form">
        <ElectricBorder color="#896ABD" glow={0.8} speed={1} thickness={1.5} strands={3} borderRadius={24} interactive theme="dark" className="eb">
          <PromptInput idea={idea} onChange={i => { setIdea(i); setFormError(null); }} quick={quick} onQuick={setQuick}
            onExtract={extract} extracting={extracting} extractError={extractError}
            footer={
              <>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <AIButton type="submit" label="Analyse My Idea" loadingLabel="Analysing…" loading={busy} disabled={extracting} />
                <p className="muted prompt__note">Analysis takes a little while — it embeds your idea, ranks the dataset and asks Gemini for the report.</p>
              </>
            } />
        </ElectricBorder>
      </form>
    </AppShell>
  );
}
