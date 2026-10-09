const {test,expect}=require('@playwright/test');
const path=require('node:path');const fs=require('node:fs');const {ready,start,question,localFormulaAssets,richQuestion}=require('./helpers.cjs');
// Initial captures are reviewed before being copied to tracked baselines. No automatic updates.
async function capture(page,name,selector='#game-container') {
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
 await page.waitForTimeout(170); // settle the question's delayed focus before capturing
 if(['input','graph-input','mobile-input','portrait-input'].includes(name))await page.locator('#quiz-text-input').evaluate(el=>el.blur());
 const target=page.locator(selector);
 const options={animations:'disabled',mask:[],maskColor:'#0b1220',style:'canvas { visibility: hidden !important; }'};
 if(await page.locator('iframe').count())options.mask.push(page.locator('iframe'));
 if(process.env.CAPTURE_VISUAL==='1'){
  fs.mkdirSync('artifacts/visual-candidates',{recursive:true});await target.screenshot({path:path.resolve('artifacts/visual-candidates',name+'.png'),...options});
 }else await expect(target).toHaveScreenshot(name+'.png',{...options,stylePath:path.resolve('tests/e2e/screenshot.css'),maxDiffPixelRatio:.005});
}
test('reviewed visual baselines cover game and admin states',async({page})=>{
 test.setTimeout(120000);await localFormulaAssets(page);await ready(page);await capture(page,'menu');await page.locator('#btn-start').click();
 await page.evaluate(()=>gameInstance.gameLoop=()=>{});
 await question(page,'choice');await capture(page,'choice');
 await question(page,'input');await capture(page,'input');await page.locator('#btn-submit-text').click();await capture(page,'empty-input');
 await question(page,'input');await page.locator('#item-telescope').click();await capture(page,'input-hint');
 await page.locator('#quiz-text-input').fill('54');await page.locator('#btn-submit-text').click();await capture(page,'correct-input');
 await question(page,'input');await page.locator('#quiz-text-input').fill('54/2');await page.locator('#btn-submit-text').click();await capture(page,'wrong-input');
 await question(page,'input');await page.locator('#btn-open-scenario').click();await capture(page,'scenario');await page.keyboard.press('Escape');
 await question(page,'input',1);await capture(page,'graph-input');await page.locator('#question-img').click();await capture(page,'zoom','#image-zoom-modal');await page.keyboard.press('Escape');
 await page.evaluate(()=>{gameInstance.topHud.classList.add('hidden');gameInstance.quizPanel.classList.add('hidden');gameInstance.reviveOverlay.classList.remove('hidden')});await capture(page,'revive');
 await page.evaluate(()=>{gameInstance.reviveOverlay.classList.add('hidden');gameInstance.state=STATE_GAME_OVER;gameInstance.updateResultSummary('gameover');gameInstance.gameoverOverlay.classList.remove('hidden')});await capture(page,'gameover');
 await page.evaluate(()=>{gameInstance.gameoverOverlay.classList.add('hidden');gameInstance.state=STATE_VICTORY;gameInstance.updateResultSummary('victory');gameInstance.victoryOverlay.classList.remove('hidden')});await capture(page,'victory');
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{gameInstance.victoryOverlay.classList.add('hidden');gameInstance.topHud.classList.remove('hidden');gameInstance.quizPanel.classList.remove('hidden')});await question(page,'input',1);await page.locator('#btn-submit-text').scrollIntoViewIfNeeded();await capture(page,'mobile-input');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.classList.add('portrait-play'));await capture(page,'portrait-input');
 await page.setViewportSize({width:1280,height:720});await page.goto('/web/?subject=math');await expect(page.locator('#btn-start')).toBeEnabled();await page.locator('#btn-start').click();await page.evaluate(()=>{const q=QUESTIONS.find(q=>q.scenarioId==='shortest-path');gameInstance.questionPool=[q];gameInstance.currentQIdx=0;gameInstance.loadQuestion()});await page.locator('#btn-open-scenario').click();await page.waitForFunction(()=>document.querySelector('#sp-dirbar')?.children.length>0);await capture(page,'minigame');await page.keyboard.press('Escape');
 const chart=require('../../assets/data/math.json').find(q=>q.id==='math-023');
 await page.evaluate(q=>{gameInstance.questionPool=[q];gameInstance.currentQIdx=0;gameInstance.loadQuestion()},chart);await capture(page,'chart-choice');
 await richQuestion(page);await capture(page,'long-table-formula');await page.locator('#btn-submit-text').scrollIntoViewIfNeeded();await capture(page,'long-answer-controls');

 await page.goto('/web/admin.html');await expect(page.locator('#input-question-id')).toHaveValue('math-001');await capture(page,'admin-choice','body');await page.selectOption('#subject-select','pisa');await expect(page.locator('#input-question-type')).toHaveValue('input');await expect(page.frameLocator('#game-preview-frame').locator('#quiz-text-input')).toBeVisible();
 // Only the editor is compared: live iframe sprites are intentionally verified separately.
 await capture(page,'admin-input','#form-editor');
});
