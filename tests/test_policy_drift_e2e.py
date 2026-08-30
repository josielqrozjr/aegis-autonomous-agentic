"""
Teste End-to-End do Policy Drift Engine — Cascata do Trust Graph e Selective Recovery.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.schemas import (
    Document,
    Investigation,
    InvestigationStatus,
    Finding,
    FindingStatus,
    FindingSeverity,
    Evidence,
    RegulatoryChange,
    TrustNode,
    TrustNodeType,
)
from aegis.agents.change_detection import ChangeDetectionAgent
from apps.api.app.domain.trust_graph.graph import TrustGraph

@pytest.mark.asyncio
async def test_policy_drift_and_selective_recovery():
    # 1. Montar documento e investigação concluída
    doc = Document(
        id="doc-retention-01",
        filename="politica_retencao.pdf",
        content_type="application/pdf",
        storage_path="/storage/politica.pdf",
        raw_text="Logs de auditoria e telemetria de tráfego são retidos por 10 anos.",
    )

    ev_sec = Evidence(
        id="ev-sec-101",
        document_id=doc.id,
        page_number=4,
        section_id="sec-4.1",
        quote="Logs de auditoria e telemetria são retidos por 10 anos.",
        provenance="Seção 4.1",
        confidence_score=0.95,
        content_hash="a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
        dependencies=[doc.id],
    )

    finding_sec = Finding(
        id="finding-gdpr-101",
        investigation_id="inv-001",
        requirement_id="GDPR-ART-5-1-E",
        agent_id="agent-security-specialist",
        title="Retenção de Logs em Conformidade com Norma Anterior",
        description="Logs retidos por 10 anos conforme baseline anterior.",
        severity=FindingSeverity.HIGH,
        status=FindingStatus.CLOSED,
        evidences=[ev_sec],
    )

    inv = Investigation(
        id="inv-001",
        title="Auditoria de Retenção de Dados 2026",
        document=doc,
        status=InvestigationStatus.COMPLETED,
        findings=[finding_sec],
    )

    # 2. Montar Trust Graph
    graph = TrustGraph()
    graph.add_node(TrustNode(node_id=doc.id, node_type=TrustNodeType.DOCUMENT, source="politica.pdf"))
    graph.add_node(TrustNode(node_id=ev_sec.id, node_type=TrustNodeType.EVIDENCE, source="politica.pdf p.4", dependencies=[doc.id]))
    graph.add_node(TrustNode(node_id=finding_sec.id, node_type=TrustNodeType.FINDING, source="agent-security", dependencies=[ev_sec.id]))

    assert graph.get_node(ev_sec.id).valid is True
    assert graph.get_node(finding_sec.id).valid is True

    # 3. Disparar Evento de Mudança Regulatória (GDPR alterando prazo)
    change = RegulatoryChange(
        id="change-gdpr-2026",
        framework="GDPR",
        version="2026.2",
        change_description="Redução do prazo máximo de retenção de logs de 10 para 5 anos.",
        affected_requirements=["GDPR-ART-5-1-E"],
    )

    # 4. Executar Change Detection Agent
    agent = ChangeDetectionAgent()
    result = await agent.process_policy_drift(
        change=change,
        investigations=[inv],
        graph=graph,
    )

    # 5. Asserções do Efeito Dominó (Policy Drift + Selective Recovery)
    # A. Investigação foi reaberta
    assert "inv-001" in result["affected_investigations"]
    assert inv.status == "reopened"

    # B. Finding original foi reaberto e marcado como afetado
    assert "finding-gdpr-101" in result["affected_findings"]
    assert finding_sec.status == FindingStatus.OPEN
    assert finding_sec.affected_by_change is True
    assert "Reaberto automaticamente devido à alteração regulatória" in finding_sec.insufficient_evidence_reason

    # C. Trust Graph invalidou o nó de evidência e o nó dependente
    assert ev_sec.id in result["invalidated_nodes"]
    assert graph.get_node(ev_sec.id).valid is False
    assert graph.get_node(finding_sec.id).valid is False

    # D. Selective Recovery gerou novos achados e remediações atualizadas
    assert len(result["new_findings"]) >= 1
    assert len(result["new_remediations"]) >= 1
    assert result["status"] == "selective_recovery_completed"
