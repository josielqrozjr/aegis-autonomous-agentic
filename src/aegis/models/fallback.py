"""
Implementação de Fallback Determinístico (REPLAY_MODE) para testes offline e resiliência na demo.
"""

import json
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from aegis.models.base import BaseLanguageModel
from aegis.models.fixtures import (
    DEMO_DOCUMENT_UNDERSTANDING,
    DEMO_PII_SCAN,
    DEMO_PRIVACY_FINDINGS,
    DEMO_SECURITY_FINDINGS,
    DEMO_GOVERNANCE_FINDINGS,
    DEMO_EVIDENCE_CRITIC_REVIEWS,
    DEMO_REMEDIATIONS,
    DEMO_POLICY_DRIFT_IMPACT,
)

T = TypeVar("T", bound=BaseModel)

class DeterministicFallbackModel(BaseLanguageModel):
    """
    Modelo determinístico baseado em fixtures pré-gravadas da Política de Retenção de Dados.
    Garante execução com 100% de confiabilidade em modo replay ou quando a API do Gemini estiver offline.
    """

    def __init__(self, model_name: str = "deterministic-fallback", model_role: str = "general"):
        super().__init__(model_name=model_name, model_role=model_role)

    def _resolve_fixture_data(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        if "pii" in prompt_lower or "sanitiz" in prompt_lower or "sensitive" in prompt_lower:
            return DEMO_PII_SCAN
        if "critic" in prompt_lower or "adversarial" in prompt_lower or "red team" in prompt_lower or "review" in prompt_lower:
            return DEMO_EVIDENCE_CRITIC_REVIEWS
        if "remediat" in prompt_lower or "recomenda" in prompt_lower or "action" in prompt_lower:
            return DEMO_REMEDIATIONS
        if "drift" in prompt_lower or "regulatory change" in prompt_lower or "mudança regulatória" in prompt_lower or "impact" in prompt_lower:
            return DEMO_POLICY_DRIFT_IMPACT
        if "privacy" in prompt_lower or "lgpd" in prompt_lower:
            return DEMO_PRIVACY_FINDINGS
        if "security" in prompt_lower or "gdpr" in prompt_lower:
            return DEMO_SECURITY_FINDINGS
        if "governance" in prompt_lower or "iso27001" in prompt_lower or "iso 27001" in prompt_lower:
            return DEMO_GOVERNANCE_FINDINGS
        if "document understanding" in prompt_lower or "extração" in prompt_lower or "classificação" in prompt_lower or "understanding" in prompt_lower:
            return DEMO_DOCUMENT_UNDERSTANDING
            
        # Fallback default
        return DEMO_DOCUMENT_UNDERSTANDING

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        **kwargs: Any,
    ) -> str:
        data = self._resolve_fixture_data(prompt)
        return json.dumps(data, indent=2, ensure_ascii=False)

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
        **kwargs: Any,
    ) -> T:
        data = self._resolve_fixture_data(prompt)
        try:
            return response_schema.model_validate(data)
        except Exception:
            # Se o schema for de lista direta ou campo envelopado
            try:
                return response_schema.model_validate({"items": data} if isinstance(data, list) else data)
            except Exception:
                # Criar instância padrão
                return response_schema.model_construct(**(data if isinstance(data, dict) else {}))

    async def health_check(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "model_name": self.model_name,
            "mode": "deterministic_replay",
            "latency_ms": 0.5,
            "quota_status": "unlimited"
        }
