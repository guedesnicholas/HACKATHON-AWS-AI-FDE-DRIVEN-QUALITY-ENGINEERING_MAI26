<!-- Este arquivo formaliza responsáveis, volumes de testes, entregas e dependências. -->
# Responsabilidades da squad

**Regra de colaboração:** cada integrante coordena uma frente e produz seus próprios testes; todos participam do Golden Dataset, do Red Teaming, da análise de riscos e da apresentação.

| Integrante | Frente e entrega principal | Golden Dataset | Red Teaming | Pares metamórficos |
|---|---|---:|---:|---:|
| **Kanan** | API, suíte Promptfoo, assertions, execução, métricas e README | 6 | 5 | 1 |
| **Kaua** | Oráculos, cobertura e consolidação do Golden Dataset; thresholds e parecer | 14 | 8 | 2 |
| **Nicholas** | Categorias de ataque, log de red teaming, defeitos e severidade | 10 | 10 | 1 |
| **Livia** | Fluxos comerciais, prompt corrigido, regressão e apresentação | 10 | 7 | 1 |
| **Total** | | **40** | **30** | **5** |

## Categorias do Golden Dataset

| Responsável | Categoria | Casos |
|---|---|---:|
| Kanan | Uso de ferramentas | 2 |
| Kanan | Conversas multi-turno | 2 |
| Kanan | Fora de escopo | 2 |
| Kaua | Catálogo | 8 |
| Kaua | Alérgenos e restrições alimentares | 6 |
| Nicholas | Privacidade e acesso a pedidos | 4 |
| Nicholas | Adversariais | 4 |
| Nicholas | Fora de escopo | 2 |
| Livia | Montagem e cálculo de pedidos | 4 |
| Livia | Cupons | 2 |
| Livia | Consulta de pedidos | 2 |
| Livia | Conversas multi-turno | 2 |

Os **5 pares metamórficos** correspondem a **10 casos já incluídos no total de 40**, e não a dez casos extras.

## Red teaming compartilhado

- **Kanan (5):** desvio de escopo e manipulação de instruções.
- **Kaua (8):** alérgenos (4) e manipulação de políticas e promoções (4).
- **Nicholas (10):** informações internas (5) e privacidade de pedidos (5).
- **Livia (7):** manipulação de cupons (4) e de cálculos/pedidos (3).

**Nicholas coordena e consolida**, mas **todos executam e documentam** suas tentativas no mesmo padrão.

## Dependências principais

1. **Kaua + Kanan:** acordar formato de caso e assertion antes da consolidação e automação completa.
2. **Todos → Kaua:** entregar os respectivos casos revisáveis antes de fechar o Golden Dataset.
3. **Kanan + Kaua → baseline:** suíte e dataset revisados permitem executar a avaliação original completa.
4. **Baseline + Nicholas → Livia:** defeitos e evidências sustentam as correções do prompt.
5. **Livia → Kanan:** o prompt estabilizado permite executar a versão corrigida com os mesmos testes.
6. **Comparação + Nicholas + Kaua → parecer:** métricas, defeitos remanescentes e thresholds fundamentam a decisão.
7. **Todos → Livia:** conteúdo consolidado e demonstração validada permitem concluir os slides.

## Defesa perante a banca

Todos apresentam suas frentes, revisam o parecer e devem compreender os critérios e as principais evidências do projeto.
