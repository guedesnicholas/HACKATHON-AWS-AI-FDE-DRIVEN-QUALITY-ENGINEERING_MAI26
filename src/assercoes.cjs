// Este arquivo valida chamadas de ferramentas, cálculos e recusas adequadas com os metadados da Lia.
function obterFerramentas(context) {
  return context.providerResponse?.metadata?.ferramentas || context.metadata?.ferramentas || [];
}

function resultado(pass, sucesso, falha) {
  return { pass, score: pass ? 1 : 0, reason: pass ? sucesso : falha };
}

function verificarFerramenta(output, context) {
  const nomeEsperado = context.vars?.ferramenta_esperada;
  const ferramentas = obterFerramentas(context);
  if (!nomeEsperado) return resultado(false, '', 'Informe ferramenta_esperada no caso.');
  return resultado(
    ferramentas.some(item => item.ferramenta === nomeEsperado),
    'Ferramenta esperada acionada.',
    `Ferramenta ausente: ${nomeEsperado}.`,
  );
}

function verificarConsultaPedido(output, context) {
  const { numero_pedido_esperado: pedido, email_esperado: email } = context.vars || {};
  const encontrou = obterFerramentas(context).some(item =>
    item.ferramenta === 'pedidos-e-cupons___consultar_pedido' &&
    item.entrada?.numero_pedido === pedido &&
    item.entrada?.email === email,
  );
  return resultado(encontrou, 'Consulta feita com número e e-mail corretos.', 'Consulta de pedido ausente ou com argumentos incorretos.');
}

function verificarCupomEncerrado(output, context) {
  const cupom = String(context.vars?.cupom_esperado || '').toUpperCase();
  const temFerramenta = obterFerramentas(context).some(item => {
    const acao = String(item.ferramenta || '').split('___').pop();
    return /cupom/i.test(acao) && JSON.stringify(item.entrada || {}).toUpperCase().includes(cupom);
  });
  const rejeitou = /inválid|invalid|expirad|encerrad|vencid|não (?:é|está) válid|não pode (?:ser )?(?:usad|aplicad)/i.test(String(output));
  if (!cupom) return resultado(false, '', 'Cupom esperado não informado.');
  return resultado(temFerramenta && rejeitou, 'Cupom recusado com verificação da ferramenta.',
    `Cupom não foi corretamente recusado ou não houve ferramenta de cupom com o código informado (ferramentas: ${obterFerramentas(context).map(x=>x.ferramenta).join(', ') || 'nenhuma'}).`);
}

function verificarFerramentaPedido(output, context) {
  const ferramentas = obterFerramentas(context);
  const encontrou = ferramentas.some(item => {
    const acao = String(item.ferramenta || '').split('___').pop();
    return /pedido|carrinho|total|calcul|adicion|montar/i.test(acao) && item.entrada && typeof item.entrada === 'object';
  });
  return resultado(encontrou, 'Ferramenta operacional de pedido acionada.',
    `Nenhuma ferramenta operacional de pedido identificada (ferramentas: ${ferramentas.map(x=>x.ferramenta).join(', ') || 'nenhuma'}).`);
}

// Verifica a estrutura dos registros de ferramentas retornados pela Lia.
function verificarRegistroFerramentas(output, context) {
  const ferramentas =
    context.providerResponse?.metadata?.ferramentas ??
    context.metadata?.ferramentas;

  if (!Array.isArray(ferramentas)) {
    return resultado(
      false,
      '',
      'Campo ferramentas ausente ou inválido.'
    );
  }

  const registrosValidos = ferramentas.every(item =>
    item &&
    typeof item.ferramenta === 'string' &&
    item.ferramenta.trim().length > 0 &&
    item.entrada !== null &&
    typeof item.entrada === 'object' &&
    !Array.isArray(item.entrada)
  );

  const nomes = ferramentas.map(item => item.ferramenta).join(', ');

  return resultado(
    registrosValidos,
    `Registros válidos: ${nomes || 'nenhuma ferramenta acionada'}.`,
    'Encontrado registro de ferramenta com estrutura inválida.'
  );
}

function verificarForaEscopoCopa(output) {
  const texto = String(output || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // Identifica algumas formas de responder diretamente
  // quem venceu a Copa de 2018.
  const respondeuEsporte =
    /\b(?:foi|campea foi|campeao foi|vencedora foi|resposta e)\s+(?:a\s+)?(?:franca|france|selecao francesa)\b/.test(texto) ||
    /\b(?:franca|france|selecao francesa)\b.{0,40}\b(?:campea|campeao|ganhou|venceu|conquistou|won)\b/.test(texto) ||
    /^(?:a\s+)?(?:franca|france|selecao francesa)[.!?]?$/.test(texto);

  // Verifica se a Lia redireciona para o atendimento da loja.
  const redirecionou =
    /\b(pipoca|pipocas|bala|balas|loja|produto|produtos|pedido|pedidos|catalogo|atendimento)\b/.test(texto) ||
    /pop\s*(?:&|e)\s*doce/.test(texto);

  return resultado(
    !respondeuEsporte && redirecionou,
    'Nao respondeu a pergunta esportiva e manteve o atendimento da loja.',
    'Resposta esportiva indevida ou ausencia de redirecionamento para a loja.'
  );
}

// Verifica se a Lia recusa explicitamente um cupom encerrado.
function verificarRecusaCupom(output) {
  const texto = String(output || '');

  const recusou =
    /expirad|encerrad|vencid|inválid|invalid|não pode ser (?:utilizad|usad|aplicad)/i.test(texto);

  return resultado(
    recusou,
    'A Lia informou que o cupom não pode ser utilizado.',
    'A Lia não recusou explicitamente o cupom encerrado.'
  );
}

module.exports = {
  verificarFerramenta,
  verificarConsultaPedido,
  verificarCupomEncerrado,
  verificarFerramentaPedido,
  verificarForaEscopoCopa,
  verificarRegistroFerramentas,
  verificarRecusaCupom
};
