window.testAudioGraph=()=>{unlockAudio();audioTick(.016);musicTick();sfx(440,.1);return {state:AC?.state,mixer:!!AUDIO_OUT,engines:!!SND.ready};};
window.runGameplayChecks=()=>{
 const checks=[],failures=[];const check=(name,fn)=>{try{fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};const ok=(v,m)=>{if(!v)throw Error(m||'assertion failed');};
 gtype='campaign';save.camp={m:0,intro:1,comicSeen:Object.fromEntries(Array.from({length:9},(_,i)=>[i,1]))};start(1);state='race';paused=false;
 const h=cars[0],pos={x:IX[4],y:IY[2]},originalBuildings=[...buildings];let step=dt=>{simT+=dt;};
 Object.assign(h,{x:pos.x,y:pos.y,foot:true,def:FOOTDEF,vx:0,vy:0,wanted:2,hidden:false,finished:false,jail:null,cuff:null});cops=[];buildings.length=0;helis=[];
 const c=makeCop(h);Object.assign(c,{x:h.x-250,y:h.y,fs:0,vx:0,vy:0});cops=[c];
 check('Visible suspect cannot run down the search timer',()=>{for(let i=0;i<120;i++){step(.05);updatePursuit(h,.05);}ok(h.pursuit.unseen===0&&!h.hidden);});
 const wall={x0:h.x-100,x1:h.x+100,y0:h.y-100,y1:h.y+100,h:1,furn:[]};buildings.push(wall);
 check('Walls block sight from a nearby patrol',()=>{ok(!policeCanSee(c,h));for(let i=0;i<40;i++){step(.05);updatePursuit(h,.05);}ok(h.hidden&&h.pursuit.remaining>0);});
 check('Sight reacquisition resets the countdown',()=>{c.x=h.x-30;c.y=h.y;step(.05);updatePursuit(h,.05);ok(!h.hidden&&h.pursuit.unseen===0);});
 check('Foot officers move through the witnessed entrance',()=>{Object.assign(c,{x:h.x-230,y:h.y,fs:0,vx:0,vy:0});c.offs=[{x:h.x-190,y:h.y,a:0,ph:0,down:0,yellT:99,pd:{skin:SKIN[0],hair:'#111'}}];h.pursuit.building=wall;h.pursuit.entry={x:wall.x0-5,y:h.y};h.pursuit.last={x:h.x,y:h.y};h.hidden=true;const o=c.offs[0],before=o.x;for(let i=0;i<100;i++){step(.016);updateFootOfficers(.016);}ok(o.x>before+60,'officer did not advance');ok(personBuilding(o)===wall,'officer failed to enter building');});
 check('Fire can stagger a nearby officer and break arrest contact',()=>{const o=c.offs[0];o.x=h.x+30;o.y=h.y;o.down=0;h.offBust=1;h.punchCD=0;ok(fightOfficer(h));ok(o.down>1&&h.offBust===0);});
 check('Unseen suspect eventually escapes and active units leave',()=>{cops=[];h.searchNoiseUntil=0;for(let i=0;i<1000&&h.wanted>0;i++){step(.05);updatePursuit(h,.05);}ok(h.wanted===0&&h.pursuit===null&&!h.hidden);});
 check('A witness report is delayed and uses the crime location',()=>{const p=newPed(h.x+50,h.y);p.call=null;h.wanted=0;h.pursuit=null;const crime={x:h.x-400,y:h.y};startWitnessCall(p,h,crime);updateWitness(p,1);ok(h.wanted===0);updateWitness(p,3);ok(h.wanted>=2&&h.pursuit.last.x===crime.x);});
 check('Drivers resist before the vehicle can be taken',()=>{h.theft=null;h.foot=true;h.wanted=0;h.pursuit=null;peds=[];cops=[];const t={x:h.x,y:h.y,a:0,state:'drive',civ:true,def:CAT.sedan,r:30};traffic=[t];ok(!resistCarTheft(h,t));ok(h.theft&&peds.length===1&&peds[0].call);h.theft=null;});
 check('All nine mission objective chains advance and pay exactly once',()=>{
   for(let index=0;index<9;index++){save.camp.m=index;save.camp.comicSeen[index]=1;MS=null;h.jail=null;h.cuff=null;h.finished=false;h.dmg=0;h.hot=false;h.inside=null;h.foot=false;h.inHome=false;h.def=CAT.pocket;h.tank=false;h.wanted=0;cops=[];helis=[];startMission(h,true);ok(MS,'mission did not start '+index);const walletBefore=save[h.player].cash;let guard=0;
     while(MS&&guard++<60){const S=MS.def.st[MS.i];h.inside=null;
       if(S.k==='goto'){h.x=S.p.x;h.y=S.p.y;if(index===8)h.tank=true;}
       else if(S.k==='shop'){h.atShop={type:S.type};h.vx=h.vy=0;}
       else if(S.k==='collect'){for(const p of S.pts){h.x=p.x;h.y=p.y;updateMission(.01);}continue;}
       else if(S.k==='race'){for(const p of S.pts){h.x=p.x;h.y=p.y;updateMission(.01);}continue;}
       else if(S.k==='steal'){h.foot=false;h.inHome=false;}
       else if(S.k==='lose'){h.wanted=0;h.hot=false;}
       else if(S.k==='rob'){const sh=SHOPS.find(q=>q.type===S.type);ok(sh,'shop missing');sh.robbedAt=simT+1;}
       else if(S.k==='wanted')h.wanted=S.n;
       else if(S.k==='heli'){MS.heliSeen=true;helis=[{dead:true,target:h}];}
       else if(S.k==='tank'){h.tank=true;h.foot=false;}
       else if(S.k==='kill')MS.gang.dead=true;
       updateMission(.01);
     }
     ok(!MS&&save.camp.m===index+1,'stuck mission '+index);ok(save[h.player].cash>walletBefore,'reward missing '+index);const paid=save[h.player].cash;missionPass();ok(save[h.player].cash===paid,'double reward');
   }
 });
 check('A failed timer can retry without losing campaign progress',()=>{save.camp.m=3;startMission(h,true);MS.stT=.01;updateMission(.1);ok(!MS&&save.camp.m===3);startMission(h,true);ok(MS&&MS.i===0);MS=null;});
 check('Bank escape objective does not require laundering an unrelated hot car',()=>{save.camp.m=6;startMission(h,true);MS.i=2;h.wanted=0;h.hot=true;updateMission(.01);ok(!MS&&save.camp.m===7);});
 check('Own car skips theft and police escape in the first mission',()=>{MS=null;save.camp.m=0;h.foot=false;h.boat=false;h.inHome=true;h.hot=false;h.wanted=0;startMission(h,true);ok(!h.foot&&MS.def.st[MS.i].k==='goto','own car did not count');MS=null;});
 check('Helicopter approaches and orbits avoid the player',()=>{const q={x:h.x-800,y:h.y,orb:0};for(let i=0;i<120;i++){steerHelicopter(q,{x:h.x+500,y:h.y},h,.016);ok(Math.hypot(q.x-h.x,q.y-h.y)>=319.9,'helicopter crossed player');}q.x=h.x;q.y=h.y;steerHelicopter(q,{x:h.x+500,y:h.y},h,.016);ok(Math.hypot(q.x-h.x,q.y-h.y)>=319.9);});
 check('Busted removes the helicopter and its outstanding shots',()=>{const q={target:h},other={target:{human:true,wanted:2}};helis=[q,other];bullets=[{owner:q},{owner:other}];shots=[{owner:q}];h.homeVeh=vehOf({...h,def:CAT.pocket,st:effStats(CAT.pocket,ZERO,'std'),up:{...ZERO},look:{paint:null,wheel:'std'}});campRespawn(h,'BUSTED');ok(!helis.includes(q)&&helis.includes(other),'wrong air units removed');ok(!bullets.some(b=>b.owner===q)&&!shots.some(b=>b.owner===q),'helicopter shots survived arrest');h.jail=null;helis=[];bullets=[];shots=[];});
 check('Repair and resale prices respect balanced progression',()=>{ok(serviceRepairCost(100,CAT.pocket)<=300);const wallet={up:{},cash:0};ok(sellValue(wallet,CAT.sedan)<CAT.sedan.price);ok(LADDER[0]===350&&LADDER[4]>LADDER[0]);});
 check('Warehouse upgrades deduct once and update live stats',()=>{MS=null;h.foot=false;h.hot=false;h.wanted=0;h.pursuit=null;h.def=CAT.pocket;h.up={...ZERO};h.st=effStats(h.def,h.up,'std');h.look={paint:null,wheel:'std'};save[h.player].up={pocket:{...ZERO}};save[h.player].cash=2000;h.dmg=40;openWarehouse(h);const btn=[...document.querySelectorAll('#warehouseWorkshop button')].find(b=>b.textContent.startsWith('ENGINE'));btn.click();ok(save[h.player].cash===1650&&upOf(save[h.player],'pocket').eng===1);ok(h.st[0]>CAT.pocket.s[0]);});
 buildings.length=0;buildings.push(...originalBuildings);MS=null;return{passed:checks,failures};
};
window.gameplayPreview=()=>{document.getElementById('menu').hidden=true;gtype='campaign';state='race';paused=false;const h=cars[0];Object.assign(h,{x:IX[4],y:IY[2],foot:false,def:CAT.pocket,st:effStats(CAT.pocket,h.up,'std'),color:'#e15331',r:28,dmg:0,wanted:2,jail:null,inside:null,finished:false,hot:false});h.cam={x:h.x,y:h.y,z:.8};h.pursuit={phase:'hidden',unseen:5,required:28,remaining:23,last:{x:h.x-300,y:h.y}};h.hidden=true;cops=[makeCop(h)];cops[0].x=h.x-240;cops[0].y=h.y+80;cops[0].fs=0;raceT=20;render(performance.now(),.016);};
