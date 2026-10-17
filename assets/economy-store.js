(function(root){
 'use strict';
 function createRepository(storage){
  const key='gg-economy-v1';
  const read=()=>{const state=JSON.parse(storage.getItem(key)||'{}');if(!state||Array.isArray(state)||typeof state!=='object')throw Error('No se puede leer el registro económico.');return state};
  const commit=(club,rows)=>{const state=read();storage.setItem(key,JSON.stringify({...state,[club]:rows}))};
  const list=club=>(read()[club]||[]).map(r=>({...r}));
  function make(input){
   const concept=String(input.concept||'').trim(),reference=String(input.reference||'').trim(),amount=String(input.amount||'').trim().replace(',','.');
   if(!concept||concept.length>120||!reference||reference.length>120)throw Error('Completa concepto y referencia (máximo 120 caracteres).');
   if(!/^\d{1,7}(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)throw Error('Indica un importe positivo con un máximo de dos decimales.');
   if(!input.sport)throw Error('Selecciona un deporte.');
   const due=String(input.due||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(Date.parse(due+'T12:00:00Z'))||new Date(due+'T12:00:00Z').toISOString().slice(0,10)!==due)throw Error('Selecciona un vencimiento válido.');
   return {id:root.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2),concept,reference,cents:Math.round(Number(amount)*100),sport:input.sport,teamId:input.teamId||'',teamName:input.teamName||'',playerId:input.playerId||'',due,status:'pending',createdAt:new Date().toISOString()};
  }
  return {list,add(club,input){const row=make(input);commit(club,[...list(club),row]);return {...row}},addPlayers(club,input,players){
   if(!Array.isArray(players)||!players.length)throw Error('Selecciona al menos un jugador.');
   const seen=new Set(),existing=list(club),rows=players.map(p=>{if(!p.id||seen.has(p.id))throw Error('Hay jugadores repetidos en la selección.');seen.add(p.id);const row=make({...input,reference:p.name,playerId:p.id,sport:p.sport,teamId:p.teamId,teamName:p.teamName,amount:p.amount??input.amount});if(existing.some(r=>r.playerId===row.playerId&&r.concept.toLocaleLowerCase('es')===row.concept.toLocaleLowerCase('es')&&r.due===row.due&&r.status!=='cancelled'))throw Error('Ya existe esta cuota y vencimiento para '+p.name+'. No se ha asignado el lote.');return row});
   commit(club,[...existing,...rows]);return rows.map(r=>({...r}));
  },setStatus(club,id,status){if(!['pending','paid','cancelled'].includes(status))throw Error('Estado inválido.');const rows=list(club),row=rows.find(r=>r.id===id);if(!row)throw Error('No se ha encontrado el registro.');row.status=status;row.updatedAt=new Date().toISOString();commit(club,rows);return {...row}}};
 }
 root.GGEconomy={createRepository};if(typeof module!=='undefined')module.exports=root.GGEconomy;
})(typeof window!=='undefined'?window:globalThis);
