# NxT Project 🚀
**Bridging the gap between intention and action through verifiable commitments and AI-powered proof of action.**


## 📖 Project Overview
NxT is a gamified productivity and accountability application. It uses a "Commit, Prove, Resolve" cycle to help users actually achieve their goals. Users stake virtual points on their goals, execute them, and submit proof. The platform uses AI to validate these proofs, creating a trustless accountability system.

## ⚙️ Core Mechanism: The "Commit, Prove, Resolve" Cycle
1. **Commit:** Users define a goal and stake "Virtual Points".
2. **Prove:** Users submit evidence of completion (e.g., photo, location, screen time).
3. **Resolve:** An AI microservice validates the proof. If valid, the user gets their points back plus a reward. If invalid, they lose the staked points.

## 🛠 Technology Stack
We are using a Monorepo approach orchestrated by Docker Compose.

* **Frontend (PWA):** 
  * Next.js (App Router, TypeScript)
  * Styling: Tailwind CSS, shadcn/ui
  * State Management: Zustand
  * Data Fetching: React Query (@tanstack/react-query), Axios
  * Forms: react-hook-form, Zod
  * PWA: @ducanh2912/next-pwa
* **Backend (Core Logic):** 
  * Django & Django REST Framework (DRF)
  * Real-time (WebSockets): Django Channels
  * DB: PostgreSQL (Core Data), Redis (Cache & Task Queue)
* **AI Microservice:** 
  * FastAPI (Python)
  * Image/Data Processing: Pillow, OpenCV (headless), pytesseract (OCR)
* **DevOps:** Docker & Docker Compose for the local development environment.

## 📂 Monorepo Structure
```text
nxt-project/
├── nxt-frontend/       # Next.js PWA application
├── backend/            # Django Core application
│   ├── conf/           # Django settings
│   └── apps/           # Django apps (users, goals, social, etc.)
├── nxt_ai_service/     # FastAPI microservice for AI validation
│   ├── main.py         
│   └── requirements.txt
└── docker-compose.yml  # Local dev orchestration

## 🗺 Roadmap & Phased Development

### Phase 1: Core MVP & AI Validation (Current Focus)
* Individual goal creation.
* Virtual Points staking (internal economy, no real crypto yet).
* Basic AI proof validation (Image recognition, OCR, Location).
* Progressive Web App (PWA) setup.

### Phase 2: Social Accountability
* **Squad Goals:** Group challenges with "all-or-nothing" mechanics.
* **Experience Feed:** A social feed showing users' verified actions.
* **Reputation Score:** A dynamic score based on completion rate.

### Phase 3: Gamification & Integrations
* **Angel Backers:** Users can bet on or support others' goals using virtual points.
* **Dynamic Avatars:** Visual representation of user progress.
* **Health API Integrations:** Sync with Apple Health, Google Fit, Strava.

### Phase 4: Web3 Transition (Future)
* Real cryptocurrency staking via Smart Contracts.
* Premium features ("NxT Pro").
* Tokenomics and DAO governance.

## 🤖 Instructions for AI Assistant (Trae)
When generating code or providing solutions for this project, please adhere to the following:
1. **Context Awareness:** Always remember the separation of concerns: Next.js handles UI/UX, Django handles business logic and DB, FastAPI handles AI processing ONLY.
2. **Styling:** Strictly use Tailwind CSS and shadcn/ui conventions for the frontend.
3. **API Communication:** Assume frontend communicates with Django, and Django communicates with FastAPI internally (or frontend directly to FastAPI for heavy uploads, depending on future architecture).
4. **Environment:** Assume a Dockerized local environment.
```

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- AI service: http://localhost:8001
- AI service health: http://localhost:8001/health

## Service URLs inside Docker

- Backend can call AI service with `http://ai-service:8000`
- Frontend browser calls backend with `NEXT_PUBLIC_API_URL`
- Frontend browser calls AI service with `NEXT_PUBLIC_AI_SERVICE_URL`
