# ClauseLens — Frontend Application

AI-powered contract risk flagging for freelancers and small businesses. ClauseLens extracts clauses from PDF contracts, aligns them with verified statutory rules and user-defined policies, and flags potential conflicts with exact source citations and page locations.

> **Note:** ClauseLens is an informational review assistance tool and not a substitute for professional legal advice.

---

## Technology Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS tokens
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **API Client:** Centralized fetch wrapper prepared for FastAPI integration

---

## Getting Started

### 1. Prerequisites

- Node.js (v20+ recommended, tested on Node v24)
- npm (v10+)

### 2. Installation

Navigate to the `frontend/` directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Default contents:
```env
# The base URL of the upcoming FastAPI backend
VITE_API_BASE_URL=http://localhost:8000
```

*Note: Never place private API keys (such as `GEMINI_API_KEY`) or database credentials in frontend environment variables. All Gemini orchestration occurs on the backend.*

### 4. Running Locally

Start the Vite development server with HMR:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Building for Production

Compile TypeScript and generate the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Application Navigation & Routes

| Route | View | Description |
|---|---|---|
| `/` | Landing Page | Hero, product overview, 3-step explanation, evidence preview, and CTAs |
| `/login` | Sign In | Email & password form with demo workspace quick access |
| `/register` | Create Account | Registration form with client-side validation |
| `/dashboard` | Dashboard | Risk overview, KPI stat cards, risk distribution chart, and recent activity |
| `/contracts` | Contracts Library | Filterable, searchable table of uploaded contracts with SHA-256 hashes |
| `/contracts/new` | Analysis Wizard | 5-step wizard: Upload PDF, text preview, select rules, review, and realistic simulation |
| `/contracts/:contractId` | Contract Details | File metadata, SHA-256 integrity verification, and past scan history |
| `/analyses/:analysisId` | Analysis Results | Evidence-based findings, exact quote citations, page references, and review controls |
| `/policies` | Business Policies | Create, edit, toggle, and delete custom business policies with structured parameters |
| `/regulatory-rules` | Regulatory Rules | Curated statutory rules (UK Late Payment Act, EU Directives, US UCC) with official sources |
| `/history` | Analysis History | Searchable archive of all prior contract scans |
| `/settings` | Settings & Privacy | Backend connection tester, data retention schedule, profile, and demo reset |
| `*` | 404 Not Found | Friendly 404 page with return to dashboard |

---

## Architecture & Code Structure

```text
frontend/
├── public/
│   └── favicon.svg               # Application brand icon
├── src/
│   ├── app/
│   │   ├── App.tsx               # Root component with providers
│   │   ├── router.tsx            # React Router route tree
│   │   └── providers.tsx         # Context providers
│   ├── components/
│   │   ├── layout/               # AppLayout, AppHeader, AppSidebar, PageHeader
│   │   ├── ui/                   # Reusable UI tokens: Button, Input, Card, RiskBadge, StatCard, ConfirmDialog, etc.
│   │   ├── forms/                # FileDropzone (PDF upload + sample loader), PolicyForm
│   │   └── findings/             # FindingCard (evidence callouts), FindingDetailDrawer, FindingsFilter
│   ├── features/
│   │   ├── landing/              # Public marketing landing page
│   │   ├── auth/                 # Sign in & registration flows
│   │   ├── dashboard/            # Overview dashboard with Recharts metrics
│   │   ├── contracts/            # Contracts list, details, and actions
│   │   ├── analysis/             # 5-step wizard & evidence-based results
│   │   ├── policies/             # Custom user business policies
│   │   ├── regulatory-rules/     # Curated statutory rule library
│   │   ├── history/              # Analysis run history
│   │   ├── settings/             # Settings, backend health test, privacy
│   │   └── not-found/            # 404 handler
│   ├── lib/
│   │   ├── api-client.ts         # Centralized API client for FastAPI
│   │   ├── validation.ts         # Zod schemas for forms and file checks
│   │   └── utils.ts              # Formatters, SHA-256 crypto helper, Tailwind merge
│   ├── mocks/
│   │   ├── demo-data.ts          # Realistic sample contracts, rules, and findings
│   │   └── demo-store.ts         # Local interactive state persistence (localStorage)
│   ├── types/
│   │   └── index.ts              # TypeScript domain interfaces
│   ├── index.css                 # Tailwind CSS v4 design system
│   └── main.tsx                  # React entry point
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## FastAPI Backend Integration Guide

When the Python FastAPI backend is started:

1. Ensure the backend runs at `http://localhost:8000` (or update `VITE_API_BASE_URL` in `.env`).
2. Navigate to **Settings & Privacy** in the frontend and click **"Test Backend Connection"** to verify the health check at `GET /api/health`.
3. The centralized API client in [`src/lib/api-client.ts`](src/lib/api-client.ts) is already configured to map directly to the planned FastAPI endpoints:
   - `POST /api/contracts` (Multipart PDF upload)
   - `GET /api/contracts` & `GET /api/contracts/{id}`
   - `POST /api/contracts/{id}/analyze`
   - `GET /api/analyses/{id}`
   - `GET /api/policies` & `POST /api/policies`
   - `GET /api/regulatory-rules`
   - `PATCH /api/findings/{id}/review`
