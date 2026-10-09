const {test,expect}=require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
const {ready,start,question,finishCombat,geometry}=require('./helpers.cjs');
const errors=new WeakMap();
test.beforeEach(async({page})=>{const list=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message));});
test.afterEach(async({page})=>{expect(errors.get(page)).toEqual([])});

test('all subjects and Thai aliases load usable questions',async({page})=>{
 for(const subject of ['math','science','thai','exam','คณิตศาสตร์','วิทยาศาสตร์','ภาษาไทย','สอบรวม','unknown']){
  await ready(page,'/web/?subject='+encodeURIComponent(subject));
  expect(await page.evaluate(()=>QUESTIONS.length)).toBe(30);
  await page.locator('#btn-start').click();await expect(page.locator('#quiz-panel')).toBeVisible();
 }
});
test('short answers, empty error, composition, hotkeys and duplicate submission',async({page})=>{
 await start(page);await question(page);
 await expect(page.locator('#quiz-text-input')).toBeVisible();await expect(page.locator('.choices-grid')).toBeHidden();
 await page.locator('#btn-submit-text').click();await expect(page.locator('#quiz-input-error')).toContainText('กรุณาพิมพ์');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);
 await page.locator('#item-telescope').focus();await page.keyboard.press('3');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);
 await page.locator('#quiz-text-input').fill('ตอบ ๕๔ เซดครับ');
 await page.locator('#quiz-text-input').dispatchEvent('compositionstart');await page.locator('#quiz-text-input').press('Enter');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);
 await page.locator('#quiz-text-input').dispatchEvent('compositionend');await page.locator('#quiz-text-input').press('Enter');
 await expect(page.locator('#answer-feedback')).toContainText('ตอบถูก');
 await page.evaluate(()=>{submitCurrentTextAnswer();selectChoice(2)});expect(await page.evaluate(()=>gameInstance.answersLog)).toEqual(['ตอบ ๕๔ เซดครับ']);
 await finishCombat(page);await expect(page.locator('#victory-summary')).toContainText('ตอบถูก 1 ข้อ');
});
test('misleading input is wrong and unit appears once in the revealed answer',async({page})=>{
 await start(page);await question(page);await page.locator('#quiz-text-input').fill('54/2');await page.locator('#btn-submit-text').click();
 await expect(page.locator('#answer-feedback')).toContainText('ตอบผิด');await expect(page.locator('#answer-feedback')).not.toContainText('เซด เซด');
 await finishCombat(page);await expect(page.locator('#victory-summary')).toContainText('ตอบถูก 0 ข้อ');
});
test('telescope cannot waste another item on the same input hint',async({page})=>{
 await start(page);await question(page);await page.locator('#item-telescope').click();await expect(page.locator('#quiz-input-hint')).toBeVisible();
 expect(await page.evaluate(()=>gameInstance.items.Telescope.count)).toBe(1);
 await page.locator('#item-telescope').click();expect(await page.evaluate(()=>gameInstance.items.Telescope.count)).toBe(1);
 await question(page,'choice');await page.locator('#item-telescope').click();expect(await page.locator('.btn-choice:disabled').count()).toBe(2);await page.evaluate(()=>selectChoice(Number(document.querySelector('.btn-choice:disabled').id.split('-').pop())));expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);
});
test('scenario keyboard focus and zoom block answers without losing input',async({page})=>{
 await start(page);await question(page);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-open-scenario').click();
 await expect(page.locator('#scenario-overlay')).toBeVisible();await page.keyboard.press('3');
 await page.evaluate(()=>{selectChoice(2);submitCurrentTextAnswer()});expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);
 await page.keyboard.press('Escape');await expect(page.locator('#scenario-overlay')).toBeHidden();await expect(page.locator('#quiz-text-input')).toHaveValue('54');
 await question(page,'input',1);await page.locator('#question-img').focus();await page.locator('#question-img').press('Enter');await expect(page.locator('#image-zoom-modal')).toHaveClass(/active/);await page.keyboard.press('3');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);await page.locator('#image-zoom-modal').click({position:{x:5,y:5}});
});
test('item thresholds, repair, cannonball and restart reset all state',async({page})=>{
 await start(page);await question(page);
 for(const [score,expected] of [[60,[0,0,0,0]],[61,[1,1,0,0]],[69,[1,1,0,0]],[70,[1,1,1,0]],[79,[1,1,1,0]],[80,[2,2,1,1]]]){
  const counts=await page.evaluate(score=>{window.USER_SCORE=score;gameInstance.restartGame();return Object.values(gameInstance.items).map(x=>x.count)},score);expect(counts).toEqual(expected);
 }
 await question(page);await page.locator('#item-repair').click();expect(await page.evaluate(()=>gameInstance.items['Repair Kit'].count)).toBe(2);
 await page.evaluate(()=>gameInstance.player.hp-=40);await page.locator('#item-repair').click();expect(await page.evaluate(()=>gameInstance.items['Repair Kit'].count)).toBe(1);
 await page.evaluate(()=>{gameInstance.questionPool.push({...gameInstance.questionPool[0],id:'test-next'})});await page.locator('#item-cannonball').click();await page.locator('#quiz-text-input').fill('999');await page.locator('#btn-submit-text').click();await finishCombat(page);expect(await page.evaluate(()=>gameInstance.doubleDamage)).toBe(true);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();expect(await page.evaluate(()=>gameInstance.doubleDamage)).toBe(false);expect(await page.evaluate(()=>gameInstance.pendingDmg)).toBe(await page.evaluate(()=>PLAYER_BASE_DMG*2));await finishCombat(page,1);
 await page.evaluate(()=>gameInstance.restartGame());expect(await page.evaluate(()=>({answers:gameInstance.answersLog,idx:gameInstance.currentQIdx,double:gameInstance.doubleDamage,hint:gameInstance.inputHintUsed}))).toEqual({answers:[],idx:0,double:false,hint:false});
 for(let i=0;i<20;i++)await page.evaluate(()=>gameInstance.restartGame());expect(await page.evaluate(()=>gameInstance.questionPool.length)).toBe(30);
});
test('revive and declining revive keep answered counts correct',async({page})=>{
 await start(page);await question(page);await page.evaluate(()=>gameInstance.player.hp=1);await page.locator('#quiz-text-input').fill('999');await page.locator('#btn-submit-text').click();await finishCombat(page);
 await expect(page.locator('#revive-overlay')).toBeVisible();await page.evaluate(()=>useRevive());await expect(page.locator('#victory-summary')).toContainText('ตอบผิด 1 ข้อ');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(1);
 await page.evaluate(()=>gameInstance.restartGame());await question(page);await page.evaluate(()=>gameInstance.player.hp=1);await page.locator('#quiz-text-input').fill('999');await page.locator('#btn-submit-text').click();await finishCombat(page);await page.evaluate(()=>declineRevive());await expect(page.locator('#gameover-summary')).toContainText('ตอบผิด 1 ข้อ');
});
test('fallback works for unavailable, malformed, invalid and hanging requests',async({page})=>{
 for(const kind of ['404','500','abort','malformed','invalid','timeout']){
  await page.route('**/assets/data/**',async route=>{
   if(kind==='abort')return route.abort();if(kind==='timeout')return;
   return route.fulfill({status:kind==='404'?404:kind==='500'?500:200,contentType:'application/json',body:kind==='malformed'?'{':kind==='invalid'?'{}':'[]'});
  });
  await ready(page);expect(await page.evaluate(()=>QUESTIONS.length)).toBe(30);await expect(page.locator('#data-load-status')).toBeVisible();
  expect(await page.evaluate(()=>QUESTIONS.every(q=>!q.scenarioId||!!getScenarioById(q.scenarioId)))).toBe(true);await page.unrouteAll({behavior:'ignoreErrors'});
 }
});
test('one-file failure and missing scenarios use canonical fallback',async({page})=>{
 await page.route('**/assets/data/math.json',r=>r.abort());await page.route('**/assets/data/scenarios/science.json',r=>r.fulfill({status:404,body:''}));
 await ready(page);expect(await page.evaluate(()=>QUESTIONS.length)).toBe(30);await expect(page.locator('#data-load-status')).toContainText('math.json');
});
test('storage and external fonts/formula/audio/images can fail without a soft lock',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}});
 await page.route('https://**',r=>r.abort());await page.route('**/assets/audio/**',r=>r.abort());await page.route('**/assets/images/**',r=>r.abort());await start(page);await question(page);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();await finishCombat(page);await expect(page.locator('#victory-overlay')).toBeVisible();
});
test('mock callback receives the actual shuffled IDs, answers and score',async({page})=>{
 await page.route('**/mock-result**',r=>r.fulfill({status:200,contentType:'text/html',body:'<h1>Mock LMS received</h1>'}));
 await start(page,'/web/?subject=exam&student_id=เด็ก1&session_token=tok&callback_url='+encodeURIComponent('/mock-result?keep=1#done'));await question(page);
 const ids=await page.evaluate(()=>gameInstance.questionPool.map(q=>q.id));await page.locator('#quiz-text-input').fill('ตอบ ๕๔ เซดครับ');await page.locator('#btn-submit-text').click();await finishCombat(page);await page.locator('#btn-submit-victory').click();await page.waitForURL('**/mock-result**');
 const url=new URL(page.url());expect(url.searchParams.get('score')).toBe('1');expect(url.searchParams.get('token')).toBe('tok');expect(url.searchParams.get('keep')).toBe('1');expect(url.hash).toBe('#done');expect(JSON.parse(url.searchParams.get('question_ids'))).toEqual(ids);expect(JSON.parse(url.searchParams.get('answers'))).toEqual(['ตอบ ๕๔ เซดครับ']);
});
test('admin preserves metadata, previews input, exports, imports and tracks dirty state',async({page},info)=>{
 page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');
 await page.selectOption('#subject-select','pisa');await expect(page.locator('#input-question-type')).toHaveValue('input');
 const frame=page.frameLocator('#game-preview-frame');await expect(frame.locator('#quiz-text-input')).toBeVisible();await expect(frame.locator('.choices-grid')).toBeHidden();
 await page.evaluate(()=>loadedQuestions[0].custom={retain:'yes'});await page.locator('#input-answer-unit').fill('เซด');await page.locator('#input-target-numbers').fill('54, 54.4');await page.waitForTimeout(100);await expect(page.locator('#input-target-numbers')).toBeFocused();await expect(page.locator('#save-status-text')).toContainText('ยังไม่บันทึก');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดข้อสอบ',exact:true}).click();const file=await download;const output=info.outputPath('pisa-export.json');await file.saveAs(output);
 const data=JSON.parse(fs.readFileSync(output));expect(data[0].type).toBe('input');expect(data[0].targetNumbers).toEqual([54,54.4]);expect(data[0].custom).toEqual({retain:'yes'});expect(data[0].id).toBe('pisa-001');
 await page.locator('#import-file-input').setInputFiles(output);await expect(page.locator('#save-status-text')).toContainText('ยังไม่บันทึก');
 await page.locator('#input-question-type').selectOption('choice');await expect(page.locator('#choice-editor-fields')).toBeVisible();await page.locator('#input-question-type').selectOption('input');await expect(page.locator('#input-target-numbers')).toHaveValue('54, 54.4');
 await page.getByRole('button',{name:'+ เพิ่มคำถามข้อถัดไป'}).click();const id=await page.locator('#input-question-id').inputValue();expect(id).toMatch(/^pisa-/);expect(id).not.toBe('pisa-001');await page.getByRole('button',{name:'ลบข้อสอบนี้'}).click();await expect(page.locator('#question-count-badge')).toHaveText('15 ข้อ');
});
test('admin validation and failed/cancelled writes preserve unsaved changes',async({page})=>{
 page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');
 await page.locator('#input-q-text').fill('');await page.getByRole('button',{name:'ดาวน์โหลดข้อสอบ',exact:true}).click();await expect(page.locator('#admin-validation-error')).toContainText('โจทย์ว่าง');await expect(page.locator('#input-q-text')).toBeFocused();
 await page.locator('#input-q-text').fill('โจทย์แก้ไข');
 await page.evaluate(()=>{window.showSaveFilePicker=async()=>{throw new DOMException('cancelled','AbortError')}});await page.getByRole('button',{name:'💾 บันทึกทับไฟล์'}).click();await expect(page.locator('#save-status-text')).toContainText('ยังไม่บันทึก');
 await page.evaluate(()=>{window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async()=>{throw Error('disk full')},close:async()=>{}})})});await page.getByRole('button',{name:'💾 บันทึกทับไฟล์'}).click();await expect(page.locator('#save-status-text')).toContainText('ยังไม่บันทึก');
});
test('unrelated postMessage cannot replace the preview',async({page})=>{
 await ready(page,'/web/?subject=math&adminPreview=1');await page.waitForFunction(()=>!!gameInstance);const old=await page.locator('#question-text').textContent();
 await page.evaluate(()=>window.postMessage({type:'admin-preview-update',payload:{question:'INJECTED'}},'*'));await expect(page.locator('#question-text')).toHaveText(old);
});
test('input controls wrap, retain contrast and stay within their panel',async({page},info)=>{
 await start(page);await question(page,'input',1);
 for(const size of [{width:1920,height:1080},{width:1280,height:720},{width:1024,height:768},{width:844,height:390},{width:390,height:844}]){
  await page.setViewportSize(size);
  const boxes=await geometry(page,['#input-answer-container','#quiz-text-input','#quiz-input-unit','#btn-submit-text']);
  const panel=boxes[0];for(const b of boxes.slice(1)){expect(b.width).toBeGreaterThan(40);expect(b.x).toBeGreaterThanOrEqual(panel.x-1);expect(b.right).toBeLessThanOrEqual(panel.right+1)}
  if(size.width===844)await page.screenshot({path:info.outputPath('mobile-input.png')});
 }
 await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>document.documentElement.style.fontSize='32px');const boxes=await geometry(page,['#input-answer-container','#quiz-text-input','#btn-submit-text']);expect(boxes[1].right).toBeLessThanOrEqual(boxes[0].right+1);
});

test('complete real exam wins with consistent score across every wave and callback',async({page},info)=>{
 test.setTimeout(180000);
 await page.route('**/full-result**',r=>r.fulfill({status:200,contentType:'text/html',body:'<h1>Full exam received</h1>'}));
 await start(page,'/web/?subject=exam&callback_url='+encodeURIComponent('/full-result?keep=yes'));
 const ids=await page.evaluate(()=>gameInstance.questionPool.map(q=>q.id));
 for(let i=0;i<30;i++){
  await page.waitForFunction(i=>gameInstance.currentQIdx===i&&gameInstance.combatState==='idle',i);
  const q=await page.evaluate(()=>gameInstance.questionPool[gameInstance.currentQIdx]);
  expect(q.subject).toBe(i<10?'math':i<20?'science':'thai');
  if(q.type==='input'){await page.locator('#quiz-text-input').fill(String(q.targetNumber));await page.locator('#btn-submit-text').click()}
  else await page.locator('#choice-'+q.a).click();
  await finishCombat(page,i);
 }
 await expect(page.locator('#victory-summary')).toContainText('ตอบถูก 30 ข้อ');await page.screenshot({path:info.outputPath('actual-victory.png'),animations:'disabled'});await page.locator('#btn-submit-victory').click();await page.waitForURL('**/full-result**');
 const url=new URL(page.url());expect(url.searchParams.get('score')).toBe('30');expect(JSON.parse(url.searchParams.get('question_ids'))).toEqual(ids);expect(JSON.parse(url.searchParams.get('answers')).length).toBe(30);fs.writeFileSync(info.outputPath('mock-callback.json'),JSON.stringify(Object.fromEntries(url.searchParams),null,2));
});
test('real exam loses early and submits an aligned partial result',async({page},info)=>{
 test.setTimeout(90000);await page.route('**/partial-result**',r=>r.fulfill({status:200,contentType:'text/html',body:'<h1>Partial exam received</h1>'}));
 await start(page,'/web/?subject=exam&score=60&callback_url='+encodeURIComponent('/partial-result'));
 const ids=await page.evaluate(()=>gameInstance.questionPool.map(q=>q.id));
 for(let i=0;i<30;i++){
  const state=await page.evaluate(()=>gameInstance.state);if(state==='GAME_OVER')break;
  const q=await page.evaluate(()=>gameInstance.questionPool[gameInstance.currentQIdx]);
  if(q.type==='input'){await page.locator('#quiz-text-input').fill('999');await page.locator('#btn-submit-text').click()}
  else await page.locator('#choice-'+((q.a+1)%4)).click();await finishCombat(page,i);
 }
 await expect(page.locator('#gameover-summary')).toContainText('ตอบถูก 0 ข้อ');await page.screenshot({path:info.outputPath('actual-gameover.png'),animations:'disabled'});const done=await page.evaluate(()=>gameInstance.answersLog.length);expect(done).toBeLessThan(30);await page.locator('#btn-submit-gameover').click();await page.waitForURL('**/partial-result**');
 const url=new URL(page.url());expect(url.searchParams.get('score')).toBe('0');expect(JSON.parse(url.searchParams.get('question_ids'))).toEqual(ids);expect(JSON.parse(url.searchParams.get('answers')).length).toBe(done);expect(url.searchParams.get('status')).toBe('gameover');fs.writeFileSync(info.outputPath('mock-callback.json'),JSON.stringify(Object.fromEntries(url.searchParams),null,2));
});
test('all question content is renderable and accessible with scrolling',async({page},info)=>{
 await start(page);const result=await page.evaluate(async()=>{
  const problems=[],checked=[];
  for(const subject of ['math','science','thai','pisa','exam']) {
   const qs=await fetch('../assets/data/'+subject+'.json').then(r=>r.json());const ss=await fetch('../assets/data/scenarios/'+subject+'.json').then(r=>r.json());indexScenarios(ss);
   for(const q of qs){closeScenarioOverlay();closeZoomModal();gameInstance.questionPool=[ExamCore.normalizeQuestion(q)];gameInstance.currentQIdx=0;gameInstance.combatState='idle';gameInstance.state=STATE_PLAYING;gameInstance.loadQuestion();await new Promise(r=>requestAnimationFrame(r));
    const panel=document.querySelector('#quiz-panel'),controls=q.type==='input'?[document.querySelector('#quiz-text-input'),document.querySelector('#btn-submit-text')]:[...document.querySelectorAll('.btn-choice')];
    for(const el of controls){el.scrollIntoView({block:'nearest'});const a=el.getBoundingClientRect(),b=panel.getBoundingClientRect();if(a.width<40||a.right>b.right+2||a.left<b.left-2)problems.push({id:q.id,width:a.width})}
    const heading=document.querySelector('#question-text');if(!heading.textContent.trim())problems.push({id:q.id,empty:true});checked.push(q.id);
   }
  }
  return{problems,count:checked.length};
 });expect(result.count).toBe(135); // 30*4 + 15
 expect(result.problems).toEqual([]);await page.screenshot({path:info.outputPath('all-content-last.png')});
});
test('portrait play and mobile keyboard focus leave submit reachable',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await ready(page);await page.getByRole('button',{name:'เล่นแนวตั้งต่อ'}).click();await page.locator('#btn-start').click();await question(page,'input',1);
 await page.locator('#quiz-text-input').fill('๖๐');await page.setViewportSize({width:390,height:500}); // reduced visual viewport while keyboard is open
 await page.locator('#btn-submit-text').scrollIntoViewIfNeeded();await expect(page.locator('#btn-submit-text')).toBeInViewport();await page.screenshot({path:info.outputPath('portrait-keyboard.png')});await page.locator('#btn-submit-text').click();await finishCombat(page);await expect(page.locator('#victory-summary')).toContainText('ตอบถูก 1 ข้อ');
});
test('shortest-path mini game opens, traps focus, closes and retains the answer',async({page})=>{
 await start(page,'/web/?subject=math');await page.evaluate(()=>{const q=QUESTIONS.find(q=>q.scenarioId==='shortest-path');gameInstance.questionPool=[q];gameInstance.currentQIdx=0;gameInstance.loadQuestion()});
 await page.locator('#quiz-text-input').fill('10');await page.locator('#btn-open-scenario').click();await expect(page.locator('#shortest-path-minigame')).toBeVisible();await page.waitForFunction(()=>document.querySelector('#sp-dirbar')?.children.length>0);
 await page.keyboard.press('3');expect(await page.evaluate(()=>gameInstance.answersLog.length)).toBe(0);await page.locator('#sp-close').click();await expect(page.locator('#shortest-path-minigame')).toBeHidden();await expect(page.locator('#quiz-text-input')).toHaveValue('10');
});
