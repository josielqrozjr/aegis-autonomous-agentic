"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { InvestigationStatus } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/language-context";

interface PipelineStepperProps {
  currentStatus: InvestigationStatus;
}

export function PipelineStepper({ currentStatus }: PipelineStepperProps) {
  const { t } = useLanguage();

  const steps = [
    { id: "UNDERSTANDING", title: t("pipeline_step1"), desc: t("pipeline_step1_desc") },
    { id: "PLANNING", title: t("pipeline_step2"), desc: t("pipeline_step2_desc") },
    { id: "INVESTIGATING", title: t("pipeline_step3"), desc: t("pipeline_step3_desc") },
    { id: "ADVERSARIAL_REVIEW", title: t("pipeline_step4"), desc: t("pipeline_step4_desc") },
    { id: "COMPLETED", title: t("pipeline_step5"), desc: t("pipeline_step5_desc") },
  ];

  const getStepState = (stepIndex: number) => {
    const statusOrder: InvestigationStatus[] = [
      "UNDERSTANDING",
      "PLANNING",
      "INVESTIGATING",
      "ADVERSARIAL_REVIEW",
      "COMPLETED",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (stepIndex < currentIndex || currentStatus === "COMPLETED") return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3038] mb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          {t("pipeline_title")}
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
          {t("pipeline_status")}: {currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          return (
            <div
              key={step.id}
              className={cn(
                "p-3 rounded-lg border text-xs transition-colors",
                state === "completed" && "bg-[#0D1013] border-[#2A3038] text-white",
                state === "active" && "bg-[#0D1013] border-[#B8843A] text-white",
                state === "pending" && "bg-[#0D1013]/30 border-transparent text-[#5C636E]"
              )}
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-[#5C636E] mb-1">
                <span>0{idx + 1}</span>
                {state === "completed" && <span className="text-[#3B8F6B]">✓</span>}
                {state === "active" && <span className="w-1.5 h-1.5 rounded-full bg-[#B8843A] animate-ping" />}
              </div>
              <div className={cn("font-medium text-xs", state === "active" ? "text-[#B8843A]" : "text-white")}>
                {step.title}
              </div>
              <div className="text-[10px] text-[#9096A0] mt-0.5 font-mono">{step.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
