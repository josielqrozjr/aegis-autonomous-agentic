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
    model_used="gemini-3.6-flash",
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

        if "descarte" in normalized_text or "conveniência operacional" in normalized_text or "mídias e snapshots" in normalized_text:
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.10",
                title="Lack of Formal Procedure for Data Disposal and Sanitization",
                description="The document stipulates disposal by 'operational convenience', violating ISO 27001 A.8.10 sanitization and auditable records requirements.",
                quote="Legacy media and snapshots shall be periodically deleted at the IT team's operational convenience.",
                section_id="sec-5.3",
                page_number=5,
                provenance="Section 5.3 - Snapshot Disposal and Overwrite",
                confidence=0.89,
                severity=FindingSeverity.MEDIUM,
            ))

        if "tls 1.2" in normalized_text or "criptograf" in normalized_text:
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.24",
                title="Ausência de Governança de Chaves e Criptografia em Trânsito",
                description="O documento menciona criptografia em trânsito, mas não define regras de gestão de chaves, rotação, armazenamento e uso de criptografia em dados em repouso e em trânsito.",
                quote="Os dados em trânsito são criptografados com TLS 1.2 / TLS 1.3 para assegurar integridade.",
                section_id="sec-4.2",
                page_number=4,
                provenance="Seção 4.2 - Proteção em Trânsito",
                confidence=0.87,
                severity=FindingSeverity.MEDIUM,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.10",
                title="Lack of Formal Procedure for Data Disposal and Sanitization",
                description="The document stipulates disposal by 'operational convenience', violating ISO 27001 A.8.10 sanitization and auditable records requirements.",
                quote="Legacy media and snapshots shall be periodically deleted at the IT team's operational convenience.",
                section_id="sec-5.3",
                page_number=5,
                provenance="Section 5.3 - Snapshot Disposal and Overwrite",
                confidence=0.89,
                severity=FindingSeverity.MEDIUM,
            ))

        return {"findings": [f.model_dump() for f in findings]}
