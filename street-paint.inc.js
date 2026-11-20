/* Coastal comic street palette. Paint follows physical roads, not empty sea tiles. */
const STREET_PAINT={ink:'#24363c',cream:'#ebe2c9',gold:'#e1bd64',teal:'#7bbbb1'};
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
   // Crosswalks at busier junctions; smaller streets have a give-way line.
   ctx.save();ctx.translate(x+dx*(T+21),y+dy*(T+21));ctx.rotate(Math.atan2(dy,dx));
   ctx.fillStyle='rgba(235,226,201,.67)';
   if((i+j)%3===0)for(let k=-3;k<=3;k++)ctx.fillRect(-11,k*20-5,22,10);
   else{ctx.fillRect(0,7,3,66);ctx.fillStyle='rgba(235,226,201,.42)';for(let k=0;k<3;k++)ctx.fillRect(-7,15+k*22,2,11);}
   ctx.restore();
  }
 }
 ctx.restore();
};
