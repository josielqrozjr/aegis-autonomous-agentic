"""E2E integration tests — full demo scenario."""

import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport

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


DEMO_DOCUMENT = (
    "Política de Retenção de Dados — Multi-jurisdição BR+EU\n\n"
    "Esta política define os prazos de retenção de dados pessoais conforme LGPD e GDPR.\n"
    "Dados pessoais devem ser retidos por no máximo 10 anos conforme regulamentação vigente.\n"
    "A empresa must garantir o direito de eliminação conforme Art. 15-16 da LGPD.\n"
    "Under GDPR Art. 5(1)(e), data shall not be kept longer than necessary.\n"
    "ISO 27001 A.8.10 requires proper information retention management.\n"
)


@pytest.mark.anyio
async def test_full_demo_scenario(client):
    """Test the complete demo scenario end-to-end."""

    # 1. Upload document
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("politica-retencao-dados.txt", DEMO_DOCUMENT.encode(), "text/plain")},
    )
    assert r.status_code == 201
    doc_id = r.json()["id"]

    # 2. Create investigation
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Data Retention Policy Analysis", "document_id": doc_id},
    )
    assert r.status_code == 201
    inv_id = r.json()["id"]
    assert r.json()["status"] == "queued"

    # 3. Run full pipeline
    r = await client.post(f"/api/v1/investigations/{inv_id}/run")
    assert r.status_code == 200
    data = r.json()
    assert data["final_status"] == "completed"
    assert len(data["steps_executed"]) == 6

    # 4. Verify investigation has findings
    r = await client.get(f"/api/v1/investigations/{inv_id}")
    assert r.status_code == 200
    inv = r.json()
    assert len(inv["findings"]) >= 2  # at least privacy + security
    assert len(inv["reviews"]) >= 2
    assert len(inv["remediations"]) >= 1

    # 5. Verify audit trail
    r = await client.get(f"/api/v1/investigations/{inv_id}/audit")
    assert r.status_code == 200
    assert r.json()["count"] >= 10  # many audit entries from pipeline

    # 6. Check trust graph
    r = await client.get(f"/api/v1/investigations/{inv_id}/trust-graph")
    assert r.status_code == 200
    graph = r.json()["graph"]
    assert graph["summary"]["total_nodes"] >= 3  # doc + evidence + findings

    # 7. Simulate regulatory change
    r = await client.post(
        "/api/v1/regulatory-changes",
        json={
            "framework": "GDPR",
            "version": "2.0",
            "change_description": "GDPR Art. 5(1)(e) — retention max reduced from 10 to 5 years",
            "affected_requirements": ["GDPR-ART-5-1-E"],
        },
    )
    assert r.status_code == 201
    change = r.json()
    # Should have found affected investigations
    assert "impact_analysis" in change

    # 8. Verify investigation was reopened
    r = await client.get(f"/api/v1/investigations/{inv_id}")
    inv_after = r.json()
    # If there was a GDPR finding, the investigation should be reopened
    gdpr_findings = [f for f in inv_after["findings"] if f["requirement_id"] == "GDPR-ART-5-1-E"]
    if gdpr_findings:
        assert inv_after["status"] == "reopened"


@pytest.mark.anyio
async def test_pipeline_produces_evidence_with_hash(client):
    """Verify findings have evidence with content_hash."""
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("test.txt", b"LGPD GDPR retention policy must comply", "text/plain")},
    )
    doc_id = r.json()["id"]

    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Hash Test", "document_id": doc_id},
    )
    inv_id = r.json()["id"]

    r = await client.post(f"/api/v1/investigations/{inv_id}/run")
    assert r.status_code == 200

    r = await client.get(f"/api/v1/investigations/{inv_id}")
    inv = r.json()
    for finding in inv["findings"]:
        for ev in finding["evidences"]:
            assert ev["content_hash"] is not None
            assert len(ev["content_hash"]) == 64  # SHA-256


@pytest.mark.anyio
async def test_trust_graph_invalidation_endpoint(client):
    """Test trust graph invalidation via API."""
    # Create and run investigation
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("inv.txt", b"LGPD GDPR policy retention must", "text/plain")},
    )
    doc_id = r.json()["id"]
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Graph Test", "document_id": doc_id},
    )
    inv_id = r.json()["id"]
    await client.post(f"/api/v1/investigations/{inv_id}/run")

    # Get trust graph
    r = await client.get(f"/api/v1/investigations/{inv_id}/trust-graph")
    graph = r.json()["graph"]
    assert graph["summary"]["total_nodes"] >= 1

    # Get a node to invalidate
    if graph["nodes"]:
        node_id = graph["nodes"][0]["id"]

        # Blast radius (non-destructive)
        r = await client.post(
            f"/api/v1/investigations/{inv_id}/trust-graph/blast-radius",
            json={"node_id": node_id},
        )
        assert r.status_code == 200

        # Invalidate
        r = await client.post(
            f"/api/v1/investigations/{inv_id}/trust-graph/invalidate",
            json={"node_id": node_id, "reason": "Test invalidation"},
        )
        assert r.status_code == 200
        assert len(r.json()["invalidated_nodes"]) >= 1


@pytest.mark.anyio
async def test_remediation_crud(client):
    """Test remediation endpoints."""
    # Setup: create doc + investigation + run to get findings
    r = await client.post(
        "/api/v1/documents",
        files={"file": ("rem.txt", b"LGPD retention policy must comply", "text/plain")},
    )
    doc_id = r.json()["id"]
    r = await client.post(
        "/api/v1/investigations",
        json={"title": "Rem Test", "document_id": doc_id},
    )
    inv_id = r.json()["id"]
    await client.post(f"/api/v1/investigations/{inv_id}/run")

    # Get a finding ID from the investigation
    r = await client.get(f"/api/v1/investigations/{inv_id}")
    findings = r.json()["findings"]
    assert len(findings) >= 1
    finding_id = findings[0]["id"]

    # The pipeline already creates remediations, but let's also test manual creation
    # Store finding in the finding_repo
    from apps.api.app.api.deps import get_finding_repo
    from aegis.schemas.contracts import Finding
    finding_repo = get_finding_repo()
    finding_obj = Finding(**findings[0])
    await finding_repo.save(finding_obj)

    # Create remediation
    r = await client.post(
        "/api/v1/remediations",
        json={
            "finding_id": finding_id,
            "recommendation": "Update retention period to 5 years",
            "action_item": "Modify policy section 3.2",
        },
    )
    assert r.status_code == 201
    rem_id = r.json()["id"]

    # Update status
    r = await client.patch(
        f"/api/v1/remediations/{rem_id}",
        json={"status": "in_progress"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"

    # Get
    r = await client.get(f"/api/v1/remediations/{rem_id}")
    assert r.status_code == 200

    # List
    r = await client.get("/api/v1/remediations")
    assert r.status_code == 200
    assert r.json()["count"] >= 1


@pytest.mark.anyio
async def test_correlation_id_header(client):
    """Verify tracing middleware adds correlation ID."""
    r = await client.get("/health")
    assert "x-correlation-id" in r.headers
    assert "x-response-time-ms" in r.headers


@pytest.mark.anyio
async def test_correlation_id_passthrough(client):
    """Verify tracing middleware respects provided correlation ID."""
    r = await client.get("/health", headers={"X-Correlation-ID": "test-123"})
    assert r.headers["x-correlation-id"] == "test-123"
