"use client";

import React, { useState } from "react";
import { Investigation } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface InvestigationsTableProps {
  investigations: Investigation[];
  onSelect: (investigation: Investigation) => void;
  onNew: () => void;
}

export function InvestigationsTable({ investigations, onSelect, onNew }: InvestigationsTableProps) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filters = [
    { id: "ALL", label: "All" },
    { id: "INVESTIGATING", label: "Running" },
    { id: "COMPLETED", label: "Completed" },
    { id: "ADVERSARIAL_REVIEW", label: "In Review" },
  ];

  const filtered = investigations.filter((inv) => {
    if (filter !== "ALL" && inv.status !== filter) return false;
    if (search && !inv.title.toLowerCase().includes(search.toLowerCase()) && !inv.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Regulatory Investigations
          </h3>
          <p className="text-xs text-[#9096A0] mt-0.5">
            {investigations.length} recorded audits · Real-time multi-agent compliance validation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs text-white placeholder-[#5C636E] focus:outline-none focus:border-[#B8843A] w-56 font-mono"
            />
          </div>
          <button
            onClick={onNew}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors cursor-pointer"
          >
            + New Investigation
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-[#12161A] border-b border-[#2A3038] flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-[#0D1013] text-[#B8843A] border border-[#B8843A]/40 font-semibold"
                : "text-[#9096A0] hover:text-white hover:bg-[#0D1013]/50"
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
            <tr className="border-b border-[#2A3038] text-[#9096A0] bg-[#12161A] font-mono text-[11px] uppercase">
              <th className="py-3 px-5 font-semibold">Investigation</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Frameworks</th>
              <th className="py-3 px-4 font-semibold">Risk Level</th>
              <th className="py-3 px-4 font-semibold">Last Updated</th>
              <th className="py-3 px-5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3038]">
            {filtered.map((inv) => {
              const isRunning = inv.status === "INVESTIGATING";
              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelect(inv)}
                  className="hover:bg-[#1C2228] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div>
                      <div className="font-semibold text-white group-hover:text-[#B8843A] transition-colors">
                        {inv.title}
                      </div>
                      <div className="text-[11px] text-[#9096A0] font-mono mt-0.5">
                        {inv.id} · {inv.documentName}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#4C8FA6]/15 text-[#4C8FA6] border border-[#4C8FA6]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4C8FA6] animate-pulse" />
                        Running ({inv.progressPercent}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#3B8F6B]/15 text-[#3B8F6B] border border-[#3B8F6B]/30">
                        ✓ Completed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inv.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0D1013] text-[#9096A0] border border-[#2A3038]"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "font-mono px-2 py-0.5 rounded text-[10px] font-semibold",
                        inv.findingsCount.critical > 0
                          ? "bg-[#A24438]/15 text-[#A24438] border border-[#A24438]/30"
                          : "bg-[#B8843A]/15 text-[#D4A559] border border-[#B8843A]/30"
                      )}
                    >
                      {inv.findingsCount.critical > 0 ? "High Risk" : "Medium"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#9096A0] text-[11px] font-mono">
                    {formatDate(inv.updatedAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-[11px] text-[#4C8FA6] group-hover:text-white">
                    View →
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
