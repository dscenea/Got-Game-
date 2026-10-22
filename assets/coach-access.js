/* Local preview policy. Production accounts require server-side authorization. */
(function(root){
 'use strict';
 const key=e=>e.type+':'+e.date+':'+e.id;
 const status=(player,event)=>player.attendance?.[key(event)]||player.attendance?.[event.type+':'+event.date]||'pending';
 function summary(player,type){const entries=Object.entries(player.attendance||{}).filter(([k])=>k.startsWith(type+':'));const scoped=new Set(entries.filter(([k])=>k.split(':').length>2).map(([k])=>k.split(':').slice(0,2).join(':')));const rows=entries.filter(([k])=>k.split(':').length>2||!scoped.has(k));return {yes:rows.filter(([,v])=>v==='yes').length,total:rows.length};}
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 function createService(deps){
  function identity(){const session=deps.session(),club=deps.club();if(!session||session.role!=='coach'||session.club!==club)throw Error('Acceso de entrenador no disponible.');const person=deps.staff().find(p=>p.id===session.id&&p.role==='coach');if(!person)throw Error('El entrenador ya no figura en el personal del club.');return {...person,club};}
  function teams(){const person=identity();return deps.teams().filter(t=>t.coach===person.name&&person.sports.includes(t.sport)).map(t=>({...t}));}
  function team(id){const row=teams().find(t=>t.id===id);if(!row)throw Error('Este equipo no está asignado a tu perfil.');return row;}
  function week(start,sport='all'){if(!validDate(start))throw Error('Fecha no válida.');const allowed=new Map(teams().filter(t=>sport==='all'||t.sport===sport).map(t=>[t.id,t]));return root.GGScheduleStore.expand(deps.schedules().filter(e=>allowed.has(e.team)),start).map(e=>({...e,teamName:allowed.get(e.team).name,sport:allowed.get(e.team).sport})).sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour);}
  function occurrence(teamId,id,date){team(teamId);const e=week(date).find(e=>e.team===teamId&&e.id===id&&e.date===date);if(!e)throw Error('La actividad ha cambiado o ya no está disponible. Vuelve a la agenda.');return e;}
  function roster(teamId){team(teamId);return deps.roster(teamId).map(p=>({id:p.id,name:p.name,number:p.number,attendance:{...p.attendance}}));}
  function save(teamId,eventId,date,changes){
   const event=occurrence(teamId,eventId,date),players=deps.roster(teamId);
   if(!Array.isArray(changes)||!changes.length||new Set(changes.map(c=>String(c.id))).size!==changes.length)throw Error('Revisa la lista de asistencia.');
   const staged=changes.map(c=>{const player=players.find(p=>String(p.id)===String(c.id));if(!player||!['pending','yes','no','justified'].includes(c.status))throw Error('Jugador o estado de asistencia no válido.');return {player,before:player.attendance,after:{...player.attendance,[key(event)]:c.status}};});
   staged.forEach(x=>{x.player.attendance=x.after});
   try{if(deps.persist()===false)throw Error('No se ha podido guardar. Revisa el almacenamiento del navegador.');}catch(error){staged.forEach(x=>{x.player.attendance=x.before});throw error;}
  }
  return {identity,teams,week,roster,occurrence,save};
 }
 root.GGCoachAccess={createService,key,status,summary,validDate};
})(typeof window!=='undefined'?window:globalThis);
