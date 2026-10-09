const {expect}=require('@playwright/test');
async function ready(page,url='/web/?subject=exam') {
 await page.addInitScript(()=>{let seed=20261009;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};try{localStorage.setItem('autoScenario','0')}catch{}});
 await page.goto(url);await expect(page.locator('#btn-start')).toBeEnabled();
}
async function start(page,url) {await ready(page,url);await page.locator('#btn-start').click();await expect(page.locator('#quiz-panel')).toBeVisible();}
async function question(page,type='input',index=0) {
 await page.evaluate(({type,index})=>{
  const q=QUESTIONS.filter(q=>(q.type===type||type==='choice'&&q.type!=='input')&&(type!=='input'||q.id.startsWith('pisa-'))).sort((a,b)=>a.id.localeCompare(b.id))[index];if(!q)throw Error('Missing question '+type);
  closeScenarioOverlay();closeZoomModal();gameInstance.questionPool=[q];gameInstance.currentQIdx=0;gameInstance.answersLog=[];gameInstance.combatState='idle';gameInstance.state=STATE_PLAYING;gameInstance.loadQuestion();
 },{type,index});
}
async function finishCombat(page,previous=0) {await page.waitForFunction(n=>gameInstance.currentQIdx>n||gameInstance.state!==STATE_PLAYING||!gameInstance.reviveOverlay.classList.contains('hidden'),previous,{timeout:15000});}
async function geometry(page,selectors) {return page.evaluate(selectors=>selectors.map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return{selector,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,visible:!!el.getClientRects().length}}),selectors);}
module.exports={ready,start,question,finishCombat,geometry};
// Serve the exact production KaTeX version from the lockfile for reproducible formula checks.
async function localFormulaAssets(page){
 const path=require('node:path');const dist=path.dirname(require.resolve('katex'));
 await page.route('https://cdn.jsdelivr.net/npm/katex@*/dist/**',async route=>{
  const resource=new URL(route.request().url()).pathname.split('/dist/')[1];
  await route.fulfill({path:path.join(dist,resource)});
 });
}
async function richQuestion(page){
 await page.evaluate(()=>{
  const q={...gameInstance.questionPool[0],q:'คำนวณจากสูตร $x^2 + 2x + 1$ แล้วอ่านข้อมูลในตาราง<br><table><tr><th>ระยะทาง (กิโลเมตร)</th><th>เวลา (ชั่วโมง)</th></tr><tr><td>120</td><td>2</td></tr></table><br>'+ 'อ่านสถานการณ์และตรวจข้อมูลให้ครบก่อนตอบ '.repeat(12),unit:'กิโลเมตรต่อชั่วโมง (หน่วยคำตอบแบบยาวสำหรับทดสอบ)',placeholder:'กรอกคำตอบตัวเลข',type:'input',targetNumber:60,answers:['60']};
  gameInstance.questionPool=[q];gameInstance.currentQIdx=0;gameInstance.answersLog=[];gameInstance.combatState='idle';gameInstance.state=STATE_PLAYING;gameInstance.loadQuestion();
 });
}
module.exports.localFormulaAssets=localFormulaAssets;module.exports.richQuestion=richQuestion;
