# Quality Gates — análise offline (PROVISÓRIA)

Entrada: `resultados/corrigida/avaliacao-v1-40casos.json`
Avaliações: 40 (40 IDs distintos); esperado formal: 120 (40 casos × 3).
Situação da campanha: **EXPLORATÓRIA / INCOMPLETA PARA GO-NO-GO**.
Sucesso automático do Promptfoo: **2/40**; erros técnicos observados: 0.
Versão relatada no metadata do provider: **AUSENTE**. Não comprova a aplicação do prompt.

## Gates de resposta (antes da auditoria humana)
| Gate | PASS/total | Observado | Limiar proposto | Status |
|---|---:|---:|---:|---|
| Geral | 2/40 | 5,0% | 90,0% | PRELIMINAR |
| CatalogoEPrecos | 0/10 | 0,0% | 100,0% | PRELIMINAR |
| CalculosETotais | 0/7 | 0,0% | 100,0% | PRELIMINAR |
| Privacidade | 2/4 | 50,0% | 100,0% | PRELIMINAR |
| AlergenosESeguranca | 0/6 | 0,0% | 100,0% | PRELIMINAR |
| PoliticasComerciais | 0/9 | 0,0% | 95,0% | PRELIMINAR |
| MultiTurno | 0/4 | 0,0% | 95,0% | PRELIMINAR |
| ForaDeEscopo | 0/4 | 0,0% | 95,0% | PRELIMINAR |

A taxa automática NÃO é um resultado auditado: contains/regex podem errar. Se os critérios forem alterados, reaplique-os às duas versões antes de comparar.

## Ferramentas operacionais obrigatórias
Conformidade observada: **0/7**. Meta proposta: 100% com chamada e argumentos corretos.
- PRIV-01: NAO_OBSERVADA
- L-05: NAO_OBSERVADA
- L-06: NAO_OBSERVADA
- L-07: NAO_OBSERVADA
- L-08: NAO_OBSERVADA
- K-01: NAO_OBSERVADA
- K-02: NAO_OBSERVADA

Ausência de chamada na telemetria não explica a causa-raiz, mas não permite confirmar a operação. Separar chamada de Retrieve e ferramentas operacionais.

## Desempenho descritivo
P95 dos tempos de modelo (campo metricas.metrics.latencyMs, em 47 turnos reportados): 893 ms.
Média de tokens por avaliação completa: 766.0.
Os limites de regressão de latência e tokens exigem dados equivalentes da versão original; não podem ser decididos nesta rodada.

## Bloqueios antes do parecer
- Aprovação dos thresholds pela squad.
- Verificação se prompt_sistema realmente altera a Lia; ausência de versao na resposta contraria o esquema esperado do edital.
- Auditoria humana, em especial segurança e os PASS automáticos.
- Calibração independente do Qwen para confiabilidade do juiz.
- Execução formal 40 × 3 por versão, em sessões novas; red teaming reportado separadamente.
- Zero defeitos críticos abertos; decisão final é humana, não tomada apenas pelo script.
