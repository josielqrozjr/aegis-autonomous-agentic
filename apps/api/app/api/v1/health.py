"""Health, agents, and conformance — public production proof routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from aegis.registry.registry import AgentRegistry
from apps.api.app.api.deps import get_agent_registry

router = APIRouter(tags=["production-proof"])


@router.get("/health")
async def health(registry: AgentRegistry = Depends(get_agent_registry)):
    agents = registry.list_agents()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "agents": {
            "total": len(agents),
            "details": [
                {"agent_id": a.agent_id, "name": a.name, "role": a.role.value, "version": a.version}
                for a in agents
            ],
        },
        "services": {
            "firestore": "in-memory",  # will become "connected" with real Firestore
            "cloud_run": "local",
            "vertex_ai": "pending",
        },
    }


@router.get("/agents")
async def list_agents(registry: AgentRegistry = Depends(get_agent_registry)):
    agents = registry.list_agents()
    return {
        "count": len(agents),
        "agents": [
            {
                "agent_id": a.agent_id,
                "name": a.name,
                "role": a.role.value,
                "description": a.description,
                "version": a.version,
                "jurisdictions": a.jurisdictions,
                "capabilities": [
                    {"id": c.id, "name": c.name, "description": c.description}
                    for c in a.capabilities
                ],
            }
            for a in agents
        ],
    }


@router.get("/conformance")
async def conformance(registry: AgentRegistry = Depends(get_agent_registry)):
    agents = registry.list_agents()
    return {
        "project": "AEGIS — Autonomous Enterprise Governance Intelligence System",
        "track": "Fortified Enterprise Fleet",
        "stack": {
            "framework": "FastAPI",
            "agent_framework": "Google ADK",
            "persistence": "Firestore (in-memory fallback)",
            "deployment": "Cloud Run",
            "models": [
                {
                    "name": "Gemini 2.5 Flash",
                    "role": "Agent reasoning, document analysis, planning, specialists, remediation",
                    "status": "pending",
                },
                {
                    "name": "Gemma",
                    "role": "PII/Sensitive Data Scanner — privacy layer before model exposure",
                    "status": "pending",
                },
                {
                    "name": "Gemini 2.5 Pro",
                    "role": "Evidence Critic / Adversarial Review — complex reasoning",
                    "status": "pending",
                },
            ],
        },
        "agents_registered": len(agents),
        "verified_evidence": {
            "gemini_call_real": False,
            "tests_passing": True,
            "deploy_public": False,
            "trust_graph_cascade": False,
            "regulatory_change_flow": False,
        },
    }
