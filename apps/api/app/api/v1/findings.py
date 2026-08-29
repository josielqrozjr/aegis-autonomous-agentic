"""Findings endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from apps.api.app.api.deps import get_finding_repo

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("")
async def list_findings(
    investigation_id: str | None = None,
    finding_repo=Depends(get_finding_repo),
):
    if investigation_id:
        findings = await finding_repo.list_by_investigation(investigation_id)
    else:
        findings = list(finding_repo._store.values())
    return {
        "count": len(findings),
        "findings": [f.model_dump() for f in findings],
    }


@router.get("/{finding_id}")
async def get_finding(finding_id: str, finding_repo=Depends(get_finding_repo)):
    finding = await finding_repo.get(finding_id)
    if finding is None:
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding.model_dump()
