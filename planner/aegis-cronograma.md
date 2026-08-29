# AEGIS — Cronograma Completo do MVP até a Submissão

**Início:** 29/08/2026 às 15h (BRT)  
**Deadline interno recomendado:** 31/08/2026 às 17h30  
**Deadline absoluto:** 31/08/2026 às 19h (BRT)  
**Equipe:** 4 desenvolvedores

---

## 29/08 — DIA 1: FUNDAÇÃO + CORE AGENTIC

### 15:00–15:30 — Kickoff e congelamento do escopo
- [x] Fechar MVP e congelar novas ideias.
- [x] Criar repositório, branches e quadro P0/P1/P2.
- [x] Definir responsabilidades.
- [ ] Fixar cenário principal da demo:
  - [ ] Documentos para testes;
  - [ ] Contexto internacional;
  - [ ] Privacy Agent + Governance Agent + Security Agent.

### 15:30–16:30 — Bootstrap da infraestrutura
- [ ] Google Cloud Project.
- [ ] Vertex AI / Gemini.
- [ ] Google ADK.
- [ ] FastAPI.
- [ ] Next.js.
- [ ] Firestore.
- [ ] Cloud Storage.
- [ ] Pub/Sub.
- [ ] Cloud Run.
- [ ] Primeiro deploy mínimo.

**Entrega:** aplicação base rodando na nuvem.

### 16:30–18:00 — Contratos de dados
Implementar schemas para:
- [ ] `Investigation`
- [ ] `Document`
- [ ] `Agent`
- [ ] `Task`
- [ ] `Requirement`
- [ ] `Evidence`
- [ ] `Finding`
- [ ] `Review`
- [ ] `Remediation`
- [ ] `RegulatoryChange`

### 18:00–20:00 — Agent Registry + Identity
- [ ] Registry.
- [ ] Privacy Agent.
- [ ] Governance Agent.
- [ ] Security Agent.
- [ ] Evidence Critic.
- [ ] Orchestrator/Planner.
- [ ] Capabilities.
- [ ] Jurisdição/domínio.
- [ ] Identidade dos agentes.
- [ ] Descoberta por capability.

**Entrega:** AEGIS consegue descobrir especialistas dinamicamente.

### 20:00–21:00 — Pausa

### 21:00–00:00 — Document Understanding + Planner
- [ ] Upload PDF.
- [ ] Extração de texto. (RUST)
- [ ] Preservação de página/seção.
- [ ] Classificação do documento.
- [ ] Extração de jurisdição, tema, entidades, obrigações e contexto.
- [ ] Planner Agent.
- [ ] Geração do plano de investigação.

**Critério de pronto:**
```text
Documento
→ entendimento
→ plano
→ especialistas necessários
```

### 00:00–02:00 — Dynamic Routing
- [ ] Planner consulta Agent Registry.
- [ ] Seleção dinâmica de agentes.
- [ ] Execução paralela quando aplicável.
- [ ] Tasks persistidas.
- [ ] Estado persistente da investigação.

**Critério de pronto:**
```text
Documento A → agentes A+B+C
Documento B → agentes A+C+D
```

### 02:00–03:00 — Primeiro E2E
- [ ] Documento real.
- [ ] Planner.
- [ ] Routing.
- [ ] Resultados no Firestore.
- [ ] Corrigir P0.
- [ ] Tag `day1-core`.

**Marco do Dia 1:**
```text
Upload
→ Understand
→ Plan
→ Discover
→ Delegate
→ Analyze
```

---

## 30/08 — DIA 2: EVIDENCE + ADVERSARIAL + ACTION

### 08:00–10:00 — Evidence Engine
- [ ] Evidence extraction.
- [ ] Citation por página/seção.
- [ ] Source metadata.
- [ ] Provenance.
- [ ] Requirement ↔ Evidence.
- [ ] Finding ↔ Evidence.
- [ ] `INSUFFICIENT_EVIDENCE`.

**Critério de pronto:** todo finding aponta para evidência verificável ou explica sua ausência.

### 10:00–12:00 — Especialistas regulatórios
- [ ] Privacy Agent.
- [ ] Governance Agent.
- [ ] Security Agent.

Usar um conjunto pequeno de requisitos representativos e verificáveis.

### 12:00–13:00 — Pausa

### 13:00–15:00 — Evidence Graph UI
- [ ] Investigation dashboard.
- [ ] Agent activity.
- [ ] Findings.
- [ ] Requirements.
- [ ] Evidence.
- [ ] Sources.
- [ ] Confidence.
- [ ] Navegação documento/página.
- [ ] Timeline.

### 15:00–17:00 — Adversarial Auditor
- [ ] Evidence Critic / Red Team Agent.
- [ ] Contestação dos findings.
- [ ] Verificação de evidência.
- [ ] Contradições.
- [ ] Aplicabilidade.
- [ ] Resultado:
  - [ ] Confirmed
  - [ ] Rejected
  - [ ] Insufficient Evidence
- [ ] Persistir revisão.

**Critério de pronto:** a revisão pode alterar o resultado inicial.

### 17:00–18:00 — Pausa

### 18:00–20:00 — Remediation Loop
- [ ] Remediation Agent.
- [ ] Recomendação.
- [ ] Criação de ação/tarefa.
- [ ] Owner/status/deadline.
- [ ] Revalidação.
- [ ] Fechamento.

```text
Finding
→ Remediation
→ Action
→ Evidence
→ Re-evaluation
→ Closed
```

### 20:00–22:00 — Async Runtime
- [ ] Pub/Sub.
- [ ] Eventos.
- [ ] Background execution.
- [ ] Persistência de estado.
- [ ] Retomada.
- [ ] Estados:
  - [ ] queued
  - [ ] running
  - [ ] waiting
  - [ ] completed
  - [ ] failed

### 22:00–23:00 — Pausa

### 23:00–01:00 — Regulatory Change Simulation
- [ ] Fonte regulatória versionada/controlada.
- [ ] Evento de alteração.
- [ ] Change Detection Agent.
- [ ] Impact analysis.
- [ ] Identificação de documentos afetados.
- [ ] Reabertura automática.
- [ ] Nova avaliação.

```text
Regulation changed
→ AEGIS detects
→ Impact analysis
→ Affected policy
→ Reopen
→ Re-evaluate
```

### 01:00–02:00 — Observabilidade + Segurança
- [ ] Logs estruturados.
- [ ] Traces por investigação/agente.
- [ ] Audit trail.
- [ ] Capability-based access.
- [ ] Secrets fora do código.
- [ ] Isolamento de ferramentas.
t
### 02:00–03:00 — Full E2E
Executar:

```text
Upload
→ Understand
→ Plan
→ Discover
→ Delegate
→ Evidence
→ Adversarial Review
→ Consolidate
→ Remediate
→ Regulatory Change
→ Reopen
```

**Marco do Dia 2:** MVP funcional de ponta a ponta.

---

## 31/08 — DIA 3: HARDENING + DEMO + SUBMISSÃO

### 08:00–09:00 — Smoke Test
- [ ] Ambiente limpo.
- [ ] Deploy atual.
- [ ] Documento da demo.
- [ ] Dados de teste.
- [ ] Registry.
- [ ] Pub/Sub.
- [ ] Firestore.
- [ ] Cloud Run.

### 09:00–11:00 — Correção P0
Corrigir apenas:
- [ ] upload;
- [ ] planner;
- [ ] dynamic routing;
- [ ] specialist agents;
- [ ] evidence;
- [ ] adversarial review;
- [ ] report;
- [ ] async;
- [ ] regulatory change.

**Não iniciar features novas.**

### 11:00–12:30 — UX Final
- [ ] Fluxo principal óbvio.
- [ ] Loading/status.
- [ ] Agent activity.
- [ ] Findings destacados.
- [ ] Evidence Graph.
- [ ] Adversarial review.
- [ ] Regulatory change.

### 12:30–13:30 — Pausa

### 13:30–15:00 — Relatório Final
- [ ] Resumo executivo.
- [ ] Escopo.
- [ ] Regulamentações aplicáveis.
- [ ] Requisitos.
- [ ] Findings.
- [ ] Evidências.
- [ ] Confidence.
- [ ] Revisões.
- [ ] Recomendações.
- [ ] Remediation.
- [ ] Fontes.
- [ ] Versionamento.

### 15:00–16:00 — README + Arquitetura
- [ ] Problema.
- [ ] Solução.
- [ ] Arquitetura.
- [ ] Agentes.
- [ ] MCP/capabilities.
- [ ] Gemini + ADK.
- [ ] Google Cloud.
- [ ] Setup.
- [ ] Execução.
- [ ] Variáveis de ambiente.
- [ ] Exemplo de investigação.
- [ ] Limitações.
- [ ] Segurança.
- [ ] Diagrama Mermaid.
- [ ] Screenshots/GIFs.

### 16:00–16:45 — Demo Freeze
- [ ] Documento preparado.
- [ ] Respostas estáveis.
- [ ] Evidências estáveis.
- [ ] Evento regulatório preparado.
- [ ] Fallback determinístico.
- [ ] Caminho principal testado.

### 16:45–17:15 — Ensaio / Gravação
Meta:
- [ ] ≤ 4 minutos.
- [ ] Sem telas vazias.
- [ ] Sem tempos mortos.
- [ ] Mostrar autonomia.
- [ ] Mostrar colaboração.
- [ ] Mostrar evidência.
- [ ] Mostrar adversarial review.
- [ ] Mostrar mudança regulatória.

### 17:15–17:30 — Technical Freeze
- [ ] Tag `v1.0-submission`.
- [ ] Commit final.
- [ ] Deploy final.
- [ ] Confirmar URL.
- [ ] Não fazer mudanças estruturais depois daqui.

---

# 31/08 — 17:30–19:00: SUBMISSÃO

### 17:30–18:00 — Vídeo Final
Roteiro:
- [ ] 0:00–0:20 — problema.
- [ ] 0:20–0:55 — upload + understanding.
- [ ] 0:55–1:25 — dynamic agent discovery.
- [ ] 1:25–2:00 — análise + evidências.
- [ ] 2:00–2:30 — adversarial review.
- [ ] 2:30–3:00 — finding auditável.
- [ ] 3:00–3:30 — remediation.
- [ ] 3:30–3:55 — regulatory change + reopen.
- [ ] 3:55–4:00 — closing.

### 18:00–18:20 — Devpost
- [ ] Título.
- [ ] Tagline.
- [ ] Descrição.
- [ ] Problema.
- [ ] Solução.
- [ ] Arquitetura.
- [ ] Tecnologias.
- [ ] Diferencial.
- [ ] Vídeo.
- [ ] GitHub.
- [ ] Deployment URL.
- [ ] Tracks/categorias.

### 18:20–18:40 — QA
- [ ] Links.
- [ ] Vídeo.
- [ ] Repositório.
- [ ] README.
- [ ] Instruções.
- [ ] Nenhuma informação sensível.
- [ ] Projeto correto.

### 18:40–18:50 — Bônus / Conteúdo Extra
- [ ] Post social, se aplicável.
- [ ] Hashtags/referências.
- [ ] Bônus técnicos aplicáveis.

### 18:50–19:00 — SUBMISSÃO
- [ ] Enviar.
- [ ] Confirmar `Submitted`.
- [ ] Salvar confirmação.
- [ ] Não modificar após envio.

---

# DIVISÃO DA EQUIPE

## Dev 1 — AI / Agent Architecture Lead
### Owner: Cainã

### Dia 1
- [ ] Gemini + ADK
- [ ] Agent Registry
- [ ] Agent contracts
- [ ] Document Understanding
- [ ] Planner
- [ ] Dynamic Routing

### Dia 2
- [ ] LGPD
- [ ] GDPR
- [ ] ISO 27001
- [ ] OWASP
- [ ] Evidence Agent
- [ ] Evidence Critic
- [ ] Remediation Agent
- [ ] Change Detection Agent

### Dia 3
- [ ] Prompt hardening
- [ ] Output validation
- [ ] Agent stability
- [ ] Support to demo

---

## Dev 2 — Backend / Cloud / Runtime Lead
### Owner: Josiel

### Dia 1
- [ ] FastAPI
- [ ] Firestore
- [ ] Storage
- [ ] Pub/Sub
- [ ] Cloud Run
- [ ] Persistence
- [ ] Identity/capabilities

### Dia 2
- [ ] Async runtime
- [ ] Investigation state machine
- [ ] Pub/Sub events
- [ ] Audit trail
- [ ] Observability
- [ ] Agent/backend integration
- [ ] Failure handling

### Dia 3
- [ ] Hardening
- [ ] Security
- [ ] Final deployment
- [ ] Smoke tests
- [ ] Monitoring

---

## Dev 3 — Frontend / Evidence Experience Lead
### Owner: Elis

### Dia 1
- [ ] Next.js
- [ ] Upload
- [ ] Investigation screen
- [ ] Agent Activity
- [ ] Investigation statuses

### Dia 2
- [ ] Evidence Graph
- [ ] Findings
- [ ] Requirement details
- [ ] Source/document/page navigation
- [ ] Timeline
- [ ] Adversarial review
- [ ] Remediation UI

### Dia 3
- [ ] UX polish
- [ ] Visual consistency
- [ ] Performance
- [ ] Screenshots/GIFs
- [ ] Demo flow

---

## Dev 4 — Integration / Data / Demo & Submission Lead
### Owner: Alana

### Dia 1
- [ ] Demo documents
- [ ] Test sources
- [ ] Regulatory datasets
- [ ] Expected outputs
- [ ] Integration tests
- [ ] Validate shared contracts

### Dia 2
- [ ] End-to-end integration
- [ ] Evidence Graph data validation
- [ ] Adversarial scenario
- [ ] Regulatory Change scenario
- [ ] Regression tests
- [ ] Deterministic demo fallback

### Dia 3
- [ ] Final integration
- [ ] README
- [ ] Architecture diagram
- [ ] Setup guide
- [ ] Video
- [ ] Devpost
- [ ] Submission QA

---

# PRIORIDADES

## P0 — OBRIGATÓRIO
- [ ] Upload.
- [ ] Document Understanding.
- [ ] Agent Registry.
- [ ] Dynamic Routing.
- [ ] 4 especialistas.
- [ ] Evidence Graph.
- [ ] Adversarial Review.
- [ ] Persistent State.
- [ ] Async Background Task.
- [ ] Regulatory Change Simulation.
- [ ] Cloud Run.
- [ ] Gemini + ADK.
- [ ] Demo funcional.
- [ ] README.
- [ ] Vídeo.
- [ ] Submissão.

## P1 — IMPORTANTE
- [ ] Remediation Loop.
- [ ] Agent Identity.
- [ ] Observability avançada.
- [ ] UX refinada.
- [ ] Report export.
- [ ] Source versioning.

## P2 — SOMENTE SE SOBRAR TEMPO
- [ ] RBAC completo.
- [ ] Autenticação enterprise completa.
- [ ] Mais regulamentações.
- [ ] Mais MCPs.
- [ ] Integrações enterprise reais.
- [ ] Analytics avançado.
- [ ] Dashboards extras.

---

# REGRA DE OURO

> **O objetivo não é construir o produto completo. É construir uma demonstração impossível de confundir com um simples RAG.**

```text
DOCUMENT
   ↓
UNDERSTAND
   ↓
PLAN
   ↓
DISCOVER AGENTS
   ↓
DELEGATE
   ↓
COLLECT EVIDENCE
   ↓
CHALLENGE FINDINGS
   ↓
DECIDE
   ↓
ACT
   ↓
RE-EVALUATE
   ↓
MONITOR
   ↓
REACT TO CHANGE
```

**Definition of Done:**

> Um documento entra no AEGIS e, sem o usuário escolher manualmente os especialistas, o sistema monta uma investigação, executa agentes em paralelo, produz findings com evidências rastreáveis, questiona as próprias conclusões, propõe remediação e reage a uma mudança regulatória posterior em background.
