/* Coastal comic street palette. Paint follows physical roads, not empty sea tiles. */
const STREET_PAINT={ink:'#24363c',cream:'#ebe2c9',gold:'#e1bd64',teal:'#7bbbb1',sand:'#cbb59a',stone:'#a8a8a1',mortar:'#777d76'};
function paintedRoad(x,y){return [ROAD,CROAD].includes(at(Math.floor(x/T),Math.floor(y/T)));}
function streetRoadStroke(horizontal,centre,from,to,offset){
 ctx.beginPath();
 if(horizontal){ctx.moveTo(from,centre+offset);ctx.lineTo(to,centre+offset);}
 else{ctx.moveTo(centre+offset,from);ctx.lineTo(centre+offset,to);}
 ctx.stroke();
}
const originalRoadMarkings=drawRoadMarkings;
drawRoadMarkings=function(v){
 if(curMap!=='big')return originalRoadMarkings(v);
 ctx.save();ctx.lineCap='butt';ctx.setLineDash([]);
 const c0=Math.max(0,Math.floor(v.x0/T)-1),c1=Math.min(COLS-1,Math.ceil((v.x0+v.w)/T)+1),
       r0=Math.max(0,Math.floor(v.y0/T)-1),r1=Math.min(ROWS-1,Math.ceil((v.y0+v.h)/T)+1);
 ctx.beginPath();for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(at(c,r)===ROAD)ctx.rect(c*T,r*T,T,T);ctx.clip();
 for(const [horizontal,roads,crosses,max] of [[true,IY,IX,W],[false,IX,IY,H]]){
  const lo=horizontal?v.x0:v.y0,hi=lo+(horizontal?v.w:v.h),crossLo=horizontal?v.y0:v.x0,crossHi=crossLo+(horizontal?v.h:v.w);
  for(const [i,centre]of roads.entries()){
   if(centre<crossLo-110||centre>crossHi+110||(!horizontal&&centre===CITY_WORKS.freewayX))continue;
   const kind=roadKind(horizontal?'h':'v',i),major=kind==='arterial',bounded=[0,...crosses,max];
   for(let j=1;j<bounded.length;j++){
    const a=bounded[j-1]+(j>1?T+37:0),b=bounded[j]-(j<bounded.length-1?T+37:0),mid=(a+b)/2;
    if(b<=a||b<lo-100||a>hi+100||!paintedRoad(horizontal?mid:centre,horizontal?centre:mid))continue;
    const stroke=(off,width,colour,dash=[])=>{ctx.lineWidth=width;ctx.strokeStyle=colour;ctx.setLineDash(dash);streetRoadStroke(horizontal,centre,a,b,off);};
    ctx.lineDashOffset=-a%82;
    if(major){stroke(-4,2.6,STREET_PAINT.gold);stroke(4,2.6,STREET_PAINT.gold);}
    else stroke(0,2.4,'rgba(235,226,201,.62)',[24,58]);
    for(const side of [-1,1])stroke(side*(major?75:83),2,'rgba(235,226,201,.29)');
    if(major)for(const side of [-1,1])stroke(side*43,2,'rgba(235,226,201,.36)',[24,58]);
   }
  }
 }
 ctx.setLineDash([]);
 for(let j=0;j<IY.length;j++)for(let i=0;i<IX.length;i++){
  const x=IX[i],y=IY[j];if(x===CITY_WORKS.freewayX||x<v.x0-150||x>v.x0+v.w+150||y<v.y0-150||y>v.y0+v.h+150||!paintedRoad(x,y))continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   if(!paintedRoad(x+dx*(T+32),y+dy*(T+32)))continue;
   const approach=roadKind(dx?'h':'v',dx?j:i),farX=x+dx*(T+45),farY=y+dy*(T+45);
   const sidewalks=[-1,1].every(side=>at(Math.floor((farX+dy*side*(T+9))/T),Math.floor((farY+dx*side*(T+9))/T))===PAVE);
   const type=crossingStyle(approach,sidewalks,(i+j)%3===0);
   ctx.save();ctx.translate(x+dx*(T+23),y+dy*(T+23));ctx.rotate(Math.atan2(dy,dx));drawStreetCrossing(type);ctx.restore();
  }
 }
 ctx.restore();
};

function crossingStyle(approach,sidewalks,selected){
 if(!sidewalks)return 'line';
 if(approach==='coastal')return 'surf';
 return approach==='arterial'||selected?'zebra':'give-way';
}
function drawStreetCrossing(type){
 ctx.fillStyle='rgba(235,226,201,.66)';
 if(type==='line'){ctx.fillRect(0,8,4,66);return;}
 if(type==='give-way'){
  for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(4,15+i*18);ctx.lineTo(-7,10+i*18);ctx.lineTo(-7,20+i*18);ctx.closePath();ctx.fill();}
  return;
 }
 // The "surf" band is paint over asphalt, not a raised physics obstacle.
 if(type==='surf'){ctx.fillStyle='rgba(168,111,85,.46)';ctx.fillRect(-24,-90,48,180);}
 ctx.fillStyle=STREET_PAINT.cream;ctx.globalAlpha=.78;
 for(let i=-4;i<=4;i++)ctx.fillRect(-15,i*18-4,30,8);
 ctx.globalAlpha=.5;ctx.fillRect(-22,-86,2,172);ctx.fillRect(20,-86,2,172);
}
function drawCoastalCurbs(c0,c1,r0,r1){
 const edges=[[0,-1,0,0,T,7],[0,1,0,T-7,T,7],[-1,0,0,0,7,T],[1,0,T-7,0,7,T]];
 ctx.save();
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
  if(at(c,r)!==PAVE)continue;
  for(const [dc,dr,dx,dy,w,h] of edges){
   if(at(c+dc,r+dr)!==ROAD)continue;
   const x=c*T+dx,y=r*T+dy,horizontal=!!dr,coast=CITY==='nb'&&((horizontal?r:c)>=(horizontal?103:81));
   ctx.fillStyle=coast?STREET_PAINT.sand:STREET_PAINT.stone;ctx.fillRect(x,y,w,h);
   ctx.fillStyle='#e4d5b5';ctx.fillRect(x+(horizontal?0:dc<0?1:5),y+(horizontal?(dr<0?1:5):0),horizontal?w:1,horizontal?1:h);
   ctx.fillStyle=STREET_PAINT.mortar;
   for(let k=0;k<T;k+=32)ctx.fillRect(x+(horizontal?k:0),y+(horizontal?0:k),horizontal?1:w,horizontal?h:1);
   // Short drains provide useful local scale without any physical obstacles.
   if((c*11+r*7+(dc+dr+1)*5)%11===0){
    ctx.fillStyle=STREET_PAINT.ink;ctx.fillRect(x+(horizontal?36:1),y+(horizontal?1:36),horizontal?23:5,horizontal?5:23);
    ctx.fillStyle='#8b938d';for(let k=40;k<59;k+=5)ctx.fillRect(x+(horizontal?k:2),y+(horizontal?2:k),horizontal?1:3,horizontal?3:1);
   }
  }
 }
 ctx.restore();
}
let headlandSignCache=null;
function findWayfindingVerge(node,dx,dy,clear){
 for(const over of [146,144,159,188,224,-146,-144,-159,-188,-224])for(const ahead of [290,240,325,385,450,515,580]){
  const x=node.x+dx*ahead,y=node.y+dy*over;
  if(clear(x,y))return {x,y};
 }
 return null;
}
function headlandSignSites(){
 if(CITY!=='nb'||curMap!=='big'||!CURVES[3])return[];
 if(headlandSignCache?.tile===tile)return headlandSignCache.sites;
 const curve=CURVES[3],dry=(x,y)=>{
  const ww=110,hh=35;
  for(const ox of [-ww,0,ww])for(const oy of [-hh,0,hh])if(![PARK,PAVE].includes(surface(x+ox,y+oy)))return false;
  const near=(px,py,pw,ph)=>Math.abs(x-px)<ww+pw&&Math.abs(y-py)<hh+ph;
  return !buildings.some(b=>x+ww>b.x0&&x-ww<b.x1&&y+hh>b.y0&&y-hh<b.y1)
   &&!trees.some(t=>near(t.x,t.y,t.r,t.r))
   &&!SHOPS.some(s=>near(s.x,s.y,s.w/2+8,s.h/2+8))
   &&!CITY_WORKS.parks.some(s=>near(s.x,s.y,s.w/2,s.h/2))
   &&!CITY_WORKS.pads.some(s=>near(s.x,s.y,60,60))
   &&!IY.some(ry=>IX.some(rx=>near(rx+(rx===CITY_WORKS.freewayX?235:135),ry+135,85,15)));
 };
 const east=curve[0],verge=findWayfindingVerge(east,1,-1,dry);
 // The east approach has busy shop and street-sign frontage. Mark the
 // empty asphalt shoulder instead of allowing a roadside board to overlap.
 const shoulder={x:east.x+530,y:east.y+56};
 const flat=[-98,98].every(dx=>[-24,24].every(dy=>paintedRoad(shoulder.x+dx,shoulder.y+dy)));
 const sites=[
  {p:verge||(flat?shoulder:null),flat:!verge,short:'←',grid:'↑',name:'HEADLAND JUNCTION'},
  {p:findWayfindingVerge(curve.at(-1),-1,1,dry),short:'↘',grid:'→',name:'NORTH HEADLAND'}
 ].filter(s=>s.p);
 headlandSignCache={tile,sites};return sites;
}
function drawHeadlandWayfinding(v){
 const points=headlandSignSites().filter(s=>s.p.x>v.x0-120&&s.p.x<v.x0+v.w+120&&s.p.y>v.y0-60&&s.p.y<v.y0+v.h+60);
 if(!points.length)return;
 ctx.save();ctx.textAlign='left';ctx.textBaseline='middle';
 for(const {p,short,grid,name,flat} of points){const {x,y}=p;
  if(flat){
   ctx.fillStyle='rgba(62,98,89,.55)';ctx.fillRect(x-96,y-22,192,44);
   ctx.strokeStyle='rgba(235,226,201,.52)';ctx.lineWidth=1.5;ctx.strokeRect(x-95,y-21,190,42);
   ctx.fillStyle=STREET_PAINT.cream;ctx.font='800 14px "Chakra Petch",sans-serif';
   ctx.fillText(short+'  HEADLAND CUT',x-85,y-8,170);ctx.fillText(grid+'  TOWN GRID',x-85,y+8,170);
   continue;
  }
  ctx.fillStyle='rgba(22,29,24,.38)';ctx.fillRect(x-104,y-22,216,56);
  ctx.fillStyle=STREET_PAINT.ink;ctx.fillRect(x-108,y-28,216,56);
  ctx.fillStyle='#315950';ctx.fillRect(x-104,y-24,208,48);
  ctx.strokeStyle=STREET_PAINT.sand;ctx.lineWidth=1;ctx.strokeRect(x-103,y-23,206,46);
  ctx.fillStyle=STREET_PAINT.gold;ctx.font='700 10px "Chakra Petch",sans-serif';ctx.fillText(name,x-94,y-16,190);
  ctx.fillStyle=STREET_PAINT.cream;ctx.font='800 14px "Chakra Petch",sans-serif';
  ctx.fillText(short+'  HEADLAND CUT',x-94,y-1,190);ctx.fillText(grid+'  TOWN GRID',x-94,y+15,190);
 }
 ctx.restore();
}
const groundBeforeWayfinding=drawCityExpansionGround;
drawCityExpansionGround=function(v,time){groundBeforeWayfinding(v,time);drawHeadlandWayfinding(v);};
