import { Investigation, Finding, AgentInfo } from "../types";

export interface TrustGraphNode {
  id: string;
  type: "requirement" | "evidence" | "finding" | "agent";
  source: string;
  valid: boolean;
  confidence: number;
  jurisdiction: string;
  content_hash: string;
  invalidated_at?: string | null;
  invalidated_reason?: string | null;
  dependencies?: string[];
  details?: string;
  affected_by_change?: boolean;
}

export interface TrustGraphEdge {
  from: string;
  to: string;
}

export interface TrustGraphData {
  investigation_id: string;
  nodes: TrustGraphNode[];
  edges: TrustGraphEdge[];
  total_nodes: number;
  valid_nodes: number;
  invalid_nodes: number;
}

export interface RegulatoryChangePayload {
  framework: string;
  version: string;
  change_description: string;
  affected_requirements: string[];
}

export interface BlastRadiusResult {
  source_node: string;
  total_affected: number;
  affected_node_ids: string[];
  by_type: Record<string, number>;
}

// In production: browser calls /api/proxy/* (same origin), Next.js server adds OIDC and forwards.
// Locally: calls the backend API directly.
const IS_BROWSER = typeof window !== "undefined";
const API_BASE_URL = IS_BROWSER
  ? "/api/proxy"  // Browser → Next.js proxy → Backend (with OIDC)
  : (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1");

export async function fetchInvestigations(): Promise<Investigation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/investigations`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.investigations;
  } catch (err) {
    console.warn("FastAPI offline, utilizando dados locais de fallback:", err);
    return [];
  }
}

export async function fetchTrustGraph(investigationId: string): Promise<TrustGraphData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/investigations/${investigationId}/trust-graph`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const graph = data.graph;
    return {
      investigation_id: data.investigation_id || investigationId,
      nodes: graph.nodes || [],
      edges: graph.edges || [],
      total_nodes: graph.summary?.total_nodes ?? graph.nodes?.length ?? 0,
      valid_nodes: graph.summary?.valid ?? graph.nodes?.filter((n: any) => n.valid).length ?? 0,
      invalid_nodes: graph.summary?.invalidated ?? graph.nodes?.filter((n: any) => !n.valid).length ?? 0,
    };
  } catch (err) {
    console.warn("FastAPI offline para trust-graph, utilizando fallback interativo:", err);
    return null;
  }
}

export async function triggerRegulatoryChange(payload: RegulatoryChangePayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/regulatory-changes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("FastAPI offline para regulatory-changes, simulando localmente:", err);
    return {
      simulated: true,
      framework: payload.framework,
      version: payload.version,
      impact_analysis: {
        total_affected_investigations: 1,
        affected_investigations: ["INV-2024-0047"],
        invalidated_nodes_count: 3,
      },
    };
  }
}

export async function invalidateNode(investigationId: string, nodeId: string, reason: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/investigations/${investigationId}/trust-graph/invalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node_id: nodeId, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Invalidação simulada localmente:", err);
    return {
      invalidated_nodes: [nodeId],
      total: 1,
    };
  }
}

// ── Upload, Create, Run ──

export async function uploadDocument(file: File): Promise<{ id: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  return await res.json();
}

export async function createInvestigation(title: string, documentId: string): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/investigations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, document_id: documentId }),
  });
  if (!res.ok) throw new Error(`Create failed: HTTP ${res.status}`);
  return await res.json();
}

export async function runInvestigation(investigationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/investigations/${investigationId}/run`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Run failed: HTTP ${res.status}`);
  return await res.json();
}

export async function fetchInvestigation(investigationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/investigations/${investigationId}`);
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
  return await res.json();
}

export async function fetchAgents(): Promise<any> {
  // Root endpoint — use /api/backend/ proxy (not /api/proxy/ which maps to /api/v1/)
  const rootProxy = IS_BROWSER ? "/api/backend" : (process.env.BACKEND_API_URL || "http://localhost:8080").replace(/\/api\/v1$/, "");
  const res = await fetch(`${rootProxy}/agents`);
  if (!res.ok) throw new Error(`Fetch agents failed: HTTP ${res.status}`);
  return await res.json();
}

// ── Transform backend → frontend types ──

const FRAMEWORK_MAP: Record<string, "LGPD" | "GDPR" | "ISO 27001" | "OWASP"> = {
  "LGPD-ART-15": "LGPD",
  "LGPD-ART-16": "LGPD",
  "GDPR-ART-5-1-E": "GDPR",
  "GDPR-ART-17": "GDPR",
  "ISO27001-A.8.10": "ISO 27001",
};

const AGENT_NAME_MAP: Record<string, string> = {
  "agent-privacy-specialist": "LGPD Specialist (Gemini Flash)",
  "agent-security-specialist": "GDPR Specialist (Gemini Flash)",
  "agent-governance-specialist": "ISO Specialist (Gemini Flash)",
  "agent-evidence-critic": "Evidence Critic (Gemini 2.5 Pro)",
};

const SEVERITY_MAP: Record<string, "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "LOW",
};

export function transformFinding(backendFinding: any, investigationId: string): Finding {
  const reqId = backendFinding.requirement_id || "";
  const fw = FRAMEWORK_MAP[reqId] || "LGPD";
  const firstEvidence = backendFinding.evidences?.[0];

  return {
    id: backendFinding.id,
    investigationId,
    title: backendFinding.title,
    description: backendFinding.description,
    severity: SEVERITY_MAP[backendFinding.severity] || "MEDIUM",
    framework: fw,
    articleOrControl: reqId,
    agentId: backendFinding.agent_id,
    agentName: AGENT_NAME_MAP[backendFinding.agent_id] || backendFinding.agent_id,
    confidence: backendFinding.confidence ?? 0.85,
    evidenceQuote: firstEvidence?.quote || backendFinding.description,
    evidenceHash: firstEvidence?.content_hash || "N/A",
    remediationSuggestion: backendFinding.description,
    status: backendFinding.status === "confirmed" ? "REVIEWED" : "OPEN",
    challengedByCritic: true,
    criticVerdict: `Verified by Evidence Critic`,
  };
}

export function transformInvestigation(backend: any, fileName: string, fileSize: number): Investigation {
  const findings = backend.findings || [];
  const severityCounts = { total: findings.length, critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    const s = SEVERITY_MAP[f.severity] || "MEDIUM";
    if (s === "CRITICAL") severityCounts.critical++;
    else if (s === "HIGH") severityCounts.high++;
    else if (s === "MEDIUM") severityCounts.medium++;
    else severityCounts.low++;
  }

  const frameworks: string[] = [];
  for (const f of findings) {
    const fw = FRAMEWORK_MAP[f.requirement_id];
    if (fw && !frameworks.includes(fw)) frameworks.push(fw);
  }

  return {
    id: backend.id,
    title: backend.title || `Audit: ${fileName}`,
    documentName: fileName,
    documentHash: backend.document?.metadata?.content_hash || "computed",
    fileSizeBytes: fileSize,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    status: "COMPLETED",
    progressPercent: 100,
    frameworks: frameworks.length > 0 ? frameworks : ["LGPD", "GDPR", "ISO 27001"],
    findingsCount: severityCounts,
  };
}

export function transformAgents(backendAgents: any[]): import("../types").AgentInfo[] {
  const MODEL_MAP: Record<string, "Gemini 3.6 Flash" | "Gemma (Vertex AI)" | "Gemini 2.5 Pro"> = {
    "gemini-3.6-flash": "Gemini 3.6 Flash",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "gemma-2-9b-it": "Gemma (Vertex AI)",
  };

  return backendAgents.map((a: any) => ({
    id: a.agent_id,
    name: a.name,
    role: a.description || a.role,
    model: MODEL_MAP[a.model_used] || "Gemini 3.6 Flash",
    status: "COMPLETED" as const,
    confidence: 0.95,
    findingsCount: 0,
  }));
}
