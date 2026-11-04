import { useRef, useState, type CSSProperties } from "react";
import { Link } from "@/lib/router";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/* STAND-IN: the original LineSidebar source was not in the recovered bundle. Implements the
   behaviour in your spec: line markers, pointer-proximity shift (radius / max shift), index numbers. */
export interface LineSidebarItem { label: string; to: string }

export function LineSidebar({
  items, activePath, accent = "#A855F7", textColor = "#C4C4C4", markerColor = "#6C6C6C",
  proximityRadius = 100, maxShift = 15, itemGap = 24, fontSize = "1rem", showIndex = true, onNavigate,
}: {
  items: LineSidebarItem[]; activePath: string; accent?: string; textColor?: string; markerColor?: string;
  proximityRadius?: number; maxShift?: number; itemGap?: number; fontSize?: string; showIndex?: boolean; onNavigate?: () => void;
}) {
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [shifts, setShifts] = useState<number[]>([]);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    setShifts(items.map((_, i) => {
      const el = refs.current[i]; if (!el) return 0;
      const r = el.getBoundingClientRect(); const d = Math.abs(e.clientY - (r.top + r.height / 2));
      return maxShift * Math.max(0, 1 - d / proximityRadius);
    }));
  };
  const style = { "--ls-accent": accent, "--ls-text": textColor, "--ls-marker": markerColor, "--ls-gap": `${itemGap}px`, "--ls-size": fontSize } as CSSProperties;
  const isActive = (to: string) => activePath === to || (to !== "/dashboard" && activePath.startsWith(to + "/"));

  return (
    <nav aria-label="Main" className="line-sidebar" style={style} onPointerMove={onMove} onPointerLeave={() => setShifts([])}>
      <ul>
        {items.map((it, i) => {
          const active = isActive(it.to), shift = shifts[i] ?? 0;
          return (
            <li key={it.to} ref={el => { refs.current[i] = el; }} className={active ? "is-active" : ""}>
              <Link to={it.to} onClick={onNavigate} aria-current={active ? "page" : undefined}
                    style={{ transform: `translateX(${shift}px)` }}>
                <span className="line-sidebar__marker" aria-hidden="true" style={{ width: 14 + shift * 1.4 }} />
                {showIndex && <span className="line-sidebar__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
                <span className="line-sidebar__label">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
