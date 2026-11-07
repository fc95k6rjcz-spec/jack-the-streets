/* Dense inner-city perimeter blocks, separate from suburban lawns and pools. */
var URBAN_MAPS=new WeakMap();
const URBAN_ROOFS=new Image();URBAN_ROOFS.src='assets/urban-roofs-v1.webp';
function urbanState(map=tile){if(!URBAN_MAPS)return null;let value=URBAN_MAPS.get(map);if(!value){value={blocks:[],cells:new Map()};URBAN_MAPS.set(map,value);}return value;}
function urbanCellKey(x,y){return Math.floor(x/T)+Math.floor(y/T)*COLS;}
function urbanSurface(x,y){const state=URBAN_MAPS?.get(tile),key=urbanCellKey(x,y),block=state?.cells.get(key);for(const [a,b]of state?.curveCells?.get(key)||[])if(urbanSegmentDistance(x,y,a,b)<96)return ROAD;if(!block)return null;for(const b of block.buildings)if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1)return BUILD;return PAVE;}
function isUrbanBlock(layout){return layout===SYD_L||layout===NB_L;}
function addUrbanBuilding(block,x,y,w,h,slot,height,terrace=false){addBuilding(Math.floor(x/T),Math.floor(y/T),Math.ceil(w/T),Math.ceil(h/T));const b=buildings.at(-1);Object.assign(b,{x0:x,y0:y,x1:x+w,y1:y+h,h:height,c:terrace?'#76665e':'#738087',urban:true,terrace,roofSlot:slot,cells:[{fx:0,fy:0,fw:1,fh:1,p:slot}],pad:false,ac:[]});block.buildings.push(b);return b;}
function makeUrbanBlock(ax,ay,w,h,bi,bj){
 if(w<5||h<4){lots(ax,ay,w,h);return;}
 const x0=(ax-2)*T===15*T?15*T+210:(ax-.5)*T,x1=(ax+w+2)*T===15*T?15*T-210:(ax+w+.5)*T,y0=ay*T,width=x1-x0,height=(h+.5)*T,seed=bi*131+bj*59,block={x0,y0,x1:x0+width,y1:y0+height,seed,buildings:[],laneY:y0+height*.52,pocket:(bi+bj)%4===0};
 for(let r=Math.floor(y0/T);r<=Math.floor(block.y1/T);r++)for(let c=Math.floor(x0/T);c<=Math.floor(block.x1/T);c++)if(at(c,r)!==ROAD)set(c,r,PAVE);
 const civic=(bi+bj)%5===0&&height>=T*6,frontUnits=civic?2:3,topH=civic?T*2.1:Math.min(T*1.45,height*.24),bottomH=Math.min(T*1.5,height*.25),sideW=width*.24,gap=56;
 for(let i=0;i<frontUnits;i++){const bw=width/frontUnits;addUrbanBuilding(block,x0+i*bw+2,y0,bw-4,topH,[0,5,4][(i+seed)%3],3+(i+bi)%4);}
 const terraces=Math.max(5,Math.round(width/(T*1.25))),terraceW=width/terraces;
 for(let i=0;i<terraces;i++)addUrbanBuilding(block,x0+i*terraceW+1,block.y1-bottomH,terraceW-2,bottomH,(i+seed)%2?2:3,2,true);
 for(const side of [0,1]){const x=side?block.x1-sideW:x0,ya=y0+topH+8,firstH=block.laneY-gap/2-ya,yb=block.laneY+gap/2,lastH=block.y1-bottomH-8-yb;addUrbanBuilding(block,x,ya,sideW,firstH,(seed+side)%2?1:6,3);addUrbanBuilding(block,x,yb,sideW,lastH,(seed+side)%2?7:4,4+(bi%3));}
 const state=urbanState();for(let r=Math.floor(y0/T);r<=Math.floor(block.y1/T);r++)for(let c=Math.floor(x0/T);c<=Math.floor(block.x1/T);c++)state.cells.set(c+r*COLS,block);state.blocks.push(block);
 for(const x of [block.x0-24,block.x1+24])for(const y of [block.y0+height*.2,block.y1-height*.2])trees.push({x,y,r:15+(bi%3),suburban:true,canopy:(bi+bj)%2});
 if(block.pocket)for(const side of [-1,1])trees.push({x:(block.x0+block.x1)/2+side*42,y:block.laneY-85,r:22+(bi%3)*3,suburban:true,canopy:side>0?1:0});
}
function urbanSegmentDistance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-dx*t,y-a.y-dy*t);}
function urbanSegmentHitsBuilding(a,b,rect,margin=106){const dx=b.x-a.x,dy=b.y-a.y;let lo=0,hi=1;for(const [p,q]of [[-dx,a.x-rect.x0+margin],[dx,rect.x1+margin-a.x],[-dy,a.y-rect.y0+margin],[dy,rect.y1+margin-a.y]]){if(Math.abs(p)<1e-8){if(q<0)return false;continue;}const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}return true;}
function urbanNearCorridor(x,y,radius=96){const state=URBAN_MAPS?.get(tile);if(!state?.curves)return false;for(const curve of state.curves){const box=curve.box;if(box&&(x<box[0]-radius||x>box[2]+radius||y<box[1]-radius||y>box[3]+radius))continue;for(let i=1;i<curve.length;i++)if(urbanSegmentDistance(x,y,curve[i-1],curve[i])<radius)return true;}return false;}
function prepareUrbanCorridors(curves){if(CITY!=='syd')return;const state=urbanState();state.curves=curves;state.curveCells=new Map();const segments=[];for(const curve of curves)for(let i=1;i<curve.length;i++){const a=curve[i-1],b=curve[i];segments.push([a,b]);for(let r=Math.floor((Math.min(a.y,b.y)-100)/T);r<=Math.floor((Math.max(a.y,b.y)+100)/T);r++)for(let c=Math.floor((Math.min(a.x,b.x)-100)/T);c<=Math.floor((Math.max(a.x,b.x)+100)/T);c++){const key=c+r*COLS;if(!state.curveCells.has(key))state.curveCells.set(key,[]);state.curveCells.get(key).push([a,b]);}}
 const removed=new Set();for(const block of state.blocks){block.buildings=block.buildings.filter(b=>{if(segments.some(([a,c])=>urbanSegmentHitsBuilding(a,c,b))){removed.add(b);return false;}return true;});}for(let i=buildings.length-1;i>=0;i--)if(removed.has(buildings[i]))buildings.splice(i,1);
 for(const b of removed)for(let r=Math.floor(b.y0/T);r<=Math.floor(b.y1/T);r++)for(let c=Math.floor(b.x0/T);c<=Math.floor(b.x1/T);c++)if(at(c,r)===BUILD)set(c,r,PAVE);
 for(let i=trees.length-1;i>=0;i--)if(urbanNearCorridor(trees[i].x,trees[i].y,120))trees.splice(i,1);
}
function drawUrbanCorridors(v){const curves=URBAN_MAPS?.get(tile)?.curves;if(!curves)return;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';for(const curve of curves){const box=curve.box;if(box&&(box[2]<v.x0||box[0]>v.x0+v.w||box[3]<v.y0||box[1]>v.y0+v.h))continue;const path=()=>{ctx.beginPath();curve.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));};ctx.setLineDash([]);path();ctx.strokeStyle='#343f43';ctx.lineWidth=200;ctx.stroke();ctx.strokeStyle=roadMaterial('collector',2);ctx.lineWidth=192;ctx.stroke();ctx.strokeStyle='rgba(226,230,213,.32)';ctx.lineWidth=178;ctx.stroke();ctx.strokeStyle=roadMaterial('collector',2);ctx.lineWidth=174;ctx.stroke();ctx.setLineDash([26,54,34,65]);ctx.strokeStyle='rgba(222,204,135,.38)';ctx.lineWidth=2;ctx.stroke();}ctx.restore();}
function drawUrbanGround(v){const state=URBAN_MAPS?.get(tile);if(!state)return;ctx.save();
 for(const b of state.blocks){if(b.x1<v.x0-80||b.x0>v.x0+v.w+80||b.y1<v.y0-80||b.y0>v.y0+v.h+80)continue;
  ctx.fillStyle='#777e7d';ctx.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);ctx.fillStyle='#89918e';ctx.fillRect(b.x0+8,b.y0+8,b.x1-b.x0-16,b.y1-b.y0-16);
  const laneY=b.laneY,mid=(b.x0+b.x1)/2;ctx.fillStyle='#4b5557';ctx.fillRect(b.x0-T*.6,laneY-28,b.x1-b.x0+T*1.2,56);ctx.strokeStyle='rgba(208,212,198,.32)';ctx.lineWidth=1;for(const y of [laneY-29,laneY+29]){ctx.beginPath();ctx.moveTo(b.x0,y);ctx.lineTo(b.x1,y);ctx.stroke();}
  // Small loading courts and rear parking, never a whole suburban lawn.
  ctx.strokeStyle='#b9b9a3';ctx.lineWidth=1.5;for(let i=0;i<4;i++)ctx.strokeRect(mid-82+i*42,laneY+48,38,68);
  ctx.fillStyle='#d5d2b8';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('SERVICE LANE',mid,laneY+4);
  if(b.pocket){ctx.fillStyle='#5d755e';ctx.fillRect(mid-85,laneY-140,170,88);ctx.strokeStyle='#9eaaa0';ctx.lineWidth=3;ctx.strokeRect(mid-85,laneY-140,170,88);ctx.fillStyle='#71614e';for(const x of [mid-73,mid+44])ctx.fillRect(x,laneY-61,30,7);}
  for(const side of [-1,1]){ctx.save();ctx.translate(mid+side*128,laneY+45);ctx.scale(1.2,1.2);drawStreetProp('bin');ctx.restore();}
  // Short loading-zone stripes at the entrance, leaving the lane unobstructed.
  ctx.strokeStyle='rgba(226,206,133,.45)';ctx.lineWidth=2;for(const x of [b.x0+10,b.x1-45])for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*11,laneY-20);ctx.lineTo(x+i*11+7,laneY-12);ctx.stroke();}
 }
 ctx.restore();}
function drawUrbanBuilding(b,cam){const w=b.x1-b.x0,h=b.y1-b.y0;ctx.save();const shadow=Math.min(20,5+b.h*2);ctx.fillStyle='rgba(10,19,25,.28)';ctx.fillRect(b.x0+shadow,b.y0+shadow,w,h);ctx.fillStyle=b.terrace?'#685d55':'#677275';ctx.fillRect(b.x0-2,b.y0-2,w+4,h+4);const art=atlasSprite(URBAN_ROOFS,4,2,b.roofSlot);if(art)ctx.drawImage(art,b.x0,b.y0,w,h);else{ctx.fillStyle=b.terrace?'#8a6b57':'#929998';ctx.fillRect(b.x0,b.y0,w,h);}if(b.jail){ctx.fillStyle='#263e51';ctx.fillRect((b.x0+b.x1)/2-60,b.y1-25,120,20);ctx.fillStyle='#e6e9de';ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.fillText('POLICE STATION',(b.x0+b.x1)/2,b.y1-11);}ctx.restore();}
const groundBeforeUrban=drawCityExpansionGround;drawCityExpansionGround=function(v,time){groundBeforeUrban(v,time);if(curMap==='big'){drawUrbanGround(v);drawUrbanCorridors(v);}};
const buildingBeforeUrban=drawBuilding;drawBuilding=function(b,cam){if(b.urban&&b!==INB)return drawUrbanBuilding(b,cam);buildingBeforeUrban(b,cam);};
const laneSpawnBeforeUrban=laneSpawn;laneSpawn=function(far){const t=laneSpawnBeforeUrban(far);if(!t||CITY!=='syd'||t.state==='parked'||t.def.commercial||rnd()>.27)return t;const d=rnd()<.45?CAT.citybus:CAT.boxtruck;Object.assign(t,{def:d,r:clamp(d.L*K*.4,20,40),m:d.s[3]*1.2,speed:d.commercial==='bus'?105:90,armed:false,locked:rnd()<.65});return t;};
const shopArtBeforeUrban=drawComicShop;drawComicShop=function(sh,cam){const parcel=shopArtParcel(sh);if(!parcel?.b.urban)return shopArtBeforeUrban(sh,cam);const door=shopDoor(sh),info=SHOPINFO[sh.type];ctx.save();ctx.translate(door.x,door.y);ctx.rotate(door.angle);ctx.fillStyle=info?.c2||'#354b53';ctx.fillRect(-3,-32,10,64);ctx.strokeStyle='#afb7ae';ctx.lineWidth=1;ctx.strokeRect(-3,-32,10,64);ctx.restore();return true;};
