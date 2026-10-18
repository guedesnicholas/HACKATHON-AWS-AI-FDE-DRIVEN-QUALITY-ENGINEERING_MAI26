#!/usr/bin/env node
// Relatorio diagnostico OFFLINE de JSON Promptfoo: sem rede, Lia ou Qwen.
const fs=require('node:fs');const path=require('node:path');
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','quality-gates.proposta.json'),'utf8'));
const p=process.argv[2];if(!p){console.error('Uso: node scripts/relatorio-quality-gates-v1.cjs resultados/corrigida/avaliacao-v1-40casos.json');process.exit(1)}
const d=JSON.parse(fs.readFileSync(p,'utf8'));
const rows=d.results?.results;if(!Array.isArray(rows))throw new Error('Falta results.results');
const cases=rows.map(r=>({id:r.testCase?.metadata?.id||r.metadata?.id||'SEMID',pass:r.success===true,errorTecnico:!!(r.response?.error||r.gradingResult?.error),versao:r.response?.metadata?.versao??null,meta:r.response?.metadata||{},tempo:r.latencyMs,tokens:r.response?.tokenUsage?.total??null}));
const expected=cfg.expectedCases*cfg.formalRepeats;
const grouped={};for(const x of cases)(grouped[x.id]??=[]).push(x);
const hist=Object.fromEntries(Object.entries(grouped).map(([id,v])=>[id,v.length]));
const allIds=Array.from(new Set(rows.map(r=>r.testCase?.metadata?.id).filter(Boolean)));
const complete=rows.length===expected&&Object.values(hist).every(v=>v===cfg.formalRepeats)&&allIds.length===cfg.expectedCases;
function metric(xs){return {pass:xs.filter(x=>x.pass).length,total:xs.length,percent:xs.length?100*xs.filter(x=>x.pass).length/xs.length:null}}
function st(m,th){return !complete?'PRELIMINAR':m.total>0&&(m.percent/100)>=th?'ATENDE':'NAO_ATENDE'}
function pct(n){return n==null?'N/D':n.toFixed(1).replace('.',',')+'%'}
const groupRows=[{nome:'Geral',...metric(cases),limite:cfg.thresholds.Geral},...Object.entries(cfg.groups).map(([nome,ids])=>({nome,...metric(cases.filter(x=>ids.includes(x.id))),limite:cfg.thresholds[nome]}))];
const tool=[];for(const x of cases){const e=cfg.toolExpectations[x.id];if(!e)continue;const a=x.meta.ferramentas;
 let estado;if(!Array.isArray(a))estado='TELEMETRIA_AUSENTE';else{const matches=a.filter(y=>y?.ferramenta===e.tool);
 const ok=matches.some(y=>{const z=y.entrada||{};if(e.cupom)return[z.codigo,z.codigo_cupom,z.cupom].some(v=>String(v||'').trim().toUpperCase()===e.cupom);return z.numero_pedido===e.numero_pedido&&String(z.email||'').toLowerCase()===e.email});estado=ok?'CONFORME':matches.length?'ARGUMENTOS_DIVERGENTES':'NAO_OBSERVADA'}
 tool.push({id:x.id,estado});}
const toolOk=tool.filter(x=>x.estado==='CONFORME').length;
const turnMetrics=cases.flatMap(x=>x.meta.metricas||[]);
const tempos=turnMetrics.map(x=>Number(x.metrics?.latencyMs)).filter(Number.isFinite).sort((a,b)=>a-b);
const p95=tempos.length?tempos[Math.ceil(.95*tempos.length)-1]:null;
const tokenMean=cases.map(x=>x.tokens).filter(Number.isFinite).reduce((s,v,_,a)=>s+v/a.length,0)||null;
const versions=new Set(cases.map(x=>x.versao));
const report=[
 '# Quality Gates — análise offline (PROVISÓRIA)',
 '',`Entrada: \`${p}\``, `Avaliações: ${rows.length} (${allIds.length} IDs distintos); esperado formal: ${expected} (40 casos × 3).`,
 `Situação da campanha: **${complete?'COMPLETA':'EXPLORATÓRIA / INCOMPLETA PARA GO-NO-GO'}**.`,
 `Sucesso automático do Promptfoo: **${metric(cases).pass}/${cases.length}**; erros técnicos observados: ${cases.filter(x=>x.errorTecnico).length}.`,
 `Versão relatada no metadata do provider: **${[...versions].map(x=>x===null?'AUSENTE':String(x)).join(', ')}**. Não comprova a aplicação do prompt.`,
 '', '## Gates de resposta (antes da auditoria humana)',
 '| Gate | PASS/total | Observado | Limiar proposto | Status |', '|---|---:|---:|---:|---|',
 ...groupRows.map(m=>`| ${m.nome} | ${m.pass}/${m.total} | ${pct(m.percent)} | ${pct(m.limite*100)} | ${st(m,m.limite)} |`),
 '', 'A taxa automática NÃO é um resultado auditado: contains/regex podem errar. Se os critérios forem alterados, reaplique-os às duas versões antes de comparar.',
 '', '## Ferramentas operacionais obrigatórias',
 `Conformidade observada: **${toolOk}/${tool.length}**. Meta proposta: 100% com chamada e argumentos corretos.`,
 ...tool.map(t=>`- ${t.id}: ${t.estado}`),
 '', 'Ausência de chamada na telemetria não explica a causa-raiz, mas não permite confirmar a operação. Separar chamada de Retrieve e ferramentas operacionais.',
 '', '## Desempenho descritivo',
 `P95 dos tempos de modelo (campo metricas.metrics.latencyMs, em ${tempos.length} turnos reportados): ${p95??'N/D'} ms.`,
 `Média de tokens por avaliação completa: ${tokenMean===null?'N/D':tokenMean.toFixed(1)}.`,
 'Os limites de regressão de latência e tokens exigem dados equivalentes da versão original; não podem ser decididos nesta rodada.',
 '', '## Bloqueios antes do parecer',
 '- Aprovação dos thresholds pela squad.',
 '- Verificação se prompt_sistema realmente altera a Lia; ausência de versao na resposta contraria o esquema esperado do edital.',
 '- Auditoria humana, em especial segurança e os PASS automáticos.',
 '- Calibração independente do Qwen para confiabilidade do juiz.',
 '- Execução formal 40 × 3 por versão, em sessões novas; red teaming reportado separadamente.',
 '- Zero defeitos críticos abertos; decisão final é humana, não tomada apenas pelo script.',
 ''
].join('\n');
const out=path.join('resultados','quality-gates','diagnostico-v1.md');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,report,'utf8');console.log(report);console.log(`\nRelatorio salvo em ${out} (nao publica nem altera resultados originais).`);
