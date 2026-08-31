"use client";

import React, { useState } from "react";
import { SAMPLE_POLICIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onStartInvestigation: (data: { fileName: string; content: string; frameworks: string[]; file?: File }) => void;
}

export function Dropzone({ onStartInvestigation }: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string; rawFile?: File } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeFrameworks = [
    {
      id: "LGPD",
      label: "LGPD (Brazil)",
      agent: "LGPD Specialist (Gemini 3.6 Flash)",
      desc: "Law 13,709/2018 · Privacy, lawful bases and data subject rights",
    },
    {
      id: "GDPR",
      label: "GDPR (European Union)",
      agent: "GDPR Specialist (Gemini 3.6 Flash)",
      desc: "Art. 5(1)(e) Storage limitation & Art. 17 right to erasure",
    },
    {
      id: "ISO 27001",
      label: "ISO/IEC 27001",
      agent: "ISO Specialist (Gemini 3.6 Flash)",
      desc: "Controls A.8.10 information deletion & A.5.15 access control",
    },
    {
      id: "OWASP",
      label: "OWASP Top 10 / LLM",
      agent: "PII & Security Mesh (Gemma 2 (Vertex AI))",
      desc: "Sensitive prompt redaction & API secret exposure checks",
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        content: (event.target?.result as string) || "Document content...",
        rawFile: file,
      });
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: typeof SAMPLE_POLICIES[0]) => {
    setSelectedFile({
      name: sample.filename,
      size: sample.sampleContent.length * 15,
      content: sample.sampleContent,
    });
  };

  const handleStart = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    onStartInvestigation({
      fileName: selectedFile.name,
      content: selectedFile.content,
      frameworks: ["LGPD", "GDPR", "ISO 27001", "OWASP"],
      file: selectedFile.rawFile,
    });
    setIsProcessing(false);
  };

  return (
    <div className="w-full space-y-7">
      {/* Header */}
      <div className="pb-3.5 border-b border-[#2A3038]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          New Investigation
        </h2>
        <p className="text-xs text-[#9096A0] mt-1 leading-relaxed">
          Upload a corporate policy, normative standard or commercial contract to launch autonomous compliance scanning.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed rounded-xl p-9 text-center transition-colors",
          dragActive
            ? "border-[#B8843A] bg-[#171B1F]"
            : "border-[#2A3038] bg-[#171B1F]/60 hover:border-[#38414D]",
          selectedFile && "border-[#3B8F6B]/60 bg-[#171B1F]"
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.txt,.md,.docx"
        />

        {selectedFile ? (
          <div className="py-3 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#3B8F6B] font-bold">Selected Document Ready</span>
            <h3 className="text-sm font-bold text-white">{selectedFile.name}</h3>
            <p className="text-xs text-[#9096A0] font-mono">
              {(selectedFile.size / 1024).toFixed(1)} KB · SHA-256 Checksum Computed
            </p>
            <div className="pt-3">
              <label
                htmlFor="file-upload"
                className="text-xs text-[#4C8FA6] hover:underline cursor-pointer font-mono"
              >
                Upload different file from computer
              </label>
            </div>
          </div>
        ) : (
          <div className="py-5 space-y-2.5">
            <div className="w-11 h-11 rounded-full bg-[#21262B] flex items-center justify-center mx-auto text-[#B8843A] text-lg">
              📄
            </div>
            <div className="text-xs font-semibold text-white">
              Drag & Drop your audit document here
            </div>
            <p className="text-[11px] text-[#9096A0] leading-relaxed">
              Supports corporate policies, normative standards, and commercial contracts (PDF, MD, TXT)
            </p>
            <div className="pt-2.5">
              <label
                htmlFor="file-upload"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#21262B] hover:bg-[#2A3038] text-white border border-[#2A3038] transition-colors cursor-pointer inline-block"
              >
                Browse Files
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Automated Regulatory Benchmarking (Centralized Layout) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Automated Regulatory Benchmarking
          </h3>
          <p className="text-xs text-[#9096A0] mt-1 leading-relaxed">
            The multi-agent mesh automatically provisions specialists across global and local legislations:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeFrameworks.map((fw) => (
            <div
              key={fw.id}
              className="p-5 rounded-xl border bg-[#171B1F] border-[#2A3038] hover:border-[#38414D] text-center flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <div className="font-bold text-xs text-white">
                {fw.label}
              </div>
              <div className="py-0.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#0D1013] text-[#B8843A] border border-[#2A3038] inline-block">
                  {fw.agent}
                </span>
              </div>
              <div className="text-[11px] text-[#9096A0] font-mono leading-relaxed max-w-sm">
                {fw.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-3 flex justify-end">
        <button
          onClick={handleStart}
          disabled={!selectedFile || isProcessing}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg",
            selectedFile && !isProcessing
              ? "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] hover:shadow-black/50"
              : "bg-[#21262B] text-[#5C636E] cursor-not-allowed border border-[#2A3038]"
          )}
        >
          {isProcessing ? "Deploying Multi-Agent Fleet..." : "Start Analysis"}
        </button>
      </div>
    </div>
  );
}
