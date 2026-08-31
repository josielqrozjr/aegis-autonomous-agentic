import { AgentInfo, Finding, Investigation } from "./types";
import { TrustGraphNode, TrustGraphEdge, TrustGraphData } from "./api/client";

export const MOCK_AGENTS: AgentInfo[] = [
  {
    id: "pii-scanner",
    name: "PII Scanner",
    role: "Detection and sanitization of sensitive personal data",
    model: "Gemma (Vertex AI)",
    status: "COMPLETED",
    currentTask: "Scanning for SSNs, tax IDs, emails and personal identifiers",
    confidence: 0.98,
    findingsCount: 3,
    lastExecutionMs: 420,
  },
  {
    id: "lgpd-specialist",
    name: "LGPD Specialist",
    role: "Compliance assessment against Brazilian Law 13,709/2018",
    model: "Gemini 3.6 Flash",
    status: "COMPLETED",
    currentTask: "Analysis of lawful bases and processing termination (Art. 15 & 16)",
    confidence: 0.94,
    findingsCount: 4,
    lastExecutionMs: 1250,
  },
  {
    id: "gdpr-specialist",
    name: "GDPR Specialist",
    role: "Compliance with Art. 5(1)(e) & Art. 17 (Right to Erasure)",
    model: "Gemini 3.6 Flash",
    status: "COMPLETED",
    currentTask: "Verification of cross-border data retention timeframes",
    confidence: 0.91,
    findingsCount: 2,
    lastExecutionMs: 1100,
  },
  {
    id: "iso-specialist",
    name: "ISO 27001 Specialist",
    role: "Media retention and secure disposal controls (A.8.10)",
    model: "Gemini 3.6 Flash",
    status: "COMPLETED",
    currentTask: "Mapping secure purging protocols and encryption at rest",
    confidence: 0.96,
    findingsCount: 1,
    lastExecutionMs: 980,
  },
  {
    id: "evidence-critic",
    name: "Evidence Critic",
    role: "Adversarial review and hypothesis cross-examination",
    model: "Gemini 2.5 Pro",
    status: "COMPLETED",
    currentTask: "Challenging findings to eliminate false positive claims",
    confidence: 0.97,
    findingsCount: 0,
    lastExecutionMs: 2300,
  },
];

export const MOCK_INVESTIGATIONS: Investigation[] = [
  {
    id: "INV-2024-0047",
    title: "Corporate Data Retention Policy (Multi-Jurisdiction)",
    documentName: "corporate_data_retention_policy_v2.pdf",
    documentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    fileSizeBytes: 245800,
    createdAt: "2026-08-30T13:30:00Z",
    updatedAt: "2026-08-30T15:20:00Z",
    status: "COMPLETED",
    progressPercent: 100,
    frameworks: ["LGPD", "GDPR", "ISO 27001"],
    findingsCount: {
      total: 4,
      critical: 2,
      high: 2,
      medium: 0,
      low: 0,
    },
  },
  {
    id: "INV-2024-0048",
    title: "Cloud Security & AI Governance Normative Directive",
    documentName: "cloud_security_and_ai_governance_normative.pdf",
    documentHash: "b4c8d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789",
    fileSizeBytes: 184200,
    createdAt: "2026-08-30T16:00:00Z",
    updatedAt: "2026-08-30T17:15:00Z",
    status: "INVESTIGATING",
    progressPercent: 75,
    frameworks: ["ISO 27001", "LGPD", "OWASP"],
    findingsCount: {
      total: 3,
      critical: 1,
      high: 1,
      medium: 1,
      low: 0,
    },
  },
  {
    id: "INV-2024-0049",
    title: "Enterprise SaaS Vendor Data Processing Agreement (DPA)",
    documentName: "enterprise_saas_vendor_dpa_contract.pdf",
    documentHash: "c5d9e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789a1",
    fileSizeBytes: 312500,
    createdAt: "2026-08-30T17:30:00Z",
    updatedAt: "2026-08-30T18:45:00Z",
    status: "PENDING_REVIEW",
    progressPercent: 90,
    frameworks: ["GDPR", "LGPD"],
    findingsCount: {
      total: 4,
      critical: 2,
      high: 1,
      medium: 1,
      low: 0,
    },
  },
  {
    id: "INV-2024-0046",
    title: "Mobile App Terms of Service & Privacy Policy",
    documentName: "mobile_terms_and_privacy_v1.md",
    documentHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    fileSizeBytes: 112400,
    createdAt: "2026-08-29T10:15:00Z",
    updatedAt: "2026-08-29T11:45:00Z",
    status: "POLICY_DRIFT",
    progressPercent: 100,
    frameworks: ["LGPD", "OWASP"],
    findingsCount: {
      total: 2,
      critical: 1,
      high: 1,
      medium: 0,
      low: 0,
    },
  },
];

export const MOCK_FINDINGS: Finding[] = [
  // Findings for INV-2024-0047 (Retention Policy)
  {
    id: "FIND-01",
    investigationId: "INV-2024-0047",
    title: "Indefinite Retention of User Personal Data",
    description: "Section 2.1 specifies indefinite storage without lawful basis for processing termination, violating the necessity and storage limitation principles.",
    severity: "CRITICAL",
    framework: "LGPD",
    articleOrControl: "Art. 15 & Art. 16 (Processing Termination & Erasure)",
    agentId: "lgpd-specialist",
    agentName: "LGPD Specialist (Gemini Flash)",
    confidence: 0.95,
    evidenceQuote: "User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes...",
    evidenceHash: "8f4b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
    remediationSuggestion: "Define a maximum 5-year retention period after account closure and implement automated purging schedules.",
    status: "RESOLVED",
    remediationStatus: "APPROVED",
    challengedByCritic: true,
    criticVerdict: "Validated: No legitimate legal basis for perpetual retention exists under LGPD without effective anonymization.",
  },
  {
    id: "FIND-02",
    investigationId: "INV-2024-0047",
    title: "Excessive Response Window for Right to Erasure (90 Days)",
    description: "Section 3.1 sets a 90-business-day window for deletion request review, exceeding the statutory 30-day requirement under GDPR.",
    severity: "CRITICAL",
    framework: "GDPR",
    articleOrControl: "Art. 17 (Right to Erasure) & Art. 12(3)",
    agentId: "gdpr-specialist",
    agentName: "GDPR Specialist (Gemini Flash)",
    confidence: 0.92,
    evidenceQuote: "Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days.",
    evidenceHash: "7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b",
    remediationSuggestion: "Reduce the statutory response timeframe to 30 calendar days pursuant to GDPR Article 12(3).",
    status: "RESOLVED",
    remediationStatus: "APPROVED",
    challengedByCritic: true,
    criticVerdict: "Confirmed: GDPR mandates a 1-month timeframe, extendable only with substantiated notice of complexity to the data subject.",
  },
  {
    id: "FIND-03",
    investigationId: "INV-2024-0047",
    title: "Server Logs with IP Addresses Retained Without Anonymization",
    description: "Section 2.2 retains server access logs for 30 days containing personal identifiers without pseudonymization or IP masking.",
    severity: "HIGH",
    framework: "ISO 27001",
    articleOrControl: "Control A.8.10 (Information Deletion) & A.8.15 (Logging)",
    agentId: "iso-specialist",
    agentName: "ISO 27001 Specialist (Gemini Flash)",
    confidence: 0.88,
    evidenceQuote: "Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses...",
    evidenceHash: "1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f",
    remediationSuggestion: "Implement subnet masking on the last IP octet during real-time log ingestion pipelines.",
    status: "RESOLVED",
    remediationStatus: "APPROVED",
    challengedByCritic: false,
  },
  {
    id: "FIND-04",
    investigationId: "INV-2024-0047",
    title: "Shared Generic Credentials in Analytical Databases",
    description: "Section 4.1 mentions shared generic credentials across the engineering team, violating least privilege and individual session traceability.",
    severity: "HIGH",
    framework: "ISO 27001",
    articleOrControl: "Control A.5.15 (Access Control) & A.9.2 (User Access Management)",
    agentId: "iso-specialist",
    agentName: "ISO 27001 Specialist (Gemini Flash)",
    confidence: 0.96,
    evidenceQuote: "Analytical databases utilize shared passwords restricted to the engineering team.",
    evidenceHash: "5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    remediationSuggestion: "Migrate to federated SSO/IAM authentication with individual named accounts and audit trails.",
    status: "RESOLVED",
    remediationStatus: "APPROVED",
    challengedByCritic: true,
    criticVerdict: "Critical: Shared credentials eliminate individual session traceability required by ISO 27001.",
  },

  // Findings for INV-2024-0048 (Normative AI & Cloud Security Directive)
  {
    id: "FIND-05",
    investigationId: "INV-2024-0048",
    title: "Cleartext Logging of External User PII in AI Inference Prompts",
    description: "Section 3.1 permits external prompts containing user names, tax IDs (CPF) and bank details to be stored unredacted in cleartext logs.",
    severity: "CRITICAL",
    framework: "LGPD",
    articleOrControl: "Art. 46 (Security Measures) & Art. 6 (Security Principle)",
    agentId: "pii-scanner",
    agentName: "PII Scanner (Gemma 2 (Vertex AI))",
    confidence: 0.98,
    evidenceQuote: "Prompts submitted by external users containing names, tax IDs (CPF), and financial account numbers are logged in cleartext for quality assurance...",
    evidenceHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    remediationSuggestion: "Deploy real-time PII anonymization interceptor (Gemma 2 (Vertex AI)) before persisting prompt logs.",
    status: "OPEN",
    challengedByCritic: true,
    criticVerdict: "Confirmed: Logging raw CPF and banking numbers in plain text violates basic LGPD security standards.",
  },
  {
    id: "FIND-06",
    investigationId: "INV-2024-0048",
    title: "Hardcoded API Keys in Client-Side Configuration Bundles",
    description: "Section 2.1 authorizes client-side embedding of production LLM API credentials with mere obfuscation, exposing secrets to extraction.",
    severity: "HIGH",
    framework: "OWASP",
    articleOrControl: "OWASP LLM06 (Sensitive Information Disclosure) & ISO A.8.24",
    agentId: "iso-specialist",
    agentName: "ISO 27001 Specialist (Gemini Flash)",
    confidence: 0.94,
    evidenceQuote: "API keys for production LLM endpoints may be embedded in client-side configuration bundles provided they are obfuscated.",
    evidenceHash: "3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f",
    remediationSuggestion: "Enforce server-side proxy gateway architecture with secret management vault (GCP Secret Manager).",
    status: "OPEN",
    challengedByCritic: true,
    criticVerdict: "Validated: Obfuscation is not encryption. Client-side secrets are trivially extractable by reverse engineering.",
  },
  {
    id: "FIND-07",
    investigationId: "INV-2024-0048",
    title: "Exemption of Service Accounts from Periodic Credential Rotation",
    description: "Section 2.2 exempts automated service accounts from regular secret rotation cycles, increasing dormant credential exposure risk.",
    severity: "MEDIUM",
    framework: "ISO 27001",
    articleOrControl: "Control A.5.17 (Authentication Information)",
    agentId: "iso-specialist",
    agentName: "ISO 27001 Specialist (Gemini Flash)",
    confidence: 0.89,
    evidenceQuote: "...however, service accounts are exempt from periodic credential rotation.",
    evidenceHash: "2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a",
    remediationSuggestion: "Enforce automated 90-day key rotation for service accounts or transition to Workload Identity Federation.",
    status: "OPEN",
    challengedByCritic: false,
  },

  // Findings for INV-2024-0049 (Commercial DPA Contract)
  {
    id: "FIND-08",
    investigationId: "INV-2024-0049",
    title: "Unilateral Sub-Processor Engagement Without Prior Written Notice",
    description: "Section 2.1 authorizes secondary sub-processors in third countries without prior written notification to the Controller, breaching GDPR Art. 28(2).",
    severity: "CRITICAL",
    framework: "GDPR",
    articleOrControl: "Art. 28(2) & Art. 28(4) (Processor Obligations)",
    agentId: "gdpr-specialist",
    agentName: "GDPR Specialist (Gemini Flash)",
    confidence: 0.96,
    evidenceQuote: "The Processor is authorized to engage secondary sub-processors in third countries without prior written notification to Controller...",
    evidenceHash: "4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e",
    remediationSuggestion: "Require at least 30 days prior written notice with express right to object before onboarding sub-processors.",
    status: "OPEN",
    challengedByCritic: true,
    criticVerdict: "Confirmed: GDPR Article 28(2) strictly prohibits processor appointment of sub-processors without specific or general written authorization.",
  },
  {
    id: "FIND-09",
    investigationId: "INV-2024-0049",
    title: "Post-Termination Commercial Retention of Personal Data (7 Years)",
    description: "Section 4.1 allows Processor to retain unencrypted customer transaction records for 7 years for commercial benchmarking following service termination.",
    severity: "CRITICAL",
    framework: "LGPD",
    articleOrControl: "Art. 16 (Termination of Processing) & GDPR Art. 28(3)(g)",
    agentId: "lgpd-specialist",
    agentName: "LGPD Specialist (Gemini Flash)",
    confidence: 0.95,
    evidenceQuote: "Upon termination of the Services, Processor shall retain an unencrypted copy of user transaction logs for seven (7) years for commercial benchmarking purposes.",
    evidenceHash: "1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    remediationSuggestion: "Mandate complete deletion or return of all personal data upon termination, barring statutory fiscal retention duties.",
    status: "OPEN",
    challengedByCritic: true,
    criticVerdict: "Validated: Commercial benchmarking is not a statutory lawful basis for post-termination processor retention.",
  },
  {
    id: "FIND-10",
    investigationId: "INV-2024-0049",
    title: "Delayed Data Breach Notification Window (7 Business Days)",
    description: "Section 3.1 extends incident notification to 7 business days following internal technical closure, exceeding standard regulatory urgency thresholds.",
    severity: "HIGH",
    framework: "GDPR",
    articleOrControl: "Art. 33(2) (Notification to Controller Without Undue Delay)",
    agentId: "gdpr-specialist",
    agentName: "GDPR Specialist (Gemini Flash)",
    confidence: 0.91,
    evidenceQuote: "...Processor shall notify Controller within seven (7) business days of completing its internal technical investigation.",
    evidenceHash: "7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f",
    remediationSuggestion: "Update notification SLA to maximum 48 hours from initial detection of confirmed security compromise.",
    status: "OPEN",
    challengedByCritic: false,
  },
];

export const MOCK_TRUST_GRAPH_INITIAL: TrustGraphData = {
  investigation_id: "INV-2024-0047",
  total_nodes: 10,
  valid_nodes: 10,
  invalid_nodes: 0,
  nodes: [
    {
      id: "req-lgpd-16",
      type: "requirement",
      source: "LGPD Art. 16 (Data Deletion)",
      valid: true,
      confidence: 1.0,
      jurisdiction: "BR",
      content_hash: "sha256-lgpd-art16-v1",
      details: "Mandates deletion upon completion of personal data processing purpose.",
    },
    {
      id: "req-gdpr-5",
      type: "requirement",
      source: "GDPR Art. 5(1)(e) (Storage Limitation v1)",
      valid: true,
      confidence: 1.0,
      jurisdiction: "EU",
      content_hash: "sha256-gdpr-art5-v1",
      details: "Personal data shall not be kept longer than necessary for the purpose.",
    },
    {
      id: "req-iso-a810",
      type: "requirement",
      source: "ISO 27001 A.8.10 (Data Deletion)",
      valid: true,
      confidence: 1.0,
      jurisdiction: "GLOBAL",
      content_hash: "sha256-iso-a810-v1",
      details: "Guidelines for secure disposal and audit trail retention schedules.",
    },
    {
      id: "ag-pii",
      type: "agent",
      source: "PII Scanner (Gemma 2 (Vertex AI))",
      valid: true,
      confidence: 0.98,
      jurisdiction: "ALL",
      content_hash: "sha256-agent-pii-v1",
      details: "Preliminary scan for SSNs, emails and confidential identifiers.",
    },
    {
      id: "ag-lgpd",
      type: "agent",
      source: "LGPD Specialist (Gemini 3.6 Flash)",
      valid: true,
      confidence: 0.94,
      jurisdiction: "BR",
      content_hash: "sha256-agent-lgpd-v1",
      details: "Brazilian national data privacy compliance agent.",
    },
    {
      id: "ag-gdpr",
      type: "agent",
      source: "GDPR Specialist (Gemini 3.6 Flash)",
      valid: true,
      confidence: 0.91,
      jurisdiction: "EU",
      content_hash: "sha256-agent-gdpr-v1",
      details: "European Union regulatory privacy specialist agent.",
    },
    {
      id: "ev-retencao-infinita",
      type: "evidence",
      source: "corporate_policy.pdf §2.1",
      valid: true,
      confidence: 0.95,
      jurisdiction: "BR/EU",
      content_hash: "8f4b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
      details: "Exact quote: '...shall be stored indefinitely for business intelligence...'",
    },
    {
      id: "ev-prazo-90dias",
      type: "evidence",
      source: "corporate_policy.pdf §3.1",
      valid: true,
      confidence: 0.92,
      jurisdiction: "EU",
      content_hash: "7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b",
      details: "Exact quote: '...reviewed by legal team within 90 business days.'",
    },
    {
      id: "find-01-node",
      type: "finding",
      source: "FIND-01: Indefinite Retention",
      valid: true,
      confidence: 0.95,
      jurisdiction: "BR",
      content_hash: "sha256-find-01",
      details: "Non-compliance with LGPD Art. 16. Remediation patch required.",
    },
    {
      id: "find-02-node",
      type: "finding",
      source: "FIND-02: Excessive 90d Window",
      valid: true,
      confidence: 0.92,
      jurisdiction: "EU",
      content_hash: "sha256-find-02",
      details: "Violation of GDPR Art. 12 statutory 30-day response window.",
    },
  ],
  edges: [
    { from: "req-lgpd-16", to: "find-01-node" },
    { from: "ag-lgpd", to: "find-01-node" },
    { from: "ev-retencao-infinita", to: "find-01-node" },
    { from: "ag-pii", to: "ev-retencao-infinita" },
    { from: "req-gdpr-5", to: "find-02-node" },
    { from: "ag-gdpr", to: "find-02-node" },
    { from: "ev-prazo-90dias", to: "find-02-node" },
    { from: "req-iso-a810", to: "ev-retencao-infinita" },
  ],
};

export const SAMPLE_POLICIES = [
  {
    name: "Corporate Data Retention Policy (Multi-Jurisdiction)",
    filename: "corporate_data_retention_policy_v2.pdf",
    description: "Multi-jurisdiction policy covering user data, server logs and right to erasure (LGPD + GDPR + ISO 27001)",
    category: "Corporate Policy",
    frameworks: ["LGPD", "GDPR", "ISO 27001"],
    sampleContent: `CORPORATE DATA RETENTION & PRIVACY POLICY
Version 2.4 — September 2026

1. PURPOSE & SCOPE
This policy establishes governing rules for storage, processing, and disposal of personal and corporate data handled across AEGIS Group production environments in Brazil and the European Union.

2. RETENTION PERIODS
2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes.
2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers.
2.3. Tax records and financial transaction receipts will be preserved for five (5) years in compliance with applicable fiscal legislation.

3. RIGHT TO ERASURE & DATA DELETION
3.1. Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days.
3.2. Data held in cold backups is exempt from real-time deletion requests and will be overwritten exclusively during standard 2-year tape rotation cycles.

4. SECURITY & ENCRYPTION
4.1. Data in transit is secured with TLS 1.3. Analytical databases utilize shared passwords restricted to the engineering team.`,
  },
  {
    name: "Cloud Security & AI Governance Normative Standard",
    filename: "cloud_security_and_ai_governance_normative.pdf",
    description: "Normative directive defining LLM inference, API credential management and audit trails (ISO 27001 + LGPD + OWASP)",
    category: "Normative Standard",
    frameworks: ["ISO 27001", "LGPD", "OWASP"],
    sampleContent: `AEGIS NORMATIVE DIRECTIVE: CLOUD SECURITY & AI SYSTEM GOVERNANCE (ND-2026-04)
Classification: Internal Corporate Standard
Applicable Jurisdictions: Global & Brazil Operations

1. OBJECTIVE & NORMATIVE APPLICATION
This directive defines information security and artificial intelligence controls for large language models (LLMs), automated inference pipelines, and multi-tenant cloud storage.

2. ACCESS CONTROL & CREDENTIAL MANAGEMENT
2.1. API keys for production LLM endpoints may be embedded in client-side configuration bundles provided they are obfuscated.
2.2. Multi-factor authentication (MFA) is mandatory for administrative cloud consoles; however, service accounts are exempt from periodic credential rotation.

3. AI INFERENCE & PII PROCESSING
3.1. Prompts submitted by external users containing names, tax IDs (CPF), and financial account numbers are logged in cleartext for quality assurance and model fine-tuning.
3.2. Training datasets shall undergo automated sanitization before retention in persistent vector databases.

4. AUDIT TRAILS & CRYPTOGRAPHIC STANDARDS
4.1. Audit logs are preserved for 180 days with SHA-256 integrity sealing.`,
  },
  {
    name: "Enterprise SaaS Vendor Data Processing Agreement (DPA)",
    filename: "enterprise_saas_vendor_dpa_contract.pdf",
    description: "Commercial controller-to-processor contract on international data transfers, sub-processors and breach notification (GDPR + LGPD)",
    category: "Commercial Contract",
    frameworks: ["GDPR", "LGPD"],
    sampleContent: `MASTER SERVICES AGREEMENT: DATA PROCESSING ADDENDUM (DPA-2026-EU/BR)
Parties: AEGIS Technologies S.A. (Controller) & CloudMatrix Global Ltd. (Processor)

1. SUBJECT MATTER & PROCESSING INSTRUCTIONS
The Processor agrees to process personal data solely in accordance with Controller's documented instructions and applicable data protection regulations (GDPR Art. 28 and LGPD Art. 39).

2. CROSS-BORDER DATA TRANSFERS & SUB-PROCESSORS
2.1. The Processor is authorized to engage secondary sub-processors in third countries without prior written notification to Controller, provided standard industry practices are maintained.
2.2. International transfers of European and Brazilian resident data to jurisdictions lacking adequacy decisions shall rely on internal Processor assurances without Standard Contractual Clauses (SCCs).

3. DATA BREACH NOTIFICATION & INCIDENT RESPONSE
3.1. In the event of a confirmed personal data breach affecting Controller data, Processor shall notify Controller within seven (7) business days of completing its internal technical investigation.

4. TERMINATION, DATA RETURN & ERASURE
4.1. Upon termination of the Services, Processor shall retain an unencrypted copy of user transaction logs for seven (7) years for commercial benchmarking purposes.`,
  },
];
