from typing import Any, Dict
from aegis.agents.base import BaseAgent
from aegis.schemas import AgentContract, AgentRole, Capability, Document, Task

DOCUMENT_UNDERSTANDING_CONTRACT = AgentContract(
    agent_id="agent-doc-understanding",
    name="Document Understanding Agent",
    role=AgentRole.DOCUMENT_UNDERSTANDING,
    description="Analisa a estrutura do documento, extrai jurisdição, obrigações, entidades e contexto.",
    capabilities=[
        Capability(id="cap-text-extraction", name="Text Extraction", description="Extração e estruturação de texto"),
        Capability(id="cap-jurisdiction-detect", name="Jurisdiction Detection", description="Detecção de jurisdição aplicável"),
        Capability(id="cap-entity-extraction", name="Entity & Obligation Extraction", description="Identificação de obrigações regulatórias"),
    ],
    jurisdictions=["GLOBAL", "BR", "EU", "US"],
)

class DocumentUnderstandingAgent(BaseAgent):
    def __init__(self):
        super().__init__(DOCUMENT_UNDERSTANDING_CONTRACT)

    async def execute_task(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        document_data = context.get("document")
        if not document_data:
            raise ValueError("Documento não fornecido no contexto da tarefa")
        
        # Em produção, aqui usamos Gemini / LLM para processar e classificar o documento
        raw_text = document_data.get("raw_text", "")
        
        # Exemplo de lógica determinística/LLM
        jurisdiction = "BR" if "LGPD" in raw_text or "Lei Geral" in raw_text else "GLOBAL"
        if "GDPR" in raw_text or "EU" in raw_text:
            jurisdiction = "EU"
            
        doc_type = "Política de Privacidade" if "privacidade" in raw_text.lower() else "Documento Corporativo"

        return {
            "jurisdiction": jurisdiction,
            "document_type": doc_type,
            "extracted_entities": ["Dados Pessoais", "Titulares", "Controlador"],
            "obligations": ["Consentimento", "Segurança da Informação", "Relatório de Impacto (DPIA)"],
        }
