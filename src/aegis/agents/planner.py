"""
Planner & Orchestrator Agent — Constrói o grafo de execução da investigação com dependências explícitas.
"""

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
PLANNER_CONTRACT = AgentContract(
    agent_id="agent-planner",
    name="Planner & Orchestrator Agent",
    role=AgentRole.PLANNER,
    description="Gera o plano de investigação e consulta dinamicamente o Agent Registry para delegar tarefas a especialistas com dependências rastreáveis.",
    capabilities=[
        Capability(id="cap-investigation-planning", name="Investigation Planning", description="Criação de planos de investigação com dependências"),
        Capability(id="cap-dynamic-routing", name="Dynamic Specialist Routing", description="Roteamento dinâmico de agentes especialistas"),
    ],
    jurisdictions=["GLOBAL"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class PlannerAgent(BaseAgent):
    def __init__(self, registry=None):
        super().__init__(PLANNER_CONTRACT)
        if registry is None:
            from aegis.registry.registry import default_registry
            self.registry = default_registry
        else:
            self.registry = registry


    async def create_plan(self, investigation_id: str, document_analysis: Dict[str, Any]) -> InvestigationPlan:
        jurisdiction = document_analysis.get("jurisdiction", "GLOBAL")
        
        # Mapeamento de capacidades necessárias a partir do entendimento do documento
        required_capabilities = ["cap-privacy-audit", "cap-security-audit", "cap-governance-audit"]
        
        # Descoberta dinâmica de especialistas no Registry
        specialists = self.registry.discover_specialists(
            jurisdiction=jurisdiction,
            capabilities=required_capabilities
        )
        
        tasks: List[Task] = []
        assigned_ids: List[str] = []
        specialist_task_ids: List[str] = []

        # 1. Tarefas dos Especialistas (Execução em Paralelo)
        for spec in specialists:
            t_id = f"task-{uuid.uuid4().hex[:8]}"
            assigned_ids.append(spec.agent_id)
            specialist_task_ids.append(t_id)
            tasks.append(
                Task(
                    id=t_id,
                    investigation_id=investigation_id,
                    agent_id=spec.agent_id,
                    agent_role=spec.role,
                    description=f"Executar análise técnica de {spec.name} sob jurisdição {jurisdiction}",
                    status=TaskStatus.QUEUED,
                    dependencies=[],  # Executam em paralelo após o Document Understanding
                )
            )

        # 2. Tarefa do Evidence Critic (Red Team / Auditor Adversarial)
        # Depende de TODOS os especialistas terem concluído seus achados
        critics = self.registry.discover_by_role(AgentRole.EVIDENCE_CRITIC)
        critic_task_ids: List[str] = []
        for critic in critics:
            c_id = f"task-{uuid.uuid4().hex[:8]}"
            assigned_ids.append(critic.agent_id)
            critic_task_ids.append(c_id)
            tasks.append(
                Task(
                    id=c_id,
                    investigation_id=investigation_id,
                    agent_id=critic.agent_id,
                    agent_role=critic.role,
                    description="Realizar auditoria adversarial profunda sobre os achados dos especialistas com Gemini Pro",
                    status=TaskStatus.QUEUED,
                    dependencies=list(specialist_task_ids),  # Depende dos especialistas
                )
            )

        # 3. Tarefa do Remediation Agent
        # Depende da validação do Evidence Critic
        remediations = self.registry.discover_by_role(AgentRole.REMEDIATION)
        for rem in remediations:
            r_id = f"task-{uuid.uuid4().hex[:8]}"
            assigned_ids.append(rem.agent_id)
            tasks.append(
                Task(
                    id=r_id,
                    investigation_id=investigation_id,
                    agent_id=rem.agent_id,
                    agent_role=rem.role,
                    description="Gerar recomendações de remediação acionáveis e plano de ação corretivo",
                    status=TaskStatus.QUEUED,
                    dependencies=list(critic_task_ids),  # Depende da revisão crítica
                )
            )

        plan = InvestigationPlan(
            investigation_id=investigation_id,
            summary=f"Plano de Investigação Automático para Jurisdição {jurisdiction} cobrindo {len(specialists)} especialistas com auditoria adversarial e remediação.",
            assigned_agent_ids=assigned_ids,
            tasks=tasks,
        )
        return plan

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        investigation_id = task.investigation_id
        document_analysis = context.get("document_analysis", {})
        plan = await self.create_plan(investigation_id, document_analysis)
        return plan.model_dump()
