"""
resuME API — FastAPI backend for AI-powered resume tailoring.
"""

import io
import logging
import time
import zipfile

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

from services.extractor import extract_text
from services.ai_generator import generate_tailored_resume
from services.document_builder import create_docx_from_markdown

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="resuME API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = (".pdf", ".docx")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/")
async def root():
    """Health-check endpoint."""
    return {"message": "Hello from resuME API!", "status": "ok"}


@app.post("/api/generate-resume")
async def generate_resume(
    resume: UploadFile = File(..., description="Resume file (.pdf or .docx)"),
    job_description: str = Form(..., description="Job description text"),
    instructions: str = Form("", description="Optional custom instructions"),
    variations: int = Form(1, description="Number of variations (1-3)", ge=1, le=3),
    output_format: str = Form("docx", description="Output format: docx"),
):
    """
    Accept a resume file + job description, generate tailored resume(s).

    Returns:
    - Single variation → the DOCX file directly as a download.
    - Multiple variations → a ZIP file containing all DOCX files.
    """

    # ------------------------------------------------------------------
    # 1. Validate the uploaded file
    # ------------------------------------------------------------------
    filename = resume.filename or ""
    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Please upload a .pdf or .docx file.",
        )

    file_bytes = await resume.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Validate job description
    jd_stripped = job_description.strip()
    if len(jd_stripped) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please paste the full job posting.",
        )

    logger.info(
        "Processing request: file=%s (%d bytes), jd_length=%d, variations=%d",
        filename, len(file_bytes), len(jd_stripped), variations,
    )
    start_time = time.time()

    # ------------------------------------------------------------------
    # 2. Extract text from resume
    # ------------------------------------------------------------------
    try:
        resume_text = extract_text(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    logger.info("Extracted %d characters from resume", len(resume_text))

    # ------------------------------------------------------------------
    # 3. Generate tailored resume(s) via AI
    # ------------------------------------------------------------------
    generated_docs: list[bytes] = []

    for i in range(variations):
        try:
            markdown = generate_tailored_resume(
                resume_text=resume_text,
                jd_text=job_description,
                custom_instructions=instructions,
                variation_index=i,
            )
        except RuntimeError as e:
            raise HTTPException(status_code=502, detail=str(e))

        # Convert markdown to DOCX
        docx_bytes = create_docx_from_markdown(markdown)
        generated_docs.append(docx_bytes)

    elapsed = time.time() - start_time
    logger.info("Generated %d variation(s) in %.1fs", variations, elapsed)

    # ------------------------------------------------------------------
    # 4. Return the result(s)
    # ------------------------------------------------------------------

    # Single variation → return the file directly
    if len(generated_docs) == 1:
        return Response(
            content=generated_docs[0],
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": 'attachment; filename="tailored_resume.docx"'
            },
        )

    # Multiple variations → package into a ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for idx, doc_bytes in enumerate(generated_docs, start=1):
            zf.writestr(f"tailored_resume_v{idx}.docx", doc_bytes)

    zip_buffer.seek(0)

    return Response(
        content=zip_buffer.read(),
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="tailored_resumes.zip"'
        },
    )
