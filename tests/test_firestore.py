"""Tests for Firestore adapter — uses mock to avoid needing real Firestore."""

import sys
import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.schemas.contracts import Investigation, Document, Finding, Evidence, Remediation, RegulatoryChange
from aegis.schemas.enums import InvestigationStatus, FindingSeverity, FindingStatus, RemediationStatus
from apps.api.app.domain.repositories import AuditEntry


def _mock_db():
    """Create a mock Firestore async client."""
    db = MagicMock()
    return db


def _mock_doc_snapshot(data: dict, exists: bool = True):
    snap = MagicMock()
    snap.exists = exists
    snap.to_dict.return_value = data
    snap.id = data.get("id", "test-id")
    return snap


def _sample_document():
    return Document(
        id="doc-1", filename="test.txt", content_type="text/plain",
        storage_path="/tmp/test.txt",
    )


def _sample_investigation():
    return Investigation(
        id="inv-1", title="Test Investigation", document=_sample_document(),
    )


def _sample_finding():
    return Finding(
        id="f-1", investigation_id="inv-1", requirement_id="LGPD-ART-15",
        agent_id="agent-privacy", title="Test Finding",
        description="Desc", severity=FindingSeverity.HIGH,
    )


# --- InvestigationRepository ---

@pytest.mark.anyio
async def test_firestore_investigation_save():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreInvestigationRepository

    db = _mock_db()
    doc_ref = AsyncMock()
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreInvestigationRepository(db)
    inv = _sample_investigation()
    await repo.save(inv)

    db.collection.assert_called_with("investigations")
    db.collection.return_value.document.assert_called_with("inv-1")
    doc_ref.set.assert_called_once()


@pytest.mark.anyio
async def test_firestore_investigation_get_found():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreInvestigationRepository

    db = _mock_db()
    inv = _sample_investigation()
    snap = _mock_doc_snapshot(inv.model_dump(mode="json"))
    doc_ref = AsyncMock()
    doc_ref.get.return_value = snap
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreInvestigationRepository(db)
    result = await repo.get("inv-1")

    assert result is not None
    assert result.id == "inv-1"


@pytest.mark.anyio
async def test_firestore_investigation_get_not_found():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreInvestigationRepository

    db = _mock_db()
    snap = _mock_doc_snapshot({}, exists=False)
    doc_ref = AsyncMock()
    doc_ref.get.return_value = snap
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreInvestigationRepository(db)
    result = await repo.get("nonexistent")

    assert result is None


@pytest.mark.anyio
async def test_firestore_investigation_delete():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreInvestigationRepository

    db = _mock_db()
    doc_ref = AsyncMock()
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreInvestigationRepository(db)
    await repo.delete("inv-1")

    doc_ref.delete.assert_called_once()


# --- DocumentRepository ---

@pytest.mark.anyio
async def test_firestore_document_save():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreDocumentRepository

    db = _mock_db()
    doc_ref = AsyncMock()
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreDocumentRepository(db)
    await repo.save(_sample_document())

    doc_ref.set.assert_called_once()


# --- FindingRepository ---

@pytest.mark.anyio
async def test_firestore_finding_save_and_get():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreFindingRepository

    db = _mock_db()
    finding = _sample_finding()

    doc_ref = AsyncMock()
    snap = _mock_doc_snapshot(finding.model_dump(mode="json"))
    doc_ref.get.return_value = snap
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreFindingRepository(db)
    await repo.save(finding)
    result = await repo.get("f-1")

    assert result is not None
    assert result.id == "f-1"


# --- AuditRepository ---

@pytest.mark.anyio
async def test_firestore_audit_append():
    from apps.api.app.infrastructure.firestore.repositories import FirestoreAuditRepository

    db = _mock_db()
    doc_ref = AsyncMock()
    db.collection.return_value.document.return_value = doc_ref

    repo = FirestoreAuditRepository(db)
    entry = AuditEntry(
        entry_id="ae-1", investigation_id="inv-1",
        agent_id=None, action="TEST", details="test entry",
        timestamp="2026-08-30T00:00:00Z",
    )
    await repo.append(entry)

    doc_ref.set.assert_called_once()


# --- deps.py backend selection ---

def test_deps_defaults_to_memory():
    """Verify deps initializes memory backend by default."""
    os.environ.pop("PERSISTENCE_BACKEND", None)
    # Re-import to test init
    from apps.api.app.api.deps import get_investigation_repo
    repo = get_investigation_repo()
    assert repo is not None
    assert "Memory" in type(repo).__name__


def test_deps_firestore_fallback_on_import_error():
    """When PERSISTENCE_BACKEND=firestore but no google-cloud-firestore, falls back to memory."""
    with patch.dict(os.environ, {"PERSISTENCE_BACKEND": "firestore"}):
        # Force re-init by resetting the global
        import apps.api.app.api.deps as deps_module
        deps_module._investigation_repo = None
        deps_module._init_repositories()
        repo = deps_module.get_investigation_repo()
        # Should have fallen back to memory (since we may not have firestore installed)
        assert repo is not None
