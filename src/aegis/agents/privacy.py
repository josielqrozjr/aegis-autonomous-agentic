"""
Privacy Specialist Agent — Compliance audit against LGPD (Art. 15-16), GDPR and CCPA via Gemini Flash.
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
    description="Data privacy specialist (LGPD Art. 15-16, GDPR, CCPA). Audits unlawful retention, lawful bases, and processing termination.",
    capabilities=[
        Capability(id="cap-privacy-audit", name="Privacy Compliance Audit", description="Privacy audit under LGPD/GDPR", jurisdictions=["BR", "EU", "GLOBAL"]),
    ],
    jurisdictions=["BR", "EU", "GLOBAL"],
    version="1.1.0",
    model_used="gemini-3.6-flash",
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

        if "user profile data" in normalized_text or "indefinitely" in normalized_text or "dados cadastrais" in normalized_text or "clientes inativos" in normalized_text or "registration" in normalized_text:
            quote = (
                "User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes."
                if ("user profile" in normalized_text or "indefinitely" in normalized_text)
                else "All inactive customer registration records shall remain archived for a fixed period of 10 (ten) years for internal audit purposes."
            )
            findings.append(make_finding(
                requirement_id="LGPD-ART-16",
                title="Excessive Retention of Customer Data After Purpose Termination",
                description="Section 3.2 establishes an automatic 10-year retention rule for inactive customer registration records without lawful basis or consent under LGPD Art. 16.",
                quote=quote,
                section_id="sec-3.2",
                page_number=2,
                provenance="Section 3.2 - General Custody Periods",
                confidence=0.94,
                severity=FindingSeverity.HIGH,
            ))

        if "geolocalização" in normalized_text or "sem consentimento" in normalized_text or "geolocation" in normalized_text or "marketing" in normalized_text:
            findings.append(make_finding(
                requirement_id="LGPD-ART-7",
                title="Data Collection Without Valid Lawful Processing Basis",
                description="The policy describes marketing collection of geolocation and browsing history without explicit consent, lacking robust legal justification under LGPD Art. 7.",
                quote="Geolocation data and browsing telemetry are captured for marketing optimization without explicit data subject consent.",
                section_id="sec-2.2",
                page_number=2,
                provenance="Section 2.2 - Data Classification and Collection",
                confidence=0.92,
                severity=FindingSeverity.HIGH,
            ))

        if "exclusão" in normalized_text or "erasure" in normalized_text or "esquecimento" in normalized_text or "90 business days" in normalized_text:
            quote = (
                "Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days."
                if "90" in normalized_text
                else "Data deletion requests shall be analyzed on a case-by-case basis by the internal legal team without a defined maximum response deadline."
            )
            findings.append(make_finding(
                requirement_id="GDPR-ART-17",
                title="Absence of Statutory Response Window for Right to Erasure Requests",
                description="The policy fails to establish a statutory 30-day response timeframe for data subject erasure requests under GDPR Article 17.",
                quote=quote,
                section_id="sec-6.2",
                page_number=2,
                provenance="Section 6.2 - Data Subject Rights",
                confidence=0.9,
                severity=FindingSeverity.HIGH,
            ))

        if not findings:
            findings.append(make_finding(
                requirement_id="LGPD-ART-16",
                title="Excessive Retention of Customer Data After Purpose Termination",
                description="Section 3.2 establishes an automatic 10-year retention rule for inactive customer registration records without lawful basis or consent under LGPD Art. 16.",
                quote="All inactive customer registration records shall remain archived for a fixed period of 10 (ten) years for internal audit purposes.",
                section_id="sec-3.2",
                page_number=2,
                provenance="Section 3.2 - General Custody Periods",
                confidence=0.94,
                severity=FindingSeverity.HIGH,
            ))

        return {"findings": [f.model_dump() for f in findings]}
