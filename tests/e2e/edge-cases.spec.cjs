const {test,expect}=require('@playwright/test');const path=require('node:path');const {pathToFileURL}=require('node:url');const {ready,start,question}=require('./helpers.cjs');

test('file protocol opens the canonical fallback exam',async({page})=>{
 const url=pathToFileURL(path.resolve('web/index.html')).href+'?subject=exam';await ready(page,url);expect(await page.evaluate(()=>QUESTIONS.length)).toBe(30);await page.locator('#btn-start').click();await expect(page.locator('#quiz-panel')).toBeVisible();expect(await page.evaluate(()=>QUESTIONS.every(q=>!q.scenarioId||!!getScenarioById(q.scenarioId)))).toBe(true);
});
test('question and scenario dirty revisions clear independently',async({page})=>{
 page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');
 await page.getByRole('button',{name:'📜 สถานการณ์',exact:true}).click();await page.locator('#input-scen-body').fill('สถานการณ์แก้ไข');
 expect(await page.evaluate(()=>questionRevision===savedQuestionRevision)).toBe(true);expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
 const d=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดสถานการณ์',exact:true}).click();await d;expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(false);
 await page.locator('#input-scen-id').fill('renamed-scenario');expect(await page.evaluate(()=>loadedQuestions[0].scenarioId)).toBe('renamed-scenario');expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
 const d2=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดสถานการณ์',exact:true}).click();await d2;expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
});
test('admin failed loads keep existing data and cancelled subject switches keep edits',async({page})=>{
 await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.locator('#input-q-text').fill('แก้ไขยังไม่เซฟ');
 page.once('dialog',d=>d.dismiss());await page.selectOption('#subject-select','pisa');await expect(page.locator('#subject-select')).toHaveValue('math');await expect(page.locator('#input-q-text')).toHaveValue('แก้ไขยังไม่เซฟ');
 page.on('dialog',d=>d.accept());await page.route('**/assets/data/pisa.json',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));await page.selectOption('#subject-select','pisa');await expect(page.locator('#subject-select')).toHaveValue('math');await expect(page.locator('#input-q-text')).toHaveValue('แก้ไขยังไม่เซฟ');expect(await page.evaluate(()=>loadedQuestions[0].id)).toBe('math-001');
});
test('changes made while a file picker is pending remain unsaved',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.locator('#input-q-text').fill('แก้ไขก่อนเซฟ');
 await page.evaluate(()=>{window.pickerCalls=0;window.showSaveFilePicker=()=>new Promise((resolve,reject)=>{window.pickerCalls++;window.releasePicker=()=>resolve({createWritable:async()=>({write:async()=>{},close:async()=>{}})});window.cancelPicker=()=>reject(new DOMException('Cancelled','AbortError'))});window.saving=saveToLocalFile()});
 await page.locator('#input-q-text').fill('แก้ไขระหว่างเซฟ');await page.selectOption('#subject-select','pisa');await expect(page.locator('#subject-select')).toHaveValue('math');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.evaluate(()=>window.releasePicker());await page.waitForFunction(()=>window.pickerCalls===2);await page.evaluate(async()=>{window.cancelPicker();await window.saving});
 // Questions are saved from the original snapshot; abort the second (scenario) picker.
 await page.waitForFunction(()=>savedQuestionRevision<questionRevision);expect(await page.evaluate(()=>saveInProgress)).toBe(false);expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
});
test('numeric fields validate and imported unknown metadata survives drag-drop',async({page})=>{
 page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.selectOption('#subject-select','pisa');await expect(page.locator('#input-question-type')).toHaveValue('input');
 await page.locator('#input-target-number').fill('NaN');await page.getByRole('button',{name:'ดาวน์โหลดข้อสอบ',exact:true}).click();await expect(page.locator('#admin-validation-error')).toContainText('ค่าเป้าหมาย');await expect(page.locator('#input-target-number')).toBeFocused();
 await page.evaluate(()=>{const q={...loadedQuestions[0],targetNumber:54,customField:'keep'};const data=new DataTransfer();data.items.add(new File([JSON.stringify([q])],'custom.json',{type:'application/json'}));document.getElementById('drag-overlay').dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true}))});
 await expect(page.locator('#question-count-badge')).toHaveText('1 ข้อ');expect(await page.evaluate(()=>loadedQuestions[0].customField)).toBe('keep');expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
});
test('shortest-path route, undo and restart agree with ten kilometer answer',async({page})=>{
 await start(page,'/web/?subject=math');await page.evaluate(()=>{gameInstance.questionPool=[QUESTIONS.find(q=>q.scenarioId==='shortest-path')];gameInstance.currentQIdx=0;gameInstance.loadQuestion()});await page.locator('#btn-open-scenario').click();await page.waitForFunction(()=>window.ShortestPathMiniGame.running);
 for(const to of ['botL','midR','upR','topR','school']){
  // Use the rendered destination button, not a direct move call.
  const slot=await page.evaluate(to=>ShortestPathMiniGame._slotOpts.findIndex(x=>x.to===to),to);expect(slot).toBeGreaterThanOrEqual(0);await page.locator('#sp-dirbar button').nth(slot).click();await page.waitForFunction(to=>ShortestPathMiniGame.currentId===to&&!ShortestPathMiniGame.animating,to);
 }
 await expect(page.locator('#sp-dist')).toHaveText('10 กม.');await page.locator('#sp-undo').click();await expect(page.locator('#sp-dist')).toHaveText('9 กม.');await page.locator('#sp-reset').click();await expect(page.locator('#sp-dist')).toHaveText('0 กม.');await page.keyboard.press('Escape');await expect(page.locator('#shortest-path-minigame')).toBeHidden();
});
test('input text, placeholder and label have readable contrast and keyboard focus',async({page},info)=>{
 await start(page);await question(page);
 const ratios=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).map(Number);const luminance=channels=>channels.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const input=document.getElementById('quiz-text-input'),style=getComputedStyle(input),bg=rgb(style.backgroundColor);const base=[11,18,32];const blend=bg.slice(0,3).map((x,i)=>x*(bg[3]??1)+base[i]*(1-(bg[3]??1)));
  const ratio=(fg,bg)=>{const a=luminance(rgb(fg)),b=luminance(bg);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  return[ratio(style.color,blend),ratio(getComputedStyle(input,'::placeholder').color,blend),ratio(getComputedStyle(document.querySelector('.input-answer-label')).color,base)];
 });for(const ratio of ratios)expect(ratio).toBeGreaterThanOrEqual(4.5);await page.locator('#quiz-text-input').focus();await page.keyboard.press(info.project.name==='webkit'?'Alt+Tab':'Tab');await page.waitForTimeout(80);await expect(page.locator('#btn-submit-text')).toBeFocused();
});

test('long content, table, formula and unit wrap without cutting off submission',async({page})=>{
 const {localFormulaAssets,richQuestion}=require('./helpers.cjs');await localFormulaAssets(page);await start(page);await question(page);await richQuestion(page);
 await expect(page.locator('#question-text .katex')).toBeVisible();await expect(page.locator('#question-text table')).toBeVisible();await expect(page.locator('#quiz-text-input')).toBeFocused();await expect(page.locator('.game-progress')).toBeInViewport();
 for(const size of [{width:1280,height:720},{width:844,height:390},{width:390,height:500}]){
  await page.setViewportSize(size);await page.evaluate(()=>document.documentElement.classList.add('portrait-play'));
  await page.locator('#btn-submit-text').scrollIntoViewIfNeeded();await expect(page.locator('#btn-submit-text')).toBeInViewport();
  const b=await page.locator('#input-answer-container').boundingBox();const unit=await page.locator('#quiz-input-unit').boundingBox();expect(unit.x+unit.width).toBeLessThanOrEqual(b.x+b.width+1);
 }
 await page.locator('#quiz-text-input').fill('60');await page.locator('#btn-submit-text').click();await expect(page.locator('#answer-feedback')).toContainText('ตอบถูก');
});
test('both admin preview frames receive full grading and scenario metadata',async({page})=>{
 await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.selectOption('#subject-select','pisa');await expect(page.locator('#input-question-type')).toHaveValue('input');
 await page.evaluate(()=>openPreviewLightbox());
 for(const id of ['#game-preview-frame','#game-preview-frame-lg']){
  const frame=page.frameLocator(id);await expect(frame.locator('#quiz-text-input')).toBeVisible();
  const actual=await frame.locator('#quiz-text-input').evaluate(()=>{const q=gameInstance.questionPool[0];return {id:q.id,type:q.type,targets:q.targetNumbers,unit:q.unit,scenario:q.scenarioId}});
  expect(actual).toEqual({id:'pisa-001',type:'input',targets:[54,54.4,54.4],unit:'เซด',scenario:'pisa-math-01'});
 }
});
test('reduced motion, rotating during combat and switching visibility preserve one answer',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await start(page);await question(page);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.documentElement.classList.add('portrait-play');document.dispatchEvent(new Event('visibilitychange'))});await page.setViewportSize({width:844,height:390});
 const {finishCombat}=require('./helpers.cjs');await finishCombat(page);expect(await page.evaluate(()=>gameInstance.answersLog)).toEqual(['54']);await expect(page.locator('#victory-summary')).toContainText('ตอบถูก 1 ข้อ');
});
test('twenty restarts keep one animation loop and cancel pending boss effects',async({page})=>{
 await page.addInitScript(()=>{const original=requestAnimationFrame;window.rafPending=0;window.requestAnimationFrame=callback=>{window.rafPending++;return original.call(window,time=>{window.rafPending--;callback(time)})}});
 await start(page);await page.evaluate(()=>gameInstance.triggerBossWarning());await expect(page.locator('#boss-warning-overlay')).toBeVisible();
 for(let n=0;n<20;n++)await page.evaluate(()=>gameInstance.restartGame());
 await expect(page.locator('#boss-warning-overlay')).toBeHidden();expect(await page.evaluate(()=>gameInstance.bossFlashInterval)).toBeNull();expect(await page.evaluate(()=>gameInstance.bossWarningTimeout)).toBeNull();expect(await page.evaluate(()=>window.rafPending)).toBeLessThanOrEqual(1);
 await question(page);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();await page.keyboard.press('Enter');expect(await page.evaluate(()=>gameInstance.answersLog)).toEqual(['54']);
});
test('hanging image preloads cannot indefinitely block the start button',async({page})=>{
 await page.route('**/assets/images/**',()=>{});await start(page);await question(page);await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();await expect(page.locator('#answer-feedback')).toContainText('ตอบถูก');
});
test('exam subject and progress stay clear across wave and boss boundaries',async({page})=>{
 await start(page);
 for(const index of [0,9,10,19,20,25,29]){
  await page.evaluate(index=>{gameInstance.currentQIdx=index;gameInstance.loadQuestion()},index);
  await expect(page.locator('#hud-subject')).toHaveText('สอบรวม · '+(index<10?'คณิตศาสตร์':index<20?'วิทยาศาสตร์':'ภาษาไทย'));await expect(page.locator('#hud-question')).toHaveText(`ข้อ ${index+1} จาก 30`);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.classList.add('portrait-play'));
 const row=await page.locator('.game-progress').boundingBox();for(const sel of ['#hud-subject','#hud-question']){const b=await page.locator(sel).boundingBox();expect(b.x+b.width).toBeLessThanOrEqual(row.x+row.width)}
});
test('scenario JSON exports, imports and drag-drops without losing metadata or question links',async({page},info)=>{
 const fs=require('node:fs');page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.locator('#tab-scenarios').click();
 await page.evaluate(()=>loadedScenarios[0].custom={retain:'yes'});await page.locator('#input-scen-body').fill('สถานการณ์ที่แก้ไขและต้องนำกลับได้');
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดสถานการณ์',exact:true}).click();const download=await pending;const output=info.outputPath('scenario-export.json');await download.saveAs(output);const saved=JSON.parse(fs.readFileSync(output));
 await page.locator('#input-scen-body').fill('เปลี่ยนหลังส่งออก');await page.locator('#import-file-input').setInputFiles(output);await expect(page.locator('#input-scen-body')).toHaveValue(saved[0].body);
 expect(await page.evaluate(()=>loadedScenarios[0].custom)).toEqual({retain:'yes'});expect(await page.evaluate(()=>loadedQuestions[0].scenarioId)).toBe(saved[0].id);expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
 expect(await page.evaluate(()=>questionRevision===savedQuestionRevision)).toBe(true);
 await page.evaluate(saved=>{const data=new DataTransfer();data.items.add(new File([JSON.stringify([saved[0],saved[0]])],'duplicate.scenarios.json',{type:'application/json'}));document.getElementById('drag-overlay').dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true}))},saved);
 await expect.poll(()=>page.evaluate(()=>loadedScenarios.length)).toBe(saved.length);
 await page.evaluate(saved=>{saved[0].body='ลากไฟล์สถานการณ์กลับเข้ามา';const data=new DataTransfer();data.items.add(new File([JSON.stringify(saved)],'math.scenarios.json',{type:'application/json'}));document.getElementById('drag-overlay').dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true}))},saved);
 await expect(page.locator('#input-scen-body')).toHaveValue('ลากไฟล์สถานการณ์กลับเข้ามา');await page.locator('#tab-questions').click();await expect(page.locator('#input-question-id')).toHaveValue('math-001');expect(await page.evaluate(()=>loadedQuestions[0].scenarioId)).toBe(saved[0].id);
});
test('admin protects edits and file targets during a pending bank load',async({page})=>{
 page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');
 let release;await page.route('**/assets/data/science.json',route=>new Promise(resolve=>{release=async()=>{await route.continue();resolve()}}));await page.selectOption('#subject-select','science');await expect.poll(()=>!!release).toBe(true);
 await page.locator('#input-q-text').fill('การแก้ไขระหว่างโหลดต้องไม่หาย');await page.evaluate(()=>{window.pickerCalls=0;window.showSaveFilePicker=async()=>{window.pickerCalls++;return{createWritable:async()=>({write:async()=>{},close:async()=>{}})}}});
 try{await page.getByRole('button',{name:'💾 บันทึกทับไฟล์'}).click();expect(await page.evaluate(()=>window.pickerCalls)).toBe(0)}finally{await release()}
 await expect(page.locator('#subject-select')).toHaveValue('math');await expect(page.locator('#input-q-text')).toHaveValue('การแก้ไขระหว่างโหลดต้องไม่หาย');expect(await page.evaluate(()=>hasUnsavedChanges)).toBe(true);
});
test('admin can replace a PISA question and set its subject without editing JSON',async({page},info)=>{
 test.setTimeout(15000);const fs=require('node:fs');page.on('dialog',d=>d.accept());await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await page.selectOption('#subject-select','pisa');await expect(page.locator('#input-question-type')).toHaveValue('input');
 await page.evaluate(()=>selectQuestion(5));const deleted=await page.locator('#input-question-id').inputValue();await page.getByRole('button',{name:'ลบข้อสอบนี้'}).click();await page.getByRole('button',{name:'+ เพิ่มคำถามข้อถัดไป'}).click();
 const id=await page.locator('#input-question-id').inputValue();expect(id).not.toBe(deleted);await page.selectOption('#input-question-subject','science');await page.locator('#input-q-text').fill('คำถามวิทยาศาสตร์ทดแทน');await page.selectOption('#input-scenario-id','pisa-sci-01');
 const file=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดข้อสอบ',exact:true}).click();const download=await file;const output=info.outputPath('pisa-replacement.json');await download.saveAs(output);const data=JSON.parse(fs.readFileSync(output));
 expect(data.length).toBe(15);for(const subject of ['math','science','thai'])expect(data.filter(q=>q.subject===subject).length).toBe(5);expect(data.at(-1).id).toBe(id);expect(data[0].targetNumbers).toEqual([54,54.4,54.4]);
 await expect(page.frameLocator('#game-preview-frame').locator('#hud-subject')).toHaveText('สอบรวม · วิทยาศาสตร์');
});
