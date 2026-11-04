import type { Report } from "./api";
import { list, text } from "./api";

const pct = (n: unknown) => (typeof n === "number" ? `${Math.round(n)}%` : "n/a");
const bullets = (a: string[]) => (a.length ? a.map(x => `- ${x}`).join("\n") : "_none reported_");

/** Builds a Markdown report from the REAL report returned by GET /api/report/{rid}. */
export function reportToMarkdown(r: Report): string {
  const rec = r.recommendations || {};
  const idea = r.idea;
  const out: string[] = [
    `# IdeaGuard report — ${r.title}`,
    `Report id: \`${r.id}\`${r.created_at ? ` · ${new Date(r.created_at).toLocaleString()}` : ""}`,
    "",
    `## Result`,
    `- **Originality score:** ${pct(r.originality_score)}`,
    `- **Weighted similarity to closest projects:** ${pct(r.overall_score)}`,
    `- **Verdict:** ${r.verdict}`,
    `- **Projects above 50% similarity:** ${r.saturation_count}`,
  ];
  if (idea) out.push("", "## Your idea", `**Problem:** ${idea.problem}`, "", `**Solution:** ${idea.solution || "—"}`, "", `**Features:** ${idea.features.join(", ") || "—"}`, "", `**Tech stack:** ${idea.tech_stack.join(", ") || "—"}`, "", `**Target users:** ${idea.target_users || "—"}`);
  out.push("", "## Unique selling point", text(rec.usp) || "—", "", "## Suggested pitch", r.rewritten_pitch || text(rec.rewritten_pitch) || "—");
  out.push("", "## Similar projects");
  for (const m of r.matches) {
    out.push("", `### ${m.title} — ${pct(m.similarity)} similar`, m.description, "",
      `Source: ${m.source || "—"} · Tech: ${(m.tech_stack || []).join(", ") || "—"}`, "",
      `**Overlapping features**\n${bullets(list(m.overlapping_features))}`, "",
      `**Your unique features**\n${bullets(list(m.my_unique_features))}`, "",
      `**Their unique features**\n${bullets(list(m.their_unique_features))}`, "", `_${text(m.explanation)}_`);
  }
  out.push("", "## Innovation opportunities", "", "### Improve (enhancements)", bullets(list(rec.enhancements)), "", "### Differentiate (gaps in existing work)", bullets(list(rec.gaps)), "", "### Innovate (pivots)", bullets(list(rec.pivots)), "");
  return out.join("\n");
}

export function saveBlob(name: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "report";
