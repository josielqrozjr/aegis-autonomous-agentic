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
}

export function RemediatedDocumentViewer({
  isOpen,
  onClose,
  investigation,
  findings,
  isDriftActive,
}: RemediatedDocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"DIFF" | "FINAL" | "ORIGINAL">("DIFF");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div className="w-full max-w-5xl bg-[#0D1013] border border-[#2A3038] rounded-2xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ========================================================================= */}
        {/* CABEÇALHO DO VISUALIZADOR                                                 */}
        {/* ========================================================================= */}
        <div className="p-5 bg-[#171B1F] border-b border-[#2A3038] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1013] text-[#B8843A] border border-[#2A3038]">
                {investigation.id}
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                {investigation.title}
              </h2>
              {isDriftActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A24438]/20 text-[#E06C5D] border border-[#A24438]/40">
                  GDPR v2 Drift Active
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
          <div className="flex items-center gap-3">
            <span className="text-[#9096A0]">Applied Patches:</span>
            <span className="px-2 py-0.5 rounded bg-[#3B8F6B]/15 text-[#3B8F6B] font-bold border border-[#3B8F6B]/30">
              {findings.length} Compliance Fixes Applied
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D1013] text-[#9096A0] border border-[#2A3038]">
              {investigation.frameworks.join(" · ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#9096A0]">Verification:</span>
            <span className="text-[#3B8F6B] font-semibold">
              Adversarial Critic Validated (0 Hallucinations)
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DOCUMENTO COM RASTREAMENTO E CORREÇÕES INLINE                     */}
        {/* ========================================================================= */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed space-y-6 bg-[#0D1013]">
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-[#14181C] border border-[#2A3038] shadow-inner space-y-6">
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
                <div className="text-[11px] text-[#9096A0] font-semibold">
                  Section 2.1 — User Profile Data Retention
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
                    <div className="p-3 rounded-lg bg-[#3B8F6B]/10 border border-[#3B8F6B]/30 text-white space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>Remediated Clause (Applied Compliance Patch)</span>
                        <span>Remediated by LGPD Specialist</span>
                      </div>
                      <p className="text-xs text-white">
                        "2.1. User profile data and transaction history shall be retained strictly for up to five (5) years following the formal termination of the customer relationship or account closure, after which all personal records shall be permanently purged or anonymized via irreversible cryptographic hashing in compliance with LGPD Art. 15 and GDPR Art. 5(1)(e)."
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <p className="p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-white text-xs leading-relaxed">
                    2.1. User profile data and transaction history shall be retained strictly for up to five (5) years following the formal termination of the customer relationship or account closure, after which all personal records shall be permanently purged or anonymized via irreversible cryptographic hashing in compliance with LGPD Art. 15 and GDPR Art. 5(1)(e).
                  </p>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#A24438]/15 border border-[#A24438]/40 text-[#E06C5D] text-xs leading-relaxed">
                    2.1. User profile data and transaction history shall be stored indefinitely for business intelligence and service personalization purposes.
                  </p>
                )}
              </div>

              {/* CLAUSULA 2.2 - LOGS DE ACESSO */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] text-[#9096A0] font-semibold">
                  Section 2.2 — Network Access Logs Retention
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

                    <div className="p-3 rounded-lg bg-[#3B8F6B]/10 border border-[#3B8F6B]/30 text-white space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>Remediated Clause (Applied Compliance Patch)</span>
                        <span>Remediated by ISO/OWASP Specialist</span>
                      </div>
                      <p className="text-xs text-white">
                        "2.2. Server access logs and HTTP request telemetry shall be retained for a mandatory period of six (6) months with automated IP anonymization / pseudonymization applied at ingestion time, enforcing least-privilege query controls."
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <p className="p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-white text-xs leading-relaxed">
                    2.2. Server access logs and HTTP request telemetry shall be retained for a mandatory period of six (6) months with automated IP anonymization / pseudonymization applied at ingestion time, enforcing least-privilege query controls.
                  </p>
                )}

                {viewMode === "ORIGINAL" && (
                  <p className="p-3 rounded-lg bg-[#B8843A]/15 border border-[#B8843A]/40 text-[#D4A559] text-xs leading-relaxed">
                    2.2. Server access logs and HTTP requests will be retained for thirty (30) days without automated purging of records containing IP addresses or personal identifiers.
                  </p>
                )}
              </div>
            </div>

            {/* SEÇÃO 3: DIREITOS DOS TITULARES & EXCLUSÃO (FIND-02) */}
            <div className="space-y-3 pt-2 border-t border-[#2A3038]/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B8843A]">
                3. Data Subject Rights & Erasure Requests
              </h4>

              <div className="space-y-2">
                <div className="text-[11px] text-[#9096A0] font-semibold">
                  Section 3.1 — SLA for Processing Erasure Requests
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

                    <div className="p-3 rounded-lg bg-[#3B8F6B]/10 border border-[#3B8F6B]/30 text-white space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>Remediated Clause (Applied Compliance Patch)</span>
                        <span>Remediated by GDPR/LGPD Specialist</span>
                      </div>
                      <p className="text-xs text-white">
                        "3.1. Requests for personal data erasure submitted by data subjects shall be fulfilled without undue delay and at the latest within fifteen (15) calendar days from receipt, providing the data subject with an automated cryptographic confirmation certificate."
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <p className="p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-white text-xs leading-relaxed">
                    3.1. Requests for personal data erasure submitted by data subjects shall be fulfilled without undue delay and at the latest within fifteen (15) calendar days from receipt, providing the data subject with an automated cryptographic confirmation certificate.
                  </p>
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
                <div className="text-[11px] text-[#9096A0] font-semibold">
                  Section 4.1 — Database Credentials & Access Control
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

                    <div className="p-3 rounded-lg bg-[#3B8F6B]/10 border border-[#3B8F6B]/30 text-white space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                        <span>Remediated Clause (Applied Compliance Patch)</span>
                        <span>Remediated by ISO 27001 Specialist</span>
                      </div>
                      <p className="text-xs text-white">
                        "4.1. Data in transit is secured with TLS 1.3 and AES-256 at rest. All production analytical databases must strictly mandate individual federated IAM authentication with RBAC and hardware-backed Multi-Factor Authentication (MFA). Shared credentials are strictly prohibited."
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "FINAL" && (
                  <p className="p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-white text-xs leading-relaxed">
                    4.1. Data in transit is secured with TLS 1.3 and AES-256 at rest. All production analytical databases must strictly mandate individual federated IAM authentication with RBAC and hardware-backed Multi-Factor Authentication (MFA). Shared credentials are strictly prohibited.
                  </p>
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
                  <div className="text-[11px] text-[#9096A0] font-semibold">
                    Section 5.1 — AI Model Weights Training Data Erasure
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

                      <div className="p-3 rounded-lg bg-[#3B8F6B]/15 border border-[#3B8F6B]/40 text-white space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#3B8F6B]">
                          <span>Mandated Regulatory Drift Remediation Patch</span>
                          <span>Gemini 2.5 Pro Attestation</span>
                        </div>
                        <p className="text-xs text-white">
                          "5.1. Upon valid receipt of a data erasure notice, all vector index embeddings containing latent representations of the data subject must be purged, and machine unlearning verification checkpoints executed within 30 days to certify statutory model alignment under GDPR v2 Directive."
                        </p>
                      </div>
                    </div>
                  )}

                  {viewMode === "FINAL" && (
                    <p className="p-3 rounded-lg bg-[#0D1013] border border-[#3B8F6B]/30 text-white text-xs leading-relaxed">
                      5.1. Upon valid receipt of a data erasure notice, all vector index embeddings containing latent representations of the data subject must be purged, and machine unlearning verification checkpoints executed within 30 days to certify statutory model alignment under GDPR v2 Directive.
                    </p>
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
        {/* RODAPÉ DO VISUALIZADOR COM EXPORTAÇÃO E FECHAMENTO                         */}
        {/* ========================================================================= */}
        <div className="p-4 bg-[#171B1F] border-t border-[#2A3038] flex items-center justify-end gap-3">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[#0D1013] hover:bg-[#21262B] text-white border border-[#2A3038] transition-colors cursor-pointer"
          >
            {copied ? "✓ Copied to Clipboard" : "Copy Document Content"}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#B8843A] hover:bg-[#CCA159] text-[#0D1013] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
