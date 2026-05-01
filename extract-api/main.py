"""
FastAPI sidecar for binary file extraction via Microsoft MarkItDown.

Receives multipart file uploads (PDF/DOCX/XLSX/PPTX) and returns clean
Markdown via MarkItDown. Already-text formats (TXT/MD/CSV/JSON) are
expected to be handled client-side and never reach this service.

Designed to run alongside agent-api on a different port (default 8001).
"""
import asyncio
import os
import tempfile
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from markitdown import MarkItDown

load_dotenv()

app = FastAPI(title="Extraction API", version="1.0.0")

# CORS configuration. Comma-separated list, e.g.
# "https://dynamoprototype-uat.example.com,http://localhost:5173".
# Defaults to common local dev origins so behaviour is unchanged when run
# locally; in deployed environments set via env / k8s ConfigMap.
_default_dev_origins = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
_cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", _default_dev_origins)
cors_allow_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tunables
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "50"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
EXTRACTION_TIMEOUT_SECONDS = int(os.getenv("EXTRACTION_TIMEOUT_SECONDS", "60"))
EXTRACTION_CONCURRENCY = int(os.getenv("EXTRACTION_CONCURRENCY", "2"))

# Allow-list. Text formats are handled client-side via FileReader and
# should never reach this service. .doc (legacy OLE-compound Word) is not
# included because MarkItDown's docx extractor only handles .docx.
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".pptx"}

# MarkItDown is cheap to construct (no model loading), but reusing the
# instance avoids repeated converter registration on every request.
_md = MarkItDown()

# Bound concurrent extractions per pod. Even without ML, parsing a
# 300-page PDF chews CPU/RAM; 2 in flight is a safe default for a 4 GB pod.
_semaphore = asyncio.Semaphore(EXTRACTION_CONCURRENCY)


class ExtractResponse(BaseModel):
    success: bool
    filename: str
    text: Optional[str] = None
    word_count: Optional[int] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    error_detail: Optional[str] = None


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "extract-api"}


def _word_count(text: str) -> int:
    return len([w for w in text.split() if w.strip()])


async def _read_with_limit(upload: UploadFile, limit: int) -> Optional[bytes]:
    """Stream the upload into memory, aborting if it exceeds `limit` bytes.

    Returns None when the limit is exceeded so the caller can surface a
    `too_large` error without loading the full payload.
    """
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await upload.read(64 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > limit:
            return None
        chunks.append(chunk)
    return b"".join(chunks)


def _convert_sync(path: str) -> str:
    """Run MarkItDown synchronously. Called via asyncio.to_thread."""
    result = _md.convert(path)
    return result.text_content or ""


@app.post("/api/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)):
    """Extract text from a binary file (PDF/DOCX/XLSX/PPTX) as Markdown."""
    started = time.monotonic()
    filename = file.filename or "upload"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        return ExtractResponse(
            success=False,
            filename=filename,
            error="unsupported_type",
            error_detail=(
                f"Extension '{ext or '(none)'}' is not supported. "
                f"Allowed: {sorted(ALLOWED_EXTENSIONS)}."
            ),
        )

    data = await _read_with_limit(file, MAX_UPLOAD_BYTES)
    if data is None:
        return ExtractResponse(
            success=False,
            filename=filename,
            error="too_large",
            error_detail=f"File exceeds {MAX_UPLOAD_MB} MB limit.",
        )

    tmp_path: Optional[str] = None
    try:
        # MarkItDown sniffs by extension *and* magic bytes, so the suffix matters.
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        async with _semaphore:
            try:
                text = await asyncio.wait_for(
                    asyncio.to_thread(_convert_sync, tmp_path),
                    timeout=EXTRACTION_TIMEOUT_SECONDS,
                )
            except asyncio.TimeoutError:
                return ExtractResponse(
                    success=False,
                    filename=filename,
                    duration_ms=int((time.monotonic() - started) * 1000),
                    error="timeout",
                    error_detail=f"Extraction exceeded {EXTRACTION_TIMEOUT_SECONDS}s.",
                )
            except Exception as exc:
                return ExtractResponse(
                    success=False,
                    filename=filename,
                    duration_ms=int((time.monotonic() - started) * 1000),
                    error="extraction_failed",
                    error_detail=str(exc)[:500],
                )

        wc = _word_count(text)

        # Scanned PDFs surface as near-empty text from pdfminer.six. Treat
        # them distinctly so the UI can prompt the user instead of silently
        # passing an empty extraction to the LLM.
        if ext == ".pdf" and wc < 20:
            return ExtractResponse(
                success=False,
                filename=filename,
                word_count=wc,
                duration_ms=int((time.monotonic() - started) * 1000),
                error="needs_ocr",
                error_detail="PDF appears to be scanned (no extractable text). OCR is not enabled.",
            )

        return ExtractResponse(
            success=True,
            filename=filename,
            text=text,
            word_count=wc,
            duration_ms=int((time.monotonic() - started) * 1000),
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
