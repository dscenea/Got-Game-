/* got GAME! — Pure shared selectors for teams, facilities and schedules. */
(function(root){
 'use strict';
 const same=(a,b)=>String(a??'')===String(b??'');
 const byId=(rows,id)=>(rows||[]).find(row=>same(row.id,id))||null;
 const byName=(rows,name)=>(rows||[]).find(row=>row.name===name)||null;
 function teamForEvent(event,teams){return byId(teams,event?.team);}
 function facilityForEvent(event,facilities){return byName(facilities,event?.place);}
 function spaceForEvent(event,facilities){const facility=facilityForEvent(event,facilities);return byId(facility?.spaces,event?.spaceId);}
 function decorateEvent(event,teams,facilities){const team=teamForEvent(event,teams),facility=facilityForEvent(event,facilities),space=spaceForEvent(event,facilities);return {...event,sport:team?.sport||'all',teamName:team?.name||String(event.team||''),facilityName:facility?.name||event.place||'',spaceName:space?.name||event.spaceName||''};}
 function forSport(teams,sport){return sport==='all'||!sport?[...(teams||[])]: (teams||[]).filter(t=>t.sport===sport);}
 function forFacility(events,name){return (events||[]).filter(e=>e.place===name);}
 root.GGClubSelectors={teamForEvent,facilityForEvent,spaceForEvent,decorateEvent,forSport,forFacility};
})(typeof window!=='undefined'?window:globalThis);
