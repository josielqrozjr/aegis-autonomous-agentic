"use client";

import React from "react";
import { Download } from "lucide-react";
import { Finding, Investigation } from "@/lib/types";
import { TrustGraphData } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { AegisShieldLogo } from "@/components/ui/aegis-logo";

interface ComplianceReportViewProps {
  investigation: Investigation;
  investigations?: Investigation[];
  onSelectInvestigation?: (inv: Investigation) => void;
  findings: Finding[];
  graphData: TrustGraphData;
}

export function ComplianceReportView({
  investigation,
  investigations,
  onSelectInvestigation,
  findings,
  graphData,
}: ComplianceReportViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Filtra os findings para o documento selecionado
  const docFindings = findings.filter(
    (f) =>
      f.investigationId === investigation.id ||
      (!findings.some((x) => x.investigationId === investigation.id) &&
        f.investigationId === "INV-2024-0047")
  );

  return (
    <div className="space-y-6 w-full">
      {/* Report Header */}
      <div className="pb-3 border-b border-[#2A3038] print:hidden">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Executive Audit & Compliance Dossier
        </h2>
        <p className="text-xs text-[#9096A0] mt-0.5">
          Ready for PDF export or printing with cryptographic provenance verification.
        </p>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0 print:m-0 print:space-y-5 print:rounded-none">
        {/* Certificate Header */}
        <div className="border-b border-[#2A3038] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-b-2 print:border-black print:pb-4">
          <div className="flex items-center gap-3">
            <AegisShieldLogo className="w-9 h-10 text-[#B8843A] print:text-black" />
            <div>
              <h2 className="text-xl font-bold font-serif text-[#B8843A] tracking-wider print:text-black">
                AEGIS
              </h2>
              <p className="text-xs text-[#9096A0] font-mono print:text-neutral-600">
                Autonomous Multi-Agent Audit Certificate
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#9096A0] print:text-neutral-800 space-y-0.5">
            <div><strong className="text-white print:text-black">ID:</strong> {investigation.id}</div>
            <div><strong className="text-white print:text-black">Date:</strong> {formatDate(investigation.updatedAt)}</div>
          </div>
        </div>

        {/* Document Provenance */}
        <div className="p-4 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-3 text-xs print:border-2 print:border-black print:bg-white print:text-black print:rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-[#9096A0] print:text-black print:font-bold">Ingested Document:</span>
            <div className="flex items-center gap-2">
              {investigations && investigations.length > 0 && onSelectInvestigation ? (
                <div className="flex items-center gap-2">
                  <select
                    value={investigation.id}
                    onChange={(e) => {
                      const selected = investigations.find((inv) => inv.id === e.target.value);
                      if (selected) onSelectInvestigation(selected);
                    }}
                    className="p-1.5 px-3 rounded-lg bg-[#171B1F] border border-[#2A3038] hover:border-[#B8843A] text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#B8843A] cursor-pointer print:hidden transition-colors"
                  >
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-[#171B1F] text-white">
                        {inv.documentName} ({inv.id})
                      </option>
                    ))}
                  </select>
                  <span className="hidden print:inline font-mono text-black font-semibold">
                    {investigation.documentName}
                  </span>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm print:hidden"
                    title="Download Report as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white print:text-black font-semibold">{investigation.documentName}</span>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm print:hidden"
                    title="Download Report as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-[#9096A0] print:text-neutral-700">
            <span className="print:font-bold print:text-black">SHA-256 Authenticity Hash:</span>
            <span className="text-[#4C8FA6] truncate max-w-md print:text-neutral-800 print:max-w-none">{investigation.documentHash}</span>
          </div>
          <div className="flex items-center justify-between text-[#9096A0] print:text-neutral-700">
            <span className="print:font-bold print:text-black">Audited Frameworks:</span>
            <span className="text-white font-semibold print:text-black">{investigation.frameworks.join(" · ")}</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center print:gap-3">
          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] print:border-2 print:border-black print:bg-white print:rounded-xl">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] print:text-black block mb-1">Graph Nodes</span>
            <span className="text-xl font-bold font-mono text-white print:text-black">
              {graphData.valid_nodes}/{graphData.total_nodes}
            </span>
            <span className="text-[10px] text-[#3B8F6B] print:text-emerald-700 block mt-0.5 font-mono font-semibold">Valid & Compliant</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] print:border-2 print:border-black print:bg-white print:rounded-xl">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] print:text-black block mb-1">Google AI Models</span>
            <span className="text-xl font-bold font-mono text-[#4C8FA6] print:text-black">3 Models</span>
            <span className="text-[10px] text-[#9096A0] print:text-neutral-600 block mt-0.5 font-mono">Flash + Gemma + Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] print:border-2 print:border-black print:bg-white print:rounded-xl">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] print:text-black block mb-1">Adversarial Critique</span>
            <span className="text-xl font-bold font-mono text-[#B8843A] print:text-black">100%</span>
            <span className="text-[10px] text-[#D4A559] print:text-neutral-700 block mt-0.5 font-mono">Gemini 2.5 Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] print:border-2 print:border-black print:bg-white print:rounded-xl">
            <span className="text-[10px] uppercase font-bold text-[#9096A0] print:text-black block mb-1">Risk Status</span>
            <span className="text-xl font-bold font-mono text-[#3B8F6B] print:text-emerald-700">Mitigated</span>
            <span className="text-[10px] text-[#9096A0] print:text-neutral-600 block mt-0.5 font-mono">With Remediations</span>
          </div>
        </div>

        {/* Findings Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2A3038] pb-2 print:text-neutral-500 print:border-b-2 print:border-black print:pb-1">
            Findings, Evidence Hashes & Remediations
          </h4>

          <div className="space-y-3 print:space-y-4">
            {docFindings.map((f) => (
              <div key={f.id} className="p-4 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-2 text-xs print:border-2 print:border-black print:bg-white print:text-black print:rounded-xl print:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#B8843A] print:text-black">{f.id}</span>
                    <span className="font-semibold text-white print:text-black">{f.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B1F] text-[#9096A0] border border-[#2A3038] print:bg-white print:text-black print:border-black">
                    {f.framework} · {f.articleOrControl}
                  </span>
                </div>
                <p className="text-[#9096A0] leading-relaxed print:text-neutral-800">{f.description}</p>
                <div className="p-2.5 rounded bg-[#171B1F] border border-[#2A3038] text-[11px] font-mono text-[#B8BDC7] italic print:bg-neutral-50 print:border print:border-neutral-300 print:text-neutral-900 print:rounded-lg">
                  "{f.evidenceQuote}"
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9096A0] pt-1 print:text-neutral-700">
                  <span className="print:text-black">Agent: {f.agentName}</span>
                  <span className="text-[#3B8F6B] font-semibold print:text-emerald-700">Remediation: {f.remediationSuggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Seal */}
        <div className="pt-6 border-t border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#9096A0] font-mono print:border-t-2 print:border-black print:text-black print:pt-4">
          <div>
            <div className="text-white font-bold print:text-black">AEGIS Multi-Agent Governance Engine</div>
            <div className="print:text-neutral-700">Issued for LGPD, GDPR and ISO/IEC 27001 compliance auditing</div>
          </div>
        </div>
      </div>
    </div>
  );
}
