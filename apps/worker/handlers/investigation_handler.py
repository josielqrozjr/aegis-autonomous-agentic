"""Investigation handler — orchestrates the full investigation pipeline with AEGIS Autonomous Agents.

Idempotent: checks current state before acting.
"""

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from aegis.schemas.contracts import (
    Investigation, Task, Finding, Evidence, Remediation,
    InvestigationPlan, TrustNode, Review,
)
from aegis.schemas.enums import (
    InvestigationStatus, TaskStatus, AgentRole, FindingSeverity,
    FindingStatus, TrustNodeType, ReviewDecision,
)
from apps.api.app.domain.investigation.state_machine import can_transition, validate_transition
from apps.api.app.domain.repositories import AuditEntry

from aegis.agents.document_understanding import DocumentUnderstandingAgent
from aegis.agents.planner import PlannerAgent
from aegis.agents.privacy import PrivacyAgent
from aegis.agents.governance import GovernanceAgent
from aegis.agents.security import SecurityAgent
from aegis.agents.evidence_critic import EvidenceCriticAgent
from aegis.agents.remediation import RemediationAgent

from aegis.registry.setup import init_default_registry
from aegis.registry.registry import default_registry, AgentRegistry


class InvestigationHandler:
    """Handles investigation execution through the pipeline stages."""

    def __init__(self, inv_repo, audit_repo, registry=None, trust_graph=None):
        self._inv_repo = inv_repo
        self._audit_repo = audit_repo
        if registry is None:
            init_default_registry(default_registry)
            self._registry = default_registry
        else:
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
        """Document understanding: Gemma PII scan + Gemini Flash extraction."""
        doc = inv.document
        doc_agent = DocumentUnderstandingAgent()
        understanding_result = await doc_agent.execute_task(
            task=None, context={"document": doc.model_dump()}
        )

        doc.jurisdiction = understanding_result.get("jurisdiction", "GLOBAL")
        doc.document_type = understanding_result.get("document_type", "policy")
        doc.extracted_entities = understanding_result.get("extracted_entities", [])
        doc.obligations = understanding_result.get("obligations", [])

        # Add document node to trust graph
        if self._trust_graph:
            self._trust_graph.add_node(TrustNode(
                node_id=f"doc-{doc.id}",
                node_type=TrustNodeType.DOCUMENT,
                source=doc.filename,
                content_hash=hashlib.sha256((doc.raw_text or "").encode()).hexdigest(),
                jurisdiction=doc.jurisdiction,
            ))

        await self._audit(
            inv.id,
            doc_agent.agent_id,
            "DOCUMENT_UNDERSTOOD",
            f"Jurisdiction: {doc.jurisdiction}, Entities: {len(doc.extracted_entities)}, Obligations: {len(doc.obligations)}",
        )

    async def _plan(self, inv: Investigation):
        """Generate investigation plan with tasks using PlannerAgent."""
        planner = PlannerAgent(registry=self._registry)
        plan = await planner.create_plan(
            investigation_id=inv.id,
            document_analysis={
                "jurisdiction": inv.document.jurisdiction,
                "obligations": inv.document.obligations,
            },
        )
        inv.plan = plan

        await self._audit(
            inv.id,
            planner.agent_id,
            "PLAN_CREATED",
            f"Plan created with {len(plan.tasks)} tasks, assigned agents: {plan.assigned_agent_ids}",
        )

    async def _route(self, inv: Investigation):
        """Dynamic routing: verify agents exist in registry, add agent nodes to trust graph."""
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
                elif self._trust_graph:
                    # Add agent node to trust graph
                    self._trust_graph.add_node(TrustNode(
                        node_id=f"agent-{task.agent_id}",
                        node_type=TrustNodeType.AGENT,
                        source=agent.name,
                        agent_id=task.agent_id,
                        confidence=1.0,
                        metadata={"role": task.agent_role.value, "model": agent.model_used or "gemini-3.6-flash"},
                    ))

        await self._audit(inv.id, "router", "ROUTING_COMPLETE",
                          f"Routed {len(inv.plan.tasks)} tasks")

    async def _analyze(self, inv: Investigation):
        """Execute specialist agents and produce findings with SHA-256 evidence."""
        if not inv.plan:
            return

        specialist_factories = {
            AgentRole.PRIVACY_SPECIALIST: PrivacyAgent,
            AgentRole.GOVERNANCE_SPECIALIST: GovernanceAgent,
            AgentRole.SECURITY_SPECIALIST: SecurityAgent,
        }

        for task in inv.plan.tasks:
            if task.status == TaskStatus.FAILED:
                continue
            if task.agent_role in (AgentRole.EVIDENCE_CRITIC, AgentRole.REMEDIATION_SPECIALIST, AgentRole.REMEDIATION):
                continue  # Critic and Remediation run in later stages

            agent_cls = specialist_factories.get(task.agent_role)
            if not agent_cls:
                continue

            task.status = TaskStatus.RUNNING
            agent_instance = agent_cls()
            result = await agent_instance.execute_task(task, {"document": inv.document.model_dump()})

            task_findings = result.get("findings", [])
            for f_data in task_findings:
                finding = Finding.model_validate(f_data) if isinstance(f_data, dict) else f_data
                inv.findings.append(finding)

                # Add nodes to trust graph
                if self._trust_graph:
                    doc_node_id = f"doc-{inv.document.id}" if self._trust_graph.get_node(f"doc-{inv.document.id}") else inv.document.id

                    # Add requirement node (if not already added)
                    req_node_id = f"req-{finding.requirement_id}"
                    if not self._trust_graph.get_node(req_node_id):
                        self._trust_graph.add_node(TrustNode(
                            node_id=req_node_id,
                            node_type=TrustNodeType.REQUIREMENT,
                            source=finding.requirement_id,
                            confidence=1.0,
                            metadata={"regulation": finding.requirement_id},
                        ))

                    # Add evidence nodes
                    for ev in finding.evidences:
                        self._trust_graph.add_node(TrustNode(
                            node_id=ev.id,
                            node_type=TrustNodeType.EVIDENCE,
                            source=ev.provenance,
                            agent_id=task.agent_id,
                            confidence=ev.confidence_score,
                            content_hash=ev.content_hash or hashlib.sha256(ev.quote.encode()).hexdigest(),
                            dependencies=[doc_node_id, f"agent-{task.agent_id}"],
                        ))

                    # Add finding node (depends on evidence + requirement)
                    self._trust_graph.add_node(TrustNode(
                        node_id=finding.id,
                        node_type=TrustNodeType.FINDING,
                        source=task.agent_id,
                        agent_id=task.agent_id,
                        confidence=finding.confidence,
                        dependencies=[ev.id for ev in finding.evidences] + [req_node_id],
                        metadata={"requirement_id": finding.requirement_id},
                    ))


            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)
            task.result = {"findings_count": len(task_findings)}

            await self._audit(
                inv.id,
                task.agent_id,
                "FINDING_CREATED",
                f"{len(task_findings)} findings produced for task {task.id}",
            )

    async def _review(self, inv: Investigation):
        """Adversarial review of findings by EvidenceCriticAgent (Gemini 2.5 Pro)."""
        critic = EvidenceCriticAgent()
        review_result = await critic.execute_task(
            task=None,
            context={"findings": [f.model_dump() for f in inv.findings]},
        )

        reviews_data = review_result.get("reviews", [])
        for r_data in reviews_data:
            review = Review.model_validate(r_data) if isinstance(r_data, dict) else r_data
            inv.reviews.append(review)

            # Sincroniza status do finding com o parecer do Red Team
            for finding in inv.findings:
                if finding.id == review.finding_id:
                    if review.decision == ReviewDecision.CONFIRMED:
                        finding.status = FindingStatus.CONFIRMED
                    elif review.decision == ReviewDecision.REJECTED:
                        finding.status = FindingStatus.REJECTED
                    elif review.decision == ReviewDecision.INSUFFICIENT_EVIDENCE:
                        finding.status = FindingStatus.INSUFFICIENT_EVIDENCE

            await self._audit(
                inv.id,
                critic.agent_id,
                "REVIEW_COMPLETED",
                f"Finding {review.finding_id}: {review.decision.value}",
            )

        # Mark critic task as completed
        if inv.plan:
            for task in inv.plan.tasks:
                if task.agent_role == AgentRole.EVIDENCE_CRITIC:
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.now(timezone.utc)

    async def _complete(self, inv: Investigation):
        """Consolidate and generate structured remediations via RemediationAgent."""
        confirmed_findings = [f.model_dump() for f in inv.findings if f.status == FindingStatus.CONFIRMED]
        
        if confirmed_findings:
            rem_agent = RemediationAgent()
            rem_result = await rem_agent.execute_task(task=None, context={"findings": confirmed_findings})
            rems_data = rem_result.get("remediations", [])
            for r_data in rems_data:
                rem = Remediation.model_validate(r_data) if isinstance(r_data, dict) else r_data
                inv.remediations.append(rem)

                await self._audit(
                    inv.id,
                    rem_agent.agent_id,
                    "REMEDIATION_CREATED",
                    f"Remediation created for finding {rem.finding_id}",
                )

        await self._audit(
            inv.id,
            None,
            "INVESTIGATION_COMPLETED",
            f"Completed with {len(inv.findings)} findings, {len(inv.remediations)} remediations",
        )
