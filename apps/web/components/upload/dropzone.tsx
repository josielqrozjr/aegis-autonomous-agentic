"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { SAMPLE_POLICIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onStartInvestigation: (data: { fileName: string; content: string; frameworks: string[] }) => void;
}

export function Dropzone({ onStartInvestigation }: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["LGPD", "GDPR", "ISO 27001"]);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableFrameworks = [
    { id: "LGPD", label: "LGPD (Brasil)", desc: "Privacidade, retenção e direitos dos titulares" },
    { id: "GDPR", label: "GDPR (Europa)", desc: "Art. 5(1)(e) e direito ao apagamento" },
    { id: "ISO 27001", label: "ISO/IEC 27001", desc: "Controle A.8.10 e segurança da informação" },
    { id: "OWASP", label: "OWASP Top 10", desc: "Segurança de dados em APIs e arquitetura" },
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
        content: (event.target?.result as string) || "Conteúdo do documento...",
      });
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: typeof SAMPLE_POLICIES[0]) => {
    setSelectedFile({
      name: "politica_retencao_dados_v2.pdf",
      size: 245800,
      content: sample.sampleContent,
    });
    setSelectedFrameworks(sample.frameworks);
  };

  const toggleFramework = (id: string) => {
    setSelectedFrameworks((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      onStartInvestigation({
        fileName: selectedFile.name,
        content: selectedFile.content,
        frameworks: selectedFrameworks,
      });
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Nova Auditoria</h2>
        <p className="text-sm text-slate-400 mt-1">
          Envie o documento corporativo para que a malha de agentes autônomos inicie o escaneamento de privacidade e conformidade.
        </p>
      </div>

      {/* Template de Demonstração Rápida */}
      <div className="bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Cenário Oficial da Demonstração</h4>
            <p className="text-xs text-slate-400">
              Política de Retenção de Dados Corporativos (Sintética Multi-Jurisdição BR + EU)
            </p>
          </div>
        </div>
        <button
          onClick={() => loadSample(SAMPLE_POLICIES[0])}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          Carregar Documento Modelo
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          dragActive
            ? "border-cyan-400 bg-cyan-950/20 scale-[1.01]"
            : "border-slate-800 bg-[#0d121d]/70 hover:border-slate-700",
          selectedFile && "border-emerald-500/40 bg-emerald-950/10"
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
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{selectedFile.name}</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {(selectedFile.size / 1024).toFixed(1)} KB · SHA-256 Pronto para Validação
            </p>
            <label
              htmlFor="file-upload"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer underline underline-offset-4"
            >
              Escolher outro arquivo
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Arraste e solte seu documento aqui
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm">
              Suporta arquivos PDF, Markdown e TXT contendo políticas, termos ou relatórios técnicos.
            </p>
            <label
              htmlFor="file-upload"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors border border-slate-700"
            >
              Selecionar do Computador
            </label>
          </div>
        )}
      </div>

      {/* Seleção de Jurisdições e Frameworks */}
      <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-1">Normas Regulatórias Aplicáveis</h4>
        <p className="text-xs text-slate-400 mb-4">
          Selecione as legislações que os agentes especialistas devem auditar neste documento:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableFrameworks.map((fw) => {
            const isSelected = selectedFrameworks.includes(fw.id);
            return (
              <div
                key={fw.id}
                onClick={() => toggleFramework(fw.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3",
                  isSelected
                    ? "bg-blue-600/10 border-blue-500/40 text-white"
                    : "bg-[#111622] border-slate-800 text-slate-400 hover:border-slate-700"
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">{fw.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{fw.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Disparo */}
      <div className="flex justify-end">
        <button
          onClick={handleStart}
          disabled={!selectedFile || selectedFrameworks.length === 0 || isProcessing}
          className={cn(
            "px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg",
            selectedFile && selectedFrameworks.length > 0
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
          )}
        >
          <span>{isProcessing ? "Iniciando Agentes..." : "Disparar Investigação Multiagente"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
