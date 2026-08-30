"use client";

import React from "react";

export function AdversarialReviewCard() {
  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A3038]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Adversarial Review Layer (Evidence Critic)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
              Gemini 2.5 Pro
            </span>
          </div>
          <p className="text-xs text-[#9096A0] mt-0.5">
            Critical reasoning for false positive reduction and evidence chain verification.
          </p>
        </div>

        <span className="text-[11px] font-mono text-[#3B8F6B] px-2 py-0.5 rounded bg-[#3B8F6B]/15 border border-[#3B8F6B]/30">
          Audited
        </span>
      </div>

      {/* Comparative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-1.5">
          <div className="flex justify-between font-mono text-[10px] text-[#5C636E]">
            <span>1. Specialist Proposal (Gemini 1.5 Flash)</span>
            <span className="uppercase">Pre-Critique</span>
          </div>
          <p className="text-[#B8BDC7]">
            "The policy violates GDPR by permitting 2-year retention in cold backups."
          </p>
          <div className="text-[11px] text-[#9096A0] italic">
            Literal interpretation of immediate deletion on tape and magnetic media.
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-1.5">
          <div className="flex justify-between font-mono text-[10px] text-[#B8843A]">
            <span>2. Evidence Critic Verdict (Gemini 2.5 Pro)</span>
            <span className="text-[#3B8F6B] uppercase font-bold">Refined False Positive</span>
          </div>
          <p className="text-white">
            "GDPR (Art. 17) permits cyclical overwriting in cold backups provided they remain isolated from live queries."
          </p>
          <div className="text-[11px] text-[#3B8F6B]">
            Outcome: Severity adjusted from 'Critical' to 'Isolation Recommendation'.
          </div>
        </div>
      </div>
    </div>
  );
}
