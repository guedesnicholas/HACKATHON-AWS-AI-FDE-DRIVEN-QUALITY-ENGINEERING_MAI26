// Le resultados Promptfoo sem disparar nenhuma chamada de API.
// Uso: node scripts/auditar-gates-formais.cjs resultados/formal/corrigida.json corrigida
const fs = require('node:fs');
const path = require('node:path');

const arquivo = process.argv[2];
const versao = process.argv[3];
if (!arquivo || !['original', 'corrigida'].includes(versao)) {
  console.error('Uso: node scripts/auditar-gates-formais.cjs <resultado.json> <original|corrigida>');
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync('config/quality-gates.formal.json', 'utf8'));
const root = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
const registros = root.results?.results || root.results || [];
if (!Array.isArray(registros)) throw new Error('JSON nao contem array Promptfoo de resultados.');
const casos = new Map();
for (const r of registros) {
  const id = r.testCase?.metadata?.id || r.metadata?.id;
  if (!id) throw new Error('Resultado sem ID do Golden Dataset (metadata.id).');
  if (!casos.has(id)) casos.set(id, []);
  casos.get(id).push(r);
}
const catalogo = [...Array.from({length:8}, (_,i)=>`KA-${String(i+1).padStart(2,'0')}`), 'L-02','L-03'];
const calc = ['K-03','K-04','L-01','L-04','L-06','L-09','L-10'];
const grupos = {
  catalogo_e_precos: catalogo,
  calculos_e_totais: calc,
  privacidade: ['PRIV-01','PRIV-02','PRIV-03','PRIV-04'],
  alergenos_e_seguranca: Array.from({length:6}, (_,i)=>`KA-${String(i+9).padStart(2,'0')}`),
  politicas_comerciais: ['K-02','L-04','L-05','L-06','ADV-01','ADV-02','ADV-03','ADV-04','KA-08'],
  multi_turno: ['K-03','K-04','L-09','L-10'],
  fora_de_escopo: ['K-05','K-06','ESC-01','ESC-02']
};
function passou(r) { return r.success === true || (r.success == null && r.gradingResult?.pass === true); }
function classificar(res) {
  const n = res.length, p = res.filter(passou).length;
  return {pass:p, total:n, taxa:n?p/n:null};
}
function fmt(n) {return n==null ? 'n/a' : `${(100*n).toFixed(1)}%`;}
const integridade = [];
if (casos.size !== cfg.min_casos_distintos) integridade.push(`IDs distintos: ${casos.size}, esperado ${cfg.min_casos_distintos}`);
for(const [id, arr] of casos) if(arr.length !== cfg.repeticoes_por_caso) integridade.push(`${id}: ${arr.length} repeticoes`);
if (registros.length !== cfg.min_casos_distintos * cfg.repeticoes_por_caso) integridade.push(`Total: ${registros.length}, esperado ${cfg.min_casos_distintos * cfg.repeticoes_por_caso}`);
const linhas = [
  `# Quality Gates formais — ${versao.toUpperCase()} (avaliacao automatica provisoria)`,
  '',
  `Fonte: \`${arquivo.replace(/\\/g,'/')}\``,
  `Registros: ${registros.length}; IDs distintos: ${casos.size}; inconsistencias de integridade: ${integridade.length}.`,
  `Thresholds: ${cfg.estado}.`,
  '',
  '| Gate | PASS/Total | Taxa | Limiar | Resultado automatico |',
  '|---|---:|---:|---:|---|'
];
const gateResults = {};
function adicionarGate(chave, res) {
  const lim = cfg.limiares[chave];
  const ok = res.taxa != null && res.taxa + 1e-10 >= lim;
  gateResults[chave] = { ...res, limiar:lim, atingiu:ok };
  linhas.push(`| ${chave} | ${res.pass}/${res.total} | ${fmt(res.taxa)} | ${fmt(lim)} | ${ok?'ATENDE':'NAO ATENDE'} |`);
}
adicionarGate('geral',classificar(registros));
for (const [chave,ids] of Object.entries(grupos)) {
  const faltantes = ids.filter(id=>!casos.has(id));
  if (faltantes.length) integridade.push(`${chave}: faltam IDs ${faltantes.join(', ')}`);
  adicionarGate(chave, classificar(ids.flatMap(id=>casos.get(id)||[])));
}
const toolSpecs = {
  'K-01': {tipo:'pedido'}, 'PRIV-01':{tipo:'pedido'},'L-07':{tipo:'pedido'},'L-08':{tipo:'pedido'},
  'K-02': {tipo:'cupom'},'L-05':{tipo:'cupom'},'L-06':{tipo:'cupom'}
};
let observaveis = 0, semRegistro = 0, semFerramenta = 0, errosArgumentos = 0;
const ferramentas = [];
for (const [id,spec] of Object.entries(toolSpecs)) for(const r of casos.get(id)||[]) {
  const meta=r.response?.metadata||{};
  const ff=meta.ferramentas;
  if (!Array.isArray(ff)) {semRegistro++; ferramentas.push(`${id}: METADADOS_NAO_DISPONIVEIS`);continue;}
  let validou=false, existeTipo=false;
  const vars=r.testCase?.vars || r.vars || {};
  const mensagem=String(vars.mensagem ||'');
  const pedidoEsperado=String(vars.numero_pedido_esperado||mensagem.match(/PD-\d{4}/i)?.[0]||'').toUpperCase();
  const emailEsperado=String(vars.email_esperado||mensagem.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0]||'').toLowerCase();
  const cupomEsperado=String(vars.cupom_esperado||'').toUpperCase();
  for (const t of ff) {
    const acao=String(t.ferramenta||'').split('___').pop();
    const ent=t.entrada||{};
    if (spec.tipo==='pedido' && /consultar_pedido/i.test(acao)) {
      existeTipo=true;
      if (pedidoEsperado && emailEsperado && String(ent.numero_pedido||'').toUpperCase()===pedidoEsperado && String(ent.email||'').toLowerCase()===emailEsperado) validou=true;
    }
    if(spec.tipo==='cupom' && /(validar|verificar)_cupom/i.test(acao)) {
      existeTipo=true;
      if(cupomEsperado && [ent.codigo,ent.codigo_cupom,ent.cupom].some(x=>String(x||'').toUpperCase()===cupomEsperado)) validou=true;
    }
  }
  if(validou) observaveis++;
  else {if(existeTipo) errosArgumentos++; else semFerramenta++; ferramentas.push(`${id}: ${existeTipo?'ARGUMENTOS_DIVERGENTES':'FERRAMENTA_NAO_OBSERVADA'}`);}
}
const totalTools=Object.keys(toolSpecs).reduce((n,id)=>n+(casos.get(id)?.length||0),0);
const toolRes = {pass:observaveis,total:totalTools,taxa:totalTools?observaveis/totalTools:null};
adicionarGate('ferramentas_operacionais',toolRes);
linhas.push('','## Telemetria de ferramentas operacionais',`Chamadas comprovadas: ${observaveis}/${totalTools}. Campo ausente: ${semRegistro}; sem ferramenta correspondente: ${semFerramenta}; argumentos divergentes: ${errosArgumentos}.`, 'O campo ausente nao comprova que o backend nao chamou a ferramenta. Nao equivale a operacao verificada.','');
linhas.push('## Evidencia de versao enviada pela API');
const reportados={};
for(const r of registros) {const v=r.response?.metadata?.versao || '(ausente)';reportados[v]=(reportados[v]||0)+1;}
linhas.push('`'+JSON.stringify(reportados)+'`');
if(versao==='corrigida' && reportados.corrigida !== registros.length) integridade.push('API nao comprovou versao corrigida em todas as respostas');
linhas.push('','## Integridade / bloqueios');
linhas.push(...(integridade.length?integridade.map(x=>`- ${x}`):['- Contagem da campanha conforme 40 × 3.']));
linhas.push('','## Ressalvas e parecer','- Este resultado verifica assertions existentes; elas podem aprovar respostas incorretas e reprovar respostas corretas.','- Verificar manualmente os casos criticos, falsos PASS/FAIL e defeitos abertos.','- O juiz Qwen e uma frente semantica exploratoria separada; nao esta embutido nesta campanha.','- Mesmo com todos os gates automaticos atingidos, nao emitir GO sem confirmar prompt_sistema, auditoria de assertions e aprovacao da squad.');
const pasta='resultados/formal';fs.mkdirSync(pasta,{recursive:true});
const saida=path.join(pasta,`gates-${versao}.md`);
fs.writeFileSync(saida,linhas.join('\n')+'\n');
console.log(linhas.slice(0,linhas.indexOf('## Telemetria de ferramentas operacionais')).join('\n'));
console.log(`\nRelatorio salvo em ${saida}; bloqueios/inconsistencias: ${integridade.length}.`);
// Nao usar exitCode para falha de gate: o relatorio deve sair mesmo com resultados ruins.
