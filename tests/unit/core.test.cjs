const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');const {execFileSync}=require('node:child_process');
const C=require('../../web/js/exam-core.js');
const read=s=>JSON.parse(fs.readFileSync(`assets/data/${s}.json`));
const bank={pisaQ:read('pisa'),pisaS:read('scenarios/pisa'),mathQ:read('math'),mathS:read('scenarios/math'),sciQ:read('science'),sciS:read('scenarios/science'),thaiQ:read('thai'),thaiS:read('scenarios/thai')};
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}};
test('canonical datasets, references and fallback are valid',()=>{
 for(const subject of ['math','science','thai','pisa','exam']) {
  const qs=read(subject),ss=read('scenarios/'+subject);C.validateQuestions(qs,ss);
  for(const entry of [...qs,...ss]){const texts=[entry.q,entry.body,entry.img,...(entry.c||[]),...(entry.images||[])];for(const t of texts.filter(Boolean)){const paths=[...(String(t).matchAll(/src=["']([^"']+)/g))].map(m=>m[1]);if(t===entry.img||(entry.images||[]).includes(t))paths.push(t);for(const p of paths)if(!/^(https?:|data:)/.test(p))assert.ok(fs.existsSync(path.resolve('web',p)),p)}}
 }
 execFileSync(process.execPath,['scripts/generate-fallback.cjs','--check']);
});
test('10,000 seeded exams preserve every invariant',()=>{
 const counts={};const random=rng(20261009);
 const originals=[...bank.mathQ,...bank.sciQ,...bank.thaiQ];
 for(let n=0;n<10000;n++) {
  const {questions:qs,scenarios:ss}=C.sampleExamFromBank(bank,random);
  assert.equal(qs.length,30);assert.equal(new Set(qs.map(q=>q.id)).size,30);
  for(const q of bank.pisaQ)assert.ok(qs.some(x=>x.id===q.id));
  for(let i=0;i<3;i++){const wave=qs.slice(i*10,i*10+10),subject=['math','science','thai'][i];assert.ok(wave.every(q=>q.subject===subject));assert.equal(wave.filter(q=>q.id.startsWith('pisa-')).length,5)}
  assert.deepEqual(C.groups(qs.filter(q=>q.id.startsWith('math-'))).map(g=>g.length).sort(),[2,3]);
  for(const group of C.groups(qs).filter(g=>g[0].scenarioId)) {
   const positions=group.map(q=>qs.indexOf(q));assert.equal(positions.at(-1)-positions[0]+1,positions.length);
   const source=originals.filter(q=>q.scenarioId===group[0].scenarioId);
   if(source.length)assert.deepEqual(group.map(q=>q.id),source.map(q=>q.id));
   assert.ok(ss.some(s=>s.id===group[0].scenarioId));
  }
  qs.filter(q=>!q.id.startsWith('pisa-')).forEach(q=>counts[q.id]=(counts[q.id]||0)+1);
 }
 fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/sampling-frequency.json',JSON.stringify({seed:20261009,rounds:10000,frequencies:originals.map(q=>({id:q.id,subject:q.subject,scenarioId:q.scenarioId||null,count:counts[q.id]||0}))},null,2));
 console.log('Seed 20261009: 10,000 valid exams; sampled question frequencies',Math.min(...Object.values(counts)),Math.max(...Object.values(counts)));
});
test('grouping does not depend on adjacency and sample keeps whole clusters',()=>{
 const list=[{id:'a',scenarioId:'x'},{id:'b',scenarioId:'y'},{id:'c',scenarioId:'x'},{id:'d',scenarioId:'y'},{id:'e'},{id:'f',scenarioId:'y'}];
 for(let seed=0;seed<100;seed++){const qs=C.sampleGroups(list,5,rng(seed));assert.equal(qs.length,5);assert.ok(qs.some(q=>q.id==='a'));assert.ok(qs.some(q=>q.id==='c'));assert.equal(qs.filter(q=>q.scenarioId==='y').length,3)}
 assert.throws(()=>C.sampleGroups([{id:'a',scenarioId:'x'},{id:'b',scenarioId:'x'}],5));
 assert.equal(C.clusterAndShuffleQuestions([{id:'a'},{id:'b'}],()=>0).length,2);
});
test('bad data and impossible banks fail before a game starts',()=>{
 const q=bank.pisaQ[0];
 for(const invalid of [null,{},[],[null],[{...q,id:''}],[q,q],[{...q,type:'unknown'}],[{...q,q:''}],[{...q,targetNumber:Infinity}],[{...q,targetNumbers:['54']}],[{...q,answers:[null]}],[{...q,img:2}],[{...q,showImg:'yes'}],[{...q,targetNumber:null,targetNumbers:[],answers:[]}]])assert.throws(()=>C.validateQuestions(invalid));
 assert.throws(()=>C.validateQuestions([q],[]));
 const choice=bank.mathQ[0];for(const patch of [{a:4},{a:1.5},{c:['a']},{c:['a','b','c','']}])assert.throws(()=>C.validateQuestions([{...choice,...patch}]));
 for(const ss of [null,[{id:'x',body:''}],[{id:'x',body:'a'},{id:'x',body:'b'}],[{id:'x',body:'a',images:3}]])assert.throws(()=>C.validateScenarios(ss));
 assert.throws(()=>C.sampleExamFromBank({...bank,pisaQ:bank.pisaQ.slice(1)}));
 assert.throws(()=>C.sampleExamFromBank({...bank,mathQ:bank.mathQ.filter(q=>q.scenarioId==='gacha')}));
 assert.throws(()=>C.sampleExamFromBank({...bank,sciS:[...bank.sciS,bank.mathS[0]]}));
});
test('accepted answer families and strict decimal boundaries',()=>{
 for(const q of [...bank.pisaQ,...bank.mathQ].filter(q=>q.type==='input')){
  for(const a of q.answers)assert.equal(C.checkTextAnswer(a,q),true,`${q.id}: ${a}`);
  const value=q.targetNumber;
  for(const a of [String(value),`ตอบ ${value} ${q.unit}ครับ`,`ประมาณ ${value}`,String(value).replace(/\d/g,d=>'๐๑๒๓๔๕๖๗๘๙'[d])])assert.equal(C.checkTextAnswer(a,q),true,a);
 }
 for(const value of [0,10,-10,54.4,.001]){
  const q={type:'input',targetNumber:value};
  const base=Math.round(value*1000);for(const delta of [-51,-50,-49,49,50,51])assert.equal(C.checkTextAnswer(String((base+delta)/1000),q),Math.abs(delta)<50,`${value}, ${delta}`);
 }
 assert.ok(C.checkTextAnswer('0',{targetNumber:0}));assert.ok(C.checkTextAnswer('1000000000000000000000',{targetNumber:1e21}));
 assert.ok(C.checkTextAnswer('๕๔ เซด',{answers:['๕๔ เซด']}));
 assert.ok(C.checkTextAnswer(' HELLO ',{answers:['hello']}));
 for(const a of ['', ' ', '54.5', '54/2', '54,000', '54e3', '54 หรือ 99', 'ไม่ใช่ 54', '54abc','54%', '<b>54</b>', '54\u200b','5 4','54.','54..0','54 กิโลเมตร 60','54'+'x'.repeat(513)])assert.equal(C.checkTextAnswer(a,bank.pisaQ[0]),false,a);
});
test('normalization preserves unknown fields and false image flags',()=>{
 const raw={...bank.pisaQ[0],custom:{note:'keep'},showImg:'false'};
 const normalized=C.normalizeQuestion(raw);assert.deepEqual(normalized.custom,raw.custom);assert.equal(normalized.showImg,false);assert.deepEqual(normalized.answers,raw.answers);assert.throws(()=>C.normalizeQuestion(null));
});
test('hint covers multiple and negative targets, labels have one unit',()=>{
 for(const q of [{targetNumber:54,targetNumbers:[54.4],unit:'เซด'},{targetNumber:-10,targetNumbers:[-20]},{targetNumber:0}]){
  const hint=C.inputHint(q);const numbers=hint.match(/-?\d+/g).map(Number);for(const t of [q.targetNumber,...(q.targetNumbers||[])])assert.ok(t>=numbers[0]&&t<=numbers[1]);
 }
 assert.equal(C.correctLabel({correctDisplay:'54 เซด',unit:'เซด'}),'54 เซด');assert.equal(C.correctLabel({correctDisplay:'54',unit:'เซด'}),'54 เซด');assert.equal(C.correctLabel({correctDisplay:'0',unit:'ลิตร'}),'0 ลิตร');
});
test('callback round trips mixed Thai answers and keeps original query/hash',()=>{
 const questions=[bank.pisaQ[0],bank.mathQ[0]],answers=['ตอบ ๕๔ เซดครับ',bank.mathQ[0].a];
 const u=new URL(C.resultUrl('/mock?keep=1#done','https://example.test/web/',{studentId:'เด็ก 1',token:'a&b',answers,questions,status:'victory'}));
 assert.equal(u.searchParams.get('keep'),'1');assert.equal(u.hash,'#done');assert.equal(u.searchParams.get('score'),'2');assert.deepEqual(JSON.parse(u.searchParams.get('answers')),answers);assert.deepEqual(JSON.parse(u.searchParams.get('question_ids')),questions.map(q=>q.id));
 assert.equal(C.countCorrect([54,3],questions),1); // numeric 54 remains compatible with the grading helper
 for(const url of ['javascript:alert(1)','data:text/plain,x','ftp://example.test'])assert.throws(()=>C.resultUrl(url,'https://example.test',{answers,questions,status:'gameover'}));
 assert.throws(()=>C.resultUrl('/mock','https://example.test',{answers,questions,status:'playing'}));
 const partial=new URL(C.resultUrl('/mock','https://example.test',{answers:['54'],questions,status:'gameover'}));assert.equal(JSON.parse(partial.searchParams.get('question_ids')).length,2);assert.equal(JSON.parse(partial.searchParams.get('answers')).length,1);
});
test('mini-game graph independently agrees with the mathematical answers',()=>{
 const source=fs.readFileSync('web/js/minigame-shortest-path.js','utf8');const c={window:{}};vm.createContext(c);vm.runInContext(source,c);
 const graph=c.window.ShortestPathMiniGame.adj;const distances={home:0},todo=new Set(Object.keys(graph));
 while(todo.size){const node=[...todo].sort((a,b)=>(distances[a]??Infinity)-(distances[b]??Infinity))[0];todo.delete(node);for(const edge of graph[node]){const distance=(distances[node]??Infinity)+edge.km;if(distance<(distances[edge.to]??Infinity))distances[edge.to]=distance;}}
 assert.equal(distances.school,10);const [distance,fuel]=bank.mathQ.filter(q=>q.scenarioId==='shortest-path');assert.equal(distance.targetNumber,distances.school);assert.equal(distances.school*2*5/8,12.5);assert.deepEqual(fuel.targetNumbers,[12.5,13]);
});
test('long callback payload round trips without losing Thai text or IDs',()=>{
 const questions=bank.pisaQ,answers=questions.map(q=>q.type==='input'?'ก'.repeat(512):q.a);
 const u=new URL(C.resultUrl('https://example.test/result?keep=1#finish','https://example.test/web/',{studentId:'เด็กไทย',token:'x'.repeat(256),answers,questions,status:'gameover'}));
 assert.deepEqual(JSON.parse(u.searchParams.get('answers')),answers);assert.deepEqual(JSON.parse(u.searchParams.get('question_ids')),questions.map(q=>q.id));assert.ok(u.href.length>8000);assert.equal(u.hash,'#finish');
});
