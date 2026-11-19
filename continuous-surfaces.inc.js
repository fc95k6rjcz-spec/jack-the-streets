/* World-anchored materials prevent district tiles looking like coloured blocks. */
const DISTRICT_MATERIALS=new Map();
districtSurface=function(c,r,kind){
 const profile=districtAt((c+.5)*T,(r+.5)*T),tint=kind===PAVE?profile.pave:profile.park,base=kind===PAVE?PAT.pave:PAT.park;
 const key=kind+':'+tint+':'+(GROUNDIMG.complete&&GROUNDIMG.naturalWidth?'art':'fallback');
 if(!DISTRICT_MATERIALS.has(key)){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const g=canvas.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);g.globalAlpha=.10;g.fillStyle=tint;g.fillRect(0,0,256,256);DISTRICT_MATERIALS.set(key,ctx.createPattern(canvas,'repeat'));}
 return DISTRICT_MATERIALS.get(key);
};
const COAST_WATER=new Map();
function coastWaterMaterial(deep){if(COAST_WATER.has(deep))return COAST_WATER.get(deep);const canvas=document.createElement('canvas');canvas.width=canvas.height=384;const g=canvas.getContext('2d');g.fillStyle=deep?'#1c5364':'#438c91';g.fillRect(0,0,384,384);
 for(let i=0;i<2400;i++){const x=hashN(i*17+3)*384,y=hashN(i*37+9)*384;g.strokeStyle=i%3?'rgba(158,216,214,.07)':'rgba(5,40,60,.12)';g.lineWidth=.5+hashN(i)*1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+3+hashN(i*11)*14,y-1);g.stroke();}
 const pattern=ctx.createPattern(canvas,'repeat');COAST_WATER.set(deep,pattern);return pattern;}
drawWaterSurface=function(v,time){const c0=Math.max(0,Math.floor(v.x0/T)),c1=Math.min(COLS-1,Math.floor((v.x0+v.w)/T)),r0=Math.max(0,Math.floor(v.y0/T)),r1=Math.min(ROWS-1,Math.floor((v.y0+v.h)/T));ctx.save();
 for(const deep of [true,false]){ctx.save();ctx.beginPath();for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(at(c,r)===(deep?DEEP:SHAL))ctx.rect(c*T,r*T,T+.5,T+.5);ctx.clip();ctx.fillStyle=coastWaterMaterial(deep);ctx.fillRect(v.x0,v.y0,v.w,v.h);
  // All ripples use world coordinates, so movement never exposes tile borders.
  for(let row=Math.floor(v.y0/24);row<Math.ceil((v.y0+v.h)/24);row++)for(let col=Math.floor(v.x0/67)-1;col<Math.ceil((v.x0+v.w)/67)+1;col++){const seed=row*97+col*31,x=col*67+hashN(seed)*35,y=row*24+hashN(seed+4)*15,phase=time*.0007+seed;ctx.strokeStyle=deep?'rgba(185,224,221,.13)':'rgba(229,244,222,.20)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y+Math.sin(phase)*2);ctx.quadraticCurveTo(x+9,y-2+Math.sin(phase)*2,x+19+hashN(seed+7)*18,y);ctx.stroke();}
 ctx.restore();}
 // Only the actual shoreline receives foam, not every square water tile.
 ctx.strokeStyle='rgba(227,241,218,.4)';ctx.lineWidth=2;ctx.beginPath();for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if([DEEP,SHAL].includes(at(c,r)))for(const [dc,dr]of [[1,0],[-1,0],[0,1],[0,-1]]){const k=at(c+dc,r+dr);if(k===DEEP||k===SHAL)continue;const x=c*T,y=r*T;if(dc){const xx=x+(dc>0?T-2:2);ctx.moveTo(xx,y);ctx.lineTo(xx,y+T);}else{const yy=y+(dr>0?T-2:2);ctx.moveTo(x,yy);ctx.lineTo(x+T,yy);}}ctx.stroke();ctx.restore();
};
