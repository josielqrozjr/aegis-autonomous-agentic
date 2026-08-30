"""
AEGIS — Autonomous Enterprise Governance Intelligence System
Live Demo Orchestrator & Video Recording CLI Runner.

Usage:
  python demo_runner.py [--auto] [--delay 1.0]
"""

import sys
import os
import asyncio
import time
import argparse
from typing import Dict, Any

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure path resolution
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from aegis.schemas import (
    Document,
    Investigation,
    InvestigationStatus,
    RegulatoryChange,
    TrustNode,
    TrustNodeType,
)
from aegis.models.registry import default_model_registry
from aegis.registry.setup import init_default_registry
from apps.api.app.domain.trust_graph.graph import TrustGraph
from apps.worker.handlers.investigation_handler import InvestigationHandler
from aegis.agents.change_detection import ChangeDetectionAgent
from apps.api.app.infrastructure.memory.repositories import (
    MemoryInvestigationRepository,
    MemoryAuditRepository,
    MemoryRegulatoryChangeRepository,
)

# Terminal Styling Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
DIM = "\033[2m"
MAGENTA = "\033[95m"
RESET = "\033[0m"


def print_banner():
    banner = f"""
{CYAN}{BOLD}================================================================================
   AEGIS — Autonomous Enterprise Governance Intelligence System
   Track: Fortified Enterprise Fleet
   Multi-Model: Gemini 2.5 Flash + Gemini 2.5 Pro + Gemma (PII Gate)
   Showstopper: Policy Drift Attack & Trust Graph Invalidation Cascade
================================================================================{RESET}
"""
    print(banner)


def pause(seconds: float, auto_mode: bool):
    if auto_mode and seconds > 0:
        time.sleep(seconds)


async def run_live_demo(auto_mode: bool = True, step_delay: float = 1.0) -> Dict[str, Any]:
    print_banner()

    # Iniciar repositórios e registros
    registry = init_default_registry()
    inv_repo = MemoryInvestigationRepository()
    audit_repo = MemoryAuditRepository()
    change_repo = MemoryRegulatoryChangeRepository()
    trust_graph = TrustGraph()

    doc_path = os.path.join(os.path.dirname(__file__), "data", "demo", "documents", "politica-retencao-dados.txt")
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as f:
            raw_text = f.read()
    else:
        raw_text = "Política Global de Retenção de Dados. LGPD e GDPR aplicáveis. DPO: dpo@aegis-corp.com."

    # ETAPA 1: Upload & PII Scan Gate
    print(f"\n{BOLD}{CYAN}▶ [ETAPA 1/6] Ingestao Documental & PII Gate (Gemma Model Garden){RESET}")
    print(f"{DIM}Arquivo carregado: data/demo/documents/politica-retencao-dados.txt{RESET}")
    gemma = default_model_registry.get_gemma_scanner()
    pii_res = await gemma.scan_and_sanitize(raw_text)
    print(f"  {GREEN}[OK] PII Scan:{RESET} {len(pii_res.entities_found)} entidades sensiveis identificadas e redigidas com seguranca.")
    for e in pii_res.entities_found:
        print(f"    - {YELLOW}{e['type']}:{RESET} {e['sample_masked']}")
    pause(step_delay, auto_mode)

    # ETAPA 2: Document Understanding & Planning
    print(f"\n{BOLD}{CYAN}▶ [ETAPA 2/6] Compreensao e Roteamento Dinamico (Gemini 2.5 Flash + Agent Registry){RESET}")
    doc = Document(
        id="doc-demo-01",
        filename="politica-retencao-dados.txt",
        content_type="text/plain",
        storage_path="/data/demo/documents/politica-retencao-dados.txt",
        raw_text=raw_text,
    )
    inv = Investigation(
        id="inv-demo-2026",
        title="Auditoria Global de Retencao de Dados - Q3 2026",
        document=doc,
        status=InvestigationStatus.QUEUED,
    )
    await inv_repo.save(inv)

    handler = InvestigationHandler(inv_repo, audit_repo, registry, trust_graph)
    # Executa ate routing
    await handler._understand(inv)
    await handler._plan(inv)
    await handler._route(inv)

    print(f"  {GREEN}[OK] Jurisdicoes Detectadas:{RESET} {inv.document.jurisdiction} (Multi-jurisdicao BR + EU + GLOBAL)")
    print(f"  {GREEN}[OK] Agentes Especialistas Descobertos Dinamicamente:{RESET}")
    for aid in inv.plan.assigned_agent_ids:
        print(f"    * {BOLD}{aid}{RESET}")
    pause(step_delay, auto_mode)

    # ETAPA 3: Análise Paralela & Trust Graph Hashing
    print(f"\n{BOLD}{CYAN}▶ [ETAPA 3/6] Analise Tecnica dos Especialistas & Hashes SHA-256 de Evidencias{RESET}")
    await handler._analyze(inv)
    for f in inv.findings:
        ev = f.evidences[0] if f.evidences else None
        hash_short = ev.content_hash[:16] + "..." if ev and ev.content_hash else "None"
        print(f"  {GREEN}[OK] Achado ({f.requirement_id}):{RESET} {f.title}")
        print(f"    - Severidade: {RED if f.severity.value in ('critical', 'high') else YELLOW}{f.severity.value.upper()}{RESET} | Confianca: {f.confidence*100:.0f}%")
        print(f"    - Hash SHA-256 Evidencia: {CYAN}{hash_short}{RESET} | Provenance: {ev.provenance if ev else 'N/A'}")
    pause(step_delay, auto_mode)

    # ETAPA 4: Auditoria Adversarial (Gemini 2.5 Pro)
    print(f"\n{BOLD}{CYAN}▶ [ETAPA 4/6] Auditoria Adversarial Red Team (Evidence Critic - Gemini 2.5 Pro){RESET}")
    await handler._review(inv)
    for r in inv.reviews:
        print(f"  {GREEN}[OK] Parecer Red Team [{r.decision.value.upper()}]:{RESET} {r.reasoning}")
    pause(step_delay, auto_mode)

    # ETAPA 5: Remediação & Conclusão Inicial
    print(f"\n{BOLD}{CYAN}▶ [ETAPA 5/6] Geracao de Planos de Acao Corretivos (Remediation Agent){RESET}")
    await handler._complete(inv)
    inv.status = InvestigationStatus.COMPLETED
    await inv_repo.save(inv)
    for rem in inv.remediations:
        print(f"  {GREEN}[OK] Acao:{RESET} {rem.action_item} ({YELLOW}Responsavel: {rem.assignee}{RESET})")
    print(f"\n  {BOLD}{GREEN}[CONCLUIDO] INVESTIGACAO CONCLUIDA COM STATUS: {inv.status.value.upper()}{RESET}")
    pause(step_delay * 1.5, auto_mode)

    # ETAPA 6: O SHOWSTOPPER — POLICY DRIFT & CASCATA DO TRUST GRAPH
    print(f"\n{BOLD}{MAGENTA}================================================================================")
    print(f"   [ETAPA 6/6] THE MOMENT: POLICY DRIFT ATTACK (AS REGRAS MUDARAM!)")
    print(f"================================================================================{RESET}")
    print(f"{YELLOW}Evento: EDPB publica revisao urgente do GDPR Art. 5(1)(e): Prazo maximo reduzido para 5 anos!{RESET}")

    drift_event = RegulatoryChange(
        id="rc-gdpr-2026-drift",
        framework="GDPR",
        version="2.0",
        change_description="Prazo maximo estrito de retencao de logs reduzido de 10 para 5 anos.",
        affected_requirements=["GDPR-ART-5-1-E"],
    )
    await change_repo.save(drift_event)

    drift_agent = ChangeDetectionAgent()
    drift_result = await drift_agent.process_policy_drift(drift_event, [inv], trust_graph)

    print(f"\n  {RED}>> Blast Radius Calculado no Trust Graph:{RESET}")
    print(f"    - Nos de Evidencia Invalidados: {RED}{drift_result['invalidated_nodes']}{RESET}")
    print(f"    - Investigacao Reaberta: {YELLOW}{drift_result['affected_investigations']}{RESET} -> Status: {BOLD}REOPENED{RESET}")
    print(f"    - Achado Reaberto: {YELLOW}{drift_result['affected_findings']}{RESET}")

    print(f"\n  {CYAN}>> Selective Recovery Autonomo em Execucao (Apenas no Security Specialist):{RESET}")
    for nf in drift_result.get("new_findings", []):
        print(f"    {GREEN}[OK] Novo Achado Pos-Drift:{RESET} {nf.get('title')} ({nf.get('requirement_id')})")
    for nr in drift_result.get("new_remediations", []):
        print(f"    {GREEN}[OK] Nova Remediacao Gerada:{RESET} {nr.get('action_item')} ({nr.get('assignee')})")

    print(f"\n{CYAN}================================================================================")
    print(f"{BOLD}{GREEN}* PUNCHLINE FINAL DO VIDEO:")
    print(f'  "The investigation was complete. Then the rules changed. AEGIS reacted autonomously."{RESET}')
    print(f"{CYAN}================================================================================{RESET}\n")

    return {
        "investigation_id": inv.id,
        "final_status": inv.status.value if hasattr(inv.status, "value") else inv.status,
        "drift_handled": drift_result["status"] == "selective_recovery_completed",
        "invalidated_nodes_count": len(drift_result["invalidated_nodes"]),
        "new_findings_count": len(drift_result["new_findings"]),
    }


def main():
    parser = argparse.ArgumentParser(description="AEGIS Live Demo Runner")
    parser.add_argument("--auto", action="store_true", default=True, help="Executar em modo automatico")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay entre etapas em segundos")
    args = parser.parse_args()

    asyncio.run(run_live_demo(auto_mode=args.auto, step_delay=args.delay))


if __name__ == "__main__":
    main()
