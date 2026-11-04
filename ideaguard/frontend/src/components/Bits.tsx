import type { ReactNode } from "react";
import { Icon } from "./icons";
import { Link } from "@/lib/router";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="page-head__sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  );
}
export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="state" role="status"><span className="spinner" aria-hidden="true" />{label}</div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <Icon name="alert" size={20} /><div><strong>Something went wrong</strong><p>{message}</p></div>
      {onRetry && <button type="button" className="btn btn--ghost" onClick={onRetry}><Icon name="refresh" size={16} />Retry</button>}
    </div>
  );
}
export function EmptyState({ title, text, to, cta }: { title: string; text: string; to?: string; cta?: string }) {
  return (
    <div className="state state--empty">
      <Icon name="compass" size={26} /><div><strong>{title}</strong><p>{text}</p></div>
      {to && <Link to={to} className="btn btn--primary">{cta}</Link>}
    </div>
  );
}
export const fmtPct = (n: number | null | undefined) => (typeof n === "number" ? `${Math.round(n)}%` : "—");
export const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");
export function verdictTone(v: string): "good" | "warn" | "bad" {
  const x = v.toLowerCase();
  return x.includes("original") ? "good" : x.includes("partial") ? "warn" : "bad";
}
