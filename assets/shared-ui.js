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
 function pageShell(root,isModule=false){
  if(!root)return;
  const existing=root.querySelector(':scope > .gg-page-header');
  if(existing){
   const scope=root.querySelector(':scope > .gg-club-scope');
   if(scope)existing.querySelector('.gg-page-nav').append(scope);
   return;
  }
  const back=root.querySelector(isModule?':scope > .gg-module-unified-head #ggV72Back':'.gg-v83-back[aria-label="Volver al inicio"],.gg-calendar-page-head [data-back],#ggV97Back,.gg-v100-back[aria-label="Volver al panel"],.gr-page > .gr-heading [data-back]');
  const title=root.querySelector('h1');
  if(!back||!title){root.classList.remove('gg-page-shell');return;}
  const oldHeading=title.closest('.gg-calendar-page-head,.gg-section-heading,.gr-heading,.gg-v84-club-head,.gg-module-unified-head');
  const header=document.createElement('header');header.className='gg-page-header';
  const nav=document.createElement('div');nav.className='gg-page-nav';
  back.dataset.pageBack='';nav.append(back);
  const scope=root.querySelector(':scope > .gg-club-scope');if(scope)nav.append(scope);
  header.append(nav,title);
  if(oldHeading){
   // Keep useful introductory copy; discard only the superseded heading furniture.
   const description=oldHeading.querySelector('p');if(description)header.append(description);
   oldHeading.remove();
  }
  root.querySelectorAll(':scope > .gg-eyebrow,:scope > .gg-module-unified-eyebrow').forEach(el=>el.remove());
  const content=document.createElement('div');content.className='gg-page-content';
  content.append(...root.childNodes);
  root.replaceChildren(header,content);root.classList.add('gg-page-shell');
 }
 function normalize(){
  pageShell(document.getElementById('ggWorkspace'));
  pageShell(document.getElementById('ggV71Main'),true);
  // Only root-level home controls: preserve returns to teams, profiles and subviews.
  document.querySelectorAll('#dashboard [data-page-back],#ggWorkspace .gg-v83-back[aria-label="Volver al inicio"],#ggWorkspace .gg-calendar-page-head [data-back],#ggV71Main #ggV75Home').forEach(back=>{
   if(!back.classList.contains('gg-home-back')){
    back.classList.add('gg-home-back');back.type='button';
    back.setAttribute('aria-label','Volver al inicio');back.title='Volver al inicio';
    const arrow=document.createElement('span');arrow.className='gg-home-back-arrow';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m14 6-6 6 6 6"/></svg>';
    const label=document.createElement('span');label.className='gg-home-back-label';label.textContent='Inicio';
    back.replaceChildren(arrow,label);
   }
   back.closest('.gg-section-heading,.gg-calendar-page-head')?.classList.add('gg-home-heading');
  });
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
