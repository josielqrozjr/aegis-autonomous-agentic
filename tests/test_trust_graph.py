"""Tests for Trust Graph — invalidation cascade, blast radius, serialization."""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.schemas.contracts import TrustNode
from aegis.schemas.enums import TrustNodeType
from apps.api.app.domain.trust_graph.graph import TrustGraph


@pytest.fixture
def graph():
    g = TrustGraph()
    g.add_node(TrustNode(node_id="doc-1", node_type=TrustNodeType.DOCUMENT, source="policy.pdf"))
    g.add_node(TrustNode(node_id="ev-1", node_type=TrustNodeType.EVIDENCE, source="policy.pdf p.1", dependencies=["doc-1"]))
    g.add_node(TrustNode(node_id="ev-2", node_type=TrustNodeType.EVIDENCE, source="policy.pdf p.3", dependencies=["doc-1"]))
    g.add_node(TrustNode(node_id="f-1", node_type=TrustNodeType.FINDING, source="agent-privacy", dependencies=["ev-1"]))
    g.add_node(TrustNode(node_id="f-2", node_type=TrustNodeType.FINDING, source="agent-security", dependencies=["ev-1", "ev-2"]))
    g.add_node(TrustNode(node_id="req-1", node_type=TrustNodeType.REQUIREMENT, source="GDPR"))
    return g


def test_add_and_get_node(graph):
    node = graph.get_node("doc-1")
    assert node is not None
    assert node.node_type == TrustNodeType.DOCUMENT


def test_list_nodes(graph):
    assert len(graph.list_nodes()) == 6


def test_get_dependents(graph):
    deps = graph.get_dependents("doc-1")
    dep_ids = [d.node_id for d in deps]
    assert "ev-1" in dep_ids
    assert "ev-2" in dep_ids
    assert "f-1" not in dep_ids  # f-1 depends on ev-1, not doc-1


def test_get_by_type(graph):
    findings = graph.get_by_type(TrustNodeType.FINDING)
    assert len(findings) == 2


def test_invalidation_cascade(graph):
    invalidated = graph.invalidate("doc-1", "Document replaced")
    # doc-1 → ev-1, ev-2 → f-1, f-2
    assert "doc-1" in invalidated
    assert "ev-1" in invalidated
    assert "ev-2" in invalidated
    assert "f-1" in invalidated
    assert "f-2" in invalidated
    assert len(invalidated) == 5

    # Verify nodes are marked invalid
    assert not graph.get_node("doc-1").valid
    assert not graph.get_node("f-1").valid
    assert graph.get_node("doc-1").invalidated_reason == "Document replaced"

    # req-1 is independent, should remain valid
    assert graph.get_node("req-1").valid


def test_invalidation_partial(graph):
    invalidated = graph.invalidate("ev-1", "Evidence outdated")
    assert "ev-1" in invalidated
    assert "f-1" in invalidated
    assert "f-2" in invalidated  # f-2 depends on ev-1
    assert "doc-1" not in invalidated  # parent, not dependent
    assert "ev-2" not in invalidated


def test_revalidate(graph):
    graph.invalidate("ev-1", "test")
    assert not graph.get_node("ev-1").valid

    graph.revalidate("ev-1")
    assert graph.get_node("ev-1").valid
    assert graph.get_node("ev-1").invalidated_at is None


def test_blast_radius_nondestructive(graph):
    result = graph.calculate_blast_radius("doc-1")
    assert result["total_affected"] == 4  # ev-1, ev-2, f-1, f-2
    assert "evidence" in result["by_type"]
    assert "finding" in result["by_type"]
    # Verify nothing was actually invalidated
    assert graph.get_node("doc-1").valid


def test_blast_radius_leaf(graph):
    result = graph.calculate_blast_radius("f-1")
    assert result["total_affected"] == 0


def test_to_dict(graph):
    d = graph.to_dict()
    assert d["summary"]["total_nodes"] == 6
    assert d["summary"]["valid"] == 6
    assert len(d["edges"]) == 5  # ev-1→doc-1, ev-2→doc-1, f-1→ev-1, f-2→ev-1, f-2→ev-2


def test_compute_hash():
    h = TrustGraph.compute_hash("hello world")
    assert len(h) == 64  # SHA-256 hex


def test_get_valid_invalid(graph):
    assert len(graph.get_valid_nodes()) == 6
    assert len(graph.get_invalid_nodes()) == 0

    graph.invalidate("ev-1", "test")
    assert len(graph.get_invalid_nodes()) >= 1


def test_remove_node(graph):
    graph.remove_node("req-1")
    assert graph.get_node("req-1") is None
    assert len(graph.list_nodes()) == 5


def test_cycle_safe(graph):
    # Add a cycle: f-1 depends on ev-1, add ev-1 depends on f-1
    node = graph.get_node("ev-1")
    node.dependencies.append("f-1")

    # Should not infinite loop
    invalidated = graph.invalidate("doc-1", "cycle test")
    assert "doc-1" in invalidated
