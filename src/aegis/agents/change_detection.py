"""
Change Detection Agent — Monitoramento contínuo de alterações regulatórias, cálculo de blast radius e selective recovery.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from aegis.agents.base import BaseAgent
from aegis.schemas import (
    AgentContract,
    AgentRole,
    Capability,
    RegulatoryChange,
    Investigation,
    Finding,
    FindingStatus,
    Task,
)
from aegis.models.registry import default_model_registry
from apps.api.app.domain.trust_graph.graph import TrustGraph
from aegis.agents.security import SecurityAgent
from aegis.agents.privacy import PrivacyAgent
from aegis.agents.governance import GovernanceAgent
from aegis.agents.remediation import RemediationAgent

CHANGE_DETECTION_CONTRACT = AgentContract(
    agent_id="agent-change-detection",
    name="Change Detection Agent",
    role=AgentRole.CHANGE_DETECTION,
    description="Detecta alterações normativas, calcula blast radius no Trust Graph, invalida evidências dependentes e orquestra Selective Recovery autônomo.",
    capabilities=[
        Capability(id="cap-change-detection", name="Regulatory Change Detection", description="Detecção de mudanças em legislações e frameworks"),
        Capability(id="cap-impact-analysis", name="Blast Radius & Impact Analysis", description="Cálculo de raio de impacto e cascata de invalidação"),
        Capability(id="cap-selective-recovery", name="Selective Re-evaluation", description="Reexecução seletiva de especialistas apenas nos achados afetados"),
    ],
    jurisdictions=["GLOBAL", "BR", "EU"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class ChangeDetectionAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(CHANGE_DETECTION_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.flash_model = self.model_registry.get_flash_model()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        change_data = context.get("regulatory_change")
        if not change_data:
            raise ValueError("Dados da mudança regulatória não fornecidos no contexto")

        change = RegulatoryChange.model_validate(change_data) if isinstance(change_data, dict) else change_data
        investigations_data = context.get("investigations", [])
        graph = context.get("trust_graph")

        result = await self.process_policy_drift(change, investigations_data, graph)
        return result

    async def process_policy_drift(
        self,
        change: RegulatoryChange,
        investigations: List[Investigation],
        graph: Optional[TrustGraph] = None,
    ) -> Dict[str, Any]:
        """
        Executa o fluxo completo do Policy Drift:
        1. Identifica achados e evidências afetadas
        2. Invalida nós no Trust Graph (cascata)
        3. Reabre a investigação e achados para status OPEN
        4. Dispara Selective Recovery: reexecuta apenas os especialistas necessários
        5. Gera novas remediações automáticas
        """
        affected_inv_ids = []
        affected_finding_ids = []
        new_findings: List[Dict[str, Any]] = []
        new_remediations: List[Dict[str, Any]] = []
        invalidated_nodes = []

        for inv in investigations:
            reopened_findings = []

            for finding in inv.findings:
                if finding.requirement_id in change.affected_requirements:
                    finding.status = FindingStatus.OPEN
                    finding.affected_by_change = True
                    finding.insufficient_evidence_reason = (
                        f"Reaberto automaticamente devido à alteração regulatória {change.framework} v{change.version}: {change.change_description}"
                    )
                    affected_finding_ids.append(finding.id)
                    reopened_findings.append(finding)

                    # Invalidação no Trust Graph
                    if graph:
                        for ev in finding.evidences:
                            inv_res = graph.invalidate(ev.id, f"Invalidado por mudança normativa em {change.framework}")
                            invalidated_nodes.extend(inv_res)

            if reopened_findings:
                affected_inv_ids.append(inv.id)
                inv.status = "reopened"
                inv.updated_at = datetime.now(timezone.utc)

                # Selective Recovery: Reexecutar especialista afetado
                if any("GDPR" in f.requirement_id for f in reopened_findings):
                    sec_agent = SecurityAgent()
                    sec_res = await sec_agent.execute_task(
                        task=Task(
                            id=f"task-drift-{uuid.uuid4().hex[:6]}",
                            investigation_id=inv.id,
                            agent_id=sec_agent.agent_id,
                            agent_role=sec_agent.role,
                            description=f"Selective re-evaluation for GDPR drift: {change.change_description}",
                        ),
                        context={"document": inv.document.model_dump()},
                    )
                    new_findings.extend(sec_res.get("findings", []))

                if any("LGPD" in f.requirement_id for f in reopened_findings):
                    priv_agent = PrivacyAgent()
                    priv_res = await priv_agent.execute_task(
                        task=Task(
                            id=f"task-drift-{uuid.uuid4().hex[:6]}",
                            investigation_id=inv.id,
                            agent_id=priv_agent.agent_id,
                            agent_role=priv_agent.role,
                            description=f"Selective re-evaluation for LGPD drift: {change.change_description}",
                        ),
                        context={"document": inv.document.model_dump()},
                    )
                    new_findings.extend(priv_res.get("findings", []))

                # Atualizar remediações para os novos achados
                if new_findings:
                    rem_agent = RemediationAgent()
                    rem_res = await rem_agent.execute_task(
                        task=None,
                        context={"findings": new_findings},
                    )
                    new_remediations.extend(rem_res.get("remediations", []))

        return {
            "change_id": change.id,
            "framework": change.framework,
            "version": change.version,
            "affected_investigations": affected_inv_ids,
            "affected_findings": affected_finding_ids,
            "invalidated_nodes": list(set(invalidated_nodes)),
            "new_findings": new_findings,
            "new_remediations": new_remediations,
            "status": "selective_recovery_completed",
        }
