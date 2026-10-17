/* Fictitious clubs at approximate demonstration locations. No real contact data. */
(function(root){
 'use strict';
 const towns=[
  {name:'Logroño',lat:42.465,lng:-2.445},{name:'Lardero',lat:42.426,lng:-2.461},
  {name:'Villamediana de Iregua',lat:42.426,lng:-2.419},{name:'Alberite',lat:42.405,lng:-2.439},
  {name:'Navarrete',lat:42.430,lng:-2.565},{name:'Fuenmayor',lat:42.467,lng:-2.562},
  {name:'Nájera',lat:42.418,lng:-2.735},{name:'Albelda de Iregua',lat:42.358,lng:-2.472},
  {name:'Pamplona',lat:42.813,lng:-1.644},{name:'Burlada',lat:42.825,lng:-1.617},
  {name:'Barañáin',lat:42.805,lng:-1.678},{name:'Vitoria-Gasteiz',lat:42.847,lng:-2.673}
 ];
 const sports=['Baloncesto','Fútbol','Voleibol','Balonmano','Tenis','Pádel','Atletismo','Natación'];
 const categories=['Benjamín','Alevín','Infantil','Cadete','Juvenil','Sénior'];
 const seeds=[
  ['Club Aurora','Logroño',42.468,-2.444,['Baloncesto','Voleibol'],['Alevín','Infantil','Cadete'],'#5436a8','AU',true],
  ['Deportivo Puente','Logroño',42.459,-2.420,['Fútbol','Balonmano'],['Infantil','Cadete','Juvenil'],'#087e8b','DP',true],
  ['Basket Encina','Lardero',42.427,-2.460,['Baloncesto'],['Benjamín','Alevín','Infantil'],'#c35c13','BE',true],
  ['Club Horizonte Sur','Alberite',42.405,-2.439,['Fútbol','Tenis','Pádel'],['Cadete','Juvenil','Sénior'],'#246c3d','HS',false],
  ['Unión Viñedos','Navarrete',42.430,-2.565,['Baloncesto','Fútbol'],['Infantil','Cadete','Sénior'],'#a82047','UV',true],
  ['Club Río Claro','Albelda de Iregua',42.358,-2.472,['Atletismo','Natación'],['Alevín','Infantil','Sénior'],'#176eac','RC',false],
  ['Deportivo Mirador','Nájera',42.418,-2.735,['Baloncesto','Voleibol'],['Cadete','Juvenil'],'#805126','DM',true],
  ['Club Arga Norte','Pamplona',42.820,-1.651,['Baloncesto','Balonmano'],['Alevín','Infantil','Cadete'],'#aa2a38','AN',true],
  ['Deportivo Robledal','Burlada',42.826,-1.614,['Fútbol','Pádel'],['Infantil','Juvenil','Sénior'],'#267c62','DR',true],
  ['Club Estrella Oeste','Barañáin',42.804,-1.682,['Voleibol','Tenis'],['Cadete','Sénior'],'#5e48a5','EO',false],
  ['Club Llanada Azul','Vitoria-Gasteiz',42.850,-2.673,['Baloncesto','Atletismo'],['Alevín','Cadete','Juvenil'],'#226ab0','LA',true]
 ];
 const clubs=seeds.map((s,i)=>({id:'example-'+i,name:s[0],town:s[1],lat:s[2],lng:s[3],sports:s[4],categories:s[5],color:s[6],mark:s[7],friendly:s[8],demo:true}));
 const radians=v=>v*Math.PI/180;
 function distance(a,b){const p=radians(b.lat-a.lat),l=radians(b.lng-a.lng);const h=Math.sin(p/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(l/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)))}
 function filter(items,center,options={}){return items.map(c=>({...c,distance:distance(center,c)})).filter(c=>c.distance<=Number(options.radius||10)&&(!options.sport||c.sports.includes(options.sport))&&(!options.category||c.categories.includes(options.category))&&(!options.friendly||c.friendly)).sort((a,b)=>a.distance-b.distance)}
 function circle(center,km){const points=[];const angular=km/6371,lat=radians(center.lat),lng=radians(center.lng);for(let i=0;i<=96;i++){const bearing=i/96*Math.PI*2;const p=Math.asin(Math.sin(lat)*Math.cos(angular)+Math.cos(lat)*Math.sin(angular)*Math.cos(bearing));const l=lng+Math.atan2(Math.sin(bearing)*Math.sin(angular)*Math.cos(lat),Math.cos(angular)-Math.sin(lat)*Math.sin(p));points.push([l*180/Math.PI,p*180/Math.PI])}return {type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[points]}}}
 const api={towns,sports,categories,clubs,distance,filter,circle};if(typeof module==='object'&&module.exports)module.exports=api;else root.GGClubNetwork=api;
})(typeof window==='undefined'?this:window);
