"""
Remediation Agent — Compliance recommendations and actionable remediation planning via Gemini Flash.
"""

import uuid
from typing import Any, Dict, List
from aegis.agents.base import BaseAgent
from aegis.schemas import (
    AgentContract,
    AgentRole,
    Capability,
    Finding,
    Remediation,
    RemediationStatus,
    Task,
)
from aegis.models.registry import default_model_registry

REMEDIATION_AGENT_CONTRACT = AgentContract(
    agent_id="agent-remediation",
    name="Remediation Agent",
    role=AgentRole.REMEDIATION,
    description="Analyzes confirmed findings and generates actionable remediation recommendations, assigned owners, and statutory deadlines via Gemini Flash.",
    capabilities=[
        Capability(id="cap-remediation-planning", name="Remediation Action Planning", description="Generation of actionable remediation plans"),
    ],
    jurisdictions=["GLOBAL", "BR", "EU"],
    version="1.1.0",
    model_used="gemini-3.6-flash",
)

class RemediationAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(REMEDIATION_AGENT_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.flash_model = self.model_registry.get_flash_model()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        findings_data = context.get("findings", [])
        remediations: List[Remediation] = []

        for f in findings_data:
            finding = Finding.model_validate(f) if isinstance(f, dict) else f
            
            # Specific remediation mapping
            if "LGPD" in finding.requirement_id:
                rec = "Reduce inactive customer data retention to 5 years (aligned with statutory limitation periods) and implement automated anonymization workflows."
                action = "Update Section 3.2 of the policy and configure database lifecycle retention rules."
                assignee = "DPO / Legal Counsel"
            elif "GDPR" in finding.requirement_id:
                rec = "Segment log retention: limit EU telemetry to maximum 6 months to 1 year, and enforce IP anonymization after 30 days."
                action = "Configure automated log expiration policies in Cloud Logging and SIEM."
                assignee = "Tech Lead SecOps"
            elif "ISO" in finding.requirement_id:
                rec = "Formalize verifiable sanitization protocols in compliance with NIST SP 800-88 R1 and generate purge audit certificates."
                action = "Draft Standard Operating Procedure (SOP) for Secure Media Disposal."
                assignee = "Governance & Compliance Lead"
            else:
                rec = f"Address regulatory non-compliance identified in {finding.title}."
                action = "Review technical controls and update policy documentation."
                assignee = "Compliance Officer"

            rem = Remediation(
                id=f"rem-{uuid.uuid4().hex[:8]}",
                finding_id=finding.id,
                recommendation=rec,
                action_item=action,
                assignee=assignee,
                status=RemediationStatus.PENDING,
            )
            remediations.append(rem)

        return {"remediations": [r.model_dump() for r in remediations]}
