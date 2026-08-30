import pytest
import asyncio
from aegis.registry import default_registry, init_default_registry
from aegis.schemas import AgentRole, Document, InvestigationStatus
from aegis.agents import (
    DocumentUnderstandingAgent,
    PlannerAgent,
    PrivacyAgent,
    GovernanceAgent,
    SecurityAgent,
    EvidenceCriticAgent,
    RemediationAgent,
)

@pytest.fixture
def registry():
    return init_default_registry()

@pytest.mark.asyncio
async def test_agent_registry_discovery(registry):
    # Testar descoberta por role
    planner_agents = registry.discover_by_role(AgentRole.PLANNER)
    assert len(planner_agents) == 1
    assert planner_agents[0].name == "Planner & Orchestrator Agent"
    assert planner_agents[0].model_used == "gemini-2.5-flash"

    # Testar descoberta por capacidade
    privacy_agents = registry.discover_by_capability("cap-privacy-audit")
    assert len(privacy_agents) == 1
    assert privacy_agents[0].role == AgentRole.PRIVACY_SPECIALIST

    # Testar descoberta de especialistas por jurisdição
    specialists = registry.discover_specialists(
        jurisdiction="BR",
        capabilities=["cap-privacy-audit", "cap-security-audit", "cap-governance-audit"]
    )
    assert len(specialists) >= 3

@pytest.mark.asyncio
async def test_end_to_end_agentic_flow(registry):
    doc = Document(
        id="doc-001",
        filename="politica_de_privacidade.pdf",
        content_type="application/pdf",
        storage_path="/storage/docs/politica.pdf",
        raw_text="Esta é uma política de privacidade LGPD sobre dados de geolocalização e transmissão com TLS 1.0. DPO: dpo@empresa.com.br, CPF: 123.456.789-00.",
    )

    # 1. Document Understanding com PII Gate (Gemma) + Gemini Flash
    doc_agent = DocumentUnderstandingAgent()
    understanding_result = await doc_agent.execute_task(
        task=None, context={"document": doc.model_dump()}
    )
    assert understanding_result["jurisdiction"] == "BR"
    assert "pii_scan" in understanding_result
    assert understanding_result["pii_scan"]["pii_detected"] is True

    # 2. Planner Agent (Dynamic Routing & Grafo de Dependências)
    planner = PlannerAgent(registry=registry)
    plan = await planner.create_plan(
        investigation_id="inv-100",
        document_analysis=understanding_result,
    )
    assert len(plan.tasks) >= 4
    assert len(plan.assigned_agent_ids) >= 4
    
    # Verificar dependências do Evidence Critic
    critic_tasks = [t for t in plan.tasks if t.agent_role == AgentRole.EVIDENCE_CRITIC]
    assert len(critic_tasks) >= 1
    assert len(critic_tasks[0].dependencies) >= 1  # Depende dos especialistas

    # 3. Specialist Execution (Privacy, Security, Governance) com SHA-256 Hashing
    privacy_agent = PrivacyAgent()
    sec_agent = SecurityAgent()
    gov_agent = GovernanceAgent()

    privacy_res = await privacy_agent.execute_task(plan.tasks[0], {"document": doc.model_dump()})
    sec_res = await sec_agent.execute_task(plan.tasks[1], {"document": doc.model_dump()})
    gov_res = await gov_agent.execute_task(plan.tasks[2], {"document": doc.model_dump()})

    all_findings = privacy_res["findings"] + sec_res["findings"] + gov_res["findings"]
    assert len(all_findings) == 3

    # Validar que toda evidência possui SHA-256 de 64 caracteres
    for f in all_findings:
        assert len(f["evidences"]) > 0
        for ev in f["evidences"]:
            assert ev["content_hash"] is not None
            assert len(ev["content_hash"]) == 64

    # 4. Evidence Critic (Adversarial Auditor / Red Team com Gemini Pro)
    critic = EvidenceCriticAgent()
    critic_res = await critic.execute_task(
        task=critic_tasks[0],
        context={"findings": all_findings}
    )
    reviews = critic_res["reviews"]
    assert len(reviews) == 3
    for r in reviews:
        assert r["decision"] == "confirmed"
        assert r["critic_agent_id"] == "agent-evidence-critic"

    # 5. Remediation Agent (Plano de Ação Corretivo com Gemini Flash)
    remediation_agent = RemediationAgent()
    rem_res = await remediation_agent.execute_task(
        task=None,
        context={"findings": all_findings}
    )
    remediations = rem_res["remediations"]
    assert len(remediations) == 3
    assert all(r["status"] == "pending" for r in remediations)
    assert any("DPO" in r["assignee"] for r in remediations)
