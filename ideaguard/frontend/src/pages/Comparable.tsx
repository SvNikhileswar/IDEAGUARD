import { useState } from "react";
import { api, type Match } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, Loading, PageHeader, fmtPct } from "@/components/Bits";
import { CompareDialog, MatchCard } from "@/components/ReportParts";
import { ReportPicker, useReportChoice } from "@/components/ReportPicker";
import { LandscapeMap } from "@/components/LandscapeMap";

export default function Comparable({ rid }: { rid?: string }) {
  const { list, rows, activeId } = useReportChoice(rid);
  const report = useAsync(s => (activeId ? api.report(activeId, s) : Promise.resolve(null)), [activeId]);
  const land = useAsync(s => (activeId ? api.landscape(activeId, s) : Promise.resolve(null)), [activeId]);
  const [open, setOpen] = useState<Match | null>(null);
  const r = report.data;
  return (
    <AppShell>
      <PageHeader eyebrow="Comparable projects" title="Similar projects & idea landscape"
        subtitle={r ? <>Closest existing projects to <strong>{r.title}</strong>, and where your idea sits among all {land.data?.points.length ?? ""} reference projects.</> : "The closest existing projects to one of your analyses."}
        actions={<ReportPicker rows={rows} activeId={activeId} base="comparable" />} />
      {(list.loading || (activeId && report.loading)) && <Loading />}
      {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {!list.loading && !list.error && rows.length === 0 && <EmptyState title="Nothing to compare yet" text="Analyse an idea first — its closest projects and landscape will appear here." to="/new" cta="Analyse an idea" />}
      {report.error && <ErrorState message={report.error} onRetry={report.reload} />}
      {r && (
        <>
          <section aria-labelledby="map-h">
            <h2 id="map-h" className="section-title">Idea landscape</h2>
            <div className="card">
              {land.loading ? <Loading label="Building landscape…" /> : land.error ? <ErrorState message={land.error} onRetry={land.reload} /> : land.data && <LandscapeMap data={land.data} title={r.title} />}
            </div>
          </section>
          <section aria-labelledby="cp-h">
            <div className="section-row"><h2 id="cp-h" className="section-title">Closest projects</h2>
              <Link to={`/results/${r.id}`} className="btn btn--ghost btn--sm">Full report · {fmtPct(r.originality_score)} original</Link></div>
            <div className="match-grid">{r.matches.map((m, i) => <MatchCard key={m.id} m={m} rank={i + 1} onCompare={() => setOpen(m)} />)}</div>
          </section>
          <CompareDialog match={open} onClose={() => setOpen(null)} />
        </>
      )}
    </AppShell>
  );
}
