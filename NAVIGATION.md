# ClauseLens --- Frontend Navigation & User Flow

## 1. Purpose

ClauseLens helps freelancers and small vendors identify contract clauses
that may conflict with: - Applicable, verified regulatory rules
configured for the supported jurisdiction. - Optional user-defined
business policies.

Every finding should include the original clause quotation and a source
location whenever the document extraction supports it. ClauseLens is an
assistance tool, not a substitute for legal advice.

## 2. Primary navigation

Use a consistent application shell after login: - **Dashboard** -
**Analyze Contract** - **Contracts** - **Policies** - **Regulatory
Rules** - **Analysis History** - **Settings** - **Help & About**

The public pages are: - Landing page - Sign in - Sign up - Forgot
password / account recovery

If authentication is not implemented in the first demo, provide a
clearly labelled demo mode with fictional sample data. Do not imply that
demo mode provides real user isolation.

## 3. Navigation map

``` text
Landing
├── Sign in ────────────────┐
├── Create account           │
└── Try demo (sample data)   │
                             ▼
                         Dashboard
                         ├── Analyze Contract
                         │   ├── Upload PDF / choose sample
                         │   ├── Confirm extraction
                         │   ├── Select regulatory rules
                         │   ├── Select optional user policies
                         │   ├── Run analysis
                         │   └── Analysis Results
                         │       ├── Overview
                         │       ├── Findings by category
                         │       ├── Evidence / source page
                         │       ├── Mark reviewed
                         │       └── Export report (optional)
                         ├── Contracts
                         │   └── Contract Details
                         │       ├── Metadata and integrity status
                         │       ├── Past analyses
                         │       └── Delete contract
                         ├── Policies
                         │   ├── View policy list
                         │   ├── Create / edit / disable policy
                         │   └── Policy examples
                         ├── Regulatory Rules
                         │   ├── Browse by jurisdiction/category
                         │   ├── View source and effective date
                         │   └── Enable / disable applicable rules
                         ├── Analysis History
                         │   └── Open previous result
                         └── Settings
                             ├── Profile / account
                             ├── Privacy and retention
                             └── Sign out
```

## 4. Screen-by-screen requirements

### 4.1 Landing page

Purpose: explain the product and give the user a clear next step.

Sections: 1. Hero heading: "Review contract terms against your rules."
2. Short explanation of evidence-based clause flagging. 3. Three-step
flow: Upload → Compare → Review evidence. 4. Feature highlights: policy
comparison, source quotations, review history. 5. Primary CTA: "Analyze
a contract." 6. Secondary CTA: "View demo." 7. Disclaimer: findings are
informational and should be reviewed by a qualified professional when
needed.

Spline 3D: - Use one lightweight interactive contract/document scene in
the hero. - Do not place sensitive content, API keys, or private data
inside the Spline scene. - Provide a static fallback if the scene fails
or is slow.

### 4.2 Authentication

Pages: - Sign in - Create account - Account recovery (if supported)

Requirements: - Use a trusted authentication provider or a
well-established backend auth implementation. - Never store plaintext
passwords. - Do not expose session tokens or API keys in frontend
code. - Protect private API routes on the backend.

### 4.3 Dashboard

Show: - "Analyze new contract" primary action. - Recent contracts. -
Recent analyses and their status. - Counts derived from real stored
records, not hardcoded demo values. - Clear empty state for new users.

### 4.4 Analyze Contract wizard

**Step 1 --- Upload** - Accept PDF files only for the MVP. - Display
file name and size. - Enforce upload-size limits. - Explain that only
documents the user is authorized to process should be uploaded. -
Provide a fictional sample contract for demo use.

**Step 2 --- Extract and confirm** - Show extraction status and page
count. - Show a small preview of extracted text. - If text extraction
fails or the PDF appears scanned, show a clear unsupported-document
message. OCR may be added later. - Do not begin analysis if extraction
fails.

**Step 3 --- Choose rules** - Regulatory rules: show jurisdiction,
source, effective date, and rule description. - User policies: optional.
Users can select existing policies or add a policy. - Make clear that
regulatory rules and personal preferences are different kinds of
checks. - Never claim the rule library covers all laws.

**Step 4 --- Analyze** - Show progress and a safe failure state. -
Prevent duplicate submissions caused by repeated clicks. - The backend
orchestrates AI analysis and deterministic checks. - Never call Gemini
directly from the browser.

**Step 5 --- Results** - Summary of analysis status. - Findings grouped
by payment, renewal, liability, jurisdiction, and other/uncategorized. -
Each finding includes: - Finding type/category. - Severity or review
status with explanation. - Exact source quotation verified against
extracted text. - Page number or source location when available. -
Relevant policy/rule and source. - Explanation of the possible
conflict. - "Needs human review" indicator when uncertain. - Show "No
conflict detected by configured checks" rather than "legally safe" when
no findings are found. - Allow the user to mark a finding reviewed. - Do
not fabricate quotations, page numbers, laws, or sources.

### 4.5 Contracts

List: - File name - Upload date - Processing status - Latest analysis
date - Integrity verification status where implemented

Contract detail: - Metadata and file hash. - Analysis history. - Re-run
analysis with a selected policy/rule set. - Delete action with
confirmation.

Deleting a contract should trigger the defined deletion workflow for the
PDF, extracted text, associated analyses/findings, and caches, subject
to the stated retention policy.

### 4.6 Policies

Allow users to: - Create a policy with a name, category,
natural-language rule, and optional structured values. - Edit or disable
a policy. - View which analyses used a particular policy.

Examples: - Payment period must not exceed 30 days. - Automatic renewal
requires explicit approval. - Liability cap should not exceed the
contract value. - Disputes should use a preferred jurisdiction.

These are user preferences, not automatically valid legal rules.

### 4.7 Regulatory Rules

Each rule should include: - Title and category. - Jurisdiction. - Source
organization and official source URL. - Effective date and last-verified
date. - Applicability notes. - Rule version/status.

Only add verified, relevant rules. Distinguish binding requirements from
official guidance. If the applicability is uncertain, label the rule as
requiring review.

### 4.8 Analysis History

Allow users to filter by contract, date, status, or finding category and
open a previous analysis. Enforce ownership on every request.

### 4.9 Settings and privacy

Include: - Account/profile settings if authentication exists. - Data
retention explanation. - Delete contract / delete account actions if
supported. - Third-party AI processing disclosure. - Sign out.

## 5. Important UI states

Every data-driven screen should handle: - Loading - Empty state -
Success - Validation error - Network/API error - Rate limit / provider
unavailable - Partial analysis - Unsupported or unreadable PDF - Session
expired / access denied

Do not show fabricated success states when backend requests fail.

## 6. Responsive and accessible UI

-   Desktop-first dashboard, but support tablet and mobile widths.
-   Use accessible labels and keyboard-operable controls.
-   Maintain adequate contrast.
-   Do not communicate risk only through color; include text labels.
-   Respect reduced-motion preferences and provide a fallback for 3D
    animation.
-   Keep Spline decorative and lightweight; all important actions and
    data must remain native React UI.

## 7. Recommended MVP navigation scope

Build first: 1. Landing / demo entry 2. Dashboard 3. Upload PDF 4.
Choose user policies 5. Analyze 6. Results with source quotations and
locations 7. Contracts/history 8. Basic privacy and error states

Add authentication, regulatory rule management, report export, and
advanced settings according to time and actual implementation capacity.
Never present an unimplemented feature as working.
