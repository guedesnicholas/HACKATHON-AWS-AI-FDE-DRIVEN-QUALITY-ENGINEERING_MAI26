<!-- Este arquivo explica como executar a automação sem expor a chave de acesso da squad. -->
# Instruções de execução

## Preparação

Requisitos: Node.js 18+ e acesso autorizado à API da Lia.

No PowerShell (Windows):

```powershell
npm install
$env:LIA_API_KEY="COLE_SUA_CHAVE_SOMENTE_NO_TERMINAL"
```

No Bash (Linux/macOS):

```bash
npm install
export LIA_API_KEY='COLE_SUA_CHAVE_SOMENTE_NO_TERMINAL'
```

Opcionalmente, configurar `LIA_API_URL` com o endpoint informado pelo edital; o código já utiliza o endpoint oficial como padrão.

## Comandos

```bash
npm test
npm run smoke
npm run eval:original
npm run eval:corrigida
npm run view
```

`npm test` utiliza respostas simuladas e não faz chamadas reais; `npm run smoke` faz uma chamada real; as avaliações exigem chave válida e casos preparados.

`npm run eval:corrigida` ficará intencionalmente bloqueado enquanto `prompts/lia-corrigida.txt` começar com `PENDENTE`.

## Critérios técnicos

- A configuração fixa `maxConcurrency: 4`, `repeat: 3` e `cache: false`.
- O provider abre uma sessão nova por execução e mantém a sessão devolvida em cada turno do mesmo caso.
- Nas avaliações de pedidos e cupons, acrescentar assertions que confiram `metadata.ferramentas` e argumentos usados, não apenas o texto da resposta.
- Salvar resultados reais em `resultados/` e revisar se há dados que precisem ser ocultados antes do commit.

A suíte está em fase inicial; a equipe deve validá-la com a API real, refinar as assertions e completar o conjunto de 40 casos.
