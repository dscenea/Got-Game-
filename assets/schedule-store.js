/* One club-scoped schedule, shared by facilities, calendar and team rosters. */
(function(root){
'use strict';
const DAY=86400000;
function stamp(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return NaN;const n=Date.parse(value+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n:NaN;}
const date=n=>new Date(n).toISOString().slice(0,10);
function expand(rows,start){const from=stamp(start),end=from+6*DAY;return rows.flatMap(e=>{const origin=stamp(e.date);if(!e.recurring)return origin>=from&&origin<=end?[{...e,day:Math.round((origin-from)/DAY)}]:[];const first=origin+Math.max(0,Math.ceil((from-origin)/(7*DAY)))*7*DAY;return first<=end&&first<=stamp(e.until)?[{...e,date:date(first),day:Math.round((first-from)/DAY)}]:[];});}
function overlaps(a,b){
 if(a.hour>=b.hour+b.duration||b.hour>=a.hour+a.duration)return false;
 const af=stamp(a.date),bf=stamp(b.date),ae=a.recurring?stamp(a.until):af,be=b.recurring?stamp(b.until):bf;
 const lo=Math.max(af,bf),hi=Math.min(ae,be);if(lo>hi)return false;
 if(!a.recurring&&!b.recurring)return af===bf;
 if(a.recurring&&b.recurring)return ((af-bf)/DAY)%7===0;
 const repeat=a.recurring?a:b,single=a.recurring?bf:af;return ((single-stamp(repeat.date))/DAY)%7===0;
}
function conflicts(rows,candidate){return rows.filter(e=>e.id!==candidate.id&&overlaps(e,candidate)&&(e.team===candidate.team||(e.place===candidate.place&&(!e.spaceId||!candidate.spaceId||String(e.spaceId)===String(candidate.spaceId)))));}
function createRepository(storage){
 const key='gg-events-v59';let rows=[];
 try{const saved=JSON.parse(storage.getItem(key)||'[]');if(Array.isArray(saved))rows=saved.map((e,i)=>({...e,id:e.id||'legacy-'+i}));}catch{}
 const clone=rows=>rows.map(e=>({...e}));
 function commit(next){storage.setItem(key,JSON.stringify(next));rows=next;}
 function records(club,seeds=[]){
  if(rows.some(e=>!e.club))commit(rows.map(e=>e.club?e:{...e,club}));
  const local=rows.filter(e=>e.club===club),overridden=new Set(local.map(e=>e.id));
  return clone([...seeds.filter(e=>!overridden.has(e.id)),...local.filter(e=>!e.deleted)]);
 }
 function validate(e){
  if(!e.team||!e.place?.trim()||!Number.isFinite(stamp(e.date)))throw Error('Completa equipo, instalación y fecha válida.');
  if(!Number.isFinite(e.hour)||!Number.isFinite(e.duration)||e.hour<0||e.duration<.25||e.duration>6||e.hour+e.duration>24)throw Error('Revisa la hora y la duración (15–360 minutos, dentro del mismo día).');
  if(e.recurring&&(!Number.isFinite(stamp(e.until))||e.until<e.date))throw Error('La fecha final debe ser igual o posterior a la primera sesión.');
 }
 return {records,
  save(club,input){validate(input);const e={...input,club,id:input.id||'event-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))};commit([...rows.filter(x=>!(x.club===club&&x.id===e.id)),e]);return {...e};},
  remove(club,id){commit([...rows.filter(x=>!(x.club===club&&x.id===id)),{club,id,deleted:true}]);},
  import(club,items){items.forEach(validate);const next=items.map((e,i)=>({...e,club,id:'import-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2)}));commit(rows.concat(next));}
 };
}
root.GGScheduleStore={createRepository,expand,conflicts,overlaps};
})(typeof window!=='undefined'?window:globalThis);
