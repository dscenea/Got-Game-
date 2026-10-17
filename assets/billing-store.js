(function(root){
 'use strict';
 const methods={cash:'Efectivo',transfer:'Transferencia',sepa:'Domiciliación',card:'Tarjeta',applepay:'Apple Pay',googlepay:'Google Pay'};
 function createRepository(storage){
  const key='gg-billing-preferences-v1',empty=()=>({enabled:['cash','transfer'],payers:{},assignments:{}});
  const read=()=>{const state=JSON.parse(storage.getItem(key)||'{}');if(!state||typeof state!=='object'||Array.isArray(state))throw Error('No se puede leer la configuración de pagos.');return state};
  const get=club=>structuredClone(read()[club]||empty());
  const commit=(club,next)=>storage.setItem(key,JSON.stringify({...read(),[club]:next}));
  const guard=role=>{if(role!=='coord')throw Error('Solo coordinación puede gestionar esta configuración.')};
  const approved=(club,payer,player)=>{const all=JSON.parse(storage.getItem('gg-family-links-v1')||'{}');return (all[club]||[]).some(r=>r.status==='approved'&&r.family===payer&&r.player===player)};
  return {get,saveEnabled(club,enabled,role){guard(role);if(!Array.isArray(enabled)||enabled.some(m=>!methods[m]))throw Error('Selecciona métodos válidos.');const next=get(club);next.enabled=[...new Set(enabled)];commit(club,next)},saveMethod(club,payer,input,role){guard(role);if(!payer||!methods[input.method])throw Error('Selecciona el familiar y un método válido.');const next=get(club);if(!next.enabled.includes(input.method))throw Error('Este método no está habilitado por el club.');const last4=String(input.last4||'').trim();if(last4&&!/^\d{4}$/.test(last4))throw Error('Introduce únicamente los últimos cuatro dígitos, nunca el número completo.');const record={method:input.method,last4:['card','sepa','transfer'].includes(input.method)?last4:'',updatedAt:new Date().toISOString(),providerConnected:false};next.payers[payer]=record;commit(club,next);return {...record}},assign(club,player,payer,role){guard(role);if(!player)throw Error('Selecciona un jugador.');if(payer&&!approved(club,payer,player))throw Error('El familiar necesita una vinculación aprobada con este jugador.');const next=get(club);if(payer)next.assignments[player]=payer;else delete next.assignments[player];commit(club,next)},assignMany(club,payer,selected,eligible,role){guard(role);if(!Array.isArray(selected)||!Array.isArray(eligible)||selected.some(p=>!eligible.includes(p)||!approved(club,payer,p)))throw Error('Solo puedes asignar jugadores con vinculación aprobada.');const next=get(club);eligible.forEach(p=>{if(selected.includes(p))next.assignments[p]=payer;else if(next.assignments[p]===payer)delete next.assignments[p]});commit(club,next)}};
 }
 root.GGBilling={methods,createRepository};if(typeof module!=='undefined')module.exports=root.GGBilling;
})(typeof window!=='undefined'?window:globalThis);
