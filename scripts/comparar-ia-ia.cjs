#!/usr/bin/env node
'use strict';
// Comparacao EXPLORATORIA IA x IA: rotulos de ChatGPT contra Qwen via Promptfoo.
// Nenhuma chamada de rede; nao equivale a validacao humana.
const fs = require('node:fs');
const [csvPath, resultPath] = process.argv.slice(2);
if (!csvPath || !resultPath) {
  console.error('Uso: node scripts/comparar-ia-ia.cjs resultados/juiz/rotulos-ia-v1.csv resultados/juiz/julgamentos-v1-amostra.json');
  process.exit(1);
}
function parseCsv(s) {
  const records = []; let row=[], cell='', quoted=false;
  s=s.replace(/^\uFEFF/,'');
  for(let i=0;i<s.length;i++) {
    const c=s[i];
    if(quoted) {
      if(c==='"' && s[i+1]==='"') {cell+='"';i++;}
      else if(c==='"') quoted=false;
      else cell+=c;
    } else if(c==='"') quoted=true;
    else if(c===',') {row.push(cell);cell='';}
    else if(c==='\n') {row.push(cell.replace(/\r$/,''));records.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted) throw new Error('CSV com aspas nao fechadas.');
  if(row.length||cell) {row.push(cell.replace(/\r$/,''));records.push(row);}
  const [headers,...lines]=records;
  if(!headers) throw new Error('CSV vazio');
  return lines.filter(line=>line.some(v=>String(v).trim())).map(line=>Object.fromEntries(headers.map((h,i)=>[h,line[i]??''])));
}
const labels=parseCsv(fs.readFileSync(csvPath,'utf8'));
const data=JSON.parse(fs.readFileSync(resultPath,'utf8'));
const evalResults=data?.results?.results;
if(!Array.isArray(evalResults)) throw new Error('JSON inesperado: falta results.results.');
const byId=new Map();
for (const r of evalResults) {
  const id=r.testCase?.metadata?.id ?? r.metadata?.id;
  if(id) {
    if(byId.has(id)) throw new Error(`Resultado duplicado para ${id}`);
    byId.set(id,r);
  }
}
let total=0, same=0, refPass=0, refFail=0, qwenPass=0, qwenFail=0;
let tp=0,tn=0,fp=0,fn=0,missing=0,errors=0;
const lines=[];
for(const l of labels) {
  const id=l.id;
  const reference=String(l.rotulo_ia_referencia||l.rotulo_ia||l.rotulo_humano||'').trim().toUpperCase();
  if (!['PASS','FAIL'].includes(reference)) {lines.push(`${id}: ROTULO DE REFERENCIA INVALIDO`);missing++;continue;}
  const r=byId.get(id);
  if(!r) {lines.push(`${id}: SEM RESULTADO QWEN`);missing++;continue;}
  if(r.response?.error || r.gradingResult?.error || typeof (r.gradingResult?.pass ?? r.success)!=='boolean') {
    lines.push(`${id}: ERRO DE JULGAMENTO`);errors++;continue;
  }
  const pred=(r.gradingResult?.pass ?? r.success) ? 'PASS' : 'FAIL';
  total++; if(reference==='PASS') refPass++;else refFail++;
  if(pred==='PASS') qwenPass++;else qwenFail++;
  if(pred===reference) same++;
  if(reference==='PASS'&&pred==='PASS') tp++;
  else if(reference==='FAIL'&&pred==='FAIL') tn++;
  else if(reference==='FAIL'&&pred==='PASS') fp++;
  else fn++;
  lines.push(`${id}: ChatGPT=${reference} | Qwen=${pred}${pred===reference?'':' | DIVERGENCIA'}`);
}
console.log('COMPARACAO EXPLORATORIA IA x IA (NAO validacao humana)\n');
console.log(lines.join('\n'));
console.log('\nResumo:');
console.log(`Casos comparados: ${total}/${labels.length}; faltantes=${missing}; erros=${errors}`);
console.log(`ChatGPT referencia: PASS=${refPass}, FAIL=${refFail}; Qwen: PASS=${qwenPass}, FAIL=${qwenFail}`);
console.log(`Concordancia bruta: ${same}/${total} (${total?((same/total)*100).toFixed(1):'N/D'}%)`);
console.log(`PASS ambos=${tp}; FAIL ambos=${tn}; ChatGPT FAIL / Qwen PASS=${fp}; ChatGPT PASS / Qwen FAIL=${fn}`);
console.log(`Baseline trivial 'sempre FAIL' nesta amostra: ${labels.length?((labels.filter(l=>String(l.rotulo_ia_referencia||l.rotulo_ia||l.rotulo_humano||'').trim().toUpperCase()==='FAIL').length/labels.length)*100).toFixed(1):'N/D'}%`);
console.log('ATENCAO: concordancia entre LLMs nao mede acuracia verdadeira e nao autoriza GO/NO-GO.');
if(missing||errors||total!==12) process.exitCode=2;
