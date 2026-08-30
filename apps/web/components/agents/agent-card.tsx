"use client";

import React from "react";
import { AgentInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AgentInfo;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isRunning = agent.status === "RUNNING";

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4 space-y-3 transition-colors hover:border-[#38414D]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isRunning ? "bg-[#4C8FA6] animate-pulse" : "bg-[#3B8F6B]"
            )}
          />
          <h4 className="text-xs font-bold text-white tracking-tight font-mono">{agent.name}</h4>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
          {agent.model}
        </span>
      </div>

      {/* Role */}
      <p className="text-xs text-[#9096A0] leading-relaxed line-clamp-2">
        {agent.role}
      </p>

      {/* Task */}
      <div className="p-2.5 rounded bg-[#0D1013] border border-[#2A3038] text-[11px] text-[#B8BDC7] font-mono">
        <span className="text-[#5C636E] block text-[9px] uppercase tracking-wider mb-0.5">Tarefa:</span>
        <span className="line-clamp-1">{agent.currentTask}</span>
      </div>

      {/* Stats */}
      <div className="border-t border-[#2A3038] pt-2 flex items-center justify-between text-[11px] font-mono text-[#9096A0]">
        <div>
          <span>Confiança: </span>
          <span className="text-white font-semibold">{(agent.confidence * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span>Tempo: </span>
          <span className="text-white">{agent.lastExecutionMs}ms</span>
        </div>
      </div>
    </div>
  );
}
