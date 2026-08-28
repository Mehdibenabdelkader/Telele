const $ = s => document.querySelector(s);
const pane=$('#pane'), view=$('#view'), scroll=$('#scroll'), textEl=$('#text'),
      band=$('#band'), shadeT=$('#shadeTop'), shadeB=$('#shadeBot'),
      editor=$('#editor'), ta=$('#ta'), prog=$('#progress'), stage=$('#stage');

let raw='', words=0, y=0, playing=false, last=0, pxPerSec=0, elapsed=0, finished=false;

/* ---------- build the script ---------- */
function render(src){
  raw = src;
  textEl.innerHTML='';
  words=0;
  src.split(/\n{2,}/).forEach(block=>{
    const p=document.createElement('div'); p.className='p';
    block.split('\n').forEach(line=>{
      if(line.trim().startsWith('//')){
        const c=document.createElement('span'); c.className='cue';
        c.textContent='▸ '+line.trim().replace(/^\/\/\s*/,'');
        p.appendChild(c);
      }else{
        words += (line.match(/\S+/g)||[]).length;
        p.appendChild(document.createTextNode(line+'\n'));
      }
    });
    textEl.appendChild(p);
  });
  $('#wc').textContent=words;
  measure(); reset();
}

function measure(){
  const wpm=+$('#wpm').value;
  const h=textEl.scrollHeight;
  pxPerSec = words>0 ? (h/words)*(wpm/60) : 40;
  $('#eta').textContent = fmt(words/wpm*60);
  layout();
}
const fmt = s => Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');

/* ---------- layout: eye line, dim bands, start offset ---------- */
function layout(){
  const f=+$('#focus').value/100, H=view.clientHeight;
  band.style.top=(H*f)+'px';
  shadeT.style.top=0; shadeT.style.height=(H*f-90)+'px';
  shadeB.style.top=(H*f+90)+'px'; shadeB.style.bottom=0; shadeB.style.height='auto';
  scroll.style.paddingTop=(H*f)+'px';
  scroll.style.paddingBottom=(H*0.9)+'px';
}

function apply(){
  textEl.style.fontSize=$('#size').value+'px';
  textEl.style.lineHeight=(+$('#lh').value/100);
  textEl.style.padding='0 '+$('#pad').value+'%';
  textEl.style.fontFamily=$('#face').value;
  textEl.style.direction=$('#dir').value;
  textEl.style.textAlign=$('#dir').value==='rtl'?'right':'left';
  $('#sizeO').textContent=$('#size').value;
  $('#lhO').textContent=(+$('#lh').value/100).toFixed(2);
  $('#padO').textContent=$('#pad').value+'%';
  $('#wpmO').textContent=$('#wpm').value;
  $('#focusO').textContent=$('#focus').value+'%';
  view.className=$('#theme').value+(view.classList.contains('dimmed')?' dimmed':'');
  measure();
}

function draw(){ scroll.style.transform=`translateY(${-y}px)`+(mirror?' scaleX(-1)':''); }
let mirror=false;

/* ---------- transport ---------- */
function tick(t){
  if(!playing) return;
  const dt=(t-last)/1000; last=t; elapsed+=dt;
  y += pxPerSec*dt;
  const end=textEl.scrollHeight;
  prog.style.width=Math.min(100,(y/Math.max(end,1))*100)+'%';
  $('#clock').textContent=fmt(elapsed);
  if(y>=end){ y=end; pause(); finished=true; $('#done').style.display='block'; }
  draw();
  requestAnimationFrame(tick);
}
function play(){
  if(finished) return;
  const n=+$('#cd').value;
  if(n>0 && y===0){ countdown(n, run); } else run();
}
function run(){
  playing=true; last=performance.now(); $('#play').textContent='Pause';
  requestAnimationFrame(tick); hideDeckSoon();
}
function pause(){ playing=false; $('#play').textContent='Start'; showDeck(); }
function toggle(){ playing?pause():play(); }
function reset(){ y=0; elapsed=0; finished=false; $('#done').style.display='none';
  prog.style.width=0; $('#clock').textContent='0:00'; draw(); }

function countdown(n, done){
  const el=$('#count'); el.style.display='flex'; el.textContent=n;
  const iv=setInterval(()=>{ n--; if(n<=0){clearInterval(iv); el.style.display='none'; done();}
    else el.textContent=n; },1000);
}

/* ---------- deck auto-hide ---------- */
let hideT;
function hideDeckSoon(){ clearTimeout(hideT); hideT=setTimeout(()=>{ if(playing) $('#deck').classList.add('hidden'); },2500); }
function showDeck(){ clearTimeout(hideT); $('#deck').classList.remove('hidden'); if(playing) hideDeckSoon(); }
document.addEventListener('mousemove', showDeck);

/* ---------- resize grip ---------- */
let dragging=false;
$('#grip').addEventListener('mousedown',e=>{dragging=true;e.preventDefault();document.body.style.cursor='col-resize'});
window.addEventListener('mouseup',()=>{dragging=false;document.body.style.cursor=''});
window.addEventListener('mousemove',e=>{
  if(!dragging) return;
  const r=stage.getBoundingClientRect();
  let w = stage.classList.contains('right') ? (r.right-e.clientX) : (e.clientX-r.left);
  pane.style.width=Math.max(240,Math.min(r.width-60,w))+'px';
  layout();
});
$('#grip').addEventListener('keydown',e=>{
  const step=e.shiftKey?60:20, w=pane.getBoundingClientRect().width;
  if(e.key==='ArrowLeft'){pane.style.width=(w-step)+'px';layout();e.preventDefault();}
  if(e.key==='ArrowRight'){pane.style.width=(w+step)+'px';layout();e.preventDefault();}
});

/* ---------- wiring ---------- */
['size','lh','pad','wpm','focus'].forEach(id=>$('#'+id).addEventListener('input',apply));
['theme','face','dir'].forEach(id=>$('#'+id).addEventListener('change',apply));
$('#play').onclick=toggle;
$('#reset').onclick=()=>{pause();reset();};
$('#dim').onclick=e=>{view.classList.toggle('dimmed');e.target.classList.toggle('on');};
$('#mir').onclick=e=>{mirror=!mirror;e.target.classList.toggle('on');draw();};
$('#dock').onclick=e=>{stage.classList.toggle('right');
  e.target.textContent=stage.classList.contains('right')?'Dock left':'Dock right';layout();};
$('#full').onclick=()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();};
const editBtn=$('#edit'), clearBtn=$('#clear');
function openEditor(){pause();editor.style.display='flex';ta.value=raw;ta.focus();editBtn.textContent='Save';clearBtn.style.display='inline-block';}
function closeEditor(){render(ta.value);editor.style.display='none';editBtn.textContent='Edit text';clearBtn.style.display='none';}
editBtn.onclick=()=>{ editor.style.display==='none' ? openEditor() : closeEditor(); };
$('#clear').onclick=()=>{ta.value='';ta.focus();};
ta.addEventListener('input',()=>{
  const w=(ta.value.replace(/^\s*\/\/.*$/gm,'').match(/\S+/g)||[]).length;
  $('#edstat').textContent=w+' words · about '+fmt(w/(+$('#wpm').value)*60)+' at current speed';
});

/* ---------- keys ---------- */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT') {
    if(e.key==='Escape') e.target.blur();
    return;
  }
  const k=e.key;
  if(k===' '){e.preventDefault();toggle();}
  else if(k==='r'||k==='R'){pause();reset();}
  else if(k==='ArrowDown'){y+=60;draw();e.preventDefault();}
  else if(k==='ArrowUp'){y=Math.max(0,y-60);finished=false;$('#done').style.display='none';draw();e.preventDefault();}
  else if(k==='['){$('#wpm').value=+$('#wpm').value-5;apply();}
  else if(k===']'){$('#wpm').value=+$('#wpm').value+5;apply();}
  else if(k==='-'){$('#size').value=+$('#size').value-2;apply();}
  else if(k==='='||k==='+'){$('#size').value=+$('#size').value+2;apply();}
  else if(k==='m'||k==='M'){$('#mir').click();}
  else if(k==='f'||k==='F'){$('#full').click();}
  else if(k==='e'||k==='E'){$('#edit').click();}
  else if(k==='Escape'){pause();}
  showDeck();
});
window.addEventListener('resize',()=>{measure();});

/* ---------- boot ---------- */
render(`Hey — this is the prompter.

// look at the lens, not the screen

Paste your script in the editor. Blank lines become paragraphs. The amber line is your eye line: keep the sentence you are saying right there, and the camera sees you looking straight ahead.

Speed is set in words per minute, not a made-up number, so 135 wpm here really is 135 wpm out of your mouth.`);
apply(); ta.value=raw; editor.style.display='none'; clearBtn.style.display='none';

const welcome=$('#welcome');
if(!localStorage.getItem('telele-visited')) welcome.style.display='flex';
$('#welcome-close').onclick=()=>{ welcome.style.display='none'; localStorage.setItem('telele-visited','1'); };
