/* BOAT LAB v9: read-only nationwide watchlist from cached nonofficial data. */
(()=>{'use strict';
const KEY='boatrace-race-lab-cache-v2';
const VENUES=['桐生','戸田','江戸川','平和島','多摩川','浜名湖','蒲郡','常滑','津','三国','びわこ','住之江','尼崎','鳴門','丸亀','児島','宮島','徳山','下関','若松','芦屋','福岡','唐津','大村'];
const $=id=>document.getElementById(id);
const valid=x=>x!==''&&x!=null&&Number.isFinite(Number(x));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function closeMs(s){const t=s?.closedAt;if(typeof t!=='string'||!/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d/.test(t))return NaN;return Date.parse(t.slice(0,16).replace(' ','T')+'+09:00')}
function read(){try{return JSON.parse(localStorage.getItem(KEY))?.days||{}}catch{return {}}}
function calc(players){if(!Array.isArray(players)||players.length!==6||!players.every(p=>valid(p.win)&&valid(p.two)&&valid(p.st)))return null;
const pri=[53,17,12,10,6,2],p2=[18,25,20,17,13,7],p3=[11,18,21,20,17,13];
const exhibits=players.every(p=>valid(p.exhibit)&&Number(p.exhibit)>0);
const sorted=exhibits?players.map(p=>Number(p.exhibit)).sort((a,b)=>a-b):[];const med=exhibits?(sorted[2]+sorted[3])/2:0;
const w=players.map(p=>{let s=Math.exp(.35*(Number(p.win)-7)+.015*(Number(p.two)-45)+4*(.14-Number(p.st)));if(valid(p.motor))s*=Math.exp(.02*(Number(p.motor)-40));if(exhibits)s*=Math.exp(1.3*(med-Number(p.exhibit)));return Math.max(.005,Math.min(100,s))});
const first=w.map((x,i)=>x*pri[i]),den=first.reduce((a,b)=>a+b,0);let combos=[];
for(let a=0;a<6;a++)for(let b=0;b<6;b++)if(a!==b)for(let c=0;c<6;c++)if(c!==a&&c!==b){const d2=w.reduce((s,x,i)=>s+(i===a?0:x*p2[i]),0),d3=w.reduce((s,x,i)=>s+(i===a||i===b?0:x*p3[i]),0);const weight=first[a]/den*w[b]*p2[b]/d2*w[c]*p3[c]/d3;combos.push({ticket:`${a+1}-${b+1}-${c+1}`,weight,first:a+1})}
combos.sort((a,b)=>b.weight-a.weight);const top=combos[0];const bestOutside=combos.find(x=>x.first!==1);const sortedFirst=[...first].sort((a,b)=>b-a);const firstShare=first[0]/den;const spread=sortedFirst[0]/Math.max(sortedFirst[1],.001);
// Ranking scores are heuristic, not probabilities, ROI or proven edge.
const stability=Math.min(100,Math.max(0,100*top.weight/.25));
const favScore=100*firstShare*.65+stability*.35;
const upsetScore=bestOutside?100*(bestOutside.weight/Math.max(top.weight,.0001))*.55+100*(1-firstShare)*.45:0;
const balancedScore=100*(1-Math.abs(firstShare-.55))*.65+stability*.35;
return {top:top.ticket,alternative:bestOutside?.ticket||'',favScore,upsetScore,balancedScore,firstShare,spread,exhibits,motors:players.filter(p=>valid(p.motor)).length};}
function render(){const root=$('boatlab-v9');if(!root)return;const d=$('bv9-day').value||today(),mode=$('bv9-mode').value;const data=read()[d];const venues=data?.venues||{};const now=Date.now();let total=0,eligible=0,closed=0,missing=0,noDeadline=0,rows=[];
for(const [v,rs] of Object.entries(venues))for(const [n,race] of Object.entries(rs||{})){
 const vi=Number(v),ni=Number(n);if(!Number.isInteger(vi)||vi<1||vi>24||!Number.isInteger(ni)||ni<1||ni>12)continue;total++;
 if(race?.triple){closed++;continue}const close=closeMs(race);if(!Number.isFinite(close)){noDeadline++;continue}if(close-now<5*60*1000){closed++;continue}
 const model=calc(race?.players);if(!model){missing++;continue}eligible++;
 const score=mode==='favorite'?model.favScore:mode==='upset'?model.upsetScore:model.balancedScore;
 const ticket=mode==='upset'?model.alternative:model.top;
 rows.push({v:vi,n:ni,close,score,ticket,model});}
rows.sort((a,b)=>b.score-a.score||a.close-b.close);
$('bv9-status').textContent=`${d}｜キャッシュ内 ${total}レース／締切5分以上前・分析可能 ${eligible}件／締切済・結果あり ${closed}件／締切不明 ${noDeadline}件／基礎データ不足 ${missing}件`;
$('bv9-source').textContent=`取得済みキャッシュ更新：${data?.fetchedAt?new Date(data.fetchedAt).toLocaleString('ja-JP'):'不明'}。全24場・全レースを取得済みとは限りません。`;
const top=rows.slice(0,5);$('bv9-list').innerHTML=top.length?top.map((x,i)=>{const time=new Date(x.close).toLocaleTimeString('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'});const why=mode==='favorite'?`1号艇の相対評価 ${(x.model.firstShare*100).toFixed(0)}%（独自重み比）`:mode==='upset'?`1号艇以外の1着候補を比較`: `本命と波乱の中間を比較`;return `<div class="bv9-item"><div class="bv9-top"><b>${i+1}位｜${esc(VENUES[x.v-1])} ${x.n}R</b><span>締切 ${time}</span></div><div class="bv9-ticket">参考3連単 ${esc(x.ticket)}</div><p>${why}｜モーター ${x.model.motors}/6・展示 ${x.model.exhibits?'反映':'未適用'}｜比較スコア ${x.score.toFixed(1)}</p><button type="button" class="bv9-open" data-v="${x.v}" data-n="${x.n}">このレースを表示</button></div>`}).join(''):'<p class="bv9-empty">条件を満たすレースが見つかりません。開催データの更新・対象日・締切時刻を確認してな。</p>';
$('bv9-list').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{const venue=$('venueSelect'),date=$('dateInput');if(!venue||!date)return;date.value=d;date.dispatchEvent(new Event('change',{bubbles:true}));venue.value=String(btn.dataset.v);venue.dispatchEvent(new Event('change',{bubbles:true}));const target=Number(btn.dataset.n);setTimeout(()=>{const b=[...document.querySelectorAll('.race-btn')].find(el=>Number(el.dataset.race||el.textContent.match(/\d+/)?.[0])===target);if(b)b.click();window.scrollTo({top:0,behavior:'smooth'});},250)});
}
function init(){if($('boatlab-v9'))return;const home=$('view-home')||document.querySelector('main')||document.body;const section=document.createElement('section');section.id='boatlab-v9';section.className='section';section.innerHTML='<h2>v9｜全国注目レース TOP5</h2><p class="bv9-note">全国24場・最大288レースの取得済みデータから比較。未取得や締切不明のレースは推薦しません。</p><div class="bv9-controls"><label>対象日 <input id="bv9-day" type="date"></label><label>ランキング <select id="bv9-mode"><option value="favorite">本命重視</option><option value="balanced">バランス型</option><option value="upset">波乱展開重視</option></select></label></div><button type="button" id="bv9-refresh">保存済みデータから再評価</button><p id="bv9-status" class="bv9-note"></p><p id="bv9-source" class="bv9-note"></p><div id="bv9-list"></div><p class="bv9-note">※ スコアは未検証の相対比較値で、的中確率・期待値・高配当の保証ではありません。オッズは未評価。締切は取得データの時刻であり、必ず公式情報を確認してください。結果・保存済み予想には一切書き込みません。</p>';
const style=document.createElement('style');style.textContent='#boatlab-v9{border-color:#5b8b78}#boatlab-v9 h2{font-size:19px;margin:0 0 10px}.bv9-note{font-size:11px;color:#b8cbd6;line-height:1.7}.bv9-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}.bv9-controls label{font-size:11px;display:grid;gap:6px}.bv9-controls input,.bv9-controls select,#bv9-refresh,.bv9-open{background:#183247;color:#f2fafc;border:1px solid #577489;border-radius:9px;padding:10px;min-width:0;width:100%;font-size:12px}.bv9-item{border:1px solid #3e726d;border-radius:12px;padding:13px;margin:10px 0;background:#12333b}.bv9-top{display:flex;justify-content:space-between;gap:8px;font-size:13px}.bv9-top span{font-size:11px;color:#b4d6d4}.bv9-ticket{font-size:16px;font-weight:800;color:#76eed7;margin:10px 0}.bv9-item p,.bv9-empty{font-size:11px;color:#c3d4dc;line-height:1.7}.bv9-open{margin-top:4px}';document.head.appendChild(style);home.insertBefore(section,home.firstChild);$('bv9-day').value=$('dateInput')?.value||today();$('bv9-day').onchange=render;$('bv9-mode').onchange=render;$('bv9-refresh').onclick=render;render();document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
