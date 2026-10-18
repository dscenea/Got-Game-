(function(){
 'use strict';
 const screen=document.getElementById('roles');if(!screen)return;
 const montage=document.createElement('div');montage.className='ri-montage';montage.setAttribute('aria-hidden','true');
 const paths=['assets/profile-intro-basketball.webp','assets/profile-intro-football.webp'];
 const scenes=paths.map((_,i)=>{const el=document.createElement('div');el.className='ri-scene ri-scene-'+(i?'football':'basketball');montage.append(el);return el});
 const streaks=document.createElement('div');streaks.className='ri-streaks';
 for(let i=0;i<16;i++){const line=document.createElement('i');line.style.setProperty('--ri-i',i);line.style.setProperty('--ri-x',(i*6.7-2)+'%');streaks.append(line)}
 montage.append(streaks);
 const action=document.createElement('div');action.className='ri-action';
 action.innerHTML='<div class="ri-shadow"></div><div class="ri-ball ri-basketball"><svg viewBox="0 0 100 100" fill="none" stroke="#242018" stroke-width="3.5"><circle cx="50" cy="50" r="46" fill="#ffc107"/><path d="M4 50h92M50 4v92M17 17c38 18 48 48 66 66M17 83c38-18 48-48 66-66"/></svg></div><svg class="ri-boot" viewBox="0 0 100 100" fill="#222" stroke="#f7f4ea" stroke-width="2" stroke-linejoin="round"><path d="m25 4 26 7-9 42 19 10 26 3 7 12-6 9H25L8 76l9-15z"/><path d="m22 73 61 3M41 57l-7 9m15-6-7 9" fill="none" stroke="#ffc107" stroke-width="4"/></svg><div class="ri-ball ri-football"><svg viewBox="0 0 100 100" fill="#fdfcf6" stroke="#242018" stroke-width="2.5" stroke-linejoin="round"><circle cx="50" cy="50" r="46"/><path d="m50 28 21 15-8 25H37l-8-25zM50 4l-9 9 9 15 9-15zM8 31l3 15 18-3-2-18zM92 31l-19-6-2 18 18 3zM19 84l18-2V68l-15-2-10 9zM81 84l7-9-10-9-15 2v14z" fill="#242018"/><path d="M41 13 27 25m32-12 14 12M11 46l11 20m67-20L78 66M37 82l13 14 13-14" fill="none"/></svg></div>';
 montage.append(action);screen.prepend(montage);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let played=false,generation=0,enterTimer,filmTimer;
 function stop(){generation++;clearTimeout(enterTimer);clearTimeout(filmTimer);screen.classList.remove('ri-enter','ri-film')}
 window.ggProfileIntro=function(active){
  stop();if(!active||played||reduced.matches)return;played=true;const token=generation;
  screen.classList.add('ri-enter');enterTimer=setTimeout(()=>screen.classList.remove('ri-enter'),3100);
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
