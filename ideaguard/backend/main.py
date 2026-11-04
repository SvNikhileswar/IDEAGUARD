import json, uuid, os, threading
from datetime import datetime, timezone
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from core import embed_texts, llm_json, to_score, verdict

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
PROJECTS = json.load(open(os.path.join(DATA, "projects.json"), encoding="utf-8"))


def project_text(p):
    return (f"{p['title']}. {p['description']} Features: {', '.join(p.get('features', []))}. "
            f"Tech: {', '.join(p.get('tech_stack', []))}")


EMB_PATH = os.path.join(DATA, "embeddings.npy")
if os.path.exists(EMB_PATH) and len(np.load(EMB_PATH)) == len(PROJECTS):
    EMB = np.load(EMB_PATH)
else:
    print(f"First run: embedding {len(PROJECTS)} projects (about a minute)...")
    EMB = embed_texts([project_text(p) for p in PROJECTS])
    np.save(EMB_PATH, EMB)
    print("Saved embeddings.")

app = FastAPI(title="IdeaGuard")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
REPORTS, QUERY_VECS = {}, {}
TOP_K = 6

# --- Added for the new UI: reports survive restarts (data/reports.json) ---
STORE_PATH = os.path.join(DATA, "reports.json")
_store_lock = threading.Lock()


def _load_store():
    if not os.path.exists(STORE_PATH):
        return
    try:
        raw = json.load(open(STORE_PATH, encoding="utf-8"))
        for rid, entry in raw.items():
            vec = entry.pop("_vec", None)
            REPORTS[rid] = entry
            if vec is not None:
                QUERY_VECS[rid] = np.array(vec, dtype=np.float32)
    except Exception as e:  # a corrupt store must never stop the API from starting
        print(f"Could not read {STORE_PATH}: {e}")


def _save_store():
    with _store_lock:
        out = {rid: {**r, "_vec": QUERY_VECS[rid].tolist()} if rid in QUERY_VECS else dict(r)
               for rid, r in REPORTS.items()}
        tmp = STORE_PATH + ".tmp"
        json.dump(out, open(tmp, "w", encoding="utf-8"))
        os.replace(tmp, STORE_PATH)


_load_store()


class Idea(BaseModel):
    title: str
    problem: str
    solution: str = ""
    features: list[str] = []
    tech_stack: list[str] = []
    target_users: str = ""


def idea_text(i: Idea):
    return (f"{i.title}. Problem: {i.problem}. Solution: {i.solution}. "
            f"Features: {', '.join(i.features)}. Tech: {', '.join(i.tech_stack)}. Users: {i.target_users}")


@app.get("/health")
def health():
    return {"status": "ok", "projects": len(PROJECTS), "reports": len(REPORTS),
            "llm_model": os.getenv("LLM_MODEL", "gemini-2.5-flash")}


@app.post("/api/submit")
def submit(idea: Idea):
    try:
        q = embed_texts([idea_text(idea)])[0]
        sims = EMB @ q
        scores_all = np.array([to_score(c) for c in sims])
        top = np.argsort(-sims)[:TOP_K]

        candidates = "\n".join(f"[{n}] {project_text(PROJECTS[i])}" for n, i in enumerate(top))
        analysis = llm_json(f"""You compare a new project idea with existing projects.
NEW IDEA: {idea_text(idea)}

EXISTING PROJECTS:
{candidates}

For EACH existing project return JSON:
{{"matches":[{{"index":0,
"overlapping_features":[], "partial_features":[],
"my_unique_features":[], "their_unique_features":[],
"explanation":"2 plain sentences on why they are similar or different",
"category_scores":{{"problem":0,"features":0,"tech_stack":0,"users":0}}}}]}}
category_scores values are integers 0-100. Return only JSON.""")
        by_idx = {m.get("index"): m for m in analysis.get("matches", []) if isinstance(m, dict)}

        matches = []
        for n, i in enumerate(top):
            p, a = PROJECTS[i], by_idx.get(n, {})
            matches.append({
                "id": int(i), "title": p["title"], "similarity": float(scores_all[i]),
                "description": p["description"], "tech_stack": p.get("tech_stack", []),
                "domain": p.get("domain", ""), "features": p.get("features", []),
                "source": p.get("source", ""), "url": p.get("url", ""),
                "overlapping_features": a.get("overlapping_features", []),
                "partial_features": a.get("partial_features", []),
                "my_unique_features": a.get("my_unique_features", []),
                "their_unique_features": a.get("their_unique_features", []),
                "explanation": a.get("explanation", ""),
                "category_scores": a.get("category_scores", {}),
            })

        w = [0.5, 0.3, 0.2]
        overall = round(sum(m["similarity"] * wt for m, wt in zip(matches[:3], w)), 1)
        cats = matches[0]["category_scores"] if matches else {}

        summary = "\n".join(f"- {m['title']} ({m['similarity']}%): {m['explanation']}" for m in matches[:4])
        recs = llm_json(f"""A student proposes: {idea_text(idea)}
Similar existing projects:
{summary}

Return JSON: {{"gaps":["3 strings: things existing projects do not cover"],
"pivots":["3 strings: different user group, domain or tech angles"],
"enhancements":["3 strings: features that add differentiation"],
"usp":"one unique selling point sentence",
"rewritten_pitch":"a 4-5 sentence pitch highlighting what makes it distinctive"}}
Return only JSON.""")
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {e}")

    rid = uuid.uuid4().hex[:8]
    REPORTS[rid] = {
        "id": rid, "title": idea.title, "overall_score": overall,
        "originality_score": round(100 - overall, 1), "verdict": verdict(overall),
        "category_scores": cats, "saturation_count": int((scores_all > 50).sum()),
        "matches": matches, "recommendations": recs,
        "rewritten_pitch": recs.get("rewritten_pitch", ""),
        "idea": idea.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    QUERY_VECS[rid] = q
    try:
        _save_store()
    except Exception as e:
        print(f"Could not persist report {rid}: {e}")
    return REPORTS[rid]


@app.get("/api/reports")
def list_reports():
    """New (additive): summaries of all saved analyses, newest first."""
    rows = []
    for r in REPORTS.values():
        top = r["matches"][0] if r.get("matches") else None
        rows.append({
            "id": r["id"], "title": r["title"], "originality_score": r["originality_score"],
            "overall_score": r["overall_score"], "verdict": r["verdict"],
            "saturation_count": r.get("saturation_count", 0), "created_at": r.get("created_at"),
            "top_match": top["title"] if top else None,
        })
    rows.sort(key=lambda x: x["created_at"] or "", reverse=True)
    return rows


@app.get("/api/report/{rid}")
def get_report(rid: str):
    if rid not in REPORTS:
        raise HTTPException(404, "Report not found")
    return REPORTS[rid]


def kmeans(X, k=5, iters=15):
    rng = np.random.default_rng(0)
    cent = X[rng.choice(len(X), min(k, len(X)), replace=False)].copy()
    for _ in range(iters):
        lab = np.argmin(((X[:, None] - cent[None]) ** 2).sum(-1), axis=1)
        for j in range(len(cent)):
            if (lab == j).any():
                cent[j] = X[lab == j].mean(0)
    return lab


@app.get("/api/landscape/{rid}")
def landscape(rid: str):
    if rid not in QUERY_VECS:
        raise HTTPException(404, "Report not found")
    allv = np.vstack([EMB, QUERY_VECS[rid]])
    c = allv - allv.mean(0)
    _, _, vt = np.linalg.svd(c, full_matrices=False)
    xy = c @ vt[:2].T
    labels = kmeans(xy[:-1])
    pts = [{"x": float(xy[i, 0]), "y": float(xy[i, 1]), "title": PROJECTS[i]["title"],
            "cluster": int(labels[i])} for i in range(len(PROJECTS))]
    return {"points": pts, "my_idea": {"x": float(xy[-1, 0]), "y": float(xy[-1, 1])}}


class Raw(BaseModel):
    text: str


@app.post("/api/extract")
def extract(r: Raw):
    try:
        return llm_json(f"""Turn this rough project idea into structured fields.
IDEA: {r.text}
Return JSON: {{"title":"short title","problem":"1-2 sentences","solution":"1-2 sentences","features":["4-5 short features"],"tech_stack":["suitable technologies"],"target_users":"who it is for"}}
Fill sensible details if missing. Return only JSON.""")
    except Exception as e:
        raise HTTPException(500, f"Could not read your idea: {e}")


@app.get("/")
def home():
    return FileResponse(os.path.join(BASE, "static", "index.html"))


app.mount("/static", StaticFiles(directory=os.path.join(BASE, "static")), name="static")
