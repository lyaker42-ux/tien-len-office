export const suits = ['S', 'C', 'D', 'H'];
export const deck = () => Array.from({length:13}, (_,i)=>i+3).flatMap(r=>suits.map(s=>`${r}${s}`));
const valid = new Set(deck());
export const parse = c => ({rank:Number(c.slice(0,-1)), suit:c.at(-1)});
export const strength = c => parse(c).rank*4+suits.indexOf(parse(c).suit);
export const ordered = cs => [...cs].sort((a,b)=>strength(a)-strength(b));
export const DEFAULT_RULES = Object.freeze({cuts:true, instantWin:false, cong:false, rottenGroups:false, trum:false});
export function combo(cards) {
 if (!Array.isArray(cards)||!cards.length||cards.some(c=>!valid.has(c))||new Set(cards).size!==cards.length) return null;
 const cs=ordered(cards), n=cs.length, counts=new Map();
 cs.forEach(c=>counts.set(parse(c).rank,(counts.get(parse(c).rank)||0)+1));
 const rs=[...counts.keys()], high=strength(cs.at(-1));
 if(counts.size===1&&n<=4) return {type:['','single','pair','triple','quad'][n],length:n,high};
 const consecutive=!rs.includes(15)&&rs.every((r,i)=>!i||r===rs[i-1]+1);
 if(n>=3&&counts.size===n&&consecutive) return {type:'straight',length:n,high};
 if(n>=6&&n%2===0&&rs.length===n/2&&[...counts.values()].every(n=>n===2)&&consecutive) return {type:'pair_run',length:n/2,high};
 return null;
}
export function beats(next,old,cuts=true) {
 if(!next)return false;
 if(!old)return true;
 if(next.type===old.type&&next.length===old.length)return next.high>old.high;
 if(!cuts)return false;
 if(old.type==='single'&&old.high>=60)return next.type==='quad'||next.type==='pair_run'&&next.length>=3;
 if(old.type==='pair'&&old.high>=60)return next.type==='quad'||next.type==='pair_run'&&next.length>=4;
 if(old.type==='pair_run'&&old.length===3)return next.type==='quad'||next.type==='pair_run'&&next.length>=4;
 if(old.type==='quad')return next.type==='pair_run'&&next.length>=4;
 return false;
}
export function score(hand,rank) {
 const base=rank===1?4:rank===2?2:0;
 const penalties=hand.filter(c=>c==='3S'||parse(c).rank===15).map(card=>({card,points:card==='3S'?4:['H','D'].includes(parse(card).suit)?4:2}));
 return {base,penalties,delta:base-penalties.reduce((s,p)=>s+p.points,0)};
}
