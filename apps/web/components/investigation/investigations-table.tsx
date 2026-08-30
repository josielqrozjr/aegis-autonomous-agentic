"use client";

import React, { useState } from "react";
import { Investigation } from "@/lib/types";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Search,
  Filter 
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface InvestigationsTableProps {
  investigations: Investigation[];
  onSelect: (investigation: Investigation) => void;
  onNew: () => void;
}

export function InvestigationsTable({ investigations, onSelect, onNew }: InvestigationsTableProps) {
  const [filter, setFilter] = useState("TODOS");
  const [search, setSearch] = useState("");

  const filters = [
    { id: "TODOS", label: "Todos" },
    { id: "INVESTIGATING", label: "Em execução" },
    { id: "COMPLETED", label: "Concluído" },
    { id: "ADVERSARIAL_REVIEW", label: "Em revisão" },
  ];

  const filtered = investigations.filter((inv) => {
    if (filter !== "TODOS" && inv.status !== filter) return false;
    if (search && !inv.title.toLowerCase().includes(search.toLowerCase()) && !inv.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Investigações Regulatórias</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            5 investigações registradas · 2 em execução · 18 apontamentos de auditoria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por ID ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-[#111622] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>
          <button
            onClick={onNew}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            + Nova Investigação
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-[#0a0e17] border-b border-[#1e293b] flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#141b2b]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1e293b] text-slate-400 bg-[#0c101a]">
              <th className="py-3 px-5 font-semibold">Investigação</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Frameworks</th>
              <th className="py-3 px-4 font-semibold">Risco</th>
              <th className="py-3 px-4 font-semibold">Atualizado</th>
              <th className="py-3 px-5 text-right font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {filtered.map((inv) => {
              const isRunning = inv.status === "INVESTIGATING";
              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelect(inv)}
                  className="hover:bg-[#121826] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {inv.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {inv.id} · {inv.documentName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Em execução ({inv.progressPercent}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluído
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inv.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "font-semibold px-2 py-0.5 rounded text-[10px]",
                        inv.findingsCount.critical > 0
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}
                    >
                      {inv.findingsCount.critical > 0 ? "Alto Risco" : "Médio"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                    {formatDate(inv.updatedAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="text-slate-400 group-hover:text-blue-400 p-1.5 rounded-md hover:bg-slate-800 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
