
const { chamarLia } = require('../src/lia-api.cjs');

async function diagnosticar() {
  const resposta = await chamarLia(
    'Quero consultar o pedido PD-1001. Meu e-mail é ana.souza@example.com.'
  );

  const campos = (obj) =>
    obj && typeof obj === 'object' && !Array.isArray(obj)
      ? Object.keys(obj)
      : [];

  console.log('=== DIAGNOSTICO DA API DA LIA ===');

  console.log('Campos da resposta:', campos(resposta));

  console.log(
    'Existe campo ferramentas:',
    Object.hasOwn(resposta, 'ferramentas')
  );

  console.log(
    'Quantidade de ferramentas:',
    Array.isArray(resposta.ferramentas)
      ? resposta.ferramentas.length
      : 'Campo ausente ou nao e array'
  );

  console.log(
    'Campos metadata:',
    campos(resposta.metadata)
  );

  console.log(
    'Campos trace:',
    campos(resposta.trace)
  );

  console.log(
    'Quantidade de metricas:',
    Array.isArray(resposta.metricas)
      ? resposta.metricas.length
      : 'Nao disponivel'
  );
}

diagnosticar().catch(erro => {
  console.error('Erro no diagnostico:', erro.message);
  process.exitCode = 1;
});
