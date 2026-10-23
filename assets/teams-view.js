/* got GAME! — Team list view, injected coordinator dependencies. */
(function(root){'use strict';root.GGTeamsView={install:function({workspace,scopedTeams,currentSport,clubSports,teamData,icon,esc,wzArg,syncLogos,renderSportContext}){
function renderTeams(){
 const visible=scopedTeams(),scope=currentSport();
 const card=t=>'<button class="gg-team-card" onclick="ggTeam('+wzArg(t.id)+')"><span class="gg-team-symbol">'+icon('team')+'</span><b>'+esc(t.name)+'</b><small>'+esc(root.GGClubSelectors.teamSportLabel(t))+' · '+teamData(t.id).length+' jugadores</small><span class="gg-muted">'+esc(t.coach||'Entrenador/a pendiente')+'</span><div class="gg-muted">Abrir plantilla →</div></button>';
 const groups=scope==='all'?clubSports():[scope];
 workspace.innerHTML='<button class="gg-v100-back" onclick="ggView(&quot;home&quot;)" aria-label="Volver al panel">‹ <span>Volver al panel</span></button><div class="gg-eyebrow">ÁREA DEPORTIVA</div><div class="gg-toolbar"><h1>Equipos</h1><button class="gg-button selected" onclick="ggEditTeam()">+ Crear equipo</button></div><p class="gg-muted">Plantillas, entrenadores y horarios. Los cambios se guardan en este navegador.</p>'+
 groups.map(s=>{const rows=visible.filter(t=>t.sport===s);return (scope==='all'?'<h2 class="gg-team-group-title">'+esc(s)+'</h2>':'')+'<div class="gg-team-grid">'+rows.map(card).join('')+'</div>'+(!rows.length?'<p class="gg-muted">Todavía no hay equipos de '+esc(s)+'.</p>':'');}).join('');
 syncLogos();renderSportContext(workspace,'teams');
}


return {renderTeams};
}};})(typeof window!=='undefined'?window:globalThis);
