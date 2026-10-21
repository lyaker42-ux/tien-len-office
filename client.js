const socket=io();
const $=id=>document.getElementById(id);
const SUIT={S:'♠',C:'♣',D:'♦',H:'♥'};
const rank=r=>({11:'J',12:'Q',13:'K',14:'A',15:'2'}[r]||r);
const info=c=>({rank:Number(c.slice(0,-1)),suit:c.at(-1)});
const cardName=c=>rank(info(c).rank)+SUIT[info(c).suit];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let state=null, selected=new Set(), avatar=null;
let saved={};try{saved=JSON.parse(sessionStorage.getItem('tl-session')||'{}');}catch{}
if(!saved||typeof saved!=='object')saved={};
let sound=false, audioContext;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let pathCode=location.pathname.match(/^\/room\/([A-F0-9]{6})$/)?.[1];
if(pathCode)$('roomcode').value=pathCode;
if(saved.name)$('nickname').value=saved.name;
let recover=null;try{recover=JSON.parse(localStorage.getItem('tl-recover-'+pathCode)||'null');}catch{}
if(recover?.token&&saved.code!==pathCode){$('recover').classList.remove('hidden');$('recover').onclick=()=>socket.emit('join',recover);}

$('soundBtn').onclick=()=>{sound=!sound;$('soundBtn').textContent=sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt';$('soundBtn').setAttribute('aria-pressed',String(sound));};
socket.on('session_replaced',()=>{saved={};sessionStorage.removeItem('tl-session');toast('Phiên đã chuyển sang cửa sổ khác. Tải lại trang để vào phòng.');});
socket.on('connect_error',()=>{$('connection').textContent='Chưa kết nối được • đang thử lại';});
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(window.toastTimeout);window.toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),3300);}
function connect(){ $('connection').textContent=socket.connected?'Đã kết nối':'Đang kết nối lại';$('dot').classList.toggle('ok',socket.connected);if(state)renderHand();if(socket.connected&&saved.code&&saved.token&&(!pathCode||pathCode===saved.code)){socket.emit('join',{code:saved.code,token:saved.token,name:saved.name});}}
socket.on('connect',connect);socket.on('disconnect',connect);
socket.on('game_error',message=>{
 if(String(message).includes('Không tìm thấy phòng')){
  const oldCode=saved.code;saved={};state=null;selected.clear();
  try{sessionStorage.removeItem('tl-session');if(oldCode)localStorage.removeItem('tl-recover-'+oldCode);}catch{}
  pathCode=null;history.replaceState({},'','/');$('roomcode').value='';
  $('game').classList.add('hidden');$('entry').classList.remove('hidden');$('recover').classList.add('hidden');
  toast('Phòng cũ đã hết phiên sau khi máy chủ khởi động lại. Hãy tạo phòng mới và gửi lại link mời.');
 }else toast(message);
});
socket.on('joined',({code,token})=>{saved={code,token,name:($('nickname').value||saved.name)};try{sessionStorage.setItem('tl-session',JSON.stringify(saved));localStorage.setItem('tl-recover-'+code,JSON.stringify(saved));}catch{toast('Trình duyệt không cho lưu phiên; hãy giữ tab này mở.');}pathCode=code;history.replaceState({},'',`/room/${code}`);$('entry').classList.add('hidden');$('game').classList.remove('hidden');toast('Đã vào phòng '+code);});
socket.on('state',s=>{
 const prev=state, positions=new Map([...$('hand').children].map(el=>[el.dataset.card,el.getBoundingClientRect()]));
 state=s;selected=new Set([...selected].filter(c=>s.hand.includes(c)));render();
 if(prev?.phase==='ended'&&s.phase==='playing'){$('winnerBanner').classList.add('hidden');$('confetti').replaceChildren();}
 if(prev?.lastEvent?.id!==s.lastEvent?.id&&s.lastEvent){animateEvent(s.lastEvent,positions);}
 if(prev?.phase==='playing'&&s.phase==='ended'){celebrate();toast('🎉 Ván kết thúc! Điểm đã lưu.');}
});
$('photo').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024)return toast('Ảnh không được quá 5 MB.');try{const img=new Image();img.src=URL.createObjectURL(file);await img.decode();const canvas=document.createElement('canvas');const side=96;canvas.width=canvas.height=side;let ctx=canvas.getContext('2d');let size=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-size)/2,(img.height-size)/2,size,size,0,0,side,side);avatar=canvas.toDataURL('image/jpeg',.76);$('avatarLabel').style.backgroundImage=`url(${avatar})`;$('avatarLabel').textContent='';URL.revokeObjectURL(img.src);}catch{toast('Không đọc được ảnh.');}};
function name(){const n=$('nickname').value.trim();if(!n)toast('Hãy nhập tên trước!');return n;}
$('create').onclick=()=>{const n=name();if(n)socket.emit('create',{name:n,avatar});};
$('join').onclick=()=>{const n=name(),code=$('roomcode').value.trim().toUpperCase();if(!n)return;if(!/^[A-F0-9]{6}$/.test(code))return toast('Mã phòng gồm 6 ký tự.');socket.emit('join',{code,name:n,avatar,token:saved.code===code?saved.token:null});};
$('copyLink').onclick=async()=>{const link=location.origin+'/room/'+state.code;try{await navigator.clipboard.writeText(link);toast('Đã sao chép link mời: '+link);}catch{prompt('Sao chép link mời:',link);}};
$('startBtn').onclick=()=>socket.emit('start');
$('playBtn').onclick=()=>{if(selected.size)socket.emit('play',[...selected]);else toast('Chọn lá bài trước khi đánh.');};
$('passBtn').onclick=()=>socket.emit('pass');
$('clearBtn').onclick=()=>{selected.clear();renderHand();};
function makeCard(c,selectable=false){const d=info(c);const el=document.createElement(selectable?'button':'div');el.dataset.card=c;el.className='card'+(['H','D'].includes(d.suit)?' red':'')+(selected.has(c)?' selected':'');el.innerHTML=`<span class="corner"><b>${rank(d.rank)}</b><i>${SUIT[d.suit]}</i></span><span class="symbol">${SUIT[d.suit]}</span>`;el.title=cardName(c);el.setAttribute('aria-label',cardName(c));if(selectable){el.setAttribute('aria-pressed',String(selected.has(c)));}if(selectable)el.onclick=()=>{selected.has(c)?selected.delete(c):selected.add(c);renderHand();};return el;}
function renderHand(){if(!state)return;const holder=$('hand');holder.replaceChildren(...state.hand.map(c=>makeCard(c,true)));$('handCount').textContent=state.hand.length+' lá';const myTurn=socket.connected&&state.phase==='playing'&&state.turn===state.you;$('playBtn').disabled=!myTurn||!selected.size;$('passBtn').disabled=!myTurn||state.table.length===0;}
function avatarHtml(p){return p.avatar?`<div class="portrait" style="background-image:url('${p.avatar}')"></div>`:`<div class="portrait">${escapeHtml(p.name.slice(0,1).toUpperCase())}</div>`;}
function render(){if(!state)return;
 $('roomLabel').textContent=state.code;$('roundLabel').textContent=`Ván #${state.round} · ${state.players.length}/4 người`;
 const other=[(state.you+1)%4,(state.you+2)%4,(state.you+3)%4];const positions=[state.you,...other];
 positions.forEach((playerIdx,slot)=>{const p=state.players[playerIdx];const el=$('seat'+slot);if(!p){el.innerHTML='<div class="pname">⏳ Chờ người chơi...</div>';el.classList.remove('active');return;}el.classList.toggle('active',state.phase==='playing'&&state.turn===playerIdx);el.classList.toggle('passed',state.pass.includes(playerIdx));el.innerHTML=avatarHtml(p)+`<div><div class="pname">${escapeHtml(p.name)} ${playerIdx===state.you?'(Bạn)':''}</div><div class="pmeta">${p.finished?'🏅 Hạng '+p.rank:p.count+' lá'+(state.pass.includes(playerIdx)?' · Bỏ vòng':'')} · ${p.score}đ ${p.connected?'🟢':'🔴'}</div></div>`;});
 const current=state.players[state.turn];$('turnMessage').textContent=state.phase==='lobby'?'Đang chờ đủ 4 người chơi':state.phase==='ended'?'🏆 KẾT THÚC VÁN':state.turn===state.you?'✨ ĐẾN LƯỢT BẠN!':`⏳ Đến lượt ${current?.name||''}`;
 if($('tableCards').dataset.key!==state.table.join(',')){ $('tableCards').replaceChildren(...state.table.map(c=>makeCard(c)));$('tableCards').dataset.key=state.table.join(',');}
 $('playInfo').textContent=state.table.length?'Bài đang trên bàn':state.phase==='playing'?'Lượt đánh mới':'Bàn bài sẵn sàng';
 $('leaderboard').innerHTML=state.players.map((p,i)=>({...p,i})).sort((a,b)=>b.score-a.score||a.i-b.i).map((p,index)=>`<div class="rankrow"><span class="rankname"><b>${['🥇','🥈','🥉','4'][index]}</b>${escapeHtml(p.name)}</span><span class="points">${p.score>0?'+':''}${p.score} điểm</span></div>`).join('');
 $('history').innerHTML=state.history.slice().reverse().map(h=>`<div class="history-item">${escapeHtml(h)}</div>`).join('')||'<p class="muted">Chưa có lượt đánh nào.</p>';
 $('startBtn').classList.toggle('hidden',!['lobby','ended'].includes(state.phase)||state.you!==state.owner);
 $('startBtn').disabled=state.players.length!==4||state.players.some(p=>!p.connected);
 $('startBtn').textContent=state.phase==='ended'?'CHƠI VÁN TIẾP →':'BẮT ĐẦU VÁN →';
 if(state.results){$('resultContent').innerHTML=state.results.slice().sort((a,b)=>a.rank-b.rank).map(r=>`<div class="resultrow"><span>${['🥇','🥈','🥉','4️⃣'][r.rank-1]} ${escapeHtml(r.name)} <small>${r.penalties.map(x=>cardName(x.card)+' (-'+x.points+')').join(', ')}</small></span><b>${r.delta>0?'+':''}${r.delta}đ</b></div>`).join('');}
 else $('resultContent').innerHTML=state.phase==='lobby'?`<p class="muted">Chờ ${4-state.players.length} người nữa để bắt đầu. Chia sẻ link phòng bên trên.</p>`:'<p class="muted">Đánh hết bài để tranh hạng 1 và hạng 2. Heo chưa đánh và 3♠ còn tay sẽ bị trừ điểm.</p>';
 renderHand();
}

function chime(win=false){if(!sound)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();[0, win?4:0, win?7:0].slice(0,win?3:1).forEach((note,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+i*.12;osc.frequency.value=440*2**(note/12);gain.gain.setValueAtTime(.055,at);gain.gain.exponentialRampToValueAtTime(.001,at+.2);osc.connect(gain).connect(audioContext.destination);osc.start(at);osc.stop(at+.22);});}catch{}}
function animateEvent(e,oldPositions){
 if(reducedMotion)return;
 if(e.type==='deal'){
  [...$('hand').children].forEach((el,i)=>el.animate([{transform:'translateY(-130px) rotate(-16deg)',opacity:0},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:420,delay:i*55,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'}));
  [1,2,3].forEach(slot=>{const el=$('seat'+slot).querySelector('.portrait');el?.animate([{opacity:.3,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],{duration:800});});
 }else if(e.type==='play'){
  const slot=(e.player-state.you+4)%4,seat=$('seat'+slot).getBoundingClientRect();
  [...$('tableCards').children].forEach((el,i)=>{const to=el.getBoundingClientRect(),from=slot===0?oldPositions.get(el.dataset.card):null;
   el.animate([{transform:`translate(${(from?.left??seat.left+seat.width/2)-to.left}px,${(from?.top??seat.top+seat.height/2)-to.top}px) scale(.7) rotate(${slot===1?-18:18}deg)`,opacity:.5},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],{duration:460,delay:i*35,easing:'cubic-bezier(.16,1,.3,1)'});
  });chime();
 }
}
function celebrate(){
 const winner=state.players.find(p=>p.rank===1);$('winnerName').textContent=winner?.name||'';$('winnerBanner').classList.remove('hidden');
 clearTimeout(window.winnerTimeout);window.winnerTimeout=setTimeout(()=>$('winnerBanner').classList.add('hidden'),6000);chime(true);
 if(reducedMotion)return;
 const layer=$('confetti');layer.replaceChildren();for(let i=0;i<65;i++){const bit=document.createElement('i');bit.style.cssText=`left:${Math.random()*100}%;background:${['#f9c86b','#64e6bd','#f48aa4','#9cc7ff'][i%4]};--drift:${Math.random()*240-120}px;animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*.6}s`;layer.append(bit);}setTimeout(()=>layer.replaceChildren(),5000);
}
