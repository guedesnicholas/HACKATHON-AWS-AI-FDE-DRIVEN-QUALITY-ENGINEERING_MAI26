// Este arquivo fornece uma assertion para validar o acionamento das ferramentas da Lia.
function verificarFerramenta(output, context) {
  const nomeEsperado = context.vars?.ferramenta_esperada;
  const ferramentas = context.metadata?.ferramentas || [];
  if (!nomeEsperado) return { pass: false, score: 0, reason: 'Informe ferramenta_esperada no caso.' };
  const encontrada = ferramentas.some(item => item.ferramenta === nomeEsperado);
  return {
    pass: encontrada,
    score: encontrada ? 1 : 0,
    reason: encontrada ? 'Ferramenta esperada acionada.' : `Ferramenta ausente: ${nomeEsperado}.`,
  };
}
module.exports = { verificarFerramenta };
