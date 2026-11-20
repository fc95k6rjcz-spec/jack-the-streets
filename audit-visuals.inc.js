/* Keep scenery readable around the player and show each starter repair. */
const treeBeforeVisibility=drawComicTree;
drawComicTree=function(t,x,y){
 const obscures=cars.some(c=>c.human&&!c.inside&&Math.hypot(c.x-x,c.y-y)<t.r*1.45+45);
 ctx.save();if(obscures)ctx.globalAlpha*=.28;
 const result=treeBeforeVisibility(t,x,y);ctx.restore();return result;
};
const garageBeforeRepairWear=cutawayWorkshopArt;
cutawayWorkshopArt=function(h,S){
 garageBeforeRepairWear(h,S);
 if(camp().garageLevel)return;
 const repairs=camp().garageRepairs||[],{ox,oy,rw,rh}=S;
 ctx.save();ctx.translate(ox,oy);ctx.scale(rw,rh);
 if(!repairs.includes('lights')){ctx.fillStyle='rgba(10,19,28,.36)';ctx.fillRect(.205,.405,.63,.39);}
 if(!repairs.includes('roof')){
  // Damp floor stains and fallen roof boards disappear when the roof is repaired.
  for(let i=0;i<8;i++){const x=.29+(i%4)*.12,y=.57+Math.floor(i/4)*.13;ctx.fillStyle='rgba(20,32,34,.32)';ctx.beginPath();ctx.ellipse(x,y,.035,.014,.1*i,0,7);ctx.fill();}
  for(let i=0;i<4;i++){ctx.save();ctx.translate(.29+i*.026,.72-i*.012);ctx.rotate(.25);ctx.fillStyle=i%2?'#6e5540':'#8a6c4c';ctx.fillRect(0,0,.013,.06);ctx.strokeStyle='#302c24';ctx.lineWidth=.001;ctx.strokeRect(0,0,.013,.06);ctx.restore();}
 }
 if(!repairs.includes('bench')){
  ctx.fillStyle='rgba(39,33,29,.8)';ctx.fillRect(.25,.445,.14,.06);
  ctx.strokeStyle='#d0a865';ctx.lineWidth=.006;ctx.beginPath();ctx.moveTo(.25,.445);ctx.lineTo(.39,.505);ctx.moveTo(.39,.445);ctx.lineTo(.25,.505);ctx.stroke();
 }
 ctx.restore();
};
