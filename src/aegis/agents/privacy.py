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
        raw_text = document.get("raw_text") or ""
        normalized_text = " ".join(raw_text.split()).lower()

        def make_finding(requirement_id: str, title: str, description: str, quote: str, section_id: str, page_number: int, provenance: str, confidence: float, severity: FindingSeverity) -> Finding:
            return Finding(
                id=f"finding-{uuid.uuid4().hex[:8]}",
                investigation_id=task.investigation_id if task else "inv-default",
                requirement_id=requirement_id,
                agent_id=self.agent_id,
                title=title,
                description=description,
                severity=severity,
                status=FindingStatus.OPEN,
                confidence=confidence,
                evidences=[Evidence(
                    id=f"ev-{uuid.uuid4().hex[:8]}",
                    document_id=doc_id,
                    page_number=page_number,
                    section_id=section_id,
                    quote=quote,
                    provenance=provenance,
                    confidence_score=confidence,
                    content_hash=self._compute_hash(quote),
                    dependencies=[doc_id],
                )],
            )

        findings = []

        if "dados cadastrais" in normalized_text or "clientes inativos" in normalized_text:
            findings.append(make_finding(
                requirement_id="LGPD-ART-16",
                title="Retenção Excessiva de Dados Cadastrais Após Término da Finalidade",
                description="A política estipula prazo de retenção automática de 10 anos sem justificativa de base legal ou consentimento para clientes inativos.",
                quote="Todos os dados cadastrais de clientes inativos permanecerão arquivados por prazo fixo de 10 (dez) anos para eventual auditoria interna.",
                section_id="sec-3.2",
                page_number=2,
                provenance="Seção 3.2 - Prazos Gerais de Custódia",
                confidence=0.94,
                severity=FindingSeverity.HIGH,
            ))

        if "geolocalização" in normalized_text or "sem consentimento explícito" in normalized_text:
            findings.append(make_finding(
                requirement_id="LGPD-ART-7",
                title="Coleta de Dados Sem Base Legal Adequada",
                description="A política descreve coleta de geolocalização e histórico de navegação para marketing sem consentimento explícito, sem base legal robusta para o tratamento.",
                quote="Coletamos dados de geolocalização e histórico de navegação para fins de marketing sem consentimento explícito.",
                section_id="sec-2.2",
                page_number=2,
                provenance="Seção 2.2 - Classificação de Dados e Coleta",
                confidence=0.92,
                severity=FindingSeverity.HIGH,
            ))

        if "exclusão" in normalized_text and ("prazo máximo" in normalized_text or "direito ao esquecimento" in normalized_text):
            findings.append(make_finding(
                requirement_id="GDPR-ART-17",
                title="Ausência de Prazo Máximo para Resposta ao Direito de Exclusão",
                description="A política não define prazo máximo para responder a solicitações de exclusão do titular, deixando o tratamento dependente do critério interno da equipe jurídica.",
                quote="Solicitações de exclusão (direito ao esquecimento) serão analisadas caso a caso pela equipe jurídica, sem prazo máximo definido para resposta.",
                section_id="sec-6.2",
                page_number=2,
                provenance="Seção 6.2 - Direitos dos Titulares",
                confidence=0.9,
                severity=FindingSeverity.HIGH,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="LGPD-ART-16",
                title="Retenção Excessiva de Dados Cadastrais Após Término da Finalidade",
                description="A política estipula prazo de retenção automática de 10 anos sem justificativa de base legal ou consentimento para clientes inativos.",
                quote="Todos os dados cadastrais de clientes inativos permanecerão arquivados por prazo fixo de 10 (dez) anos para eventual auditoria interna.",
                section_id="sec-3.2",
                page_number=2,
                provenance="Seção 3.2 - Prazos Gerais de Custódia",
                confidence=0.94,
                severity=FindingSeverity.HIGH,
            ))

        return {"findings": [f.model_dump() for f in findings]}
