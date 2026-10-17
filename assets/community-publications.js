(function(){
 'use strict';
 const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.ggPublicationsMount=function(host){
  if(roleKey(selectedRole)!=='coord'){host.textContent='Solo coordinación puede gestionar estas publicaciones.';return}
  const key='gg-community-posts:'+data.club,roles={all:'Todo el club',families:'Familias / tutores legales',players:'Jugadores/as',staff:'Personal del club'};
  let posts=[],legacy=[];
  try{posts=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(posts))throw Error();legacy=JSON.parse(localStorage.getItem('gg-community-posts')||'[]');if(!Array.isArray(legacy))legacy=[]}catch{host.textContent='No se han podido leer las publicaciones guardadas.';return}
  const teams=window.ggPublicationTeams(),sports=Array.isArray(data.sports)?data.sports:[];
  host.innerHTML='<h2>Publicaciones</h2><form class="gg-demo-card gp-form"><label>Título<input name="title" required maxlength="160" class="gg-demo-input" placeholder="Título de la publicación"></label><label>Contenido<textarea name="text" required maxlength="5000" class="gg-demo-input" rows="4" placeholder="Novedad del club"></textarea></label><fieldset><legend>¿A quién va dirigida?</legend><label>Destinatarios<select name="audience">'+Object.entries(roles).map(([v,n])=>'<option value="'+v+'">'+n+'</option>').join('')+'</select></label><label>Deporte<select name="sport"><option value="">Todos los deportes</option>'+sports.map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Equipo<select name="team"><option value="">Todos los equipos</option></select></label></fieldset><p data-preview role="status"></p><p class="gg-muted">Demo local: se guarda el alcance elegido; todavía no se distribuye a cuentas reales.</p><button class="gg-button selected">Publicar</button><p data-result role="status"></p></form><div data-posts></div>';
  const form=host.querySelector('form'),field=n=>form.elements.namedItem(n);
  function scope(){const team=teams.find(t=>String(t.id)===field('team').value);return {audience:field('audience').value,sport:field('sport').value,teamId:team?String(team.id):'',teamName:team?.name||''}}
  function label(p){return [roles[p.audience]||'Todo el club',p.sport||'Todos los deportes',p.teamName||'Todos los equipos'].join(' · ')}
  function preview(){host.querySelector('[data-preview]').textContent='Dirigida a: '+label(scope())}
  function updateTeams(){field('team').innerHTML='<option value="">Todos los equipos</option>'+teams.filter(t=>!field('sport').value||t.sport===field('sport').value).map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+' · '+esc(t.sport)+'</option>').join('');preview()}
  field('sport').onchange=updateTeams;field('team').onchange=()=>{const team=teams.find(t=>String(t.id)===field('team').value);if(team)field('sport').value=team.sport;preview()};field('audience').onchange=preview;
  function render(){host.querySelector('[data-posts]').innerHTML=posts.slice().reverse().map(p=>'<article class="gg-demo-card"><small>'+esc(label(p))+'</small><h3>'+esc(p.title)+'</h3><p class="gp-message">'+esc(p.text)+'</p></article>').join('')+(legacy.length?'<details class="gg-demo-card"><summary>Publicaciones anteriores sin club ni destinatarios asignados</summary><p>No se distribuyen automáticamente.</p>'+legacy.slice().reverse().map(p=>'<article><h3>'+esc(p.title)+'</h3><p class="gp-message">'+esc(p.text)+'</p></article>').join('')+'</details>':'')}
  form.onsubmit=e=>{e.preventDefault();const title=field('title').value.trim(),text=field('text').value.trim(),result=host.querySelector('[data-result]');if(!title||!text){result.textContent='Completa el título y el contenido.';return}const next=[...posts,{id:crypto.randomUUID(),title,text,...scope(),createdAt:new Date().toISOString()}];try{localStorage.setItem(key,JSON.stringify(next));posts=next;field('title').value='';field('text').value='';render();result.textContent='Publicación guardada para: '+label(scope())}catch{result.textContent='No se ha podido guardar. El texto se conserva para volver a intentarlo.'}};
  updateTeams();render();
 };
})();
