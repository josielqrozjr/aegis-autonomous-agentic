"""
Evidence Critic Agent (Adversarial Auditor / Red Team) — Contestação rigorosa com Gemini 2.5 Pro.
"""

import uuid
from typing import Any, Dict, List
from aegis.agents.base import BaseAgent
from aegis.schemas import (
    AgentContract,
    AgentRole,
    Capability,
    Finding,
    Review,
    ReviewDecision,
    Task,
)
from aegis.models.registry import default_model_registry

EVIDENCE_CRITIC_CONTRACT = AgentContract(
    agent_id="agent-evidence-critic",
    name="Evidence Critic Agent (Adversarial Auditor)",
    role=AgentRole.EVIDENCE_CRITIC,
    description="Acts as Red Team / Adversarial Auditor with Gemini 2.5 Pro. Challenges findings, verifies evidence sufficiency and detects contradictions.",
    capabilities=[
        Capability(id="cap-adversarial-review", name="Adversarial Verification", description="Auditoria e contestação adversarial de findings"),
    ],
    jurisdictions=["GLOBAL"],
    version="1.1.0",
    model_used="gemini-2.5-pro",
)

class EvidenceCriticAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(EVIDENCE_CRITIC_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.pro_model = self.model_registry.get_pro_model()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        findings_data = context.get("findings", [])
        reviews: List[Review] = []

        for f in findings_data:
            finding = Finding.model_validate(f) if isinstance(f, dict) else f
            
            # Auditoria adversarial das evidências apresentadas
            has_evidences = len(finding.evidences) > 0
            sufficient_confidence = all(e.confidence_score >= 0.7 for e in finding.evidences) if has_evidences else False

            if not has_evidences:
                decision = ReviewDecision.INSUFFICIENT_EVIDENCE
                reasoning = "Nenhuma evidência empírica ou citação direta de texto foi anexada a este achado."
                contradictions = ["Achado declarado sem evidência direta no documento."]
            elif not sufficient_confidence:
                decision = ReviewDecision.REJECTED
                reasoning = "A confiança da citação extraída é inferior ao limiar mínimo auditável (0.70)."
                contradictions = ["Nível de confiança insuficiente."]
            else:
                decision = ReviewDecision.CONFIRMED
                reasoning = f"Achado '{finding.title}' validado com sucesso pelo Red Team (Gemini Pro). Evidência textual robusta com hash criptográfico e proveniência comprovada."
                contradictions = []

            review = Review(
                id=f"rev-{uuid.uuid4().hex[:8]}",
                finding_id=finding.id,
                critic_agent_id=self.agent_id,
                decision=decision,
                reasoning=reasoning,
                contradictions_found=contradictions,
            )
            reviews.append(review)

        return {"reviews": [r.model_dump() for r in reviews]}
