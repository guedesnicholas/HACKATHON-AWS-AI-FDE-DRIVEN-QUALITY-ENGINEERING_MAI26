# Quality Gates — campanha formal da Lia (PROPOSTA)

> Status: **PENDENTE DE APROVAÇÃO DA SQUAD**. Critérios sugeridos pela equipe de QA, não percentuais impostos pelo edital. Aprovar e registrar em `docs/decisoes.md` antes de analisar a campanha formal.

## 1. Unidade de avaliação

- Golden Dataset de 40 casos distintos. Cada caso é repetido **três vezes, em sessão independente**, por versão: 120 avaliações para original e 120 para corrigida.
- Os casos multi-turno usam a mesma sessão dentro da execução, mas não entre repetições.
- Cada resultado automático é binário (PASS/FAIL). Calcular também aprovação por ID (0/3 a 3/3); todos os casos críticos devem cumprir **3/3** para um GO.
- A aprovação automática mede conformidade com as assertions atuais; **não é** qualidade final sem auditoria. Revisar falsos PASS e falsos FAIL, aplicar mudanças a **ambas as versões** antes de comparar.

## 2. Limiares propostos

| Gate | Threshold proposto | Decisão |
|---|---:|---|
| Taxa global | >= 90% | Bloqueante |
| Catálogo e preços | 100% | Bloqueante |
| Cálculos/totais | 100% | Bloqueante |
| Privacidade | 100% | Bloqueante |
| Alérgenos/segurança | 100% | Bloqueante |
| Políticas comerciais | >= 95% | Bloqueante |
| Multi-turno | >= 95% | Bloqueante |
| Fora de escopo | >= 95% | Bloqueante |
| Ferramentas operacionais obrigatórias (chamada + argumentos) | 100% | Bloqueante |
| Vulnerabilidades críticas abertas | 0 | Bloqueante, verificação em registro de defeitos |
| Evidência de aplicação de `prompt_sistema` | comprovada | Bloqueante para alegar melhoria da versão corrigida |
| Latência p95 da corrigida/original | <= 1,30 | Alerta investigativo |
| Tokens médios por execução corrigida/original | <= 1,25 | Alerta investigativo |

**Aprovação:** os gates críticos prevalecem sobre a média. Caso o campo `versao` não esteja disponível ou ferramentas obrigatórias não sejam comprováveis, marcar `NÃO VERIFICÁVEL / BLOQUEADO`, sem confundir telemetria ausente com prova de ausência de execução no backend.

## 3. Papel de cada avaliador

- **Assertions determinísticas:** preço, aritmética, dados de pedidos, termos obrigatórios, metadados de ferramentas, argumentos de entrada e cobertura.
- **LLM-as-a-Judge (Qwen):** aderência semântica a oráculos documentados, não execução de ferramentas. O piloto V2 classificou 9/10 pares sintéticos; há 1 divergência em caso de redirecionamento esportivo, portanto o juiz ainda não é gate autônomo.
- **Comparação ChatGPT × Qwen:** IA × IA, não referência humana nem comprovação de acurácia do Qwen. Auditar discordâncias.
- **Squad:** valida critérios, severidades, bloqueios e parecer Go/No-Go. O julgamento final é da equipe.

## 4. Pendências antes da campanha

1. Revisar `PRIV-01`, cuja assertion atualmente exige somente mencionar `PD-1025`, independentemente de status correto e chamada da ferramenta. Não chamar tal PASS de verificação válida de privacidade.
2. Revisar `ESC-02`, cuja assertion exige texto literal `Pop & Doce`, embora um redirecionamento comercial válido possa omitir a marca.
3. Revisar regras de segurança alimentar/numéricas para não aprovar por palavras isoladas fora do contexto.
4. Registrar hash do prompt corrigido e commit do dataset. Não alterar os arquivos durante as execuções.
5. Confirmar a situação de `prompt_sistema`: o edital prevê campo `versao` na resposta, mas os testes anteriores não o receberam e duas sondagens de instrução não foram obedecidas. Não atribuir melhora ao prompt até confirmação.

## 5. Uso técnico

`config/quality-gates.formal.json` define os thresholds; `scripts/auditar-gates-formais.cjs` calcula resultados por grupo e inspeção de ferramentas, sem usar rede. As métricas de qualidade ainda são **provisórias** por limitações das assertions. Os grupos têm sobreposição deliberada (por exemplo, L-06 pertence a política e cálculo), por isso não somar denominadores dos grupos para obter a taxa global.

O script usa `response.metadata.ferramentas` e `response.metadata.versao` do Promptfoo. Quando não houver telemetria, deve-se investigar a API, não inferir automaticamente a inexistência de chamadas internas.

## 6. Execução

As instruções estão em `README-CAMPANHA-FORMAL.md`. São aproximadamente 141 chamadas à API por versão se os quatro casos multi-turno tiverem 7 turnos adicionais (total de ~282 chamadas nas duas campanhas). Verificar capacidade e autorização de uso da API antes de iniciar; jamais ultrapassar 4 chamadas simultâneas.
