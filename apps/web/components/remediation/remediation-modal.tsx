"use client";

import React, { useState } from "react";
import { Finding } from "@/lib/types";
import { Wrench, CheckCircle2, X, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface RemediationModalProps {
  finding: Finding | null;
  onClose: () => void;
  onApply: (findingId: string) => void;
}

export function RemediationModal({ finding, onClose, onApply }: RemediationModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!finding) return null;

  const handleConfirm = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsDone(true);
      setTimeout(() => {
        onApply(finding.id);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0d121d] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#0a0e17]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Plano de Remediação Automática</h3>
              <p className="text-[11px] text-slate-400 font-mono">{finding.id} · {finding.framework}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-white text-sm mb-1">{finding.title}</h4>
            <p className="text-slate-300">{finding.description}</p>
          </div>

          {/* Remediation Patch */}
          <div className="p-3.5 rounded-lg bg-[#080b11] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Redação Sugerida pelo Remediation Agent (Gemini Flash)
              </span>
              <span className="font-mono text-[10px]">Em conformidade</span>
            </div>
            <p className="text-emerald-200 text-xs italic bg-emerald-950/20 p-2.5 rounded border border-emerald-800/30">
              "{finding.remediationSuggestion}"
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-[#111726] p-2.5 rounded border border-slate-800">
            A aprovação desta remediação gera a nova versão auditável da política e atualiza o estado do Trust Graph para Válido.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0a0e17] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={isApplying || isDone}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Remediação Aplicada!
              </>
            ) : isApplying ? (
              "Processando Patch..."
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Aprovar e Atualizar Política
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
