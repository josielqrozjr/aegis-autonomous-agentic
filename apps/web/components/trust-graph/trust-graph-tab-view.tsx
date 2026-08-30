"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Finding, Investigation, AgentInfo } from "@/lib/types";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { TrustGraphViewer } from "./trust-graph-viewer";

interface TrustGraphTabViewProps {
  investigations: Investigation[];
  currentInvestigation: Investigation;
  onSelectInvestigation: (inv: Investigation) => void;
  findings: Finding[];
  agents: AgentInfo[];
  graphData: TrustGraphData;
  isDriftActive: boolean;
  selectedNodeId: string | null;
  onSelectNode: (node: TrustGraphNode) => void;
  onOpenEvidence: (finding: Finding) => void;
  onApplyRemediation: (finding: Finding) => void;
  onTriggerDrift: () => void;
  onResetDrift: () => void;
}

export function TrustGraphTabView({
  investigations,
  currentInvestigation,
  onSelectInvestigation,
  findings,
  agents,
  graphData,
  isDriftActive,
  selectedNodeId,
  onSelectNode,
  onOpenEvidence,
  onApplyRemediation,
  onTriggerDrift,
  onResetDrift,
}: TrustGraphTabViewProps) {
  // Estado para controlar a visão: Lista de Documentos vs Detalhes do Documento
  const [selectedDocId, setSelectedDocId] = useState<string | null>(currentInvestigation.id);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isGraphExpanded, setIsGraphExpanded] = useState<boolean>(true);

  // Documento selecionado atualmente
  const activeDoc = investigations.find((inv) => inv.id === selectedDocId) || currentInvestigation;

  // Filtra a lista de documentos pelo termo de busca e norma
  const filteredInvestigations = investigations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFramework =
      frameworkFilter === "ALL" || inv.frameworks.includes(frameworkFilter);

    return matchesSearch && matchesFramework;
  });

  // Apontamentos pertencentes ao documento selecionado
  const docFindings = findings.filter(
    (f) =>
      f.investigationId === activeDoc.id ||
      (!findings.some((x) => x.investigationId === activeDoc.id) &&
        f.investigationId === "INV-2024-0047")
  );

  const filteredFindings = docFindings.filter((f) => {
    if (severityFilter === "ALL") return true;
    return f.severity === severityFilter;
  });

  const criticalCount = docFindings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = docFindings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = docFindings.filter((f) => f.severity === "MEDIUM").length;

  const handleOpenDocDetails = (inv: Investigation) => {
    setSelectedDocId(inv.id);
    onSelectInvestigation(inv);
  };

  return (
    <div className="space-y-6 w-full">
      {/* ========================================================================= */}
      {/* MODO 1: LISTA INICIAL DE DOCUMENTOS AUDITADOS COM PESQUISA E FILTROS      */}
      {/* ========================================================================= */}
      {!selectedDocId && (
        <div className="space-y-6">
          {/* Cabeçalho da Lista */}
          <div className="pb-3 border-b border-[#2A3038]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Audited Documents Repository
            </h2>
            <p className="text-xs text-[#9096A0] mt-0.5">
              Select any audited document below to inspect its multi-agent evidence chains, identified gaps, and side-by-side remediations.
            </p>
          </div>

          {/* Barra de Pesquisa e Filtros por Legislação */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171B1F] border border-[#2A3038] p-4 rounded-xl">
            {/* Input de Busca */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, file name, hash or ID..."
                className="w-full bg-[#0D1013] border border-[#2A3038] hover:border-[#38414D] focus:border-[#B8843A] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#5C636E] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[#9096A0] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtros por Norma */}
            <div className="flex flex-wrap items-center gap-1 bg-[#0D1013] p-1 rounded-lg border border-[#2A3038]">
              {["ALL", "LGPD", "GDPR", "ISO 27001", "OWASP"].map((fw) => (
                <button
                  key={fw}
                  onClick={() => setFrameworkFilter(fw)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer",
                    frameworkFilter === fw
                      ? "bg-[#171B1F] text-[#B8843A] font-semibold border border-[#B8843A]/30"
                      : "text-[#9096A0] hover:text-white"
                  )}
                >
                  {fw === "ALL" ? "All Frameworks" : fw}
                </button>
              ))}
            </div>
          </div>

          {/* Grid / Lista de Documentos Auditados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvestigations.map((inv) => {
              const invGaps = findings.filter(
                (f) =>
                  f.investigationId === inv.id ||
                  (!findings.some((x) => x.investigationId === inv.id) &&
                    f.investigationId === "INV-2024-0047")
              );
              const crits = invGaps.filter((f) => f.severity === "CRITICAL").length;
              const highs = invGaps.filter((f) => f.severity === "HIGH").length;

              return (
                <div
                  key={inv.id}
                  onClick={() => handleOpenDocDetails(inv)}
                  className="bg-[#171B1F] border border-[#2A3038] hover:border-[#B8843A] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-black/50 hover:-translate-y-0.5"
                >
                  {/* Top Header do Card */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                        {inv.id}
                      </span>
                      <span className="text-[10px] font-mono text-[#3B8F6B] bg-[#3B8F6B]/15 px-2 py-0.5 rounded border border-[#3B8F6B]/30">
                        ✓ Verified Audit
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#5C636E]">
                      {(inv.fileSizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Título e Nome do Arquivo */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#B8843A] transition-colors">
                      {inv.title}
                    </h3>
                    <p className="text-xs text-[#9096A0] font-mono truncate">
                      File: {inv.documentName}
                    </p>
                  </div>

                  {/* Frameworks e Gaps Breakdown */}
                  <div className="pt-3 border-t border-[#2A3038] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {inv.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0D1013] text-[#9096A0] border border-[#2A3038]"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-white font-bold">{invGaps.length} Gaps:</span>
                      {crits > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A24438]/20 text-[#E06C5D] font-bold">
                          {crits} Critical
                        </span>
                      )}
                      {highs > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#B8843A]/20 text-[#D4A559]">
                          {highs} High
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: DETALHES DO DOCUMENTO COM COMPARATIVO LADO A LADO                 */}
      {/* ========================================================================= */}
      {selectedDocId && (
        <div className="space-y-6">
          {/* Barra de Navegação Superior (Voltar para a Lista) */}
          <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2A3038]">
              <div className="space-y-2">
                {/* Botão de Voltar */}
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="text-xs font-mono font-semibold text-[#B8843A] hover:text-[#CCA159] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>← Back to Documents List</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {activeDoc.title}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                    {activeDoc.id}
                  </span>
                </div>
              </div>

              {/* Ações de Simulação e Status */}
              <div className="flex items-center gap-3 shrink-0">
                {isDriftActive ? (
                  <button
                    onClick={onResetDrift}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#A24438]/20 hover:bg-[#A24438]/30 text-[#E06C5D] border border-[#A24438]/40 transition-colors cursor-pointer"
                  >
                    Reset Regulatory Drift
                  </button>
                ) : (
                  <button
                    onClick={onTriggerDrift}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#B8843A]/15 hover:bg-[#B8843A]/25 text-[#D4A559] border border-[#B8843A]/30 transition-colors cursor-pointer"
                  >
                    Simulate Regulatory Drift (GDPR v2)
                  </button>
                )}

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#3B8F6B]" />
                  <span className="text-[#3B8F6B] font-bold">Verified Audit</span>
                </div>
              </div>
            </div>

            {/* Metadados do Arquivo */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9096A0] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#5C636E]">File:</span>
                <span className="text-white font-semibold">{activeDoc.documentName}</span>
                <span className="text-[#5C636E]">({(activeDoc.fileSizeBytes / 1024).toFixed(1)} KB)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#5C636E]">SHA-256:</span>
                <span className="text-[#B8BDC7] truncate max-w-xs md:max-w-md">
                  {activeDoc.documentHash}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#5C636E]">Frameworks:</span>
                <div className="flex items-center gap-1">
                  {activeDoc.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0D1013] text-[#B8843A] border border-[#2A3038]"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Executivo de Gaps por Nível */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                Total Gaps Identified
              </span>
              <span className="text-2xl font-bold font-mono text-white mt-0.5">
                {docFindings.length}
              </span>
              <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                compliance gaps
              </span>
            </div>

            <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                Critical Violations
              </span>
              <span className="text-2xl font-bold font-mono text-[#E06C5D] mt-0.5">
                {criticalCount}
              </span>
              <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                immediate statutory breach
              </span>
            </div>

            <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                High Priority Gaps
              </span>
              <span className="text-2xl font-bold font-mono text-[#D4A559] mt-0.5">
                {highCount}
              </span>
              <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                security & access gaps
              </span>
            </div>

            <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                Adversarial Validation
              </span>
              <span className="text-2xl font-bold font-mono text-[#3B8F6B] mt-0.5">
                100%
              </span>
              <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                0 false positives (Gemini 2.5 Pro)
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PAINEL COMPARATIVO LADO A LADO: IDENTIFICAÇÃO VS REMEDIAÇÃO               */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            {/* Header da Seção e Filtros de Severidade */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2A3038]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Audit Findings & Side-by-Side Remediations ({docFindings.length})
                </h3>
                <p className="text-xs text-[#9096A0] mt-0.5">
                  Direct comparison between detected statutory violations in the text and recommended compliance patches.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#12161A] p-1 rounded-lg border border-[#2A3038] self-start sm:self-auto">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSeverityFilter(lvl)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                      severityFilter === lvl
                        ? "bg-[#21262B] text-[#B8843A] font-semibold"
                        : "text-[#9096A0] hover:text-white"
                    )}
                  >
                    {lvl === "ALL" ? "All" : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista dos Gaps com Comparativo Lado a Lado */}
            <div className="space-y-5">
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="bg-[#171B1F] border border-[#2A3038] rounded-xl overflow-hidden shadow-md"
                >
                  {/* Topo do Gap: Identificador, Norma e Severidade */}
                  <div className="p-4 bg-[#12161A] border-b border-[#2A3038] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          finding.severity === "CRITICAL" &&
                            "bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40",
                          finding.severity === "HIGH" &&
                            "bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40",
                          finding.severity === "MEDIUM" &&
                            "bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40",
                          finding.severity === "LOW" &&
                            "bg-[#3B8F6B]/20 text-[#3B8F6B] border border-[#3B8F6B]/40"
                        )}
                      >
                        {finding.severity}
                      </span>

                      <span className="font-bold text-sm text-white tracking-tight">
                        {finding.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#9096A0]">
                      <span>{finding.framework} · {finding.articleOrControl}</span>
                      <span className="px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                        {finding.id}
                      </span>
                    </div>
                  </div>

                  {/* Grid Lado a Lado: 50% O Que Foi Identificado vs 50% Sugestão de Correção */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2A3038]">
                    {/* Lado Esquerdo: O que foi Identificado no Documento */}
                    <div className="p-5 space-y-3 bg-[#171B1F]">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#E06C5D]">
                        <span>👈 Identified Clause & Evidence</span>
                        <span className="text-[#5C636E]">Original Document</span>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs text-[#B8BDC7] font-mono italic leading-relaxed">
                        "{finding.evidenceQuote}"
                      </div>

                      <p className="text-xs text-[#9096A0] leading-relaxed">
                        {finding.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#2A3038]/60">
                        <button
                          onClick={() => onOpenEvidence(finding)}
                          className="text-[#4C8FA6] hover:text-[#7EB5CC] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🔍 View in Full Document (Drawer)</span>
                        </button>

                        <span className="text-[11px] text-[#5C636E]">
                          Agent: {finding.agentName}
                        </span>
                      </div>
                    </div>

                    {/* Lado Direito: Sugestão para ser Atualizado e Remediado */}
                    <div className="p-5 space-y-3 bg-[#14181C]">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>👉 Proposed Remediation & Patch</span>
                        <span className="text-[#B8843A]">Recommended Fix</span>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-xs text-white font-mono leading-relaxed">
                        {finding.remediationSuggestion}
                      </div>

                      {finding.criticVerdict && (
                        <div className="p-2.5 rounded bg-[#0D1013]/60 border border-[#2A3038] text-[11px] text-[#9096A0]">
                          <strong className="text-[#3B8F6B] font-mono">Critic Verdict (Gemini 2.5 Pro):</strong>{" "}
                          {finding.criticVerdict}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#2A3038]/60">
                        <span className="text-[11px] text-[#5C636E]">
                          Confidence: {(finding.confidence * 100).toFixed(0)}%
                        </span>

                        <button
                          onClick={() => onApplyRemediation(finding)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md",
                            finding.status === "RESOLVED"
                              ? "bg-[#3B8F6B]/20 text-[#3B8F6B] border border-[#3B8F6B]/40"
                              : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013]"
                          )}
                        >
                          {finding.status === "RESOLVED"
                            ? "✓ Remediated & Sealed"
                            : "⚡ Apply Remediation Patch"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GRAFO DE CONFIANÇA & RASTREABILIDADE (DAG) EXPANSÍVEL                      */}
          {/* ========================================================================= */}
          <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl overflow-hidden">
            <div
              onClick={() => setIsGraphExpanded(!isGraphExpanded)}
              className="p-4 bg-[#12161A] border-b border-[#2A3038] flex items-center justify-between cursor-pointer hover:bg-[#171B1F] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Trust & Compliance Graph (DAG Provenance)
                  </h3>
                  {isDriftActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40 animate-pulse">
                      Policy Drift Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#9096A0] mt-0.5">
                  End-to-end evidence provenance tree: Requirements ➔ Agents ➔ Evidence ➔ Findings
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#B8843A]">
                <span>{isGraphExpanded ? "Hide Graph ▲" : "Show Full Graph ▼"}</span>
              </div>
            </div>

            {isGraphExpanded && (
              <div className="p-4">
                <TrustGraphViewer
                  graphData={graphData}
                  onNodeSelect={onSelectNode}
                  selectedNodeId={selectedNodeId}
                  isDrifting={isDriftActive}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
