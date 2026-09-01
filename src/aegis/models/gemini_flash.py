"""
Adaptador para o modelo Gemini 3.6 Flash — motor de raciocínio principal do AEGIS.
"""

import os
import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from aegis.models.base import BaseLanguageModel
from aegis.models.fallback import DeterministicFallbackModel

logger = logging.getLogger("aegis.models.gemini_flash")
T = TypeVar("T", bound=BaseModel)

class GeminiFlashModel(BaseLanguageModel):
    """
    Adaptador para o Gemini 3.6 Flash via Google GenAI SDK / Vertex AI.
    Possui fallback automático para modo determinístico quando em REPLAY_MODE ou na ausência de API Key.
    """

    def __init__(
        self,
        model_name: str = "gemini-2.5-flash",
        api_key: Optional[str] = None,
        replay_mode: Optional[bool] = None,
    ):

        super().__init__(model_name=model_name, model_role="primary_reasoning")
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.replay_mode = (
            replay_mode
            if replay_mode is not None
            else os.getenv("AEGIS_REPLAY_MODE", "false").lower() in ("true", "1", "yes")
        )
        self._fallback_provider = DeterministicFallbackModel(model_name=f"{model_name}-fallback")
        self._client = None
        self._init_client()

    def _init_client(self) -> None:
        if self.replay_mode or not self.api_key:
            logger.info(f"GeminiFlashModel operando em modo REPLAY/Fallback (API_KEY={'configurada' if self.api_key else 'ausente'}).")
            return
        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        except Exception as e:
            logger.warning(f"Não foi possível inicializar o cliente Google GenAI ({e}). Alternando para fallback determinístico.")
            self._client = None

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        **kwargs: Any,
    ) -> str:
        if self._client is None or self.replay_mode:
            return await self._fallback_provider.generate_text(
                prompt=prompt, system_instruction=system_instruction, temperature=temperature, **kwargs
            )
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return response.text or ""
        except Exception as e:
            logger.error(f"Erro na chamada do Gemini Flash ({e}). Acionando fallback resiliente.")
            return await self._fallback_provider.generate_text(
                prompt=prompt, system_instruction=system_instruction, temperature=temperature, **kwargs
            )

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
        **kwargs: Any,
    ) -> T:
        if self._client is None or self.replay_mode:
            return await self._fallback_provider.generate_structured(
                prompt=prompt, response_schema=response_schema, system_instruction=system_instruction, temperature=temperature, **kwargs
            )
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            raw_json = response.text or "{}"
            return response_schema.model_validate_json(raw_json)
        except Exception as e:
            logger.error(f"Erro na geração estruturada com Gemini Flash ({e}). Acionando fallback resiliente.")
            return await self._fallback_provider.generate_structured(
                prompt=prompt, response_schema=response_schema, system_instruction=system_instruction, temperature=temperature, **kwargs
            )

    async def health_check(self) -> Dict[str, Any]:
        has_real_client = self._client is not None and not self.replay_mode
        return {
            "status": "healthy" if (has_real_client or self.replay_mode) else "degraded",
            "model_name": self.model_name,
            "provider": "Google Vertex AI / GenAI" if has_real_client else "Deterministic Replay",
            "api_key_configured": bool(self.api_key),
            "replay_mode": self.replay_mode,
        }
