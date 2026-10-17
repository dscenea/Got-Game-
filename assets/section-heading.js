/* Share the compact mobile heading without replacing any navigation handlers. */
(function(){
 function align(){
  if(!window.matchMedia('(max-width:1023px)').matches)return;
  const root=document.getElementById('ggWorkspace');
  if(!root||root.hidden||root.querySelector('.gg-section-heading'))return;
  const title=root.querySelector('h1');
  const back=root.querySelector('.gg-v83-back,.gg-access-back,.gg-v100-back,.gg-v96-back,.gg-subscreen-back,#ggV97Back');
  if(!title||!back)return;
  if(!back.hasAttribute('aria-label'))back.setAttribute('aria-label',back.textContent.trim()||'Volver');
  const heading=document.createElement('div');heading.className='gg-section-heading';
  const copy=document.createElement('div');copy.className='gg-section-heading-copy';
  const eyebrow=title.previousElementSibling?.classList.contains('gg-eyebrow')?title.previousElementSibling:null;
  if(eyebrow)copy.append(eyebrow);
  copy.append(title);heading.append(back,copy);root.prepend(heading);
 }
 for(const name of ['ggView','ggOpenCommunity','ggTeam','ggTeamWeek','ggShiftWeek','ggThisWeek','ggSetWeekFilter']){
  const original=window[name];if(typeof original!=='function')continue;
  window[name]=function(){const result=original.apply(this,arguments);align();return result;};
 }
 // Person profiles and permission panels are rendered by local route handlers.
 document.addEventListener('click',()=>queueMicrotask(align));
 align();
})();
