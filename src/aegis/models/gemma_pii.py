"""
Adaptador para Gemma (Vertex AI / Local / Google GenAI) — PII & Sensitive Data Scanner.
"""

import os
import re
import logging
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel, Field
from aegis.models.base import BaseLanguageModel
from aegis.models.fallback import DeterministicFallbackModel

logger = logging.getLogger("aegis.models.gemma_pii")
T = TypeVar("T", bound=BaseModel)

class PIIScanResult(BaseModel):
    pii_detected: bool = False
    entities_found: List[Dict[str, Any]] = Field(default_factory=list)
    sanitized_text: str = ""
    safety_status: str = "PASSED"

class GemmaPIIScanner(BaseLanguageModel):
    """
    Scanner de privacidade e PII baseado em Gemma (Google Model Garden / GenAI).
    Atua como primeira camada de proteção antes do envio de documentos aos modelos principais (+0.2 bônus).
    """

    def __init__(
        self,
        model_name: str = "gemma-2-9b-it",
        api_key: Optional[str] = None,
        replay_mode: Optional[bool] = None,
    ):
        super().__init__(model_name=model_name, model_role="pii_privacy_scanner")
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.replay_mode = (
            replay_mode
            if replay_mode is not None
            else os.getenv("AEGIS_REPLAY_MODE", "false").lower() in ("true", "1", "yes")
        )
        self._fallback_provider = DeterministicFallbackModel(model_name=f"{model_name}-fallback", model_role="pii_privacy_scanner")
        self._client = None
        self._init_client()

    def _init_client(self) -> None:
        if self.replay_mode or not self.api_key:
            logger.info("GemmaPIIScanner operando em modo REPLAY/Fallback.")
            return
        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        except Exception as e:
            logger.warning(f"Não foi possível inicializar cliente para Gemma ({e}). Usando fallback regex/deterministic.")
            self._client = None

    def _deterministic_regex_scan(self, text: str) -> PIIScanResult:
        """Scan determinístico rápido via regex para garantir detecção mesmo offline."""
        if not text:
            return PIIScanResult(
                pii_detected=False,
                entities_found=[],
                sanitized_text="",
                safety_status="PASSED_CLEAN",
            )

        entities = []
        sanitized = text


        # CPF / Tax ID regex
        cpf_pattern = r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b'
        cpfs = re.findall(cpf_pattern, text)
        if cpfs:
            entities.append({"type": "CPF/TaxID", "count": len(cpfs), "sample_masked": "123.***.***-00"})
            sanitized = re.sub(cpf_pattern, "[CPF REDACTED]", sanitized)

        # Email regex
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            entities.append({"type": "Email", "count": len(emails), "sample_masked": "user@***.com"})
            sanitized = re.sub(email_pattern, "[EMAIL REDACTED]", sanitized)

        # IP address regex
        ip_pattern = r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'
        ips = re.findall(ip_pattern, text)
        if ips:
            entities.append({"type": "IP Address", "count": len(ips), "sample_masked": "192.168.***.***"})
            sanitized = re.sub(ip_pattern, "[IP REDACTED]", sanitized)

        pii_detected = len(entities) > 0
        return PIIScanResult(
            pii_detected=pii_detected,
            entities_found=entities,
            sanitized_text=sanitized,
            safety_status="PASSED_WITH_REDACTION" if pii_detected else "PASSED_CLEAN"
        )

    async def scan_and_sanitize(self, text: str) -> PIIScanResult:
        """Escaneia e mascara dados sensíveis no texto do documento."""
        if self._client is None or self.replay_mode:
            # Combinação de regex determinístico com fixture fallback
            return self._deterministic_regex_scan(text)

        try:
            prompt = (
                "You are the AEGIS Gemma Privacy Scanner. Analyze the following text, "
                "identifique dados pessoais (PII, CPFs, Emails, IPs, Nomes de titulares) e retorne "
                "a versão higienizada com redaction segura.\n\n"
                f"TEXTO:\n{text}"
            )
            return await self.generate_structured(prompt=prompt, response_schema=PIIScanResult)
        except Exception as e:
            logger.warning(f"Fallback para scanner determinístico Gemma ({e})")
            return self._deterministic_regex_scan(text)

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
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
        except Exception:
            return await self._fallback_provider.generate_text(
                prompt=prompt, system_instruction=system_instruction, temperature=temperature, **kwargs
            )

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.05,
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
        except Exception:
            return await self._fallback_provider.generate_structured(
                prompt=prompt, response_schema=response_schema, system_instruction=system_instruction, temperature=temperature, **kwargs
            )

    async def health_check(self) -> Dict[str, Any]:
        has_real_client = self._client is not None and not self.replay_mode
        return {
            "status": "healthy",
            "model_name": self.model_name,
            "provider": "Google Gemma (Model Garden)" if has_real_client else "Gemma Deterministic Scanner",
            "role": self.model_role,
            "api_key_configured": bool(self.api_key),
            "replay_mode": self.replay_mode,
        }
