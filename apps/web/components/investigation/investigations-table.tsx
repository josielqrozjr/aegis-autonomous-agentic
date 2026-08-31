"use client";

import React, { useState } from "react";
import { Finding, Investigation } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface InvestigationsTableProps {
  investigations: Investigation[];
  findings?: Finding[];
  onSelect: (investigation: Investigation) => void;
  onNew: () => void;
  onDelete?: (investigationId: string) => void;
  onDeleteAll?: () => void;
}

export function InvestigationsTable({ investigations, findings = [], onSelect, onNew, onDelete, onDeleteAll }: InvestigationsTableProps) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filters = [
    { id: "ALL", label: "All" },
    { id: "PENDING_REVIEW", label: "Pending" },
    { id: "INVESTIGATING", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
  ];

  const getDocProgressAndStatus = (inv: Investigation) => {
    const invGaps = findings.filter(
      (f) =>
        f.investigationId === inv.id ||
        (!findings.some((x) => x.investigationId === inv.id) && f.investigationId === "INV-2024-0047")
    );
    const total = invGaps.length;
    const resolved = invGaps.filter(
      (f) => f.status === "RESOLVED" || f.remediationStatus === "APPROVED" || f.remediationStatus === "APPLIED"
    ).length;
    const progressPercent = total > 0 ? Math.round((resolved / total) * 100) : (inv.progressPercent ?? 100);

    if (inv.status === "COMPLETED" || (resolved === total && total > 0) || progressPercent === 100) {
      return {
        status: "COMPLETED",
        label: "Completed",
      };
    }

    if (inv.status === "INVESTIGATING") {
      return {
        status: "INVESTIGATING",
        label: `In Progress (${progressPercent}%)`,
      };
    }

    return {
      status: "PENDING_REVIEW",
      label: "Pending",
    };
  };

  const renderStatusBadge = (inv: Investigation) => {
    const info = getDocProgressAndStatus(inv);

    switch (info.status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3B8F6B]/15 text-[#3B8F6B] border border-[#3B8F6B]/30 inline-block">
            {info.label}
          </span>
        );
      case "INVESTIGATING":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40 inline-block">
            {info.label}
          </span>
        );
      case "PENDING_REVIEW":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 inline-block">
            {info.label}
          </span>
        );
    }
  };

  const filtered = investigations.filter((inv) => {
    const info = getDocProgressAndStatus(inv);
    if (filter !== "ALL" && info.status !== filter) return false;
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
          {onDeleteAll && investigations.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#A24438]/20 hover:bg-[#A24438]/40 text-[#E06C5D] border border-[#A24438]/30 transition-colors cursor-pointer"
            >
              Delete All
            </button>
          )}
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
              <th className="py-3 px-6 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3038]">
            {filtered.map((inv) => (
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
                  {renderStatusBadge(inv)}
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
                <td className="py-3.5 px-6 text-center font-mono text-[11px]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[#4C8FA6] group-hover:text-white cursor-pointer">View</span>
                    {onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                        className="text-[#A24438] hover:text-[#E06C5D] cursor-pointer transition-colors"
                        title="Delete investigation"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
