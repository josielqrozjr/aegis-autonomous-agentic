"""AEGIS Worker — async runtime for background processing.

In production, this consumes from Pub/Sub. For MVP, it exposes
a simple in-process interface that the API can call directly.
"""

import asyncio
import logging
from typing import Any, Dict

from apps.worker.handlers.investigation_handler import InvestigationHandler
from apps.worker.handlers.regulatory_change_handler import RegulatoryChangeHandler

logger = logging.getLogger("aegis.worker")


class AegisWorker:
    """Simple worker that processes commands in-process (Pub/Sub adapter later)."""

    def __init__(self, inv_repo, change_repo, audit_repo, registry=None):
        self._investigation_handler = InvestigationHandler(inv_repo, audit_repo, registry)
        self._regulatory_handler = RegulatoryChangeHandler(inv_repo, change_repo, audit_repo)

    async def process_investigation(self, investigation_id: str) -> Dict[str, Any]:
        logger.info("Processing investigation %s", investigation_id)
        return await self._investigation_handler.handle(investigation_id)

    async def process_regulatory_change(self, change_id: str) -> Dict[str, Any]:
        logger.info("Processing regulatory change %s", change_id)
        return await self._regulatory_handler.handle(change_id)
