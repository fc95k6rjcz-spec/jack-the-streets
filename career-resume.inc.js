/* Save an active solo contract without serializing actors, sockets or timers. */
function saveContractProgress(){
 if(!CAMP()||NET.on||OPEN_WORLD.joined)return;
 const h=cars.find(c=>c.human);if(!h)return;
 if(!CONTRACT){delete save[h.player].activeContract;return;}
 const J=CONTRACT;
 save[h.player].activeContract={id:J.job.id,phase:J.phase,remaining:J.remaining,cp:J.cp,damage:J.damage,
  vehicle:h.foot?null:h.def.id,fuel:h.fuel,dmg:h.dmg,wanted:h.wanted||0,x:h.x,y:h.y};
}
const persistBeforeCareerResume=persist;
persist=function(){saveContractProgress();return persistBeforeCareerResume();};
const updateBeforeCareerResume=updateContract;
let contractSaveIn=2;
updateContract=function(dt){updateBeforeCareerResume(dt);if(CONTRACT){contractSaveIn-=dt;if(contractSaveIn<=0){contractSaveIn=2;persist();}}};
function restoreContractProgress(h,snapshot){
 if(!snapshot||!Number.isFinite(snapshot.remaining)||snapshot.remaining<=0)return false;
 const job=jobCatalogue().find(j=>j.id===snapshot.id);
 if(!job||save[h.player].jobsDone?.includes(job.id))return false;
 const phase=['pickup','store','dropoff'].includes(snapshot.phase)?snapshot.phase:'pickup';
 MS=null;camp().jobMode=true;CONTRACT=null;
 // Recreate the loan truck at pickup through the normal acceptance path.
 if(!acceptContract(h,job))return false;
 Object.assign(CONTRACT,{phase,remaining:Math.min(snapshot.remaining,job.seconds+120),cp:Math.max(0,Math.min(job.route.length-1,snapshot.cp||0)),damage:snapshot.damage||0});
 if(h.inside)leaveShop(h);
 const id=snapshot.vehicle,def=CAT[id];
 if(def&&(save[h.player].owned.includes(id)||(job.kind==='dinosaur'&&id==='boxtruck'))){
  const up=upOf(save[h.player],id),look=lookOf(save[h.player],id);
  applyVeh(h,{def,st:effStats(def,up,look.wheel),r:clamp(def.L*K*.4,20,40),m:def.s[3],look,up,color:look.paint||def.col,dmg:snapshot.dmg||0,fuel:snapshot.fuel??0,bl:bling(up)});h.foot=false;
  if(CONTRACT.loaner){traffic=traffic.filter(t=>t!==CONTRACT.loaner);delete CONTRACT.loaner;}
 }else{h.foot=true;h.def=FOOTDEF;h.r=13;h.m=.5;}
 const safe=Number.isFinite(snapshot.x)&&Number.isFinite(snapshot.y)&&![BUILD,SHAL,DEEP].includes(surface(snapshot.x,snapshot.y));
 h.x=safe?snapshot.x:job.pickup.x;h.y=safe?snapshot.y:job.pickup.y;h.vx=h.vy=0;h.wanted=snapshot.wanted||0;
 h.seamlessGarage=false;h.msg='JOB RESUMED · '+job.n;h.msgT=4;persist();return true;
}
const startBeforeCareerResume=start;
start=function(m){const pending=CAMP()?save.p1.activeContract:null;startBeforeCareerResume(m);if(CAMP()&&pending){const h=cars.find(c=>c.human);if(h)restoreContractProgress(h,pending);}};
