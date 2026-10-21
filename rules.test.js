import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deck,combo,beats,score,DEFAULT_RULES} from './rules.js';
import {newRoom,deal,play,pass,publicState} from './game.js';
function room(hands){const r=newRoom('ABCDEF');r.round=2;r.phase='playing';r.players=hands.map((hand,i)=>({name:`P${i}`,token:`secret-${i}`,hand,score:0,finishRank:null,finished:false}));return r;}
test('deck: 52 unique cards; valid combinations and suit ranking',()=>{
 assert.equal(new Set(deck()).size,52);
 for(const invalid of [[],['3S','3S'],['joker'],[null],['3S','4S'],['14S','15S','3S'],['13S','14S','15S']])assert.equal(combo(invalid),null);
 for(const [cards,type] of [[['3S'],'single'],[['3S','3H'],'pair'],[['3S','3C','3D'],'triple'],[['3S','3C','3D','3H'],'quad'],[['3S','4H','5C'],'straight'],[['3S','3C','4D','4H','5S','5D'],'pair_run']])assert.equal(combo(cards).type,type);
 assert(beats(combo(['3H']),combo(['3D'])));assert(!beats(combo(['4H']),combo(['3S','3H'])));
});
test('cut matrix and cuts disabled',()=>{
 const quad=combo(['4S','4C','4D','4H']),run3=combo(['5S','5C','6S','6C','7S','7C']),run4=combo(['6S','6C','7S','7C','8S','8C','9S','9C']),single=combo(['15H']),pair=combo(['15S','15H']);
 for(const [n,o] of [[quad,single],[quad,pair],[quad,run3],[run3,single],[run4,pair],[run4,quad],[run4,run3]]){assert(beats(n,o));assert(!beats(n,o,false));}
 assert(!beats(run3,pair));assert(!beats(run3,quad));assert(!beats(quad,run4));
 assert.deepEqual(DEFAULT_RULES,{cuts:true,instantWin:false,cong:false,rottenGroups:false,trum:false});
});
test('scoring fixed ranks and every penalty',()=>{
 assert.equal(score([],1).delta,4);assert.equal(score([],2).delta,2);assert.equal(score([],3).delta,0);
 assert.equal(score(['3S','15S','15C','15D','15H'],4).delta,-16);
 assert.equal(score(['3S'],2).delta,-2);
});
test('deal, first move, ownership and out of turn',()=>{
 const r=room([[],[],[],[]]);r.round=0;deal(r);
 assert.equal(new Set(r.players.flatMap(p=>p.hand)).size,52);assert(r.players.every(p=>p.hand.length===13));
 assert(r.players[r.turn].hand.includes('3S'));
 assert(play(r,(r.turn+1)%4,['3S']));assert(play(r,r.turn,['NO']));assert(play(r,r.turn,['3S','3S']));
 assert(play(r,r.turn,r.players[r.turn].hand.filter(c=>c!=='3S').slice(0,1)));
 assert.equal(play(r,r.turn,['3S']),null);
 const view=publicState(r,'secret-0');assert.equal(view.hand.length,r.players[0].hand.length);assert(!JSON.stringify(view.players).includes('secret'));assert(view.players.every(p=>!('hand' in p)));
});
test('pass remains locked even after another player beats',()=>{
 const r=room([['3S','10S'],['4S','11S'],['5S','12S'],['6S','13S']]);
 assert.equal(play(r,0,['3S']),null);assert.equal(pass(r,1),null);assert.equal(play(r,2,['5S']),null);assert.equal(pass(r,3),null);assert.equal(pass(r,0),null);
 assert.equal(r.turn,2);assert.deepEqual(r.table,[]);assert.deepEqual(r.pass,[]);
 assert.equal(play(r,1,['11S']),'Chưa đến lượt của bạn.');
});
test('finished lead transfers opening to next active after all pass',()=>{
 const r=room([['3S'],['4S','11S'],['5S','12S'],['6S','13S']]);
 play(r,0,['3S']);assert.equal(r.players[0].finishRank,1);pass(r,1);pass(r,2);pass(r,3);
 assert.equal(r.turn,1);assert.deepEqual(r.table,[]);assert.equal(r.lead,null);
});
test('last opponent and leader finish do not cause stuck turn',()=>{
 const r=room([['3S'],['4S'],['5S'],['15H','15S']]);
 play(r,0,['3S']);play(r,1,['4S']);play(r,2,['5S']);assert.equal(r.phase,'ended');
 assert.deepEqual(r.players.map(p=>p.finishRank),[1,2,3,4]);assert.equal(r.players[3].score,-6);
 deal(r);assert.equal(r.turn,0);assert.equal(r.round,3);
});
test('100 full games finish legally with all ranks and score totals',()=>{
 for(let trial=0;trial<100;trial++){
  const r=room([[],[],[],[]]);r.round=0;deal(r);let n=0;
  while(r.phase==='playing'&&++n<2000){const p=r.players[r.turn];let cards=p.hand.map(c=>[c]).filter(cs=>(r.round!==1||r.moves!==0||cs.includes('3S'))&&beats(combo(cs),combo(r.table),r.rules.cuts));const msg=cards.length?play(r,r.turn,cards[0]):pass(r,r.turn);assert.equal(msg,null);}
  assert.equal(r.phase,'ended');assert.deepEqual(r.players.map(p=>p.finishRank).sort(),[1,2,3,4]);
  r.players.forEach(p=>assert.equal(p.score,score(p.hand,p.finishRank).delta));
 }
});
