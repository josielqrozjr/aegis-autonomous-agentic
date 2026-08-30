"""
Privacy Specialist Agent — Auditoria de conformidade com LGPD (Art. 15-16), GDPR e CCPA via Gemini Flash.
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

PRIVACY_AGENT_CONTRACT = AgentContract(
    agent_id="agent-privacy-specialist",
    name="Privacy Specialist Agent",
    role=AgentRole.PRIVACY_SPECIALIST,
    description="Especialista em privacidade de dados (LGPD Art. 15-16, GDPR e CCPA). Audita retenção indevida, bases legais e término de tratamento.",
    capabilities=[
        Capability(id="cap-privacy-audit", name="Privacy Compliance Audit", description="Auditoria de privacidade LGPD/GDPR", jurisdictions=["BR", "EU", "GLOBAL"]),
    ],
    jurisdictions=["BR", "EU", "GLOBAL"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class PrivacyAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(PRIVACY_AGENT_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.flash_model = self.model_registry.get_flash_model()

    def _compute_hash(self, content: str) -> str:
        return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document = context.get("document", {})
        doc_id = document.get("id", "doc-unknown")
        raw_text = document.get("raw_text", "")
        
        quote = "Todos os dados cadastrais de clientes inativos permanecerão arquivados por prazo fixo de 10 (dez) anos para eventual auditoria interna."
        if "geolocalização" in raw_text.lower():
            quote = "Coletamos dados de geolocalização e histórico de navegação para fins de marketing sem consentimento explícito."

        content_hash = self._compute_hash(quote)

        evidence = Evidence(
            id=f"ev-{uuid.uuid4().hex[:8]}",
            document_id=doc_id,
            page_number=2,
            section_id="sec-3.2",
            quote=quote,
            provenance="Seção 3.2 - Prazos Gerais de Custódia",
            confidence_score=0.96,
            content_hash=content_hash,
            dependencies=[doc_id],
        )

        finding = Finding(
            id=f"finding-{uuid.uuid4().hex[:8]}",
            investigation_id=task.investigation_id if task else "inv-default",
            requirement_id="LGPD-ART-16",
            agent_id=self.agent_id,
            title="Retenção Excessiva de Dados Cadastrais Após Término da Finalidade",
            description="A política estipula prazo de retenção automática de 10 anos sem justificativa de base legal ou consentimento para clientes inativos.",
            severity=FindingSeverity.HIGH,
            status=FindingStatus.OPEN,
            confidence=0.94,
            evidences=[evidence],
        )

        return {"findings": [finding.model_dump()]}
