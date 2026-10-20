(function(){
 'use strict';
 const screens=[...document.querySelectorAll('#roles,#login')];if(!screens.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let photoPromise;
 function photo(){
  if(photoPromise)return photoPromise;
  let sport='basketball';
  try{sport=sessionStorage.getItem('gg-profile-intro-sport')==='basketball'?'football':'basketball';sessionStorage.setItem('gg-profile-intro-sport',sport)}catch{sport=Math.random()<.5?'basketball':'football'}
  const path='assets/profile-intro-'+sport+'.webp',img=new Image();img.src=path;
  photoPromise=img.decode().then(()=>path).catch(()=>null);return photoPromise;
 }
 const controllers=screens.map(screen=>{
  screen.classList.add('ri-auth-screen');
  const backdrop=document.createElement('div');backdrop.className='ri-montage';backdrop.setAttribute('aria-hidden','true');
  const scene=document.createElement('div');scene.className='ri-scene';backdrop.append(scene);screen.prepend(backdrop);
  let played=false,generation=0,enterTimer;
  function stop(){generation++;clearTimeout(enterTimer);screen.classList.remove('ri-enter');scene.classList.remove('ri-photo-enter')}
  scene.addEventListener('animationend',e=>{if(e.animationName==='ri-photo-zoom')scene.classList.remove('ri-photo-enter')});
  function activate(active){
   stop();if(!active)return;
   const animate=!played&&!reduced.matches,token=generation;played=true;
   if(animate){screen.classList.add('ri-enter');enterTimer=setTimeout(()=>screen.classList.remove('ri-enter'),1250)}
   photo().then(path=>{
    if(!path||token!==generation||!screen.classList.contains('active'))return;
    scene.style.backgroundImage='url("'+path+'")';scene.classList.add('ri-ready');
    if(animate&&!reduced.matches)scene.classList.add('ri-photo-enter');
   });
  }
  return {id:screen.id,activate,stop};
 });
 window.ggAuthIntro=id=>controllers.forEach(controller=>controller.activate(controller.id===id));
 reduced.addEventListener('change',()=>{if(reduced.matches)controllers.forEach(controller=>controller.stop())});
 window.ggAuthIntro(document.querySelector('.screen.active')?.id);
})();
