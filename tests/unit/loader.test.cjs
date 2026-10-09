const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const C=require('../../web/js/exam-core.js');
function context(fetch,subject='exam'){
 const warning={textContent:'',classList:{remove(){}}};const c={location:{search:'?subject='+subject},document:{querySelector:()=>null,getElementById:()=>warning},URLSearchParams,AbortController,structuredClone,ASSETS_PATH:'../assets',console:{warn(){},log(){}},ExamCore:C,fetch,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,20)),clearTimeout};c.window=c;vm.createContext(c);for(const file of ['fallback-data.js','quiz.js'])vm.runInContext(fs.readFileSync('web/js/'+file,'utf8'),c);return c;
}
const normal=(url)=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url.replace('../','') ))});
for(const kind of ['404','500','reject','malformed','schema','timeout'])test('loader recovers from '+kind,async()=>{
 const c=context((url,{signal})=>{
  if(kind==='timeout')return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout'))));
  if(kind==='reject')return Promise.reject(Error('offline'));
  if(kind==='malformed')return {ok:true,json:async()=>{throw SyntaxError('invalid JSON')}};
  if(kind==='schema')return {ok:true,json:async()=>({})};
  return {ok:false,status:Number(kind)};
 });
 await c.initQuestions();assert.equal(c.QUESTIONS.length,30);C.validateQuestions(c.QUESTIONS,c.SCENARIOS);assert.ok(vm.runInContext('LOAD_WARNINGS.length',c)>0);
});
test('one corrupted file does not discard the other valid banks',async()=>{
 const c=context(url=>url.endsWith('/math.json')&&!url.includes('/scenarios/')?{ok:false,status:404}:normal(url));await c.initQuestions();assert.equal(c.QUESTIONS.length,30);assert.equal(vm.runInContext('LOAD_WARNINGS.length',c),1);
});
test('subject loader restores missing scenario metadata too',async()=>{
 const c=context(url=>url.includes('/scenarios/')?Promise.reject(Error('offline')):normal(url),'math');await c.initQuestions();assert.equal(c.SCENARIOS.length,11);assert.equal(c.QUESTIONS.length,30);
});
test('invalid PISA counts use canonical fallback',async()=>{
 const c=context(url=>url.endsWith('/pisa.json')&&!url.includes('scenarios')?{ok:true,json:async()=>JSON.parse(fs.readFileSync('assets/data/pisa.json')).slice(0,10)}:normal(url));await c.initQuestions();assert.equal(c.QUESTIONS.length,30);
});
test('scenario mismatch fails clearly rather than silently starting an invalid game',async()=>{
 const c=context(url=>url.includes('scenarios/math')?{ok:true,json:async()=>[]}:normal(url));await assert.rejects(()=>c.initQuestions(),/ไม่พบสถานการณ์/);
});
