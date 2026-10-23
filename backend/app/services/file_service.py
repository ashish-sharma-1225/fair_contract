import os
import io
import uuid
import hashlib
import logging
from typing import Tuple, List
from fastapi import HTTPException, UploadFile, status
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader
from app.core.config import settings

logger = logging.getLogger("clauselens.file_service")

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "text/pdf",
}


class FileService:
    @staticmethod
    def get_upload_dir() -> str:
        """Ensure the upload directory exists and return absolute path."""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_path = os.path.join(base_dir, settings.UPLOAD_DIR)
        os.makedirs(upload_path, exist_ok=True)
        return upload_path

    @classmethod
    def validate_and_save_pdf(cls, file: UploadFile, content: bytes) -> Tuple[str, str, int, int]:
        """
        Validates PDF content, computes SHA-256 hash, extracts page count,
        and saves the file safely into the private upload directory.
        Returns: (storage_key, sha256_hash, size_bytes, page_count)
        """
        size_bytes = len(content)

        # 1. Validate file size
        if size_bytes > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum permitted limit ({settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB)",
            )

        # 2. Validate MIME type & file extension
        filename = file.filename or "contract.pdf"
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents (.pdf) are supported.",
            )

        # Validate magic bytes for PDF (%PDF-)
        if not content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format: file header does not match standard PDF specification.",
            )

        # 3. Compute SHA-256
        sha256_hash = hashlib.sha256(content).hexdigest()

        # 4. Extract page count securely
        page_count = 1
        try:
            reader = PdfReader(io.BytesIO(content))
            page_count = len(reader.pages)
            if page_count < 1:
                page_count = 1
        except Exception as e:
            logger.warning("Could not parse PDF pages accurately: %s", e)
            page_count = 1

        # 5. Save to private storage
        storage_id = str(uuid.uuid4())
        safe_name = os.path.basename(filename).replace(" ", "_")
        storage_key = f"{storage_id}_{safe_name}"

        dest_path = os.path.join(cls.get_upload_dir(), storage_key)
        try:
            with open(dest_path, "wb") as f:
                f.write(content)
        except Exception as e:
            logger.error("Failed to write contract to disk: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store document securely on disk.",
            )

        return storage_key, sha256_hash, size_bytes, page_count

    @classmethod
    def extract_text_pages(cls, storage_key: str) -> List[str]:
        """Extract text per page from stored PDF."""
        file_path = os.path.join(cls.get_upload_dir(), storage_key)
        if not os.path.exists(file_path):
            return []

        pages_text: List[str] = []
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text() or ""
                pages_text.append(text)
        except Exception as e:
            logger.error("Failed extracting text from PDF %s: %s", storage_key, e)

        return pages_text

    @classmethod
    def remove_file(cls, storage_key: str) -> None:
        """Safely delete stored file."""
        try:
            file_path = os.path.join(cls.get_upload_dir(), storage_key)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.warning("Error removing file %s: %s", storage_key, e)
