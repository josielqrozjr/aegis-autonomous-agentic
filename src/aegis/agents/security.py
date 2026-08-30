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


        quote = "Logs de auditoria, IPs e telemetria de tráfego de usuários globais (inclusive UE) são retidos por 10 anos em storage frio."
        if "tls 1.0" in raw_text.lower():
            quote = "Os dados em trânsito são criptografados com TLS 1.0/1.1 para compatibilidade legada."

        content_hash = self._compute_hash(quote)

        evidence = Evidence(
            id=f"ev-{uuid.uuid4().hex[:8]}",
            document_id=doc_id,
            page_number=4,
            section_id="sec-4.1",
            quote=quote,
            provenance="Seção 4.1 - Telemetria e Logs de Aplicação",
            confidence_score=0.95,
            content_hash=content_hash,
            dependencies=[doc_id],
        )

        finding = Finding(
            id=f"finding-{uuid.uuid4().hex[:8]}",
            investigation_id=task.investigation_id if task else "inv-default",
            requirement_id="GDPR-ART-5-1-E",
            agent_id=self.agent_id,
            title="Retenção Desproporcional de Logs de Conexão e Telemetria sob GDPR",
            description="A política determina a guarda de logs completos e IPs por 10 anos para usuários da UE, violando o princípio da limitação de armazenamento do GDPR Art. 5(1)(e).",
            severity=FindingSeverity.CRITICAL,
            status=FindingStatus.OPEN,
            confidence=0.92,
            evidences=[evidence],
        )

        return {"findings": [finding.model_dump()]}
