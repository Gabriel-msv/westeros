/* Canva UI bridge: only presentation glue; gameplay remains in game.js. */
(function(){
  const md=document.getElementById('md');
  const originalHud=window.hud;
  if(typeof originalHud==='function'){
    window.hud=function(){
      originalHud();
      const nm=document.getElementById('nm'),def=document.getElementById('ui-def'),atk=document.getElementById('ui-atk'),hp=document.getElementById('ui-hp');
      const xp=document.getElementById('ui-xp'),w=document.getElementById('ui-weapon'),c=document.getElementById('ui-clothes'),p=document.getElementById('ui-potions'),st=document.getElementById('st'),gd=document.getElementById('gd');
      const m=(st?.textContent||'').match(/Nível\s+(\d+)\s*·\s*([\d.]+)\/([\d.]+)\s*vida\s*·\s*ataque\s+([\d.]+)\s*·\s*defesa\s+([\d.]+)/);
      if(m){if(hp)hp.textContent=m[2]+'/'+m[3];if(atk)atk.textContent=m[4];if(def)def.textContent=m[5];if(xp)xp.textContent=xp.textContent||'0/0'}
      const g=gd?.textContent||'',eq=g.match(/Poções\s+(\d+)/);if(p)p.textContent=eq?eq[1]:'0';
      const gear=g.match(/Poções\s+\d+\s*(.*?)\s*Peso/);if(gear){const parts=gear[1].split('·').map(x=>x.trim()).filter(Boolean);if(w)w.textContent=parts[0]||'—';if(c)c.textContent=parts[1]||'—'}
    };
  }
  function invState(){
    if(!md)return;
    const open=getComputedStyle(md).display!=='none' && /Inventário/i.test(md.textContent||'');
    md.classList.toggle('inventory-open',open);
    md.setAttribute('aria-hidden',open?'false':'true');
  }
  new MutationObserver(invState).observe(md,{attributes:true,childList:true,subtree:true});
  addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i'&&!e.repeat)setTimeout(invState,0)});
  setInterval(invState,250);
})();
