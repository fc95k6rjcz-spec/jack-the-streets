import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const html=(await fs.readFile(path.join(root,'index.html'),'utf8')).replace(/\r\n/g,'\n');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script); // Parse the complete game, including the embedded story.
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){const fixture=html.replace('start(1);showMenuReal();playIntro();','start(1);showMenuReal();').replace('requestAnimationFrame(frame);\n})();',`window.comicTest={showComic,missions,camp,startMission,snapshot:()=>({paused,comic:COMIC&&COMIC.name,mission:MS&&MS.def.n}),setPaused:v=>paused=v};\nrequestAnimationFrame(frame);\n})();`);res.setHeader('Content-Type','text/html');res.end(fixture);}else{res.setHeader('Content-Type','image/png');res.end(await fs.readFile(path.join(root,url.pathname)));}}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#enterLoadedGame').click();await page.locator('#characterConfirm').click();assert.equal(await page.locator('#menu').isHidden(),true);await page.locator('#comic').waitFor();
 await page.locator('.comic-art').waitFor();await page.waitForFunction(()=>document.fonts.status==='loaded');await page.waitForTimeout(500);
 assert.equal(await page.locator('[role=status]').textContent(),'PANEL 1 / 6');
 assert.equal(await page.locator('[data-comic=back]').isDisabled(),true);
 assert.equal((await page.evaluate(()=>comicTest.snapshot())).paused,true);
 await page.screenshot({path:path.join(root,'comic-desktop.png')});
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[role=status]').textContent(),'PANEL 2 / 6');
 await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('[role=status]').textContent(),'PANEL 1 / 6');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#comic').isHidden(),true);assert.equal((await page.evaluate(()=>comicTest.snapshot())).paused,false);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>comicTest.showComic('intro',()=>{}));await page.screenshot({path:path.join(root,'comic-mobile.png')});
 const widths=await page.evaluate(()=>({body:document.querySelector('.comic-reader').scrollWidth,view:innerWidth}));assert.ok(widths.body<=widths.view,JSON.stringify(widths));
 for(let i=0;i<6;i++)await page.locator('[data-comic=next]').click();assert.equal(await page.locator('#comic').isHidden(),true);
 // Every chapter and ending must complete exactly once and restore prior pause state.
 const names=['race',...Array.from({length:8},(_,i)=>'chapter'+(i+1)),'ending'];
 for(const name of names){await page.evaluate(n=>{window.comicDone=0;comicTest.showComic(n,()=>window.comicDone++);},name);let steps=0;while(await page.locator('#comic').isVisible()){await page.locator('[data-comic=next]').click();assert.ok(++steps<10);}assert.equal(await page.evaluate(()=>window.comicDone),1);}
 await page.evaluate(()=>{comicTest.setPaused(true);comicTest.showComic('intro',()=>{});});await page.keyboard.press('Escape');assert.equal((await page.evaluate(()=>comicTest.snapshot())).paused,true);await page.evaluate(()=>comicTest.setPaused(false));
 assert.equal(await page.evaluate(()=>comicTest.missions().length),9);
 assert.deepEqual(errors,[]);console.log('PASS: game parses; 11 comic sequences, phone layout, keyboard, replay, pause restoration, and callbacks verified.');
}finally{await browser.close();server.close();}
