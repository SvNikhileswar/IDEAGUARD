import { useEffect, useState, type ReactNode } from "react";
import { Link, usePath } from "@/lib/router";
import { LineSidebar } from "./standins/LineSidebar";
import { SiteFooter } from "./SiteFooter";
import { Icon } from "./icons";

export const NAV = [
  { label: "Overview", to: "/dashboard" },
  { label: "New Analysis", to: "/new" },
  { label: "My Projects", to: "/projects" },
  { label: "Analysis History", to: "/history" },
  { label: "Comparable Projects", to: "/comparable" },
  { label: "Innovation Paths", to: "/innovation" },
  { label: "Settings", to: "/settings" },
];

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="IdeaGuard home">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3l11 4.5v7.2c0 7-4.6 11.6-11 13.8C9.6 26.300 5 21.700 5 14.700V7.500L16 3z" stroke="#A78BFA" strokeWidth="2" /><path d="M11 15.500l3.500 3.500L21 12" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>IDEAGUARD</span>
    </Link>
  );
}

export function AppShell({ children, footer = true, bleed = false }: { children: ReactNode; footer?: boolean; bleed?: boolean }) {
  const path = usePath();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <div className="shell">
      <a className="skip" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to content</a>
      <header className="shell__bar">
        <Brand />
        <button type="button" className="icon-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="side" onClick={() => setOpen(o => !o)}>
          <Icon name={open ? "close" : "menu"} />
        </button>
      </header>
      {open && <button type="button" className="shell__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside id="side" className={"shell__side" + (open ? " is-open" : "")}>
        <div className="shell__brand"><Brand /></div>
        <LineSidebar items={NAV} activePath={path} onNavigate={() => setOpen(false)} />
        <Link to="/new" className="btn btn--primary shell__cta"><Icon name="plus" size={16} />New analysis</Link>
      </aside>
      <div className="shell__main">
        <main id="main-content" tabIndex={-1} className={bleed ? "page page--bleed" : "page"}>{children}</main>
        {footer && <SiteFooter />}
      </div>
    </div>
  );
}
