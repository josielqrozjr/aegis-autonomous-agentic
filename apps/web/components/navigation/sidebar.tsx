"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AegisShieldLogo } from "@/components/ui/aegis-logo";
import { useLanguage } from "@/lib/i18n/language-context";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    { id: "investigations", label: t("nav_investigations"), badge: "47" },
    { id: "new-investigation", label: t("nav_new"), badge: null },
    { id: "dashboard", label: t("nav_dashboard"), badge: "Trust Graph" },
    { id: "remediation", label: t("nav_remediation"), badge: "Drift" },
    { id: "report", label: t("nav_report"), badge: "PDF" },
  ];

  return (
    <aside className="w-60 bg-[#0D1013] border-r border-[#2A3038] flex flex-col justify-between h-screen select-none shrink-0">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-[#2A3038] flex items-center gap-3">
          <AegisShieldLogo className="w-8 h-9 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wider text-[#B8843A] font-serif">
                AEGIS
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#171B1F] text-[#9096A0] border border-[#2A3038]">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-[#9096A0] tracking-tight">
              {t("nav_evidence_connected")}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-[#5C636E] uppercase tracking-wider">
            {t("nav_navigation")}
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-[#171B1F] text-[#B8843A] border-l-2 border-[#B8843A] pl-2.5 font-semibold"
                    : "text-[#9096A0] hover:text-white hover:bg-[#171B1F]/40"
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-[#B8843A]/15 text-[#D4A559]"
                        : "bg-[#171B1F] text-[#5C636E]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Model info */}
      <div className="p-4 border-t border-[#2A3038] space-y-2 text-[10px] text-[#9096A0] font-mono">
        <div className="text-[9px] text-[#5C636E] uppercase font-bold tracking-wider">
          {t("nav_active_models")}
        </div>
        <div className="flex justify-between">
          <span>PII Scanner</span>
          <span className="text-white">Gemma 2B</span>
        </div>
        <div className="flex justify-between">
          <span>{t("nav_specialists")}</span>
          <span className="text-[#4C8FA6]">Gemini Flash</span>
        </div>
        <div className="flex justify-between">
          <span>{t("nav_critic")}</span>
          <span className="text-[#B8843A]">Gemini Pro</span>
        </div>
      </div>
    </aside>
  );
}
