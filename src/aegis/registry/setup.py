from aegis.registry.registry import default_registry, AgentRegistry
from aegis.agents import (
    DOCUMENT_UNDERSTANDING_CONTRACT,
    PLANNER_CONTRACT,
    PRIVACY_AGENT_CONTRACT,
    GOVERNANCE_AGENT_CONTRACT,
    SECURITY_AGENT_CONTRACT,
    EVIDENCE_CRITIC_CONTRACT,
    REMEDIATION_AGENT_CONTRACT,
    CHANGE_DETECTION_CONTRACT,
)

def init_default_registry(registry: AgentRegistry = default_registry) -> AgentRegistry:
    """
    Inicializa e registra os agentes nativos do AEGIS no Agent Registry.
    """
    registry.register(DOCUMENT_UNDERSTANDING_CONTRACT)
    registry.register(PLANNER_CONTRACT)
    registry.register(PRIVACY_AGENT_CONTRACT)
    registry.register(GOVERNANCE_AGENT_CONTRACT)
    registry.register(SECURITY_AGENT_CONTRACT)
    registry.register(EVIDENCE_CRITIC_CONTRACT)
    registry.register(REMEDIATION_AGENT_CONTRACT)
    registry.register(CHANGE_DETECTION_CONTRACT)
    return registry
