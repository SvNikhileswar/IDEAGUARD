import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* STAND-IN: the original GlowingCard source was not in the recovered bundle. Gradient border + soft
   glow, fluid width (no fixed narrow width), colours via fromColor / viaColor / toColor. */
export function GlowingCard({
  fromColor = "#896ABD", viaColor = "#5B7CFA", toColor = "#22D3EE", className, children,
}: { fromColor?: string; viaColor?: string; toColor?: string; className?: string; children: ReactNode }) {
  const style = { "--gc-from": fromColor, "--gc-via": viaColor, "--gc-to": toColor } as CSSProperties;
  return (
    <div className={cn("glowing-card", className)} style={style}>
      <span className="glowing-card__glow" aria-hidden="true" />
      <div className="glowing-card__border">
        <div className="glowing-card__inner">{children}</div>
      </div>
    </div>
  );
}
