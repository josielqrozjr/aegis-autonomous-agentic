"""Failure-aware agent execution handler.

Implements: retry → substitute → degrade → block report as INCOMPLETE.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from aegis.schemas.contracts import Investigation, Task
from aegis.schemas.enums import TaskStatus, FindingStatus, InvestigationStatus
from aegis.registry.registry import AgentRegistry
from apps.api.app.domain.repositories import AuditEntry

MAX_RETRIES = 2


class FailureHandler:
    def __init__(self, registry: AgentRegistry, audit_append=None):
        self._registry = registry
        self._audit_append = audit_append

    async def _log_audit(self, investigation_id: str, agent_id: str, action: str, details: str):
        if self._audit_append:
            await self._audit_append(
                AuditEntry(
                    entry_id=str(uuid.uuid4()),
                    investigation_id=investigation_id,
                    agent_id=agent_id,
                    action=action,
                    details=details,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                )
            )

    async def handle_task_failure(
        self,
        investigation: Investigation,
        task: Task,
        error: str,
    ) -> Dict[str, Any]:
        """Handle a failed task: retry, substitute, or degrade."""
        result = {
            "action": "none",
            "retried": False,
            "substituted": False,
            "degraded": False,
            "blocked": False,
        }

        retry_count = task.result.get("retry_count", 0) if task.result else 0

        # Step 1: Retry if under limit
        if retry_count < MAX_RETRIES:
            task.status = TaskStatus.QUEUED
            if task.result is None:
                task.result = {}
            task.result["retry_count"] = retry_count + 1
            task.error = None
            result["action"] = "retry"
            result["retried"] = True
            await self._log_audit(
                investigation.id, task.agent_id, "TASK_RETRY",
                f"Retry {retry_count + 1}/{MAX_RETRIES} for task {task.id}: {error}",
            )
            return result

        # Step 2: Try substitute agent
        substitute = self._find_substitute(task.agent_id)
        if substitute:
            task.agent_id = substitute
            task.status = TaskStatus.QUEUED
            if task.result is None:
                task.result = {}
            task.result["retry_count"] = 0
            task.result["substituted_from"] = task.agent_id
            task.error = None
            result["action"] = "substitute"
            result["substituted"] = True
            await self._log_audit(
                investigation.id, task.agent_id, "AGENT_SUBSTITUTED",
                f"Agent substituted to {substitute} for task {task.id}",
            )
            return result

        # Step 3: Degrade — mark affected findings
        task.status = TaskStatus.FAILED
        task.error = error
        for finding in investigation.findings:
            if finding.agent_id == task.agent_id:
                finding.status = FindingStatus.INSUFFICIENT_EVIDENCE
                finding.insufficient_evidence_reason = f"Agent {task.agent_id} failed: {error}"

        result["action"] = "degrade"
        result["degraded"] = True

        # Step 4: Block report as INCOMPLETE if any task failed
        has_failed = any(t.status == TaskStatus.FAILED for t in (investigation.plan.tasks if investigation.plan else []))
        if has_failed:
            result["blocked"] = True

        await self._log_audit(
            investigation.id, task.agent_id, "TASK_DEGRADED",
            f"Task {task.id} permanently failed. Findings degraded. Report blocked={result['blocked']}",
        )
        return result

    def _find_substitute(self, failed_agent_id: str) -> Optional[str]:
        """Find a substitute agent with same capabilities."""
        failed_agent = self._registry.get_agent(failed_agent_id)
        if not failed_agent:
            return None

        for cap in failed_agent.capabilities:
            candidates = self._registry.discover_by_capability(cap.id)
            for candidate in candidates:
                if candidate.agent_id != failed_agent_id:
                    return candidate.agent_id
        return None
