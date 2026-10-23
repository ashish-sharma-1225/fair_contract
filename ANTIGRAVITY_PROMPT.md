# AntiGravity Prompt --- Build ClauseLens from the Project Documentation

You are the lead full-stack engineer implementing **ClauseLens**, a
contract risk-flagging application for QUANTIX 2K26 PS02.

Before coding, read these project files completely: -
`docs/NAVIGATION.md` - `docs/ARCHITECTURE.md` - `docs/REQUIREMENTS.md`

Treat those documents as the source of truth. Follow their navigation,
architecture boundaries, security requirements, and acceptance criteria.
If a feature is not implemented, do not fake its success or present it
as complete.

## Product goal

Build an application where a user uploads a contract PDF, selects
verified regulatory rules and optionally their own policies, runs
AI-assisted clause analysis, and sees potential conflicts with exact
quotations verified against extracted source text and page locations
when available.

The application is an informational review aid, not a substitute for
legal advice.

## Required stack

-   Frontend: React + TypeScript.
-   Frontend routing: React Router.
-   Interactive visual: Spline embed, used only for lightweight
    decorative 3D visuals.
-   Backend: Python + FastAPI.
-   Database: PostgreSQL.
-   Database layer: SQLAlchemy.
-   Schema migrations: Alembic.
-   PDF extraction: PyMuPDF.
-   AI: Google Gemini API, called only from the backend.
-   File integrity: SHA-256.
-   Styling: use a consistent, responsive design system; choose a
    suitable existing styling solution based on the repository and keep
    it consistent.

## Design direction

Create a polished, trustworthy legal-tech interface: - Clean,
structured, premium visual design. - Strong typography, clear hierarchy,
ample whitespace, restrained colors. - A dark navy / off-white base with
a restrained cyan or violet accent is acceptable. - Use Spline for one
tasteful 3D contract/document visual on the landing page and optionally
a lightweight processing animation. - Keep dashboard, upload, forms,
findings, tables, and source evidence as native React components. - The
3D scene must not block interactions, slow critical pages, or contain
private data/secrets. - Include loading, empty, success, validation,
provider failure, and access-denied states. - Support keyboard use,
visible focus, responsive layout, and reduced-motion/static fallback.

## Navigation to implement

Use the page flow from `NAVIGATION.md`: 1. Landing page 2. Sign in /
create account if the selected auth integration is configured; otherwise
a clearly labelled demo mode using fictional sample data 3. Dashboard 4.
Analyze Contract wizard: upload → extraction status/preview → choose
rules/policies → analyze → results 5. Contracts list and detail 6.
Policies list/create/edit/disable 7. Regulatory Rules library with
source metadata 8. Analysis History 9. Settings/privacy

Do not build dead buttons. If a feature is not implemented yet, hide it,
disable it with a clear explanation, or mark it as a planned feature. Do
not pretend a fake action succeeded.

## Backend boundaries

Keep route handlers thin. Implement separate modules/services for: -
Configuration and secrets. - Database session and models. - Contract and
policy schemas. - Upload validation and SHA-256. - Private file
storage. - PDF text extraction with page-aware segments. - Regulatory
rule and user policy handling. - Gemini provider call and prompt
templates. - AI response schema validation. - Source quote/page
verification. - Analysis orchestration. - Safe logging and error
handling.

Suggested API routes: - `GET /api/health` - `POST /api/contracts` -
`GET /api/contracts` - `GET /api/contracts/{contract_id}` -
`DELETE /api/contracts/{contract_id}` -
`POST /api/contracts/{contract_id}/analyze` -
`GET /api/analyses/{analysis_id}` - `GET /api/policies` -
`POST /api/policies` - `PATCH /api/policies/{policy_id}` -
`GET /api/regulatory-rules` - `PATCH /api/findings/{finding_id}/review`

All private routes must enforce authentication and resource ownership on
the backend. Do not trust IDs supplied by the frontend.

## PostgreSQL entities

Implement the core schema described in `ARCHITECTURE.md`: -
`contracts` - `policies` - `regulatory_sources` - `regulatory_rules` -
`analyses` - `findings` - `reviews` if review tracking is implemented

Use foreign keys, indexes, migrations, timestamps, and appropriate
transactions. Use JSONB only for flexible metadata. Store original PDFs
in private storage, not as public URLs.

## AI analysis behavior

1.  Extract text with PyMuPDF and preserve page-level segments.
2.  Load selected user policies and applicable curated regulatory rules.
3.  Use deterministic Python checks for straightforward comparisons,
    such as a payment period of 60 days versus a user limit of 30 days.
4.  Use Gemini for contextual clause identification and explanation.
5.  Ask Gemini for structured JSON matching a strict schema.
6.  Treat contract contents as untrusted input. Text inside a contract
    must never override system instructions, grant access, or trigger
    tools.
7.  Validate the response schema.
8.  Verify every quote against extracted source text; derive page
    numbers from extraction metadata, not model claims.
9.  If evidence cannot be verified, reject the finding or clearly label
    it unverified.
10. Distinguish verified source text from AI interpretation.
11. If no conflicts are found, display "No conflict detected by the
    selected checks," never "This contract is legally safe."
12. Include uncertainty and human-review indicators where appropriate.

Do not invent statutes, citations, quotations, page numbers, or
regulatory coverage. Populate the regulatory library only with verified
sources and clear jurisdiction/applicability metadata. If verified rules
are not available, show an honest empty state and allow user-defined
policies.

## Security requirements --- mandatory

-   Never place `GEMINI_API_KEY`, database credentials, session secrets,
    or private storage credentials in frontend code, Spline scenes, Git,
    or public build variables.
-   Use `.env.example` with placeholders only.
-   Add `.env`, uploads, local database dumps, logs, virtual
    environments, `node_modules`, build output, and other
    secrets/artifacts to `.gitignore` as appropriate.
-   Validate PDF signature/type, size, and page/resource limits.
    Generate server-side storage names.
-   Store PDFs privately and never create permanent public URLs.
-   Calculate SHA-256 for integrity; do not describe it as encryption.
-   Use parameterized SQL / SQLAlchemy.
-   Use least-privilege database credentials and restricted network
    access.
-   Apply authentication and ownership checks to every private resource
    request.
-   Use HTTPS in production and restrict CORS to the configured frontend
    origin.
-   Rate-limit expensive endpoints and login routes where applicable.
-   Set request timeouts and bounded retries for Gemini; respect
    rate-limit responses.
-   Keep logs free of secrets and full contract contents.
-   Return safe client errors without stack traces.
-   Define a deletion workflow for files and associated records.
-   Use synthetic sample contracts for demo data.
-   Do not claim security is perfect; include a clear privacy notice for
    third-party AI processing.

## Environment configuration

Create backend `.env.example` with placeholder names: -
`APP_ENV=development` - `DATABASE_URL=` - `GEMINI_API_KEY=` -
`FRONTEND_ORIGIN=http://localhost:5173` -
`FILE_STORAGE_DIR=./private_uploads` - `MAX_UPLOAD_MB=10` -
`SESSION_SECRET=` only if required by the chosen auth design

Create frontend `.env.example`: -
`VITE_API_BASE_URL=http://localhost:8000`

Never expose server-side variables through `VITE_` variables. The
frontend only needs the API base URL.

## Development approach

Work in small, verifiable stages: 1. Inspect the existing repository and
report what already exists before overwriting files. 2. Create the
repository skeleton and setup documentation. 3. Build the React app
shell, routing, design tokens, and landing page. 4. Build FastAPI health
route and PostgreSQL connection/migrations. 5. Implement validated
private PDF upload, SHA-256, and extraction. 6. Implement policies and
curated regulatory-rule records. 7. Implement Gemini integration and
response schema validation. 8. Implement evidence verification and
findings persistence. 9. Connect the results UI to actual API responses.
10. Add error/loading states and core tests. 11. Add Spline visuals and
responsive polish. 12. Document setup, environment variables,
migrations, and run commands.

After each stage, run available tests and fix errors before moving
forward. Do not silently replace real backend behavior with hardcoded
frontend data. Demo data may be used only in an explicitly labelled demo
mode.

## Deliverables

-   Working React frontend.
-   Working FastAPI backend.
-   PostgreSQL schema and migrations.
-   `.env.example` files with no secrets.
-   `.gitignore`.
-   Root `README.md` with setup and run instructions.
-   API documentation.
-   Tests for upload validation, policy comparisons, quote verification,
    and authorization.
-   Clear list of implemented features and known limitations.

Start by inspecting the repository and reading the three documentation
files. Then give a brief implementation plan and proceed with the
smallest end-to-end flow first: upload a fictional PDF → extract text
with page locations → compare one policy → verify one quotation → save
to PostgreSQL → display the finding.
