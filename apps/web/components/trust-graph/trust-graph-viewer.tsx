"use client";

import React, { useState } from "react";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface TrustGraphViewerProps {
  graphData: TrustGraphData;
  onNodeSelect?: (node: TrustGraphNode) => void;
  selectedNodeId?: string | null;
  onSimulateDrift?: () => void;
  isDrifting?: boolean;
}

export function TrustGraphViewer({
  graphData,
  onNodeSelect,
  selectedNodeId,
  isDrifting = false,
}: TrustGraphViewerProps) {
  const [inspectingNode, setInspectingNode] = useState<TrustGraphNode | null>(null);

  const columns = {
    requirement: graphData.nodes.filter((n) => n.type === "requirement"),
    agent: graphData.nodes.filter((n) => n.type === "agent"),
    evidence: graphData.nodes.filter((n) => n.type === "evidence"),
    finding: graphData.nodes.filter((n) => n.type === "finding"),
  };

  const handleSelect = (node: TrustGraphNode) => {
    setInspectingNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 bg-[#12161A] border-b border-[#2A3038] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Trust & Compliance Graph
            </h3>
            {isDrifting && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A24438]/20 text-[#A24438] border border-[#A24438]/40 animate-pulse">
                Policy Drift Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#9096A0] mt-0.5">
            End-to-end traceability: Requirements ➔ Agents ➔ Evidence ➔ Findings
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-[#9096A0]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3B8F6B]" />
            <span>Valid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A24438]" />
            <span>Invalidated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B8843A]" />
            <span>Under Review</span>
          </div>
        </div>
      </div>

      {/* 4-Columns DAG Grid */}
      <div className="p-5 overflow-x-auto bg-[#0D1013]/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[760px]">
          {/* Col 1 */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9096A0] pb-1 border-b border-[#2A3038] flex justify-between">
              <span>1. Requirements</span>
              <span>{columns.requirement.length}</span>
            </div>
            <div className="space-y-2">
              {columns.requirement.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                />
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9096A0] pb-1 border-b border-[#2A3038] flex justify-between">
              <span>2. AI Agents</span>
              <span>{columns.agent.length}</span>
            </div>
            <div className="space-y-2">
              {columns.agent.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                />
              ))}
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9096A0] pb-1 border-b border-[#2A3038] flex justify-between">
              <span>3. Evidence</span>
              <span>{columns.evidence.length}</span>
            </div>
            <div className="space-y-2">
              {columns.evidence.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                />
              ))}
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9096A0] pb-1 border-b border-[#2A3038] flex justify-between">
              <span>4. Findings</span>
              <span>{columns.finding.length}</span>
            </div>
            <div className="space-y-2">
              {columns.finding.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Drawer */}
      {inspectingNode && (
        <div className="p-4 bg-[#12161A] border-t border-[#2A3038] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#B8843A] font-bold">{inspectingNode.id}</span>
              <span className="text-[#5C636E]">·</span>
              <span className="text-white font-medium">{inspectingNode.source}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono",
                  inspectingNode.valid
                    ? "bg-[#3B8F6B]/15 text-[#3B8F6B]"
                    : "bg-[#A24438]/15 text-[#A24438]"
                )}
              >
                {inspectingNode.valid ? "Valid" : "Invalidated"}
              </span>
            </div>
            <p className="text-[11px] text-[#9096A0]">
              {inspectingNode.details || "No additional details available."}
            </p>
            {inspectingNode.invalidated_reason && (
              <p className="text-[11px] text-[#A24438] font-mono">
                Reason: {inspectingNode.invalidated_reason}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-[#9096A0]">
            <span>Hash: {inspectingNode.content_hash.slice(0, 16)}...</span>
            <button
              onClick={() => setInspectingNode(null)}
              className="text-[#9096A0] hover:text-white px-2.5 py-1 rounded bg-[#171B1F] border border-[#2A3038] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NodeCard({
  node,
  isSelected,
  onClick,
}: {
  node: TrustGraphNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isInvalid = !node.valid;
  const isReevaluating = node.affected_by_change;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all text-xs space-y-1.5",
        isInvalid
          ? "bg-[#A24438]/10 border-[#A24438]/50 text-white"
          : isReevaluating
          ? "bg-[#B8843A]/10 border-[#B8843A]/50 text-white"
          : "bg-[#171B1F] border-[#2A3038] text-[#B8BDC7] hover:border-[#38414D] hover:text-white",
        isSelected && "ring-1 ring-[#B8843A] border-[#B8843A]"
      )}
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-[#9096A0]">
        <span>{node.id}</span>
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isInvalid ? "bg-[#A24438]" : isReevaluating ? "bg-[#B8843A]" : "bg-[#3B8F6B]"
          )}
        />
      </div>

      <div className="font-medium text-xs leading-snug line-clamp-2">
        {node.source}
      </div>

      <div className="pt-1.5 border-t border-[#2A3038] flex justify-between text-[10px] font-mono text-[#5C636E]">
        <span>conf {(node.confidence * 100).toFixed(0)}%</span>
        <span>{node.jurisdiction}</span>
      </div>
    </div>
  );
}
