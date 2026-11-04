import os, json, time
import numpy as np
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")
EMBED_MODEL = os.getenv("EMBED_MODEL", "gemini-embedding-001")

# Raw cosine similarity of text embeddings is usually 0.5-0.9.
# LOW/HIGH stretch it into a 0-100 score. Tune after testing.
LOW, HIGH = 0.55, 0.90


def embed_texts(texts):
    out = []
    batch = 50
    for i in range(0, len(texts), batch):
        for attempt in range(8):
            try:
                res = client.models.embed_content(model=EMBED_MODEL, contents=texts[i:i + batch])
                break
            except Exception as e:
                if "429" in str(e) and attempt < 7:
                    print("Rate limit hit, waiting 40 seconds...")
                    time.sleep(40)
                else:
                    raise
        out.extend([e.values for e in res.embeddings])
        if i + batch < len(texts):
            print(f"Embedded {len(out)}/{len(texts)}, pausing 62s for the free-tier limit...")
            time.sleep(62)
    arr = np.array(out, dtype=np.float32)
    arr /= np.linalg.norm(arr, axis=1, keepdims=True)
    return arr

# Optional second model, used only if the main one keeps failing (e.g. Google says "high demand").
LLM_FALLBACK_MODEL = os.getenv("LLM_FALLBACK_MODEL", "").strip()
_TRANSIENT = ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "500", "INTERNAL", "504", "DEADLINE",
              "overloaded", "high demand")


def _is_transient(e):
    s = str(e)
    return any(t in s for t in _TRANSIENT)


def llm_json(prompt):
    """Ask Gemini for JSON. Busy/overloaded errors (503, 429...) are retried with growing waits
    (2, 4, 8, 16, 20 s) and then, if LLM_FALLBACK_MODEL is set, tried on that model.
    Permanent errors (wrong model name, bad key) fail straight away with Google's message."""
    models = [LLM_MODEL]
    if LLM_FALLBACK_MODEL and LLM_FALLBACK_MODEL != LLM_MODEL:
        models.append(LLM_FALLBACK_MODEL)
    last = None
    for model in models:
        delay = 2
        for attempt in range(5):
            try:
                res = client.models.generate_content(
                    model=model, contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.3),
                )
                data = json.loads(res.text)
                if isinstance(data, list):
                    data = {"matches": data}
                return data
            except (ValueError, TypeError) as e:      # empty / malformed JSON: just ask again
                last = e
                time.sleep(1)
            except Exception as e:
                last = e
                if not _is_transient(e):
                    break                              # not worth retrying this model
                print(f"[{model}] busy (try {attempt + 1}/5), retrying in {delay}s: {str(e)[:140]}")
                time.sleep(delay)
                delay = min(delay * 2, 20)
        if model != models[-1]:
            print(f"[{model}] gave up, switching to fallback model {models[-1]}")
    raise last


def to_score(cos):
    return round(float(max(0, min(1, (cos - LOW) / (HIGH - LOW)))) * 100, 1)


def verdict(score):
    if score > 85: return "Duplicate"
    if score > 65: return "Highly Similar"
    if score > 40: return "Partially Similar"
    return "Original"
