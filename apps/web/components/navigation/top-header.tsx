"use client";

import React from "react";
import { AegisShieldLogo } from "@/components/ui/aegis-logo";
import { useLanguage } from "@/lib/i18n/language-context";

interface TopHeaderProps {
  currentInvestigationId?: string;
}

export function TopHeader({ currentInvestigationId = "INV-2024-0047" }: TopHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="h-14 bg-[#0D1013] border-b border-[#2A3038] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <AegisShieldLogo className="w-5 h-6 text-[#B8843A]" />
        <div className="flex items-center gap-2 text-xs">
          <span className="font-serif font-bold text-sm tracking-wider text-[#B8843A]">AEGIS</span>
          <span className="text-[#5C636E]">/</span>
          <span className="text-[#9096A0]">{t("header_subtitle")}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#9096A0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B8F6B]" />
          <span>{t("header_orchestrator")}</span>
        </div>

        <div className="h-4 w-px bg-[#2A3038]" />

        <div className="text-xs font-mono text-[#D4A559]">
          <span className="text-[#9096A0]">{t("header_audit")}: </span>
          <span className="font-semibold">{currentInvestigationId}</span>
        </div>
      </div>
    </header>
  );
}
