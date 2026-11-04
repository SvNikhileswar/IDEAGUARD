import { useMemo } from "react";
import { api, type ReportSummary } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, Loading, PageHeader, fmtDate, fmtPct, verdictTone } from "@/components/Bits";

export default function Projects() {
  const { data, error, loading, reload } = useAsync(s => api.reports(s), []);
  const groups = useMemo(() => {
    const m = new Map<string, ReportSummary[]>();
    for (const r of data ?? []) { const k = r.title.trim().toLowerCase(); m.set(k, [...(m.get(k) ?? []), r]); }
    return [...m.values()].map(rs => ({ latest: rs[0], runs: rs.length, best: Math.max(...rs.map(r => r.originality_score)) }));
  }, [data]);
  return (
    <AppShell>
      <PageHeader eyebrow="My projects" title="Your project ideas" subtitle="Ideas grouped by title, with their latest result."
        actions={<Link to="/new" className="btn btn--primary">New analysis</Link>} />
      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && groups.length === 0 && <EmptyState title="No projects yet" text="Analyse your first idea and it will show up here." to="/new" cta="Analyse an idea" />}
      <div className="proj-grid">
        {groups.map(g => (
          <Link key={g.latest.id} to={`/results/${g.latest.id}`} className="card proj">
            <h3>{g.latest.title}</h3>
            <span className={`pill pill--${verdictTone(g.latest.verdict)}`}>{g.latest.verdict}</span>
            <dl className="mini-stats">
              <div><dt>Latest originality</dt><dd>{fmtPct(g.latest.originality_score)}</dd></div>
              <div><dt>Best</dt><dd>{fmtPct(g.best)}</dd></div>
              <div><dt>Analyses</dt><dd>{g.runs}</dd></div>
            </dl>
            <p className="muted">Last run {fmtDate(g.latest.created_at)}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
