import { cn } from "@/lib/utils";

/* STAND-IN: the original AnimatedTimeline source was not in the recovered bundle.
   Status is driven entirely by the caller — this component never advances on its own. */
export type TimelineStatus = "done" | "active" | "pending" | "error";
export interface TimelineItem { id: string; title: string; description?: string; status: TimelineStatus }

export function AnimatedTimeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("atl", className)} aria-label="Analysis progress">
      {items.map((it, i) => (
        <li key={it.id} className={cn("atl__item", `is-${it.status}`)} aria-current={it.status === "active" ? "step" : undefined}>
          <span className="atl__rail" aria-hidden="true">
            <span className="atl__dot">{it.status === "done" ? "✓" : it.status === "error" ? "!" : ""}</span>
            {i < items.length - 1 && <span className="atl__line"><span className="atl__fill" /></span>}
          </span>
          <span className="atl__body">
            <span className="atl__title">{it.title}</span>
            {it.description && <span className="atl__desc">{it.description}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
