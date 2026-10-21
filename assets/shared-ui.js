/* got GAME! shared navigation and heading primitives. Non-destructive: keeps existing route handlers. */
(function(){
 'use strict';
 const navSelector='#dashboard .gg-v71-bottom [data-section]';
 const headings=['.gg-section-heading','.gg-module-unified-head','.gg-calendar-page-head'];
 function syncNav(section){
  if(!section)return;
  const buttons=document.querySelectorAll(navSelector);
  buttons.forEach(button=>{
   const selected=button.dataset.section===section;
   button.classList.toggle('active',selected);
   if(selected)button.setAttribute('aria-current','page');
   else button.removeAttribute('aria-current');
  });
 }
 function normalize(){
  document.querySelectorAll(headings.join(',')).forEach(head=>{
   head.classList.add('gg-shared-page-heading');
   const back=head.querySelector('button[aria-label*="Volver"],button[data-back],button.gg-v71-page-back');
   if(back){back.classList.add('gg-shared-back');if(!back.hasAttribute('type'))back.type='button';}
  });
  document.querySelectorAll('#ggWorkspace .gg-v83-back,#ggWorkspace .gg-access-back,#ggWorkspace .gg-v100-back,#ggWorkspace .gg-v96-back,#ggWorkspace .gg-subscreen-back').forEach(back=>{
   if(back.closest('.gg-section-heading'))return;
   if(!back.hasAttribute('type'))back.type='button';
  });
 }
 document.addEventListener('click',e=>{
  const nav=e.target.closest(navSelector);
  if(nav){syncNav(nav.dataset.section);return;}
  if(e.target.closest('#ggWorkspace [data-community-home],#ggV71Main #ggV72Back'))return;
 },false);
 window.ggSharedUI={syncNav,normalize};
 // Normalize newly rendered headings; never override existing route handlers.
 function start(){
  normalize();
  const dashboard=document.getElementById('dashboard');
  if(!dashboard||typeof MutationObserver==='undefined')return;
  let queued=false;
  new MutationObserver(records=>{
   // Ignore attribute changes: normalizing adds classes and must not retrigger itself.
   if(!records.some(record=>record.addedNodes.length))return;
   if(queued)return;
   queued=true;
   queueMicrotask(()=>{queued=false;normalize()});
  }).observe(dashboard,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
