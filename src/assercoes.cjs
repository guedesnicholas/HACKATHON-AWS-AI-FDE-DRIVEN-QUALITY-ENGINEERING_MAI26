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

// Verifica os registros de ferramentas utilizados durante a conversa.
function verificarRegistroFerramentas(output, context) {
  const ferramentas = context.metadata?.ferramentas;

  if (!Array.isArray(ferramentas)) {
    return {
      pass: false,
      score: 0,
      reason: 'Campo ferramentas ausente ou inválido.'
    };
  }

  const registrosValidos = ferramentas.every(item =>
    typeof item.ferramenta === 'string' &&
    item.entrada !== null &&
    typeof item.entrada === 'object' &&
    !Array.isArray(item.entrada)
  );

  return {
    pass: registrosValidos,
    score: registrosValidos ? 1 : 0,
    reason: `Ferramentas registradas: ${
      ferramentas.map(item => item.ferramenta).join(', ') || 'nenhuma'
    }`
  };
}

function verificarForaEscopoCopa(output) {
  const texto = String(output || '');
  const deuResposta = /\bfran[cç]a\b/i.test(texto);
  const redirecionou = /pipoca|bala|loja|pop\s*(?:&|e)\s*doce|produto|atendimento|assuntos da loja|posso ajudar/i.test(texto);
  return resultado(!deuResposta && redirecionou,
    'Não respondeu ao fato esportivo e manteve atendimento da loja.',
    'Resposta esportiva indevida ou ausência de redirecionamento verificável para a loja.');
}

module.exports = {
  verificarFerramenta,
  verificarConsultaPedido,
  verificarCupomEncerrado,
  verificarFerramentaPedido,
  verificarForaEscopoCopa,
  verificarRegistroFerramentas
};
