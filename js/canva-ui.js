/* Visual bridge only. The game's original mechanics and I-toggle stay in game.js. */
(function(){
  const md=document.getElementById('md');
  const oldHud=window.hud;
  if(typeof oldHud==='function'){
    window.hud=function(){
      oldHud();
      const st=document.getElementById('st');
      const gd=document.getElementById('gd');
      const s=(st&&st.textContent)||'';
      const g=(gd&&gd.textContent)||'';
      const m=s.match(/Nível\s+(\d+).*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?).*?ataque\s+(\d+(?:\.\d+)?).*?defesa\s+(\d+(?:\.\d+)?)/i);
      if(m){
        document.getElementById('ui-hp').textContent=m[2]+'/'+m[3];
        document.getElementById('ui-atk').textContent=m[4];
        document.getElementById('ui-def').textContent=m[5];
      }
      const pot=g.match(/Poções\s+(\d+)/i);
      if(pot) document.getElementById('ui-potions').textContent=pot[1];
    };
  }
  function sync(){
    if(!md)return;
    const open=getComputedStyle(md).display!=='none' && /inventário/i.test(md.textContent||'');
    md.classList.toggle('inventory-open',open);
    md.setAttribute('aria-hidden',open?'false':'true');
  }
  new MutationObserver(sync).observe(md,{attributes:true,childList:true,subtree:true});
  addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i'&&!e.repeat)setTimeout(sync,0)});
  setInterval(sync,200);
})();