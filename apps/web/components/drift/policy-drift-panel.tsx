"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { triggerRegulatoryChange } from "@/lib/api/client";

interface PolicyDriftPanelProps {
  onDriftTriggered: (scenario: {
    framework: string;
    version: string;
    description: string;
    invalidatedNodeIds: string[];
  }) => void;
  onReset: () => void;
  isDriftActive: boolean;
}

export function PolicyDriftPanel({ onDriftTriggered, onReset, isDriftActive }: PolicyDriftPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const handleSimulateDrift = async () => {
    setIsExecuting(true);
    setStepLog(["1. Dispatching webhook event to /api/v1/regulatory-changes..."]);

    const payload = {
      framework: "GDPR",
      version: "v2.0-2026",
      change_description: "Data retention window shortened from 5 years to 2 years.",
      affected_requirements: ["req-gdpr-5"],
    };

    await triggerRegulatoryChange(payload);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "2. ChangeDetectionAgent computed Blast Radius: 3 downstream nodes affected.",
      ]);
    }, 800);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "3. Cascade invalidation: req-gdpr-5 ➔ ev-prazo-90dias ➔ find-02-node (REOPENED).",
      ]);
      onDriftTriggered({
        framework: "GDPR",
        version: "v2.0-2026",
        description: "Maximum retention timeframe reduced to 2 years (Art. 5(1)(e) GDPR v2).",
        invalidatedNodeIds: ["req-gdpr-5", "ev-prazo-90dias", "find-02-node"],
      });
      setIsExecuting(false);
    }, 1800);
  };

  return (
    <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A3038]">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Policy Drift Engine & Blast Radius Simulation
          </h3>
          <p className="text-xs text-[#9096A0] mt-0.5">
            Simulate dynamic regulatory changes and observe real-time cascade invalidation across the Trust Graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDriftActive ? (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded text-xs font-medium bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors cursor-pointer"
            >
              Restore Graph State
            </button>
          ) : (
            <button
              onClick={handleSimulateDrift}
              disabled={isExecuting}
              className={cn(
                "px-3.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer",
                isExecuting
                  ? "bg-[#21262B] text-[#9096A0] cursor-wait"
                  : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013]"
              )}
            >
              {isExecuting ? "Computing Blast Radius..." : "Simulate Regulatory Change (GDPR v2)"}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">Regulatory Trigger</span>
          <p className="text-white font-medium">GDPR Art. 5(1)(e) — 2026 Revision</p>
          <span className="text-[11px] text-[#B8843A] font-mono">Retention threshold shortened to 2 years</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">Blast Radius Impact</span>
          <p className="text-white font-mono font-medium">
            {isDriftActive ? "3 nodes invalidated" : "Awaiting trigger..."}
          </p>
          <span className="text-[11px] text-[#9096A0]">Requirement ➔ Evidence ➔ Finding</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">Selective Recovery</span>
          <p className="text-white font-mono font-medium">
            {isDriftActive ? "GDPR Specialist re-executed" : "Zero full-restarts required"}
          </p>
          <span className="text-[11px] text-[#3B8F6B]">Only affected branch reprocessed</span>
        </div>
      </div>

      {/* Log Output */}
      {stepLog.length > 0 && (
        <div className="p-3 rounded bg-[#0D1013] border border-[#2A3038] font-mono text-[11px] text-[#9096A0] space-y-1">
          {stepLog.map((log, idx) => (
            <div key={idx} className="text-[#B8BDC7]">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
