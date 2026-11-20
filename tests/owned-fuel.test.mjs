import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../owned-fuel.inc.js',import.meta.url),'utf8');
function setup(){
 const events={},h={human:true,player:'p1',def:{id:'pocket'},fuel:10};let saved;
 const c=vm.createContext({save:{p1:{owned:['pocket','breeze'],cash:100}},cars:[h],CAMP:()=>true,
 persist(){saved=JSON.parse(JSON.stringify(c.save));},vehOf:h=>({fuel:h.fuel}),updateCar(h,dt){h.fuel=Math.max(0,h.fuel-dt);},
 fuelPurchase(h,amount){const units=Math.min(amount,100-h.fuel),cost=units*2;if(c.save.p1.cash<cost)return{ok:false};c.save.p1.cash-=cost;h.fuel+=units;return{ok:true};},
 addEventListener:(name,fn)=>{events[name]=fn;},document:{hidden:true,addEventListener:(name,fn)=>{events[name]=fn;}}});
 vm.runInContext(source,c);return{c,h,events,snapshot:()=>saved};
}
test('parking and reload save low and empty tanks without charging or refilling',()=>{
 const {c,h,events,snapshot}=setup();c.vehOf(h);assert.equal(snapshot().p1.fuel.pocket,10);assert.equal(snapshot().p1.cash,100);
 h.fuel=0;events.pagehide();assert.equal(snapshot().p1.fuel.pocket,0);
 h.foot=true;h.fuel=100;c.persist();assert.equal(snapshot().p1.fuel.pocket,0);
});
test('fuel consumption autosaves and different owned cars retain separate tanks',()=>{
 const {c,h,snapshot}=setup();c.updateCar(h,5);assert.equal(snapshot().p1.fuel.pocket,5);
 c.vehOf(h);h.def={id:'breeze'};h.fuel=70;c.persist();assert.equal(snapshot().p1.fuel.pocket,5);assert.equal(snapshot().p1.fuel.breeze,70);
 h.hot=true;h.fuel=100;c.persist();assert.equal(snapshot().p1.fuel.breeze,70);
});
test('paid fuel saves the increased tank and charge together; declined purchases change neither',()=>{
 const {c,h,snapshot}=setup();assert(c.fuelPurchase(h,25).ok);assert.equal(snapshot().p1.fuel.pocket,35);assert.equal(snapshot().p1.cash,50);
 assert.equal(c.fuelPurchase(h,100).ok,false);assert.equal(h.fuel,35);assert.equal(c.save.p1.cash,50);
});
