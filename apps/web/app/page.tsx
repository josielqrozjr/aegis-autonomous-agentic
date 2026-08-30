"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopHeader } from "@/components/navigation/top-header";
import { MetricsHeader } from "@/components/investigation/metrics-header";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";
import { Dropzone } from "@/components/upload/dropzone";
import { PipelineStepper } from "@/components/investigation/pipeline-stepper";
import { InvestigationsTable } from "@/components/investigation/investigations-table";
import { TrustGraphTabView } from "@/components/trust-graph/trust-graph-tab-view";
import { TrustGraphViewer } from "@/components/trust-graph/trust-graph-viewer";
import { PolicyDriftPanel } from "@/components/drift/policy-drift-panel";
import { FindingsPanel } from "@/components/findings/findings-panel";
import { SourceDocumentViewer } from "@/components/evidence/source-document-viewer";
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

  // Dynamic Real Metrics
  const resolvedFindingsCount = findings.filter((f) => f.status === "RESOLVED").length;
  const activeAgentsCount = agents.filter((a) => a.status === "COMPLETED" || a.status === "RUNNING").length;

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

  const handleApplyRemediation = (findingOrId: Finding | string) => {
    const findingId = typeof findingOrId === "string" ? findingOrId : findingOrId.id;
    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingId
          ? { ...f, status: f.status === "RESOLVED" ? "OPEN" : "RESOLVED" }
          : f
      )
    );
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        const lowerId = findingId.toLowerCase().replace("-", "");
        if (n.id.toLowerCase().includes(lowerId) || (n.source && n.source.toLowerCase().includes(lowerId))) {
          return { ...n, valid: true, invalidated_reason: null, affected_by_change: false };
        }
        return n;
      }),
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1013]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header com título dinâmico */}
        <TopHeader currentInvestigationId={currentInvestigation.id} activeTab={activeTab} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Demo Controller (EXCLUSIVAMENTE na aba Investigations) */}
          {showDemoController && activeTab === "investigations" && (
            <DemoFlowController
              currentStep={demoStep}
              onStepChange={handleDemoStepChange}
              onReset={handleResetDemo}
            />
          )}

          {/* Top Metrics Header (EXCLUSIVAMENTE na aba Investigations) */}
          {activeTab === "investigations" && (
            <MetricsHeader
              onNavigate={setActiveTab}
              totalInvestigations={investigations.length}
              activeAgents={activeAgentsCount}
              findingsCount={findings.length}
              remediationsCount={resolvedFindingsCount}
            />
          )}

          {/* TAB 0: OVERVIEW (HOME PAGE - REAL BIG NUMBERS) */}
          {activeTab === "overview" && (
            <DashboardHub
              onNavigate={setActiveTab}
              investigationsCount={investigations.length}
              agentsCount={activeAgentsCount}
              findingsCount={findings.length}
              driftNodesCount={isDriftActive ? graphData.invalid_nodes : 3}
              compliancePercent={currentInvestigation.progressPercent}
            />
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

          {/* TAB 3: TRUST GRAPH & AGENTS (REDESIGNED TAB VIEW) */}
          {activeTab === "dashboard" && (
            <TrustGraphTabView
              investigations={investigations}
              currentInvestigation={currentInvestigation}
              onSelectInvestigation={(inv) => setCurrentInvestigation(inv)}
              findings={findings}
              agents={agents}
              graphData={graphData}
              isDriftActive={isDriftActive}
              selectedNodeId={selectedNodeId}
              onSelectNode={(node) => {
                setSelectedNodeId(node.id);
                if (node.type === "finding") {
                  const found = findings.find((f) => node.source.includes(f.id));
                  if (found) setSelectedFindingForEvidence(found);
                }
              }}
              onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
              onApplyRemediation={(f) => handleApplyRemediation(f)}
              onTriggerDrift={() =>
                handleDriftTriggered({
                  framework: "GDPR",
                  version: "v2.0-2026",
                  description:
                    "Maximum retention timeframe reduced to 2 years (Art. 5(1)(e) GDPR v2).",
                  invalidatedNodeIds: ["req-gdpr-5", "ev-prazo-90dias", "find-02-node"],
                })
              }
              onResetDrift={handleResetDrift}
            />
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
