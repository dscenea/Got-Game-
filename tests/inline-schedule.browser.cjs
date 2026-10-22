/* Component integration in Chromium: node tests/inline-schedule.browser.cjs */
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
const html=fs.readFileSync('index.html','utf8'),render=html.slice(html.indexOf('function renderInlineSchedule(){'),html.indexOf('window.ggTeamWeek=function()'));
for(const width of [375,1440])for(const sports of [['Baloncesto'],['Baloncesto','Fútbol']]){
const page=await browser.newPage({viewport:{width,height:1000}});
await page.setContent('<html><head>'+[...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join('')+'</head><body><div id="dashboard"><div id="ggWorkspace"><table class="gg-roster"></table></div></div><dialog id="ggPlayerDialog"></dialog></body></html>');
for(const file of ['team-store','schedule-store','club-selectors','schedule-editor'])await page.addScriptTag({path:'assets/'+file+'.js'});
await page.evaluate(({render,sports})=>{
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
window.workspace=document.querySelector('#ggWorkspace');window.dialog=document.querySelector('dialog');window.weekOffset=0;
const teamRepo=GGTeamStore.createRepository(storage()),repo=GGScheduleStore.createRepository(storage());window.teams=()=>teamRepo.list('fixture',sports,{demo:true});window.selectedTeam=teams()[0].id;
window.esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.scheduleDate=d=>d.toISOString().slice(0,10);window.monday=()=>new Date(Date.UTC(2026,9,19+weekOffset*7));window.time=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round(h*60)%60).padStart(2,'0');
window.canManageSchedule=()=>true;window.schedulePlace=e=>e.place+' · '+e.spaceName;
window.events=()=>GGScheduleStore.expand(repo.records('fixture'),scheduleDate(monday()));
for(const [i,t] of teams().entries())repo.save('fixture',{id:'e'+i,team:t.id,type:'training',place:'Lobete',spaceId:'p1',spaceName:'Pista 1',date:'2026-10-19',hour:18+i,duration:1,recurring:true,until:'2027-06-30'});
window.renderRoster=()=>{workspace.innerHTML='<table class="gg-roster"></table>';renderInlineSchedule()};
(0,eval)(render);
GGScheduleEditor.install({workspace,dialog,scheduleRecords:()=>repo.records('fixture'),scheduleRepository:repo,clubKey:()=>'fixture',teams,scopedTeams:()=>teams().filter(t=>t.sport==='Baloncesto'),getSelectedTeam:()=>selectedTeam,getClubData:()=>({facilities:[{name:'Lobete',sports,spaces:[{id:'p1',name:'Pista 1',sports}]}]}),scheduleDate,time,teamLabel:id=>teams().find(t=>t.id===id)?.name,getFilterPlace:()=>'',renderRoster,renderWeek:()=>{},schedulePlace,canManageSchedule,esc});
renderRoster();
},{render,sports});
assert.equal(await page.locator('.gg-inline-day').count(),7);assert.equal(await page.locator('[data-event]').count(),1);
assert.match(await page.locator('[data-event]').textContent(),/18:00 – 19:00/);
await page.locator('[data-event]').click();await page.locator('#v59Time').fill('17:30');await page.locator('#v59Duration').fill('90');await page.locator('#ggScheduleForm button[type=submit]').click();
assert.match(await page.locator('[data-event]').textContent(),/17:30 – 19:00/);
await page.locator('[data-week="1"]').click();assert.match(await page.locator('[data-event]').textContent(),/17:30 – 19:00/);
await page.locator('[data-date]').last().click();assert.equal(await page.locator('#v59Date').inputValue(),'2026-11-01');await page.locator('#ggCancelSchedule').click();
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.evaluate(()=>{window.canManageSchedule=()=>false;renderRoster()});assert.equal(await page.locator('[data-event], [data-date], [data-schedule-add]').count(),0);
console.log('PASS',width,sports.join('/'));await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
