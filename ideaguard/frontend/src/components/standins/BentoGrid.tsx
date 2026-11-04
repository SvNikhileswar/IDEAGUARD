import type { CSSProperties } from "react";
import { Link } from "@/lib/router";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

/* STAND-IN: the original Animata "Moving Gradient Bento Grid" + MovingGradient were not in the
   recovered bundle. Rebuilt directly in the IdeaGuard dark theme: a bento layout whose cards each
   carry an animated, slowly drifting gradient that brightens on hover, with an animated icon. */
export function MovingGradient({ colors, className }: { colors: [string, string, string]; className?: string }) {
  return <span aria-hidden="true" className={cn("moving-gradient", className)} style={{ "--mg-a": colors[0], "--mg-b": colors[1], "--mg-c": colors[2] } as CSSProperties} />;
}

export interface BentoItem { title: string; description: string; to: string; icon: IconName; colors: [string, string, string]; cta: string }

export function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="bento">
      {items.map((it, i) => (
        <Link key={it.to + it.title} to={it.to} className={cn("bento__card", `bento__card--${i + 1}`)}>
          <MovingGradient colors={it.colors} />
          <span className="bento__icon"><Icon name={it.icon} size={22} /></span>
          <span className="bento__text">
            <span className="bento__title">{it.title}</span>
            <span className="bento__desc">{it.description}</span>
          </span>
          <span className="bento__cta">{it.cta}<Icon name="arrow" size={16} /></span>
        </Link>
      ))}
    </div>
  );
}
