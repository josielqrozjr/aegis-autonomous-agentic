"""Investigation CRUD + orchestration endpoints."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from aegis.schemas.contracts import Investigation, Document, InvestigationPlan
from aegis.schemas.enums import InvestigationStatus
from apps.api.app.api.deps import (
    get_investigation_repo,
    get_document_repo,
    get_audit_repo,
    get_agent_registry,
    get_regulatory_change_repo,
    get_trust_graph,
)
from apps.api.app.domain.repositories import AuditEntry
from apps.api.app.domain.investigation.state_machine import (
    validate_transition,
    get_allowed_transitions,
    InvalidTransitionError,
)
from apps.api.app.application.investigations.run_investigation import transition_investigation

router = APIRouter(prefix="/investigations", tags=["investigations"])


class CreateInvestigationRequest(BaseModel):
    title: str
    document_id: str


class InvestigationResponse(BaseModel):
    id: str
    title: str
    status: str
    document_id: str
    findings_count: int
    reviews_count: int
    remediations_count: int
    created_at: datetime
    updated_at: datetime


@router.post("", status_code=201)
async def create_investigation(
    req: CreateInvestigationRequest,
    inv_repo=Depends(get_investigation_repo),
    doc_repo=Depends(get_document_repo),
    audit_repo=Depends(get_audit_repo),
):
    doc = await doc_repo.get(req.document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Document {req.document_id} not found")

    inv_id = str(uuid.uuid4())
    investigation = Investigation(
        id=inv_id,
        title=req.title,
        document=doc,
        status=InvestigationStatus.QUEUED,
    )
    await inv_repo.save(investigation)

    await audit_repo.append(
        AuditEntry(
            entry_id=str(uuid.uuid4()),
            investigation_id=inv_id,
            agent_id=None,
            action="INVESTIGATION_CREATED",
            details=f"Investigation '{req.title}' created for document '{doc.filename}'",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    )

    return {"id": inv_id, "status": investigation.status.value}


@router.get("")
async def list_investigations(inv_repo=Depends(get_investigation_repo)):
    investigations = await inv_repo.list_all()
    return {
        "count": len(investigations),
        "investigations": [
            InvestigationResponse(
                id=inv.id,
                title=inv.title,
                status=inv.status.value,
                document_id=inv.document.id,
                findings_count=len(inv.findings),
                reviews_count=len(inv.reviews),
                remediations_count=len(inv.remediations),
                created_at=inv.created_at,
                updated_at=inv.updated_at,
            ).model_dump()
            for inv in investigations
        ],
    }


@router.get("/{investigation_id}")
async def get_investigation(
    investigation_id: str,
    inv_repo=Depends(get_investigation_repo),
):
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv.model_dump()


@router.get("/{investigation_id}/audit")
async def get_audit_trail(
    investigation_id: str,
    inv_repo=Depends(get_investigation_repo),
    audit_repo=Depends(get_audit_repo),
):
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    entries = await audit_repo.list_by_investigation(investigation_id)
    return {
        "investigation_id": investigation_id,
        "count": len(entries),
        "entries": [e.to_dict() for e in entries],
    }


class TransitionRequest(BaseModel):
    target_status: str


@router.post("/{investigation_id}/transition")
async def transition_status(
    investigation_id: str,
    req: TransitionRequest,
    inv_repo=Depends(get_investigation_repo),
    audit_repo=Depends(get_audit_repo),
):
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    try:
        target = InvestigationStatus(req.target_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {req.target_status}")

    try:
        await transition_investigation(inv, target, audit_repo.append, f"Manual transition")
    except InvalidTransitionError as e:
        raise HTTPException(status_code=409, detail=str(e))

    await inv_repo.save(inv)
    return {"id": inv.id, "status": inv.status.value}


@router.get("/{investigation_id}/allowed-transitions")
async def allowed_transitions(
    investigation_id: str,
    inv_repo=Depends(get_investigation_repo),
):
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    allowed = get_allowed_transitions(inv.status)
    return {
        "current_status": inv.status.value,
        "allowed_transitions": [s.value for s in allowed],
    }


@router.post("/{investigation_id}/run")
async def run_investigation(
    investigation_id: str,
    inv_repo=Depends(get_investigation_repo),
    audit_repo=Depends(get_audit_repo),
    registry=Depends(get_agent_registry),
    change_repo=Depends(get_regulatory_change_repo),
):
    """Trigger full pipeline execution for an investigation."""
    from apps.worker.main import AegisWorker

    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    worker = AegisWorker(inv_repo, change_repo, audit_repo, registry, get_trust_graph)
    result = await worker.process_investigation(investigation_id)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/{investigation_id}/trust-graph")
async def get_trust_graph_endpoint(
    investigation_id: str,
    inv_repo=Depends(get_investigation_repo),
):
    """Return the Trust & Compliance Graph for an investigation."""
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    graph = get_trust_graph(investigation_id)
    return {
        "investigation_id": investigation_id,
        "graph": graph.to_dict(),
    }


class BlastRadiusRequest(BaseModel):
    node_id: str


@router.post("/{investigation_id}/trust-graph/blast-radius")
async def blast_radius(
    investigation_id: str,
    req: BlastRadiusRequest,
    inv_repo=Depends(get_investigation_repo),
):
    """Calculate blast radius without actually invalidating."""
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    graph = get_trust_graph(investigation_id)
    return graph.calculate_blast_radius(req.node_id)


class InvalidateNodeRequest(BaseModel):
    node_id: str
    reason: str


@router.post("/{investigation_id}/trust-graph/invalidate")
async def invalidate_node(
    investigation_id: str,
    req: InvalidateNodeRequest,
    inv_repo=Depends(get_investigation_repo),
    audit_repo=Depends(get_audit_repo),
):
    """Invalidate a node and cascade to dependents."""
    inv = await inv_repo.get(investigation_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    graph = get_trust_graph(investigation_id)
    invalidated = graph.invalidate(req.node_id, req.reason)

    await audit_repo.append(
        AuditEntry(
            entry_id=str(uuid.uuid4()),
            investigation_id=investigation_id,
            agent_id=None,
            action="TRUST_GRAPH_INVALIDATION",
            details=f"Node {req.node_id} invalidated: {req.reason}. Cascade: {invalidated}",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    )

    return {
        "invalidated_nodes": invalidated,
        "total": len(invalidated),
        "graph": graph.to_dict(),
    }
