# Project Story

> Narrativa final reforçada para submissão, com foco em impacto,.

## Inspiration

Na compliance moderna, o problema mais caro não é a ausência de regras — é a ausência de rastreabilidade quando as regras mudam.

Empresas investem em políticas, auditorias e controles internos, mas muitas vezes não conseguem responder a uma pergunta simples: se uma nova exigência entra em vigor, quais evidências deixam de ser válidas, quais decisões precisam ser reabertas e quais riscos se propagam em cascata?

Esse é o tipo de problema que normalmente não aparece em relatórios de conformidade até que já seja tarde demais. É aí que o AEGIS nasce. Não como mais um assistente de IA para responder perguntas sobre LGPD, GDPR ou ISO 27001, mas como uma plataforma de governança regulatória autônoma: um sistema que entende que compliance não é um checklist estático, e sim um processo contínuo de observação, validação e resposta.

A inspiração para o projeto veio diretamente da realidade operacional de empresas que lidam com risco regulatório em ambientes complexos. O problema não era apenas “ler documentos legais”. O problema era: como garantir que a decisão de conformidade siga sendo confiável quando a evidência envelhece, quando a regra muda de versão e quando o contexto muda sem aviso?

## What it does

O AEGIS é uma plataforma de governança regulatória autônoma que combina agentes especializados, análise documental, rastreio de evidências e lógica de dependência para acompanhar compliance em cenários reais e complexos.

O sistema processa documentos internos, identifica requisitos relevantes, extrai evidências e analisa conformidade por domínio — privacidade, segurança e governança. Mas o diferencial do projeto está na forma como ele lida com mudança regulatória. Em vez de simplesmente registrar que o ambiente mudou, o AEGIS calcula o impacto, invalida apenas os nós afetados no Trust Graph e reexecuta o caminho necessário para restaurar a consistência da decisão.

Isso transforma o compliance de um processo reativo em um processo contínuo e governado por evidência. O sistema não apenas “ouve” o documento; ele entende o contexto, verifica a origem da informação, distingue o que continua confiável do que foi afetado por drift regulatório e permite que a organização responda com menos retrabalho, mais clareza e menos risco.

Em outras palavras, o AEGIS é uma ferramenta para empresas que precisam operar em um ambiente em constante mudança sem perder a integridade das decisões, das evidências e do histórico de conformidade.

## How we built it

A construção do projeto foi guiada por uma ideia central: combinar rigor regulatório com arquitetura de software robusta e com lógica operacional real. Começamos pela criação de um cenário de demonstração plausível, com política de retenção de dados, múltiplas jurisdições e regras em versões diferentes, para que o problema não fosse abstrato.

A partir daí, estruturamos o sistema em camadas: ingestão de documentos, agentes especialistas por domínio, análise de conformidade, rastreio de dependências e recuperação seletiva de estado. O processo não era apenas “um prompt para um modelo”; era preciso definir contratos, origem das evidências, dependências entre findings e lógica de reprocessamento quando a regra mudou.

Essa decisão arquitetural foi fundamental. Privacidade, segurança e governança não podem ser tratadas como um único bloco homogêneo: cada domínio interpreta risco, evidência e obrigação de forma diferente. Por isso, o projeto separou especialistas por área e manteve uma visão central de rastreabilidade e impacto. Isso dá ao sistema uma clareza muito maior do que um agente monolítico: ele não apenas responde; ele explica por que a resposta é válida, o que a sustenta e o que precisa ser revisado.

Também incorporamos um mecanismo de fallback determinístico. Em ambientes de demonstração, testes e validação, não basta que o sistema funcione quando tudo está online. Ele precisa também manter comportamento previsível em falhas ou em execução reproduzível. Esse componente foi decisivo para a robustez do projeto e para a capacidade de demonstrar o sistema em condições reais de operação.

## Challenges we ran into

O maior desafio foi equilibrar realidade regulatória e clareza operacional. Queríamos um cenário plausível para auditoria, mas também legível para apresentação e teste automatizado. Isso exigiu disciplina na modelagem dos documentos, das regras versionadas e da política sintética que sustenta a demonstração.

Outro desafio foi o alinhamento entre documento, evidência e findings. Em vários momentos, era fácil gerar uma conclusão que parecia correta, mas não era rastreável. Quando a resposta era “porque o agente achou”, ela não resolvia o problema. A correção foi disciplinar a arquitetura do sistema: cada finding precisava estar conectado a uma evidência específica, com origem, citação e dependência explícita.

Também foi desafiador modelar a mudança regulatória de forma útil. A ideia não era apenas “mudar um número no JSON” e mostrar que o sistema reconstrói o output. O que realmente importava era preservar a integridade do estado anterior, identificar quem foi afetado e reexecutar apenas o que era necessário. Isso exigiu cuidado com o Trust Graph, com a invalidation seletiva e com o impacto em cascata.

Além disso, havia o risco de cair em uma narrativa artificial de “agentes autônomos” sem substância. Queríamos demonstrar autonomia real — a capacidade de reagir à mudança, revalidar decisões e manter consistência — e não apenas promessas vazias de IA. Essa exigência nos levou a reforçar a parte de rastreio, reprocessamento e explicabilidade.

## Accomplishments that we're proud of

Entre os pontos que mais nos orgulhamos, está a capacidade do AEGIS de transformar um problema documental em uma arquitetura de governança ativa. O sistema não apenas identifica riscos; ele organiza a lógica por trás deles, mostra como uma decisão foi tomada e como ela se relaciona com o contexto regulatório.

Também nos orgulhamos de ter construído um fluxo que funciona em cenário de drift regulatório: a regra muda, os findings dependentes são invalidados e o sistema reexecuta apenas o caminho afetado. Esse comportamento é um dos maiores diferenciais do projeto, porque ele demonstra autonomia real e preservação da integridade da decisão.

Além disso, a combinação de agentes especialistas com Trust Graph e evidência rastreável transforma o projeto em algo mais do que um protótipo de chat. Ele passa a ter a estrutura de um sistema de auditoria, governança e resposta operacional, o que é muito mais alinhado com uso real em ambientes regulados.

Outro ponto importante foi a construção de uma base de validação e reprodutibilidade realista. O projeto não depende apenas de uma demo visual; ele foi pensado para ser testado, reproduzido e validado em cenários de falha, mudança regulatória e evolução de evidência.

## What we learned

Aprendemos que a parte mais difícil de um sistema de compliance inteligente não é a modelagem da regra em si, e sim a modelagem da dependência. Uma regra não existe isoladamente; ela se conecta a evidências, decisões, documentos e interpretações. Quando esse relacionamento é ignorado, o sistema deixa de ser confiável.

Também aprendemos que explicabilidade é essencial em qualquer domínio regulatório. Não basta dizer que o agente “concluiu que há risco”. É preciso mostrar de onde veio a conclusão, qual foi a evidência, quais dependências foram afetadas e por quê. Esse aprendizado moldou grande parte da arquitetura do projeto.

Outro aprendizado importante foi sobre robustez. Em sistemas de IA aplicados a ambientes críticos, a capacidade de sobreviver a falhas e manter comportamento previsível é tão importante quanto a capacidade de inferência. Isso ficou evidente na decisão de incorporar fallback determinístico e reprocessamento seletivo.

## What's next for AEGIS

O próximo passo para o AEGIS é evoluir de uma demonstração técnica de cenários regulatórios para uma plataforma mais completa de governança contínua. A ideia é ampliar o alcance do sistema para outros tipos de documento, outras jurisdições e outros controles de risco, sempre mantendo a mesma lógica de dependência, rastreabilidade e recuperação seletiva.

Também queremos aprofundar a revisão adversarial das evidências, tornando a validação crítica mais explícita e mais útil para auditoria. A próxima etapa é ir além de detectar infringências e passar a sustentar decisões de forma ainda mais robusta, com validação ativa e contexto de risco.

No longo prazo, acreditamos que o AEGIS pode funcionar como um operador de compliance contínuo para empresas que precisam se adaptar rapidamente às mudanças regulatórias sem perder integridade dos dados, das evidências e das decisões que já foram tomadas.

O projeto mostrou que é possível unir IA, governança e rastreabilidade em uma arquitetura que trata mudança de regra como um evento operacional real — e não como uma exceção ocasional. Esse é o caminho que queremos seguir.
