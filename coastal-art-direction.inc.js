/* Shared material and lighting direction for the rendered city and its shops. */
const COASTAL_RETAIL_ART=new Image();COASTAL_RETAIL_ART.src='assets/coastal-retail-interiors-v1.webp';
const COASTAL_RETAIL_FRAMES={food:0,tech:1,grocery:2,fashion:3,sport:4,books:5,home:6};
const roomBeforeCoastal=paintRetailRoom;
paintRetailRoom=function(g,x,w,h,shop,time,alarm){
 const index=COASTAL_RETAIL_FRAMES[shop.theme],im=COASTAL_RETAIL_ART;
 if(index==null||!im.complete||!im.naturalWidth)return roomBeforeCoastal(g,x,w,h,shop,time,alarm);
 const sw=im.naturalWidth/4,sh=im.naturalHeight/2;
 g.drawImage(im,index%4*sw,Math.floor(index/4)*sh,sw,sh,x,0,w,h);
 if(alarm){g.fillStyle='rgba(179,42,31,.05)';g.fillRect(x,0,w,h);}
};
const roadBeforeCoastal=roadMaterial;
roadMaterial=function(kind,seed=0){
 if(TH.snow||!GROUNDIMG.complete||!GROUNDIMG.naturalWidth)return roadBeforeCoastal(kind,seed);
 const key='rendered-asphalt-'+(TH.night?'wet':'day');if(ROAD_VARIANTS[key])return ROAD_VARIANTS[key];
 const c=document.createElement('canvas');c.width=c.height=384;const g=c.getContext('2d'),sw=GROUNDIMG.naturalWidth/2,sh=GROUNDIMG.naturalHeight/2;
 g.drawImage(GROUNDIMG,TH.night?sw:0,0,sw,sh,0,0,384,384);
 return ROAD_VARIANTS[key]=ctx.createPattern(c,'repeat');
};
const grassBeforeCoastal=suburbanGrass;
suburbanGrass=function(seed){
 if(!GROUNDIMG.complete||!GROUNDIMG.naturalWidth)return grassBeforeCoastal(seed);
 const key='rendered-grass-'+seed%5;if(SUBURB_GRASS.has(key))return SUBURB_GRASS.get(key);
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),sw=GROUNDIMG.naturalWidth/2,sh=GROUNDIMG.naturalHeight/2;
 g.drawImage(GROUNDIMG,sw,sh,sw,sh,0,0,256,256);g.fillStyle=['#846d2920','#254c3020','#7f8a3020','#345a4420','#8d7e3220'][Math.abs(seed)%5];g.fillRect(0,0,256,256);
 const p=ctx.createPattern(c,'repeat');SUBURB_GRASS.set(key,p);return p;
};
// Replace the remaining circle-only street trees with the existing rendered canopy art.
function drawCoastalStreetTree(x,y,r,seed){const t={x:seed,y:seed*7,r};return drawComicTree(t,x,y);}
