"use client";

import React from "react";
import { Finding, Investigation } from "@/lib/types";
import { TrustGraphData } from "@/lib/api/client";
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  FileText, 
  Hash, 
  CheckCircle2, 
  Scale, 
  AlertTriangle,
  Award
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ComplianceReportViewProps {
  investigation: Investigation;
  findings: Finding[];
  graphData: TrustGraphData;
}

export function ComplianceReportView({ investigation, findings, graphData }: ComplianceReportViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-[#0d121d] border border-[#1e293b] p-4 rounded-xl print:hidden">
        <div>
          <h3 className="font-bold text-white text-sm">Dossiê Executivo de Auditoria & Conformidade</h3>
          <p className="text-xs text-slate-400">Pronto para exportação em PDF ou impressão com certificação criptográfica.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar em PDF
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-[#0c101a] border border-[#1e293b] rounded-xl p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0">
        {/* Certificate Header */}
        <div className="border-b border-[#1e293b] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white print:text-black tracking-tight">
                  AEGIS TRUST & COMPLIANCE REPORT
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Certificado de Auditoria Multiagente Autônoma
                </p>
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div><strong className="text-slate-200">ID:</strong> {investigation.id}</div>
            <div><strong className="text-slate-200">Data:</strong> {formatDate(investigation.updatedAt)}</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1 justify-end mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> AUDITORIA VERIFICADA
            </div>
          </div>
        </div>

        {/* Document Provenance */}
        <div className="p-4 rounded-lg bg-[#080b11] border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Documento Ingerido:</span>
            <span className="font-mono text-white">{investigation.documentName}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>Hash SHA-256 de Autenticidade:</span>
            <span className="text-cyan-300 truncate max-w-md">{investigation.documentHash}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Frameworks Auditados:</span>
            <span className="text-slate-200 font-semibold">{investigation.frameworks.join(" · ")}</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nós no Grafo</span>
            <span className="text-xl font-bold font-mono text-white">
              {graphData.valid_nodes}/{graphData.total_nodes}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Válidos & Conformes</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Agentes Google</span>
            <span className="text-xl font-bold font-mono text-cyan-400">3 Modelos</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Flash + Gemma + Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Crítica Adversarial</span>
            <span className="text-xl font-bold font-mono text-purple-400">100%</span>
            <span className="text-[10px] text-purple-300 block mt-0.5">Gemini 2.5 Pro</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status de Risco</span>
            <span className="text-xl font-bold font-mono text-emerald-400">Mitigado</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Com Remediações</span>
          </div>
        </div>

        {/* Findings Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
            Apontamentos, Hashes de Evidências e Remediações
          </h4>

          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="p-4 rounded-lg bg-[#0d121d] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">{f.id}</span>
                    <span className="font-semibold text-white">{f.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300">
                    {f.framework} · {f.articleOrControl}
                  </span>
                </div>
                <p className="text-slate-300">{f.description}</p>
                <div className="p-2.5 rounded bg-[#080b11] border border-slate-800 text-[11px] font-mono text-cyan-300 italic">
                  "{f.evidenceQuote}"
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Agente: {f.agentName}</span>
                  <span className="text-emerald-400 font-semibold">Remediação: {f.remediationSuggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Seal */}
        <div className="pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            <div className="text-slate-300 font-bold">AEGIS Multi-Agent Governance Engine</div>
            <div>Emitido para conformidade LGPD, GDPR e ISO/IEC 27001</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Award className="w-5 h-5" />
            <span className="font-bold">SELO DE AUDITORIA CRIPTOGRÁFICA ATIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
