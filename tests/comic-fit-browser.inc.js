window.checkComicFit=async function(size){
 const el=document.getElementById('comic');el.style.padding=`${size.top||0}px ${size.right||0}px ${size.bottom||0}px ${size.left||0}px`;
 const viewport=window.visualViewport,oldHeight=viewport&&Object.getOwnPropertyDescriptor(viewport,'height');if(size.visibleHeight&&viewport)Object.defineProperty(viewport,'height',{configurable:true,get:()=>size.visibleHeight});
 const failures=[];let checked=0;const bounds={left:size.left||0,top:size.top||0,right:size.w-(size.right||0),bottom:(size.visibleHeight||size.h)-(size.bottom||0)};
 for(const name of window.comicFitAPI.names){
  window.comicFitAPI.close();window.comicFitAPI.open(name);
  const count=window.comicFitAPI.count();
  for(let index=0;index<count;index++){
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const errors=[],reader=el.querySelector('.comic-reader'),art=el.querySelector('.comic-art'),bubble=el.querySelector('.comic-bubble'),caption=el.querySelector('.comic-caption');
   for(const [label,node]of [['reader',reader],['masthead',el.querySelector('.comic-masthead')],['navigation',el.querySelector('.comic-nav')],['next button',el.querySelector('[data-comic=next]')],['caption',caption],['art',art]]){
    const r=node.getBoundingClientRect();if(r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1)errors.push(label+' outside safe viewport '+JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height}));
   }
   const b=bubble.getBoundingClientRect(),a=(el.querySelector('.comic-copy')||art).getBoundingClientRect();if(b.left<a.left-1||b.right>a.right+1||b.top<a.top-1||b.bottom>a.bottom+1)errors.push('speech bubble clipped by artwork');
   for(const text of bubble.children){const r=text.getBoundingClientRect();if(r.left<b.left||r.right>b.right+1||r.top<b.top||r.bottom>b.bottom+1)errors.push('speech text clipped');}
   if(caption.scrollHeight>caption.clientHeight+1)errors.push('caption requires scrolling');
   if(reader.scrollWidth>reader.clientWidth+1)errors.push('reader horizontal overflow');
   if(art.clientHeight<80)errors.push('artwork collapsed');
   if(errors.length)failures.push({name,panel:index+1,errors});checked++;
   if(index<count-1){el.querySelector('[data-comic=next]').click();}
  }
 }
 window.comicFitAPI.close();if(size.visibleHeight&&viewport){if(oldHeight)Object.defineProperty(viewport,'height',oldHeight);else delete viewport.height;}return{size,checked,failures};
};
