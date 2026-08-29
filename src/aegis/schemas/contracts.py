from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from aegis.schemas.enums import (
    InvestigationStatus,
    TaskStatus,
    AgentRole,
    FindingSeverity,
    FindingStatus,
    ReviewDecision,
    RemediationStatus,
)

class DocumentSection(BaseModel):
    section_id: str
    page_number: int
    title: Optional[str] = None
    content: str

class Document(BaseModel):
    id: str
    filename: str
    content_type: str
    storage_path: str
    raw_text: Optional[str] = None
    sections: List[DocumentSection] = Field(default_factory=list)
    jurisdiction: Optional[str] = None
    document_type: Optional[str] = None
    extracted_entities: List[str] = Field(default_factory=list)
    obligations: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class Capability(BaseModel):
    id: str
    name: str
    description: str
    jurisdictions: List[str] = Field(default_factory=list)

class AgentContract(BaseModel):
    agent_id: str
    name: str
    role: AgentRole
    description: str
    capabilities: List[Capability] = Field(default_factory=list)
    jurisdictions: List[str] = Field(default_factory=list)
    version: str = "1.0.0"

class Requirement(BaseModel):
    id: str
    code: str  # ex: LGPD-ART-7, GDPR-ART-32, ISO27001-A.5.1
    title: str
    description: str
    regulatory_framework: str # LGPD, GDPR, ISO27001, OWASP
    jurisdiction: str

class Evidence(BaseModel):
    id: str
    document_id: str
    page_number: int
    section_id: Optional[str] = None
    quote: str
    provenance: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Finding(BaseModel):
    id: str
    investigation_id: str
    requirement_id: str
    agent_id: str
    title: str
    description: str
    severity: FindingSeverity
    status: FindingStatus = FindingStatus.OPEN
    evidences: List[Evidence] = Field(default_factory=list)
    insufficient_evidence_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Review(BaseModel):
    id: str
    finding_id: str
    critic_agent_id: str
    decision: ReviewDecision
    reasoning: str
    contradictions_found: List[str] = Field(default_factory=list)
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)

class Remediation(BaseModel):
    id: str
    finding_id: str
    recommendation: str
    action_item: str
    assignee: Optional[str] = None
    status: RemediationStatus = RemediationStatus.PENDING
    deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RegulatoryChange(BaseModel):
    id: str
    framework: str
    version: str
    change_description: str
    affected_requirements: List[str] = Field(default_factory=list)
    detected_at: datetime = Field(default_factory=datetime.utcnow)

class Task(BaseModel):
    id: str
    investigation_id: str
    agent_id: str
    agent_role: AgentRole
    description: str
    status: TaskStatus = TaskStatus.QUEUED
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class InvestigationPlan(BaseModel):
    investigation_id: str
    summary: str
    assigned_agent_ids: List[str] = Field(default_factory=list)
    tasks: List[Task] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Investigation(BaseModel):
    id: str
    title: str
    document: Document
    status: InvestigationStatus = InvestigationStatus.QUEUED
    plan: Optional[InvestigationPlan] = None
    findings: List[Finding] = Field(default_factory=list)
    reviews: List[Review] = Field(default_factory=list)
    remediations: List[Remediation] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
