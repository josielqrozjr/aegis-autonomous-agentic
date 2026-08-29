from abc import ABC, abstractmethod
from typing import Any, Dict
from aegis.schemas import AgentContract, Task

class BaseAgent(ABC):
    """
    Classe base para todos os agentes autônomos no AEGIS.
    """

    def __init__(self, contract: AgentContract):
        self.contract = contract

    @property
    def agent_id(self) -> str:
        return self.contract.agent_id

    @property
    def role(self) -> str:
        return self.contract.role.value

    @abstractmethod
    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa a tarefa associada ao agente.
        """
        pass
