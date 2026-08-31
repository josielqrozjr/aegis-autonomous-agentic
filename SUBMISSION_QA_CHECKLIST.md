# Submission QA Checklist

## 1. Projeto e entrega
- [ ] O repositório está limpo e pronto para entrega.
- [ ] A branch principal do trabalho está correta e nomeada claramente.
- [ ] Os commits estão organizados por intenção e seguem o padrão do projeto.
- [ ] O histórico de commits faz sentido para revisão.
- [ ] Não há arquivos temporários, logs, artefatos quebrados ou mudanças acidentais.

## 2. Funcionalidade principal
- [ ] O fluxo principal do demo funciona em ambiente local.
- [ ] O documento da demo é carregado corretamente.
- [ ] Os agentes especialistas executam sem falhas críticas.
- [ ] Os findings são gerados com evidência e rastreabilidade.
- [ ] O Trust Graph é gerado/validado corretamente.
- [ ] O cenário de policy drift/regulatory change funciona.
- [ ] O processo de invalidation e recuperação seletiva está coerente.
- [ ] O fallback determinístico funciona quando o ambiente falha ou a API não responde.

## 3. Testes e validação
- [ ] A suíte relevante passou.
- [ ] Os testes de drift, trust graph e arquitetura continuam verdes.
- [ ] Há cobertura suficiente para os fluxos principais.
- [ ] O comportamento esperado de fail handling foi validado.
- [ ] Os resultados são consistentes com a narrativa do projeto.

## 4. Dados e cenário demo
- [ ] O documento da política de retenção está alinhado com o cenário que será mostrado.
- [ ] As regras regulatórias usadas no demo refletem a história que será contada.
- [ ] Os findings e fixtures estão coerentes com a política e com a versão regulatória.
- [ ] O cenário da mudança de regra está claro e demonstrável.
- [ ] A narrativa da demo não contradiz o que o código faz.

## 5. Narrativa e apresentação
- [ ] O problema principal está claro em uma frase.
- [ ] O impacto do problema é entendido pela audiência.
- [ ] A solução proposta está bem explicada.
- [ ] O diferencial do projeto está evidente.
- [ ] A história da demo adversarial é compreensível em poucos minutos.
- [ ] O que é real no código fica claro e não é exagerado.
- [ ] O que é narrativa de apresentação fica claramente separado do que é funcional.

## 6. Material de submissão
- [ ] O Devpost está finalizado e coerente com o projeto.
- [ ] A Project Story está escrita em linguagem natural e autêntica.
- [ ] O README está pronto para leitura final, sem inconsistências visíveis.
- [ ] O pitch tem foco em problema, solução e impacto.
- [ ] Há pelo menos um cenário concreto que pode ser mostrado ao vivo.
- [ ] A demonstração funcional está pronta para ser executada sem improviso.

## 7. Checklist de apresentação final
- [ ] O projeto está rodando em ambiente local sem ajustes manuais.
- [ ] O fluxo de demo pode ser executado em poucos minutos.
- [ ] O problema de compliance drift pode ser demonstrado em menos de 3 minutos.
- [ ] O Trust Graph e a invalidation cascade fazem sentido para a audiência.
- [ ] O time sabe explicar o caso adversarial de forma clara.
- [ ] O time sabe explicar por que a solução é única.
- [ ] O time sabe separar “funcionalidade demonstrável” de “visão de futuro”.
- [ ] A mensagem final da apresentação está alinhada com o que foi construído.

## 8. Último check antes do envio
- [ ] Tudo foi validado uma última vez.
- [ ] O estado do projeto é consistente com a narrativa de entrega.
- [ ] Nenhuma etapa crítica ficou pendente sem explicação.
- [ ] A apresentação final está pronta para ser entregue com confiança.
