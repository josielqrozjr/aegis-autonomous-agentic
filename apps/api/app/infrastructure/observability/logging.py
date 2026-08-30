"""Structured logging and request tracing middleware for AEGIS."""

import json
import logging
import time
import uuid
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class StructuredFormatter(logging.Formatter):
    """JSON structured log formatter compatible with Cloud Logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record),
            "logger": record.name,
        }
        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id
        if hasattr(record, "investigation_id"):
            log_entry["investigation_id"] = record.investigation_id
        if record.exc_info and record.exc_info[1]:
            log_entry["error"] = str(record.exc_info[1])
        return json.dumps(log_entry)


def setup_structured_logging(level: int = logging.INFO) -> None:
    """Configure structured JSON logging for the application."""
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())

    root = logging.getLogger("aegis")
    root.setLevel(level)
    root.addHandler(handler)
    root.propagate = False


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """Adds correlation ID to each request and logs timing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id

        logger = logging.getLogger("aegis.http")
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %d (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            extra={"correlation_id": correlation_id},
        )

        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.1f}"
        return response
