"""Domain repository protocols (Ports) — hexagonal architecture."""

from typing import List, Optional, Protocol

from aegis.schemas.contracts import (
    Investigation,
    Document,
    Finding,
    Remediation,
    RegulatoryChange,
)


class InvestigationRepository(Protocol):
    async def save(self, investigation: Investigation) -> None: ...
    async def get(self, investigation_id: str) -> Optional[Investigation]: ...
    async def list_all(self) -> List[Investigation]: ...
    async def delete(self, investigation_id: str) -> None: ...


class DocumentRepository(Protocol):
    async def save(self, document: Document) -> None: ...
    async def get(self, document_id: str) -> Optional[Document]: ...
    async def list_all(self) -> List[Document]: ...


class FindingRepository(Protocol):
    async def save(self, finding: Finding) -> None: ...
    async def get(self, finding_id: str) -> Optional[Finding]: ...
    async def list_by_investigation(self, investigation_id: str) -> List[Finding]: ...


class RemediationRepository(Protocol):
    async def save(self, remediation: Remediation) -> None: ...
    async def get(self, remediation_id: str) -> Optional[Remediation]: ...
    async def list_by_finding(self, finding_id: str) -> List[Remediation]: ...


class RegulatoryChangeRepository(Protocol):
    async def save(self, change: RegulatoryChange) -> None: ...
    async def get(self, change_id: str) -> Optional[RegulatoryChange]: ...
    async def list_all(self) -> List[RegulatoryChange]: ...


class AuditEntry:
    """Immutable audit log entry."""

    def __init__(
        self,
        entry_id: str,
        investigation_id: str,
        agent_id: Optional[str],
        action: str,
        details: str,
        timestamp: str,
    ):
        self.entry_id = entry_id
        self.investigation_id = investigation_id
        self.agent_id = agent_id
        self.action = action
        self.details = details
        self.timestamp = timestamp

    def to_dict(self) -> dict:
        return {
            "entry_id": self.entry_id,
            "investigation_id": self.investigation_id,
            "agent_id": self.agent_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp,
        }


class AuditRepository(Protocol):
    async def append(self, entry: AuditEntry) -> None: ...
    async def list_by_investigation(self, investigation_id: str) -> List[AuditEntry]: ...
