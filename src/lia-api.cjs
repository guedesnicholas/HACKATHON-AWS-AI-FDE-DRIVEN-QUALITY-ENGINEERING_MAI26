// Este arquivo envia requisições seguras à API REST da Lia.
const ENDPOINT = 'https://rm4naioqykxiti2srofnqz6hqa0ctlav.lambda-url.us-east-1.on.aws/';

async function chamarLia(mensagem, sessao, promptSistema) {
  const chave = process.env.LIA_API_KEY;
  if (!chave) throw new Error('Defina LIA_API_KEY no ambiente antes de chamar a Lia.');
  const corpo = { mensagem };
  if (sessao) corpo.sessao = sessao;
  if (promptSistema) corpo.prompt_sistema = promptSistema;
  const respostaHttp = await fetch(process.env.LIA_API_URL || ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': chave },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(45000),
  });
  if (!respostaHttp.ok) throw new Error(`A API da Lia retornou HTTP ${respostaHttp.status}.`);
  const dados = await respostaHttp.json();
  if (typeof dados.resposta !== 'string' || typeof dados.sessao !== 'string') {
    throw new Error('A API respondeu sem os campos obrigatórios resposta e sessao.');
  }
  return dados;
}

module.exports = { chamarLia };
