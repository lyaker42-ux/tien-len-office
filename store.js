import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
export function createStore(filename) {
 if(filename!==':memory:')mkdirSync(path.dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS rooms(code TEXT PRIMARY KEY, snapshot TEXT NOT NULL); CREATE TABLE IF NOT EXISTS scores(room TEXT, round INTEGER, player INTEGER, name TEXT, delta INTEGER, total INTEGER, rank INTEGER, PRIMARY KEY(room,round,player));');
 const saveRoom=db.prepare('INSERT OR REPLACE INTO rooms VALUES (?,?)');
 const saveScore=db.prepare('INSERT OR IGNORE INTO scores VALUES (?,?,?,?,?,?,?)');
 return {
  load(){return db.prepare('SELECT snapshot FROM rooms').all().map(r=>{const room=JSON.parse(r.snapshot);room.players.forEach(p=>p.socketId=null);return room;});},
  save(room){db.exec('BEGIN');try{saveRoom.run(room.code,JSON.stringify(room));if(room.phase==='ended')room.results.forEach((r,i)=>saveScore.run(room.code,room.round,i,r.name,r.delta,r.total,r.rank));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}},
  standings(code){return db.prepare('SELECT player,name,total FROM scores WHERE room=? AND round=(SELECT MAX(round) FROM scores WHERE room=?) ORDER BY total DESC,player').all(code,code);},
  close(){db.close();}
 };
}
