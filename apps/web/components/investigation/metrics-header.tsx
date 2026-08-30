"use client";

import React from "react";
import { ShieldCheck, Activity, AlertOctagon, Wrench } from "lucide-react";

export function MetricsHeader() {
  const metrics = [
    {
      title: "Total de Auditorias",
      value: "47",
      subtext: "+3 este mês",
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Em Execução",
      value: "2",
      subtext: "3 agentes ativos",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      pulse: true,
    },
    {
      title: "Findings Abertos",
      value: "18",
      subtext: "6 críticos / alta",
      icon: AlertOctagon,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Ações de Remediação",
      value: "9",
      subtext: "2 automáticas prontas",
      icon: Wrench,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{m.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">
                  {m.value}
                </span>
                <span className="text-[11px] text-slate-400">{m.subtext}</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-lg border ${m.bg} ${m.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
