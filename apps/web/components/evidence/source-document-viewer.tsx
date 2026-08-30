"use client";

import React from "react";
import { Finding } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourceDocumentViewerProps {
  finding: Finding | null;
  onClose: () => void;
}

export function SourceDocumentViewer({ finding, onClose }: SourceDocumentViewerProps) {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-[#0D1013] border-l border-[#2A3038] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3038] flex items-center justify-between bg-[#171B1F]">
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">Source Document Inspector</h3>
            <p className="text-[11px] text-[#9096A0] font-mono mt-0.5">
              corporate_data_retention_policy_v2.pdf · Active Provenance
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded text-xs font-medium text-[#9096A0] hover:text-white bg-[#0D1013] hover:bg-[#21262B] border border-[#2A3038] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Provenance & Hash Banner */}
        <div className="p-4 bg-[#171B1F]/60 border-b border-[#2A3038] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white font-mono flex items-center gap-1.5">
              <span className="text-[#B8843A]">●</span> {finding.id} — {finding.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
              {finding.framework}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#0D1013] border border-[#2A3038] flex items-center justify-between text-[11px] font-mono text-[#9096A0]">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <span className="text-[#5C636E]">SHA-256:</span>
              <span className="truncate text-white">{finding.evidenceHash}</span>
            </div>
            <span className="shrink-0 text-[#3B8F6B] font-semibold text-[10px]">
              ✓ Verified Hash
            </span>
          </div>
        </div>

        {/* Document Body with Highlighted Paragraph */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-[#B8BDC7] leading-relaxed space-y-4">
          <div className="p-4 rounded-xl bg-[#171B1F] border border-[#2A3038]">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
              CORPORATE DATA RETENTION & PRIVACY POLICY
            </div>
            <p className="text-[#9096A0] mb-4 text-[10px]">Version 2.4 — September 2026</p>

            <div className="space-y-4">
              <div>
                <strong className="text-white block text-[11px] mb-1">1. PURPOSE & SCOPE</strong>
                <p className="text-[#9096A0]">
                  This policy establishes governing rules for storage, processing, and disposal of personal and corporate data handled across AEGIS Group production environments in Brazil and the European Union.
                </p>
              </div>

              <div>
                <strong className="text-white block text-[11px] mb-1">2. RETENTION PERIODS</strong>
                <span
                  className={cn(
                    "block p-2.5 rounded my-1.5 border transition-all",
                    finding.evidenceQuote.toLowerCase().includes("indefinitely") || finding.id === "FIND-01"
                      ? "bg-[#B8843A]/15 border-[#B8843A] text-white"
                      : "text-[#9096A0] border-transparent"
                  )}
                >
                  2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes.
                </span>

                <span
                  className={cn(
                    "block p-2.5 rounded my-1.5 border transition-all",
                    finding.evidenceQuote.toLowerCase().includes("logs") || finding.id === "FIND-03"
                      ? "bg-[#B8843A]/15 border-[#B8843A] text-white"
                      : "text-[#9096A0] border-transparent"
                  )}
                >
                  2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers.
                </span>

                <p className="text-[#9096A0] px-2.5 py-1">
                  2.3. Tax records and financial transaction receipts will be preserved for five (5) years in compliance with applicable fiscal legislation.
                </p>
              </div>

              <div>
                <strong className="text-white block text-[11px] mb-1">3. RIGHT TO ERASURE & DATA DELETION</strong>
                <span
                  className={cn(
                    "block p-2.5 rounded my-1.5 border transition-all",
                    finding.evidenceQuote.toLowerCase().includes("90") || finding.id === "FIND-02"
                      ? "bg-[#B8843A]/15 border-[#B8843A] text-white"
                      : "text-[#9096A0] border-transparent"
                  )}
                >
                  3.1. Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days.
                </span>

                <p className="text-[#9096A0] px-2.5 py-1">
                  3.2. Data held in cold backups is exempt from real-time deletion requests and will be overwritten exclusively during standard 2-year tape rotation cycles.
                </p>
              </div>

              <div>
                <strong className="text-white block text-[11px] mb-1">4. SECURITY & ENCRYPTION</strong>
                <span
                  className={cn(
                    "block p-2.5 rounded my-1.5 border transition-all",
                    finding.evidenceQuote.toLowerCase().includes("shared") || finding.id === "FIND-04"
                      ? "bg-[#B8843A]/15 border-[#B8843A] text-white"
                      : "text-[#9096A0] border-transparent"
                  )}
                >
                  4.1. Data in transit is secured with TLS 1.3. Analytical databases utilize shared passwords restricted to the engineering team.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A3038] bg-[#171B1F] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
