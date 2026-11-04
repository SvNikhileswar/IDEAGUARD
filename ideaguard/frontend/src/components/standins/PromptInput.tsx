import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Idea } from "@/lib/api";
import { Icon } from "@/components/icons";

/* STAND-IN for React Bits Pro "Prompt Input 6". That component is paid/licensed and its source was
   not supplied, so it is NOT reproduced. This is the IdeaGuard form with the same role: a quick
   free-text description (auto-filled into fields via the real POST /api/extract) plus advanced fields
   for everything POST /api/submit needs. When you install the licensed component
   (npx shadcn@latest add @reactbits-pro/prompt-input-6, key kept in REACTBITS_LICENSE_KEY on your
   machine, never in frontend code) it can replace this in pages/NewAnalysis.tsx. */

function TagInput({ id, label, values, onChange, placeholder }: { id: string; label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const commit = (raw: string) => {
    const parts = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length) onChange([...values, ...parts.filter(p => !values.includes(p))]);
    setDraft("");
  };
  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(draft); }
    else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
  };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="tags">
        {values.map(v => (
          <span className="tag" key={v}>{v}<button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter(x => x !== v))}><Icon name="close" size={12} /></button></span>
        ))}
        <input id={id} value={draft} placeholder={values.length ? "" : placeholder} onChange={e => setDraft(e.target.value)} onKeyDown={key} onBlur={() => draft.trim() && commit(draft)} />
      </div>
    </div>
  );
}

export function PromptInput({
  idea, onChange, quick, onQuick, onExtract, extracting, extractError, footer,
}: {
  idea: Idea; onChange: (i: Idea) => void; quick: string; onQuick: (s: string) => void;
  onExtract: () => void; extracting: boolean; extractError: string | null; footer: ReactNode;
}) {
  const uid = useId();
  const set = <K extends keyof Idea>(k: K, v: Idea[K]) => onChange({ ...idea, [k]: v });
  return (
    <div className="prompt">
      <div className="field">
        <label htmlFor={`${uid}-quick`}>Describe your idea <span className="muted">(optional quick start)</span></label>
        <textarea id={`${uid}-quick`} rows={3} value={quick} onChange={e => onQuick(e.target.value)}
                  placeholder="e.g. A mobile app that uses face recognition to mark attendance in college classrooms and stops proxy attendance…" />
        <div className="prompt__bar">
          <button type="button" className="btn btn--ghost" onClick={onExtract} disabled={extracting || quick.trim().length < 10} aria-busy={extracting}>
            <Icon name="wand" size={16} />{extracting ? "Reading your idea…" : "Auto-fill fields with AI"}
          </button>
          <span className="muted">Uses Gemini to fill the fields below. You can edit everything.</span>
        </div>
        {extractError && <p className="form-error" role="alert">{extractError}</p>}
      </div>
      <div className="prompt__divider"><span>Project details</span></div>
      <div className="prompt__grid">
        <div className="field span-2">
          <label htmlFor={`${uid}-title`}>Project title <b aria-hidden="true">*</b></label>
          <input id={`${uid}-title`} required value={idea.title} onChange={e => set("title", e.target.value)} placeholder="Short, descriptive name" maxLength={120} />
        </div>
        <div className="field span-2">
          <label htmlFor={`${uid}-problem`}>Problem statement <b aria-hidden="true">*</b></label>
          <textarea id={`${uid}-problem`} required rows={3} value={idea.problem} onChange={e => set("problem", e.target.value)} placeholder="What problem does it solve, and for whom?" />
        </div>
        <div className="field span-2">
          <label htmlFor={`${uid}-solution`}>Proposed solution</label>
          <textarea id={`${uid}-solution`} rows={3} value={idea.solution} onChange={e => set("solution", e.target.value)} placeholder="How does your project solve it?" />
        </div>
        <TagInput id={`${uid}-features`} label="Key features" values={idea.features} onChange={v => set("features", v)} placeholder="Type a feature, press Enter" />
        <TagInput id={`${uid}-tech`} label="Technology stack" values={idea.tech_stack} onChange={v => set("tech_stack", v)} placeholder="e.g. React, Python…" />
        <div className="field span-2">
          <label htmlFor={`${uid}-users`}>Target users</label>
          <input id={`${uid}-users`} value={idea.target_users} onChange={e => set("target_users", e.target.value)} placeholder="Who is it for?" />
        </div>
      </div>
      <div className="prompt__footer">{footer}</div>
    </div>
  );
}
