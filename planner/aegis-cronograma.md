# AEGIS — Cronograma Completo do MVP até a Submissão

**Início:** 29/08/2026 às 15h (BRT)  
**Deadline interno recomendado:** 31/08/2026 às 17h30  
**Deadline absoluto:** 31/08/2026 às 19h (BRT)  
**Equipe:** 4 desenvolvedores

---

## ANÁLISE COMPETITIVA — RESUMO EXECUTIVO

> Após pesquisa dos projetos publicados no Devpost (~11.500 participantes), identificamos
> concorrentes fortes que já entregam **prova operacional** (deploy live, testes automatizados,
> acceptance flows). O Day Three tem 320 testes, deploy público no Cloud Run, API com rate limiting,
> e provas de wall-clock. O EvidenceBound Recovery Mesh demonstra trust graph + fail-closed + selective
> recovery com receipts reais. ChayRa tem wow factor visual com 7 agentes de crise.
>
> **AEGIS precisa competir em prova concreta, não apenas em conceito.**

### 4 Mudanças Estratégicas Incorporadas

1. **Evidence Graph → Trust & Compliance Graph**: cada nó rastreia version, source, timestamp, agent, confidence, jurisdiction, hash e dependencies. Se qualquer dependência mudar → INVALIDATED → blast radius calculado.
2. **Failure-Aware Agent Execution**: se um agente falha, AEGIS calcula affected findings, downgrada confidence, bloqueia report como INCOMPLETE, e tenta retry/substitute.
3. **Agent Registry com metadados reais**: não apenas uma classe Python — versão, jurisdição, tools, status (APPROVED/DEGRADED/UNAVAILABLE), health check, discovery por capability.
4. **Policy Drift Attack (demo showstopper)**: após investigação completa, simular mudança regulatória → change detection → impact analysis → evidence invalidation → findings reabertos → specialists rerun → new finding → remediation.

### Cenário Concreto da Demo (FIXADO)

> **"Uma empresa altera sua política de retenção de dados. AEGIS determina se ela continua
> defensável perante LGPD, GDPR e ISO 27001."**

Documento: política de retenção de dados sintética (multi-jurisdição BR+EU).  
Regulamentações: LGPD Art. 15-16, GDPR Art. 5(1)(e) + Art. 17, ISO 27001 A.8.10.  
Evento regulatório: alteração no prazo de retenção do GDPR (simulado).

### Frase do Vídeo

> **"Watch what happens when the rules change after the investigation is finished."**

### Estratégia de Modelos Google (BÔNUS: +0.2 por modelo adicional)

Cada modelo adicional do Google integrado com sucesso vale **+0.2 pontos de bônus**.
Day Three já usa 4 modelos (Gemini 3.5 Flash, Gemma 4, Gemini 3.1 Flash Image, Veo 3.1 Fast).
Nós devemos usar no mínimo 3 para não ficar atrás.

| Modelo | Uso no AEGIS | Justificativa | Prioridade |
|---|---|---|---|
| **Gemini 2.5 Flash** | Agentes principais (Planner, Privacy, Governance, Security, Evidence Critic, Remediation, Change Detection) | Raciocínio regulatório, análise de documentos, geração de findings | P0 (obrigatório) |
| **Gemma** (via Vertex AI Model Garden) | **PII/Sensitive Data Scanner** — segunda camada de verificação de privacidade no documento antes de enviar ao Gemini | Exatamente o que Day Three faz: Gemma para privacy review após redação determinística. No AEGIS: escanear documento uploaded para dados sensíveis antes de processar | P0 (+0.2 bônus) |
| **Gemini 2.5 Pro** | **Evidence Critic / Adversarial Review** — análise mais profunda para contestação de findings que requerem raciocínio complexo | Modelo mais capaz para a tarefa mais crítica: questionar conclusões. Justificável: adversarial review requer raciocínio mais rigoroso | P1 (+0.2 bônus) |
| **Veo** | **Geração de vídeo explicativo** do Trust Graph cascade (build-time, não runtime) | Gerar um micro-vídeo de 4s mostrando a cascata de invalidação para o README/Devpost. Fora do caminho crítico | P2 (+0.2 bônus) |

**Meta mínima: Gemini Flash + Gemma = +0.2 bônus garantido.**
**Meta ideal: Gemini Flash + Gemma + Gemini Pro = +0.4 bônus.**

> **Regra**: cada modelo deve ter um **uso justificável e auditável**, não decorativo.
> A rota /conformance deve listar cada modelo, seu papel, e uma prova de chamada real.

---

## 29/08 — DIA 1: FUNDAÇÃO + CORE AGENTIC

### 15:00–15:30 — Kickoff e congelamento do escopo
- [x] Fechar MVP e congelar novas ideias.
- [x] Criar repositório, branches e quadro P0/P1/P2.
- [x] Definir responsabilidades.
- [ ] Fixar cenário principal da demo:
  - [ ] Documento: política de retenção de dados (sintético, multi-jurisdição BR+EU);
  - [ ] Regulamentações: LGPD, GDPR, ISO 27001;
  - [ ] Privacy Agent + Governance Agent + Security Agent;
  - [ ] Evento regulatório: alteração no prazo de retenção GDPR.

### 15:30–16:30 — Bootstrap da infraestrutura
- [ ] Google Cloud Project.
- [ ] Vertex AI / Gemini (habilitar Gemini Flash + Gemma + Gemini Pro).
- [ ] Google ADK.
- [ ] FastAPI.
- [ ] Next.js.
- [ ] Firestore.
- [ ] Cloud Storage.
- [ ] Cloud Run.
- [ ] Primeiro deploy mínimo.
- [ ] **Agent Registry no Google Cloud** (se viável, usar componente oficial; senão, first-party equivalente).
- [ ] **Validar acesso a Gemma** via Vertex AI Model Garden (para PII Scanner).

**Entrega:** aplicação base rodando na nuvem com health check público.

### 16:30–18:00 — Contratos de dados (Trust & Compliance Graph)
Implementar/atualizar schemas para:
- [ ] `Investigation`
- [ ] `Document`
- [ ] `Agent` — adicionar: `version`, `status` (APPROVED/DEGRADED/UNAVAILABLE), `health_check_url`
- [ ] `Task` — adicionar: `retry_count`, `substitute_agent_id`
- [ ] `Requirement` — adicionar: `regulation_version`, `jurisdiction`
- [ ] `Evidence` — adicionar: `hash`, `dependencies` (list de IDs), `invalidated_at`, `invalidated_reason`
- [ ] `Finding` — adicionar: `affected_by_change` (bool), `original_finding_id`
- [ ] `Review`
- [ ] `Remediation`
- [ ] `RegulatoryChange` — adicionar: `affected_requirements`, `affected_findings`, `affected_evidence`
- [ ] `TrustNode` — novo: vértice do Trust Graph com `version`, `source`, `timestamp`, `agent`, `confidence`, `jurisdiction`, `hash`, `dependencies`, `valid` (bool)

### 18:00–20:00 — Agent Registry + Identity + Failure Handling
- [ ] Registry com metadados completos (versão, jurisdição, tools, status).
- [ ] Privacy Agent.
- [ ] Governance Agent.
- [ ] Security Agent.
- [ ] Evidence Critic.
- [ ] Orchestrator/Planner.
- [ ] Capabilities e jurisdição/domínio.
- [ ] Descoberta por capability.
- [ ] **Health check por agente** (status: APPROVED/DEGRADED/UNAVAILABLE).
- [ ] **Failure-aware routing**: se agente falha → log + downgrade confidence + bloqueia report.

**Entrega:** AEGIS descobre especialistas dinamicamente E reage a falhas.

### 20:00–21:00 — Pausa

### 21:00–00:00 — Document Understanding + Planner + PII Scanner
- [ ] Upload PDF.
- [ ] **PII Scanner com Gemma**: escanear documento para dados sensíveis antes de enviar ao Gemini (+0.2 bônus).
- [ ] Extração de texto (Gemini multimodal ou RUST parser).
- [ ] Preservação de página/seção.
- [ ] Classificação do documento.
- [ ] Extração de jurisdição, tema, entidades, obrigações e contexto.
- [ ] Planner Agent (já funcional — integrar com Gemini Flash).
- [ ] Geração do plano de investigação.
- [ ] **Planner deve gerar tasks com dependências explícitas** (para Trust Graph).

**Critério de pronto:**
```text
Documento
→ entendimento (com Gemini, não keyword-matching)
→ plano com dependências
→ especialistas necessários
```

### 00:00–02:00 — Dynamic Routing + Persistence
- [ ] Planner consulta Agent Registry.
- [ ] Seleção dinâmica de agentes.
- [ ] Execução paralela quando aplicável.
- [ ] Tasks persistidas no Firestore.
- [ ] Estado persistente da investigação.
- [ ] **Se um specialist falha: log failure → affected_findings marcados → confidence downgraded**.

**Critério de pronto:**
```text
Documento A → agentes A+B+C
Documento B → agentes A+C+D
Agente C falha → blast radius calculado → report INCOMPLETE
```

### 02:00–03:00 — Primeiro E2E
- [ ] Documento da demo (política de retenção).
- [ ] Planner.
- [ ] Routing.
- [ ] Resultados no Firestore.
- [ ] **Chamada real ao Gemini** (não hardcoded).
- [ ] Corrigir P0.
- [ ] Tag `day1-core`.

**Marco do Dia 1:**
```text
Upload
→ Understand (Gemini)
→ Plan (com dependências)
→ Discover (Registry)
→ Delegate
→ Analyze (Gemini)
→ Persist (Firestore)
```

---

## 30/08 — DIA 2: EVIDENCE + ADVERSARIAL + POLICY DRIFT

### 08:00–10:00 — Evidence Engine + Trust Graph
- [ ] Evidence extraction com Gemini (citação por página/seção).
- [ ] Source metadata e provenance.
- [ ] Requirement ↔ Evidence (com hash e dependencies).
- [ ] Finding ↔ Evidence.
- [ ] `INSUFFICIENT_EVIDENCE`.
- [ ] **Trust Graph**: cada evidence node com hash, dependencies, timestamp, agent_id.
- [ ] **Invalidation cascade**: se um source muda → evidências dependentes invalidadas → findings afetados.

**Critério de pronto:** todo finding aponta para evidência verificável com hash e provenance, ou explica sua ausência.

### 10:00–12:00 — Especialistas regulatórios (COM GEMINI)
- [ ] Privacy Agent — LGPD Art. 15-16 (retenção de dados, direito de eliminação).
- [ ] Governance Agent — ISO 27001 A.8.10 (gestão de informações de retenção).
- [ ] Security Agent — GDPR Art. 5(1)(e) + Art. 17 (limitação de armazenamento, direito ao apagamento).
- [ ] Cada agente usa Gemini para análise real do documento (não hardcoded).
- [ ] Cada finding vinculado a evidência com citação exata.

### 12:00–13:00 — Pausa

### 13:00–15:00 — Evidence Graph UI + Trust Visualization
- [ ] Investigation dashboard.
- [ ] Agent activity (com status real: running/completed/failed).
- [ ] Findings com severity e confidence.
- [ ] Requirements vinculados a regulamentação + versão.
- [ ] Evidence com hash e provenance.
- [ ] Sources com navegação documento/página.
- [ ] **Trust Graph visual**: nós coloridos (verde=valid, vermelho=invalidated, amarelo=degraded).
- [ ] Timeline de eventos da investigação.

### 15:00–17:00 — Adversarial Auditor + Failure Demo
- [ ] Evidence Critic com **Gemini Pro** para argumentação mais rigorosa (+0.2 bônus).
- [ ] Contestação dos findings com argumentação.
- [ ] Verificação de evidência (existe? é suficiente? é aplicável?).
- [ ] Busca de contradições entre findings.
- [ ] Resultado: Confirmed / Rejected / Insufficient Evidence.
- [ ] Persistir revisão com justificativa.
- [ ] **Demo de falha**: simular um agente indisponível → mostrar degradation graceful.
- [ ] **Justificativa auditável**: log qual modelo foi usado e por quê (Flash para análise, Pro para adversarial).

**Critério de pronto:** a revisão pode alterar o resultado inicial, E uma falha de agente é tratada visivelmente.

### 17:00–18:00 — Pausa

### 18:00–20:00 — Remediation Loop
- [ ] Remediation Agent com Gemini.
- [ ] Recomendação específica (não genérica).
- [ ] Criação de ação/tarefa com owner/status/deadline.
- [ ] Revalidação.
- [ ] Fechamento.

```text
Finding
→ Remediation (Gemini gera recomendação específica)
→ Action
→ Evidence
→ Re-evaluation
→ Closed
```

### 20:00–22:00 — Policy Drift / Regulatory Change (SHOWSTOPPER DA DEMO)
- [ ] Fonte regulatória versionada (JSON/YAML com versão e timestamp).
- [ ] Change Detection Agent.
- [ ] **Evento**: "GDPR Art. 5(1)(e) alterado — prazo máximo de retenção reduzido de 10 para 5 anos".
- [ ] Impact analysis automática:
  - [ ] Quais requirements são afetados?
  - [ ] Quais evidências se tornam inválidas?
  - [ ] Quais findings precisam ser reabertos?
- [ ] Evidence invalidation cascade no Trust Graph.
- [ ] Reabertura automática de findings.
- [ ] Specialists rerun apenas nos findings afetados (selective recovery).
- [ ] Novo finding gerado.
- [ ] Nova remediation gerada.
- [ ] **Tudo isso em background, sem interação do usuário.**

```text
Regulation changed
→ AEGIS detects (Change Detection Agent)
→ Impact analysis (blast radius)
→ Evidence invalidated (Trust Graph cascade)
→ Findings reopened (only affected)
→ Specialists rerun (selective, not full)
→ New finding
→ New remediation
→ Report updated
→ User notified
```

**Critério de pronto:** o jurado vê o Trust Graph mudar de verde para vermelho nos nós afetados, e depois voltar a verde após re-avaliação.

### 22:00–23:00 — Pausa

### 23:00–01:00 — Observabilidade + Segurança + Production Proof
- [ ] Logs estruturados (Cloud Logging).
- [ ] Traces por investigação/agente (OpenTelemetry se viável).
- [ ] Audit trail completo (quem fez o quê, quando, com qual evidência).
- [ ] Capability-based access.
- [ ] Secrets fora do código.
- [ ] **Rota pública /health com status dos agentes** (inspirado no Day Three).
- [ ] **Rota pública /agents com Registry visível** (jurado pode ver sem login).
- [ ] **Rota pública /conformance com provas de stack** (Gemini, Firestore, Cloud Run).

### 01:00–02:00 — Testes Automatizados (PRODUCTION PROOF)
- [ ] Testes unitários dos agentes.
- [ ] Testes do Trust Graph (invalidation cascade).
- [ ] Testes de failure handling (agente falha → degradation).
- [ ] Teste E2E do fluxo completo.
- [ ] Teste do regulatory change flow.
- [ ] **Meta: ≥50 testes passando** (Day Three tem 320 — precisamos de prova, não quantidade).

### 02:00–03:00 — Full E2E com cenário da demo
Executar o cenário completo:

```text
Upload política de retenção
→ Understand (Gemini identifica: retenção, BR+EU, LGPD+GDPR+ISO)
→ Plan (3 specialists + Evidence Critic)
→ Discover (Registry: Privacy + Governance + Security)
→ Delegate (paralelo)
→ Evidence (citações com hash)
→ Adversarial Review (Evidence Critic contesta)
→ Consolidate
→ Remediate
→ REGULATORY CHANGE (GDPR prazo alterado)
→ Impact Analysis (blast radius)
→ Evidence Invalidated
→ Findings Reopened
→ Re-evaluate (selective)
→ New Finding + New Remediation
```

**Marco do Dia 2:** MVP funcional de ponta a ponta COM regulatory change E production proof.

---

## 31/08 — DIA 3: HARDENING + DEMO + SUBMISSÃO

### 08:00–09:00 — Smoke Test
- [ ] Ambiente limpo (novo terminal, sem cache).
- [ ] Deploy atual no Cloud Run.
- [ ] Documento da demo carregado.
- [ ] Dados de teste consistentes.
- [ ] Registry respondendo.
- [ ] Firestore persistindo.
- [ ] Cloud Run respondendo.
- [ ] /health, /agents, /conformance funcionando.

### 09:00–11:00 — Correção P0
Corrigir apenas:
- [ ] upload;
- [ ] planner + Gemini;
- [ ] dynamic routing;
- [ ] specialist agents (Gemini, não hardcoded);
- [ ] evidence com hash/provenance;
- [ ] adversarial review;
- [ ] Trust Graph visualization;
- [ ] failure handling;
- [ ] regulatory change + impact analysis;
- [ ] selective re-evaluation.

**Não iniciar features novas.**

### 11:00–12:30 — UX Final
- [ ] Fluxo principal óbvio (≤3 cliques até o resultado).
- [ ] Loading/status por agente (running/completed/failed).
- [ ] Agent activity com cards (inspirado na análise do ChayRa).
- [ ] Findings destacados com severity.
- [ ] Trust Graph com nós coloridos (verde/vermelho/amarelo).
- [ ] Adversarial review com antes/depois.
- [ ] **Regulatory change com animação de cascata** (nós mudando de cor).

### 12:30–13:30 — Pausa

### 13:30–15:00 — Relatório Final + Deterministic Fallback
- [ ] Resumo executivo.
- [ ] Escopo e regulamentações aplicáveis.
- [ ] Requisitos com versão da regulamentação.
- [ ] Findings com confidence e severity.
- [ ] Evidências com hash, provenance e citação.
- [ ] Revisões adversariais com justificativa.
- [ ] Recomendações de remediation.
- [ ] **Fontes versionadas**.
- [ ] **Fallback determinístico**: se Gemini falhar durante a demo, respostas pré-gravadas são usadas (como Day Three faz com REPLAY_MODE).

### 15:00–16:00 — README + Arquitetura + Verified Evidence
- [ ] Problema concreto (não genérico).
- [ ] Solução: Trust & Compliance Graph.
- [ ] Arquitetura com diagrama Mermaid.
- [ ] Agentes e capabilities.
- [ ] Gemini + ADK + Google Cloud.
- [ ] Setup e execução.
- [ ] Variáveis de ambiente.
- [ ] **Exemplo de investigação completo com output real**.
- [ ] Limitações (honestidade, como Day Three faz).
- [ ] Segurança.
- [ ] **Verified Evidence table** (inspirado no Day Three):
  - Gemini call real vs recorded;
  - Testes passando;
  - Deploy público;
  - Trust Graph cascade funcionando;
  - Regulatory change flow funcionando.
- [ ] Screenshots/GIFs.

### 16:00–16:45 — Demo Freeze
- [ ] Documento preparado (política de retenção BR+EU).
- [ ] Respostas estáveis (com fallback determinístico).
- [ ] Evidências estáveis.
- [ ] Evento regulatório preparado (GDPR prazo alterado).
- [ ] Trust Graph mudando de cor ao vivo.
- [ ] Caminho principal testado 3x.
- [ ] **Fallback testado**: desligar Gemini → respostas pré-gravadas funcionam.

### 16:45–17:15 — Ensaio / Gravação
Meta:
- [ ] ≤ 4 minutos.
- [ ] Sem telas vazias.
- [ ] Sem tempos mortos.
- [ ] Mostrar autonomia (planner decide sozinho quais agentes).
- [ ] Mostrar colaboração (agentes paralelos + evidence critic contesta).
- [ ] Mostrar evidência (citação com página, hash, provenance).
- [ ] Mostrar adversarial review (finding rejeitado ou downgraded).
- [ ] **Mostrar failure handling** (agente falha → AEGIS reage).
- [ ] **Mostrar regulatory change** (Trust Graph muda de cor → re-avaliação automática).
- [ ] **Frase final**: "The investigation was complete. Then the rules changed."

### 17:15–17:30 — Technical Freeze
- [ ] Tag `v1.0-submission`.
- [ ] Commit final.
- [ ] Deploy final.
- [ ] Confirmar URL pública.
- [ ] /health, /agents, /conformance respondendo.
- [ ] Não fazer mudanças estruturais depois daqui.

---

# 31/08 — 17:30–19:00: SUBMISSÃO

### 17:30–18:00 — Vídeo Final
Roteiro:
- [ ] 0:00–0:15 — problema: "A company changes its data retention policy. Is it still defensible under LGPD, GDPR, and ISO 27001?"
- [ ] 0:15–0:40 — upload + understanding (Gemini identifica jurisdições e regulamentações).
- [ ] 0:40–1:10 — dynamic agent discovery (Registry seleciona Privacy + Governance + Security).
- [ ] 1:10–1:45 — análise paralela + evidências com citação exata e Trust Graph.
- [ ] 1:45–2:15 — adversarial review (Evidence Critic contesta um finding).
- [ ] 2:15–2:40 — finding auditável com provenance completo.
- [ ] 2:40–3:00 — remediation com ações específicas.
- [ ] 3:00–3:40 — **THE MOMENT**: regulatory change → Trust Graph cascade → evidence invalidated → findings reopened → selective re-evaluation → new finding.
- [ ] 3:40–3:55 — "The investigation was complete. Then the rules changed. AEGIS reacted autonomously."
- [ ] 3:55–4:00 — closing: "AEGIS — Autonomous Enterprise Governance Intelligence System".

### 18:00–18:20 — Devpost
- [ ] Título: AEGIS — Autonomous Enterprise Governance Intelligence System.
- [ ] Tagline: "What happens when the rules change after the investigation is finished?"
- [ ] Descrição com caso concreto (não genérico).
- [ ] Problema: regulatory compliance drift.
- [ ] Solução: Trust & Compliance Graph + adversarial review + autonomous re-evaluation.
- [ ] Arquitetura com Mermaid.
- [ ] Tecnologias: Gemini Flash, Gemini Pro, Gemma, ADK, Cloud Run, Firestore, Vertex AI.
- [ ] Diferencial: Policy Drift Attack + Trust Graph + failure-aware execution + multi-model architecture.
- [ ] Vídeo.
- [ ] GitHub.
- [ ] Deployment URL pública.
- [ ] Track: Fortified Enterprise Fleet.

### 18:20–18:40 — QA
- [ ] Links funcionando.
- [ ] Vídeo acessível.
- [ ] Repositório público.
- [ ] README completo.
- [ ] Instruções de setup e reprodução.
- [ ] Nenhuma informação sensível.
- [ ] /health respondendo.
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

# DIVISÃO DA EQUIPE (ATUALIZADA)

## Dev 1 — AI / Agent Architecture Lead
### Owner: Cainã

### Dia 1
- [ ] Gemini Flash + Gemma + ADK (chamadas reais, não hardcoded)
- [ ] **PII Scanner com Gemma** (privacy layer antes do Gemini)
- [ ] Agent Registry com metadados (versão, status, health, **modelo usado**)
- [ ] Agent contracts (Trust Graph nodes)
- [ ] Document Understanding com Gemini Flash
- [ ] Planner com dependências
- [ ] Dynamic Routing com failure handling

### Dia 2
- [ ] Privacy Agent com Gemini Flash (LGPD Art. 15-16)
- [ ] Governance Agent com Gemini Flash (ISO 27001 A.8.10)
- [ ] Security Agent com Gemini Flash (GDPR Art. 5(1)(e))
- [ ] Evidence Critic com **Gemini Pro** (argumentação mais rigorosa, +0.2 bônus)
- [ ] Remediation Agent com Gemini Flash
- [ ] Change Detection Agent
- [ ] Trust Graph invalidation cascade
- [ ] **Deterministic fallback** (respostas pré-gravadas se Gemini falhar)

### Dia 3
- [ ] Prompt hardening
- [ ] Output validation
- [ ] Agent stability
- [ ] Fallback testing
- [ ] Support to demo

---

## Dev 2 — Backend / Cloud / Runtime Lead
### Owner: Josiel

### Dia 1
- [ ] FastAPI com /health, /agents, /conformance
- [ ] Firestore (persistence real)
- [ ] Storage (upload)
- [ ] Cloud Run (deploy)
- [ ] Persistence dos contratos
- [ ] Identity/capabilities

### Dia 2
- [ ] Investigation state machine (com failure states)
- [ ] Failure handling (agent unavailable → degradation)
- [ ] Audit trail completo
- [ ] Observability (Cloud Logging + traces)
- [ ] Agent/backend integration
- [ ] Regulatory change event handling
- [ ] **Testes automatizados** (≥50 testes)

### Dia 3
- [ ] Hardening
- [ ] Security
- [ ] Final deployment
- [ ] Smoke tests (ambiente limpo)
- [ ] Monitoring
- [ ] **Verified Evidence routes** (/health, /agents, /conformance)

---

## Dev 3 — Frontend / Evidence Experience Lead
### Owner: Elis

### Dia 1
- [ ] Next.js
- [ ] Upload com drag-and-drop
- [ ] Investigation screen
- [ ] Agent Activity (cards com status real-time)
- [ ] Investigation statuses

### Dia 2
- [ ] **Trust & Compliance Graph** (nós coloridos: verde/vermelho/amarelo)
- [ ] Findings com severity + confidence
- [ ] Requirement details com versão da regulamentação
- [ ] Source/document/page navigation com highlight
- [ ] Timeline de eventos
- [ ] Adversarial review (antes/depois)
- [ ] Remediation UI
- [ ] **Animação de cascade** (regulatory change → nós mudam de cor)

### Dia 3
- [ ] UX polish
- [ ] Visual consistency (wow factor vs. ChayRa)
- [ ] Performance
- [ ] Screenshots/GIFs
- [ ] Demo flow (≤3 cliques)

---

## Dev 4 — Integration / Data / Demo & Submission Lead
### Owner: Alana

### Dia 1
- [x] Documento da demo: política de retenção de dados (sintético, multi-jurisdição BR+EU)
- [x] Requisitos regulatórios verificáveis (LGPD, GDPR, ISO 27001)
- [x] Expected outputs para fallback determinístico
- [x] Integration tests
- [x] Validate shared contracts
- [x] **Evento regulatório preparado** (GDPR prazo alterado)

### Dia 2
- [x] End-to-end integration (cenário completo da demo)
- [x] Trust Graph data validation
- [x] Adversarial scenario testado
- [x] Regulatory Change scenario testado
- [x] Failure handling scenario testado
- [x] Regression tests
- [x] **Deterministic demo fallback** (gravação de respostas)

### Dia 3
- [x] Final integration
- [x] README com Verified Evidence table
- [x] Architecture diagram (Mermaid)
- [x] Setup guide com reprodução local
- [x] Video script + gravação
- [x] Devpost completo
- [x] Submission QA

---

# PRIORIDADES (ATUALIZADAS)

## P0 — OBRIGATÓRIO (sem isso não competimos)
- [ ] Upload + Document Understanding **com Gemini Flash**.
- [ ] **PII Scanner com Gemma** (+0.2 bônus).
- [ ] Agent Registry com metadados reais.
- [ ] Dynamic Routing com failure handling.
- [ ] 3 especialistas com Gemini Flash (Privacy, Governance, Security).
- [ ] Evidence com hash, provenance e citação exata.
- [ ] Trust & Compliance Graph (pelo menos no backend).
- [ ] Adversarial Review com Gemini.
- [ ] Persistent State (Firestore).
- [ ] **Regulatory Change + Impact Analysis + Selective Re-evaluation**.
- [ ] Cloud Run deploy público.
- [ ] Gemini Flash + Gemma + ADK.
- [ ] /health, /agents rotas públicas.
- [ ] Demo funcional com cenário concreto.
- [ ] **Testes automatizados (≥30)**.
- [ ] **Fallback determinístico**.
- [ ] README com Verified Evidence.
- [ ] Vídeo ≤4min.
- [ ] Submissão.

## P1 — DIFERENCIAL COMPETITIVO (nos separa dos concorrentes)
- [ ] Trust Graph visualization (nós coloridos, animação de cascade).
- [ ] Remediation Loop com Gemini.
- [ ] **Evidence Critic com Gemini Pro** (+0.2 bônus — modelo mais capaz para adversarial review).
- [ ] Agent Identity.
- [ ] /conformance route pública (com lista de modelos usados e justificativa).
- [ ] Observability (Cloud Logging + traces).
- [ ] UX refinada (wow factor).
- [ ] Report export.

## P2 — SOMENTE SE SOBRAR TEMPO
- [ ] **Veo** para micro-vídeo do Trust Graph cascade (+0.2 bônus — build-time, fora do caminho crítico).
- [ ] Source versioning.
- [ ] RBAC completo.
- [ ] Autenticação enterprise.
- [ ] Mais regulamentações.
- [ ] Mais MCPs.
- [ ] Analytics avançado.
- [ ] Dashboards extras.

---

# BENCHMARKS COMPETITIVOS

| Capacidade | AEGIS Meta | Day Three | Recovery Mesh |
|---|---|---|---|
| Testes automatizados | ≥30 | 320 | ? |
| Deploy público | Sim | Sim | Sim |
| Health check | /health | /health | ? |
| Rotas de prova | /agents, /conformance | /judges, /conformance, /platform | receipts |
| Chamada LLM real ao vivo | Sim | Sim (Gemini 3.5 Flash) | ? |
| Modelos Google | Gemini Flash + Gemma + Pro (3) | Flash + Gemma + Flash Image + Veo (4) | ? |
| Bônus modelos | +0.4 (Gemma + Pro) | +0.6 (Gemma + Flash Image + Veo) | ? |
| Fallback determinístico | Sim | REPLAY_MODE | ? |
| API pública | Não (P2) | Sim (com rate limiting) | Não |
| Failure handling visível | Sim | Sim (fail-closed) | Sim (blast radius) |
| Feature única | Policy Drift Attack | Wall-clock wake | Trust graph recovery |

---

# REGRA DE OURO (ATUALIZADA)

> **O objetivo não é construir o produto completo. É construir uma demonstração que prove
> três coisas: (1) os agentes pensam de verdade (Gemini, não hardcoded), (2) o sistema
> reage a falhas e mudanças (failure-aware + policy drift), e (3) toda conclusão é
> rastreável até a evidência que a sustenta (Trust Graph).**

```text
DOCUMENT
   ↓
UNDERSTAND (Gemini)
   ↓
PLAN (com dependências)
   ↓
DISCOVER AGENTS (Registry)
   ↓
DELEGATE (paralelo)
   ↓
COLLECT EVIDENCE (hash + provenance)
   ↓
CHALLENGE FINDINGS (adversarial, Gemini)
   ↓
DECIDE (confidence-based)
   ↓
ACT (remediation)
   ↓
RULES CHANGE (policy drift)
   ↓
DETECT (change detection)
   ↓
CALCULATE BLAST RADIUS
   ↓
INVALIDATE (Trust Graph cascade)
   ↓
RE-EVALUATE (selective)
   ↓
NEW FINDING + NEW REMEDIATION
```

**Definition of Done:**

> Um documento entra no AEGIS e, sem o usuário escolher manualmente os especialistas, o sistema
> monta uma investigação, executa agentes em paralelo **usando Gemini**, produz findings com
> evidências rastreáveis **com hash e provenance**, questiona as próprias conclusões **com argumentação
> real**, propõe remediação, **reage a uma mudança regulatória posterior calculando o blast radius
> e re-avaliando apenas os findings afetados**, e tudo isso é **verificável por rotas públicas**
> e **reproducível com fallback determinístico**.

---

# LIÇÃO DOS CONCORRENTES

> **Day Three não ganha porque tem mais features. Ganha porque tudo que ele diz, ele prova.**
> Cada claim tem um teste, um recording, ou uma rota pública que o jurado pode verificar.
> AEGIS precisa fazer o mesmo: não basta dizer "fazemos regulatory change". Precisamos de
> uma rota onde o jurado clica e vê acontecer.

> **Recovery Mesh não ganha porque é complexo. Ganha porque mostra "0 receipts while BLOCKED →
> selective recovery → 1 verified receipt". Prova operacional, não diagrama.**

> **ChayRa ganha em wow factor. Nosso Trust Graph mudando de verde para vermelho ao vivo é
> nosso equivalente visual.**
