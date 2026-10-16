// EduGames & AI starter script
// All game logic runs in-browser. AI functions are stubs and must be enabled only by admins/server-side APIs.

// --- Page nav ---
document.querySelectorAll('nav button').forEach(btn=>{
  btn.onclick = ()=> {
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById(btn.dataset.target).classList.remove('hidden');
  };
});

// --- TIC-TAC-TOE (simple) ---
const tttEl = document.getElementById('ttt');
const tttReset = document.getElementById('ttt-reset');
let tttState = Array(9).fill(null);
let tttTurn = 'X';
function tttRender(){
  tttEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const b = document.createElement('button');
    b.className = 'cell';
    b.textContent = tttState[i] || '';
    b.onclick = ()=> {
      if(tttState[i]) return;
      tttState[i] = tttTurn;
      tttTurn = tttTurn === 'X' ? 'O' : 'X';
      tttRender();
      const winner = tttCheck();
      if(winner) setTimeout(()=> alert('Winner: '+winner), 10);
    };
    tttEl.appendChild(b);
  }
}
function tttCheck(){
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const w of wins){
    const [a,b,c]=w;
    if(tttState[a] && tttState[a]===tttState[b] && tttState[a]===tttState[c]) return tttState[a];
  }
  if(tttState.every(Boolean)) return 'Draw';
  return null;
}
tttReset.onclick = ()=>{tttState = Array(9).fill(null); tttTurn='X'; tttRender();}
tttRender();

// --- SNAKE (minimal) ---
const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');
const grid = 15;
let snake = [{x:7,y:7}];
let dir = {x:1,y:0};
let apple = null;
let snakeTimer = null;
function placeApple(){
  apple = {x:Math.floor(Math.random()*(canvas.width/grid)), y:Math.floor(Math.random()*(canvas.height/grid))};
}
function snakeStep(){
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // wrap
  head.x = (head.x + canvas.width/grid) % (canvas.width/grid);
  head.y = (head.y + canvas.height/grid) % (canvas.height/grid);
  // self collision -> reset
  if(snake.some(s=>s.x===head.x && s.y===head.y)){ snake = [{x:7,y:7}]; dir={x:1,y:0}; placeApple(); return; }
  snake.unshift(head);
  if(apple && head.x===apple.x && head.y===apple.y){
    placeApple();
  } else {
    snake.pop();
  }
}
function drawSnake(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f9';
  snake.forEach(s=> ctx.fillRect(s.x*grid, s.y*grid, grid-1, grid-1));
  if(apple){ ctx.fillStyle = '#f44'; ctx.fillRect(apple.x*grid, apple.y*grid, grid-1, grid-1); }
}
function snakeStart(){
  if(snakeTimer) clearInterval(snakeTimer);
  snake = [{x:7,y:7}];
  dir = {x:1,y:0};
  placeApple();
  snakeTimer = setInterval(()=>{ snakeStep(); drawSnake(); }, 120);
}
document.getElementById('snake-reset').onclick = snakeStart;
window.addEventListener('keydown', e=>{
  if(e.key.includes('Arrow')) {
    if(e.key==='ArrowUp') dir = {x:0,y:-1};
    if(e.key==='ArrowDown') dir = {x:0,y:1};
    if(e.key==='ArrowLeft') dir = {x:-1,y:0};
    if(e.key==='ArrowRight') dir = {x:1,y:0};
  }
});
snakeStart();

// --- MEMORY (matching pairs) ---
const memoryEl = document.getElementById('memory');
const memoryReset = document.getElementById('memory-reset');
let memoryCards = [];
let memoryOpen = [];
function memorySetup(){
  const icons = ['★','●','◆','♣','♠','♥','☀','☂'].slice(0,6);
  const deck = icons.concat(icons).slice(0,12);
  shuffle(deck);
  memoryCards = deck.map((v,i)=>({id:i, val:v, matched:false}));
  memoryOpen = [];
  renderMemory();
}
function renderMemory(){
  memoryEl.innerHTML = '';
  memoryCards.forEach(c=>{
    const b = document.createElement('button');
    b.className = 'mem-card';
    b.textContent = (memoryOpen.includes(c.id) || c.matched) ? c.val : '?';
    b.onclick = ()=>{
      if(c.matched || memoryOpen.includes(c.id)) return;
      memoryOpen.push(c.id);
      if(memoryOpen.length===2){
        const a = memoryCards.find(x=>x.id===memoryOpen[0]);
        const bcard = memoryCards.find(x=>x.id===memoryOpen[1]);
        if(a.val===bcard.val){ a.matched=true; bcard.matched=true; memoryOpen = []; }
        else { setTimeout(()=>{ memoryOpen = []; renderMemory(); }, 700); }
      }
      renderMemory();
    };
    memoryEl.appendChild(b);
  });
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
memoryReset.onclick = memorySetup;
memorySetup();

// --- AI UI stubs ---
// Chat
const chatBox = document.getElementById('chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
chatForm.onsubmit = (e)=>{
  e.preventDefault();
  const text = chatInput.value.trim(); if(!text) return;
  appendChat('You', text);
  chatInput.value = '';
  appendChat('Bot', 'AI disabled in this demo. Admins: configure a server-side endpoint and update script.js sendToAPI().');
};
function appendChat(who, text){
  const p = document.createElement('div');
  p.innerHTML = '<strong>'+who+':</strong> '+escapeHtml(text);
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function escapeHtml(s){ return s.replace(/[&<>\