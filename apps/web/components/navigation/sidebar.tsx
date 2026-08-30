"use client";

import React from "react";
import { 
  FileText, 
  PlusCircle, 
  LayoutDashboard, 
  RefreshCw, 
  FileCheck2, 
  ShieldCheck, 
  Cpu, 
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "investigations", label: "1. Investigações", icon: FileText, badge: "5" },
    { id: "new-investigation", label: "2. Nova Investigação", icon: PlusCircle, highlight: true },
    { id: "dashboard", label: "3. Dashboard & Agentes", icon: LayoutDashboard, badge: "3 ativos" },
    { id: "remediation", label: "4. Remediação & Mudança", icon: RefreshCw, badge: "Policy Drift" },
    { id: "report", label: "5. Relatório Final", icon: FileCheck2 },
  ];

  return (
    <aside className="w-64 bg-[#0d121d] border-r border-[#1e293b] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wider">AEGIS</h1>
          <p className="text-[11px] text-slate-400 font-medium">Compliance & Trust</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Menu de Navegação
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-[#141b2b] hover:text-white border border-transparent",
                item.highlight && !isActive && "text-cyan-400 hover:text-cyan-300"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-400")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                    isActive
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent Runtime Stack Indicator */}
      <div className="p-4 border-t border-[#1e293b] bg-[#090d15]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Stack de IA
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Multi-Model
          </span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-500">
          <div className="flex justify-between">
            <span>Motor:</span>
            <span className="text-slate-300 font-mono">Gemini 2.5 Flash</span>
          </div>
          <div className="flex justify-between">
            <span>Privacidade:</span>
            <span className="text-slate-300 font-mono">Gemma PII</span>
          </div>
          <div className="flex justify-between">
            <span>Adversarial:</span>
            <span className="text-slate-300 font-mono">Gemini 2.5 Pro</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
