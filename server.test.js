import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {io} from 'socket.io-client';
import {createGameServer} from './server.js';
import {createStore} from './store.js';
import {newRoom} from './game.js';
function once(s,event){return new Promise((resolve,reject)=>{const t=setTimeout(()=>{s.off(event,cb);reject(new Error('Timed out '+event));},5000);function cb(v){clearTimeout(t);resolve(v);}s.once(event,cb);});}
async function request(s,action,data,event='state'){const p=once(s,event);s.emit(action,data);return p;}
test('SQLite saves room and standings once per round; restart keeps scores and tokens',()=>{
 const dir=mkdtempSync(path.join(os.tmpdir(),'tl-test-')),file=path.join(dir,'game.sqlite');
 let db=createStore(file);const r=newRoom('ABC123');r.phase='ended';r.round=1;r.players=[{name:'A',token:'secret',socketId:'old',score:4,hand:[]}];r.results=[{name:'A',rank:1,delta:4,total:4}];db.save(r);db.save(r);assert.equal(db.standings(r.code).length,1);db.close();
 db=createStore(file);assert.equal(db.load()[0].players[0].socketId,null);assert.equal(db.load()[0].players[0].score,4);assert.equal(db.load()[0].players[0].token,'secret');assert.equal(db.standings(r.code)[0].total,4);db.close();rmSync(dir,{recursive:true});
});
test('4 real sockets: capacity, private hands, host, invalid input, reconnect and replacement',async()=>{
 const game=createGameServer({dbPath:':memory:'});await new Promise(r=>game.server.listen(0,'127.0.0.1',r));
 const url=`http://127.0.0.1:${game.server.address().port}`,clients=[];
 async function client(){const s=io(url,{transports:['websocket'],reconnection:false});clients.push(s);await once(s,'connect');return s;}
 try{
  assert.equal((await (await fetch(url+'/health')).json()).ok,true);
  for(const asset of ['/', '/client.js', '/style.css'])assert.equal((await fetch(url+asset)).status,200);
  for(const hidden of ['/server.js','/package.json','/store.js','/data/game.sqlite'])assert.equal((await fetch(url+hidden)).status,404);
  const a=await client();assert.match(await request(a,'create',null,'game_error'),/Tên/);
  const joinedP=once(a,'joined');let s=await request(a,'create',{name:'Host'});const credentials=await joinedP;
  assert.match(await request(a,'join',{code:s.code,name:'Second seat'},'game_error'),/đã có chỗ/);
  const b=await client(),c=await client(),d=await client();
  for(const [i,x] of [b,c,d].entries())await request(x,'join',{code:s.code,name:`Guest ${i}`});
  const e=await client();assert.match(await request(e,'join',{code:s.code,name:'Fifth'},'game_error'),/đủ 4/);
  assert.match(await request(b,'start',null,'game_error'),/chủ phòng/);
  game.rooms.get(s.code).scoreDay='2020-01-01';game.rooms.get(s.code).players[0].score=99;
  s=await request(a,'start');assert.equal(s.players[0].score,0);assert.equal(s.hand.length,13);assert.equal(s.players.length,4);assert(s.players.every(p=>!p.hand&&!p.token));
  const active=clients[s.turn];assert.match(await request(active,'play',['16S'],'game_error'),/sở hữu/);
  const oldRoom=game.rooms.get(s.code),before=JSON.stringify(oldRoom.players.map(p=>p.hand));
  const fresh=await client(),replaced=once(a,'session_replaced');await request(fresh,'join',{code:s.code,token:credentials.token});await replaced;assert(!a.connected||a.disconnected);
  assert.equal(JSON.stringify(oldRoom.players.map(p=>p.hand)),before);
  const newState=await request(fresh,'join',{code:s.code,token:credentials.token});assert.equal(newState.you,0);assert.equal(newState.hand.length,13);
  assert.match(await request(fresh,'join',{code:'FFFFFF',name:'X'},'game_error'),/phòng khác/);
 }finally{clients.forEach(s=>s.disconnect());await game.close();}
});
test('timeout automatically opens 3 spades and progresses',async()=>{
 const game=createGameServer({dbPath:':memory:',turnMs:80});await new Promise(r=>game.server.listen(0,'127.0.0.1',r));
 const clients=[];const url=`http://127.0.0.1:${game.server.address().port}`;
 try{let code;for(let i=0;i<4;i++){const s=io(url,{transports:['websocket']});clients.push(s);await once(s,'connect');const state=await request(s,i?'join':'create',{code,name:`P${i}`});code=state.code;}
  await request(clients[0],'start');await new Promise(r=>setTimeout(r,110));const room=game.rooms.get(code);assert(room.moves>=1);assert(room.history.some(h=>h.includes('3S')));
 }finally{clients.forEach(s=>s.disconnect());await game.close();}
});
