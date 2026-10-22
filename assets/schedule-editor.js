/* Shared schedule editor. Dependencies are injected by the coordinator workspace. */
(function(root){'use strict';
root.GGScheduleEditor={install:function(deps){
const {workspace,dialog,scheduleRecords,scheduleRepository,clubKey,teams,scopedTeams,getSelectedTeam,getClubData,scheduleDate,time,teamLabel,getFilterPlace,renderRoster,renderWeek,schedulePlace,canManageSchedule,esc}=deps;
let scheduleEditing=null,scheduleAfterSave=null;
window.ggEditScheduleEvent=function(id,afterSave){const record=scheduleRecords().find(e=>e.id===id);if(!record)return;openScheduleEditor(record,{},afterSave);};
window.ggAddEvent=function(options){openScheduleEditor(null,options&&typeof options==='object'?options:{});};
function openScheduleEditor(record,options={},afterSave){
 if(!canManageSchedule())return;
 scheduleEditing=record;
 const roster=!!workspace.querySelector('.gg-roster');
 scheduleAfterSave=afterSave||options.afterSave||(()=>{if(!workspace.hidden){if(roster)renderRoster();else renderWeek();}});
 const editorTeams=record?teams():scopedTeams();
 const chosenTeam=record?.team||getSelectedTeam()||editorTeams.find(t=>(getClubData().facilities||[]).find(f=>f.name===options.place)?.sports?.includes(t.sport))?.id||editorTeams[0]?.id||'';
 const option=(value,label,selected)=>'<option value="'+esc(value)+'" '+(value===selected?'selected':'')+'>'+esc(label)+'</option>';
 dialog.innerHTML='<div class="gg-eyebrow">HORARIO COMPARTIDO</div><h2>'+(record?'Editar actividad':'Asignar pista y horario')+'</h2><p>Los cambios se reflejan en instalaciones, calendario y equipos. Se guardan en este navegador.</p><form class="gg-v59-form" id="ggScheduleForm"><label>Actividad<select id="v59Type">'+[['training','Entrenamiento'],['match','Partido'],['other','Otra actividad']].map(([v,l])=>option(v,l,record?.type||'training')).join('')+'</select></label><label>Equipo<select id="v59Team" required>'+editorTeams.map(t=>option(t.id,teamLabel(t.id),chosenTeam)).join('')+'</select></label><label>Fecha / primera sesión<input id="v59Date" type="date" required value="'+esc(record?.date||options.date||scheduleDate(new Date()))+'"></label><label>Hora<input id="v59Time" type="time" required value="'+time(record?.hour??18)+'"></label><label>Duración (minutos)<input id="v59Duration" type="number" min="15" max="360" step="5" required value="'+Math.round((record?.duration??1.5)*60)+'"></label><label>Instalación<select id="v59Place" required></select></label><label id="v59OtherPlace" hidden>Nombre de la instalación externa<input id="v59PlaceText" maxlength="100" placeholder="Instalación de un partido fuera"></label><label>Pista / sala<select id="v59Space"></select></label><label class="gg-schedule-check"><input type="checkbox" id="v59Repeat" '+(record?.recurring?'checked':'')+'> Repetir semanalmente</label><label id="v59UntilLabel">Hasta<input id="v59Until" type="date" value="'+esc(record?.until||'2027-06-30')+'"></label><p id="ggScheduleScope">'+(record?.recurring?'Estás modificando toda la serie semanal.':'')+'</p><p id="ggScheduleError" role="alert"></p><label class="gg-schedule-check" id="ggConflictLabel" hidden><input type="checkbox" id="ggAllowConflict"> Permitir este solapamiento</label><button class="gg-button selected" type="submit">Guardar horario</button> '+(record?'<button class="gg-button" type="button" id="ggDeleteSchedule">Eliminar actividad'+(record.recurring?' / serie':'')+'</button> ':'')+'<button class="gg-button" type="button" id="ggCancelSchedule">Cancelar</button></form>';
 const team=dialog.querySelector('#v59Team'),place=dialog.querySelector('#v59Place'),space=dialog.querySelector('#v59Space');
 function spaces(selected){const f=(getClubData().facilities||[]).find(f=>f.name===place.value),sport=teams().find(t=>t.id===team.value)?.sport;space.innerHTML=option('','Sin pista concreta','')+(f?.spaces||[]).filter(p=>!p.sports?.length||p.sports.includes(sport)).map(p=>option(String(p.id),p.name,String(selected||''))).join('');space.value=[...space.options].some(o=>o.value===String(selected||''))?String(selected||''):'';dialog.querySelector('#v59OtherPlace').hidden=place.value!=='other';}
 function places(selected){const sport=teams().find(t=>t.id===team.value)?.sport;const list=(getClubData().facilities||[]).filter(f=>f.sports?.includes(sport));place.innerHTML=option('','Seleccionar instalación','')+list.map(f=>option(f.name,f.name,selected)).join('')+option('other','Otra instalación / partido fuera',selected);if(selected&&!list.some(f=>f.name===selected)&&selected!=='other'){place.value='other';dialog.querySelector('#v59PlaceText').value=selected;}else place.value=selected||'';spaces(record?.spaceId||options.spaceId);}
 places(record?.place||options.place||getFilterPlace()||'');team.onchange=()=>places(place.value);place.onchange=()=>spaces('');
 const toggleRepeat=()=>dialog.querySelector('#v59UntilLabel').hidden=!dialog.querySelector('#v59Repeat').checked;toggleRepeat();dialog.querySelector('#v59Repeat').onchange=toggleRepeat;
 dialog.querySelector('#ggCancelSchedule').onclick=()=>dialog.close();
 dialog.querySelector('#ggScheduleForm').onsubmit=e=>{e.preventDefault();window.ggSaveEvent();};
 const deletion=dialog.querySelector('#ggDeleteSchedule');if(deletion)deletion.onclick=()=>{if(!confirm('¿Eliminar esta actividad'+(record.recurring?' y toda su serie semanal':'')+'?'))return;try{scheduleRepository.remove(clubKey(),record.id);dialog.close();scheduleAfterSave?.();}catch(error){dialog.querySelector('#ggScheduleError').textContent='No se pudo guardar: '+error.message;}};
 if(!dialog.open)dialog.showModal();
}
window.ggSaveEvent=function(){
 if(!canManageSchedule())return;
 const val=id=>dialog.querySelector('#'+id).value,other=val('v59Place')==='other',place=other?val('v59PlaceText').trim():val('v59Place'),spaceId=other?'':val('v59Space'),team=val('v59Team'),hm=val('v59Time');
 const candidate={id:scheduleEditing?.id,team,place,spaceId,spaceName:spaceId?dialog.querySelector('#v59Space').selectedOptions[0].textContent:'',type:val('v59Type'),date:val('v59Date'),hour:Number(hm.slice(0,2))+Number(hm.slice(3,5))/60,duration:Number(val('v59Duration'))/60,recurring:dialog.querySelector('#v59Repeat').checked,until:val('v59Until'),title:val('v59Type')==='match'?'Partido':val('v59Type')==='training'?'Entrenamiento':'Actividad'};
 const error=dialog.querySelector('#ggScheduleError');
 try{
  if(!teams().some(t=>t.id===team))throw Error('Selecciona un equipo existente.');
  if(!place)throw Error('Selecciona una instalación.');
  const clashes=GGScheduleStore.conflicts(scheduleRecords(),candidate);
  if(clashes.length&&!dialog.querySelector('#ggAllowConflict').checked){dialog.querySelector('#ggConflictLabel').hidden=false;throw Error('Coincide con '+clashes.slice(0,3).map(e=>teamLabel(e.team)+' · '+schedulePlace(e)+' · '+time(e.hour)).join('; ')+'. Cambia la franja o confirma el solapamiento.');}
  scheduleRepository.save(clubKey(),candidate);dialog.close();scheduleAfterSave?.();
 }catch(e){error.textContent=e.message;}
};

}};
})(typeof window!=='undefined'?window:globalThis);
