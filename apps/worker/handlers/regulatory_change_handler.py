"""Regulatory change handler — processes change events and triggers re-evaluation."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from aegis.schemas.contracts import RegulatoryChange
from apps.api.app.application.regulatory.impact_analysis import analyze_impact
from apps.api.app.domain.repositories import AuditEntry


class RegulatoryChangeHandler:
    def __init__(self, inv_repo, change_repo, audit_repo):
        self._inv_repo = inv_repo
        self._change_repo = change_repo
        self._audit_repo = audit_repo

    async def handle(self, change_id: str) -> Dict[str, Any]:
        """Process a regulatory change: impact analysis + reopen affected investigations."""
        change = await self._change_repo.get(change_id)
        if change is None:
            return {"error": "Change not found"}

        all_investigations = await self._inv_repo.list_all()
        impact = await analyze_impact(change, all_investigations, self._audit_repo.append)

        # Persist updated investigations
        for inv in all_investigations:
            if inv.id in impact.affected_investigations:
                await self._inv_repo.save(inv)

        return {
            "change_id": change_id,
            "impact": impact.to_dict(),
        }
