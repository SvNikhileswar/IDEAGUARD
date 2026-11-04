import { useEffect, useRef, useState } from "react";
import { cancelAnalysis, loadPendingIdea, resetAnalysis, retryAnalysis, useAnalysis } from "@/lib/analysis";
import { navigate } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { LazyRadar } from "@/components/Lazy";
import { AnimatedTimeline, type TimelineItem } from "@/components/standins/AnimatedTimeline";
import { Icon } from "@/components/icons";

export default function Analyzing() {
  const a = useAnalysis();
  const pending = loadPendingIdea();
  const [now, setNow] = useState(Date.now());
  const leaving = useRef(false);           // set once we deliberately navigate away (e.g. to the results)

  // idle with nothing pending → nothing to show
  useEffect(() => { if (a.phase === "idle" && !pending && !leaving.current) navigate("/new"); }, [a.phase, pending]);
  // the REAL completion signal: the server returned a report with an id
  useEffect(() => {
    if (a.phase === "done" && a.rid) { const rid = a.rid; leaving.current = true; navigate(`/results/${rid}`); resetAnalysis(); }
  }, [a.phase, a.rid]);
  useEffect(() => {
    if (a.phase !== "waiting" && a.phase !== "preparing") return;
    const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id);
  }, [a.phase]);

  const interrupted = a.phase === "idle" && !!pending;       // e.g. the tab was reloaded mid-request
  const failed = a.phase === "error";
  const running = a.phase === "preparing" || a.phase === "waiting";
  const elapsed = a.startedAt ? Math.max(0, Math.round(((a.finishedAt ?? now) - a.startedAt) / 1000)) : 0;

  const items: TimelineItem[] = [
    { id: "prep", title: "Preparing submission", description: "Your idea is validated and packaged in the browser.",
      status: a.phase === "preparing" ? "active" : interrupted ? "pending" : "done" },
    { id: "wait", title: "Waiting for analysis response",
      description: running ? "The server is embedding your idea, ranking the project dataset and asking Gemini for the analysis — it reports back once, when everything is finished." : failed ? "The request ended before the server returned a report." : "Not started.",
      status: a.phase === "waiting" ? "active" : failed ? "error" : a.phase === "done" ? "done" : "pending" },
    { id: "done", title: failed ? "Analysis failed" : "Analysis completed", description: failed ? a.error ?? undefined : "Your report opens as soon as the server returns it.",
      status: failed ? "error" : a.phase === "done" ? "done" : "pending" },
  ];

  return (
    <AppShell footer={false}>
      <div className="bg-fixed" aria-hidden="true">
        <LazyRadar color="#A78BFA" backgroundColor="transparent" mode="sweep" speed={0.8} trail={0.4} scale={0.85} ringCount={6} spokeCount={12}
          ticks targets={6} clutter={0.25} glow={1.2} brightness={0.85} gridOpacity={0.65} lineWidth={1.2} mouseInteraction intro paused={!running} />
      </div>
      <section className="analyzing" aria-live="polite">
        <p className="eyebrow">{failed ? "Something went wrong" : interrupted ? "Interrupted" : "Working"}</p>
        <h1>{failed ? "ANALYSIS FAILED" : interrupted ? "ANALYSIS INTERRUPTED" : "ANALYSING YOUR IDEA"}</h1>
        <p className="analyzing__sub">
          {failed ? a.error : interrupted ? "The page was reloaded while the analysis was running, so the request was lost. Nothing was saved — run it again." : "Scanning the innovation landscape and evaluating your project..."}
        </p>
        {(pending || a.idea) && <p className="analyzing__idea">“{(a.idea ?? pending)!.title}”</p>}
        <div className="card analyzing__card">
          <AnimatedTimeline items={items} />
          {running && <p className="muted analyzing__time" role="timer">Elapsed: {elapsed}s · exact sub-steps run on the server inside one request, so IdeaGuard only reports what it can verify.</p>}
        </div>
        <div className="analyzing__actions">
          {running && <button type="button" className="btn btn--ghost" onClick={() => { cancelAnalysis(); navigate("/new"); }}>Cancel</button>}
          {(failed || interrupted) && <>
            <button type="button" className="btn btn--primary" onClick={() => retryAnalysis()}><Icon name="refresh" size={16} />Retry</button>
            <button type="button" className="btn btn--ghost" onClick={() => { resetAnalysis(); navigate("/new"); }}>Edit idea</button>
          </>}
        </div>
      </section>
    </AppShell>
  );
}
