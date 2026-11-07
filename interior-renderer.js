/* Cached floor materials and illustrated furnishings for walk-in buildings. */
window.INTERIOR_FURNITURE = new Image();
INTERIOR_FURNITURE.src = 'assets/interior-furniture-v2.webp';
const interiorCells = {bed:0,sofa:1,table:2,tv:3,plant:4,rug:5,shelf:6,counter:7,fridge:8,desk:9,armchair:10,cabinet:11};
const interiorMaterials = new Map();
function interiorNoise(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
function interiorMaterial(kind){
  if(interiorMaterials.has(kind))return interiorMaterials.get(kind);
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  g.fillStyle={wood:'#796248',tile:'#aaa99b',carpet:'#69747a',concrete:'#85857e'}[kind]||'#85857e';g.fillRect(0,0,256,256);
  if(kind==='wood'){
    for(let row=0;row<16;row++)for(let col=-1;col<3;col++){
      const x=col*128+(row%2)*64,y=row*16,n=interiorNoise(col,row);
      g.fillStyle=`hsl(${29+n*7} 24% ${38+n*10}%)`;g.fillRect(x,y,127,15);
      g.fillStyle='#ffffff0d';g.fillRect(x,y,127,1);g.fillStyle='#21180e50';g.fillRect(x+127,y,1,16);
      for(let k=0;k<10;k++){const dy=y+2+k*1.2;g.strokeStyle=k%3?'#36200c20':'#f5e0b318';g.lineWidth=.35;g.beginPath();g.moveTo(x+4,dy);g.bezierCurveTo(x+30,dy+interiorNoise(row,k)*2,x+90,dy-1,x+123,dy);g.stroke();}
    }
  }else if(kind==='tile'){
    for(let y=0;y<256;y+=32)for(let x=0;x<256;x+=32){const n=interiorNoise(x,y);g.fillStyle=`hsl(42 9% ${65+n*8}%)`;g.fillRect(x+1,y+1,30,30);g.strokeStyle='#ffffff18';g.strokeRect(x+1.5,y+1.5,29,29);}
  }
  for(let i=0;i<12000;i++){const x=interiorNoise(i,1)*256,y=interiorNoise(i,2)*256;g.fillStyle=i%2?'rgba(255,246,219,.055)':'rgba(12,22,25,.07)';g.fillRect(x,y,kind==='carpet'?1:1.5,.65);}
  interiorMaterials.set(kind,c);return c;
}
window.paintInteriorFloor=function(g,b){
  g.save();g.translate(b.x0,b.y0);g.fillStyle=g.createPattern(interiorMaterial(b.floor),'repeat');g.fillRect(0,0,b.x1-b.x0,b.y1-b.y0);g.restore();
};
window.paintInteriorFurniture=function(g,f){
  const im=INTERIOR_FURNITURE,index=interiorCells[f.t];if(index==null||!im.complete||!im.naturalWidth)return false;
  const cw=im.naturalWidth/4,ch=im.naturalHeight/3;
  g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(im,index%4*cw,Math.floor(index/4)*ch,cw,ch,0,0,f.w,f.h);
  g.restore();return true;
};
window.paintInteriorLight=function(g,b){
  const x=b.x0,y=b.y0,w=b.x1-x,h=b.y1-y;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  const ambient=g.createRadialGradient(x+w*.35,y+h*.3,0,x+w*.5,y+h*.5,Math.max(w,h)*.7);
  ambient.addColorStop(0,'rgba(255,235,185,.08)');ambient.addColorStop(.6,'rgba(18,28,34,.015)');ambient.addColorStop(1,'rgba(13,22,29,.22)');g.fillStyle=ambient;g.fillRect(x,y,w,h);
  const edge=g.createLinearGradient(x,y,x+18,y+18);edge.addColorStop(0,'rgba(8,17,22,.28)');edge.addColorStop(1,'rgba(8,17,22,0)');g.fillStyle=edge;g.fillRect(x,y,w,h);
  g.strokeStyle='#444b49';g.lineWidth=8;g.strokeRect(x+4,y+4,w-8,h-8);g.strokeStyle='#b1aa95';g.lineWidth=1;g.strokeRect(x+8.5,y+8.5,w-17,h-17);
  // Window sill and the soft light it casts on the floor.
  if(!b.jail&&w>130){g.fillStyle='#93a7a3';g.fillRect(x+w*.22,y+3,w*.28,4);const light=g.createLinearGradient(0,y+9,0,y+Math.min(h*.45,100));light.addColorStop(0,'rgba(255,229,164,.16)');light.addColorStop(1,'rgba(255,229,164,0)');g.fillStyle=light;g.beginPath();g.moveTo(x+w*.22,y+9);g.lineTo(x+w*.5,y+9);g.lineTo(x+w*.65,y+Math.min(h*.45,100));g.lineTo(x+w*.3,y+Math.min(h*.45,100));g.closePath();g.fill();}
  g.restore();
};
