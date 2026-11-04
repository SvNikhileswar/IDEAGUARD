import { useMemo, useState } from "react";
import type { Landscape } from "@/lib/api";

/* Draws GET /api/landscape/{rid}: a 2-D PCA projection of the reference projects' embeddings
   (k-means clusters from the backend) with your idea's real position highlighted. */
const CLUSTER = ["#5B7CFA", "#22D3EE", "#896ABD", "#38BDF8", "#818CF8", "#2DD4BF"];

export function LandscapeMap({ data, title }: { data: Landscape; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const v = useMemo(() => {
    const xs = [...data.points.map(p => p.x), data.my_idea.x], ys = [...data.points.map(p => p.y), data.my_idea.y];
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const W = 800, H = 480, pad = 40;
    const sx = (x: number) => pad + ((x - x0) / (x1 - x0 || 1)) * (W - pad * 2);
    const sy = (y: number) => H - pad - ((y - y0) / (y1 - y0 || 1)) * (H - pad * 2);
    return { W, H, pts: data.points.map(p => ({ ...p, px: sx(p.x), py: sy(p.y) })), me: { px: sx(data.my_idea.x), py: sy(data.my_idea.y) } };
  }, [data]);
  const h = hover != null ? v.pts[hover] : null;
  return (
    <figure className="landscape">
      <svg viewBox={`0 0 ${v.W} ${v.H}`} role="img" aria-label={`Idea landscape: ${data.points.length} reference projects and your idea “${title}”`}>
        {v.pts.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r={hover === i ? 7 : 4.5} fill={CLUSTER[p.cluster % CLUSTER.length]} opacity={hover == null || hover === i ? 0.8 : 0.3}
                  onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}><title>{p.title}</title></circle>
        ))}
        <circle cx={v.me.px} cy={v.me.py} r="18" fill="none" stroke="#A78BFA" strokeOpacity="0.45" />
        <circle cx={v.me.px} cy={v.me.py} r="8" fill="#F8FAFC" stroke="#A78BFA" strokeWidth="3" />
        <text x={v.me.px} y={v.me.py - 26} textAnchor="middle" fill="#F8FAFC" fontSize="15" fontWeight="600">Your idea</text>
        {h && <text x={Math.min(Math.max(h.px, 90), v.W - 90)} y={Math.max(h.py - 14, 16)} textAnchor="middle" fill="#F8FAFC" fontSize="13">{h.title}</text>}
      </svg>
      <figcaption className="muted">Each dot is a reference project; nearby dots are conceptually similar and colours are clusters. Hover a dot to see its name.</figcaption>
    </figure>
  );
}
