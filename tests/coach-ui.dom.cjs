/* DOM integration: GG_DOM_MODULE=/path/to/linkedom node --test tests/coach-ui.dom.cjs */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require(process.env.GG_DOM_MODULE||'linkedom');
function dom(){const {window}=parseHTML('<html><body><main></main><section id="welcome"></section></body></html>');
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(v){this.querySelectorAll('option').forEach(o=>o.toggleAttribute('selected',o.value===String(v)));}});
 window.HTMLElement.prototype.showModal=function(){this.open=true;};window.HTMLElement.prototype.close=function(){this.open=false;};
 return {window,document:window.document};}
const load=(context,path)=>vm.runInContext(fs.readFileSync(require.resolve('../assets/'+path),'utf8'),context);
test('court clicks keep their target through pointerup; symbols, two-point lines, drag and undo retain coordinates',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
 window.GGTacticalBoard.edit({sport:'Baloncesto',view:'full',objects:[]},b=>saved=b);
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:10,top:20,width:1000,height:650});
 function tool(value){q('[data-tool]').value=value;q('[data-tool]').onchange({target:q('[data-tool]')});}
 function tap(x,y){const target=canvas.querySelector('svg>rect'),e={target,clientX:10+x*10,clientY:20+y*6.5,pointerId:1};canvas.onpointerdown(e);canvas.onpointerup(e);assert.equal(target.parentNode,canvas.querySelector('svg'),'SVG target must survive until click');canvas.onclick(e);}
 tool('attack');tap(25,30);tap(75,60);assert.equal(canvas.querySelectorAll('[data-object]').length,2);
 tool('pass');tap(20,40);assert.equal(canvas.querySelectorAll('[data-object]').length,2);tap(80,70);assert.equal(canvas.querySelectorAll('[data-object]').length,3);
 q('[data-undo]').onclick();assert.equal(canvas.querySelectorAll('[data-object]').length,2);q('[data-redo]').onclick();
 tool('select');canvas.onpointerdown({target:canvas.querySelector('[data-object="0"] circle'),clientX:260,clientY:215,pointerId:1});canvas.onpointermove({clientX:360,clientY:280});canvas.onpointerup();
 q('[data-use]').onclick();assert.equal(saved.objects[0].x,35);assert.equal(saved.objects[0].y,40);assert.equal(saved.objects[1].label,'2');assert.equal(saved.objects[2].x,20);assert.equal(saved.objects[2].x2,80);
});
test('attendance buttons are exclusive, resettable, bulk selectable and save the same player/status payload',()=>{
 const {window,document}=dom(),event={id:'s1',date:'2026-10-23',type:'training',teamName:'Alevín',hour:18,duration:1},players=[{id:'a',name:'Jugador A',number:4,attendance:{}},{id:'b',name:'Jugador B',number:5,attendance:{}}];let payload;
 window.ggCoachData={occurrence:()=>event,roster:()=>players,save:(team,id,date,rows)=>payload={team,id,date,rows}};
 const context=vm.createContext({window,document,data:{},wzEsc:v=>String(v??''),go:()=>{},roleKey:()=>'',GGCoachAccess:{key:()=> 'session-key',status:p=>p.attendance['session-key']||'pending'}});
 // Expose only in this VM; production navigation and globals remain unchanged.
 let source=fs.readFileSync(require.resolve('../assets/coach-view.js'),'utf8');source=source.replace(' const welcome=document.getElementById'," window.testAttendance=()=>{teamId='t1';currentEvent="+JSON.stringify(event)+";host.innerHTML=attendanceView();bind();};\n const welcome=document.getElementById");vm.runInContext(source,context);
 window.testAttendance();const q=s=>document.querySelector(s),row=q('.gc-att-row'),form=q('[data-attendance]');assert.equal(q('.gc-attendance select'),null);assert.equal(q('[data-count]').textContent,'2 de 2 asisten');
 row.querySelector('[data-att-value="no"]').onclick();assert.equal(row.querySelectorAll('[aria-pressed="true"]').length,1);assert.equal(row.querySelector('[data-player]').value,'no');
 row.querySelector('[data-att-value="justified"]').onclick();form.onsubmit({preventDefault(){}});assert.deepEqual(JSON.parse(JSON.stringify(payload)),{team:'t1',id:'s1',date:'2026-10-23',rows:[{id:'a',status:'justified'},{id:'b',status:'yes'}]});
 row.querySelector('[data-att-reset]').onclick();assert.equal(row.querySelectorAll('[aria-pressed="true"]').length,0);assert.equal(row.querySelector('[data-player]').value,'pending');q('[data-all]').onclick();assert.equal(q('[data-count]').textContent,'2 de 2 asisten');
 event.type='match';window.testAttendance();assert.equal(q('[data-count]').textContent,'0 de 2 asisten');assert.equal(document.querySelectorAll('[aria-pressed="true"]').length,0);
 players[0].attendance['session-key']='pending';event.type='training';window.testAttendance();assert.equal(q('[data-player]').value,'pending','explicit pending attendance must survive reopening');
});
