"""Tests for failure handler and state transition endpoints."""

import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from apps.api.app.main import app
from aegis.registry.setup import init_default_registry
from apps.api.app.api.deps import set_agent_registry
from aegis.schemas.contracts import Investigation, Document, Task, InvestigationPlan, Finding
from aegis.schemas.enums import TaskStatus, InvestigationStatus, FindingSeverity
from aegis.registry.registry import AgentRegistry
from apps.api.app.domain.investigation.failure_handler import FailureHandler


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


@pytest.fixture
def sample_investigation():
    doc = Document(
        id="doc-1", filename="test.txt", content_type="text/plain",
        storage_path="/tmp/test.txt",
    )
    task = Task(
        id="task-1", investigation_id="inv-1", agent_id="agent-privacy-specialist",
        agent_role="privacy_specialist", description="Analyze LGPD",
    )
    finding = Finding(
        id="f-1", investigation_id="inv-1", requirement_id="LGPD-ART-15",
        agent_id="agent-privacy-specialist", title="Test Finding",
        description="Test", severity=FindingSeverity.HIGH,
    )
    plan = InvestigationPlan(
        investigation_id="inv-1", summary="Test plan",
        assigned_agent_ids=["agent-privacy-specialist"], tasks=[task],
    )
    return Investigation(
        id="inv-1", title="Test", document=doc, plan=plan, findings=[finding],
    )


@pytest.fixture
def registry():
    return init_default_registry()


# --- Failure Handler ---

@pytest.mark.anyio
async def test_failure_handler_retry(sample_investigation, registry):
    handler = FailureHandler(registry)
    task = sample_investigation.plan.tasks[0]
    result = await handler.handle_task_failure(sample_investigation, task, "Timeout")
    assert result["retried"]
    assert task.status == TaskStatus.QUEUED


@pytest.mark.anyio
async def test_failure_handler_exhaust_retries(sample_investigation, registry):
    handler = FailureHandler(registry)
    task = sample_investigation.plan.tasks[0]
    task.result = {"retry_count": 2}  # max retries exhausted

    result = await handler.handle_task_failure(sample_investigation, task, "Fatal")
    # Either substituted or degraded
    assert result["substituted"] or result["degraded"]


@pytest.mark.anyio
async def test_failure_handler_degrade(sample_investigation):
    # Use empty registry so no substitute is found
    handler = FailureHandler(AgentRegistry())
    task = sample_investigation.plan.tasks[0]
    task.result = {"retry_count": 2}

    result = await handler.handle_task_failure(sample_investigation, task, "Fatal")
    assert result["degraded"]
    assert task.status == TaskStatus.FAILED


# --- Transition endpoints ---

async def _create_investigation(client):
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("p.txt", b"content", "text/plain")},
    )
    doc_id = r.json()["id"]
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Trans Test", "document_id": doc_id},
    )
    return r.json()["id"]


@pytest.mark.anyio
async def test_valid_transition(client):
    inv_id = await _create_investigation(client)
    r = await client.post(
        f"/api/v1/investigations/{inv_id}/transition",
        json={"target_status": "understanding"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "understanding"


@pytest.mark.anyio
async def test_invalid_transition(client):
    inv_id = await _create_investigation(client)
    r = await client.post(
        f"/api/v1/investigations/{inv_id}/transition",
        json={"target_status": "completed"},
    )
    assert r.status_code == 409


@pytest.mark.anyio
async def test_allowed_transitions_endpoint(client):
    inv_id = await _create_investigation(client)
    r = await client.get(f"/api/v1/investigations/{inv_id}/allowed-transitions")
    assert r.status_code == 200
    assert "understanding" in r.json()["allowed_transitions"]


@pytest.mark.anyio
async def test_full_pipeline_transitions(client):
    inv_id = await _create_investigation(client)
    pipeline = ["understanding", "planning", "routing", "analyzing", "reviewing", "completed"]
    for status in pipeline:
        r = await client.post(
            f"/api/v1/investigations/{inv_id}/transition",
            json={"target_status": status},
        )
        assert r.status_code == 200, f"Failed at {status}: {r.json()}"
        assert r.json()["status"] == status


@pytest.mark.anyio
async def test_reopen_after_completed(client):
    inv_id = await _create_investigation(client)
    pipeline = ["understanding", "planning", "routing", "analyzing", "completed", "reopened"]
    for status in pipeline:
        r = await client.post(
            f"/api/v1/investigations/{inv_id}/transition",
            json={"target_status": status},
        )
        assert r.status_code == 200
    assert r.json()["status"] == "reopened"
