# ClauseLens Backend, PostgreSQL Database & Local AI Infrastructure

Enterprise backend infrastructure, PostgreSQL database, and locally running **Qwen2.5-1.5B-Instruct** AI model for ClauseLens Contract Intelligence.

---

## Technology Stack

- **Python**: 3.13+
- **FastAPI**: Modern, high-performance web framework
- **PostgreSQL**: Version 18.3 relational storage
- **SQLAlchemy 2.0**: Relational ORM with connection pooling
- **Pydantic v2**: Request & response schema validation
- **Local AI Inference**: `llama-cpp-python` (0.3.36) with Vulkan/CUDA GPU offloading and CPU fallback
- **Model**: `Qwen2.5-1.5B-Instruct` in GGUF format (`Q4_K_M` quantization, ~1.04 GB)
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
│   │   ├── analysis.py       # Analysis and Finding review schemas
│   │   └── ai_analysis.py    # Structured AI output schema
│   ├── routes/               # FastAPI route controllers
│   │   ├── health.py         # GET /api/health (reports DB & Local AI status)
│   │   ├── contracts.py      # Contract upload, listing, details, analysis
│   │   ├── policies.py       # Policy CRUD (GET, POST, PUT, PATCH, DELETE)
│   │   ├── history.py        # History listing, analysis details, finding review
│   │   └── regulatory.py     # Regulatory rules listing
│   ├── services/             # Business logic layer
│   │   ├── file_service.py   # PDF validation, hash, extraction, storage
│   │   ├── contract_service.py # Contract CRUD & risk aggregation
│   │   ├── policy_service.py   # Policy CRUD & user ownership checks
│   │   ├── analysis_service.py # Analysis pipeline & PostgreSQL persistence
│   │   └── local_llm_service.py # Local Qwen2.5 GGUF singleton service
│   └── main.py               # Application entrypoint & CORS middleware
├── models/
│   └── Qwen2.5-1.5B-Instruct/
│       └── qwen2.5-1.5b-instruct-q4_k_m.gguf  # GGUF weights (~1.04 GB)
├── alembic/                  # Alembic migration scripts
├── alembic.ini               # Alembic configuration
├── download_model.py         # Reproducible GGUF model downloader
├── test_backend.py           # Backend endpoints & PostgreSQL test suite
├── test_local_ai.py          # 10-point Local AI verification test suite
├── .env.example              # Safe environment variable template
├── .env                      # Local configuration (never committed)
├── requirements.txt          # Python dependencies
└── README.md                 # This documentation
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- PostgreSQL server (listening on port 5432)
- NVIDIA GPU (RTX 2050 4GB VRAM) or multi-core CPU (Intel i5-12250H)
- 8 GB System RAM

### 2. Virtual Environment Setup
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
Install Python dependencies:
```bash
pip install -r requirements.txt
```
For Windows GPU acceleration (RTX 2050):
```bash
pip install --force-reinstall --no-deps https://github.com/abetlen/llama-cpp-python/releases/download/v0.3.36-vulkan/llama_cpp_python-0.3.36-py3-none-win_amd64.whl
```
*(If GPU offload is unavailable or fails, `llama-cpp-python` automatically falls back to CPU inference with multi-threaded AVX2 optimization).*

### 4. Download Local Qwen2.5-1.5B-Instruct Model
Download the official GGUF quantized weights (`Q4_K_M`, ~1.04 GB):
```bash
python download_model.py
```
The model will be stored in:
`backend/models/Qwen2.5-1.5B-Instruct/qwen2.5-1.5b-instruct-q4_k_m.gguf`

The script automatically skips downloading if the file is already present.

### 5. Configure Environment Variables
Copy `.env.example` to `.env` and verify your configuration:
```bash
cp .env.example .env
```
Key configuration settings:
```env
# PostgreSQL Database Connection
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/clauselens_db

# Local AI Configuration
USE_LOCAL_LLM=True
MODEL_PATH=models/Qwen2.5-1.5B-Instruct/qwen2.5-1.5b-instruct-q4_k_m.gguf
MODEL_CONTEXT_LENGTH=2048
MODEL_GPU_LAYERS=-1
MODEL_TEMPERATURE=0.1
MODEL_MAX_NEW_TOKENS=1024
MODEL_THREADS=6
```

### 6. Initialize Database & Run Migrations
Run Alembic migrations to create all tables:
```bash
alembic upgrade head
```
Or run the automatic database initializer and seeder:
```bash
python -m app.init_db
```

### 7. Start the Backend Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Interactive Swagger API documentation: `http://localhost:8000/docs`

---

## Local AI Inference Architecture

1. **Singleton Model Lifecycle**: The GGUF model is loaded once via `LocalLLMService.get_instance()` and kept in memory across requests. It is never reloaded per request.
2. **GPU Offloading & Memory Safety**:
   - Uses `n_gpu_layers=-1` to offload all 28 layers of Qwen2.5-1.5B to the NVIDIA RTX 2050 (consumes only ~300 MiB VRAM buffer, well within the 4 GB limit).
   - If GPU offloading is unavailable or encounters memory exhaustion, it automatically catches the exception and falls back to CPU execution (`n_gpu_layers=0`).
3. **Prompt Injection Defense & Legal Safety**:
   - Employs strict Qwen2.5 ChatML formatting (`<|im_start|>system ...`).
   - Treats contract contents as untrusted input.
   - Forbids hallucination: unverified or absent terms are explicitly categorized as absent.
4. **Zero Cloud LLM Dependency**:
   - The contract analysis pipeline runs **100% locally on your machine**.
   - No data or contract text is sent to Google Gemini, OpenAI, or external cloud LLM APIs.

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend, database, and Local AI status |
| `GET` | `/api/contracts` | List contracts owned by the current user |
| `POST` | `/api/contracts/upload` | Upload and register a contract (PDF format, max 15MB) |
| `GET` | `/api/contracts/{id}` | Retrieve contract metadata and analysis summary |
| `DELETE` | `/api/contracts/{id}` | Delete contract and cascade associated records |
| `POST` | `/api/contracts/{id}/analyze` | **Trigger Local Qwen2.5 AI Analysis Pipeline** |
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

## Verification & Testing

### 1. Run Local AI Verification Suite (10-Point Test)
```bash
python test_local_ai.py
```
Validates:
1. Model file discovery and size check
2. Model initialization and GPU offload verification
3. Direct inference on legal clause text
4. Structured JSON schema validation
5. Long-contract chunking & clause segmentation
6. Custom policy evaluation
7. Missing-model error handling (non-crashing application error)
8. End-to-end PDF upload, local Qwen analysis, and PostgreSQL persistence
9. Ownership isolation and security checks
10. Verification of zero Gemini or cloud LLM calls in analysis workflow

### 2. Run General Backend & Database Test Suite
```bash
python test_backend.py
```

---

## Troubleshooting

### 1. Missing Model File
- **Error**: `LocalModelNotFoundError: Model file not found at ...`
- **Fix**: Run `python download_model.py`. The downloader checks whether the file exists and only downloads if missing.

### 2. Memory / VRAM Constraints (4 GB GPU / 8 GB RAM)
- **VRAM limit**: If other GPU applications consume VRAM, set `MODEL_GPU_LAYERS=0` in `.env` to run purely on CPU.
- **Context Length**: The default context length is set conservatively to `2048` tokens (`MODEL_CONTEXT_LENGTH=2048`), which uses less than 1.1 GB of RAM.

### 3. GPU Offload Verification
Run the following python snippet:
```bash
python -c "from app.services.local_llm_service import local_llm_service; print(local_llm_service.get_status())"
```
Check that `model_present: True` and `device: "gpu"` (or `"cpu"`).
