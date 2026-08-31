"use client";

import React, { useState } from "react";
import { Finding, Investigation, AgentInfo } from "@/lib/types";
import { TrustGraphData } from "@/lib/api/client";
import { printDocumentAsPdf } from "@/components/evidence/remediated-document-viewer";
import { cn } from "@/lib/utils";
import {
  Download,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileText,
  Scale,
  Bot,
  Zap,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface RegulatoryScenario {
  id: string;
  framework: string;
  badge: string;
  version: string;
  title: string;
  changeSummary: string;
  affectedClause: string;
  currentClauseText: string;
  remediatedClauseText: string;
  legalAnalysis: string;
  specialistAgent: string;
  invalidatedNodeIds: string[];
}

const REGULATORY_SCENARIOS: RegulatoryScenario[] = [
  {
    id: "gdpr-2026",
    framework: "GDPR",
    badge: "European Union",
    version: "v2.0-2026",
    title: "GDPR Art. 5(1)(e) — Statutory Storage Limitation Revision",
    changeSummary: "Data retention window for customer logs reduced from 5 years to a maximum ceiling of 2 years.",
    affectedClause: "§ 2.1 Customer Data Retention Timeframe",
    currentClauseText: "Customer records, transactional history, and personal identifier logs shall be retained for an operational duration of five (5) years following account deactivation.",
    remediatedClauseText: "Customer records, transactional history, and personal identifier logs shall be retained for a maximum duration of two (2) years following account deactivation, in strict accordance with GDPR Art. 5(1)(e) (2026 Statutory Revision).",
    legalAnalysis: "The existing 5-year retention period violates the updated Art. 5(1)(e) ceiling. Failure to amend exposes the organization to statutory enforcement fines under GDPR Art. 83.",
    specialistAgent: "GDPR Specialist (Gemini 3.6 Flash)",
    invalidatedNodeIds: ["req-gdpr-5", "ev-prazo-90dias", "find-02-node"],
  },
  {
    id: "lgpd-2026",
    framework: "LGPD",
    badge: "Brazil (ANPD)",
    version: "Resolução CD/ANPD nº 18/2026",
    title: "LGPD Art. 16 — Encerramento de Tratamento de Dados Biométricos",
    changeSummary: "Prazo obrigatório de descarte definitivo de dados biométricos e sensíveis fixado em até 90 dias após rescisão.",
    affectedClause: "§ 4.2 Eliminação e Término do Tratamento",
    currentClauseText: "Dados cadastrais e registros biométricos de colaboradores e prestadores serão armazenados por tempo indeterminado para fins de histórico e segurança patrimonial.",
    remediatedClauseText: "Dados cadastrais e registros biométricos de colaboradores e prestadores serão descartados definitivamente no prazo improrrogável de até 90 (noventa) dias após a rescisão contratual, conforme Art. 16 da LGPD e Resolução ANPD 18/2026.",
    legalAnalysis: "Armazenamento por tempo indeterminado de biometria é considerado prática de alto risco e violação direta do princípio da necessidade (Art. 6º, III) e término de tratamento (Art. 16).",
    specialistAgent: "LGPD Specialist (Gemini 3.6 Flash)",
    invalidatedNodeIds: ["req-lgpd-16", "ev-seguranca", "find-01-node"],
  },
  {
    id: "iso-2025",
    framework: "ISO 27001",
    badge: "ISO/IEC 27001:2025",
    version: "Standard Rev 2025",
    title: "Controle A.8.10 — Descarte Criptográfico Obrigatório",
    changeSummary: "Exigência de criptografia e sanitização em repouso de mídias de armazenamento com logs auditáveis.",
    affectedClause: "§ 5.1 Descarte e Higienização de Mídias",
    currentClauseText: "Mídias de armazenamento e backups descontinuados serão descartados fisicamente conforme disponibilidade da equipe técnica interna.",
    remediatedClauseText: "Mídias de armazenamento e volumes de nuvem descontinuados serão submetidos a apagamento criptográfico com chave descartada e certificação de sanitização conforme Controle A.8.10 da ISO/IEC 27001:2025.",
    legalAnalysis: "O procedimento de descarte físico não padronizado não atende aos novos controles rigorosos de higienização de dados em ambientes multilocatários.",
    specialistAgent: "ISO Specialist (Gemini 3.6 Flash)",
    invalidatedNodeIds: ["req-iso-a810", "ev-descarte", "find-03-node"],
  },
];

interface RemediationDriftViewProps {
  investigations: Investigation[];
  currentInvestigation: Investigation;
  findings: Finding[];
  agents: AgentInfo[];
  graphData: TrustGraphData;
  isDriftActive: boolean;
  onDriftTriggered: (scenario: {
    framework: string;
    version: string;
    description: string;
    invalidatedNodeIds: string[];
  }) => void;
  onResetDrift: () => void;
  onApplyRemediation: (finding: Finding) => void;
  onApproveDocument?: (invId: string) => void;
  onOpenEvidence?: (finding: Finding) => void;
  onNavigateToTrustGraph?: (docId?: string) => void;
}

export function RemediationDriftView({
  investigations,
  currentInvestigation,
  findings,
  agents,
  isDriftActive,
  onDriftTriggered,
  onResetDrift,
  onApplyRemediation,
  onApproveDocument,
  onOpenEvidence,
  onNavigateToTrustGraph,
}: RemediationDriftViewProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("gdpr-2026");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApplyingPatch, setIsApplyingPatch] = useState(false);
  const [remediationApplied, setRemediationApplied] = useState(false);

  const currentScenario =
    REGULATORY_SCENARIOS.find((s) => s.id === selectedScenarioId) || REGULATORY_SCENARIOS[0];

  // Documento principal para o comparativo
  const activeDoc =
    investigations.find((inv) => inv.id === currentInvestigation.id) ||
    investigations[0] ||
    currentInvestigation;

  // Finding principal do cenário
  const targetFinding =
    findings.find((f) => f.framework === currentScenario.framework) ||
    findings[0];

  const handleSimulateScenario = () => {
    setIsSimulating(true);
    setRemediationApplied(false);

    setTimeout(() => {
      onDriftTriggered({
        framework: currentScenario.framework,
        version: currentScenario.version,
        description: currentScenario.changeSummary,
        invalidatedNodeIds: currentScenario.invalidatedNodeIds,
      });
      setIsSimulating(false);
    }, 900);
  };

  const handleApplyAutomatedPatch = (invId?: string) => {
    setIsApplyingPatch(true);

    setTimeout(() => {
      if (targetFinding) {
        onApplyRemediation({
          ...targetFinding,
          remediationSuggestion: currentScenario.remediatedClauseText,
        });
      }

      if (onApproveDocument) {
        onApproveDocument(invId || activeDoc.id);
      }

      setIsApplyingPatch(false);
      setRemediationApplied(true);
    }, 900);
  };

  const isCompliant = !isDriftActive || remediationApplied;

  return (
    <div className="space-y-8 w-full">
      {/* Header Principal Padronizado */}
      <div className="pb-3 border-b border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Continuous Regulatory Monitoring & Document Remediation Pipeline
          </h2>
          <p className="text-xs text-[#9096A0] mt-0.5 max-w-4xl">
            Simulate statutory legal changes in real time. The multi-agent mesh detects non-compliant clauses across your policy repository, computes the blast radius, and prepares verified legal patches ready for execution or deep inspection in the Trust Graph.
          </p>
        </div>

        {isDriftActive && (
          <div className="shrink-0">
            <button
              onClick={() => {
                onResetDrift();
                setRemediationApplied(false);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ETAPA 1: SELEÇÃO DA LEI OU REGULAMENTAÇÃO ATUALIZADA                      */}
      {/* ========================================================================= */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A3038] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 flex items-center justify-center text-xs font-mono font-bold">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 1: Select or Simulate Updated Legislation
              </h2>
              <p className="text-xs text-[#9096A0] mt-0.5">
                Choose a regulatory change event published by global or local data protection authorities:
              </p>
            </div>
          </div>
        </div>

        {/* Grade de Cenários Regulatórios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {REGULATORY_SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={cn(
                  "p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 text-left group",
                  isSelected
                    ? "bg-[#1C2228] border-[#B8843A] shadow-lg shadow-black/40"
                    : "bg-[#12161A] border-[#2A3038] hover:border-[#3A434F]"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                      {sc.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#9096A0]">{sc.version}</span>
                  </div>
                  <h3 className="font-bold text-xs text-white group-hover:text-[#B8843A] transition-colors leading-snug">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-[#9096A0] leading-relaxed">
                    {sc.changeSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2A3038]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#B8BDC7]">{sc.framework} Specialist</span>
                  <span className={isSelected ? "text-[#D4A559] font-bold" : "text-[#5C636E]"}>
                    {isSelected ? "● Selected" : "Select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Disparo da Simulação */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12161A] p-4 rounded-xl border border-[#2A3038]">
          <div className="flex items-center gap-2.5 text-xs text-[#B8BDC7]">
            <Scale className="w-4 h-4 text-[#B8843A] shrink-0" />
            <span>
              Triggering this event publishes <strong>{currentScenario.title}</strong> to the AEGIS webhook mesh.
            </span>
          </div>

          <button
            onClick={handleSimulateScenario}
            disabled={isSimulating}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-2 shrink-0",
              isSimulating
                ? "bg-[#21262B] text-[#9096A0] cursor-wait"
                : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013]"
            )}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Regulatory Dispatch...</span>
              </>
            ) : (
              <span>Simulate Regulatory Change ({currentScenario.framework})</span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ETAPA 2: AGENTES ESPECIALISTAS ACIONADOS SELETIVAMENTE                    */}
      {/* ========================================================================= */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A3038] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 flex items-center justify-center text-xs font-mono font-bold">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 2: Selective Multi-Agent Orchestration & Token Savings
              </h2>
              <p className="text-xs text-[#9096A0] mt-0.5">
                The Trust Graph selectively executes only the specialist agents required for this statutory delta:
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#3B8F6B] bg-[#3B8F6B]/10 px-3 py-1 rounded-full border border-[#3B8F6B]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>65% Token & Cost Reduction</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agente 1: Framework Specialist */}
          <div className="p-4 rounded-xl bg-[#12161A] border border-[#2A3038] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4C8FA6]/20 text-[#7EB5CC] border border-[#4C8FA6]/40 font-bold">
                1. Framework Specialist
              </span>
              <span className="text-[10px] font-mono text-[#9096A0]">420ms</span>
            </div>
            <h3 className="text-xs font-bold text-white font-mono">{currentScenario.specialistAgent}</h3>
            <p className="text-[11px] text-[#9096A0] leading-relaxed">
              Parsed legal article delta and identified non-compliant parameters within the corporate policy clause.
            </p>
          </div>

          {/* Agente 2: Evidence Critic */}
          <div className="p-4 rounded-xl bg-[#12161A] border border-[#2A3038] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 font-bold">
                2. Adversarial Auditor
              </span>
              <span className="text-[10px] font-mono text-[#9096A0]">850ms</span>
            </div>
            <h3 className="text-xs font-bold text-white font-mono">Evidence Critic (Gemini 2.5 Pro)</h3>
            <p className="text-[11px] text-[#9096A0] leading-relaxed">
              Deep reasoning red-team review contested prior compliance certification and flagged 3 invalidated DAG nodes.
            </p>
          </div>

          {/* Agente 3: Remediation Engine */}
          <div className="p-4 rounded-xl bg-[#12161A] border border-[#2A3038] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B8F6B]/20 text-[#3B8F6B] border border-[#3B8F6B]/40 font-bold">
                3. Remediation Engine
              </span>
              <span className="text-[10px] font-mono text-[#9096A0]">310ms</span>
            </div>
            <h3 className="text-xs font-bold text-white font-mono">Policy Remediation (Gemini 3.6 Flash)</h3>
            <p className="text-[11px] text-[#9096A0] leading-relaxed">
              Synthesized compliant contractual amendment wording ready for immediate one-click execution.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ETAPA 3: PARECER JURÍDICO & COMPARATIVO DE CLÁUSULA DA IA                 */}
      {/* ========================================================================= */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#2A3038] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 flex items-center justify-center text-xs font-mono font-bold">
              3
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 3: Statutory Gap & Proposed AI Remediation Patch
              </h2>
              <p className="text-xs text-[#9096A0] mt-0.5">
                Detailed legal diagnosis and side-by-side clause amendment generated by the Remediation Agent:
              </p>
            </div>
          </div>
        </div>

        {/* Parecer Jurídico do Agente */}
        <div className="p-4 rounded-lg bg-[#0D1013] border border-[#2A3038] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4A559] font-mono">
            <Bot className="w-4 h-4 text-[#B8843A]" />
            <span>AI Legal Diagnosis ({currentScenario.affectedClause}):</span>
          </div>
          <p className="text-xs text-[#B8BDC7] leading-relaxed">
            {currentScenario.legalAnalysis}
          </p>
        </div>

        {/* Comparativo de Cláusula: Antiga vs Nova */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Texto Antigo (Não conforme) */}
          <div className="p-4 rounded-xl bg-[#12161A] border border-[#A24438]/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#E06C5D]">
              <span>Original Non-Compliant Clause</span>
              <span className="text-[10px] uppercase">Violated</span>
            </div>
            <p className="text-xs text-[#9096A0] italic bg-[#0D1013] p-3.5 rounded-lg border border-[#2A3038] leading-relaxed font-mono">
              "{currentScenario.currentClauseText}"
            </p>
          </div>

          {/* Texto Novo (Corrigido pela IA) */}
          <div className="p-4 rounded-xl bg-[#12161A] border border-[#3B8F6B]/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#3B8F6B]">
              <span>AI-Generated Statutory Patch (Gemini 3.6 Flash)</span>
              <span className="text-[10px] uppercase">100% Compliant</span>
            </div>
            <p className="text-xs text-white italic bg-[#0D1013] p-3.5 rounded-lg border border-[#3B8F6B]/30 leading-relaxed font-mono">
              "{currentScenario.remediatedClauseText}"
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ETAPA 4: LISTA DE DOCUMENTOS IMPACTADOS & DIRECIONAMENTO PARA TRUST GRAPH */}
      {/* ========================================================================= */}
      <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-6 space-y-5">
        <div className="border-b border-[#2A3038] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#B8843A]/20 text-[#D4A559] border border-[#B8843A]/40 flex items-center justify-center text-xs font-mono font-bold">
              4
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 4: Impacted Documents Repository & Deep Graph Audit
              </h2>
              <p className="text-xs text-[#9096A0] mt-0.5">
                Click on any document in the list to open and inspect its interactive Trust Graph & Agents analysis:
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-3">
          {investigations.map((inv) => {
            const isTarget = inv.id === activeDoc.id || inv.id === "INV-2024-0047";
            const isFullyApproved =
              inv.status === "COMPLETED" &&
              (!isDriftActive || (isTarget && remediationApplied));

            return (
              <div
                key={inv.id}
                onClick={() => onNavigateToTrustGraph && onNavigateToTrustGraph(inv.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group",
                  isFullyApproved
                    ? "bg-[#12161A] border-[#2A3038] hover:border-[#3B8F6B]/60 hover:bg-[#151A1E]"
                    : "bg-[#1C1717] border-[#A24438]/40 hover:border-[#A24438] hover:bg-[#201919]"
                )}
              >
                {/* Informações do Documento */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg border shrink-0",
                    isFullyApproved
                      ? "bg-[#3B8F6B]/10 border-[#3B8F6B]/30 text-[#3B8F6B]"
                      : "bg-[#A24438]/15 border-[#A24438]/30 text-[#E06C5D]"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-xs text-white group-hover:text-[#B8843A] transition-colors">
                        {inv.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#9096A0] border border-[#2A3038]">
                        {inv.id}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9096A0] font-mono">
                      File: {inv.documentName} · Impact: {isTarget ? currentScenario.affectedClause : "General Compliance Review"}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        printDocumentAsPdf(inv, findings, false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#B8843A] hover:text-[#CCA159] border border-[#2A3038] hover:border-[#B8843A] transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Download Document PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4C8FA6] group-hover:text-white transition-colors flex items-center">
                      <span>Access analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
