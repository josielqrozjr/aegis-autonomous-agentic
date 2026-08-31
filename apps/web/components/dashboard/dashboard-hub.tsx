"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardHubProps {
  onNavigate: (tabId: string) => void;
  investigationsCount?: number;
  agentsCount?: number;
  findingsCount?: number;
  driftNodesCount?: number;
  compliancePercent?: number;
}

export function DashboardHub({
  onNavigate,
  investigationsCount = 4,
  agentsCount = 5,
  findingsCount = 13,
  driftNodesCount = 0,
  compliancePercent = 100,
}: DashboardHubProps) {
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  const bigNumberCards = [
    {
      id: "investigations",
      number: formatNumber(investigationsCount),
      label: "Total Investigations",
      subLabel: "Audited Regulatory Records",
      helper: "Repository across LGPD, GDPR and ISO 27001",
      targetName: "Investigations",
    },
    {
      id: "new-investigation",
      number: formatNumber(agentsCount),
      label: "Active AI",
      subLabel: "Real-Time Pipeline Execution",
      helper: "Gemma 2 (Vertex AI), Gemini 1.5 & Gemini 2.5",
      targetName: "New Investigation",
    },
    {
      id: "dashboard",
      number: formatNumber(findingsCount),
      label: "Audit Findings",
      subLabel: "Verified Evidence Chains",
      helper: "DAG nodes validated by Gemini 2.5 Critic",
      targetName: "Trust Graph & Agents",
    },
    {
      id: "remediation",
      number: formatNumber(driftNodesCount),
      label: "Policy Drift Nodes",
      subLabel: "Cascade Invalidation Simulation",
      helper: "Dynamic regulatory simulation & patch generation",
      targetName: "Continuous Monitoring",
    },
    {
      id: "report",
      number: `${compliancePercent}%`,
      label: "Verified Dossier",
      subLabel: "Cryptographic Seal Active",
      helper: "Board-ready audit certificate & PDF export",
      targetName: "Final Report",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="pb-3 border-b border-[#2A3038]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Dashboard
        </h2>
        <p className="text-xs text-[#9096A0] mt-0.5">
          Click any metric indicator below to navigate directly to its specialized module.
        </p>
      </div>

      {/* Big Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bigNumberCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group bg-[#171B1F] border border-[#2A3038] hover:border-[#B8843A] rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-black/50 hover:-translate-y-0.5 text-center"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9096A0] group-hover:text-[#B8843A] transition-colors">
                {card.label}
              </span>
            </div>

            {/* Centralized Big Number */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold font-mono text-white tracking-tight group-hover:text-[#B8843A] transition-colors my-1">
                {card.number}
              </div>
              <div className="text-xs font-semibold text-[#B8BDC7] mt-1">
                {card.subLabel}
              </div>
              <div className="text-[11px] text-[#5C636E] font-mono mt-0.5 max-w-xs">
                {card.helper}
              </div>
            </div>

            {/* Bottom Target Link */}
            <div className="pt-3 border-t border-[#2A3038] flex items-center justify-center text-xs font-mono text-[#B8843A]">
              <span className="group-hover:text-[#CCA159] transition-colors font-semibold text-center">
                {card.targetName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
