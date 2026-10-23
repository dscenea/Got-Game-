const {test}=require('node:test'),assert=require('node:assert/strict');require('../assets/tactical-board.js');
const B=GGTacticalBoard,player=(kind='attack')=>({id:'p',kind,color:'#172c49',label:'4',x:40,y:40});
test('youth basketball teams receive minibasket with its polygonal triple while senior and other sports keep their own court',()=>{for(const teamName of ['Alevín A','Benjamín','Prebenjamín','PREBENJAMIN femenino']){const b=B.defaults('Baloncesto',{teamName});assert.equal(b.court,'mini');assert.equal(b.threePoint,true);}assert.equal(B.defaults('Baloncesto',{teamName:'Infantil'}).court,'standard');assert.equal(B.defaults('Fútbol',{teamName:'Alevín A'}).court,undefined);});
test('parquet, grass and volleyball surfaces render in full and half layouts without remote textures',()=>{for(const view of ['full','half'])for(const sport of ['Baloncesto','Fútbol','Voleibol']){const out=B.svg({...B.defaults(sport),view});assert.doesNotMatch(out,/NaN|Infinity|https:/);assert.match(out,sport==='Baloncesto'?/gg-parquet/:sport==='Fútbol'?/gg-grass/:/#d88752/);}const mini=B.defaults('Baloncesto',{teamName:'Alevín'});assert.notEqual(B.svg(mini),B.svg({...mini,threePoint:false}));});
test('basketball uses outlined attackers and open-arm defenders; football symbols retain their original shape',()=>{const basket=B.defaults('Baloncesto'),football=B.defaults('Fútbol');assert.match(B.svg({...basket,objects:[player()]}),/r="17" fill="#fffaf3"/);assert.match(B.svg({...basket,objects:[player('defense')]}),/M-28 3Q-24-18/);assert.match(B.svg({...football,objects:[player('defense')]}),/width="44" height="44"/);assert.match(B.svg({...football,objects:[player()]}),/circle r="23"/);});
test('club crest, size and court appearance survive validation; unsafe images and invalid sizes are rejected',()=>{const input={...B.defaults('Baloncesto',{teamName:'Alevín',logo:'assets/club-logrobasket-crest.svg',color:'#a20f16'}),symbolScale:1.25,logoSize:120},saved=B.validate(input,input.sport);assert.equal(saved.logo,input.logo);assert.equal(saved.court,'mini');assert.match(B.svg(saved),/data-center-logo/);assert.doesNotMatch(B.svg({...saved,showLogo:false}),/data-center-logo/);for(const change of [{logo:'javascript:alert(1)'},{logo:'data:text/html;base64,AAA='},{symbolScale:8},{paint:'red" onload="bad'},{logoSize:1000},{court:'unknown'}])assert.throws(()=>B.validate({...input,...change},input.sport));});
test('mini reference uses metric 26 by 14 geometry and the same end markings in full and half courts',()=>{
 const mini=B.defaults('Baloncesto',{teamName:'Alevín'}),full=B.svg(mini),half=B.svg({...mini,view:'half'});
 assert.match(full,/data-mini-court="26x14" x="0" y="0" width="26" height="14"/);
 assert.match(half,/width="13" height="14"/);assert.match(half,/rotate\(-90\)/);
 for(const out of [full,half]){assert.match(out,/M0 2.2H4.8L6.4 4.55V9.45L4.8 11.8H0/);assert.match(out,/M0 4.55H5.2v4.9H0M1.2 6.1v1.8/);assert.match(out,/circle cx="1.575"/);}
 assert.equal((full.match(/data-mini-triple/g)||[]).length,2);assert.equal((half.match(/data-mini-triple/g)||[]).length,1);
 assert.doesNotMatch(B.svg({...mini,threePoint:false}),/data-mini-triple/,'explicit saved preference can still hide the triple');
});
test('standard triple uses a circle around the rim and identical metric markings in both orientations',()=>{
 const g=B.geometry,join=1.575+Math.sqrt(6.75**2-6.6**2);
 for(const full of [true,false]){const out=g.standardSurface(full,true,'#a20f16').geometry;assert.match(out,/data-standard-triple="6.75"/);assert.ok(out.includes('H'+join+'A6.75 6.75 0 0 1 '+join+' 14.1H0'));assert.match(out,/circle cx="1.575" cy="7.5"/);assert.match(out,/M0 5.05H5.8v4.9H0/);assert.doesNotMatch(g.standardSurface(full,false,'#a20f16').geometry,/data-standard-triple/);}
 assert.ok(Math.abs(Math.hypot(join-1.575,6.6)-6.75)<1e-10);
 assert.ok(Math.abs((1.575+6.75)-(5.8+1.8)-.725)<1e-10,'front arc remains 0.725 m beyond the free-throw circle');
});
test('basketball half-court crest is inside the centre semicircle in mini and standard courts',()=>{
 for(const court of ['mini','standard']){const board={...B.defaults('Baloncesto',{logo:'assets/club-logrobasket-crest.svg'}),court,view:'half'},svg=B.svg(board),tag=svg.match(/<image data-center-logo[^>]+/)[0],y=Number(tag.match(/ y="([^"]+)"/)[1]),height=Number(tag.match(/ height="([^"]+)"/)[1]);assert.ok(y>=45&&y+height<126);assert.ok(height<90);if(court==='standard')assert.match(svg,/M14 5.7a1.8 1.8/);}
 const full=B.svg({...B.defaults('Baloncesto',{logo:'assets/club-logrobasket-crest.svg'}),view:'full'});assert.match(full,/x="455" y="280" width="90" height="90"/);
});
test('route rotation preserves physical lengths, all bends and path style, and rejects out-of-bounds turns',()=>{
 const g=B.geometry,route={id:'r',kind:'dribble',color:'#172c49',label:'',x:30,y:50,x2:70,y2:50,points:[{x:40,y:40},{x:60,y:60}],pathMode:'zigzag'},rotated=g.rotate(route,90),pts=o=>[{x:o.x,y:o.y},...o.points,{x:o.x2,y:o.y2}],distance=(a,b)=>Math.hypot((a.x-b.x)*10,(a.y-b.y)*6.5);
 assert.equal(rotated.pathMode,'zigzag');assert.equal(rotated.points.length,2);assert.ok(Math.abs(rotated.x-50)<1e-10);assert.ok(Math.abs(rotated.x2-50)<1e-10);
 for(let i=1;i<4;i++)assert.ok(Math.abs(distance(pts(route)[i-1],pts(route)[i])-distance(pts(rotated)[i-1],pts(rotated)[i]))<1e-8);
 const back=g.rotate(rotated,-90);for(let i=0;i<4;i++){assert.ok(Math.abs(pts(route)[i].x-pts(back)[i].x)<1e-8);assert.ok(Math.abs(pts(route)[i].y-pts(back)[i].y)<1e-8);}assert.equal(g.rotate({...route,x:0,y:0,x2:100,y2:0,points:[]},90),null);
 let added=g.addRoutePoint({...route,points:[]});assert.ok(g.routePoints(added).length>g.routePoints({...route,points:[]}).length);while(g.addRoutePoint(added))added=g.addRoutePoint(added);assert.ok(added.points.length<=24);
});
