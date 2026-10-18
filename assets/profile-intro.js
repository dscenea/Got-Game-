(function(){
 'use strict';
 const screen=document.getElementById('roles');if(!screen)return;
 const montage=document.createElement('div');montage.className='ri-montage';montage.setAttribute('aria-hidden','true');
 const paths=['assets/profile-intro-basketball.webp','assets/profile-intro-football.webp'];
 const scenes=paths.map((_,i)=>{const el=document.createElement('div');el.className='ri-scene ri-scene-'+(i?'football':'basketball');montage.append(el);return el});screen.prepend(montage);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let played=false,generation=0,enterTimer,filmTimer;
 function stop(){generation++;clearTimeout(enterTimer);clearTimeout(filmTimer);screen.classList.remove('ri-enter','ri-film')}
 window.ggProfileIntro=function(active){
  stop();if(!active||played||reduced.matches)return;played=true;const token=generation;
  screen.classList.add('ri-enter');enterTimer=setTimeout(()=>screen.classList.remove('ri-enter'),1100);
  // Load only after entering this screen; image failure never blocks navigation.
  Promise.allSettled(paths.map(path=>{const img=new Image();img.src=path;return img.decode()})).then(results=>{
   if(token!==generation||!screen.classList.contains('active')||reduced.matches)return;
   results.forEach((r,i)=>{if(r.status==='fulfilled')scenes[i].style.backgroundImage='url("'+paths[i]+'")'});
   if(!results.some(r=>r.status==='fulfilled'))return;
   screen.classList.add('ri-film');filmTimer=setTimeout(()=>screen.classList.remove('ri-film'),2850);
  });
 };
 reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
 if(screen.classList.contains('active'))window.ggProfileIntro(true);
})();
