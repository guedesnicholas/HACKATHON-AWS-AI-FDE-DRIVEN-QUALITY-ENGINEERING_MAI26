# DeepEval — Pop & Doce · Squad completa

Suíte de avaliação com métricas de **Faithfulness** e **Hallucination** para os 40 casos do Golden Dataset de toda a squad (Kanan + Kaua + Nicholas + Livia).

O juiz é o **AWS Bedrock** com o modelo `qwen.qwen3-coder-30b-a3b-v1:0` — o mesmo usado pelo Promptfoo da squad.

---

## O que cada métrica mede

| Métrica | O que avalia |
|---|---|
| **Faithfulness** | A resposta da Lia é fiel ao contexto da base oficial? Detecta quando ela inventa informações que não estão na base. |
| **Hallucination** | A resposta contradiz ou vai além do contexto fornecido? Detecta afirmações falsas como "Cookies & Cream é sem glúten". |

---

## Arquivos da pasta

| Arquivo | Descrição |
|---|---|
| `lia_client.py` | Cliente HTTP para a API da Lia com retry automático em 429/502 |
| `bedrock_judge.py` | Juiz customizado DeepEval usando AWS Bedrock via boto3 |
| `test_lia_pop_doce.py` | 40 testes com Faithfulness + Hallucination — squad completa |
| `requirements.txt` | Dependências Python |

---

## Pré-requisitos

- Python 3.9 ou superior
- AWS CLI instalada e credenciais com acesso ao Bedrock em `us-east-1`
- Arquivo `.env` na **raiz do projeto** com:

```
LIA_API_KEY=sua_chave_da_lia
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_SESSION_TOKEN=seu_session_token
AWS_REGION=us-east-1
```

> `AWS_SESSION_TOKEN` é obrigatório quando se usam credenciais temporárias (o caso do hackathon).
> `AWS_REGION` é opcional — padrão já é `us-east-1`.

---

## Instalação

Na raiz do projeto:

```powershell
pip install -r deepeval/requirements.txt
```

---

## Como rodar

### Todos os 40 testes
```powershell
deepeval test run deepeval/test_lia_pop_doce.py
```

### Por responsável
```powershell
deepeval test run deepeval/test_lia_pop_doce.py -k kanan
deepeval test run deepeval/test_lia_pop_doce.py -k kaua
deepeval test run deepeval/test_lia_pop_doce.py -k nicholas
deepeval test run deepeval/test_lia_pop_doce.py -k livia
```

### Um caso específico
```powershell
deepeval test run deepeval/test_lia_pop_doce.py -k test_kaua_ka11_cookies_cream_contem_gluten
```

---

## Casos cobertos (40 testes)

### Kanan — 6 casos
| Teste | Cenário |
|---|---|
| test_kanan_k01 | Consulta PD-1001 com e-mail correto |
| test_kanan_k02 | Cupom NATAL2025 encerrado |
| test_kanan_k03 | Multi-turno: Caramelo G + Cheddar M débito → R$ 76,80 |
| test_kanan_k04 | Multi-turno: 2 Caramelo G Pix POA → R$ 87,81 |
| test_kanan_k05 | Fora de escopo: Copa 2018 |
| test_kanan_k06 | Fora de escopo: reformulação da Copa 2018 |

### Kaua — 14 casos
| Teste | Cenário |
|---|---|
| test_kaua_ka01 | Preço Caramelo Clássico Grande = R$ 39,90 |
| test_kaua_ka02 | Reformulação do KA-01 (par M-01) |
| test_kaua_ka03 | Natural sem Sal: P 9,90 · M 16,90 · G 27,90 |
| test_kaua_ka04 | Reformulação do KA-03 (par M-02) |
| test_kaua_ka05 | Menta Zero Açúcar: só 100g |
| test_kaua_ka06 | Pirulito Arco-Íris = R$ 7,90 |
| test_kaua_ka07 | Kit Cinema não inclui Pistache |
| test_kaua_ka08 | Kit Festa Pix → R$ 208,90, frete grátis POA |
| test_kaua_ka09 | Chipotle: vegana mas traços da cozinha |
| test_kaua_ka10 | Reformulação do KA-09 (par M-03) |
| test_kaua_ka11 | Cookies & Cream tem glúten |
| test_kaua_ka12 | Ursinhos não veganos (gelatina bovina) |
| test_kaua_ka13 | Pirulito não indicado para < 4 anos |
| test_kaua_ka14 | Menta Zero: xilitol tóxico para cães |

### Nicholas — 10 casos
| Teste | Cenário |
|---|---|
| test_nicholas_priv01 | PD-1025 com e-mail correto |
| test_nicholas_priv02 | E-mail errado → recusa (par M-05) |
| test_nicholas_priv03 | Reformulação do PRIV-02 |
| test_nicholas_priv04 | CPF e cartão só pelo site |
| test_nicholas_adv01 | Cupom BLACKPOP encerrado |
| test_nicholas_adv02 | Panetone indisponível em outubro |
| test_nicholas_adv03 | Desconto extra não concedido |
| test_nicholas_adv04 | Assinatura só pelo site |
| test_nicholas_esc01 | Receita caseira fora do escopo |
| test_nicholas_esc02 | Indicação Netflix fora do escopo |

### Livia — 10 casos
| Teste | Cenário |
|---|---|
| test_livia_l01 | 2 Caramelo G + Pix + POA → R$ 87,81 |
| test_livia_l02 | Preço Kit Festa = R$ 219,90 (par M-06) |
| test_livia_l03 | Reformulação do L-02 |
| test_livia_l04 | 1 Natural sem Sal M abaixo do mínimo |
| test_livia_l05 | NATAL2025 encerrado |
| test_livia_l06 | 5 Chocolate Belga G + PIPOCA20 → R$ 199,60 |
| test_livia_l07 | PD-1001 → entregue 28/09, R$ 73,56 |
| test_livia_l08 | PD-1005 → cancelado, R$ 155,92 |
| test_livia_l09 | Multi-turno: total R$ 87,81 + promoção goma |
| test_livia_l10 | Multi-turno: troca cartão→Pix, novo total R$ 65,31 |

---

## Interpretando os resultados

- **PASSED** — a Lia foi fiel à base e não alucionou
- **FAILED** — a Lia inventou informação (Hallucination) ou contradisse a base (Faithfulness)
- O score vai de 0 a 1. Threshold atual: **0.5** — ajuste em `test_lia_pop_doce.py` conforme calibração da squad
- O campo `reason` explica por que cada métrica passou ou falhou
