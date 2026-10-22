/* Run in browser console after app loads: GGArchitectureTests.run() */
(function(root){'use strict';
function run(){
 const results=[];const check=(name,condition)=>{results.push({name,passed:!!condition});if(!condition)throw Error('FAILED: '+name)};
 const storage=()=>{const state=new Map();return {getItem:key=>state.get(key)||null,setItem:(key,value)=>state.set(key,value)}};
 const club='test-club';const teamStore=root.GGTeamStore.createRepository(storage());
 const teams=teamStore.list(club,['Baloncesto','Fútbol'],{demo:true});
 check('Two sports remain separate',teams.length===4&&root.GGClubSelectors.forSport(teams,'Fútbol').every(t=>t.sport==='Fútbol'));
 const scheduleStore=root.GGScheduleStore.createRepository(storage());
 const sample={team:teams[0].id,place:'Lobete',spaceId:'p1',date:'2026-10-26',hour:18,duration:1,recurring:true,until:'2026-12-31',type:'training'};
 scheduleStore.save(club,sample);const event=scheduleStore.records(club)[0];
 const facilities=[{name:'Lobete',spaces:[{id:'p1',name:'Pista 1'}]}];
 const mapped=root.GGClubSelectors.decorateEvent(event,teams,facilities);
 check('Calendar resolves team sport',mapped.sport==='Baloncesto');
 check('Facility resolves assigned court',mapped.spaceName==='Pista 1');
 check('Facility displays same schedule',root.GGClubSelectors.forFacility(scheduleStore.records(club),'Lobete').length===1);
 check('Conflicts on same court',root.GGScheduleStore.conflicts([event],{...sample,id:'another',team:teams[1].id,hour:18.5}).length===1);
 check('No conflict on different court',root.GGScheduleStore.conflicts([event],{...sample,id:'other',team:teams[1].id,spaceId:'p2',hour:18.5}).length===0);
 check('Editor is modular',typeof root.GGScheduleEditor?.install==='function');
 return {passed:results.length,results};
}
root.GGArchitectureTests={run};
})(typeof window!=='undefined'?window:globalThis);
