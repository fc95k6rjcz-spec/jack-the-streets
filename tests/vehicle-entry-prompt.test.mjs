import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('nearby entry tag does not inspect lock status; only an attempted door reveals it',()=>{
 const labels=[],ctx=new Proxy({measureText:()=>({width:40}),fillText:t=>labels.push(t)},{get:(o,k)=>k in o?o[k]:()=>{}});
 const c=vm.createContext({ctx,simT:5});vm.runInContext(src.slice(src.indexOf('function drawVehicleEntryPrompt'),src.indexOf("cv.addEventListener('pointerdown',e=>{",src.indexOf('function drawVehicleEntryPrompt'))),c);
 const t={x:100,y:100,r:30,get locked(){throw Error('Lock revealed before trying');}},h={cam:{z:2}};
 c.drawVehicleEntryPrompt(h,t);assert.equal(labels.at(-1),'GET IN');
 h.doorTried={target:t,until:7};c.drawVehicleEntryPrompt(h,t);assert.equal(labels.at(-1),'LOCKED');
 c.simT=8;c.drawVehicleEntryPrompt(h,t);assert.equal(labels.at(-1),'GET IN');
});
test('entry target requires a nearby car on both touch and keyboard',()=>{
 const t={x:90,y:0,r:30,state:'parked'},c=vm.createContext({traffic:[t],cops:[],boats:[],CAMP:()=>false,CHASE:()=>false});
 vm.runInContext(src.slice(src.indexOf('function stealable('),src.indexOf('function toggleFoot(')),c);
 assert.equal(c.stealable({x:0,y:0}),null);t.x=70;assert.equal(c.stealable({x:0,y:0}),t);
});
