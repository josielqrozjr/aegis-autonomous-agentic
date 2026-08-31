"use client";

import React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoFlowControllerProps {
  onStepChange?: (step: number) => void;
  currentStep?: number;
  onReset?: () => void;
}

export function DemoFlowController({ currentStep = 1 }: DemoFlowControllerProps) {
  const steps = [
    { step: 1, number: "01", title: "Upload" },
    { step: 2, number: "02", title: "AI Analysis" },
    { step: 3, number: "03", title: "Recommendation" },
    { step: 4, number: "04", title: "Approved & PDF" },
  ];

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 mb-5 space-y-4">
      {/* Header (Sem botões) */}
      <div className="pb-3 border-b border-[#2A3038]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          4-Step Demonstration
        </h3>
        <p className="text-[11px] text-[#9096A0] mt-0.5">
          Automated walkthrough to evaluate multi-agent intelligence and Trust Graph provenance.
        </p>
      </div>

      {/* Fluxo Passo a Passo com Setas e Badges de Steps */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3 py-2 px-2 select-none">
        {steps.map((s, idx) => (
          <React.Fragment key={s.step}>
            {/* Step Item */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1.5 min-w-0">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B8843A]/15 text-[#D4A559] border border-[#B8843A]/40 inline-block">
                Step {s.number}
              </span>
              <span className="text-xs md:text-sm font-bold font-mono text-white tracking-wide">
                {s.title}
              </span>
            </div>

            {/* Seta conectora entre os passos */}
            {idx < steps.length - 1 && (
              <>
                <div className="hidden md:flex items-center justify-center px-2 text-[#B8843A] flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-[#B8843A]" />
                </div>
                <div className="md:hidden flex items-center justify-center text-[#B8843A] py-1">
                  <ChevronDown className="w-4 h-4 text-[#B8843A]" />
                </div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
