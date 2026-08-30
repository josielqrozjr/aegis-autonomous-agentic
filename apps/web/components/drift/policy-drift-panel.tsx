"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { triggerRegulatoryChange } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t } = useLanguage();
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const handleSimulateDrift = async () => {
    setIsExecuting(true);
    setStepLog(["1. Disparando evento no endpoint /api/v1/regulatory-changes..."]);

    const payload = {
      framework: "GDPR",
      version: "v2.0-2026",
      change_description: "Prazo de retenção de dados reduzido de 5 para 2 anos.",
      affected_requirements: ["req-gdpr-5"],
    };

    await triggerRegulatoryChange(payload);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "2. ChangeDetectionAgent calculou Blast Radius: 3 nós afetados.",
      ]);
    }, 800);

    setTimeout(() => {
      setStepLog((prev) => [
        ...prev,
        "3. Invalidação propagada: req-gdpr-5 ➔ ev-prazo-90dias ➔ find-02-node (REABERTO).",
      ]);
      onDriftTriggered({
        framework: "GDPR",
        version: "v2.0-2026",
        description: "Prazo máximo de retenção reduzido para 2 anos (Art. 5(1)(e) GDPR v2).",
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
            {t("drift_title")}
          </h3>
          <p className="text-xs text-[#9096A0] mt-0.5">
            {t("drift_subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDriftActive ? (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded text-xs font-medium bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors"
            >
              {t("drift_restore")}
            </button>
          ) : (
            <button
              onClick={handleSimulateDrift}
              disabled={isExecuting}
              className={cn(
                "px-3.5 py-1.5 rounded text-xs font-semibold transition-colors",
                isExecuting
                  ? "bg-[#21262B] text-[#9096A0] cursor-wait"
                  : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] cursor-pointer"
              )}
            >
              {isExecuting ? t("drift_calculating") : t("drift_simulate")}
            </button>
          )}
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">{t("drift_event_label")}</span>
          <p className="text-white font-medium">{t("drift_event_title")}</p>
          <span className="text-[11px] text-[#B8843A] font-mono">{t("drift_event_desc")}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">{t("drift_blast_label")}</span>
          <p className="text-white font-mono font-medium">
            {isDriftActive ? t("drift_blast_active") : t("drift_blast_pending")}
          </p>
          <span className="text-[11px] text-[#9096A0]">{t("drift_blast_desc")}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs">
          <span className="text-[10px] font-mono text-[#5C636E] uppercase block mb-1">{t("drift_recovery_label")}</span>
          <p className="text-white font-mono font-medium">
            {isDriftActive ? t("drift_recovery_active") : t("drift_recovery_pending")}
          </p>
          <span className="text-[11px] text-[#3B8F6B]">{t("drift_recovery_desc")}</span>
        </div>
      </div>

      {/* Log */}
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
