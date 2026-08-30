"use client";

import React, { useState } from "react";
import { 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerRegulatoryChange } from "@/lib/api/client";

interface PolicyDriftPanelProps {
  onDriftTriggered: (scenario: {
    framework: string;
    version: string;
    description: string;
    invalidatedNodeIds: string[];
  }) => void;
  onReset: () => void;
  isDriftActive: boolean;
}

export function PolicyDriftPanel({ onDriftTriggered, onReset, isDriftActive }: PolicyDriftPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const handleSimulateDrift = async () => {
    setIsExecuting(true);
    setStepLog(["1. Disparando evento de mudança regulatória no endpoint /api/v1/regulatory-changes..."]);

    const payload = {
      framework: "GDPR",
      version: "v2.0-2026",
      change_description: "Prazo de retenção de dados cadastrais e logs reduzido de 5 para 2 anos.",
      affected_requirements: ["req-gdpr-5"],
    };

    await triggerRegulatoryChange(payload);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "2. ChangeDetectionAgent (Gemini Flash) calculou o Blast Radius: 3 nós afetados.",
      ]);
    }, 1000);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "3. Invalidação em cascata propagada: req-gdpr-5 ➔ ev-prazo-90dias ➔ find-02-node (REABERTO).",
      ]);
      onDriftTriggered({
        framework: "GDPR",
        version: "v2.0-2026",
        description: "Prazo máximo de retenção reduzido para 2 anos (Art. 5(1)(e) GDPR v2).",
        invalidatedNodeIds: ["req-gdpr-5", "ev-prazo-90dias", "find-02-node"],
      });
      setIsExecuting(false);
    }, 2200);
  };

  return (
    <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Motor de Policy Drift & Raio de Impacto (Blast Radius)
            </h3>
            <p className="text-xs text-slate-400">
              Simule uma alteração nas leis para testar a invalidação em cascata e reavaliação seletiva de agentes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDriftActive ? (
            <button
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar Grafo Original
            </button>
          ) : (
            <button
              onClick={handleSimulateDrift}
              disabled={isExecuting}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg",
                isExecuting
                  ? "bg-amber-600/50 text-amber-200 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/20 cursor-pointer"
              )}
            >
              <Flame className="w-4 h-4" />
              <span>{isExecuting ? "Calculando Impacto..." : "Simular Mudança Regulatória (GDPR v2)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cenário da Mudança */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#111622] border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Evento Regulatório</span>
          <p className="text-slate-200 font-semibold">GDPR Art. 5(1)(e) — Revisão 2026</p>
          <span className="text-[11px] text-amber-400 font-mono">Prazo reduzido de 5 para 2 anos</span>
        </div>

        <div className="p-3 rounded-lg bg-[#111622] border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Raio de Impacto (Blast Radius)</span>
          <p className="text-slate-200 font-semibold font-mono">
            {isDriftActive ? "3 nós invalidados" : "Aguardando disparo..."}
          </p>
          <span className="text-[11px] text-slate-400">Requisito ➔ Evidência ➔ Finding</span>
        </div>

        <div className="p-3 rounded-lg bg-[#111622] border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Recuperação Seletiva</span>
          <p className="text-slate-200 font-semibold font-mono">
            {isDriftActive ? "Especialista GDPR re-executado" : "Zero re-execuções"}
          </p>
          <span className="text-[11px] text-emerald-400">Apenas o afetado é reprocessado</span>
        </div>
      </div>

      {/* Log de Passos em Tempo Real */}
      {stepLog.length > 0 && (
        <div className="p-3 rounded-lg bg-[#0a0e17] border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
          {stepLog.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-cyan-300">
              <span>▶</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
