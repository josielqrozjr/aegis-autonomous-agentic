"use client";

import React, { useState } from "react";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { 
  ShieldCheck, 
  FileText, 
  Bot, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ExternalLink,
  Info,
  RefreshCw,
  Hash,
  Globe
} from "lucide-react";
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
  onSimulateDrift,
  isDrifting = false,
}: TrustGraphViewerProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [inspectingNode, setInspectingNode] = useState<TrustGraphNode | null>(null);

  const getNodeIcon = (type: TrustGraphNode["type"]) => {
    switch (type) {
      case "requirement":
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case "agent":
        return <Bot className="w-4 h-4 text-purple-400" />;
      case "evidence":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case "finding":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  const getNodeCategoryLabel = (type: TrustGraphNode["type"]) => {
    switch (type) {
      case "requirement":
        return "Requisito Regulatório";
      case "agent":
        return "Agente Executor";
      case "evidence":
        return "Evidência Rastreável";
      case "finding":
        return "Apontamento (Finding)";
    }
  };

  // Group nodes by column for DAG layout
  const columns = {
    requirement: graphData.nodes.filter((n) => n.type === "requirement"),
    agent: graphData.nodes.filter((n) => n.type === "agent"),
    evidence: graphData.nodes.filter((n) => n.type === "evidence"),
    finding: graphData.nodes.filter((n) => n.type === "finding"),
  };

  const handleSelect = (node: TrustGraphNode) => {
    setInspectingNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  return (
    <div className="bg-[#0a0e17] border border-[#1e293b] rounded-xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 bg-[#0d121d] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Share2Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Trust & Compliance Graph
              {isDrifting && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  Policy Drift Invalidação em Cascata Ativa
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Rastreabilidade ponta a ponta: Requisito ➔ Agente ➔ Evidência com Hash ➔ Conclusão
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Válido / Conforme</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px]">Invalidado / Risco</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px]">Sob Reavaliação</span>
          </div>
        </div>
      </div>

      {/* Main Graph Grid (4 Columns DAG Layout) */}
      <div className="p-6 overflow-x-auto min-h-[420px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[800px]">
          {/* Coluna 1: Requisitos */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-wider text-blue-400 pb-1 border-b border-blue-500/20 flex items-center justify-between">
              <span>1. Requisitos Legais</span>
              <span className="font-mono text-slate-500 text-[10px]">{columns.requirement.length}</span>
            </div>
            <div className="space-y-3">
              {columns.requirement.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                  getNodeIcon={getNodeIcon}
                />
              ))}
            </div>
          </div>

          {/* Coluna 2: Agentes */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-wider text-purple-400 pb-1 border-b border-purple-500/20 flex items-center justify-between">
              <span>2. Agentes de IA</span>
              <span className="font-mono text-slate-500 text-[10px]">{columns.agent.length}</span>
            </div>
            <div className="space-y-3">
              {columns.agent.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                  getNodeIcon={getNodeIcon}
                />
              ))}
            </div>
          </div>

          {/* Coluna 3: Evidências */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 pb-1 border-b border-cyan-500/20 flex items-center justify-between">
              <span>3. Evidências Extraídas</span>
              <span className="font-mono text-slate-500 text-[10px]">{columns.evidence.length}</span>
            </div>
            <div className="space-y-3">
              {columns.evidence.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                  getNodeIcon={getNodeIcon}
                />
              ))}
            </div>
          </div>

          {/* Coluna 4: Findings */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-wider text-rose-400 pb-1 border-b border-rose-500/20 flex items-center justify-between">
              <span>4. Apontamentos</span>
              <span className="font-mono text-slate-500 text-[10px]">{columns.finding.length}</span>
            </div>
            <div className="space-y-3">
              {columns.finding.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id || inspectingNode?.id === node.id}
                  onClick={() => handleSelect(node)}
                  getNodeIcon={getNodeIcon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer de Detalhes do Nó Inspecionado */}
      {inspectingNode && (
        <div className="p-4 bg-[#0d121d] border-t border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#141b2b] border border-slate-700 text-white mt-0.5">
              {getNodeIcon(inspectingNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{inspectingNode.id}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-semibold text-white">{inspectingNode.source}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono",
                    inspectingNode.valid
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  )}
                >
                  {inspectingNode.valid ? "Válido" : "Invalidado"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {inspectingNode.details || "Nenhum detalhe adicional disponível para este nó."}
              </p>
              {inspectingNode.invalidated_reason && (
                <div className="mt-1.5 text-xs text-rose-300 font-medium flex items-center gap-1.5 bg-rose-950/30 p-1.5 rounded border border-rose-800/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Motivo da Invalidação: {inspectingNode.invalidated_reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-slate-500">Hash: </span>
              <span className="text-slate-300">{inspectingNode.content_hash.slice(0, 16)}...</span>
            </div>
            <button
              onClick={() => setInspectingNode(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
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
  getNodeIcon,
}: {
  node: TrustGraphNode;
  isSelected: boolean;
  onClick: () => void;
  getNodeIcon: (type: TrustGraphNode["type"]) => React.ReactNode;
}) {
  const isInvalid = !node.valid;
  const isReevaluating = node.affected_by_change;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200 shadow-sm relative group",
        isInvalid
          ? "bg-rose-950/20 border-rose-500/60 text-rose-200 shadow-rose-500/10 hover:border-rose-400"
          : isReevaluating
          ? "bg-amber-950/20 border-amber-500/60 text-amber-200 hover:border-amber-400"
          : "bg-[#0d121d] border-[#1e293b] text-slate-200 hover:border-slate-600 hover:bg-[#121826]",
        isSelected && "ring-2 ring-blue-500 border-blue-500"
      )}
    >
      {/* Top indicator dot */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getNodeIcon(node.type)}
          <span className="text-[10px] font-mono font-semibold text-slate-400">
            {node.id}
          </span>
        </div>
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isInvalid
              ? "bg-rose-500 animate-ping"
              : isReevaluating
              ? "bg-amber-400 animate-pulse"
              : "bg-emerald-500"
          )}
        />
      </div>

      <div className="font-medium text-xs text-white line-clamp-2 leading-snug">
        {node.source}
      </div>

      <div className="mt-2 pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Confiança: {(node.confidence * 100).toFixed(0)}%</span>
        <span>{node.jurisdiction}</span>
      </div>
    </div>
  );
}

function Share2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
