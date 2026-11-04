import { useMemo } from "react";
import { api, type ReportSummary } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, Loading, PageHeader, fmtDate, fmtPct, verdictTone } from "@/components/Bits";
import { BentoGrid, type BentoItem } from "@/components/standins/BentoGrid";
import CardStack from "@/components/original/card-stack";
import { Icon } from "@/components/icons";

interface Stat { id: string; label: string; value: string; hint: string }

const BENTO: BentoItem[] = [
  { title: "Project Analysis", description: "Describe your idea and get an originality score with a full AI report.", to: "/new", icon: "scan", colors: ["#896ABD", "#5B7CFA", "#22D3EE"], cta: "Start analysis" },
  { title: "Similarity Detection", description: "See the closest existing projects and exactly which features overlap.", to: "/comparable", icon: "layers", colors: ["#5B7CFA", "#22D3EE", "#896ABD"], cta: "Compare projects" },
  { title: "Innovation Paths", description: "Gaps, enhancements and pivots generated for your idea.", to: "/innovation", icon: "bulb", colors: ["#896ABD", "#A78BFA", "#5B7CFA"], cta: "Explore paths" },
  { title: "Analytics", description: "Browse every analysis you have run and reopen any report.", to: "/history", icon: "chart", colors: ["#22D3EE", "#5B7CFA", "#896ABD"], cta: "View history" },
];

export function computeStats(rows: ReportSummary[]) {
  const titles = new Set(rows.map(r => r.title.trim().toLowerCase()));
  const avg = rows.length ? rows.reduce((a, r) => a + r.originality_score, 0) / rows.length : null;
  return { projects: titles.size, analyses: rows.length, avg };
}

export default function Dashboard() {
  const reports = useAsync(s => api.reports(s), []);
  const health = useAsync(s => api.health(s), []);
  const rows = reports.data ?? [];
  const stats = useMemo<Stat[]>(() => {
    const s = computeStats(rows);
    return [
      { id: "projects", label: "Total Projects", value: String(s.projects), hint: "Distinct project ideas you have analysed" },
      { id: "analyses", label: "Analyses Completed", value: String(s.analyses), hint: health.data ? `Compared against ${health.data.projects} reference projects` : "Saved reports" },
      { id: "avg", label: "Average Originality Score", value: fmtPct(s.avg), hint: s.avg == null ? "Run an analysis to see this" : "Mean across all your analyses" },
    ];
  }, [rows, health.data]);

  return (
    <AppShell>
      <PageHeader eyebrow="Overview" title="Your innovation overview" subtitle="Real numbers from the analyses you have run."
        actions={<Link to="/new" className="btn btn--primary"><Icon name="plus" size={16} />New analysis</Link>} />
      {reports.error && <ErrorState message={reports.error} onRetry={reports.reload} />}
      <section className="dash-top" aria-label="Statistics">
        <div className="stat-stack-wrap">
          <CardStack items={stats} depth={3}>
            <CardStack.Viewport className="stat-stack">
              <CardStack.List>
                {(item, index, layer) => {
                  const s = item as Stat;
                  return (
                    <CardStack.Card layer={layer} stackIndex={index} className="stat-card">
                      <span className="stat-card__label">{s.label}</span>
                      <span className="stat-card__value">{reports.loading ? "…" : s.value}</span>
                      <span className="stat-card__hint">{s.hint}</span>
                    </CardStack.Card>
                  );
                }}
              </CardStack.List>
              <CardStack.Trigger full aria-label="Show next statistic" />
            </CardStack.Viewport>
          </CardStack>
          <p className="muted stat-stack-hint">Click the card to flip through your statistics.</p>
          <ul className="sr-only">{stats.map(s => <li key={s.id}>{s.label}: {s.value}</li>)}</ul>
        </div>
        <div className="card recent">
          <h2>Recent analyses</h2>
          {reports.loading ? <Loading /> : rows.length === 0 ? (
            <EmptyState title="No analyses yet" text="Submit your first idea to see its originality score and similar projects." to="/new" cta="Analyse an idea" />
          ) : (
            <ul className="recent__list">
              {rows.slice(0, 5).map(r => (
                <li key={r.id}>
                  <Link to={`/results/${r.id}`}>
                    <span className="recent__title">{r.title}</span>
                    <span className={`pill pill--${verdictTone(r.verdict)}`}>{r.verdict}</span>
                    <span className="recent__score">{fmtPct(r.originality_score)}</span>
                    <span className="muted recent__date">{fmtDate(r.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section aria-labelledby="explore-h">
        <h2 id="explore-h" className="section-title">Explore IdeaGuard</h2>
        <BentoGrid items={BENTO} />
      </section>
    </AppShell>
  );
}
