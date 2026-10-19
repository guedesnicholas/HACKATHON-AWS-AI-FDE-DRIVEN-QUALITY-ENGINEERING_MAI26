# Hackathon de Quality Engineering — Lia / Pop & Doce

> **Situação da entrega:** campanha formal Promptfoo executada; parecer **NO-GO técnico recomendado**, sujeito à homologação da squad e às limitações abaixo. **DeepEval não integra a entrega final.**
>
> **Corte de análise:** repositório `main` auditado no commit `04652d1f333590c8ace98c2edcdfc7e5ea752124`, em 18/10/2026. Se o repositório avançar, conferir diferenças antes de reutilizar os números.

## Problema e objetivo

A **Pop & Doce**, empresa fictícia do desafio, pretende disponibilizar a **Lia**, agente conversacional de vendas. A squad deve testar confiabilidade factual, cálculos, políticas comerciais, privacidade, alérgenos, resistência a ataques, uso de ferramentas e comportamento em diálogos, então recomendar **GO/NO-GO** com evidências. A base oficial fornecida pelos instrutores é o oráculo das informações comerciais; os critérios de aprovação quantitativos foram **propostos pela squad**, não impostos pelo edital.

## Resultado executivo — campanha formal

| Indicador | Campanha original | Campanha rotulada «corrigida» |
|---|---:|---:|
| Casos únicos | 40 | 40 |
| Repetições por caso | 3 | 3 |
| Avaliações registradas | 120 | 120 |
| PASS **automático** do Promptfoo | **12/120 (10,0%)** | **8/120 (6,7%)** |
| Sessões distintas registradas | 120 | 120 |
| Erros técnicos registrados na campanha formal | 0 | 0 |
| Versão do agente confirmada pelo campo `versao` | Não | Não |
| Chamadas operacionais comprovadas pelo campo `ferramentas` | Não | Não |

**Interpretação obrigatória:** os números acima reproduzem as **assertions originais**, algumas com falsos PASS e falsos FAIL demonstrados. Não representam a taxa de acerto semântico auditada em 240 respostas. O provider enviava `prompt_sistema` quando rotulado «corrigida», mas a API não retornou `versao` nos 240 registros: **não está comprovada a aplicação efetiva do prompt**, logo a diferença de −3,3 p.p. não demonstra regressão causada por ele. `ferramentas: []` foi reportado em todos os resultados; **isso não comprova** que nenhuma ferramenta foi acionada internamente.

**Parecer técnico recomendado:** **NO-GO para disponibilização sem mitigação**, diante de falhas de segurança alimentar, cálculos/políticas e ausência de evidência operacional suficiente. A decisão final deve ser homologada pela squad e formalizada no parecer de até oito páginas.

## Escopo e tecnologias

- **Promptfoo** (`package.json`) como motor das avaliações da API REST da Lia.
- **Golden Dataset:** 40 casos, distribuídos em 4 YAMLs, com **6 pares declarados** de testes metamórficos (`M-01` a `M-06`). O par `M-03` requer revisão conceitual: a reformulação introduz alergia grave, não sendo estritamente equivalente ao contexto inicial.
- **Campanhas formais:** 40 casos × 3 repetições × 2 rótulos = **240 avaliações**; sessão independente por repetição, compartilhada entre os turnos de um mesmo caso.
- **Red teaming:** 30 cenários distribuídos em 8 categorias no CSV central. Os registros de três tentativas por cenário **não foram todos conciliados** com evidência verificável; consulte a seção de reconciliação.
- **Qwen no Bedrock:** experimentos exploratórios de juiz; **não** houve calibração contra ground truth humano independente suficiente para torná-lo um gate autônomo.
- **DeepEval:** explorado, mas retirado do escopo da entrega por decisão do projeto, sem resultados da ferramenta utilizados no parecer.

## Estrutura do repositório

| Diretório/arquivo | Finalidade |
|---|---|
| [`base-de-conhecimento-oficial/`](base-de-conhecimento-oficial/) | Referências oficiais e massa de teste fictícia |
| [`data/golden-dataset/`](data/golden-dataset/) | 40 casos, critérios, fontes e pares metamórficos |
| [`src/`](src/) | Cliente HTTP, provider Promptfoo e assertions |
| [`prompts/lia-corrigida.txt`](prompts/lia-corrigida.txt) | Prompt proposto para a campanha corrigida |
| [`promptfooconfig.formal.original.yaml`](promptfooconfig.formal.original.yaml) | Configuração do teste formal original |
| [`promptfooconfig.formal.corrigida.yaml`](promptfooconfig.formal.corrigida.yaml) | Configuração do teste formal rotulado corrigido |
| [`resultados/formal/`](resultados/formal/) | Dois JSONs de 120 avaliações cada, preservados como evidências históricas |
| [`docs/relatorio-auditoria-offline.md`](docs/relatorio-auditoria-offline.md) | Comparação e auditoria seletiva dos resultados formais |
| [`docs/comparacao-40-casos.csv`](docs/comparacao-40-casos.csv) | PASS por caso nas duas campanhas |
| [`docs/defeitos.md`](docs/defeitos.md) | Inventário priorizado de achados e evidências |
| [`docs/decisoes.md`](docs/decisoes.md) | Decisões, ressalvas e pendências de homologação |
| [`red-team/tentativas.csv`](red-team/tentativas.csv) | Registro original de 30 cenários adversariais |
| [`red-team/REVISAO-LOG-EVIDENCIAS.md`](red-team/REVISAO-LOG-EVIDENCIAS.md) | Reconciliação das campanhas de red teaming |
| [`docs/parecer-go-no-go.md`](docs/parecer-go-no-go.md) | **A preencher na etapa seguinte:** parecer final, até oito páginas |
| [`apresentacao/`](apresentacao/) | **Etapa posterior:** apresentação de 15–20 minutos |

## Como reproduzir a suíte (sem expor segredos)

Requer Node.js compatível, npm e **a chave da Lia em `LIA_API_KEY`** configurada localmente. Nunca versione `.env`, tokens AWS ou registros contendo credenciais reais.

```powershell
npm ci
npm test
```

**Inspeção offline dos resultados existentes, sem custo de API:**

```powershell
node scripts/auditar-gates-formais.cjs resultados/formal/original-40x3.json original
node scripts/auditar-gates-formais.cjs resultados/formal/corrigida-40x3.json corrigida
```

**Reexecução online — somente com autorização e orçamento da squad:**

```powershell
npx promptfoo eval -c promptfooconfig.formal.original.yaml --no-cache --max-concurrency 1 -o resultados/formal/original-NOVA-EXECUCAO.json
npx promptfoo eval -c promptfooconfig.formal.corrigida.yaml --no-cache --max-concurrency 1 -o resultados/formal/corrigida-NOVA-EXECUCAO.json
```

**Não sobrescrever os JSONs históricos** `original-40x3.json` e `corrigida-40x3.json`. O edital permite no máximo quatro chamadas simultâneas, mas as campanhas acima usam uma; não realizar testes de carga. A API fornece as chamadas no contexto de um cenário fictício e exige dados fictícios.

## Limitações verificadas

1. `versao` não foi observado nos metadados das 240 avaliações; o campo de prompt corrigido foi **enviado pelo provider**, porém sua aplicação não foi comprovada.
2. `ferramentas: []` em todos os resultados formais; chamada operacional e argumentos não foram comprovados, sem possibilidade de atribuir a causa apenas ao modelo.
3. Assertions baseadas em palavras isoladas produziram **falsos PASS**, inclusive em respostas sobre glúten e veganismo; houve também falsos FAIL potenciais.
4. O red teaming contém evidências com níveis distintos de confiabilidade; no experimento de Nicholas, o componente `llm-rubric` recebeu **HTTP 500 em 30/30 avaliações**, apesar do status automático favorável para essa etapa.
5. A revisão humana já executada foi **seletiva**, não rotulagem integral de todas as 240 respostas.

## Participação da squad

| Integrante | Frente predominante | Golden Dataset | Red teaming planejado/registrado |
|---|---|---:|---:|
| Kanan | Integração, Promptfoo, assertions e métricas | 6 | 5 |
| Kaua | Oráculos, cobertura, critérios e parecer | 14 | 8 |
| Nicholas | Red teaming, triagem e inventário de defeitos | 10 | 10 |
| Lívia | Políticas, prompt corrigido e apresentação | 10 | 7 |

## Estado da entrega

- [x] Golden Dataset: 40 casos e 6 pares declarados (revisar equivalência do M-03).
- [x] Suíte Promptfoo integrada à API e configs das duas campanhas.
- [x] 120 avaliações por rótulo, com logs arquivados.
- [x] Red teaming: 30 cenários registrados em 8 categorias.
- [x] Comparação automática de taxas, latência e tokens.
- [x] Reconciliação completa do red teaming e homologação das severidades.
- [ ] Homologação dos Quality Gates propostos e parecer final da squad.
- [ ] Parecer Go/No-Go de até oito páginas.
- [ ] Apresentação de 15–20 minutos com demonstração fiel do que foi executado.

**Nota de interpretação:** marcação de entrega documental concluída não significa aprovação da Lia ou validade integral dos julgamentos automáticos.
