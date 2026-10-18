#!/usr/bin/env node
'use strict';
// Comparação com expectativas sintéticas controladas; não envolve dados da Lia nem validação humana.
const fs=require('node:fs');
const file=process.argv[2];
if(!file){console.error('Uso: node scripts/comparar-juiz-pares-v2.cjs resultados/juiz/juiz-pares-v2.json');process.exit(1)}
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const results=data?.results?.results;
if(!Array.isArray(results))throw new Error('JSON do Promptfoo inválido');
let ok=0, fail=0, err=0, passExpected=0, failExpected=0;
let seen=new Set();
for(const r of results){
 const id=r.testCase?.metadata?.id;const expected=r.testCase?.metadata?.rotulo_controle;
 if(!id||seen.has(id)||!['PASS','FAIL'].includes(expected))throw new Error('Metadados invalidos ou ID duplicado');
 seen.add(id);if(expected==='PASS')passExpected++;else failExpected++;
 const p=r.gradingResult?.pass;
 if(typeof p!=='boolean'||r.response?.error){err++;console.log(`${id}: ERRO`);continue;}
 const actual=p?'PASS':'FAIL';const same=expected===actual;
 console.log(`${id}: esperado ${expected}, Qwen ${actual} — ${same?'OK':'DIVERGENCIA'}`);
 if(same)ok++;else fail++;
}
console.log(`\nCasos=${results.length}, acertos=${ok}, divergencias=${fail}, erros=${err}; referencias PASS=${passExpected}, FAIL=${failExpected}`);
console.log('Observacao: pares sinteticos diagnosticam a rubrica, mas nao provam confiabilidade em dados reais nem equivalem a rotulacao humana.');
if(results.length!==10||passExpected!==5||failExpected!==5||fail||err)process.exitCode=2;
