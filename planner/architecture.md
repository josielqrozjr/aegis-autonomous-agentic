Arquitetura de **modular monolith + hexagonal architecture + vertical slices**, em vez de separar prematuramente em vários microsserviços.

A ideia é reduzir conflito no Git, deixar as fronteiras claras e permitir que cada desenvolvedor seja praticamente dono de determinados diretórios.

```text
aegis/
├── apps/
│   ├── api/                         # Dev 2
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   │
│   │   │   ├── api/                 # Adapters de entrada HTTP
│   │   │   │   ├── deps.py
│   │   │   │   └── v1/
│   │   │   │       ├── investigations.py
│   │   │   │       ├── documents.py
│   │   │   │       ├── agents.py
│   │   │   │       ├── findings.py
│   │   │   │       └── health.py
│   │   │   │
│   │   │   ├── application/         # Use Cases
│   │   │   │   ├── investigations/
│   │   │   │   │   ├── create_investigation.py
│   │   │   │   │   ├── run_investigation.py
│   │   │   │   │   ├── resume_investigation.py
│   │   │   │   │   └── reopen_investigation.py
│   │   │   │   ├── documents/
│   │   │   │   ├── findings/
│   │   │   │   └── remediation/
│   │   │   │
│   │   │   ├── domain/               # Regras de negócio
│   │   │   │   ├── investigation/
│   │   │   │   ├── finding/
│   │   │   │   ├── evidence/
│   │   │   │   ├── agent/
│   │   │   │   └── remediation/
│   │   │   │
│   │   │   └── infrastructure/       # Adapters de saída
│   │   │       ├── firestore/
│   │   │       ├── storage/
│   │   │       ├── pubsub/
│   │   │       ├── vertex_ai/
│   │   │       └── observability/
│   │   │
│   │   └── tests/
│   │
│   ├── worker/                       # Dev 2
│   │   ├── main.py
│   │   ├── consumers/
│   │   │   ├── investigation_consumer.py
│   │   │   ├── regulatory_change_consumer.py
│   │   │   └── remediation_consumer.py
│   │   └── handlers/
│   │       ├── investigation_handler.py
│   │       ├── regulatory_change_handler.py
│   │       └── remediation_handler.py
│   │
│   └── web/                          # Dev 3
│       ├── app/
│       │   ├── page.tsx
│       │   ├── investigations/
│       │   ├── findings/
│       │   ├── agents/
│       │   └── reports/
│       │
│       ├── components/
│       │   ├── investigation/
│       │   ├── evidence/
│       │   ├── findings/
│       │   ├── agents/
│       │   └── ui/
│       │
│       ├── features/
│       │   ├── investigation/
│       │   ├── evidence-graph/
│       │   ├── agent-activity/
│       │   └── remediation/
│       │
│       └── lib/
│           ├── api/
│           ├── hooks/
│           └── utils/
│
├── packages/
│   ├── agents/                       # Dev 1
│   │   ├── core/
│   │   │   ├── base_agent.py
│   │   │   ├── agent_context.py
│   │   │   ├── agent_result.py
│   │   │   └── agent_registry.py
│   │   │
│   │   ├── orchestrator/
│   │   │   ├── planner.py
│   │   │   ├── router.py
│   │   │   ├── task_graph.py
│   │   │   └── execution_policy.py
│   │   │
│   │   ├── specialists/
│   │   │   ├── lgpd/
│   │   │   ├── gdpr/
│   │   │   ├── iso27001/
│   │   │   └── owasp/
│   │   │
│   │   ├── audit/
│   │   │   ├── evidence_agent.py
│   │   │   ├── evidence_critic.py
│   │   │   └── finding_validator.py
│   │   │
│   │   ├── remediation/
│   │   │   └── remediation_agent.py
│   │   │
│   │   └── monitoring/
│   │       └── change_detection_agent.py
│   │
│   ├── mcp/                          # Dev 1
│   │   ├── server.py
│   │   ├── protocol/
│   │   │   ├── tools.py
│   │   │   ├── resources.py
│   │   │   └── schemas.py
│   │   └── providers/
│   │       ├── lgpd/
│   │       ├── gdpr/
│   │       ├── iso27001/
│   │       └── owasp/
│   │
│   ├── contracts/                    # Dono: todos; mudanças controladas
│   │   ├── agent.py
│   │   ├── investigation.py
│   │   ├── document.py
│   │   ├── requirement.py
│   │   ├── evidence.py
│   │   ├── finding.py
│   │   ├── review.py
│   │   ├── remediation.py
│   │   └── regulatory_change.py
│   │
│   └── common/
│       ├── enums.py
│       ├── errors.py
│       ├── logging.py
│       ├── tracing.py
│       └── time.py
│
├── data/
│   ├── demo/
│   │   ├── documents/
│   │   ├── regulations/
│   │   └── scenarios/
│   ├── fixtures/
│   └── expected/
│
├── infra/                            # Dev 2
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── cloud-run/
│   │   │   ├── firestore/
│   │   │   ├── pubsub/
│   │   │   ├── storage/
│   │   │   └── vertex-ai/
│   │   └── environments/
│   │       └── dev/
│   │
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── worker.Dockerfile
│   │   └── web.Dockerfile
│   │
│   └── scripts/
│       ├── deploy.sh
│       ├── seed_demo.sh
│       └── smoke_test.sh
│
├── docs/
│   ├── architecture/
│   │   ├── system.md
│   │   ├── agents.md
│   │   ├── data-flow.md
│   │   └── diagrams/
│   │
│   ├── decisions/                    # ADR
│   │   ├── 0001-architecture.md
│   │   ├── 0002-agent-registry.md
│   │   ├── 0003-evidence-graph.md
│   │   └── 0004-async-runtime.md
│   │
│   └── demo/
│       ├── scenario.md
│       └── script.md
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   ├── contract/
│   └── smoke/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example
├── docker-compose.yml
├── Makefile
├── pyproject.toml
├── package.json
└── README.md
```

## O segredo para não haver conflito

Eu estabeleceria **ownership de diretórios** desde o primeiro commit:

```text
Dev 1
├── packages/agents/
├── packages/mcp/
└── packages/contracts/agents-related

Dev 2
├── apps/api/
├── apps/worker/
└── infra/

Dev 3
└── apps/web/

Dev 4
├── data/
├── tests/
└── docs/
```

Mas há uma exceção:

```text
packages/contracts/
```

é uma área compartilhada.

**Ninguém deve alterar contratos arbitrariamente.**

Quando alguém precisar mudar um schema:

```text
1. cria branch
2. abre PR
3. explica impacto
4. merge
5. demais branches sincronizam
```

Isso evita o clássico:

> Dev 1 altera `Finding` → Dev 2 quebra backend → Dev 3 quebra frontend → Dev 4 perde testes.

---

# Design Patterns que eu usaria

## 1. Hexagonal Architecture / Ports & Adapters

É a principal.

O domínio não sabe que existe:

* Firestore;
* Gemini;
* Pub/Sub;
* MCP;
* HTTP.

Por exemplo:

```python
class InvestigationRepository(Protocol):
    def save(self, investigation: Investigation) -> None: ...
    def get(self, investigation_id: str) -> Investigation: ...
```

E:

```text
domain/application
       │
       ▼
     PORT
       │
       ▼
FirestoreAdapter
```

Assim vocês podem trocar Firestore por outro storage sem destruir a regra de negócio.

---

## 2. Strategy Pattern

Perfeito para os especialistas.

```python
class ComplianceStrategy(Protocol):
    def analyze(self, context) -> AgentResult:
        ...
```

Depois:

```text
LGPDStrategy
GDPRStrategy
ISO27001Strategy
OWASPStrategy
```

O Planner decide qual estratégia/capability utilizar.

---

## 3. Factory / Abstract Factory

Para criação dos agentes:

```python
agent = AgentFactory.create(
    agent_type="gdpr",
    context=context
)
```

Não espalhar:

```python
GDPRAgent(...)
GDPRAgent(...)
GDPRAgent(...)
```

por toda a aplicação.

---

## 4. Registry Pattern

É essencial para o AEGIS.

```text
AgentRegistry
├── register()
├── unregister()
├── get()
├── find_by_capability()
└── list_available()
```

Exemplo:

```python
registry.find_by_capability(
    domain="privacy",
    jurisdiction="BR"
)
```

Isso é justamente o mecanismo que transforma o sistema em uma **fleet de agentes**, e não apenas uma sequência fixa de chamadas.

---

## 5. Chain of Responsibility

Para o pipeline de análise:

```text
Document
   ↓
Classification
   ↓
Applicability
   ↓
Evidence
   ↓
Finding
   ↓
Validation
```

Cada etapa pode:

```text
process()
  ↓
pass
  ↓
next
```

É especialmente útil para validações.

---

## 6. Command Pattern

Muito útil para o runtime assíncrono:

```text
InvestigationCommand
AnalyzeDocumentCommand
RunAgentCommand
ValidateFindingCommand
RemediateFindingCommand
ReopenInvestigationCommand
```

Pub/Sub transporta comandos/eventos.

---

## 7. State Pattern

Eu usaria explicitamente para `Investigation`.

```text
QUEUED
   ↓
RUNNING
   ↓
WAITING
   ↓
REVIEWING
   ↓
COMPLETED
   ↓
REOPENED
```

Evita colocar dezenas de:

```python
if status == ...
```

espalhados pelo código.

---

## 8. Observer / Event-Driven Architecture

Para a parte mais importante do AEGIS:

```text
RegulatoryChangeDetected
        ↓
Event Bus
        ├── ImpactAnalysis
        ├── InvestigationReopen
        ├── Notification
        └── AuditLog
```

Pub/Sub funciona muito bem aqui.

---

## 9. Saga Pattern

Para a investigação de longa duração.

A investigação pode ter:

```text
Task 1
Task 2
Task 3
Task 4
```

Se Task 4 falhar:

```text
retry
↓
resume
↓
compensate if necessary
```

Não precisa implementar uma Saga extremamente sofisticada; basta estruturar o workflow como uma sequência de etapas persistidas e retomáveis.

---

## 10. Adapter Pattern

Especialmente importante para os MCPs:

```text
                    AEGIS
                      │
                MCP Interface
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
     GDPRAdapter  LGPDAdapter  OWASPAdapter
        ↓             ↓             ↓
     Source A      Source B      Source C
```

Assim, o restante do sistema não precisa conhecer a origem concreta.

---

# O padrão arquitetural que eu escolheria

No nível mais alto:

```text
                 ┌───────────────────────┐
                 │      Next.js Web       │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │      FastAPI API       │
                 │       Adapter          │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Application Layer    │
                 │       Use Cases        │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │      Domain Core       │
                 │ Entities + Rules       │
                 └───────────┬───────────┘
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
             Agent System          Event System
                   │                   │
                   ▼                   ▼
             Google ADK              Pub/Sub
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        GDPR     LGPD      ISO/OWASP
          │        │        │
          └────────┼────────┘
                   ▼
                  MCP
                   │
                   ▼
          External Knowledge
```

Isso é essencialmente:

**Hexagonal Architecture + Domain/Application separation + Event-driven architecture + Agent Registry + Strategy/Factory patterns.**

---

# Para o Git: uma regra que eu considero obrigatória

Cada feature deve ser um **vertical slice**.

Em vez de:

```text
feature-gdpr/
    backend/
    frontend/
    database/
```

eu prefiro manter a separação arquitetural acima, mas fazer cada PR atravessar somente os contratos necessários.

Exemplo:

```text
feat/gdpr-agent
feat/evidence-critic
feat/evidence-graph
feat/regulatory-change
feat/async-runtime
```

E branches individuais:

```text
dev1/feat-gdpr-agent
dev2/feat-async-runtime
dev3/feat-evidence-graph
dev4/feat-demo-data
```

Nunca:

```text
dev/josiel
dev/john
dev/maria
dev/foo
```

por vários dias sem merge.

---

# Regra de PR

Eu colocaria:

```text
PR pequeno
↓
1 responsabilidade
↓
1 reviewer
↓
CI
↓
merge
```

E **não permitam que `main` seja usado diretamente para desenvolvimento**.

```text
main
  ↑
PR
  ↑
feature branch
```

---

# Um detalhe particularmente importante para vocês

**Não façam o Dev 4 alterar código de todos os outros.**

O Dev 4 deve ser o **Integration / QA / Demo Lead**, mas ele trabalha principalmente em:

```text
data/
tests/
docs/
```

e faz integração via PR.

Assim vocês evitam a situação:

> “Dev 4 virou o integrador e agora todo mundo espera por ele.”

Ele deve **detectar incompatibilidades**, não ser o gargalo para resolvê-las.

---

# E eu faria um arquivo que vai salvar vocês

```text
docs/CONTRIBUTING.md
```

Com regras simples:

```markdown
# Contribution Rules

1. Never commit directly to main.
2. One feature per branch.
3. Keep PRs small.
4. Do not change contracts without review.
5. Domain must not depend on infrastructure.
6. Agents communicate through contracts.
7. External systems are accessed through adapters.
8. All async jobs must be idempotent.
9. Add tests for new business rules.
10. Rebase/merge main before final review.
```

A regra **“all async jobs must be idempotent”** é especialmente importante no AEGIS: Pub/Sub pode entregar novamente uma mensagem, então `RunInvestigationCommand` não pode simplesmente executar tudo de novo sem verificar o estado.

### Em resumo

Para o hackathon, eu escolheria:

**Hexagonal Architecture + Strategy + Factory + Registry + State + Command + Observer/Event-Driven + Adapter**, com **modular monolith**, e não microsserviços.