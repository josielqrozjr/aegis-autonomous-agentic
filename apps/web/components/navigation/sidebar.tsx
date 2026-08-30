"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AegisShieldLogo } from "@/components/ui/aegis-logo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "investigations", label: "1. Investigations", badge: "47" },
    { id: "new-investigation", label: "2. New Investigation", badge: null },
    { id: "dashboard", label: "3. Dashboard & Agents", badge: "Trust Graph" },
    { id: "remediation", label: "4. Remediation & Drift", badge: "Drift" },
    { id: "report", label: "5. Final Report", badge: "PDF" },
  ];

  return (
    <aside className="w-60 bg-[#0D1013] border-r border-[#2A3038] flex flex-col justify-between h-screen select-none shrink-0">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-[#2A3038] flex items-center gap-3">
          <AegisShieldLogo className="w-8 h-9 shrink-0 text-[#B8843A]" />
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
              Connected Evidence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-[#5C636E] uppercase tracking-wider">
            Navigation
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer",
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

      {/* Footer Model Info */}
      <div className="p-4 border-t border-[#2A3038] space-y-2 text-[10px] text-[#9096A0] font-mono">
        <div className="text-[9px] text-[#5C636E] uppercase font-bold tracking-wider">
          Active AI Fleet
        </div>
        <div className="flex justify-between">
          <span>PII Scanner</span>
          <span className="text-white">Gemma 2B</span>
        </div>
        <div className="flex justify-between">
          <span>Specialists</span>
          <span className="text-[#4C8FA6]">Gemini 1.5 Flash</span>
        </div>
        <div className="flex justify-between">
          <span>Evidence Critic</span>
          <span className="text-[#B8843A]">Gemini 2.5 Pro</span>
        </div>
      </div>
    </aside>
  );
}
