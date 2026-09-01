"""
Testes unitários para a Camada de Modelos de IA (Model Layer) do AEGIS.
"""

import sys
import os
import pytest
from pydantic import BaseModel

# Adiciona o diretório raiz e src ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.models import (
    BaseLanguageModel,
    GeminiFlashModel,
    GeminiProModel,
    GemmaPIIScanner,
    DeterministicFallbackModel,
    ModelRegistry,
    default_model_registry,
)

class SampleAnalysisSchema(BaseModel):
    jurisdiction: str
    document_type: str

@pytest.mark.asyncio
async def test_model_registry_resolution():
    registry = ModelRegistry()
    
    flash = registry.get_flash_model()
    pro = registry.get_pro_model()
    gemma = registry.get_gemma_scanner()
    fallback = registry.get_fallback_model()

    assert isinstance(flash, GeminiFlashModel)
    assert isinstance(pro, GeminiProModel)
    assert isinstance(gemma, GemmaPIIScanner)
    assert isinstance(fallback, DeterministicFallbackModel)

    # Resolução dinâmica por papel (role)
    assert isinstance(registry.get_model_for_role("adversarial_critic"), GeminiProModel)
    assert isinstance(registry.get_model_for_role("pii_privacy_scanner"), GemmaPIIScanner)
    assert isinstance(registry.get_model_for_role("privacy_specialist"), GeminiFlashModel)
    assert isinstance(registry.get_model_for_role("deterministic_fallback"), DeterministicFallbackModel)

@pytest.mark.asyncio
async def test_deterministic_fallback_generation():
    fallback = DeterministicFallbackModel()

    # 1. Geração de texto para Document Understanding
    text_res = await fallback.generate_text("Por favor, execute o document understanding na política de retenção.")
    assert "jurisdiction" in text_res
    assert "Retention" in text_res or "Retenção" in text_res


    # 2. Geração estruturada com Pydantic
    structured_res = await fallback.generate_structured(
        prompt="Extrair jurisdição e tipo do documento",
        response_schema=SampleAnalysisSchema,
    )
    assert structured_res.jurisdiction == "BR"
    assert "Retenção" in structured_res.document_type

@pytest.mark.asyncio
async def test_gemma_pii_scanner():
    scanner = GemmaPIIScanner(replay_mode=True)
    sample_text = (
        "O responsável DPO é contato@empresa.com.br, CPF 123.456.789-00, "
        "com acesso registrado a partir do IP 192.168.1.50."
    )

    result = await scanner.scan_and_sanitize(sample_text)
    assert result.pii_detected is True
    assert len(result.entities_found) >= 3
    assert "[CPF REDACTED]" in result.sanitized_text
    assert "[EMAIL REDACTED]" in result.sanitized_text
    assert "[IP REDACTED]" in result.sanitized_text
    assert "123.456.789-00" not in result.sanitized_text

@pytest.mark.asyncio
async def test_gemini_models_health_and_conformance():
    registry = ModelRegistry()
    conformance = await registry.get_conformance_report()

    assert conformance["multi_model_bonus_target"] == "+0.4"
    assert conformance["active_models_count"] == 3
    assert len(conformance["models"]) == 3

    model_names = [m["name"] for m in conformance["models"]]
    assert any("Flash" in m for m in model_names)
    assert "Gemma (PII Scanner)" in model_names
    assert "Gemini 2.5 Pro" in model_names


    for m in conformance["models"]:
        assert "health" in m
        assert m["health"]["status"] in ("healthy", "degraded")
