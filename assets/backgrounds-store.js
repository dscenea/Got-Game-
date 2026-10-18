(function(root){
 'use strict';
 const sports=['Baloncesto','Fútbol','Voleibol','Balonmano','Tenis','Pádel','Atletismo','Natación'];
 const defaults=scope=>({mode:scope?'sport':'crest',tint:'primary',strength:22,image:''});
 function createRepository(storage){const key='gg-club-backgrounds-v1',read=()=>JSON.parse(storage.getItem(key)||'{}');
  const get=(club,scope='')=>({...defaults(scope),...(read()[club]?.[scope||'home']||{})});
  function save(club,scope,input,actor){if(actor?.role!=='coord'||actor.club!==club)throw Error('Solo coordinación puede cambiar el fondo del club.');if(scope&&!(actor.sports||[]).includes(scope))throw Error('Selecciona un deporte del club.');if(!['solid','custom',scope?'sport':'crest'].includes(input.mode)||!['primary','secondary'].includes(input.tint)||!Number.isFinite(+input.strength)||+input.strength<0||+input.strength>40)throw Error('Selecciona un fondo, un color y una intensidad válidos.');const image=String(input.image||'');if(image&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>650000))throw Error('La imagen debe ser JPG, PNG o WEBP optimizada.');if(input.mode==='custom'&&!image)throw Error('Sube una imagen antes de guardar.');const all=read(),next={...all,[club]:{...(all[club]||{}),[scope||'home']:{mode:input.mode,tint:input.tint,strength:+input.strength,image:input.mode==='custom'?image:''}}};storage.setItem(key,JSON.stringify(next));return get(club,scope)}
  return {get,save};
 }
 // Use the selected child's/team's sport; a family overview always uses its club crest.
 function context({sport='',role='coord',overview=false}={}){return role==='family'&&overview?'':sport;}
 root.GGBackgrounds={sports,defaults,context,createRepository};if(typeof module!=='undefined')module.exports=root.GGBackgrounds;
})(typeof window!=='undefined'?window:globalThis);
