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
import { RemediationDriftView } from "@/components/drift/remediation-drift-view";
import { DemoFlowController } from "@/components/demo/demo-flow-controller";
import { ComplianceReportView } from "@/components/reports/compliance-report-view";
import { 
  MOCK_AGENTS, 
  MOCK_INVESTIGATIONS, 
  MOCK_FINDINGS, 
  MOCK_TRUST_GRAPH_INITIAL 
} from "@/lib/mock-data";
import { Investigation, InvestigationStatus, Finding } from "@/lib/types";
import { 
  TrustGraphData, 
  uploadDocument, 
  createInvestigation, 
  runInvestigation, 
  fetchInvestigation, 
  fetchTrustGraph,
  fetchAgents,
  transformFinding, 
  transformInvestigation,
  transformAgents,
} from "@/lib/api/client";

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
  const activeDocFindings = findings.filter(
    (f) =>
      f.investigationId === currentInvestigation.id ||
      (!findings.some((x) => x.investigationId === currentInvestigation.id) &&
        f.investigationId === "INV-2024-0047")
  );
  const activeDocResolved = activeDocFindings.filter(
    (f) => f.status === "RESOLVED" || f.remediationStatus === "APPROVED" || f.remediationStatus === "APPLIED"
  ).length;
  const dynamicCompliancePercent = activeDocFindings.length > 0
    ? Math.round((activeDocResolved / activeDocFindings.length) * 100)
    : 100;
  const resolvedFindingsCount = findings.filter(
    (f) => f.status === "RESOLVED" || f.remediationStatus === "APPROVED" || f.remediationStatus === "APPLIED"
  ).length;
  const activeAgentsCount = agents.filter((a) => a.status === "COMPLETED" || a.status === "RUNNING").length;
  const realDriftCount = isDriftActive ? graphData.invalid_nodes : 0;

  const handleStartInvestigation = async (data: { fileName: string; content: string; frameworks: string[]; file?: File }) => {
    // Create a placeholder investigation for immediate UI feedback
    const placeholderId = `INV-${Date.now()}`;
    const placeholderInv: Investigation = {
      id: placeholderId,
      title: `Audit: ${data.fileName}`,
      documentName: data.fileName,
      documentHash: "computing...",
      fileSizeBytes: data.content.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNDERSTANDING",
      progressPercent: 10,
      frameworks: data.frameworks,
      findingsCount: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    };

    setInvestigations([placeholderInv, ...investigations]);
    setCurrentInvestigation(placeholderInv);
    setPipelineStatus("UNDERSTANDING");
    setActiveTab("dashboard");
    setAgents((prev) => prev.map((a) => ({ ...a, status: "IDLE" as const })));

    try {
      // 1. Upload document to API
      let fileToUpload: File;
      if (data.file) {
        fileToUpload = data.file;
      } else {
        fileToUpload = new File([data.content], data.fileName, { type: "text/plain" });
      }
      const uploadResult = await uploadDocument(fileToUpload);
      console.log("[AEGIS] Document uploaded:", uploadResult.id);

      // 2. Create investigation
      setPipelineStatus("PLANNING");
      setAgents((prev) => prev.map((a) => (a.id === "pii-scanner" ? { ...a, status: "RUNNING" as const } : a)));
      const invResult = await createInvestigation(`Audit: ${data.fileName}`, uploadResult.id);
      console.log("[AEGIS] Investigation created:", invResult.id);

      // 3. Run pipeline (real Gemini analysis)
      setPipelineStatus("INVESTIGATING");
      setAgents((prev) => prev.map((a) => a.id.includes("specialist") ? { ...a, status: "RUNNING" as const } : a));
      const runResult = await runInvestigation(invResult.id);
      console.log("[AEGIS] Pipeline completed:", runResult.final_status, "Steps:", runResult.steps_executed);

      // 4. Fetch full investigation with findings
      setPipelineStatus("ADVERSARIAL_REVIEW");
      setAgents((prev) => prev.map((a) => a.id === "evidence-critic" ? { ...a, status: "RUNNING" as const } : a));
      const fullInv = await fetchInvestigation(invResult.id);

      // 5. Transform and set real data
      const realFindings: Finding[] = (fullInv.findings || []).map((f: any) =>
        transformFinding(f, invResult.id)
      );

      // Add remediation suggestions from remediations
      if (fullInv.remediations) {
        for (const rem of fullInv.remediations) {
          const finding = realFindings.find((f) => f.id === rem.finding_id);
          if (finding) {
            finding.remediationSuggestion = rem.recommendation;
            finding.remediationStatus = "PROPOSED";
          }
        }
      }

      const realInvestigation = transformInvestigation(fullInv, data.fileName, data.content.length);

      // 6. Fetch trust graph
      const graphResult = await fetchTrustGraph(invResult.id);

      // 7. Fetch agents
      try {
        const agentsResult = await fetchAgents();
        if (agentsResult.agents) {
          setAgents(transformAgents(agentsResult.agents));
        }
      } catch { /* keep existing agents */ }

      // 8. Update UI with real data
      setFindings(realFindings);
      setCurrentInvestigation(realInvestigation);
      setInvestigations([realInvestigation, ...investigations.filter((i) => i.id !== placeholderId)]);
      if (graphResult) {
        setGraphData({
          ...graphResult,
          investigation_id: invResult.id,
        });
      }
      setPipelineStatus("COMPLETED");
      setAgents((prev) => prev.map((a) => ({ ...a, status: "COMPLETED" as const })));
      setDemoStep(2);

      console.log("[AEGIS] ✅ Real analysis complete:", realFindings.length, "findings");

    } catch (err) {
      console.error("[AEGIS] API error, falling back to mock data:", err);
      // Fallback to mock behavior if API is down
      setPipelineStatus("COMPLETED");
      setAgents((prev) => prev.map((a) => ({ ...a, status: "COMPLETED" as const })));
      setFindings(MOCK_FINDINGS);
      setDemoStep(2);
    }
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

    // Atualiza o estado dos findings (toggle entre RESOLVED/APPROVED e OPEN/PROPOSED)
    const updatedFindings = findings.map((f) =>
      f.id === findingId
        ? {
            ...f,
            status: f.status === "RESOLVED" ? ("OPEN" as const) : ("RESOLVED" as const),
            remediationStatus: f.status === "RESOLVED" ? ("PROPOSED" as const) : ("APPROVED" as const),
          }
        : f
    );
    setFindings(updatedFindings);

    // Identifica o documento alvo para atualizar seu progresso e status
    const targetFinding = findings.find((f) => f.id === findingId);
    const targetInvId = targetFinding?.investigationId || "INV-2024-0047";

    const invFindings = updatedFindings.filter(
      (f) =>
        f.investigationId === targetInvId ||
        (!updatedFindings.some((x) => x.investigationId === targetInvId) &&
          f.investigationId === "INV-2024-0047")
    );
    const totalGaps = invFindings.length;
    const resolvedGaps = invFindings.filter(
      (f) => f.status === "RESOLVED" || f.remediationStatus === "APPROVED" || f.remediationStatus === "APPLIED"
    ).length;
    const progressPercent = totalGaps > 0 ? Math.round((resolvedGaps / totalGaps) * 100) : 100;

    // Se todos os apontamentos foram resolvidos, o status torna-se COMPLETED
    const isComplete = resolvedGaps === totalGaps && totalGaps > 0;
    const newStatus: InvestigationStatus = isComplete
      ? "COMPLETED"
      : resolvedGaps > 0
      ? "INVESTIGATING"
      : "PENDING_REVIEW";

    if (isComplete) {
      setIsDriftActive(false);
    }

    // Atualiza o status e percentual na lista global de investigações
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === targetInvId
          ? {
              ...inv,
              status: newStatus,
              progressPercent: isComplete ? 100 : progressPercent,
              findingsCount: {
                ...inv.findingsCount,
                critical: invFindings.filter((f) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length,
                high: invFindings.filter((f) => f.severity === "HIGH" && f.status !== "RESOLVED").length,
                medium: invFindings.filter((f) => f.severity === "MEDIUM" && f.status !== "RESOLVED").length,
              },
            }
          : inv
      )
    );

    // Atualiza o documento atualmente ativo
    if (currentInvestigation.id === targetInvId) {
      setCurrentInvestigation((prev) => ({
        ...prev,
        status: newStatus,
        progressPercent: isComplete ? 100 : progressPercent,
      }));
    }

    // Atualiza nós do grafo de confiança (DAG)
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        const lowerId = findingId.toLowerCase().replace("-", "");
        if (n.id.toLowerCase().includes(lowerId) || (n.source && n.source.toLowerCase().includes(lowerId))) {
          return { ...n, valid: true, invalidated_reason: null, affected_by_change: false };
        }
        return n;
      }),
      invalid_nodes: isComplete ? 0 : prev.invalid_nodes,
    }));
  };

  const handleApproveDocument = (invId: string) => {
    // Marca todos os achados do documento como RESOLVED e APPROVED
    const updatedFindings = findings.map((f) =>
      f.investigationId === invId || (!findings.some((x) => x.investigationId === invId) && f.investigationId === "INV-2024-0047")
        ? { ...f, status: "RESOLVED" as const, remediationStatus: "APPROVED" as const }
        : f
    );
    setFindings(updatedFindings);
    setIsDriftActive(false);

    // Atualiza o status do documento para COMPLETED com 100% de conformidade
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: "COMPLETED",
              progressPercent: 100,
              findingsCount: {
                ...inv.findingsCount,
                critical: 0,
                high: 0,
                medium: 0,
              },
            }
          : inv
      )
    );

    if (currentInvestigation.id === invId) {
      setCurrentInvestigation((prev) => ({
        ...prev,
        status: "COMPLETED",
        progressPercent: 100,
      }));
    }

    // Valida todos os nós correspondentes no grafo DAG
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        valid: true,
        invalidated_reason: null,
        affected_by_change: false,
      })),
      invalid_nodes: 0,
    }));
  };

  const [selectedDocIdForGraph, setSelectedDocIdForGraph] = useState<string | null>(null);

  const handleTabChange = (tabId: string) => {
    if (tabId === "dashboard") {
      // Quando clica no menu "Trust Graph & Agents", direciona sempre para a lista Audited Documents Repository
      setSelectedDocIdForGraph(null);
    }
    setActiveTab(tabId);
  };

  const handleUpdateRemediationSuggestion = (findingId: string, newSuggestion: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingId
          ? { ...f, remediationSuggestion: newSuggestion }
          : f
      )
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1013]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

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
              onNavigate={handleTabChange}
              investigationsCount={investigations.length}
              agentsCount={activeAgentsCount}
              findingsCount={findings.length}
              driftNodesCount={realDriftCount}
              compliancePercent={dynamicCompliancePercent}
            />
          )}

          {/* TAB 0: DASHBOARD HUB (HOME PAGE - BIG NUMBERS) */}
          {activeTab === "overview" && (
            <DashboardHub
              onNavigate={handleTabChange}
              investigationsCount={investigations.length}
              agentsCount={activeAgentsCount}
              findingsCount={findings.length}
              driftNodesCount={realDriftCount}
              compliancePercent={dynamicCompliancePercent}
            />
          )}

          {/* TAB 1: INVESTIGATIONS */}
          {activeTab === "investigations" && (
            <InvestigationsTable
              investigations={investigations}
              findings={findings}
              onSelect={(inv) => {
                setCurrentInvestigation(inv);
                setSelectedDocIdForGraph(inv.id);
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
              selectedDocId={selectedDocIdForGraph}
              onSelectDocId={setSelectedDocIdForGraph}
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
              onApproveDocument={(invId) => handleApproveDocument(invId)}
              onUpdateRemediationSuggestion={handleUpdateRemediationSuggestion}
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
            <RemediationDriftView
              investigations={investigations}
              currentInvestigation={currentInvestigation}
              findings={findings}
              agents={agents}
              graphData={graphData}
              isDriftActive={isDriftActive}
              onDriftTriggered={handleDriftTriggered}
              onResetDrift={handleResetDrift}
              onApplyRemediation={handleApplyRemediation}
              onApproveDocument={handleApproveDocument}
              onOpenEvidence={(f) => setSelectedFindingForEvidence(f)}
              onNavigateToTrustGraph={(docId) => {
                if (docId) {
                  setSelectedDocIdForGraph(docId);
                  const targetInv = investigations.find((inv) => inv.id === docId);
                  if (targetInv) setCurrentInvestigation(targetInv);
                } else {
                  setSelectedDocIdForGraph(null);
                }
                setActiveTab("dashboard");
              }}
            />
          )}

          {/* TAB 5: FINAL REPORT */}
          {activeTab === "report" && (
            <ComplianceReportView
              investigation={currentInvestigation}
              investigations={investigations}
              onSelectInvestigation={(inv) => setCurrentInvestigation(inv)}
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
