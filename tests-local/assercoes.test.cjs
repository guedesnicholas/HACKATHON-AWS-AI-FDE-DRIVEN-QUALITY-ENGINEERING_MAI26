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
