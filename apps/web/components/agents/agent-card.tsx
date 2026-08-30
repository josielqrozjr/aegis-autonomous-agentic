"use client";

import React from "react";
import { AgentInfo } from "@/lib/types";
import { 
  Bot, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AgentInfo;
}

export function AgentCard({ agent }: AgentCardProps) {
  const getStatusBadge = () => {
    switch (agent.status) {
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            Analisando
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Concluído
          </span>
        );
      case "DEGRADED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Degradado
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-3 h-3" />
            Falha
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3" />
            Aguardando
          </span>
        );
    }
  };

  const getModelBadge = (model: AgentInfo["model"]) => {
    if (model.includes("Gemma")) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
          Gemma 2B (+0.2 Bônus)
        </span>
      );
    }
    if (model.includes("Pro")) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
          Gemini 2.5 Pro (Critic)
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
        Gemini 2.5 Flash
      </span>
    );
  };

  return (
    <div
      className={cn(
        "bg-[#0d121d] border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg",
        agent.status === "RUNNING"
          ? "border-blue-500/40 shadow-blue-500/5 bg-gradient-to-b from-[#0d121d] to-blue-950/10"
          : "border-[#1e293b] hover:border-slate-700"
      )}
    >
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "p-2 rounded-lg border",
                agent.status === "RUNNING"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-slate-800/80 border-slate-700 text-slate-300"
              )}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">{agent.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{agent.role}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Model Tag */}
        <div className="mt-3 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          {getModelBadge(agent.model)}
        </div>

        {/* Task description */}
        <div className="mt-3 p-2.5 rounded-lg bg-[#111622] border border-slate-800/80 text-xs text-slate-300">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block mb-0.5">
            Atividade em Execução
          </span>
          <p className="text-slate-300 text-xs leading-relaxed">
            {agent.currentTask || "Aguardando delegação pelo Orquestrador..."}
          </p>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Confiança:</span>
          <span className="font-mono font-semibold text-white">
            {(agent.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Apontamentos:</span>
          <span
            className={cn(
              "font-mono font-bold px-1.5 py-0.5 rounded text-[11px]",
              agent.findingsCount > 0
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-slate-800 text-slate-400"
            )}
          >
            {agent.findingsCount}
          </span>
        </div>

        {agent.lastExecutionMs && (
          <div className="text-[10px] text-slate-500 font-mono">
            {agent.lastExecutionMs}ms
          </div>
        )}
      </div>
    </div>
  );
}
