"""Investigation handler — orchestrates the full investigation pipeline.

Idempotent: checks current state before acting.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from aegis.schemas.contracts import Investigation
from aegis.schemas.enums import InvestigationStatus, TaskStatus
from apps.api.app.domain.investigation.state_machine import can_transition, validate_transition
from apps.api.app.domain.repositories import AuditEntry


class InvestigationHandler:
    """Handles investigation execution through the pipeline stages."""

    def __init__(self, inv_repo, audit_repo, registry=None):
        self._inv_repo = inv_repo
        self._audit_repo = audit_repo
        self._registry = registry

    async def _audit(self, inv_id: str, agent_id: Optional[str], action: str, details: str):
        await self._audit_repo.append(
            AuditEntry(
                entry_id=str(uuid.uuid4()),
                investigation_id=inv_id,
                agent_id=agent_id,
                action=action,
                details=details,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )

    async def handle(self, investigation_id: str) -> Dict[str, Any]:
        """Run the investigation pipeline. Idempotent — resumes from current state."""
        inv = await self._inv_repo.get(investigation_id)
        if inv is None:
            return {"error": "Investigation not found"}

        result = {"investigation_id": investigation_id, "steps_executed": []}

        # Pipeline: QUEUED → UNDERSTANDING → PLANNING → ROUTING → ANALYZING → REVIEWING → COMPLETED
        pipeline = [
            (InvestigationStatus.QUEUED, InvestigationStatus.UNDERSTANDING, self._understand),
            (InvestigationStatus.UNDERSTANDING, InvestigationStatus.PLANNING, self._plan),
            (InvestigationStatus.PLANNING, InvestigationStatus.ROUTING, self._route),
            (InvestigationStatus.ROUTING, InvestigationStatus.ANALYZING, self._analyze),
            (InvestigationStatus.ANALYZING, InvestigationStatus.REVIEWING, self._review),
            (InvestigationStatus.REVIEWING, InvestigationStatus.COMPLETED, self._complete),
        ]

        for from_status, to_status, step_fn in pipeline:
            if inv.status == from_status:
                try:
                    validate_transition(inv.status, to_status)
                    await step_fn(inv)
                    inv.status = to_status
                    inv.updated_at = datetime.now(timezone.utc)
                    await self._inv_repo.save(inv)
                    await self._audit(inv.id, None, "PIPELINE_STEP", f"{from_status.value} → {to_status.value}")
                    result["steps_executed"].append(to_status.value)
                except Exception as e:
                    inv.status = InvestigationStatus.FAILED
                    inv.updated_at = datetime.now(timezone.utc)
                    await self._inv_repo.save(inv)
                    await self._audit(inv.id, None, "PIPELINE_FAILED", f"Failed at {from_status.value}: {e}")
                    result["error"] = str(e)
                    break

        result["final_status"] = inv.status.value
        return result

    async def _understand(self, inv: Investigation):
        """Step: Document understanding (placeholder for Gemini call)."""
        pass

    async def _plan(self, inv: Investigation):
        """Step: Generate investigation plan (placeholder for Planner agent)."""
        pass

    async def _route(self, inv: Investigation):
        """Step: Dynamic routing to specialists (placeholder)."""
        pass

    async def _analyze(self, inv: Investigation):
        """Step: Execute specialist agents (placeholder)."""
        pass

    async def _review(self, inv: Investigation):
        """Step: Adversarial review (placeholder)."""
        pass

    async def _complete(self, inv: Investigation):
        """Step: Consolidate and finalize."""
        pass
