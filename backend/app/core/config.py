import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file."""

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:r1e2d3x4@localhost:5432/clauselens_db",
        description="PostgreSQL or fallback SQLAlchemy database connection URI",
    )

    # Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB

    # Authentication / User ownership default
    DEFAULT_USER_ID: str = "usr_enterprise_01"

    # Local AI Configuration (Qwen2.5-1.5B-Instruct GGUF Q4_K_M)
    USE_LOCAL_LLM: bool = True
    MODEL_PATH: str = "models/Qwen2.5-1.5B-Instruct/qwen2.5-1.5b-instruct-q4_k_m.gguf"
    MODEL_CONTEXT_LENGTH: int = 2048  # Conservative for 8 GB RAM systems
    MODEL_GPU_LAYERS: int = -1        # -1 = auto-offload all layers if GPU supported; 0 = CPU fallback
    MODEL_TEMPERATURE: float = 0.1    # Low temperature for factual, deterministic legal extraction
    MODEL_MAX_NEW_TOKENS: int = 1024
    MODEL_THREADS: int = 6            # Optimized for Intel Core i5-12250H
    MODEL_TIMEOUT_SECONDS: int = 120

    @property
    def resolved_model_path(self) -> str:
        """Resolve model path relative to backend root directory."""
        if os.path.isabs(self.MODEL_PATH):
            return self.MODEL_PATH
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.normpath(os.path.join(backend_dir, self.MODEL_PATH))

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
