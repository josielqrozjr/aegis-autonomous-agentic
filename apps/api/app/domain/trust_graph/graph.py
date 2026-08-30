"""Trust & Compliance Graph — directed graph with invalidation cascade.

Each node tracks dependencies. When a node is invalidated (e.g., regulation
changes), all dependent nodes are recursively invalidated and the blast
radius is calculated.
"""

import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

from aegis.schemas.contracts import TrustNode
from aegis.schemas.enums import TrustNodeType


class TrustGraph:
    """Directed graph of TrustNodes with cascade invalidation."""

    def __init__(self) -> None:
        self._nodes: Dict[str, TrustNode] = {}

    # --- CRUD ---

    def add_node(self, node: TrustNode) -> None:
        self._nodes[node.node_id] = node

    def get_node(self, node_id: str) -> Optional[TrustNode]:
        return self._nodes.get(node_id)

    def list_nodes(self) -> List[TrustNode]:
        return list(self._nodes.values())

    def remove_node(self, node_id: str) -> None:
        self._nodes.pop(node_id, None)

    # --- Query ---

    def get_dependents(self, node_id: str) -> List[TrustNode]:
        """Find all nodes that directly depend on the given node."""
        return [n for n in self._nodes.values() if node_id in n.dependencies]

    def get_by_type(self, node_type: TrustNodeType) -> List[TrustNode]:
        return [n for n in self._nodes.values() if n.node_type == node_type]

    def get_valid_nodes(self) -> List[TrustNode]:
        return [n for n in self._nodes.values() if n.valid]

    def get_invalid_nodes(self) -> List[TrustNode]:
        return [n for n in self._nodes.values() if not n.valid]

    # --- Invalidation cascade ---

    def invalidate(self, node_id: str, reason: str) -> List[str]:
        """Invalidate a node and cascade to all dependents.

        Returns list of all invalidated node IDs (blast radius).
        """
        node = self._nodes.get(node_id)
        if node is None:
            return []

        invalidated: List[str] = []
        self._cascade_invalidate(node_id, reason, invalidated, set())
        return invalidated

    def _cascade_invalidate(
        self, node_id: str, reason: str, result: List[str], visited: Set[str]
    ) -> None:
        if node_id in visited:
            return
        visited.add(node_id)

        node = self._nodes.get(node_id)
        if node is None:
            return

        if node.valid:
            node.valid = False
            node.invalidated_at = datetime.now(timezone.utc)
            node.invalidated_reason = reason
            result.append(node_id)

        # Cascade to dependents
        for dependent in self.get_dependents(node_id):
            self._cascade_invalidate(dependent.node_id, reason, result, visited)

    def revalidate(self, node_id: str) -> None:
        """Mark a node as valid again (after re-evaluation)."""
        node = self._nodes.get(node_id)
        if node is not None:
            node.valid = True
            node.invalidated_at = None
            node.invalidated_reason = None

    # --- Blast radius ---

    def calculate_blast_radius(self, node_id: str) -> Dict[str, Any]:
        """Calculate what would be affected if this node is invalidated.

        Non-destructive — does not actually invalidate anything.
        """
        affected: List[str] = []
        self._collect_dependents(node_id, affected, set())
        affected_nodes = [self._nodes[nid] for nid in affected if nid in self._nodes]

        by_type: Dict[str, int] = {}
        for n in affected_nodes:
            by_type[n.node_type.value] = by_type.get(n.node_type.value, 0) + 1

        return {
            "source_node": node_id,
            "total_affected": len(affected),
            "affected_node_ids": affected,
            "by_type": by_type,
        }

    def _collect_dependents(self, node_id: str, result: List[str], visited: Set[str]) -> None:
        if node_id in visited:
            return
        visited.add(node_id)

        for dependent in self.get_dependents(node_id):
            if dependent.node_id not in visited:
                result.append(dependent.node_id)
            self._collect_dependents(dependent.node_id, result, visited)

    # --- Serialization ---

    def to_dict(self) -> Dict[str, Any]:
        """Serialize the full graph for API responses."""
        nodes = []
        edges = []
        for node in self._nodes.values():
            nodes.append({
                "id": node.node_id,
                "type": node.node_type.value,
                "source": node.source,
                "valid": node.valid,
                "confidence": node.confidence,
                "jurisdiction": node.jurisdiction,
                "content_hash": node.content_hash,
                "invalidated_at": node.invalidated_at.isoformat() if node.invalidated_at else None,
                "invalidated_reason": node.invalidated_reason,
            })
            for dep_id in node.dependencies:
                edges.append({"from": dep_id, "to": node.node_id})

        return {
            "nodes": nodes,
            "edges": edges,
            "summary": {
                "total_nodes": len(nodes),
                "valid": sum(1 for n in nodes if n["valid"]),
                "invalidated": sum(1 for n in nodes if not n["valid"]),
            },
        }

    # --- Utility ---

    @staticmethod
    def compute_hash(content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()
