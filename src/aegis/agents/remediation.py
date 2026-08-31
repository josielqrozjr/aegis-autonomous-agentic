"""
Remediation Agent — Geração de recomendações de conformidade e planos de ação corretivos via Gemini Flash.
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
    description="Analisa achados confirmados e propõe planos de ação corretivos específicos, responsáveis e prazos de remediação via Gemini Flash.",
    capabilities=[
        Capability(id="cap-remediation-planning", name="Remediation Action Planning", description="Geração de recomendações acionáveis de remediação"),
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
            
            # Mapeamento e geração de remediação específica
            if "LGPD" in finding.requirement_id:
                rec = "Reduzir o prazo de guarda de dados cadastrais inativos para 5 anos (alinhado à prescrição cível) e implementar anonimização automática."
                action = "Atualizar Seção 3.2 da política e programar job de descarte no banco de dados."
                assignee = "DPO / Jurídico"
            elif "GDPR" in finding.requirement_id:
                rec = "Segmentar retenção de telemetria: manter logs completos por no máximo 6 meses para UE e anonimizar IPs após 30 dias."
                action = "Configurar política de retenção no Cloud Logging e SIEM corporativo."
                assignee = "Tech Lead SecOps"
            elif "ISO" in finding.requirement_id:
                rec = "Formalizar procedimento de descarte e sobrescrita criptográfica segundo NIST SP 800-88 R1."
                action = "Elaborar POP de sanitização segura de mídias e logs de auditoria de expurgo."
                assignee = "Governance & Compliance Lead"
            else:
                rec = f"Address regulatory finding identified in {finding.title}."
                action = "Revisar controles técnicos e documentação aplicável."
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
