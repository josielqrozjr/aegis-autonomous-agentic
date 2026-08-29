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

    # Testar descoberta por capacidade
    privacy_agents = registry.discover_by_capability("cap-privacy-audit")
    assert len(privacy_agents) == 1
    assert privacy_agents[0].role == AgentRole.PRIVACY_SPECIALIST

    # Testar descoberta de especialistas por jurisdição
    specialists = registry.discover_specialists(
        jurisdiction="BR",
        capabilities=["cap-privacy-audit", "cap-security-audit"]
    )
    assert len(specialists) >= 2

@pytest.mark.asyncio
async def test_end_to_end_agentic_flow(registry):
    doc = Document(
        id="doc-001",
        filename="politica_de_privacidade.pdf",
        content_type="application/pdf",
        storage_path="/storage/docs/politica.pdf",
        raw_text="Esta é uma política de privacidade LGPD sobre dados de geolocalização e transmissão com TLS 1.0.",
    )

    # 1. Document Understanding
    doc_agent = DocumentUnderstandingAgent()
    understanding_result = await doc_agent.execute_task(
        task=None, context={"document": doc.model_dump()}
    )
    assert understanding_result["jurisdiction"] == "BR"

    # 2. Planner Agent (Dynamic Routing)
    planner = PlannerAgent(registry=registry)
    plan = await planner.create_plan(
        investigation_id="inv-100",
        document_analysis=understanding_result,
    )
    assert len(plan.tasks) >= 3
    assert len(plan.assigned_agent_ids) >= 3

    # 3. Specialist Execution (Privacy + Security)
    privacy_agent = PrivacyAgent()
    sec_agent = SecurityAgent()

    privacy_res = await privacy_agent.execute_task(plan.tasks[0], {"document": doc.model_dump()})
    sec_res = await sec_agent.execute_task(plan.tasks[1], {"document": doc.model_dump()})

    all_findings = privacy_res["findings"] + sec_res["findings"]
    assert len(all_findings) == 2

    # 4. Evidence Critic (Adversarial Auditor)
    critic = EvidenceCriticAgent()
    critic_res = await critic.execute_task(
        task=plan.tasks[-1],
        context={"findings": all_findings}
    )
    reviews = critic_res["reviews"]
    assert len(reviews) == 2
    assert reviews[0]["decision"] == "confirmed"
