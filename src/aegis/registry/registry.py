from typing import Dict, List, Optional
from aegis.schemas import AgentContract, AgentRole, Capability

class AgentRegistry:
    """
    Registry de Agentes do AEGIS.
    Permite registro dinâmico e descoberta de agentes com base em capacidades,
    jurisdições e papéis (roles).
    """

    def __init__(self):
        self._agents: Dict[str, AgentContract] = {}

    def register(self, agent: AgentContract) -> None:
        """Registra ou atualiza um agente no registro."""
        self._agents[agent.agent_id] = agent

    def get_agent(self, agent_id: str) -> Optional[AgentContract]:
        """Obtém contrato de um agente pelo ID."""
        return self._agents.get(agent_id)

    def list_agents(self) -> List[AgentContract]:
        """Lista todos os agentes registrados."""
        return list(self._agents.values())

    def discover_by_role(self, role: AgentRole) -> List[AgentContract]:
        """Descoberta por papel (role)."""
        return [a for a in self._agents.values() if a.role == role]

    def discover_by_capability(self, capability_id: str) -> List[AgentContract]:
        """Descoberta dinâmica por ID de capacidade (capability)."""
        matching = []
        for agent in self._agents.values():
            if any(cap.id == capability_id for cap in agent.capabilities):
                matching.append(agent)
        return matching

    def discover_by_jurisdiction(self, jurisdiction: str) -> List[AgentContract]:
        """Descoberta por jurisdição (ex: BR, EU, US, GLOBAL)."""
        matching = []
        for agent in self._agents.values():
            if "GLOBAL" in agent.jurisdictions or jurisdiction.upper() in [j.upper() for j in agent.jurisdictions]:
                matching.append(agent)
        return matching

    def discover_specialists(self, jurisdiction: str, capabilities: List[str]) -> List[AgentContract]:
        """
        Roteamento dinâmico: encontra agentes especialistas adequados para um documento
        com base na jurisdição e lista de capacidades requeridas.
        """
        candidates = self.discover_by_jurisdiction(jurisdiction)
        matched_agents = set()

        for agent in candidates:
            # Não incluir agentes core (Planner, DocumentUnderstanding) como especialistas de análise
            if agent.role in (AgentRole.PLANNER, AgentRole.DOCUMENT_UNDERSTANDING):
                continue
            for cap_id in capabilities:
                if any(c.id == cap_id for c in agent.capabilities):
                    matched_agents.add(agent.agent_id)

        return [self._agents[aid] for aid in matched_agents]


# Singleton padrão para o AgentRegistry no runtime do AEGIS
default_registry = AgentRegistry()
