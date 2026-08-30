"""Dependency injection — provides repository instances to route handlers.

Set PERSISTENCE_BACKEND=firestore to use Firestore (requires google-cloud-firestore).
Defaults to in-memory for local development.
"""

import logging
import os

from aegis.registry.registry import AgentRegistry
from apps.api.app.domain.trust_graph.graph import TrustGraph

logger = logging.getLogger("aegis.deps")

_investigation_repo = None
_document_repo = None
_finding_repo = None
_remediation_repo = None
_regulatory_change_repo = None
_audit_repo = None
_agent_registry: AgentRegistry | None = None
_trust_graphs: dict[str, TrustGraph] = {}


def _init_repositories() -> None:
    """Initialize repositories based on PERSISTENCE_BACKEND env var."""
    global _investigation_repo, _document_repo, _finding_repo
    global _remediation_repo, _regulatory_change_repo, _audit_repo

    if _investigation_repo is not None:
        return  # already initialized

    backend = os.environ.get("PERSISTENCE_BACKEND", "memory").lower()

    if backend == "firestore":
        try:
            from google.cloud.firestore_v1 import AsyncClient as FirestoreAsyncClient
            from apps.api.app.infrastructure.firestore.repositories import (
                FirestoreInvestigationRepository,
                FirestoreDocumentRepository,
                FirestoreFindingRepository,
                FirestoreRemediationRepository,
                FirestoreRegulatoryChangeRepository,
                FirestoreAuditRepository,
            )

            project_id = os.environ.get("GCP_PROJECT_ID")
            database = os.environ.get("FIRESTORE_DATABASE", "(default)")
            db = FirestoreAsyncClient(project=project_id, database=database)

            _investigation_repo = FirestoreInvestigationRepository(db)
            _document_repo = FirestoreDocumentRepository(db)
            _finding_repo = FirestoreFindingRepository(db)
            _remediation_repo = FirestoreRemediationRepository(db)
            _regulatory_change_repo = FirestoreRegulatoryChangeRepository(db)
            _audit_repo = FirestoreAuditRepository(db)
            logger.info("Using Firestore persistence (project=%s, db=%s)", project_id, database)
            return
        except ImportError:
            logger.warning("google-cloud-firestore not installed, falling back to memory")
        except Exception as e:
            logger.warning("Firestore init failed (%s), falling back to memory", e)

    # Default: in-memory
    from apps.api.app.infrastructure.memory.repositories import (
        MemoryInvestigationRepository,
        MemoryDocumentRepository,
        MemoryFindingRepository,
        MemoryRemediationRepository,
        MemoryRegulatoryChangeRepository,
        MemoryAuditRepository,
    )
    _investigation_repo = MemoryInvestigationRepository()
    _document_repo = MemoryDocumentRepository()
    _finding_repo = MemoryFindingRepository()
    _remediation_repo = MemoryRemediationRepository()
    _regulatory_change_repo = MemoryRegulatoryChangeRepository()
    _audit_repo = MemoryAuditRepository()
    logger.info("Using in-memory persistence")


# Ensure repos are initialized on first import
_init_repositories()


def set_agent_registry(registry: AgentRegistry) -> None:
    global _agent_registry
    _agent_registry = registry


def get_investigation_repo():
    return _investigation_repo


def get_document_repo():
    return _document_repo


def get_finding_repo():
    return _finding_repo


def get_remediation_repo():
    return _remediation_repo


def get_regulatory_change_repo():
    return _regulatory_change_repo


def get_audit_repo():
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
