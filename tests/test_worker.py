"""Tests for worker handlers and pipeline execution."""

import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from apps.api.app.main import app
from aegis.registry.setup import init_default_registry
from apps.api.app.api.deps import set_agent_registry
from apps.api.app.infrastructure.memory.repositories import (
    MemoryInvestigationRepository,
    MemoryAuditRepository,
    MemoryRegulatoryChangeRepository,
)
from apps.worker.handlers.investigation_handler import InvestigationHandler
from apps.worker.handlers.regulatory_change_handler import RegulatoryChangeHandler
from apps.worker.main import AegisWorker
from aegis.schemas.contracts import (
    Investigation, Document, Finding, Evidence, RegulatoryChange,
)
from aegis.schemas.enums import InvestigationStatus, FindingSeverity, FindingStatus


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    registry = init_default_registry()
    set_agent_registry(registry)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


def _make_doc():
    return Document(
        id="doc-1", filename="policy.txt", content_type="text/plain",
        storage_path="/tmp/policy.txt",
    )


def _make_investigation(status=InvestigationStatus.QUEUED):
    return Investigation(id="inv-1", title="Test", document=_make_doc(), status=status)


# --- Investigation Handler ---

@pytest.mark.anyio
async def test_handler_runs_full_pipeline():
    inv_repo = MemoryInvestigationRepository()
    audit_repo = MemoryAuditRepository()
    inv = _make_investigation()
    await inv_repo.save(inv)

    handler = InvestigationHandler(inv_repo, audit_repo)
    result = await handler.handle("inv-1")

    assert result["final_status"] == "completed"
    assert len(result["steps_executed"]) == 6


@pytest.mark.anyio
async def test_handler_resumes_from_current_state():
    inv_repo = MemoryInvestigationRepository()
    audit_repo = MemoryAuditRepository()
    inv = _make_investigation(InvestigationStatus.ROUTING)
    await inv_repo.save(inv)

    handler = InvestigationHandler(inv_repo, audit_repo)
    result = await handler.handle("inv-1")

    assert result["final_status"] == "completed"
    assert "routing" not in result["steps_executed"]  # skipped already-passed stages


@pytest.mark.anyio
async def test_handler_not_found():
    inv_repo = MemoryInvestigationRepository()
    audit_repo = MemoryAuditRepository()
    handler = InvestigationHandler(inv_repo, audit_repo)
    result = await handler.handle("nonexistent")
    assert "error" in result


@pytest.mark.anyio
async def test_handler_idempotent_on_completed():
    inv_repo = MemoryInvestigationRepository()
    audit_repo = MemoryAuditRepository()
    inv = _make_investigation(InvestigationStatus.COMPLETED)
    await inv_repo.save(inv)

    handler = InvestigationHandler(inv_repo, audit_repo)
    result = await handler.handle("inv-1")

    assert result["final_status"] == "completed"
    assert len(result["steps_executed"]) == 0


# --- Regulatory Change Handler ---

@pytest.mark.anyio
async def test_reg_change_handler():
    inv_repo = MemoryInvestigationRepository()
    change_repo = MemoryRegulatoryChangeRepository()
    audit_repo = MemoryAuditRepository()

    change = RegulatoryChange(
        id="rc-1", framework="GDPR", version="2.0",
        change_description="Test change",
        affected_requirements=["GDPR-ART-5-1-E"],
    )
    await change_repo.save(change)

    handler = RegulatoryChangeHandler(inv_repo, change_repo, audit_repo)
    result = await handler.handle("rc-1")
    assert result["change_id"] == "rc-1"


@pytest.mark.anyio
async def test_reg_change_handler_not_found():
    inv_repo = MemoryInvestigationRepository()
    change_repo = MemoryRegulatoryChangeRepository()
    audit_repo = MemoryAuditRepository()

    handler = RegulatoryChangeHandler(inv_repo, change_repo, audit_repo)
    result = await handler.handle("nonexistent")
    assert "error" in result


# --- Worker ---

@pytest.mark.anyio
async def test_worker_process_investigation():
    inv_repo = MemoryInvestigationRepository()
    change_repo = MemoryRegulatoryChangeRepository()
    audit_repo = MemoryAuditRepository()
    inv = _make_investigation()
    await inv_repo.save(inv)

    worker = AegisWorker(inv_repo, change_repo, audit_repo)
    result = await worker.process_investigation("inv-1")
    assert result["final_status"] == "completed"


# --- API endpoint /run ---

@pytest.mark.anyio
async def test_run_endpoint(client):
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("p.txt", b"content", "text/plain")},
    )
    doc_id = r.json()["id"]
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Run Test", "document_id": doc_id},
    )
    inv_id = r.json()["id"]

    r = await client.post(f"/api/v1/investigations/{inv_id}/run")
    assert r.status_code == 200
    assert r.json()["final_status"] == "completed"


@pytest.mark.anyio
async def test_run_endpoint_not_found(client):
    r = await client.post("/api/v1/investigations/nonexistent/run")
    assert r.status_code == 404
