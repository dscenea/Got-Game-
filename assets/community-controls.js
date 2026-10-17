(function(){
 const paths={posts:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3M8 18h8"/>',network:'<path d="M9 3h6v5l-3 2-3-2zM2 14h6v5l-3 2-3-2zM16 14h6v5l-3 2-3-2zM12 10v2M5 14v-2h14v2"/>',social:'<circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 10 8-4M8 14l8 4"/>'};
 window.ggCommunityIcon=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[k]+'</svg>';
 window.ggCommunitySocial=function(host){
  const networks=[['instagram','Instagram'],['facebook','Facebook'],['x','X'],['tiktok','TikTok']],key='gg-community-social:'+data.club;
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||localStorage.getItem('gg-community-social')||'{}')}catch{}
  host.innerHTML='<h2>Redes sociales</h2><form class="gg-demo-card gp-form">'+networks.map(([id,name])=>'<label>'+name+'<input class="gg-demo-input" name="'+id+'" type="url" placeholder="https://…"></label>').join('')+'<button class="gg-button selected">Guardar enlaces</button><p role="status"></p></form>';
  for(const [id] of networks)host.querySelector('[name='+id+']').value=saved[id]||'';
  host.querySelector('form').onsubmit=e=>{e.preventDefault();const next=Object.fromEntries(new FormData(e.target));try{for(const value of Object.values(next))if(value&&!/^https?:\/\//i.test(value))throw Error('Usa enlaces que empiecen por https:// o http://.');localStorage.setItem(key,JSON.stringify(next));host.querySelector('[role=status]').textContent='Enlaces guardados.'}catch(err){host.querySelector('[role=status]').textContent=err.message||'No se han podido guardar los enlaces.'}};
 };
})();
