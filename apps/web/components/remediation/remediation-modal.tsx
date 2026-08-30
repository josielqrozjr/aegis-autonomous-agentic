"use client";

import React, { useState } from "react";
import { Finding } from "@/lib/types";

interface RemediationModalProps {
  finding: Finding | null;
  onClose: () => void;
  onApply: (findingId: string) => void;
}

export function RemediationModal({ finding, onClose, onApply }: RemediationModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!finding) return null;

  const handleConfirm = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsDone(true);
      setTimeout(() => {
        onApply(finding.id);
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#171B1F] border border-[#2A3038] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3038] flex items-center justify-between bg-[#12161A]">
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">Automated Remediation Plan</h3>
            <p className="text-[11px] text-[#9096A0] font-mono mt-0.5">{finding.id} · {finding.framework}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9096A0] hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-white text-sm mb-1">{finding.title}</h4>
            <p className="text-[#9096A0] leading-relaxed">{finding.description}</p>
          </div>

          {/* Remediation Patch */}
          <div className="p-4 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#3B8F6B] font-semibold font-mono">
              <span>Suggested Patch (Remediation Agent · Gemini Flash)</span>
              <span className="text-[10px] uppercase">Compliant</span>
            </div>
            <p className="text-white text-xs italic bg-[#171B1F] p-3 rounded border border-[#2A3038] leading-relaxed">
              "{finding.remediationSuggestion}"
            </p>
          </div>

          <div className="text-[11px] text-[#9096A0] bg-[#0D1013] p-3 rounded border border-[#2A3038]">
            Applying this remediation updates the auditable policy repository and marks the corresponding Trust Graph node as Valid.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A3038] bg-[#12161A] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isApplying || isDone}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isDone ? (
              "✓ Remediation Applied!"
            ) : isApplying ? (
              "Processing Patch..."
            ) : (
              "Approve & Update Policy →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
