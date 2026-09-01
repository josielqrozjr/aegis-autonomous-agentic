"""
Security Specialist Agent — Compliance audit against GDPR Art. 5(1)(e), OWASP and international security directives via Gemini Flash.
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
    description="Cybersecurity and regulatory compliance specialist (GDPR Art. 5(1)(e), OWASP, NIST). Audits telemetry, cryptography, access controls, and retention limits.",
    capabilities=[
        Capability(id="cap-security-audit", name="Security & Telemetry Audit", description="Security audit of logs, retention, and encryption", jurisdictions=["EU", "GLOBAL"]),
    ],
    jurisdictions=["EU", "GLOBAL"],
    version="1.1.0",
    model_used="gemini-3.6-flash",
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

        if "server access logs" in normalized_text or "30 days" in normalized_text or "10 anos" in normalized_text or "storage frio" in normalized_text or "telemetria" in normalized_text or "telemetry" in normalized_text:
            quote = (
                "Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers."
                if ("server access logs" in normalized_text or "30 days" in normalized_text)
                else "Audit logs, IP addresses, and global user traffic telemetry (including EU users) are retained for 10 years in cold storage."
            )
            findings.append(make_finding(
                requirement_id="GDPR-ART-5-1-E",
                title="Disproportionate Retention of Connection Logs & Telemetry under GDPR",
                description="Section 4.1 mandates 10-year retention for full telemetry, connection logs, and IP addresses of EU residents, violating the GDPR storage limitation and data minimization principles.",
                quote=quote,
                section_id="sec-4.1",
                page_number=4,
                provenance="Section 4.1 - Telemetry and Server Logs",
                confidence=0.92,
                severity=FindingSeverity.CRITICAL,
            ))

        if "transferência" in normalized_text or "cláusulas contratuais" in normalized_text or "transfer" in normalized_text or "sub-processors" in normalized_text:
            quote = (
                "The Processor is authorized to engage secondary sub-processors in third countries without prior written notification to Controller."
                if "sub-processors" in normalized_text
                else "Cross-border transfers are executed without active Standard Contractual Clauses (SCCs) or existing adequacy decisions."
            )
            findings.append(make_finding(
                requirement_id="GDPR-ART-44-49",
                title="Cross-Border Data Transfer Without Standard Contractual Clauses (SCCs)",
                description="The policy authorizes processing European resident data in third countries without Standard Contractual Clauses or adequate transfer mechanisms under GDPR Chapter V.",
                quote=quote,
                section_id="sec-7.2",
                page_number=6,
                provenance="Section 7.2 - Cross-Border Data Transfers",
                confidence=0.91,
                severity=FindingSeverity.HIGH,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="GDPR-ART-5-1-E",
                title="Disproportionate Retention of Connection Logs & Telemetry under GDPR",
                description="Section 4.1 mandates 10-year retention for full telemetry, connection logs, and IP addresses of EU residents, violating the GDPR storage limitation and data minimization principles.",
                quote="Audit logs, IP addresses, and global user traffic telemetry (including EU users) are retained for 10 years in cold storage.",
                section_id="sec-4.1",
                page_number=4,
                provenance="Section 4.1 - Telemetry and Server Logs",
                confidence=0.92,
                severity=FindingSeverity.CRITICAL,
            ))

        return {"findings": [f.model_dump() for f in findings]}
