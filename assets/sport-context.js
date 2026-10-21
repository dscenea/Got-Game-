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
  const label=document.createElement('label');label.textContent='Estás viendo';
  const select=document.createElement('select');select.setAttribute('aria-label','Ámbito del club');
  for(const [value,text] of [['all','Todo el club'],...sports().map(s=>[s,s])]){
   const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);
  }
  select.value=ggCurrentSport();select.onchange=()=>window.ggChangeSportScope(select.value);
  label.append(select);bar.append(label);host.prepend(bar);
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
})();
