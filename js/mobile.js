/* ============================================================================
 * js/mobile.js — controles de toque (inspirado na versão 10 enviada).
 * Esquerda: analógico de MOVIMENTO (liga as teclas W/A/S/D no conjunto K do jogo).
 * Direita: analógico de INTERAÇÃO. Arrastar mira (define a direção P.f); soltar
 *   ataca (Espaço) se houver monstro/cidadão no tile mirado, senão usa E (falar, cortar,
 *   minerar, pescar).
 * A interface só aparece em telas de toque/estreitas e depois que o personagem entrou no jogo.
 * ========================================================================== */
(function(){
  const ui=document.getElementById('mobile-ui');if(!ui)return;
  // Modais/painéis capturam o toque vertical para permitir rolagem sem mover o personagem.
  document.addEventListener('pointerdown',e=>{if(e.target.closest('#md,#settings-panel,#wmap'))e.stopPropagation()},true);
  const settingsButton=document.getElementById('settings'),settingsPanel=document.getElementById('settings-panel'),settingsClose=document.getElementById('settings-close'),mobileRadios=[...document.querySelectorAll('input[name="mobile-device"]')],mobilePreferenceKey='got_mobile_device';
  let storedMobilePreference=null;try{storedMobilePreference=localStorage.getItem(mobilePreferenceKey)}catch{}
  let mobileEnabled=storedMobilePreference===null?(matchMedia('(pointer: coarse)').matches||innerWidth<=900):storedMobilePreference==='yes';
  function setMobileMode(enabled){mobileEnabled=enabled;document.body.classList.toggle('mobile-controls-enabled',enabled);document.body.classList.toggle('no-mobile-controls',!enabled);mobileRadios.forEach(radio=>radio.checked=radio.value===(enabled?'yes':'no'));try{localStorage.setItem(mobilePreferenceKey,enabled?'yes':'no')}catch{}ui.style.visibility=P&&enabled?'visible':'hidden'}
  setMobileMode(mobileEnabled);
  settingsButton.addEventListener('click',()=>{settingsPanel.hidden=!settingsPanel.hidden;settingsButton.setAttribute('aria-expanded',String(!settingsPanel.hidden))});
  settingsClose.addEventListener('click',()=>{settingsPanel.hidden=true;settingsButton.setAttribute('aria-expanded','false')});
  mobileRadios.forEach(radio=>radio.addEventListener('change',()=>{if(radio.checked)setMobileMode(radio.value==='yes')}));
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!settingsPanel.hidden){settingsPanel.hidden=true;settingsButton.setAttribute('aria-expanded','false')}});
  const mv=document.getElementById('move-stick'),am=document.getElementById('aim-stick'),ln=document.getElementById('mobile-aim-line');
  const nM=mv.querySelector('.nub'),nA=am.querySelector('.nub'),DEAD=.22,TRAVEL=25;
  let mid=null,aid=null,aimV=null;
  /** Dispara uma tecla como se o jogador a apertasse (down=true) ou soltasse (false). */
  function key(k,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k}))}
  /** Posição do dedo relativa ao centro do analógico, limitada ao círculo de raio 1. */
  function vec(el,e){const r=el.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width*.38),dy=(e.clientY-r.top-r.height/2)/(r.height*.38);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}return[dx,dy]}
  /** Converte o analógico em 1 tecla WASD (eixo dominante); abaixo da zona morta solta todas. */
  function setMove(dx,dy){['w','a','s','d'].forEach(k=>K.delete(k));if(Math.hypot(dx,dy)<DEAD)return;if(Math.abs(dx)>Math.abs(dy))K.add(dx>0?'d':'a');else K.add(dy>0?'s':'w')}
  function moveDrag(e){if(e.pointerId!==mid)return;const[dx,dy]=vec(mv,e);nM.style.transform=`translate(${dx*TRAVEL}px,${dy*TRAVEL}px)`;setMove(dx,dy);e.preventDefault()}
  function moveEnd(e){if(e.pointerId!==mid)return;mid=null;nM.style.transform='';setMove(0,0)}
  mv.addEventListener('pointerdown',e=>{mid=e.pointerId;mv.setPointerCapture(e.pointerId);moveDrag(e);e.preventDefault()});
  mv.addEventListener('pointermove',moveDrag);mv.addEventListener('pointerup',moveEnd);mv.addEventListener('pointercancel',moveEnd);
  /** Mira: arrasta o analógico direito; mostra a linha dourada e guarda a direção cardinal. */
  function aimDrag(e){if(e.pointerId!==aid)return;const[dx,dy]=vec(am,e);nA.style.transform=`translate(${dx*TRAVEL}px,${dy*TRAVEL}px)`;if(Math.hypot(dx,dy)<.25)return;aimV=Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1];ln.style.display='block';ln.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;e.preventDefault()}
  /** Soltar: vira para a direção mirada e ataca (se houver alvo hostil à frente) ou interage. */
  function aimEnd(e){if(e.pointerId!==aid)return;aid=null;nA.style.transform='';ln.style.display='none';if(!P||S){aimV=null;return}
    if(aimV)P.f=aimV;aimV=null;const f=P.f||[0,1],x=P.x+f[0],y=P.y+f[1];
    if(mons.some(m=>m.x==x&&m.y==y)){key(' ',true);setTimeout(()=>key(' ',false),180)}else{key('e',true);key('e',false)}}
  am.addEventListener('pointerdown',e=>{aid=e.pointerId;am.setPointerCapture(e.pointerId);aimDrag(e);e.preventDefault()});
  am.addEventListener('pointermove',aimDrag);am.addEventListener('pointerup',aimEnd);am.addEventListener('pointercancel',aimEnd);
  ui.querySelectorAll('button[data-key]').forEach(button=>{const k=button.dataset.key;button.addEventListener('pointerdown',e=>{e.preventDefault();key(k,true);key(k,false)})});
  window.addEventListener('blur',()=>{moveEnd({pointerId:mid});setMove(0,0)});
  /** A cada 0,3 s: mostra os controles só durante o jogo; esconde os analógicos com o mapa aberto. */
  setInterval(()=>{ui.style.visibility=P&&mobileEnabled?'visible':'hidden';ui.classList.toggle('mapopen',typeof wmOpen==='function'&&wmOpen())},300);
})();
