import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../coastal-sprint.inc.js',import.meta.url),'utf8');
function helpers(globals={}){
 const c=vm.createContext(globals);
 vm.runInContext(source.slice(0,source.indexOf('function sprintText')),c);
 return c;
}
test('directional checkpoint rejects wrong way, edge misses and standing still',()=>{
 const c=helpers(),cross=c.sprintGateCrossed,g={x:0,y:0,angle:0};
 assert.equal(cross({x:-4,y:75},{x:4,y:75},g),true);
 assert.equal(cross({x:4,y:0},{x:-4,y:0},g),false);
 assert.equal(cross({x:-4,y:77},{x:4,y:77},g),false);
 assert.equal(cross({x:-4,y:0},{x:-4,y:0},g),false);
 assert.equal(cross({x:4,y:3},{x:4,y:-3},{...g,angle:-Math.PI/2}),true);
 assert.equal(cross({x:-30,y:120},{x:30,y:20},g),true);
});
test('time records are separated by route and never overwrite a faster best',()=>{
 const c=helpers(),w={sprintBest:{shortcut:22}};
 assert.equal(c.sprintRecord(w,'shortcut',25),false);
 assert.equal(c.sprintRecord(w,'shortcut',21.5),true);
 assert.equal(c.sprintRecord(w,'scenic',29),true);
 assert.equal(c.sprintRecord(w,'scenic',Infinity),false);
 assert.deepEqual(w.sprintBest,{shortcut:21.5,scenic:29});
});
test('road verification samples the full segment instead of only endpoints',()=>{
 const c=helpers(),points=[{x:0,y:10},{x:100,y:10}];
 assert.equal(c.sprintSafeLine(points,()=>true),true);
 assert.equal(c.sprintSafeLine(points,x=>x<50||x>80),false);
 assert.equal(c.sprintSafeLine(points.slice(0,1),()=>true),false);
});
test('actual road geometry has a new connector without replacing the other named roads',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/\[\[ix\[3\],iy\[1\]\],\[ix\[3\]-680,iy\[1\]-190\],\[ix\[2\]\+610,iy\[0\]\+210\],\[ix\[2\],iy\[0\]\]\]\]\}\;\/\/ Headland Cut/);
 for(const name of ['Mona Vale Rd','Wakehurst Pkwy','Barrenjoey Rd'])assert.ok(html.includes(name));
 assert.ok(html.includes('// COASTAL SPRINT BEGIN')&&html.includes('// STREET PAINT BEGIN'));
});
