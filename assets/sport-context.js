/* One navigation context per club. This filters presentation, never permissions. */
(function(){
 'use strict';
 const selections=new Map();
 const sports=()=>Array.isArray(data.sports)?data.sports:[];
 const club=()=>data.club||'';
 let section='home';
 window.ggCurrentSport=()=>sports().length===1?sports()[0]:(sports().includes(selections.get(club()))?selections.get(club()):'all');
 window.ggSelectSportContext=value=>{selections.set(club(),sports().includes(value)?value:'all');};
 window.ggSportScopeLabel=()=>ggCurrentSport()==='all'?'Todo el club':ggCurrentSport();
 window.ggMatchesSportScope=assigned=>ggCurrentSport()==='all'||(assigned||[]).includes(ggCurrentSport());
 window.ggRenderSportContext=function(host,key){
  section=key;
  document.querySelectorAll('.gg-club-scope').forEach(el=>el.remove());
  if(sports().length<2)return;
  const bar=document.createElement('div');bar.className='gg-club-scope';
  const control=document.createElement('div');control.className='gg-scope-control';
  const caption=document.createElement('span');caption.className='gg-scope-caption';caption.textContent='Estás viendo';
  const picker=document.createElement('details');picker.className='gg-scope-picker';
  const summary=document.createElement('summary'),list=document.createElement('div');
  list.className='gg-scope-options';list.setAttribute('role','group');list.setAttribute('aria-label','Seleccionar ámbito del club');
  const values=[['all','Todo el club'],...sports().map(s=>[s,s])],selected=ggCurrentSport();
  function icon(value){const el=document.createElement('span');el.className='gg-scope-icon';el.setAttribute('aria-hidden','true');
   if(value!=='all'&&typeof ggSportIcon==='function')el.innerHTML=ggSportIcon(value);
   else el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/></svg>';
   return el;
  }
  const selectedText=values.find(([value])=>value===selected)?.[1]||'Todo el club';
  summary.setAttribute('aria-label','Ámbito del club: '+selectedText);summary.append(icon(selected));
  const text=document.createElement('span');text.className='gg-scope-text';text.textContent=selectedText;
  const chevron=document.createElement('span');chevron.className='gg-scope-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';summary.append(text,chevron);
  const buttons=values.map(([value,label])=>{const b=document.createElement('button');b.type='button';b.dataset.scope=value;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(value===selected));
   const name=document.createElement('span');name.textContent=label;b.append(icon(value),name);
   const tick=document.createElement('span');tick.className='gg-scope-tick';tick.setAttribute('aria-hidden','true');tick.textContent=value===selected?'✓':'';b.append(tick);
   b.onclick=()=>{picker.open=false;window.ggChangeSportScope(value);queueMicrotask(()=>document.querySelector('.gg-scope-picker summary')?.focus())};list.append(b);return b;
  });
  picker.append(summary,list);picker.onkeydown=e=>{const index=buttons.indexOf(document.activeElement);
   if(e.key==='Escape'){picker.open=false;summary.focus();e.preventDefault();return;}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();picker.open=true;const next=index<0?(e.key==='ArrowDown'?0:buttons.length-1):(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();}
   else if(index>=0&&(e.key==='Home'||e.key==='End')){e.preventDefault();buttons[e.key==='Home'?0:buttons.length-1].focus();}
  };
  control.append(caption,picker);bar.append(control);host.prepend(bar);
 };
 window.ggChangeSportScope=function(value){
  ggSelectSportContext(value);
  if(section==='material'){window.ggOpenCoordinationPanel(ggCurrentSport());window.ggOpenMaterial(ggCurrentSport());}
  else if(section==='facilities'){window.ggOpenCoordinationPanel(ggCurrentSport());window.ggOpenScopedFacilities();}
  else if(section==='teams'||section==='calendar'){window.ggView(section);}
  else if(section==='people'){window.ggOpenSection('people');}
  else if(section==='settings'||section==='community'){window.ggOpenSection(section);}
  else window.ggOpenCoordinationPanel(ggCurrentSport());
 };
 if(typeof document!=='undefined')document.addEventListener('click',e=>document.querySelectorAll('.gg-scope-picker[open]').forEach(p=>{if(!p.contains(e.target))p.open=false}));
})();
