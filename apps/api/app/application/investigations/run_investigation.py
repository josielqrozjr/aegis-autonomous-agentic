"""Use case: Run an investigation through the full pipeline."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from aegis.schemas.contracts import Investigation
from aegis.schemas.enums import InvestigationStatus
from aegis.registry.registry import AgentRegistry
from apps.api.app.domain.investigation.state_machine import validate_transition
from apps.api.app.domain.repositories import AuditEntry


async def transition_investigation(
    investigation: Investigation,
    new_status: InvestigationStatus,
    audit_append=None,
    details: str = "",
) -> None:
    """Transition an investigation to a new status with validation and audit."""
    validate_transition(investigation.status, new_status)
    old = investigation.status
    investigation.status = new_status
    investigation.updated_at = datetime.now(timezone.utc)

    if audit_append:
        await audit_append(
            AuditEntry(
                entry_id=str(uuid.uuid4()),
                investigation_id=investigation.id,
                agent_id=None,
                action="STATUS_TRANSITION",
                details=f"{old.value} → {new_status.value}. {details}",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )
