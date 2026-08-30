"use client";

import React from "react";

export function AdversarialReviewCard() {
  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A3038]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Camada de Revisão Adversarial (Evidence Critic)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
              Gemini 2.5 Pro
            </span>
          </div>
          <p className="text-xs text-[#9096A0] mt-0.5">
            Raciocínio crítico para eliminação de falsos positivos e contestações infundadas.
          </p>
        </div>

        <span className="text-[11px] font-mono text-[#3B8F6B] px-2 py-0.5 rounded bg-[#3B8F6B]/15 border border-[#3B8F6B]/30">
          Auditado
        </span>
      </div>

      {/* Grid Comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-1.5">
          <div className="flex justify-between font-mono text-[10px] text-[#5C636E]">
            <span>1. Proposta do Especialista (Gemini Flash)</span>
            <span>Pré-Crítica</span>
          </div>
          <p className="text-[#B8BDC7]">
            "A política viola o GDPR por permitir armazenamento em backup frio por 2 anos."
          </p>
          <div className="text-[11px] text-[#9096A0] italic">
            Interpretação literal de exclusão imediata em fitas e mídias magnéticas.
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-1.5">
          <div className="flex justify-between font-mono text-[10px] text-[#B8843A]">
            <span>2. Veredito do Evidence Critic (Gemini Pro)</span>
            <span className="text-[#3B8F6B]">Falso Positivo Refinado</span>
          </div>
          <p className="text-white">
            "O GDPR (Art. 17) aceita sobrescrita cíclica em backups frios desde que isolados de consultas ativas."
          </p>
          <div className="text-[11px] text-[#3B8F6B]">
            Resultado: Severidade ajustada de 'Crítica' para 'Recomendação de Isolamento'.
          </div>
        </div>
      </div>
    </div>
  );
}
