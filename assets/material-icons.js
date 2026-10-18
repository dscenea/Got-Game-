(function(root){
 'use strict';
 const catalog={
  box:['Material genérico','<path d="m4 10 12-6 12 6v15l-12 5-12-5zM4 10l12 6 12-6M16 16v14M10 7l12 6v6"/>'],
  basketball:['Balón de baloncesto','<circle cx="16" cy="16" r="12"/><path d="M4 16h24M16 4v24M8 7c12 5 12 13 0 18M24 7c-12 5-12 13 0 18"/>'],
  football:['Balón de fútbol','<circle cx="16" cy="16" r="12"/><path d="m16 10 6 4-2 7h-8l-2-7zM16 4v6M4 12l6 2M22 14l6-2M12 21l-4 4M20 21l4 4"/>'],
  volleyball:['Balón de voleibol','<circle cx="16" cy="16" r="12"/><path d="M16 4c-5 6-6 13-3 23M5 12c8-1 15 3 20 11M23 6c-1 8-6 14-16 17M11 7c6 1 11 4 16 9"/>'],
  bib:['Peto','<path d="M11 4h10c0 5 2 8 6 9v15H5V13c4-1 6-4 6-9zM11 4c0 8 10 8 10 0M12 17h8M12 22h8"/>'],
  hoop:['Aro','<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="9"/>'],
  pole:['Pica','<path d="m9 26 13-22a2 2 0 0 1 3 2L12 28a2 2 0 0 1-3-2zM17 14l3 2M14 19l3 2"/>'],
  coneSmall:['Cono pequeño','<path d="m11 25 4-13h2l4 13M8 25h16v3H8zM13 20h6"/>'],
  coneLarge:['Cono grande','<path d="m8 26 7-22h2l7 22M5 26h22v3H5zM12 14h8M10 20h12"/>'],
  discCone:['Cono chino / disco','<path d="M4 24c5-1 8-5 10-10h4c2 5 5 9 10 10M4 24c0 5 24 5 24 0M4 24c3-4 21-4 24 0"/><ellipse cx="16" cy="14" rx="2" ry="1.5"/>'],
  ladder:['Escalera de coordinación','<path d="M10 3 4 29M22 3l6 26M9 8h14M8 14h16M6 20h20M5 26h22"/>'],
  whistle:['Silbato','<path d="M5 15h10l5-6h7v10h-6a8 8 0 1 1-16-4z"/><circle cx="12" cy="21" r="3"/><path d="M5 15V9h5M23 5V2M29 8l2-2"/>']
 };
 function resolve(item){if(catalog[item?.icon])return item.icon;const name=String(item?.name||'').toLocaleLowerCase('es');return /baloncesto|basket/.test(name)?'basketball':/fútbol|futbol/.test(name)?'football':/voleibol/.test(name)?'volleyball':/peto/.test(name)?'bib':/chino|disco/.test(name)?'discCone':/cono.*peque/.test(name)?'coneSmall':/cono/.test(name)?'coneLarge':/aro/.test(name)?'hoop':/pica/.test(name)?'pole':/escalera/.test(name)?'ladder':'box';}
 const svg=key=>'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(catalog[key]||catalog.box)[1]+'</svg>';
 root.GGMaterialIcons={catalog,resolve,svg};if(typeof module!=='undefined')module.exports=root.GGMaterialIcons;
})(typeof window!=='undefined'?window:globalThis);
