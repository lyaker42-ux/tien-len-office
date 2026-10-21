export function vietnamDay(now=new Date()) {
 return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
// A game crossing midnight keeps its result. Reset before the next game.
export function resetDailyScores(room,now=new Date()) {
 const day=vietnamDay(now);
 if(room.phase==='playing')return false;
 if(!room.scoreDay){room.scoreDay=day;return false;}
 if(room.scoreDay===day)return false;
 room.players.forEach(p=>p.score=0);
 room.results=null;room.scoreDay=day;
 room.history.push('Ngày mới (giờ Việt Nam): bảng điểm đã về 0.');
 return true;
}
