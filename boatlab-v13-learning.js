/* BOAT LAB v13: local archive and honest performance audit; no automatic model training. */
(()=>{'use strict';
const SOURCE='boatrace-race-lab-daily-picks-v1',ARCHIVE='boatlab-v13-history-v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch{return {}}};
const combo=x=>typeof x==='string'&&/^[1-6]-[1-6]-[1-6]$/.test(x)&&new Set(x.split('-')).size===3;
const money=n=>Math.round(n).toLocaleString('ja-JP')+'円';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function archive(){const src=read(SOURCE).records||{},db=read(ARCHIVE);if(!db.records)db.records={};let changed=false;
for(const [k,r] of Object.entries(src)){if(!r||!/^\d{4}-\d\d-\d\d_\d+_\d+$/.test(k)||!Array.isArray(r.picks)||!r.picks.every(combo))continue;
const old=db.records[k];if(!old){db.records[k]=structuredClone(r);changed=true;continue}
// Preserve the first prediction. Only attach verified result fields to it.
if(old.status!=='resolved'&&r.status==='resolved'&&combo(r.actual)){
 Object.assign(old,{status:'resolved',actual:r.actual,trifectaPayouts:r.trifectaPayouts,refundRisk:r.refundRisk,settledAt:r.settledAt});changed=true;
}else if(old.status==='pending'&&r.status==='void'){old.status='void';changed=true}
}
if(changed){try{localStorage.setItem(ARCHIVE,JSON.stringify(db))}catch(e){const n=document.getElementById('bv13-warning');if(n)n.textContent='保存容量不足：履歴の保存に失敗しました。バックアップしてください。'}}
return db.records}
function audit(){const all=Object.values(archive());const done=all.filter(r=>r.status==='resolved'&&combo(r.actual));const safe=done.filter(r=>!r.refundRisk&&Array.isArray(r.trifectaPayouts)&&r.trifectaPayouts.length&&r.trifectaPayouts.every(p=>combo(p.combo)&&Number.isSafeInteger(p.amount)&&p.amount>0));
let hits=0,payout=0;for(const r of safe){const picks=r.picks.slice(0,2);const won=r.trifectaPayouts.filter(p=>picks.includes(p.combo)).reduce((a,p)=>a+p.amount,0);payout+=won;if(won>0)hits++}
const stake=safe.length*200;return{all:all.length,done:done.length,safe:safe.length,hits,stake,payout,net:payout-stake,roi:stake?100*payout/stake:null,hit: safe.length?100*hits/safe.length:null,excluded:done.length-safe.length}}
function render(){const root=document.getElementById('boatlab-v13');if(!root)return;const a=audit();root.querySelector('#bv13-stats').innerHTML=`<div>蓄積 <b>${a.all}R</b></div><div>結果照合 <b>${a.done}R</b></div><div>収支集計対象 <b>${a.safe}R</b></div><div>2点的中率 <b>${a.hit===null?'未算出':a.hit.toFixed(1)+'%'}</b></div><div>回収率 <b>${a.roi===null?'未算出':a.roi.toFixed(1)+'%'}</b></div><div>収支 <b>${money(a.net)}</b></div>`;
root.querySelector('#bv13-note').textContent=`本線＋押さえ各100円の仮想購入。返還・払戻未確認など${a.excluded}Rは収支から除外。過去の記録は端末内に保存されます。`}
function download(){const data=read(ARCHIVE),blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),version:13,...data},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='boatlab-history-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),15000)}
function init(){if(document.getElementById('boatlab-v13'))return;const root=document.getElementById('boatlab-v11');if(!root)return;const section=document.createElement('section');section.id='boatlab-v13';section.className='section';section.innerHTML='<details><summary>📈 蓄積データ・予想成績を確認</summary><p class="bv13-muted">予想固定記録と結果を保存・集計。自動学習や精度改善はまだ実行しません。</p><div id="bv13-stats"></div><p id="bv13-note" class="bv13-muted"></p><p id="bv13-warning" class="bv13-muted"></p><button id="bv13-export" type="button">履歴をバックアップ（JSON）</button></details>';
const style=document.createElement('style');style.textContent='#boatlab-v13{border-color:#3b7773}#boatlab-v13 summary{cursor:pointer;font-weight:800;color:#80ead3}#bv13-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}#bv13-stats>div{border:1px solid #39556b;border-radius:10px;padding:10px;font-size:12px}#bv13-stats b{display:block;font-size:19px;color:#78e8d1;margin-top:4px}.bv13-muted{font-size:11px;line-height:1.8;color:#a9c4d2}#bv13-export{padding:12px;width:100%;border:1px solid #548298;border-radius:10px;background:#1a3d52;color:#fff}';document.head.append(style);root.after(section);document.getElementById('bv13-export').onclick=download;render();setInterval(()=>{if(!document.hidden)render()},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
