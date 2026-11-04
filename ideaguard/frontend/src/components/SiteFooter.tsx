import { LazyFooter } from "./Lazy";

/* Global footer = the original HalftoneWordmarkFooter, configured per the brief. Links are real routes. */
export function SiteFooter() {
  return (
    <LazyFooter
      wordmark="ideaguard" preset="night" palette={{ background: "#080611", warm: "#896ABD" }}
      dotGap={6} interactive height="560px" label="IDEAGUARD" meta="Know how original your idea is."
      columns={[
        { title: "Analyse", links: [{ label: "New Analysis", href: "#/new" }, { label: "Analysis History", href: "#/history" }, { label: "My Projects", href: "#/projects" }] },
        { title: "Explore", links: [{ label: "Comparable Projects", href: "#/comparable" }, { label: "Innovation Paths", href: "#/innovation" }, { label: "Overview", href: "#/dashboard" }] },
        { title: "IdeaGuard", links: [{ label: "Home", href: "#/" }, { label: "Settings & status", href: "#/settings" }] },
      ]}
    />
  );
}
