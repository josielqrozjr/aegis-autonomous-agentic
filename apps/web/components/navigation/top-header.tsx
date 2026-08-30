"use client";

import React from "react";
import { Shield, Sparkles, Activity, CheckCircle2 } from "lucide-react";

interface TopHeaderProps {
  currentInvestigationId?: string;
}

export function TopHeader({ currentInvestigationId = "INV-2024-0047" }: TopHeaderProps) {
  return (
    <header className="h-16 bg-[#0d121d] border-b border-[#1e293b] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-base tracking-wide">AEGIS</span>
          <span className="text-slate-600">/</span>
          <span className="text-sm text-slate-300 font-medium">
            Compliance Regulatório · IA Multiagente
          </span>
        </div>
        <span className="ml-3 px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {currentInvestigationId}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Orquestrador Ativo</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Figma MCP Conectado</span>
        </div>
      </div>
    </header>
  );
}
