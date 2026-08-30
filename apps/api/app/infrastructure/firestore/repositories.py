"""Firestore repository implementations — real persistence adapter.

Uses google-cloud-firestore async client. Each entity maps to a collection.
Falls back gracefully if Firestore is unavailable.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from google.cloud.firestore_v1 import AsyncClient as FirestoreAsyncClient

from aegis.schemas.contracts import (
    Investigation,
    Document,
    Finding,
    Remediation,
    RegulatoryChange,
)
from apps.api.app.domain.repositories import AuditEntry

logger = logging.getLogger("aegis.firestore")


def _serialize(model) -> dict:
    """Convert Pydantic model to Firestore-safe dict."""
    data = model.model_dump(mode="json")
    return data


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class FirestoreInvestigationRepository:
    COLLECTION = "investigations"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def save(self, investigation: Investigation) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(investigation.id)
        await doc_ref.set(_serialize(investigation))

    async def get(self, investigation_id: str) -> Optional[Investigation]:
        doc_ref = self._db.collection(self.COLLECTION).document(investigation_id)
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        return Investigation(**doc.to_dict())

    async def list_all(self) -> List[Investigation]:
        docs = self._db.collection(self.COLLECTION).stream()
        results = []
        async for doc in docs:
            try:
                results.append(Investigation(**doc.to_dict()))
            except Exception as e:
                logger.warning("Skipping malformed investigation %s: %s", doc.id, e)
        return results

    async def delete(self, investigation_id: str) -> None:
        await self._db.collection(self.COLLECTION).document(investigation_id).delete()


class FirestoreDocumentRepository:
    COLLECTION = "documents"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def save(self, document: Document) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(document.id)
        await doc_ref.set(_serialize(document))

    async def get(self, document_id: str) -> Optional[Document]:
        doc_ref = self._db.collection(self.COLLECTION).document(document_id)
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        return Document(**doc.to_dict())

    async def list_all(self) -> List[Document]:
        docs = self._db.collection(self.COLLECTION).stream()
        results = []
        async for doc in docs:
            try:
                results.append(Document(**doc.to_dict()))
            except Exception as e:
                logger.warning("Skipping malformed document %s: %s", doc.id, e)
        return results


class FirestoreFindingRepository:
    COLLECTION = "findings"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def save(self, finding: Finding) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(finding.id)
        await doc_ref.set(_serialize(finding))

    async def get(self, finding_id: str) -> Optional[Finding]:
        doc_ref = self._db.collection(self.COLLECTION).document(finding_id)
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        return Finding(**doc.to_dict())

    async def list_by_investigation(self, investigation_id: str) -> List[Finding]:
        query = self._db.collection(self.COLLECTION).where("investigation_id", "==", investigation_id)
        results = []
        async for doc in query.stream():
            try:
                results.append(Finding(**doc.to_dict()))
            except Exception as e:
                logger.warning("Skipping malformed finding %s: %s", doc.id, e)
        return results


class FirestoreRemediationRepository:
    COLLECTION = "remediations"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def save(self, remediation: Remediation) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(remediation.id)
        await doc_ref.set(_serialize(remediation))

    async def get(self, remediation_id: str) -> Optional[Remediation]:
        doc_ref = self._db.collection(self.COLLECTION).document(remediation_id)
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        return Remediation(**doc.to_dict())

    async def list_by_finding(self, finding_id: str) -> List[Remediation]:
        query = self._db.collection(self.COLLECTION).where("finding_id", "==", finding_id)
        results = []
        async for doc in query.stream():
            try:
                results.append(Remediation(**doc.to_dict()))
            except Exception as e:
                logger.warning("Skipping malformed remediation %s: %s", doc.id, e)
        return results


class FirestoreRegulatoryChangeRepository:
    COLLECTION = "regulatory_changes"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def save(self, change: RegulatoryChange) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(change.id)
        await doc_ref.set(_serialize(change))

    async def get(self, change_id: str) -> Optional[RegulatoryChange]:
        doc_ref = self._db.collection(self.COLLECTION).document(change_id)
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        return RegulatoryChange(**doc.to_dict())

    async def list_all(self) -> List[RegulatoryChange]:
        docs = self._db.collection(self.COLLECTION).stream()
        results = []
        async for doc in docs:
            try:
                results.append(RegulatoryChange(**doc.to_dict()))
            except Exception as e:
                logger.warning("Skipping malformed regulatory change %s: %s", doc.id, e)
        return results


class FirestoreAuditRepository:
    COLLECTION = "audit_entries"

    def __init__(self, db: FirestoreAsyncClient):
        self._db = db

    async def append(self, entry: AuditEntry) -> None:
        doc_ref = self._db.collection(self.COLLECTION).document(entry.entry_id)
        await doc_ref.set(entry.to_dict())

    async def list_by_investigation(self, investigation_id: str) -> List[AuditEntry]:
        query = self._db.collection(self.COLLECTION).where("investigation_id", "==", investigation_id)
        results = []
        async for doc in query.stream():
            try:
                data = doc.to_dict()
                results.append(AuditEntry(**data))
            except Exception as e:
                logger.warning("Skipping malformed audit entry %s: %s", doc.id, e)
        return results
