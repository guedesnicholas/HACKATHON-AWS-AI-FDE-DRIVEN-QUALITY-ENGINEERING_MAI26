// Este arquivo verifica o provider e suas sessões sem acessar a API real.
const test = require('node:test');
const assert = require('node:assert/strict');
const LiaProvider = require('../src/promptfoo-provider.cjs');
const { verificarFerramenta } = require('../src/assercoes.cjs');

test('versão original normaliza resposta e métricas', async () => {
  const chaveAnterior = process.env.LIA_API_KEY;
  const fetchAnterior = global.fetch;
  try {
    process.env.LIA_API_KEY = 'chave-ficticia-local';
    global.fetch = async () => ({ ok: true, json: async () => ({
      resposta: 'O preço é R$ 39,90.', sessao: 'sessao-ficticia', versao: 'original',
      ferramentas: [], metricas: [{ usage: { inputTokens: 10, outputTokens: 8, totalTokens: 18 }, metrics: { latencyMs: 100 } }],
    }) });
    const provider = new LiaProvider({ config: { versao: 'original' } });
    const result = await provider.callApi('Qual é o preço?', { vars: {} });
    assert.equal(result.output, 'O preço é R$ 39,90.');
    assert.equal(result.tokenUsage.total, 18);
    assert.equal(result.metadata.versao, 'original');
  } finally {
    global.fetch = fetchAnterior;
    if (chaveAnterior === undefined) delete process.env.LIA_API_KEY;
    else process.env.LIA_API_KEY = chaveAnterior;
  }
});

test('multi-turno reutiliza apenas a sessão devolvida no caso', async () => {
  const chaveAnterior = process.env.LIA_API_KEY;
  const fetchAnterior = global.fetch;
  const corpos = [];
  try {
    process.env.LIA_API_KEY = 'chave-ficticia-local';
    global.fetch = async (_url, opcoes) => {
      const corpo = JSON.parse(opcoes.body);
      corpos.push(corpo);
      return { ok: true, json: async () => ({ resposta: 'Certo.', sessao: 'sessao-ficticia', versao: 'original', ferramentas: [], metricas: [] }) };
    };
    const provider = new LiaProvider({ config: { versao: 'original' } });
    const result = await provider.callApi('', { vars: { turnos: ['Quero uma pipoca.', 'Quanto fica?'] } });
    assert.equal(corpos.length, 2);
    assert.equal(corpos[0].sessao, undefined);
    assert.equal(corpos[1].sessao, 'sessao-ficticia');
    assert.equal(result.metadata.quantidadeTurnos, 2);
  } finally {
    global.fetch = fetchAnterior;
    if (chaveAnterior === undefined) delete process.env.LIA_API_KEY;
    else process.env.LIA_API_KEY = chaveAnterior;
  }
});

test('assertion de ferramenta confere o nome acionado', () => {
  const result = verificarFerramenta('', { vars: { ferramenta_esperada: 'pedidos-e-cupons___consultar_pedido' }, metadata: { ferramentas: [{ ferramenta: 'pedidos-e-cupons___consultar_pedido' }] } });
  assert.equal(result.pass, true);
});
