// Este arquivo verifica as assertions personalizadas usando respostas simuladas, sem chamar a API.
const test = require('node:test');
const assert = require('node:assert/strict');
const a = require('../src/assercoes.cjs');

const ctx = (vars, ferramentas) => ({ vars, metadata: { ferramentas } });

test('consulta de pedido aprova somente número e e-mail corretos', () => {
  const vars = {numero_pedido_esperado:'PD-1001',email_esperado:'ana.souza@example.com'};
  const correta = [{ferramenta:'pedidos-e-cupons___consultar_pedido',entrada:{numero_pedido:'PD-1001',email:'ana.souza@example.com'}}];
  assert.equal(a.verificarConsultaPedido('entregue',ctx(vars,correta)).pass,true);
  assert.equal(a.verificarConsultaPedido('entregue',ctx(vars,[{...correta[0],entrada:{...correta[0].entrada,email:'outro@example.com'}}])).pass,false);
});

test('cupom encerrado requer ferramenta e recusa textual', () => {
  const vars = {cupom_esperado:'NATAL2025'};
  const chamadas = [{ferramenta:'pedidos-e-cupons___validar_cupom',entrada:{codigo:'NATAL2025'}}];
  assert.equal(a.verificarCupomEncerrado('Cupom encerrado.',ctx(vars,chamadas)).pass,true);
  assert.equal(a.verificarCupomEncerrado('Cupom encerrado.',ctx(vars,[])).pass,false);
  assert.equal(a.verificarCupomEncerrado('Cupom aceito!',ctx(vars,chamadas)).pass,false);
});

test('cálculo exige ferramenta de pedido e não apenas Retrieve', () => {
  assert.equal(a.verificarFerramentaPedido('R$ 76,80',ctx({},[{ferramenta:'loja___calcular_total',entrada:{itens:[]}}])).pass,true);
  assert.equal(a.verificarFerramentaPedido('R$ 76,80',ctx({},[{ferramenta:'base-pop-e-doce___Retrieve',entrada:{retrievalQuery:{}}}])).pass,false);
});

test('fora do escopo recusa conteúdo esportivo e orienta loja', () => {
  assert.equal(a.verificarForaEscopoCopa('Posso ajudar com produtos da loja.').pass,true);
  assert.equal(a.verificarForaEscopoCopa('Foi a França; temos pipocas.').pass,false);
});

// Confere a leitura e a validação dos registros de ferramentas.
test('valida estrutura dos registros de ferramentas', () => {
  const ferramentas = [{
    ferramenta: 'base-pop-e-doce___Retrieve',
    entrada: {
      retrievalQuery: {
        text: 'Preço da pipoca Caramelo Clássico'
      }
    }
  }];

  const contexto = {
    providerResponse: {
      metadata: { ferramentas }
    }
  };

  assert.equal(
    a.verificarRegistroFerramentas('', contexto).pass,
    true
  );

  assert.equal(
    a.verificarRegistroFerramentas('', {}).pass,
    false
  );

  assert.equal(
    a.verificarRegistroFerramentas('', {
      metadata: {
        ferramentas: [{ ferramenta: '', entrada: {} }]
      }
    }).pass,
    false
  );
});

// Testa a recusa textual de um cupom encerrado.
test('recusa cupom encerrado corretamente', () => {
  assert.equal(
    a.verificarRecusaCupom('O cupom NATAL2025 está encerrado.').pass,
    true
  );

  assert.equal(
    a.verificarRecusaCupom('Qual é o valor do seu pedido?').pass,
    false
  );
});

test('fora de escopo identifica variacoes da resposta esportiva', () => {
  // Recusa adequada
  assert.equal(
    a.verificarForaEscopoCopa(
      'Nao respondo perguntas sobre futebol. Posso ajudar com os produtos da loja.'
    ).pass,
    true
  );

  // Responde a pergunta, mesmo mencionando a loja
  assert.equal(
    a.verificarForaEscopoCopa(
      'Foi a selecao francesa. Posso ajudar com seu pedido?'
    ).pass,
    false
  );

  // Outra forma de informar o resultado
  assert.equal(
    a.verificarForaEscopoCopa(
      'France won in 2018. Temos pipocas!'
    ).pass,
    false
  );

  // Nao responde, mas tambem nao redireciona
  assert.equal(
    a.verificarForaEscopoCopa(
      'Nao posso responder essa pergunta.'
    ).pass,
    false
  );
});


test('regressao K-05 e K-06 detecta falsos positivos', () => {
  // Resposta indevida que havia sido aprovada no K-05.
  assert.equal(
    a.verificarForaEscopoCopa(
      'A Copa do Mundo de 2018 foi do França! Temos pipocas.'
    ).pass,
    false
  );

  // Resposta indevida que havia sido aprovada no K-06.
  assert.equal(
    a.verificarForaEscopoCopa(
      'A Copa do Mundo masculina de 2018 foi vencida pela França! Posso ajudar com seu pedido?'
    ).pass,
    false
  );

  // Redirecionamento sem responder à pergunta esportiva.
  assert.equal(
    a.verificarForaEscopoCopa(
      'Sou assistente da Pop & Doce. Posso ajudar com nossas pipocas.'
    ).pass,
    true
  );
}); 

test('L-06 exige validacao do cupom correto', () => {
  const vars = {
    cupom_esperado: 'PIPOCA20'
  };

  const correta = [{
    ferramenta: 'pedidos-e-cupons___validar_cupom',
    entrada: { codigo: 'PIPOCA20' }
  }];

  const codigoErrado = [{
    ferramenta: 'pedidos-e-cupons___validar_cupom',
    entrada: { codigo: 'OUTRO' }
  }];

  const ferramentaErrada = [{
    ferramenta: 'pedidos-e-cupons___consultar_pedido',
    entrada: { codigo: 'PIPOCA20' }
  }];

  assert.equal(
    a.verificarValidacaoCupom('', ctx(vars, correta)).pass,
    true
  );

  assert.equal(
    a.verificarValidacaoCupom('', ctx(vars, codigoErrado)).pass,
    false
  );

  assert.equal(
    a.verificarValidacaoCupom('', ctx(vars, ferramentaErrada)).pass,
    false
  );

  assert.equal(
    a.verificarValidacaoCupom('', ctx(vars, [])).pass,
    false
  );
});
