import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vietnamDay,resetDailyScores} from '../daily-scores.js';
test('daily scores: Vietnam midnight, once per day, defer during a game',()=>{
 const before=new Date('2026-10-21T16:59:59Z'),after=new Date('2026-10-21T17:00:00Z');
 assert.equal(vietnamDay(before),'2026-10-21');assert.equal(vietnamDay(after),'2026-10-22');
 const r={phase:'ended',scoreDay:'2026-10-21',players:[{score:8},{score:-4}],results:[{}],history:[],round:5,lastWinner:1};
 assert.equal(resetDailyScores(r,before),false);assert.equal(r.players[0].score,8);
 r.phase='playing';assert.equal(resetDailyScores(r,after),false);assert.equal(r.players[0].score,8);
 r.phase='ended';assert.equal(resetDailyScores(r,after),true);assert.deepEqual(r.players.map(p=>p.score),[0,0]);assert.equal(r.results,null);assert.equal(r.round,5);assert.equal(r.lastWinner,1);
 r.players[0].score=4;assert.equal(resetDailyScores(r,after),false);assert.equal(r.players[0].score,4);
 const old={phase:'lobby',players:[],history:[]};assert.equal(resetDailyScores(old,after),false);assert.equal(old.scoreDay,'2026-10-22');
});
