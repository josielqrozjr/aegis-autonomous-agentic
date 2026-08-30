"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopHeader } from "@/components/navigation/top-header";
import { MetricsHeader } from "@/components/investigation/metrics-header";
import { Dropzone } from "@/components/upload/dropzone";
import { PipelineStepper } from "@/components/investigation/pipeline-stepper";
import { AgentCard } from "@/components/agents/agent-card";
import { InvestigationsTable } from "@/components/investigation/investigations-table";
import { TrustGraphViewer } from "@/components/trust-graph/trust-graph-viewer";
import { PolicyDriftPanel } from "@/components/drift/policy-drift-panel";
import { FindingsPanel } from "@/components/findings/findings-panel";
import { SourceDocumentViewer } from "@/components/evidence/source-document-viewer";
import { AdversarialReviewCard } from "@/components/audit/adversarial-review-card";
import { RemediationModal } from "@/components/remediation/remediation-modal";
import { 
  MOCK_AGENTS, 
  MOCK_INVESTIGATIONS, 
  MOCK_FINDINGS, 
  MOCK_TRUST_GRAPH_INITIAL 
} from "@/lib/mock-data";
import { Investigation, InvestigationStatus, Finding } from "@/lib/types";
import { TrustGraphData, TrustGraphNode } from "@/lib/api/client";
import { 
  FileText, 
  Play, 
  Layers, 
  Radio, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("investigations");
  const [investigations, setInvestigations] = useState<Investigation[]>(MOCK_INVESTIGATIONS);
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation>(MOCK_INVESTIGATIONS[0]);
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [graphData, setGraphData] = useState<TrustGraphData>(MOCK_TRUST_GRAPH_INITIAL);
  const [pipelineStatus, setPipelineStatus] = useState<InvestigationStatus>("COMPLETED");
  
  // Modals & Drawers state
  const [selectedFindingForEvidence, setSelectedFindingForEvidence] = useState<Finding | null>(null);
  const [selectedFindingForRemediation, setSelectedFindingForRemediation] = useState<Finding | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDriftActive, setIsDriftActive] = useState(false);

  const handleStartInvestigation = (data: { fileName: string; content: string; frameworks: string[] }) => {
    const newId = `INV-2024-00${investigations.length + 48}`;
    const newInv: Investigation = {
      id: newId,
      title: `Auditoria de Conformidade: ${data.fileName}`,
      documentName: data.fileName,
      documentHash: "a7b3c2d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      fileSizeBytes: data.content.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNDERSTANDING",
      progressPercent: 20,
      frameworks: data.frameworks,
      findingsCount: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    };

    setInvestigations([newInv, ...investigations]);
    setCurrentInvestigation(newInv);
    setPipelineStatus("UNDERSTANDING");
    setActiveTab("dashboard");

    setTimeout(() => {
      setPipelineStatus("PLANNING");
      setAgents((prev) =>
        prev.map((a) => (a.id === "pii-scanner" ? { ...a, status: "RUNNING" } : a))
      );
    }, 1200);

    setTimeout(() => {
      setPipelineStatus("INVESTIGATING");
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "pii-scanner"
            ? { ...a, status: "COMPLETED" }
            : a.id.includes("specialist")
            ? { ...a, status: "RUNNING" }
            : a
        )
      );
    }, 2800);

    setTimeout(() => {
      setPipelineStatus("COMPLETED");
      setAgents((prev) => prev.map((a) => ({ ...a, status: "COMPLETED" })));
    }, 4500);
  };

  // Disparo da simulação de Policy Drift (Efeito Cascata no Trust Graph)
  const handleDriftTriggered = (scenario: {
    framework: string;
    version: string;
    description: string;
    invalidatedNodeIds: string[];
  }) => {
    setIsDriftActive(true);

    // Efeito cascata nos nós do grafo
    setGraphData((prev) => ({
      ...prev,
      invalid_nodes: scenario.invalidatedNodeIds.length,
      valid_nodes: prev.total_nodes - scenario.invalidatedNodeIds.length,
      nodes: prev.nodes.map((node) => {
        if (scenario.invalidatedNodeIds.includes(node.id)) {
          return {
            ...node,
            valid: false,
            invalidated_reason: scenario.description,
            affected_by_change: true,
          };
        }
        return node;
      }),
    }));

    // Reabertura do finding afetado
    setFindings((prev) =>
      prev.map((f) =>
        f.id === "FIND-02"
          ? {
              ...f,
              status: "REOPENED_DRIFT",
              description:
                "ALERTA DE DRIFT: O GDPR v2 reduziu o prazo máximo para 2 anos. O período contratual de 5 anos se tornou uma violação imediata.",
              severity: "CRITICAL",
            }
          : f
      )
    );
  };

  // Restaurar estado original do grafo
  const handleResetDrift = () => {
    setIsDriftActive(false);
    setGraphData(MOCK_TRUST_GRAPH_INITIAL);
    setFindings(MOCK_FINDINGS);
  };

  // Aplicar remediação
  const handleApplyRemediation = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: "RESOLVED" } : f))
    );
    // Se o nó correspondente estiver no grafo, revalidar
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id.includes("find-02") ? { ...n, valid: true, invalidated_reason: null, affected_by_change: false } : n
      ),
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080b11]">
      {/* Sidebar Lateral fixa */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader currentInvestigationId={currentInvestigation.id} />

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Métricas Superiores */}
          <MetricsHeader />

          {/* TAB 1: INVESTIGAÇÕES */}
          {activeTab === "investigations" && (
            <InvestigationsTable
              investigations={investigations}
              onSelect={(inv) => {
                setCurrentInvestigation(inv);
                setActiveTab("dashboard");
              }}
              onNew={() => setActiveTab("new-investigation")}
            />
          )}

          {/* TAB 2: NOVA INVESTIGAÇÃO (UPLOAD DRAG-AND-DROP) */}
          {activeTab === "new-investigation" && (
            <div className="py-2">
              <Dropzone onStartInvestigation={handleStartInvestigation} />
            </div>
          )}

          {/* TAB 3: DASHBOARD & AGENTES & TRUST GRAPH */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Barra de Progresso dos Estágios */}
              <PipelineStepper currentStatus={pipelineStatus} />

              {/* Informações do Documento sob Auditoria */}
              <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base tracking-tight">
                        {currentInvestigation.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300 border border-blue-500/30">
                        {currentInvestigation.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Hash SHA-256: {currentInvestigation.documentHash}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("remediation")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Simular Mudança Regulatória (Drift)
                  </button>
                </div>
              </div>

              {/* O Grafo de Confiança (Trust & Compliance Graph) */}
              <TrustGraphViewer
                graphData={graphData}
                onNodeSelect={(node) => {
                  setSelectedNodeId(node.id);
                  if (node.type === "finding") {
                    const found = findings.find((f) => node.source.includes(f.id));
                    if (found) setSelectedFindingForEvidence(found);
                  }
                }}
                selectedNodeId={selectedNodeId}
                isDrifting={isDriftActive}
              />

              {/* Camada de Revisão Adversarial (Evidence Critic) */}
              <AdversarialReviewCard />

              {/* Painel de Apontamentos & Findings com Citações e Hashes */}
              <FindingsPanel
                findings={findings}
                onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
                onApplyRemediation={(f) => setSelectedFindingForRemediation(f)}
              />

              {/* Grid dos Agentes Especialistas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Painel de Atividade dos Agentes Especialistas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Orquestração multiagente: Gemma (PII), Gemini Flash (Especialistas) e Gemini Pro (Adversarial Critic)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>5 Agentes Provisionados</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMEDIAÇÃO & MUDANÇA (POLICY DRIFT) */}
          {activeTab === "remediation" && (
            <div className="space-y-6">
              {/* Painel de Disparo de Mudança */}
              <PolicyDriftPanel
                onDriftTriggered={handleDriftTriggered}
                onReset={handleResetDrift}
                isDriftActive={isDriftActive}
              />

              {/* Visualização do Grafo de Confiança com Efeito Cascata */}
              <TrustGraphViewer
                graphData={graphData}
                onNodeSelect={(node) => setSelectedNodeId(node.id)}
                selectedNodeId={selectedNodeId}
                isDrifting={isDriftActive}
              />

              {/* Apontamentos Reabertos pós Drift */}
              <FindingsPanel
                findings={findings.filter((f) => isDriftActive ? f.status === "REOPENED_DRIFT" || f.severity === "CRITICAL" : true)}
                onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
                onApplyRemediation={(f) => setSelectedFindingForRemediation(f)}
              />
            </div>
          )}

          {/* TAB 5: RELATÓRIO FINAL */}
          {activeTab === "report" && (
            <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-8 max-w-3xl mx-auto space-y-6 my-4">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Dossiê de Conformidade Regulatória</h3>
                  <p className="text-xs text-slate-400 mt-0.5">AEGIS Compliance Engine · ID: INV-2024-0047</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Certificado Válido
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#111726] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Grafo de Confiança</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {graphData.valid_nodes}/{graphData.total_nodes} Válidos
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#111726] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Revisão Adversarial</span>
                  <span className="text-lg font-bold font-mono text-purple-400">Gemini 2.5 Pro</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111726] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Hashes de Prova</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">100% Auditados</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#080b11] border border-slate-800 space-y-2 text-xs text-slate-300">
                <p className="font-semibold text-white">Resumo Executivo de Auditoria:</p>
                <p>
                  O documento <strong>politica_retencao_dados_v2.pdf</strong> foi submetido à análise autônoma de 4 especialistas regulatórios (LGPD, GDPR, ISO 27001 e Gemma PII Scanner), tendo cada apontamento validado pelo Evidence Critic.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Gaveta Lateral de Visualização do Documento Fonte com Destaque */}
      <SourceDocumentViewer
        finding={selectedFindingForEvidence}
        onClose={() => setSelectedFindingForEvidence(null)}
      />

      {/* Modal de Remediação */}
      <RemediationModal
        finding={selectedFindingForRemediation}
        onClose={() => setSelectedFindingForRemediation(null)}
        onApply={handleApplyRemediation}
      />
    </div>
  );
}
