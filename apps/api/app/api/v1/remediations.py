"""Remediation CRUD endpoints."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from aegis.schemas.contracts import Remediation
from aegis.schemas.enums import RemediationStatus
from apps.api.app.api.deps import get_remediation_repo, get_finding_repo, get_audit_repo
from apps.api.app.domain.repositories import AuditEntry

router = APIRouter(prefix="/remediations", tags=["remediations"])


class CreateRemediationRequest(BaseModel):
    finding_id: str
    recommendation: str
    action_item: str
    assignee: Optional[str] = None
    deadline: Optional[datetime] = None


class UpdateRemediationRequest(BaseModel):
    status: str


@router.post("", status_code=201)
async def create_remediation(
    req: CreateRemediationRequest,
    rem_repo=Depends(get_remediation_repo),
    finding_repo=Depends(get_finding_repo),
    audit_repo=Depends(get_audit_repo),
):
    finding = await finding_repo.get(req.finding_id)
    if finding is None:
        raise HTTPException(status_code=404, detail="Finding not found")

    rem_id = str(uuid.uuid4())
    remediation = Remediation(
        id=rem_id,
        finding_id=req.finding_id,
        recommendation=req.recommendation,
        action_item=req.action_item,
        assignee=req.assignee,
        deadline=req.deadline,
    )
    await rem_repo.save(remediation)

    await audit_repo.append(
        AuditEntry(
            entry_id=str(uuid.uuid4()),
            investigation_id=finding.investigation_id,
            agent_id=None,
            action="REMEDIATION_CREATED",
            details=f"Remediation for finding {req.finding_id}: {req.recommendation[:80]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    )

    return {"id": rem_id, "status": remediation.status.value}


@router.patch("/{remediation_id}")
async def update_remediation_status(
    remediation_id: str,
    req: UpdateRemediationRequest,
    rem_repo=Depends(get_remediation_repo),
):
    rem = await rem_repo.get(remediation_id)
    if rem is None:
        raise HTTPException(status_code=404, detail="Remediation not found")

    try:
        rem.status = RemediationStatus(req.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {req.status}")

    await rem_repo.save(rem)
    return {"id": rem.id, "status": rem.status.value}


@router.get("")
async def list_remediations(
    finding_id: str | None = None,
    rem_repo=Depends(get_remediation_repo),
):
    if finding_id:
        rems = await rem_repo.list_by_finding(finding_id)
    else:
        rems = list(rem_repo._store.values())
    return {"count": len(rems), "remediations": [r.model_dump() for r in rems]}


@router.get("/{remediation_id}")
async def get_remediation(remediation_id: str, rem_repo=Depends(get_remediation_repo)):
    rem = await rem_repo.get(remediation_id)
    if rem is None:
        raise HTTPException(status_code=404, detail="Remediation not found")
    return rem.model_dump()
