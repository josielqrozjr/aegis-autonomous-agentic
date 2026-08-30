"""Investigation handler — orchestrates the full investigation pipeline.

Idempotent: checks current state before acting.
"""

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from aegis.schemas.contracts import (
    Investigation, Task, Finding, Evidence, Remediation,
    InvestigationPlan, TrustNode,
)
from aegis.schemas.enums import (
    InvestigationStatus, TaskStatus, AgentRole, FindingSeverity,
    FindingStatus, TrustNodeType,
)
from apps.api.app.domain.investigation.state_machine import can_transition, validate_transition
from apps.api.app.domain.repositories import AuditEntry


class InvestigationHandler:
    """Handles investigation execution through the pipeline stages."""

    def __init__(self, inv_repo, audit_repo, registry=None, trust_graph=None):
        self._inv_repo = inv_repo
        self._audit_repo = audit_repo
        self._registry = registry
        self._trust_graph = trust_graph

    async def _audit(self, inv_id: str, agent_id: Optional[str], action: str, details: str):
        await self._audit_repo.append(
            AuditEntry(
                entry_id=str(uuid.uuid4()),
                investigation_id=inv_id,
                agent_id=agent_id,
                action=action,
                details=details,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )

    async def handle(self, investigation_id: str) -> Dict[str, Any]:
        """Run the investigation pipeline. Idempotent — resumes from current state."""
        inv = await self._inv_repo.get(investigation_id)
        if inv is None:
            return {"error": "Investigation not found"}

        result = {"investigation_id": investigation_id, "steps_executed": []}

        pipeline = [
            (InvestigationStatus.QUEUED, InvestigationStatus.UNDERSTANDING, self._understand),
            (InvestigationStatus.UNDERSTANDING, InvestigationStatus.PLANNING, self._plan),
            (InvestigationStatus.PLANNING, InvestigationStatus.ROUTING, self._route),
            (InvestigationStatus.ROUTING, InvestigationStatus.ANALYZING, self._analyze),
            (InvestigationStatus.ANALYZING, InvestigationStatus.REVIEWING, self._review),
            (InvestigationStatus.REVIEWING, InvestigationStatus.COMPLETED, self._complete),
        ]

        for from_status, to_status, step_fn in pipeline:
            if inv.status == from_status:
                try:
                    validate_transition(inv.status, to_status)
                    await step_fn(inv)
                    inv.status = to_status
                    inv.updated_at = datetime.now(timezone.utc)
                    await self._inv_repo.save(inv)
                    await self._audit(inv.id, None, "PIPELINE_STEP", f"{from_status.value} → {to_status.value}")
                    result["steps_executed"].append(to_status.value)
                except Exception as e:
                    inv.status = InvestigationStatus.FAILED
                    inv.updated_at = datetime.now(timezone.utc)
                    await self._inv_repo.save(inv)
                    await self._audit(inv.id, None, "PIPELINE_FAILED", f"Failed at {from_status.value}: {e}")
                    result["error"] = str(e)
                    break

        result["final_status"] = inv.status.value
        return result

    async def _understand(self, inv: Investigation):
        """Document understanding: extract jurisdiction, entities, obligations."""
        doc = inv.document
        text = doc.raw_text or ""

        # Deterministic extraction (Gemini integration point for Dev 1)
        jurisdictions = []
        if any(kw in text.lower() for kw in ["lgpd", "brasil", "brazilian", "br"]):
            jurisdictions.append("BR")
        if any(kw in text.lower() for kw in ["gdpr", "eu", "european", "europa"]):
            jurisdictions.append("EU")
        if any(kw in text.lower() for kw in ["iso 27001", "iso27001"]):
            jurisdictions.append("GLOBAL")

        doc.jurisdiction = ",".join(jurisdictions) if jurisdictions else "GLOBAL"
        doc.document_type = "policy"

        entities = []
        obligations = []
        for kw in ["retention", "retenção", "data", "dados", "privacy", "privacidade", "security", "segurança"]:
            if kw in text.lower():
                entities.append(kw)
        for kw in ["must", "shall", "required", "obrigatório", "deve"]:
            if kw in text.lower():
                obligations.append(f"Obligation detected: '{kw}' found in document")

        doc.extracted_entities = entities
        doc.obligations = obligations

        # Add document node to trust graph
        if self._trust_graph:
            self._trust_graph.add_node(TrustNode(
                node_id=f"doc-{doc.id}",
                node_type=TrustNodeType.DOCUMENT,
                source=doc.filename,
                content_hash=hashlib.sha256((text or "").encode()).hexdigest(),
                jurisdiction=doc.jurisdiction,
            ))

        await self._audit(inv.id, "document-understanding", "DOCUMENT_UNDERSTOOD",
                          f"Jurisdictions: {jurisdictions}, Entities: {entities[:5]}")

    async def _plan(self, inv: Investigation):
        """Generate investigation plan with tasks."""
        doc = inv.document
        jurisdictions = (doc.jurisdiction or "GLOBAL").split(",")

        tasks: List[Task] = []
        agent_ids: List[str] = []

        # Determine required specialists based on jurisdiction
        specialist_map = {
            "BR": ("agent-privacy-specialist", AgentRole.PRIVACY_SPECIALIST, "Analyze LGPD compliance"),
            "GLOBAL": ("agent-governance-specialist", AgentRole.GOVERNANCE_SPECIALIST, "Analyze ISO 27001 compliance"),
            "EU": ("agent-security-specialist", AgentRole.SECURITY_SPECIALIST, "Analyze GDPR compliance"),
        }

        for j in jurisdictions:
            j = j.strip()
            if j in specialist_map:
                aid, role, desc = specialist_map[j]
                tasks.append(Task(
                    id=str(uuid.uuid4()),
                    investigation_id=inv.id,
                    agent_id=aid,
                    agent_role=role,
                    description=desc,
                ))
                agent_ids.append(aid)

        # Always add evidence critic
        tasks.append(Task(
            id=str(uuid.uuid4()),
            investigation_id=inv.id,
            agent_id="agent-evidence-critic",
            agent_role=AgentRole.EVIDENCE_CRITIC,
            description="Adversarial review of findings",
            dependencies=[t.id for t in tasks],  # depends on all specialists
        ))
        agent_ids.append("agent-evidence-critic")

        inv.plan = InvestigationPlan(
            investigation_id=inv.id,
            summary=f"Investigation plan for {doc.filename}: {len(tasks)} tasks across {jurisdictions}",
            assigned_agent_ids=agent_ids,
            tasks=tasks,
        )

        await self._audit(inv.id, "planner", "PLAN_CREATED",
                          f"Plan: {len(tasks)} tasks, agents: {agent_ids}")

    async def _route(self, inv: Investigation):
        """Dynamic routing: verify agents exist in registry."""
        if not inv.plan:
            return

        if self._registry:
            for task in inv.plan.tasks:
                agent = self._registry.get_agent(task.agent_id)
                if agent is None:
                    task.error = f"Agent {task.agent_id} not found in registry"
                    task.status = TaskStatus.FAILED

                    await self._audit(inv.id, task.agent_id, "AGENT_NOT_FOUND",
                                      f"Agent {task.agent_id} not available")

        await self._audit(inv.id, "router", "ROUTING_COMPLETE",
                          f"Routed {len(inv.plan.tasks)} tasks")

    async def _analyze(self, inv: Investigation):
        """Execute specialist agents and produce findings."""
        if not inv.plan:
            return

        for task in inv.plan.tasks:
            if task.status == TaskStatus.FAILED:
                continue
            if task.agent_role == AgentRole.EVIDENCE_CRITIC:
                continue  # critic runs in review phase

            task.status = TaskStatus.RUNNING

            # Deterministic analysis (Gemini integration point for Dev 1)
            finding_id = str(uuid.uuid4())
            evidence_id = str(uuid.uuid4())
            text = inv.document.raw_text or ""

            evidence = Evidence(
                id=evidence_id,
                document_id=inv.document.id,
                page_number=1,
                quote=text[:200] if text else "No text extracted",
                provenance=f"{inv.document.filename} p.1",
                confidence_score=0.85,
                content_hash=hashlib.sha256(text.encode()).hexdigest(),
            )

            requirement_id = {
                AgentRole.PRIVACY_SPECIALIST: "LGPD-ART-15",
                AgentRole.GOVERNANCE_SPECIALIST: "ISO27001-A.8.10",
                AgentRole.SECURITY_SPECIALIST: "GDPR-ART-5-1-E",
            }.get(task.agent_role, "UNKNOWN")

            finding = Finding(
                id=finding_id,
                investigation_id=inv.id,
                requirement_id=requirement_id,
                agent_id=task.agent_id,
                title=f"{task.agent_role.value} analysis finding",
                description=f"Analysis by {task.agent_id} for {requirement_id}",
                severity=FindingSeverity.MEDIUM,
                confidence=0.85,
                evidences=[evidence],
            )
            inv.findings.append(finding)

            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)
            task.result = {"finding_id": finding_id}

            # Add nodes to trust graph
            if self._trust_graph:
                self._trust_graph.add_node(TrustNode(
                    node_id=f"ev-{evidence_id}",
                    node_type=TrustNodeType.EVIDENCE,
                    source=f"{inv.document.filename} p.1",
                    agent_id=task.agent_id,
                    confidence=evidence.confidence_score,
                    content_hash=evidence.content_hash,
                    dependencies=[f"doc-{inv.document.id}"],
                ))
                self._trust_graph.add_node(TrustNode(
                    node_id=f"finding-{finding_id}",
                    node_type=TrustNodeType.FINDING,
                    source=task.agent_id,
                    agent_id=task.agent_id,
                    confidence=finding.confidence,
                    dependencies=[f"ev-{evidence_id}"],
                    metadata={"requirement_id": requirement_id},
                ))

            await self._audit(inv.id, task.agent_id, "FINDING_CREATED",
                              f"Finding {finding_id} for {requirement_id}")

    async def _review(self, inv: Investigation):
        """Adversarial review of findings by Evidence Critic."""
        from aegis.schemas.contracts import Review
        from aegis.schemas.enums import ReviewDecision

        for finding in inv.findings:
            review_id = str(uuid.uuid4())
            # Deterministic review (Gemini Pro integration point for Dev 1)
            decision = ReviewDecision.CONFIRMED
            reasoning = f"Evidence supports finding '{finding.title}' with confidence {finding.confidence}"

            if finding.confidence < 0.5:
                decision = ReviewDecision.INSUFFICIENT_EVIDENCE
                reasoning = f"Low confidence ({finding.confidence}) — insufficient evidence"
                finding.status = FindingStatus.INSUFFICIENT_EVIDENCE

            review = Review(
                id=review_id,
                finding_id=finding.id,
                critic_agent_id="agent-evidence-critic",
                decision=decision,
                reasoning=reasoning,
            )
            inv.reviews.append(review)

            if decision == ReviewDecision.CONFIRMED:
                finding.status = FindingStatus.CONFIRMED

            await self._audit(inv.id, "agent-evidence-critic", "REVIEW_COMPLETED",
                              f"Finding {finding.id}: {decision.value}")

        # Mark critic task as completed
        if inv.plan:
            for task in inv.plan.tasks:
                if task.agent_role == AgentRole.EVIDENCE_CRITIC:
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.now(timezone.utc)

    async def _complete(self, inv: Investigation):
        """Consolidate and generate remediations for confirmed findings."""
        for finding in inv.findings:
            if finding.status == FindingStatus.CONFIRMED:
                rem = Remediation(
                    id=str(uuid.uuid4()),
                    finding_id=finding.id,
                    recommendation=f"Address {finding.title}: review and update policy to comply with {finding.requirement_id}",
                    action_item=f"Update document section related to {finding.requirement_id}",
                )
                inv.remediations.append(rem)

                await self._audit(inv.id, "remediation", "REMEDIATION_CREATED",
                                  f"Remediation for finding {finding.id}")

        await self._audit(inv.id, None, "INVESTIGATION_COMPLETED",
                          f"Completed with {len(inv.findings)} findings, {len(inv.remediations)} remediations")
