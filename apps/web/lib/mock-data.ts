import { AgentInfo, Finding, Investigation } from "./types";

export const MOCK_AGENTS: AgentInfo[] = [
  {
    id: "pii-scanner",
    name: "PII Scanner",
    role: "Detecção e sanitização de dados pessoais sensíveis",
    model: "Gemma (Vertex AI)",
    status: "COMPLETED",
    currentTask: "Varredura de CPF, RG, emails e identificadores únicos",
    confidence: 0.98,
    findingsCount: 3,
    lastExecutionMs: 420,
  },
  {
    id: "lgpd-specialist",
    name: "Especialista LGPD",
    role: "Avaliação de conformidade com a Lei 13.709/2018",
    model: "Gemini 2.5 Flash",
    status: "COMPLETED",
    currentTask: "Análise de bases legais e término de tratamento (Art. 15 e 16)",
    confidence: 0.94,
    findingsCount: 4,
    lastExecutionMs: 1250,
  },
  {
    id: "gdpr-specialist",
    name: "Especialista GDPR",
    role: "Conformidade com Art. 5(1)(e) e Art. 17 (Direito ao Esquecimento)",
    model: "Gemini 2.5 Flash",
    status: "RUNNING",
    currentTask: "Verificação de prazos de retenção transfronteiriços",
    confidence: 0.91,
    findingsCount: 2,
    lastExecutionMs: 1100,
  },
  {
    id: "iso-specialist",
    name: "Especialista ISO 27001",
    role: "Controles de retenção e destruição de mídia (A.8.10)",
    model: "Gemini 2.5 Flash",
    status: "COMPLETED",
    currentTask: "Mapeamento de descarte seguro e criptografia em repouso",
    confidence: 0.96,
    findingsCount: 1,
    lastExecutionMs: 980,
  },
  {
    id: "evidence-critic",
    name: "Evidence Critic",
    role: "Revisão adversarial e questionamento de conclusões",
    model: "Gemini 2.5 Pro",
    status: "RUNNING",
    currentTask: "Desafiando evidências para eliminar falsos positivos",
    confidence: 0.97,
    findingsCount: 0,
    lastExecutionMs: 2300,
  },
];

export const MOCK_INVESTIGATIONS: Investigation[] = [
  {
    id: "INV-2024-0047",
    title: "Política de Retenção de Dados Corporativos (Multi-Jurisdição)",
    documentName: "politica_retencao_dados_v2.pdf",
    documentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    fileSizeBytes: 245800,
    createdAt: "2026-08-30T13:30:00Z",
    updatedAt: "2026-08-30T15:20:00Z",
    status: "INVESTIGATING",
    progressPercent: 75,
    frameworks: ["LGPD", "GDPR", "ISO 27001"],
    findingsCount: {
      total: 10,
      critical: 3,
      high: 4,
      medium: 2,
      low: 1,
    },
  },
  {
    id: "INV-2024-0046",
    title: "Termos de Uso e Política de Privacidade do App Mobile",
    documentName: "termos_uso_mobile_v1.md",
    documentHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    fileSizeBytes: 112400,
    createdAt: "2026-08-29T10:15:00Z",
    updatedAt: "2026-08-29T11:45:00Z",
    status: "COMPLETED",
    progressPercent: 100,
    frameworks: ["LGPD", "OWASP"],
    findingsCount: {
      total: 5,
      critical: 1,
      high: 1,
      medium: 2,
      low: 1,
    },
  },
];

export const SAMPLE_POLICIES = [
  {
    name: "Política de Retenção de Dados — Sintética BR/EU",
    description: "Cenário oficial da demo multi-jurisdição (LGPD + GDPR + ISO 27001)",
    frameworks: ["LGPD", "GDPR", "ISO 27001"],
    sampleContent: `POLÍTICA CORPORATIVA DE RETENÇÃO E PRIVACIDADE DE DADOS
Versão 2.4 — Setembro 2026

1. OBJETIVO E ESCOPO
Esta política define as diretrizes para armazenamento, tratamento e descarte de dados pessoais e corporativos tratados nos ambientes de produção do AEGIS Group no Brasil e União Europeia.

2. PRAZOS DE RETENÇÃO
2.1. Dados cadastrais e histórico de transações de usuários serão armazenados por prazo indeterminado para fins de inteligência de negócios e personalização de serviços.
2.2. Logs de acesso a servidores e requisições HTTP serão retidos por 30 (trinta) dias, sem expurgo programado de registros que contenham endereços IP ou identificadores pessoais.
2.3. Documentos fiscais e comprovantes bancários serão mantidos pelo prazo de 5 (cinco) anos conforme legislação tributária aplicável.

3. DIREITO AO ESQUECIMENTO E ELIMINAÇÃO
3.1. Solicitações de exclusão de dados pessoais feitas por titulares serão avaliadas pela equipe jurídica em até 90 dias úteis.
3.2. Dados mantidos em backups frios não são afetados por solicitações de exclusão e serão sobrescritos apenas no ciclo padrão de 2 anos.

4. SEGURANÇA E CRIPTOGRAFIA
4.1. Dados em trânsito são protegidos com TLS 1.3. Bases de dados analíticas utilizam senhas compartilhadas restritas ao time de engenharia.`,
  },
];
