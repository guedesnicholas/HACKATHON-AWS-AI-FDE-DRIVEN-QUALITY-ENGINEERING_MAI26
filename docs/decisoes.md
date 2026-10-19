# Registro de decisões — Hackathon Pop & Doce / Lia

> Registro consolidado a partir da `main` consultada em 18/10/2026. **Decisão técnica** é diferente de **critério homologado**: pontos pendentes de concordância formal aparecem explicitamente.

## 1. Decisões já materializadas na implementação

| Período | Decisão / evidência | Fundamentação e consequência | Situação |
|---|---|---|---|
| 14–18/10/2026 | Adotar **Promptfoo** como ferramenta principal | Suíte parametrizável, API HTTP, asserts personalizados, relatórios JSON | Implementada |
| 14–18/10/2026 | Distribuir o Golden Dataset em quatro YAMLs | 6 Kanan, 14 Kaua, 10 Nicholas, 10 Lívia = 40 casos | Implementada |
| 14–18/10/2026 | Registrar pares metamórficos M-01 a M-06 | Reformulações e relações esperadas explícitas | Implementada; revisar equivalência M-03 |
| 14–18/10/2026 | Preservar sessão durante turnos e isolá-la entre repetições | Avaliar contexto sem contaminação entre casos | Implementada no provider |
| 18/10/2026 | Executar a campanha formal em duas configurações | `original-40x3.json` e `corrigida-40x3.json`, com 120 avaliações cada | Executada; rótulo corrigido sem confirmação do backend |
| 18/10/2026 | Usar thresholds por categoria e bloqueios críticos | Proposta em `config/quality-gates.formal.json` | **Aprovação da squad não documentada** |
| 18/10/2026 | Manter o juiz Qwen apenas como evidência exploratória | Amostras pequenas e comparação IA × IA não calibram o juiz em relação a humanos | Delimitação metodológica |
| 18/10/2026 | Excluir **DeepEval** da entrega final | Instalação e integração não estabilizadas; sem campanha válida concluída | Definida no trabalho de consolidação; comunicar à squad |
| 18/10/2026 | Recomendar **NO-GO provisório** | Achados de risco e limites de observabilidade/versão | **Parecer final ainda pendente** |

## 2. Observações comprovadas da campanha formal

- Os JSONs indicam **12/120 PASS automático (10,0%)** na original e **8/120 (6,7%)** na execução rotulada corrigida. São resultados das assertions **sem reclassificação dos falsos PASS/FAIL identificados**.
- O provider em `src/promptfoo-provider.cjs` tenta enviar `prompt_sistema` na configuração corrigida, mas **`versao` não veio preenchido em nenhum dos 240 resultados**. Por isso, **não** se pode dizer que o prompt da Lívia causou melhora nem regressão.
- `ferramentas: []` em todos os 240 resultados formais significa **ausência de evidência no payload registrado**, não prova de que o agente jamais chamou uma ferramenta.
- A auditoria das assertions identificou falsos PASS claros em **KA-11** e **KA-12**, além de baixa força probatória em **PRIV-01** e **ESC-01**. Não renomear o score automático para «score humano».
- A diferença de latência e tokens deve ser relatada distinguindo escopo ponta a ponta Promptfoo e escopo de turno do backend. `cost:0` não comprova custo real zero.
- Os três resultados de red teaming de Nicholas, Lívia e Kanan possuem metodologias e graus de auditabilidade diferentes. Kaua registrou oito cenários, mas o arquivo de evidência bruta referenciado não consta na `main` verificada.

## 3. Decisões ainda necessárias para fechamento

| Item | Responsáveis sugeridos | Critério para conclusão |
|---|---|---|
| Homologar os Quality Gates ou identificá-los definitivamente como proposta | Kaua + squad | Registro de decisão, data e justificativa; não retroagir a aprovação |
| Homologar severidades dos defeitos priorizados | Nicholas + squad | Revisão das fontes, impacto e evidência nas duas campanhas |
| Resolver IDs KAN-RT-02 e KAN-RT-03 | Kanan + Nicholas | CSV, configuração, relatório formal e evidências apontam ao mesmo cenário |
| Auditar resultados de Nicholas | Nicholas | Diferenciar `not-contains` de `llm-rubric` que retornou HTTP 500 |
| Revisar evidências de Kaua | Kaua | Apontar para artefato existente/sanitizado, ou registrar indisponibilidade |
| Revisar interpretação LIV-RT-05 | Lívia | Comparar as três respostas reais com os rótulos PASS/PASS/FAIL |
| Confirmar aplicação do `prompt_sistema` no backend | Equipe técnica da Lia / organização | Evidência do campo `versao` ou mecanismo autorizado equivalente |
| Confirmar telemetria das ferramentas | Equipe técnica da Lia / organização | Campo `ferramentas` rastreável com nome e argumentos |
| Assinar parecer final GO/NO-GO | Squad | Conclusão por evidência + riscos + condições de entrada em produção |

## 4. Trade-offs e restrições

- **Não reexecutar automaticamente** a campanha para compensar assertions frágeis: preserve os JSONs e, se necessário, reavalie a saída registrada. Novas chamadas dependem de autorização/custo.
- **Não atribuir causa-raiz sem demonstração**: divergência factual pode decorrer de recuperação, geração, dados, regras, integração ou observabilidade.
- **Não misturar tipos de evidência**: resultado determinístico, classificação por LLM juiz e julgamento humano exigem rótulos próprios.
- **Não tratar mensagens geradas como vazamento literal** de prompt privado sem comparação autorizada com o original.
- **Respeitar as regras do desafio**: no máximo quatro chamadas simultâneas, sem teste de carga, chaves em variáveis de ambiente, apenas massa fictícia.

## 5. Fontes internas para auditoria

- `docs/relatorio-auditoria-offline.md` — comparação dos dois JSONs formais.
- `docs/comparacao-40-casos.csv` — contagem de PASS automático por ID.
- `docs/quality-gates-formais.md` e `config/quality-gates.formal.json` — thresholds propostos.
- `red-team/REVISAO-LOG-EVIDENCIAS.md` — reconciliação adversarial pendente.
- `docs/defeitos.md` — achados priorizados para homologação.
- `README-CAMPANHA-FORMAL.md` — comandos e integridade da campanha.
