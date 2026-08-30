"""Security middleware and utilities for AEGIS API.

- Rate limiting (in-memory, per-IP)
- File upload validation (size, content type)
- Error sanitization (hide stack traces in production)
"""

import os
import time
import logging
from collections import defaultdict
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from fastapi import HTTPException, UploadFile

logger = logging.getLogger("aegis.security")

# ── Upload validation ──

MAX_UPLOAD_SIZE_MB = int(os.environ.get("AEGIS_MAX_UPLOAD_MB", "20"))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/json",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


async def validate_upload(file: UploadFile) -> bytes:
    """Validate and read uploaded file. Raises HTTPException on violation."""
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {content_type}. Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {len(content)} bytes. Maximum: {MAX_UPLOAD_SIZE_BYTES} bytes ({MAX_UPLOAD_SIZE_MB} MB)",
        )

    return content


# ── Rate limiting ──

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter per client IP.

    Limits requests per window (default: 100 req / 60s).
    """

    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self._max_requests = max_requests
        self._window = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ("/health", "/", "/docs", "/openapi.json"):
            return await call_next(request)

        ip = self._client_ip(request)
        now = time.time()
        cutoff = now - self._window

        # Clean old entries
        self._requests[ip] = [t for t in self._requests[ip] if t > cutoff]

        if len(self._requests[ip]) >= self._max_requests:
            logger.warning("Rate limit exceeded for %s", ip)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."},
                headers={"Retry-After": str(self._window)},
            )

        self._requests[ip].append(now)
        return await call_next(request)


# ── Error sanitization ──

class ErrorSanitizationMiddleware(BaseHTTPMiddleware):
    """In production, hide internal error details from responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            is_prod = os.environ.get("AEGIS_ENV", "development") == "production"
            logger.exception("Unhandled error: %s", e)

            if is_prod:
                return JSONResponse(
                    status_code=500,
                    content={"detail": "Internal server error"},
                )
            raise


# ── CORS configuration ──

def get_cors_origins() -> list[str]:
    """Return allowed CORS origins based on environment."""
    env = os.environ.get("AEGIS_ENV", "development")
    custom = os.environ.get("AEGIS_CORS_ORIGINS", "")

    if custom:
        return [o.strip() for o in custom.split(",")]
    if env == "production":
        return [
            os.environ.get("AEGIS_WEB_URL", "https://aegis-web.run.app"),
        ]
    return ["*"]  # development: allow all
