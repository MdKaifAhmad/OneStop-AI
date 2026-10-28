# OneStop — MERN + FastAPI + LangChain + LangGraph + RAG Architecture

A unified academic and career platform engineered to eliminate information asymmetry for college students and aspirants. Re-architected from Spring Boot into a modern **Polyglot Microservices Stack (React + Node Express + FastAPI + MongoDB + Docker)**.

---

## 🏛️ System Architecture

```
                          [ Client Browser / SPA ]
                                     │
                    HTTP REST Requests (Bearer JWT / Guest)
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Express Backend Gateway     │ :5000
                     │   (Auth, JWT, History, CORS)  │
                     └───────┬───────────────┬───────┘
                             │               │
                  Internal Network           │ Mongoose Driver
                  HTTP POST (Axios)          │ (Read/Write & TTL)
                             │               │
                             ▼               ▼
        ┌─────────────────────────┐   ┌─────────────────────────┐
        │   FastAPI AI Service    │   │     MongoDB Database    │ :27017
        │   :8000                 │   │  (Users, Cutoffs,       │
        │                         │   │   7-day Expiring Hist)  │
        │  • LangGraph Placement  │   └─────────────────────────┘
        │  • JoSAA Cutoffs RAG    │
        │  • Scholarship Rules    │
        └────────────┬────────────┘
                     │
            HTTPS API Calls
                     │
                     ▼
        ┌─────────────────────────┐
        │     Groq Cloud LLM      │
        │   (Llama 3.3 / Qwen)    │
        └─────────────────────────┘
```

---

## 🌟 Key Features & Technical Highlights

1. **AI Placement Preparation Engine (LangGraph StateGraph)**
   - 3-Node stateful pipeline: Company & Role Analysis ➔ 15 Curated Q&As ➔ Day-by-day Interval Roadmap.
   - Pydantic schema validation preventing malformed LLM outputs.

2. **Smart Scholarship Discovery Finder (28 Strict Verification Rules)**
   - Domicile, Category, Income Ceiling, and Academic Stage matching.
   - Zero hallucination guardrails with deterministic fallbacks to official NSP portals.

3. **JoSAA Cutoff College Predictor (RAG Engine)**
   - Ingests 73MB of historical IIT/NIT/IIIT/GFTI opening & closing ranks.
   - Categorizes feasibility into **Safe**, **Target**, and **Ambitious** tiers.
   - Augmented strategic choice-filling counseling via Groq LLM.

4. **Enterprise Authentication & Security**
   - Stateless JWT Bearer token authentication.
   - Dual-mode support: Seamless guest usage with automatic 7-day TTL history archiving for logged-in users.

5. **Polyglot Microservices & Docker Orchestration**
   - Node.js Express for high-concurrency API Gateway.
   - Python FastAPI for async ASGI AI inference.
   - Docker Compose for 1-command startup.

---

## 🚀 Getting Started & Local Setup

### Option 1: Run with Docker Compose (Recommended)
1. Clone and configure your environment:
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY in .env
   ```
2. Build and run all services:
   ```bash
   docker-compose up --build
   ```
3. Open in browser:
   - Frontend: `http://localhost:3000`
   - Express Backend: `http://localhost:5000`
   - FastAPI Docs: `http://localhost:8000/docs`

---

### Option 2: Run Locally Without Docker

#### 1. Start MongoDB
Ensure MongoDB is running locally on port `27017`.

#### 2. Start FastAPI AI Microservice
```bash
cd ai_service
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 3. Start Express Backend
```bash
cd backend
npm install
npm run dev
```

#### 4. Import JoSAA Cutoff Dataset (Optional / First Run)
```bash
curl -X POST http://localhost:5000/api/college-cutoffs/import/josaa
```

#### 5. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` in your browser.
