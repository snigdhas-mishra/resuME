"""
Text extraction service for PDF and DOCX files.
"""

import io
from PyPDF2 import PdfReader
from docx import Document


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        Extracted text as a single string with pages separated by newlines.

    Raises:
        ValueError: If the PDF cannot be read or contains no extractable text.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Could not read PDF file: {e}")

    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())

    full_text = "\n\n".join(pages)

    if not full_text.strip():
        raise ValueError(
            "The PDF appears to contain no extractable text. "
            "It may be a scanned image — please try a text-based PDF or DOCX instead."
        )

    return full_text


def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extract all text content from a DOCX file.

    Args:
        file_bytes: Raw bytes of the uploaded DOCX file.

    Returns:
        Extracted text as a single string with paragraphs separated by newlines.

    Raises:
        ValueError: If the DOCX cannot be read or contains no text.
    """
    try:
        doc = Document(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Could not read DOCX file: {e}")

    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)

    full_text = "\n".join(paragraphs)

    if not full_text.strip():
        raise ValueError("The DOCX file appears to contain no text.")

    return full_text


def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Route to the correct extractor based on file extension.

    Args:
        file_bytes: Raw bytes of the uploaded file.
        filename: Original filename (used to determine format).

    Returns:
        Extracted text content.

    Raises:
        ValueError: If the file type is unsupported.
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(
            f"Unsupported file type: '{filename}'. Please upload a .pdf or .docx file."
        )
