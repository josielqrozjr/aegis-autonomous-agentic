"""Impact analysis for regulatory changes — blast radius calculation.

Determines which investigations, findings, and evidence are affected
by a regulatory change, then triggers invalidation and reopening.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from aegis.schemas.contracts import Investigation, RegulatoryChange, Finding
from aegis.schemas.enums import InvestigationStatus, FindingStatus
from apps.api.app.domain.repositories import AuditEntry
from apps.api.app.domain.investigation.state_machine import can_transition


class ImpactAnalysisResult:
    def __init__(self):
        self.affected_investigations: List[str] = []
        self.affected_findings: List[str] = []
        self.affected_evidence_ids: List[str] = []
        self.reopened_investigations: List[str] = []
        self.invalidated_count: int = 0

    def to_dict(self) -> dict:
        return {
            "affected_investigations": self.affected_investigations,
            "affected_findings": self.affected_findings,
            "affected_evidence_ids": self.affected_evidence_ids,
            "reopened_investigations": self.reopened_investigations,
            "invalidated_count": self.invalidated_count,
        }


async def analyze_impact(
    change: RegulatoryChange,
    investigations: List[Investigation],
    audit_append=None,
) -> ImpactAnalysisResult:
    """Calculate blast radius of a regulatory change across all investigations."""
    result = ImpactAnalysisResult()

    for inv in investigations:
        affected_findings_in_inv: List[Finding] = []

        for finding in inv.findings:
            if finding.requirement_id in change.affected_requirements:
                affected_findings_in_inv.append(finding)
                result.affected_findings.append(finding.id)

                # Mark finding as needing re-evaluation
                if finding.status in (FindingStatus.CONFIRMED, FindingStatus.CLOSED, FindingStatus.REMEDIATED):
                    finding.status = FindingStatus.OPEN
                    finding.insufficient_evidence_reason = (
                        f"Reopened due to regulatory change: {change.framework} v{change.version}"
                    )

                # Collect affected evidence
                for ev in finding.evidences:
                    result.affected_evidence_ids.append(ev.id)
                    result.invalidated_count += 1

        if affected_findings_in_inv:
            result.affected_investigations.append(inv.id)

            # Reopen investigation if completed
            if inv.status == InvestigationStatus.COMPLETED and can_transition(inv.status, InvestigationStatus.REOPENED):
                inv.status = InvestigationStatus.REOPENED
                inv.updated_at = datetime.now(timezone.utc)
                result.reopened_investigations.append(inv.id)

                if audit_append:
                    await audit_append(
                        AuditEntry(
                            entry_id=str(uuid.uuid4()),
                            investigation_id=inv.id,
                            agent_id="change_detection",
                            action="INVESTIGATION_REOPENED",
                            details=(
                                f"Reopened due to {change.framework} v{change.version}. "
                                f"Affected findings: {[f.id for f in affected_findings_in_inv]}"
                            ),
                            timestamp=datetime.now(timezone.utc).isoformat(),
                        )
                    )

    return result
