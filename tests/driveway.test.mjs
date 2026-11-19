import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('driveway crossovers meet both residential kerbs and preserve the full motorway width',()=>{
 const c=vm.createContext({T:96,CITY_WORKS:{freewayX:99999}});
 vm.runInContext(fs.readFileSync(new URL('../driveway-art.inc.js',import.meta.url),'utf8'),c);
 const block={x0:576,x1:1248};
 for(const front of [-1,1]){
  const j=c.drivewayConnection({front},block);
  assert.equal(Math.abs(j.edge-j.roadX),72);
  assert.equal(j.yard,front<0?block.x0:block.x1);
  assert.equal(Math.sign(j.yard-j.edge),j.side);
  c.CITY_WORKS.freewayX=j.roadX;
  assert.equal(Math.abs(c.drivewayConnection({front},block).edge-j.roadX),96);
 }
});
