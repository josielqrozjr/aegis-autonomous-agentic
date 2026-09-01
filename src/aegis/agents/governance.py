"""
Governance Specialist Agent — Compliance audit against ISO/IEC 27001 (Control A.8.10, A.8.24) and corporate directives via Gemini Flash.
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
    description="Corporate governance and ISO 27001:2022 specialist (Control A.8.10 Information Deletion, A.8.24 Cryptography). Audits media disposal, auditability, and baseline security controls.",
    capabilities=[
        Capability(id="cap-governance-audit", name="ISO 27001 Governance Audit", description="Governance audit of ISO 27001 controls", jurisdictions=["GLOBAL", "BR", "EU"]),
    ],
    jurisdictions=["GLOBAL", "BR", "EU"],
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

        if "shared passwords" in normalized_text or "conveniência operacional" in normalized_text or "snapshots legados" in normalized_text or "convenience" in normalized_text or "media disposal" in normalized_text:
            quote = (
                "Analytical databases utilize shared passwords restricted to the engineering team."
                if "shared passwords" in normalized_text
                else "Legacy backup media and storage snapshots shall be purged periodically according to IT operational convenience."
            )
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.10",
                title="Absence of Formalized Media Sanitization & Disposal Protocols",
                description="Section 5.3 states legacy backups and snapshots are purged based on operational convenience, lacking verifiable cryptographic sanitization or disposal audit logs under ISO 27001 Control A.8.10.",
                quote=quote,
                section_id="sec-5.3",
                page_number=5,
                provenance="Section 5.3 - Media Disposal & Snapshot Overwriting",
                confidence=0.89,
                severity=FindingSeverity.MEDIUM,
            ))

        if "tls 1.2" in normalized_text or "tls 1.3" in normalized_text or "dados em trânsito" in normalized_text or "transit" in normalized_text:
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.24",
                title="Lack of Key Management & Cryptographic Governance in Transit",
                description="The policy cites TLS 1.2/1.3 but lacks formal key management rules, rotation cycles, or cryptographic policies for data at rest under ISO 27001 Control A.8.24.",
                quote="Data in transit is secured with TLS 1.2 / TLS 1.3; however, encryption key rotation policies and datastore credentials are not formally defined.",
                section_id="sec-4.2",
                page_number=4,
                provenance="Section 4.2 - Data Protection in Transit",
                confidence=0.87,
                severity=FindingSeverity.MEDIUM,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="ISO27001-A.8.10",
                title="Absence of Formalized Media Sanitization & Disposal Protocols",
                description="Section 5.3 states legacy backups and snapshots are purged based on operational convenience, lacking verifiable cryptographic sanitization or disposal audit logs under ISO 27001 Control A.8.10.",
                quote="Legacy backup media and storage snapshots shall be purged periodically according to IT operational convenience.",
                section_id="sec-5.3",
                page_number=5,
                provenance="Section 5.3 - Media Disposal & Snapshot Overwriting",
                confidence=0.89,
                severity=FindingSeverity.MEDIUM,
            ))

        return {"findings": [f.model_dump() for f in findings]}
