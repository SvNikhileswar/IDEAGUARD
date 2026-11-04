import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/* STAND-IN for SylvaLivingWorldScene. The official ThreeUI bundle (sylva-living-world.json) could
   not be downloaded in this environment, and per the brief it is NOT approximated as the original.
   This is a lightweight 2D canvas "living green" backdrop (drifting fireflies, swaying grass) so the
   Innovation page has atmosphere until the real scene is dropped in at this same slot. */
export function LivingGreenBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, raf = 0, visible = true, t0 = performance.now();
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const flies = Array.from({ length: mobile ? 28 : 60 }, (_, i) => ({ x: Math.random(), y: Math.random(), p: Math.random() * 6.28, s: 0.02 + Math.random() * 0.05, r: 1 + Math.random() * 1.8, i }));
    const blades = Array.from({ length: mobile ? 70 : 150 }, () => ({ x: Math.random(), h: 0.05 + Math.random() * 0.16, p: Math.random() * 6.28, hue: 140 + Math.random() * 50 }));
    const resize = () => { const d = Math.min(devicePixelRatio || 1, 1.5); const r = canvas.getBoundingClientRect(); w = r.width; h = r.height; canvas.width = w * d; canvas.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(0); }); ro.observe(canvas);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 1.05, h * 0.9);
      g.addColorStop(0, "rgba(34,197,94,0.20)"); g.addColorStop(0.5, "rgba(20,120,90,0.08)"); g.addColorStop(1, "rgba(8,6,17,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (const b of blades) {
        const sway = Math.sin(t * 0.0008 + b.p) * 10, x = b.x * w, y = h, top = h * b.h;
        ctx.strokeStyle = `hsla(${b.hue},55%,38%,0.5)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway * 0.4, y - top * 0.6, x + sway, y - top); ctx.stroke();
      }
      for (const f of flies) {
        const x = (f.x + Math.sin(t * 0.0001 * f.s * 40 + f.p) * 0.04) * w, y = (f.y + Math.cos(t * 0.00012 * f.s * 40 + f.p) * 0.04) * h;
        const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.002 * (0.5 + f.s * 10) + f.p));
        const gl = ctx.createRadialGradient(x, y, 0, x, y, f.r * 7); gl.addColorStop(0, `rgba(190,255,170,${a})`); gl.addColorStop(1, "rgba(190,255,170,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, f.r * 7, 0, 6.283); ctx.fill();
      }
    };
    const loop = (now: number) => { raf = 0; if (!visible || document.hidden) return; draw(now - t0); raf = requestAnimationFrame(loop); };
    const wake = () => { if (!raf && !reduced && visible && !document.hidden) raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }); io.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    if (reduced) draw(0); else wake();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", wake); };
  }, [reduced]);
  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}
