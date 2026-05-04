"""
AI-powered resume tailoring service using OpenAI's API.
"""

import logging
import os

from openai import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job description.

CRITICAL RULES:
1. Do NOT hallucinate, invent, or fabricate any skills, experiences, certifications, or achievements that are not present in the original resume.
2. Only reword, reorder, and emphasize EXISTING experiences to better align with the job description keywords and requirements.
3. Preserve all factual details: dates, company names, job titles, education, and certifications exactly as they appear.
4. You may rephrase bullet points to highlight relevant skills using the job description's language.
5. You may reorder sections or bullet points to prioritize the most relevant experience.
6. Output the resume in clean, well-structured Markdown format.

OUTPUT FORMAT:
- Use `#` for the candidate's name
- Use `##` for section headers (e.g., Experience, Education, Skills)
- Use `###` for job titles / positions
- Use `-` for bullet points
- Use `**bold**` for emphasis on key terms
- Include a brief professional summary at the top if the original resume has one
"""


def _build_user_prompt(
    resume_text: str,
    jd_text: str,
    custom_instructions: str = "",
    variation_index: int = 0,
) -> str:
    """Build the user-facing prompt sent to the LLM."""
    prompt = f"""Here is the candidate's original resume:

---
{resume_text}
---

Here is the job description to tailor for:

---
{jd_text}
---
"""

    if custom_instructions.strip():
        prompt += f"""
Additional instructions from the candidate:
{custom_instructions}
"""

    if variation_index > 0:
        prompt += f"""
This is variation #{variation_index + 1}. Please produce a meaningfully different version
by varying the emphasis, ordering, and phrasing while still staying truthful to the
original resume content.
"""

    prompt += """
Now produce the tailored resume in Markdown format. Remember: do NOT invent any new
skills or experiences — only rework what already exists in the original resume.
"""
    return prompt


def generate_tailored_resume(
    resume_text: str,
    jd_text: str,
    custom_instructions: str = "",
    variation_index: int = 0,
    model: str = "gpt-4o",
) -> str:
    """
    Call the OpenAI API to generate a tailored resume.

    Args:
        resume_text: Extracted plain text from the candidate's resume.
        jd_text: The job description text.
        custom_instructions: Optional extra instructions from the user.
        variation_index: 0-based index for generating variations.
        model: The OpenAI model to use.

    Returns:
        The tailored resume as a Markdown string.

    Raises:
        RuntimeError: If the API call fails.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your-api-key-here":
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. "
            "Please set it in backend/.env"
        )

    client = OpenAI(api_key=api_key, timeout=60.0)

    user_prompt = _build_user_prompt(
        resume_text, jd_text, custom_instructions, variation_index
    )

    # Use slightly higher temperature for variations to get diverse outputs
    temperature = 0.7 if variation_index == 0 else 0.85

    try:
        logger.info("Calling OpenAI API (model=%s, variation=%d)", model, variation_index)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=4096,
        )
        result = response.choices[0].message.content.strip()
        logger.info("OpenAI API returned %d characters", len(result))
        return result

    except AuthenticationError:
        raise RuntimeError(
            "Invalid OpenAI API key. Please check your OPENAI_API_KEY in backend/.env"
        )
    except RateLimitError:
        raise RuntimeError(
            "OpenAI rate limit reached. Please wait a moment and try again."
        )
    except APITimeoutError:
        raise RuntimeError(
            "OpenAI request timed out. The service may be under heavy load — please try again."
        )
    except APIConnectionError:
        raise RuntimeError(
            "Could not connect to OpenAI. Please check your internet connection."
        )
    except Exception as e:
        logger.exception("Unexpected OpenAI API error")
        raise RuntimeError(f"OpenAI API call failed: {e}")

