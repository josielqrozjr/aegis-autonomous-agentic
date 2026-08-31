"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MetricsHeaderProps {
  onNavigate?: (tabId: string) => void;
  totalInvestigations?: number;
  activeAgents?: number;
  findingsCount?: number;
  remediationsCount?: number;
}

export function MetricsHeader({
  onNavigate,
  totalInvestigations = 2,
  activeAgents = 5,
  findingsCount = 4,
  remediationsCount = 0,
}: MetricsHeaderProps) {
  const metrics = [
    {
      targetTab: "investigations",
      label: "Total Investigations",
      value: `${totalInvestigations}`,
    },
    {
      targetTab: "new-investigation",
      label: "Active AI",
      value: `${activeAgents}`,
    },
    {
      targetTab: "dashboard",
      label: "Findings Identified",
      value: `${findingsCount}`,
    },
    {
      targetTab: "remediation",
      label: "Remediations Applied",
      value: `${remediationsCount}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          onClick={() => onNavigate && onNavigate(m.targetTab)}
          className={cn(
            "bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all duration-200 group space-y-1.5",
            onNavigate && "cursor-pointer hover:border-[#B8843A] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5"
          )}
        >
          <div className="text-3xl font-bold font-mono text-white tracking-tight text-center group-hover:text-[#B8843A] transition-colors">
            {m.value}
          </div>
          <div className="text-[11px] font-mono font-medium text-[#9096A0] uppercase tracking-wider text-center group-hover:text-[#B8843A] transition-colors">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
