import uuid
from typing import Any, Dict, List
from aegis.agents.base import BaseAgent
from aegis.schemas import (
    AgentContract,
    AgentRole,
    Capability,
    Task,
    TaskStatus,
    InvestigationPlan,
)
from aegis.registry import default_registry

PLANNER_CONTRACT = AgentContract(
    agent_id="agent-planner",
    name="Planner & Orchestrator Agent",
    role=AgentRole.PLANNER,
    description="Gera o plano de investigação e consulta dinamicamente o Agent Registry para delegar tarefas a especialistas.",
    capabilities=[
        Capability(id="cap-investigation-planning", name="Investigation Planning", description="Criação de planos de investigação"),
        Capability(id="cap-dynamic-routing", name="Dynamic Specialist Routing", description="Roteamento dinâmico de agentes especialistas"),
    ],
    jurisdictions=["GLOBAL"],
)

class PlannerAgent(BaseAgent):
    def __init__(self, registry=None):
        super().__init__(PLANNER_CONTRACT)
        self.registry = registry or default_registry

    async def create_plan(self, investigation_id: str, document_analysis: Dict[str, Any]) -> InvestigationPlan:
        jurisdiction = document_analysis.get("jurisdiction", "GLOBAL")
        obligations = document_analysis.get("obligations", [])
        
        # Mapeamento de capacidades necessárias a partir do entendimento do documento
        required_capabilities = ["cap-privacy-audit", "cap-security-audit", "cap-governance-audit"]
        
        # Descoberta dinâmica de especialistas no Registry
        specialists = self.registry.discover_specialists(
            jurisdiction=jurisdiction,
            capabilities=required_capabilities
        )
        
        tasks: List[Task] = []
        assigned_ids: List[str] = []

        for spec in specialists:
            assigned_ids.append(spec.agent_id)
            tasks.append(
                Task(
                    id=f"task-{uuid.uuid4().hex[:8]}",
                    investigation_id=investigation_id,
                    agent_id=spec.agent_id,
                    agent_role=spec.role,
                    description=f"Executar análise técnica de {spec.name} sob jurisdição {jurisdiction}",
                    status=TaskStatus.QUEUED,
                )
            )

        # Adicionar tarefa do Evidence Critic (Red Team)
        critics = self.registry.discover_by_role(AgentRole.EVIDENCE_CRITIC)
        for critic in critics:
            assigned_ids.append(critic.agent_id)
            tasks.append(
                Task(
                    id=f"task-{uuid.uuid4().hex[:8]}",
                    investigation_id=investigation_id,
                    agent_id=critic.agent_id,
                    agent_role=critic.role,
                    description="Realizar auditoria adversarial (criticism) sobre os achados",
                    status=TaskStatus.QUEUED,
                )
            )

        plan = InvestigationPlan(
            investigation_id=investigation_id,
            summary=f"Plano de Investigação Automático para Jurisdição {jurisdiction} cobrindo {len(specialists)} especialistas.",
            assigned_agent_ids=assigned_ids,
            tasks=tasks,
        )
        return plan

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        investigation_id = task.investigation_id
        document_analysis = context.get("document_analysis", {})
        plan = await self.create_plan(investigation_id, document_analysis)
        return plan.model_dump()
