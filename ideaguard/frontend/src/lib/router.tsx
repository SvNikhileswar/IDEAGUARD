import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

/* Tiny hash router. Hash URLs mean every deep link (#/results/ab12cd34) works when the
   FastAPI server serves the single index.html, with no server-side route table needed. */

const subscribe = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
const read = () => (window.location.hash.replace(/^#/, "") || "/").split("?")[0] || "/";

export function usePath(): string { return useSyncExternalStore(subscribe, read, () => "/"); }

export function navigate(to: string) {
  const next = "#" + to;
  if (window.location.hash === next) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else window.location.hash = next;
  window.scrollTo({ top: 0 });
}

export function Link({ to, children, onClick, ...rest }: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); navigate(to);
  };
  return <a href={"#" + to} onClick={handle} {...rest}>{children}</a>;
}

export interface RouteDef { pattern: string; render: (params: Record<string, string>) => ReactNode }

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean), b = path.split("/").filter(Boolean);
  const optional = a.filter(s => s.endsWith("?")).length;
  if (b.length > a.length || b.length < a.length - optional) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    const seg = a[i];
    if (seg.startsWith(":")) {
      const key = seg.slice(1).replace("?", "");
      if (b[i] !== undefined) params[key] = decodeURIComponent(b[i]);
      else if (!seg.endsWith("?")) return null;
    } else if (seg !== b[i]) return null;
  }
  return params;
}

export function Routes({ routes, fallback }: { routes: RouteDef[]; fallback: ReactNode }) {
  const path = usePath();
  for (const r of routes) { const p = matchRoute(r.pattern, path); if (p) return <>{r.render(p)}</>; }
  return <>{fallback}</>;
}
