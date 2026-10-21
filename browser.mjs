import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createGameServer} from './server.js';
import {combo,beats} from './rules.js';
const game=createGameServer({dbPath:':memory:',turnMs:60000});
await new Promise(r=>game.server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${game.server.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
const contexts=[],pages=[],errors=[];mkdirSync('test-results',{recursive:true});
try{
 for(let i=0;i<4;i++){
  const context=await browser.newContext({viewport:i===0?{width:390,height:844}:{width:1440,height:1000},reducedMotion:i===0?'no-preference':'reduce'});contexts.push(context);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));pages.push(page);
  await page.goto(i?`${url}/room/${[...game.rooms.keys()][0]}`:url);
  await page.locator('#nickname').fill(['Đại','Linh','Minh','An'][i]);
  if(i===1){await page.locator('#photo').setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD1kAAAAASUVORK5CYII=','base64')});await page.waitForFunction(()=>avatar!==null);}
  await page.locator(i?'#join':'#create').click();await page.locator('#game').waitFor({state:'visible'});
 }
 await pages[0].locator('#soundBtn').click();
 await pages[0].locator('#startBtn').click();
 await Promise.all(pages.map(p=>p.waitForFunction(()=>state?.phase==='playing'&&state.hand.length===13)));
 assert(await pages[0].evaluate(()=>document.getAnimations().length>0),'Deal animations active');
 await pages[0].waitForTimeout(1200);
 await pages[0].screenshot({path:'test-results/mobile-390.png',fullPage:true});
 await pages[1].screenshot({path:'test-results/desktop.png',fullPage:true});
 for(const width of [320,360,390,600,768]){await pages[0].setViewportSize({width,height:844});assert(await pages[0].evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);const cs=await pages[0].locator('#hand .card').first().boundingBox();assert(cs.width>0);}
 await pages[0].setViewportSize({width:390,height:844});
 await pages[2].reload();await pages[2].waitForFunction(()=>state?.hand.length===13);
 const room=[...game.rooms.values()][0];assert(room.players[1].avatar?.startsWith('data:image/jpeg'));
 let moves=0;
 while(room.phase==='playing'&&++moves<1500){
  const turn=room.turn,ev=room.eventId,page=pages[turn];await page.waitForFunction(({turn,ev})=>state?.turn===turn&&state.lastEvent?.id===ev,{turn,ev});
  const card=room.players[turn].hand.find(c=>(room.round!==1||room.moves!==0||c==='3S')&&beats(combo([c]),combo(room.table),room.rules.cuts));
  if(card){await page.locator(`#hand [data-card="${card}"]`).click({position:{x:8,y:15}});await page.locator('#playBtn').click();}else await page.locator('#passBtn').click();
  await page.waitForFunction(ev=>state.lastEvent.id!==ev,ev);
 }
 assert.equal(room.phase,'ended');assert.deepEqual(room.players.map(p=>p.finishRank).sort(),[1,2,3,4]);
 await pages[0].waitForFunction(()=>state.phase==='ended');await pages[0].screenshot({path:'test-results/winner.png',fullPage:true});
 assert.equal(game.store.standings(room.code).length,4);
 await pages[0].locator('#startBtn').click();await pages[0].waitForFunction(()=>state.round===2);assert.equal(room.turn,room.lastWinner);
 assert(await pages[0].locator('#winnerBanner').evaluate(el=>el.classList.contains('hidden')));
 game.rooms.delete(room.code);await pages[0].reload();await pages[0].waitForFunction(()=>document.getElementById('toast').textContent.includes('Phòng cũ đã hết phiên'));
 assert(await pages[0].locator('#entry').isVisible());assert(await pages[0].locator('#game').isHidden());
 await pages[0].locator('#create').click();await pages[0].locator('#game').waitFor({state:'visible'});assert.equal(game.rooms.size,1);
 assert.deepEqual(errors,[]);console.log(`Browser PASS: 4 players, avatars, phone widths 320–768, reload, full game (${moves} actions), saved standings, next winner opens. No JS errors.`);
}finally{await Promise.all(contexts.map(c=>c.close()));await browser.close();await game.close();}
