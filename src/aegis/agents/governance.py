import uuid
from typing import Any, Dict
from aegis.agents.base import BaseAgent
from aegis.schemas import (
    AgentContract,
    AgentRole,
    Capability,
    Finding,
    FindingSeverity,
    FindingStatus,
    Evidence,
    Task,
)

GOVERNANCE_AGENT_CONTRACT = AgentContract(
    agent_id="agent-governance-specialist",
    name="Governance Specialist Agent",
    role=AgentRole.GOVERNANCE_SPECIALIST,
    description="Especialista em governança corporativa e ISO 27001 / SOC 2.",
    capabilities=[
        Capability(id="cap-governance-audit", name="Governance Audit", description="Auditoria de Governança ISO 27001", jurisdictions=["GLOBAL"]),
    ],
    jurisdictions=["GLOBAL"],
)

class GovernanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(GOVERNANCE_AGENT_CONTRACT)

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document = context.get("document", {})
        doc_id = document.get("id", "doc-unknown")
        
        evidences = [
            Evidence(
                id=f"ev-{uuid.uuid4().hex[:8]}",
                document_id=doc_id,
                page_number=3,
                section_id="sec-5",
                quote="Políticas de retenção e descarte de dados não são revisadas anualmente.",
                provenance="Seção 5 - Ciclo de Vida dos Dados",
                confidence_score=0.88,
            )
        ]

        finding = Finding(
            id=f"finding-{uuid.uuid4().hex[:8]}",
            investigation_id=task.investigation_id,
            requirement_id="ISO27001-A.5.1",
            agent_id=self.agent_id,
            title="Periodicidade Indefinida para Revisão de Políticas de Retenção",
            description="Falta de processo formal de auditoria periódica anual de governança de dados.",
            severity=FindingSeverity.MEDIUM,
            status=FindingStatus.OPEN,
            evidences=evidences,
        )

        return {"findings": [finding.model_dump()]}
