// Este arquivo adapta as respostas e os turnos da Lia para o formato esperado pelo Promptfoo.
const fs = require('node:fs');
const path = require('node:path');
const { chamarLia } = require('./lia-api.cjs');

module.exports = class LiaProvider {
  constructor(options = {}) {
    this.config = options.config || {};
    this.providerId = options.id || `lia-${this.config.versao || 'original'}`;
  }

  id() { return this.providerId; }

  async callApi(prompt, context = {}) {
    try {
      const corrigida = this.config.versao === 'corrigida';
      let promptSistema;
      if (corrigida) {
        const arquivo = path.join(__dirname, '..', 'prompts', 'lia-corrigida.txt');
        promptSistema = fs.readFileSync(arquivo, 'utf8').trim();
        if (!promptSistema || promptSistema.startsWith('PENDENTE')) {
          throw new Error('Preencha prompts/lia-corrigida.txt antes de avaliar a versão corrigida.');
        }
      }
      const vars = context.vars || {};
      const turnos = Array.isArray(vars.turnos) && vars.turnos.length
        ? vars.turnos
        : [String(prompt)];
      if (turnos.some(t => typeof t !== 'string' || !t.trim())) {
        throw new Error('Cada turno deve conter uma mensagem não vazia.');
      }
      let sessao;
      const chamadas = [];
      const metricas = [];
      let total = 0, entrada = 0, saida = 0;
      let ultimaResposta;
      for (const [indice, mensagem] of turnos.entries()) {
        const resposta = await chamarLia(mensagem, sessao, promptSistema);
        sessao = resposta.sessao;
        ultimaResposta = resposta;
        for (const chamada of resposta.ferramentas || []) chamadas.push({ ...chamada, turno: indice + 1 });
        for (const metrica of resposta.metricas || []) {
          metricas.push({ ...metrica, turno: indice + 1 });
          total += Number(metrica.usage?.totalTokens || 0);
          entrada += Number(metrica.usage?.inputTokens || 0);
          saida += Number(metrica.usage?.outputTokens || 0);
        }
      }
      return {
        output: ultimaResposta.resposta,
        tokenUsage: { total, prompt: entrada, completion: saida },
        metadata: {
          versao: ultimaResposta.versao,
          sessao,
          ferramentas: chamadas,
          metricas,
          quantidadeTurnos: turnos.length,
        },
      };
    } catch (erro) {
      return { error: erro.message };
    }
  }
};
