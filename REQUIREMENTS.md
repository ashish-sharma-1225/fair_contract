# ClauseLens --- Requirements

## 1. Project summary

**Product:** ClauseLens --- Contract Risk Flagger\
**Problem statement:** QUANTIX 2K26 PS02\
**Purpose:** Help freelancers and small vendors identify contract
clauses that may conflict with verified regulatory rules and optional
user-defined policies.

ClauseLens is an informational review aid. It does not replace legal
advice or guarantee that a contract is legally safe.

## 2. Required technology stack

  -----------------------------------------------------------------------
  Component               Selected technology     Use
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript      Navigation, forms,
                                                  dashboard, results

  3D interactive elements Spline                  Decorative
                                                  landing/processing
                                                  visuals

  Backend                 Python + FastAPI        APIs, validation,
                                                  authorization,
                                                  orchestration

  Database                PostgreSQL              Structured application
                                                  data

  AI                      Google Gemini API       Clause identification
                                                  and contextual
                                                  interpretation

  PDF extraction          PyMuPDF                 Extract text and
                                                  page-aware source
                                                  segments

  Integrity               SHA-256                 File integrity
                                                  verification

  Database access         SQLAlchemy              ORM and database
                          (recommended)           queries

  Migrations              Alembic (recommended)   Versioned schema
                                                  changes

  Frontend routing        React Router            Page navigation
                          (recommended)           

  Frontend API calls      Fetch or Axios          Call FastAPI endpoints

  File storage            Private local storage   Store original PDFs
                          during development;     
                          private object storage  
                          for deployment          

  Configuration           Environment variables / Runtime configuration
                          managed secrets         and credentials

  Version control         Git + GitHub            Team collaboration
  -----------------------------------------------------------------------

Do not expose the Gemini API key or database credentials in React,
Spline, or any public frontend bundle.

## 3. Functional requirements

### FR-01: Contract upload

-   The user can upload a PDF contract.
-   The backend validates file type/signature, file size, and processing
    limits.
-   The backend generates a safe storage key and stores the file
    privately.
-   The backend calculates and stores the SHA-256 hash.
-   Unsupported, malformed, oversized, or unreadable files produce a
    clear error.

### FR-02: Text extraction

-   Extract text using PyMuPDF.
-   Preserve page boundaries or page-level source segments.
-   If the document is scanned and has no extractable text, explain that
    OCR is not yet supported or route it to a separately implemented OCR
    process.
-   Do not invent missing text or page numbers.

### FR-03: User-defined policies

-   Users can create, edit, disable, and select optional policies.
-   Example categories: payment terms, automatic renewal, liability,
    jurisdiction.
-   A policy may contain natural-language text and optional structured
    values.
-   Validate policy input and enforce ownership.

### FR-04: Regulatory rule library

-   Provide a small, curated library of verified rules for the supported
    jurisdiction(s).
-   Store source title, official URL, jurisdiction, effective date,
    applicability notes, version, and last-verified date.
-   Distinguish binding legal requirements from guidance and personal
    preferences.
-   Do not claim comprehensive legal coverage.
-   Make it clear when a rule's applicability needs human review.

### FR-05: AI-assisted clause identification

-   Send the minimum necessary extracted text and selected policy/rule
    context to Gemini.
-   Ask for structured output such as category, relevant clause
    quotation, possible conflict, explanation, and uncertainty.
-   Treat contract text as untrusted content and do not allow it to
    override system instructions or trigger privileged tools.
-   Handle timeouts, rate limits, invalid output, and provider
    unavailability.

### FR-06: Evidence validation

-   Validate model output against a defined schema.
-   Verify every quotation against extracted source text.
-   Derive page locations from trusted PDF extraction data, not from the
    model alone.
-   Reject or clearly mark findings with unverified evidence.
-   Preserve the distinction between an observed contract clause and an
    AI-generated interpretation.

### FR-07: Analysis results

-   Display findings grouped by category.
-   Each finding includes the source quotation, page/location when
    available, relevant policy/rule, explanation, and review status.
-   Show uncertainty and recommend human review for ambiguous clauses.
-   If no conflict is found, say that the configured checks did not
    detect one; do not claim the contract is safe.

### FR-08: History and review

-   Save contract metadata, analysis status, findings, and timestamps.
-   Users can reopen prior analyses.
-   Users can mark findings as reviewed.
-   Every request must enforce resource ownership.

### FR-09: Deletion and retention

-   Provide a defined contract deletion workflow.
-   Delete or schedule deletion of the file, extracted text, findings,
    and related data according to the retention policy.
-   Document how backups and caches are handled.
-   Avoid indefinite storage without a clear reason.

## 4. Core database entities

-   `contracts`
-   `policies`
-   `regulatory_sources`
-   `regulatory_rules`
-   `analyses`
-   `findings`
-   `reviews` (optional)
-   User identity/account data should be managed by the selected
    authentication provider or an appropriately secured auth system.

Store original PDF files in private file/object storage. Store file
metadata and the SHA-256 hash in PostgreSQL. Do not store passwords in
plaintext.

## 5. Minimum security requirements

-   HTTPS in production.
-   Authentication for private user data.
-   Server-side authorization and ownership checks for each contract,
    policy, analysis, and finding.
-   Safe PDF upload validation and resource limits.
-   Private storage and appropriate encryption at rest.
-   SHA-256 integrity verification, understood as integrity checking
    rather than encryption.
-   Secrets kept on the backend and out of Git/frontend builds.
-   Parameterized SQL queries or a reputable ORM.
-   Least-privilege database account and restricted network access.
-   Rate limiting for authentication and expensive API endpoints.
-   Secure session/cookie configuration if cookie-based authentication
    is used.
-   CORS restricted to known frontend origins.
-   Safe error messages; no stack traces or secrets exposed to users.
-   No confidential document text, passwords, session tokens, or API
    keys in logs.
-   Prompt-injection resistance and strict AI output validation.
-   Source quotation validation.
-   Backup, restore, retention, and deletion procedures.
-   Dependency auditing and security testing.

## 6. Non-functional requirements

### Reliability

-   Show progress and actionable errors.
-   Avoid duplicate analyses caused by repeated submissions.
-   Handle AI provider rate limits and failures gracefully.
-   Save completed results consistently.

### Performance

-   Enforce configurable file/page limits.
-   Use request timeouts and bounded retries.
-   Avoid unnecessarily sending the same full document repeatedly.
-   Cache only when document hash, policy/rule versions, and analysis
    configuration match and privacy requirements permit it.

### Privacy

-   Explain that selected contract content may be sent to a third-party
    AI provider.
-   Minimize the content sent.
-   Use fictional contracts during development and demonstrations.
-   Review provider data-handling terms before using confidential
    documents.

### Accessibility and usability

-   Responsive layout.
-   Keyboard-operable controls and meaningful labels.
-   Risk levels include text labels, not color alone.
-   3D elements must not obstruct core tasks and should have a fallback.

### Maintainability

-   Keep route handlers, business logic, AI provider code, PDF
    extraction, and storage services separate.
-   Use environment-based configuration.
-   Use database migrations.
-   Maintain a README with setup and run commands.

## 7. Suggested API endpoints

-   `GET /api/health`
-   `POST /api/contracts`
-   `GET /api/contracts`
-   `GET /api/contracts/{contract_id}`
-   `DELETE /api/contracts/{contract_id}`
-   `POST /api/contracts/{contract_id}/analyze`
-   `GET /api/analyses/{analysis_id}`
-   `GET /api/policies`
-   `POST /api/policies`
-   `PATCH /api/policies/{policy_id}`
-   `GET /api/regulatory-rules`
-   `PATCH /api/findings/{finding_id}/review`

Authentication may be delegated to a trusted identity provider. All
private endpoints must check authentication and ownership server-side.

## 8. Minimum acceptance criteria

The MVP is ready for demonstration when: 1. A supported, fictional PDF
can be uploaded. 2. Extracted text and page information are available.
3. At least one user-defined policy can be selected. 4. A Gemini
response is parsed into a structured result. 5. A flagged quotation is
verified against the source text. 6. The result shows the policy,
explanation, and source location when available. 7. Contract metadata
and findings are saved in PostgreSQL. 8. An unauthorized user cannot
access another user's record. 9. Invalid files and AI provider failures
produce safe, clear errors. 10. The application does not claim that an
unflagged contract is legally safe.

## 9. Out of scope for the first MVP

-   Training a custom language model.
-   Guaranteed legal advice or definitive legal validity decisions.
-   Complete coverage of every jurisdiction and regulation.
-   OCR for every scanned document unless specifically implemented.
-   Automatic contract negotiation or editing.
-   Autonomous legal actions.
-   Complex enterprise role management.
-   Guaranteed detection of every risky clause.
