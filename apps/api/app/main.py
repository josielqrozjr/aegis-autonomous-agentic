"""AEGIS API — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from aegis.registry.setup import init_default_registry
from apps.api.app.api.deps import set_agent_registry
from apps.api.app.api.v1.health import router as health_router
from apps.api.app.api.v1.investigations import router as investigations_router
from apps.api.app.api.v1.documents import router as documents_router
from apps.api.app.api.v1.findings import router as findings_router
from apps.api.app.api.v1.regulatory_changes import router as regulatory_changes_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize the agent registry
    registry = init_default_registry()
    set_agent_registry(registry)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="AEGIS API",
    description="Autonomous Enterprise Governance Intelligence System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public production-proof routes (no prefix)
app.include_router(health_router)

# API v1 routes
app.include_router(investigations_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(findings_router, prefix="/api/v1")
app.include_router(regulatory_changes_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "AEGIS",
        "tagline": "What happens when the rules change after the investigation is finished?",
        "docs": "/docs",
    }
