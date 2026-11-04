import { useMemo } from "react";
import { navigate } from "@/lib/router";

/* STAND-IN: the original NotFoundEclipse (HTML + CSS + React versions) was not in the recovered
   bundle. One consolidated React component with: starfield, twinkling, glowing eclipse, orbital ring,
   animated 404 digits, entrance animation and prefers-reduced-motion support (see standins.css). */
export function NotFoundEclipse({ to = "/dashboard" }: { to?: string }) {
  const stars = useMemo(() => {
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 120 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.6 + rnd() * 1.6, d: rnd() * 5, t: 2 + rnd() * 4 }));
  }, []);
  return (
    <main className="eclipse" aria-labelledby="nf-title">
      <div className="eclipse__stars" aria-hidden="true">
        {stars.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }} />)}
      </div>
      <div className="eclipse__scene" aria-hidden="true">
        <span className="eclipse__ring eclipse__ring--a"><b /></span>
        <span className="eclipse__ring eclipse__ring--b" />
        <span className="eclipse__corona" />
        <span className="eclipse__moon" />
        <span className="eclipse__digits"><em>4</em><em className="o">0</em><em>4</em></span>
      </div>
      <div className="eclipse__copy">
        <h1 id="nf-title">Lost in the Innovation Universe?</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate(to)}>Back to Dashboard</button>
      </div>
    </main>
  );
}
