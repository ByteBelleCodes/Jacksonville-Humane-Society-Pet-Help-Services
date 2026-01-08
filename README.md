```markdown
# 🐾 JHS Pet Help Center System (PHCS)

## Project Overview
The **Pet Help Center System (PHCS)** is a full-stack web application developed for the **Jacksonville Humane Society (JHS)**. It centralizes case management by ingesting data from fragmented external sources (voicemail files and WaitWhile exports), providing a unified interface for staff to manage pet-related cases, track outcomes, and generate reports.

### Key Features
* **Smart Ingestion:** Automated processing of CSV and JSON exports with a preview/edit staging area before data commitment.
* **Case Management:** Full CRUD functionality with "soft-delete" and recovery features to prevent accidental data loss.
* **Role-Based Access Control (RBAC):** Distinct permissions for Staff and Admin users, including secure account management and password resets.
* **Reporting Dashboard:** Real-time KPI summaries, date-range filtering, and per-species/outcome CSV exports for data-driven decision making.
* **Global Search:** Optimized search functionality by contact name or phone number.

---

## 🛠️ Technical Stack
* **Frontend:** React, Vite, Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** SQLite (local dev) / PostgreSQL compatible
* **Authentication:** JWT (JSON Web Tokens)
* **AI Tooling:** GitHub Copilot, Microsoft Copilot

---

## 👥 Team Collaboration & AI Workflow
This project was a collaborative effort by a team of three. We adopted a "shared ownership" model to ensure code quality and consistency.

* **Synchronized Development:** We utilized a **shared Microsoft Copilot Chat thread** to brainstorm architecture, clarify requirements, and refine logic together. This ensured that all team members were aligned on every design choice.
* **AI-Assisted Scaffolding:** GitHub Copilot was utilized to accelerate the generation of React components and Express routes, allowing the team to focus on complex business logic and system integration.
* **Agile Management:** GitHub was used for version control, code reviews, and task delegation to maintain a rapid development pace.

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18+)
* npm

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with `JWT_SECRET`, `PORT`, and `DATABASE_FILE`.
4. `npm run migrate` (to initialize the SQLite DB).
5. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173` in your browser.

---

## 📊 Dashboard Preview


---

## 📣 Connect with the Developer
* **Name:** Beauti Kumari
* **LinkedIn:** [linkedin.com/in/beauti-kumari](https://linkedin.com/in/beauti-kumari)
* **Portfolio:** [github.com/ByteBelleCodes](https://github.com/ByteBelleCodes)


Project Overview
- Full-stack Web Application
- Client: Jacksonville Humane Society (JHS)
- Purpose: A unified Pet Help Center System (PHCS) that ingests case data from two external sources (voicemail files and WaitWhile exports), provides preview/edit before ingest, centralized case CRUD with soft-delete/recover, role-based authentication (staff/admin), search by phone/name, and a reporting dashboard with CSV export for outcomes and species.

Setup Instructions (local dev)
1. Clone repository
   git clone https://github.com/BeautiKumari25/jhs-pet-help-center.git
2. Backend
   cd backend
   cp .env.example .env
   npm install
   npm run migrate   # creates SQLite DB for local dev
   npm run dev       # runs server on http://localhost:4000
3. Frontend
   cd frontend
   npm install
   npm run dev       # runs frontend on http://localhost:5173
4. Default accounts
   - Admin: seeded in migration (email: admin@jhs.local, password: AdminPass123)
   - Create staff via Admin UI or seed data.

Tool Usage Summary
- AI tools used for scaffolding & generation (document your actual usage in prompts.md):
  - GitHub Copilot (VS Code)
  - Microsoft Copilot (VS Code)
- Suggested mapping (record exact prompts and tool used in prompts.md):
  - Frontend: React components, UploadPreview — GitHub Copilot
  - Backend: Express ingestion and cases routes — GitHub Copilot + Microsoft Copilot
  - Documentation & prompt history: copilot

# JHS Pet Help Center System (PHCS)

## Project overview
PHCS centralizes case ingestion, case management, reporting, and admin user controls for Jacksonville Humane Society.  
Core features:
- Ingest voicemail and queue exports (CSV/JSON) with preview/edit before commit.
- Case CRUD with soft-delete and search by contact name / phone.
- Reporting dashboard, CSV exports, and per-species / outcome summaries.
- Role-based auth: Staff and Admin (manage users, reset/disable accounts).

## Setup (local - Windows / PowerShell)
Prereqs:
- Node.js 18+ and npm
- Git
- (Optional) sqlite3 CLI to inspect DB

Backend
```powershell
cd D:\nest4awhile\jhs-pet-help-center\backend
npm install
# configure .env (see below)
npm run dev
```

Frontend
```powershell
cd D:\nest4awhile\jhs-pet-help-center\frontend
npm install
npm run dev
# open the Vite URL printed in console (e.g., http://localhost:5173)
```

Required env variables (.env in backend)
- JWT_SECRET — strong secret for JWT
- PORT — backend port (default 3000)
- DATABASE_FILE — path for sqlite DB (or DATABASE_URL if migrating to Postgres)

Database
- Migrations: d:\nest4awhile\jhs-pet-help-center\backend\src\migrations\init.sql
- To reset locally: stop backend, delete DB file, re-run server to recreate tables.

## Tool usage (quick)
- Uploads: Frontend → Upload/Preview. Select multiple files, preview/edit rows, then Commit.
- Progress: Upload progress bar shows percent during upload.
- Cases: Cases page → Create / Edit / Soft-delete / Recover. Use search box for phone/name queries.
- Reports: Reports page → Summary KPIs, date-range filter, Top Requests chart, Outcomes/Species exports (CSV).
- Admin: Admin → Manage users (create, activate/deactivate, reset password). Admin UI is shown only for admin users.

## Team collaboration
Our team of three collaborated continuously throughout the development of this project. From the very beginning, we worked together to break down the Problem 1 specification, identify all required features, and delegate tasks based on availability and strengths. We maintained shared ownership of the entire codebase rather than isolating work into silos.

A key part of our collaboration was using Microsoft Copilot Chat, where all three of us worked together in a shared chat thread. Each member asked questions, explored solutions, clarified requirements, and refined ideas collaboratively through the shared AI conversation. This allowed us to stay synchronized, build on one another’s questions, and reach solutions faster. The shared chat space ensured transparency—everyone could see the reasoning, suggestions, and iterations that led to each implementation.

We also used GitHub to manage our repository, commit changes, review each other’s code, and coordinate merges. While Microsoft Copilot and GitHub Copilot Pro accelerated certain tasks—such as generating boilerplate code, validating logic, or clarifying spec details—all major decisions, system design choices, debugging, and final implementations were performed collaboratively by the team. This mix of cooperative teamwork, shared AI assistance, and peer review allowed us to deliver a complete, thoroughly tested, and unified solution.


Repo layout:
  - frontend/: React + Vite
  - backend/: Node/Express + SQLite
  - backend/src/migrations/: DB schema
  - frontend/src/components/: UI components (Dashboard, Reports, UploadPreview)
  - frontend/src/styles.css: global theme
- Branching:
  - main — stable, deployable
  - develop — integration
  - feature/* — new features; create PR to develop
- Pull requests:
  - Provide short description, screenshots, and checklist (lint/tests).
  - Assign reviewer(s); require at least one approval.
- Code style & linting:
  - Follow existing ESLint/Prettier config (add if missing).
- Secrets & CI:
  - Do not commit .env or secrets. Use GitHub Secrets in CI.
  - Add CI to run lint, unit tests, and a build step before merging.
- Testing:
  - Add unit tests for ingest parsing, reports, and auth flows.
  - Manual QA checklist (upload preview, commit, search, soft-delete/recover, reports export).
- Deployment notes:
  - For production, migrate off SQLite to Postgres, set HTTPS, rotate JWT_SECRET, and add rate limiting & logging.

---

## 📣 Connect with the Developer
* **Name:** Beauti Kumari
* **LinkedIn:** [linkedin.com/in/beauti-kumari](https://linkedin.com/in/beauti-kumari)
* **Portfolio:** [github.com/ByteBelleCodes](https://github.com/ByteBelleCodes)
