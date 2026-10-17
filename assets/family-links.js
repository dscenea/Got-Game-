/* Local demonstration records only. These links never grant account access. */
(function(root){
'use strict';
function createRepository(storage){
 const key='gg-family-links-v1';let state={};try{state=JSON.parse(storage.getItem(key)||'{}')||{}}catch{}
 const clean=v=>String(v||'').trim();
 function rows(club){return state[club]||[]}
 function commit(club,next){const all={...state,[club]:next};storage.setItem(key,JSON.stringify(all));state=all}
 return {
 list(club,family){return rows(club).filter(r=>!family||r.family===family).map(r=>({...r}))},
 request(club,family,player,relationship){
  if(!clean(club)||!clean(family)||!clean(player))throw Error('Selecciona el familiar y el jugador.');
  if(!['Madre','Padre','Tutor/a legal'].includes(relationship))throw Error('Selecciona una relación válida.');
  if(rows(club).some(r=>r.family===family&&r.player===player))throw Error('Ya existe una vinculación o solicitud para este jugador.');
  const record={id:root.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2),family,player,relationship,status:'pending'};commit(club,[...rows(club),record]);return {...record};
 },
 review(club,id,status,role){
  if(role!=='coord')throw Error('Solo coordinación puede revisar las vinculaciones.');
  if(!['approved','rejected'].includes(status))throw Error('Estado de revisión inválido.');
  const record=rows(club).find(r=>r.id===id);if(!record||record.status!=='pending')throw Error('La solicitud ya no está pendiente.');
  commit(club,rows(club).map(r=>r.id===id?{...r,status}:r));
 }
 };
}
const api={createRepository};if(typeof module==='object'&&module.exports)module.exports=api;else root.GGFamilyLinks=api;
})(typeof window==='undefined'?this:window);
