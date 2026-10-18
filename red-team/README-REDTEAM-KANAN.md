# Campanha de red teaming — Kanan

## Escopo

Cinco cenarios (`KAN-RT-01` a `KAN-RT-05`) de desvio de escopo e manipulacao de instrucoes, complementares aos ataques de Kaua/Nicholas/Livia. Base: `red-team/README.md`, `docs/responsabilidades.md` e `base-de-conhecimento-oficial/04-politicas.md`. Nao inventar resultados; os ataques nao foram executados neste pacote.

## Instalacao

Copie `promptfooconfig-redteam-kanan.yaml` para a raiz do repositorio e `src/redteam-assercoes-kanan.cjs` para `src/`.

No PowerShell, com a variavel de ambiente `LIA_API_KEY` configurada apenas localmente:

```powershell
npm test
npx promptfoo eval -c promptfooconfig-redteam-kanan.yaml --repeat 1 --no-cache --max-concurrency 1 -o resultados/original/redteam-kanan-piloto.json
```

Primeiro revise os cinco resultados do piloto; depois a campanha completa (3 execucoes/cenario):

```powershell
npx promptfoo eval -c promptfooconfig-redteam-kanan.yaml --repeat 3 --no-cache --max-concurrency 1 -o resultados/original/redteam-kanan-formal.json
npx promptfoo view
```

Se a CLI instalada nao aceitar `--repeat`, remova a flag: o YAML ja define `repeat: 3`. No piloto, nesse caso, crie copia do YAML e ajuste `repeat: 1` antes de executar; nao altere o YAML formal inadvertidamente.

## Consumo

- Piloto 1x: 5 avaliacoes, **6 chamadas HTTP** (KAN-RT-03 e multi-turno com 2 mensagens).
- Formal 3x: 15 avaliacoes, **18 chamadas HTTP**.
- Nao ha LLM-as-a-Judge configurado; sem chamadas ao Bedrock pelo juiz.
- Cada caso inicia uma nova sessao; somente os turnos do mesmo caso compartilham sessao.

## Interpretacao

As assertions JS fazem somente triagem inicial. **Nao classifique o ataque como resistido apenas pelo PASS automatico.** Revise integralmente cada resposta (sobretudo KAN-RT-02 e KAN-RT-04). Um `FAIL` indica criterio de defesa nao atendido ou necessidade de exame, conforme motivo. Registre ataques resistidos e bem-sucedidos.

Analise tambem `metadata.ferramentas` do JSON para verificar ferramentas indevidas ou inusitadas; `ferramentas: []` nao prova ausencia de chamadas internas.

## Registro e entrega

Transfira os cinco cenarios e seus resultados para `red-team/tentativas.csv` seguindo as colunas existentes (id, responsavel, categoria, objetivo, tecnica, mensagem, resposta_ou_resumo, severidade, evidencia, versao, observacoes, ataque 1, ataque 2, ataque 3). Cada cenario tem 3 repeticoes. O arquivo `red-team/kanan-registro-template.csv` deste pacote e apenas um rascunho de registro: **NAO EXECUTADO**.

Ao compartilhar JSONs, sanitize sessoes, eventuais dados e textos sensiveis. Prefira resumo Markdown e CSV auditado no repositório publico. Nicholas consolida resultados e severidades.
