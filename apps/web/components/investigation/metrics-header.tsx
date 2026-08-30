"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export function MetricsHeader() {
  const { t } = useLanguage();

  const metrics = [
    { label: t("metric_total"), value: "47", helper: t("metric_total_helper") },
    { label: t("metric_active"), value: "2", helper: t("metric_active_helper"), highlight: true },
    { label: t("metric_findings"), value: "18", helper: t("metric_findings_helper") },
    { label: t("metric_remediations"), value: "9", helper: t("metric_remediations_helper") },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4 transition-colors hover:border-[#38414D]"
        >
          <div className="text-[11px] font-medium text-[#9096A0] uppercase tracking-wider mb-1">
            {m.label}
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {m.value}
          </div>
          <div className="text-[11px] text-[#5C636E] mt-1 font-mono">
            {m.helper}
          </div>
        </div>
      ))}
    </div>
  );
}
