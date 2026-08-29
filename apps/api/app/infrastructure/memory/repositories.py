"""In-memory repository implementations for local development."""

from typing import Dict, List, Optional

from aegis.schemas.contracts import (
    Investigation,
    Document,
    Finding,
    Remediation,
    RegulatoryChange,
)
from apps.api.app.domain.repositories import AuditEntry


class MemoryInvestigationRepository:
    def __init__(self) -> None:
        self._store: Dict[str, Investigation] = {}

    async def save(self, investigation: Investigation) -> None:
        self._store[investigation.id] = investigation

    async def get(self, investigation_id: str) -> Optional[Investigation]:
        return self._store.get(investigation_id)

    async def list_all(self) -> List[Investigation]:
        return list(self._store.values())

    async def delete(self, investigation_id: str) -> None:
        self._store.pop(investigation_id, None)


class MemoryDocumentRepository:
    def __init__(self) -> None:
        self._store: Dict[str, Document] = {}

    async def save(self, document: Document) -> None:
        self._store[document.id] = document

    async def get(self, document_id: str) -> Optional[Document]:
        return self._store.get(document_id)

    async def list_all(self) -> List[Document]:
        return list(self._store.values())


class MemoryFindingRepository:
    def __init__(self) -> None:
        self._store: Dict[str, Finding] = {}

    async def save(self, finding: Finding) -> None:
        self._store[finding.id] = finding

    async def get(self, finding_id: str) -> Optional[Finding]:
        return self._store.get(finding_id)

    async def list_by_investigation(self, investigation_id: str) -> List[Finding]:
        return [f for f in self._store.values() if f.investigation_id == investigation_id]


class MemoryRemediationRepository:
    def __init__(self) -> None:
        self._store: Dict[str, Remediation] = {}

    async def save(self, remediation: Remediation) -> None:
        self._store[remediation.id] = remediation

    async def get(self, remediation_id: str) -> Optional[Remediation]:
        return self._store.get(remediation_id)

    async def list_by_finding(self, finding_id: str) -> List[Remediation]:
        return [r for r in self._store.values() if r.finding_id == finding_id]


class MemoryRegulatoryChangeRepository:
    def __init__(self) -> None:
        self._store: Dict[str, RegulatoryChange] = {}

    async def save(self, change: RegulatoryChange) -> None:
        self._store[change.id] = change

    async def get(self, change_id: str) -> Optional[RegulatoryChange]:
        return self._store.get(change_id)

    async def list_all(self) -> List[RegulatoryChange]:
        return list(self._store.values())


class MemoryAuditRepository:
    def __init__(self) -> None:
        self._store: List[AuditEntry] = []

    async def append(self, entry: AuditEntry) -> None:
        self._store.append(entry)

    async def list_by_investigation(self, investigation_id: str) -> List[AuditEntry]:
        return [e for e in self._store if e.investigation_id == investigation_id]
