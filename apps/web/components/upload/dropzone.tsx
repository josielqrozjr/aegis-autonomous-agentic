"use client";

import React, { useState } from "react";
import { SAMPLE_POLICIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface DropzoneProps {
  onStartInvestigation: (data: { fileName: string; content: string; frameworks: string[] }) => void;
}

export function Dropzone({ onStartInvestigation }: DropzoneProps) {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["LGPD", "GDPR", "ISO 27001"]);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableFrameworks = [
    { id: "LGPD", label: "LGPD (Brasil)", desc: t("upload_frameworks_subtitle").includes("legisla") ? "Privacidade, retenção e direitos dos titulares" : "Privacy, retention and data subject rights" },
    { id: "GDPR", label: "GDPR (Europa / Europe)", desc: t("upload_frameworks_subtitle").includes("legisla") ? "Art. 5(1)(e) e direito ao apagamento" : "Art. 5(1)(e) and right to erasure" },
    { id: "ISO 27001", label: "ISO/IEC 27001", desc: t("upload_frameworks_subtitle").includes("legisla") ? "Controle A.8.10 e segurança da informação" : "Control A.8.10 and information security" },
    { id: "OWASP", label: "OWASP Top 10", desc: t("upload_frameworks_subtitle").includes("legisla") ? "Segurança de dados e integridade de APIs" : "Data security and API integrity" },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({ name: file.name, size: file.size, content: (event.target?.result as string) || "" });
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: typeof SAMPLE_POLICIES[0]) => {
    setSelectedFile({ name: "politica_retencao_dados_v2.pdf", size: 245800, content: sample.sampleContent });
    setSelectedFrameworks(sample.frameworks);
  };

  const toggleFramework = (id: string) => {
    setSelectedFrameworks((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const handleStart = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      onStartInvestigation({ fileName: selectedFile.name, content: selectedFile.content, frameworks: selectedFrameworks });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{t("upload_title")}</h2>
        <p className="text-xs text-[#9096A0] mt-0.5">{t("upload_subtitle")}</p>
      </div>

      {/* Modelo Rápido */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("upload_sample_title")}</h4>
          <p className="text-xs text-[#9096A0] mt-0.5">{t("upload_sample_desc")}</p>
        </div>
        <button
          onClick={() => loadSample(SAMPLE_POLICIES[0])}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors"
        >
          {t("upload_sample_btn")}
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed rounded-xl p-8 text-center transition-colors",
          dragActive ? "border-[#B8843A] bg-[#171B1F]" : "border-[#2A3038] bg-[#171B1F]/60 hover:border-[#38414D]",
          selectedFile && "border-[#3B8F6B]/60 bg-[#171B1F]"
        )}
      >
        <input type="file" id="file-upload" className="hidden" onChange={handleChange} accept=".pdf,.txt,.md,.docx" />

        {selectedFile ? (
          <div className="py-2 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#3B8F6B] font-bold">{t("upload_selected")}</span>
            <h3 className="text-sm font-bold text-white">{selectedFile.name}</h3>
            <p className="text-xs text-[#9096A0] font-mono">{(selectedFile.size / 1024).toFixed(1)} {t("upload_ready")}</p>
            <div className="pt-2">
              <label htmlFor="file-upload" className="text-xs text-[#4C8FA6] hover:underline cursor-pointer font-mono">
                {t("upload_change")}
              </label>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <h3 className="text-sm font-semibold text-white">{t("upload_drag_title")}</h3>
            <p className="text-xs text-[#9096A0] max-w-sm mx-auto">{t("upload_drag_desc")}</p>
            <div className="pt-2">
              <label
                htmlFor="file-upload"
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] cursor-pointer transition-colors"
              >
                {t("upload_select")}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Normas */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("upload_frameworks_title")}</h4>
          <p className="text-xs text-[#9096A0] mt-0.5">{t("upload_frameworks_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableFrameworks.map((fw) => {
            const isSelected = selectedFrameworks.includes(fw.id);
            return (
              <div
                key={fw.id}
                onClick={() => toggleFramework(fw.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all text-xs flex items-start gap-2.5",
                  isSelected
                    ? "bg-[#0D1013] border-[#B8843A]/60 text-white"
                    : "bg-[#0D1013]/40 border-[#2A3038] text-[#9096A0] hover:border-[#38414D]"
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-[#2A3038] bg-[#0D1013] text-[#B8843A] focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-white">{fw.label}</div>
                  <div className="text-[10px] text-[#9096A0] mt-0.5">{fw.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleStart}
          disabled={!selectedFile || selectedFrameworks.length === 0 || isProcessing}
          className={cn(
            "px-5 py-2.5 rounded-lg font-semibold text-xs transition-colors",
            selectedFile && selectedFrameworks.length > 0
              ? "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] cursor-pointer"
              : "bg-[#171B1F] text-[#5C636E] border border-[#2A3038] cursor-not-allowed"
          )}
        >
          {isProcessing ? t("upload_btn_processing") : t("upload_btn_start")}
        </button>
      </div>
    </div>
  );
}
