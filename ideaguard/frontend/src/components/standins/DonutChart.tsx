import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* STAND-IN: the original DonutChart source was not in the recovered bundle. Same prop names as
   your prompt (size, progress, circleWidth, progressWidth, rounded, *ClassName). */
export function DonutChart({
  size = 180, progress, circleWidth = 12, progressWidth = 12, rounded = true,
  progressClassName = "text-violet-400", circleClassName = "text-white/10", className, children, label,
}: {
  size?: number; progress: number; circleWidth?: number; progressWidth?: number; rounded?: boolean;
  progressClassName?: string; circleClassName?: string; className?: string; children?: ReactNode; label?: string;
}) {
  const value = Math.max(0, Math.min(100, progress));
  const [shown, setShown] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(value)); return () => cancelAnimationFrame(id); }, [value]);
  const stroke = Math.max(circleWidth, progressWidth);
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}
         role="img" aria-label={label ?? `${Math.round(value)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={circleWidth} className={circleClassName} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={progressWidth}
                strokeLinecap={rounded ? "round" : "butt"} strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)}
                className={cn(progressClassName, "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-[1400ms] motion-safe:ease-out")} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
