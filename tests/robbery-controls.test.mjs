import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../robbery-controls.inc.js',import.meta.url),'utf8');
const c=vm.createContext({});vm.runInContext(source.slice(0,source.indexOf('function refreshRetailRobbery')),c);
test('empty tills count down and unlock at the exact cooldown boundary',()=>{
 const room={sh:{robbedAt:10}};assert.equal(c.retailRobberyState(room,11).label,'TILL EMPTY · 119s');assert(c.retailRobberyState(room,129.9).disabled);assert.equal(c.retailRobberyState(room,130).disabled,false);
});
test('completed robbery cannot start twice and cancellation state is visible',()=>{
 assert(c.retailRobberyState({sh:{},done:true},100).disabled);
 assert.equal(c.retailRobberyState({sh:{},robIntent:true,robT:2},100).label,'CANCEL ROBBERY · 50%');
 assert.equal(c.retailRobberyState({sh:{}},0).label,'ROB STORE');
});
