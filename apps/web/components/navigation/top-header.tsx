"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";

interface TopHeaderProps {
  activeTab?: string;
  currentInvestigationId?: string;
}

export function TopHeader({ activeTab = "overview", currentInvestigationId }: TopHeaderProps) {
  const { t } = useLanguage();

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Regulatory Compliance & Audit";
      case "investigations":
        return "Investigations";
      case "new-investigation":
        return "New Investigation";
      case "dashboard":
        return "Trust Graph & Agents";
      case "remediation":
        return "Remediation & Drift";
      case "report":
        return "Final Report";
      default:
        return "Regulatory Compliance & Audit";
    }
  };

  return (
    <header className="h-14 bg-[#0D1013] border-b border-[#2A3038] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#9096A0] font-medium tracking-wide">
          {getHeaderTitle()}
        </span>
      </div>
    </header>
  );
}
