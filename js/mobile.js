/* ============================================================================
 * js/mobile.js — controles de toque (inspirado na versão 10 enviada).
 * Esquerda: analógico de MOVIMENTO (liga as teclas W/A/S/D no conjunto K do jogo).
 * Direita: analógico de INTERAÇÃO. Arrastar mira (define a direção P.f); soltar
 *   ataca (Espaço) se houver monstro/cidadão no tile mirado, senão usa E (falar, cortar,
 *   minerar, pescar).
 * Botões: E usar · Q poção · C cavalo · I inventário · M mapa · ⚔ atacar (segure para repetir).
 * Os botões enviam eventos de teclado sintéticos, reaproveitando o tratamento de teclas do game.js.
 * A interface só aparece em telas de toque/estreitas e depois que o personagem entrou no jogo.
 * ========================================================================== */
(function(){
  const ui=document.getElementById('mobile-ui');if(!ui)return;
  const mv=document.getElementById('move-stick'),am=document.getElementById('aim-stick'),ln=document.getElementById('mobile-aim-line');
  const nM=mv.querySelector('.nub'),nA=am.querySelector('.nub'),DEAD=.22,TRAVEL=38;
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
    if(mons.some(m=>m.x==x&&m.y==y)||CZ.some(c=>!c.in&&c.x==x&&c.y==y)){key(' ',true);setTimeout(()=>key(' ',false),180)}else{key('e',true);key('e',false)}}
  am.addEventListener('pointerdown',e=>{aid=e.pointerId;am.setPointerCapture(e.pointerId);aimDrag(e);e.preventDefault()});
  am.addEventListener('pointermove',aimDrag);am.addEventListener('pointerup',aimEnd);am.addEventListener('pointercancel',aimEnd);
  /** Botões de ação: data-key é a tecla enviada ao jogo. */
  ui.querySelectorAll('button[data-key]').forEach(b=>{const k=b.dataset.key;
    b.addEventListener('pointerdown',e=>{e.preventDefault();key(k,true);if(k!==' ')key(k,false)});
    if(k===' '){const up=()=>key(' ',false);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)}});
  window.addEventListener('blur',()=>{moveEnd({pointerId:mid});setMove(0,0)});
  /** A cada 0,3 s: mostra os controles só durante o jogo; esconde os analógicos com o mapa aberto. */
  setInterval(()=>{ui.style.visibility=P?'visible':'hidden';ui.classList.toggle('mapopen',typeof wmOpen==='function'&&wmOpen())},300);
})();
