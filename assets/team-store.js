/* Club-scoped team catalogue. Roster and calendar identifiers remain stable on edits. */
(function(root){
'use strict';
const colors=['#b42338','#1d5cab','#14806a','#8050a0','#ad5b0b','#4b647b','#a43478','#5c6b1d'];
const validColor=value=>/^#[0-9a-f]{6}$/i.test(value||'');
function colorFor(team){if(validColor(team?.color))return team.color;let hash=0;for(const c of String(team?.id||team?.name||''))hash=(hash*31+c.charCodeAt(0))>>>0;return colors[hash%colors.length];}
function createRepository(storage){
 const key='gg-team-catalog-v1';let state={};
 try{const saved=JSON.parse(storage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))state=saved}catch{}
 const clean=v=>String(v||'').trim().replace(/\s+/g,' ');
 const fold=v=>clean(v).toLocaleLowerCase('es');
 function commit(club,teams){const next={...state,[club]:teams};storage.setItem(key,JSON.stringify(next));state=next;return teams}
 function ensure(club,sports,options={}){
  if(!Array.isArray(state[club])){
   const seed=options.demo?sports.flatMap(sport=>(club==='Club Deportivo Ebro Norte'&&sport==='Voleibol'?[]:['Alevín A','Infantil']).map(name=>({id:sport+' · '+name,name,sport,coach:'',demo:true}))):[];
   for(const id of options.legacyIds||[]){const sport=sports.find(s=>id.startsWith(s+' · '));if(sport&&!seed.some(t=>t.id===id))seed.push({id,sport,name:id.slice(sport.length+3),coach:'',demo:true})}
   commit(club,seed);
  }
  // Extend named test clubs once; keep edited names, IDs, assignments and rosters.
  if(options.demo){
   const extra=club==='Logrobasket'?[['Baloncesto','Cadete A','Marta Fernández Díaz'],['Baloncesto','Junior','Elena García Pérez']]:club==='Club Deportivo Ebro Norte'?[['Voleibol','Cadete','Sofía Romero Díaz']]:[];
   const rows=[...state[club]];
   for(const [sport,name,coach] of extra){const id=sport+' · '+name;if(sports.includes(sport)&&!rows.some(t=>t.id===id||t.sport===sport&&fold(t.name)===fold(name)))rows.push({id,name,sport,coach,demo:true});}
   if(rows.length!==state[club].length)commit(club,rows);
  }
  if(options.demo&&club==='Logrobasket'&&sports.includes('Baloncesto')&&!state[club].some(t=>t.id==='frb-team-622-2056'))commit(club,[...state[club],{id:'frb-team-622-2056',name:'LOGROBASKET',sport:'Baloncesto',basketFormat:'standard',coach:'Marta Fernández Díaz',demo:false}]);
  const detached=state[club].map(t=>{if(!t.externalCalendar)return t;const {externalCalendar,...rest}=t;return rest;});if(detached.some((t,i)=>t!==state[club][i]))commit(club,detached);
  const used=new Set(state[club].filter(t=>validColor(t.color)).map(t=>t.color.toLowerCase()));
  const colored=state[club].map((t,i)=>{if(validColor(t.color))return t;const color=colors.find(c=>!used.has(c))||colors[i%colors.length];used.add(color);return {...t,color};});
  if(colored.some((t,i)=>t!==state[club][i]))commit(club,colored);
  return state[club].filter(t=>sports.includes(t.sport)).map(t=>({...t}));
 }
 function validate(club,sports,input,id){
  const name=clean(input.name),coach=clean(input.coach),sport=clean(input.sport);
  if(!name||name.length>60)throw Error('Escribe un nombre de equipo de entre 1 y 60 caracteres.');
  if(!sports.includes(sport))throw Error('Selecciona un deporte configurado en este club.');
  if(coach.length>80)throw Error('El nombre del entrenador no puede superar los 80 caracteres.');
  if((state[club]||[]).some(t=>t.id!==id&&t.sport===sport&&fold(t.name)===fold(name)))throw Error('Ya existe un equipo con ese nombre en este deporte.');
  if(input.basketFormat!==undefined&&!['auto','mini','standard'].includes(input.basketFormat))throw Error('Selecciona una modalidad de baloncesto válida.');
  if(input.color!==undefined&&!validColor(input.color))throw Error('Selecciona un color de equipo válido.');
  return {name,coach,sport,...(input.color!==undefined?{color:input.color.toLowerCase()}:{}),...(sport==='Baloncesto'&&input.basketFormat!==undefined?{basketFormat:input.basketFormat}:{})};
 }
 return {
  list:ensure,
  create(club,sports,input){const values=validate(club,sports,input);const team={...values,color:values.color||colors.find(c=>!(state[club]||[]).some(t=>t.color===c))||colors[(state[club]||[]).length%colors.length],id:'gg-team-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)),demo:false};commit(club,[...(state[club]||[]),team]);return {...team}},
  update(club,sports,id,input){const rows=state[club]||[],old=rows.find(t=>t.id===id);if(!old)throw Error('El equipo ya no está disponible.');if(input.sport!==old.sport)throw Error('El deporte de un equipo creado se conserva para mantener su plantilla e historial.');const values=validate(club,sports,input,id);const team={...old,...values};commit(club,rows.map(t=>t.id===id?team:t));return {...team}}
 };
}
root.GGTeamStore={createRepository,colors,validColor,colorFor};
})(typeof window!=='undefined'?window:globalThis);

