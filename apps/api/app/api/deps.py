"""Dependency injection — provides repository instances to route handlers."""

from apps.api.app.infrastructure.memory.repositories import (
    MemoryInvestigationRepository,
    MemoryDocumentRepository,
    MemoryFindingRepository,
    MemoryRemediationRepository,
    MemoryRegulatoryChangeRepository,
    MemoryAuditRepository,
)
from aegis.registry.registry import AgentRegistry
from apps.api.app.domain.trust_graph.graph import TrustGraph

# Singletons — swappable for Firestore adapters later
_investigation_repo = MemoryInvestigationRepository()
_document_repo = MemoryDocumentRepository()
_finding_repo = MemoryFindingRepository()
_remediation_repo = MemoryRemediationRepository()
_regulatory_change_repo = MemoryRegulatoryChangeRepository()
_audit_repo = MemoryAuditRepository()
_agent_registry: AgentRegistry | None = None
_trust_graphs: dict[str, TrustGraph] = {}  # investigation_id -> TrustGraph


def set_agent_registry(registry: AgentRegistry) -> None:
    global _agent_registry
    _agent_registry = registry


def get_investigation_repo() -> MemoryInvestigationRepository:
    return _investigation_repo


def get_document_repo() -> MemoryDocumentRepository:
    return _document_repo


def get_finding_repo() -> MemoryFindingRepository:
    return _finding_repo


def get_remediation_repo() -> MemoryRemediationRepository:
    return _remediation_repo


def get_regulatory_change_repo() -> MemoryRegulatoryChangeRepository:
    return _regulatory_change_repo


def get_audit_repo() -> MemoryAuditRepository:
    return _audit_repo


def get_agent_registry() -> AgentRegistry:
    if _agent_registry is None:
        raise RuntimeError("AgentRegistry not initialized. Call set_agent_registry first.")
    return _agent_registry


def get_trust_graph(investigation_id: str) -> TrustGraph:
    if investigation_id not in _trust_graphs:
        _trust_graphs[investigation_id] = TrustGraph()
    return _trust_graphs[investigation_id]


def get_all_trust_graphs() -> dict[str, TrustGraph]:
    return _trust_graphs
