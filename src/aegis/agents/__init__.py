"""
Exportação dos Agentes Autônomos e Contratos do AEGIS.
"""

from aegis.agents.base import BaseAgent
from aegis.agents.document_understanding import DocumentUnderstandingAgent, DOCUMENT_UNDERSTANDING_CONTRACT
from aegis.agents.planner import PlannerAgent, PLANNER_CONTRACT
from aegis.agents.privacy import PrivacyAgent, PRIVACY_AGENT_CONTRACT
from aegis.agents.governance import GovernanceAgent, GOVERNANCE_AGENT_CONTRACT
from aegis.agents.security import SecurityAgent, SECURITY_AGENT_CONTRACT
from aegis.agents.evidence_critic import EvidenceCriticAgent, EVIDENCE_CRITIC_CONTRACT
from aegis.agents.remediation import RemediationAgent, REMEDIATION_AGENT_CONTRACT

__all__ = [
    "BaseAgent",
    "DocumentUnderstandingAgent",
    "DOCUMENT_UNDERSTANDING_CONTRACT",
    "PlannerAgent",
    "PLANNER_CONTRACT",
    "PrivacyAgent",
    "PRIVACY_AGENT_CONTRACT",
    "GovernanceAgent",
    "GOVERNANCE_AGENT_CONTRACT",
    "SecurityAgent",
    "SECURITY_AGENT_CONTRACT",
    "EvidenceCriticAgent",
    "EVIDENCE_CRITIC_CONTRACT",
    "RemediationAgent",
    "REMEDIATION_AGENT_CONTRACT",
]
