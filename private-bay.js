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
    ashore=true;action.replaceChildren();status.textContent='Choose a plot to build on your island.';
    plots.forEach((_,i)=>button('Plot '+(i+1),()=>select(i)));
    button('Sail home',()=>sail(home,false));
  }
  function sail(end,toIsland){
    ashore=false;host.querySelector('[data-jack]').replaceChildren();action.replaceChildren();
    status.textContent=toIsland?'Crossing to the island jetty…':'Returning to the boat ramp…';
    const start={...pos},t0=performance.now(),angle=Math.atan2(end.y-start.y,end.x-start.x)*180/Math.PI;
    function move(now){
      const f=Math.min(1,(now-t0)/2100);pos={x:start.x+(end.x-start.x)*f,y:start.y+(end.y-start.y)*f};
      boat.setAttribute('transform','translate('+pos.x+' '+pos.y+') rotate('+angle+')');
      if(f<1)frame=requestAnimationFrame(move);else if(toIsland)land();else close();
    }
    frame=requestAnimationFrame(move);
  }
  function close(){cancelAnimationFrame(frame);host.close();host.remove();returnToRamp();}
  host.oncancel=e=>{e.preventDefault();close();};
  host.onkeydown=e=>e.stopPropagation();
  host.querySelector('[data-plots]').onclick=e=>{const p=e.target.closest('[data-i]');if(p)select(Number(p.dataset.i));};
  paintPlots();boat.setAttribute('transform','translate(116 259)');
  status.textContent='Your boat is ready at the ramp.';button('Sail to your island',()=>sail(dock,true));button('Back to city',close);
};
