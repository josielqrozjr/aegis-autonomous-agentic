"use client";

import React, { useState } from "react";
import { Finding, FindingSeverity } from "@/lib/types";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  FileSearch, 
  Wrench, 
  Zap,
  Sparkles,
  RefreshCw,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FindingsPanelProps {
  findings: Finding[];
  onOpenEvidence: (finding: Finding) => void;
  onApplyRemediation: (finding: Finding) => void;
}

export function FindingsPanel({ findings, onOpenEvidence, onApplyRemediation }: FindingsPanelProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Crítico
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Alto
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Médio
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
            Baixo
          </span>
        );
    }
  };

  const filtered = findings.filter((f) => {
    if (filter === "ALL") return true;
    return f.severity === filter;
  });

  return (
    <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl overflow-hidden space-y-0">
      {/* Top bar */}
      <div className="p-5 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Apontamentos de Conformidade & Violações</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {findings.length} identificados
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada apontamento é sustentado por citações exatas, hash SHA-256 e foi desafiado pelo Evidence Critic.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#0a0e17] p-1 rounded-lg border border-[#1e293b]">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                filter === lvl
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {lvl === "ALL" ? "Todos" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="divide-y divide-[#1e293b]">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className="p-5 hover:bg-[#111726] transition-colors space-y-3 relative group"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-bold text-xs text-blue-400">{finding.id}</span>
                <span className="text-slate-600">·</span>
                <span className="font-bold text-sm text-white tracking-tight">{finding.title}</span>
                {getSeverityBadge(finding.severity)}
                {finding.status === "REOPENED_DRIFT" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    Reaberto por Policy Drift
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Confiança do Modelo:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {(finding.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Description and Legal Context */}
            <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#162033] border border-blue-500/20 text-blue-300 font-mono text-[11px]">
                {finding.framework} · {finding.articleOrControl}
              </span>
              <span className="text-slate-500 text-[11px] font-mono">
                Agente: {finding.agentName}
              </span>
            </div>

            {/* Evidence block */}
            <div className="p-3 rounded-lg bg-[#090d15] border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1 text-cyan-400">
                  <FileSearch className="w-3 h-3" /> Citação do Documento Fonte
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {finding.evidenceHash.slice(0, 16)}...
                </span>
              </div>
              <blockquote className="text-xs text-slate-300 italic border-l-2 border-cyan-500/50 pl-2.5 py-0.5">
                "{finding.evidenceQuote}"
              </blockquote>
            </div>

            {/* Adversarial Review Badge */}
            {finding.challengedByCritic && (
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-purple-300">Revisão Adversarial (Gemini 2.5 Pro): </span>
                  <span>{finding.criticVerdict || "Evidência confirmada e validada sem contestação."}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onOpenEvidence(finding)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileSearch className="w-3.5 h-3.5" />
                Ver Destaque no Documento Original
              </button>

              <button
                onClick={() => onApplyRemediation(finding)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <Wrench className="w-3.5 h-3.5" />
                Aplicar Remediação Sugerida
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
