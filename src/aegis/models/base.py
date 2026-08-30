"""
Interface base para todos os modelos de IA utilizados no AEGIS.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class BaseLanguageModel(ABC):
    """
    Classe abstrata que padroniza a interação com modelos Google (Gemini, Gemma)
    e fallbacks determinísticos no AEGIS.
    """

    def __init__(self, model_name: str, model_role: str):
        self.model_name = model_name
        self.model_role = model_role

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        **kwargs: Any,
    ) -> str:
        """Gera texto a partir de um prompt e instrução de sistema opcional."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
        **kwargs: Any,
    ) -> T:
        """Gera uma saída fortemente tipada com base em um schema Pydantic."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Retorna o status de saúde e disponibilidade do modelo."""
        pass
