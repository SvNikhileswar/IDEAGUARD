# IdeaGuard

1. Copy `.env.example` to `.env` and paste your NEW Gemini key after GEMINI_API_KEY=
2. Double-click `run.bat` (first run installs packages and embeds the dataset, about 2-3 minutes)
3. Open http://localhost:8000

Dataset: `data/projects.json` has 200 sample projects (synthetic). Rebuild with `python build_dataset.py`.
Tune scores: LOW/HIGH in core.py. Change model: LLM_MODEL in .env.
