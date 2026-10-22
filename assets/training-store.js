/* Exercise library and occurrence-specific session plans. Local preview only. */
(function(root){
 'use strict';
 const phases={warmup:'Calentamiento',main:'Parte principal',cooldown:'Vuelta a la calma'};
 const copy=value=>JSON.parse(JSON.stringify(value));
 const uid=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function text(value,max){const result=String(value??'').trim();if(result.length>max)throw Error('Uno de los textos es demasiado largo.');return result;}
 function tags(values){if(!Array.isArray(values)||values.length>12)throw Error('Usa hasta 12 etiquetas.');const seen=new Set();return values.map(v=>text(v,32)).filter(v=>{const k=v.toLocaleLowerCase('es');if(!v||seen.has(k))return false;seen.add(k);return true;});}
 function exercise(input,person){
  const title=text(input.title,100),sport=text(input.sport,60),duration=Number(input.duration),selected=[...new Set(input.phases||[])];
  if(!title||!person.sports.includes(sport))throw Error('Indica un nombre y un deporte de tu perfil.');
  if(!Number.isInteger(duration)||duration<1||duration>180)throw Error('La duración debe estar entre 1 y 180 minutos.');
  if(!selected.length||selected.some(p=>!Object.hasOwn(phases,p)))throw Error('Selecciona al menos un momento del entrenamiento.');
  return {title,sport,duration,phases:selected,tags:tags(input.tags||[]),description:text(input.description,5000),materials:text(input.materials,1000),board:root.GGTacticalBoard.validate(input.board||{sport,view:'full',objects:[]},sport)};
 }
 function createRepository(storage,access){
  const key='gg-training-v1';
  function read(){const value=JSON.parse(storage.getItem(key)||'{"exercises":[],"plans":[]}');if(!value||!Array.isArray(value.exercises)||!Array.isArray(value.plans))throw Error('No se puede leer la biblioteca guardada.');return value;}
  const write=state=>storage.setItem(key,JSON.stringify(state));
  function actor(){const p=access.identity();if(!p?.id||!p.club||p.role!=='coach')throw Error('Acceso de entrenador no disponible.');return p;}
  const visible=(e,p)=>e.club===p.club&&p.sports.includes(e.sport)&&(e.owner===p.id||e.visibility==='club');
  function getExercise(id,includeArchived=false){const p=actor(),row=read().exercises.find(e=>e.id===id&&visible(e,p)&&(includeArchived||!e.archived));if(!row)throw Error('Ejercicio no disponible en tu biblioteca.');return copy(row);}
  function saveExercise(input){const p=actor(),state=read(),old=input.id?state.exercises.find(e=>e.id===input.id):null;if(input.id&&(!old||old.club!==p.club||old.owner!==p.id))throw Error('Solo puedes editar tus propios ejercicios.');if(old&&input.revision!==old.revision)throw Error('El ejercicio cambió en otra vista. Ábrelo de nuevo antes de guardar.');const values=exercise(input,p);if(!['private','club'].includes(input.visibility||'private'))throw Error('Selecciona quién puede ver el ejercicio.');const row={...values,id:old?.id||uid(),club:p.club,owner:p.id,ownerName:p.name,visibility:input.visibility||'private',archived:old?.archived||false,revision:(old?.revision||0)+1,updatedAt:new Date().toISOString()};state.exercises=old?state.exercises.map(e=>e.id===row.id?row:e):[row,...state.exercises];write(state);return copy(row);}
  function archive(id,archived,revision){const p=actor(),state=read(),row=state.exercises.find(e=>e.id===id&&e.club===p.club&&e.owner===p.id);if(!row)throw Error('Solo puedes archivar tus ejercicios.');if(revision!==row.revision)throw Error('El ejercicio ha cambiado. Actualiza la biblioteca.');row.archived=!!archived;row.revision++;write(state);}
  function session(team,eventId,date){const p=actor(),event=access.occurrence(team,eventId,date);if(event.type!=='training')throw Error('La preparación de sesiones se vincula a entrenamientos.');const planKey=JSON.stringify([p.club,p.id,team,eventId,date]);return {p,event,planKey};}
  function plan(team,eventId,date){const {planKey}=session(team,eventId,date),stored=read().plans.find(p=>p.key===planKey);return stored?copy(stored):{key:planKey,revision:0,objective:'',notes:'',blocks:{warmup:[],main:[],cooldown:[]}};}
  function savePlan(team,eventId,date,input){const {p,event,planKey}=session(team,eventId,date),state=read(),old=state.plans.find(x=>x.key===planKey);if(input.revision!==(old?.revision||0))throw Error('La sesión cambió en otra vista. Vuelve a abrirla antes de guardar.');const ids=new Set(),blocks={};for(const phase of Object.keys(phases)){const rows=input.blocks?.[phase];if(!Array.isArray(rows)||rows.length>30)throw Error('Usa hasta 30 ejercicios por bloque.');blocks[phase]=rows.map(row=>{const values=exercise({...row,phases:[phase]},p);if(values.sport!==event.sport)throw Error('Los ejercicios deben ser del deporte del equipo.');const id=text(row.instanceId,100)||uid();if(ids.has(id))throw Error('Hay ejercicios duplicados sin identificador propio.');ids.add(id);return {...values,instanceId:id,sourceId:text(row.sourceId,100)};});}const row={key:planKey,club:p.club,owner:p.id,team,eventId,date,revision:(old?.revision||0)+1,objective:text(input.objective,1000),notes:text(input.notes,3000),blocks,updatedAt:new Date().toISOString()};state.plans=old?state.plans.map(x=>x.key===planKey?row:x):[...state.plans,row];write(state);return copy(row);}
  function snapshot(id,phase){if(!Object.hasOwn(phases,phase))throw Error('Bloque no válido.');const row=getExercise(id);return {...exercise({...row,phases:[phase]},actor()),instanceId:uid(),sourceId:row.id};}
  return {list({sport='',phase='',query='',archived=false}={}){const p=actor(),q=query.trim().toLocaleLowerCase('es');return read().exercises.filter(e=>visible(e,p)&&!!e.archived===!!archived&&(!sport||e.sport===sport)&&(!phase||e.phases.includes(phase))&&(!q||[e.title,...e.tags,e.description].join(' ').toLocaleLowerCase('es').includes(q))).map(copy);},getExercise,saveExercise,archive,plan,savePlan,snapshot,
   duplicate(id){const source=getExercise(id);return saveExercise({...source,id:undefined,revision:undefined,title:(source.title+' · copia').slice(0,100),visibility:'private'});},
   newSnapshot(input,phase){const value=exercise({...input,phases:[phase]},actor());return {...value,instanceId:uid(),sourceId:''};}
  };
 }
 root.GGTraining={createRepository,phases,tags,uid,total:plan=>Object.values(plan.blocks).flat().reduce((n,e)=>n+e.duration,0)};
})(typeof window!=='undefined'?window:globalThis);
