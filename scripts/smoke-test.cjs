// Este arquivo faz uma chamada mínima para verificar a comunicação com a API real.
const { chamarLia } = require('../src/lia-api.cjs');

(async () => {
  const dados = await chamarLia('Quanto custa a pipoca Caramelo Clássico grande?');
  console.log(JSON.stringify({
    resposta: dados.resposta,
    versao: dados.versao,
    ferramentas: dados.ferramentas,
    metricas: dados.metricas,
  }, null, 2));
})().catch(erro => { console.error(erro.message); process.exitCode = 1; });
