"""Regulatory change endpoints."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List

from aegis.schemas.contracts import RegulatoryChange
from apps.api.app.api.deps import get_regulatory_change_repo, get_audit_repo, get_investigation_repo
from apps.api.app.domain.repositories import AuditEntry
from apps.api.app.application.regulatory.impact_analysis import analyze_impact

router = APIRouter(prefix="/regulatory-changes", tags=["regulatory-changes"])


class CreateRegulatoryChangeRequest(BaseModel):
    framework: str
    version: str
    change_description: str
    affected_requirements: List[str] = Field(default_factory=list)


@router.post("", status_code=201)
async def create_regulatory_change(
    req: CreateRegulatoryChangeRequest,
    change_repo=Depends(get_regulatory_change_repo),
    audit_repo=Depends(get_audit_repo),
    inv_repo=Depends(get_investigation_repo),
):
    change_id = str(uuid.uuid4())
    change = RegulatoryChange(
        id=change_id,
        framework=req.framework,
        version=req.version,
        change_description=req.change_description,
        affected_requirements=req.affected_requirements,
        detected_at=datetime.now(timezone.utc),
    )
    await change_repo.save(change)

    # Impact analysis with blast radius calculation
    all_investigations = await inv_repo.list_all()
    impact = await analyze_impact(change, all_investigations, audit_repo.append)

    # Save affected investigations back
    for inv in all_investigations:
        if inv.id in impact.affected_investigations:
            await inv_repo.save(inv)

    # Audit log
    await audit_repo.append(
        AuditEntry(
            entry_id=str(uuid.uuid4()),
            investigation_id="system",
            agent_id="change_detection",
            action="REGULATORY_CHANGE_DETECTED",
            details=f"Framework: {req.framework} v{req.version}. Affected reqs: {req.affected_requirements}",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    )

    return {
        "id": change_id,
        "framework": req.framework,
        "version": req.version,
        "impact_analysis": impact.to_dict(),
    }


@router.get("")
async def list_regulatory_changes(change_repo=Depends(get_regulatory_change_repo)):
    changes = await change_repo.list_all()
    return {
        "count": len(changes),
        "changes": [c.model_dump() for c in changes],
    }
