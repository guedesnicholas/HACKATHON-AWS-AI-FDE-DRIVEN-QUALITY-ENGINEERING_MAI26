# Avaliação formal parcial — Lia (versão original)

**Responsável:** Kanan  
**Data:** 16/10/2026  
**Ferramenta:** Promptfoo 0.123.1 (Node.js v24.21.0, Windows)  
**Suíte:** `data/golden-dataset/kanan.yaml`  
**Configuração:** `promptfooconfig.kanan.original.yaml`  
**Evidência original:** `resultados/original/kanan-formal-2026-10-16.json`  
**Escopo:** 6 casos de Kanan (K-01 a K-06), com 3 repetições por caso; não representa a suíte completa de 40 casos.

## 1. Execução e métricas

| Indicador | Resultado |
|---|---:|
| Avaliações concluídas | 18 (6 casos × 3 repetições) |
| Aprovações automáticas | 4/18 (22,22%) |
| Reprovações automáticas | 14/18 (77,78%) |
| Erros de execução | 0 |
| Aprovações após auditoria manual preliminar | 2/18 (11,11%) |
| Sessões distintas registradas | 18 |
| Turnos totais de conversa | 27 |
| Ferramentas registradas | Nenhuma nas 18 avaliações (`ferramentas: []`) |
| Tokens de entrada | 15.832 |
| Tokens de saída | 2.036 |
| Tokens totais | 17.868 |
| Latência média por avaliação | 2,99 s |
| Duração total da avaliação | 54,15 s |
| Execução | Concorrência 1; cache desativado; versão original |

**Nota sobre chamadas:** cada avaliação do Promptfoo engloba 1 ou mais turnos. Os 27 turnos correspondem a 27 chamadas previstas à API (`K-01`, `K-02`, `K-05`, `K-06`: 3 cada; `K-03`: 9; `K-04`: 6). O contador `numRequests: 18` do Promptfoo representa as avaliações do provider, não necessariamente todas as requisições HTTP internas. A métrica de custo igual a zero no relatório não demonstra custo real nulo.

## 2. Resultado por caso

| Caso | PASS automático | FAIL automático | Evidência principal |
|---|---:|---:|---|
| K-01 — Consulta de pedido | 0/3 | 3/3 | Não retornou status `entregue`; nenhuma chamada a `consultar_pedido`. |
| K-02 — Cupom NATAL2025 | 0/3 | 3/3 | Pediu subtotal em vez de recusar o cupom expirado; nenhuma chamada à ferramenta de cupom. |
| K-03 — Pedido multi-turno, débito | 0/3 | 3/3 | Total correto: R$ 76,80; respostas: R$ 51,00, R$ 35,00 e R$ 53,00. |
| K-04 — Pedido multi-turno, Pix | 0/3 | 3/3 | Total correto: R$ 87,81; pediu novamente o tamanho, depois informou R$ 47,00 e R$ 82,00. |
| K-05 — Fora de escopo | 2/3 | 1/3 | Uma aprovação automática foi falso positivo: respondeu à pergunta esportiva. |
| K-06 — Reformulação de K-05 | 2/3 | 1/3 | Uma aprovação automática foi falso positivo: respondeu à pergunta esportiva. |

**Revisão humana:** um PASS genuíno em K-05 e outro em K-06, de forma preliminar, pois a Lia evitou dar a resposta esportiva e redirecionou para os produtos/atendimento da loja. As outras duas aprovações automáticas foram classificadas manualmente como falhas, preservando-se os resultados históricos originais.

### Casos relevantes

- **K-01:** nas três execuções, a Lia prometeu consultar o pedido, mas não retornou o status; o campo `ferramentas` veio vazio. Em piloto anterior, a ferramenta `pedidos-e-cupons___consultar_pedido` havia sido registrada. Não há prova da causa da divergência.
- **K-02:** três vezes a Lia pediu o valor do pedido para validar `NATAL2025`, sem recusa explícita ou chamada da ferramenta de cupom.
- **K-03:** o desvio nos totais reflete preços e taxas incompatíveis com a referência oficial adotada no caso. O uso de ferramentas operacionais de montagem de pedido não é obrigatório, conforme esclarecimento do instrutor.
- **K-04:** além dos totais incorretos, uma execução perdeu o tamanho já informado; outras duas não demonstraram o desconto Pix correto.
- **K-05 e K-06:** foram detectadas respostas fora do escopo e dois falsos positivos da expressão regular antiga. A assertion `verificarForaEscopoCopa` foi posteriormente endurecida, com teste local de regressão; a classificação no JSON original não foi modificada.

## 3. Ferramentas, sessões e limitações

A integração com a API REST funcionou sem erros técnicos na execução. O provider iniciava cada avaliação sem enviar identificador prévio de sessão e reutilizava o identificador devolvido apenas nos turnos internos do mesmo caso. O JSON registrou 18 identificadores finais distintos e contagens corretas de turnos (12 avaliações de turno único, 3 com dois turnos e 3 com três turnos).

Todas as 18 avaliações formais registraram `ferramentas: []`. Posteriormente, **uma chamada direta à API REST**, fora do Promptfoo, também retornou `ferramentas: []`, com os campos `resposta`, `sessao`, `ferramentas` e `metricas`. Isso indica que o resultado vazio pode ser devolvido pela própria API; não determina se houve decisão do agente de não usar ferramentas ou ausência de registros no backend. Logs internos e configuração do agente não estão acessíveis à squad. O campo `versao` também não foi retornado nessa chamada direta e não consta dos metadados da avaliação formal.

O instrutor esclareceu que as duas ferramentas operacionais oficiais são **consulta de pedidos** e **validação de cupons**, não existindo ferramenta operacional obrigatória para montar/calcular pedidos. A ausência de ferramentas em K-03/K-04, por si só, não caracteriza defeito. Já em K-01/K-02, deve-se confrontar a ausência de chamadas com os critérios e a finalidade da solicitação.

## 4. Defeitos e achados para consolidação

| Referência | Evidência formal / situação | Encaminhamento |
|---|---|---|
| DEF-001 — Preço incorreto no catálogo | Reforçado pelos totais divergentes de K-03/K-04; não permite atribuir todo desvio exclusivamente ao preço | Nicholas consolida extensão do impacto e severidade |
| DEF-002 — Cupom expirado não recusado | Reproduzido em 3/3 execuções do K-02, sem ferramenta registrada | Atualizar status e evidências |
| DEF-003 — Resposta fora do escopo | Reproduzido em K-05/K-06; resultados automáticos incluem 2 falsos positivos | Atualizar status; registrar auditoria |
| Achado adicional — Falha na consulta K-01 | 3/3 sem consulta operacional registrada e sem status do pedido | Nicholas decide criar ID próprio ou agrupar com defeitos existentes |
| Achado adicional — Perda de contexto K-04 | Repetiu pergunta sobre tamanho, embora o tamanho já fosse conhecido | Nicholas avalia classificação e novo ID |
| Achado de automação — Falsos positivos | 2 PASS do Promptfoo responderam ao tema esportivo | Corrigir assertion e guardar regressão nos testes locais; não classificar automaticamente como defeito da Lia |
| Observação técnica — Ferramentas vazias | `ferramentas: []` nas 18 avaliações e na chamada direta posterior; piloto anterior teve uma chamada correta | Registrar diferença; investigar com instrutor/logs se necessário |

As severidades definitivas e novos identificadores de defeitos cabem a Nicholas, responsável pela consolidação do inventário.

## 5. Rastreabilidade e próximos passos

- Preservar o JSON da avaliação formal original **sem reescrever os resultados** e guardar a configuração e o Golden Dataset usados na execução.
- Registrar a auditoria manual separadamente e manter os 11 testes locais aprovados como evidência da correção da assertion de fora de escopo (não houve reexecução da API após essa correção).
- Comunicar a Nicholas os achados e a Kaua os indicadores, distinguindo taxa automática de taxa auditada.
- Identificar a versão/estado da base de conhecimento no momento de cada campanha. O instrutor informou que a base poderá ser substituída; qualquer comparação entre versões do prompt deverá considerar a mesma base ou explicitar a limitação.
- Após integração dos 40 casos e estabilização do prompt corrigido, executar a mesma suíte nas duas versões com três repetições e sessões independentes; complementar com LLM-as-a-Judge conforme alinhamento do projeto.

**Privacidade:** este resumo não inclui chaves de API nem identificadores de sessão. Antes de compartilhar o JSON bruto no GitHub, revisar e anonimizar seus metadados em uma cópia, preservando o original localmente.
