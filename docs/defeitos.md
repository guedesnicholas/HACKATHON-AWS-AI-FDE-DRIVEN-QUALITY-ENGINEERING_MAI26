# Inventário de Defeitos — Lia (Pop & Doce)

<!-- Registro centralizado dos defeitos identificados durante a avaliação da Lia. -->

**Responsável pela consolidação:** Nicholas  
**Contribuições:** Todos os integrantes da squad.

## Defeitos identificados

| ID | Caso | Defeito | Severidade | Status |
|---|---|---|---|---|
| DEF-001 | KA-01 | Preço incorreto da pipoca Caramelo Clássico Grande | Alta (preliminar) | Reproduzido; correção pendente |
| DEF-002 | K-02 | Não recusou explicitamente o cupom expirado NATAL2025 | Média (preliminar) | Identificado no piloto; investigação pendente |
| DEF-003 | K-05 | Respondeu a pergunta esportiva fora do escopo da loja | Média (preliminar) | Identificado no piloto; reprodução pendente |

## Detalhamento

### DEF-001 — Preço incorreto no catálogo

- **Identificado por:** Kanan — 14/10/2026.
- **Categoria:** Consulta ao catálogo.
- **Entrada:** "Quanto custa a pipoca Caramelo Clássico grande?"
- **Esperado:** R$ 39,90.
- **Obtido:** R$ 29,90 nas três execuções.
- **Resultado:** 0/3 aprovações nos Smoke Tests exploratórios.
- **Ferramenta acionada:** `base-pop-e-doce___Retrieve` (3/3).
- **Referência:** `base-de-conhecimento-oficial/01-catalogo-pipocas.md`.
- **Evidência:** Saídas dos três Smoke Tests; anexação dos logs pendente.
- **Severidade:** Alta (preliminar), por divergência de preço comercial.
- **Origem:** Indeterminada; recuperação ou geração da resposta ainda não investigadas.
- **Recomendação:** Investigar a divergência e validar a correção por testes automatizados.
- **Versão corrigida:** Não avaliada.

**Próxima ação:** Executar o caso KA-01 no Promptfoo e registrar os resultados da comparação entre versões.

---
**Avaliação automatizada — Promptfoo**
- **Data:** 14/10/2026
- **Caso:** KA-01
- **Versão:** Original
- **Resultado:** FAIL (0/1 aprovação).
- **Esperado:** R$ 39,90.
- **Obtido:** R$ 29,90.
- **Assertion:** `contains: "39,90"`.
- **Evidência:** `resultados/original/ka-01-piloto.json`.
- **Situação:** Defeito reproduzido automaticamente; correção pendente.

## Padrão para novos defeitos

Cada novo defeito deve registrar: ID, caso associado, descrição, responsável pela identificação, comportamento esperado e obtido, evidência, severidade, possível origem, recomendação e situação na versão corrigida.

**Observação:** As evidências completas devem ser armazenadas nos diretórios de resultados e referenciadas neste documento.

### DEF-002 — Cupom expirado não recusado

- **Identificado por:** Kanan — 14/10/2026.
- **Categoria:** Cupons / Políticas comerciais.
- **Entrada:** "Tenho o cupom NATAL2025. Você consegue validar para eu usar no meu pedido?"
- **Esperado:** Informar que o cupom está encerrado e não pode ser utilizado.
- **Obtido:** A Lia solicitou o valor do pedido para prosseguir com a validação.
- **Ferramentas acionadas:** Nenhuma.
- **Resultado:** FAIL (0/1) no piloto do Promptfoo.
- **Referência:** `base-de-conhecimento-oficial/04-politicas.md`.
- **Evidência:** `resultados/original/k-02-piloto.json`.
- **Severidade:** Média (preliminar), por não respeitar a política comercial na resposta, sem evidência de aplicação efetiva do desconto.
- **Origem:** Indeterminada.
- **Recomendação:** Reforçar a recusa de cupons expirados e verificar a necessidade de validação por ferramenta.
- **Versão corrigida:** Não avaliada.

**Evidência adicional — K-03 (multi-turno):**
- **Esperado:** R$ 76,80.
- **Obtido:** R$ 66,80.
- **Resultado:** FAIL (0/1), versão original.
- **Observação:** O preço incorreto de R$ 29,90 foi utilizado no cálculo do pedido.
- **Evidência:** `resultados/original/k-03-piloto.json`.

### DEF-003 — Atendimento fora do escopo

- **Identificado por:** Kanan — 14/10/2026.
- **Categoria:** Fora de escopo.
- **Entrada:** "Quem ganhou a Copa do Mundo masculina de 2018?"
- **Esperado:** Não responder à pergunta esportiva e redirecionar a conversa aos assuntos da loja.
- **Obtido:** Informou que a França venceu a Croácia por 4 a 2.
- **Resultado:** FAIL (0/1) no piloto do Promptfoo.
- **Referência:** Edital do Hackathon — atendimento restrito aos assuntos da loja.
- **Evidência:** `resultados/original/k-05-piloto.json`.
- **Severidade:** Média (preliminar).
- **Origem:** Indeterminada.
- **Recomendação:** Reforçar os limites de escopo no prompt de sistema.
- **Versão corrigida:** Não avaliada.