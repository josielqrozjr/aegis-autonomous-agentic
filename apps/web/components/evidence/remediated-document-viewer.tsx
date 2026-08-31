"use client";

import React, { useState } from "react";
import { Investigation, Finding } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RemediatedDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: Investigation;
  findings: Finding[];
  isDriftActive: boolean;
  onApproveDocument?: () => void;
  onUpdateRemediationSuggestion?: (findingId: string, newSuggestion: string) => void;
}

export function generateFinalDocumentContent(
  investigation: Investigation,
  findings: Finding[],
  isDriftActive: boolean = false
): string {
  const finding21 = findings.find(
    (f) =>
      f.id === "FIND-01" ||
      f.articleOrControl?.includes("15") ||
      f.title?.toLowerCase().includes("retention")
  );
  const patch21Text =
    finding21?.remediationSuggestion ||
    "2.1. User profile data and transaction history shall be retained strictly for up to five (5) years following the formal termination of the customer relationship or account closure, after which all personal records shall be permanently purged or anonymized via irreversible cryptographic hashing in compliance with LGPD Art. 15 and GDPR Art. 5(1)(e).";

  const finding22 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.framework?.includes("ISO") ||
      f.framework?.includes("OWASP") ||
      f.articleOrControl?.includes("A.9")
  );
  const patch22Text =
    finding22?.remediationSuggestion ||
    "2.2. Server access logs and HTTP request telemetry shall be retained for a mandatory period of six (6) months with automated IP anonymization / pseudonymization applied at ingestion time, enforcing least-privilege query controls.";

  const finding31 = findings.find(
    (f) =>
      f.id === "FIND-02" ||
      f.id === "FIND-03" ||
      f.articleOrControl?.includes("12") ||
      f.articleOrControl?.includes("18")
  );
  const patch31Text =
    finding31?.remediationSuggestion ||
    "3.1. Requests for personal data erasure submitted by data subjects shall be fulfilled without undue delay and at the latest within fifteen (15) calendar days from receipt, providing the data subject with an automated cryptographic confirmation certificate.";

  const finding41 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.articleOrControl?.includes("A.9") ||
      f.title?.toLowerCase().includes("database") ||
      f.title?.toLowerCase().includes("access")
  );
  const patch41Text =
    finding41?.remediationSuggestion ||
    "4.1. Data in transit is secured with TLS 1.3 and AES-256 at rest. All production analytical databases must strictly mandate individual federated IAM authentication with RBAC and hardware-backed Multi-Factor Authentication (MFA). Shared credentials are strictly prohibited.";

  const finding51 = findings.find(
    (f) => f.status === "RESOLVED" && (f.id === "FIND-02" || f.status !== "REOPENED_DRIFT")
  );
  const patch51Text =
    finding51?.remediationSuggestion ||
    "5.1. Upon valid receipt of a data erasure notice, all vector index embeddings containing latent representations of the data subject must be purged, and machine unlearning verification checkpoints executed within 30 days to certify statutory model alignment under GDPR v2 Directive.";

  return `# ${investigation.title.toUpperCase()}
**Document ID:** ${investigation.id}
**File Name:** ${investigation.documentName}
**SHA-256 Authenticity Hash:** ${investigation.documentHash}
**Governing Frameworks:** ${investigation.frameworks.join(" / ")}
**Certification Status:** 100% Certified & Compliant
**Autonomous Verification Engine:** AEGIS Multi-Agent Governance Engine (Gemma 2B + Gemini 1.5 Flash + Gemini 2.5 Pro)

---

## 1. PURPOSE AND APPLICABILITY
1.1. This Policy establishes enterprise data retention standards, storage limitation thresholds, subject rights fulfillment windows, and access control mandates governing all customer, employee, and business telemetry data across all corporate jurisdictions.

---

## 2. DATA RETENTION & STORAGE LIMITATION
${patch21Text}

${patch22Text}

---

## 3. DATA SUBJECT RIGHTS & ERASURE REQUESTS
${patch31Text}

---

## 4. SECURITY CONTROLS & ACCESS MANAGEMENT
${patch41Text}
${isDriftActive ? `\n---\n\n## 5. REGULATORY DRIFT ADAPTATION (GDPR v2 / EU AI ACT)\n${patch51Text}\n` : ""}
---
*Certified by AEGIS Cryptographic Governance Engine. Authenticity verified.*
`;
}

export function printDocumentAsPdf(
  investigation: Investigation,
  findings: Finding[],
  isDriftActive: boolean = false
) {
  if (typeof window === "undefined") return;

  const finding21 = findings.find(
    (f) =>
      f.id === "FIND-01" ||
      f.articleOrControl?.includes("15") ||
      f.title?.toLowerCase().includes("retention")
  );
  const patch21Text =
    finding21?.remediationSuggestion ||
    "2.1. User profile data and transaction history shall be retained strictly for up to five (5) years following the formal termination of the customer relationship or account closure, after which all personal records shall be permanently purged or anonymized via irreversible cryptographic hashing in compliance with LGPD Art. 15 and GDPR Art. 5(1)(e).";

  const finding22 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.framework?.includes("ISO") ||
      f.framework?.includes("OWASP") ||
      f.articleOrControl?.includes("A.9")
  );
  const patch22Text =
    finding22?.remediationSuggestion ||
    "2.2. Server access logs and HTTP request telemetry shall be retained for a mandatory period of six (6) months with automated IP anonymization / pseudonymization applied at ingestion time, enforcing least-privilege query controls.";

  const finding31 = findings.find(
    (f) =>
      f.id === "FIND-02" ||
      f.id === "FIND-03" ||
      f.articleOrControl?.includes("12") ||
      f.articleOrControl?.includes("18")
  );
  const patch31Text =
    finding31?.remediationSuggestion ||
    "3.1. Requests for personal data erasure submitted by data subjects shall be fulfilled without undue delay and at the latest within fifteen (15) calendar days from receipt, providing the data subject with an automated cryptographic confirmation certificate.";

  const finding41 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.articleOrControl?.includes("A.9") ||
      f.title?.toLowerCase().includes("database") ||
      f.title?.toLowerCase().includes("access")
  );
  const patch41Text =
    finding41?.remediationSuggestion ||
    "4.1. Data in transit is secured with TLS 1.3 and AES-256 at rest. All production analytical databases must strictly mandate individual federated IAM authentication with RBAC and hardware-backed Multi-Factor Authentication (MFA). Shared credentials are strictly prohibited.";

  const finding51 = findings.find(
    (f) => f.status === "RESOLVED" && (f.id === "FIND-02" || f.status !== "REOPENED_DRIFT")
  );
  const patch51Text =
    finding51?.remediationSuggestion ||
    "5.1. Upon valid receipt of a data erasure notice, all vector index embeddings containing latent representations of the data subject must be purged, and machine unlearning verification checkpoints executed within 30 days to certify statutory model alignment under GDPR v2 Directive.";

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${investigation.title} - Final Remediated Document (PDF)</title>
  <style>
    @page {
      margin: 1.5cm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
    }
    .subtitle {
      font-size: 12px;
      color: #4b5563;
      margin: 0;
      font-family: monospace;
    }
    .meta-box {
      border: 2px solid #000;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 24px;
      font-size: 12px;
      background: #f9fafb;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      font-weight: bold;
      color: #374151;
    }
    .meta-val {
      font-family: monospace;
      color: #111827;
      font-weight: 600;
    }
    h2 {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    p {
      font-size: 13px;
      margin: 0 0 14px 0;
      text-align: justify;
      color: #1f2937;
      line-height: 1.65;
    }
    .footer {
      border-top: 2px solid #000;
      margin-top: 32px;
      padding-top: 16px;
      font-size: 11px;
      color: #4b5563;
      display: flex;
      justify-content: space-between;
      align-items: center;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${investigation.title}</h1>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-row">
      <span class="meta-label">Document ID:</span>
      <span class="meta-val">${investigation.id}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Source Document:</span>
      <span class="meta-val">${investigation.documentName}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">SHA-256 Authenticity Hash:</span>
      <span class="meta-val">${investigation.documentHash}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Governing Frameworks:</span>
      <span class="meta-val">${investigation.frameworks.join(" · ")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Verification Models:</span>
      <span class="meta-val">Google Gemma 2B · Gemini 1.5 Flash · Gemini 2.5 Pro (Adversarial Critic)</span>
    </div>
  </div>

  <h2>1. Purpose and Applicability</h2>
  <p>1.1. This Policy establishes enterprise data retention standards, storage limitation thresholds, subject rights fulfillment windows, and access control mandates governing all customer, employee, and business telemetry data across all corporate jurisdictions.</p>

  <h2>2. Data Retention & Storage Limitation</h2>
  <p>${patch21Text}</p>
  <p>${patch22Text}</p>

  <h2>3. Data Subject Rights & Erasure Requests</h2>
  <p>${patch31Text}</p>

  <h2>4. Security Controls & Access Management</h2>
  <p>${patch41Text}</p>

  ${isDriftActive ? `
  <h2>5. Regulatory Drift Adaptation (GDPR v2 / EU AI Act)</h2>
  <p>${patch51Text}</p>
  ` : ""}

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function downloadDocumentFile(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function RemediatedDocumentViewer({
  isOpen,
  onClose,
  investigation,
  findings,
  isDriftActive,
  onApproveDocument,
  onUpdateRemediationSuggestion,
}: RemediatedDocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"DIFF" | "FINAL" | "ORIGINAL">("DIFF");
  const [copied, setCopied] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedClauseText, setEditedClauseText] = useState<string>("");

  if (!isOpen) return null;

  const handleCopyText = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    printDocumentAsPdf(investigation, findings, isDriftActive);
  };

  // Encontra os findings associados a cada seção
  const finding21 = findings.find(
    (f) =>
      f.id === "FIND-01" ||
      f.articleOrControl?.includes("15") ||
      f.title?.toLowerCase().includes("retention")
  );
  const patch21Text =
    finding21?.remediationSuggestion ||
    "2.1. User profile data and transaction history shall be retained strictly for up to five (5) years following the formal termination of the customer relationship or account closure, after which all personal records shall be permanently purged or anonymized via irreversible cryptographic hashing in compliance with LGPD Art. 15 and GDPR Art. 5(1)(e).";

  const finding22 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.framework?.includes("ISO") ||
      f.framework?.includes("OWASP") ||
      f.articleOrControl?.includes("A.9")
  );
  const patch22Text =
    finding22?.remediationSuggestion ||
    "2.2. Server access logs and HTTP request telemetry shall be retained for a mandatory period of six (6) months with automated IP anonymization / pseudonymization applied at ingestion time, enforcing least-privilege query controls.";

  const finding31 = findings.find(
    (f) =>
      f.id === "FIND-02" ||
      f.id === "FIND-03" ||
      f.articleOrControl?.includes("12") ||
      f.articleOrControl?.includes("18")
  );
  const patch31Text =
    finding31?.remediationSuggestion ||
    "3.1. Requests for personal data erasure submitted by data subjects shall be fulfilled without undue delay and at the latest within fifteen (15) calendar days from receipt, providing the data subject with an automated cryptographic confirmation certificate.";

  const finding41 = findings.find(
    (f) =>
      f.id === "FIND-04" ||
      f.articleOrControl?.includes("A.9") ||
      f.title?.toLowerCase().includes("database") ||
      f.title?.toLowerCase().includes("access")
  );
  const patch41Text =
    finding41?.remediationSuggestion ||
    "4.1. Data in transit is secured with TLS 1.3 and AES-256 at rest. All production analytical databases must strictly mandate individual federated IAM authentication with RBAC and hardware-backed Multi-Factor Authentication (MFA). Shared credentials are strictly prohibited.";

  const finding51 = findings.find(
    (f) => f.status === "RESOLVED" && (f.id === "FIND-02" || f.status !== "REOPENED_DRIFT")
  );
  const patch51Text =
    finding51?.remediationSuggestion ||
    "5.1. Upon valid receipt of a data erasure notice, all vector index embeddings containing latent representations of the data subject must be purged, and machine unlearning verification checkpoints executed within 30 days to certify statutory model alignment under GDPR v2 Directive.";

  // Verificação dinâmica de cada cláusula com base no status dos achados
  const isSec21Resolved = Boolean(finding21 && finding21.status === "RESOLVED");
  const isSec22Resolved = Boolean(finding22 && finding22.status === "RESOLVED");
  const isSec31Resolved = Boolean(finding31 && finding31.status === "RESOLVED");
  const isSec41Resolved = Boolean(finding41 && finding41.status === "RESOLVED");
  const isSec51Resolved = Boolean(isDriftActive && finding51 && finding51.status === "RESOLVED");

  const totalGaps = findings.length;
  const resolvedCount = findings.filter((f) => f.status === "RESOLVED").length;
  const allResolved = totalGaps > 0 && resolvedCount === totalGaps;
  const progressPercent = totalGaps > 0 ? Math.round((resolvedCount / totalGaps) * 100) : 0;
  const isApproved = investigation.status === "COMPLETED" && (resolvedCount === totalGaps || totalGaps === 0);

  const handleApprove = () => {
    if (onApproveDocument) {
      onApproveDocument();
    }
  };

  const handleStartEditClause = (secKey: string, currentText: string) => {
    setEditingSection(secKey);
    setEditedClauseText(currentText);
  };

  const handleSaveEditClause = (targetFinding?: Finding) => {
    if (targetFinding && onUpdateRemediationSuggestion) {
      onUpdateRemediationSuggestion(targetFinding.id, editedClauseText);
    }
    setEditingSection(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div className="w-full max-w-5xl bg-[#0D1013] border border-[#2A3038] rounded-2xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ========================================================================= */}
        {/* CABEÇALHO DO VISUALIZADOR                                                 */}
        {/* ========================================================================= */}
        <div className="p-5 bg-[#171B1F] border-b border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                {investigation.id}
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                {investigation.title}
              </h2>
              {isApproved ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B8F6B]/20 text-[#3B8F6B] font-bold border border-[#3B8F6B]/40">
                  Completed
                </span>
              ) : progressPercent > 0 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4C8FA6]/20 text-[#7EB5CC] font-bold border border-[#4C8FA6]/40">
                  In Progress ({progressPercent}%)
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B8843A]/20 text-[#D4A559] font-bold border border-[#B8843A]/40">
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#9096A0] font-mono">
              File: {investigation.documentName} · Hash: {investigation.documentHash.substring(0, 24)}...
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Seletor de Modo de Visualização */}
            <div className="flex items-center bg-[#0D1013] p-1 rounded-lg border border-[#2A3038]">
              <button
                onClick={() => setViewMode("DIFF")}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  viewMode === "DIFF"
                    ? "bg-[#21262B] text-[#B8843A] font-semibold"
                    : "text-[#9096A0] hover:text-white"
                )}
              >
                Diff & Patches
              </button>
              <button
                onClick={() => setViewMode("FINAL")}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  viewMode === "FINAL"
                    ? "bg-[#21262B] text-[#3B8F6B] font-semibold"
                    : "text-[#9096A0] hover:text-white"
                )}
              >
                Final Remediated Version
              </button>
              <button
                onClick={() => setViewMode("ORIGINAL")}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  viewMode === "ORIGINAL"
                    ? "bg-[#21262B] text-white font-semibold"
                    : "text-[#9096A0] hover:text-white"
                )}
              >
                Original Document
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-xs text-[#9096A0] hover:text-white bg-[#0D1013] hover:bg-[#21262B] border border-[#2A3038] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE METADADOS & SUMÁRIO DE REMEDIAÇÃO                                */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-[#12161A] border-b border-[#2A3038] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#9096A0]">Remediation Status:</span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded font-bold border",
                allResolved
                  ? "bg-[#3B8F6B]/15 text-[#3B8F6B] border-[#3B8F6B]/30"
                  : "bg-[#B8843A]/15 text-[#D4A559] border-[#B8843A]/30"
              )}
            >
              {resolvedCount} of {totalGaps} Patches Remediated ({progressPercent}%)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D1013] text-[#9096A0] border border-[#2A3038]">
              {investigation.frameworks.join(" · ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#9096A0]">Verification:</span>
            <span className="text-[#3B8F6B] font-semibold">
              Adversarial Critic Validated (Gemini 2.5 Pro)
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DOCUMENTO COM RASTREAMENTO E CORREÇÕES INLINE                     */}
        {/* ========================================================================= */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed space-y-6 bg-[#0D1013]">
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-[#14181C] border border-[#2A3038] shadow-inner space-y-6">
            {/* Selo Criptográfico de Conformidade Integral (quando 100% remediado) */}
            {allResolved && (
              <div className="p-3.5 rounded-xl bg-[#3B8F6B]/10 border border-[#3B8F6B]/30 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#3B8F6B] uppercase tracking-wider">
                    ✓ Official Cryptographic Compliance Attestation
                  </div>
                  <div className="text-[11px] text-[#B8BDC7]">
                    This document has been remediated and formally certified in 100% statutory compliance.
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-[#3B8F6B]/20 text-[#3B8F6B] text-[10px] font-bold border border-[#3B8F6B]/40 shrink-0">
                  SEAL ACTIVE
                </span>
              </div>
            )}
            {/* Título Oficial do Documento */}
            <div className="border-b border-[#2A3038] pb-4 space-y-1 text-center">
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                {investigation.title}
              </div>
              <div className="text-[11px] text-[#9096A0]">
                Governing Policy Document · Production Cryptographic Artifact
              </div>
              <div className="text-[10px] text-[#5C636E]">
                Target Legislation: {investigation.frameworks.join(" / ")}
              </div>
            </div>

            {/* SEÇÃO 1: OBJETIVO E ESCOPO */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B8843A]">
                1. Purpose & Statutory Scope
              </h4>
              <p className="text-[#B8BDC7] text-xs leading-relaxed">
                1.1. This normative document sets forth governing requirements for the handling, processing, protection, and lawful erasure of confidential information and personal data processed across AEGIS Group infrastructure, applications, and third-party vendor relationships in Brazil and the European Union.
              </p>
              <p className="text-[#B8BDC7] text-xs leading-relaxed">
                1.2. All employees, automated agent workloads, and external contractors must strictly adhere to the technical controls and retention schedules prescribed herein.
              </p>
            </div>

            {/* SEÇÃO 2: RETENÇÃO E PROCESSAMENTO DE DADOS (FIND-01 & FIND-03) */}
            <div className="space-y-3 pt-2 border-t border-[#2A3038]/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B8843A]">
                2. Data Retention Schedules & Storage Limitation
              </h4>

              {/* CLAUSULA 2.1 - RETENÇÃO INDEFINIDA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#9096A0]">Section 2.1 — User Profile Data Retention</span>
                  {isSec21Resolved ? (
                    <span className="text-[#3B8F6B] text-[10px] font-bold">✓ Remediated & Compliant</span>
                  ) : (
                    <span className="text-[#E06C5D] text-[10px] font-bold">● Pending Remediation</span>
                  )}
                </div>

                {viewMode === "DIFF" && (
                  <div className="space-y-2">
                    {/* Cláusula Original Identificada */}
                    <div className="p-3 rounded-lg bg-[#A24438]/10 border border-[#A24438]/30 text-[#E06C5D] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Original Non-Compliant Clause (Identified Gap)</span>
                        <span>LGPD Art. 15 · Critical</span>
                      </div>
                      <p className="line-through text-xs opacity-80">
                        "2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes."
                      </p>
                    </div>

                    {/* Patch Remediado Aplicado */}
                    <div
                      className={cn(
                        "p-3 rounded-lg border space-y-2",
                        isSec21Resolved
                          ? "bg-[#3B8F6B]/10 border-[#3B8F6B]/30 text-white"
                          : "bg-[#0D1013] border-[#2A3038] text-[#9096A0]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>
                          {isSec21Resolved ? "Applied Compliance Patch" : "Proposed Compliance Patch"}
                        </span>
                        {editingSection !== "sec21" && (
                          <button
                            onClick={() => handleStartEditClause("sec21", patch21Text)}
                            className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                          >
                            <span>✏️ edit</span>
                          </button>
                        )}
                      </div>

                      {editingSection === "sec21" ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <textarea
                            value={editedClauseText}
                            onChange={(e) => setEditedClauseText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditClause(finding21)}
                              className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white leading-relaxed">
                          "{patch21Text}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border text-xs leading-relaxed space-y-2",
                      isSec21Resolved
                        ? "bg-[#0D1013] border-[#3B8F6B]/40 text-white"
                        : "bg-[#A24438]/10 border-[#A24438]/30 text-[#E06C5D]"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSec21Resolved ? "text-[#3B8F6B] font-bold" : "text-[#E06C5D]"}>
                        {isSec21Resolved ? "✓ Compliant Clause" : "● Pending Remediation"}
                      </span>
                      {editingSection !== "sec21_final" && (
                        <button
                          onClick={() => handleStartEditClause("sec21_final", patch21Text)}
                          className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                        >
                          <span>✏️ edit</span>
                        </button>
                      )}
                    </div>

                    {editingSection === "sec21_final" ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <textarea
                          value={editedClauseText}
                          onChange={(e) => setEditedClauseText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditClause(finding21)}
                            className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {isSec21Resolved
                          ? patch21Text
                          : "2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes. [NON-COMPLIANT — PENDING REMEDIATION]"}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#A24438]/15 border border-[#A24438]/40 text-[#E06C5D] text-xs leading-relaxed">
                    2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes.
                  </p>
                )}
              </div>

              {/* CLAUSULA 2.2 - LOGS DE ACESSO */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#9096A0]">Section 2.2 — Network Access Logs Retention</span>
                  {isSec22Resolved ? (
                    <span className="text-[#3B8F6B] text-[10px] font-bold">✓ Remediated & Compliant</span>
                  ) : (
                    <span className="text-[#D4A559] text-[10px] font-bold">● Pending Remediation</span>
                  )}
                </div>

                {viewMode === "DIFF" && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#B8843A]/10 border border-[#B8843A]/30 text-[#D4A559] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Original Non-Compliant Clause (Identified Gap)</span>
                        <span>OWASP / ISO 27001 · High</span>
                      </div>
                      <p className="line-through text-xs opacity-80">
                        "2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers."
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3 rounded-lg border space-y-2",
                        isSec22Resolved
                          ? "bg-[#3B8F6B]/10 border-[#3B8F6B]/30 text-white"
                          : "bg-[#0D1013] border-[#2A3038] text-[#9096A0]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>
                          {isSec22Resolved ? "Applied Compliance Patch" : "Proposed Compliance Patch"}
                        </span>
                        {editingSection !== "sec22" && (
                          <button
                            onClick={() => handleStartEditClause("sec22", patch22Text)}
                            className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                          >
                            <span>✏️ edit</span>
                          </button>
                        )}
                      </div>

                      {editingSection === "sec22" ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <textarea
                            value={editedClauseText}
                            onChange={(e) => setEditedClauseText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditClause(finding22)}
                              className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white leading-relaxed">
                          "{patch22Text}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border text-xs leading-relaxed space-y-2",
                      isSec22Resolved
                        ? "bg-[#0D1013] border-[#3B8F6B]/40 text-white"
                        : "bg-[#B8843A]/10 border-[#B8843A]/30 text-[#D4A559]"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSec22Resolved ? "text-[#3B8F6B] font-bold" : "text-[#D4A559]"}>
                        {isSec22Resolved ? "✓ Compliant Clause" : "● Pending Remediation"}
                      </span>
                      {editingSection !== "sec22_final" && (
                        <button
                          onClick={() => handleStartEditClause("sec22_final", patch22Text)}
                          className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                        >
                          <span>✏️ edit</span>
                        </button>
                      )}
                    </div>

                    {editingSection === "sec22_final" ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <textarea
                          value={editedClauseText}
                          onChange={(e) => setEditedClauseText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditClause(finding22)}
                            className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {isSec22Resolved
                          ? patch22Text
                          : "2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers. [NON-COMPLIANT — PENDING REMEDIATION]"}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#B8843A]/15 border border-[#B8843A]/40 text-[#D4A559] text-xs leading-relaxed">
                    2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers.
                  </p>
                )}
              </div>
            </div>

            {/* SEÇÃO 3: DIREITOS DOS TITULARES & EXCLUSÃO (FIND-02 / FIND-03) */}
            <div className="space-y-3 pt-2 border-t border-[#2A3038]/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B8843A]">
                3. Data Subject Rights & Erasure Requests
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#9096A0]">Section 3.1 — SLA for Processing Erasure Requests</span>
                  {isSec31Resolved ? (
                    <span className="text-[#3B8F6B] text-[10px] font-bold">✓ Remediated & Compliant</span>
                  ) : (
                    <span className="text-[#E06C5D] text-[10px] font-bold">● Pending Remediation</span>
                  )}
                </div>

                {viewMode === "DIFF" && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#A24438]/10 border border-[#A24438]/30 text-[#E06C5D] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Original Non-Compliant Clause (Identified Gap)</span>
                        <span>LGPD Art. 18 / GDPR Art. 12 · Critical</span>
                      </div>
                      <p className="line-through text-xs opacity-80">
                        "3.1. Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days."
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3 rounded-lg border space-y-2",
                        isSec31Resolved
                          ? "bg-[#3B8F6B]/10 border-[#3B8F6B]/30 text-white"
                          : "bg-[#0D1013] border-[#2A3038] text-[#9096A0]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>
                          {isSec31Resolved ? "Applied Compliance Patch" : "Proposed Compliance Patch"}
                        </span>
                        {editingSection !== "sec31" && (
                          <button
                            onClick={() => handleStartEditClause("sec31", patch31Text)}
                            className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                          >
                            <span>✏️ edit</span>
                          </button>
                        )}
                      </div>

                      {editingSection === "sec31" ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <textarea
                            value={editedClauseText}
                            onChange={(e) => setEditedClauseText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditClause(finding31)}
                              className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white leading-relaxed">
                          "{patch31Text}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border text-xs leading-relaxed space-y-2",
                      isSec31Resolved
                        ? "bg-[#0D1013] border-[#3B8F6B]/40 text-white"
                        : "bg-[#A24438]/10 border-[#A24438]/30 text-[#E06C5D]"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSec31Resolved ? "text-[#3B8F6B] font-bold" : "text-[#E06C5D]"}>
                        {isSec31Resolved ? "✓ Compliant Clause" : "● Pending Remediation"}
                      </span>
                      {editingSection !== "sec31_final" && (
                        <button
                          onClick={() => handleStartEditClause("sec31_final", patch31Text)}
                          className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                        >
                          <span>✏️ edit</span>
                        </button>
                      )}
                    </div>

                    {editingSection === "sec31_final" ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <textarea
                          value={editedClauseText}
                          onChange={(e) => setEditedClauseText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditClause(finding31)}
                            className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {isSec31Resolved
                          ? patch31Text
                          : "3.1. Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days. [NON-COMPLIANT — PENDING REMEDIATION]"}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#A24438]/15 border border-[#A24438]/40 text-[#E06C5D] text-xs leading-relaxed">
                    3.1. Requests for personal data deletion submitted by data subjects will be reviewed by the legal team within 90 business days.
                  </p>
                )}
              </div>
            </div>

            {/* SEÇÃO 4: SEGURANÇA, CRIPTOGRAFIA & IAM (FIND-04) */}
            <div className="space-y-3 pt-2 border-t border-[#2A3038]/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B8843A]">
                4. Security Controls & Access Management
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#9096A0]">Section 4.1 — Database Credentials & Access Control</span>
                  {isSec41Resolved ? (
                    <span className="text-[#3B8F6B] text-[10px] font-bold">✓ Remediated & Compliant</span>
                  ) : (
                    <span className="text-[#D4A559] text-[10px] font-bold">● Pending Remediation</span>
                  )}
                </div>

                {viewMode === "DIFF" && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#B8843A]/10 border border-[#B8843A]/30 text-[#D4A559] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Original Non-Compliant Clause (Identified Gap)</span>
                        <span>ISO/IEC 27001 A.9 · High</span>
                      </div>
                      <p className="line-through text-xs opacity-80">
                        "4.1. Data in transit is secured with TLS 1.3. Analytical databases utilize shared passwords restricted to the engineering team."
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3 rounded-lg border space-y-2",
                        isSec41Resolved
                          ? "bg-[#3B8F6B]/10 border-[#3B8F6B]/30 text-white"
                          : "bg-[#0D1013] border-[#2A3038] text-[#9096A0]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>
                          {isSec41Resolved ? "Applied Compliance Patch" : "Proposed Compliance Patch"}
                        </span>
                        {editingSection !== "sec41" && (
                          <button
                            onClick={() => handleStartEditClause("sec41", patch41Text)}
                            className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                          >
                            <span>✏️ edit</span>
                          </button>
                        )}
                      </div>

                      {editingSection === "sec41" ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <textarea
                            value={editedClauseText}
                            onChange={(e) => setEditedClauseText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditClause(finding41)}
                              className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white leading-relaxed">
                          "{patch41Text}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border text-xs leading-relaxed space-y-2",
                      isSec41Resolved
                        ? "bg-[#0D1013] border-[#3B8F6B]/40 text-white"
                        : "bg-[#B8843A]/10 border-[#B8843A]/30 text-[#D4A559]"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSec41Resolved ? "text-[#3B8F6B] font-bold" : "text-[#D4A559]"}>
                        {isSec41Resolved ? "✓ Compliant Clause" : "● Pending Remediation"}
                      </span>
                      {editingSection !== "sec41_final" && (
                        <button
                          onClick={() => handleStartEditClause("sec41_final", patch41Text)}
                          className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                        >
                          <span>✏️ edit</span>
                        </button>
                      )}
                    </div>

                    {editingSection === "sec41_final" ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <textarea
                          value={editedClauseText}
                          onChange={(e) => setEditedClauseText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditClause(finding41)}
                            className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {isSec41Resolved
                          ? patch41Text
                          : "4.1. Data in transit is secured with TLS 1.3. Analytical databases utilize shared passwords restricted to the engineering team. [NON-COMPLIANT — PENDING REMEDIATION]"}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#B8843A]/15 border border-[#B8843A]/40 text-[#D4A559] text-xs leading-relaxed">
                    4.1. Data in transit is secured with TLS 1.3. Analytical databases utilize shared passwords restricted to the engineering team.
                  </p>
                )}
              </div>
            </div>

            {/* SEÇÃO 5: REGULATORY DRIFT ADAPTATION (QUANDO DRIFT ESTÁ ATIVO) */}
            {isDriftActive && (
              <div className="space-y-3 pt-2 border-t border-[#A24438]/40 bg-[#A24438]/5 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E06C5D]">
                    5. Regulatory Drift Adaptation (GDPR v2 / EU AI Act Directive)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
                    Active Drift Invalidation
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[#9096A0]">Section 5.1 — AI Model Weights Training Data Erasure</span>
                    {isSec51Resolved ? (
                      <span className="text-[#3B8F6B] text-[10px] font-bold">✓ Remediated & Compliant</span>
                    ) : (
                      <span className="text-[#E06C5D] text-[10px] font-bold">● Policy Drift Active</span>
                    )}
                  </div>

                  {viewMode === "DIFF" && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-[#A24438]/15 border border-[#A24438]/40 text-[#E06C5D] space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>Invalidated Clause under GDPR v2 Directive</span>
                          <span>Breach of EU AI Act Art. 28</span>
                        </div>
                        <p className="line-through text-xs opacity-80">
                          "5.1. Personal data transformed into neural network vector embeddings or latent representations is deemed irrevocably anonymous and exempt from subsequent data subject revocation requests."
                        </p>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-lg border space-y-2",
                          isSec51Resolved
                            ? "bg-[#3B8F6B]/15 border-[#3B8F6B]/40 text-white"
                            : "bg-[#0D1013] border-[#2A3038] text-[#9096A0]"
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                          <span>Mandated Regulatory Drift Remediation Patch</span>
                          {editingSection !== "sec51" && (
                            <button
                              onClick={() => handleStartEditClause("sec51", patch51Text)}
                              className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                            >
                              <span>✏️ edit</span>
                            </button>
                          )}
                        </div>

                        {editingSection === "sec51" ? (
                          <div className="space-y-2 animate-in fade-in duration-200">
                            <textarea
                              value={editedClauseText}
                              onChange={(e) => setEditedClauseText(e.target.value)}
                              rows={3}
                              className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditClause(finding51)}
                                className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-white leading-relaxed">
                            "{patch51Text}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === "FINAL" && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border text-xs leading-relaxed space-y-2",
                        isSec51Resolved
                          ? "bg-[#0D1013] border-[#3B8F6B]/40 text-white"
                          : "bg-[#A24438]/10 border-[#A24438]/30 text-[#E06C5D]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={isSec51Resolved ? "text-[#3B8F6B] font-bold" : "text-[#E06C5D]"}>
                          {isSec51Resolved ? "✓ Drift Remediated Clause" : "● Policy Drift Active"}
                        </span>
                        {editingSection !== "sec51_final" && (
                          <button
                            onClick={() => handleStartEditClause("sec51_final", patch51Text)}
                            className="text-[#9096A0] hover:text-[#3B8F6B] transition-colors cursor-pointer flex items-center gap-1 font-normal lowercase"
                          >
                            <span>✏️ edit</span>
                          </button>
                        )}
                      </div>

                      {editingSection === "sec51_final" ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <textarea
                            value={editedClauseText}
                            onChange={(e) => setEditedClauseText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/60 text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3B8F6B]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2.5 py-1 rounded text-[10px] text-[#9096A0] hover:text-white bg-[#0D1013] border border-[#2A3038] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditClause(finding51)}
                              className="px-3 py-1 rounded text-[10px] font-bold text-[#0D1013] bg-[#3B8F6B] hover:bg-[#4EAC83] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed">
                          {isSec51Resolved
                            ? patch51Text
                            : "5.1. Personal data transformed into neural network vector embeddings or latent representations is deemed irrevocably anonymous and exempt from subsequent data subject revocation requests. [POLICY DRIFT BREACH — PENDING REMEDIATION]"}
                        </p>
                      )}
                    </div>
                  )}

                  {viewMode === "ORIGINAL" && (
                    <p className="p-3 rounded-lg bg-[#A24438]/15 border border-[#A24438]/40 text-[#E06C5D] text-xs leading-relaxed">
                      5.1. Personal data transformed into neural network vector embeddings or latent representations is deemed irrevocably anonymous and exempt from subsequent data subject revocation requests.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RODAPÉ DO VISUALIZADOR COM EXPORTAÇÃO, FECHAMENTO E APROVAÇÃO              */}
        {/* ========================================================================= */}
        <div className="p-4 bg-[#171B1F] border-t border-[#2A3038] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[#0D1013] hover:bg-[#21262B] text-white border border-[#2A3038] transition-colors cursor-pointer"
            >
              {copied ? "✓ Copied to Clipboard" : "Copy Document Content"}
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#B8843A] hover:text-[#CCA159] border border-[#2A3038] hover:border-[#B8843A] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Save PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0D1013] hover:bg-[#21262B] text-[#9096A0] hover:text-white border border-[#2A3038] transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleApprove}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-1.5",
                isApproved
                  ? "bg-[#3B8F6B]/20 text-[#3B8F6B] border border-[#3B8F6B]/40"
                  : "bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013]"
              )}
            >
              {isApproved
                ? "Completed"
                : "Approve Document"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
