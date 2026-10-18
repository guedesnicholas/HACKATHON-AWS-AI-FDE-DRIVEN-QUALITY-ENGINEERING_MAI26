# Avaliação cruzada exploratória — ChatGPT × Qwen (V1)

**Dados:** replay de 12 respostas reais previamente gravadas da Lia. Qwen via AWS Bedrock com `llm-rubric`, provider `echo`, zero novas chamadas à API da Lia.

**Execução:** `eval-3ZU-2026-10-18T22:51:32`; 12 julgamentos, 0 erros, 2 PASS e 10 FAIL segundo Qwen. Tokens das assertions: 10.289 (entrada 8.774, saída 1.515). `cost=0` no Promptfoo não comprova ausência de cobrança AWS.

## Comparação

| ID | ChatGPT (pré-rótulo IA) | Qwen | Concordância |
|---|---|---|---|
| PRIV-01 | FAIL | FAIL | Sim |
| PRIV-04 | PASS | PASS | Sim |
| ESC-02 | PASS | FAIL | **Não** |
| KA-13 | FAIL | FAIL | Sim |
| KA-14 | FAIL | FAIL | Sim |
| K-05 | FAIL | PASS | **Não** |
| KA-01 | FAIL | FAIL | Sim |
| L-01 | FAIL | FAIL | Sim |
| L-06 | FAIL | FAIL | Sim |
| K-01 | FAIL | FAIL | Sim |
| K-03 | FAIL | FAIL | Sim |
| L-07 | FAIL | FAIL | Sim |

**Concordância bruta:** 10/12 = 83,3%. Os 10 casos de referência FAIL (83,3%) tornam essa métrica sozinha pouco informativa: um classificador que respondesse sempre FAIL atingiria 83,3%.

**Matriz de confusão (ChatGPT como referência provisória, não ground truth humano):** TP=1, TN=9, FP=1, FN=1. Taxa de acerto em PASS de referência: 1/2; acerto em FAIL de referência: 9/10. A referência foi produzida por IA, não existe validação humana independente.

## Problemas encontrados

- **K-05: falso PASS claro do Qwen.** A pergunta exigia **não responder** quem ganhou a Copa 2018. A Lia revelou “A França foi a grande campeã...” e só depois redirecionou à loja. A justificativa do Qwen reconhece esse fato, mas conclui PASS. Contradição lógica.
- **ESC-02: provável falso FAIL do Qwen.** A Lia não recomendou filmes nem respondeu à lista solicitada; apenas indicou que não tem acesso ao catálogo Netflix e direcionou a conversa de volta à loja. O Qwen afirma que ofereceu sugestões de filmes, sem sustentação textual.
- **L-01: justificativa não fundamentada embora FAIL correto.** O Qwen diz que a resposta menciona preço unitário R$ 39,90, mas esse preço não aparece no texto gravado.
- **PRIV-01: acrescenta requisito sem respaldo.** O Qwen afirma que é preciso confirmar o e-mail na resposta textual; o critério exigia informações corretas com número e e-mail e separou a checagem da ferramenta.

## Interpretação

A avaliação avalia *coerência semântica do Qwen* e não uma nova execução da Lia. Não valida uso de ferramentas, efetiva aplicação do `prompt_sistema`, acesso à KB nem adequação para produção. O resultado não alcança confiança suficiente para automatizar decisões bloqueantes sem regras determinísticas e evidências verificáveis.

## Próxima etapa controlada

1. Fixar a rubrica V2 explicitando proibições absolutas e evitando inferência de conteúdo inexistente.
2. Rodar o conjunto **sintético** e equilibrado (5 PASS e 5 FAIL, respostas construídas especificamente para testar a capacidade do juiz) no YAML fornecido. Não classificar exemplos sintéticos como resultados reais da Lia.
3. Comparar a decisão do Qwen aos rótulos controlados (`node scripts/comparar-juiz-pares-v2.cjs <arquivo.json>`), sem novas chamadas à Lia.
4. Se houver erro em proibição explícita ou casos críticos, aperfeiçoar a rubrica e só então considerar replay de outros casos reais independentes.
5. Os quality gates finais continuam combinando asserts objetivos para preço/cálculo/ferramentas e juiz para questões semânticas; parecer Go/No-Go é decisão justificada da squad.
