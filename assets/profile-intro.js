(function(){
 'use strict';
 const screen=document.getElementById('roles');if(!screen)return;
 const backdrop=document.createElement('div');backdrop.className='ri-montage';backdrop.setAttribute('aria-hidden','true');
 const scene=document.createElement('div');scene.className='ri-scene';backdrop.append(scene);screen.prepend(backdrop);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let played=false,generation=0,enterTimer,photoPromise;
 function photo(){
  if(photoPromise)return photoPromise;
  let sport='basketball';
  try{sport=sessionStorage.getItem('gg-profile-intro-sport')==='basketball'?'football':'basketball';sessionStorage.setItem('gg-profile-intro-sport',sport)}catch{sport=Math.random()<.5?'basketball':'football'}
  const path='assets/profile-intro-'+sport+'.webp',img=new Image();img.src=path;
  photoPromise=img.decode().then(()=>path).catch(()=>null);return photoPromise;
 }
 function stop(){generation++;clearTimeout(enterTimer);screen.classList.remove('ri-enter');scene.classList.remove('ri-photo-enter')}
 scene.addEventListener('animationend',e=>{if(e.animationName==='ri-photo-zoom')scene.classList.remove('ri-photo-enter')});
 window.ggProfileIntro=function(active){
  stop();if(!active)return;
  const animate=!played&&!reduced.matches,token=generation;played=true;
  if(animate){screen.classList.add('ri-enter');enterTimer=setTimeout(()=>screen.classList.remove('ri-enter'),1250)}
  photo().then(path=>{
   if(!path||token!==generation||!screen.classList.contains('active'))return;
   scene.style.backgroundImage='url("'+path+'")';scene.classList.add('ri-ready');
   if(animate&&!reduced.matches)scene.classList.add('ri-photo-enter');
  });
 };
 reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
 if(screen.classList.contains('active'))window.ggProfileIntro(true);
})();
