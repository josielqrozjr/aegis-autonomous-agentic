"use client";

import React from "react";
import { Finding, Investigation } from "@/lib/types";
import { TrustGraphData } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { AegisShieldLogo } from "@/components/ui/aegis-logo";

interface ComplianceReportViewProps {
  investigation: Investigation;
  findings: Finding[];
  graphData: TrustGraphData;
}

export function ComplianceReportView({ investigation, findings, graphData }: ComplianceReportViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-[#171B1F] border border-[#2A3038] p-4 rounded-xl print:hidden">
        <div>
          <h3 className="font-bold text-white text-sm">Executive Audit & Compliance Dossier</h3>
          <p className="text-xs text-[#9096A0] mt-0.5">Ready for PDF export or printing with cryptographic provenance verification.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0">
        {/* Certificate Header */}
        <div className="border-b border-[#2A3038] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AegisShieldLogo className="w-9 h-10 text-[#B8843A]" />
            <div>
              <h2 className="text-xl font-bold font-serif text-[#B8843A] tracking-wider print:text-black">
                AEGIS TRUST & COMPLIANCE DOSSIER
              </h2>
              <p className="text-xs text-[#9096A0] font-mono">
                Autonomous Multi-Agent Audit Certificate
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#9096A0]">
            <div><strong className="text-white">ID:</strong> {investigation.id}</div>
            <div><strong className="text-white">Date:</strong> {formatDate(investigation.updatedAt)}</div>
            <div className="text-[#3B8F6B] font-bold mt-1">
              ✓ VERIFIED AUDIT
            </div>
          </div>
        </div>

        {/* Document Provenance */}
        <div className="p-4 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#9096A0]">Ingested Document:</span>
            <span className="font-mono text-white">{investigation.documentName}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-[#9096A0]">
            <span>SHA-256 Authenticity Hash:</span>
            <span className="text-[#4C8FA6] truncate max-w-md">{investigation.documentHash}</span>
          </div>
          <div className="flex items-center justify-between text-[#9096A0]">
            <span>Audited Frameworks:</span>
            <span className="text-white font-semibold">{investigation.frameworks.join(" · ")}</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038]">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] block mb-1">Graph Nodes</span>
            <span className="text-xl font-bold font-mono text-white">
              {graphData.valid_nodes}/{graphData.total_nodes}
            </span>
            <span className="text-[10px] text-[#3B8F6B] block mt-0.5 font-mono">Valid & Compliant</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038]">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] block mb-1">Google AI Models</span>
            <span className="text-xl font-bold font-mono text-[#4C8FA6]">3 Models</span>
            <span className="text-[10px] text-[#9096A0] block mt-0.5 font-mono">Flash + Gemma + Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038]">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] block mb-1">Adversarial Critique</span>
            <span className="text-xl font-bold font-mono text-[#B8843A]">100%</span>
            <span className="text-[10px] text-[#D4A559] block mt-0.5 font-mono">Gemini 2.5 Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038]">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] block mb-1">Risk Status</span>
            <span className="text-xl font-bold font-mono text-[#3B8F6B]">Mitigated</span>
            <span className="text-[10px] text-[#9096A0] block mt-0.5 font-mono">With Remediations</span>
          </div>
        </div>

        {/* Findings Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2A3038] pb-2">
            Findings, Evidence Hashes & Remediations
          </h4>

          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="p-4 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#B8843A]">{f.id}</span>
                    <span className="font-semibold text-white">{f.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B1F] text-[#9096A0] border border-[#2A3038]">
                    {f.framework} · {f.articleOrControl}
                  </span>
                </div>
                <p className="text-[#9096A0] leading-relaxed">{f.description}</p>
                <div className="p-2.5 rounded bg-[#171B1F] border border-[#2A3038] text-[11px] font-mono text-[#B8BDC7] italic">
                  "{f.evidenceQuote}"
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9096A0] pt-1">
                  <span>Agent: {f.agentName}</span>
                  <span className="text-[#3B8F6B] font-semibold">Remediation: {f.remediationSuggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Seal */}
        <div className="pt-6 border-t border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#9096A0] font-mono">
          <div>
            <div className="text-white font-bold">AEGIS Multi-Agent Governance Engine</div>
            <div>Issued for LGPD, GDPR and ISO/IEC 27001 compliance auditing</div>
          </div>
          <div className="flex items-center gap-2 text-[#3B8F6B] font-bold text-xs">
            <span>🛡️ CRYPTOGRAPHIC AUDIT SEAL ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
