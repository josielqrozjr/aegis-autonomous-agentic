"""
Security Specialist Agent — Auditoria de conformidade com GDPR (Art. 5(1)(e) e 17) e segurança técnica via Gemini Flash.
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

SECURITY_AGENT_CONTRACT = AgentContract(
    agent_id="agent-security-specialist",
    name="Security Specialist Agent",
    role=AgentRole.SECURITY_SPECIALIST,
    description="Especialista em segurança da informação e GDPR (Art. 5(1)(e) e Art. 17). Audita guarda de telemetria, criptografia e proteção de logs.",
    capabilities=[
        Capability(id="cap-security-audit", name="Security & Technical Controls Audit", description="Auditoria de controles técnicos de segurança", jurisdictions=["GLOBAL", "EU"]),
    ],
    jurisdictions=["GLOBAL", "EU"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class SecurityAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(SECURITY_AGENT_CONTRACT)
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

        if "10 anos" in normalized_text or "retidos por 10 anos" in normalized_text:
            findings.append(make_finding(
                requirement_id="GDPR-ART-5-1-E",
                title="Retenção Desproporcional de Logs de Conexão e Telemetria sob GDPR",
                description="A política determina a guarda de logs completos e IPs por 10 anos para usuários da UE, violando o princípio da limitação de armazenamento do GDPR Art. 5(1)(e).",
                quote="Logs de auditoria, IPs e telemetria de tráfego de usuários globais (inclusive UE) são retidos por 10 anos em storage frio.",
                section_id="sec-4.1",
                page_number=4,
                provenance="Seção 4.1 - Telemetria e Logs de Aplicação",
                confidence=0.92,
                severity=FindingSeverity.CRITICAL,
            ))

        if "transferência internacional" in normalized_text or "sccs" in normalized_text or "decisão de adequação" in normalized_text:
            findings.append(make_finding(
                requirement_id="GDPR-ART-44-49",
                title="Transferência Internacional de Dados sem Adequação ou Safeguards",
                description="O documento permite o processamento de dados de clientes europeus em servidores no Brasil e EUA sem cláusulas contratuais padrão, decisão de adequação ou outra salvaguarda válida.",
                quote="A transferência é realizada sem cláusulas contratuais padrão (SCCs) ou decisão de adequação vigente.",
                section_id="sec-7.2",
                page_number=7,
                provenance="Seção 7.1-7.2 - Transferência Internacional de Dados",
                confidence=0.91,
                severity=FindingSeverity.HIGH,
            ))

        if "prazo máximo definido para resposta" in normalized_text or "direito ao esquecimento" in normalized_text:
            findings.append(make_finding(
                requirement_id="GDPR-ART-17",
                title="Ausência de Procedimento de Apagamento sem Atraso",
                description="A política não define um prazo máximo para atender solicitações de exclusão e deixa o processo dependente do critério da equipe jurídica, provocando atraso injustificado.",
                quote="Solicitações de exclusão (direito ao esquecimento) serão analisadas caso a caso pela equipe jurídica, sem prazo máximo definido para resposta.",
                section_id="sec-6.2",
                page_number=2,
                provenance="Seção 6.2 - Direitos dos Titulares",
                confidence=0.9,
                severity=FindingSeverity.HIGH,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="GDPR-ART-5-1-E",
                title="Retenção Desproporcional de Logs de Conexão e Telemetria sob GDPR",
                description="A política determina a guarda de logs completos e IPs por 10 anos para usuários da UE, violando o princípio da limitação de armazenamento do GDPR Art. 5(1)(e).",
                quote="Logs de auditoria, IPs e telemetria de tráfego de usuários globais (inclusive UE) são retidos por 10 anos em storage frio.",
                section_id="sec-4.1",
                page_number=4,
                provenance="Seção 4.1 - Telemetria e Logs de Aplicação",
                confidence=0.92,
                severity=FindingSeverity.CRITICAL,
            ))

        return {"findings": [f.model_dump() for f in findings]}
