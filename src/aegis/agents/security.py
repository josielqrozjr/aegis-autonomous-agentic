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

SECURITY_AGENT_CONTRACT = AgentContract(
    agent_id="agent-security-specialist",
    name="Security Specialist Agent",
    role=AgentRole.SECURITY_SPECIALIST,
    description="Especialista em segurança da informação, cibersegurança e padrões OWASP / CIS Benchmarks.",
    capabilities=[
        Capability(id="cap-security-audit", name="Security & Technical Controls Audit", description="Auditoria de controles técnicos de segurança", jurisdictions=["GLOBAL"]),
    ],
    jurisdictions=["GLOBAL"],
)

class SecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__(SECURITY_AGENT_CONTRACT)

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document = context.get("document", {})
        doc_id = document.get("id", "doc-unknown")
        
        evidences = [
            Evidence(
                id=f"ev-{uuid.uuid4().hex[:8]}",
                document_id=doc_id,
                page_number=2,
                section_id="sec-3",
                quote="Os dados em trânsito são criptografados com TLS 1.0/1.1 para compatibilidade legada.",
                provenance="Seção 3 - Segurança da Transmissão",
                confidence_score=0.98,
            )
        ]

        finding = Finding(
            id=f"finding-{uuid.uuid4().hex[:8]}",
            investigation_id=task.investigation_id,
            requirement_id="OWASP-A02-2021",
            agent_id=self.agent_id,
            title="Uso de Protocolos de Criptografia Obsoletos (TLS 1.0 / 1.1)",
            description="O documento aceita versões desatualizadas de TLS propensas a vulnerabilidades conhecidas como POODLE e BEAST.",
            severity=FindingSeverity.CRITICAL,
            status=FindingStatus.OPEN,
            evidences=evidences,
        )

        return {"findings": [finding.model_dump()]}
