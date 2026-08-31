# AEGIS — Security Model

## Principles

1. **Least privilege**: each agent can only access what its contract permits.
2. **Fail-closed**: when in doubt, block. An agent without the required capability does not execute.
3. **Full auditability**: every action is traceable (who, when, with which evidence).
4. **Secrets never in code**: environment variables or Secret Manager only.
5. **Synthetic data in demo**: no real client data or proprietary regulations.

---

## Security Layers

```text
                    INTERNET
                       │
                       ▼
              ┌────────────────┐
              │  Cloud Run     │  IAM, HTTPS only, no SSH
              │  (ingress)     │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  FastAPI       │  Input validation (Pydantic)
              │  Rate limiting │  File size/type restrictions
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  PII Scanner   │  Gemma: detect/redact PII
              │  (pre-model)   │  before sending to Gemini
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Agent System  │  Capability-based access
              │  (sandboxed)   │  Contract-bound execution
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Firestore     │  IAM-scoped service account
              │  (state)       │  No public access
              └────────────────┘
```

---

## Threat Model

### 1. Prompt Injection

**Vector**: malicious uploaded document containing instructions to manipulate agents.

**Mitigations**:
- Documents are treated as **untrusted data** — never concatenated directly into the system prompt.
- Clear separation between system prompt (agent instructions) and user content (document).
- PII Scanner (Gemma) processes the document before any agent — can detect injection patterns.
- Output validation: findings must contain a valid `requirement_id`, `evidence` with a `quote` from the document, and `confidence_score` within [0.0, 1.0] (Pydantic enforced).
- Evidence Critic validates whether the finding is supported by actual evidence from the document.

### 2. Data Exfiltration via Agent

**Vector**: compromised agent attempts to send data to an external destination.

**Mitigations**:
- Agents have no network access — they execute within the Cloud Run runtime.
- No agent has HTTP/network tools — only text analysis tools.
- Capability-based access: the contract (`AgentContract`) defines exactly what each agent can do.
- Audit trail records every agent ↔ model ↔ data interaction.

### 3. Unauthorized Agent Registration

**Vector**: registration of a malicious agent in the Registry to intercept tasks.

**Mitigations**:
- `AgentRegistry` only accepts agents with valid contracts (`AgentContract` validated by Pydantic).
- In the MVP, the registry is initialized in code (`init_default_registry`) — there is no public registration API.
- Each agent has a fixed `agent_id` and a `role` from a closed enum (`AgentRole`).

### 4. Evidence Tampering

**Vector**: manipulation of stored evidence to alter findings.

**Mitigations**:
- Trust Graph: each piece of evidence has a `content_hash` (SHA-256 of its content).
- `invalidated_at` and `invalidated_reason` are append-only — it is not possible to "un-invalidate" without creating a new node.
- Firestore rules (in production): write access only for the Cloud Run service account.
- Audit trail records who created/modified each piece of evidence.

### 5. Model Abuse / Cost Attack

**Vector**: mass requests to exhaust Gemini/Vertex AI quotas.

**Mitigations**:
- Rate limiting in FastAPI (per IP and per investigation).
- File size limit on upload (max 10MB).
- Investigation budget: maximum number of tasks per investigation (configurable).
- Deterministic fallback: if quota is exceeded, pre-recorded responses are used.

---

## Capability-Based Access Control

Each agent operates under a contract that defines its capabilities:

```python
AgentContract(
    agent_id="agent-privacy-specialist",
    role=AgentRole.PRIVACY_SPECIALIST,
    capabilities=[
        Capability(id="cap-lgpd", ...),
        Capability(id="cap-gdpr-privacy", ...),
    ],
    jurisdictions=["BR", "EU"],
)
```

The Planner can only delegate tasks to agents whose capability and jurisdiction match the requirement:

```text
Requirement: LGPD Art. 15
  → jurisdiction: BR
  → capability: cap-lgpd
  → Registry: discover_specialists(jurisdiction="BR", capabilities=["cap-lgpd"])
  → Result: Privacy Agent (match)
  → Security Agent (no match) → does NOT receive the task
```

---

## Agent Isolation

```text
Agent A (Privacy)     Agent B (Governance)     Agent C (Security)
     │                      │                       │
     ▼                      ▼                       ▼
  Task A                 Task B                  Task C
     │                      │                       │
     ▼                      ▼                       ▼
  Context A              Context B               Context C
  (doc + LGPD reqs)      (doc + ISO reqs)        (doc + GDPR reqs)
```

- Each agent receives only the **relevant context** for its task.
- Agents do not share state directly — they communicate via persisted findings.
- Evidence Critic receives findings from all agents but **cannot modify them** — it can only create Reviews.

---

## Audit Trail

Every action generates a record:

```python
{
    "timestamp": "2026-08-30T14:23:01Z",
    "investigation_id": "inv-abc123",
    "agent_id": "agent-privacy-specialist",
    "action": "finding_created",
    "target_id": "finding-xyz789",
    "model_used": "gemini-3.6-flash",
    "input_hash": "sha256:...",
    "output_hash": "sha256:...",
    "duration_ms": 1842
}
```

Required fields: `timestamp`, `investigation_id`, `agent_id`, `action`, `target_id`.

---

## Secrets Management

| Secret | Storage | Access |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | Env var | Cloud Run service |
| `GEMINI_API_KEY` | Secret Manager | Cloud Run service account |
| `FIRESTORE_*` | IAM (Application Default Credentials) | Cloud Run service account |
| `GEMMA_ENDPOINT` | Env var | Cloud Run service |

No secrets in the repository. `.env.example` with placeholders only.

---

## Upload Security

- **Accepted types**: `application/pdf` only.
- **Maximum size**: 10MB.
- **Validation**: PDF magic bytes verified (not just file extension).
- **Storage**: Cloud Storage with IAM-scoped access — not public.
- **Processing**: document is processed by the PII Scanner (Gemma) before any submission to Gemini.

---

## Trust Graph Security

The Trust Graph is the central integrity mechanism of AEGIS:

```text
Node created
  → hash computed (SHA-256 of content)
  → dependencies registered
  → immutable timestamp

Node invalidated (regulatory change)
  → invalidated_at recorded
  → invalidated_reason recorded
  → cascade: all dependents invalidated
  → blast radius computed and logged

Node re-evaluated
  → NEW node created (does not modify the old one)
  → original_finding_id references the old node
  → new hash computed
```

Existing nodes are never modified — only new nodes are created or invalidation is marked.

---

## Public Routes — Security

| Route | Data exposed | Data NOT exposed |
|---|---|---|
| `GET /health` | Agent status, model status | No investigation data |
| `GET /agents` | Registry: names, roles, capabilities, versions | No analysis results |
| `GET /conformance` | Stack proofs (models, services) | No client data |

Investigation routes (`/investigation/:id/*`) require the `investigation_id` — they are not publicly listable.

---

## Security Limitations (MVP)

> Honesty is stronger than pretending to have complete security.

- **No user authentication**: the MVP does not implement login/JWT. Anyone with the URL can use it.
- **No RBAC**: all users have equal access. Capability-based access is between agents, not between humans.
- **Basic rate limiting**: per IP, not per tenant.
- **No custom encryption at rest**: uses the Firestore default (Google-managed keys).
- **Agent isolation is logical, not physical**: agents run in the same Python process.
- **Audit trail in Firestore**: not in a dedicated SIEM/immutable logging system.
- **PII Scanner is best-effort**: Gemma may not detect all PII patterns.

These limitations are acceptable for a hackathon MVP and are documented in the README.
