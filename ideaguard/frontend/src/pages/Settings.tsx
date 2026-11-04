import { api } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { AppShell } from "@/components/AppShell";
import { ErrorState, Loading, PageHeader } from "@/components/Bits";
import { Icon } from "@/components/icons";

export default function Settings() {
  const h = useAsync(s => api.health(s), []);
  const reduced = usePrefersReducedMotion();
  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Status & preferences" subtitle="Live information from the IdeaGuard backend." actions={<button type="button" className="btn btn--ghost" onClick={h.reload}><Icon name="refresh" size={16} />Refresh</button>} />
      <div className="summary-grid">
        <article className="card"><h3>Backend</h3>
          {h.loading ? <Loading /> : h.error ? <ErrorState message={h.error} onRetry={h.reload} /> : h.data && (
            <dl className="kv"><dt>Status</dt><dd><span className="pill pill--good">{h.data.status}</span></dd>
              <dt>Reference projects</dt><dd>{h.data.projects}</dd><dt>Saved analyses</dt><dd>{h.data.reports ?? "—"}</dd><dt>Gemini model</dt><dd>{h.data.llm_model ?? "—"}</dd></dl>)}
        </article>
        <article className="card"><h3>Animation</h3>
          <p>Reduced motion is <strong>{reduced ? "on" : "off"}</strong> for this device. IdeaGuard follows your operating-system setting (“Reduce motion”) — when it is on, backgrounds hold still and transitions are minimal.</p></article>
        <article className="card"><h3>Your data</h3>
          <p>Analyses are stored by the backend in <code>data/reports.json</code> on the machine running IdeaGuard. Your Gemini key stays in the backend <code>.env</code> file and is never sent to the browser.</p></article>
      </div>
    </AppShell>
  );
}
