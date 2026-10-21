const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function app(){const ctx={data:{club:'Multideporte',sports:['Baloncesto','Fútbol']}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../assets/sport-context.js'),'utf8'),ctx);return ctx;}
test('sport context includes shared resources and restores all sports',()=>{
 const a=app();a.ggSelectSportContext('Baloncesto');
 assert.equal(a.ggMatchesSportScope(['Baloncesto']),true);
 assert.equal(a.ggMatchesSportScope(['Fútbol']),false);
 assert.equal(a.ggMatchesSportScope(['Baloncesto','Fútbol']),true);
 a.ggSelectSportContext('all');assert.equal(a.ggMatchesSportScope(['Fútbol']),true);
});
test('clubs do not inherit each other’s selection and stale sports are cleared',()=>{
 const a=app();a.ggSelectSportContext('Fútbol');a.data={club:'Otro club',sports:['Baloncesto','Tenis']};
 assert.equal(a.ggCurrentSport(),'all');a.ggSelectSportContext('Tenis');
 a.data={club:'Multideporte',sports:['Baloncesto','Fútbol']};assert.equal(a.ggCurrentSport(),'Fútbol');
 a.data.sports=['Baloncesto','Pádel'];assert.equal(a.ggCurrentSport(),'all');
});
test('single-sport clubs always retain their sole sport',()=>{
 const a=app();a.data.sports=['Baloncesto'];a.ggSelectSportContext('all');
 assert.equal(a.ggCurrentSport(),'Baloncesto');assert.equal(a.ggMatchesSportScope(['Fútbol']),false);
});
