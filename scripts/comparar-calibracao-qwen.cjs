#!/usr/bin/env node
// Compara rotulos humanos independentes com resultado Qwen por id. Nao faz chamadas de rede.
const fs = require('node:fs');
const arquivos=process.argv.slice(2);
if(arquivos.length!==2){console.error('Uso: node scripts/comparar-calibracao-qwen.cjs resultados/juiz/rotulos-humanos-v1.csv resultados/juiz/julgamentos-v1-amostra.json');process.exit(1)}
function csvParse(s){
 s=s.replace(/^\ufeff/,''); let list=[],row=[],cell='',inQuotes=false;
 for(let i=0;i<s.length;i++){const c=s[i];
  if(inQuotes){if(c==='"'&&s[i+1]==='"'){cell+='"';i++}else if(c==='"'){inQuotes=false}else{cell+=c}}
  else if(c==='"')inQuotes=true;
  else if(c===','){row.push(cell);cell=''}
  else if(c==='\n'){row.push(cell.replace(/\r$/,''));list.push(row);row=[];cell=''}
  else cell+=c;
 }
 if(row.length||cell){row.push(cell.replace(/\r$/,''));list.push(row)}
 return list;
}
const [h,...records]=csvParse(fs.readFileSync(arquivos[0],'utf8'));
const ids=records.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));
const doc=JSON.parse(fs.readFileSync(arquivos[1],'utf8'));
const results=doc.results?.results;if(!Array.isArray(results))throw new Error('JSON do juiz sem results.results');
const judgeById=new Map(results.map(r=>[r.testCase?.metadata?.id||r.metadata?.id,r]));
let total=0,equals=0,falseApprove=0;let summary=[];
for(const r of ids){const human=String(r.rotulo_humano||'').trim().toUpperCase();if(!['PASS','FAIL'].includes(human)){summary.push(`${r.id}: SEM ROTULO HUMANO`);continue;}
 const jr=judgeById.get(r.id);if(!jr){summary.push(`${r.id}: SEM RESULTADO QWEN`);continue;}
 if(jr.response?.error||jr.gradingResult?.error||typeof jr.success!=='boolean'){summary.push(`${r.id}: ERRO DO JUIZ`);continue;}
 const j=jr.success?'PASS':'FAIL';total++;equals+=Number(j===human);
 if(human==='FAIL'&&j==='PASS')falseApprove++;
 summary.push(`${r.id}: humano=${human}, Qwen=${j}${human===j?'':' -> DIVERGENCIA'}`);
}
console.log(summary.join('\n'));
const agreement=total?equals/total:null;
console.log(`\nConcordancia: ${equals}/${total} = ${agreement===null?'N/D':(100*agreement).toFixed(1)+'%'}. Falsos PASS do Qwen: ${falseApprove}.`);
const canUse=total>=10&&agreement>=.85&&falseApprove===0;
console.log(`Criterio exploratorio de calibracao (>=10 rotulos, >=85%, zero falsos PASS): ${canUse?'ATINGIDO':'NAO ATINGIDO / INSUFICIENTE'}.`);
console.log('Antes de uso formal, revisar divergencias e calibrar em amostra independente; nao alterar rotulos apos ver Qwen sem adjudicacao registrada.');
