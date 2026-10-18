# Preparação da campanha formal Lia (40 casos × 3 por versão)

Copie o conteúdo desta pasta para a **raiz** do seu repositório, preservando `config/`, `docs/` e `scripts/`. Não substitua `src/`, `data/` nem o prompt corrigido.

## 1. Antes de gastar chamadas

- Validar os thresholds propostos e congelar os 40 casos/assertions com Kaua e a squad.
- Revisar especialmente `PRIV-01`, `ESC-02` e asserts que aceitam palavras isoladas.
- Confirmar `LIA_API_KEY` na sessão PowerShell (sem copiar chave no chat ou no commit).
- Executar `npm test`.
- Garantir prompt corrigido completo e não modificá-lo durante as campanhas.
- Importante: a API ainda não comprovou aplicar `prompt_sistema`; sem evidência de versão, não atribuir os resultados da campanha corrigida ao prompt da Livia.

## 2. Guardar identificação da campanha

```powershell
New-Item -ItemType Directory -Force .\resultados\formal | Out-Null
"Commit: $(git rev-parse HEAD)" | Set-Content .\resultados\formal\identificacao.txt
"SHA256 prompt: $((Get-FileHash .\prompts\lia-corrigida.txt -Algorithm SHA256).Hash)" | Add-Content .\resultados\formal\identificacao.txt
```

## 3. Versão original: 120 avaliações

```powershell
npx promptfoo eval -c promptfooconfig.formal.original.yaml --no-cache --max-concurrency 1 -o resultados/formal/original-40x3.json
```

## 4. Versão corrigida: 120 avaliações

```powershell
npx promptfoo eval -c promptfooconfig.formal.corrigida.yaml --no-cache --max-concurrency 1 -o resultados/formal/corrigida-40x3.json
```

São duas avaliações separadas, **sem Qwen**, portanto apenas `LIA_API_KEY` é necessária. Os resultados são de assertions estáticas. O Qwen pode ser aplicado posteriormente às respostas gravadas em replay, sem chamar a Lia de novo.

## 5. Auditar os quality gates (offline)

```powershell
node scripts/auditar-gates-formais.cjs resultados/formal/original-40x3.json original
node scripts/auditar-gates-formais.cjs resultados/formal/corrigida-40x3.json corrigida
```

Gera relatórios `resultados/formal/gates-original.md` e `gates-corrigida.md`. O script não altera os JSONs originais.

## 6. Registro e segurança

- Não anexar chaves nem arquivos brutos com informações sensíveis a commits; sanitizar antes de publicar.
- Guardar resultados, logs, critério de versionamento, rubrica e tabelas de defeitos.
- O script fornece um **painel automático provisório**; GO/No-Go final exige revisão dos critérios, decisões da squad, verificação da versão e dos defeitos críticos.
