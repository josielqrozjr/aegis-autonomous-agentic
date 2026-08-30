"use client";

import React from "react";
import { Check, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvestigationStatus } from "@/lib/types";

interface PipelineStepperProps {
  currentStatus: InvestigationStatus;
}

export function PipelineStepper({ currentStatus }: PipelineStepperProps) {
  const steps = [
    {
      id: "UNDERSTANDING",
      title: "1. Leitura & Hash",
      desc: "Gemini 2.5 Flash",
    },
    {
      id: "PLANNING",
      title: "2. Varredura PII",
      desc: "Gemma Model Garden",
    },
    {
      id: "INVESTIGATING",
      title: "3. Agentes em Paralelo",
      desc: "LGPD, GDPR, ISO 27001",
    },
    {
      id: "ADVERSARIAL_REVIEW",
      title: "4. Revisão Adversarial",
      desc: "Gemini 2.5 Pro",
    },
    {
      id: "COMPLETED",
      title: "5. Trust Graph & Relatório",
      desc: "Evidências Validadas",
    },
  ];

  const getStepState = (stepIndex: number) => {
    const statusOrder: InvestigationStatus[] = [
      "UNDERSTANDING",
      "PLANNING",
      "INVESTIGATING",
      "ADVERSARIAL_REVIEW",
      "COMPLETED",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);

    if (stepIndex < currentIndex || currentStatus === "COMPLETED") {
      return "completed";
    }
    if (stepIndex === currentIndex) {
      return "active";
    }
    return "pending";
  };

  return (
    <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white tracking-wide">
          Estágios do Pipeline de Investigação Autônoma
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          Status Atual: {currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          return (
            <div
              key={step.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between",
                state === "completed" && "bg-emerald-950/20 border-emerald-500/40 text-emerald-300",
                state === "active" && "bg-blue-600/15 border-blue-500/50 text-blue-200 shadow-md shadow-blue-500/10",
                state === "pending" && "bg-[#111622] border-slate-800 text-slate-500 opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono">ETAPA 0{idx + 1}</span>
                {state === "completed" && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                {state === "active" && (
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                )}
                {state === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{step.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
