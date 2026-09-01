"""
Pre-recorded realistic fixtures for the Data Retention Policy demo and deterministic testing (in English).
"""

from typing import Dict, Any

DEMO_DOCUMENT_UNDERSTANDING: Dict[str, Any] = {
    "jurisdiction": "BR",
    "document_type": "Corporate Global Data Retention & Disposal Policy (Política Global de Retenção)",

    "extracted_entities": [
        "Customer Registration Data",
        "Access Logs & IP Addresses",
        "Financial & Tax Records",
        "Geolocation Data",
        "Cloud Backups & Snapshots",
    ],
    "obligations": [
        "LGPD Art. 15 & 16 - Processing termination and personal data deletion",
        "GDPR Art. 5(1)(e) - Storage limitation principle",
        "GDPR Art. 17 - Right to erasure ('right to be forgotten')",
        "ISO 27001 A.8.10 - Information deletion and secure media disposal",
        "Marco Civil da Internet Art. 15 - Application connection log retention",
    ],
    "summary": "Corporate document establishing data retention guidelines for subsidiaries in Brazil and the European Union, stipulating retention timeframes between 5 and 10 years for logs and user profile data."
}

DEMO_PII_SCAN: Dict[str, Any] = {
    "pii_detected": True,
    "entities_found": [
        {"type": "CPF/TaxID", "count": 2, "sample_masked": "123.***.***-00"},
        {"type": "Email", "count": 4, "sample_masked": "dpo@***.com"},
        {"type": "IP Address", "count": 3, "sample_masked": "192.168.***.***"}
    ],
    "sanitized_preview": "Data Retention Policy applicable to Data Protection Officer (DPO: dpo@***.com)...",
    "safety_status": "PASSED_WITH_REDACTION"
}

DEMO_PRIVACY_FINDINGS: Dict[str, Any] = {
    "findings": [
        {
            "id": "finding-privacy-lgpd-01",
            "requirement_id": "LGPD-ART-16",
            "agent_id": "agent-privacy-specialist",
            "title": "Indefinite Retention of User Registration Data After Purpose Termination",
            "description": "Section 3.2 establishes an automatic 10-year retention rule for all inactive customer registration records without substantiating lawful bases for retention following contract termination under LGPD Art. 16.",
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
                    "quote": "All inactive customer registration records shall remain archived for a fixed period of 10 (ten) years for internal audit purposes.",

                    "provenance": "Section 3.2 - General Custody Periods",
                    "confidence_score": 0.96,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        },
        {
            "id": "finding-privacy-gdpr-17",
            "requirement_id": "GDPR-ART-17",
            "agent_id": "agent-privacy-specialist",
            "title": "Absence of Statutory Response Window for Right to Erasure Requests",
            "description": "The policy fails to establish a statutory 30-day response window for data subject erasure requests, leaving evaluation entirely to internal legal discretion contrary to GDPR Article 17.",
            "severity": "high",
            "status": "open",
            "confidence": 0.9,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-privacy-02",
                    "document_id": "doc-retention-policy",
                    "page_number": 2,
                    "section_id": "sec-6.2",
                    "quote": "Data deletion requests shall be analyzed on a case-by-case basis by the internal legal team without a defined maximum response deadline.",

                    "provenance": "Section 6.2 - Data Subject Rights",
                    "confidence_score": 0.93,
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
            "title": "Excessive Retention Period for Connection Logs & Telemetry under GDPR",
            "description": "Section 4.1 mandates 10-year retention for full telemetry, connection logs, and IP addresses of European Union users, violating the GDPR storage limitation and data minimization principles.",
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
                    "quote": "Audit logs, IP addresses, and global user traffic telemetry (including EU users) are retained for 10 years in cold storage.",
                    "provenance": "Section 4.1 - Telemetry and Server Logs",
                    "confidence_score": 0.95,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        },
        {
            "id": "finding-security-gdpr-02",
            "requirement_id": "GDPR-ART-44-49",
            "agent_id": "agent-security-specialist",
            "title": "Cross-Border Data Transfer Without Standard Contractual Clauses (SCCs)",
            "description": "The policy authorizes processing European resident data in third-country data centers without standard contractual clauses or documented adequacy mechanisms, breaching GDPR Chapter V.",
            "severity": "high",
            "status": "open",
            "confidence": 0.91,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-sec-02",
                    "document_id": "doc-retention-policy",
                    "page_number": 6,
                    "section_id": "sec-7.2",
                    "quote": "Cross-border transfers are executed without active Standard Contractual Clauses (SCCs) or existing adequacy decisions.",

                    "provenance": "Section 7.2 - Cross-Border Data Transfers",
                    "confidence_score": 0.94,
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
            "title": "Absence of Formalized Media Sanitization & Disposal Protocols",
            "description": "The policy permits legacy backups and storage snapshots to be purged on an operational convenience basis, lacking cryptographic sanitization methods or purge certification required by ISO 27001 Control A.8.10.",
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
                    "quote": "Legacy backup media and storage snapshots shall be purged periodically according to IT operational convenience.",
                    "provenance": "Section 5.3 - Media Disposal & Snapshot Overwriting",
                    "confidence_score": 0.91,
                    "dependencies": ["doc-retention-policy"]
                }
            ]
        },
        {
            "id": "finding-gov-iso-02",
            "requirement_id": "ISO27001-A.8.24",
            "agent_id": "agent-governance-specialist",
            "title": "Lack of Key Management & Cryptographic Governance in Transit",
            "description": "The policy references TLS 1.2/1.3 but lacks key management controls, credential rotation schedules, or cryptographic criteria for analytical datastores.",
            "severity": "medium",
            "status": "open",
            "confidence": 0.87,
            "affected_by_change": False,
            "evidences": [
                {
                    "id": "ev-gov-02",
                    "document_id": "doc-retention-policy",
                    "page_number": 4,
                    "section_id": "sec-4.2",
                    "quote": "Data in transit is secured with TLS 1.2 / TLS 1.3; however, encryption key rotation policies and datastore credentials are not formally defined.",

                    "provenance": "Section 4.2 - Data Protection in Transit",
                    "confidence_score": 0.9,
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
            "reasoning": "Section 3.2 citation directly confirms non-compliance with LGPD Art. 16. No statutory retention duty or active consent clause justifies 10-year perpetual storage.",
            "contradictions_found": []
        },
        {
            "id": "rev-critic-02",
            "finding_id": "finding-security-gdpr-01",
            "critic_agent_id": "agent-evidence-critic",
            "decision": "confirmed",
            "reasoning": "Robust empirical evidence. Retaining raw telemetry and IP addresses for 10 years without anonymization is manifestly disproportionate under GDPR Art. 5(1)(e).",
            "contradictions_found": []
        },
        {
            "id": "rev-critic-03",
            "finding_id": "finding-gov-iso-01",
            "critic_agent_id": "agent-evidence-critic",
            "decision": "confirmed",
            "reasoning": "Clear textual proof. The wording 'operational convenience' fails ISO 27001 Control A.8.10 verifiable sanitization requirements.",
            "contradictions_found": []
        }
    ]
}

DEMO_REMEDIATIONS: Dict[str, Any] = {
    "remediations": [
        {
            "id": "rem-01",
            "finding_id": "finding-privacy-lgpd-01",
            "recommendation": "Reduce inactive customer data retention to 5 years (aligned with statutory limitation periods) and implement automated anonymization workflows.",
            "action_item": "Update Section 3.2 of the policy and configure database lifecycle retention rules.",
            "assignee": "DPO / Legal Counsel",
            "status": "pending"
        },
        {
            "id": "rem-02",
            "finding_id": "finding-security-gdpr-01",
            "recommendation": "Segment log retention: limit EU telemetry to maximum 6 months to 1 year, and enforce IP anonymization after 30 days.",
            "action_item": "Configure automated log expiration policies in Cloud Logging and SIEM.",
            "assignee": "Tech Lead SecOps",
            "status": "pending"
        },
        {
            "id": "rem-03",
            "finding_id": "finding-gov-iso-01",
            "recommendation": "Formalize verifiable sanitization protocols in compliance with NIST SP 800-88 R1 and generate purge audit certificates.",
            "action_item": "Draft Standard Operating Procedure (SOP) for Secure Media Disposal.",
            "assignee": "Governance & Compliance Lead",
            "status": "pending"
        }
    ]
}

DEMO_POLICY_DRIFT_IMPACT: Dict[str, Any] = {
    "change_id": "reg-change-gdpr-retention-2026",
    "framework": "GDPR",
    "version": "2026.2",
    "change_description": "Updated EDPB guidelines enforce a strict maximum 3-year retention period for technical logs and mandate immediate erasure upon Art. 17 requests.",
    "affected_requirements": ["GDPR-ART-5-1-E", "GDPR-ART-17"],
    "affected_evidence": ["ev-sec-01"],
    "affected_findings": ["finding-security-gdpr-01"],
    "blast_radius_summary": "Invalidation of 1 evidence node, reopening of 1 critical finding, and selective re-evaluation by the Security Specialist."
}
