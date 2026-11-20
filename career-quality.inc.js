/* Career presentation: real objectives, useful choices, and persistent job receipts. */
function careerJobRisk(job){return ['crew','tech'].includes(job.kind)?'POLICE RISK':job.kind==='race'?'STREET RACE':job.kind==='dinosaur'?'SPECIAL CARGO':'LEGAL WORK';}
function careerObjective(J,h){
 if(!J)return '';
 const speed=Math.hypot(h.vx||0,h.vy||0);
 if(J.phase==='pickup'){
  if(J.job.kind==='dinosaur'&&h.def?.id!=='boxtruck')return 'Board the transport truck at pickup';
  if(h.foot)return 'Get into a car, then reach the pickup';
  return Math.hypot(h.x-J.job.pickup.x,h.y-J.job.pickup.y)<175?(speed>=35?'Slow down and stop to collect':'Collecting — stay stopped'):'Drive to the cyan pickup';
 }
 if(J.job.kind==='race')return 'CHECKPOINT '+Math.min(J.cp+1,J.job.route.length)+' / '+J.job.route.length+' · drive through the cyan ring';
 if(J.phase==='store')return h.inside?'Take the takings, then leave the store':'Enter the marked Harbour Tech on foot';
 if(['crew','tech'].includes(J.job.kind)&&h.wanted>.01)return 'Lose the police before the handoff';
 if(h.foot)return 'Return to your vehicle to finish the delivery';
 return Math.hypot(h.x-J.job.dest.x,h.y-J.job.dest.y)<175?'Stop inside the cyan destination ring':'Deliver '+({netball:'your sister',ride:'your passenger',delivery:'the parcel',crew:'the crew',dinosaur:'the transport',tech:'the takings'}[J.job.kind]||'the cargo');
}
function careerReceipt(J,h,passed,why,paid,count){
 const damage=Math.max(0,(h.dmg||0)-(J.damage||0)),time=Math.max(0,Math.ceil(J.remaining));
 const grade=!passed?'TRY AGAIN':damage<=5&&time>=J.job.seconds*.2?'CLEAN RUN':damage<=20?'JOB DONE':'MADE IT';
 const thanks={netball:'You made it! I owe you one. See you back at Ray’s.',ride:'Thanks for the lift. I’ll pass your name on.',delivery:'Parcel received. There’s always another run when you’re ready.',crew:'We’re clear. Lay low for a while.',dinosaur:'Transport received. The research team can take it from here.',race:'That’s your name on the board. See you at the next meet.',tech:'Handoff complete. Keep your head down on the way home.'};
 return {id:J.job.id,name:J.job.n,from:J.job.from,passed,grade,paid,damage:Math.round(damage),time,count,body:passed?thanks[J.job.kind]||'Thanks for the help.':why||'The job could not be completed.',at:Date.now()};
}
const endBeforeCareerQuality=endContract;
endContract=function(h,passed,why){
 const J=CONTRACT;if(!J)return;
 const wallet=save[h.player],before=wallet.cash;
 endBeforeCareerQuality(h,passed,why);
 wallet.lastJobReceipt=careerReceipt(J,h,passed,why,wallet.cash-before,(wallet.jobsDone||[]).length);
 persist();
};
function openCareerReceipt(h){
 const r=save[h.player].lastJobReceipt;if(!r)return;
 const modal=cityModal(r.grade,({card,note,option,close})=>{
  card.classList.add('career-panel');note.textContent=r.name;
  const quote=document.createElement('blockquote');quote.textContent='“'+r.body+'” — '+r.from;card.append(quote);
  const stats=document.createElement('div');stats.className='career-stats';
  for(const [label,value]of [['PAID TO YOUR CARD',money(r.paid)],['NEW DAMAGE',r.damage+'%'],['TIME LEFT',r.time+'s']]){const box=document.createElement('div'),b=document.createElement('b'),s=document.createElement('small');b.textContent=value;s.textContent=label;box.append(b,s);stats.append(box);}card.append(stats);
  const p=document.createElement('p');const next=[3,10,30].find(n=>n>r.count);p.textContent=next?(next-r.count)+' more completed jobs to your next career bonus.':r.count+' jobs completed. Keep building your reputation.';card.append(p);
  option(r.passed?'FIND YOUR NEXT JOB':'CHOOSE A JOB TO RETRY','Browse available work nearby',()=>{close();openJobBoard(h);});
 });
 if(modal){r.viewed=true;persist();}return modal;
}
const originalCareerBoard=openJobBoard;
openJobBoard=function(h){
 if(NET.playing||OPEN_WORLD.joined)return originalCareerBoard(h);
 let filter='recommended',page=0;
 const list=jobCatalogue(),wallet=save[h.player];
 return cityModal('COASTAL DISPATCH',({card,note,close})=>{
  card.classList.add('career-panel');const root=document.createElement('div');card.append(root);
  const button=(title,detail,fn)=>{const b=document.createElement('button');b.type='button';b.className='warehouse-option';const head=document.createElement('b'),small=document.createElement('small');head.textContent=title;small.textContent=detail;b.append(head,small);b.onclick=fn;return b;};
  const draw=()=>{
   root.replaceChildren();const done=wallet.jobsDone||[],tier=Math.min(10,1+Math.floor(done.length/30));
   note.textContent=money(wallet.cash)+' ON YOUR CARD · '+done.length+' JOBS COMPLETE · TIER '+tier;
   const tabs=document.createElement('div');tabs.className='career-tabs';
   for(const [id,label]of [['recommended','NEARBY'],['legal','LEGAL'],['risk','HIGH RISK'],['messages','MESSAGES']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(filter===id));b.onclick=()=>{filter=id;page=0;draw();};tabs.append(b);}root.append(tabs);
   if(filter==='messages'){for(const m of [...(wallet.sms||[])].reverse()){const a=document.createElement('blockquote');a.textContent=m.from+' · '+m.body;root.append(a);}if(!wallet.sms?.length)root.append(document.createTextNode('Your messages will appear here.'));return;}
   if(CONTRACT){root.append(button(CONTRACT.job.n,careerObjective(CONTRACT,h)+' · '+Math.ceil(CONTRACT.remaining)+'s remaining',close));let confirm=false;const cancel=button('CANCEL JOB','No charge. Your completed jobs stay saved.',()=>{if(!confirm){confirm=true;cancel.querySelector('b').textContent='CONFIRM CANCELLATION';return;}endContract(h,false,'Cancelled by driver');draw();});root.append(cancel);return;}
   if(MS){root.append(button('CONTINUE YOUR STORY','Finish your current story objective before accepting dispatch work.',close));return;}
   let available=list.filter(j=>!done.includes(j.id)&&j.tier<=tier).filter(j=>filter==='legal'?careerJobRisk(j)==='LEGAL WORK':filter==='risk'?['POLICE RISK','STREET RACE'].includes(careerJobRisk(j)):true).sort((a,b)=>Math.hypot(a.pickup.x-h.x,a.pickup.y-h.y)-Math.hypot(b.pickup.x-h.x,b.pickup.y-h.y));
   // Recommend the closest of each kind before repeating the same activity.
   const seen=new Set(),first=[],rest=[];for(const j of available){if(seen.has(j.kind))rest.push(j);else{seen.add(j.kind);first.push(j);}}available=[...first,...rest];
   const intro=document.createElement('p');intro.textContent='Choose a job. The payment shown is what you earn — there is no entry fee. '+(30-done.length%30)+' jobs to the next tier.';root.append(intro);
   for(const j of available.slice(page*4,page*4+4)){
    const distance=Math.round(Math.hypot(j.pickup.x-h.x,j.pickup.y-h.y)/10);
    root.append(button(j.n+' · EARN '+money(j.pay),careerJobRisk(j)+' · '+distance+'m to pickup · '+Math.ceil(j.seconds/60)+' min after pickup\n'+j.body,()=>{if(acceptContract(h,j))close();else note.textContent='Lose the police and finish your current activity before accepting work.';}));
   }
   if(!available.length){const p=document.createElement('p');p.textContent='No jobs in this category right now. Try another tab.';root.append(p);}
   const nav=document.createElement('div');nav.className='career-tabs';for(const [delta,label]of [[-1,'PREVIOUS'],[1,'NEXT']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=page+delta<0||(page+delta)*4>=available.length;b.onclick=()=>{page+=delta;draw();root.scrollIntoView({block:'start'});};nav.append(b);}root.append(nav);
   if(wallet.lastJobReceipt)root.append(button('LAST JOB RECEIPT',wallet.lastJobReceipt.grade+' · '+money(wallet.lastJobReceipt.paid),()=>{close();openCareerReceipt(h);}));
  };draw();
 });
};
const syncBeforeCareerQuality=syncExpansionUI;
syncExpansionUI=function(){
 syncBeforeCareerQuality();
 const h=cars.find(c=>c.human),el=document.getElementById('cityContract');
 if(!h||!el)return;
 if(CONTRACT&&!el.hidden&&hudPriority(h)){el.hidden=true;}
 if(CONTRACT&&!el.hidden){
  const target=contractTarget(),distance=target?Math.round(Math.hypot(target.x-h.x,target.y-h.y)/10):0;
  const seconds=Math.max(0,Math.ceil(CONTRACT.remaining));
  el.textContent=careerObjective(CONTRACT,h)+' · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+(distance?' · '+distance+'m':'');
  el.classList.toggle('career-urgent',seconds<=30);
 }
 const jobs=document.getElementById('citySMS');if(jobs&&!jobs.hidden){const r=save[h.player].lastJobReceipt,fresh=!CONTRACT&&r&&!r.viewed;jobs.textContent=fresh?'RESULT · '+r.grade:'JOBS · DISPATCH';jobs.onclick=()=>fresh?openCareerReceipt(h):openJobBoard(h);}
};
cruisingName=function(h){const n=suburbAt(h.x,h.y).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());return(h.swim?'Swimming near ':h.foot?'Exploring ':'Cruising ')+(n||'the Northern Beaches');};
{
 const style=document.createElement('style');style.textContent=`
 .career-panel{width:min(740px,94vw);background:#f6edcf!important;color:#192d36!important;border:3px solid #172731!important;box-shadow:8px 8px 0 #0c1929!important}
 .career-panel h2{font-family:Bungee,Impact,sans-serif;letter-spacing:.02em;margin:0 0 10px!important}
 .career-panel blockquote{margin:12px 0;padding:16px;border-left:5px solid #d7a632;background:#e9dfbd;line-height:1.5}
 .career-panel .warehouse-option{width:100%;text-align:left;margin:8px 0!important;padding:14px!important;border:2px solid #21313b!important;background:#fffaf0!important;color:#20313a!important;box-shadow:3px 3px 0 #cbbf9b!important}
 .career-panel .warehouse-option:hover,.career-panel .warehouse-option:focus-visible{background:#ffe382!important;outline:3px solid #287480;outline-offset:2px}
 .career-panel .warehouse-option small{display:block;white-space:pre-line;line-height:1.5;margin-top:6px;color:#43545b!important}
 .career-tabs{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap}.career-tabs button{flex:1;min-height:44px;padding:8px;border:2px solid #21313b;background:#e7ddbe;color:#21313b;font-weight:800;cursor:pointer}.career-tabs button[aria-pressed=true]{background:#193a45;color:#fff1c4}.career-tabs button:disabled{opacity:.4;cursor:default}
 .career-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.career-stats div{background:#193a45;color:#ffdf7a;padding:16px 8px;text-align:center}.career-stats b{display:block;font-size:26px}.career-stats small{display:block;color:#e4e9dc;font-size:11px;margin-top:6px}
 #cityContract{top:88px;max-width:min(600px,48vw);font-size:13px;padding:9px 14px;border:2px solid #79c8b3;box-shadow:0 3px 10px #0004}#cityContract.career-urgent{border-color:#ffbd69;color:#ffe1ad}
 @media(max-height:500px){.career-panel{max-height:94dvh!important;padding:16px!important}.career-panel h2{font-size:22px!important}#cityContract{top:64px;max-width:48vw;font-size:11px;padding:6px 9px}.career-panel .warehouse-option{padding:10px!important}.career-stats div{padding:10px 6px}}
 @media(max-width:600px){.career-stats b{font-size:21px}.career-tabs button{font-size:10px}.career-panel h2{font-size:21px!important}}
 `;document.head.append(style);
}
