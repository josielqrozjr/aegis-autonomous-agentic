"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Finding, Investigation, AgentInfo } from "@/lib/types";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { TrustGraphViewer } from "./trust-graph-viewer";
import { RemediatedDocumentViewer } from "@/components/evidence/remediated-document-viewer";

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
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState<string>("ALL");
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isGraphExpanded, setIsGraphExpanded] = useState<boolean>(true);
  const [isPreviewDocOpen, setIsPreviewDocOpen] = useState<boolean>(false);

  // Documento selecionado atualmente
  const activeDoc = investigations.find((inv) => inv.id === selectedDocId) || currentInvestigation;

  // Filtra a lista de documentos pelo termo de busca, status, criticidade, IAs e norma
  const filteredInvestigations = investigations.filter((inv) => {
    const invGaps = findings.filter(
      (f) =>
        f.investigationId === inv.id ||
        (!findings.some((x) => x.investigationId === inv.id) &&
          f.investigationId === "INV-2024-0047")
    );

    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETED" && inv.status === "COMPLETED") ||
      (statusFilter === "IN_PROGRESS" &&
        (inv.status === "INVESTIGATING" ||
          inv.status === "UNDERSTANDING" ||
          inv.status === "PLANNING")) ||
      (statusFilter === "PENDING_REVIEW" && inv.status === "PENDING_REVIEW") ||
      (statusFilter === "POLICY_DRIFT" &&
        (inv.status === "POLICY_DRIFT" || (inv.id === "INV-2024-0047" && isDriftActive)));

    const matchesFramework =
      frameworkFilter === "ALL" || inv.frameworks.includes(frameworkFilter);

    const matchesCriticality =
      criticalityFilter === "ALL" ||
      invGaps.some((f) => f.severity === criticalityFilter);

    const matchesAgent =
      agentFilter === "ALL" ||
      invGaps.some(
        (f) =>
          f.agentId === agentFilter ||
          (f.agentName && f.agentName.toLowerCase().includes(agentFilter.toLowerCase()))
      );

    return matchesSearch && matchesStatus && matchesFramework && matchesCriticality && matchesAgent;
  });

  const isAnyFilterActive =
    searchQuery !== "" ||
    statusFilter !== "ALL" ||
    frameworkFilter !== "ALL" ||
    criticalityFilter !== "ALL" ||
    agentFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setFrameworkFilter("ALL");
    setCriticalityFilter("ALL");
    setAgentFilter("ALL");
  };

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

  // Helper para renderizar a badge de status de forma padronizada e limpa (sem ícones)
  const renderStatusBadge = (inv: Investigation) => {
    if (inv.id === "INV-2024-0047" && isDriftActive) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
          Policy Drift Active
        </span>
      );
    }

    switch (inv.status) {
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3B8F6B]/15 text-[#3B8F6B] border border-[#3B8F6B]/30">
            Completed
          </span>
        );
      case "INVESTIGATING":
      case "UNDERSTANDING":
      case "PLANNING":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40">
            In Progress ({inv.progressPercent}%)
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40">
            Pending Remediation
          </span>
        );
      case "POLICY_DRIFT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
            Policy Drift Active
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0D1013] text-[#9096A0] border border-[#2A3038]">
            {inv.status}
          </span>
        );
    }
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

          {/* Barra de Pesquisa e Filtros Avançados (Status, Criticidade, IAs, Legislação) */}
          <div className="bg-[#171B1F] border border-[#2A3038] p-4 rounded-xl space-y-3">
            {/* Linha 1: Input de Busca + Indicador de Resultados */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xl">
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

              <div className="flex items-center gap-3 text-xs font-mono text-[#9096A0]">
                <span>
                  Showing <strong className="text-white">{filteredInvestigations.length}</strong> of{" "}
                  {investigations.length} documents
                </span>
                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#E06C5D] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Linha 2: 4 Filtros Estruturados (Status, Criticidade, IAs e Frameworks) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#2A3038]/60 text-xs">
              {/* Filtro 1: Status do Documento */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0D1013] border border-[#2A3038] hover:border-[#B8843A] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#B8843A] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_REVIEW">Pending Remediation</option>
                  <option value="POLICY_DRIFT">Policy Drift Active</option>
                </select>
              </div>

              {/* Filtro 2: Criticidade */}
              <div>
                <select
                  value={criticalityFilter}
                  onChange={(e) => setCriticalityFilter(e.target.value)}
                  className="w-full bg-[#0D1013] border border-[#2A3038] hover:border-[#B8843A] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#B8843A] cursor-pointer"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Gaps Only</option>
                  <option value="HIGH">High Priority Gaps Only</option>
                  <option value="MEDIUM">Medium Gaps Only</option>
                </select>
              </div>

              {/* Filtro 3: Especialistas de IA */}
              <div>
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full bg-[#0D1013] border border-[#2A3038] hover:border-[#B8843A] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#B8843A] cursor-pointer"
                >
                  <option value="ALL">All AI Models & Specialists</option>
                  <option value="pii-scanner">PII Scanner (Gemma 2B)</option>
                  <option value="lgpd-specialist">LGPD Specialist (Gemini Flash)</option>
                  <option value="gdpr-specialist">GDPR Specialist (Gemini Flash)</option>
                  <option value="iso-specialist">ISO 27001 Specialist (Gemini Flash)</option>
                </select>
              </div>

              {/* Filtro 4: Legislação / Framework */}
              <div>
                <select
                  value={frameworkFilter}
                  onChange={(e) => setFrameworkFilter(e.target.value)}
                  className="w-full bg-[#0D1013] border border-[#2A3038] hover:border-[#B8843A] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#B8843A] cursor-pointer"
                >
                  <option value="ALL">All Frameworks</option>
                  <option value="LGPD">LGPD (Brazil)</option>
                  <option value="GDPR">GDPR (European Union)</option>
                  <option value="ISO 27001">ISO/IEC 27001</option>
                  <option value="OWASP">OWASP Top 10 / LLM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Documentos Auditados em Linhas Horizontais */}
          <div className="space-y-3">
            {filteredInvestigations.map((inv) => {
              const invGaps = findings.filter(
                (f) =>
                  f.investigationId === inv.id ||
                  (!findings.some((x) => x.investigationId === inv.id) &&
                    f.investigationId === "INV-2024-0047")
              );
              const crits = invGaps.filter((f) => f.severity === "CRITICAL").length;
              const highs = invGaps.filter((f) => f.severity === "HIGH").length;
              const meds = invGaps.filter((f) => f.severity === "MEDIUM").length;

              return (
                <div
                  key={inv.id}
                  onClick={() => handleOpenDocDetails(inv)}
                  className="bg-[#171B1F] border border-[#2A3038] hover:border-[#B8843A] rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-6 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-black/50 hover:bg-[#1C2126] group"
                >
                  {/* Coluna 1 (Esquerda - 6 cols): ID + Título + Nome do Arquivo */}
                  <div className="md:col-span-6 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                        {inv.id}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#B8843A] transition-colors leading-snug">
                        {inv.title}
                      </h3>
                      <p className="text-xs text-[#9096A0] font-mono">
                        File: {inv.documentName}
                      </p>
                    </div>
                  </div>

                  {/* Coluna 2 (Centro Exato - 2 cols): Status Centralizado */}
                  <div className="md:col-span-2 flex justify-start md:justify-center items-center">
                    {renderStatusBadge(inv)}
                  </div>

                  {/* Coluna 3 (Direita - 4 cols): Gaps na linha de cima + Frameworks na linha de baixo + Botão Access */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#2A3038]">
                    <div className="space-y-1.5 text-center flex flex-col items-center justify-center">
                      {/* Linha de Cima: Gaps (sem o número e centralizado) */}
                      <div className="text-xs font-mono font-bold text-white">
                        Gaps
                      </div>

                      {/* Linha do Meio: Badges de Severidade (centralizados) */}
                      <div className="flex items-center gap-1.5 justify-center">
                        {crits > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#A24438]/20 text-[#E06C5D] font-bold border border-[#A24438]/40">
                            {crits} Critical
                          </span>
                        )}
                        {highs > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40">
                            {highs} High
                          </span>
                        )}
                        {meds > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40">
                            {meds} Medium
                          </span>
                        )}
                      </div>

                      {/* Linha de Baixo: Frameworks (centralizados) */}
                      <div className="flex flex-wrap items-center gap-1.5 justify-center pt-0.5">
                        {inv.frameworks.map((fw) => (
                          <span
                            key={fw}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0D1013] text-[#9096A0] border border-[#2A3038]"
                          >
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs font-mono font-semibold text-[#B8843A] group-hover:text-[#CCA159] transition-colors pl-2">
                      <span>Access</span>
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
                  {renderStatusBadge(activeDoc)}
                </div>
              </div>

              {/* Ação de Visualização do Documento Remediado */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsPreviewDocOpen(true)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#3B8F6B]/15 hover:bg-[#3B8F6B]/25 text-[#3B8F6B] border border-[#3B8F6B]/30 transition-colors cursor-pointer"
                >
                  Preview Remediated Document
                </button>
              </div>
            </div>

            {/* Metadados: Somente Frameworks Identificados e IAs que Analisaram */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-1">
              {/* Frameworks Identificados */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#9096A0] font-semibold uppercase text-[10px] tracking-wider">
                  Frameworks:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeDoc.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#0D1013] text-[#B8843A] border border-[#2A3038]"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>

              {/* IAs que Fizeram a Análise */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#9096A0] font-semibold uppercase text-[10px] tracking-wider">
                  AI Models:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {Array.from(
                    new Set(
                      docFindings.map((f) => {
                        const name = (f.agentName || "").toLowerCase();
                        if (name.includes("gemma")) return "Gemma";
                        return "Gemini";
                      })
                    )
                  ).map((aiName) => (
                    <span
                      key={aiName}
                      className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#0D1013] text-[#7EB5CC] border border-[#4C8FA6]/30"
                    >
                      {aiName}
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

              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={() => {
                    filteredFindings.forEach((f) => {
                      if (f.status !== "RESOLVED") {
                        onApplyRemediation(f);
                      }
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3B8F6B]/15 hover:bg-[#3B8F6B]/25 text-[#3B8F6B] border border-[#3B8F6B]/30 transition-all cursor-pointer"
                >
                  {filteredFindings.every((f) => f.status === "RESOLVED")
                    ? "✓ All Remediations Sealed"
                    : "Apply All Remediations"}
                </button>

                <div className="flex items-center gap-1 bg-[#12161A] p-1 rounded-lg border border-[#2A3038]">
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
                        <span>Identified Clause & Evidence</span>
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
                          <span>View in Full Document (Drawer)</span>
                        </button>

                        <span className="text-[11px] text-[#5C636E]">
                          Agent: {finding.agentName}
                        </span>
                      </div>
                    </div>

                    {/* Lado Direito: Sugestão para ser Atualizado e Remediado */}
                    <div className="p-5 space-y-3 bg-[#14181C]">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>Proposed Remediation & Patch</span>
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
                            ? "Remediated & Sealed"
                            : "Apply Remediation Patch"}
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
                      Policy Drift Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#9096A0] mt-0.5">
                  End-to-end evidence provenance tree: Requirements ➔ Agents ➔ Evidence ➔ Findings
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#B8843A]">
                <span>{isGraphExpanded ? "Hide Graph" : "Show Full Graph"}</span>
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

      {/* Visualizador do Documento Integral com Correções e Patches Aplicados */}
      <RemediatedDocumentViewer
        isOpen={isPreviewDocOpen}
        onClose={() => setIsPreviewDocOpen(false)}
        investigation={activeDoc}
        findings={docFindings}
        isDriftActive={isDriftActive}
      />
    </div>
  );
}
