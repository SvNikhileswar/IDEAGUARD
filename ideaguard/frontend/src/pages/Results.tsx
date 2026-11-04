import { useMemo, useState } from "react";
import { api, text, type Match } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Chips, CompareDialog, DownloadButtons, MatchCard, RecCards, tally } from "@/components/ReportParts";
import { ErrorState, Loading, fmtDate, fmtPct, verdictTone } from "@/components/Bits";
import { LazySideRays } from "@/components/Lazy";
import { DonutChart } from "@/components/standins/DonutChart";
import { GlowingCard } from "@/components/standins/GlowingCard";
import { NivoRadarChart } from "@/components/NivoRadarChart";
import { Icon } from "@/components/icons";

export default function Results({ rid }: { rid: string }) {
  const { data: r, error, loading, reload } = useAsync(s => api.report(rid, s), [rid]);
  const [open, setOpen] = useState<Match | null>(null);
  const strengths = useMemo(() => (r ? tally(r.matches.slice(0, 3), m => m.my_unique_features) : []), [r]);
  const overlaps = useMemo(() => (r ? tally(r.matches.slice(0, 3), m => m.overlapping_features) : []), [r]);

  return (
    <AppShell>
      <div className="bg-fixed" aria-hidden="true">
        <LazySideRays rayColor1="#896ABD" rayColor2="#22D3EE" blend={0.6} origin="top-right" speed={0.8} intensity={1.1} spread={2} density={6}
          sharpness={0.5} falloff={1.6} glow={0.8} saturation={1} dust={0.12} followMouse mouseInfluence={0.5} intro lightMode={false} opacity={0.45} maxDevicePixelRatio={2} />
      </div>
      {loading && <Loading label="Loading your report…" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {r && (
        <div className="results">
          <header className="page-head">
            <div><p className="eyebrow">Analysis report · {fmtDate(r.created_at)}</p><h1>{r.title}</h1></div>
            <div className="page-head__actions"><DownloadButtons rid={r.id} title={r.title} /></div>
          </header>

          <section className="score-row" aria-label="Originality and verdict">
            <div className="card score-card">
              <DonutChart size={180} progress={r.originality_score} circleWidth={12} progressWidth={12} progressClassName="text-violet-400" circleClassName="text-white/10" rounded
                label={`Originality ${Math.round(r.originality_score)} percent`}>
                <span className="donut__value">{Math.round(r.originality_score)}%</span><span className="donut__label">ORIGINALITY</span>
              </DonutChart>
              <p className="muted score-card__how">Originality = 100 − weighted similarity of your three closest projects (50 / 30 / 20 %). Weighted similarity here: <strong>{fmtPct(r.overall_score)}</strong>.</p>
            </div>
            <GlowingCard fromColor="#896ABD" viaColor="#5B7CFA" toColor="#22D3EE" className="verdict-glow">
              <p className="eyebrow">AI verdict</p>
              <h2 className={`verdict verdict--${verdictTone(r.verdict)}`}>{r.verdict}</h2>
              <p className="verdict__text">{text(r.recommendations?.usp) || "No unique-selling-point statement was returned."}</p>
              <dl className="mini-stats">
                <div><dt>Closest match</dt><dd>{r.matches[0] ? `${r.matches[0].title} · ${fmtPct(r.matches[0].similarity)}` : "—"}</dd></div>
                <div><dt>Projects &gt;50% similar</dt><dd>{r.saturation_count}</dd></div>
              </dl>
            </GlowingCard>
          </section>

          <section aria-labelledby="sum-h">
            <h2 id="sum-h" className="section-title">Analysis summary</h2>
            <div className="summary-grid">
              <article className="card"><h3>Idea summary</h3>
                {r.idea ? (<dl className="kv">
                  <dt>Problem</dt><dd>{r.idea.problem}</dd>
                  <dt>Solution</dt><dd>{r.idea.solution || "—"}</dd>
                  <dt>Target users</dt><dd>{r.idea.target_users || "—"}</dd>
                  <dt>Features</dt><dd><Chips items={r.idea.features} tone="purple" /></dd>
                  <dt>Tech stack</dt><dd><Chips items={r.idea.tech_stack} tone="cyan" /></dd>
                </dl>) : <p className="muted">This report was created before idea details were saved.</p>}
              </article>
              <article className="card"><h3>Similarity findings</h3>
                <p>{r.saturation_count === 0 ? "No reference project is more than 50% similar to your idea." : `${r.saturation_count} reference project${r.saturation_count === 1 ? " is" : "s are"} more than 50% similar to your idea.`}</p>
                {r.matches[0] && <p className="quote"><strong>{r.matches[0].title}:</strong> {text(r.matches[0].explanation)}</p>}
              </article>
              <article className="card"><h3>What sets you apart</h3><p className="muted">Features found in your idea but not in the closest projects (count = how many of the top 3 matches lack it).</p>
                {strengths.length ? <ul className="chips chips--cyan">{strengths.slice(0, 8).map(s => <li key={s.label}>{s.label}<small> ×{s.n}</small></li>)}</ul> : <p className="muted">None reported.</p>}</article>
              <article className="card"><h3>Where you overlap</h3><p className="muted">Features your idea shares with the closest projects.</p>
                {overlaps.length ? <ul className="chips chips--purple">{overlaps.slice(0, 8).map(s => <li key={s.label}>{s.label}<small> ×{s.n}</small></li>)}</ul> : <p className="muted">None reported.</p>}</article>
              <article className="card span-all"><h3>AI-suggested pitch</h3><p className="pitch">{r.rewritten_pitch || text(r.recommendations?.rewritten_pitch) || "No pitch was returned."}</p></article>
            </div>
          </section>

          <section aria-labelledby="sim-h">
            <div className="section-row"><h2 id="sim-h" className="section-title">Similar projects</h2><Link to={`/comparable/${r.id}`} className="btn btn--ghost btn--sm">Open comparison & map<Icon name="arrow" size={15} /></Link></div>
            <div className="match-grid">{r.matches.map((m, i) => <MatchCard key={m.id} m={m} rank={i + 1} onCompare={() => setOpen(m)} />)}</div>
          </section>

          <section aria-labelledby="rad-h">
            <h2 id="rad-h" className="section-title">Feature comparison</h2>
            <div className="card"><NivoRadarChart matches={r.matches} /></div>
          </section>

          <section aria-labelledby="inn-h">
            <div className="section-row"><h2 id="inn-h" className="section-title">Innovation opportunities</h2><Link to={`/innovation/${r.id}`} className="btn btn--ghost btn--sm">Explore innovation paths<Icon name="arrow" size={15} /></Link></div>
            <RecCards report={r} />
          </section>

          <section className="card final" aria-labelledby="fin-h">
            <p className="eyebrow">Final verdict</p>
            <h2 id="fin-h" className={`verdict verdict--${verdictTone(r.verdict)}`}>{r.verdict} — {Math.round(r.originality_score)}% original</h2>
            <p>{text(r.recommendations?.usp)}</p>
            <div className="final__actions">
              <DownloadButtons rid={r.id} title={r.title} />
              <Link to="/new" className="btn btn--ghost"><Icon name="plus" size={16} />Analyse Another Idea</Link>
              <Link to="/dashboard" className="btn btn--ghost"><Icon name="back" size={16} />Back to Dashboard</Link>
            </div>
          </section>
          <CompareDialog match={open} onClose={() => setOpen(null)} />
        </div>
      )}
    </AppShell>
  );
}
