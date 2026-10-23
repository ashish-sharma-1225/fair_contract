# ClauseLens --- System Architecture

## 1. System objective

ClauseLens analyzes a contract against: 1. A small, curated set of
verified regulatory rules for supported jurisdictions. 2. Optional
user-defined policies.

It returns possible conflicts with evidence: a source quotation verified
against extracted document text and a page/location reference when
available. The application is informational and does not provide
definitive legal advice.

## 2. Technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript      Application UI,
                          (recommended)           navigation, upload
                                                  flow, policies,
                                                  findings

  Interactive visual      Spline 3D embed         Decorative landing-page
                                                  / loading visuals only

  Backend API             Python + FastAPI        Authentication
                                                  integration,
                                                  validation,
                                                  orchestration,
                                                  authorization

  PDF processing          PyMuPDF                 Text extraction and
                                                  page-level source
                                                  mapping

  AI                      Gemini API              Clause identification
                                                  and contextual
                                                  interpretation

  Deterministic checks    Python                  Numeric/date
                                                  comparisons and
                                                  structured policy
                                                  checks

  Database                PostgreSQL              Users/identity
                                                  references, contracts
                                                  metadata, policies,
                                                  analyses, findings,
                                                  review state

  File storage            Private local storage   Original PDF and
                          for development;        temporary artifacts
                          private object storage  
                          for deployment          

  Integrity               SHA-256                 Detect changes by
                                                  comparing a file hash
                                                  with a trusted stored
                                                  hash

  Deployment              Frontend host + Python  Hosting and operation
                          API host + managed      
                          PostgreSQL/private      
                          object storage          
  -----------------------------------------------------------------------

Spline is not the application framework. Gemini is not the backend. The
browser must never call Gemini with a secret key directly.

## 3. High-level architecture

``` text
┌────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│ React UI + Spline scene                                     │
│ - Upload / policy forms / results / history                 │
│ - No Gemini secret, database credential, or private file key│
└──────────────────────────────┬─────────────────────────────┘
                               │ HTTPS
                               ▼
┌────────────────────────────────────────────────────────────┐
│ FastAPI backend                                             │
│ 1. Authenticate request                                     │
│ 2. Authorize ownership of requested records                 │
│ 3. Validate request and uploaded file                       │
│ 4. Store file privately and calculate SHA-256               │
│ 5. Extract text and page locations with PyMuPDF             │
│ 6. Load applicable rules and optional user policies         │
│ 7. Call Gemini through server-side provider adapter         │
│ 8. Validate structured model response                       │
│ 9. Verify every quotation against source text               │
│ 10. Apply deterministic checks where possible               │
│ 11. Save analysis and findings                              │
│ 12. Return safe, structured response                        │
└───────────────┬────────────────────────────┬───────────────┘
                │                            │
                ▼                            ▼
┌──────────────────────────┐    ┌────────────────────────────┐
│ Private file storage      │    │ PostgreSQL                 │
│ - Original PDFs           │    │ - contracts                │
│ - Temporary artifacts     │    │ - policies                 │
│ - Restricted access       │    │ - regulatory_sources/rules │
│ - Retention/deletion      │    │ - analyses                 │
└──────────────────────────┘    │ - findings                 │
                                │ - reviews (optional)        │
                                └────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│ External AI provider                                        │
│ Gemini API; send only necessary text and policy context     │
│ Key stored server-side; respect provider terms and quotas   │
└────────────────────────────────────────────────────────────┘
```

## 4. Clean repository structure

``` text
clauselens/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   ├── findings/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── contracts/
│   │   │   ├── analysis/
│   │   │   ├── policies/
│   │   │   └── regulatory-rules/
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   └── validation.ts
│   │   ├── types/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging_config.py
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── contracts.py
│   │   │       ├── policies.py
│   │   │       ├── regulatory_rules.py
│   │   │       ├── analyses.py
│   │   │       └── findings.py
│   │   ├── schemas/
│   │   │   ├── contract.py
│   │   │   ├── policy.py
│   │   │   ├── analysis.py
│   │   │   └── finding.py
│   │   ├── models/
│   │   │   ├── contract.py
│   │   │   ├── policy.py
│   │   │   ├── regulatory_rule.py
│   │   │   ├── analysis.py
│   │   │   └── finding.py
│   │   ├── services/
│   │   │   ├── file_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── policy_service.py
│   │   │   ├── analysis_service.py
│   │   │   ├── evidence_service.py
│   │   │   └── storage_service.py
│   │   ├── ai/
│   │   │   ├── gemini_provider.py
│   │   │   ├── prompts.py
│   │   │   └── response_validator.py
│   │   ├── db/
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   └── __init__.py
│   ├── tests/
│   │   ├── test_file_validation.py
│   │   ├── test_authorization.py
│   │   ├── test_evidence_validation.py
│   │   └── test_policy_checks.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   ├── NAVIGATION.md
│   ├── ARCHITECTURE.md
│   └── REQUIREMENTS.md
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```

Do not create every file as an empty placeholder. Create modules as they
are implemented, while preserving these boundaries.

## 5. Backend responsibilities

### API routes

Suggested initial endpoints: - `GET /api/health` --- service health
only; do not expose secrets. - `POST /api/contracts` --- validate and
upload a PDF, store it privately, return metadata. -
`GET /api/contracts` --- list only the current user's contracts. -
`GET /api/contracts/{contract_id}` --- return metadata after ownership
check. - `DELETE /api/contracts/{contract_id}` --- trigger the defined
deletion workflow. - `POST /api/contracts/{contract_id}/analyze` ---
create an analysis using selected rules/policies. -
`GET /api/analyses/{analysis_id}` --- retrieve results after ownership
check. - `GET /api/policies` --- list current user's policies. -
`POST /api/policies` --- create a user policy. -
`PATCH /api/policies/{policy_id}` --- edit/disable a policy after
ownership check. - `GET /api/regulatory-rules` --- list curated rules
and source metadata. - `PATCH /api/findings/{finding_id}/review` ---
mark a finding reviewed after ownership check.

Authentication routes may be provided by an external identity provider
rather than custom-built. Every private route must enforce authorization
on the server.

### Service boundaries

-   `file_service.py`: file type/size validation, safe generated names,
    SHA-256 calculation.
-   `storage_service.py`: private file save/read/delete.
-   `pdf_service.py`: extract text and page-aware segments; handle
    unsupported/scanned PDFs clearly.
-   `policy_service.py`: normalize and validate user policies; apply
    deterministic comparisons where appropriate.
-   `gemini_provider.py`: call Gemini using server-side credentials;
    timeout, retry, rate-limit and error handling.
-   `response_validator.py`: validate response schema and reject
    malformed output.
-   `evidence_service.py`: verify returned quotes against extracted text
    and derive source locations from trusted extraction data.
-   `analysis_service.py`: orchestrate processing and persist results.

## 6. Analysis sequence

1.  Authenticate the user.
2.  Validate authorization for the contract and selected policies.
3.  Validate file metadata and verify integrity if reading an existing
    file.
4.  Extract text and page boundaries.
5.  Load the selected regulatory rules and optional user policies.
6.  Run deterministic checks for rules that can be reliably evaluated.
7.  Ask Gemini to identify relevant clauses and explain possible
    conflicts. Treat contract text as untrusted data, not instructions.
8.  Validate the AI response against a strict schema.
9.  Match each quote to the extracted source. Reject or mark unverified
    any quote that cannot be matched. Determine page number from
    extraction metadata, not from the model's assertion alone.
10. Persist analysis status, findings, model metadata, and policy/rule
    versions.
11. Return findings with evidence and uncertainty indicators.

Do not tell users that an unflagged contract is legally safe. Say that
no conflict was detected by the selected checks.

## 7. PostgreSQL data model

Recommended MVP entities:

### `contracts`

-   `id` UUID or generated primary key
-   `owner_id` from the authentication system
-   `filename_original`
-   `storage_key` (not a public URL)
-   `sha256`
-   `mime_type`
-   `size_bytes`
-   `page_count`
-   `status`
-   `uploaded_at`
-   `deleted_at` if soft deletion is used

### `policies`

-   `id`
-   `owner_id`
-   `name`
-   `category`
-   `rule_text`
-   `rule_config` JSONB for optional structured fields
-   `is_enabled`
-   `created_at`
-   `updated_at`

### `regulatory_sources`

-   `id`
-   `title`
-   `jurisdiction`
-   `publisher`
-   `official_url`
-   `effective_date`
-   `last_verified_at`

### `regulatory_rules`

-   `id`
-   `source_id`
-   `rule_code`
-   `category`
-   `rule_text`
-   `applicability_notes`
-   `version`
-   `status`

### `analyses`

-   `id`
-   `contract_id`
-   `owner_id`
-   `status`
-   `model_provider`
-   `model_name`
-   `policy_snapshot` or version references
-   `summary`
-   `created_at`
-   `completed_at`
-   `error_code` (safe, non-secret code)

### `findings`

-   `id`
-   `analysis_id`
-   `policy_id` nullable
-   `regulatory_rule_id` nullable
-   `category`
-   `severity` or review level
-   `source_quote`
-   `page_number` nullable
-   `source_start` / `source_end` nullable
-   `reason`
-   `evidence_verified`
-   `review_status`
-   `created_at`

### `reviews` (optional)

-   `id`
-   `finding_id`
-   `reviewer_id`
-   `decision`
-   `notes` (avoid unnecessary sensitive details)
-   `reviewed_at`

Use foreign keys, appropriate indexes, migrations, and transactions. Use
JSONB only for genuinely flexible metadata, not as a substitute for all
relational tables. Store PDFs outside PostgreSQL unless there is a
specific reason to use database large-object storage.

## 8. Security architecture

Minimum controls: - HTTPS in production. - Authentication and
server-side ownership checks on every private resource. - No secrets in
frontend code, Spline assets, Git, or logs. - Validate PDF
signature/type, size, and page/resource limits. - Private file storage;
encryption at rest and in transit where supported. - SHA-256 for
integrity verification, not encryption. - Parameterized SQL / ORM and
least-privilege database credentials. - Restricted database network
access and protected backups. - Rate limiting and safe error handling. -
Strict AI response schema and source quote validation. - Treat uploaded
text as untrusted prompt content. - Avoid logging document text,
credentials, API keys, or session tokens. - Retention and deletion
workflow for PDFs, extracted text, analyses, and backups. - Test
authorization by trying to access another user's IDs.

For the hackathon, use synthetic contracts and fictional data. Do not
claim the app is fully secure without testing and review.

## 9. AI provider resilience

-   Store the Gemini key only in the backend environment/secret store.
-   Use request timeouts and bounded retries.
-   Respect provider rate limits and `Retry-After` when supplied.
-   Log safe usage metrics, not contract contents.
-   If adding a second provider, keep a provider adapter and normalize
    output schemas.
-   Do not bypass provider quotas by rotating accounts or keys.
-   If all providers fail, show an honest unavailable state and only run
    deterministic checks that are actually implemented.
-   Check provider data-retention, training, and privacy terms before
    sending any confidential content.

## 10. Environment variables

Backend `.env.example` (names only; no real secrets): -
`APP_ENV=development` - `DATABASE_URL=postgresql+...` -
`GEMINI_API_KEY=` - `FRONTEND_ORIGIN=http://localhost:5173` -
`FILE_STORAGE_DIR=./private_uploads` - `MAX_UPLOAD_MB=10` -
`SESSION_SECRET=` (only if required by the selected auth design)

Frontend `.env.example`: - `VITE_API_BASE_URL=http://localhost:8000`

Do not place `GEMINI_API_KEY`, database credentials, or session secrets
in frontend environment variables. All `VITE_` variables are public in
the built frontend.

## 11. Deployment and operations

-   Frontend: deploy React static assets to a suitable frontend host.
-   Backend: deploy FastAPI to a Python-compatible host.
-   Database: use managed PostgreSQL or a properly secured server.
-   Files: use private persistent storage/object storage; do not rely on
    ephemeral deployment disk for production files.
-   Configure CORS for the exact frontend origin.
-   Apply database migrations during deployment.
-   Keep debug mode disabled in production.
-   Add a health check and basic monitoring.
-   Test file upload, analysis, ownership checks, provider failure, and
    deletion after deployment.

## 12. MVP implementation order

1.  Repository, environment configuration, FastAPI health endpoint,
    React shell.
2.  PostgreSQL connection and migrations.
3.  Private PDF upload, validation, SHA-256, and extraction.
4.  User-defined policies and a small verified regulatory-rule sample.
5.  Gemini analysis with schema validation and evidence verification.
6.  Results UI and analysis history.
7.  Access control, error states, and core security tests.
8.  Spline visual polish and deployment.
