// On-foot island scene. Coordinates and sprite proportions match Jack's city walker.
window.walkIsland = function(host, wallet, buildings, save, title, board) {
  const scene=document.createElement('section');
  scene.style.cssText='position:absolute;inset:0;background:#22768a;overflow:hidden';
  scene.innerHTML='<canvas aria-label="Walk on the island" style="width:100%;height:100%;touch-action:none"></canvas><div style="position:absolute;left:12px;top:10px;background:#182c32ef;color:#fff4ce;padding:8px 13px;border-radius:6px;pointer-events:none"><b></b><small style="display:block">Walk with arrows / WASD or tap the ground</small></div><div data-build style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:max-content;max-width:94%;max-height:48%;overflow:auto;text-align:center;background:#1a3038ee;color:white;border-radius:8px;padding:6px"></div>';
  host.append(scene);scene.querySelector('b').textContent=title;
  const canvas=scene.querySelector('canvas'),g=canvas.getContext('2d'),menu=scene.querySelector('[data-build]');
  const sprite=new Image(), roofs=new Image();
  sprite.src='/assets/character-overhead.webp';roofs.src='/assets/coastal-city-roofs.webp';
  const row=Math.max(0,['redline','coast','nightshift','violet','classic','golden'].indexOf(wallet.appearance));
  const catalogue={cabin:['Weatherboard cabin',0,0],shed:['Boat workshop',0,1],tower:['Lighthouse',0,-1],villa:['Pool villa',0,4],club:['Surf clubhouse',0,7],observatory:['Observatory',0,2]};
  const plots=[[-210,-145],[0,-175],[205,-135],[-210,100],[10,105],[220,100]];
  let x=-390,y=0,a=0,step=0,goal=null,frame,last=performance.now(),active=null,shopping=false,cameraX=0,cameraY=0,zoom=1;
  const keys=new Set();
  function button(label,fn,disabled=false){const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.style.cssText='margin:3px;padding:10px;min-height:44px;font-weight:700';b.onclick=fn;menu.append(b);}
  function controls(id){
    active=id;menu.replaceChildren();shopping=false;
    if(id==='boat'){button('Board your boat',()=>{cancelAnimationFrame(frame);window.removeEventListener('blur',blur);host.onkeydown=host.onkeyup=null;scene.remove();board();});return;}
    if(id===null){menu.textContent='Walk to a marked plot to build';return;}
    const built=catalogue[buildings[id]];
    if(built){menu.textContent=built[0];return;}
    button('Build on plot '+(id+1),()=>{
      shopping=true;goal=null;keys.clear();menu.replaceChildren();menu.append('Bank $'+wallet.cash,document.createElement('br'));
      for(const [key,[name,price]] of Object.entries(catalogue))button(name+' · '+(price?'$'+price:'Free'),()=>{
        if(buildings[id]||wallet.cash<price)return;
        wallet.cash-=price;buildings[id]=key;save();controls(id);host.focus();
      },wallet.cash<price);
      button('Back',()=>controls(id));
    });
  }
  function blur(){keys.clear();goal=null;}
  window.addEventListener('blur',blur);host.focus();
  host.onkeydown=e=>{e.stopPropagation();if(/^(Arrow|Key[WASD]$)/.test(e.code)){e.preventDefault();keys.add(e.code);goal=null;}};
  host.onkeyup=e=>{e.stopPropagation();keys.delete(e.code);};
  function tap(e){const r=canvas.getBoundingClientRect();goal=[cameraX+(e.clientX-r.left-r.width/2)/zoom,cameraY+(e.clientY-r.top-r.height/2)/zoom];}
  canvas.onpointerdown=e=>{if(!shopping){canvas.setPointerCapture(e.pointerId);tap(e);}};
  canvas.onpointermove=e=>{if(canvas.hasPointerCapture(e.pointerId)&&!shopping)tap(e);};
  function oval(px,py,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(px,py,rx,ry,0,0,7);g.fill();}
  function tick(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    let dx=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')),dy=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
    if(goal&&!shopping){dx=goal[0]-x;dy=goal[1]-y;if(Math.hypot(dx,dy)<4){goal=null;dx=dy=0;}}
    const mag=Math.hypot(dx,dy);
    if(mag&&!shopping){a=Math.atan2(dy,dx);const stride=Math.min(dt*200,goal?mag:Infinity);
      const legal=(u,v)=>(u*u/(437*437)+v*v/(288*288)<1)&&!plots.some(([px,py],i)=>buildings[i]&&Math.abs(u-px)<48&&Math.abs(v-py)<37);
      if(legal(x+dx/mag*stride,y))x+=dx/mag*stride;if(legal(x,y+dy/mag*stride))y+=dy/mag*stride;step+=dt*9;
    }
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    zoom=Math.max(.82,Math.min(1.5,h/430));cameraX=x;cameraY=y;
    g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#237e91';g.fillRect(0,0,w,h);
    g.translate(w/2,h/2);g.scale(zoom,zoom);g.translate(-x,-y);
    oval(0,0,466,316,'#78c9bb');oval(0,0,451,303,'#eed5a0');oval(0,0,417,270,'#8ca471');
    for(let n=0;n<180;n++){const px=Math.sin(n*79)*405,py=Math.cos(n*47)*266;if(px*px/169000+py*py/68600<1)oval(px,py,3,1,'#79945f');}
    g.fillStyle='#78573d';g.fillRect(-469,-20,94,40);for(let n=0;n<9;n++){g.fillStyle='#ab845a';g.fillRect(-466+n*10,-19,8,38);}
    g.textAlign='center';g.font='bold 13px system-ui';g.fillStyle='#192d36';g.fillText('JETTY',-405,-30);
    plots.forEach(([px,py],i)=>{
      const key=buildings[i],b=catalogue[key];
      if(!b){g.strokeStyle='#ffe59a';g.setLineDash([7,5]);g.strokeRect(px-48,py-37,96,74);g.setLineDash([]);g.fillStyle='#294739';g.fillText('PLOT '+(i+1),px,py+4);return;}
      g.fillStyle='#526849';g.fillRect(px-45,py-33,96,76);
      if(b[2]>=0&&roofs.naturalWidth){const sw=roofs.width/3,sh=roofs.height/3;g.drawImage(roofs,b[2]%3*sw,Math.floor(b[2]/3)*sh,sw,sh,px-48,py-37,96,74);}
      if(key==='tower'){oval(px,py,33,33,'#d4bf99');oval(px,py,24,24,'#a64238');oval(px,py,17,17,'#fff1d2');oval(px,py,9,9,'#ffd154');}
      if(key==='villa'){g.fillStyle='#54cace';g.fillRect(px+19,py+9,24,19);}
      if(key==='observatory'){oval(px,py,23,23,'#a6bcc8');g.fillStyle='#294653';g.fillRect(px-3,py-21,6,42);}
      g.fillStyle='#192d36';g.fillText(b[0],px,py+55);
    });
    g.save();g.translate(x,y);g.rotate(a+Math.PI/2);oval(2,5,16,11,'#46533f');
    if(sprite.naturalWidth){const sw=sprite.width/4,sh=sprite.height/6,f=mag&&!shopping?[1,2,3,2][Math.floor(step)%4]:0;g.drawImage(sprite,f*sw,row*sh,sw,sh,-22,-22,44,44);}g.restore();
    const i=plots.findIndex(([px,py])=>Math.hypot(px-x,py-y)<89),near=i>=0?i:Math.hypot(x+402,y)<66?'boat':null;
    if(near!==active&&!shopping)controls(near);frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
};
