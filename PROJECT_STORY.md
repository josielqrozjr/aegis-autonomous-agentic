# Project Story

## Inspiration

A ideia para o AEGIS nasceu de uma frustração recorrente em ambientes empresariais e regulatórios: a conformidade é tratada como um checkpoint estático. Um documento é revisado, uma auditoria é concluída, e a organização segue em frente — até que uma nova regra entra em vigor, uma exigência muda de interpretação ou uma evidência antiga deixa de ser suficiente.

Foi esse tipo de cenário que nos inspirou. Não era apenas sobre automatizar a leitura de documentos jurídicos ou criar mais um agente de IA para responder perguntas. Era sobre construir algo que entendesse a realidade operacional de compliance: as regras mudam, os dados envelhecem, e a cadeia de evidência precisa continuar confiável mesmo quando o contexto muda.

Também houve uma inspiração muito prática no tipo de risco que normalmente fica invisível para as empresas. Em muitos ambientes, a maior falha não é a ausência de regras, mas a ausência de rastreabilidade. Se uma evidência deixa de ser válida, o que acontece com os findings que dependem dela? Quem reabre aquele caso? Quem decide o impacto real? Esse problema nos levou a pensar em um sistema que não apenas analisa documentos, mas também entende dependências, rastreia evidências e reage ao drift regulatório.

## What it does

O AEGIS é uma plataforma de governança regulatória autônoma que combina agentes especializados, análise documental e rastreio de evidências para acompanhar compliance em ambientes complexos, especialmente em cenários que envolvem LGPD, GDPR e ISO 27001.

O sistema processa documentos de política interna, identifica requisitos relevantes, extrai evidências, analisa a conformidade por domínio e cria findings com rastreabilidade explícita. O diferencial está em como ele trata a mudança de regra: em vez de apenas registrar que o ambiente mudou, ele calcula o impacto, invalida apenas os nós afetados no Trust Graph e reexecuta o caminho necessário para restaurar a consistência.

Em outras palavras, o AEGIS tenta transformar compliance de um processo reativo em um processo contínuo. Ele não apenas “ouve” o documento; ele entende o contexto, verifica a origem da evidência, distingue o que é confiável do que foi afetado por mudança regulatória e permite que a organização responda com menos custo e maior segurança.

## How we built it

A construção do projeto foi guiada pela ideia de combinar duas coisas que normalmente não coexistem bem: rigor regulatório e velocidade de prototipagem. Começamos pela definição de um cenário de demonstração realista, com política de retenção de dados e regras de múltiplas jurisdições, para que a solução tivesse um problema concreto para resolver.

Em seguida, estruturamos o sistema em camadas: ingestão de documentos, agentes especialistas, análise de conformidade, trust graph, evidências e recuperação seletiva. O processo não era apenas “um prompt para um modelo”; era preciso definir contratos, dependências, rastreio de origem e lógica de reprocessamento quando a regra mudava.

A escolha pela arquitetura multiagente foi importante porque o problema não é homogêneo. Privacidade, segurança e governança não têm a mesma interpretação de risco nem as mesmas exigências. Portanto, o projeto separou especialistas por domínio e manteve uma visão central de evidência e dependência. Isso permitiu que a solução tivesse mais clareza e mais capacidade de explicar por que uma decisão era válida ou não.

Também foi fundamental incorporar um mecanismo de fallback determinístico. Em contextos de demonstração e validação, não é suficiente que o sistema funcione quando tudo está online. Ele precisa continuar sendo útil mesmo quando a API falha ou quando a execução precisa ser reproduzida de maneira previsível. Esse elemento foi decisivo para a robustez do projeto e para a capacidade de demo.

## Challenges we ran into

Um dos maiores desafios foi equilibrar realidade e clareza. Queríamos um cenário que fosse plausível para auditoria regulatória, mas também legível para apresentação e para testes automatizados. Isso exigiu trabalho cuidadoso na estrutura dos dados, especialmente na política sintética e nas regras versionadas.

Outro desafio foi o alinhamento entre documento, evidência e findings. Em vários momentos, ficava fácil gerar uma conclusão que parecia correta, mas que não era rastreável. Quando a resposta era “porque o agente achou”, ela não resolvia o problema. A solução exigiu disciplina: cada finding precisava se conectar a uma evidência específica, com origem, citação e hash. Isso foi uma mudança importante na forma como pensamos o sistema.

Também enfrentamos a dificuldade de modelar a mudança regulatória de forma útil. A ideia não era apenas “mudar um número no JSON” e mostrar que o sistema reconstrói o output. O que importava era preservar a integridade do estado anterior, identificar quem foi afetado e reexecutar apenas o que era necessário. Isso exigiu arquitetura e cuidado com a lógica do trust graph e do impacto em cascata.

Além disso, a parte mais delicada foi evitar uma narrativa artificial de “inteligência autônoma” sem substância. Queríamos um projeto que realmente demonstrasse autonomia em termos de resposta a mudanças, sem cair em promessas vazias. Essa exigência nos levou a reforçar a parte de rastreio, invalidation e recuperação seletiva.

## Accomplishments that we're proud of

Entre os pontos que mais nos orgulhamos, está a capacidade do sistema de transformar um problema documental em uma arquitetura de governança ativa. O AEGIS não apenas identifica riscos; ele organiza a lógica por trás deles e mostra como a decisão foi tomada.

Também nos orgulhamos de ter construído um fluxo que funciona em cenário de drift regulatório: a regra muda, os findings dependentes são invalidados e o sistema reexecuta apenas o caminho afetado. Esse comportamento é um dos maiores diferenciais do projeto e a parte que melhor expressa a ideia central de autonomia.

Além disso, a combinação de agentes especialistas com trust graph e evidência criptográfica torna a plataforma mais do que um protótipo de chat. Ela passa a ter uma estrutura de auditoria, rastreabilidade e reatividade que faz sentido para uso prático.

Outro ponto importante foi a construção de uma base de dados e de testabilidade realista. O projeto não depende só de uma demo bonita; ele foi pensado para ser validado, reproduzido e testado em cenários de falha e mudança regulatória. Isso aumentou muito a maturidade do resultado.

## What we learned

Aprendemos que a parte mais difícil de um sistema de compliance inteligente não é a modelagem da regra em si, e sim a modelagem da dependência. Uma regra não existe isoladamente; ela se conecta a evidências, decisões, documentos e interpretações. Quando esse relacionamento é ignorado, o sistema deixa de ser confiável.

Também aprendemos que a explicabilidade é essencial em domínio regulatório. Não basta dizer que “o agente concluiu que há risco”. É preciso mostrar de onde veio essa conclusão, qual foi a evidência, quais dependências foram afetadas e por quê. Esse aprendizado moldou boa parte da arquitetura do projeto.

Outro aprendizado importante foi sobre robustez. Em sistemas de IA aplicados a ambientes críticos, a capacidade de sobreviver a falhas e a manter um comportamento previsível é tão importante quanto a capacidade de inferência. Isso ficou evidente na decisão de incluir um modo de fallback determinístico e mecanismos de reprocessamento seletivo.

## What's next for AEGIS

O próximo passo para o AEGIS é evoluir de uma demonstração técnica de cenário regulatório para uma plataforma mais completa de governança contínua. A ideia é ampliar o alcance do sistema para outros tipos de documento, outras jurisdições e outros controles de risco, mantendo a mesma lógica de dependência e rastreabilidade.

Também queremos aprofundar a interpretação adversarial das evidências, tornando a revisão crítica mais explícita e mais útil para a auditoria. Em outras palavras, a próxima etapa é ir além de detectar infringências e passar a sustentar decisões de forma mais robusta, com validação ativa e contexto de risco.

No longo prazo, acreditamos que o AEGIS pode funcionar como um “operador de compliance contínuo” para empresas que precisam adaptar-se rapidamente às mudanças regulatórias sem perder a integridade dos dados, das evidências e das decisões que já foram tomadas.

O projeto mostrou que é possível unir IA, governança e rastreabilidade em uma arquitetura que pensa em mudança de regra como um evento de negócio, e não apenas como uma exceção ocasional. Esse é o caminho que queremos seguir.
