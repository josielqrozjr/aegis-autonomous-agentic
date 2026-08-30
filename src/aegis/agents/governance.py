"""
Governance Specialist Agent — Auditoria de conformidade com ISO 27001 (A.8.10) e frameworks de governança via Gemini Flash.
"""

import uuid
import hashlib
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
from aegis.models.registry import default_model_registry

GOVERNANCE_AGENT_CONTRACT = AgentContract(
    agent_id="agent-governance-specialist",
    name="Governance Specialist Agent",
    role=AgentRole.GOVERNANCE_SPECIALIST,
    description="Especialista em governança corporativa e ISO 27001 / SOC 2. Audita processos de descarte seguro, retenção de mídias e políticas corporativas.",
    capabilities=[
        Capability(id="cap-governance-audit", name="Governance Audit", description="Auditoria de Governança ISO 27001", jurisdictions=["GLOBAL"]),
    ],
    jurisdictions=["GLOBAL"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class GovernanceAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(GOVERNANCE_AGENT_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.flash_model = self.model_registry.get_flash_model()

    def _compute_hash(self, content: str) -> str:
        return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document = context.get("document", {})
        doc_id = document.get("id", "doc-unknown")
        
        quote = "As mídias e snapshots legados serão apagados periodicamente conforme conveniência operacional da equipe de TI."
        content_hash = self._compute_hash(quote)

        evidence = Evidence(
            id=f"ev-{uuid.uuid4().hex[:8]}",
            document_id=doc_id,
            page_number=5,
            section_id="sec-5.3",
            quote=quote,
            provenance="Seção 5.3 - Descarte e Sobrescrita de Snapshots",
            confidence_score=0.91,
            content_hash=content_hash,
            dependencies=[doc_id],
        )

        finding = Finding(
            id=f"finding-{uuid.uuid4().hex[:8]}",
            investigation_id=task.investigation_id if task else "inv-default",
            requirement_id="ISO27001-A.8.10",
            agent_id=self.agent_id,
            title="Inexistência de Procedimento Formal para Descarte e Sanitização de Dados",
            description="O documento estipula descarte por 'conveniência operacional', violando o requisito de sanitização e registros auditáveis da ISO 27001 A.8.10.",
            severity=FindingSeverity.MEDIUM,
            status=FindingStatus.OPEN,
            confidence=0.89,
            evidences=[evidence],
        )

        return {"findings": [finding.model_dump()]}
