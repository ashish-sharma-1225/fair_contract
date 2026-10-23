import hashlib
from typing import Tuple, List
from app.schemas import ContractExtractionPage

def calculate_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of the given bytes."""
    return hashlib.sha256(file_bytes).hexdigest()

def is_valid_pdf(file_bytes: bytes) -> bool:
    """Checks if the file has the PDF magic header."""
    return file_bytes.startswith(b"%PDF-")

def extract_pdf_text_and_pages(file_bytes: bytes) -> Tuple[int, List[ContractExtractionPage]]:
    """
    Extracts text per page using PyMuPDF (fitz) or pypdf fallback.
    Returns (page_count, pages_list).
    """
    pages: List[ContractExtractionPage] = []
    
    # Try PyMuPDF first
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        for i in range(page_count):
            page = doc.load_page(i)
            text = page.get_text() or ""
            # Estimate clauses by counting double newlines or numbered paragraphs
            clauses_count = max(1, len([p for p in text.split("\n\n") if p.strip()]))
            pages.append(
                ContractExtractionPage(
                    page_number=i + 1,
                    text=text.strip(),
                    clauses_count=clauses_count
                )
            )
        doc.close()
        return page_count, pages
    except Exception:
        pass

    # Fallback to pypdf
    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        page_count = len(reader.pages)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            clauses_count = max(1, len([p for p in text.split("\n\n") if p.strip()]))
            pages.append(
                ContractExtractionPage(
                    page_number=i + 1,
                    text=text.strip(),
                    clauses_count=clauses_count
                )
            )
        return page_count, pages
    except Exception as e:
        # If extraction completely fails (e.g. malformed or empty), return empty page 1
        return 1, [ContractExtractionPage(page_number=1, text="[Text extraction failed or document is scanned/empty]", clauses_count=0)]
