import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>fs.readFileSync(new URL('../'+n,import.meta.url),'utf8');
test('race budgets cover checkpoint courses rather than unrelated delivery destinations',()=>{
 const source=read('city-expansion.inc.js'),c=vm.createContext({IY:[0,1000,2000,3000,4000],IX:[0,1000,2000,3000,4000],SHAL:1,DEEP:2,BUILD:3,surface:()=>0,suburbAt:()=> 'Test district'});
 vm.runInContext(source.slice(source.indexOf('const JOB_FAMILIES='),source.indexOf('function sms')),c);
 vm.runInContext(source.slice(source.indexOf('function jobCatalogue'),source.indexOf('function contractTarget')),c);
 const jobs=c.jobCatalogue();assert.equal(jobs.length,300);
 for(const job of jobs.filter(j=>j.kind==='race')){let distance=0,prior=job.pickup;for(const p of job.route){distance+=Math.abs(p.x-prior.x)+Math.abs(p.y-prior.y);prior=p;}assert(job.seconds>=distance/160+30,'insufficient course time for '+job.id);}
 assert(jobs.some(j=>j.damageLimit===20));
});
test('dinosaur pickup refuses a bus without failing, then accepts the correct transport',()=>{
 const source=read('city-expansion.inc.js'),h={x:0,y:0,vx:0,vy:0,dmg:0,def:{id:'citybus',commercial:true}},messages=[];
 const c=vm.createContext({cars:[h],CAMP:()=>true,CONTRACT:{phase:'pickup',remaining:200,job:{kind:'dinosaur',pickup:{x:0,y:0},dest:{x:1000,y:1000},seconds:100}},sms:(_,__,text)=>messages.push(text),SHOPS:[],simT:0,endContract(){throw Error('Unexpected failure');}});h.human=true;
 vm.runInContext(source.slice(source.indexOf('function updateContract'),source.indexOf('function drawContractWorld')),c);
 c.updateContract(.01);assert.equal(c.CONTRACT.phase,'pickup');assert.equal(messages.length,0);
 h.def={id:'boxtruck',commercial:true};c.updateContract(.01);assert.equal(c.CONTRACT.phase,'dropoff');c.updateContract(.01);
});
test('contract snapshots contain progress and position, never circular live actors',()=>{
 const h={human:true,player:'p1',def:{id:'pocket'},x:123,y:456,fuel:10,dmg:4,wanted:2};
 const c=vm.createContext({CAMP:()=>true,NET:{},OPEN_WORLD:{},cars:[h],save:{p1:{}},CONTRACT:{job:{id:'job-006'},phase:'dropoff',cp:2,remaining:80,damage:4,loaner:{veh:{owner:h}}}});
 const source=read('career-resume.inc.js');vm.runInContext(source.slice(0,source.indexOf('const persistBeforeCareerResume')),c);c.saveContractProgress();const snap=JSON.parse(JSON.stringify(c.save.p1.activeContract));assert.equal(snap.cp,2);assert.equal(snap.remaining,80);assert.equal(snap.x,123);assert.equal(snap.wanted,2);assert.equal(snap.loaner,undefined);
 c.CONTRACT=null;c.saveContractProgress();assert.equal(c.save.p1.activeContract,undefined);
});
