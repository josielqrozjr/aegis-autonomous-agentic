"""Tests for AEGIS API — Fase 1 routes."""

import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport

# Ensure src is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from apps.api.app.main import app
from aegis.registry.setup import init_default_registry
from apps.api.app.api.deps import set_agent_registry


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


@pytest.mark.anyio
async def test_root(client: AsyncClient):
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "AEGIS"


@pytest.mark.anyio
async def test_health(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["agents"]["total"] >= 1


@pytest.mark.anyio
async def test_agents(client: AsyncClient):
    r = await client.get("/agents")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 1
    agent_ids = [a["agent_id"] for a in data["agents"]]
    assert "agent-planner" in agent_ids


@pytest.mark.anyio
async def test_conformance(client: AsyncClient):
    r = await client.get("/conformance")
    assert r.status_code == 200
    data = r.json()
    assert "stack" in data
    assert len(data["stack"]["models"]) >= 3


@pytest.mark.anyio
async def test_document_upload_and_get(client: AsyncClient):
    # Upload
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("test.txt", b"Test document content", "text/plain")},
    )
    assert r.status_code == 201
    doc_id = r.json()["id"]

    # Get
    r = await client.get(f"/api/v1/documents/{doc_id}")
    assert r.status_code == 200
    assert r.json()["filename"] == "test.txt"

    # List
    r = await client.get("/api/v1/documents")
    assert r.status_code == 200
    assert r.json()["count"] >= 1


@pytest.mark.anyio
async def test_investigation_crud(client: AsyncClient):
    # First upload a document
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("policy.txt", b"Data retention policy", "text/plain")},
    )
    doc_id = r.json()["id"]

    # Create investigation
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Test Investigation", "document_id": doc_id},
    )
    assert r.status_code == 201
    inv_id = r.json()["id"]
    assert r.json()["status"] == "queued"

    # Get investigation
    r = await client.get(f"/api/v1/investigations/{inv_id}")
    assert r.status_code == 200
    assert r.json()["title"] == "Test Investigation"

    # List investigations
    r = await client.get("/api/v1/investigations")
    assert r.status_code == 200
    assert r.json()["count"] >= 1


@pytest.mark.anyio
async def test_investigation_not_found(client: AsyncClient):
    r = await client.get("/api/v1/investigations/nonexistent")
    assert r.status_code == 404


@pytest.mark.anyio
async def test_investigation_bad_document(client: AsyncClient):
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Bad", "document_id": "nonexistent"},
    )
    assert r.status_code == 404


@pytest.mark.anyio
async def test_audit_trail(client: AsyncClient):
    # Upload doc + create investigation
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("audit.txt", b"audit test", "text/plain")},
    )
    doc_id = r.json()["id"]
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Audit Test", "document_id": doc_id},
    )
    inv_id = r.json()["id"]

    # Check audit
    r = await client.get(f"/api/v1/investigations/{inv_id}/audit")
    assert r.status_code == 200
    assert r.json()["count"] >= 1
    assert r.json()["entries"][0]["action"] == "INVESTIGATION_CREATED"


@pytest.mark.anyio
async def test_regulatory_change(client: AsyncClient):
    r = await client.post(
        "/api/v1/regulatory-changes",
        json={
            "framework": "GDPR",
            "version": "2.0",
            "change_description": "Retention period reduced from 10 to 5 years",
            "affected_requirements": ["GDPR-ART-5-1-E"],
        },
    )
    assert r.status_code == 201
    assert r.json()["framework"] == "GDPR"

    # List
    r = await client.get("/api/v1/regulatory-changes")
    assert r.status_code == 200
    assert r.json()["count"] >= 1


@pytest.mark.anyio
async def test_document_not_found(client: AsyncClient):
    r = await client.get("/api/v1/documents/nonexistent")
    assert r.status_code == 404


@pytest.mark.anyio
async def test_finding_not_found(client: AsyncClient):
    r = await client.get("/api/v1/findings/nonexistent")
    assert r.status_code == 404
