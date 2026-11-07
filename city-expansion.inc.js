/* City expansion source. Run python3 scripts/build-city-expansion.py after editing. */
const CITY_WORKS={tile:null,parks:[],pads:[],stops:[],bridges:[],tunnel:null,overpasses:[],freewayX:null};
const STREET_NAMES={
 nb:{h:['Palm Beach Road','Avalon Parade','Mona Vale Road','Powderworks Road','Wakehurst Parkway','Warringah Road','Pittwater Road','Sydney Road'],v:['Forest Way','Coastal Motorway','McCarrs Creek Road','Wakehurst Drive','Warringah Expressway','Condamine Street','Barrenjoey Road','Pittwater Road','Ocean Street','Beach Road']},
 syd:{h:['Military Road','Pacific Highway','Cahill Expressway','Bridge Street','Oxford Street','Parramatta Road','Cleveland Street','Anzac Parade'],v:['Victoria Road','Harbour Motorway','Harris Street','George Street','Harbour Tunnel Road','Elizabeth Street','Bourke Street','Darlinghurst Road','Old South Head Road','Bondi Road']}
};
const ROAD_NAMES=STREET_NAMES[CITY]||STREET_NAMES.nb;
function streetAt(h){const a=nearLine(h.y,IY),b=nearLine(h.x,IX);return a.d<b.d?ROAD_NAMES.h[a.i%ROAD_NAMES.h.length]:ROAD_NAMES.v[b.i%ROAD_NAMES.v.length];}
function isFreewayTraffic(t){return t.axis==='v'&&Math.abs(t.lane-CITY_WORKS.freewayX)<180;}
function inHarbourTunnel(h){const t=CITY_WORKS.tunnel;return !!(t&&!h.flying&&Math.abs(h.x-t.x)<90&&h.y>t.y0&&h.y<t.y1);}
function cityLayer(c){if(c.inside||c.flying||c.foot)return 0;for(const p of CITY_WORKS.overpasses){if(Math.abs(c.x-p.x)<192&&Math.abs(c.y-p.y)<195){return c.axis?Number(c.axis==='v'):Number(Math.abs(Math.sin(c.a))>.7);}}return 0;}
// Profiles describe the fictional game districts, not real-world crime statistics.
const DISTRICT_STYLES={coast:{pave:'#c2ba9f',park:'#7d965b',risk:.05},village:{pave:'#a8ada7',park:'#6b895d',risk:.10},city:{pave:'#8b9298',park:'#55775e',risk:.18},industrial:{pave:'#747a79',park:'#67745a',risk:.6}};
let DISTRICT_TILE=null;const DISTRICT_CACHE=new Map();
function districtAt(x,y){const name=suburbAt(x,y);if(/BROOKVALE|INDUSTRIAL|DOCK|WORKS|DEE WHY/i.test(name))return DISTRICT_STYLES.industrial;if(/DOWNTOWN|CITY|CBD|SURRY|DARLINGHURST|CHIPPENDALE/i.test(name))return DISTRICT_STYLES.city;if(/BEACH|AVALON|PALM|MANLY|BONDI|COAST|PITTWATER/i.test(name))return DISTRICT_STYLES.coast;return DISTRICT_STYLES.village;}
function districtSurface(c,r,kind){if(DISTRICT_TILE!==tile){DISTRICT_CACHE.clear();DISTRICT_TILE=tile;}const key=c+','+r+','+kind;if(!DISTRICT_CACHE.has(key)){const profile=districtAt((c+.5)*T,(r+.5)*T),base=kind===PAVE?profile.pave:profile.park;DISTRICT_CACHE.set(key,shade(base,((c*13+r*7)%9-4)*.009));}return DISTRICT_CACHE.get(key);}
function freewayAt(y){const base=CITY_WORKS.freewayX;if(base==null)return NaN;for(let j=0;j<IY.length-1;j++){if(y>=IY[j]&&y<=IY[j+1]){const t=(y-IY[j])/(IY[j+1]-IY[j]);return base+Math.sin(t*Math.PI)**4*44*(j%2?-1:1);}}return base;}
function freewayPath(offset,y0,y1){ctx.beginPath();for(let y=y0;y<=y1+15;y+=15){const yy=Math.min(y,y1),x=freewayAt(yy)+offset;if(y===y0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}}
function prepareCityWorks(){
 if(CITY_WORKS.tile===tile)return;Object.assign(CITY_WORKS,{tile,parks:[],pads:[],stops:[],bridges:[],tunnel:null,overpasses:[],freewayX:IX[1]});
 if(curMap!=='big'){CITY_WORKS.freewayX=null;return;}
 for(let r=0;r<ROWS;r++)for(let c=RC[1]-1;c<=RC[1]+2;c++)if(at(c,r)!==BUILD)set(c,r,ROAD);
 for(let i=trees.length-1;i>=0;i--)if(Math.abs(trees[i].x-CITY_WORKS.freewayX)<205)trees.splice(i,1);
 // Use genuinely vacant paved parcels; do not replace homes or mission destinations.
 for(let j=0;j<IY.length-1;j++)for(let i=0;i<IX.length-1;i++){
  const x=IX[i]+T*3,y=IY[j]+T*2.8;
  const clear=[[-150,-100],[150,-100],[-150,100],[150,100],[0,0]].every(([dx,dy])=>surface(x+dx,y+dy)===PAVE&&!buildings.some(b=>x+dx>b.x0-30&&x+dx<b.x1+30&&y+dy>b.y0-30&&y+dy<b.y1+30));
  if(clear&&CITY_WORKS.parks.length<5){CITY_WORKS.parks.push({x,y,w:360,h:240,n:suburbAt(x,y)+' CAR PARK'});CITY_WORKS.pads.push({x:x+90,y:y-45,n:suburbAt(x,y)+' HELIPAD'});}
 }
 // Existing broad shop forecourts are additional usable parking locations.
 for(const sh of SHOPS.filter(s=>s.type==='mart'||s.type==='ware').slice(0,4))CITY_WORKS.parks.push({x:sh.x,y:sh.y,w:sh.w,h:sh.h,n:suburbAt(sh.x,sh.y)+' PARKING'});
 if(!CITY_WORKS.pads.length){const sh=SHOPS.find(s=>s.type==='ware');if(sh)CITY_WORKS.pads.push({x:sh.x,y:sh.y,n:'WAREHOUSE HELIPAD'});}
 for(let j=1;j<IY.length-1;j++)for(let i=2;i<IX.length-1;i+=2){const x=IX[i]+T*2.3,y=IY[j]-T*1.35;if(surface(x,y)===PAVE)CITY_WORKS.stops.push({x,y,n:streetAt({x,y})+' · '+suburbAt(x,y)});}
 for(let i=0;i<IX.length;i++)for(let j=0;j<IY.length-1;j++){
  const x=IX[i],y0=IY[j]+130,y1=IY[j+1]-130,mid=(y0+y1)/2;
  if([SHAL,DEEP].includes(surface(x-160,mid))&&[SHAL,DEEP].includes(surface(x+160,mid))){
   const span={x,y0,y1};if(!CITY_WORKS.tunnel&&i>=3&&j>=2)CITY_WORKS.tunnel={...span,n:'HARBOUR TUNNEL'};else CITY_WORKS.bridges.push(span);
  }
 }
 for(let j=1;j<IY.length-1;j++)CITY_WORKS.overpasses.push({x:CITY_WORKS.freewayX,y:IY[j]});
 const shop=SHOPS.find(s=>s.type==='mart');if(shop&&!SHOPS.some(s=>s.type==='tech')){
  const other=SHOPS.filter(s=>s.type==='mart').at(-1);if(other&&other!==shop)other.type='tech';
 }
}
const setDimsBeforeExpansion=setDims;
setDims=function(M){setDimsBeforeExpansion(M);prepareCityWorks();};
SHOPINFO.tech={n:'APPLE STORE',ic:'⌘',c:'#d8e4e8',c2:'#182a33'};SHOP_ART.tech=3;
function drawCityExpansionGround(v,time){
 if(curMap!=='big')return;const visible=(x,y,r=250)=>x>v.x0-r&&x<v.x0+v.w+r&&y>v.y0-r&&y<v.y0+v.h+r;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 15px "Chakra Petch",sans-serif';
 // Three full-width lanes per direction, a divided median and shoulders.
 const x=CITY_WORKS.freewayX;if(x!=null&&x>v.x0-250&&x<v.x0+v.w+250){
  ctx.lineJoin='round';ctx.lineCap='butt';const y0=Math.max(0,v.y0-80),y1=Math.min(H,v.y0+v.h+80);
  ctx.setLineDash([]);ctx.strokeStyle='#303b41';ctx.lineWidth=300;freewayPath(0,y0,y1);ctx.stroke();
  ctx.strokeStyle='rgba(232,219,163,.46)';ctx.lineWidth=2;for(const off of [-4,4]){freewayPath(off,y0,y1);ctx.stroke();}
  ctx.strokeStyle='rgba(233,236,222,.36)';ctx.lineWidth=1.7;for(const [i,off]of [-92,-47,47,92].entries()){ctx.setLineDash([21+i*2,48,29,61+i*3]);ctx.lineDashOffset=-(y0+i*19);freewayPath(off,y0,y1);ctx.stroke();}ctx.setLineDash([]);
 }

 for(const p of CITY_WORKS.parks){if(!visible(p.x,p.y,400))continue;ctx.fillStyle='#555f63';ctx.fillRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h);ctx.strokeStyle='#e4dfbf';ctx.lineWidth=2;
  for(let xx=p.x-p.w/2+15;xx<p.x+p.w/2-30;xx+=48){ctx.strokeRect(xx,p.y-p.h/2+8,44,p.h*.25);ctx.strokeRect(xx,p.y+p.h*.25-8,44,p.h*.25);}
  ctx.fillStyle='#e8dc9c';ctx.fillText('P · '+p.n,p.x,p.y,Math.max(80,p.w-12));
 }
 for(const p of CITY_WORKS.pads){if(!visible(p.x,p.y))continue;ctx.fillStyle='#344c48';ctx.beginPath();ctx.arc(p.x,p.y,58,0,7);ctx.fill();ctx.strokeStyle='#fff4bd';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,49,0,7);ctx.stroke();ctx.fillStyle='#fff4bd';ctx.font='bold 58px sans-serif';ctx.fillText('H',p.x,p.y+3);ctx.font='700 15px sans-serif';}
 for(const b of CITY_WORKS.bridges){if(!visible(b.x,(b.y0+b.y1)/2,b.y1-b.y0))continue;for(const side of [-1,1]){ctx.fillStyle='#abb8b5';ctx.fillRect(b.x+side*100-5,b.y0,10,b.y1-b.y0);ctx.fillStyle='#33454a';for(let y=b.y0;y<b.y1;y+=95)ctx.fillRect(b.x+side*106-5,y,10,32);}}
 const tun=CITY_WORKS.tunnel;if(tun&&visible(tun.x,(tun.y0+tun.y1)/2,tun.y1-tun.y0)){
  ctx.fillStyle='#25343b';ctx.fillRect(tun.x-94,tun.y0,188,tun.y1-tun.y0);ctx.strokeStyle='#d4c798';ctx.lineWidth=3;ctx.setLineDash([25,20]);ctx.beginPath();ctx.moveTo(tun.x,tun.y0);ctx.lineTo(tun.x,tun.y1);ctx.stroke();ctx.setLineDash([]);
  for(const side of [-1,1])for(let y=tun.y0+35;y<tun.y1;y+=80){ctx.fillStyle='#ffe49a';ctx.fillRect(tun.x+side*86-3,y,6,22);}
  for(const y of [tun.y0,tun.y1]){ctx.fillStyle='#101d26';ctx.fillRect(tun.x-112,y-19,224,38);ctx.fillStyle='#83e3d0';ctx.fillText('↓ HARBOUR TUNNEL ↓',tun.x,y);}
 }
 for(const p of CITY_WORKS.stops){if(!visible(p.x,p.y))continue;ctx.fillStyle='#143d4b';ctx.fillRect(p.x-32,p.y-12,64,24);ctx.strokeStyle='#99d3da';ctx.strokeRect(p.x-32,p.y-12,64,24);ctx.fillStyle='#fff2bf';ctx.fillRect(p.x+39,p.y-14,4,30);ctx.fillStyle='#f2c44b';ctx.fillRect(p.x+31,p.y-26,20,18);ctx.fillStyle='#182d38';ctx.font='bold 13px sans-serif';ctx.fillText('B',p.x+41,p.y-17);ctx.font='700 15px sans-serif';}
 // Repeated signs keep street names readable without covering vehicles.
 for(let j=0;j<IY.length;j++)for(let i=0;i<IX.length;i++){
  const x=IX[i]+(IX[i]===CITY_WORKS.freewayX?235:135),y=IY[j]+135;if(!visible(x,y,100))continue;if(surface(x,y)===DEEP||surface(x,y)===SHAL)continue;
  ctx.fillStyle='#173f42';ctx.fillRect(x-70,y-11,140,22);ctx.strokeStyle='#92af9c';ctx.lineWidth=1;ctx.strokeRect(x-70,y-11,140,22);ctx.fillStyle='#f5efce';ctx.font='700 12px sans-serif';ctx.fillText(ROAD_NAMES.h[j%ROAD_NAMES.h.length],x,y,132);
  ctx.strokeStyle='#44565a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+86,y+10);ctx.lineTo(x+86,y-22);ctx.lineTo(x+72,y-22);ctx.stroke();ctx.fillStyle='#fce5a4';ctx.beginPath();ctx.ellipse(x+70,y-21,9,5,0,0,7);ctx.fill();
  if(surface(x+25,y+35)===PAVE){ctx.fillStyle='#477454';ctx.beginPath();ctx.arc(x+25,y+35,19,0,7);ctx.fill();ctx.fillStyle='#608559';ctx.beginPath();ctx.arc(x+20,y+30,12,0,7);ctx.fill();}
 }
 ctx.restore();
}
function drawOverpassDeck(p){ctx.save();ctx.fillStyle='rgba(10,19,25,.4)';ctx.fillRect(p.x-202,p.y-123,414,260);ctx.fillStyle='#3e4b53';ctx.fillRect(p.x-192,p.y-135,384,270);ctx.strokeStyle='rgba(206,215,201,.45)';ctx.lineWidth=2;for(const x of [p.x-190,p.x+190]){ctx.beginPath();ctx.moveTo(x,p.y-135);ctx.lineTo(x,p.y+135);ctx.stroke();}ctx.setLineDash([21,48,29,61]);ctx.lineWidth=2;for(const off of [-116,-62,62,116]){ctx.beginPath();ctx.moveTo(p.x+off,p.y-135);ctx.lineTo(p.x+off,p.y+135);ctx.stroke();}ctx.setLineDash([]);ctx.strokeStyle='#e3c056';ctx.beginPath();ctx.moveTo(p.x,p.y-135);ctx.lineTo(p.x,p.y+135);ctx.stroke();ctx.restore();}
const drawDetailsBeforeExpansion=drawCityDetails;
drawCityDetails=function(vp,time){drawDetailsBeforeExpansion(vp,time);if(curMap!=='big')return;for(const p of CITY_WORKS.overpasses){drawOverpassDeck(p);for(const c of [...traffic,...cars,...cops])if(cityLayer(c)===1&&Math.abs(c.x-p.x)<192&&Math.abs(c.y-p.y)<145){if(c.civ)drawTraffic(c);else drawCar0(c,time);}}drawContractWorld(vp,time);drawOpenWorldPeers(time);};

/* Expanded fleet: distinct outlines and detailed, cached canvas bodywork. */
const NEW_FLEET=[
 {id:'f458',n:'Ferrari 458',t:'Italian V8 supercar',col:'#dc282a',L:92,W:43,body:'wedge',c0:-20,c1:6,s:[1.3,1.28,1.2,1.05,1],premium:true,engine:'v8high',fleet:true},
 {id:'macan',n:'Porsche Macan',t:'Performance SUV',col:'#496477',L:94,W:45,nose:13,tail:7,c0:-31,c1:16,x:['rails','mirrors'],s:[1.13,1.18,1.14,1.8,1.4],engine:'v6',fleet:true},
 {id:'sl500',n:'Mercedes SL500',t:'V8 grand touring roadster',col:'#d0d7da',L:91,W:41,nose:17,tail:9,c0:-12,c1:9,open:true,x:['mirrors'],s:[1.18,1.17,1.12,1.5,1],engine:'v8',fleet:true},
 {id:'gwagon',n:'Mercedes G-Wagon',t:'Armoured-capable 4x4',col:'#313a34',L:96,W:47,nose:7,tail:3,c0:-33,c1:20,big:true,x:['rails','mirrors'],s:[1.02,.95,1.02,2.7,1.9],engine:'v8',fleet:true},
 {id:'raptor',n:'Ford Raptor',t:'Off-road performance pickup',col:'#e88a27',L:112,W:49,nose:11,tail:3,c0:-8,c1:23,big:true,x:['bed','rollbar','mirrors'],s:[1.08,1.05,1.05,2.8,2],engine:'v6',fleet:true},
 {id:'sti',n:'Subaru STI',t:'Turbo boxer AWD',col:'#2858bf',hub:'#d1ad4d',L:87,W:42,nose:13,tail:8,c0:-23,c1:9,x:['scoop','spoiler','mirrors'],s:[1.13,1.23,1.25,1.35,1.65],engine:'boxer',fleet:true},
 {id:'streetwagon',n:'Coastal Sport Wagon',t:'Australian V8 performance wagon',col:'#a7b1bb',L:101,W:44,nose:12,tail:5,c0:-34,c1:15,x:['rails','mirrors'],s:[1.09,1.1,1.08,1.65,1.1],engine:'v8',fleet:true}
];
for(const [i,d] of NEW_FLEET.entries()){d.price=[0,42000,48000,56000,38000,29000,18000][i];d.i=CATS.length;CATS.push(d);CAT[d.id]=d;CIVS.push(d);}
for(const [id,n,type,col,L,mass]of [['garbage','Garbage Truck','garbage','#427253',139,5.2],['crane','Crane Truck','crane','#e0ae31',150,5.8]]){
 const d={...CAT.boxtruck,id,n,t:n,col,L,commercial:type,s:[.59,.42,.67,mass,.85]};CAT[id]=d;COMMERCIAL.push(d);CIVS.push(d);
}
const paintCommercialBase=paintCommercial;
paintCommercial=function(g,d,lk){paintCommercialBase(g,d,lk);if(!['garbage','crane'].includes(d.commercial))return;g.save();g.lineJoin='round';g.strokeStyle='#19272b';g.lineWidth=2;
 if(d.commercial==='garbage'){g.fillStyle='#587a62';g.fillRect(-d.L/2+5,-d.W/2+3,d.L-42,d.W-6);g.strokeRect(-d.L/2+5,-d.W/2+3,d.L-42,d.W-6);for(let x=-d.L/2+12;x<d.L/2-40;x+=17){g.fillStyle='#9aaa8c';g.fillRect(x,-d.W/2+5,4,d.W-10);}g.fillStyle='#ded6a6';g.font='bold 19px sans-serif';g.textAlign='center';g.fillText('↻',-10,7);}
 else{g.fillStyle='#665b39';g.fillRect(-d.L/2+5,-d.W/2+3,d.L-40,d.W-6);for(const x of [-49,12])for(const y of [-22,18]){g.fillStyle='#eac144';g.fillRect(x,y,13,5);}g.strokeStyle='#172429';g.lineWidth=13;g.beginPath();g.moveTo(17,0);g.lineTo(-54,-8);g.stroke();g.strokeStyle='#eec34e';g.lineWidth=8;g.stroke();g.fillStyle='#26323a';g.beginPath();g.arc(17,0,11,0,7);g.fill();}g.restore();};
const paintCarBeforeFleet=paintCar;
paintCar=function(g,d,helm,bl,lk){paintCarBeforeFleet(g,d,helm,bl,lk);if(!d.fleet)return;g.save();g.strokeStyle='#1b252a';g.lineWidth=1.5;g.fillStyle='rgba(244,248,236,.65)';for(const side of [-1,1]){g.beginPath();g.ellipse(d.L/2-8,side*(d.W/2-6),4,3,-side*.3,0,7);g.fill();}if(d.id==='gwagon'){g.fillStyle='#27332e';g.strokeStyle='#a7b3a1';g.fillRect(-28,-15,44,30);g.strokeRect(-28,-15,44,30);g.fillStyle='#171d1c';g.beginPath();g.arc(-d.L/2+3,0,11,0,7);g.fill();}g.restore();};
// Preserve genuine price tables. Premium ownership is never granted by a pretend charge.
function openPremiumShowroom(h,id='f458'){const d=CAT[id]||CAT.f458;return cityModal(d.n+' · PREMIUM',({note,option})=>{let colour='#dc282a';note.textContent='A$7.99 · OWN FOR LIFE · App Store upgrades from A$4.99 to A$27.00. Purchases are available in the iPhone and iPad app; this browser preview cannot charge you.';for(const [name,hex]of [['RED','#dc282a'],['YELLOW','#f4cc36']])option(name,'Preview this finish',()=>{colour=hex;note.textContent=d.n+' · '+name+' selected. $7.99 lifetime purchase. Checkout is not connected.';const preview=carSprite(d,'#fff',{}, {paint:colour,wheel:'std'});preview.style.cssText='width:220px;max-width:100%;height:auto;display:block;margin:12px auto';const old=document.querySelector('#cityModal canvas');if(old)old.remove();document.querySelector('#cityModal .warehouse-menu').append(preview);});option('PURCHASE UNAVAILABLE','Purchases are not available in this preview.',()=>{},true);});}

/* Model-specific synthesised engine profiles; recordings can replace these later. */
const ENGINE_PROFILES={v8high:{harm:[0,1,.2,.7,.12,.45,.08,.3],pitch:1.7,filter:1.6},v8:{harm:[0,1,.65,.3,.45,.12,.15],pitch:.8,filter:.85},v6:{harm:[0,1,.3,.65,.12,.25],pitch:1.05,filter:1.1},boxer:{harm:[0,1,.8,.18,.55,.1,.3],pitch:.87,filter:1.2},diesel:{harm:[0,1,.9,.4,.22,.1],pitch:.55,filter:.6}};
const audioTickBeforeFleet=audioTick;
audioTick=function(dt){audioTickBeforeFleet(dt);if(!AC||!SND.ready)return;for(const p of ['p1','p2']){const c=cars.find(c=>c.player===p),e=SND.eng[p];if(!c||!e)continue;const key=c.def.engine||(c.def.commercial?'diesel':c.def.body==='wedge'?'v8high':'v6'),profile=ENGINE_PROFILES[key];if(e.profile!==key){const imaginary=Float32Array.from(profile.harm);e.o1.setPeriodicWave(AC.createPeriodicWave(new Float32Array(imaginary.length),imaginary));e.profile=key;}const speed=clamp(Math.abs(c.fs||0)/500,0,1.3),gear=Math.min(5,Math.floor(speed*5)),rev=(speed*5-gear)*95+55+gear*8;for(const o of [e.o1,e.o2])o.frequency.setTargetAtTime(rev*profile.pitch,AC.currentTime,.12);e.f.frequency.setTargetAtTime((400+speed*1300)*profile.filter,AC.currentTime,.1);}};
steerHelicopter=function(q,goal,tg,dt){
 q.a=Number.isFinite(q.a)?q.a:0;let dx=goal.x-q.x,dy=goal.y-q.y;const sx0=q.x-tg.x,sy0=q.y-tg.y,den=dx*dx+dy*dy,projection=den?clamp(-(sx0*dx+sy0*dy)/den,0,1):0;if(!q.leave&&Math.hypot(sx0+dx*projection,sy0+dy*projection)<350&&Math.hypot(sx0,sy0)>320){const angle=Math.atan2(sy0,sx0)+.65;dx=tg.x+Math.cos(angle)*480-q.x;dy=tg.y+Math.sin(angle)*480-q.y;}const dist=Math.hypot(dx,dy)||1,top=q.leave?450:330,desired=Math.min(top,dist*.9),blend=1-Math.exp(-dt*1.5);
 q.vx=(q.vx||0)+(dx/dist*desired-(q.vx||0))*blend;q.vy=(q.vy||0)+(dy/dist*desired-(q.vy||0))*blend;
 const sx=q.x-tg.x,sy=q.y-tg.y,safe=Math.hypot(sx,sy)||1;if(!q.leave&&safe<350){q.vx+=sx/safe*(350-safe)*dt*3;q.vy+=sy/safe*(350-safe)*dt*3;}
 q.x+=q.vx*dt;q.y+=q.vy*dt;const radius=Math.hypot(q.x-tg.x,q.y-tg.y);if(!q.leave&&radius<320){const angle=radius>.01?Math.atan2(q.y-tg.y,q.x-tg.x):q.orb||0;q.x=tg.x+Math.cos(angle)*320;q.y=tg.y+Math.sin(angle)*320;}const want=Math.hypot(q.vx,q.vy)>15?Math.atan2(q.vy,q.vx):q.a;q.a+=clamp(wrapA(want-q.a),-dt*1.1,dt*1.1);
};
function fireMilitaryMissile(q,h){if(inHarbourTunnel(h)||h.inside||h.jail||h.cuff||h.finished||h.hidden||q.dead)return false;const lead=.5,a=Math.atan2(h.y+(h.vy||0)*lead-q.y,h.x+(h.vx||0)*lead-q.x);shots.push({x:q.x+Math.cos(a)*50,y:q.y+Math.sin(a)*50,vx:Math.cos(a)*520,vy:Math.sin(a)*520,owner:q,life:3,shell:true,military:true});h.msg='MISSILE INBOUND · MOVE!';h.msgT=2;sfx(200,.3,'sawtooth',-130,.06);return true;}
function drawPunchArm(c){const phase=clamp(1-c.punchT/.22,0,1),reach=Math.sin(phase*Math.PI),side=c.punchSide?1:-1;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#19242b';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(1,side*9);ctx.lineTo(10+reach*8,side*(12-reach*4));ctx.lineTo(13+reach*21,side*8);ctx.stroke();ctx.strokeStyle=c.pd.skin;ctx.lineWidth=6;ctx.stroke();ctx.fillStyle=c.pd.skin;ctx.beginPath();ctx.arc(13+reach*21,side*8,4,0,7);ctx.fill();ctx.restore();}

/* SMS contracts: 300 deterministic routes across seven job families. */
let CONTRACT=null;
const JOB_FAMILIES=[['netball','Sister','Netball drop-off','Pick me up and get me to netball before the match starts.'],['ride','Ride dispatch','Passenger pickup','A passenger has called. Stop at the pickup, then deliver them safely.'],['delivery','Coastal courier','Delivery run','Collect the parcel and deliver it across town.'],['crew','Crew contact','Heist crew pickup','Collect the crew, evade any pursuit, and reach the safe drop-off.'],['dinosaur','Research transport','Dinosaur transport','Take the heavy transport truck. Keep the dinosaur safe and avoid attracting the police.'],['race','Night crew','Midnight street sprint','Night meet. Crowds, lights and a checkpoint race against the clock.'],['tech','Heist contact','Apple Store job','Enter the Apple Store on foot, take the takings and lose the police before the handoff.']];
function sms(h,from,body,key){const w=save[h.player];w.sms=w.sms||[];if(key&&w.sms.some(m=>m.key===key))return;w.sms.push({from,body,key,at:Date.now()});w.sms=w.sms.slice(-80);persist();h.msg='SMS · '+from.toUpperCase()+' · '+body;h.msgT=5;}
function jobCatalogue(){const points=[];for(let j=1;j<IY.length-1;j++)for(let i=1;i<IX.length-1;i++)if(![SHAL,DEEP,BUILD].includes(surface(IX[i]+48,IY[j]+48)))points.push({x:IX[i]+48,y:IY[j]+48});if(points.length<4)return [];
 return Array.from({length:300},(_,i)=>{const tier=1+Math.floor(i/30),family=JOB_FAMILIES[i%JOB_FAMILIES.length],pickup=points[(i*7+3)%points.length];let dest=points[(i*13+17+tier)%points.length];if(Math.hypot(dest.x-pickup.x,dest.y-pickup.y)<700)dest=points[(points.indexOf(pickup)+Math.floor(points.length/2))%points.length];const route=[];for(let k=0;k<Math.min(3+Math.floor(tier/2),8);k++)route.push(points[(i*11+k*7+5)%points.length]);const distance=Math.abs(dest.x-pickup.x)+Math.abs(dest.y-pickup.y),seconds=Math.ceil(distance/(100+tier*5))+90-tier*3;
 return{id:'job-'+String(i+1).padStart(3,'0'),number:i+1,tier,kind:family[0],from:family[1],n:family[2]+' '+String(i+1).padStart(3,'0'),body:family[3],pickup,dest,route,seconds:Math.max(75,seconds),pay:300+tier*175+i%7*45};});}
function contractTarget(){if(!CONTRACT)return null;const J=CONTRACT;if(J.phase==='pickup')return J.job.pickup;if(J.job.kind==='race')return J.job.route[J.cp]||J.job.dest;if(J.job.kind==='tech'&&J.phase==='store')return SHOPS.find(s=>s.type==='tech'||s.type==='mart')||null;return J.job.dest;}
function openJobBoard(h){if(NET.playing){toast('Leave the two-player session before using SMS contracts.');return;}let tab='jobs',page=0;return cityModal('SMS · COASTAL DISPATCH',({card,note,option,close})=>{
 const root=document.createElement('div');root.className='dispatch-content';card.append(root);
 const draw=()=>{root.replaceChildren();const w=save[h.player],done=w.jobsDone||[],list=jobCatalogue();note.textContent=done.length+'/300 CONTRACTS COMPLETE · '+money(w.cash)+(CONTRACT?' · ACTIVE: '+CONTRACT.job.n:'');
 const premium=document.createElement('button');premium.type='button';premium.className='warehouse-option';premium.textContent='PREMIUM GARAGE · A$7.99 CARS';premium.onclick=()=>{close();openPremiumGarage(h);};root.append(premium);const tabs=document.createElement('div');tabs.className='dispatch-tabs';for(const [key,label]of [['jobs','AVAILABLE JOBS'],['messages','MESSAGES']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(tab===key));b.onclick=()=>{tab=key;page=0;draw();};tabs.append(b);}root.append(tabs);
 if(tab==='messages'){for(const m of [...(w.sms||[])].reverse()){const article=document.createElement('article'),head=document.createElement('strong'),text=document.createElement('p');head.textContent=m.from;text.textContent=m.body;article.append(head,text);root.append(article);}if(!w.sms?.length){const p=document.createElement('p');p.textContent='Your messages will appear here.';root.append(p);}return;}
 if(CONTRACT){const p=document.createElement('p');p.textContent='Current job: '+CONTRACT.job.n+' · '+Math.ceil(CONTRACT.remaining)+'s remaining';const b=document.createElement('button');b.type='button';b.textContent='CANCEL CURRENT JOB';b.onclick=()=>{endContract(h,false,'Cancelled by driver');draw();};root.append(p,b);return;}
 const tier=Math.min(10,1+Math.floor(done.length/30)),available=list.filter(j=>!done.includes(j.id));const caption=document.createElement('p');caption.textContent='300 route contracts · 7 job types · Tier '+tier+'/10. Finish 30 jobs to unlock the next tier. Career bonuses: 3 jobs $500 · 10 jobs $1,000 · 30 jobs $2,000. First car goal: Breeze $4,500.';root.append(caption);
 for(const job of available.slice(page*7,page*7+7)){const b=document.createElement('button');b.type='button';b.className='warehouse-option';b.disabled=job.tier>tier||!!MS||!!OPEN_WORLD.claims[job.id]||OPEN_WORLD.completed.includes(job.id);const title=document.createElement('b'),detail=document.createElement('small');title.textContent=job.n+' · '+money(job.pay);detail.textContent='TIER '+job.tier+' · '+Math.ceil(job.seconds)+'s · '+(OPEN_WORLD.completed.includes(job.id)?'COMPLETED BY ANOTHER DRIVER':OPEN_WORLD.claims[job.id]?'TAKEN BY ANOTHER DRIVER':job.tier>tier?'LOCKED':job.body);b.append(title,detail);b.onclick=()=>{close();acceptContract(h,job);};root.append(b);}
 const nav=document.createElement('div');nav.className='dispatch-tabs';for(const [delta,label]of [[-1,'← PREVIOUS'],[1,'NEXT →']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=page+delta<0||(page+delta)*7>=available.length;b.onclick=()=>{page+=delta;draw();};nav.append(b);}root.append(nav);if(MS||camp().jobMode){const b=document.createElement('button');b.type='button';b.textContent=MS?'SET STORY ASIDE · TAKE DISPATCH JOBS':'RETURN TO STORY';b.onclick=()=>{if(MS){MS=null;camp().jobMode=true;}else camp().jobMode=false;persist();draw();};root.append(b);}
 };draw();});}
function acceptContract(h,job){if(CONTRACT||MS||!missionAvailable(h))return false;const w=save[h.player],tier=Math.min(10,1+Math.floor((w.jobsDone||[]).length/30));if(job.tier>tier||(w.jobsDone||[]).includes(job.id))return false;
 CONTRACT={job,phase:'pickup',remaining:job.seconds+120,cp:0,damage:h.dmg||0,robbedAt:SHOPS.find(s=>s.type==='tech'||s.type==='mart')?.robbedAt??-1};closePhone(h);sms(h,job.from,job.body+' Pickup marked in cyan.',job.id+'-accepted');
 if(job.kind==='dinosaur'){
  const d=CAT.boxtruck,p=job.pickup,t={civ:true,human:false,state:'parked',def:d,locked:false,r:40,m:d.s[3],x:p.x+55,y:p.y,a:0,da:0,dx:p.x+55,dy:p.y,vx:0,vy:0,spin:0,lt:0,hitT:0,speed:0,dir:1,axis:'h',lane:p.y};traffic.push(t);CONTRACT.loaner=t;sms(h,'Research transport','A transport truck is waiting at pickup. Board it to load the dinosaur.',job.id+'-truck');
 }return true;}
function endContract(h,passed,why){if(!CONTRACT)return;const J=CONTRACT,w=save[h.player];CONTRACT=null;if(J.loaner&&traffic.includes(J.loaner))traffic=traffic.filter(t=>t!==J.loaner);
 if(passed){w.jobsDone=w.jobsDone||[];if(!w.jobsDone.includes(J.job.id)){w.jobsDone.push(J.job.id);w.cash+=J.job.pay;const bonus={3:500,10:1000,30:2000}[w.jobsDone.length];if(bonus){w.cash+=bonus;sms(h,'UNCLE RAY',w.jobsDone.length+' jobs done. You earned a '+money(bonus)+' milestone bonus. Put it towards the Rustbucket or your next car.','career-'+w.jobsDone.length);}}sms(h,J.job.from,'Job complete. '+money(J.job.pay)+' paid to your card. '+w.jobsDone.length+'/300 complete.',J.job.id+'-complete');refreshBank();}
 else sms(h,J.job.from,'Job failed: '+why+'. You can retry from SMS.');persist();}
function updateContract(dt){if(!CONTRACT||!CAMP())return;const h=cars.find(c=>c.human);if(!h)return;const J=CONTRACT;J.remaining-=dt;if(J.remaining<=0||h.jail||h.cuff||h.finished||h.dmg>=100){endContract(h,false,J.remaining<=0?'Out of time':'Driver unavailable');return;}
 if(J.phase==='pickup'){if(!h.foot&&!h.boat&&Math.hypot(h.x-J.job.pickup.x,h.y-J.job.pickup.y)<175&&Math.hypot(h.vx,h.vy)<35){if(J.job.kind==='dinosaur'&&!h.def.commercial)return;J.phase=J.job.kind==='tech'?'store':'dropoff';J.remaining=J.job.seconds;J.damage=h.dmg;J.robbedAt=SHOPS.find(s=>s.type==='tech'||s.type==='mart')?.robbedAt??-1;sms(h,J.job.from,J.job.kind==='tech'?'Enter the marked Apple Store on foot.':'Loaded. Destination marked. Keep moving.');}return;}
 if(J.job.kind==='dinosaur'&&(h.foot||h.def.id!=='boxtruck'||h.dmg-J.damage>35||h.wanted>=2)){endContract(h,false,h.wanted>=2?'Police alerted':'Cargo damaged or transport abandoned');return;}
 if(J.job.kind==='race'){const p=J.job.route[J.cp];if(p&&Math.hypot(h.x-p.x,h.y-p.y)<150&&!h.foot){J.cp++;sfx(900,.1,'triangle');}if(J.cp>=J.job.route.length){endContract(h,true);return;}}
 else if(J.job.kind==='tech'&&J.phase==='store'){const sh=SHOPS.find(s=>s.type==='tech'||s.type==='mart');if(sh&&(sh.robbedAt??-1)!==J.robbedAt&&!h.inside){J.phase='dropoff';sms(h,J.job.from,'Takings collected. Lose the cops before the handoff.');}}
 else if(!h.foot&&!h.inside&&Math.hypot(h.x-J.job.dest.x,h.y-J.job.dest.y)<175&&Math.hypot(h.vx,h.vy)<35){if((J.job.kind==='crew'||J.job.kind==='tech')&&h.wanted>.01)return;endContract(h,true);}
}
function drawContractWorld(vp,time){if(!CONTRACT)return;const p=contractTarget();if(!p)return;ctx.save();const h0=vp.car;if(!CONTRACT.routeAt||simT-CONTRACT.routeAt>.5){CONTRACT.routeAt=simT;CONTRACT.nav=gpsRoute(h0,p);}ctx.strokeStyle='rgba(118,228,208,.5)';ctx.lineWidth=9;ctx.lineJoin='round';ctx.beginPath();for(const [i,q]of (CONTRACT.nav||[]).entries())i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);ctx.stroke();ctx.strokeStyle='#76e4d0';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,85+Math.sin(time*.004)*5,0,7);ctx.stroke();ctx.font='bold 17px sans-serif';ctx.fillStyle='#c4fff0';ctx.textAlign='center';ctx.fillText(CONTRACT.phase==='pickup'?'STOP HERE · PICKUP':CONTRACT.job.kind==='tech'&&CONTRACT.phase==='store'?'ENTER APPLE STORE':'DESTINATION',p.x,p.y-110);ctx.restore();
 if(CONTRACT.job.kind==='race'){for(const [i,q]of CONTRACT.job.route.entries()){if(i!==CONTRACT.cp)continue;ctx.save();ctx.translate(q.x,q.y);for(let k=0;k<12;k++){const a=k*Math.PI/6;drawPed({x:Math.cos(a)*195,y:Math.sin(a)*195,a:a+Math.PI,ph:0,skin:SKIN[k%SKIN.length],shirt:SHIRT[k%SHIRT.length],hair:HAIR[k%HAIR.length],down:0},time);}ctx.strokeStyle='#9b78ff';ctx.lineWidth=2;for(const a of [-.8,.8]){ctx.beginPath();ctx.moveTo(-200,200);ctx.lineTo(Math.cos(time*.001+a)*400,-400);ctx.stroke();}ctx.restore();}}
 if(CONTRACT.job.kind==='dinosaur'&&CONTRACT.phase!=='pickup'){const h=vp.car;if(h.def.commercial){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a);ctx.fillStyle='#79986a';ctx.strokeStyle='#243829';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-15,0,25,11,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-35,0);ctx.lineTo(-55,-8);ctx.lineTo(-32,7);ctx.fill();ctx.beginPath();ctx.ellipse(14,-5,11,7,-.3,0,7);ctx.fill();ctx.restore();}}
}
const updateMissionBeforeContracts=updateMission;
updateMission=function(dt){if(CONTRACT||(camp().jobMode&&camp().garageLevel))return;updateMissionBeforeContracts(dt);};
const dayNightBeforeContracts=dayNight;
dayNight=function(){return CONTRACT?.job.kind==='race'&&CONTRACT.phase!=='pickup'?{na:.72,sun:0}:dayNightBeforeContracts();};

/* Reworked convenience/electronics interiors: aisles, collision, checkout and exit. */
function retailObstacles(type){return type==='tech'?[{x:.18,y:.3,w:.23,h:.1},{x:.59,y:.3,w:.23,h:.1},{x:.18,y:.55,w:.23,h:.1},{x:.59,y:.55,w:.23,h:.1}]:[{x:.18,y:.3,w:.14,h:.38},{x:.43,y:.3,w:.14,h:.38},{x:.68,y:.3,w:.14,h:.38}];}
function retailMove(I,dx,dy){const blocked=(x,y)=>retailObstacles(I.sh.type).some(o=>x>o.x-.025&&x<o.x+o.w+.025&&y>o.y-.035&&y<o.y+o.h+.035);const nx=clamp(I.px+dx,.06,.94),ny=clamp(I.py+dy,.2,.98);if(!blocked(nx,I.py))I.px=nx;if(!blocked(I.px,ny))I.py=ny;}
function retailCheckout(h){const I=h.inside;if(!I||!['mart','tech'].includes(I.sh.type)||Math.hypot((I.px??.5)-.83,(I.py??.78)-.79)>.22)return false;return cityModal('TAP CREDIT CARD',({note,option})=>{note.textContent='Pay from your in-game bank balance: '+money(save[h.player].cash);if(I.sh.type==='tech')option('PHONE REPAIR · $40','Restore phone service; no real-money charge',()=>{if(spend(h,40))note.textContent='CARD APPROVED · Phone serviced · BANK '+money(save[h.player].cash);else note.textContent='CARD DECLINED · Not enough funds';});else for(const [name,cost,health]of [['WATER',5,10],['SANDWICH',12,30],['FIRST-AID KIT',35,65]])option(name+' · '+money(cost),'Tap card · restore '+health+' health',()=>{if((h.body||0)<=0){note.textContent='You are already at full health.';return;}if(spend(h,cost)){h.body=Math.max(0,(h.body||0)-health);h.dmg=h.body;note.textContent='CARD APPROVED · '+name+' · BANK '+money(save[h.player].cash);}else note.textContent='CARD DECLINED · Not enough funds';});});}
const updateInsideBeforeRetail=updateInside;
updateInside=function(h,dt){const I=h.inside;if(I.sh.type!=='tech')return updateInsideBeforeRetail(h,dt);I.t+=dt;I.px=I.px??.5;I.py=I.py??.78;let mx=Number(held(h.keyset,'right'))-Number(held(h.keyset,'left')),my=Number(held(h.keyset,'down'))-Number(held(h.keyset,'up'));const st=stickFor(h);if(st){mx=st.x;my=st.y;}if(I.walkTo&&Math.hypot(mx,my)<.1){mx=I.walkTo.x-I.px;my=I.walkTo.y-I.py;if(Math.hypot(mx,my)<.025){I.walkTo=null;mx=my=0;}}else if(Math.hypot(mx,my)>.1)I.walkTo=null;const len=Math.max(1,Math.hypot(mx,my));retailMove(I,mx/len*dt*.28,my/len*dt*.28);if(tapped(h.keyset,'exit')||(I.py>.945&&Math.abs(I.px-.5)<.14&&my>0)){leaveShop(h);return;}
 const intruders=cops.flatMap(c=>c.offs||[]).filter(o=>o.room===I.sh.id&&o.down<=0);if(intruders.length&&held(h.keyset,'fire')){if(h.gun?.ammo>0){if((h.gunCD||0)<=simT){h.gunCD=simT+.25;h.gun.ammo--;intruders[0].down=3;h.searchNoiseUntil=simT+2;}}else if(tapped(h.keyset,'fire'))fightOfficer(h);return;}
 const empty=(I.sh.robbedAt??-999)>simT-120;if(!I.done&&!empty&&held(h.keyset,'fire')&&Math.hypot(I.px-.83,I.py-.79)<.23){I.robT+=dt;if(I.robT>=1.8){I.done=true;I.amt=I.sh.type==='tech'?650:200;I.sh.robbedAt=simT;save[h.player].cash+=I.amt;persist();refreshBank();h.wanted=Math.max(h.wanted,2);addWanted(h,.5);h.hidden=false;h.robCall={x:h.x,y:h.y,until:simT+60,n:0};h.msg='ALARM · POLICE CALLED';h.msgT=4;}}else if(!held(h.keyset,'fire'))I.robT=Math.max(0,I.robT-dt*2);
};
const autoDoorBeforeRetail=autoShopDoor;
autoShopDoor=function(h){if(h.foot&&!h.inside&&!h.jail&&!h.cuff&&!(h.doorLockUntil>simT)){const sh=SHOPS.find(s=>s.type==='tech'&&Math.hypot(h.x-shopDoor(s).x,h.y-shopDoor(s).y)<38);if(sh){enterShop(h,sh);h.doorLockUntil=simT+2;return;}}autoDoorBeforeRetail(h);};
const drawInteriorBeforeRetail=drawInterior;
drawInterior=function(vp,c,time,u){const I=c.inside;if(I.sh.type!=='tech')return drawInteriorBeforeRetail(vp,c,time,u);const x=vp.x,w=vp.w,h=vp.h,tech=I.sh.type==='tech';ctx.save();ctx.fillStyle=tech?'#dbe5e6':'#ddd6bd';ctx.fillRect(x,0,w,h);ctx.strokeStyle='rgba(40,63,66,.13)';ctx.lineWidth=1;for(let yy=h*.18;yy<h;yy+=38){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();}for(let xx=x;xx<x+w;xx+=38){ctx.beginPath();ctx.moveTo(xx,h*.18);ctx.lineTo(xx,h);ctx.stroke();}
 ctx.fillStyle='#163941';ctx.fillRect(x,0,w,h*.18);ctx.fillStyle='#e4ce7a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.min(34,w/22)}px sans-serif`;ctx.fillText(tech?'⌘ APPLE STORE':'QUICK MART · OPEN 24 HOURS',x+w*.5,h*.09,w*.92);
 for(const o of retailObstacles(I.sh.type)){const xx=x+o.x*w,yy=o.y*h,ww=o.w*w,hh=o.h*h;ctx.fillStyle='#0002';ctx.fillRect(xx+6,yy+8,ww,hh);ctx.fillStyle=tech?'#c09f77':'#697971';ctx.fillRect(xx,yy,ww,hh);ctx.strokeStyle='#30474a';ctx.lineWidth=3;ctx.strokeRect(xx,yy,ww,hh);for(let k=0;k<4;k++)for(let r=0;r<(tech?1:5);r++){ctx.fillStyle=tech?'#1d343f':['#b85541','#e7be5b','#62834d','#6b98a6'][(k+r)%4];ctx.fillRect(xx+ww*.1+k*ww*.21,yy+hh*.08+r*hh*.18,ww*.15,hh*(tech?.65:.11));}}
 ctx.fillStyle='#254f54';ctx.fillRect(x+w*.74,h*.72,w*.2,h*.12);ctx.fillStyle='#9be8d3';ctx.fillRect(x+w*.8,h*.745,w*.07,h*.045);ctx.font=`bold ${Math.min(15,w/38)}px sans-serif`;ctx.fillStyle='#e5f3d4';ctx.fillText('TAP CARD',x+w*.84,h*.87);
 ctx.fillStyle='#255646';ctx.fillRect(x+w*.39,h*.95,w*.22,h*.05);ctx.fillStyle='#eff3d8';ctx.fillText('EXIT ↓',x+w*.5,h*.975);
 c.pd=c.pd||{skin:SKIN[0],hair:HAIR[0]};ctx.save();ctx.translate(x+w*(I.px??.5),h*(I.py??.78));ctx.scale(2*u,2*u);drawPed({...c.pd,isJack:true,appearance:save[c.player]?.appearance||'redline',x:0,y:0,a:-Math.PI/2,ph:time*.006,shirt:PCOL[c.player],down:0},time);ctx.restore();
 for(const cop of cops)for(const o of cop.offs||[])if(o.room===I.sh.id){ctx.save();ctx.translate(x+w*o.rx,h*o.ry);ctx.scale(2*u,2*u);drawPed({...o.pd,x:0,y:0,a:Math.PI/2,shirt:'#21364d',ph:time*.006,down:o.down>0?1:0},time);ctx.restore();}
 ctx.font=`700 ${Math.min(17,w/35)}px sans-serif`;ctx.fillStyle='#183b42';ctx.fillText(I.done?'ALARM · '+money(I.amt)+' TAKEN · LEAVE THE STORE':'Walk the aisles · Tap card at checkout · Hold FIRE at till to rob',x+w*.5,h*.215,w*.94);if(I.robT>0&&!I.done){ctx.fillStyle='#172b34';ctx.fillRect(x+w*.74,h*.9,w*.2,8);ctx.fillStyle='#e9a957';ctx.fillRect(x+w*.74,h*.9,w*.2*Math.min(1,I.robT/1.8),8);}ctx.restore();};
addEventListener('pointerdown',e=>{if(e.target!==cv||paused||COMIC||state!=='race')return;const h=cars.find(c=>c.human&&c.inside?.sh.type==='tech');if(!h)return;const v=viewports().find(v=>v.car===h);if(!v)return;const x=(e.clientX-v.x)/v.w,y=e.clientY/v.h;if(x>.73&&x<.97&&y>.7&&y<.91){retailCheckout(h);return;}h.inside.walkTo={x:clamp(x,.06,.94),y:clamp(y,.2,.98)};},true);

fuelPurchase=function(h,amount){if(h.foot||onShop(h)?.type!=='fuel'||Math.hypot(h.vx,h.vy)>45)return{ok:false,note:'Stop your car on the petrol station forecourt.'};const units=Math.min(Math.max(0,100-(h.fuel??100)),Math.max(0,amount)),cost=Math.ceil(units*2);if(!units)return{ok:false,note:'Tank already full.'};if(!spend(h,cost))return{ok:false,note:'CARD DECLINED · Not enough funds.'};h.fuel=Math.min(100,(h.fuel??0)+units);return{ok:true,note:'CARD APPROVED · '+money(cost)+' · TANK '+Math.round(h.fuel)+'%'};};
openFuelStop=function(h){if(h.foot||onShop(h)?.type!=='fuel'||Math.hypot(h.vx,h.vy)>45)return;return cityModal('PETROL · TAP CARD',({note,option})=>{note.textContent='TANK '+Math.round(h.fuel??100)+'% · BANK '+money(save[h.player].cash)+' · $2 per fuel unit (in-game money)';for(const amount of [25,100]){const cost=Math.ceil(Math.min(100-(h.fuel??100),amount)*2);option((amount===100?'FILL TANK':'ADD UP TO 25%')+' · '+money(cost),'Tap card to pay from your game balance',()=>{const r=fuelPurchase(h,amount);note.textContent=r.note+' · BANK '+money(save[h.player].cash);});}});};

function buildingDoor(b){return{x:(b.x0+b.x1)/2,y:b.y1};}
const updateFootBeforeDoors=updateFoot;
updateFoot=function(c,dt){const ox=c.x,oy=c.y,before=insideBuilding(c);updateFootBeforeDoors(c,dt);if(c.inside||c.swim)return;const after=insideBuilding(c);if(after===before)return;const b=after||before;if(!b||b.jail)return;const door=buildingDoor(b),shop=SHOPS.find(sh=>shopArtParcel(sh)?.b===b),sd=shop&&shopDoor(shop),near=Math.min(Math.hypot(c.x-door.x,c.y-door.y),sd?Math.hypot(c.x-sd.x,c.y-sd.y):Infinity);if(near>48){c.x=ox;c.y=oy;c.vx=c.vy=0;}};
const drawBuildingBeforeDoors=drawBuilding;
drawBuilding=function(b,cam){drawBuildingBeforeDoors(b,cam);if(b.barn||b.silo)return;const d=buildingDoor(b);ctx.save();ctx.fillStyle='#142c31';ctx.fillRect(d.x-18,d.y-8,36,16);ctx.strokeStyle='#e7c967';ctx.lineWidth=2;ctx.strokeRect(d.x-18,d.y-8,36,16);ctx.fillStyle='#e7c967';ctx.beginPath();ctx.arc(d.x+10,d.y,2,0,7);ctx.fill();ctx.restore();};
function updateCityExpansion(dt){if(!CAMP()||state!=='race')return;prepareCityWorks();tickOpenWorld(dt);updateContract(dt);for(const h of cars){if(!h.human)continue;const park=CITY_WORKS.parks.find(p=>Math.abs(h.x-p.x)<p.w/2&&Math.abs(h.y-p.y)<p.h/2);if(park&&!h.foot&&Math.hypot(h.vx,h.vy)<8&&h.wanted>0&&!pursuitWitness(h)){h.parkHide=(h.parkHide||0)+dt;if(h.parkHide>3&&!h.hidden){h.lastKnown=h.lastKnown||{x:h.x,y:h.y,vx:0,vy:0};h.hidden=true;h.sus=0;h.msg='PARKED OUT OF SIGHT · STAY QUIET';h.msgT=3;}}else h.parkHide=0;
 if(h.foot&&h.inside&&['mart','tech'].includes(h.inside.sh.type)&&pressed.has('KeyE'))retailCheckout(h);
 if(!h.smsWelcomed){h.smsWelcomed=true;sms(h,'Coastal dispatch','Open SMS for 300 contracts: rides, deliveries, netball, heist pickups, dinosaur transport and night races.','dispatch-welcome');}
 }
}
let expansionUIReady=false;
function syncExpansionUI(){
 if(!expansionUIReady){const style=document.createElement('style');style.textContent=`.warehouse-menu{box-sizing:border-box;max-height:calc(100dvh - 24px);max-width:calc(100vw - 24px);overflow:auto}.dispatch-tabs{display:flex;gap:8px;margin:12px 0}.dispatch-tabs button{flex:1;padding:12px;background:#26434b;color:#edf6dd;border:1px solid #71908b;font:700 12px sans-serif}.dispatch-tabs [aria-pressed=true]{background:#e6cc76;color:#153339}.dispatch-content article{padding:14px;margin:12px 0;background:#213f46;border-left:3px solid #80d5c0}.dispatch-content article p{margin:8px 0;line-height:1.5}.city-strip{position:fixed;z-index:6;bottom:12px;left:50%;transform:translateX(-50%);max-width:70vw;padding:8px 15px;color:#f2ecd1;background:#102a35e8;border:1px solid #708c82;border-radius:6px;font:700 12px/1.5 sans-serif;text-align:center;pointer-events:none}.city-sms{position:fixed;z-index:8;top:90px;right:12px;min-height:44px;padding:10px 14px;color:#e4ead3;background:#153640;border:2px solid #7fbaa8;border-radius:6px;font:800 12px sans-serif}.city-online{top:140px}.city-checkout{position:fixed;z-index:8;bottom:80px;right:20px;padding:14px;background:#d2e8a6;color:#153832;border:3px solid #183c40;font:800 14px sans-serif}.city-contract{position:fixed;z-index:6;top:155px;left:50%;transform:translateX(-50%);max-width:80vw;padding:10px 18px;color:#c5fff0;background:#102e38ec;border:1px solid #5ac6b1;border-radius:6px;font:800 13px/1.5 sans-serif;text-align:center;pointer-events:none}@media(max-width:700px){.city-strip{bottom:6px;padding:4px 8px;max-width:65vw;font-size:10px}.city-sms{top:84px;right:8px;padding:8px;font-size:10px}.city-online{top:132px}.city-contract{top:185px;padding:6px;font-size:11px;max-width:75vw}}`;document.head.append(style);
 for(const [id,cls,tag]of [['cityLocation','city-strip','div'],['citySMS','city-sms','button'],['cityCheckout','city-checkout','button'],['cityContract','city-contract','div'],['cityOnline','city-sms city-online','button']]){const el=document.createElement(tag);el.id=id;el.className=cls;if(tag==='button')el.type='button';document.body.append(el);}expansionUIReady=true;
 }
 const h=cars.find(c=>c.human),visible=h&&CAMP()&&state==='race'&&!paused&&!COMIC&&!rotationRequired()&&!document.getElementById('characterPicker'),loc=document.getElementById('cityLocation'),button=document.getElementById('citySMS'),checkout=document.getElementById('cityCheckout'),contract=document.getElementById('cityContract');
 const online=document.getElementById('cityOnline');for(const el of [loc,button,checkout,contract,online])el.hidden=true;if(!visible)return;
 if(!h.inside){loc.hidden=false;loc.textContent=streetAt(h)+' · '+suburbAt(h.x,h.y)+(inHarbourTunnel(h)?' · HARBOUR TUNNEL':h.parkHide>0?' · CAR PARK':'');button.hidden=false;button.textContent='SMS · JOBS';button.onclick=()=>openJobBoard(h);online.hidden=false;online.textContent=OPEN_WORLD.joined?'ONLINE · '+(OPEN_WORLD.peers.size+1)+'/8':'OPEN MAP';online.onclick=()=>openWorldMenu(h);}
 if(h.inside&&['mart','tech'].includes(h.inside.sh.type)&&Math.hypot((h.inside.px??.5)-.83,(h.inside.py??.78)-.79)<.22){checkout.hidden=false;checkout.textContent='TAP CREDIT CARD · E';checkout.onclick=()=>retailCheckout(h);}
 if(CONTRACT&&!h.inside){contract.hidden=false;const p=contractTarget(),a=p?wrapA(Math.atan2(p.y-h.y,p.x-h.x)-h.a):0;contract.textContent=CONTRACT.job.n+' · '+Math.ceil(CONTRACT.remaining)+'s · '+(CONTRACT.phase==='pickup'?'PICKUP':CONTRACT.phase==='store'?'ENTER STORE':'DROPOFF')+(p?' · '+Math.round(Math.hypot(p.x-h.x,p.y-h.y)/10)+'m '+(Math.abs(a)<.6?'↑':a>0?'→':'←'):'');}
 const service=document.getElementById('cityService');if(service&&!service.hidden&&onShop(h)?.type==='fuel'&&!h.foot)service.textContent=Math.hypot(h.vx,h.vy)>45?'STOP ON THE FORECOURT':'REFUEL · TAP CARD · E';
}
prepareCityWorks();

/* Shared open-map presence and first-come mission claims on the companion server. */
const OPEN_WORLD={socket:null,id:null,peers:new Map(),claims:{},completed:[],pending:null,sendT:0,joined:false};
function sendOpenWorld(message){if(OPEN_WORLD.socket?.readyState===WebSocket.OPEN)OPEN_WORLD.socket.send(JSON.stringify(message));}
function disconnectOpenWorld(){OPEN_WORLD.socket?.close();OPEN_WORLD.socket=null;OPEN_WORLD.joined=false;OPEN_WORLD.id=null;OPEN_WORLD.peers.clear();OPEN_WORLD.claims={};OPEN_WORLD.completed=[];OPEN_WORLD.pending=null;}
function openWorldMenu(h){return cityModal('OPEN MAP · MULTIPLAYER',({note,option,close})=>{note.textContent=OPEN_WORLD.joined?'Connected · '+(OPEN_WORLD.peers.size+1)+'/8 drivers. Everyone on this server and city shares the job board.':'Join up to 8 drivers and compete to claim jobs. Other players share your map; traffic and police are local to your game.';if(OPEN_WORLD.joined)option('LEAVE OPEN MAP','Return to solo driving',()=>{disconnectOpenWorld();close();});else option('JOIN OPEN MAP','Drive with up to 8 players and compete for jobs.',()=>{close();connectOpenWorld(h);});});}
function connectOpenWorld(h){if(NET.playing){toast('Leave the two-player session before joining Open Map.');return;}if(OPEN_WORLD.socket)return;if(location.protocol==='file:'&&!window.JACK_ONLINE_URL){toast('Online map is unavailable in this app build. You can keep playing solo.');return;}const ws=new WebSocket(window.JACK_ONLINE_URL||((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/open-map'));OPEN_WORLD.socket=ws;let welcomed=false;
 ws.onopen=()=>sendOpenWorld({type:'join',city:CITY,name:save[h.player].name||ME().name||'Driver'});
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m.type==='welcome'){welcomed=true;OPEN_WORLD.joined=true;OPEN_WORLD.id=m.id;toast('OPEN MAP CONNECTED · '+m.players.length+'/8 drivers');}if(m.type==='welcome'||m.type==='snapshot'){OPEN_WORLD.claims=m.claims||{};OPEN_WORLD.completed=m.completed||[];const present=new Set();for(const p of m.players||[]){if(p.id===OPEN_WORLD.id)continue;present.add(p.id);const old=OPEN_WORLD.peers.get(p.id);OPEN_WORLD.peers.set(p.id,{...p,dx:old?.dx??p.x,dy:old?.dy??p.y,da:old?.da??p.a});}for(const id of OPEN_WORLD.peers.keys())if(!present.has(id))OPEN_WORLD.peers.delete(id);}
 if(m.type==='claim'){const pending=OPEN_WORLD.pending;OPEN_WORLD.pending=null;if(m.ok&&pending?.job.id===m.job){pending.start();}else toast(m.reason||'Could not claim job.');}
 if(m.type==='notice'||m.type==='error')toast(m.message);
 };
 ws.onerror=()=>{if(!welcomed)toast('Open Map is unavailable on this host. You can keep playing solo.');};
 ws.onclose=()=>{const wasJoined=OPEN_WORLD.joined;OPEN_WORLD.socket=null;OPEN_WORLD.joined=false;OPEN_WORLD.id=null;OPEN_WORLD.peers.clear();OPEN_WORLD.claims={};OPEN_WORLD.completed=[];OPEN_WORLD.pending=null;if(wasJoined){if(CONTRACT)endContract(h,false,'Multiplayer connection closed');toast('OPEN MAP DISCONNECTED · Back to solo play');}};
}
const acceptSoloContract=acceptContract;
acceptContract=function(h,job){if(!OPEN_WORLD.joined)return acceptSoloContract(h,job);if(CONTRACT||MS||OPEN_WORLD.pending||!missionAvailable(h))return false;if(OPEN_WORLD.claims[job.id]||OPEN_WORLD.completed.includes(job.id)){toast('Another driver has taken that job.');return false;}OPEN_WORLD.pending={job,start:()=>{if(!acceptSoloContract(h,job))sendOpenWorld({type:'release',job:job.id});}};sendOpenWorld({type:'claim',job:job.id});return true;};
const endSoloContract=endContract;
endContract=function(h,passed,why){if(CONTRACT&&OPEN_WORLD.joined)sendOpenWorld({type:passed?'finish':'release',job:CONTRACT.job.id});endSoloContract(h,passed,why);};
function tickOpenWorld(dt){if(!OPEN_WORLD.joined)return;const h=cars.find(c=>c.human);if(!h)return;OPEN_WORLD.sendT-=dt;if(OPEN_WORLD.sendT<=0){OPEN_WORLD.sendT=.08;sendOpenWorld({type:'position',x:h.x,y:h.y,a:h.a,car:h.def.id,foot:h.foot,colour:h.color});}const k=1-Math.exp(-dt*10);for(const p of OPEN_WORLD.peers.values()){p.dx+=(p.x-p.dx)*k;p.dy+=(p.y-p.dy)*k;p.da+=wrapA(p.a-p.da)*k;}}
function drawOpenWorldPeers(time){if(!OPEN_WORLD.joined)return;for(const p of OPEN_WORLD.peers.values()){const def=CAT[p.car]||CAT.pocket;if(p.foot)drawPed({x:p.dx,y:p.dy,a:p.da,skin:SKIN[0],hair:HAIR[0],shirt:'#38cdb1',ph:time*.006,down:0},time);else{const im=carSprite(def,'#fff',{}, {paint:p.colour,wheel:'std'});ctx.save();ctx.translate(p.dx,p.dy);ctx.rotate(p.da);ctx.drawImage(im,-im.bw/2,-im.bh/2,im.bw,im.bh);ctx.restore();}ctx.save();ctx.font='700 15px sans-serif';ctx.textAlign='center';ctx.fillStyle='#b8ffe7';ctx.strokeStyle='#152e39';ctx.lineWidth=4;ctx.strokeText(p.name,p.dx,p.dy-55);ctx.fillText(p.name,p.dx,p.dy-55);ctx.restore();}}

const resistBeforeArmed=resistCarTheft;
resistCarTheft=function(h,t){const result=resistBeforeArmed(h,t);if(h.theft?.car===t&&t.armed){h.theft.required=5.5;h.theft.driver.armed=true;h.theft.driver.angryUntil=simT+6;if(!h.theft.warned){h.theft.warned=true;actorSay(h.theft.driver,'Back away! I am armed!',4,'ARMED DRIVER');}}return result;};
const witnessBeforeArmed=updateWitness;
updateWitness=function(p,dt){const h=p.aggressor;if(p.armed&&p.down<=0&&h&&h.foot&&!h.jail&&!h.cuff&&simT<(p.angryUntil||0)){const d=Math.hypot(h.x-p.x,h.y-p.y);if(d>55&&d<200&&!(p.fireAt>simT)){p.fireAt=simT+1.5;const a=Math.atan2(h.y-p.y,h.x-p.x);bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*850,vy:Math.sin(a)*850,owner:p,life:.3});sfx(500,.08,'triangle',-250,.05);}}return witnessBeforeArmed(p,dt);};

for(const id of ['volt','apex','phantom','nova','circuit','rocket','f458'])CAT[id].premium=true;

/* Per-car security persists independently of performance upgrades. Owners keep their keys. */
function securityLevel(h,id=h.def.id){return save[h.player]?.security?.[id]||0;}
const workshopBeforeSecurity=openWarehouse;
openWarehouse=function(h){workshopBeforeSecurity(h);const el=document.getElementById('warehouseWorkshop');if(!el)return;const install=()=>{const card=el.querySelector('.warehouse-menu');if(!card||card.querySelector('[data-security]'))return;const b=document.createElement('button');b.type='button';b.className='warehouse-option';b.dataset.security='true';const update=()=>{const level=securityLevel(h),cost=[450,900,1800][level];b.textContent=level>=3?'SECURITY 3/3 · MAX':'SECURITY '+level+'/3 · '+['AUTO-LOCK DOORS','ALARM & AUTO-LOCK','TRACKED SECURITY'][level]+' · '+money(cost);b.disabled=level>=3;};b.onclick=()=>{const level=securityLevel(h),cost=[450,900,1800][level];if(level>=3||!spend(h,cost))return;const w=save[h.player];w.security=w.security||{};w.security[h.def.id]=level+1;persist();const status=card.querySelector('[role=status]');if(status)status.textContent='SECURITY INSTALLED · BANK '+money(w.cash);update();};update();card.insertBefore(b,card.lastElementChild);};install();if(!el._securityObserver){el._securityObserver=new MutationObserver(install);el._securityObserver.observe(el,{childList:true,subtree:true});}};
const toggleBeforeSecurity=toggleFoot;
toggleFoot=function(h){const wasFoot=h.foot;if(wasFoot){const t=stealable(h);if(t?.locked&&t.veh?.owner!==h&&t.security>=2){reportTheft(h,t);popText(t.x,t.y-80,'CAR ALARM · POLICE NOTIFIED','#ff7459');}}toggleBeforeSecurity(h);if(!wasFoot&&h.foot){const t=traffic.find(t=>t.veh?.owner===h&&Math.hypot(t.x-h.x,t.y-h.y)<150);if(t){t.security=securityLevel(h,t.def.id);t.locked=t.security>0||!!t.def.premium;}}};
GPSDEST.push(['trackedcar','⌖','TRACKED VEHICLE']);
const gpsPointBeforeTracker=gpsPoint;
gpsPoint=function(h,type){if(type==='trackedcar'){const t=traffic.find(t=>t.veh?.owner===h&&t.security>=3);return t?{x:t.x,y:t.y}:null;}return gpsPointBeforeTracker(h,type);};

/* Apple StoreKit bridge. Prices come from Apple, never from the display labels. */
const APPLE_STORE_PREFIX='com.justinsapps.jackthestreets';
const APPLE_CARS=['volt','apex','phantom','nova','circuit','rocket','f458'];
const APPLE_UPGRADES={engine:{name:'NEW ENGINE',aud:'A$4.99',detail:'Permanent engine upgrade for this car'},security:{name:'SECURITY',aud:'A$9.99',detail:'Auto-lock, alarm and parked-car tracker'},tyresarmour:{name:'TYRES & ARMOUR',aud:'A$27.00',detail:'Permanent grip and armour package'}};
const appleStoreAvailable=()=>!!window.webkit?.messageHandlers?.premiumStore;
async function appleStoreCall(action,body={}){const handler=window.webkit?.messageHandlers?.premiumStore;if(!handler)throw Error('App Store purchases are available in the iPhone and iPad app.');return await handler.postMessage({action,...body});}
function appleCarProduct(id){return APPLE_STORE_PREFIX+'.car.'+id;}
function appleUpgradeProduct(id,key){return APPLE_STORE_PREFIX+'.upgrade.'+id+'.'+key;}
async function applyAppleOwnership(payload){
 const ids=(payload.ids||[]).filter(id=>typeof id==='string'&&id.startsWith(APPLE_STORE_PREFIX+'.')),previous=save.appleEntitlements||[];
 for(const p of ['p1','p2']){const w=save[p];if(!w)continue;w.appleCars=w.appleCars||[];const owned=APPLE_CARS.filter(id=>ids.includes(appleCarProduct(id)));
  for(const id of w.appleCars)if(!owned.includes(id)){w.owned=w.owned.filter(x=>x!==id);if(w.sel===id)w.sel='pocket';}
  for(const id of owned)if(!w.owned.includes(id))w.owned.push(id);w.appleCars=owned;
  w.appleUpgradeBase=w.appleUpgradeBase||{};w.security=w.security||{};
  for(const id of APPLE_CARS){const relevant=ids.some(x=>x.startsWith(APPLE_STORE_PREFIX+'.upgrade.'+id+'.'))&&owned.includes(id),old=w.appleUpgradeBase[id];if(!relevant&&!old)continue;const up=upOf(w,id);if(!old)w.appleUpgradeBase[id]={eng:up.eng||0,tyr:up.tyr||0,arm:up.arm||0,security:w.security[id]||0};const base=w.appleUpgradeBase[id];
   up.eng=ids.includes(appleUpgradeProduct(id,'engine'))&&owned.includes(id)?Math.max(base.eng,3):base.eng;
   const armour=ids.includes(appleUpgradeProduct(id,'tyresarmour'))&&owned.includes(id);up.tyr=armour?5:base.tyr;up.arm=armour?3:base.arm;
   w.security[id]=ids.includes(appleUpgradeProduct(id,'security'))&&owned.includes(id)?3:base.security;
   if(!relevant)delete w.appleUpgradeBase[id];
  }
 }
 save.appleEntitlements=ids;persist();const stored=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!stored||JSON.stringify(stored.appleEntitlements)!==JSON.stringify(ids))throw Error('Ownership could not be saved. Please free device storage and restore purchases.');
 for(const h of cars.filter(c=>c.human&&!c.foot)){if(APPLE_CARS.includes(h.def.id)&&previous.includes(appleCarProduct(h.def.id))&&!ids.includes(appleCarProduct(h.def.id))){const d=CAT.pocket;applyVeh(h,{def:d,st:effStats(d,ZERO,'std'),r:28,m:d.s[3],look:{paint:null,wheel:'std'},color:d.col,up:{...ZERO},dmg:0,bl:bling(ZERO),home:true,fuel:100});}else if(ownedByApple(h)){h.up={...upOf(save[h.player],h.def.id)};h.st=effStats(h.def,h.up,h.look?.wheel||'std');h.bl=bling(h.up);}}
 if(payload.transactions?.length)await appleStoreCall('acknowledge',{transactions:payload.transactions});refreshBank();
}
function ownedByApple(h,id=h.def.id){return (save.appleEntitlements||[]).includes(appleCarProduct(id));}
async function syncAppleOwnership(){if(!appleStoreAvailable())return;try{await applyAppleOwnership(await appleStoreCall('entitlements'));}catch(e){toast(e.message||'Could not restore App Store ownership.');}}
addEventListener('store-entitlements',e=>{applyAppleOwnership(e.detail).catch(err=>toast(err.message));});
const browserPremiumShowroom=openPremiumShowroom;
openPremiumShowroom=function(h,id='f458'){
 if(!appleStoreAvailable())return browserPremiumShowroom(h,id);
 const d=CAT[id]||CAT.f458;return cityModal(d.n+' · APP STORE',({card,note,option})=>{
  let priceMap={},busy=false,colour=lookOf(save[h.player],id).paint||'#dc282a';note.textContent='Loading Apple prices…';const list=document.createElement('div');card.append(list);
  const draw=()=>{list.replaceChildren();const make=(label,detail,action,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='warehouse-option';b.disabled=disabled||busy;const title=document.createElement('b'),small=document.createElement('small');title.textContent=label;small.textContent=detail;b.append(title,small);b.onclick=action;list.append(b);};
   const preview=carSprite(d,'#fff',{}, {paint:colour,wheel:'std'});const view=document.createElement('canvas');view.width=preview.width;view.height=preview.height;view.getContext('2d').drawImage(preview,0,0);view.style.cssText='display:block;max-width:100%;width:240px;height:auto;margin:8px auto';list.append(view);
   for(const [name,hex]of [['RED','#dc282a'],['YELLOW','#f4cc36']])make((colour===hex?'✓ ':'')+name,'Choose your finish',()=>{colour=hex;if(ownedByApple(h,id)){lookOf(save[h.player],id).paint=hex;persist();if(h.def?.id===id){h.look.paint=hex;h.color=hex;}}draw();});
   const buy=async product=>{if(busy||!priceMap[product])return;busy=true;draw();try{const result=await appleStoreCall('purchase',{id:product});if(result.status==='purchased'){await applyAppleOwnership(result.entitlements);lookOf(save[h.player],id).paint=colour;persist();note.textContent='PURCHASE COMPLETE · Saved to your Apple ownership.';}else note.textContent=result.status==='pending'?'Waiting for purchase approval.':result.status==='cancelled'?'Purchase cancelled.':'Purchase unavailable.';}catch(e){note.textContent=e.message||'Purchase failed. No ownership was granted.';}finally{busy=false;draw();}};
   const carProduct=appleCarProduct(id);make(ownedByApple(h,id)?'OWNED FOR LIFE':priceMap[carProduct]?'BUY · '+priceMap[carProduct]:'CAR UNAVAILABLE','One-time App Store purchase · no subscription',()=>buy(carProduct),ownedByApple(h,id)||!priceMap[carProduct]);
   if(ownedByApple(h,id))for(const [key,upgrade]of Object.entries(APPLE_UPGRADES)){const product=appleUpgradeProduct(id,key),owned=(save.appleEntitlements||[]).includes(product);make(upgrade.name+' · '+(owned?'OWNED':priceMap[product]||'UNAVAILABLE'),upgrade.detail,()=>buy(product),owned||!priceMap[product]);}
   make('RESTORE PURCHASES','Restore lifetime cars and upgrades from your Apple account',async()=>{if(busy)return;busy=true;draw();try{await applyAppleOwnership(await appleStoreCall('restore'));note.textContent='Your App Store purchases have been restored.';}catch(e){note.textContent=e.message||'Could not restore purchases.';}finally{busy=false;draw();}});
  };draw();appleStoreCall('products').then(r=>{priceMap=Object.fromEntries((r.products||[]).map(p=>[p.id,p.price]));note.textContent=Object.keys(priceMap).length?'Apple prices shown below. Australian target prices: A$7.99 per car; upgrades from A$4.99 to A$27.00.':'Products are not available yet. You can still restore existing purchases.';draw();}).catch(e=>{note.textContent=e.message;draw();});
 });
};
const warehouseBeforeApple=openWarehouse;
openWarehouse=function(h){if(appleStoreAvailable()&&h.def?.premium){openPremiumShowroom(h,h.def.id);return;}warehouseBeforeApple(h);};
setTimeout(syncAppleOwnership,0);
function openPremiumGarage(h){return cityModal('PREMIUM GARAGE',({note,option,close})=>{note.textContent='A$7.99 target price per car · Lifetime ownership · Red and yellow finishes · Restore purchases in the iPhone and iPad app.';for(const id of APPLE_CARS){const d=CAT[id];option(d.n+' · '+(ownedByApple(h,id)?'OWNED':'A$7.99'),d.t,()=>{close();openPremiumShowroom(h,id);});}});}
const openPhoneBeforePremium=openPhone;
openPhone=function(h){openPhoneBeforePremium(h);const b=document.createElement('button');b.type='button';b.textContent='PREMIUM GARAGE · APP STORE';b.onclick=()=>{closePhone(h);openPremiumGarage(h);};document.getElementById('phoneList').prepend(b);};
const smashBeforeMotorway=spawnSmash;
spawnSmash=function(){smashBeforeMotorway();if(curMap==='big')smash=smash.filter(s=>Math.abs(s.x-CITY_WORKS.freewayX)>210);};

const laneSpawnBeforeDistricts=laneSpawn;
laneSpawn=function(far){const t=laneSpawnBeforeDistricts(far);if(!t||t.veh||t.def.commercial)return t;const profile=districtAt(t.x,t.y);let pool;if(profile===DISTRICT_STYLES.industrial)pool=[CAT.pocket,CAT.hauler,CAT.boxtruck,CAT.garbage];else if(profile===DISTRICT_STYLES.coast)pool=[CAT.breeze,CAT.macan,CAT.executive,CAT.pocket];else pool=[CAT.pocket,CAT.streetwagon,CAT.hauler,CAT.sti];t.def=pool[Math.floor(rnd()*pool.length)];t.r=clamp(t.def.L*K*.4,20,40);t.m=t.def.s[3]*1.2;t.armed=profile.risk>.4&&rnd()<.2;t.locked=rnd()<.4||!!t.def.premium;return t;};
// Opportunists need a visible approach and a stationary, unlocked vehicle.
function updateStreetJackers(dt){if(!CAMP()||paused)return;for(const h of cars.filter(c=>c.human)){if(h.inside||h.jail||h.cuff||h.flying||h.boat){h.jacker=null;continue;}h.jackerCooldown=Math.max(0,(h.jackerCooldown??35)-dt);if(!h.jacker){if(h.foot||h.wanted>0||Math.hypot(h.vx,h.vy)>8||h.jackerCooldown>0||districtAt(h.x,h.y).risk<.4)continue;const p=peds.find(p=>!p.patrol&&!p.down&&Math.hypot(p.x-h.x,p.y-h.y)<180);if(!p)continue;h.jacker={ped:p,t:0};h.msg='SOMEONE IS APPROACHING YOUR CAR · DRIVE AWAY';h.msgT=4;}
 const j=h.jacker,p=j.ped;if(h.foot||Math.hypot(h.vx,h.vy)>25||Math.hypot(p.x-h.x,p.y-h.y)>250){h.jacker=null;h.jackerCooldown=60;continue;}const d=Math.hypot(h.x-p.x,h.y-p.y)||1;p.x+=(h.x-p.x)/d*45*dt;p.y+=(h.y-p.y)/d*45*dt;p.a=Math.atan2(h.y-p.y,h.x-p.x);if(d>45)continue;j.t+=dt;if(j.t<2)continue;h.jacker=null;h.jackerCooldown=90;if(securityLevel(h,h.def.id)>0||h.def.premium){h.msg='LOCKS HELD · THE JACKER BACKED OFF';h.msgT=4;p.run=4;continue;}const id=h.def.id;toggleFoot(h);const car=traffic.find(t=>t.veh?.owner===h&&t.def.id===id);if(car){car.state='drive';car.axis=Math.abs(Math.cos(car.a))>.7?'h':'v';car.dir=(car.axis==='h'?Math.cos(car.a):Math.sin(car.a))>=0?1:-1;car.lane=car.axis==='h'?car.y:car.x;car.speed=115;car.locked=false;car.driverRemoved=true;car.veh.owner=null;car.jackedFrom=h;car.jackerTime=12;}h.msg='CAR JACKED · CHASE IT DOWN AND TAKE IT BACK';h.msgT=6;}
 for(const t of traffic)if(t.jackerTime>0){t.jackerTime-=dt;if(t.jackerTime<=0){t.state='parked';t.speed=0;}}
}
const updateBeforeJackers=updateCityExpansion;updateCityExpansion=function(dt){updateBeforeJackers(dt);updateStreetJackers(dt);};
