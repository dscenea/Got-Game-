const {test}=require('node:test'),assert=require('node:assert/strict');
require('../assets/tactical-board.js');require('../assets/training-store.js');
const {geometry:g,validate,svg}=GGTacticalBoard;
const route=extra=>({id:'r',kind:'move',color:'#2055a4',label:'',x:10,y:40,x2:30,y2:40,...extra});
const board=o=>({sport:'Baloncesto',view:'full',objects:[o]});
test('longer paths expose more controls, retain endpoints and never exceed 24 interior points',()=>{
 const short=g.routePoints(route()),long=g.routePoints(route({x2:90}));assert.equal(short.length,3);assert.ok(long.length>short.length);assert.deepEqual(long[0],{x:10,y:40});assert.deepEqual(long.at(-1),{x:90,y:40});
 const crowded=route({points:Array.from({length:24},(_,i)=>({x:i%2?99:1,y:i*4}))});assert.equal(g.routePoints(crowded).length,26);
});
test('end handles change length, interior handles curve and path modes produce distinct geometry',()=>{
 const original=route(),extended=g.reshape(original,'end',60,10);assert.equal(extended.x2,90);assert.equal(extended.y2,50);assert.equal(original.x2,30);
 const bent=g.reshape(original,'0',0,-20);assert.deepEqual(bent.points,[{x:20,y:20}]);assert.match(g.routeArt(bent).d,/C/);assert.match(g.routeArt({...bent,pathMode:'zigzag'}).d,/L/);assert.doesNotMatch(g.routeArt({...bent,pathMode:'zigzag'}).d,/C/);
 for(const kind of ['move','pass','shot','dribble'])for(const pathMode of ['curve','zigzag']){const art=g.routeArt({...bent,kind,pathMode});assert.doesNotMatch(JSON.stringify(art),/NaN|Infinity/);assert.match(art.arrow,/Z$/);}
 assert.doesNotMatch(JSON.stringify(g.routeArt(route({x2:10,y2:40}))),/NaN|Infinity/);
});
test('moving and duplicating a bent path translate all points together and stop at the boundary',()=>{
 const o=route({x:5,x2:80,points:[{x:2,y:20},{x:60,y:80}]}),moved=g.translate(o,-10,5);assert.equal(moved.x,3);assert.equal(moved.x2,78);assert.deepEqual(moved.points,[{x:0,y:25},{x:58,y:85}]);assert.deepEqual(o.points,[{x:2,y:20},{x:60,y:80}]);assert.equal(moved.x2-moved.x,o.x2-o.x);
});
test('legacy boards remain valid; control data is sanitized, deep copied and omitted from clean exports',()=>{
 const legacy=validate(board(route()),'Baloncesto');assert.equal(legacy.objects[0].points,undefined);const input=route({points:[{x:20,y:25,extra:'discard'}],pathMode:'zigzag'}),normalized=validate(board(input),'Baloncesto');assert.deepEqual(normalized.objects[0].points,[{x:20,y:25}]);input.points[0].x=99;assert.equal(normalized.objects[0].points[0].x,20);assert.match(svg(normalized,0),/data-handle="start"/);assert.doesNotMatch(svg(normalized),/data-handle/);
 for(const change of [{points:[{x:NaN,y:20}]},{points:[{x:20,y:101}]},{points:Array(25).fill({x:20,y:20})},{points:'invalid'},{pathMode:'script'},{kind:'attack',points:[]},{kind:'zone',pathMode:'curve'}])assert.throws(()=>validate(board(route(change)),'Baloncesto'));
});
test('exercise saves and session snapshots retain editable bends without sharing point references',()=>{
 let state='';const storage={getItem:()=>state||null,setItem:(key,value)=>state=value},access={identity:()=>({id:'coach',name:'Coach',role:'coach',club:'Club',sports:['Baloncesto']}),occurrence:()=>({type:'training',sport:'Baloncesto'})};
 const repo=GGTraining.createRepository(storage,access),e=repo.saveExercise({title:'Recorrido',sport:'Baloncesto',duration:10,phases:['main'],tags:[],board:board(route({points:[{x:20,y:15}],pathMode:'zigzag'}))}),snapshot=repo.snapshot(e.id,'main');snapshot.board.objects[0].points[0].x=75;const plan=repo.plan('t','s','2026-10-23');plan.blocks.main.push(snapshot);repo.savePlan('t','s','2026-10-23',plan);const reloaded=GGTraining.createRepository(storage,access);assert.equal(reloaded.getExercise(e.id).board.objects[0].points[0].x,20);assert.equal(reloaded.plan('t','s','2026-10-23').blocks.main[0].board.objects[0].points[0].x,75);assert.equal(reloaded.plan('t','s','2026-10-23').blocks.main[0].board.objects[0].pathMode,'zigzag');
});
