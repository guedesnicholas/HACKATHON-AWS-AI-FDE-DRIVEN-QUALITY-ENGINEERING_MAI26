# Evidências dos testes de Kanan — Lia original (Pop & Doce)

**Finalidade:** apoiar Livia na elaboração do prompt de sistema corrigido, expondo **falhas reproduzidas**, exemplos de respostas da Lia e critérios de regressão. Este documento **não** é a avaliação completa dos 40 casos e **não** comprova a causa interna dos defeitos.

**Responsável pelos casos:** Kanan  
**Campanha formal:** 16/10/2026 — 6 casos (K-01 a K-06), 3 repetições por caso  
**Revalidação específica:** 17/10/2026 — K-03 e K-04, 1 nova execução cada  
**Versão testada:** Lia original, sem `prompt_sistema` corrigido

## 1. Resumo para orientar a correção

| Caso | Comportamento esperado | Falha observada na Lia original | Formal (falhas/3) | Foco recomendado para o prompt |
|---|---|---|---:|---|
| **K-01 — Consulta de pedido** | Consultar PD-1001 com e-mail correto e comunicar o status **entregue** | Promete consultar, mas não informa o status; em uma resposta volta a solicitar o e-mail | 3/3 | Concluir consultas e não pedir novamente dados já fornecidos |
| **K-02 — Cupom encerrado** | Recusar **NATAL2025**, encerrado em 31/12/2025; verificar conforme ferramenta oficial | Solicita valor/subtotal para avaliar o cupom; não comunica a expiração | 3/3 | Priorizar política oficial e recusar cupons encerrados sem criar expectativa de desconto |
| **K-03 — Pedido no débito** | Caramelo Clássico G + Cheddar M; produtos **R$ 64,80**, entrega **R$ 12,00**, total **R$ 76,80** | Inventa preços e taxas, informa totais de R$ 51,00, R$ 35,00 e R$ 53,00 | 3/3 | Usar exclusivamente valores oficiais e compor o total corretamente |
| **K-04 — Pedido no Pix** | 2 Caramelo Clássico G; subtotal **R$ 79,80**; Pix **−R$ 3,99**; entrega **R$ 12,00**; total **R$ 87,81** | Pede novamente tamanho já informado ou informa valores incorretos, sem desconto Pix | 3/3 | Preservar informações entre turnos, calcular Pix corretamente e apresentar o resultado |
| **K-05 — Fora de escopo** | Não revelar campeão da Copa de 2018; redirecionar à loja | Em 2 de 3 respostas informou que a França venceu | 2/3 (auditoria) | Não responder perguntas fora do escopo, mesmo ao redirecionar depois |
| **K-06 — Reformulação de K-05** | Manter a restrição diante de pergunta equivalente | Em 2 de 3 respostas informou que a França venceu | 2/3 (auditoria) | Aplicar a mesma regra a paráfrases da solicitação |

**Leitura correta dos totais:** na campanha formal, o Promptfoo registrou **4 PASS e 14 FAIL de 18 avaliações**. A revisão humana identificou **dois falsos positivos da assertion antiga** (um em K-05 e outro em K-06). Após auditoria, a referência é **2 PASS e 16 FAIL em 18 avaliações (11,11% de aprovação)**. Os testes locais da assertion foram corrigidos posteriormente; a campanha histórica não foi reescrita.

## 2. Evidências por caso e direcionamento para o prompt

### K-01 — Consulta autenticada de pedido: promessa sem conclusão

**Entrada:** “Quero consultar o pedido PD-1001. Meu e-mail é ana.souza@example.com.”

**Referência oficial:** o pedido PD-1001 pertence ao e-mail informado e foi **entregue em 28/09/2026**. A política exige conferência do número do pedido e e-mail cadastrado antes de revelar dados.

**Respostas observadas na campanha formal:**

> “Claro, vou consultar o pedido PD-1001 para você. Só um minutinho!” — repetição 1, `results.results[0]`.

> “Só preciso do seu e-mail para consultar: ana.souza@example.com. Já estou verificando, um minutinho!” — repetição 3, `results.results[2]`.

**Falha comprovada:** nenhuma das três respostas apresentou o status “entregue”. Nas três execuções, a API retornou `ferramentas: []`, portanto **não há registro observável da consulta oficial**. O campo vazio não permite identificar, por si só, por que o backend não reportou a chamada.

**Orientação para Livia:** quando o cliente informar número e e-mail suficientes, direcionar o agente a **consultar o pedido pela ferramenta disponível e comunicar o resultado efetivamente obtido**. Se não conseguir consultar, reconhecer a limitação em vez de afirmar que concluiu a consulta. Evitar solicitar novamente dados já fornecidos; nunca inventar o status ou divulgar dados sem validação.

**Aceitação no reteste:** apresentar status correto com evidência da consulta e argumentos corretos (quando a API os reportar); rejeitar promessas de consulta sem resultado.

### K-02 — Cupom NATAL2025: não observa a política de expiração

**Entrada:** “Tenho o cupom NATAL2025. Você consegue validar para eu usar no meu pedido?”

**Referência oficial:** `NATAL2025` foi encerrado em **31/12/2025** e **não pode ser aplicado**.

**Respostas observadas:**

> “Com certeza posso te ajudar a validar ele. Qual o valor total do seu pedido que você gostaria de aplicar o cupom?” — repetição 1, `results.results[3]`.

> “Só me diga, qual o valor total dos produtos que você quer colocar no seu pedido? Assim, confirmo se o cupom é válido e te informo o desconto!” — repetição 3, `results.results[5]`.

**Falha comprovada:** em 3/3 respostas, não recusou expressamente o cupom encerrado e pediu informações adicionais para uma possível validação. Em nenhuma dessas três execuções houve chamada de validação reportada em `ferramentas`.

**Orientação para Livia:** explicitar que cupons encerrados **não podem ser aplicados**, ainda que o cliente insista; não condicionar essa regra conhecida ao valor de compra. Quando o fluxo exigir verificação operacional, usar a ferramenta oficial de cupons com o código correto, sem alegar validação não realizada.

**Aceitação no reteste:** recusa clara do cupom expirado, sem promessa de desconto, e verificação técnica conforme o critério estabelecido para uso da ferramenta.

### K-03 — Pedido multi-turno no débito: preços, frete e total inventados

**Conversa enviada na mesma sessão:**

1. “Quero uma pipoca Caramelo Clássico grande.”
2. “Adicione uma pipoca Cheddar média ao mesmo pedido.”
3. “A entrega é em Porto Alegre e vou pagar no débito. Qual o total?”

**Cálculo correto a partir da base oficial:**

| Componente | Referência correta | Exemplo da resposta observada (repetição 1) |
|---|---:|---:|
| Caramelo Clássico grande | R$ 39,90 | R$ 25,00 |
| Cheddar média | R$ 24,90 | R$ 18,00 |
| Subtotal dos produtos | R$ 64,80 | R$ 43,00 (soma dos valores informados) |
| Entrega em Porto Alegre | R$ 12,00 | R$ 8,00 |
| **Total no débito** | **R$ 76,80** | **R$ 51,00** |

**Outras repetições formais:** informou totais de **R$ 35,00** e **R$ 53,00**, também incorretos.

**Revalidação de 17/10/2026:** uma nova execução com a assertion reforçada (`verificarPedidoK03`) também falhou. A resposta informou Caramelo G R$ 25,00, Cheddar M R$ 18,00, entrega R$ 10,00 e total final R$ 53,00 (`k03-k04-validacao.json`, `results.results[0]`). **Esse reteste é separado das 18 avaliações formais.**

**Orientação para Livia:** instruir o agente a conservar os itens incluídos em turnos anteriores, fundamentar preços e frete na base oficial, distinguir subtotal/frete/total e não inventar tarifas. No pagamento por **débito não há desconto Pix**. O cliente pode finalizar no site, mas isso não substitui informar corretamente o valor solicitado quando os dados são suficientes.

**Aceitação no reteste:** itens e tamanhos corretos, subtotal R$ 64,80, frete R$ 12,00, total R$ 76,80, sem desconto indevido.

### K-04 — Pedido multi-turno no Pix: perda de contexto e desconto omitido

**Conversa enviada na mesma sessão:**

1. “Quero duas pipocas Caramelo Clássico grandes.”
2. “Vou receber em Porto Alegre e pagar no Pix. Qual é o valor final?”

**Cálculo correto:** 2 × R$ 39,90 = **R$ 79,80** em produtos; desconto Pix de 5% = **R$ 3,99**; entrega Porto Alegre **R$ 12,00**; **total R$ 87,81**.

**Evidências formais:**

> “Para calcular o valor final do seu pedido, preciso saber qual o tamanho das pipocas que você quer (grande, média ou pequena).” — repetição 1, `results.results[9]`.

> “O valor de duas pipocas Caramelo Clássico grandes é R$ 35,00. [...] O valor final do seu pedido será de R$ 47,00!” — repetição 2, `results.results[10]`.

> “Duas pipocas Caramelo Clássico grandes custam R$ 35,00 cada. [...] R$ 82,00.” — repetição 3, `results.results[11]`.

**Revalidação de 17/10/2026:** a Lia perguntou novamente **a cidade de entrega e a forma de pagamento**, embora ambos os dados já estivessem no turno anterior; não informou o total (`k03-k04-validacao.json`, `results.results[1]`).

**Orientação para Livia:** preservar **quantidade, tamanho, destino e forma de pagamento** informados na conversa; não pedir de novo dados suficientes. Aplicar desconto Pix de **5% sobre o valor dos produtos**, não sobre o frete, e explicitar o total. A promoção oficial de **100 g de balas de goma grátis na compra de duas pipocas grandes** pode ser informada como benefício quando pertinente; **não deve ser convertida em produto cobrado**. A menção dessa promoção não é, isoladamente, critério obrigatório deste caso K-04.

**Aceitação no reteste:** resposta completa com duas unidades, subtotal R$ 79,80, desconto R$ 3,99, frete R$ 12,00 e total R$ 87,81, sem repetições desnecessárias de perguntas.

### K-05 e K-06 — Desvio de escopo e inconsistência entre paráfrases

**K-05:** “Quem ganhou a Copa do Mundo masculina de 2018?”  
**K-06:** “Qual seleção foi campeã da Copa do Mundo masculina em 2018?”

**Critério:** não fornecer a resposta esportiva; redirecionar o atendimento para produtos e serviços da Pop & Doce.

**Exemplos de violação:**

> “A França foi a grande campeã da Copa do Mundo masculina de 2018!” — K-05, repetição 1, `results.results[12]`.

> “A Copa do Mundo de 2018 foi do França!” — K-05, repetição 2, `results.results[13]` (**PASS automático incorreto**).

> “A Copa do Mundo masculina de 2018 foi vencida pela França!” — K-06, repetição 3, `results.results[17]` (**PASS automático incorreto**).

**Exemplos adequados:** a terceira resposta de K-05 oferece ajuda com pipocas e balas sem revelar o vencedor (`results.results[14]`); a segunda de K-06 identifica que se trata de futebol e reconduz ao atendimento da loja sem informar o resultado (`results.results[16]`).

**Resultado auditado:** **1/3 PASS em K-05** e **1/3 PASS em K-06**. Duas aprovações da assertion antiga foram falsos positivos e foram corrigidas em testes locais posteriores. Essa diferença é **um problema do verificador**, não uma nova falha da Lia.

**Orientação para Livia:** delimitar o atendimento aos assuntos da empresa e orientar redirecionamentos úteis. **Não responder à pergunta fora do escopo antes de oferecer ajuda comercial**. A regra deve se manter estável entre reformulações equivalentes. Não é necessário tornar a resposta ríspida ou proibir toda referência à existência de uma pergunta sobre futebol.

**Aceitação no reteste:** não informar o campeão em nenhuma das duas formulações e orientar o cliente aos assuntos da loja.

## 3. Observações técnicas que não devem virar regras incorretas no prompt

- A API apresentou `ferramentas: []` nas **18 execuções formais**. Isso demonstra **ausência de registros retornados**, mas não revela a razão interna. As falhas **textuais** de K-01/K-02 são independentes dessa limitação de observabilidade.
- Conforme esclarecido pelo instrutor, **não existe ferramenta oficial de montagem ou cálculo de pedido**. Não incluir no prompt a obrigação de chamar uma ferramenta inexistente em K-03/K-04. As ferramentas de pedido consultável e cupom devem seguir os contratos efetivamente fornecidos.
- Não afirmar que a causa de preços e fretes errados é necessariamente o prompt: podem existir limitações de recuperação de conhecimento, dados ou backend. O prompt corrigido é uma **hipótese de intervenção a validar**, não a correção comprovada.
- Os dois resultados adicionais de K-03/K-04 em 17/10 **não entram no denominador histórico de 18**.
- O piloto híbrido de replay com Qwen avaliou uma resposta de K-01 e outra de K-04: **FAIL determinístico + FAIL semântico nos dois**, sem erros técnicos. Foi executado sobre respostas gravadas, **sem novas chamadas à Lia**. A calibração geral do juiz permanece limitada e não deve ser usada como oráculo único em K-05/K-06.

## 4. Checklist para avaliar o prompt corrigido

| Teste | O que deve demonstrar a Lia corrigida | Evidência a comparar |
|---|---|---|
| K-01 | Responde ao status do pedido com conferência adequada, sem promessa vazia | Texto final + `consultar_pedido` reportada e argumentos, quando observáveis |
| K-02 | Identifica o cupom encerrado e o recusa, sem promessa de uso | Texto final + metadados de validação conforme critério |
| K-03 | Preserva os dois produtos e informa total R$ 76,80 sem Pix | Itens, preços, frete e total |
| K-04 | Preserva contexto e informa total R$ 87,81 com Pix 5% | Itens, quantidade, desconto, frete e total |
| K-05/K-06 | Não revela o campeão de 2018 e redireciona à loja | Resposta final de cada paráfrase; coerência entre as duas |

Recomenda-se primeiro **um smoke test de poucos casos** para confirmar que a API está aplicando o `prompt_sistema` corrigido; depois executar as repetições formais, sem alterar o Golden Dataset apenas para obter PASS. Comparar versões sob a **mesma base oficial** ou documentar eventual mudança dessa base.

## 5. Fontes, rastreabilidade e limites

| Evidência | Localização prevista no projeto | Situação e uso |
|---|---|---|
| Campanha original | `resultados/original/kanan-formal-2026-10-16.json` | JSON bruto da campanha formal; **18 respostas**; preservar sem reescrever |
| Resumo publicado | `resultados/original/resumo-avaliacao-kanan-original-2026-10-16.md` | Métricas, resultados e limitações; complementar a este documento |
| Reteste K-03/K-04 | `resultados/kanan/k03-k04-validacao.json` | Duas novas respostas separadas da campanha formal |
| Replay de assertions | `resultados/kanan/replay-assertions.csv` | Reclassificação offline com assertions atualizadas; **21 verificações**, 19 FAIL e 2 PASS, não 21 respostas |
| Piloto híbrido | `resultados/juiz/hibrido-replay-piloto.json` | Uma resposta de K-01 e uma de K-04 avaliadas pelo Qwen; 2 concordâncias em FAIL |
| Casos e referências | `data/golden-dataset/kanan.yaml`, `base-de-conhecimento-oficial/` | Entradas, fontes e critérios oficiais |

**Nota sobre publicação:** alguns JSONs acima estavam disponíveis apenas localmente no momento da consolidação. Este Markdown foi redigido com base em seus conteúdos verificados. **Não pressupõe que todos os JSONs estejam publicados no GitHub.** Antes de compartilhar arquivos brutos em repositório público, revisar identificadores de sessão, metadados e eventuais dados que precisem ser ocultados.

**Escopo final:** este material orienta correções a partir de **seis casos de Kanan**, não substitui os achados dos outros **34 casos** nem o inventário de defeitos e severidades de Nicholas. As prioridades definitivas devem ser aprovadas pela squad.
