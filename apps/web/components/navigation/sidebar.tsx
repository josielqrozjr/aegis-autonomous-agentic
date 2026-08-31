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
    { id: "overview", label: "Dashboard" },
    { id: "investigations", label: "Investigations" },
    { id: "new-investigation", label: "New Investigation" },
    { id: "dashboard", label: "Trust Graph & Agents" },
    { id: "remediation", label: "Continuous Monitoring" },
    { id: "report", label: "Final Report" },
  ];

  return (
    <aside className="w-60 bg-[#0D1013] border-r border-[#2A3038] flex flex-col justify-between h-screen select-none shrink-0 print:hidden">
      <div>
        {/* Brand header - Alinhado em h-14 com o TopHeader */}
        <div
          onClick={() => onTabChange("overview")}
          className="h-14 px-5 border-b border-[#2A3038] flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <AegisShieldLogo className="w-7 h-8 shrink-0 text-[#B8843A]" />
          <div>
            <span className="font-bold text-sm tracking-wider text-[#B8843A] font-serif block group-hover:text-[#CCA159] transition-colors leading-none">
              AEGIS
            </span>
            <p className="text-[10px] text-[#9096A0] tracking-tight mt-1 leading-none">
              Connected Evidence
            </p>
          </div>
        </div>

        {/* Menu Items (Clean, sem badges) */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer",
                  isActive
                    ? "bg-[#171B1F] text-[#B8843A] border-l-2 border-[#B8843A] pl-2.5 font-semibold"
                    : "text-[#9096A0] hover:text-white hover:bg-[#171B1F]/40"
                )}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Model Info */}
      <div className="p-4 border-t border-[#2A3038] space-y-2 text-[10px] text-[#9096A0] font-mono">
        <div className="text-[9px] text-[#5C636E] uppercase font-bold tracking-wider">
          Active AI
        </div>
        <div className="flex justify-between">
          <span>PII Scanner</span>
          <span className="text-white">Gemma 2 (Vertex AI)</span>
        </div>
        <div className="flex justify-between">
          <span>Specialists</span>
          <span className="text-[#4C8FA6]">Gemini 3.6</span>
        </div>
        <div className="flex justify-between">
          <span>Evidence Critic</span>
          <span className="text-[#B8843A]">Gemini 2.5</span>
        </div>
      </div>
    </aside>
  );
}
