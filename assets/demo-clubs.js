/* Shared demo fixtures; no account or permission is created by these records. */
(function(root){
 'use strict';
 root.ggDemoClubData=function(key){
  if(key==='logrobasket')return {club:'Logrobasket',sports:['Baloncesto'],clubPalette:['#a20f16','#ffffff','#171717'],roleColors:{coord:'#a20f16',coach:'#a20f16'},facilities:[{name:'Polideportivo Lobete',sports:['Baloncesto'],spaces:[]}]};
  if(key==='ebro')return {club:'Club Deportivo Ebro Norte',sports:['Baloncesto','Fútbol','Voleibol'],clubPalette:['#202354','#20c6b1'],roleColors:{coord:'#202354',coach:'#202354'},facilities:[{name:'Polideportivo Norte',sports:['Baloncesto'],spaces:[]},{name:'Campos de La Ribera',sports:['Fútbol'],spaces:[]},{name:'Pabellón de Vóley Norte',sports:['Voleibol'],spaces:[]}]};
  throw Error('Club de prueba no disponible.');
 };
})(typeof window!=='undefined'?window:globalThis);
