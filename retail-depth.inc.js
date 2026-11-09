/* A consistent cutaway projection: upright actors with feet on the floor. */
function drawRetailPerson(g,x,y,h,actor,time){
 const look=CHARACTER_LOOKS.find(l=>l.id===actor.look)||CHARACTER_LOOKS[0];
 const size=h*(.145+.035*actor.py),step=actor.moving?Math.floor(time/145)%4:0;
 g.save();g.translate(x,y);
 const shadow=g.createRadialGradient(0,0,0,0,0,size*.29);shadow.addColorStop(0,'rgba(12,16,18,.6)');shadow.addColorStop(1,'rgba(12,16,18,0)');
 g.save();g.scale(1,.36);g.fillStyle=shadow;g.beginPath();g.arc(0,0,size*.29,0,Math.PI*2);g.fill();g.restore();
 if(CHARACTER_SPRITES.complete&&CHARACTER_SPRITES.naturalWidth){const cw=CHARACTER_SPRITES.naturalWidth/4,ch=CHARACTER_SPRITES.naturalHeight/6;g.drawImage(CHARACTER_SPRITES,step*cw,look.row*ch,cw,ch,-size*.5,-size*.97,size,size);}
 else{g.scale(size/48,size/48);drawPlayerLook({x:0,y:-22,a:-Math.PI/2,appearance:actor.look},time);}
 if(actor.officer){g.fillStyle='#74b7f2';g.font='bold '+Math.max(8,size*.075)+'px sans-serif';g.textAlign='center';g.fillText('POLICE',0,-size*.52);}
 g.restore();
}
function retailOcclude(g,x,w,h,store,time,alarm,actor){
 if(!COASTAL_RETAIL_ART.complete||!COASTAL_RETAIL_ART.naturalWidth)return;
 const fixtures=retailFixtures(store.theme).concat([{x:.40,y:.205,w:.30,h:.105}]);
 for(const f of fixtures){if(actor.py>f.y+f.h||actor.py<f.y-.14||actor.px<f.x-.045||actor.px>f.x+f.w+.045)continue;
  g.save();g.beginPath();g.rect(x+f.x*w,f.y*h,f.w*w,f.h*h);g.clip();paintRetailRoom(g,x,w,h,store,time,alarm);g.restore();
 }
}
const retailBeforeDepth=drawRetailInterior;
drawRetailInterior=function(vp,c,time,u){
 // Match the original illustrated room's proportions instead of stretching it.
 const aspect=COASTAL_RETAIL_ART.naturalWidth?COASTAL_RETAIL_ART.naturalWidth/4/(COASTAL_RETAIL_ART.naturalHeight/2):1.5;
 const height=Math.min(vp.h,vp.w/aspect),width=height*aspect,left=vp.x+(vp.w-width)/2,top=(vp.h-height)/2;
 ctx.save();ctx.fillStyle='#101b22';ctx.fillRect(vp.x,0,vp.w,vp.h);ctx.translate(0,top);
 retailBeforeDepth({ ...vp,x:left,w:width,h:height },c,time,u);
 // Recessed wall edges and a soft foreground falloff give the room volume.
 const shade=ctx.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#08101830');shade.addColorStop(.3,'#08101800');shade.addColorStop(.75,'#08101800');shade.addColorStop(1,'#08101838');ctx.fillStyle=shade;ctx.fillRect(left,0,width,height);
 ctx.restore();
};
