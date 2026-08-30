"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopHeader } from "@/components/navigation/top-header";
import { MetricsHeader } from "@/components/investigation/metrics-header";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";
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
import { DemoFlowController } from "@/components/demo/demo-flow-controller";
import { ComplianceReportView } from "@/components/reports/compliance-report-view";
import { 
  MOCK_AGENTS, 
  MOCK_INVESTIGATIONS, 
  MOCK_FINDINGS, 
  MOCK_TRUST_GRAPH_INITIAL 
} from "@/lib/mock-data";
import { Investigation, InvestigationStatus, Finding } from "@/lib/types";
import { TrustGraphData } from "@/lib/api/client";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [investigations, setInvestigations] = useState<Investigation[]>(MOCK_INVESTIGATIONS);
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation>(MOCK_INVESTIGATIONS[0]);
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [graphData, setGraphData] = useState<TrustGraphData>(MOCK_TRUST_GRAPH_INITIAL);
  const [pipelineStatus, setPipelineStatus] = useState<InvestigationStatus>("COMPLETED");
  
  // Demo Flow state
  const [demoStep, setDemoStep] = useState(1);
  const [showDemoController, setShowDemoController] = useState(true);

  // Modals & Drawers state
  const [selectedFindingForEvidence, setSelectedFindingForEvidence] = useState<Finding | null>(null);
  const [selectedFindingForRemediation, setSelectedFindingForRemediation] = useState<Finding | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDriftActive, setIsDriftActive] = useState(false);

  const handleStartInvestigation = (data: { fileName: string; content: string; frameworks: string[] }) => {
    const newId = `INV-2024-00${investigations.length + 48}`;
    const newInv: Investigation = {
      id: newId,
      title: `Audit: ${data.fileName}`,
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
    }, 1000);

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
    }, 2500);

    setTimeout(() => {
      setPipelineStatus("COMPLETED");
      setAgents((prev) => prev.map((a) => ({ ...a, status: "COMPLETED" })));
      setDemoStep(2);
    }, 4000);
  };

  const handleDemoStepChange = (step: number) => {
    setDemoStep(step);
    if (step === 1) {
      setActiveTab("new-investigation");
    } else if (step === 2) {
      setActiveTab("dashboard");
    } else if (step === 3) {
      setActiveTab("remediation");
      handleDriftTriggered({
        framework: "GDPR",
        version: "v2.0-2026",
        description: "Maximum retention timeframe reduced to 2 years (Art. 5(1)(e) GDPR v2).",
        invalidatedNodeIds: ["req-gdpr-5", "ev-prazo-90dias", "find-02-node"],
      });
    } else if (step === 4) {
      setActiveTab("report");
    }
  };

  const handleResetDemo = () => {
    setDemoStep(1);
    setIsDriftActive(false);
    setGraphData(MOCK_TRUST_GRAPH_INITIAL);
    setFindings(MOCK_FINDINGS);
    setActiveTab("overview");
  };

  const handleDriftTriggered = (scenario: {
    framework: string;
    version: string;
    description: string;
    invalidatedNodeIds: string[];
  }) => {
    setIsDriftActive(true);

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

    setFindings((prev) =>
      prev.map((f) =>
        f.id === "FIND-02"
          ? {
              ...f,
              status: "REOPENED_DRIFT",
              description:
                "POLICY DRIFT ALERT: GDPR v2 reduced maximum retention to 2 years. Contractual 5-year retention is now an immediate statutory violation.",
              severity: "CRITICAL",
            }
          : f
      )
    );
  };

  const handleResetDrift = () => {
    setIsDriftActive(false);
    setGraphData(MOCK_TRUST_GRAPH_INITIAL);
    setFindings(MOCK_FINDINGS);
  };

  const handleApplyRemediation = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: "RESOLVED" } : f))
    );
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id.includes("find-02") ? { ...n, valid: true, invalidated_reason: null, affected_by_change: false } : n
      ),
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1013]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader currentInvestigationId={currentInvestigation.id} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Demo Controller (only on detailed tabs, excluded from Overview) */}
          {showDemoController && activeTab !== "overview" && (
            <DemoFlowController
              currentStep={demoStep}
              onStepChange={handleDemoStepChange}
              onReset={handleResetDemo}
            />
          )}

          {/* Top Metrics on Detailed Tabs */}
          {activeTab !== "overview" && <MetricsHeader />}

          {/* TAB 0: OVERVIEW (HOME PAGE - BIG NUMBERS ONLY) */}
          {activeTab === "overview" && (
            <DashboardHub onNavigate={setActiveTab} />
          )}

          {/* TAB 1: INVESTIGATIONS */}
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

          {/* TAB 2: NEW INVESTIGATION */}
          {activeTab === "new-investigation" && (
            <div className="py-2">
              <Dropzone onStartInvestigation={handleStartInvestigation} />
            </div>
          )}

          {/* TAB 3: DASHBOARD & AGENTS & TRUST GRAPH */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stepper */}
              <PipelineStepper currentStatus={pipelineStatus} />

              {/* Document Overview */}
              <div className="bg-[#171B1F] border border-[#2A3038] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base tracking-tight">
                      {currentInvestigation.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                      {currentInvestigation.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#9096A0] font-mono mt-1">
                    SHA-256 Hash: {currentInvestigation.documentHash}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDemoStepChange(3)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#B8843A]/15 hover:bg-[#B8843A]/25 text-[#D4A559] border border-[#B8843A]/30 transition-colors"
                  >
                    Simulate Regulatory Change (Drift)
                  </button>
                </div>
              </div>

              {/* Trust & Compliance Graph */}
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

              {/* Adversarial Review */}
              <AdversarialReviewCard />

              {/* Findings Panel */}
              <FindingsPanel
                findings={findings}
                onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
                onApplyRemediation={(f) => setSelectedFindingForRemediation(f)}
              />

              {/* Specialist Agent Fleet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Specialist Agent Fleet
                    </h3>
                    <p className="text-xs text-[#9096A0]">
                      Gemma 2B (PII), Gemini 1.5 Flash (Specialists) & Gemini 2.5 Pro (Adversarial Critic)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#9096A0] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B8F6B]" />
                    <span>5 Provisioned Agents</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMEDIATION & CHANGE (POLICY DRIFT) */}
          {activeTab === "remediation" && (
            <div className="space-y-6">
              <PolicyDriftPanel
                onDriftTriggered={handleDriftTriggered}
                onReset={handleResetDrift}
                isDriftActive={isDriftActive}
              />

              <TrustGraphViewer
                graphData={graphData}
                onNodeSelect={(node) => setSelectedNodeId(node.id)}
                selectedNodeId={selectedNodeId}
                isDrifting={isDriftActive}
              />

              <FindingsPanel
                findings={findings.filter((f) => isDriftActive ? f.status === "REOPENED_DRIFT" || f.severity === "CRITICAL" : true)}
                onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
                onApplyRemediation={(f) => setSelectedFindingForRemediation(f)}
              />
            </div>
          )}

          {/* TAB 5: FINAL REPORT */}
          {activeTab === "report" && (
            <ComplianceReportView
              investigation={currentInvestigation}
              findings={findings}
              graphData={graphData}
            />
          )}
        </main>
      </div>

      {/* Source Viewer Drawer */}
      <SourceDocumentViewer
        finding={selectedFindingForEvidence}
        onClose={() => setSelectedFindingForEvidence(null)}
      />

      {/* Remediation Modal */}
      <RemediationModal
        finding={selectedFindingForRemediation}
        onClose={() => setSelectedFindingForRemediation(null)}
        onApply={handleApplyRemediation}
      />
    </div>
  );
}
