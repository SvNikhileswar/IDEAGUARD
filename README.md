<p align="center">
  <img src="assets/ideaguard-banner.svg" width="100%" />
</p>
<p align="center">
  <b>Protect Your Innovation. Discover What's Different.</b>
</p>

<p align="center">
  An intelligent platform that analyzes project ideas, detects similarities with existing projects, measures originality, and discovers opportunities for innovation using Artificial Intelligence.
</p>

<p align="center">
  <a href="https://ideaguard-caac.onrender.com">🌐 Live Website</a> •
  <a href="https://github.com/SvNikhileswar/IDEAGUARD">💻 GitHub Repository</a>
</p>

---

## 🚀 About IDEAGUARD

IDEAGUARD is an AI-powered project originality analysis platform designed to help students, developers, innovators, and entrepreneurs evaluate their project ideas before development.

It uses Google's Gemini AI and semantic embeddings to compare submitted ideas against a reference dataset of existing projects.

Instead of simply checking matching keywords, IDEAGUARD analyzes the problem, solution, features, technologies, and target users to identify meaningful similarities and differences.

The platform provides originality scores, AI-generated insights, similarity comparisons, and recommendations to help users improve their ideas and discover new innovation opportunities.

## ✨ Key Features

### 1. AI-Powered Idea Analysis

* Submit project ideas using a structured form.
* Automatically convert rough descriptions into structured project details using Gemini AI.
* Analyze ideas using semantic embeddings.

### 2. Project Similarity Detection

* Identify the six closest existing projects.
* Compare overlapping and unique features.
* Analyze similarities across different project categories.

### 3. Originality Score

* Calculate an originality score based on similarity results.
* Generate an AI-based originality verdict.
* Identify how saturated a particular project domain is.

### 4. Innovation Recommendations

* Discover missing features and opportunities.
* Receive suggestions for improving project uniqueness.
* Explore alternative directions and innovative approaches.
* Generate an improved project pitch.

### 5. Interactive Analytics

* Visualize project similarity using an interactive landscape map.
* Compare projects through feature comparison charts.
* View analysis statistics and originality scores.

### 6. Analysis History

* Save and revisit previous analyses.
* View historical project reports.
* Download generated analysis reports.

### 7. Modern User Interface

* Responsive React-based interface.
* Interactive animations and visual components.
* Modern dashboard and navigation.
* Dark-themed visual experience.

---

## 🛠️ Technology Stack

| Category             | Technology       |
| -------------------- | ---------------- |
| Frontend             | React 19         |
| Programming Language | TypeScript       |
| Build Tool           | Vite             |
| Styling              | Tailwind CSS 4   |
| Backend              | Python           |
| Backend Framework    | FastAPI          |
| AI Model             | Google Gemini    |
| Embeddings           | Gemini Embedding |
| Data Processing      | NumPy            |
| API Communication    | REST API         |
| Deployment           | Render           |
| Version Control      | Git & GitHub     |

---

## 🏗️ System Architecture

IDEAGUARD follows a frontend-backend architecture.

```text
             USER
               |
               v
      REACT FRONTEND
       (TypeScript)
               |
               v
        FASTAPI BACKEND
               |
       +-------+-------+
       |               |
       v               v
  GEMINI AI       PROJECT DATASET
       |               |
       v               v
  AI ANALYSIS     SIMILARITY SEARCH
       |               |
       +-------+-------+
               |
               v
       ANALYSIS REPORT
               |
               v
       RESULTS DASHBOARD
```

### Analysis Workflow

1. User submits a project idea.
2. Gemini generates structured information when required.
3. The backend converts the idea into semantic embeddings.
4. NumPy calculates similarity against the reference project embeddings.
5. The six closest projects are identified.
6. Gemini evaluates overlapping and unique features.
7. The system calculates originality scores.
8. Gemini generates innovation recommendations.
9. The final report is saved and displayed on the dashboard.

---

## 📂 Project Structure

```text
IDEAGUARD/
│
├── ideaguard/
│   │
│   ├── backend/
│   │   ├── main.py
│   │   ├── core.py
│   │   ├── build_dataset.py
│   │   ├── requirements.txt
│   │   ├── run.bat
│   │   │
│   │   ├── data/
│   │   │   ├── projects.json
│   │   │   ├── embeddings.npy
│   │   │   └── reports.json
│   │   │
│   │   └── static/
│   │
│   └── frontend/
│       ├── package.json
│       ├── index.html
│       ├── vite.config.ts
│       │
│       └── src/
│           ├── components/
│           ├── hooks/
│           ├── lib/
│           ├── pages/
│           ├── App.tsx
│           └── main.tsx
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Install the following:

* Python 3.10 or newer
* Node.js and npm
* Git
* Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/SvNikhileswar/IDEAGUARD.git
```

Navigate into the project:

```bash
cd IDEAGUARD/ideaguard
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-2.5-flash
LLM_FALLBACK_MODEL=gemini-2.0-flash
EMBED_MODEL=gemini-embedding-001
```

Get your API key from Google AI Studio:

https://aistudio.google.com/apikey

**Important:** Never upload your `.env` file or expose your API key publicly.

### 4. Frontend Setup

Open another terminal:

```bash
cd ideaguard/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### 5. Start the Backend

In the backend terminal:

```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at:

http://localhost:8000

The frontend development server will be available at:

http://localhost:5173

---

## 🔌 API Endpoints

| Method | Endpoint               | Description                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/`                    | Serves the frontend application                  |
| GET    | `/health`              | Checks backend health                            |
| POST   | `/api/extract`         | Converts rough ideas into structured information |
| POST   | `/api/submit`          | Analyzes a submitted project idea                |
| GET    | `/api/reports`         | Retrieves analysis history                       |
| GET    | `/api/report/{rid}`    | Retrieves an individual report                   |
| GET    | `/api/landscape/{rid}` | Generates project similarity landscape data      |

Interactive API documentation is available at:

`/docs`

---

## 📊 Originality Analysis

IDEAGUARD calculates originality using weighted similarity scores from the three closest matching projects.

The weighting system is:

* Closest match: 50%
* Second closest match: 30%
* Third closest match: 20%

The originality score is calculated as:

```text
Originality Score = 100 - Weighted Similarity
```

The system generates one of four verdicts:

| Similarity Score | Verdict           |
| ---------------- | ----------------- |
| Above 85%        | Duplicate         |
| Above 65%        | Highly Similar    |
| Above 40%        | Partially Similar |
| 40% or below     | Original          |

These scores are algorithmic estimates, not legal determinations of originality or intellectual-property ownership.

---

## ☁️ Deployment

IDEAGUARD is deployed using Render.

**Live Application:**

https://ideaguard-caac.onrender.com

Deployment configuration:

| Setting          | Configuration                                  |
| ---------------- | ---------------------------------------------- |
| Hosting Platform | Render                                         |
| Runtime          | Python                                         |
| Framework        | FastAPI                                        |
| Root Directory   | `ideaguard/backend`                            |
| Build Command    | `pip install -r requirements.txt`              |
| Start Command    | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

The FastAPI backend serves the production React frontend from its static directory.

New changes pushed to the connected GitHub `main` branch trigger automatic deployment.

---

## 🔮 Future Enhancements

* Expand the reference project dataset.
* Introduce user authentication and personalized workspaces.
* Add advanced project recommendation algorithms.
* Improve similarity detection accuracy.
* Introduce collaborative project evaluation.
* Add more detailed analytics and visualizations.
* Integrate persistent cloud database storage.
* Improve report export and sharing capabilities.

---

## 🎯 Project Objective

The primary objective of IDEAGUARD is to encourage innovation by helping individuals understand the existing project landscape, identify opportunities, and improve the originality of their ideas.

It aims to make project evaluation smarter, more accessible, and more informative through Artificial Intelligence.

---

## 👨‍💻 Developer

**Sv Nikhileswar**

GitHub: https://github.com/SvNikhileswar

Project: IDEAGUARD

---

<p align="center">
  <b>IDEAGUARD — Think Different. Build Original. Innovate Smarter.</b>
</p>
