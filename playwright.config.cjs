const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'tests/e2e',snapshotPathTemplate:'{testDir}/visual-baselines/{projectName}/{arg}{ext}',timeout:45000,expect:{timeout:10000},fullyParallel:false,workers:2,
 use:{baseURL:'http://127.0.0.1:8766',viewport:{width:1280,height:720},trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',testIgnore:'**/visual.spec.cjs',use:{browserName:'firefox'}},{name:'webkit',testIgnore:'**/visual.spec.cjs',use:{browserName:'webkit'}}],
 webServer:{command:'python3 -m http.server 8766 --bind 127.0.0.1',url:'http://127.0.0.1:8766/web/',reuseExistingServer:false,stdout:'ignore',stderr:'ignore'},
 reporter:[['list'],['html',{open:'never'}]],
});
