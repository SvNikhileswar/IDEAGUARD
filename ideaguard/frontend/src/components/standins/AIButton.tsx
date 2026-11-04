import { useEffect, useRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/* STAND-IN: the original AI Button source was not in the recovered bundle (it used tsparticles).
   This version has a gradient body, shimmer sweep, sparkle icon and a small canvas sparkle burst
   on hover — with per-instance state, so there is no shared/mutated options object. */
export interface AIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { label: string; loading?: boolean; loadingLabel?: string }

export function AIButton({ label, loading = false, loadingLabel = "Analysing…", disabled, className, ...rest }: AIButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hot = useRef(false);
  const reduced = usePrefersReducedMotion();
  const off = disabled || loading;

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number };
    let parts: P[] = [], raf = 0, last = 0, w = 0, h = 0;
    const size = () => { const r = canvas.getBoundingClientRect(); const d = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height; canvas.width = w * d; canvas.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(canvas);
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (hot.current && parts.length < 36 && Math.random() < 0.6)
        parts.push({ x: Math.random() * w, y: h * (0.5 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 14, vy: -(14 + Math.random() * 26), life: 0, max: 0.7 + Math.random() * 0.7, s: 1 + Math.random() * 1.8 });
      ctx.clearRect(0, 0, w, h);
      parts = parts.filter(p => (p.life += dt) < p.max);
      for (const p of parts) {
        p.x += p.vx * dt; p.y += p.vy * dt; const a = 1 - p.life / p.max;
        ctx.globalAlpha = a; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (document.hidden || (!hot.current && !parts.length)) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const btn = canvas.parentElement!;
    const on = () => { if (!off) { hot.current = true; wake(); } }, out = () => { hot.current = false; };
    btn.addEventListener("pointerenter", on); btn.addEventListener("pointerleave", out); btn.addEventListener("focus", on); btn.addEventListener("blur", out);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); btn.removeEventListener("pointerenter", on); btn.removeEventListener("pointerleave", out); btn.removeEventListener("focus", on); btn.removeEventListener("blur", out); };
  }, [reduced, off]);

  return (
    <button type="button" disabled={off} aria-busy={loading} className={cn("ai-button", loading && "is-loading", className)} {...rest}>
      <canvas ref={canvasRef} className="ai-button__sparks" aria-hidden="true" />
      <span className="ai-button__shimmer" aria-hidden="true" />
      <span className="ai-button__content">
        {loading ? <span className="ai-button__spinner" aria-hidden="true" /> : <Icon name="sparkle" size={18} className="ai-button__icon" />}
        <span>{loading ? loadingLabel : label}</span>
      </span>
    </button>
  );
}
