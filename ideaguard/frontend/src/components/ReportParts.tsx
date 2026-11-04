import { useEffect, useRef, useState } from "react";
import { api, list, text, type Match, type Report } from "@/lib/api";
import { reportToMarkdown, saveBlob, slug } from "@/lib/report-export";
import { Icon } from "./icons";
import { fmtPct } from "./Bits";

/** Ranks strings by how many matches they appear in (case-insensitive), most common first. */
export function tally(matches: Match[], pick: (m: Match) => unknown): { label: string; n: number }[] {
  const map = new Map<string, { label: string; n: number }>();
  for (const m of matches) for (const raw of new Set(list(pick(m)).map(s => s.trim()))) {
    const k = raw.toLowerCase(); const e = map.get(k); e ? e.n++ : map.set(k, { label: raw, n: 1 });
  }
  return [...map.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
}

export function Chips({ items, tone }: { items: string[]; tone?: "purple" | "cyan" | "muted" }) {
  if (!items.length) return <p className="muted">None reported.</p>;
  return <ul className={`chips chips--${tone ?? "muted"}`}>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}

export function MatchCard({ m, rank, onCompare }: { m: Match; rank: number; onCompare: () => void }) {
  const overlap = list(m.overlapping_features);
  return (
    <article className="card match">
      <header className="match__head">
        <span className="match__rank" aria-hidden="true">{rank}</span>
        <div>
          <h3>{m.title}</h3>
          <p className="muted">{[m.domain, m.source].filter(Boolean).join(" · ") || "Reference project"}</p>
        </div>
        <div className="match__sim" aria-label={`${Math.round(m.similarity)} percent similar`}>
          <strong>{fmtPct(m.similarity)}</strong><span>similar</span>
        </div>
      </header>
      <div className="bar" aria-hidden="true"><span style={{ width: `${Math.max(2, Math.min(100, m.similarity))}%` }} /></div>
      <p className="match__desc">{m.description}</p>
      {m.tech_stack?.length > 0 && <Chips items={m.tech_stack} tone="cyan" />}
      <div className="match__over"><h4>Main overlapping features</h4><Chips items={overlap.slice(0, 5)} tone="purple" /></div>
      <button type="button" className="btn btn--ghost btn--sm" onClick={onCompare}><Icon name="layers" size={15} />View comparison</button>
    </article>
  );
}

export function CompareDialog({ match, onClose }: { match: Match | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (match && !d.open) d.showModal(); else if (!match && d.open) d.close();
  }, [match]);
  const cols: { title: string; items: string[]; tone: "purple" | "cyan" | "muted" }[] = match ? [
    { title: "Overlapping features", items: list(match.overlapping_features), tone: "purple" },
    { title: "Partially covered", items: list(match.partial_features), tone: "muted" },
    { title: "Unique to your idea", items: list(match.my_unique_features), tone: "cyan" },
    { title: "Unique to this project", items: list(match.their_unique_features), tone: "muted" },
  ] : [];
  const dims: [string, number | undefined][] = match ? [["Problem", match.category_scores?.problem], ["Features", match.category_scores?.features], ["Tech stack", match.category_scores?.tech_stack], ["Users", match.category_scores?.users]] : [];
  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={e => e.target === ref.current && onClose()} aria-labelledby="cmp-title">
      {match && (
        <div className="dialog__inner">
          <header className="dialog__head">
            <div><p className="eyebrow">Comparison</p><h2 id="cmp-title">Your idea vs {match.title}</h2>
              <p className="muted">{[match.domain, match.source].filter(Boolean).join(" · ")}{match.tech_stack?.length ? ` · ${match.tech_stack.join(", ")}` : ""}</p></div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close comparison"><Icon name="close" /></button>
          </header>
          <p className="dialog__expl">{text(match.explanation) || "No explanation was returned for this match."}</p>
          <dl className="dims">
            <div><dt>Overall</dt><dd>{fmtPct(match.similarity)}</dd></div>
            {dims.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{fmtPct(v)}</dd></div>)}
          </dl>
          <div className="dialog__cols">
            {cols.map(c => <section key={c.title}><h3>{c.title}</h3><Chips items={c.items} tone={c.tone} /></section>)}
          </div>
        </div>
      )}
    </dialog>
  );
}

export function RecCards({ report }: { report: Report }) {
  const rec = report.recommendations || {};
  const cards = [
    { tag: "IMPROVE", sub: "Enhance existing features and address weaknesses", items: list(rec.enhancements), icon: "wand" as const },
    { tag: "DIFFERENTIATE", sub: "Make it stand out from existing alternatives", items: [...(text(rec.usp) ? [text(rec.usp)] : []), ...list(rec.gaps)], icon: "layers" as const },
    { tag: "INNOVATE", sub: "Explore new approaches, users and domains", items: list(rec.pivots), icon: "bulb" as const },
  ];
  return (
    <div className="rec-grid">
      {cards.map(c => (
        <article className="card rec" key={c.tag}>
          <header><span className="rec__icon"><Icon name={c.icon} size={18} /></span><div><h3>{c.tag}</h3><p className="muted">{c.sub}</p></div></header>
          {c.items.length ? <ul>{c.items.map(i => <li key={i}>{i}</li>)}</ul> : <p className="muted">The AI returned nothing for this category.</p>}
        </article>
      ))}
    </div>
  );
}

/** Download uses the REAL endpoint GET /api/report/{rid}, then formats what it returned. */
export function DownloadButtons({ rid, title }: { rid: string; title: string }) {
  const [busy, setBusy] = useState<"md" | "json" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const go = async (kind: "md" | "json") => {
    setBusy(kind); setErr(null);
    try {
      const r = await api.report(rid);
      if (kind === "md") saveBlob(`ideaguard-${slug(title)}-${rid}.md`, "text/markdown", reportToMarkdown(r));
      else saveBlob(`ideaguard-${slug(title)}-${rid}.json`, "application/json", JSON.stringify(r, null, 2));
    } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  };
  return (
    <span className="dl">
      <button type="button" className="btn btn--primary" onClick={() => go("md")} disabled={busy !== null} aria-busy={busy === "md"}>
        <Icon name="download" size={16} />{busy === "md" ? "Preparing…" : "Download Report"}
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => go("json")} disabled={busy !== null}>JSON</button>
      {err && <span className="form-error" role="alert">{err}</span>}
    </span>
  );
}
