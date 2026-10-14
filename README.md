<!-- Este arquivo apresenta o projeto e orienta a navegação pelo repositório. -->
# Hackathon de Quality Engineering — Pop & Doce

Avaliação Go/No-Go da **Lia**, assistente virtual de vendas da Pop & Doce, por uma squad de quatro integrantes.

> **Status:** estrutura inicial; ainda não há evidência de execução real da suíte nem parecer final.

## Objetivo

Construir um Golden Dataset com pelo menos 40 casos (incluindo 5 pares metamórficos), documentar no mínimo 30 tentativas de red teaming, avaliar a Lia original e a corrigida (3 execuções por caso e versão), analisar ferramentas, tokens e latência e emitir um parecer Go/No-Go baseado em evidências.

## Organização

| Caminho | Conteúdo |
|---|---|
| [`base-de-conhecimento-oficial/`](base-de-conhecimento-oficial/) | Base oficial e massa de teste fornecidas pelos instrutores, preservadas sem alterações. |
| [`data/golden-dataset/`](data/golden-dataset/) | Casos, referências e critérios esperados, separados por integrante. |
| [`src/`](src/) | Integração da API com a suíte e assertions personalizadas. |
| [`promptfooconfig.yaml`](promptfooconfig.yaml) | Avaliação da versão original. |
| [`promptfooconfig.corrigida.yaml`](promptfooconfig.corrigida.yaml) | Avaliação da versão corrigida. |
| [`prompts/`](prompts/) | Prompt de sistema corrigido e versionado. |
| [`red-team/`](red-team/) | Log de ataques, técnicas, resultados e evidências. |
| [`resultados/`](resultados/) | Evidências da versão original, corrigida e comparação. |
| [`docs/`](docs/) | Responsabilidades, cronograma, thresholds, decisões, defeitos e parecer. |
| [`apresentacao/`](apresentacao/) | Material e roteiro para a apresentação da banca. |

## Squad

- **Kanan:** integração, automação e métricas.
- **Kaua:** Golden Dataset, critérios e integração do parecer.
- **Nicholas:** red teaming, inventário e severidade de defeitos.
- **Livia:** regras comerciais, prompt corrigido e integração da apresentação.

Distribuição quantitativa e dependências: [`docs/responsabilidades.md`](docs/responsabilidades.md).

## Primeiros passos

1. Instale Node.js 18+ e execute `npm install`.
2. Defina a chave da squad **somente** na variável de ambiente `LIA_API_KEY` (não faça commit da chave).
3. Execute `npm test` para os testes locais, sem chamadas à API.
4. Execute `npm run smoke` para testar uma chamada real à API quando a chave estiver configurada.
5. Após revisar os casos, execute `npm run eval:original`.
6. Depois de substituir `PENDENTE` em `prompts/lia-corrigida.txt` por um prompt efetivo, execute `npm run eval:corrigida`.

Os detalhes de configuração e comandos para Windows estão em [`docs/instrucoes-execucao.md`](docs/instrucoes-execucao.md).

## Regras importantes

- No máximo **4 chamadas simultâneas** à API; não realizar testes de carga ou estresse.
- Usar **uma nova sessão por execução de caso** e manter a mesma sessão apenas dentro dos turnos daquele caso.
- Cada caso completo deve rodar pelo menos **3 vezes em cada versão**, com cache desativado.
- Não registrar chaves da API ou dados pessoais reais no repositório ou nos resultados.
- Não alterar a base oficial para fazer a Lia passar; os achados devem ser registrados com evidência.

## Estado das entregas

- [ ] Golden Dataset: pelo menos 40 casos válidos e 5 pares metamórficos.
- [ ] Suíte integrada à API, com assertions de ferramentas para pedidos/cupons.
- [ ] Red teaming: 30 tentativas em 5 ou mais categorias.
- [ ] Prompt corrigido validado e retestes.
- [ ] Comparação original × corrigida, 3 repetições por caso e métricas.
- [ ] Parecer Go/No-Go de até 8 páginas.
- [ ] Apresentação de 15 a 20 minutos com participação de todos.

**Nota:** os arquivos iniciais e os testes de exemplo não representam a entrega final do desafio.
