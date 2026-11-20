import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync(new URL('../career-quality.inc.js',import.meta.url),'utf8');
function setup(){const c=vm.createContext({});vm.runInContext(src.slice(0,src.indexOf('const endBeforeCareerQuality')),c);return c;}
test('job guidance distinguishes wrong vehicle, stopping, police and race checkpoints',()=>{
 const c=setup(),h={x:0,y:0,vx:80,vy:0,def:{id:'pocket'}};
 const J={phase:'pickup',cp:1,job:{kind:'ride',pickup:{x:0,y:0},dest:{x:1000,y:1000},route:[{}, {}, {}]}};
 assert.match(c.careerObjective(J,h),/Slow down/);h.vx=0;assert.match(c.careerObjective(J,h),/stay stopped/);
 J.job.kind='dinosaur';assert.match(c.careerObjective(J,h),/transport truck/);
 J.phase='dropoff';J.job.kind='crew';h.wanted=1;assert.match(c.careerObjective(J,h),/Lose the police/);
 J.job.kind='race';assert.match(c.careerObjective(J,h),/CHECKPOINT 2 \/ 3/);
});
test('job receipts report actual payment, distinguish failure, and survive JSON saves',()=>{
 const c=setup(),J={job:{id:'job-1',n:'Parcel',from:'Courier',kind:'delivery',seconds:100},remaining:40,damage:3};
 const r=JSON.parse(JSON.stringify(c.careerReceipt(J,{dmg:5},true,null,190,3)));
 assert.equal(r.grade,'CLEAN RUN');assert.equal(r.paid,190);assert.equal(r.damage,2);assert.equal(r.count,3);assert.match(r.body,/Parcel received/);
 const fail=c.careerReceipt(J,{dmg:30},false,'Out of time',0,2);assert.equal(fail.grade,'TRY AGAIN');assert.equal(fail.body,'Out of time');assert.equal(fail.paid,0);
});
test('garage foreground clips only the beam and supports, with balanced drawing state',()=>{
 const file=fs.readFileSync(new URL('../seamless-workshop.inc.js',import.meta.url),'utf8'),calls=[];
 const ctx=Object.fromEntries(['save','beginPath','rect','clip','drawImage','restore'].map(name=>[name,(...a)=>calls.push([name,...a])]));
 const c=vm.createContext({ctx,CUTAWAY_WORKSHOP:{complete:true,naturalWidth:1655}});
 vm.runInContext(file.slice(file.indexOf('function drawWorkshopDoorForeground'),file.indexOf('driveGarageCar=function')),c);
 c.drawWorkshopDoorForeground({x0:100,y0:200,w:1000,h:500});
 assert.equal(calls.filter(x=>x[0]==='rect').length,3);assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');
 const beam=calls.find(x=>x[0]==='rect');assert.equal(beam[1],519);assert.equal(beam[2],382.5);assert.equal(beam[4],10.5);
 assert(file.indexOf('drawWorkshopDoorForeground(s);return true')>file.indexOf('drawCar(c,performance.now())'));
});
