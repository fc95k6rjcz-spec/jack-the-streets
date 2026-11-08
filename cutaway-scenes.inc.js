/* Empty rendered stages; actors, cars, collisions and actions remain live. */
const CUTAWAY_WORKSHOP=new Image();CUTAWAY_WORKSHOP.src='assets/workshop-cutaway-v1.webp';
const CUTAWAY_UPGRADED=new Image();CUTAWAY_UPGRADED.src='assets/workshop-cutaway-upgraded-v1.webp';
const CUTAWAY_BANK=new Image();CUTAWAY_BANK.src='assets/bank-cutaway-v1.webp';
const CUTAWAY_BLOCKS={
 garage:[[.205,.415,.39,.56],[.205,.55,.25,.65],[.215,.65,.28,.795],[.65,.435,.765,.60],[.765,.445,.835,.67],[.66,.705,.835,.80],[.485,.52,.555,.735]],
 bank:[[.205,.44,.40,.585],[.515,.425,.72,.52],[.515,.35,.715,.42],[.225,.665,.31,.79],[.39,.64,.48,.77],[.57,.675,.705,.79],[.19,.605,.35,.625],[.365,.605,.48,.625]]
};
function cutawayBlocked(kind,x,y,land={}){
 const annex=kind==='garage'&&((land.west&&x>=.025&&x<=.215&&y>=.44&&y<=.795)||(land.east&&x>=.825&&x<=.975&&y>=.41&&y<=.795));
 const inRoom=annex||(kind==='garage'?x>=.205&&x<=.835&&y>=.405&&y<=.795:x>=.205&&x<=.74&&y>=.34&&y<=.80);
 const inExit=kind==='garage'?x>=.44&&x<=.59&&y>=.17&&y<=.46:x>=.445&&x<=.51&&y>=.28&&y<=.40;
 if(!inRoom&&!inExit)return true;
 if(kind==='garage'&&land.west&&x>.195&&x<.225&&(y<.65||y>.71))return true;
 if(kind==='garage'&&land.west&&x<.17&&y>.56&&y<.585)return true;
 if(kind==='garage'&&land.west&&x>.175&&x<.29&&y>.65&&y<.71)return false;
 if(kind==='garage'&&land.east&&x>.815&&x<.85&&(y<.62||y>.70))return true;
 return CUTAWAY_BLOCKS[kind].some(([a,b,c,d])=>x>a-.008&&x<c+.008&&y>b-.008&&y<d+.008);
}
function cutawayPath(kind,start,end,land={}){
 const step=.0125,N=81,key=(x,y)=>y*N+x,cell=p=>[Math.round(p.x/step),Math.round(p.y/step)];
 const [sx,sy]=cell(start),[ex,ey]=cell(end),queue=[[sx,sy]],seen=new Map([[key(sx,sy),null]]);let found=null;
 for(let i=0;i<queue.length&&i<6500;i++){const [x,y]=queue[i];if(Math.hypot(x-ex,y-ey)<1.6){found=[x,y];break;}
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=key(a,b);if(a<0||a>=N||b<0||b>=N||seen.has(k)||cutawayBlocked(kind,a*step,b*step,land))continue;seen.set(k,[x,y]);queue.push([a,b]);}}
 if(!found)return [];
 const path=[];for(let p=found;p;p=seen.get(key(...p)))path.push({x:p[0]*step,y:p[1]*step});return path.reverse().slice(1);
}
function cutawayMove(I,kind,dx,dy,land={}){
 if(!cutawayBlocked(kind,I.px+dx,I.py,land))I.px+=dx;
 if(!cutawayBlocked(kind,I.px,I.py+dy,land))I.py+=dy;
}
function cutawayWalk(h,dt,kind){
 const I=h.inside,k=h.keyset,land=typeof workshopEstate==='function'?workshopEstate(save[h.player]):{};let mx=Number(held(k,'right'))-Number(held(k,'left')),my=Number(held(k,'down'))-Number(held(k,'up'));const stick=stickFor(h);if(stick){mx=stick.x;my=stick.y;}
 if(Math.hypot(mx,my)>.1){I.walkTo=null;I.path=null;}
 if(I.walkTo){if(I.pathTarget!==I.walkTo){I.pathTarget=I.walkTo;I.path=cutawayPath(kind,{x:I.px,y:I.py},I.walkTo,land);}
  while(I.path?.length&&Math.hypot(I.path[0].x-I.px,I.path[0].y-I.py)<.009)I.path.shift();
  const p=I.path?.[0];if(p){mx=(p.x-I.px)*1.75;my=p.y-I.py;}else{const target=I.walkTo;I.walkTo=null;if(target.id&&Math.hypot(I.px-target.x,I.py-target.y)<.04)safehouseAction(h,target.id);}}
 I.walking=Math.hypot(mx,my)>.001;if(I.walking){I.a=Math.atan2(my,mx);I.phase=(I.phase||0)+dt*8;const len=Math.hypot(mx,my)||1;cutawayMove(I,kind,mx/len*dt*.13,my/len*dt*.23,land);}
 I.walkFrame=I.walking?[1,2,3,2][Math.floor(I.phase||0)%4]:0;
}
const CUTAWAY_STATIONS={rest:[.635,.60],work:[.36,.60],supply:[.64,.69],snack:[.755,.68],garage:[.565,.76],room:[.69,.625],drive:[.455,.65]};
for(const s of SAFEHOUSE_STATIONS){const p=CUTAWAY_STATIONS[s.id];if(p){s.x=p[0];s.y=p[1];}}
SAFEHOUSE_STATIONS.push({id:'drive',x:.455,y:.65,n:'GET IN',hint:'Get in and steer out yourself'});
const actionBeforeCutaway=safehouseAction;safehouseAction=function(h,id){if(id==='drive')return driveGarageCar(h);return actionBeforeCutaway(h,id);};
function cutawayInit(h,kind){const I=h.inside;if(I.cutaway===kind)return;I.cutaway=kind;I.px=kind==='garage'?.44:.475;I.py=kind==='garage'?.65:.39;I.a=-Math.PI/2;I.walkTo=null;I.path=null;}
const enterBeforeCutaway=enterShop;enterShop=function(h,sh){enterBeforeCutaway(h,sh);if(sh.type==='ware'||sh.type==='bank')cutawayInit(h,sh.type==='ware'?'garage':'bank');};
const driveBeforeCutaway=driveGarageCar;driveGarageCar=function(h){if(!h.inside||h.inside.sh.type!=='ware')return;if(h.inside.driveOut!=null)return;h.inside.driveOut=0;h.inside.walkTo=null;keys.clear();};
function besideGarageCar(I){return Math.hypot((I.px-.455)*1.75,I.py-.65)<.14;}
function garageDriveHit(p,screen){return Math.abs(p.x-.52)<.055&&Math.abs(p.y-.63)<.13||Math.abs((p.x-.455)*screen.rw)<48&&Math.abs((p.y-.65)*screen.rh+25)<19;}
updateSafehouse=function(h,dt){const I=h.inside;cutawayInit(h,'garage');I.t+=dt;
 if(I.driveOut!=null){I.driveOut+=dt/1.8;if(I.driveOut>=1)driveBeforeCutaway(h);return;}
 cutawayWalk(h,dt,'garage');if(!h.inside)return;
 I.station=SAFEHOUSE_STATIONS.reduce((best,s)=>{const d=Math.hypot((I.px-s.x)*1.75,I.py-s.y);return d<.10&&(!best||d<best.d)?{s,d}:best;},null)?.s;
 if(tapped(h.keyset,'exit')){if(besideGarageCar(I))driveGarageCar(h);else leaveShop(h);return;}if(tapped(h.keyset,'fire')){const enemy=cops.some(c=>(c.offs||[]).some(o=>o.room===I.sh.id&&o.down<=0));if(enemy)fightOfficer(h);else if(I.station)safehouseAction(h,I.station.id);}
 h.shopMsgT=Math.max(0,(h.shopMsgT||0)-dt);
};
function cutawayFrame(vp,I){const header=42,footer=66,ratio=1.75,w=vp.w,H=vp.h;const phone=H<550&&w/H>1.8,rw=phone?w:Math.min(w,(H-header-footer)*ratio),rh=rw/ratio,ox=vp.x+(w-rw)/2,oy=phone?header-rh*.29:header+(H-header-footer-rh)/2;I.screen={ox,oy,rw,rh};return I.screen;}
function drawCutawayActor(h,screen,time){const I=h.inside,{ox,oy,rw,rh}=screen;ctx.save();ctx.translate(ox+I.px*rw,oy+I.py*rh);const size=rw/1450;ctx.scale(size,size);drawPed({isJack:true,appearance:save[h.player]?.appearance||'redline',gunType:h.weaponHolstered===false?h.gun?.type:null,moving:!!I.walking,walkFrame:I.walkFrame??0,x:0,y:0,a:I.a??-Math.PI/2,ph:time/180,down:0,run:0},time);ctx.restore();}
function cutawayLabel(text,x,y,selected=false){ctx.save();ctx.font='700 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(text).width+20;ctx.fillStyle=selected?'#e8c27a':'#162b32df';ctx.beginPath();ctx.roundRect(x-w/2,y-12,w,24,6);ctx.fill();ctx.fillStyle=selected?'#162b32':'#f3e6c6';ctx.fillText(text,x,y);ctx.restore();}
function cutawayHeader(vp,title,detail){ctx.save();ctx.fillStyle='#10212bef';ctx.fillRect(vp.x,0,vp.w,42);ctx.fillStyle='#edd09a';ctx.textAlign='left';ctx.font='800 13px system-ui';ctx.fillText(title,vp.x+14,17);ctx.fillStyle='#c7d0c8';ctx.font='11px system-ui';ctx.fillText(detail,vp.x+14,33);ctx.restore();}
function cutawayWorkshopArt(h,screen){const {ox,oy,rw,rh}=screen;ctx.drawImage(CUTAWAY_WORKSHOP,ox,oy,rw,rh);const owned=homeImprovements(save[h.player]);if(!CUTAWAY_UPGRADED.complete||!CUTAWAY_UPGRADED.naturalWidth)return;const patch=(x,y,w,height)=>{ctx.save();ctx.beginPath();ctx.rect(ox+x*rw,oy+y*rh,w*rw,height*rh);ctx.clip();ctx.drawImage(CUTAWAY_UPGRADED,ox,oy,rw,rh);ctx.restore();};if(owned.floor){patch(.20,.40,.64,.40);if(!owned.living){ctx.save();ctx.beginPath();ctx.rect(ox+.64*rw,oy+.41*rh,.20*rw,.28*rh);ctx.clip();ctx.drawImage(CUTAWAY_WORKSHOP,ox,oy,rw,rh);ctx.restore();}}if(owned.living)patch(.64,.41,.20,.28);if(owned.storage)patch(.65,.69,.19,.11);else if(owned.floor){ctx.save();ctx.beginPath();ctx.rect(ox+.65*rw,oy+.69*rh,.19*rw,.11*rh);ctx.clip();ctx.drawImage(CUTAWAY_WORKSHOP,ox,oy,rw,rh);ctx.restore();}if(typeof paintWorkshopEstate==='function')paintWorkshopEstate(h,{ox,oy,rw,rh});}
const safehouseDrawBeforeCutaway=drawSafehouse;drawSafehouse=function(vp,h,time,u){if(!CUTAWAY_WORKSHOP.complete||!CUTAWAY_WORKSHOP.naturalWidth)return safehouseDrawBeforeCutaway(vp,h,time,u);const I=h.inside;cutawayInit(h,'garage');const S=cutawayFrame(vp,I),{ox,oy,rw,rh}=S;ctx.save();ctx.fillStyle='#101b20';ctx.fillRect(vp.x,0,vp.w,vp.h);ctx.save();ctx.beginPath();ctx.rect(vp.x,42,vp.w,vp.h-108);ctx.clip();cutawayWorkshopArt(h,S);
 const d=CAT[save[h.player].sel]||CAT.pocket,look=lookOf(save[h.player],d.id),art=realisticCar(d,look)||comicCar(d,look);if(art){const p=clamp(I.driveOut||0,0,1),y=.63-p*p*.42,len=rh*(d.commercial?.29:.225),height=len*art.naturalHeight/art.naturalWidth;ctx.save();ctx.translate(ox+.52*rw,oy+y*rh);ctx.rotate(-Math.PI/2);ctx.drawImage(art,-len/2,-height/2,len,height);ctx.restore();}
 if(I.driveOut==null)drawCutawayActor(h,S,time);
 // One active label; the bottom dock carries the other actions.
 if(typeof drawWorkshopEstateLabels==='function')drawWorkshopEstateLabels(h,S);
 if(I.station&&I.driveOut==null)cutawayLabel(I.station.id==='work'&&isBrokenGarage(I.sh)?'REPAIR GARAGE':I.station.n,ox+I.station.x*rw,oy+I.station.y*rh-25,true);
 ctx.restore();cutawayHeader(vp,playerStoryName().toUpperCase()+'’S WORKSHOP',money(save[h.player].cash)+' · '+(besideGarageCar(I)?'TAP THE CAR OR PRESS ENTER TO GET IN':isBrokenGarage(I.sh)?'YOUR FIRST PROJECT':'HOME & SAFEHOUSE'));
 if(h.shopMsgT>0)cutawayLabel(h.shopMsg,vp.x+vp.w/2,vp.h-79);
 if(I.driveOut!=null)cutawayLabel('HEADING OUT · '+d.n.toUpperCase(),vp.x+vp.w/2,vp.h-80);ctx.restore();};
// Keep the workshop controls off the artwork, on tablets as well as phones.
const cutawayStyle=document.createElement('style');cutawayStyle.textContent=`body.inHomeGarage #garageActions{bottom:calc(8px + env(safe-area-inset-bottom))!important;gap:6px!important}body.inHomeGarage #pauseBtn,body.inCutawayBank #pauseBtn{top:4px!important;width:34px!important;height:34px!important;min-height:34px!important;font-size:15px!important}body.inHomeGarage #regionalMapButton{bottom:calc(8px + env(safe-area-inset-bottom))!important}body.inHomeGarage #touch .fire{bottom:70px!important}#bankActions{position:fixed;z-index:12;bottom:calc(8px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:5px;border-radius:10px;background:#132831ed}#bankActions button{min-height:40px;padding:8px 14px;border:1px solid #b3a079;border-radius:7px;background:#e6c382;color:#142b33;font:800 11px system-ui}#bankActions button[data-rob]{background:#3b3332;color:#ead2b9;border-color:#ad8071}#bankActions[hidden]{display:none}body.inCutawayBank #regionalMapButton{bottom:8px!important;font-size:10px!important;padding:10px!important}body.inCutawayBank #touch .nos,body.inCutawayBank #touch .exit{display:none}@media(max-width:650px){#bankActions{left:8px;right:68px;transform:none;justify-content:center}#bankActions button{flex:1;padding:8px 5px;font-size:10px}body.inCutawayBank #regionalMapButton{width:50px;font-size:0!important}body.inCutawayBank #regionalMapButton:after{content:'MAP';font:800 10px system-ui}}`;document.head.append(cutawayStyle);
function bankVaultNear(I){return Math.hypot((I.px-.55)*1.75,I.py-.68)<.12;}
function advanceCutawayBank(h,dt){const I=h.inside,sh=I.sh,empty=(sh.robbedAt??-999)>simT-120||bankHeatState(save[h.player]).cooldown>0;
 if(I.done||empty)return;
 if(bankVaultNear(I)&&(held(h.keyset,'fire')||I.robIntent)){I.robT+=dt;if(I.robT>=3){I.done=true;I.robIntent=false;setJackFeeling('uneasy');sh.robbedAt=simT;const amt=bankHeistReward(h);save[h.player].cash+=amt;recordBankLoot(h,amt);persist();refreshBank();I.amt=amt;h.wanted=Math.max(h.wanted,4);addWanted(h,.5);h.hidden=false;h.lastKnown=null;h.robCall={x:h.x,y:h.y,until:simT+60,n:0};h.msg='ALARM · POLICE RESPONDING';h.msgT=3.5;sfx(1000,.1,'square');}}
 else I.robT=Math.max(0,I.robT-dt*2);
}
const insideBeforeCutaway=updateInside;updateInside=function(h,dt){if(h.inside.sh.type!=='bank')return insideBeforeCutaway(h,dt);cutawayInit(h,'bank');const I=h.inside;I.t+=dt;cutawayWalk(h,dt,'bank');if(!h.inside)return;if(tapped(h.keyset,'exit')){leaveShop(h);return;}const intruders=cops.flatMap(c=>c.offs||[]).filter(o=>o.room===I.sh.id&&o.down<=0);if(intruders.length&&held(h.keyset,'fire')){if(h.gun?.ammo>0){if((h.gunCD||0)<=simT){h.gunCD=simT+.25;h.gun.ammo--;intruders[0].down=3;h.offBust=0;h.searchNoiseUntil=simT+2;sfx(500,.08,'triangle',-300,.05);}}else if(tapped(h.keyset,'fire'))fightOfficer(h);return;}advanceCutawayBank(h,dt);};
const interiorBeforeCutaway=drawInterior;drawInterior=function(vp,h,time,u){if(h.inside.sh.type!=='bank'||!CUTAWAY_BANK.complete||!CUTAWAY_BANK.naturalWidth)return interiorBeforeCutaway(vp,h,time,u);cutawayInit(h,'bank');const I=h.inside,S=cutawayFrame(vp,I),{ox,oy,rw,rh}=S;ctx.save();ctx.fillStyle='#101b20';ctx.fillRect(vp.x,0,vp.w,vp.h);ctx.save();ctx.beginPath();ctx.rect(vp.x,42,vp.w,vp.h-108);ctx.clip();ctx.drawImage(CUTAWAY_BANK,ox,oy,rw,rh);drawCutawayActor(h,S,time);
 for(const x of [.55,.61,.67]){ctx.save();ctx.translate(ox+x*rw,oy+.425*rh);ctx.scale(rw/1700,rw/1700);drawPed({x:0,y:0,a:Math.PI/2,ph:0,skin:SKIN[1],hair:HAIR[1],shirt:'#354c59',down:0,run:0},time);ctx.restore();}
 for(const c of cops)for(const o of c.offs||[])if(o.room===I.sh.id){ctx.save();ctx.translate(ox+clamp(o.rx,.42,.55)*rw,oy+clamp(o.ry,.36,.59)*rh);ctx.scale(rw/1450,rw/1450);drawPed({...o.pd,x:0,y:0,a:0,ph:time/180,shirt:'#233d65',down:o.down,run:1},time);ctx.restore();}
 const empty=(I.sh.robbedAt??-999)>simT-120||bankHeatState(save[h.player]).cooldown>0;
 if(!I.done&&!empty)cutawayLabel('VAULT',ox+.55*rw,oy+.68*rh,true);ctx.restore();cutawayHeader(vp,'HARBOUR BANK',I.done?'ALARM RAISED · '+money(I.amt)+' STOLEN · FIND THE EXIT':empty?'VAULT EMPTY · RETURN LATER':I.robT>0?'OPENING THE VAULT · '+Math.round(I.robT/3*100)+'%':bankVaultNear(I)?'VAULT · HOLD FIRE OR TAP ROB VAULT':'WALK TO THE VAULT · OR EXPLORE THE LOBBY');
 ctx.restore();syncBankActions(h);};
function syncBankActions(h){let b=document.getElementById('bankActions');if(!b){b=document.createElement('div');b.id='bankActions';document.body.append(b);}const visible=!!h?.inside&&h.inside.sh.type==='bank'&&state==='race'&&!paused&&!COMIC&&!h.jail;document.body.classList.toggle('inCutawayBank',visible);b.hidden=!visible;if(!visible)return;const I=h.inside;if(b._room!==I){b._room=I;b.replaceChildren();const add=(label,action,rob=false)=>{const x=document.createElement('button');x.type='button';x.textContent=label;if(rob)x.dataset.rob='true';x.onclick=action;b.append(x);return x;};add('WALK TO VAULT',()=>{I.walkTo={x:.55,y:.66};});add('ROB VAULT',()=>{I.robIntent=!I.robIntent;},true);add('LEAVE BANK',()=>leaveShop(h));}const rob=b.querySelector('[data-rob]');rob.textContent=I.done?'ALARM RAISED':I.robIntent?'CANCEL ROBBERY':'ROB VAULT';rob.disabled=I.done||!bankVaultNear(I)||(I.sh.robbedAt??-999)>simT-120||bankHeatState(save[h.player]).cooldown>0;}
const syncBeforeBank=syncGarageUI;syncGarageUI=function(){syncBeforeBank();syncBankActions(cars.find(c=>c.human&&c.inside?.sh.type==='bank'));};
const worldBeforeCutaway=drawComicShop;drawComicShop=function(sh,cam){const im=sh.type==='bank'?CUTAWAY_BANK:sh.type==='ware'?CUTAWAY_WORKSHOP:null;if(!im?.complete||!im.naturalWidth)return worldBeforeCutaway(sh,cam);const parcel=shopArtParcel(sh);if(!parcel)return worldBeforeCutaway(sh,cam);const r=parcel.rect;ctx.save();ctx.drawImage(im,im.naturalWidth*.19,im.naturalHeight*.37,im.naturalWidth*.65,im.naturalHeight*.55,r.x0,r.y0,r.x1-r.x0,r.y1-r.y0);ctx.restore();return true;};
cv.addEventListener('pointerdown',e=>{if(paused||COMIC||state!=='race')return;const box=cv.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;for(const h of cars){const I=h.inside;if(!h.human||!I?.cutaway||!I.screen||I.driveOut!=null)continue;const {ox,oy,rw,rh}=I.screen,p={x:(x-ox)/rw,y:(y-oy)/rh};if(I.cutaway==='garage'&&garageDriveHit(p,I.screen)){e.preventDefault();driveGarageCar(h);return;}if(cutawayBlocked(I.cutaway,p.x,p.y,typeof workshopEstate==='function'?workshopEstate(save[h.player]):{}))continue;if(I.cutaway==='garage'&&SAFEHOUSE_STATIONS.some(s=>Math.hypot(p.x-s.x,p.y-s.y)<.06))continue;I.walkTo=p;}});
