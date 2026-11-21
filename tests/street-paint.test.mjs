import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../street-paint.inc.js',import.meta.url),'utf8');
const evaluate=(fn,next)=>{
 const c=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('function '+fn),source.indexOf('function '+next)),c);
 return c[fn];
};
test('crossings need sidewalks on both banks and reflect the road type',()=>{
 const style=evaluate('crossingStyle','drawStreetCrossing');
 assert.equal(style('coastal',false,true),'line');
 assert.equal(style('arterial',false,true),'line');
 assert.equal(style('coastal',true,false),'surf');
 assert.equal(style('arterial',true,false),'zebra');
 assert.equal(style('residential',true,true),'zebra');
 assert.equal(style('collector',true,false),'give-way');
});
test('headland boards search fallback verges and return null when not clear',()=>{
 const find=evaluate('findWayfindingVerge','headlandSignSites');
 const at=find({x:1000,y:1000},1,-1,(x,y)=>x===1240&&y===1144);
 assert.equal(at.y,1144);
 assert.equal(at.x,1240);
 assert.equal(find({x:5,y:3},-1,1,()=>false),null);
});
