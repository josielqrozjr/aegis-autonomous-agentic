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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
    return data.graph;
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
