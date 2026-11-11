/* BOAT LAB v14: clean display only. Existing predictions and storage untouched. */
(()=>{'use strict';
function apply(){
 const top=document.getElementById('boatlab-v11');if(!top)return;
 const hunter=[...document.querySelectorAll('h1,h2,h3,h4')].find(e=>e.textContent.includes('高配当チャンスを探す'))?.closest('section');
 const stats=document.getElementById('boatlab-v13');
 const main=document.querySelector('.app main');if(!main)return;
 const keep=[top,hunter,stats].filter(Boolean);
 const ancestors=new Set();for(const k of keep){for(let n=k;n&&n!==main;n=n.parentElement)ancestors.add(n)}
 const candidates=[...main.children];
 for(const child of candidates){if(!ancestors.has(child))child.classList.add('bv14-hide')}
 for(const parent of ancestors){if(parent===top||parent===hunter||parent===stats)continue;
  for(const child of [...parent.children])if(!ancestors.has(child))child.classList.add('bv14-hide');
 }
 // Old analyses remain accessible through the existing TOP5 detail button.
 const old=document.getElementById('bv11-more');if(old)old.classList.add('bv14-hide');
 if(!top.dataset.bv14){top.dataset.bv14='1';top.addEventListener('click',e=>{if(!e.target.closest('.bv11-card button'))return;document.querySelectorAll('.bv14-hide').forEach(n=>n.classList.remove('bv14-hide'));if(old)old.open=true;},true)}
 const style=document.getElementById('bv14-css')||document.createElement('style');style.id='bv14-css';style.textContent='.bv14-hide{display:none!important}';document.head.append(style);
 // Move priority sections to top, without deleting or rewriting source records.
 if(hunter&&hunter.parentElement===main)main.prepend(hunter);
 if(top.parentElement===main)main.insertBefore(top,hunter&&hunter.parentElement===main?hunter.nextSibling:main.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
setTimeout(apply,800);
})();
