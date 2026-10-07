/* ============================================================================
 * CRÔNICAS DE WESTEROS — js/game.js
 * Lógica principal. Ordem do arquivo: utilidades/ruído -> mundo (cidades, layouts,
 * estradas, gerador de tiles) -> dados (itens, monstros) -> estado -> contas/save
 * -> lojas -> combate -> cidadãos/guardas -> ações -> atualização -> desenho
 * -> HUD/minimapa -> mapa-múndi -> laço principal.
 * Depende de: js/assets.js (carregado antes). Controles de toque: js/mobile.js.
 * Os comentários /** ... *\/ acima de cada função/constante explicam o que fazem.
 * ========================================================================== */

const $=i=>document.getElementById(i),cv=$('g'),cx=cv.getContext('2d'),T=32;
let zoomTiles=10;
/** H(x,y,seed): hash determinístico em [0,1) usado em variações visuais e geração. */
const H=(x,y,s=0)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1442695041);h=Math.imul(h^h>>>13,1274126177);h^=h>>>16;return(h>>>0)/4294967296};
const sm=t=>t*t*(3-2*t);
/** Ruído de valor suave (value noise) para terreno. */
const VN=(x,y,s)=>{const i=Math.floor(x),j=Math.floor(y),u=sm(x-i),v=sm(y-j),a=H(i,j,s),b=H(i+1,j,s),c=H(i,j+1,s),d=H(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
/* ===== mapa ===== */
// O mapa, cidades, rios, estradas, casas rurais, árvores e o minimapa/mundo de Westeros
// ficam em js/mapa.js para facilitar edição sem alterar a gameplay.
/* ===== dados ===== */
/** Armas (n nome, a ataque, c custo, t tipo/proficiência, q proficiência mínima, m durabilidade). */
const W=[{n:'Punhos',a:0,t:'unarmed',q:0,m:100},{n:'Adaga',a:2,c:60,t:'sword',q:0,m:80},{n:'Espada Longa',a:5,c:180,t:'sword',q:10,m:100},{n:'Espada de Aço',a:9,c:500,t:'sword',q:30,m:120},{n:'Aço Valiriano',a:16,c:2500,t:'sword',q:50,m:200}];
/** Armaduras (d defesa, c custo, m durabilidade). */
const A=[{n:'Roupas',d:0,m:100},{n:'Gibão de Couro',d:1,c:70,m:100},{n:'Cota de Malha',d:3,c:220,m:120},{n:'Armadura de Placas',d:6,c:650,m:150},{n:'Armadura Valiriana',d:10,c:2800,m:200}];
/** Escudos; HE são capacetes; IT agrupa os catálogos por slot. */
const SH=[{n:'(nenhum)',d:0,m:100},{n:'Escudo de Madeira',d:1,c:40,m:80},{n:'Escudo de Ferro',d:3,c:160,m:120}],HE=[{n:'(nenhum)',d:0,m:100},{n:'Capuz de Couro',d:1,c:30,m:80},{n:'Elmo de Ferro',d:2,c:120,m:100}],IT={w:W,a:A,s:SH,hd:HE},EQUIP_OWNERS={a:'ownedArmor',s:'ownedShields',hd:'ownedHelmets'},SL=['w','a','s','hd','b','g','c','r1','r2','am'];
const TOOLS={
 'Machado de Corte':{slot:'b',price:[40,120,350],weight:3,sprite:'axe',hits:[3,2,1],tiers:['Madeira velha e ferrugem','Aço comum','Aço fino polido']},
 Picareta:{slot:'g',price:[60,180,450],weight:3,sprite:'pickaxe',tiers:['Pedra e improviso','Aço comum','Aço fino e obsidiana']},
 'Vara de Pescar':{slot:'c',price:[35,100,260],weight:1,sprite:'fishing_rod',tiers:['Galho simples','Madeira tratada','Madeira fina e anzol de bronze']}
},toolLevel=k=>TOOLS[k]?.slot?P[TOOLS[k].slot]||0:0;
/** Preço de venda por unidade dos itens de loot, minérios e peixe. */
const LT={'Pele de Urso':30,'Presa de Mamute':60,'Osso de Gigante':90,'Osso Amaldiçoado':100,'Minério de Ferro':18,'Minério de Cobre':12,'Minério de Prata':40,Peixe:8,'Pele de Lobo':8,'Adaga Enferrujada':15,'Coração Gelado':45,'Vidro de Dragão':220,'Escama de Dragão':160,'Madeira':5,Trigo:4,Carne:10,'Relíquia Antiga':120};
/** Monstros e inimigos regionais: n nome, hp, d dano, xp, g faixa de ouro, l loot, sp velocidade, big=sprite 64x64. */
const MT={
 lobo:{n:'Lobo',hp:30,d:4,xp:22,g:[2,8],l:'Pele de Lobo',sp:.5},
 urso:{n:'Urso',hp:70,d:8,xp:55,g:[6,18],l:'Pele de Urso',sp:.5},
 auroque:{n:'Auroque',hp:85,d:6,xp:50,g:[4,14],l:'Carne',sp:.42},
 lagarto_leao:{n:'Lagarto-Leão',hp:80,d:10,xp:70,g:[8,22],l:'Pele de Urso',sp:.46},
 band:{n:'Saqueador',hp:45,d:7,xp:35,g:[10,35],l:'Adaga Enferrujada',sp:.45},
 criminoso:{n:'Criminoso',hp:50,d:8,xp:40,g:[12,38],l:'Adaga Enferrujada',sp:.45},
 renegado:{n:'Desertor',hp:60,d:9,xp:48,g:[14,40],l:'Adaga Enferrujada',sp:.48},
 montanhes:{n:'Montanhês',hp:70,d:11,xp:58,g:[15,45],l:'Adaga Enferrujada',sp:.5},
 selvagem:{n:'Selvagem',hp:75,d:12,xp:65,g:[12,35],l:'Pele de Lobo',sp:.52},
 lobog:{n:'Lobo Gigante',hp:105,d:11,xp:95,g:[10,30],l:'Pele de Lobo',sp:.52,big:1},
 urso_gigante:{n:'Urso Gigante',hp:165,d:15,xp:145,g:[18,55],l:'Pele de Urso',sp:.65,big:1},
 mamute:{n:'Mamute',hp:270,d:19,xp:230,g:[30,95],l:'Presa de Mamute',sp:.8,big:1},
 gigante:{n:'Gigante',hp:430,d:29,xp:430,g:[60,165],l:'Osso de Gigante',sp:.9,big:1},
 wight:{n:'Morto-Vivo Camponês',hp:75,d:10,xp:70,g:[5,20],l:'Coração Gelado',sp:.58},
 wight_soldado:{n:'Morto-Vivo Soldado',hp:110,d:14,xp:110,g:[10,30],l:'Coração Gelado',sp:.55},
 wight_nobre:{n:'Morto-Vivo Nobre',hp:130,d:16,xp:140,g:[25,60],l:'Coração Gelado',sp:.52},
 gzumbi:{n:'Gigante Zumbi',hp:500,d:32,xp:520,g:[60,200],l:'Osso Amaldiçoado',sp:.85,big:1},
 walker:{n:'Caminhante Branco',hp:180,d:20,xp:250,g:[40,100],l:'Vidro de Dragão',sp:.5}
};
/** Cor de cada casa (Stark, Lannister, Targaryen, Baratheon). */
const HC={S:'#8d9bab',L:'#b3202a',T:'#2b2b33',B:'#e0b020'};
/** Cor de reserva de cada id de tile (0-19). */
const COL=['#2a5f8f','#d9c78a','#5f9146','#5f9146','#e8eef2','#7b7f86','#a48a5e','#9aa3b0','#b9b3a4','#8a5a3c','#dfe8ee','#6a6e76','#8b8f98','#5d6068','#a39e92','#7a5a36','#8a6a3c','#6a4a32','#cfe6f2','#8a6a3c'];
COL[20]='#6fb7c9';COL[21]='#2f7fb0';
/* ===== estado ===== */
/** Estado global: relógio do jogo, banner da cidade, alerta dos guardas (al/alt). */
const G={t:0,bn:0,bt:''},K=new Set(),mons=[],CZ=[],worldDrops=[],fxs=[],attackFx=[],logs=[];let P=null,user=null,S=null;
/** Vida máxima = 100 + 15/nível (+20 Stark). */
const mh=()=>100+(P.lvl-1)*5+(P.h=='S'?20:0),nx=()=>Math.round(60*P.lvl**1.7);
/** Cidade mais próxima do jogador e a distância. */
const nearestTown=()=>TW.reduce((a,t)=>{const d=Math.hypot(P.x-t.x,P.y-t.y);return !a||d<a.d?{t,d}:a},null);
/** Ataque total = (3 + arma + 1,2*nível + bônus Targaryen) * proficiência, -20% se sobrecarregado. */
const atkV=()=>{const w=W[P.w];return(3+w.a+Math.floor(P.lvl*.8)+(P.h=='T'?3:0))*(1+(P.pf[w.t]||0)/100)*(w.t=='unarmed'?.8:.95)*(ov()?.8:1)},defV=()=>A[P.a].d+SH[P.s].d+HE[P.hd].d+(P.h=='B'?2:0);
/** Gasta a durabilidade de um slot; quebra em 0%. */
const wear=t=>{if(!P[t])return;const it=IT[t][P[t]];P.du[t]-=100/it.m;if(t=='w')P.wd[P.w]=P.du.w;if(P.du[t]<=0){msg(it.n+' quebrou!','#ff8a80');if(t=='w'){P.wd[P.w]=0;P.w=0;P.du.w=P.wd[0]??100}else{P[t]=0;P.du[t]=100}}};
/** Escreve uma linha colorida no log do jogo. */
function msg(s,c='#ebe7dc'){logs.push(`<div style="color:${c}">${s}</div>`);if(logs.length>6)logs.shift();$('log').innerHTML=logs.join('')}
/** Cria texto flutuante (dano, cura) numa posição do mundo. */
const fx=(x,y,t,c)=>fxs.push({x,y,t,c,l:1});
/* ===== contas e save ===== */
/** Chave do localStorage das contas (got_contas_v2, migra da v1). */
const AK='got_contas_v2',ld=()=>{try{return JSON.parse(localStorage.getItem(AK)||localStorage.getItem('got_contas_v1'))||{}}catch{return{}}},sv=o=>{try{localStorage.setItem(AK,JSON.stringify(o));return 1}catch{return 0}};
/** Hash SHA-256 da senha (nunca guardamos a senha pura). */
async function hs(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('got:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return btoa(unescape(encodeURIComponent(s)))}}
/** Campos do personagem que entram no save. */
const SK=['name','x','y','hp','lvl','xp','gold','inv','w','a','s','hd','b','g','c','r1','r2','am','du','wd','ow','ownedArmor','ownedShields','ownedHelmets','activeTool','pf','rp','mw','h','home','kills','pt','rt','lt','playTime'];
/** Salva o personagem em localStorage dentro da conta (campos listados em SK). */
function save(){if(!P||!user)return;const a=ld();if(!a[user])return;const o={};SK.forEach(k=>o[k]=P[k]);o.horse=!!P.horse;o.mounted=!!P.mounted;o.cut=[...cut];o.v=10;a[user].s=o;sv(a)}
/** Tela de login: entra ou cria conta (nome, cidade inicial, casa) e chama start(). */
async function auth(reg){const u=$('u').value.trim().toLowerCase(),pw=$('pw').value,e=$('err');if(u.length<3||pw.length<4){e.textContent='Use ao menos 3 letras no nome e 4 na senha.';return}
 const a=ld(),h=await hs(pw);
 if(reg){if(a[u]){e.textContent='Esse nome já existe. Entre ou escolha outro.';return}const hh=$('hs').value,ci=+$('cs').value,nm=$('cn').value.trim();if(nm.length<3||nm.length>16){e.textContent='Nome do personagem: 3 a 16 caracteres.';return}const c=TW[ci];a[u]={h,s:{name:nm,x:c.x,y:c.y+2,hp:100+(hh=='S'?20:0),lvl:1,xp:0,gold:50+(hh=='L'?250:0),inv:{pot:2},w:0,ow:[0],wd:{0:100},a:0,h:hh,home:ci,kills:0,pt:0,horse:false,mounted:false,cut:[],v:10}};if(!sv(a)){e.textContent='Não foi possível salvar neste navegador.';return}}
 else{if(a[u]&&typeof a[u].h==='string'&&a[u].h.length===1){a[u].h=h;sv(a);auth.rep=1}
  if(!a[u]||a[u].h!=h){e.textContent='Usuário ou senha incorretos.';return}}
 worldDrops.length=0;start(u,a[u].s);if(auth.rep){auth.rep=0;msg('Conta antiga reparada: esta senha agora é a da sua conta.','#e2b04a')}}
/** Inicia a sessão: preenche padrões faltantes do save (migração), zera monstros/cidadãos e mostra o jogo. */
function start(u,s){user=u;if(u!=='sudo')zoomTiles=10;P={...s,inv:{...s.inv}};if(typeof isLand==='function'&&!isLand(P.x,P.y)){const home=Number.isInteger(P.home)?TW[P.home]:null;if(home){P.x=home.x;P.y=home.y+2;}}P.ow=[...new Set([0,P.w,...(Array.isArray(P.ow)?P.ow:[])].filter(i=>Number.isInteger(i)&&i>=0&&i<W.length))];P.wd={...(P.wd||{})};if(P.wd[P.w]===undefined)P.wd[P.w]=P.du&&P.du.w!==undefined?P.du.w:100;P.name=P.name||u;SL.forEach(k=>P[k]|=0);P.du={...Object.fromEntries(SL.map(k=>[k,100])),...P.du};P.du.w=P.wd[P.w];P.pf={sword:0,axe:0,bow:0,unarmed:20,woodcut:10,fish:0,cook:0,repair:0,mining:0,...P.pf};P.rp={...P.rp};P.mw=P.mw||100;const HOME={S:3,L:11,T:1,B:21},SP={S:[TW[3].x,TW[3].y+2],L:[TW[11].x,TW[11].y+2],T:[TW[1].x,TW[1].y+2],B:[TW[21].x,TW[21].y+2]};const legacyCastle=Math.abs(P.x)<=3&&P.y>=-55&&P.y<=-49;if(!P.v&&legacyCastle&&HOME[P.h]!==undefined){P.home=HOME[P.h];P.x=SP[P.h][0];P.y=SP[P.h][1];P.dx=P.x;P.dy=P.y}if(u==='sudo'){P.gold=999999999;P.w=W.length-1;P.ow=[...new Set([...P.ow,P.w])];P.wd[P.w]=100;P.du.w=100;P.a=A.length-1;P.lvl=30;P.xp=0;P.hp=mh();P.horse=true;P.mounted=true;P.inv={pot:99,'Vidro de Dragão':99,'Escama de Dragão':99,'Pele de Lobo':99,'Madeira':99};}for(const[k,def]of Object.entries(TOOLS)){P[def.slot]=Math.max(0,Math.min(3,Math.floor(P[def.slot])));if(P.inv[k])P[def.slot]=Math.max(1,P[def.slot]);if(P[def.slot])P.inv[k]=Math.max(1,P.inv[k]||0)}cut.clear();clearTreeAnchorCache();(s.cut||[]).forEach(k=>cut.add(k));tc.clear();invalidateTerrain();Object.assign(P,{dx:P.x,dy:P.y,mv:0,cd:0,f:[0,1],tw:-1,horse:!!P.horse,mounted:!!P.mounted,toolAction:null});mons.length=0;CZ.length=0;G.al=0;S=null;$('md').style.display='none';$('inventory-panel').style.display='flex';setInventoryOpen(true);$('hud').style.display='block';$('top-actions').style.display='flex';$('lgn').style.display='none';$('err').textContent='';logs.length=0;msg('Bem-vindo. Mova-se com <span class=k>WASD</span>, ataque com <span class=k>Espaço</span>, fale com NPCs e corte árvores com <span class=k>E</span>, cure-se com <span class=k>Q</span>, inventário em <span class=k>I</span>.','#8fd0f0');msg('Cidades são seguras. Cuidado com saqueadores nas estradas.')}
$('bi').onclick=()=>auth(0);$('br').onclick=()=>auth(1);
$('lgn').addEventListener('keydown',e=>{if(e.key!='Enter'||e.target.tagName!='INPUT')return;const fields=[...$('lgn').querySelectorAll('input,select')],next=fields.indexOf(e.target)+1;if(next<fields.length){e.preventDefault();fields[next].focus()}});
$('out').onclick=()=>{save();P=null;user=null;$('lgn').style.display='flex';$('inventory-panel').style.display='none';$('hud').style.display='none';$('top-actions').style.display='none'};
function setInventoryOpen(open){const panel=$('inventory-panel'),toggle=$('inventory-toggle');panel.classList.toggle('inventory-collapsed',!open);document.body.classList.toggle('inventory-collapsed',!open);$('mobile-ui').classList.toggle('inventory-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.title=open?'Recolher inventário':'Abrir inventário';toggle.querySelector('.inventory-arrow').textContent=open?'▲':'▼'}
function toggleInventory(){setInventoryOpen($('inventory-panel').classList.contains('inventory-collapsed'))}
$('inventory-toggle').onclick=toggleInventory;
setInterval(save,8000);addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
/* ===== lojas ===== */
/** Monta uma linha HTML de loja (texto + botão). */
const row=(t,f,b,d)=>`<div class=r><span>${t}</span><button onclick="${f}"${d?' disabled':''}>${b}</button></div>`;
/** Peso por unidade dos itens (padrão 1 kg); wt() soma o inventário, ov() diz se está sobrecarregado. */
const IW={pot:.5,Madeira:.3,'Minério':2,Carne:1,'Minério de Ferro':2,'Minério de Cobre':2,'Minério de Prata':2,Peixe:1,Trigo:.2,'Machado de Corte':3,Picareta:3,'Vara de Pescar':1},wt=()=>Object.keys(P.inv).reduce((a,k)=>a+P.inv[k]*(IW[k]??1),0),ov=()=>user!=='sudo'&&wt()>P.mw;
/** Multiplicador de preço por região; sp() é o valor de venda de um stack. */
const REG={'Terras da Coroa':1.1,'O Norte':1.2,'A Campina':.9,'Terras do Oeste':1,'Vale de Arryn':1.05,'Terras Fluviais':.95,'Terras da Tempestade':1,'Dorne':1.1,'Ilhas de Ferro':1.15,'Além da Muralha':1.4},sp=k=>Math.round(LT[k]*P.inv[k]*((/^Minério/.test(k)&&['Vale de Arryn','Terras do Oeste'].includes(TW[S.ti].r))||(k=='Peixe'&&['Ilhas de Ferro','Terras da Coroa'].includes(TW[S.ti].r))?1.3:1)),tool=k=>{const level=toolLevel(k),def=TOOLS[k],cost=pc(def.price[0]),tier=level?` · Nível ${level}: ${def.tiers[level-1]}`:'';return row(`${k}${tier||` — ${def.tiers[0]}`} — ${cost}g`,`buyT('${k}')`,level?'Possui':P.gold<cost?'Ouro insuficiente':'Comprar',!!level||P.gold<cost)};
/** Nomes dos slots exibidos; pm() é o fator de preço (reputação x região). */
const SN={w:'Arma',a:'Armadura',s:'Escudo',hd:'Capacete'},pm=()=>{const r=P.rp[S.ti]||0;return(r>=51?.6:r>=1?.8:r<=-50?1.5:1)*(REG[TW[S.ti].r]||1)},pc=c=>Math.round(c*pm()),rp1=()=>{P.rp[S.ti]=Math.min(100,(P.rp[S.ti]||0)+1)};
/** Desenha o painel central: inventário (k=inv), mercador (m), ferreiro (f) ou estalajadeiro (e). */
function shop(){const n=S;let h=`<h3>${n.n}</h3>`;
 if(n.k=='inv'){h+=`<div class=m>Peso ${wt().toFixed(1)}/${P.mw} kg${ov()?' — <b style="color:#ff8a80">sobrecarregado</b> (movimento −30%, ataque −20%)':''}</div>`;const ks=Object.keys(P.inv).filter(k=>P.inv[k]);h+=ks.length?ks.map(k=>`<div class=r><span>${k} ×${P.inv[k]}</span><span class=m>${(P.inv[k]*(IW[k]??1)).toFixed(1)} kg</span></div>`).join(''):'<div class=m>Vazio.</div>';h+='<h3 style="margin-top:8px">Equipado</h3>';for(const t in SN){const it=IT[t][P[t]];h+=`<div class=r><span>${SN[t]}: ${it.n}</span><span class=m>${P[t]?Math.ceil(P.du[t])+'%':'—'}</span></div>`}}
 else{const pr=pm(),pt=pr<1?' · preços −'+Math.round((1-pr)*100)+'%':pr>1?' · preços +'+Math.round((pr-1)*100)+'%':'';h+=`<div class=m>Ouro: ${P.gold}g${pt}</div>`;
  if(n.k=='m'){h+=row(`Poção de Cura (+45 vida) — ${pc(25)}g`,"buy('pot')",'Comprar')+`<div class=m>Você tem ${P.inv.pot||0}. Use com Q.</div>`;for(const k of Object.keys(TOOLS))h+=tool(k);for(const k in LT)if(P.inv[k])h+=row(`${k} ×${P.inv[k]} — ${sp(k)}g`,`sell('${k}')`,'Vender tudo')}
  if(n.k=='f'){const m=Math.min(4,n.ti+1);for(let i=1;i<=m;i++){const it=W[i],lk=P.pf[it.t]<it.q,owned=P.ow.includes(i);h+=row(`${it.n} (ataque +${it.a}) — ${pc(it.c)}g`,`eq('w',${i})`,P.w==i?'Equipado':owned?'Equipar':lk?`Requer ${it.t} ${it.q}`:'Comprar',P.w==i||(!owned&&lk))}
   for(const t of['a','s','hd'])for(let i=1;i<IT[t].length&&i<=(t=='a'?m:2);i++){const it=IT[t][i],owned=ownedGear(t).includes(i);h+=row(`${it.n} (defesa +${it.d}) — ${pc(it.c)}g`,`eq('${t}',${i})`,P[t]==i?'Equipado':owned?'Equipar':'Comprar',P[t]==i||(!owned&&P.gold<pc(it.c)))}
   for(const t in SN)if(P[t]&&P.du[t]<99){const it=IT[t][P[t]];h+=row(`Reparar ${it.n} (${Math.ceil(P.du[t])}%) — ${pc(Math.ceil(it.c*.2))}g`,`fix('${t}')`,'Reparar')}
   for(const k of Object.keys(TOOLS)){const level=toolLevel(k),def=TOOLS[k];if(level==3)h+=row(`${k} N3 · ${def.tiers[2]}`,'','Nível máximo',true);else if(level){const next=level+1,cost=pc(def.price[level]);h+=row(`${k} N${level} → N${next} · ${def.tiers[next-1]} — ${cost}g`,`upgradeTool('${k}')`,P.gold<cost?'Ouro insuficiente':`Melhorar · ${cost}g`,P.gold<cost)}}h+=`<div class=m>Machado: N1 ${TOOLS['Machado de Corte'].hits[0]} golpes, N2 ${TOOLS['Machado de Corte'].hits[1]}, N3 ${TOOLS['Machado de Corte'].hits[2]}. Picaretas extraem mais minério por golpe; varas reduzem o intervalo e aumentam a chance de pesca.</div><div class=m>As ferramentas são vendidas pelo mercador e aprimoradas aqui no ferreiro.</div>`}
  if(n.k=='pr'){h+=row('Receber a bênção: recuperar toda a vida — grátis','rest()','Rezar')+'<div class=m>O sacerdote cuida do santuário.</div>'}
  if(n.k=='e'){h+=row('Descansar e recuperar toda a vida — grátis','rest()','Descansar')+`<div class=m>Ao entrar numa cidade, ela vira seu ponto de retorno se você cair em combate.</div>`}}
 $('md').innerHTML=h+'<div style="text-align:right;margin-top:8px"><button onclick="closeShop()">Fechar</button></div>';$('md').style.display='block'}
/** Fecha o painel central e salva. */
function closeShop(){S=null;$('md').style.display='none';save()}
/** Compra uma poção (checa ouro, peso e preço com reputação/região). */
function buy(k){const c=pc(25);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');if(wt()+.5>P.mw&&user!=='sudo')return msg('Você não aguenta mais peso.','#ff8a80');P.gold-=c;P.inv.pot=(P.inv.pot||0)+1;rp1();shop()}
/** Vende todo o stack de um item de LT no mercador atual. */
function sell(k){P.gold+=sp(k);msg(`Vendeu ${P.inv[k]}× ${k}.`,'#e2b04a');delete P.inv[k];rp1();shop();save()}
/** Compra a ferramenta básica; os níveis seguintes são melhorias permanentes no ferreiro. */
function buyT(k){const def=TOOLS[k];if(!def)return msg('Ferramenta inválida.','#ff8a80');if(toolLevel(k)||P.inv[k])return msg('Você já possui '+k+'.','#9aa3b2');const c=pc(def.price[0]);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');if(wt()+def.weight>P.mw&&user!=='sudo')return msg('Você não aguenta mais peso.','#ff8a80');P.gold-=c;P[def.slot]=1;P.inv[k]=1;rp1();msg('Comprou '+k+' nível 1.','#e2b04a');shop();save()}
/** Aprimora a ferramenta atual para o próximo nível no ferreiro. */
function upgradeTool(k){const def=TOOLS[k],level=toolLevel(k);if(!def||!level)return msg('Você ainda não possui essa ferramenta.','#ff8a80');if(level>=3)return msg(k+' já está no nível máximo.','#9aa3b2');const c=pc(def.price[level]);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P[def.slot]=level+1;rp1();msg('Nível '+(level+1)+' desbloqueado para '+k+'.','#e2b04a');shop();save()}
/** Compra e equipa uma peça (arma, armadura, escudo, capacete) com durabilidade 100%. */
function eq(t,i){const it=IT[t][i],owned=t=='w'?P.ow.includes(i):ownedGear(t).includes(i),c=pc(it.c);if(t=='w'&&!owned&&P.pf[it.t]<it.q)return msg(`Requer ${it.t} ${it.q}.`,'#ff8a80');if(!owned&&P.gold<c)return msg('Ouro insuficiente.','#ff8a80');if(t=='w'){if(!owned){P.gold-=c;P.ow.push(i);P.wd[i]=100;rp1()}P.w=i;P.du.w=P.wd[i]??100;P.activeTool=null}else{if(!owned){P.gold-=c;ownedGear(t).push(i);rp1()}P[t]=i;P.du[t]=P.du[t]??100}inventorySignature='';msg('Equipou '+it.n+'.','#e2b04a');shop();hud();save()}
/** Repara a peça equipada de um slot por 20% do preço. */
function fix(t){const c=pc(Math.ceil(IT[t][P[t]].c*.2));if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P.du[t]=100;if(t=='w')P.wd[P.w]=100;P.pf.repair=Math.min(100,P.pf.repair+.5);msg('Equipamento reparado.','#e2b04a');shop();save()}
/** Buffer do código secreto. */
const CHT=[];
const CHEAT_WORDS=['sudo','gold'];let cheatBuffer='',cheatBufferAt=0;
/** Código secreto 676767 (em 2,5 s): melhores itens, ferramentas e cavalo. */
function cheat(k){const n=performance.now();CHT.push([k,n]);while(CHT.length&&(n-CHT[0][1]>2500||CHT.length>6))CHT.shift();if(CHT.map(c=>c[0]).join('')=='676767'){CHT.length=0;P.w=4;P.a=4;P.s=2;P.hd=2;SL.forEach(t=>P.du[t]=100);P.horse=true;P.mounted=true;for(const t of['Machado de Corte','Picareta','Vara de Pescar'])P.inv[t]=1;P.inv.pot=(P.inv.pot||0)+10;msg('Código secreto: melhores itens e um cavalo!','#ffd24a');fx(P.x,P.y,'★','#ffd24a');save()}}
function activateCheat(command){if(command==='gold'){P.gold=999999999;msg('Comando gold: ouro máximo concedido.','#ffd24a');fx(P.x,P.y,'999999999g','#ffd24a');hud();save();return}P.sudoSpeed=!P.sudoSpeed;P.mv=0;$('btn-creator').hidden=!P.sudoSpeed&&user!=='sudo';if(!P.sudoSpeed&&creatorMode)creatorSetMode(false);msg(P.sudoSpeed?'Modo SUDO ativado: 10×, ou 20× com Shift. O modo criador está disponível.':'Modo SUDO desativado.','#ffd24a');fx(P.x,P.y,P.sudoSpeed?'⚡':'✓','#ffd24a')}
/** Estalajadeiro: recupera toda a vida. */
function rest(){P.hp=mh();msg('Você descansou e se sente renovado.','#9f9');save()}
/* ===== jogo ===== */
/** Diz se um tile é pisável: não sólido e sem NPC, monstro ou cidadão. */
const free=(x,y)=>!SOL.has(tile(x,y))&&!treeSolid(x,y)&&!NP.some(n=>n.x==x&&n.y==y)&&!mons.some(m=>m.x==x&&m.y==y)&&!CZ.some(c=>!c.in&&c.x==x&&c.y==y)&&!RN.some(r=>r.x==x&&r.y==y);
function walkableWorldPosition(x,y,town){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x>=19990||!isLand(x,y)||mountainAt(x,y))return false;
 const t=tile(x,y);
 return !SOL.has(t)&&t!==17&&!treeSolid(x,y)&&(!town||inTown(x,y)===town)&&free(x,y);
}
function findSafeWorldPosition(x,y,town){
 if(walkableWorldPosition(x,y,town))return[x,y];
 for(let radius=1;radius<=12;radius++){
  const candidates=[];
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;
   const px=x+dx,py=y+dy;
   if(!walkableWorldPosition(px,py,town))continue;
   const t=tile(px,py),score=Math.hypot(dx,dy)+(t===6?-1.5:0);
   candidates.push({x:px,y:py,score});
  }
  if(candidates.length){candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);return[candidates[0].x,candidates[0].y]}
 }
 return town?findTownSpawn(town):null;
}
function findTownSpawn(town){
 if(!town)return null;
 const radius=Math.max(town.rx,town.ry)+2,candidates=[];
 for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
  const x=town.x+dx,y=town.y+dy;
  if(inTown(x,y)!==town||!walkableWorldPosition(x,y,town))continue;
  const t=tile(x,y),score=Math.hypot(dx,dy)+(t===6?-1.5:0);
  candidates.push({x,y,score});
 }
 candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
 return candidates.length?[candidates[0].x,candidates[0].y]:null;
}
const _startWithSafeSpawn=start;
start=function(u,s){
 _startWithSafeSpawn(u,s);
 creatorMode=false;creatorPainting=false;creatorUndo.length=0;creatorRedo.length=0;document.body.classList.remove('creator-mode');
 creatorLoad();
 $('btn-creator').hidden=u!=='sudo'&&!P.sudoSpeed;$('creator-bar').hidden=true;
 let changed=false;
 if(P.x<19990&&!walkableWorldPosition(P.x,P.y)){
  const town=inTown(P.x,P.y)||(Number.isInteger(P.home)&&TW[P.home]?TW[P.home]:null);
  const position=findSafeWorldPosition(P.x,P.y,town)||(town&&findTownSpawn(town));
  if(position){[P.x,P.y]=position;P.dx=P.x;P.dy=P.y;P.mv=0;changed=true}
 }
 if(P.x>=19990&&Array.isArray(P.rt)&&!walkableWorldPosition(P.rt[0],P.rt[1])){
  const town=inTown(P.rt[0],P.rt[1])||(Number.isInteger(P.home)?TW[P.home]:null);
  const position=findSafeWorldPosition(P.rt[0],P.rt[1],town);
  if(position){P.rt=position;changed=true}
 }
 if(changed)save();
};
const isWaterTile=t=>t===0||t===7||t===20||t===21;

const CREATOR_KEY='westeros_sudo_builds_v1';
const CREATOR_ITEMS=[
 {id:'block:1',label:'Areia',tile:1,sprite:'areia'},{id:'block:2',label:'Grama',tile:2,sprite:'grama'},{id:'block:4',label:'Neve',tile:4,sprite:'neve'},
 {id:'block:5',label:'Rocha',tile:5,sprite:'montanha'},{id:'block:6',label:'Estrada',tile:6,sprite:'estrada'},{id:'block:8',label:'Pedra clara',tile:8,sprite:'palA'},
 {id:'block:9',label:'Tijolo',tile:9,sprite:'tijolom'},{id:'block:11',label:'Minério',tile:11,sprite:'minerio'},{id:'block:12',label:'Alvenaria',tile:12,sprite:'pedregulho'},
 {id:'block:13',label:'Pedregulho',tile:13,sprite:'pedregulho'},{id:'block:14',label:'Piso de madeira',tile:14,sprite:'tabuas'},{id:'block:15',label:'Portão de madeira',tile:15,sprite:'tabuas'},
 {id:'block:16',label:'Ponte de madeira',tile:16,sprite:'tabuas'},{id:'block:16:porto',label:'Madeira de porto',tile:16,material:'porto',sprite:'porto'},
 {id:'block:9:telhas',label:'Telhas',tile:9,material:'telhas',sprite:'telhas'},{id:'block:18',label:'Gelo',tile:18,sprite:'neve'},
 {id:'tree:carvalho',label:'Carvalho',tree:'carvalho',sprite:'carvalho'},{id:'tree:pinheiro',label:'Pinheiro',tree:'pinheiro',sprite:'pinheiro'},
 {id:'tree:palmeira',label:'Palmeira',tree:'palmeira',sprite:'palmeira'},{id:'tree:cacto',label:'Cacto',tree:'cacto',sprite:'cacto'}
];
let creatorMode=false,creatorPainting=false,creatorTool='paint',creatorSelection='block:12',creatorUndo=[],creatorRedo=[],creatorStroke=null,creatorLastCell='';
function creatorKey(x,y){return`${x},${y}`}
function creatorStore(){if(!window.creativeEdits)return;try{localStorage.setItem(CREATOR_KEY,JSON.stringify([...window.creativeEdits]))}catch{msg('Não foi possível salvar as construções neste navegador. Salve o arquivo JSON.','#ff8a80')}}
function creatorLoad(data){const edits=window.creativeEdits;if(!edits)return;edits.clear();let source=data;try{if(!source)source=JSON.parse(localStorage.getItem(CREATOR_KEY)||'[]')}catch{source=[]}
 if(!Array.isArray(source))return;
 for(const pair of source){if(!Array.isArray(pair)||pair.length!==2||!/^(-?\d+),(-?\d+)$/.test(pair[0]))continue;const[,x,y]=pair[0].match(/^(-?\d+),(-?\d+)$/),edit=pair[1];if(Math.abs(Number(x))>50000||Math.abs(Number(y))>50000||!edit||!['block','tree'].includes(edit.type)||edit.type==='block'&&!CREATOR_ITEMS.some(item=>item.tile===edit.tile&&(item.material||undefined)===(edit.material||undefined))||edit.type==='tree'&&(!CREATOR_ITEMS.some(item=>item.tree===edit.tree)||edit.size!==(edit.tree==='cacto'?1:3)))continue;edits.set(pair[0],edit)}
 clearTreeAnchorCache?.();invalidateTerrain?.();creatorUpdateCount();
}
function creatorUpdateCount(){const count=window.creativeEdits?.size||0;$('creator-count').textContent=`${count} ${count===1?'peça':'peças'}`;$('creator-undo').disabled=!creatorUndo.length;$('creator-redo').disabled=!creatorRedo.length}
function creatorPalette(){const palette=$('creator-palette');palette.replaceChildren();for(const item of CREATOR_ITEMS){const button=document.createElement('button');button.type='button';button.className='creator-swatch';button.dataset.item=item.id;button.title=item.label;button.setAttribute('aria-label',item.label);const icon=document.createElement('img');icon.src=ASSET_MANIFEST[item.sprite];icon.alt='';icon.draggable=false;icon.addEventListener('error',()=>{icon.remove();button.classList.add('creator-swatch-missing');button.textContent=item.label.slice(0,1)},{once:true});button.append(icon);if(item.tile!==undefined)button.style.setProperty('--swatch',COL[item.tile]);if(item.tree)button.classList.add('creator-tree');button.addEventListener('click',()=>{creatorSelection=item.id;creatorTool='paint';creatorMarkSelection()});palette.append(button)}creatorMarkSelection()}
function creatorMarkSelection(){document.querySelectorAll('.creator-swatch').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.item===creatorSelection)));document.querySelectorAll('[data-creator-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.creatorTool===creatorTool)))}
function creatorSetMode(enabled){creatorMode=enabled&&(user==='sudo'||!!P?.sudoSpeed);document.body.classList.toggle('creator-mode',creatorMode);$('creator-bar').hidden=!creatorMode;$('btn-creator').setAttribute('aria-pressed',String(creatorMode));creatorPainting=false;if(creatorMode)setInventoryOpen(false);creatorMarkSelection();if(creatorMode)msg('Modo criador: selecione uma peça e clique no mapa. Ctrl+Z desfaz; Ctrl+Y refaz.','#ffd24a')}
function creatorTileAt(event){const rect=cv.getBoundingClientRect(),scaleX=cv.width/rect.width,scaleY=cv.height/rect.height,px=(event.clientX-rect.left)*scaleX,py=(event.clientY-rect.top)*scaleY,inside=P.x>=19990,s=inside?Math.min(cv.width/7,cv.height/5):sc(),x0=inside?20000:Math.floor(P.dx-cv.width/2/s)-1,y0=inside?20000:Math.floor(P.dy-cv.height/2/s)-1,ox=inside?(cv.width-7*s)/2-20000*s:cv.width/2-s/2-P.dx*s,oy=inside?(cv.height-5*s)/2-20000*s:cv.height/2-s/2-P.dy*s;return{x:Math.floor((px-ox)/s),y:Math.floor((py-oy)/s)}}
function creatorRecord(key){if(!creatorStroke||creatorStroke.before.has(key))return;creatorStroke.before.set(key,window.creativeEdits.has(key)?structuredClone(window.creativeEdits.get(key)):null)}
function creatorPaintCell(x,y){const radius=$('creator-brush-toggle').checked?Number($('creator-brush-size').value)-1:0,selected=CREATOR_ITEMS.find(item=>item.id===creatorSelection);for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){if(dx*dx+dy*dy>radius*radius)continue;const cellX=x+dx,cellY=y+dy,key=creatorKey(cellX,cellY);if(creatorTool==='paint'&&!selected)continue;creatorRecord(key);const tree=treeAtPosition(cellX,cellY);if(creatorTool==='delete'){if(tree?.creative){const treeKey=creatorKey(tree.x,tree.y);creatorRecord(treeKey);window.creativeEdits.delete(treeKey)}window.creativeEdits.delete(key);continue}if(tree?.creative){const treeKey=creatorKey(tree.x,tree.y);creatorRecord(treeKey);window.creativeEdits.delete(treeKey)}if(selected.tree){const anchorX=selected.tree==='cacto'?cellX:cellX-1,anchorY=selected.tree==='cacto'?cellY:cellY-2,size=selected.tree==='cacto'?1:3;if(size>1)for(let treeY=anchorY;treeY<anchorY+size;treeY++)for(let treeX=anchorX;treeX<anchorX+size;treeX++){const footprintKey=creatorKey(treeX,treeY),oldTree=treeAtPosition(treeX,treeY);creatorRecord(footprintKey);if(oldTree?.creative){const oldTreeKey=creatorKey(oldTree.x,oldTree.y);creatorRecord(oldTreeKey);window.creativeEdits.delete(oldTreeKey)}window.creativeEdits.delete(footprintKey)}const treeKey=creatorKey(anchorX,anchorY),edit={type:'tree',tree:selected.tree,size};creatorRecord(treeKey);window.creativeEdits.set(treeKey,edit)}else window.creativeEdits.set(key,{type:'block',tile:selected.tile,...(selected.material?{material:selected.material}:{})})}}
function creatorBegin(event){if(!creatorMode||S||event.button!==0||P.x>=19990)return false;creatorStroke={before:new Map()};creatorPainting=true;const cell=creatorTileAt(event);creatorLastCell=creatorKey(cell.x,cell.y);creatorPaintCell(cell.x,cell.y);invalidateTerrain();event.preventDefault();return true}
function creatorMove(event){if(!creatorPainting||!event.buttons)return;const cell=creatorTileAt(event),key=creatorKey(cell.x,cell.y);if(key===creatorLastCell)return;creatorLastCell=key;creatorPaintCell(cell.x,cell.y);invalidateTerrain()}
function creatorFinish(){if(!creatorPainting)return;creatorPainting=false;const before=creatorStroke?.before||new Map(),after=new Map([...before.keys()].map(key=>[key,window.creativeEdits.has(key)?structuredClone(window.creativeEdits.get(key)):null]));creatorStroke=null;if(before.size){creatorUndo.push({before,after});if(creatorUndo.length>200)creatorUndo.shift();creatorRedo.length=0;creatorStore();creatorUpdateCount();clearTreeAnchorCache();invalidateTerrain()}}
function creatorApplyHistory(action,side){const edits=window.creativeEdits;for(const[key,value]of action[side])value===null?edits.delete(key):edits.set(key,structuredClone(value));clearTreeAnchorCache();invalidateTerrain();creatorStore();creatorUpdateCount()}
function creatorUndoAction(){const action=creatorUndo.pop();if(!action)return;creatorApplyHistory(action,'before');creatorRedo.push(action);creatorUpdateCount()}
function creatorRedoAction(){const action=creatorRedo.pop();if(!action)return;creatorApplyHistory(action,'after');creatorUndo.push(action);creatorUpdateCount()}
async function creatorExport(){const contents=JSON.stringify({format:'westeros-builds',version:1,edits:[...window.creativeEdits]},null,2);if(window.showSaveFilePicker){try{const handle=await window.showSaveFilePicker({suggestedName:'westeros-construcoes.json',types:[{description:'Construções de Westeros',accept:{'application/json':['.json']}}]}),writer=await handle.createWritable();await writer.write(contents);await writer.close();msg('Arquivo de construções salvo.','#ffd24a');return}catch(error){if(error.name==='AbortError')return}}const url=URL.createObjectURL(new Blob([contents],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='westeros-construcoes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function creatorImport(file){const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result),edits=data?.format==='westeros-builds'&&data.version===1?data.edits:null;if(!Array.isArray(edits))throw Error('Arquivo inválido');creatorLoad(edits);creatorUndo.length=0;creatorRedo.length=0;creatorStore();creatorUpdateCount();msg('Construções importadas.','#ffd24a')}catch{msg('Arquivo de construções inválido.','#ff8a80')}};reader.readAsText(file)}
creatorPalette();$('btn-creator').addEventListener('click',()=>creatorSetMode(!creatorMode));document.querySelectorAll('[data-creator-tool]').forEach(button=>button.addEventListener('click',()=>{creatorTool=button.dataset.creatorTool;creatorMarkSelection()}));$('creator-undo').addEventListener('click',creatorUndoAction);$('creator-redo').addEventListener('click',creatorRedoAction);$('creator-export').addEventListener('click',creatorExport);$('creator-import').addEventListener('click',()=>$('creator-file').click());$('creator-file').addEventListener('change',event=>{if(event.target.files[0])creatorImport(event.target.files[0]);event.target.value=''});$('creator-brush-size').addEventListener('input',event=>$('creator-brush-value').value=event.target.value);$('creator-brush-size').addEventListener('input',event=>$('creator-brush-value').textContent=event.target.value);
cv.addEventListener('pointerdown',event=>{if(creatorBegin(event))cv.setPointerCapture(event.pointerId)});
cv.addEventListener('pointermove',creatorMove);cv.addEventListener('pointerup',creatorFinish);cv.addEventListener('pointercancel',creatorFinish);addEventListener('beforeunload',creatorStore);
const boatBlocks=(x,y)=>!P.boatMounted&&P.boatAt&&x>=P.boatAt.x&&x<=P.boatAt.x+2&&y>=P.boatAt.y&&y<=P.boatAt.y+2;
const playerCanEnter=(x,y)=>!boatBlocks(x,y)&&(isWaterTile(tile(x,y))?!treeSolid(x,y)&&!NP.some(n=>n.x==x&&n.y==y)&&!mons.some(m=>m.x==x&&m.y==y)&&!CZ.some(c=>!c.in&&c.x==x&&c.y==y)&&!RN.some(r=>r.x==x&&r.y==y):free(x,y));
const boatCoversWater=(x,y)=>{for(let by=0;by<3;by++)for(let bx=0;bx<3;bx++)if(!isWaterTile(tile(x+bx,y+by)))return false;return true};
const boatNear=(boat,x,y)=>Math.max(0,boat.x-x,x-(boat.x+2),0)<=1&&Math.max(0,boat.y-y,y-(boat.y+2),0)<=1;
const boatSeatOffset={N:[1,2],S:[1,0],L:[2,1],R:[0,1]};
const boatSeat=boat=>{const[offsetX,offsetY]=boatSeatOffset[boat.dir]||boatSeatOffset.S;return{x:boat.x+offsetX,y:boat.y+offsetY}};
function mountBoat(){
 if(!P.boatOwned)return msg('Você ainda não tem um barco. Procure um barqueiro.','#9aa3b2');
 P.mounted=false;
 let boat=P.boatAt;
 if(boat&&boatCoversWater(boat.x,boat.y)&&boatNear(boat,P.x,P.y)){
  P.boatMounted=true;const seat=boatSeat(boat);P.x=seat.x;P.y=seat.y;P.dx=P.x;P.dy=P.y;P.mv=0;
  return msg('Você subiu no barco. Use WASD para navegar e B para desembarcar.','#8fd0f0');
 }
 const candidates=[];
 for(let y=P.y-3;y<=P.y+1;y++)for(let x=P.x-3;x<=P.x+1;x++){
  if(!boatCoversWater(x,y))continue;
  const distance=Math.max(Math.max(0,x-P.x,P.x-(x+2)),Math.max(0,y-P.y,P.y-(y+2)));
  if(distance<=1)candidates.push({x,y,distance,face:Math.abs(P.f[0])?0:1});
 }
 candidates.sort((a,b)=>a.distance-b.distance||a.face-b.face||a.y-b.y||a.x-b.x);
 boat=candidates[0];
 if(!boat)return msg('Não há espaço para colocar o barco aqui. Aproxime-se de uma área de água mais aberta.','#9aa3b2');
 P.boatAt={x:boat.x,y:boat.y,dir:directionName(P.f[0],P.f[1])};P.boatMounted=true;
 const seat=boatSeat(P.boatAt);P.x=seat.x;P.y=seat.y;P.dx=P.x;P.dy=P.y;P.mv=0;
 msg('Você lançou o barco e embarcou. Use WASD para navegar e B para desembarcar.','#8fd0f0');
}
function dismountBoat(){
 const boat=P.boatAt,candidates=[];
 if(!boat)return;
 const seat=boatSeat(boat);
 for(let y=boat.y-1;y<=boat.y+3;y++)for(let x=boat.x-1;x<=boat.x+3;x++){
  if(x>=boat.x&&x<=boat.x+2&&y>=boat.y&&y<=boat.y+2)continue;
  if(!isWaterTile(tile(x,y))&&free(x,y))candidates.push({x,y,distance:Math.max(Math.abs(x-seat.x),Math.abs(y-seat.y))});
 }
 candidates.sort((a,b)=>a.distance-b.distance||a.y-b.y||a.x-b.x);
 const shore=candidates[0];
 if(!shore)return msg('Não há margem livre para desembarcar por aqui.','#9aa3b2');
 P.boatMounted=false;P.x=shore.x;P.y=shore.y;P.dx=P.x;P.dy=P.y;P.mv=0;
 msg('Você desembarcou. O barco ficou na água.','#8fd0f0');
}
const directionName=(x,y)=>Math.abs(x)>=Math.abs(y)?(x<0?'L':'R'):(y<0?'N':'S');
function toggleBoat(){if(P.boatMounted)dismountBoat();else mountBoat()}
function cactusDamage(x,y){const cactus=cactusAt(x,y);if(!cactus||G.t<(P.cactusHitAt||0))return;P.cactusHitAt=G.t+1;const damage=8;P.hp=Math.max(0,P.hp-damage);fx(P.x,P.y,'-'+damage,'#b4e36d');msg('Os espinhos do cacto causaram '+damage+' de dano.','#b4e36d');if(P.hp<=0)die()}
/** Cria um monstro perto do jogador conforme as 7 regiões de Westeros (Além da Muralha, Norte, Terras Fluviais/Vale, Terras do Rei/Oeste, Campina/Tempestade, Ilhas, Dorne). */
function spawn(){
 const beyond=P.y<-656,maxMons=beyond?12:4;if(mons.length>=maxMons)return;
 for(let k=0;k<12;k++){
  const a=Math.random()*6.283,r=beyond?(11+Math.random()*8):(15+Math.random()*10);
  const x=Math.round(P.x+Math.cos(a)*r),y=Math.round(P.y+Math.sin(a)*r);
  if(!free(x,y)||(x==P.x&&y==P.y)||inTown(x,y,6)||tile(x,y)==20||tile(x,y)==21)continue;
  let t='lobo',R=Math.random();
  if(y<-656){
   if(R<.12)t='gzumbi';else if(R<.24)t='gigante';else if(R<.38)t='walker';else if(R<.50)t='mamute';else if(R<.62)t='urso_gigante';else if(R<.74)t='lobog';else if(R<.84)t='selvagem';else if(R<.91)t='wight_soldado';else if(R<.96)t='wight_nobre';else t='wight';
  }else if(y<=150){
   if(R<.26)t='lobo';else if(R<.46)t='renegado';else if(R<.64)t='urso';else if(R<.80)t='band';else if(R<.93)t='montanhes';else t='selvagem';
  }else if(y<=550){
   if(R<.28)t='auroque';else if(R<.54)t='band';else if(R<.74)t='lobo';else if(R<.90)t='renegado';else t='montanhes';
  }else if(y<=950){
   if(R<.30)t='band';else if(R<.56)t='auroque';else if(R<.78)t='lobo';else t='renegado';
  }else if(y<=1400){
   if(R<.30)t='auroque';else if(R<.58)t='band';else if(R<.78)t='renegado';else t='lobo';
  }else{
   if(R<.32)t='lagarto_leao';else if(R<.56)t='auroque';else if(R<.78)t='criminoso';else t='renegado';
  }
  mons.push({t,x,y,dx:x,dy:y,hp:MT[t].hp,mv:1,cd:1,ht:0});return;
 }
}
/** Ataque do jogador a um monstro: dano = ATK + 0..4, gasta a arma, mata se HP<=0. */
function dropItem(name,count,x,y){
 if(count<=0)return;
 const angle=Math.random()*Math.PI*2,speed=1.5+Math.random()*2.5;
 worldDrops.push({name,count,x:x+(Math.random()-.5)*.25,y:y+(Math.random()-.5)*.25,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,z:.15,vz:1.5+Math.random()*1.5,age:0,magnetDelay:.35+Math.random()*.2});
}
function updateWorldDrops(dt){
 for(let i=worldDrops.length-1;i>=0;i--){
  const drop=worldDrops[i],dx=P.x-drop.x,dy=P.y-drop.y,distance=Math.hypot(dx,dy);
  drop.age+=dt;
  if(P.x<19990&&drop.age>=drop.magnetDelay&&distance<=5.5&&distance>.48){
   const speed=Math.min(12,3+(5.5-distance)*2);
   drop.vx+=(dx/distance*speed-drop.vx)*Math.min(1,dt*9);
   drop.vy+=(dy/distance*speed-drop.vy)*Math.min(1,dt*9);
   drop.z=Math.max(0,drop.z-dt*2);
   drop.vz=0;
  }else{
   drop.vx*=Math.exp(-3.5*dt);drop.vy*=Math.exp(-3.5*dt);
   drop.z+=drop.vz*dt;drop.vz-=8*dt;
   if(drop.z<0){drop.z=0;if(drop.vz<-.7)drop.vz*=-.32;else drop.vz=0}
  }
  drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;
  if(Math.hypot(P.x-drop.x,P.y-drop.y)<.48){
   if(drop.name==='gold')P.gold+=drop.count;
   else P.inv[drop.name]=(P.inv[drop.name]||0)+drop.count;
   worldDrops.splice(i,1);
   msg(drop.name==='gold'?`Você recolheu ${drop.count} moedas de ouro.`:`Você recolheu ${drop.count}× ${drop.name}.`,'#e2b04a');
   save();
  }
 }
}
function triggerAttack(actor,targetX,targetY,color){const x=actor.dx??actor.x,y=actor.dy??actor.y,dx=Math.sign(targetX-x),dy=Math.sign(targetY-y);actor.attack={at:G.t,dx,dy,targetX,targetY};attackFx.push({x:targetX,y:targetY,at:G.t,color,dx,dy});if(attackFx.length>30)attackFx.shift()}
/** Ataque do jogador a um monstro: dano = ATK + 0..4, gasta a arma, mata se HP<=0. */
function atk(m){if(P.cd>0)return;P.cd=.65;P.activeTool=null;triggerAttack(P,m.x,m.y,'#ffe28a');const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5)));wear('w');m.hp-=d;m.ht=.12;fx(m.x,m.y,'-'+d,'#fff2b0');if(m.hp<=0)kill(m)}
/** Recompensas da morte de um monstro: ouro, XP, proficiência da arma, loot (60%) e subida de nível. */
function kill(m){mons.splice(mons.indexOf(m),1);const d=MT[m.t],g=d.g[0]+Math.floor(Math.random()*(d.g[1]-d.g[0]+1));dropItem('gold',g,m.x,m.y);P.xp+=d.xp;P.kills++;const wp=W[P.w].t;P.pf[wp]=Math.min(100,(P.pf[wp]||0)+.5);let s=`${d.n} derrotado: +${d.xp} XP, ${g}g no chão`;
 if(Math.random()<.6){dropItem(d.l,1,m.x,m.y);s+=', '+d.l}if(Math.random()<.12){dropItem('pot',1,m.x,m.y);s+=', Poção de Cura'}msg(s,'#9f9');
 while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a');fx(P.x,P.y,'NÍVEL!','#ffd24a');save()}}
/** Morte definitiva do jogador: apaga todo o progresso e o personagem é excluído. */
function die(){
 const nm=P?P.name:'Seu personagem';const a=ld();if(user&&a[user]){delete a[user];sv(a)}
 P=null;user=null;S=null;G.al=0;mons.length=0;CZ.length=0;worldDrops.length=0;RN.length=0;
 $('inventory-panel').style.display='none';$('hud').style.display='none';$('top-actions').style.display='none';$('md').style.display='none';
 $('lgn').style.display='flex';$('err').textContent=`MORTE DEFINITIVA: ${nm} pereceu em combate. O personagem foi apagado.`;$('err').style.color='#ff6b5f';
}
/** Cores de roupa dos cidadãos (reserva sem sprite). */
const CC=['#6a8a5a','#8a6a4a','#5a6e9a','#9a5a5a','#7a6a8a'];
/** Mantém cidadãos e guardas de uma cidade; em Castle Black todos são irmãos juramentados da Patrulha da Noite. */
function popT(t){if(!t.dr){t.dr=[];for(let y=t.y-t.ry;y<=t.y+t.ry;y++)for(let x=t.x-t.rx;x<=t.x+t.rx;x++)if(tile(x,y)==17)t.dr.push([x,y])}
 const isCB=t.i==7,want={cit:isCB?0:(t.t=='ruin'?3:t.t=='city'?12:8),sd:isCB?8:(t.t=='wall'?6:t.t=='city'?5:t.t=='ruin'?0:4)};
 for(const k in want){let n=CZ.filter(c=>c.ti==t.i&&c.k==k).length;for(let j=0;j<6&&n<want[k];j++){const x=t.x-t.rx+1+(Math.random()*(2*t.rx-1)|0),y=t.y-t.ry+1+(Math.random()*(2*t.ry-1)|0),q=tile(x,y);if(!free(x,y)||q==17||t.housePaths.has(`${x},${y}`)||(x==P.x&&y==P.y))continue;CZ.push({k,ti:t.i,x,y,dx:x,dy:y,mv:Math.random(),cd:0,tm:0,st:0,hp:90,g:Math.random()<.5?'f':'m',v:isCB?'soldado':['campones','campones','campones','mendigo','viajante','carpinteiro','sacerdote','maester'][Math.random()*8|0],col:isCB?'#1c1c22':CC[Math.random()*CC.length|0],pn:isCB?'Patrulheiro da Noite':null});n++}}}
/** Jogador bate em cidadão/guarda: Castle Black é imune a ataques; cidades comuns ativam alerta. */
function hitC(c){if(P.cd>0)return;if(c.ti==7)return msg('Você não pode desembainhar armas contra irmãos da Patrulha da Noite.','#9aa3b2');
 P.cd=.65;P.activeTool=null;triggerAttack(P,c.x,c.y,'#ffe28a');const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5))),first=!(G.al>0);wear('w');c.hp-=d;fx(c.x,c.y,'-'+d,'#fff2b0');G.al=25;G.alt=c.ti;
 if(first){msg('Os guardas de '+TW[c.ti].n+' foram alertados!','#ff8a80');if(c.k=='cit')P.rp[c.ti]=Math.max(-100,(P.rp[c.ti]||0)-10)}
 if(c.hp<=0){CZ.splice(CZ.indexOf(c),1);if(c.k=='sd'){P.xp+=30;P.gold+=12;msg('Guarda derrotado: +30 XP, +12g','#9f9')}else{G.al=40;P.rp[c.ti]=Math.max(-100,(P.rp[c.ti]||0)-15);msg('Você matou um cidadão. A reputação caiu.','#ff8a80')}
  while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a');save()}}}
/** IA dos cidadãos e guardas: passeio, entrar em casas, perseguir e atacar durante o alerta. */
function czUpd(dt){G.pc=(G.pc||0)-dt;if(G.al>0)G.al-=dt;
 if(G.pc<=0){G.pc=1;for(let i=CZ.length-1;i>=0;i--)if(Math.hypot(CZ[i].x-P.x,CZ[i].y-P.y)>50)CZ.splice(i,1);const nt=inTown(P.x,P.y,10);if(nt&&P.x<19990)popT(nt)}
 for(const c of CZ){c.mv-=dt;c.cd-=dt;if(c.in){c.tm-=dt;if(c.tm<=0)c.in=0;continue}
  c.dx+=(c.x-c.dx)*Math.min(1,dt*10);c.dy+=(c.y-c.dy)*Math.min(1,dt*10);
  const t=TW[c.ti],hunt=c.k=='sd'&&G.al>0&&G.alt==c.ti&&inTown(P.x,P.y,3),ex=P.x-c.x,ey=P.y-c.y,dist=Math.max(Math.abs(ex),Math.abs(ey));
  if(hunt&&dist<=1){if(c.cd<=0){c.cd=1.2;triggerAttack(c,P.x,P.y,'#ff765f');const h=Math.max(1,Math.round(10+Math.floor(Math.random()*5)-defV()/2));P.hp-=h;fx(P.x,P.y,'-'+h,'#ff6b5f');['a','s','hd'].forEach(wear);if(P.hp<=0){die();return}}continue}
  if(c.mv>0)continue;c.mv=hunt?.45:c.k=='sd'?.8:.6;let a=0,b=0;
  if(hunt){if(Math.abs(ex)>=Math.abs(ey))a=Math.sign(ex);else b=Math.sign(ey)}
  else if(c.tg){const gx=c.tg[0]-c.x,gy=c.tg[1]-c.y;if(!gx&&!gy){c.in=1;c.tm=6+Math.random()*8;c.tg=null;continue}if(Math.abs(gx)>=Math.abs(gy))a=Math.sign(gx);else b=Math.sign(gy);if(++c.st>40)c.tg=null}
  else if(c.k=='cit'&&Math.random()<.12&&t.dr&&t.dr.length){c.tg=t.dr[Math.random()*t.dr.length|0];c.st=0}
  else if(Math.random()<.5){const r=Math.random()*4|0;a=[1,-1,0,0][r];b=[0,0,1,-1][r]}
  const ok=(p,q)=>(p||q)&&free(c.x+p,c.y+q)&&!(c.x+p==P.x&&c.y+q==P.y)&&inTown(c.x+p,c.y+q,hunt?3:0)==t;
  if(ok(a,b)){c.x+=a;c.y+=b}else if(hunt||c.tg){const a2=a?0:Math.sign(c.tg?c.tg[0]-c.x:ex),b2=b?0:Math.sign(c.tg?c.tg[1]-c.y:ey);if(ok(a2,b2)){c.x+=a2;c.y+=b2}}}}
/** Interage com o NPC adjacente (abre loja/estalagem ou fala com o guardiÃ£o do portÃ£o). Devolve 1 se tratou. */
function talk(){const n=NP.find(n=>Math.max(Math.abs(n.x-P.x),Math.abs(n.y-P.y))<=1);
 if(n){
  if(n.k=='gate'){
   if(P.lvl<20){msg('Patrulheiro do PortÃ£o: "SÃ³ pode passar quando for mais forte.\"','#ffd24a')}
   else{msg('Patrulheiro do PortÃ£o: "Pode passar, irmÃ£o.\"','#8fd0f0')}
   return 1;
  }
  const rp=P.rp[n.ti]||0;
  if(rp<=-50){msg(n.n+' se recusa a falar com vocÃª.','#ff8a80');return 1}
  if(typeof npcDialog==='function'){
   const linha=npcDialog(n.k,rp,P.name,TW[n.ti]?TW[n.ti].n:'aqui',P.lvl);
   if(linha)msg(n.n+': <em style="color:#e8d8b0">&ldquo;'+linha+'&rdquo;</em>','#e8d8b0');
  }
  S=n;shop();return 1}
 return 0}
/** Ação de E: interage com o alvo mais próximo no 3×3, favorecendo a direção do jogador. */
function chop(targetX,targetY){const nearby=targetX===undefined?interactionTarget(P.x,P.y):null,x=targetX??nearby?.x??P.x+P.f[0],y=targetY??nearby?.y??P.y+P.f[1],t=tile(x,y),I=P.inv,R=Math.random(),tree=treeAtPosition(x,y);
 if(tree){const k=kk(tree.x,tree.y);if(treeFallFx.has(k)||P.cd>0)return;P.cd=.65;const axeLevel=toolLevel('Machado de Corte'),hits=axeLevel?TOOLS['Machado de Corte'].hits[axeLevel-1]:5,p=treeProgress.get(k);if(axeLevel){P.activeTool='Machado de Corte';P.toolAction={sprite:'axe',level:axeLevel,until:G.t+.65}}treeHitFx.set(k,G.t);if(!p||G.t-p.last>=2)treeProgress.set(k,{hits:1,last:G.t});else{p.hits++;p.last=G.t}const progress=treeProgress.get(k);if(progress.hits<hits)return msg(`Golpeou a árvore (${progress.hits}/${hits}).`,'#c9a');treeProgress.delete(k);treeHitFx.delete(k);treeFallFx.set(k,{start:G.t,direction:P.x<=tree.x+1?1:-1});const q=(axeLevel||1)+(R<P.pf.woodcut/100?1:0);dropItem('Madeira',q,tree.x+tree.size/2,tree.y+tree.size-1);P.pf.woodcut=Math.min(100,P.pf.woodcut+.5);msg('Você derrubou uma árvore. '+q+'× Madeira caiu no chão.','#c9a')}
 else if(t==11){const level=toolLevel('Picareta');if(!level)return msg('Você precisa de uma Picareta.','#9aa3b2');P.activeTool='Picareta';P.toolAction={sprite:'pickaxe',level,until:G.t+.5};markTerrainCut(x,y);invalidateTerrain();const o=R<.7?'Minério de Ferro':R<.95?'Minério de Cobre':'Minério de Prata',q=level+(Math.random()<P.pf.mining/100?1:0);I[o]=(I[o]||0)+q;P.pf.mining=Math.min(100,P.pf.mining+.5);msg('Você extraiu '+q+'× '+o+'.','#c9a')}
 else if(t==0||t==7||t==20||t==21){const level=toolLevel('Vara de Pescar');if(!level)return msg('Você precisa de uma Vara de Pescar.','#9aa3b2');if(G.t<(P.fc||0))return;P.activeTool='Vara de Pescar';P.toolAction={sprite:'fishing_rod',level,until:G.t+.75};P.fc=G.t+[1.5,1.1,.75][level-1];P.pf.fish=Math.min(100,P.pf.fish+.3);if(Math.random()<Math.min(.9,.3+P.pf.fish*.006+(level-1)*.12)){I['Peixe']=(I['Peixe']||0)+1;msg('Você pescou um Peixe.','#8fd0f0')}else msg('Nada mordeu a isca.','#9aa3b2')}
 else if(t==19)openChest();else msg('Nada para fazer aqui.','#9aa3b2')}
/** Abre o baú da sala atual. Cada baú (chave = tile em frente à porta) recarrega 12 min depois. Conteúdo varia pelo tipo de casa. */
function openChest(){P.lt=P.lt||{};const k=(P.rt||[0,0]).join(','),now=Date.now();if(P.lt[k]&&now-P.lt[k]<72e4)return msg('O baú está vazio.','#9aa3b2');P.lt[k]=now;
 const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),got=[],add=(n,q)=>{P.inv[n]=(P.inv[n]||0)+q;got.push(q+'× '+(n=='pot'?'Poção de Cura':n))};let g=0;
 switch(RM.t){case 0:add('Trigo',R(2,4));add('Carne',R(1,2));break;case 1:add('Madeira',R(3,6));g=R(5,20);if(Math.random()<.5)add('Pele de Lobo',1);break;case 2:g=R(20,60);add('Carne',1);break;case 3:add('Trigo',R(4,8));g=R(10,30);break;case 4:g=R(30,90);if(Math.random()<.35)add('Relíquia Antiga',1);break;default:g=R(5,25)}
 if(Math.random()<.35)add('pot',1);P.gold+=g;if(g)got.push(g+'g');msg('Você abriu o baú: '+got.join(', ')+'.','#e2b04a');save()}
/** Troca a sala do interior: define o tipo (RM.t), limpa o cache de tiles e põe o NPC residente (Taverneiro / Sacerdote). */
function setRoom(t,ti){RM.t=t;tc.clear();for(let i=NP.length-1;i>=0;i--)if(NP[i].tmp)NP.splice(i,1);
 if(t==2)NP.push({n:'Taverneiro',k:'e',ti,x:20001,y:20002,dx:20001,dy:20002,tmp:1});
 if(t==4)NP.push({n:'Sacerdote',k:'pr',ti,x:20001,y:20002,dx:20001,dy:20002,tmp:1})}
/** Jogador bate num camponês rural: ele passa a revidar por 10 s (fraco). Morte: pouco ouro/XP e some por 5 min. */
function hitR(r){if(P.cd>0)return;P.cd=.65;triggerAttack(P,r.x,r.y,'#ffe28a');const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5)));wear('w');r.hp-=d;r.ang=10;fx(r.x,r.y,'-'+d,'#fff2b0');
 if(r.hp<=0){RN.splice(RN.indexOf(r),1);rdead.set(r.id,Date.now());const g=3+Math.floor(Math.random()*10);P.gold+=g;P.xp+=8;msg('Você matou '+r.n+': +8 XP, +'+g+'g','#ff8a80');
  while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a');save()}}}
/** Camponeses rurais neutros: um por casa, vagueiam até 6 tiles da porta, não atacam a menos que sejam atacados. Repovoa a cada 1 s ao redor do jogador. */
function rnUpd(dt){if(P.x>=19990)return;G.rp=(G.rp||0)-dt;
 if(G.rp<=0){G.rp=1;for(let i=RN.length-1;i>=0;i--)if(Math.hypot(RN[i].x-P.x,RN[i].y-P.y)>45)RN.splice(i,1);
  const ci=Math.floor(P.x/RCELL),cj=Math.floor(P.y/RCELL);
  for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){const r=ruralCell(i,j),id=i+','+j;if(!r||RN.some(n=>n.id==id)||Date.now()-(rdead.get(id)||0)<3e5)continue;
   const x=r.x+(Math.random()*7|0)-3,y=r.y+2+(Math.random()*3|0);if(!free(x,y)||tile(x,y)==20||Math.hypot(x-P.x,y-P.y)<3)continue;
   RN.push({id,x,y,dx:x,dy:y,hx:r.x,hy:r.y+2,mv:Math.random()*2,cd:0,hp:25,ang:0,g:H(r.x,r.y,43)>.5?'f':'m',v:RFV[r.t],n:RFN[r.t]})}}
 for(const c of RN){c.mv-=dt;c.cd-=dt;c.dx+=(c.x-c.dx)*Math.min(1,dt*10);c.dy+=(c.y-c.dy)*Math.min(1,dt*10);
  const ex=P.x-c.x,ey=P.y-c.y,dist=Math.max(Math.abs(ex),Math.abs(ey));if(c.ang>0){c.ang-=dt;if(dist>14)c.ang=0}
  if(c.ang>0&&dist<=1){if(c.cd<=0){c.cd=1.4;triggerAttack(c,P.x,P.y,'#ff765f');const h=Math.max(1,Math.round(3+Math.floor(Math.random()*4)-defV()/2));P.hp-=h;fx(P.x,P.y,'-'+h,'#ff6b5f');['a','s','hd'].forEach(wear);if(P.hp<=0){die();return}}continue}
  if(c.mv>0)continue;c.mv=c.ang>0?.5:.9+Math.random()*1.2;let a=0,b=0;
  if(c.ang>0){if(Math.abs(ex)>=Math.abs(ey))a=Math.sign(ex);else b=Math.sign(ey)}else if(Math.random()<.5){const q=Math.random()*4|0;a=[1,-1,0,0][q];b=[0,0,1,-1][q]}
  const X=c.x+a,Y=c.y+b;if((a||b)&&free(X,Y)&&!(X==P.x&&Y==P.y)&&tile(X,Y)!=20&&!inTown(X,Y)&&(c.ang>0||Math.hypot(X-c.hx,Y-c.hy)<=6)){c.x=X;c.y=Y}}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT')return;if(!P||wmOpen())return;
 if(creatorMode&&(e.ctrlKey||e.metaKey)&&(k==='z'||k==='y')){e.preventDefault();if(k==='y'||e.shiftKey)creatorRedoAction();else creatorUndoAction();return}
 if(!e.repeat&&k.length===1&&/[a-z]/.test(k)){
  const now=performance.now();
  if(now-cheatBufferAt>1500)cheatBuffer='';
  const next=cheatBuffer+k,command=CHEAT_WORDS.find(word=>word===next);
  if(CHEAT_WORDS.some(word=>word.startsWith(next))){
   cheatBuffer=command?'':next;cheatBufferAt=now;e.preventDefault();
   if(command)activateCheat(command);
   return;
  }
  cheatBuffer='';
 }
 if(/^\d$/.test(k)&&!e.repeat)cheat(k);
 if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','e','q','c','b'].includes(k))e.preventDefault();
 if(k=='escape'&&S)return closeShop();if(S)return;if(k=='i'&&!e.repeat){toggleInventory();return}if(k=='c'&&!e.repeat){if(!P.horse)return msg('Você não possui um cavalo.','#9aa3b2');P.mounted=!P.mounted;msg(P.mounted?'Você montou a cavalo.':'Você desmontou.','#e2b04a');save();return;}K.add(k);
 if(k=='b'&&!e.repeat){toggleBoat();save();return}
 if(k=='e'&&!e.repeat&&!talk())chop();
 if(k=='q'&&!e.repeat){if(P.inv.pot>0&&P.hp<mh()){P.inv.pot--;P.hp=Math.min(mh(),P.hp+45);fx(P.x,P.y,'+45','#7f7')}else msg('Sem poções ou vida cheia.','#9aa3b2')}});
addEventListener('keyup',e=>K.delete(e.key.toLowerCase()));addEventListener('blur',()=>K.clear());
function worldPointer(e){if(!P||S||creatorMode)return;const interior=P.x>=19990,s=interior?Math.min(cv.width/7,cv.height/5):sc(),rect=cv.getBoundingClientRect(),scaleX=cv.width/rect.width,scaleY=cv.height/rect.height,pointerX=(e.clientX-rect.left)*scaleX,pointerY=(e.clientY-rect.top)*scaleY,centerX=interior?20003.5:P.dx,centerY=interior?20002.5:P.dy,x=Math.floor(centerX+(pointerX-cv.width/2)/s),y=Math.floor(centerY+(pointerY-cv.height/2)/s);
 if(interior&&tile(x,y)===19){const dx=x-P.x,dy=y-P.y;if(Math.max(Math.abs(dx),Math.abs(dy))<=2){if(dx||dy)P.f=[Math.sign(dx),Math.sign(dy)];openChest()}else msg('Aproxime-se do baú para abri-lo.','#9aa3b2');return}
 const n=NP.find(n=>n.x==x&&n.y==y);if(n){if(!talk())msg('Aproxime-se de '+n.n+'.','#9aa3b2');return}
 const rn=RN.find(r=>r.x==x&&r.y==y);if(rn){if(Math.max(Math.abs(rn.x-P.x),Math.abs(rn.y-P.y))<=1)hitR(rn);else msg('Alvo distante demais.','#9aa3b2');return}
 const cz=CZ.find(c=>!c.in&&c.x==x&&c.y==y);if(cz){if(Math.max(Math.abs(cz.x-P.x),Math.abs(cz.y-P.y))<=1)hitC(cz);else msg('Alvo distante demais.','#9aa3b2');return}
 const m=mons.find(m=>m.x==x&&m.y==y);if(m){if(Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))<=1)atk(m);else msg('Alvo distante demais.','#9aa3b2');return}
 const dx=x-P.x,dy=y-P.y;if(Math.max(Math.abs(dx),Math.abs(dy))<=1){if(dx||dy)P.f=[Math.sign(dx),Math.sign(dy)];chop(x,y)}}
const touchZoom=new Map();let pinching=false;
cv.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){if(!P||S||creatorMode)return;touchZoom.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});if(touchZoom.size>1)pinching=true;cv.setPointerCapture(e.pointerId);e.preventDefault();return}if(e.button===0&&!creatorMode)worldPointer(e)});
cv.addEventListener('pointermove',e=>{const point=touchZoom.get(e.pointerId);if(!point)return;const previousX=point.x,previousY=point.y;point.x=e.clientX;point.y=e.clientY;if(touchZoom.size>1){const other=[...touchZoom.values()].find(p=>p!==point);if(other){const previous=Math.hypot(previousX-other.x,previousY-other.y),current=Math.hypot(point.x-other.x,point.y-other.y);if(previous>0&&current>0&&user==='sudo')zoomBy(previous/current)}e.preventDefault()}});
cv.addEventListener('pointerup',e=>{const point=touchZoom.get(e.pointerId);if(!point)return;if(!pinching&&Math.hypot(e.clientX-point.startX,e.clientY-point.startY)<8)worldPointer(e);touchZoom.delete(e.pointerId);if(!touchZoom.size)pinching=false});
cv.addEventListener('pointercancel',e=>{touchZoom.delete(e.pointerId);if(!touchZoom.size)pinching=false});
cv.addEventListener('wheel',e=>{if(!P||S||wmOpen()||user!=='sudo')return;e.preventDefault();zoomBy(Math.exp(e.deltaY*.001),e.clientX,e.clientY)},{passive:false});
/** Tamanho do tile em pixels na tela (zoom do jogo). */
const sc=()=>cv.height/zoomTiles;
function zoomBy(f){if(!P||user!=='sudo'||P.x>=19990)return;zoomTiles=Math.max(5,Math.min(30,zoomTiles*f))}
/** Atualização por quadro: entrada, movimento, portas, monstros, regeneração, alerta e autosave. */
function upd(dt){G.t+=dt;P.playTime=(P.playTime||0)+dt;P.mv-=dt;P.cd-=dt;const sf=inTown(P.x,P.y);
 P.dx+=(P.x-P.dx)*Math.min(1,dt*16);P.dy+=(P.y-P.dy)*Math.min(1,dt*16);
 if(P.boatMounted){
  let a=(K.has('d')||K.has('arrowright'))-(K.has('a')||K.has('arrowleft')),b=(K.has('s')||K.has('arrowdown'))-(K.has('w')||K.has('arrowup'));if(a)b=0;
  if((a||b)&&P.mv<=0){
   const boatX=P.boatAt.x+a,boatY=P.boatAt.y+b;
   if(boatCoversWater(boatX,boatY)){P.f=[a,b];P.boatAt.x=boatX;P.boatAt.y=boatY;P.boatAt.dir=directionName(a,b);const seat=boatSeat(P.boatAt);P.x=seat.x;P.y=seat.y;P.mv=.20/1.5}
   else P.mv=.12;
  }
 }else if(P.sudoSpeed){
  let a=(K.has('d')||K.has('arrowright'))-(K.has('a')||K.has('arrowleft')),b=(K.has('s')||K.has('arrowdown'))-(K.has('w')||K.has('arrowup'));if(a)b=0;
  if(a||b){const speedMultiplier=K.has('shift')?20:10;P.f=[a,b];let steps=0;while(P.mv<=0&&steps<64){P.x+=a;P.y+=b;P.mv+=.12/speedMultiplier;steps++}P.dx=P.x;P.dy=P.y}else P.mv=0;
 }else if(P.mv<=0){let a=(K.has('d')||K.has('arrowright'))-(K.has('a')||K.has('arrowleft')),b=(K.has('s')||K.has('arrowdown'))-(K.has('w')||K.has('arrowup'));if(a)b=0;
  if(a||b){P.f=[a,b];const x=P.x+a,y=P.y+b;
   if(P.lvl<20&&b<0&&y<=-656&&P.y>=-656&&Math.abs(x-TW[7].x)<=2){
    msg('Patrulheiro do Portão: "Só pode passar quando for mais forte." (Requer Nível 20)','#ff8a80');
    fx(P.x,P.y,'NÍVEL 20+','#ff8a80');P.mv=.3;return;
   }
   if(playerCanEnter(x,y)){P.lx=P.x;P.ly=P.y;P.x=x;P.y=y;if(P.mounted&&isWaterTile(tile(x,y))){P.mounted=false;msg('O cavalo não entra na água; você desmontou.','#9aa3b2')}const roadTile=tile(x,y)==6;P.mv=isWaterTile(tile(x,y))?1:(P.mounted?(roadTile?.12:.20):(roadTile?.52:.62))*(ov()?1/.7:1)}else cactusDamage(x,y)}}
 if(K.has(' ')){const m=mons.filter(m=>Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))<=1).sort((a,b)=>a.hp-b.hp)[0];if(m)atk(m);else{const c=CZ.find(c=>!c.in&&Math.max(Math.abs(c.x-P.x),Math.abs(c.y-P.y))<=1);if(c)hitC(c);else{const r=RN.find(r=>Math.max(Math.abs(r.x-P.x),Math.abs(r.y-P.y))<=1);if(r)hitR(r)}}}
 if(tile(P.x,P.y)==17){if(P.x>=19990){const homeTown=(Number.isInteger(P.home)&&TW[P.home])?TW[P.home]:TW[0],fallback=findTownSpawn(homeTown),r=Array.isArray(P.rt)?P.rt:fallback,rtown=r&&inTown(r[0],r[1])||homeTown,safe=r&&findSafeWorldPosition(r[0],r[1],rtown)||fallback;if(safe){P.x=safe[0];P.y=safe[1]}setRoom(-1,0)}else{const rh=ruralAt(P.x,P.y),ty=rh&&rh.x==P.x&&rh.y+1==P.y?rh.t:-1,previousX=P.lx??P.x,previousY=P.ly??P.y;P.rt=findSafeWorldPosition(previousX,previousY,inTown(previousX,previousY))||findSafeWorldPosition(P.x,P.y,inTown(P.x,P.y))||findTownSpawn((Number.isInteger(P.home)&&TW[P.home])?TW[P.home]:TW[0]);setRoom(ty,nearestTown().t.i);P.x=20003;P.y=20003;if(ty>=0)msg('Você entrou: '+RT[ty].n+'.','#e2b04a')}P.dx=P.x;P.dy=P.y;mons.length=0;P.mv=.3}
 const t=inTown(P.x,P.y);if(t&&t.i!=P.tw){P.tw=t.i;P.home=t.i;G.bn=3;G.bt=t.n}if(!t)P.tw=-1;
 P.hp=Math.min(mh(),P.hp+dt*(t?3:.3));
 G.sp=(G.sp||0)-dt;if(G.sp<=0){const beyond=P.y<-656;G.sp=beyond?1.5:4.0;spawn()}
 for(let i=mons.length-1;i>=0;i--){const m=mons[i],d=MT[m.t];if(Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))>40){mons.splice(i,1);continue}
  m.mv-=dt;m.cd-=dt;const ex=P.x-m.x,ey=P.y-m.y,dist=Math.max(Math.abs(ex),Math.abs(ey));
  if(dist<=1){if(m.cd<=0&&!t){m.cd=1.2;triggerAttack(m,P.x,P.y,'#ff765f');const h=Math.max(1,Math.round(d.d+Math.floor(Math.random()*5)-defV()/2));P.hp-=h;['a','s','hd'].forEach(wear);fx(P.x,P.y,'-'+h,'#ff6b5f');if(P.hp<=0){die();return}}}
  else if(m.mv<=0){m.mv=d.sp;let sx=0,sy=0;if(dist<8){if(Math.abs(ex)>=Math.abs(ey))sx=Math.sign(ex);else sy=Math.sign(ey)}else if(Math.random()<.4){const r=Math.random()*4|0;sx=[1,-1,0,0][r];sy=[0,0,1,-1][r]}
   const ok=(a,b)=>(a||b)&&free(m.x+a,m.y+b)&&!(m.x+a==P.x&&m.y+b==P.y)&&!inTown(m.x+a,m.y+b)&&tile(m.x+a,m.y+b)!=20;
   if(ok(sx,sy)){m.x+=sx;m.y+=sy}else if(dist<8){const a2=sx?0:Math.sign(ex),b2=sy?0:Math.sign(ey);if(ok(a2,b2)){m.x+=a2;m.y+=b2}}}
  m.dx+=(m.x-m.dx)*Math.min(1,dt*10);m.dy+=(m.y-m.dy)*Math.min(1,dt*10);m.ht-=dt}
 czUpd(dt);rnUpd(dt);updateWorldDrops(dt);for(let i=fxs.length-1;i>=0;i--){fxs[i].l-=dt;if(fxs[i].l<=0)fxs.splice(i,1)}G.bn-=dt}
/* ===== desenho ===== */
/** Desenha uma textura pelo nome no tile atual. */
function TD(n,X,Y,s,context=cx){const i=TX[n];if(!i||!i.naturalWidth)return 0;context.drawImage(i,X,Y,s+1,s+1);return 1}
/** Desenha o tile com as texturas de assets/westeros (variantes 8:1, água animada). Devolve 0 se faltar imagem. */
function texDraw(t,x,y,X,Y,s,context=cx){context.imageSmoothingEnabled=false;const a=n=>TD(n,X,Y,s,context);if(!a('grama'))return 0;
 const I=x>=19990,sn=y<-61,dz=y>1400,h=H(x,y,21),tw=(t>=12&&t<=17)&&!I?inTown(x,y):0,wk=tw&&(tw.k=='cb'||tw.k=='hh')?'tijolon':tw&&tw.k=='pr'?'tijolo':'pedregulho';
 const gr=()=>sn?a('neve'):dz?a('areiadeserto'):a(h<.0555?'grama2':h<.111?'grama3':'grama');
 const water=()=>{const phase=performance.now()/(WATER_MS*2)+H(x,y,9)*3,step=Math.floor(phase),frame=step%3,part=phase-step,blend=part>.5?.5-.5*Math.cos((part-.5)*Math.PI*2):0,names=['agua','agua1','agua2'];a(names[frame]);if(blend){context.globalAlpha=blend;a(names[(frame+1)%3]);context.globalAlpha=1}};
 switch(t){
 case 0:case 7:water();return 1;
 case 1:if(dz)return a('areiadeserto');return a(h<.111?'areia2':'areia');
 case 2:return gr();
 case 3:gr();return a(sn?'pinheiro':dz?'palmeira':'carvalho');
 case 4:return a('neve');
 case 10:a('neve');return a('pinheiro');
 case 5:return a('montanha');
 case 11:a('montanha');return a('minerio');
 case 6:return a('estrada');
 case 8:case 14:return(I&&t==14)?a('tabuas'):a(h<.111?'palA':'palN');
 case 9:{const material=window.creativeEdits?.get(`${x},${y}`)?.material;if(material==='telhas')return a('telhas');const b=tile(x,y+1);return a(b==9||b==17?'telhas':'tijolom')}
 case 12:return a(I?'tijolom':wk);
 case 13:a(wk);context.fillStyle='rgba(0,0,0,.4)';context.fillRect(X+s*.2,Y+s*.15,s*.6,s*.85);return 1;
 case 15:a('tabuas');context.fillStyle='rgba(30,16,8,.45)';context.fillRect(X+s*.44,Y,s*.14+1,s+1);return 1;
 case 16:if(window.creativeEdits?.get(`${x},${y}`)?.material==='porto')return a('porto');if(!tw&&!I&&riverAt(x,y))water();return a('tabuas');
 case 17:a('tijolom');return a('porta');
 case 18:a('neve');context.fillStyle='rgba(120,180,220,.45)';context.fillRect(X,Y,s+1,s+1);return 1;
 case 20:case 21:{water();context.fillStyle=t==20?'rgba(190,225,200,.30)':'rgba(5,30,80,.22)';context.fillRect(X,Y,s+1,s+1);if(t==20&&H(x,y,61)>.7){context.fillStyle='rgba(255,255,255,.35)';context.fillRect(X+s*.3,Y+s*.5,s*.12,s*.08)}return 1}
 case 19:a('tabuas');return a('bau')}
 return 0}
/** Contexto passado do draw() para texSpr (latitude, direção, gênero, tipo). */
const SPX={y:0,f:0,g:'m',v:'campones'};
/** Desenha o sprite de personagem/monstro (região Norte/Campo/Dorne pela latitude). Monstros grandes usam 64x64. */
function texSpr(k,X,Y,s){let n;const g=SPX.g,rg=SPX.y<-61?'norte':SPX.y>1400?'dorne':'campo';
 if(k=='p')n={S:'stark',L:'lennister',T:'targeryan',B:'baratheon'}[P.h];else if(k=='f')n='ferreiro_'+g+'_'+rg;else if(k=='m')n='mercador_'+g+'_'+rg;else if(k=='e')n='taverneiro_'+g+'_'+rg;else if(k=='pr')n='sacerdote_'+g+'_'+rg;else if(k=='h'||k=='bt')n='viajante_'+g+'_'+rg;else if(k=='lord'||k=='gate')n=k=='gate'?'soldado_m_norte':'soldado_'+g+'_'+rg;
 else if(k=='sd')n='guarda_'+g+'_'+rg;else if(k=='cit')n=SPX.v+'_'+g+'_'+rg;else if(k=='lobo')n='lobo_'+(SPX.f?'dir':'esq');else if(k=='auroque')n='auroque_'+(SPX.f?'dir':'esq');else if(k=='lagarto_leao')n='lagarto_leao_'+(SPX.f?'dir':'esq');else if(k=='urso')n='urso_'+(SPX.f?'dir':'esq');else if(k=='band')n='renegado_'+rg;else if(k=='renegado')n='renegado_'+rg;else if(k=='criminoso')n='criminoso_'+rg;else if(k=='montanhes')n='montanhes_'+rg;else if(k=='selvagem')n='selvagem_norte';else if(k=='wight')n='zumbi_1_campones_'+rg;else if(k=='wight_soldado')n='zumbi_3_soldado_'+rg;else if(k=='wight_nobre')n='zumbi_4_nobre_'+rg;else if(k=='walker')n='caminhante_branco_norte';else if(k=='lobog')n='lobo_gigante_'+(SPX.f?'dir':'esq');else if(k=='urso_gigante')n='urso_gigante_'+(SPX.f?'dir':'esq');else if(k=='mamute')n='mamute_'+(SPX.f?'dir':'esq');else if(k=='gigante')n='gigante';else if(k=='gzumbi')n='gigante_zumbi_norte';
 const i=n&&TX[n];if(!i||!i.naturalWidth)return 0;cx.imageSmoothingEnabled=false;const bg=MT[k]&&MT[k].big;cx.drawImage(i,bg?X-s/2:X,bg?Y-s:Y,bg?s*2:s,bg?s*2:s);if(k=='p')drawPlayerEquipment(X,Y,s);return 1}
function drawPlayerEquipment(X,Y,s){
 const shield=TX[INVENTORY_ICONS[SH[P.s].n]],weaponName=P.activeTool&&toolLevel(P.activeTool)?P.activeTool:P.toolAction&&P.toolAction.until>G.t?P.activeTool:W[P.w].n,weaponIcon=inventoryIcon(weaponName),weapon=weaponIcon&&TX[weaponIcon];
 cx.imageSmoothingEnabled=false;
 if(shield?.naturalWidth)cx.drawImage(shield,X-s*.13,Y+s*.38,s*.58,s*.58);
 if(weapon?.naturalWidth&&weaponName!='Punhos'&&(!P.toolAction||P.toolAction.until<=G.t))cx.drawImage(weapon,X+s*.58,Y+s*.38,s*.58,s*.58);
}
/** Desenha um tile: tenta texDraw() e, se faltar textura, usa o desenho antigo em cores. */
function tileDraw(x,y,X,Y,s,context=cx){const t=tile(x,y),sn=y<-61;if(texDraw(t,x,y,X,Y,s,context))return;context.fillStyle=(t==3||t==10)?(sn?COL[4]:COL[2]):COL[t];context.fillRect(X,Y,s+1,s+1);context.fillStyle='rgba(0,0,0,'+H(x,y,7)*.09+')';context.fillRect(X,Y,s+1,s+1);
 const u=s/16,r=(a,b,w,h,c)=>{context.fillStyle=c;context.fillRect(X+a*u,Y+b*u,w*u,h*u)};
 if(t==0){if(((x*3+y+(G.t*1.5|0))&3)==0)r(3,6,8,1,'#ffffff30')}
 else if(t==2){if(H(x,y,5)>.8){r(6,7,1,3,'#3e6e2e');r(9,8,1,2,'#3e6e2e')}}
 else if(t==3){r(7,9,2,5,'#5a3a20');r(3,1,10,9,'#2f6a30');r(5,0,6,3,'#3d8240')}
 else if(t==10){r(7,11,2,4,'#4a3320');r(4,7,8,4,'#1f4d36');r(5,3,6,5,'#28603f');r(7,0,2,4,'#dfeaf0')}
 else if(t==12){r(0,5,16,1,'#0004');r(0,11,16,1,'#0004');r(4,0,1,5,'#0004');r(11,5,1,6,'#0004')}
 else if(t==13){r(2,2,12,14,'#4a4d55');r(2,0,3,3,'#4a4d55');r(7,0,3,3,'#4a4d55');r(12,0,2,3,'#4a4d55');r(6,7,4,5,'#17181c')}
 else if(t==14){r(0,0,16,1,'#0003');r(0,0,1,16,'#0003');r(8,4,1,12,'#0002')}
 else if(t==15){r(1,0,14,16,'#5b3d22');r(7,0,2,16,'#2a1c12');r(1,4,14,1,'#8a6a3c');r(1,11,14,1,'#8a6a3c')}
 else if(t==16){r(0,4,16,1,'#5a3f22');r(0,10,16,1,'#5a3f22')}
 else if(t==17){r(5,3,6,13,'#2a1c12');r(9,9,1,1,'#e8c56a')}
 else if(t==18){r(0,2,16,2,'#ffffff80');r(2,9,12,2,'#ffffff60');r(5,0,2,16,'#9ec4de50')}
 else if(t==11){r(1,4,14,11,'#6a6e76');r(5,0,6,6,'#8a8f98');r(3,7,3,3,'#e2b04a');r(9,9,3,3,'#c9733a');r(8,4,2,2,'#8fd0f0')}
 else if(t==5){r(1,4,14,11,'#6a6e76');r(5,0,6,6,'#8a8f98');r(6,0,4,2,'#eef')}
 else if(t==6){r(2,3,2,2,'#8a7148');r(9,9,3,2,'#8a7148')}
 else if(t==7){r(0,7,16,1,'#0006');r(0,0,16,2,'#c9d6e3');r(4,0,1,7,'#0004');r(11,8,1,8,'#0004')}
 else if(t==8){r(0,0,16,1,'#0002');r(0,0,1,16,'#0002')}
 else if(t==9){r(0,0,16,9,'#9c3d2e');r(0,9,16,7,'#6a4a32');r(6,9,3,7,'#2a1c12');r(2,10,3,3,'#e8c56a')}}
const TERRAIN_CHUNK_TILES=8,TERRAIN_CHUNK_LIMIT=24,TERRAIN_CACHE_BYTES=32*1024*1024,terrainChunks=new Map();
let terrainChunkBytes=0;
function invalidateTerrain(){terrainChunks.clear();terrainChunkBytes=0}
for(const image of Object.values(TX))image.addEventListener('load',invalidateTerrain,{once:true});
function terrainChunk(chunkX,chunkY,s,si){
 const startX=chunkX*TERRAIN_CHUNK_TILES,startY=chunkY*TERRAIN_CHUNK_TILES,scale=Math.round(s*1000),key=`${startX},${startY},${scale}`;
 let chunk=terrainChunks.get(key);
 if(!chunk){
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(TERRAIN_CHUNK_TILES*s)+si+1;
  canvas.height=Math.ceil(TERRAIN_CHUNK_TILES*s)+si+1;
  chunk={canvas,context:canvas.getContext('2d'),startX,startY,waterFrame:-1,rendered:false,animated:false};
  terrainChunks.set(key,chunk);
  terrainChunkBytes+=canvas.width*canvas.height*4;
  while(terrainChunks.size>TERRAIN_CHUNK_LIMIT||terrainChunkBytes>TERRAIN_CACHE_BYTES){
   const oldestKey=terrainChunks.keys().next().value,oldest=terrainChunks.get(oldestKey);
   terrainChunkBytes-=oldest.canvas.width*oldest.canvas.height*4;
   terrainChunks.delete(oldestKey);
  }
 }
 const waterFrame=Math.floor(performance.now()/33);
 if(!chunk.rendered||chunk.animated&&chunk.waterFrame!==waterFrame){
  const context=chunk.context;
  context.clearRect(0,0,chunk.canvas.width,chunk.canvas.height);
  chunk.animated=false;
  for(let y=0;y<TERRAIN_CHUNK_TILES;y++)for(let x=0;x<TERRAIN_CHUNK_TILES;x++){
   const tileX=startX+x,tileY=startY+y,t=tile(tileX,tileY);
   if(t===0||t===7||t===16||t===20||t===21)chunk.animated=true;
   tileDraw(tileX,tileY,Math.floor(x*s),Math.floor(y*s),si,context);
  }
  chunk.waterFrame=waterFrame;
  chunk.rendered=true;
 }
 return chunk;
}
function drawTerrain(x0,y0,x1,y1,s,si,ox,oy){
 const minChunkX=Math.floor(x0/TERRAIN_CHUNK_TILES),maxChunkX=Math.floor(x1/TERRAIN_CHUNK_TILES),minChunkY=Math.floor(y0/TERRAIN_CHUNK_TILES),maxChunkY=Math.floor(y1/TERRAIN_CHUNK_TILES);
 for(let chunkY=minChunkY;chunkY<=maxChunkY;chunkY++)for(let chunkX=minChunkX;chunkX<=maxChunkX;chunkX++){
  const chunk=terrainChunk(chunkX,chunkY,s,si);
  cx.drawImage(chunk.canvas,Math.floor(chunk.startX*s+ox),Math.floor(chunk.startY*s+oy));
 }
}
/** Desenha uma entidade: sombra + sprite de arquivo ou desenho procedural de reserva. */
function spr(k,X,Y,s,c){const u=s/16,r=(a,b,w,h,q)=>{cx.fillStyle=q;cx.fillRect(X+a*u,Y+b*u,w*u,h*u)};r(3,13,10,2,'#0005');
 const hu=(bd,hd,ac,ey)=>{r(5,11,2,4,'#2a2018');r(9,11,2,4,'#2a2018');r(4,6,8,6,bd);r(5,2,6,5,hd);r(5,1,6,2,ac);if(ey){r(6,4,1,1,ey);r(9,4,1,1,ey)}};
 if(texSpr(k,X,Y,s)){}
 else if(k=='horse'){r(1,8,11,6,'#704522');r(3,5,8,6,'#9b6634');r(10,4,4,5,'#9b6634');r(13,3,2,3,'#4d2f1d');r(12,4,1,1,'#17120e');r(2,13,2,3,'#4d2f1d');r(6,13,2,3,'#4d2f1d');r(10,13,2,3,'#4d2f1d');r(4,7,7,2,'#4a2d1c');r(5,6,5,1,'#d2a85a');r(1,9,2,2,'#4d2f1d');r(11,6,2,1,'#4d2f1d');r(3,4,2,2,'#4d2f1d');r(5,3,1,2,'#4d2f1d')}
 else if(k=='p'){hu(c,'#e7c39c','#3a2a1a');r(12,4,1,8,'#e6e6ee');r(11,10,3,1,'#a08040')}
 else if(k=='f'){hu('#5a4a3a','#d2a67e','#222');r(5,8,6,4,'#8b8b90');r(12,3,3,3,'#555')}
 else if(k=='m'){hu('#3b6ea5','#e0b58c','#c9a227');r(11,7,3,4,'#8a5a2c')}
 else if(k=='e'){hu('#7a3b3b','#e0b58c','#eee');r(3,8,2,3,'#d9d9d9')}
 else if(k=='pr'){hu('#d9d9d9','#e0b58c','#eee');r(12,3,2,9,'#e2b04a')}
 else if(k=='cit'||k=='h'||k=='bt'){hu(c||'#6a8a5a','#e0b58c','#5a3a20')}
 else if(k=='sd'||k=='lord'||k=='gate'){hu('#2c3038','#e0b58c','#5a6068');r(12,2,1,10,'#ccc');r(11,2,3,2,'#ccc')}
 else if(MT[k]&&MT[k].big){r(0,2,16,12,'#6b5a4a');r(2,0,5,4,'#8a7a6a');r(12,3,2,2,'#f33')}
 else if(k=='lobo'||k=='urso'||k=='auroque'||k=='lagarto_leao'){r(2,8,10,5,'#8a8f98');r(11,6,4,4,'#a2a8b0');r(12,7,1,1,'#f33');r(3,12,2,3,'#6b7078');r(9,12,2,3,'#6b7078');r(1,8,2,2,'#6b7078')}
 else if(k=='band'||k=='criminoso'||k=='renegado'||k=='montanhes'||k=='selvagem'){hu('#5b4632','#c8a07a','#111');r(5,4,6,2,'#222');r(12,6,1,6,'#bbb')}
 else if(k=='wight'||k=='wight_soldado'||k=='wight_nobre'){hu('#4c6a7c','#b8d0dc','#3a5060','#6cf')}
 else if(k=='walker'){hu('#cfe6f5','#e8f5ff','#8fd0f0','#2af');r(4,0,1,2,'#8fd0f0');r(7,0,2,2,'#8fd0f0');r(11,0,1,2,'#8fd0f0');r(12,4,1,9,'#aee')}
 else{hu('#6a8a5a','#e0b58c','#5a3a20')}}
function treeSpr(t,X,Y,s){const i=TX[t.kind],k=kk(t.x,t.y),hitAt=treeHitFx.get(k),age=hitAt===undefined?Infinity:G.t-hitAt,fall=treeFallFx.get(k),fallAge=fall?G.t-fall.start:0;cx.imageSmoothingEnabled=false;if(fall&&fallAge>=.85){markTerrainCut(t.x,t.y);invalidateTerrain();treeFallFx.delete(k);treeHitFx.delete(k);return}cx.save();if(fall){const progress=Math.min(1,fallAge/.85),angle=fall.direction*Math.PI*.5*progress*progress;cx.translate(X+s*t.size/2,Y+s*t.size);cx.rotate(angle);if(i&&i.naturalWidth)cx.drawImage(i,-s*t.size/2,-s*t.size,s*t.size,s*t.size);else{cx.fillStyle=t.kind=='pinheiro'?'#31583c':t.kind=='cacto'?'#5d8c3d':'#3f783d';cx.fillRect(-s*t.size*.25,-s*t.size*.9,s*t.size*.5,s*t.size*.8)}}else{const shake=age<.3?Math.sin(age*75)*(1-age/.3)*s*.12:0;if(i&&i.naturalWidth)cx.drawImage(i,X+shake,Y,s*t.size,s*t.size);else{cx.fillStyle=t.kind=='pinheiro'?'#31583c':t.kind=='cacto'?'#5d8c3d':'#3f783d';cx.fillRect(X+shake+s*.25,Y+s*.1,s*t.size*.5,s*t.size*.8)}}cx.restore()}
/** Renderiza o quadro: terreno, árvores e entidades ordenadas por ponto de contato, textos e efeitos. */
function draw(dt){const w=cv.width,h=cv.height,interior=P.x>=19990,s=interior?Math.min(w/7,h/5):sc(),si=Math.ceil(s),ox=interior?(w-7*s)/2-20000*s:w/2-s/2-P.dx*s,oy=interior?(h-5*s)/2-20000*s:h/2-s/2-P.dy*s;
 const x0=interior?20000:Math.floor(P.dx-w/2/s)-1,x1=interior?20006:Math.ceil(P.dx+w/2/s)+1,y0=interior?20000:Math.floor(P.dy-h/2/s)-1,y1=interior?20004:Math.ceil(P.dy+h/2/s)+1;
 if(interior){cx.fillStyle='#0b0e14';cx.fillRect(0,0,w,h)}
 drawTerrain(x0,y0,x1,y1,s,si,ox,oy);
 if(!interior){
  for(const bush of bushesInView(x0,y0,x1,y1)){
   const X=Math.floor(bush.x*s+ox),Y=Math.floor((bush.y+1-bush.size)*s+oy),size=s*bush.size,image=TX.arbusto;
   if(image?.naturalWidth){cx.imageSmoothingEnabled=false;cx.drawImage(image,X,Y,size,size)}
   else{cx.fillStyle='#315c35';cx.fillRect(X+size*.15,Y+size*.38,size*.7,size*.48);cx.fillStyle='#477a42';cx.fillRect(X+size*.28,Y+size*.2,size*.45,size*.42)}
  }
  const boat=P.boatAt;
  if(boat&&(boat.x+2>=x0&&boat.x<=x1&&boat.y+2>=y0&&boat.y<=y1)){
   const[offsetX,offsetY]=boatSeatOffset[boat.dir]||boatSeatOffset.S,boatX=P.boatMounted?P.dx-offsetX:boat.x,boatY=P.boatMounted?P.dy-offsetY:boat.y,boatImage=TX[`barco_${boat.dir}`];
   if(boatImage?.naturalWidth){cx.imageSmoothingEnabled=false;cx.drawImage(boatImage,Math.floor(boatX*s+ox),Math.floor(boatY*s+oy),s*3,s*3)}
   else{cx.fillStyle='#704522';cx.fillRect(Math.floor(boatX*s+ox+s*.25),Math.floor(boatY*s+oy+s*.25),s*2.5,s*2.5)}
  }
 }
 const es=[...NP.filter(n=>n.x>=x0&&n.x<=x1&&n.y>=y0&&n.y<=y1).map(n=>({k:n.k,dx:n.x,dy:n.y,n:n.n,g:n.g})),...mons.map(m=>({k:m.t,dx:m.dx,dy:m.dy,m,actor:m})),...CZ.filter(c=>!c.in).map(c=>({k:c.k,dx:c.dx,dy:c.dy,c:c.col,g:c.g,v:c.v,n:c.pn||(c.k=='sd'?'Guarda':null),actor:c})),...RN.map(r=>({k:'cit',dx:r.dx,dy:r.dy,g:r.g,v:r.v,c:'#6a8a5a',n:r.n,actor:r})),...treesInView(x0,y0,x1,y1).map(tree=>({k:'tree',tree,dx:tree.x+tree.size/2,dy:tree.y+tree.size-1-.5})),...worldDrops.filter(drop=>drop.x>=x0-1&&drop.x<=x1+1&&drop.y>=y0-1&&drop.y<=y1+1).map(drop=>({k:'drop',drop,dx:drop.x,dy:drop.y})),...(P.mounted?[{k:'horse',dx:P.dx-.02,dy:P.dy-.20,s:si*1.08}]:[]),{k:'p',dx:P.dx+.02,dy:P.dy-.20,c:HC[P.h],p:1,mounted:P.mounted,actor:P}].sort((a,b)=>a.dy-b.dy||((a.k=='tree'?0:1)-(b.k=='tree'?0:1)));
 cx.textAlign='center';cx.font='600 11px system-ui,sans-serif';
 for(const e of es){const X=Math.floor(e.dx*s+ox),Y=Math.floor(e.dy*s+oy);if(e.k=='tree'){treeSpr(e.tree,Math.floor(e.tree.x*s+ox),Math.floor(e.tree.y*s+oy),si);continue}if(e.k=='drop'){const drop=e.drop,icon=drop.name==='gold'?'item_gold_coin':inventoryIcon(drop.name==='pot'?'pot':drop.name),image=icon&&TX[icon],size=si*.72,drawY=Y+si*.14-drop.z*si;cx.fillStyle='#0007';cx.beginPath();cx.ellipse(X+si*.5,Y+si*.82,si*.27,si*.1,0,0,Math.PI*2);cx.fill();if(image?.naturalWidth){cx.imageSmoothingEnabled=false;cx.drawImage(image,X+(si-size)/2,drawY,size,size)}else{cx.fillStyle=drop.name==='gold'?'#f0c84b':'#9a7147';cx.fillRect(X+si*.3,drawY+si*.3,si*.4,si*.4)}if(drop.count>1){cx.font=`700 ${Math.max(9,si*.32)}px system-ui,sans-serif`;cx.textAlign='right';cx.lineWidth=2;cx.strokeStyle='#21180d';cx.strokeText(String(drop.count),X+si*.93,Y+si*.94);cx.fillStyle='#fff4c2';cx.fillText(String(drop.count),X+si*.93,Y+si*.94);cx.textAlign='center'}continue}SPX.y=e.dy;SPX.f=P.dx>e.dx;SPX.g=e.g||(H(Math.round(e.dx),Math.round(e.dy),41)>.5?'f':'m');SPX.v=e.v;const attack=e.actor?.attack,attackAge=attack?G.t-attack.at:1,attackActive=attackAge>=0&&attackAge<.34;if(attackActive){const progress=attackAge/.34,lunge=Math.sin(progress*Math.PI)*s*.28;cx.save();cx.translate(X+s/2+attack.dx*lunge,Y+s);cx.rotate(attack.dx&&attack.dy?attack.dx*-.14:attack.dx*.22-attack.dy*.12);cx.translate(-X-s/2,-Y-s)}if(e.k==='p'&&!P.boatMounted&&isWaterTile(tile(P.x,P.y))){cx.save();cx.beginPath();cx.rect(X,Y,si,si*.67);cx.clip();spr(e.k,X,Y,e.s||si,e.c);cx.restore();cx.fillStyle='rgba(52,142,164,.38)';cx.fillRect(X,Y+si*.65,si,si*.35);cx.fillStyle='rgba(193,237,233,.58)';cx.fillRect(X+si*.12,Y+si*.65,si*.32,Math.max(1,si*.035))}else spr(e.k,X,Y,e.s||si,e.c);
  if(e.k=='p'&&P.toolAction&&P.toolAction.until>G.t){const hand=P.f[0]<0?'L':'R',held=TX[`held_${P.toolAction.sprite}_${P.toolAction.level}_${hand}`];if(held?.naturalWidth){const offset=hand=='L'?.02:.48;cx.drawImage(held,X+s*offset,Y+s*.34,s*.52,s*.52)}}if(attackActive)cx.restore();
  if(e.n&&Math.abs(e.dx-P.dx)<=7&&Math.abs(e.dy-P.dy)<=7){cx.fillStyle='#000a';cx.fillText(e.n,X+s/2+1,Y-3);cx.fillStyle='#ffe9a8';cx.fillText(e.n,X+s/2,Y-4)}
  if(e.m){const d=MT[e.m.t],Yb=Y-(d.big?s:0);cx.fillStyle='#000a';cx.fillRect(X+s*.1,Yb-6,s*.8,5);cx.fillStyle=e.m.ht>0?'#fff':'#d9463c';cx.fillRect(X+s*.1+1,Yb-5,(s*.8-2)*Math.max(0,e.m.hp/d.hp),3);cx.fillStyle='#fff';cx.fillText(d.n,X+s/2,Yb-9)}}
 for(let i=attackFx.length-1;i>=0;i--){const hit=attackFx[i],age=G.t-hit.at,duration=.24;if(age>=duration){attackFx.splice(i,1);continue}const progress=age/duration,alpha=1-progress,x=hit.x*s+ox+s/2,y=hit.y*s+oy+s*.52,reach=s*(.2+.46*progress),dx=hit.dx,dy=hit.dy,sideX=-dy,sideY=dx;cx.save();cx.globalAlpha=alpha;cx.lineCap='round';cx.shadowColor=hit.color;cx.shadowBlur=s*.28;cx.strokeStyle=hit.color;cx.lineWidth=Math.max(2,s*.11);cx.beginPath();cx.moveTo(x-dx*reach*.55-sideX*reach*.5,y-dy*reach*.55-sideY*reach*.5);cx.lineTo(x+dx*reach*.45+sideX*reach*.5,y+dy*reach*.45+sideY*reach*.5);cx.stroke();cx.shadowBlur=0;cx.fillStyle='#fff4c2';cx.beginPath();cx.arc(x+dx*s*.16,y+dy*s*.16,Math.max(1,s*.08*(1-progress*.5)),0,Math.PI*2);cx.fill();for(let particle=0;particle<3;particle++){const spread=(particle-1)*.22,travel=progress*s*.45;cx.fillStyle=hit.color;cx.fillRect(x+dx*travel+sideX*spread*s-s*.035,y+dy*travel+sideY*spread*s-s*.035,Math.max(1,s*.07*(1-progress)),Math.max(1,s*.07*(1-progress)))}cx.restore()}
 if(P.x<19000)for(let i=Math.floor(x0/RCELL);i<=Math.floor(x1/RCELL);i++)for(let j=Math.floor(y0/RCELL);j<=Math.floor(y1/RCELL);j++){const r=ruralCell(i,j);if(!r)continue;const lx=Math.floor(r.x*s+ox)+s/2,ly=Math.floor((r.y-1)*s+oy)-4;cx.fillStyle='#000a';cx.fillText(RT[r.t].n,lx+1,ly+1);cx.fillStyle='#d8f0c0';cx.fillText(RT[r.t].n,lx,ly)}
 for(const f of fxs){cx.globalAlpha=Math.min(1,f.l*1.5);cx.fillStyle=f.c;cx.font='800 15px system-ui,sans-serif';cx.fillText(f.t,f.x*s+ox+s/2,f.y*s+oy+s/2-s*.4-(1-f.l)*30)}cx.globalAlpha=1;
 const dk=.5-.5*Math.cos(G.t/150*6.283);cx.fillStyle='rgba(8,12,40,'+(.5*dk*dk)+')';cx.fillRect(0,0,w,h);
 if(P.dy<-58){cx.fillStyle='#fffc';for(let i=0;i<70;i++){const x=((H(i,1)*w+G.t*14*((i%3)-1))%w+w)%w,y=((H(i,2)*h+G.t*(40+H(i,3)*40))%h+h)%h;cx.fillRect(x,y,2,2)}}
 if(P.x<19000){
  const northTint=Math.max(0,Math.min(1,(-P.dy-80)/420)),southTint=Math.max(0,Math.min(1,(P.dy-950)/550));
  if(northTint){cx.fillStyle=`rgba(72,137,205,${northTint*.16})`;cx.fillRect(0,0,w,h)}
  if(southTint){cx.fillStyle=`rgba(222,157,67,${southTint*.17})`;cx.fillRect(0,0,w,h)}
 }
 if(G.bn>0){cx.globalAlpha=Math.min(1,G.bn);cx.font='800 30px Cinzel,Georgia,serif';cx.fillStyle='#000a';cx.fillText(G.bt,w/2+2,102);cx.fillStyle='#e2b04a';cx.fillText(G.bt,w/2,100);cx.globalAlpha=1}}
/** Contexto do minimapa e cores MMC por id de tile. */
let inventorySignature='';
const INVENTORY_ICONS={pot:'item_potion','Poção de Cura':'item_potion','Poção de cura':'item_potion',Madeira:'item_wood','Minério de Ferro':'item_iron','Minério de Cobre':'item_copper','Minério de Prata':'item_silver',Peixe:'item_fish',Carne:'item_meat',Trigo:'item_wheat','Pele de Lobo':'item_wolf_pelt','Pele de Urso':'item_bear_pelt','Presa de Mamute':'item_mammoth_tusk','Osso de Gigante':'item_giant_bone','Osso Amaldiçoado':'item_cursed_bone','Adaga Enferrujada':'item_dagger','Coração Gelado':'item_ice','Vidro de Dragão':'item_dragonglass','Escama de Dragão':'item_dragon_scale','Relíquia Antiga':'item_antique_relic','Machado de Corte':'item_axe',Picareta:'item_pickaxe','Vara de Pescar':'item_fishing_rod','Flor Azul':'item_blue_flower',Flecha:'item_arrow','Moeda de Ouro':'item_gold_coin',Punhos:'item_fists',Adaga:'item_dagger','Espada Longa':'item_long_sword','Espada de Aço':'item_steel_sword','Aço Valiriano':'item_valyrian_steel',Roupas:'item_clothes','Gibão de Couro':'item_leather_armor','Cota de Malha':'item_chainmail','Armadura de Placas':'item_plate_armor','Armadura Valiriana':'item_valyrian_armor','Capuz de Couro':'item_leather_hood','Elmo de Ferro':'item_iron_helmet','Escudo de Madeira':'item_wooden_shield','Escudo de Ferro':'item_iron_shield'};
const ownedGear=t=>{const key=EQUIP_OWNERS[t];if(!key)return P.ow;P[key]=[...new Set([0,P[t],...(Array.isArray(P[key])?P[key]:[])].filter(i=>Number.isInteger(i)&&i>=0&&i<IT[t].length))];return P[key]};
const inventoryIcon=name=>TOOLS[name]&&toolLevel(name)?`inventory_${TOOLS[name].sprite}_${toolLevel(name)}`:INVENTORY_ICONS[name];
function renderInventory(){
 const items=Object.entries(P.inv).filter(([,count])=>count>0).map(([name,count])=>({id:`inv:${encodeURIComponent(name)}`,name,count}));
 for(const t of['w','a','s','hd'])for(const i of ownedGear(t))if(i>0)items.push({id:`gear:${t}:${i}`,name:IT[t][i].n,count:1,gear:true});
 const signature=items.map(item=>`${item.id}:${item.count}`).join('|')+JSON.stringify([P.w,P.a,P.s,P.hd,P.activeTool,Object.values(TOOLS).map(tool=>P[tool.slot])]);
 $('inv-weight').textContent=`${wt().toFixed(1)} kg / ${P.mw} kg`;
 if(signature===inventorySignature)return;
 inventorySignature=signature;
 const slotCount=Math.max(12,Math.ceil(items.length/4)*4);
 $('inventory-grid').innerHTML=Array.from({length:slotCount},(_,index)=>{const item=items[index];if(!item)return'<div class="inventory-slot" aria-hidden="true"></div>';const {id,name,count}=item,level=toolLevel(name),label=name=='pot'?'Poção de cura':level?`${name} · N${level}`:name,icon=inventoryIcon(name),src=icon&&ASSET_MANIFEST[icon];return`<div class="inventory-slot inventory-item" data-item-id="${id}" draggable="true" role="img" aria-label="${label} · ${count}" title="${label}"><img class="item-icon" src="${src||''}" alt=""${src?'':' hidden'}><span class="item-count">${count}</span></div>`}).join('');
 renderEquipmentSlots();
}
function renderEquipmentSlots(){
 const handName=P.activeTool&&toolLevel(P.activeTool)?P.activeTool:W[P.w].n;
 const slots={hd:{name:HE[P.hd].n,id:P.hd?`gear:hd:${P.hd}`:''},a:{name:A[P.a].n,id:P.a?`gear:a:${P.a}`:''},w:{name:handName,id:P.activeTool&&toolLevel(P.activeTool)?`inv:${encodeURIComponent(P.activeTool)}`:P.w?`gear:w:${P.w}`:''},s:{name:SH[P.s].n,id:P.s?`gear:s:${P.s}`:''}};
 for(const[slot,item]of Object.entries(slots)){const element=document.querySelector(`[data-equip="${slot}"]`),icon=inventoryIcon(item.name),src=icon&&ASSET_MANIFEST[icon],category=element.querySelector('.equipment-label').textContent;element.dataset.itemId=item.id;element.draggable=!!item.id;element.title=item.name=='(nenhum)'?category:item.name;element.setAttribute('aria-label',element.title);element.innerHTML=`${src?`<img class="item-icon" src="${src}" alt="">`:''}<span class="equipment-label">${category}</span>`}
}
function equipInventoryItem(id,slot){
 if(id.startsWith('gear:')){const[,type,indexText]=id.split(':'),index=Number(indexText);if(type!==slot||!ownedGear(type).includes(index))return false;P[type]=index;if(type=='w'){P.du.w=P.wd[index]??100;P.activeTool=null}else P.du[type]=P.du[type]??100;return true}
 if(!id.startsWith('inv:')||slot!=='w')return false;
 const name=decodeURIComponent(id.slice(4));if(!P.inv[name])return false;
 if(TOOLS[name]&&toolLevel(name)){P.activeTool=name;return true}
 const index=W.findIndex((item,i)=>i>0&&item.n===name);if(index>0&&P.ow.includes(index)){P.w=index;P.du.w=P.wd[index]??100;P.activeTool=null;return true}
 return false
}
function unequipInventoryItem(id){
 if(id.startsWith('gear:')){const[,type,indexText]=id.split(':'),index=Number(indexText);if(!['w','a','s','hd'].includes(type)||!Number.isInteger(index)||P[type]!==index||index===0)return false;P[type]=0;if(type==='w'){P.du.w=P.wd[0]??100;P.activeTool=null}return true}
 if(id.startsWith('inv:')){const name=decodeURIComponent(id.slice(4));if(!P.inv[name]||!TOOLS[name]||P.activeTool!==name)return false;P.activeTool=null;return true}
 return false
}
function discardInventoryItem(id){
 if(id.startsWith('gear:')){const[,type,indexText]=id.split(':'),index=Number(indexText);if(!Number.isInteger(index)||index<=0||!ownedGear(type).includes(index))return false;P[EQUIP_OWNERS[type]||'ow']=ownedGear(type).filter(item=>item!==index);if(type=='w'){P.ow=P.ow.filter(item=>item!==index);delete P.wd[index];if(P.w===index){P.w=0;P.du.w=P.wd[0]??100}}else if(P[type]===index){P[type]=0;P.du[type]=100}return true}
 if(!id.startsWith('inv:'))return false;
 const name=decodeURIComponent(id.slice(4));if(!P.inv[name])return false;P.inv[name]--;if(P.inv[name]<=0)delete P.inv[name];
 if(TOOLS[name]&&!P.inv[name]){P[TOOLS[name].slot]=0;if(P.activeTool===name)P.activeTool=null}
 return true
}
let touchInventoryDrag=null,draggedInventoryId='';
function inventoryDropTarget(target){return target?.closest('.equipment-slot,.inventory-trash,.inventory-grid,.inventory-item')||null}
function finishInventoryDrop(id,target){
 if(!id||!target)return;
 if(target.matches('.inventory-item')&&target.dataset.itemId===id)return;
 const success=target.matches('[data-trash]')?discardInventoryItem(id):target.matches('.equipment-slot')?equipInventoryItem(id,target.dataset.equip):unequipInventoryItem(id);
 if(!success){target.classList.add('drop-invalid');setTimeout(()=>target.classList.remove('drop-invalid'),500);msg(target.matches('[data-trash]')?'Não foi possível descartar esse item.':target.matches('.equipment-slot')?'Esse item não pode ser equipado nesse espaço.':'Solte um equipamento equipado no inventário para removê-lo.','#ff8a80');return}
 inventorySignature='';renderInventory();hud();save();
 if(target.matches('[data-trash]'))msg('Item descartado.','#e2b04a');
 else if(target.matches('.equipment-slot'))msg('Equipamento atualizado.','#e2b04a');
 else msg('Equipamento removido.','#e2b04a');
}
document.addEventListener('dragstart',event=>{const source=event.target.closest('[data-item-id]');if(!source?.dataset.itemId||!event.dataTransfer)return;draggedInventoryId=source.dataset.itemId;event.dataTransfer.setData('text/plain',draggedInventoryId);event.dataTransfer.effectAllowed='move';source.classList.add('drag-source')});
document.addEventListener('dragend',event=>{event.target.closest('[data-item-id]')?.classList.remove('drag-source');draggedInventoryId='';document.querySelectorAll('.drop-ready,.drop-invalid').forEach(element=>element.classList.remove('drop-ready','drop-invalid'))});
document.addEventListener('dragover',event=>{const target=inventoryDropTarget(event.target);if(!target)return;event.preventDefault();target.classList.add('drop-ready')});
document.addEventListener('dragleave',event=>{const target=inventoryDropTarget(event.target);if(target&&!target.contains(event.relatedTarget))target.classList.remove('drop-ready')});
document.addEventListener('drop',event=>{const target=inventoryDropTarget(event.target);if(!target)return;event.preventDefault();const id=event.dataTransfer?.getData('text/plain')||draggedInventoryId;target.classList.remove('drop-ready');finishInventoryDrop(id,target)});
document.addEventListener('touchstart',event=>{const source=event.target.closest('[data-item-id]');if(!source?.dataset.itemId)return;const touch=event.changedTouches[0];touchInventoryDrag={id:source.dataset.itemId,source,x:touch.clientX,y:touch.clientY,active:false,timer:setTimeout(()=>{if(!touchInventoryDrag)return;touchInventoryDrag.active=true;source.classList.add('drag-source')},320)}},{passive:true});
document.addEventListener('touchmove',event=>{if(!touchInventoryDrag)return;const touch=event.changedTouches[0];if(!touchInventoryDrag.active&&Math.hypot(touch.clientX-touchInventoryDrag.x,touch.clientY-touchInventoryDrag.y)>10){clearTimeout(touchInventoryDrag.timer);touchInventoryDrag=null;return}if(touchInventoryDrag.active)event.preventDefault()},{passive:false});
document.addEventListener('touchend',event=>{if(!touchInventoryDrag)return;const drag=touchInventoryDrag;clearTimeout(drag.timer);touchInventoryDrag=null;drag.source.classList.remove('drag-source');if(!drag.active)return;const touch=event.changedTouches[0],target=inventoryDropTarget(document.elementFromPoint(touch.clientX,touch.clientY));finishInventoryDrop(drag.id,target)},{passive:true});
function updateGameClock(){const totalMinutes=480+Math.floor((P.playTime||0)*9.6),dayIndex=Math.floor(totalMinutes/1440),minuteOfDay=totalMinutes%1440,hour=String(Math.floor(minuteOfDay/60)).padStart(2,'0'),minute=String(minuteOfDay%60).padStart(2,'0'),day=String(dayIndex%365+1).padStart(3,'0'),year=String(Math.floor(dayIndex/365)+1).padStart(2,'0');$('game-time').textContent=`${hour}:${minute}`;$('game-date').textContent=`DIA ${day} · ANO ${year}`}
function hud(){updateGameClock();$('nm').textContent=P.name;$('def').textContent=defV();$('atk').textContent=Math.round(atkV());$('weapon').textContent=W[P.w].n;$('outfit').textContent=[A[P.a].n,P.s?SH[P.s].n:null,P.hd?HE[P.hd].n:null].filter(Boolean).join(' · ');$('potions').textContent=P.inv.pot||0;$('level').textContent=`NÍVEL ${P.lvl}`;$('coins').innerHTML=`<img src="${ASSET_MANIFEST.item_gold_coin}" alt="Ouro"><span>${P.gold}</span>`;$('hp-label').textContent='HP';$('hp-label').title=`${Math.ceil(P.hp)} / ${mh()}`;$('xp-label').textContent='XP';$('xp-label').title=`${P.xp} / ${nx()}`;$('hp-value').textContent=`${Math.ceil(P.hp)}/${mh()}`;$('xp-value').textContent=`${P.xp}/${nx()}`;$('hb').style.width=100*P.hp/mh()+'%';$('xb').style.width=100*P.xp/nx()+'%';renderInventory();renderMinimap();
}

function resizeCanvas(){
 cv.width=innerWidth;
 cv.height=innerHeight;
 if(user!=='sudo')zoomTiles=10;
 cx.imageSmoothingEnabled=false;
}
addEventListener('resize',resizeCanvas);
resizeCanvas();

let lastFrame=performance.now(),hudTimer=0,mapTimer=0;
function loop(now){
 const dt=Math.min(.05,(now-lastFrame)/1000);
 lastFrame=now;
 if(P){
  if(!S&&!wmOpen())upd(dt);
  if(P){
   draw(dt);
   hudTimer-=dt;
   if(hudTimer<=0){hudTimer=.25;hud()}
   if(wmOpen()){
    mapTimer-=dt;
    if(mapTimer<=0){mapTimer=.8;worldmap()}
   }
  }
 }else{
  cx.fillStyle='#0b0e14';
  cx.fillRect(0,0,cv.width,cv.height);
 }
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
