import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

APP_ENV = os.getenv("APP_ENV", "development")
PORT = int(os.getenv("PORT", "8000"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
FILE_STORAGE_DIR = os.getenv("FILE_STORAGE_DIR", str(BASE_DIR / "private_uploads"))
DATA_STORAGE_DIR = os.getenv("DATA_STORAGE_DIR", str(BASE_DIR / "data"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Ensure directories exist
os.makedirs(FILE_STORAGE_DIR, exist_ok=True)
os.makedirs(DATA_STORAGE_DIR, exist_ok=True)
