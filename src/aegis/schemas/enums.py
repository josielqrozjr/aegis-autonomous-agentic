from enum import Enum

class InvestigationStatus(str, Enum):
    QUEUED = "queued"
    UNDERSTANDING = "understanding"
    PLANNING = "planning"
    ROUTING = "routing"
    ANALYZING = "analyzing"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    FAILED = "failed"
    REOPENED = "reopened"

class TaskStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"

class AgentRole(str, Enum):
    PLANNER = "planner"
    DOCUMENT_UNDERSTANDING = "document_understanding"
    PRIVACY_SPECIALIST = "privacy_specialist"
    GOVERNANCE_SPECIALIST = "governance_specialist"
    SECURITY_SPECIALIST = "security_specialist"
    EVIDENCE_CRITIC = "evidence_critic"
    REMEDIATION_SPECIALIST = "remediation_specialist"
    REMEDIATION = "remediation_specialist"
    CHANGE_DETECTION = "change_detection"


class FindingSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class FindingStatus(str, Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"
    REMEDIATED = "remediated"
    CLOSED = "closed"

class ReviewDecision(str, Enum):
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"

class RemediationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    VERIFIED = "verified"


class AgentStatus(str, Enum):
    APPROVED = "approved"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"


class TrustNodeType(str, Enum):
    REQUIREMENT = "requirement"
    EVIDENCE = "evidence"
    FINDING = "finding"
    AGENT = "agent"
    DOCUMENT = "document"


class TrustNodeValidity(str, Enum):
    VALID = "valid"
    INVALIDATED = "invalidated"
    DEGRADED = "degraded"
