"use client";

import React, { useState } from "react";
import { Finding } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FindingsPanelProps {
  findings: Finding[];
  onOpenEvidence: (finding: Finding) => void;
  onApplyRemediation: (finding: Finding) => void;
}

export function FindingsPanel({ findings, onOpenEvidence, onApplyRemediation }: FindingsPanelProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = findings.filter((f) => {
    if (filter === "ALL") return true;
    return f.severity === filter;
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2A3038]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Audit Findings ({findings.length})
          </h3>
          <p className="text-xs text-[#9096A0]">
            Traceable, verified non-compliance evidence validated by the autonomous agent fleet.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-[#171B1F] p-1 rounded-lg border border-[#2A3038]">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                filter === lvl
                  ? "bg-[#21262B] text-[#B8843A] font-semibold"
                  : "text-[#9096A0] hover:text-white"
              )}
            >
              {lvl === "ALL" ? "All" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Grid - Estilo idêntico ao APLICADO da imagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 space-y-3 transition-colors hover:border-[#3A434F]"
          >
            {/* Top Agent Indicator */}
            <div className="flex items-center justify-between text-xs text-[#9096A0]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4C8FA6]" />
                <span className="font-mono text-[11px] text-[#B8BDC7]">{finding.agentName}</span>
              </div>
              <span className="font-mono text-[10px] text-[#9096A0]">{finding.id}</span>
            </div>

            {/* Title & Status Badge */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                {finding.title}
              </h4>
              <div className="flex items-center gap-2">
                {finding.status === "REOPENED_DRIFT" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#A24438]/20 text-[#A24438] border border-[#A24438]/40 animate-pulse font-mono">
                    Reopened by Policy Drift
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#3B8F6B]/15 text-[#3B8F6B] border border-[#3B8F6B]/30 font-mono">
                    Confirmed
                  </span>
                )}
                <span className="text-[10px] text-[#9096A0] font-mono">
                  {finding.framework} · {finding.articleOrControl}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#9096A0] leading-relaxed line-clamp-2">
              {finding.description}
            </p>

            {/* Clean blockquote */}
            <div className="p-2.5 rounded bg-[#0D1013] border border-[#2A3038] text-[11px] text-[#B8BDC7] italic font-mono">
              "{finding.evidenceQuote.slice(0, 120)}..."
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed border-[#2A3038] pt-2 flex items-center justify-between text-[11px] font-mono text-[#9096A0]">
              <button
                onClick={() => onOpenEvidence(finding)}
                className="text-[#4C8FA6] hover:text-[#7EB5CC] transition-colors cursor-pointer"
              >
                policy.pdf §2.1 · inspect highlight
              </button>

              <div className="flex items-center gap-3">
                <span>conf {(finding.confidence).toFixed(2)}</span>
                <button
                  onClick={() => onApplyRemediation(finding)}
                  className="px-2.5 py-1 rounded text-[10px] font-semibold bg-[#B8843A]/20 hover:bg-[#B8843A]/30 text-[#D4A559] border border-[#B8843A]/40 transition-colors cursor-pointer"
                >
                  Remediate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
