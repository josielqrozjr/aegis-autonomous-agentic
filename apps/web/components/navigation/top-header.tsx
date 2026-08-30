"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";

interface TopHeaderProps {
  currentInvestigationId?: string;
}

export function TopHeader({ currentInvestigationId }: TopHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="h-14 bg-[#0D1013] border-b border-[#2A3038] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#9096A0] font-medium tracking-wide">
          {t("header_subtitle")}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#9096A0]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B8F6B]" />
        <span>{t("header_orchestrator")}</span>
      </div>
    </header>
  );
}
