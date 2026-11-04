import { api, text } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/Bits";
import { RecCards } from "@/components/ReportParts";
import { ReportPicker, useReportChoice } from "@/components/ReportPicker";
import { LivingGreenBackdrop } from "@/components/standins/LivingGreenBackdrop";

export default function Innovation({ rid }: { rid?: string }) {
  const { list, rows, activeId } = useReportChoice(rid);
  const report = useAsync(s => (activeId ? api.report(activeId, s) : Promise.resolve(null)), [activeId]);
  const r = report.data;
  return (
    <AppShell>
      <div className="bg-fixed" aria-hidden="true"><LivingGreenBackdrop /></div>
      <PageHeader eyebrow="Innovation paths" title="Where your idea can grow"
        subtitle={r ? <>AI-generated directions for <strong>{r.title}</strong>, based on the projects it was compared with.</> : "AI-generated improvement, differentiation and innovation directions."}
        actions={<ReportPicker rows={rows} activeId={activeId} base="innovation" />} />
      {(list.loading || (activeId && report.loading)) && <Loading />}
      {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {!list.loading && !list.error && rows.length === 0 && <EmptyState title="No innovation paths yet" text="Analyse an idea and Gemini will suggest how to improve and differentiate it." to="/new" cta="Analyse an idea" />}
      {report.error && <ErrorState message={report.error} onRetry={report.reload} />}
      {r && (
        <>
          <RecCards report={r} />
          <section className="card pitch-card" aria-labelledby="pitch-h">
            <h2 id="pitch-h" className="section-title">A more distinctive pitch</h2>
            <p className="pitch">{r.rewritten_pitch || text(r.recommendations?.rewritten_pitch) || "No pitch was returned."}</p>
            <Link to={`/results/${r.id}`} className="btn btn--ghost btn--sm">Back to full report</Link>
          </section>
        </>
      )}
    </AppShell>
  );
}
