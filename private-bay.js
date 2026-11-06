/* A separate private inlet keeps city traffic and police out of the island. */
window.openPrivateBay = function (wallet, saveIsland, returnToRamp) {
  const host = document.createElement('dialog');
  host.setAttribute('aria-label','Jack’s private island');
  host.style.cssText='position:fixed;inset:0;width:100vw;max-width:none;height:100dvh;max-height:none;margin:0;border:0;padding:0;background:#102d38;color:#fff4da;z-index:9999;font:600 16px system-ui';
  document.body.append(host);
  const plots = [[425,123],[517,105],[585,150],[435,203],[525,204]];
  const catalogue = {
    cabin:{name:'Weatherboard cabin',cost:0,art:'<rect x="-25" y="-11" width="50" height="29" fill="#edcc92"/><path d="M-29 -10L-4 -32 29 -12 24 -5 -4 -22 -23 -5Z" fill="#b34432"/><rect x="-3" y="1" width="10" height="17" fill="#734734"/><path d="M-18 1h10v8h-10z" fill="#80bcc5"/>'},
    shed:{name:'Boat shed',cost:300,art:'<path d="M-30 -14L-17 -26 27 -23 30 -12V17H-30Z" fill="#628c92"/><rect x="-19" y="-6" width="38" height="23" fill="#355761"/><path d="M-18 0h36m-36 6h36m-36 6h36" stroke="#94afb0"/>'},
    tower:{name:'Lighthouse',cost:600,art:'<path d="M-13 19L-7 -29H7L14 19Z" fill="#fff0cd"/><path d="M-10 -10h20l2 12h-24z" fill="#c94436"/><path d="M-9 -29v-10H9v10z" fill="#ffca4b"/><path d="M-13 -39L0 -48 13 -39Z" fill="#9d302e"/>'}
  };
  host.innerHTML='<main style="max-width:900px;margin:auto;padding:10px 16px"><header style="display:flex;align-items:center;gap:12px"><img src="/boat-trailer.png" alt="" width="76"><h2 style="margin:6px 0">Jack’s Island</h2></header><svg viewBox="0 0 720 320" aria-label="Bay and island plots" style="width:100%;max-height:58dvh;background:#337f91;touch-action:none"><defs><pattern id="ripples" width="45" height="27" patternUnits="userSpaceOnUse"><path d="M3 13q6 -4 13 0t12 0" stroke="#91d1cc" fill="none" opacity=".46"/></pattern></defs><rect width="720" height="320" fill="url(#ripples)"/><path d="M0 180Q85 193 69 253T107 320H0Z" fill="#c6aa71"/><path d="M330 166Q347 77 421 57T554 51Q640 53 663 125T637 224Q581 275 484 266T356 229Z" fill="#dfc494" stroke="#8cd5c7" stroke-width="12"/><path d="M347 166Q360 89 427 71T552 64Q634 67 645 131T621 214Q566 251 479 250T369 217Z" fill="#789760"/><path d="M43 259h72m212 -76h53" stroke="#65503b" stroke-width="20"/><g data-plots></g><g data-boat><path d="M-17 -8Q4 -12 19 0Q5 12 -17 8Z" fill="#f3dfb0" stroke="#253438" stroke-width="3"/><rect x="-7" y="-5" width="12" height="10" fill="#286270"/></g><g data-jack></g></svg><p role="status"></p><div data-actions style="display:flex;gap:8px;flex-wrap:wrap"></div></main>';
  host.showModal();
  const svg=host.querySelector('svg'), boat=host.querySelector('[data-boat]'), action=host.querySelector('[data-actions]'), status=host.querySelector('[role=status]');
  const dock={x:322,y:184}, home={x:116,y:259};
  let ashore=false, pos={...home}, frame=0;
  function button(label,fn,disabled=false){
    const b=document.createElement('button');b.textContent=label;b.disabled=disabled;
    b.style.cssText='padding:10px 15px;min-height:44px;background:#ffd65a;color:#192a32;border:2px solid #192a32;font-weight:800;cursor:pointer';
    b.onclick=fn;action.append(b);return b;
  }
  function paintPlots(){
    host.querySelector('[data-plots]').innerHTML=plots.map(([x,y],i)=>{
      const b=catalogue[wallet.islandBuildings[i]];
      return '<g transform="translate('+x+' '+y+')" data-i="'+i+'" style="cursor:pointer">'+(b?b.art:'<rect x="-24" y="-14" width="48" height="28" rx="4" fill="#d4bc83" stroke="#514f37" stroke-dasharray="4 3"/><text text-anchor="middle" y="5" fill="#443b25">'+(i+1)+'</text>')+'<rect x="-30" y="-32" width="60" height="56" fill="transparent"/></g>';
    }).join('');
  }
  function select(i){
    if(!ashore)return;
    const [x,y]=plots[i];host.querySelector('[data-jack]').innerHTML='<circle cx="'+x+'" cy="'+(y+23)+'" r="6" fill="#e9b084" stroke="#792f2c" stroke-width="4"/>';
    const built=catalogue[wallet.islandBuildings[i]];
    status.textContent=built?built.name:'Plot '+(i+1)+' · Bank $'+wallet.cash;
    action.replaceChildren();
    if(!built)for(const [id,b] of Object.entries(catalogue))button(b.name+' · '+(b.cost?'$'+b.cost:'Free'),()=>{
      if(wallet.islandBuildings[i]||wallet.cash<b.cost)return;
      wallet.cash-=b.cost;wallet.islandBuildings[i]=id;saveIsland();paintPlots();select(i);
    },wallet.cash<b.cost);
    button('Back to jetty',land);
  }
  function land(){
    view(0,0);ashore=true;action.replaceChildren();status.textContent='Choose a plot to build on your island.';
    plots.forEach((_,i)=>button('Plot '+(i+1),()=>select(i)));
    button('Board your boat',()=>drive(dock,Math.PI));
  }

  const held=new Set();
  const drivingKeys=new Set(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight']);
  const shores=[...svg.querySelectorAll(':scope > path')].slice(0,2);
  // Coordinates are shared by navigation, drawing and collisions. Only nearby islands stay in memory.
  const ocean=document.createElementNS(svg.namespaceURI,'g');
  svg.insertBefore(ocean,shores[0]);
  const water=svg.querySelector(':scope > rect');
  const columns=24, circumference=columns*720;
  const wrapEast=value=>value-circumference*Math.floor((value+circumference/2)/circumference);
  let voyageEast=0;
  let sector='',islets=[];
// Natural Earth 1:110m land, projected in game units (48 units per degree).
  let worldLand=null;
  const ports=[
    ['Sydney','Australia',151.8,-33.85],['Auckland','New Zealand',175.15,-36.55],
    ['Suva','Fiji',178.48,-18.5],['Honolulu','USA',-157.95,21.0],
    ['Valparaiso','Chile',-72,-33.0],['Cape Town','South Africa',18.05,-33.9],
    ['Yokohama','Japan',139.98,34.95]
  ].map(([city,country,lon,lat])=>({name:city,country,x:lon*48,y:-lat*48}));
  let destination=ports[1];
  async function launchWorld(trigger){
    trigger.disabled=true;
    try{
      const response=await fetch('/world-land.json');
      if(!response.ok)throw Error();
      const data=await response.json();
      if(!host.open)return;
      const rings=data.features.flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat());
      const outline=rings.map(r=>r.map(([lon,lat],i)=>(i?'L':'M')+(lon*48).toFixed(1)+' '+(-lat*48).toFixed(1)).join('')+'Z').join('');
      for(const el of svg.children)if(![water,boat,ocean].includes(el)&&el.tagName.toLowerCase()!=='defs')el.style.display='none';
      ocean.innerHTML='<path id="voyage-land" fill-rule="evenodd" fill="#859d68" stroke="#dfc996" stroke-width="5" d="'+outline+'"/>';
      worldLand=ocean.firstElementChild;
      for(const offset of [-circumference,0,circumference]){
        if(offset)ocean.insertAdjacentHTML('beforeend','<use href="#voyage-land" transform="translate('+offset+' 0)"/>');
        for(const p of ports)ocean.insertAdjacentHTML('beforeend','<g transform="translate('+(p.x+offset)+' '+p.y+')"><circle r="13" fill="#ffca4c" stroke="#344a43" stroke-width="3"/><text x="18" y="5" fill="white">'+p.name+'</text></g>');
      }
      host.querySelector('h2').textContent='World voyage';
      const select=document.createElement('select');select.setAttribute('aria-label','Steer toward port');
      ports.forEach((p,i)=>select.add(new Option(p.name+' · '+p.country,i)));
      select.value='1';select.onchange=()=>destination=ports[Number(select.value)];
      host.querySelector('header').append(select);
      drive(ports[0],0);
    }catch{status.textContent='The world chart could not load. Try again.';trigger.disabled=false;}
  }
  function chart(x,y){
    const col=Math.floor(x/720),row=Math.floor(y/400),key=col+','+row;
    if(key===sector)return;
    sector=key;islets=[];
    for(let j=row-1;j<=row+1;j++)for(let i=col-1;i<=col+1;i++){
      const longitudeColumn=((i%columns)+columns)%columns;
      if(longitudeColumn===0&&j===0)continue;
      let seed=(Math.imul(longitudeColumn,73856093)^Math.imul(j,19349663)^7919)>>>0;
      const roll=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const cx=i*720+170+roll()*360,cy=j*400+120+roll()*150,rx=52+roll()*73,ry=36+roll()*42;
      const names=['Gumtree','Pelican','Banksia','Shearwater','Coral','Wattle'];
      const name=names[Math.floor(roll()*names.length)]+' '+['Cay','Island','Key'][Math.floor(roll()*3)];
      const berth={x:cx-rx-22,y:cy,name,col:longitudeColumn,row:j};
      let canopy='';
      for(let t=0;t<12;t++){const angle=roll()*Math.PI*2,r=Math.sqrt(roll())*.76;
        canopy+='<circle cx="'+(cx+rx*r*Math.cos(angle))+'" cy="'+(cy+ry*r*Math.sin(angle))+'" r="'+(4+roll()*6)+'" fill="#456e53"/>';}
      islets.push({cx,cy,rx,ry,berth,art:'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#e1c58a" stroke="#8bd2bf" stroke-width="6"/><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(rx-11)+'" ry="'+(ry-10)+'" fill="#84a369"/>'+canopy+'<path d="M'+berth.x+' '+cy+'h32" stroke="#70553c" stroke-width="8"/><text x="'+cx+'" y="'+(cy+ry+22)+'" text-anchor="middle" fill="white">'+name+'</text>'});
    }
    ocean.innerHTML=islets.map(q=>q.art).join('');
  }
  function view(x,y){
    svg.setAttribute('viewBox',[x,y,720,320].join(' '));
    water.setAttribute('x',x);water.setAttribute('y',y);
  }
  let sailing=false, stickX=0, stickY=0;
  function resetInput(){held.clear();stickX=stickY=0;}
  function drive(start,heading){
    resetInput();sailing=true;ashore=false;pos={...start};
    host.querySelector('[data-jack]').replaceChildren();action.replaceChildren();
    const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
    status.textContent=touch?'Use the stick to steer. Slow down beside a jetty to dock.':'Drive with WASD or the arrow keys. Slow down beside a jetty and press Enter to dock.';
    if(touch){
      const pad=document.createElement('div'),knob=document.createElement('span');
      pad.setAttribute('aria-label','Boat steering stick');
      pad.style.cssText='width:78px;height:78px;border-radius:50%;background:#254958;border:3px solid #ffe094;display:grid;place-items:center;touch-action:none';
      knob.style.cssText='width:30px;height:30px;border-radius:50%;background:#ffcc43;pointer-events:none';
      pad.append(knob);action.append(pad);
      function track(e){const r=pad.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.max(30,Math.hypot(x,y));stickX=x/d;stickY=y/d;knob.style.transform='translate('+stickX*24+'px,'+stickY*24+'px)';}
      pad.onpointerdown=e=>{pad.setPointerCapture(e.pointerId);track(e);};
      pad.onpointermove=e=>{if(pad.hasPointerCapture(e.pointerId))track(e);};
      pad.onlostpointercapture=()=>{stickX=stickY=0;knob.style.transform='';};
    }
    let berth=null,speed=0,last=performance.now();
    const moor=button('Dock',()=>{
      if(!berth)return;
      sailing=false;resetInput();cancelAnimationFrame(frame);
      if(berth===dock)land();
      else if(berth===home||berth===ports[0])close();
      else {
        const stop=berth;
        ashore=true;action.replaceChildren();
        status.textContent=worldLand?'Moored at '+stop.name+', '+stop.country:'Moored at '+stop.name+' · chart '+stop.col+', '+stop.row;
        button('Board your boat',()=>drive(stop,Math.PI));
      }
    },true);
    function step(now){
      const dt=Math.min(.04,(now-last)/1000);last=now;
      let gas=Number(held.has('ArrowUp')||held.has('KeyW'))-Number(held.has('ArrowDown')||held.has('KeyS'));
      let turn=Number(held.has('ArrowRight')||held.has('KeyD'))-Number(held.has('ArrowLeft')||held.has('KeyA'));
      const mag=Math.hypot(stickX,stickY);
      if(mag>.15){
        const diff=Math.atan2(Math.sin(Math.atan2(stickY,stickX)-heading),Math.cos(Math.atan2(stickY,stickX)-heading));
        const reverse=Math.abs(diff)>2.2&&Math.abs(speed)<18;
        turn=reverse?-Math.sign(diff)*(Math.PI-Math.abs(diff)):diff;
        gas=reverse?-mag:mag;
      }
      speed=Math.max(-34,Math.min(100,speed+gas*(gas*speed<0?150:72)*dt));
      speed*=Math.exp(-dt*(held.has('ShiftLeft')||held.has('ShiftRight')?4:gas?.35:1.45));
      heading+=Math.max(-1,Math.min(1,turn))*Math.max(-1,Math.min(1,speed/22))*2.2*dt;
      const dx=Math.cos(heading),dy=Math.sin(heading),x=wrapEast(pos.x+dx*speed*dt),y=pos.y+dy*speed*dt;
      if(!worldLand)chart(x,y);
      const clear=[-14,0,15].every(k=>{const pt=new DOMPoint(x+dx*k,y+dy*k);if(worldLand)return Math.abs(pt.y)<89*48&&!worldLand.isPointInFill(new DOMPoint(wrapEast(pt.x),pt.y));return !shores.some(path=>path.isPointInFill(pt))&&!islets.some(q=>((pt.x-q.cx)/q.rx)**2+((pt.y-q.cy)/q.ry)**2<=1);});
      if(clear){voyageEast+=wrapEast(x-pos.x);pos={x,y};}else speed*=.3;
      boat.setAttribute('transform','translate('+pos.x+' '+pos.y+') rotate('+heading*180/Math.PI+')');
      view(pos.x-360,pos.y-160);
      const goal=worldLand?destination:home;
      const bearing=(Math.round(Math.atan2(wrapEast(goal.x-pos.x),pos.y-goal.y)*4/Math.PI)+8)%8;
      const longitude=wrapEast(pos.x-home.x+151.2*circumference/360)*360/circumference;
      const progress=Math.floor(Math.abs(voyageEast)*100/circumference);
      status.textContent=Math.abs(longitude).toFixed(1)+(longitude<0?' W':' E')+' · World voyage '+progress+'% · City ramp '+['N','NE','E','SE','S','SW','W','NW'][bearing]+' · '+Math.round(Math.hypot(wrapEast(home.x-pos.x),home.y-pos.y)/10)+' boat lengths';
      if(worldLand)status.textContent=destination.name+" · steer "+["N","NE","E","SE","S","SW","W","NW"][bearing]+" · "+(-pos.y/48).toFixed(1)+"° lat, "+(pos.x/48).toFixed(1)+"° lon · lap "+progress+"%";
      berth=Math.abs(speed)<30?(worldLand?ports:[home,dock,...islets.map(q=>q.berth)]).find(p=>Math.hypot(pos.x-p.x,pos.y-p.y)<40):null;
      moor.disabled=!berth;moor.textContent=berth===home?'Dock at city ramp':berth===dock?'Dock at your island':berth?'Dock at '+berth.name:'Dock';
      frame=requestAnimationFrame(step);
    }
    host.onkeydown=e=>{e.stopPropagation();if(!sailing)return;if(drivingKeys.has(e.code)){e.preventDefault();held.add(e.code);}if(e.key==='Enter'&&!e.repeat){e.preventDefault();moor.click();}};
    frame=requestAnimationFrame(step);
  }
  function close(){sailing=false;cancelAnimationFrame(frame);window.removeEventListener('blur',resetInput);host.close();host.remove();returnToRamp();}
  window.addEventListener('blur',resetInput);
  host.onkeyup=e=>{e.stopPropagation();held.delete(e.code);};
  host.oncancel=e=>{e.preventDefault();if(!sailing&&!ashore)close();};
  host.onkeydown=e=>e.stopPropagation();
  host.querySelector('[data-plots]').onclick=e=>{const p=e.target.closest('[data-i]');if(p)select(Number(p.dataset.i));};
  paintPlots();boat.setAttribute('transform','translate(116 259)');
  status.textContent='Your boat is ready at the ramp.';button('Take the helm',()=>drive(home,-0.35));const worldButton=button('World voyage from Sydney',()=>launchWorld(worldButton));button('Back to city',close);
};
