import { useState } from "react";
import { api } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, Loading, PageHeader, fmtDate, fmtPct, verdictTone } from "@/components/Bits";
import { DownloadButtons } from "@/components/ReportParts";

export default function History() {
  const { data, error, loading, reload } = useAsync(s => api.reports(s), []);
  const [q, setQ] = useState("");
  const rows = (data ?? []).filter(r => r.title.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <AppShell>
      <PageHeader eyebrow="Analysis history" title="Every analysis you have run" subtitle="Reopen a report, compare projects or download it."
        actions={<Link to="/new" className="btn btn--primary">New analysis</Link>} />
      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No analyses yet" text="Your reports are saved by the backend and will be listed here." to="/new" cta="Analyse an idea" />}
      {data && data.length > 0 && (
        <>
          <label className="search"><span className="sr-only">Filter by title</span><input type="search" placeholder="Filter by title…" value={q} onChange={e => setQ(e.target.value)} /></label>
          {rows.length === 0 ? <p className="muted">No analysis matches “{q}”.</p> : (
            <div className="table-wrap card">
              <table className="table">
                <thead><tr><th scope="col">Project</th><th scope="col">Verdict</th><th scope="col">Originality</th><th scope="col">Closest match</th><th scope="col">Run</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <th scope="row"><Link to={`/results/${r.id}`}>{r.title}</Link></th>
                      <td><span className={`pill pill--${verdictTone(r.verdict)}`}>{r.verdict}</span></td>
                      <td>{fmtPct(r.originality_score)}</td>
                      <td className="muted">{r.top_match ?? "—"}</td>
                      <td className="muted">{fmtDate(r.created_at)}</td>
                      <td className="table__actions"><Link to={`/results/${r.id}`} className="btn btn--ghost btn--sm">Open</Link><Link to={`/comparable/${r.id}`} className="btn btn--ghost btn--sm">Compare</Link><DownloadButtons rid={r.id} title={r.title} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
