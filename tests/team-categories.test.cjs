const {test}=require('node:test'),assert=require('node:assert/strict');require('../assets/club-selectors.js');require('../assets/tactical-board.js');
const C=GGClubSelectors;
test('minibasket is a modality within basketball, inferred from youth categories only',()=>{
 for(const name of ['Alevín A','ALEVINES','Benjamín femenino','Prebenjamín','Pre-benjamín A','Minibasket azul']){const t={sport:'Baloncesto',name};assert.equal(C.basketballFormat(t),'mini');assert.equal(C.teamSportLabel(t),'Baloncesto · Minibasket');assert.equal(t.sport,'Baloncesto');}
 for(const name of ['Infantil','Cadete A','Junior','Senior'])assert.equal(C.basketballFormat({sport:'Baloncesto',name}),'standard');for(const sport of ['Fútbol','Voleibol','Tenis']){assert.equal(C.basketballFormat({sport,name:'Alevín',basketFormat:'mini'}),null);assert.equal(C.teamSportLabel({sport,name:'Alevín'}),sport);}
});
test('explicit club modality overrides the name and is shared with new session board defaults',()=>{
 const a={sport:'Baloncesto',name:'Escuela azul',basketFormat:'mini'},b={sport:'Baloncesto',name:'Alevín A',basketFormat:'standard'};for(const t of [a,b]){assert.equal(GGTacticalBoard.defaults(t.sport,{teamName:t.name,basketFormat:t.basketFormat}).court,C.basketballFormat(t));}assert.equal(C.basketballFormat({...a,basketFormat:'auto'}),'standard');assert.equal(C.basketballFormat({...b,basketFormat:'auto'}),'mini');
});
