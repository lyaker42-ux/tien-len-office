import express from 'express';
import http from 'node:http';
import {Server} from 'socket.io';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {newRoom,deal,play,pass,publicState} from './game.js';
import {createStore} from './store.js';
import {resetDailyScores} from './daily-scores.js';
const root=path.dirname(fileURLToPath(import.meta.url));
export function createGameServer({dbPath=process.env.DB_PATH||path.join(root,'data','game.sqlite'),turnMs=60000}={}) {
 const store=createStore(dbPath), rooms=new Map(store.load().map(r=>[r.code,r]));
 const app=express(),server=http.createServer(app),io=new Server(server,{maxHttpBufferSize:200000});
 app.disable('x-powered-by');
 app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
 app.get('/health',(_req,res)=>res.json({ok:true}));
 app.use(express.static(path.join(root,'public')));
 app.get('/room/:code',(_req,res)=>res.sendFile(path.join(root,'public','index.html')));
 const timers=new Map();
 const error=(s,msg)=>s.emit('game_error',msg);
 function identify(s){const room=rooms.get(s.data.code);const idx=room?.players.findIndex(p=>p.token===s.data.token&&p.socketId===s.id)??-1;return {room:idx>=0?room:null,idx};}
 function schedule(room){
  clearTimeout(timers.get(room.code));timers.delete(room.code);
  if(room.phase!=='playing')return;
  timers.set(room.code,setTimeout(()=>{
   const idx=room.turn,p=room.players[idx];
   const msg=room.table.length?pass(room,idx):play(room,idx,[room.round===1&&room.moves===0?'3S':p.hand.slice().sort((a,b)=>Number(a.slice(0,-1))-Number(b.slice(0,-1)))[0]]);
   if(!msg){room.history.push(`${p.name}: hết thời gian, tự động ${room.lastEvent.type==='pass'?'bỏ vòng':'mở một lá'}.`);commit(room);}
  },turnMs));timers.get(room.code).unref();
 }
 function send(room){for(const p of room.players)if(p.socketId)io.to(p.socketId).emit('state',publicState(room,p.token));}
 function commit(room,resetTimer=true){room.updatedAt=Date.now();room.history=room.history.slice(-30);store.save(room);send(room);if(resetTimer)schedule(room);}
 function bind(s,room,p){
  const old=io.sockets.sockets.get(p.socketId);
  if(old&&old.id!==s.id){old.data={};old.emit('session_replaced');old.disconnect(true);}
  p.socketId=s.id;s.data.code=room.code;s.data.token=p.token;s.join(room.code);
  s.emit('joined',{code:room.code,token:p.token});commit(room,false);
 }
 function player(name,avatar){return {name,avatar:typeof avatar==='string'&&avatar.length<140000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)?avatar:null,token:crypto.randomBytes(32).toString('hex'),socketId:null,hand:[],score:0,finished:false,finishRank:null};}
 const validName=n=>typeof n==='string'&&n.trim().length>=1&&n.trim().length<=24;
 const rates=new Map();
 io.use((s,next)=>{const ip=s.handshake.address,now=Date.now();let r=rates.get(ip);if(!r||now-r.at>60000){r={at:now,n:0};rates.set(ip,r);}if(++r.n>120)return next(new Error('Quá nhiều kết nối. Thử lại sau một phút.'));next();});
 io.on('connection',s=>{
  let count=0,windowAt=Date.now();
  s.use((_packet,next)=>{if(Date.now()-windowAt>1000){windowAt=Date.now();count=0;}if(++count>20)return;next();});
  s.on('create',(payload)=>{
   const {name,avatar}=payload&&typeof payload==='object'?payload:{};
   if(s.data.code)return error(s,'Bạn đã ở trong một phòng.');
   if(!validName(name))return error(s,'Tên phải từ 1–24 ký tự.');
   if(rooms.size>=500)return error(s,'Máy chủ đã đủ phòng.');
   let code;do{code=crypto.randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));
   const room=newRoom(code),p=player(name.trim(),avatar);resetDailyScores(room);room.players.push(p);rooms.set(code,room);bind(s,room,p);
  });
  s.on('join',payload=>{
   const {code,name,avatar,token}=payload&&typeof payload==='object'?payload:{};
   if(s.data.code&&s.data.code!==String(code).toUpperCase())return error(s,'Bạn đã ở phòng khác.');
   if(s.data.code&&s.data.token!==token)return error(s,'Kết nối này đã có chỗ trong phòng.');
   const room=rooms.get(String(code||'').toUpperCase());if(!room)return error(s,'Không tìm thấy phòng. Hãy kiểm tra lại mã mời.');
   let p=room.players.find(p=>p.token===token);
   if(!p){
    if(room.players.length>=4)return error(s,'Phòng đã đủ 4 người.');
    if(room.phase!=='lobby')return error(s,'Ván đã bắt đầu.');
    if(!validName(name))return error(s,'Tên phải từ 1–24 ký tự.');
    p=player(name.trim(),avatar);room.players.push(p);
   }
   bind(s,room,p);
  });
  s.on('start',()=>{const {room,idx}=identify(s);if(!room)return;if(idx!==room.owner)return error(s,'Chỉ chủ phòng được bắt đầu.');if(room.players.length!==4||room.players.some(p=>!p.socketId))return error(s,'Cần đủ 4 người đang kết nối.');if(!['lobby','ended'].includes(room.phase))return error(s,'Ván đang diễn ra.');resetDailyScores(room);deal(room);commit(room);});
  for(const [action,fn] of [['play',play],['pass',pass]])s.on(action,cards=>{const {room,idx}=identify(s);if(!room)return;const msg=fn(room,idx,cards);if(msg)error(s,msg);else commit(room);});
  s.on('disconnect',()=>{const {room,idx}=identify(s);if(room){room.players[idx].socketId=null;commit(room,false);}});
 });
 for(const room of rooms.values())schedule(room);
 const cleanup=setInterval(()=>{for(const [ip,r] of rates)if(Date.now()-r.at>120000)rates.delete(ip);},120000);cleanup.unref();
 return {app,server,io,rooms,store,async close(){clearInterval(cleanup);for(const t of timers.values())clearTimeout(t);await new Promise(resolve=>io.close(resolve));store.close();}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const game=createGameServer();const port=Number(process.env.PORT||3000);
 game.server.listen(port,'0.0.0.0',()=>console.log(`Tiến Lên đang chạy tại cổng ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>game.close().then(()=>process.exit(0)));
}
