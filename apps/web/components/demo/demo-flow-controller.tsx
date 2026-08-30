"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DemoFlowControllerProps {
  onStepChange: (step: number) => void;
  currentStep: number;
  onReset: () => void;
}

export function DemoFlowController({ onStepChange, currentStep, onReset }: DemoFlowControllerProps) {
  const steps = [
    { step: 1, title: "1. Upload & PII", desc: "Gemma 2B Scan" },
    { step: 2, title: "2. Analysis & Critique", desc: "Gemini Flash & Pro" },
    { step: 3, title: "3. Policy Drift", desc: "GDPR v2 Cascade" },
    { step: 4, title: "4. Dossier & PDF", desc: "Report Generation" },
  ];

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A3038]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              4-Step Demonstration
            </h3>
          </div>
          <p className="text-[11px] text-[#9096A0] mt-0.5">
            Automated walkthrough to evaluate multi-agent intelligence and Trust Graph provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded text-xs font-medium bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors cursor-pointer"
          >
            Reset
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => onStepChange(currentStep + 1)}
              className="px-3.5 py-1.5 rounded text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors cursor-pointer"
            >
              Next Step
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded text-xs font-medium text-[#3B8F6B] bg-[#3B8F6B]/15 border border-[#3B8F6B]/30 font-mono">
              ✓ Demo Complete
            </span>
          )}
        </div>
      </div>

      {/* Steps bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <button
              key={s.step}
              onClick={() => onStepChange(s.step)}
              className={cn(
                "p-2 rounded-lg border text-left transition-all text-xs cursor-pointer",
                isActive
                  ? "bg-[#0D1013] border-[#B8843A] text-white"
                  : isDone
                  ? "bg-[#0D1013]/60 border-[#2A3038] text-[#B8BDC7]"
                  : "bg-[#0D1013]/30 border-transparent text-[#5C636E]"
              )}
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-0.5">
                <span className={isActive ? "text-[#B8843A] font-bold" : isDone ? "text-[#3B8F6B]" : "text-[#5C636E]"}>
                  {s.title}
                </span>
                {isDone && <span className="text-[10px] text-[#3B8F6B]">✓</span>}
              </div>
              <p className="text-[10px] text-[#9096A0] truncate">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
