"""
Fixtures realistas pré-gravadas para a demo da Política de Retenção de Dados e testes determinísticos.
"""

from typing import Dict, Any

DEMO_DOCUMENT_UNDERSTANDING: Dict[str, Any] = {
    "jurisdiction": "BR",
    "document_type": "Política Global de Retenção e Descarte de Dados",
    "extracted_entities": [
        "Dados Cadastrais",
        "Logs de Acesso e IPs",
        "Registros Financeiros e Fiscais",
        "Dados de Geolocalização",
        "Backups em Nuvem",
    ],
    "obligations": [
        "LGPD Art. 15 e 16 - Término do tratamento e eliminação de dados pessoais",
        "GDPR Art. 5(1)(e) - Princípio da limitação do armazenamento",
        "GDPR Art. 17 - Direito ao apagamento ('direito a ser esquecido')",
        "ISO 27001 A.8.10 - Exclusão e descarte seguro de informações",
        "Marco Civil da Internet Art. 15 - Guarda de registros de aplicação",
    ],
    "summary": "Documento corporativo definindo diretrizes de retenção para filiais no Brasil e Europa, estipulando prazos de guarda entre 5 e 10 anos para logs e dados cadastrais."
}

DEMO_PII_SCAN: Dict[str, Any] = {
    "pii_detected": True,
    "entities_found": [
        {"type": "CPF/TaxID", "count": 2, "sample_masked": "123.***.***-00"},
        {"type": "Email", "count": 4, "sample_masked": "dpo@***.com"},
        {"type": "IP Address", "count": 3, "sample_masked": "192.168.***.***"}
    ],
    "sanitized_preview": "Política de Retenção aplicável ao encarregado (DPO: dpo@***.com)...",
    "safety_status": "PASSED_WITH_REDACTION"
}

DEMO_PRIVACY_FINDINGS: Dict[str, Any] = {
    "findings": [
        {
            "id": "finding-privacy-lgpd-01",
            "requirement_id": "LGPD-ART-16",
            "agent_id": "agent-privacy-specialist",
            "title": "Retenção Indefinida de Dados Cadastrais Após Término da Finalidade",
            "description": "A Seção 3.2 estipula retenção automática por 10 anos de todos os dados cadastrais, sem justificar a base legal para guarda após encerramento do contrato.",
            "severity": "high",
            "status": "open",
            "confidence": 0.94,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-privacy-01",
                    "document_id": "doc-retention-policy",
                    "page_number": 2,
                    "section_id": "sec-3.2",
                    "quote": "Todos os dados cadastrais de clientes inativos permanecerão arquivados por prazo fixo de 10 (dez) anos para eventual auditoria interna.",
                    "provenance": "Seção 3.2 - Prazos Gerais de Custódia",
                    "confidence_score": 0.96,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        }
    ]
}

DEMO_SECURITY_FINDINGS: Dict[str, Any] = {
    "findings": [
        {
            "id": "finding-security-gdpr-01",
            "requirement_id": "GDPR-ART-5-1-E",
            "agent_id": "agent-security-specialist",
            "title": "Prazo de Retenção Excessivo para Logs de Conexão sob GDPR",
            "description": "A Seção 4.1 define a guarda de logs completos de conexão e telemetria por 10 anos para usuários da União Europeia, violando o princípio da minimização e limitação temporal.",
            "severity": "critical",
            "status": "open",
            "confidence": 0.92,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-sec-01",
                    "document_id": "doc-retention-policy",
                    "page_number": 4,
                    "section_id": "sec-4.1",
                    "quote": "Logs de auditoria, IPs e telemetria de tráfego de usuários globais (inclusive UE) são retidos por 10 anos em storage frio.",
                    "provenance": "Seção 4.1 - Telemetria e Logs de Aplicação",
                    "confidence_score": 0.95,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        }
    ]
}

DEMO_GOVERNANCE_FINDINGS: Dict[str, Any] = {
    "findings": [
        {
            "id": "finding-gov-iso-01",
            "requirement_id": "ISO27001-A.8.10",
            "agent_id": "agent-governance-specialist",
            "title": "Inexistência de Procedimento Verificável para Descarte Criptográfico de Mídias",
            "description": "O documento menciona descarte de backups em nuvem sem estipular métodos criptográficos de sanitização ou emissão de certificados de expurgo.",
            "severity": "medium",
            "status": "open",
            "confidence": 0.89,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-gov-01",
                    "document_id": "doc-retention-policy",
                    "page_number": 5,
                    "section_id": "sec-5.3",
                    "quote": "As mídias e snapshots legados serão apagados periodicamente conforme conveniência operacional da equipe de TI.",
                    "provenance": "Seção 5.3 - Descarte e Sobrescrita de Snapshots",
                    "confidence_score": 0.91,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        }
    ]
}

DEMO_EVIDENCE_CRITIC_REVIEWS: Dict[str, Any] = {
    "reviews": [
        {
            "id": "rev-critic-01",
            "finding_id": "finding-privacy-lgpd-01",
            "critic_agent_id": "agent-evidence-critic",
            "decision": "confirmed",
            "reasoning": "A citação da Seção 3.2 comprova violação direta ao Art. 16 da LGPD. Não foi encontrada cláusula de consentimento ou obrigação legal setorial justificando 10 anos.",
            "contradictions_found": []
        },
        {
            "id": "rev-critic-02",
            "finding_id": "finding-security-gdpr-01",
            "critic_agent_id": "agent-evidence-critic",
            "decision": "confirmed",
            "reasoning": "Evidência empírica robusta. A guarda de telemetria por 10 anos sem anonimização é manifestamente desproporcional sob o GDPR Art. 5(1)(e).",
            "contradictions_found": []
        },
        {
            "id": "rev-critic-03",
            "finding_id": "finding-gov-iso-01",
            "critic_agent_id": "agent-evidence-critic",
            "decision": "confirmed",
            "reasoning": "Evidência textual clara. A redação 'conforme conveniência' falha no critério de controle A.8.10 da ISO 27001.",
            "contradictions_found": []
        }
    ]
}

DEMO_REMEDIATIONS: Dict[str, Any] = {
    "remediations": [
        {
            "id": "rem-01",
            "finding_id": "finding-privacy-lgpd-01",
            "recommendation": "Reduzir o prazo de guarda de dados cadastrais inativos para 5 anos (alinhado ao prazo prescricional do CC/CDC) e implementar processo automático de anonimização.",
            "action_item": "Atualizar a Seção 3.2 da política e configurar lifecycle no banco de dados.",
            "assignee": "DPO / Jurídico",
            "status": "pending"
        },
        {
            "id": "rem-02",
            "finding_id": "finding-security-gdpr-01",
            "recommendation": "Segmentar a retenção de logs: manter telemetria por no máximo 6 meses a 1 ano para filiais da UE, e anonimizar IPs após 30 dias.",
            "action_item": "Configurar expiração automática de logs no Cloud Logging / SIEM.",
            "assignee": "Tech Lead SecOps",
            "status": "pending"
        },
        {
            "id": "rem-03",
            "finding_id": "finding-gov-iso-01",
            "recommendation": "Formalizar procedimento de sanitização em conformidade com NIST SP 800-88 R1 e gerar logs de expurgo.",
            "action_item": "Elaborar Procedimento Operacional Padrão (POP) de Descarte Seguro.",
            "assignee": "Governance & Compliance Lead",
            "status": "pending"
        }
    ]
}

DEMO_POLICY_DRIFT_IMPACT: Dict[str, Any] = {
    "change_id": "reg-change-gdpr-retention-2026",
    "framework": "GDPR",
    "version": "2026.2",
    "change_description": "Nova diretriz do EDPB estipula prazo máximo estrito de 3 anos para guarda de logs técnicos e exige expurgo imediato mediante solicitação do Art. 17.",
    "affected_requirements": ["GDPR-ART-5-1-E", "GDPR-ART-17"],
    "affected_evidence": ["ev-sec-01"],
    "affected_findings": ["finding-security-gdpr-01"],
    "blast_radius_summary": "Invalidação de 1 evidência, reabertura de 1 finding crítico e necessidade de re-avaliação do Security Specialist."
}
