/* A replayable solo course on the existing Northern Beaches road network. */
const SPRINT_NAME='COASTAL SPRINT', SPRINT_HALF_GATE=76;
let sprintCache=null,sprintRun=null;
const sprintDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function sprintOutsideCar(h){return h&&h.human&&!h.foot&&!h.boat&&!h.flying&&!h.inside&&!h.jail&&!h.cuff&&!h.finished;}
function sprintDryPoint(x,y,r=28){
 if(x<r||y<r||x>W-r||y>H-r)return false;
 if(surface(x,y)!==ROAD)return false;
 return !buildings.some(b=>x+r>b.x0&&x-r<b.x1&&y+r>b.y0&&y-r<b.y1);
}
function sprintSafeLine(points,roadPoint){
 return points.length>1&&points.every((b,i)=>{if(!i)return roadPoint(b.x,b.y);const a=points[i-1],n=Math.max(1,Math.ceil(sprintDistance(a,b)/34));for(let k=1;k<=n;k++){const t=k/n;if(!roadPoint(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;});
}
function sprintGate(a,b,scale=.75){return{x:a.x+(b.x-a.x)*scale,y:a.y+(b.y-a.y)*scale,angle:Math.atan2(b.y-a.y,b.x-a.x)};}
function sprintCourses(){
 if(curMap!=='big'||CITY!=='nb')return null;
 if(sprintCache?.tile===tile)return sprintCache.result;
 const lanes=[CURVES[3]].filter(Boolean);
 let result=null;
 for(const curve of lanes){
  const a=curve[0],b=curve.at(-1);
  // The measured split has identical endpoints, but an easier grid option
  // and a shorter route with blind bends. Do not offer an obstructed variant.
  const start={x:a.x+Math.sign(a.x-b.x)*280,y:a.y};
  const end={x:b.x+Math.sign(b.x-a.x)*280,y:b.y};
  const gridOptions=[[a,{x:a.x,y:b.y},b],[a,{x:b.x,y:a.y},b]];
  const grid=gridOptions.find(p=>sprintSafeLine([start,...p,end],sprintDryPoint));
  if(!grid||!sprintSafeLine([start,...curve,end],sprintDryPoint))continue;
  const gateAt=i=>sprintGate(curve[i],curve[i+1],0);
  const gridGates=[sprintGate(grid[0],grid[1],.82),sprintGate(grid[1],grid[2],.64)];
  const goal=sprintGate(b,end,1);
  result={start:sprintGate(start,a,0),goal,variants:{
   shortcut:{name:'Headland Cut',line:[start,...curve,end],gates:[gateAt(21),gateAt(51),goal],description:'A shorter asphalt ribbon with two sweeping bends.'},
   scenic:{name:'Town Grid',line:[start,...grid,end],gates:[...gridGates,goal],description:'Wider streets, long straights and sharper corners.'}
  }};break;
 }
 sprintCache={tile,result};return result;
}
function sprintGateCrossed(last,next,gate,half=SPRINT_HALF_GATE){
 const cos=Math.cos(gate.angle),sin=Math.sin(gate.angle);
 const ax=last.x-gate.x,ay=last.y-gate.y,bx=next.x-gate.x,by=next.y-gate.y;
 const d0=ax*cos+ay*sin,d1=bx*cos+by*sin;
 if(!(d0<0&&d1>=0))return false;
 const f=-d0/(d1-d0);
 return Math.abs(-(ax+(bx-ax)*f)*sin+(ay+(by-ay)*f)*cos)<=half;
}
function sprintRecord(wallet,key,seconds){
 if(!(Number.isFinite(seconds)&&seconds>0))return false;
 const records=wallet.sprintBest||(wallet.sprintBest={});
 if(Number.isFinite(records[key])&&records[key]<=seconds)return false;
 records[key]=seconds;return true;
}
function sprintText(sec){return Number.isFinite(sec)?sec.toFixed(2)+' s':'—';}
function openCoastalSprint(h){
 const course=sprintCourses();if(!course)return;
 const blocked=!sprintOutsideCar(h)||NET.on||OPEN_WORLD.joined||!!CONTRACT||h.wanted>.01;
 return cityModal(SPRINT_NAME,({card,note,option,close})=>{
  card.classList.add('career-panel');
  note.textContent=sprintRun?'A sprint is in progress.':blocked?'Get in a car, clear your wanted level and finish any dispatch job first.':'Choose a route, then drive through the start line in the arrow direction. Beat your own best time. No entry fee.';
  for(const [key,v] of Object.entries(course.variants))option(v.name.toUpperCase()+' · '+sprintText(save[h.player].sprintBest?.[key]),v.description,()=>{
   if(blocked||sprintRun)return;
   sprintRun={tile,actor:h,key,course,variant:v,cp:-1,last:{x:h.x,y:h.y},elapsed:0};close();
  },blocked||!!sprintRun);
  if(sprintRun)option('END CURRENT SPRINT','Your best times will be kept.',()=>{sprintRun=null;close();});
 });
}
function tickCoastalSprint(dt){
 const r=sprintRun;if(!r)return;
 const h=r.actor;
 if(!CAMP()||r.tile!==tile||!cars.includes(h)||!sprintOutsideCar(h)||NET.on||OPEN_WORLD.joined||CONTRACT||h.wanted>.01){sprintRun=null;return;}
 const next={x:h.x,y:h.y}, moved=sprintDistance(r.last,next);
 if(r.cp>=0)r.elapsed+=dt;
 const gate=r.cp<0?r.course.start:r.variant.gates[r.cp];
 if(moved<130&&sprintGateCrossed(r.last,next,gate)){
  r.cp++;sfx(r.cp===r.variant.gates.length?1050:800,.11,'triangle');
  if(r.cp===r.variant.gates.length){
   const best=sprintRecord(save[h.player],r.key,r.elapsed);if(best)persist();
   toast(r.variant.name.toUpperCase()+' · '+sprintText(r.elapsed)+(best?' · NEW PERSONAL BEST!':' · FINISH!'));sprintRun=null;return;
  }
 }
 r.last=next;
}
const SPRINT_COLOURS={ink:'#1a272d',cream:'#efe4c8',teal:'#78cfbc',sand:'#d9b879'};
function drawSprintGate(g,index,finished){
 ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.angle);const c=index<0||finished?SPRINT_COLOURS.sand:SPRINT_COLOURS.teal;
 ctx.fillStyle=SPRINT_COLOURS.ink;ctx.fillRect(-11,-SPRINT_HALF_GATE-3,22,2*SPRINT_HALF_GATE+6);
 for(let i=0;i<12;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)%2?c:SPRINT_COLOURS.ink;ctx.fillRect(-9+j*9,-SPRINT_HALF_GATE+i*12.65,9,12.65);}
 ctx.fillStyle=c;for(const y of [-SPRINT_HALF_GATE-4,SPRINT_HALF_GATE+4]){ctx.beginPath();ctx.arc(0,y,5,0,Math.PI*2);ctx.fill();}
 ctx.beginPath();ctx.moveTo(34,-13);ctx.lineTo(54,0);ctx.lineTo(34,13);ctx.lineTo(34,6);ctx.lineTo(19,6);ctx.lineTo(19,-6);ctx.lineTo(34,-6);ctx.closePath();ctx.fill();ctx.restore();
}
function drawCoastalSprint(vp){
 const r=sprintRun;if(!r||r.actor!==vp.car)return;
 const g=r.cp<0?r.course.start:r.variant.gates[r.cp], finish=r.cp===r.variant.gates.length-1;
 const a=r.actor,cam=a.cam;
 if(sprintDistance(g,cam)<1700)drawSprintGate(g,r.cp,finish);
 let guide=r.variant.line;
 if(r.cp<0&&sprintDistance(a,g)>460){
  if(!r.nav||simT-r.navAt>1.5){r.nav=gpsRoute(a,g);r.navAt=simT;}
  guide=r.nav||[];
 }
 if(guide.length>1){
  ctx.save();ctx.strokeStyle=r.cp<0?'rgba(225,189,100,.68)':'rgba(120,207,188,.68)';ctx.lineWidth=5;ctx.lineJoin='round';ctx.setLineDash([14,20]);
  ctx.beginPath();guide.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
 }

}
function sprintHud(vp){
 const r=sprintRun;if(!r||r.actor!==vp.car||paused||COMIC)return;
 const h=r.actor,g=r.cp<0?r.course.start:r.variant.gates[r.cp],d=Math.round(sprintDistance(h,g)/10);
 const diff=wrapA(Math.atan2(g.y-h.y,g.x-h.x)-h.a), arrow=Math.abs(diff)<.48?'↑':Math.abs(diff)>2.6?'↓':diff<0?'←':'→';
 const label=r.cp<0?'START · '+d+'m '+arrow:(r.cp+1)+'/'+r.variant.gates.length+' · '+sprintText(r.elapsed)+' · '+d+'m '+arrow;
 const x=vp.x+vp.w/2,y=compactTouch(vp)?deviceInsets().top+8:14;
 ctx.save();ctx.fillStyle='#182c34ed';ctx.font='800 13px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const w=Math.max(172,ctx.measureText(label).width+38);
 ctx.fillRect(x-w/2,y,w,40);ctx.strokeStyle=SPRINT_COLOURS.teal;ctx.strokeRect(x-w/2,y,w,40);
 ctx.fillStyle=SPRINT_COLOURS.cream;ctx.fillText(r.variant.name.toUpperCase(),x,y+11);ctx.fillStyle=SPRINT_COLOURS.teal;ctx.fillText(label,x,y+28);ctx.restore();
}
const updateBeforeSprint=update;
update=function(dt){updateBeforeSprint(dt);if(state==='race')tickCoastalSprint(dt);else if(state!=='count')sprintRun=null;};
const detailsBeforeSprint=drawCityDetails;
drawCityDetails=function(vp,time){detailsBeforeSprint(vp,time);drawCoastalSprint(vp);};
const hudBeforeSprint=drawHUD;
drawHUD=function(vp,time){hudBeforeSprint(vp,time);sprintHud(vp);};

const mobileObjectiveBeforeSprint=mobileObjectiveText;
mobileObjectiveText=function(c){return sprintRun?.actor===c?'':mobileObjectiveBeforeSprint(c);};
