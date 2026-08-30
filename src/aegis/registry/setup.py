from aegis.registry.registry import default_registry, AgentRegistry
from aegis.agents.document_understanding import DOCUMENT_UNDERSTANDING_CONTRACT
from aegis.agents.planner import PLANNER_CONTRACT
from aegis.agents.privacy import PRIVACY_AGENT_CONTRACT
from aegis.agents.governance import GOVERNANCE_AGENT_CONTRACT
from aegis.agents.security import SECURITY_AGENT_CONTRACT
from aegis.agents.evidence_critic import EVIDENCE_CRITIC_CONTRACT
from aegis.agents.remediation import REMEDIATION_AGENT_CONTRACT
from aegis.agents.change_detection import CHANGE_DETECTION_CONTRACT

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
