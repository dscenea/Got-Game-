(function(){
 'use strict';
 const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.ggProposalMount=function(host,club){
  if(roleKey(selectedRole)!=='coord'){host.textContent='Solo coordinación puede gestionar propuestas entre clubes.';return}
  const key='gg-club-proposals-v1:'+data.club;
  let records;try{records=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(records))throw Error()}catch{host.textContent='No se ha podido leer el buzón. Inténtalo de nuevo.';return}
  const save=next=>{try{localStorage.setItem(key,JSON.stringify(next));records=next;return true}catch{alert('No se ha podido guardar. La propuesta sigue sin enviarse.');return false}};
  function inbox(direction='sent'){
   host.innerHTML='<h3>Buzón de propuestas</h3><p class="gg-muted">Demo local: las propuestas se guardan en este dispositivo; todavía no se entregan a otros clubes.</p><div class="gg-community-tabs"><button data-box="sent">Enviadas</button><button data-box="received">Recibidas</button></div><div data-messages></div>';
   host.querySelectorAll('[data-box]').forEach(b=>{b.classList.toggle('active',b.dataset.box===direction);b.setAttribute('aria-pressed',String(b.dataset.box===direction));b.onclick=()=>inbox(b.dataset.box)});
   const rows=records.filter(r=>r.direction===direction);
   host.querySelector('[data-messages]').innerHTML=rows.length?rows.slice().reverse().map(r=>'<article class="gg-demo-card"><small>'+esc(r.status)+'</small><h3>'+esc(r.clubName)+'</h3><p>'+esc(r.sport)+' · '+esc(r.category)+' · '+esc(r.date||'Fecha por acordar')+'</p><p>Lugar: '+esc(r.place)+'</p><p class="gp-message">'+esc(r.message)+'</p></article>').join(''):'<p class="gn-empty">'+(direction==='sent'?'Aún no has enviado propuestas. Busca un club y pulsa «Proponer amistoso».':'Todavía no hay propuestas recibidas. En esta demo no se simulan envíos de otros clubes.')+'</p>';
  }
  if(!club){inbox();return}
  host.innerHTML='<form class="gg-demo-card gp-form"><h3>Proponer amistoso</h3><p>Para <strong>'+esc(club.name)+'</strong> · '+esc(club.town)+'</p><label>Deporte<select name="sport">'+club.sports.map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Categoría<select name="category">'+club.categories.map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Fecha orientativa (opcional)<input class="gg-demo-input" name="date" type="date"></label><label>Lugar<select name="place"><option>Por acordar</option><option>En nuestro club</option><option>En el otro club</option></select></label><label>Mensaje de presentación<textarea class="gg-demo-input" name="message" required maxlength="2000" rows="5" placeholder="Presenta a tu equipo y explica qué tipo de amistoso buscáis…"></textarea></label><p class="gg-muted">Demo local: se guardará en Enviadas, sin entrega real. Evita incluir datos personales de menores.</p><p role="status" data-error></p><button class="gg-button selected">Enviar propuesta</button> <button type="button" class="gg-button" data-cancel>Cancelar</button></form>';
  host.querySelector('[data-cancel]').onclick=()=>inbox();
  host.querySelector('form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),message=f.get('message').trim();if(!message){host.querySelector('[data-error]').textContent='Escribe un mensaje de presentación.';return}const record={id:crypto.randomUUID(),clubId:club.id,clubName:club.name,direction:'sent',status:'Guardada en demo · pendiente de entrega',sport:f.get('sport'),category:f.get('category'),date:f.get('date'),place:f.get('place'),message,createdAt:new Date().toISOString()};if(save([...records,record]))inbox()};
 };
})();
