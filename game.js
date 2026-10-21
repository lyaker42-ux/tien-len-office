import crypto from 'node:crypto';
import {deck,ordered,combo,beats,score,DEFAULT_RULES} from './rules.js';
export function newRoom(code) {return {code,players:[],phase:'lobby',owner:0,turn:0,lead:null,table:[],pass:[],round:0,history:[],results:null,lastWinner:null,moves:0,eventId:0,rules:{...DEFAULT_RULES},updatedAt:Date.now()};}
export function deal(room) {
 const cards=deck(); for(let i=51;i>0;i--){const j=crypto.randomInt(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}
 room.players.forEach((p,i)=>{p.hand=cards.slice(i*13,(i+1)*13);p.finished=false;p.finishRank=null;});
 Object.assign(room,{phase:'playing',table:[],lead:null,pass:[],history:[],results:null,moves:0});room.round++;
 room.turn=room.lastWinner??room.players.findIndex(p=>p.hand.includes('3S'));
 room.history.push(room.round===1?'Ván đầu: phải mở bằng bộ chứa 3♠.':'Người thắng ván trước mở bài.');
 event(room,'deal',room.turn);
}
function event(room,type,player,cards=[]) {room.eventId++;room.lastEvent={id:room.eventId,type,player,cards};}
function next(room,from,skipPassed=true) {for(let k=1;k<=4;k++){const i=(from+k)%4;if(!room.players[i].finished&&(!skipPassed||!room.pass.includes(i)))return i;}return from;}
function finish(room) {
 room.players.filter(p=>!p.finished).forEach(p=>{p.finishRank=4;p.finished=true;});
 room.phase='ended';room.lastWinner=room.players.findIndex(p=>p.finishRank===1);
 room.results=room.players.map(p=>{const s=score(p.hand,p.finishRank);p.score+=s.delta;return {name:p.name,rank:p.finishRank,...s,total:p.score};});
 room.history.push('Kết thúc ván • Điểm đã được lưu.');
}
function advance(room,from) {
 const opponents=room.players.map((p,i)=>!p.finished&&i!==room.lead?i:null).filter(i=>i!==null);
 if(opponents.every(i=>room.pass.includes(i))) {
  const lead=room.lead;room.table=[];room.pass=[];room.turn=room.players[lead].finished?next(room,lead,false):lead;room.lead=null;
  room.history.push('Vòng mới: người giữ lượt được mở bài.');
 } else room.turn=next(room,from);
}
export function play(room,idx,cards) {
 const p=room.players[idx];
 if(room.phase!=='playing'||room.turn!==idx||!p||p.finished||room.pass.includes(idx))return 'Chưa đến lượt của bạn.';
 if(!Array.isArray(cards)||cards.length>13||new Set(cards).size!==cards.length||cards.some(c=>!p.hand.includes(c)))return 'Bạn phải chọn các lá bài mình sở hữu.';
 const c=combo(cards);if(!c)return 'Bộ bài không hợp lệ.';
 if(room.round===1&&room.moves===0&&!cards.includes('3S'))return 'Lượt đầu phải chứa 3 bích.';
 if(!beats(c,combo(room.table),room.rules.cuts))return 'Bộ bài này không đè được bài trên bàn.';
 p.hand=p.hand.filter(c=>!cards.includes(c));room.table=ordered(cards);room.lead=idx;room.moves++;
 room.history.push(`${p.name} đánh: ${room.table.join(' ')}`);event(room,'play',idx,room.table);
 if(!p.hand.length){p.finished=true;p.finishRank=room.players.filter(p=>p.finishRank!==null).length+1;room.history.push(`${p.name} về hạng ${p.finishRank}!`);}
 if(room.players.filter(p=>!p.finished).length<=1)finish(room);else advance(room,idx);
 return null;
}
export function pass(room,idx) {
 if(room.phase!=='playing'||room.turn!==idx||!room.players[idx]||room.players[idx].finished||room.pass.includes(idx))return 'Chưa đến lượt của bạn.';
 if(!room.table.length)return 'Bạn phải đánh bài để mở vòng.';
 room.pass.push(idx);room.history.push(`${room.players[idx].name} bỏ vòng.`);event(room,'pass',idx);advance(room,idx);return null;
}
export function publicState(room,token) {
 const you=room.players.findIndex(p=>p.token===token);
 return {code:room.code,phase:room.phase,you,owner:room.owner,hand:you>=0?ordered(room.players[you].hand):[],players:room.players.map((p,id)=>({id,name:p.name,avatar:p.avatar,connected:!!p.socketId,count:p.hand.length,score:p.score,finished:p.finished,rank:p.finishRank})),turn:room.turn,lead:room.lead,table:room.table,pass:room.pass,history:room.history.slice(-8),round:room.round,results:room.results,rules:room.rules,lastEvent:room.lastEvent};
}
