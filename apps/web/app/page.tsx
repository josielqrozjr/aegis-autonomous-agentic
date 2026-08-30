"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopHeader } from "@/components/navigation/top-header";
import { MetricsHeader } from "@/components/investigation/metrics-header";
import { Dropzone } from "@/components/upload/dropzone";
import { PipelineStepper } from "@/components/investigation/pipeline-stepper";
import { AgentCard } from "@/components/agents/agent-card";
import { InvestigationsTable } from "@/components/investigation/investigations-table";
import { MOCK_AGENTS, MOCK_INVESTIGATIONS } from "@/lib/mock-data";
import { Investigation, InvestigationStatus } from "@/lib/types";
import { ShieldCheck, Sparkles, RefreshCw, FileText, CheckCircle2, Play } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("investigations");
  const [investigations, setInvestigations] = useState<Investigation[]>(MOCK_INVESTIGATIONS);
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation>(MOCK_INVESTIGATIONS[0]);
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [pipelineStatus, setPipelineStatus] = useState<InvestigationStatus>("INVESTIGATING");

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

    // Simulação dos agentes trabalhando em cadeia
    setTimeout(() => {
      setPipelineStatus("PLANNING");
      setAgents((prev) =>
        prev.map((a) => (a.id === "pii-scanner" ? { ...a, status: "RUNNING" } : a))
      );
    }, 1500);

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
    }, 3500);
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

          {/* TAB 3: DASHBOARD & AGENTES (LIVE STATUS) */}
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
                    onClick={() => {
                      setPipelineStatus("ADVERSARIAL_REVIEW");
                      setAgents((prev) =>
                        prev.map((a) =>
                          a.id === "evidence-critic" ? { ...a, status: "RUNNING" } : a
                        )
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161f30] hover:bg-[#1f2c44] text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    Simular Próxima Etapa
                  </button>
                </div>
              </div>

              {/* Grid dos Agentes Especialistas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Painel de Atividade dos Agentes Especialistas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Monitoramento em tempo real da malha autônoma de raciocínio
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

          {/* TAB 4: REMEDIAÇÃO & MUDANÇA (POLICY DRIFT PREVIEW) */}
          {activeTab === "remediation" && (
            <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-8 text-center max-w-2xl mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Módulo de Mudança Regulatória (Policy Drift)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Este módulo do <strong>Dia 2</strong> simula alterações repentinas em normas (ex.: prazo do GDPR reduzido de 5 para 2 anos), disparando o recálculo do raio de impacto (*blast radius*) e o efeito cascata de invalidação no Trust Graph.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Voltar ao Dashboard de Agentes
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RELATÓRIO FINAL */}
          {activeTab === "report" && (
            <div className="bg-[#0d121d] border border-[#1e293b] rounded-xl p-8 text-center max-w-2xl mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Relatório de Conformidade Auditável</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Geração do dossiê final de auditoria com hashes de integridade, citações regulatórias exatas e certificados de conformidade do AEGIS.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
