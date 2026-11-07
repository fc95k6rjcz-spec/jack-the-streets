/* Walkable specialty garages, saved equipment progression and mechanic services. */
const GARAGE_SPECIALTIES=[
 {id:'performance',name:'RAY’S PERFORMANCE',colour:'#dc8b43',bays:[{id:'eng',name:'ENGINE BENCH',x:.57,y:.3},{id:'tur',name:'TURBO BENCH',x:.82,y:.3}]},
 {id:'chassis',name:'COASTAL CHASSIS',colour:'#65b5b0',bays:[{id:'tyr',name:'TYRE RACK',x:.57,y:.3},{id:'arm',name:'ARMOUR BAY',x:.82,y:.3}]},
 {id:'security',name:'SPARK & SHIELD',colour:'#9ba6d0',bays:[{id:'security',name:'SECURITY BENCH',x:.68,y:.3}]}
];
const GARAGE_EQUIPMENT_COST=[0,1000,4000],GARAGE_HIRE_COST=1500;
function garageKey(sh){return CITY+':'+sh.id;}
function garageProfile(sh){const list=SHOPS.filter(s=>s.type==='repair'),index=Math.max(0,list.findIndex(s=>s.id===sh.id));return GARAGE_SPECIALTIES[index%GARAGE_SPECIALTIES.length];}
function garageProgress(h,sh){const w=save[h.player];w.workshops=w.workshops||{};const key=garageKey(sh);return w.workshops[key]||(w.workshops[key]={level:1,mechanic:false,job:null});}
function garageStations(sh){return[{id:'service',name:'SERVICE LIFT',x:.25,y:.48},...garageProfile(sh).bays,{id:'office',name:'WORKSHOP OFFICE',x:.81,y:.7},{id:'exit',name:'EXIT',x:.5,y:.92}];}
function garageStation(h){const I=h.inside;if(I?.sh.type!=='repair')return null;return garageStations(I.sh).find(s=>Math.hypot((I.px??.5)-s.x,(I.py??.84)-s.y)<.13)||null;}
function garageFeedback(h,message){h.shopMsg=message;h.shopMsgT=4;return{ok:false,note:message};}
function garageEquipment(h,sh,action){
 if(h.inside?.sh!==sh||garageStation(h)?.id!=='office')return garageFeedback(h,'Walk to the workshop office first.');
 const state=garageProgress(h,sh);if(state.job)return garageFeedback(h,'Finish the current service before changing the workshop.');
 if(action==='hire'){
  if(state.level<2)return garageFeedback(h,'Upgrade to workshop level 2 before hiring a mechanic.');
  if(state.mechanic)return garageFeedback(h,'Maya is already on your team.');
  if(!spend(h,GARAGE_HIRE_COST))return garageFeedback(h,'Not enough in-game money to hire Maya.');
  state.mechanic=true;persist();return{ok:true,note:'Maya hired. Faster service and lower labour charges.'};
 }
 if(action!=='upgrade'||state.level>=3)return garageFeedback(h,'This workshop is fully equipped.');
 const cost=GARAGE_EQUIPMENT_COST[state.level];if(!spend(h,cost))return garageFeedback(h,'Not enough in-game money for new equipment.');
 state.level++;persist();return{ok:true,note:'Workshop level '+state.level+' · '+(state.level===2?'Lift and diagnostics fitted. Mechanic hiring unlocked.':'Specialist tools fitted. Full upgrade levels unlocked.')};
}
function garageVehicle(h){const I=h.inside,t=I?.bayVehicle;return I?.sh.type==='repair'&&t&&traffic.includes(t)&&t.veh?.owner===h?t:null;}
function garageAllowed(sh,kind){return kind==='repair'||kind==='plates'||garageProfile(sh).bays.some(s=>s.id===kind);}
function garageQuote(h,sh,kind){
 const t=garageVehicle(h);if(!t)return{ok:false,note:'Park your car on this garage’s forecourt and walk inside.'};
 const state=garageProgress(h,sh),v=t.veh,w=save[h.player];if(!garageAllowed(sh,kind))return{ok:false,note:'This job needs a different specialty garage.'};
 if(state.job)return{ok:false,note:'This workshop already has a car in service.'};
 if(kind==='repair'){
  if(v.dmg<=0&&!v.tyres)return{ok:false,note:'This car does not need repairs.'};
  return{ok:true,cost:serviceRepairCost(v.dmg,v.def)+(v.tyres?60:0)+(state.mechanic?20:60),seconds:state.mechanic?4:9};
 }
 if(kind==='plates')return v.hot?{ok:true,cost:250+(state.mechanic?20:60),seconds:state.mechanic?4:9}:{ok:false,note:'These plates are already clean.'};
 if(v.hot)return{ok:false,note:'Replace the stolen car’s plates at the service lift first.'};
 if(v.def.premium)return{ok:false,store:true,note:'Premium upgrades use the App Store catalogue for this car.'};
 const up=upOf(w,v.def.id),level=kind==='security'?securityLevel(h,v.def.id):(up[kind]||0),max=kind==='security'?3:UPS.find(u=>u.k===kind)?.max;
 if(level>=max)return{ok:false,note:'This upgrade is already at maximum.'};
 const capacity=state.level===1?1:state.level===2?3:5;if(level>=Math.min(max,capacity))return{ok:false,note:'Upgrade this workshop’s equipment to fit the next level.'};
 const cost=kind==='security'?[450,900,1800][level]:UPS.find(u=>u.k===kind).cost[level];return{ok:true,cost:cost+(state.mechanic?20:60),seconds:state.mechanic?4:9,level:level+1};
}
function queueGarageWork(h,sh,kind,now=Date.now()){
 const station=garageStation(h);if(!station||!((kind==='repair'||kind==='plates')?station.id==='service':station.id===kind))return garageFeedback(h,'Walk to the correct work station first.');
 const quote=garageQuote(h,sh,kind);if(!quote.ok)return garageFeedback(h,quote.note);
 const t=garageVehicle(h),v=t.veh;if(!spend(h,quote.cost))return garageFeedback(h,'Not enough in-game money for this job.');
 const state=garageProgress(h,sh);state.job={kind,carId:v.def.id,level:quote.level||0,paid:quote.cost,readyAt:now+quote.seconds*1000,status:'working',vehicle:{look:{...v.look},dmg:v.dmg,tyres:v.tyres||0,hot:!!v.hot,home:!!v.home,fuel:v.fuel??50}};
 v.workshopJob=garageKey(sh);persist();return{ok:true,note:(state.mechanic?'Maya is on it. ':'Tools ready. ')+'Service takes '+quote.seconds+' seconds. Collect the car at the lift.'};
}
function updateGarageJobs(now=Date.now()){
 for(const p of ['p1','p2'])for(const state of Object.values(save[p]?.workshops||{}))if(state.job?.status==='working'&&now>=state.job.readyAt){state.job.status='ready';persist();}
}
function collectGarageWork(h,sh,now=Date.now()){
 if(h.inside?.sh!==sh||garageStation(h)?.id!=='service')return garageFeedback(h,'Collect your car from the service lift.');
 updateGarageJobs(now);const state=garageProgress(h,sh),job=state.job;if(!job)return garageFeedback(h,'There is no service waiting to collect.');
 if(job.status!=='ready')return garageFeedback(h,'Still working · '+Math.max(1,Math.ceil((job.readyAt-now)/1000))+' seconds remaining.');
 const w=save[h.player],up=upOf(w,job.carId);w.dmg=w.dmg||{};w.security=w.security||{};
 if(job.kind==='repair')w.dmg[job.carId]=0;
 else if(job.kind==='security')w.security[job.carId]=Math.max(w.security[job.carId]||0,job.level);
 else if(job.kind==='plates'){w.recovered=w.recovered||{};w.recovered[job.carId]=true;if(!w.owned.includes(job.carId))w.owned.push(job.carId);}
 else up[job.kind]=Math.max(up[job.kind]||0,job.level);
 for(const t of traffic.filter(t=>t.veh?.owner===h&&t.def.id===job.carId)){const v=t.veh;if(job.kind==='repair'){v.dmg=0;v.tyres=0;}if(job.kind==='plates'){v.hot=false;v.stolenOrigin=true;}v.up={...up};v.st=effStats(v.def,v.up,v.look?.wheel||'std');v.bl=bling(v.up);delete v.workshopJob;t.security=w.security[job.carId]||0;t.locked=t.security>0||!!t.def.premium;}
 if(h.homeVeh?.def.id===job.carId){const v=h.homeVeh;if(job.kind==='repair'){v.dmg=0;v.tyres=0;}v.up={...up};v.st=effStats(v.def,v.up,v.look?.wheel||'std');v.bl=bling(v.up);}
 state.job=null;persist();refreshBank();h.shopMsg='SERVICE COMPLETE · '+CAT[job.carId].n;h.shopMsgT=4;return{ok:true,note:h.shopMsg};
}
function restoreGarageCar(h,sh,job){
 const d=CAT[job.carId];if(!d)return null;const saved=job.vehicle,up={...upOf(save[h.player],d.id)},look={paint:null,wheel:'std',...saved.look},v={...saved,def:d,up,look,st:effStats(d,up,look.wheel),r:clamp(d.L*K*.4,20,40),m:d.s[3],color:look.paint||d.col,bl:bling(up),owner:h,workshopJob:garageKey(sh)};
 const t={civ:true,state:'parked',def:d,veh:v,r:v.r,m:v.m,x:sh.x,y:sh.y,a:0,da:0,dx:sh.x,dy:sh.y,vx:0,vy:0,speed:0,spin:0,lt:0,hitT:0,axis:'h',dir:1,lane:sh.y,locked:true};traffic.push(t);return t;
}
function workshopComic(h,name,done=()=>{}){const w=save[h.player];w.workshopComics=w.workshopComics||{};w.workshopComics[name]=true;persist();showComic(name,done);}
function enterSpecialtyGarage(h,sh){
 if(!h||sh?.type!=='repair'||h.jail||h.cuff||h.inside||COMIC)return false;
 if(h.wanted>0&&pursuitWitness(h)){garageFeedback(h,'Lose the police before visiting a workshop.');return false;}
 if(!h.foot){if(Math.hypot(h.vx,h.vy)>40){garageFeedback(h,'Stop on the forecourt before entering.');return false;}toggleFoot(h);if(!h.foot)return false;}
 const state=garageProgress(h,sh),near=traffic.filter(t=>t.veh?.owner===h&&Math.hypot(t.x-sh.x,t.y-sh.y)<550).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y));
 let car=state.job?near.find(t=>t.def.id===state.job.carId):near[0];if(state.job&&!car)car=restoreGarageCar(h,sh,state.job);if(state.job&&car)car.veh.workshopJob=garageKey(sh);
 h.inside={sh,t:0,robT:0,done:false,px:.5,py:.84,a:-Math.PI/2,bayVehicle:car||null,policeKnew:false};h.vx=h.vy=0;h.doorLockUntil=simT+2;
 if(!save[h.player].workshopComics?.workshopOpening)workshopComic(h,'workshopOpening');return true;
}
function openGarageDirectory(h){return cityModal('SPECIALTY WORK GARAGES',({note,option,close})=>{note.textContent='Park at a garage, walk inside, then use the bench for that specialty. Equipment and hiring use in-game money.';for(const sh of SHOPS.filter(s=>s.type==='repair')){const profile=garageProfile(sh),state=garageProgress(h,sh);option(profile.name+' · LEVEL '+state.level,profile.bays.map(b=>b.name).join(' · '),()=>{close();h.gps={type:'specialtyGarage',garageId:sh.id,n:profile.name,ic:'🔧',t:0};h.phone='map';});}});}
function openGarageOffice(h){const sh=h.inside.sh;return cityModal('WORKSHOP OFFICE',({note,option,close})=>{
 const state=garageProgress(h,sh),report=()=>{note.textContent=garageProfile(sh).name+' · LEVEL '+state.level+'/3 · '+(state.mechanic?'MAYA HIRED':'SELF SERVICE')+' · BANK '+money(save[h.player].cash)+' (in-game money)';};report();
 if(state.level<3)option('UPGRADE EQUIPMENT · '+money(GARAGE_EQUIPMENT_COST[state.level]),state.level===1?'Level 2: lift, diagnostics, upgrade levels 1–3 and mechanic hiring.':'Level 3: specialist tools and all upgrade levels.',()=>{const r=garageEquipment(h,sh,'upgrade');if(r.ok){close();workshopComic(h,'workshopExpansion');}else{report();note.textContent+=' · '+r.note;}},!!state.job);
 option(state.mechanic?'MAYA · YOUR MECHANIC':'HIRE MAYA · '+money(GARAGE_HIRE_COST),state.mechanic?'Faster service: 4 seconds. Labour: $20 per job.':'Requires workshop level 2. One-time hiring fee; $20 labour per job.',()=>{const r=garageEquipment(h,sh,'hire');if(r.ok){close();workshopComic(h,'workshopMechanic');}else{report();note.textContent+=' · '+r.note;}},state.mechanic||state.level<2||!!state.job);
 option('READ THE GARAGE COMIC','How Jack builds his workshop and hires Maya',()=>{close();workshopComic(h,'workshopOpening');});
 });}
function garageAction(h,id){
 if(h.inside?.sh.type!=='repair'||garageStation(h)?.id!==id)return garageFeedback(h,'Walk to that station first.');
 const sh=h.inside.sh;if(id==='exit'){leaveShop(h);return;}if(id==='office')return openGarageOffice(h);
 return cityModal(id==='service'?'SERVICE LIFT':garageStations(sh).find(s=>s.id===id).name,({note,option,close})=>{
  const state=garageProgress(h,sh),t=garageVehicle(h);note.textContent=t?t.def.n+' · BANK '+money(save[h.player].cash)+' (in-game money)':'Park your car on this garage’s forecourt before walking in.';
  if(id==='service'&&state.job){updateGarageJobs();option(state.job.status==='ready'?'COLLECT FINISHED CAR':'SERVICE IN PROGRESS',state.job.status==='ready'?'Your paid job is ready. No additional charge.':Math.max(1,Math.ceil((state.job.readyAt-Date.now())/1000))+' seconds remaining',()=>{const r=collectGarageWork(h,sh);note.textContent=r.note;if(r.ok)close();});return;}
  const kinds=id==='service'?['repair','plates']:[id];for(const kind of kinds){const quote=garageQuote(h,sh,kind);if(quote.store&&t){option('PREMIUM '+(APPLE_UPGRADES[kind==='eng'||kind==='tur'?'engine':kind==='security'?'security':'tyresarmour']?.name||'UPGRADE'),'View the App Store upgrades for this car',()=>{close();openPremiumShowroom(h,t.def.id);});continue;}
   const label=kind==='repair'?'REPAIR DAMAGE & TYRES':kind==='plates'?'REPLACE STOLEN PLATES':kind==='security'?'INSTALL SECURITY':UPS.find(u=>u.k===kind).n+(quote.level?' LEVEL '+quote.level:'');
   option(label+(quote.ok?' · '+money(quote.cost):''),quote.ok?(state.mechanic?'Maya fits it in ':'Self-service fitting: ')+quote.seconds+' seconds.':quote.note,()=>{const r=queueGarageWork(h,sh,kind);note.textContent=r.note;if(r.ok)close();},!quote.ok);
  }
 });
}

/* Workshop integration */
function updateGarageInterior(h,dt){const I=h.inside;I.t+=dt;updateGarageJobs();let mx=Number(held(h.keyset,'right'))-Number(held(h.keyset,'left')),my=Number(held(h.keyset,'down'))-Number(held(h.keyset,'up'));const stick=stickFor(h);if(stick){mx=stick.x;my=stick.y;}if(Math.hypot(mx,my)>.1)I.walkTo=null;
 if(I.walkTo){mx=I.walkTo.x-I.px;my=I.walkTo.y-I.py;if(Math.hypot(mx,my)<.025){const id=I.walkTo.id;I.walkTo=null;mx=my=0;if(id){I.station=garageStation(h);garageAction(h,id);}}}
 const length=Math.hypot(mx,my)||1;I.walking=Math.hypot(mx,my)>.01;if(I.walking){I.a=Math.atan2(my,mx);I.phase=(I.phase||0)+dt*8;I.px=clamp(I.px+mx/length*dt*.3,.07,.94);I.py=clamp(I.py+my/length*dt*.3,.2,.96);}I.station=garageStation(h);
 const state=garageProgress(h,I.sh);if(state.mechanic){const target=state.job?{x:.35,y:.49}:{x:.65,y:.54};I.mechanic=I.mechanic||{x:.85,y:.65};const dx=target.x-I.mechanic.x,dy=target.y-I.mechanic.y;I.mechanic.a=Math.atan2(dy,dx);I.mechanic.x+=dx*Math.min(1,dt*1.2);I.mechanic.y+=dy*Math.min(1,dt*1.2);}
 if(tapped(h.keyset,'exit')||(I.py>.94&&Math.abs(I.px-.5)<.12&&my>0)){leaveShop(h);return;}
 if(tapped(h.keyset,'fire')){const intruder=cops.some(c=>(c.offs||[]).some(o=>o.room===I.sh.id&&o.down<=0));if(intruder)fightOfficer(h);else if(I.station)garageAction(h,I.station.id);}h.shopMsgT=Math.max(0,(h.shopMsgT||0)-dt);
}
function drawGarageInterior(vp,h,time,u){const I=h.inside,sh=I.sh,profile=garageProfile(sh),state=garageProgress(h,sh),w=vp.w,H0=vp.h,header=48,footer=60,scale=Math.min((w-20)/1600,(H0-header-footer-10)/940),rw=1600*scale,rh=940*scale,ox=vp.x+(w-rw)/2,oy=header+5+(H0-header-footer-10-rh)/2;I.screen={ox,oy,rw,rh};
 ctx.save();ctx.fillStyle='#142731';ctx.fillRect(vp.x,0,w,H0);ctx.fillStyle='#75807e';ctx.fillRect(ox,oy,rw,rh);ctx.strokeStyle='#9ca69c';ctx.lineWidth=1;for(let y=oy;y<oy+rh;y+=rh/10){ctx.beginPath();ctx.moveTo(ox,y);ctx.lineTo(ox+rw,y);ctx.stroke();}for(let x=ox;x<ox+rw;x+=rw/14){ctx.beginPath();ctx.moveTo(x,oy);ctx.lineTo(x,oy+rh);ctx.stroke();}
 const box=(x,y,bw,bh,col)=>{ctx.fillStyle=col;ctx.fillRect(ox+x*rw,oy+y*rh,bw*rw,bh*rh);ctx.strokeStyle='#253b43';ctx.lineWidth=2;ctx.strokeRect(ox+x*rw,oy+y*rh,bw*rw,bh*rh);};
 box(.1,.25,.3,.47,'#455c61');for(const x of [.14,.35])box(x,.28,.025,.39,profile.colour);ctx.strokeStyle='#e2ca7c';ctx.setLineDash([10,8]);ctx.strokeRect(ox+.09*rw,oy+.22*rh,rw*.33,rh*.53);ctx.setLineDash([]);
 for(const b of profile.bays){box(b.x-.085,b.y-.07,.17,.12,'#344952');for(let k=0;k<4;k++)box(b.x-.07+k*.035,b.y-.05,.02,.06,['#d4bb65','#ad6c49','#87adb0','#cecec0'][k]);}
 if(state.level>=2){box(.48,.11,.12,.1,'#294651');box(.5,.12,.08,.055,'#77b4bb');}if(state.level>=3){box(.73,.1,.18,.09,'#596668');for(let k=0;k<4;k++){ctx.fillStyle='#283b40';ctx.beginPath();ctx.arc(ox+(.75+k*.047)*rw,oy+.145*rh,rh*.03,0,7);ctx.fill();}}
 box(.7,.63,.23,.12,'#866d50');box(.8,.64,.08,.06,'#24424d');box(.43,.91,.14,.09,'#31594d');
 const car=garageVehicle(h);if(car){const sprite=carSprite(car.def,'#fff',car.veh.bl,car.veh.look),s=Math.min(rw*.28/sprite.bh,rh*.38/sprite.bw);ctx.save();ctx.translate(ox+.25*rw,oy+.49*rh);ctx.rotate(-Math.PI/2);ctx.drawImage(sprite,-sprite.bw*s/2,-sprite.bh*s/2,sprite.bw*s,sprite.bh*s);ctx.restore();}
 if(state.mechanic){const m=I.mechanic||{x:.65,y:.54,a:Math.PI};ctx.save();ctx.translate(ox+m.x*rw,oy+m.y*rh);ctx.scale(1.1,1.1);drawPed({x:0,y:0,a:m.a,skin:SKIN[2],hair:HAIR[0],shirt:'#4f858a',ph:state.job?time*.008:0,down:0,run:0},time);ctx.restore();ctx.fillStyle='#e7edcc';ctx.textAlign='center';ctx.font='700 11px sans-serif';ctx.fillText('MAYA',ox+m.x*rw,oy+m.y*rh-22);}
 for(const s of garageStations(sh)){const x=ox+s.x*rw,y=oy+s.y*rh,active=I.station?.id===s.id,label=s.id==='exit'?'EXIT':s.name;ctx.fillStyle=active?'#efd076':'#142d38';ctx.strokeStyle=active?'#f6e5b1':'#a9c0bc';ctx.lineWidth=2;const width=s.id==='office'?142:126;ctx.beginPath();ctx.roundRect(x-width/2,y-20,width,40,5);ctx.fill();ctx.stroke();ctx.fillStyle=active?'#1b3540':'#eff0d5';ctx.font='800 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y,width-10);}
 ctx.save();ctx.translate(ox+I.px*rw,oy+I.py*rh);ctx.scale(1.3,1.3);drawPed({isJack:true,appearance:save[h.player]?.appearance||'redline',moving:I.walking,walkFrame:I.walking?[1,2,3,2][Math.floor(I.phase||0)%4]:0,x:0,y:0,a:I.a??-Math.PI/2,skin:SKIN[0],hair:HAIR[0],shirt:'#b44b36',ph:time*.005,down:0},time);ctx.restore();
 ctx.fillStyle='#e9d88e';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='800 15px sans-serif';ctx.fillText(profile.name,vp.x+12,17,w-24);ctx.fillStyle='#c3d4cb';ctx.font='700 11px sans-serif';ctx.fillText('LEVEL '+state.level+'/3 · '+(state.mechanic?'MECHANIC: MAYA':'SELF SERVICE')+' · BANK '+money(save[h.player].cash),vp.x+12,35,w-24);
 ctx.textAlign='center';ctx.fillStyle='#f5e8bd';ctx.font='700 12px sans-serif';const status=state.job?(state.job.status==='ready'?'CAR READY · COLLECT AT THE SERVICE LIFT':'FITTING '+CAT[state.job.carId].n+' · '+Math.max(1,Math.ceil((state.job.readyAt-Date.now())/1000))+'s'):I.station?'FIRE / E · '+I.station.name:'WALK TO A STATION · TAP A STATION TO WALK THERE';ctx.fillText(status,vp.x+w/2,H0-42,w-20);ctx.fillStyle='#c1d5d0';ctx.font='700 11px sans-serif';ctx.fillText(h.shopMsgT>0?h.shopMsg:keyNames(h).exit+' = LEAVE GARAGE',vp.x+w/2,H0-22,w-20);ctx.restore();
}
const updateInsideBeforeGarages=updateInside;
updateInside=function(h,dt){if(h.inside?.sh.type==='repair')return updateGarageInterior(h,dt);return updateInsideBeforeGarages(h,dt);};
const drawInteriorBeforeGarages=drawInterior;
drawInterior=function(vp,h,time,u){if(h.inside?.sh.type==='repair')return drawGarageInterior(vp,h,time,u);return drawInteriorBeforeGarages(vp,h,time,u);};
const autoDoorBeforeGarages=autoShopDoor;
autoShopDoor=function(h){if(h.foot&&!h.inside&&!h.jail&&!h.cuff&&!(h.doorLockUntil>simT)){const sh=SHOPS.find(s=>s.type==='repair'&&Math.hypot(h.x-shopDoor(s).x,h.y-shopDoor(s).y)<38);if(sh){enterSpecialtyGarage(h,sh);return;}}autoDoorBeforeGarages(h);};
const updateShopsBeforeGarages=updateShops;
updateShops=function(h,dt){const sh=onShop(h);if(sh?.type==='repair'){h.atShop=sh;return;}updateShopsBeforeGarages(h,dt);};
openWarehouse=function(h){if(isBrokenGarage(h.inside?.sh))return openGarageProject(h);if(h.inside?.sh.type==='repair'){const station=garageStation(h);if(station)return garageAction(h,station.id);return garageFeedback(h,'Walk to a workshop station.');}if(h.inside?.sh.type==='ware')return openGarageDirectory(h);const sh=onShop(h);if(sh?.type==='repair')return enterSpecialtyGarage(h,sh);return openGarageDirectory(h);};
const safehouseBeforeGarages=safehouseAction;
safehouseAction=function(h,id){if(id==='work'&&isBrokenGarage(h.inside?.sh))return openGarageProject(h);if(id==='work')return openGarageDirectory(h);return safehouseBeforeGarages(h,id);};
Object.assign(SAFEHOUSE_STATIONS.find(s=>s.id==='work'),{n:'SPECIALTY GARAGES',hint:'Find the right workshop'});
const gpsBeforeGarages=gpsPoint;
gpsPoint=function(h,type){if(type==='specialtyGarage'){const sh=SHOPS.find(s=>s.id===h.gps?.garageId&&s.type==='repair');return sh?{x:sh.x,y:sh.y}:null;}return gpsBeforeGarages(h,type);};
const detailsBeforeGarages=drawCityDetails;
drawCityDetails=function(vp,time){detailsBeforeGarages(vp,time);const h=vp.car;for(const sh of SHOPS.filter(s=>s.type==='repair')){if(Math.hypot(sh.x-h.x,sh.y-h.y)>900)continue;const profile=garageProfile(sh);ctx.save();ctx.fillStyle='#122d38';ctx.strokeStyle=profile.colour;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(sh.x-130,sh.y+sh.h/2+45,260,42,6);ctx.fill();ctx.stroke();ctx.fillStyle='#f0e4bc';ctx.font='800 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(profile.name,sh.x,sh.y+sh.h/2+66);ctx.restore();}};
const expansionBeforeGarages=updateCityExpansion;
updateCityExpansion=function(dt){expansionBeforeGarages(dt);updateGarageJobs();};
const toggleBeforeGarages=toggleFoot;
toggleFoot=function(h){if(h.foot){const t=stealable(h);if(t?.veh?.workshopJob){garageFeedback(h,'Car in service · collect it from the garage lift first.');return;}}toggleBeforeGarages(h);};
const syncBeforeGarages=syncExpansionUI;
syncExpansionUI=function(){syncBeforeGarages();let use=document.getElementById('garageUse');if(!use){use=document.createElement('button');use.id='garageUse';use.type='button';use.style.cssText='position:fixed;z-index:8;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);min-height:44px;max-width:64vw;padding:10px 18px;border:2px solid #264852;border-radius:5px;background:#e8ce75;color:#183640;font:800 12px sans-serif';document.body.append(use);}use.hidden=true;
 const h=cars.find(c=>c.human);if(!h||state!=='race'||paused||COMIC||rotationRequired())return;
 if(h.inside?.sh.type==='repair'){const s=garageStation(h);if(s){use.hidden=false;use.textContent='USE '+s.name+' · E';use.onclick=()=>garageAction(h,s.id);}return;}
 if(!h.inside&&onShop(h)?.type==='repair'){const sh=onShop(h),service=document.getElementById('cityService');if(service){service.hidden=false;service.disabled=!h.foot&&Math.hypot(h.vx,h.vy)>40;service.textContent=service.disabled?'STOP TO ENTER THE WORKSHOP':'ENTER '+garageProfile(sh).name;service.onclick=()=>enterSpecialtyGarage(h,sh);}}
};
cv.addEventListener('pointerdown',e=>{if(paused||COMIC||state!=='race')return;for(const h of cars){const I=h.inside;if(!h.human||I?.sh.type!=='repair'||!I.screen)continue;const {ox,oy,rw,rh}=I.screen;if(e.clientX<ox||e.clientX>ox+rw||e.clientY<oy||e.clientY>oy+rh)continue;const station=garageStations(I.sh).find(s=>Math.abs(e.clientX-(ox+s.x*rw))<65&&Math.abs(e.clientY-(oy+s.y*rh))<24);I.walkTo=station?{...station}:{x:clamp((e.clientX-ox)/rw,.07,.94),y:clamp((e.clientY-oy)/rh,.2,.96)};e.preventDefault();return;}});
addEventListener('keydown',e=>{if(e.code!=='KeyE'||e.repeat||paused||COMIC||state!=='race')return;const h=cars.find(c=>c.human&&c.inside?.sh.type==='repair');if(h&&garageStation(h)){e.preventDefault();e.stopImmediatePropagation();garageAction(h,garageStation(h).id);}},true);
const selectBeforeGarages=selectInput;
selectInput=function(dt){for(const p of players()){const S=sel[p];if(S?.mode==='up'){S.mode='car';S.ready=false;S.msg='UPGRADES AT SPECIALTY GARAGES';S.msgT=2;pressed.delete(KC[p].fire);}}selectBeforeGarages(dt);for(const p of players())if(sel[p]?.mode==='up'){sel[p].mode='car';sel[p].ready=false;sel[p].msg='UPGRADES AT SPECIALTY GARAGES';sel[p].msgT=2;}};

const GARAGE_COMIC_SHEET={file:'assets/garage-workshop-comic.png',cols:2,rows:2};
const GARAGE_COMIC_PRELOAD=new Image();GARAGE_COMIC_PRELOAD.src=GARAGE_COMIC_SHEET.file;
COMICS.workshopOpening=[
 {art:0,sheet:GARAGE_COMIC_SHEET,who:'UNCLE RAY',line:'A proper job needs a proper garage, Jack.',cap:'A NEW START. Jack parks at Ray’s Performance and walks through the roller door. This is where the street car becomes his own build.',alt:'Jack arrives with his orange coupe at a small coastal specialty garage.'},
 {art:1,sheet:GARAGE_COMIC_SHEET,who:'MAYA',line:'Engine bench for power. Chassis shop for grip and armour. Spark & Shield for security.',cap:'FIND YOUR STATION. Walk up to the right bench, check the price, and book the work. The car stays on the lift until the job is collected.',alt:'Maya and Jack inspect an engine on a specialist workbench.'},
 {art:2,sheet:GARAGE_COMIC_SHEET,who:'JACK',line:'First the lift. Then diagnostics. Then the serious tools.',cap:'BUILD THE WORKSHOP. Level 2 equipment unlocks bigger upgrades and lets Jack hire a mechanic. Level 3 opens the full specialist catalogue.',alt:'A larger, upgraded garage has a lift, clean work bays and diagnostic equipment.'},
 {art:3,sheet:GARAGE_COMIC_SHEET,who:'MAYA',line:'Give me a bay and I’ll keep your wheels turning.',cap:'BETTER TOGETHER. Hire Maya from the workshop office. She works in the garage, fits parts faster, and charges a smaller labour fee for each job.',alt:'Jack shakes hands with Maya as she joins his garage team.'}
];
COMICS.workshopExpansion=[{...COMICS.workshopOpening[2],who:'UNCLE RAY',line:'Good tools make room for better work.',cap:'EQUIPMENT INSTALLED. The workshop’s upgrade capacity has increased. Check the benches for the next level of parts.'},{...COMICS.workshopOpening[1],who:'MAYA',line:'Room on the team? Find me at the workshop office.',cap:'YOUR NEXT STEP. Level 2 workshops can hire Maya. If she is already on the team, your new equipment is ready for her next job.'}];
COMICS.workshopMechanic=[{...COMICS.workshopOpening[3],who:'JACK',line:'You’re hired, Maya. Let’s build something worth driving.',cap:'MAYA JOINS THE TEAM. Her hiring fee is paid once. Future fitting jobs take four seconds, with a $20 in-game labour charge.'},{...COMICS.workshopOpening[2],who:'MAYA',line:'Book the work at a station. Pick up the finished car at the lift.',cap:'A WORKING GARAGE. Maya stays with this workshop. Work continues while Jack explores, and paid jobs are saved so they can be collected later.'}];
const stageTargetBeforeGarages=stageTarget;
stageTarget=function(h){if(MS?.def.st[MS.i]?.k==='lose'&&h.hot)return SHOPS.filter(s=>s.type==='repair').sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0]||null;return stageTargetBeforeGarages(h);};
const startBeforeGarages=start;
start=function(modeValue){startBeforeGarages(modeValue);if(!CAMP())return;for(const h of cars.filter(c=>c.human)){const sh=SHOPS.find(s=>s.type==='repair'&&save[h.player]?.workshops?.[garageKey(s)]?.job?.carId===h.def.id);if(sh){h.x=sh.x;h.y=sh.y;h.vx=h.vy=h.airT=0;enterSpecialtyGarage(h,sh);}}};
