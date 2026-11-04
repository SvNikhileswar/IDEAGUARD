import { api, type ReportSummary } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { navigate } from "@/lib/router";
import { fmtDate, fmtPct } from "./Bits";

/** Resolves which report a page should show: the :rid in the URL, else the newest saved one. */
export function useReportChoice(rid: string | undefined) {
  const list = useAsync(s => api.reports(s), []);
  const rows: ReportSummary[] = list.data ?? [];
  const activeId = rid ?? rows[0]?.id;
  return { list, rows, activeId };
}

export function ReportPicker({ rows, activeId, base }: { rows: ReportSummary[]; activeId?: string; base: "comparable" | "innovation" }) {
  if (rows.length < 2) return null;
  return (
    <label className="picker">
      <span className="muted">Analysis</span>
      <select value={activeId} onChange={e => navigate(`/${base}/${e.target.value}`)}>
        {rows.map(r => <option key={r.id} value={r.id}>{r.title} — {fmtPct(r.originality_score)} original · {fmtDate(r.created_at)}</option>)}
      </select>
    </label>
  );
}
