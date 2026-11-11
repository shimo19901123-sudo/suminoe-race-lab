/* BOAT LAB v15: reliable presentation-only cleanup. No storage writes. */
(()=>{'use strict';
const HIDE='bv15-hidden';
function apply(){
 const main=document.querySelector('.app main');
 const home=document.getElementById('view-home');
 const top=document.getElementById('boatlab-v11');
 if(!main||!home||!top)return;
 if(!document.getElementById('bv15-css')){
  const css=document.createElement('style');css.id='bv15-css';
  css.textContent='.'+HIDE+'{display:none!important}#view-home.bv15-home{display:block!important}';
  document.head.appendChild(css);
 }
 // Undo the older v14 hiding, but only for the three chosen modules and their ancestors.
 const hunter=[...document.querySelectorAll('h1,h2,h3,h4')].find(e=>e.textContent.includes('高配当チャンスを探す'))?.closest('section')||null;
 const stats=document.getElementById('boatlab-v13');
 const keep=[top,stats,hunter].filter(Boolean);
 const paths=new Set([main,home]);
 for(const el of keep)for(let n=el;n;n=n.parentElement){paths.add(n);if(n===main)break;}
 for(const el of paths)el.classList.remove('bv14-hide',HIDE);
 // Keep old content in the DOM: automatic fetch, data entry and event listeners remain intact.
 function prune(parent){
  if(keep.includes(parent))return;
  for(const child of [...parent.children]){
   if(paths.has(child)){child.classList.remove('bv14-hide',HIDE);prune(child);}
   else if(child.tagName!=='SCRIPT')child.classList.add(HIDE);
  }
 }
 prune(main);
 // v14 may have hidden these before we ran.
 for(const el of keep)el.classList.remove('bv14-hide',HIDE);
 // Old analysis disclosure is intentionally hidden unless a TOP5 detail button is pressed.
 const more=document.getElementById('bv11-more');if(more)more.classList.add(HIDE);
 if(!top.dataset.bv15){top.dataset.bv15='1';top.addEventListener('click',e=>{
  if(!e.target.closest('.bv11-card button'))return;
  // Allow the original detail navigation to work without losing saved data.
  document.querySelectorAll('.'+HIDE+',.bv14-hide').forEach(el=>el.classList.remove(HIDE,'bv14-hide'));
  if(more)more.open=true;
 },true);}
 // Place TOP5 first and archived results after it; hunter, when available, precedes TOP5.
 if(hunter&&hunter.parentElement===home)home.insertBefore(hunter,top);
 if(stats&&stats.parentElement===home)top.after(stats);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
window.addEventListener('load',apply);
setTimeout(apply,1000);
})();
