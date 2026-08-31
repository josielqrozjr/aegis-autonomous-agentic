export type InvestigationStatus =
  | "UNDERSTANDING"
  | "PLANNING"
  | "INVESTIGATING"
  | "ADVERSARIAL_REVIEW"
  | "COMPLETED"
  | "FAILED"
  | "DEGRADED"
  | "PENDING_REVIEW"
  | "REOPENED_DRIFT"
  | "POLICY_DRIFT";

export type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED" | "DEGRADED";

export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "COMPLIANT";

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  model: "Gemini 2.5 Flash" | "Gemma (Vertex AI)" | "Gemini 2.5 Pro";
  status: AgentStatus;
  currentTask?: string;
  confidence: number;
  findingsCount: number;
  lastExecutionMs?: number;
}

export interface Finding {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  framework: "LGPD" | "GDPR" | "ISO 27001" | "OWASP";
  articleOrControl: string;
  agentId: string;
  agentName: string;
  confidence: number;
  evidenceQuote: string;
  evidenceHash: string;
  remediationSuggestion: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED" | "REOPENED_DRIFT";
  challengedByCritic?: boolean;
  criticVerdict?: string;
  remediationStatus?: "PROPOSED" | "APPROVED" | "APPLIED";
}

export interface Investigation {
  id: string;
  title: string;
  documentName: string;
  documentHash: string;
  fileSizeBytes: number;
  createdAt: string;
  updatedAt: string;
  status: InvestigationStatus;
  progressPercent: number;
  frameworks: string[];
  findingsCount: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
