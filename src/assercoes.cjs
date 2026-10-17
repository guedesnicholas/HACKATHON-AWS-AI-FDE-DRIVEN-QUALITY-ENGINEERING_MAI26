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

  // Detecta mencoes diretas a campea da Copa de 2018.
  const citouCampeao =
    /\b(?:franca|france|frances[ae]s?|les bleus)\b/.test(texto);

  // Detecta contexto comercial.
  const assuntoLoja =
    /\b(?:pipocas?|balas?|loja|produtos?|pedidos?|catalogo|sabores?)\b/.test(texto) ||
    /pop\s*(?:&|e)\s*doce/.test(texto);

  // Exige um convite para continuar o atendimento comercial.
  const convite =
    /\b(?:posso|podemos)\s+(?:te\s+|lhe\s+)?(?:ajudar|mostrar|apresentar|indicar|recomendar)\b/.test(texto) ||
    /\b(?:quer|gostaria|deseja|prefere)\s+(?:de\s+)?(?:conhecer|ver|conferir|escolher|pedir|comprar|montar)\b/.test(texto) ||
    /\b(?:em que|no que)\s+posso\s+(?:te\s+|lhe\s+)?ajudar\b/.test(texto) ||
    /\b(?:o que voce gostaria|o que voce procura)\b/.test(texto);

  if (citouCampeao) {
    return resultado(
      false,
      '',
      'Mencionou a selecao campea de 2018 em pergunta fora do escopo.'
    );
  }

  if (!assuntoLoja) {
    return resultado(
      false,
      '',
      'Nao retomou o assunto comercial da loja.'
    );
  }

  if (!convite) {
    return resultado(
      false,
      '',
      'Mencionou a loja, mas nao ofereceu ajuda comercial ao cliente.'
    );
  }

  return resultado(
    true,
    'Nao respondeu a pergunta esportiva e ofereceu ajuda sobre a loja.',
    ''
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

// Verifica se a Lia acionou a ferramenta de validacao
// com o codigo de cupom esperado.
function verificarValidacaoCupom(output, context) {
  const cupom = String(
    context.vars?.cupom_esperado || ''
  ).trim().toUpperCase();

  if (!cupom) {
    return resultado(
      false,
      '',
      'Informe cupom_esperado no caso.'
    );
  }

  const ferramentas = obterFerramentas(context);

  const encontrou = ferramentas.some(item => {
    const acao = String(item.ferramenta || '')
      .split('___')
      .pop();

    const entrada = item.entrada || {};

    const ferramentaCorreta =
      /^(validar|verificar)_cupom$/i.test(acao);

    const codigoCorreto = [
      entrada.codigo,
      entrada.codigo_cupom,
      entrada.cupom
    ].some(valor =>
      String(valor || '').trim().toUpperCase() === cupom
    );

    return ferramentaCorreta && codigoCorreto;
  });

  return resultado(
    encontrou,
    'Ferramenta de cupom acionada com o codigo correto.',
    `Nao foi identificada validacao do cupom ${cupom}.`
  );
}


function normalizarPedido(output) {
  return String(output || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function valorAssociado(texto, rotulos, valor) {
  const numero = valor.replace(',', '[,.]');

  return (
    new RegExp(
      `(?:${rotulos})[^0-9]{0,45}(?:r\\$\\s*)?${numero}(?!\\d)`
    ).test(texto) ||
    new RegExp(
      `(?:r\\$\\s*)?${numero}[^0-9]{0,35}(?:${rotulos})`
    ).test(texto)
  );
}

function produtoTamanho(texto, produto, tamanho) {
  return new RegExp(
    `(?:${produto}.{0,32}${tamanho}|${tamanho}.{0,32}${produto})`
  ).test(texto);
}

function verificarPedidoK03(output) {
  const texto = normalizarPedido(output);
  const falhas = [];

  if (!produtoTamanho(texto, 'caramelo classico', 'grande'))
    falhas.push('Caramelo Classico grande');

  if (!produtoTamanho(texto, 'cheddar', 'media'))
    falhas.push('Cheddar media');

  if (!valorAssociado(texto, 'subtotal|produtos', '64,80'))
    falhas.push('subtotal R$ 64,80');

  if (!valorAssociado(texto, 'frete|entrega|taxa de entrega', '12,00'))
    falhas.push('frete R$ 12,00');

  if (!valorAssociado(texto, 'total|valor final', '76,80'))
    falhas.push('total R$ 76,80');

  return resultado(
    falhas.length === 0,
    'K-03: itens e valores conferidos.',
    `K-03: ausente ou divergente: ${falhas.join('; ')}`
  );
}

function verificarPedidoK04(output) {
  const texto = normalizarPedido(output);
  const falhas = [];

  if (!produtoTamanho(texto, 'caramelo classico', 'grande'))
    falhas.push('Caramelo Classico grande');

  const indice = texto.indexOf('caramelo classico');
  const trecho = indice < 0
    ? ''
    : texto.slice(Math.max(0, indice - 65), indice + 100);

  const quantidadeCorreta =
    /(?:\b2\s*x\b|\b2\s+(?:unidades?|pipocas?)\b|\bduas\s+pipocas?\b|\bx\s*2\b|\bquantidade\s*:?\s*2\b)/.test(trecho);

  if (!quantidadeCorreta)
    falhas.push('quantidade de duas pipocas');

  if (!valorAssociado(texto, 'subtotal|produtos', '79,80'))
    falhas.push('subtotal R$ 79,80');

  if (!(/\b5\s*%/.test(texto) && /\bpix\b/.test(texto)))
    falhas.push('desconto Pix 5%');

  if (!valorAssociado(texto, 'frete|entrega|taxa de entrega', '12,00'))
    falhas.push('frete R$ 12,00');

  if (!valorAssociado(texto, 'total|valor final', '87,81'))
    falhas.push('total R$ 87,81');

  return resultado(
    falhas.length === 0,
    'K-04: quantidade, desconto e valores conferidos.',
    `K-04: ausente ou divergente: ${falhas.join('; ')}`
  );
}


module.exports = {
  verificarFerramenta,
  verificarConsultaPedido,
  verificarCupomEncerrado,
  verificarFerramentaPedido,
  verificarForaEscopoCopa,
  verificarRegistroFerramentas,
  verificarRecusaCupom,
  verificarValidacaoCupom,
  verificarPedidoK03,
  verificarPedidoK04
};
