"use client";

import React from "react";
import { Sparkles, ShieldCheck, Scale, AlertOctagon, CheckCircle2, ArrowRight } from "lucide-react";

export function AdversarialReviewCard() {
  return (
    <div className="bg-[#0d121d] border border-purple-500/30 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Camada de Revisão Adversarial (Evidence Critic)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30">
                Gemini 2.5 Pro (+0.2 Bônus)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              O modelo com maior capacidade de raciocínio desafia ativamente as conclusões para eliminar falsos positivos.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Auditado
        </span>
      </div>

      {/* Comparison Grid (Antes vs Depois) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Lado 1: Especialista Flash */}
        <div className="p-3.5 rounded-lg bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-blue-400">1. Proposta do Especialista (Gemini Flash)</span>
            <span className="text-[10px] font-mono">Pré-Revisão</span>
          </div>
          <p className="text-xs text-slate-300">
            "A política viola o GDPR por permitir armazenamento em backup frio por 2 anos."
          </p>
          <div className="text-[11px] text-slate-500 italic">
            Argumento inicial: Interpretação literal de exclusão imediata sem considerar viabilidade técnica de backups.
          </div>
        </div>

        {/* Lado 2: Evidence Critic Pro */}
        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-300">2. Veredito do Evidence Critic (Gemini Pro)</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Falso Positivo Refinado</span>
          </div>
          <p className="text-xs text-purple-100">
            "O GDPR (Art. 17) aceita sobrescrita cíclica em fitas/backups frios desde que os dados sejam isolados de consultas ativas."
          </p>
          <div className="text-[11px] text-emerald-400 font-medium">
            Resultado: Severidade ajustada de 'Crítica' para 'Recomendação de Isolamento', evitando penalização indevida.
          </div>
        </div>
      </div>
    </div>
  );
}
