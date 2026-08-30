"use client";

import React from "react";
import { Finding } from "@/lib/types";
import { SAMPLE_POLICIES } from "@/lib/mock-data";
import { FileText, Hash, ShieldCheck, X, CheckCircle2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceDocumentViewerProps {
  finding: Finding | null;
  onClose: () => void;
}

export function SourceDocumentViewer({ finding, onClose }: SourceDocumentViewerProps) {
  if (!finding) return null;

  const sampleText = SAMPLE_POLICIES[0].sampleContent;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-[#0d121d] border-l border-[#1e293b] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#0a0e17]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Navegador do Documento Fonte</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                politica_retencao_dados_v2.pdf · Rastreabilidade Ativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provenance & Hash Banner */}
        <div className="p-4 bg-[#111726] border-b border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" /> {finding.id} — {finding.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30">
              {finding.framework}
            </span>
          </div>

          <div className="p-2 rounded bg-[#080b11] border border-slate-800/90 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <Hash className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{finding.evidenceHash}</span>
            </div>
            <span className="shrink-0 flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Hash Auditado
            </span>
          </div>
        </div>

        {/* Document Body with Highlighted Paragraph */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-4">
          <div className="p-4 rounded-lg bg-[#080b11] border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              POLÍTICA CORPORATIVA DE RETENÇÃO E PRIVACIDADE DE DADOS
            </div>
            <p className="text-slate-400 mb-3">Versão 2.4 — Setembro 2026</p>

            <div className="space-y-3">
              <p>
                <strong className="text-white">1. OBJETIVO E ESCOPO</strong>
                <br />
                Esta política define as diretrizes para armazenamento, tratamento e descarte de dados pessoais e corporativos tratados nos ambientes de produção do AEGIS Group no Brasil e União Europeia.
              </p>

              <p>
                <strong className="text-white">2. PRAZOS DE RETENÇÃO</strong>
                <br />
                <span
                  className={cn(
                    "block p-2.5 rounded my-1 border transition-all",
                    finding.evidenceQuote.includes("indeterminado")
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-500/10"
                      : "text-slate-300"
                  )}
                >
                  2.1. Dados cadastrais e histórico de transações de usuários serão armazenados por prazo indeterminado para fins de inteligência de negócios e personalização de serviços.
                </span>

                <span
                  className={cn(
                    "block p-2.5 rounded my-1 border transition-all",
                    finding.evidenceQuote.includes("Logs")
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-500/10"
                      : "text-slate-300"
                  )}
                >
                  2.2. Logs de acesso a servidores e requisições HTTP serão retidos por 30 (trinta) dias, sem expurgo programado de registros que contenham endereços IP ou identificadores pessoais.
                </span>
                2.3. Documentos fiscais e comprovantes bancários serão mantidos pelo prazo de 5 (cinco) anos conforme legislação tributária aplicável.
              </p>

              <p>
                <strong className="text-white">3. DIREITO AO ESQUECIMENTO E ELIMINAÇÃO</strong>
                <br />
                <span
                  className={cn(
                    "block p-2.5 rounded my-1 border transition-all",
                    finding.evidenceQuote.includes("90 dias")
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-500/10"
                      : "text-slate-300"
                  )}
                >
                  3.1. Solicitações de exclusão de dados pessoais feitas por titulares serão avaliadas pela equipe jurídica em até 90 dias úteis.
                </span>
                3.2. Dados mantidos em backups frios não são afetados por solicitações de exclusão e serão sobrescritos apenas no ciclo padrão de 2 anos.
              </p>

              <p>
                <strong className="text-white">4. SEGURANÇA E CRIPTOGRAFIA</strong>
                <br />
                <span
                  className={cn(
                    "block p-2.5 rounded my-1 border transition-all",
                    finding.evidenceQuote.includes("senhas compartilhadas")
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-500/10"
                      : "text-slate-300"
                  )}
                >
                  4.1. Dados em trânsito são protegidos com TLS 1.3. Bases de dados analíticas utilizam senhas compartilhadas restritas ao time de engenharia.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0a0e17] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Fechar Navegador
          </button>
        </div>
      </div>
    </div>
  );
}
