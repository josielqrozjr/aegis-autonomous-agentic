"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Wrench, 
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoFlowControllerProps {
  onStepChange: (step: number) => void;
  currentStep: number;
  onReset: () => void;
}

export function DemoFlowController({ onStepChange, currentStep, onReset }: DemoFlowControllerProps) {
  const steps = [
    {
      step: 1,
      title: "1. Upload & Leitura",
      desc: "Ingestão da política e varredura PII com Gemma 2B",
      action: "Iniciar Auditoria",
    },
    {
      step: 2,
      title: "2. Análise Multiagente",
      desc: "Especialistas LGPD/GDPR e Evidence Critic (Gemini Pro)",
      action: "Ver Grafo de Confiança",
    },
    {
      step: 3,
      title: "3. Policy Drift (GDPR v2)",
      desc: "Mudança regulatória ➔ Invalidação em cascata no Grafo",
      action: "Simular Mudança de Lei",
    },
    {
      step: 4,
      title: "4. Remediação & Relatório",
      desc: "Correção automática da IA e emissão do dossiê final",
      action: "Concluir Demonstração",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-950/40 via-[#0d121d] to-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 shadow-lg shadow-cyan-950/20 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">
                Modo Demonstração Rápida dos Jurados (Regra dos ≤ 3 Cliques)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Demo Flow
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Guia passo a passo para avaliar a inteligência multiagente, o Trust Graph e o Policy Drift em poucos segundos.
            </p>
          </div>
        </div>

        {/* Controller actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar Demo
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => onStepChange(currentStep + 1)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Avançar para: {steps[currentStep].title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Demonstração Completa!
            </span>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#1e293b]/80">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <button
              key={s.step}
              onClick={() => onStepChange(s.step)}
              className={cn(
                "p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between",
                isActive && "bg-blue-600/15 border-cyan-400/50 text-white shadow-sm",
                isDone && "bg-emerald-950/20 border-emerald-500/30 text-slate-300",
                !isActive && !isDone && "bg-[#111622]/60 border-slate-800/80 text-slate-500"
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className={cn(isActive ? "text-cyan-300" : isDone ? "text-emerald-400" : "text-slate-400")}>
                  {s.title}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
