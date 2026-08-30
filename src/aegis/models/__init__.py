"""
Camada de Modelos de IA do AEGIS — Suporte Multi-Modelo Google e Fallback Determinístico.
"""

from aegis.models.base import BaseLanguageModel
from aegis.models.gemini_flash import GeminiFlashModel
from aegis.models.gemini_pro import GeminiProModel
from aegis.models.gemma_pii import GemmaPIIScanner, PIIScanResult
from aegis.models.fallback import DeterministicFallbackModel
from aegis.models.registry import ModelRegistry, default_model_registry

__all__ = [
    "BaseLanguageModel",
    "GeminiFlashModel",
    "GeminiProModel",
    "GemmaPIIScanner",
    "PIIScanResult",
    "DeterministicFallbackModel",
    "ModelRegistry",
    "default_model_registry",
]
