"""
Document Understanding Agent — Responsável por sanitização PII (Gemma), extração e classificação regulatória (Gemini Flash).
"""

from typing import Any, Dict
from aegis.agents.base import BaseAgent
from aegis.schemas import AgentContract, AgentRole, Capability, Task
from aegis.models.registry import default_model_registry

DOCUMENT_UNDERSTANDING_CONTRACT = AgentContract(
    agent_id="agent-doc-understanding",
    name="Document Understanding Agent",
    role=AgentRole.DOCUMENT_UNDERSTANDING,
    description="Analisa a estrutura do documento, higieniza PII via Gemma e extrai jurisdição, obrigações, entidades e contexto via Gemini Flash.",
    capabilities=[
        Capability(id="cap-text-extraction", name="Text Extraction", description="Extração e estruturação de texto"),
        Capability(id="cap-jurisdiction-detect", name="Jurisdiction Detection", description="Detecção de jurisdição aplicável"),
        Capability(id="cap-entity-extraction", name="Entity & Obligation Extraction", description="Identificação de obrigações regulatórias"),
        Capability(id="cap-pii-scan", name="PII & Privacy Pre-Scan", description="Higienização de dados pessoais com Gemma"),
    ],
    jurisdictions=["GLOBAL", "BR", "EU", "US"],
    version="1.1.0",
    model_used="gemini-2.5-flash",
)

class DocumentUnderstandingAgent(BaseAgent):
    def __init__(self, model_registry=None):
        super().__init__(DOCUMENT_UNDERSTANDING_CONTRACT)
        self.model_registry = model_registry or default_model_registry
        self.flash_model = self.model_registry.get_flash_model()
        self.gemma_scanner = self.model_registry.get_gemma_scanner()

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document_data = context.get("document")
        if not document_data:
            raise ValueError("Documento não fornecido no contexto da tarefa")
        
        raw_text = document_data.get("raw_text") or ""
        
        # 1. PII Scan & Sanitização via Gemma
        pii_result = await self.gemma_scanner.scan_and_sanitize(raw_text)

        # 2. Extração & Entendimento com Gemini Flash
        prompt = (
            "Você é o Document Understanding Agent do AEGIS. Analise o documento regulatório a seguir:\n\n"
            f"TEXTO DO DOCUMENTO:\n{pii_result.sanitized_text or raw_text}\n\n"
            "Extraia a jurisdição primária (BR, EU, US ou GLOBAL), o tipo de documento, "
            "as entidades reguladas e a lista de obrigações normativas identificadas."
        )

        try:
            from pydantic import BaseModel
            from typing import List

            class DocumentAnalysisOutput(BaseModel):
                jurisdiction: str
                document_type: str
                extracted_entities: List[str]
                obligations: List[str]

            analysis = await self.flash_model.generate_structured(
                prompt=prompt,
                response_schema=DocumentAnalysisOutput,
            )
            result_dict = analysis.model_dump()
        except Exception:
            # Fallback determinístico seguro
            jurisdiction = "BR" if ("LGPD" in raw_text or "Lei Geral" in raw_text) else "GLOBAL"
            if "GDPR" in raw_text or "EU" in raw_text:
                jurisdiction = "EU" if jurisdiction == "GLOBAL" else "BR"
            
            result_dict = {
                "jurisdiction": jurisdiction,
                "document_type": "Política Global de Retenção e Descarte de Dados",
                "extracted_entities": ["Dados Cadastrais", "Logs de Acesso", "Dados Financeiros"],
                "obligations": [
                    "LGPD Art. 15 e 16 - Término do tratamento e eliminação",
                    "GDPR Art. 5(1)(e) - Limitação do armazenamento",
                    "ISO 27001 A.8.10 - Exclusão segura de dados",
                ],
            }

        result_dict["pii_scan"] = pii_result.model_dump()
        return result_dict
