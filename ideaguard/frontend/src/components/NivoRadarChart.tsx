import { ResponsiveRadar } from "@nivo/radar";
import type { Match } from "@/lib/api";

/* Real @nivo/radar. Every number comes from the backend's per-match `category_scores`
   (Gemini's 0-100 rating of how similar that project is to YOUR idea on each dimension).
   Dimensions the backend did not return for any shown match are omitted — nothing is invented.
   NOTE: the backend scores four dimensions (problem, features, tech stack, users); it has no
   "implementation" score, so the chart has four axes. */
const DIMENSIONS: { key: keyof Match["category_scores"]; label: string }[] = [
  { key: "features", label: "Feature similarity" },
  { key: "tech_stack", label: "Technology similarity" },
  { key: "problem", label: "Problem similarity" },
  { key: "users", label: "Target audience" },
];
export const RADAR_COLORS = ["#A78BFA", "#22D3EE", "#5B7CFA"];

export function buildRadar(matches: Match[], count = 3) {
  const shown = matches.slice(0, count);
  const keys = shown.map((m, i) => (shown.findIndex(x => x.title === m.title) === i ? m.title : `${m.title} (${i + 1})`));
  const dims = DIMENSIONS.filter(d => shown.some(m => typeof m.category_scores?.[d.key] === "number"));
  const data = dims.map(d => {
    const row: Record<string, string | number> = { dimension: d.label };
    shown.forEach((m, i) => { const v = m.category_scores?.[d.key]; row[keys[i]] = typeof v === "number" ? Math.max(0, Math.min(100, v)) : 0; });
    return row;
  });
  return { data, keys };
}

export function NivoRadarChart({ matches }: { matches: Match[] }) {
  const { data, keys } = buildRadar(matches);
  if (data.length < 3) return <p className="muted">The backend returned too few comparison metrics to draw a radar chart for this report.</p>;
  return (
    <figure className="radar-figure">
      <div className="radar-figure__chart" role="img" aria-label={`Radar chart comparing your idea with ${keys.join(", ")} across ${data.length} dimensions`}>
        <ResponsiveRadar
          data={data} keys={keys} indexBy="dimension" maxValue={100} margin={{ top: 36, right: 64, bottom: 36, left: 64 }}
          gridShape="circular" gridLevels={4} gridLabelOffset={16} dotSize={7} dotBorderWidth={1.5} dotBorderColor={{ from: "color" }}
          colors={RADAR_COLORS} fillOpacity={0.16} borderWidth={2} blendMode="screen" motionConfig="gentle"
          theme={{
            text: { fill: "#A1A1AA", fontSize: 12 },
            grid: { line: { stroke: "rgba(255,255,255,0.10)" } },
            tooltip: { container: { background: "#1C1730", color: "#F8FAFC", borderRadius: 10, fontSize: 12, border: "1px solid rgba(255,255,255,0.1)" } },
          }}
        />
      </div>
      <figcaption className="radar-legend">
        {keys.map((k, i) => <span key={k}><i style={{ background: RADAR_COLORS[i] }} />{k}</span>)}
        <small>Each shape = that project's similarity to your idea (0–100) per dimension.</small>
      </figcaption>
    </figure>
  );
}
