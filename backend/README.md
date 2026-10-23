# ClauseLens Backend & PostgreSQL Infrastructure

Enterprise backend infrastructure and PostgreSQL database for ClauseLens AI Contract Analysis application.

## Technology Stack

- **Python**: 3.13+
- **FastAPI**: Modern, high-performance web framework
- **PostgreSQL**: Version 18.3 relational storage
- **SQLAlchemy 2.0**: Relational ORM and connection pooling
- **Pydantic v2**: Request & response data validation
- **Alembic**: Database migrations
- **PyPDF / PDFPlumber**: Document parsing and text extraction

---

## Directory Structure

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py         # Environment configuration (Pydantic Settings)
│   │   └── dependencies.py   # User auth & isolation dependencies
│   ├── database.py           # PostgreSQL engine, sessionmaker, and get_db
│   ├── init_db.py            # Table initialization and reference data seeder
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py           # User entity
│   │   ├── contract.py       # Contract metadata & storage key
│   │   ├── policy.py         # Custom organization policies
│   │   ├── regulatory.py     # Regulatory sources and rules
│   │   └── analysis.py       # Analysis runs and Findings
│   ├── schemas/              # Pydantic schemas
│   │   ├── common.py         # Health, RiskSummary, SuccessResponse
│   │   ├── contract.py       # Contract upload & response schemas
│   │   ├── policy.py         # Policy create, update, response schemas
│   │   ├── regulatory.py     # Regulatory source and rule schemas
│   │   └── analysis.py       # Analysis and Finding review schemas
│   ├── routes/               # FastAPI route controllers
│   │   ├── health.py         # GET /api/health
│   │   ├── contracts.py      # Contract upload, listing, details, analysis
│   │   ├── policies.py       # Policy CRUD (GET, POST, PUT, PATCH, DELETE)
│   │   ├── history.py        # History listing, analysis details, finding review
│   │   └── regulatory.py     # Regulatory rules listing
│   ├── services/             # Business logic layer
│   │   ├── file_service.py   # PDF validation, hash, extraction, storage
│   │   ├── contract_service.py
│   │   ├── policy_service.py
│   │   └── analysis_service.py
│   └── main.py               # Application entrypoint & CORS middleware
├── alembic/                  # Alembic migration scripts
├── alembic.ini               # Alembic configuration
├── test_backend.py           # End-to-end integration and isolation test suite
├── .env.example              # Safe environment variable template
├── .env                      # Local configuration (never committed)
├── requirements.txt          # Python dependencies
└── README.md                 # This documentation
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.10+
- PostgreSQL server (listening on port 5432)

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your PostgreSQL database connection:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` matches your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/clauselens_db
```

### 4. Initialize Database & Run Migrations
Run Alembic migrations to create all tables:
```bash
alembic upgrade head
```
Or run the automatic database initializer and seeder:
```bash
python -m app.init_db
```

### 5. Start the Backend Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend and PostgreSQL database connectivity |
| `GET` | `/api/contracts` | List contracts owned by the current user |
| `POST` | `/api/contracts/upload` | Upload and register a contract (PDF format, max 15MB) |
| `GET` | `/api/contracts/{id}` | Retrieve contract metadata and analysis summary |
| `DELETE` | `/api/contracts/{id}` | Delete contract and cascade associated records |
| `POST` | `/api/contracts/{id}/analyze` | Trigger analysis pipeline for contract |
| `GET` | `/api/history` | Retrieve analysis history for current user |
| `DELETE` | `/api/history/{id}` | Delete an analysis history entry |
| `GET` | `/api/analyses/{id}` | Retrieve complete analysis report and findings |
| `PATCH` | `/api/findings/{id}/review` | Update review status on a finding |
| `GET` | `/api/policies` | List custom contract policies |
| `POST` | `/api/policies` | Create a custom policy |
| `PUT` | `/api/policies/{id}` | Update a custom policy |
| `PATCH` | `/api/policies/{id}` | Partial update a policy (toggle enabled status) |
| `DELETE` | `/api/policies/{id}` | Delete a custom policy |
| `GET` | `/api/regulatory-rules` | List available statutory & standard rules |

---

## Security & Data Ownership

1. **User Record Isolation**: Every private record (Contracts, Policies, Analyses) stores `owner_id`. All queries strictly filter on `owner_id == current_user_id`. Attempting to access or delete another user's contract or policy returns a 404/403.
2. **File Validation**: Uploads are validated against magic bytes (`%PDF-`), file extension (`.pdf`), and size limits (15 MB). Files are stored on private disk using UUID-prefixed keys rather than public URLs.
3. **Information Disclosure Prevention**: Database credentials and internal tracebacks are strictly suppressed in API error responses.

---

## Verification & Testing

Execute the automated test suite to verify database connectivity, all API endpoints, and user isolation:
```bash
python test_backend.py
```
