"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Finding, Investigation, AgentInfo } from "@/lib/types";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { TrustGraphViewer } from "./trust-graph-viewer";
import {
  RemediatedDocumentViewer,
  generateFinalDocumentContent,
  downloadDocumentFile,
  printDocumentAsPdf,
} from "@/components/evidence/remediated-document-viewer";

interface TrustGraphTabViewProps {
  investigations: Investigation[];
  currentInvestigation: Investigation;
  onSelectInvestigation: (inv: Investigation) => void;
  selectedDocId?: string | null;
  onSelectDocId?: (id: string | null) => void;
  findings: Finding[];
  agents: AgentInfo[];
  graphData: TrustGraphData;
  isDriftActive: boolean;
  selectedNodeId: string | null;
  onSelectNode: (node: TrustGraphNode) => void;
  onOpenEvidence: (finding: Finding) => void;
  onApplyRemediation: (finding: Finding) => void;
  onApproveDocument?: (invId: string) => void;
  onUpdateRemediationSuggestion?: (findingId: string, newSuggestion: string) => void;
  onTriggerDrift: () => void;
  onResetDrift: () => void;
}

export function TrustGraphTabView({
  investigations,
  currentInvestigation,
  onSelectInvestigation,
  selectedDocId: controlledSelectedDocId,
  onSelectDocId,
  findings,
  agents,
  graphData,
  isDriftActive,
  selectedNodeId,
  onSelectNode,
  onOpenEvidence,
  onApplyRemediation,
  onApproveDocument,
  onUpdateRemediationSuggestion,
  onTriggerDrift,
  onResetDrift,
}: TrustGraphTabViewProps) {
  // Estado para controlar a visão: Lista de Documentos vs Detalhes do Documento
  const [internalSelectedDocId, setInternalSelectedDocId] = useState<string | null>(null);
  const selectedDocId = controlledSelectedDocId !== undefined ? controlledSelectedDocId : internalSelectedDocId;

  const setSelectedDocId = (id: string | null) => {
    if (onSelectDocId) {
      onSelectDocId(id);
    }
    setInternalSelectedDocId(id);
  };
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState<string>("ALL");
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isGraphExpanded, setIsGraphExpanded] = useState<boolean>(true);
  const [isPreviewDocOpen, setIsPreviewDocOpen] = useState<boolean>(false);
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [editedPatchText, setEditedPatchText] = useState<string>("");

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

  // Helper que calcula o progresso percentual e status dinâmico com base nos findings
  const getDocProgressAndStatus = (inv: Investigation) => {
    const invGaps = findings.filter(
      (f) =>
        f.investigationId === inv.id ||
        (!findings.some((x) => x.investigationId === inv.id) && f.investigationId === "INV-2024-0047")
    );
    const total = invGaps.length;
    const resolved = invGaps.filter((f) => f.status === "RESOLVED").length;
    const open = total - resolved;
    const progressPercent = total > 0 ? Math.round((resolved / total) * 100) : 100;

    if (inv.id === "INV-2024-0047" && isDriftActive) {
      return {
        status: "POLICY_DRIFT",
        progressPercent,
        total,
        resolved,
        open,
        label: "Policy Drift Active",
      };
    }

    if (inv.status === "COMPLETED" && (resolved === total || total === 0)) {
      return {
        status: "COMPLETED",
        progressPercent: 100,
        total,
        resolved,
        open: 0,
        label: "Completed",
      };
    }

    if (resolved > 0) {
      return {
        status: "INVESTIGATING",
        progressPercent,
        total,
        resolved,
        open,
        label: `In Progress (${progressPercent}%)`,
      };
    }

    return {
      status: "PENDING_REVIEW",
      progressPercent: 0,
      total,
      resolved: 0,
      open: total,
      label: "Pending",
    };
  };

  const handleOpenDocDetails = (inv: Investigation) => {
    setSelectedDocId(inv.id);
    onSelectInvestigation(inv);
  };

  // Helper para renderizar a badge de status de forma padronizada, dinâmica e limpa (sem ícones)
  const renderStatusBadge = (inv: Investigation) => {
    const info = getDocProgressAndStatus(inv);

    switch (info.status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3B8F6B]/15 text-[#3B8F6B] border border-[#3B8F6B]/30">
            {info.label}
          </span>
        );
      case "INVESTIGATING":
      case "UNDERSTANDING":
      case "PLANNING":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40">
            {info.label}
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40">
            {info.label}
          </span>
        );
      case "POLICY_DRIFT":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
            {info.label}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0D1013] text-[#9096A0] border border-[#2A3038]">
            {info.label}
          </span>
        );
    }
  };

  const activeDocProgress = getDocProgressAndStatus(activeDoc);

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
              const docState = getDocProgressAndStatus(inv);
              const invGaps = findings.filter(
                (f) =>
                  f.investigationId === inv.id ||
                  (!findings.some((x) => x.investigationId === inv.id) &&
                    f.investigationId === "INV-2024-0047")
              );
              const openCrits = invGaps.filter((f) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length;
              const openHighs = invGaps.filter((f) => f.severity === "HIGH" && f.status !== "RESOLVED").length;
              const openMeds = invGaps.filter((f) => f.severity === "MEDIUM" && f.status !== "RESOLVED").length;

              return (
                <div
                  key={inv.id}
                  onClick={() => handleOpenDocDetails(inv)}
                  className="bg-[#171B1F] border border-[#2A3038] hover:border-[#B8843A] rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-6 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-black/50 hover:bg-[#1C2126] group"
                >
                  {/* Coluna 1 (Esquerda - 5 cols): ID + Título + Nome do Arquivo */}
                  <div className="md:col-span-5 space-y-1.5 min-w-0">
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

                  {/* Coluna 3 (Gaps e Frameworks - 3 cols): Centralizado com respiro */}
                  <div className="md:col-span-3 space-y-1.5 text-center flex flex-col items-center justify-center pt-3 md:pt-0 border-t md:border-t-0 border-[#2A3038]">
                    {/* Linha de Cima: Gaps (sem o número e centralizado) */}
                    <div className="text-xs font-mono font-bold text-white">
                      Gaps
                    </div>

                    {/* Linha do Meio: Badges de Severidade (centralizados) */}
                    <div className="flex items-center gap-1.5 justify-center">
                      {docState.open === 0 && docState.total > 0 ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#3B8F6B]/20 text-[#3B8F6B] font-bold border border-[#3B8F6B]/40">
                          Remediated
                        </span>
                      ) : (
                        <>
                          {openCrits > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#A24438]/20 text-[#E06C5D] font-bold border border-[#A24438]/40">
                              {openCrits} Critical
                            </span>
                          )}
                          {openHighs > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40">
                              {openHighs} High
                            </span>
                          )}
                          {openMeds > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40">
                              {openMeds} Medium
                            </span>
                          )}
                        </>
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

                  {/* Coluna 4 (Direita - 2 cols): Botão / Link Access */}
                  <div className="md:col-span-2 flex items-center justify-end">
                    <div className="px-3.5 py-1.5 rounded-lg bg-[#0D1013] group-hover:bg-[#B8843A] text-xs font-mono font-semibold text-[#B8843A] group-hover:text-[#0D1013] border border-[#2A3038] group-hover:border-[#B8843A] transition-all flex items-center justify-center shadow-sm">
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
                </div>
              </div>

              {/* Ação de Visualização, Download e Aprovação do Documento */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsPreviewDocOpen(true)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#3B8F6B]/15 hover:bg-[#3B8F6B]/25 text-[#3B8F6B] border border-[#3B8F6B]/30 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Preview Remediated Document</span>
                </button>

                <button
                  onClick={() => printDocumentAsPdf(activeDoc, docFindings, isDriftActive)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0D1013] hover:bg-[#21262B] text-white border border-[#2A3038] hover:border-[#B8843A] transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Save / Download Final Document as PDF"
                >
                  <span>Save PDF</span>
                </button>

                <button
                  onClick={() => {
                    if (onApproveDocument) {
                      onApproveDocument(activeDoc.id);
                    } else {
                      docFindings.forEach((f) => {
                        if (f.status !== "RESOLVED") {
                          onApplyRemediation(f);
                        }
                      });
                    }
                  }}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5",
                    activeDocProgress.status === "COMPLETED"
                      ? "bg-[#3B8F6B]/20 text-[#3B8F6B] border border-[#3B8F6B]/40"
                      : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013]"
                  )}
                >
                  {activeDocProgress.status === "COMPLETED"
                    ? "Completed"
                    : "Approve Document"}
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
          {(() => {
            const activeDocInfo = getDocProgressAndStatus(activeDoc);
            const openCriticalCount = docFindings.filter((f) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length;
            const openHighCount = docFindings.filter((f) => f.severity === "HIGH" && f.status !== "RESOLVED").length;
            const resolvedGapsCount = docFindings.filter((f) => f.status === "RESOLVED").length;

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                    Remediation Progress
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#3B8F6B] mt-0.5">
                    {activeDocInfo.progressPercent}%
                  </span>
                  <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                    {resolvedGapsCount} of {docFindings.length} gaps remediated
                  </span>
                </div>

                <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                    Critical Violations
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#E06C5D] mt-0.5">
                    {openCriticalCount}
                  </span>
                  <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                    {openCriticalCount === 0 ? "all resolved" : "immediate statutory breach"}
                  </span>
                </div>

                <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                    High Priority Gaps
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#D4A559] mt-0.5">
                    {openHighCount}
                  </span>
                  <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                    {openHighCount === 0 ? "all resolved" : "security & access gaps"}
                  </span>
                </div>

                <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-medium text-[#9096A0] uppercase tracking-wider">
                    Audit Status
                  </span>
                  <span className="text-sm font-bold font-mono text-white mt-1">
                    {activeDocInfo.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#5C636E] mt-0.5">
                    verified by Gemini 2.5 Pro
                  </span>
                </div>
              </div>
            );
          })()}

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
                    ? "All Remediated"
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
                    <div className="p-5 flex flex-col justify-between bg-[#171B1F]">
                      <div className="space-y-3">
                        <div className="flex items-center text-[11px] font-mono font-bold uppercase tracking-wider text-[#E06C5D]">
                          <span>Identified Analysis</span>
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#2A3038] text-xs text-[#B8BDC7] font-mono italic leading-relaxed">
                          "{finding.evidenceQuote}"
                        </div>

                        <p className="text-xs text-[#9096A0] leading-relaxed">
                          {finding.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3.5 flex items-center justify-between text-xs font-mono border-t border-[#2A3038]/60 min-h-[44px]">
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
                    <div className="p-5 flex flex-col justify-between bg-[#14181C]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#3B8F6B]">
                          <span>Recommended</span>
                          {editingFindingId !== finding.id ? (
                            <button
                              onClick={() => {
                                setEditingFindingId(finding.id);
                                setEditedPatchText(finding.remediationSuggestion);
                              }}
                              className="text-[10px] text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                            >
                              <span>✏️ edit</span>
                            </button>
                          ) : null}
                        </div>

                        {editingFindingId === finding.id ? (
                          <div className="space-y-2 animate-in fade-in duration-200">
                            <textarea
                              value={editedPatchText}
                              onChange={(e) => setEditedPatchText(e.target.value)}
                              rows={4}
                              className="w-full p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingFindingId(null)}
                                className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (onUpdateRemediationSuggestion) {
                                    onUpdateRemediationSuggestion(finding.id, editedPatchText);
                                  }
                                  setEditingFindingId(null);
                                }}
                                className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-xs text-white font-mono leading-relaxed">
                            {finding.remediationSuggestion}
                          </div>
                        )}

                        {finding.criticVerdict && (
                          <div className="p-2.5 rounded bg-[#0D1013]/60 border border-[#2A3038] text-[11px] text-[#9096A0]">
                            <strong className="text-[#3B8F6B] font-mono">Critic Verdict (Gemini 2.5 Pro):</strong>{" "}
                            {finding.criticVerdict}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-3.5 flex items-center justify-between text-xs font-mono border-t border-[#2A3038]/60 min-h-[44px]">
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
                            ? "Remediated"
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
        onApproveDocument={() => {
          if (onApproveDocument) {
            onApproveDocument(activeDoc.id);
          } else {
            docFindings.forEach((f) => {
              if (f.status !== "RESOLVED") {
                onApplyRemediation(f);
              }
            });
          }
        }}
        onUpdateRemediationSuggestion={onUpdateRemediationSuggestion}
      />
    </div>
  );
}
