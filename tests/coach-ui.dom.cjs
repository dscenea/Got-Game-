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
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:10,top:20,width:1000,height:650});q('[data-trash]').getBoundingClientRect=()=>({left:900,right:1010,top:500,bottom:620});
 function tool(value){q('[data-tool]').value=value;q('[data-tool]').onchange({target:q('[data-tool]')});}
 function tap(x,y){const target=canvas.querySelector('svg>rect'),e={target,clientX:10+x*10,clientY:20+y*6.5,pointerId:1};canvas.onpointerdown(e);canvas.onpointerup(e);assert.equal(target.parentNode,canvas.querySelector('svg'),'SVG target must survive until click');canvas.onclick(e);}
 tool('attack');tap(25,30);tap(75,60);assert.equal(canvas.querySelectorAll('[data-object]').length,2);
 tool('pass');tap(20,40);assert.equal(canvas.querySelectorAll('[data-object]').length,2);tap(80,70);assert.equal(canvas.querySelectorAll('[data-object]').length,3);
 q('[data-undo]').onclick();assert.equal(canvas.querySelectorAll('[data-object]').length,2);q('[data-redo]').onclick();
 tool('select');canvas.onpointerdown({target:canvas.querySelector('[data-object="0"] circle'),clientX:260,clientY:215,pointerId:1});canvas.onpointermove({clientX:360,clientY:280});canvas.onpointerup();
 q('[data-use]').onclick();assert.equal(saved.objects[0].x,35);assert.equal(saved.objects[0].y,40);assert.equal(saved.objects[1].label,'2');assert.equal(saved.objects[2].x,20);assert.equal(saved.objects[2].x2,80);
});
test('existing objects drag in drawing mode without cloning; trash deletes once, undo restores, cancel keeps the original and coaches show E',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
 window.GGTacticalBoard.edit({sport:'Fútbol',view:'half',objects:[{id:'coach',kind:'coach',x:20,y:20,color:'#2055a4',label:'7'}]},b=>saved=b);
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas'),trash=q('[data-trash]');canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:650});trash.getBoundingClientRect=()=>({left:850,right:990,top:500,bottom:640});
 assert.equal(canvas.querySelector('[data-object] text').textContent,'E');assert.equal(trash.hidden,true);
 q('[data-tool]').value='coach';q('[data-tool]').onchange({target:q('[data-tool]')});
 function down(){canvas.onpointerdown({target:canvas.querySelector('[data-object] circle'),clientX:200,clientY:130,pointerId:2,button:0});}
 function move(x,y){canvas.onpointermove({clientX:x,clientY:y,pointerId:2});}
 function up(x,y){canvas.onpointerup({clientX:x,clientY:y,pointerId:2});canvas.onclick({target:canvas,clientX:x,clientY:y});}
 down();move(400,260);assert.equal(trash.hidden,false);up(400,260);assert.equal(canvas.querySelectorAll('[data-object]').length,1);assert.equal(trash.hidden,true);
 q('[data-undo]').onclick();down();move(920,560);assert.equal(trash.classList.contains('is-over'),true);up(920,560);assert.equal(canvas.querySelectorAll('[data-object]').length,0);
 q('[data-undo]').onclick();assert.equal(canvas.querySelectorAll('[data-object]').length,1);q('[data-use]').onclick();assert.equal(saved.objects[0].x,20);assert.equal(saved.objects[0].y,20);
 down();move(920,560);canvas.onpointercancel();assert.equal(trash.hidden,true);assert.equal(canvas.querySelectorAll('[data-object]').length,1);q('[data-use]').onclick();assert.equal(saved.objects[0].x,20);
 const target=canvas.querySelector('svg>rect'),e={target,clientX:600,clientY:300,pointerId:3,button:0};canvas.onpointerdown(e);canvas.onpointerup(e);canvas.onclick(e);q('[data-use]').onclick();assert.equal(saved.objects.length,2);assert.equal(saved.objects[1].label,'E');assert.equal(canvas.querySelector('[data-object="1"] text').textContent,'E');
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
test('route handles resize, bend and survive undo without invoking trash or duplicating',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
 window.GGTacticalBoard.edit({sport:'Baloncesto',view:'full',objects:[{id:'p',kind:'pass',color:'#2055a4',label:'',x:10,y:40,x2:30,y2:40}]},b=>saved=b);
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:650});
 q('[data-element]').value='0';q('[data-element]').onchange({target:q('[data-element]')});
 function drag(handle,from,to){canvas.onpointerdown({target:canvas.querySelector('[data-handle="'+handle+'"] circle'),clientX:from[0],clientY:from[1],pointerId:1});canvas.onpointermove({clientX:to[0],clientY:to[1],pointerId:1});assert.equal(q('[data-trash]').hidden,true);canvas.onpointerup({pointerId:1});canvas.onclick({target:canvas});}
 drag('end',[300,260],[900,260]);assert.ok(canvas.querySelectorAll('[data-handle]').length>3);drag('0',[260,260],[260,100]);q('[data-path-mode]').value='zigzag';q('[data-path-mode]').onchange({target:q('[data-path-mode]')});q('[data-use]').onclick();assert.equal(saved.objects.length,1);assert.equal(saved.objects[0].x2,90);assert.ok(saved.objects[0].points[0].y<40);assert.equal(saved.objects[0].pathMode,'zigzag');q('[data-undo]').onclick();q('[data-use]').onclick();assert.equal(saved.objects[0].pathMode,undefined);
});
test('pencil and stroke eraser preserve icons, support cancel and undo, and serialize the actual stroke',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
 window.GGTacticalBoard.edit({sport:'Baloncesto',view:'full',objects:[{id:'a',kind:'attack',color:'#2055a4',label:'1',x:20,y:20}]},b=>saved=b);
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:650});
 function tool(value){q('[data-tool]').value=value;q('[data-tool]').onchange({target:q('[data-tool]')});}function event(x,y){return {target:canvas,clientX:x,clientY:y,pointerId:3,button:0};}
 tool('ink');canvas.onpointerdown(event(100,100));canvas.onpointermove(event(300,300));canvas.onpointerup(event(400,200));canvas.onclick(event(400,200));q('[data-use]').onclick();assert.equal(saved.objects.length,2);assert.equal(saved.objects[1].kind,'ink');assert.ok(saved.objects[1].inkPoints.length>=3);
 tool('erase');canvas.onpointerdown(event(200,200));canvas.onpointerup(event(200,200));assert.equal(canvas.querySelectorAll('[data-object]').length,1);q('[data-undo]').onclick();assert.equal(canvas.querySelectorAll('[data-object]').length,2);
 canvas.onpointerdown(event(200,200));canvas.onpointercancel();q('[data-use]').onclick();assert.equal(saved.objects.length,2);assert.equal(saved.objects[0].kind,'attack');
});
test('defenders rotate about their centre with touch handles and buttons, without cloning; undo, cancel and persistence retain orientation',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
 window.GGTacticalBoard.edit({sport:'Baloncesto',view:'full',court:'mini',objects:[{id:'d',kind:'defense',x:50,y:50,color:'#9b2634',label:'2'}]},b=>saved=b);
 const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:650});
 function select(){q('[data-element]').value='0';q('[data-element]').onchange({target:q('[data-element]')});}
 function start(){canvas.onpointerdown({target:q('[data-rotation-handle] circle'),clientX:500,clientY:265,pointerId:1,button:0});}
 function move(){canvas.onpointermove({clientX:560,clientY:325,pointerId:1});assert.equal(q('[data-trash]').hidden,true);}
 select();start();move();canvas.onpointerup({clientX:560,clientY:325,pointerId:1});canvas.onclick({target:canvas});q('[data-use]').onclick();
 assert.equal(saved.objects.length,1);assert.equal(saved.objects[0].angle,90);assert.equal(saved.objects[0].x,50);assert.equal(saved.objects[0].y,50);assert.match(q('[data-object] text').getAttribute('transform'),/rotate\(-90\)/);
 q('[data-undo]').onclick();select();start();move();canvas.onpointercancel();q('[data-use]').onclick();assert.equal(saved.objects[0].angle,0);
 q('[data-rotate-back]').onclick();q('[data-use]').onclick();assert.equal(saved.objects[0].angle,345);q('[data-rotate]').onclick();q('[data-use]').onclick();assert.equal(saved.objects[0].angle,0);
 q('[data-court]').value='mini';q('[data-court]').onchange({target:q('[data-court]')});q('[data-use]').onclick();assert.equal(saved.threePoint,true);
 const roundTrip=window.GGTacticalBoard.validate(JSON.parse(JSON.stringify({...saved,objects:[{...saved.objects[0],angle:127}]})),'Baloncesto');assert.equal(roundTrip.objects[0].angle,127);assert.match(window.GGTacticalBoard.svg(roundTrip),/rotate\(127\)/);
});
test('movement, passing, dribbling and shooting rotate as editable routes with extra points, undo and cancellation',()=>{
 for(const kind of ['move','pass','dribble','shot']){
  const {window,document}=dom(),context=vm.createContext({window,document,confirm:()=>true});load(context,'tactical-board.js');let saved;
  window.GGTacticalBoard.edit({sport:'Baloncesto',view:'half',objects:[{id:'r',kind,x:30,y:50,x2:70,y2:50,color:'#172c49',label:''}]},b=>saved=b);
  const q=s=>document.querySelector(s),canvas=q('.gt-board-canvas');canvas.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:650});const select=()=>{q('[data-element]').value='0';q('[data-element]').onchange({target:q('[data-element]')});};select();
  const before=canvas.querySelectorAll('[data-handle]').length;q('[data-add-point]').onclick();assert.ok(canvas.querySelectorAll('[data-handle]').length>before);assert.equal(q('[data-rotate]').disabled,false);
  canvas.onpointerdown({target:q('[data-rotation-handle] circle'),clientX:500,clientY:265,pointerId:1});canvas.onpointermove({clientX:560,clientY:325,pointerId:1});assert.equal(q('[data-trash]').hidden,true);canvas.onpointerup({pointerId:1});canvas.onclick({target:canvas});q('[data-use]').onclick();
  assert.equal(saved.objects.length,1);assert.ok(Math.abs(saved.objects[0].x-50)<1e-8);assert.ok(Math.abs(saved.objects[0].x2-50)<1e-8);assert.ok(saved.objects[0].points.length>=2);
  q('[data-undo]').onclick();select();q('[data-use]').onclick();assert.equal(saved.objects[0].x,30);assert.equal(saved.objects[0].y,50);
  canvas.onpointerdown({target:q('[data-rotation-handle] circle'),clientX:500,clientY:265,pointerId:2});canvas.onpointermove({clientX:560,clientY:325,pointerId:2});canvas.onpointercancel();q('[data-use]').onclick();assert.equal(saved.objects[0].x,30);
  q('[data-rotate]').onclick();q('[data-use]').onclick();assert.notEqual(saved.objects[0].x,30);assert.equal(saved.objects.length,1);q('[data-undo]').onclick();select();q('[data-rotate-back]').onclick();q('[data-use]').onclick();assert.ok(saved.objects[0].y>50);
  const validated=window.GGTacticalBoard.validate(JSON.parse(JSON.stringify(saved)),'Baloncesto');assert.ok(validated.objects[0].points.length>=2);assert.doesNotMatch(window.GGTacticalBoard.svg(validated),/NaN|Infinity/);
 }
});
test('trainer cards show the club crest beside every team and minibasket stays under basketball',()=>{
 const {window,document}=dom(),context=vm.createContext({window,document,data:{club:'Logrobasket'},wzEsc:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),go:()=>{},roleKey:()=>''});window.ggCoachData={roster:()=>Array(8).fill({})};load(context,'club-selectors.js');let source=fs.readFileSync(require.resolve('../assets/coach-view.js'),'utf8').replace(' const welcome=document.getElementById',' window.testCards=teamsCards;\n const welcome=document.getElementById');vm.runInContext(source,context);
 document.querySelector('main').innerHTML=window.testCards([{id:'a',name:'Alevín A',sport:'Baloncesto'},{id:'b',name:'Cadete A',sport:'Baloncesto'}]);const cards=[...document.querySelectorAll('.gc-team')];assert.equal(cards.length,2);assert.equal(cards[0].querySelector('.gc-tag').textContent,'Baloncesto · Minibasket');assert.equal(cards[1].querySelector('.gc-tag').textContent,'Baloncesto');for(const c of cards){const img=c.querySelector('.gc-team-heading img');assert.equal(img.getAttribute('src'),'assets/club-logrobasket-crest.svg');assert.match(img.getAttribute('alt'),/Logrobasket/);assert.ok(c.querySelector('h3'));}
 context.data={club:'Club propio',logoDataUrl:'https://example.com/crest.png'};assert.match(window.testCards([{id:'x',name:'Escuela',sport:'Baloncesto',basketFormat:'mini'}]),/https:\/\/example.com\/crest.png/);context.data.logoDataUrl='javascript:alert(1)';assert.doesNotMatch(window.testCards([{id:'x',name:'Escuela',sport:'Baloncesto'}]),/javascript:|<img/);
});
