'use strict';
/* CRÔNICAS DE WESTEROS — V4
   Base intencionalmente simples: um único loop, uma única definição por sistema.
   As expansões entram como camadas sobre a jogabilidade antiga.
*/
const $=id=>document.getElementById(id);
const cv=$('game'),cx=cv.getContext('2d'),mini=$('mini'),mx=mini.getContext('2d');
const G=new Uint8Array(MW*MH);
let pos=0; for(const m of MAPDATA.matchAll(/([0-9a-z]+)([A-G])/g)){const n=parseInt(m[1],36);G.fill(m[2].charCodeAt(0)-65,pos,pos+n);pos+=n;}

const TILE=[
 ['#315170','#294866','#35597b'], // mar
 ['#b5a269','#aa9759','#c0ac6e'], // terra
 ['#5d7d3e','#4f7134','#668547'], // floresta
 ['#e2e7e8','#d4dde3','#edf2f4'], // neve
 ['#427fb2','#3b72a0','#4e8ec0'], // rio
 ['#c9954c','#b8843f','#d3a05a'], // estrada
 ['#c2a26f','#b18e5c','#d0b17b'], // areia
 ['#69665e','#5d5b55','#77736a']  // muralha/montanha
];
const tl=(x,y)=>x<0||y<0||x>=MW||y>=MH?0:G[y*MW+x];
const hash=(x,y)=>((x*73856093)^(y*19349663))>>>0;
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;

let state=null, logged=false, panelOpen=false, keys={}, enemies=[], npcs=[], chests=[];
let camp=null, zoom=1, attackCd=0, eventCd=50, saveCd=0, spawnCd=2, last=performance.now();
let flowX=new Int8Array(MW*MH), flowY=new Int8Array(MW*MH);

/* rios: cada tile de rio recebe uma direção aproximada a partir do mar */
(function buildFlow(){
 const seen=new Int8Array(MW*MH), q=[];
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tl(x,y)===4){
   let found=false;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(tl(x+dx,y+dy)===0){
     const i=y*MW+x; flowX[i]=dx; flowY[i]=dy; seen[i]=1; q.push(i); found=true; break;
   }
   if(found) continue;
 }
 for(let h=0;h<q.length;h++){
   const i=q[h],x=i%MW,y=(i/MW)|0;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;
     const j=ny*MW+nx;if(tl(nx,ny)!==4||seen[j])continue;
     seen[j]=1;flowX[j]=-dx;flowY[j]=-dy;q.push(j);
   }
 }
})();

const treeCache=new Map();
function treeAt(x,y){
 if(tl(x,y)!==2)return null;
 const ax=x&~1,ay=y&~1,big=hash(ax,ay)%7===0;
 if(big&&tl(ax+1,ay)===2&&tl(ax,ay+1)===2&&tl(ax+1,ay+1)===2){
   const k=ax+','+ay;if(state.cut[k])return null;
   return {k,x:ax,y:ay,s:2};
 }
 if(hash(x,y)%4===0){const k=x+','+y;if(!state.cut[k])return{k,x,y,s:1};}
 return null;
}
function blocked(x,y){
 const ix=Math.floor(x),iy=Math.floor(y),t=tl(ix,iy);
 if(t===0||t===7)return true; // mar e muralha
 const tr=treeAt(ix,iy); if(tr)return true;
 return false; // estrada, rio, floresta e demais terrenos continuam jogáveis
}
function cityAt(x=state.x,y=state.y){return CITIES.find(c=>Math.hypot(c.x-x,c.y-y)<5);}
function regionAt(x,y){
 y*=2;x*=2;
 if(y<150)return 'Além da Muralha';
 if(y<590)return 'O Norte';
 if(y<760)return x>560?'Vale de Arryn':'Terras Fluviais';
 if(y<930)return x<330?'Terras Ocidentais':x>650?'Terras da Coroa':'Terras Fluviais';
 if(y<1080)return 'O Alcance';
 return x>600?'Dorne':'O Alcance';
}
function night(){const h=Math.floor(state.time/60)%24;return h>=21||h<5}
function hour(){return Math.floor(state.time/60)%24}
function maxHp(){return 60+state.level*10+state.bonusHp}
function weapon(){return ITEMS[state.eq.w]||null}
function defense(){return Object.values(state.eq).reduce((n,k)=>n+(ITEMS[k]?.def||0),0)+state.bonusDef}
function weight(k){const i=ITEMS[k]||{};if(i.slot==='w')return 3;if(i.slot==='a')return 6;if(i.slot==='s')return 4;if(i.slot==='h')return 2;if(i.slot==='b')return 1.5;if(i.slot==='g'||i.slot==='c')return .6;if(i.tags?.includes('material'))return .3;return .2}
function carried(){return Object.entries(state.inv).reduce((n,[k,v])=>n+weight(k)*v,0)}
function capacity(){return 40+state.level*3}
function speed(){
 let s=4.5;
 const t=tl(Math.floor(state.x),Math.floor(state.y));
 if(t===4)s*=.65;
 if(t===6)s*=1.15;
 if(carried()>capacity())s*=.72;
 if(state.mount)s*=1.55;
 if(state.effects.frio)s*=.7;
 return s;
}

const ITEMS={};
function loadItems(){
 const base={
  espada:{n:'Espada de Ferro',slot:'w',atk:8,value:80,tags:['arma','espada']},
  pocao:{n:'Poção de Cura',value:10,buy:25,use:{hp:45},tags:['consumível','cura']},
  carne:{n:'Carne Crua',value:5,tags:['comida']},
  madeira:{n:'Madeira',value:3,tags:['material','madeira']},
  erva:{n:'Ervas',value:3,tags:['material','planta']},
  pederneira:{n:'Pederneira',value:4,buy:15,tags:['ferramenta']},
  barraca:{n:'Barraca',value:20,buy:45,tags:['ferramenta']},
  vara:{n:'Vara de Pesca',value:25,buy:35,tags:['ferramenta','pesca']},
  peixe:{n:'Peixe Cru',value:4,tags:['comida','peixe']},
  assada:{n:'Carne Assada',value:8,use:{hp:25},tags:['comida']},
  ensopado:{n:'Ensopado',value:14,use:{hp:40},tags:['comida']},
  bandagem:{n:'Bandagem',value:5,buy:15,use:{cure:'sangramento'},tags:['consumível']},
  antidoto:{n:'Antídoto',value:8,buy:20,use:{cure:'veneno'},tags:['consumível']}
 };
 Object.assign(ITEMS,base);
 if(typeof EXTRA_IT==='object') for(const [k,v] of Object.entries(EXTRA_IT)){
   ITEMS[k]={...v,n:v.n||k,tags:v.tg||[],slot:v.s,atk:v.a||0,def:v.d||0,value:v.v||1,buy:v.c||0,
     rarity:v.rr||0,...(typeof X==='object'&&X[k]?X[k]:{})};
 }
 for(const [k,v] of Object.entries(ITEMS)){v.tags=v.tags||v.tg||[];v.rarity=v.rarity||0;}
}
loadItems();

const ENEMY={};
function loadEnemies(){
 const base={
  lobo:{n:'Lobo',hp:26,atk:5,xp:12,sp:3.4,col:'#777',drop:[['couro',.7],['garra',.15],['carne',.5]]},
  bandido:{n:'Bandido',hp:36,atk:7,xp:18,sp:2.3,col:'#a55',drop:[['pocao',.1],['bandagem',.2]],gold:[5,25]},
  aranha:{n:'Aranha Gigante',hp:30,atk:5,xp:16,sp:2.8,col:'#59406b',drop:[['seda',.7]]},
  morto:{n:'Morto-Branco',hp:50,atk:9,xp:30,sp:1.9,col:'#b9d7df',drop:[['vidro',.12],['ossos',.5],['frag',.3]]}
 };
 Object.assign(ENEMY,base,typeof EXTRA_ET==='object'?EXTRA_ET:{});
}
loadEnemies();

function msg(t,c='#e8e1d2'){const el=$('log');el.innerHTML+=`<div style="color:${c}">${t}</div>`;while(el.children.length>5)el.removeChild(el.firstChild)}
function discover(){
 const r=11;
 for(let y=Math.floor((state.y-r)/8);y<=Math.floor((state.y+r)/8);y++)
  for(let x=Math.floor((state.x-r)/8);x<=Math.floor((state.x+r)/8);x++) state.discovered[x+','+y]=1;
 CITIES.forEach(c=>{if(Math.hypot(c.x-state.x,c.y-state.y)<7)state.codex.cities[c.n]=1});
 state.codex.regions[regionAt(state.x,state.y)]=1;
}
function fresh(){
 const c=CITIES.find(x=>x.n==='Winterfell')||CITIES[1];
 return {name:'',house:'',x:c.x,y:c.y+3,hp:60,level:1,xp:0,gold:60,time:420,
  inv:{espada:1,pocao:2,carne:2,pederneira:1,vara:1},eq:{w:'espada'},effects:{},prof:{},
  discovered:{},codex:{cities:{},regions:{},creatures:{},items:{}},rep:{},horse:0,mount:0,friend:0,
  home:CITIES.indexOf(c),cut:{},treeHit:{},dur:{},chest:{},opened:{},quests:{},kills:0,bonusHp:0,bonusAtk:0,bonusDef:0}
}
function save(){if(!state?.name)return;localStorage.setItem('cw_save_'+state.name,JSON.stringify(state))}
function load(name){try{return JSON.parse(localStorage.getItem('cw_save_'+name)||'null')}catch{return null}}
function createChar(){
 const name=$('user').value.trim();if(name.length<2)return $('loginmsg').textContent='Digite um nome com pelo menos 2 letras.';
 let s=load(name);
 if(s){state=s;logged=true;$('login').style.display='none';msg('Progresso carregado.');return}
 state=fresh();state.name=name;state.house=$('house').value;
 if(state.house==='Stark')state.bonusHp=20;
 if(state.house==='Lannister')state.gold+=200;
 if(state.house==='Targaryen')state.bonusAtk=2;
 if(state.house==='Baratheon')state.bonusDef=1;
 const c=CITIES[state.home];state.x=c.x;state.y=c.y+3;
 logged=true;$('login').style.display='none';discover();save();msg(`Bem-vindo, ${name}, da Casa ${state.house}.`,'#e0bd65');
}
function enter(){createChar()}
$('create').onclick=createChar;$('enter').onclick=enter;
$('user').addEventListener('keydown',e=>{if(e.key==='Enter')createChar()});

function openPanel(html){panelOpen=true;$('panel').innerHTML=html+`<div style="text-align:right;margin-top:10px"><button onclick="closePanel()">Fechar</button></div>`;$('panel').style.display='block'}
function closePanel(){panelOpen=false;$('panel').style.display='none';save()}
window.closePanel=closePanel;

function itemName(k){return ITEMS[k]?.n||k}
function give(k,n=1){state.inv[k]=(state.inv[k]||0)+n;state.codex.items[k]=1}
function take(k,n=1){if((state.inv[k]||0)<n)return false;state.inv[k]-=n;if(state.inv[k]<=0)delete state.inv[k];return true}
function useItem(k){
 const i=ITEMS[k],u=i?.use;if(!u)return;
 if(u.hp)state.hp=Math.min(maxHp(),state.hp+u.hp);
 if(u.cure)delete state.effects[u.cure];
 take(k);msg('Usou '+itemName(k)+'.');inventory();
}
function equip(k){
 const i=ITEMS[k];if(!i?.slot)return;
 if(i.req && (state.prof[i.req]||0)<i.reqLv)return msg('Proficiência insuficiente.','#f88');
 let s=i.slot;if(s==='r')s=state.eq.r?'r2':'r';
 if(state.eq[s])give(state.eq[s]);
 state.eq[s]=k;state.dur[s]=durMax(k);take(k);inventory();
}
function unequip(s){if(state.eq[s]){give(state.eq[s]);delete state.eq[s];delete state.dur[s]}inventory()}
function durMax(k){const r=ITEMS[k]?.rarity||0;return r>=4?300:r>=2?200:100}
function wear(slot){
 const k=state.eq[slot];if(!k)return;
 state.dur[slot]=Math.max(0,(state.dur[slot]??durMax(k))-1);
 if(state.dur[slot]===0)msg(itemName(k)+' ficou inutilizável.','#f88');
}
function inventory(){
 let h=`<div class=title>Inventário</div><div class=muted>${state.name} · Casa ${state.house} · <span class=gold>${state.gold}g</span> · Peso ${carried().toFixed(1)}/${capacity()}</div>`;
 for(const [s,l] of [['w','Arma'],['s','Escudo'],['h','Cabeça'],['a','Corpo'],['b','Pés'],['g','Luvas'],['c','Capa'],['r','Anel'],['r2','Anel 2'],['m','Amuleto']]){
   const k=state.eq[s];h+=`<div class=item><span class=muted>${l}</span>: ${k?itemName(k)+` <button onclick="unequip('${s}')">tirar</button>`:'—'}</div>`;
 }
 h+='<hr>';
 for(const [k,n] of Object.entries(state.inv)){const i=ITEMS[k]||{};h+=`<div class=item><b>${itemName(k)}</b> ×${n}<div class=tag>${(i.tags||[]).join(' · ')} ${i.atk?`· ATQ ${i.atk}`:''} ${i.def?`· DEF ${i.def}`:''}</div>${i.slot?`<button onclick="equip('${k}')">Equipar</button>`:''}${i.use?`<button onclick="useItem('${k}')">Usar</button>`:''}<button class=danger onclick="dropItem('${k}')">Descartar</button></div>`}
 h+='<hr><div class=muted>Proficiências: '+Object.entries(state.prof).map(([k,v])=>`${k} ${v}`).join(' · ')||'nenhuma'+'</div>';
 openPanel(h);
}
window.inventory=inventory;window.useItem=useItem;window.equip=equip;window.unequip=unequip;
function dropItem(k){delete state.inv[k];inventory()};window.dropItem=dropItem;

function city(c=cityAt()){if(!c)return;
 const open=hour()>=6&&hour()<21,rep=state.rep[c.n]||0;
 let h=`<div class=title>${c.n}</div><div class=muted>${c.t}</div><div>Hora: ${String(hour()).padStart(2,'0')}h · Reputação: ${rep} · Ouro: <span class=gold>${state.gold}g</span></div>`;
 h+=`<hr><b>Estalagem</b><br><button onclick="restInn('${c.n}')">Descansar — 10g</button>`;
 h+=`<hr><b>Mercado ${open?'':'(fechado)'}</b>`;
 if(open){
  const stock=Object.entries(ITEMS).filter(([k,i])=>i.buy&&((i.tags||[]).length<5 || (hash(c.x+k.length,c.y)%3)));
  for(const [k,i] of stock.slice(0,18))h+=`<div class=item>${itemName(k)} <button class=gold onclick="buyItem('${k}','${c.n}')">${Math.round(i.buy*(1-Math.min(.2,rep/100)))}g</button></div>`;
  h+=`<div class=item>Cavalo <button class=gold onclick="buyHorse('${c.n}')">${Math.max(100,Math.round(150*(1-Math.min(.2,rep/100))))}g</button></div>`;
  h+='<hr><b>Vender</b>';
  for(const [k,n] of Object.entries(state.inv))h+=`<div class=item>${itemName(k)} ×${n} <button onclick="sellItem('${k}','${c.n}')">${Math.max(1,Math.round((ITEMS[k]?.value||1)*economy(c,k)))}g</button></div>`;
 }
 h+=`<hr><b>Casa</b><br>${state.home===CITIES.indexOf(c)?'<button onclick="openChest()">Abrir baú</button>':'<button onclick="buyHome('+CITIES.indexOf(c)+')">Comprar casa — 200g</button>'}`;
 if(['Porto Branco','Porto Real','Lannisport','Vilavelha','Lançassolar','Pyke','Pedra do Dragão','Seagard','Maidenpool','Bosque Profundo'].includes(c.n))
   h+=`<hr><b>Viagem</b><br><button onclick="travelByBoat('${c.n}')">Passagem de barco</button>`;
 openPanel(h);
}
window.city=city;
function buyItem(k,n){const c=CITIES.find(x=>x.n===n),p=Math.round((ITEMS[k].buy||0)*(1-Math.min(.2,(state.rep[n]||0)/100)));if(state.gold<p)return msg('Ouro insuficiente.','#f88');state.gold-=p;give(k);state.rep[n]=(state.rep[n]||0)+1;city(c)}
function sellItem(k,n){const c=CITIES.find(x=>x.n===n),p=Math.max(1,Math.round((ITEMS[k].value||1)*economy(c,k)));state.gold+=p*(state.inv[k]||0);delete state.inv[k];state.rep[n]=(state.rep[n]||0)+1;city(c)}
function economy(c,k){const tags=ITEMS[k]?.tags||[],r=regionAt(c.x,c.y);if(r==='O Norte'&&tags.includes('frio'))return 1.25;if(r==='Dorne'&&tags.includes('dorne'))return 1.2;if(r==='Terras Fluviais'&&tags.includes('peixe'))return 1.25;return 1}
function restInn(n){if(state.gold<10)return msg('Ouro insuficiente.','#f88');state.gold-=10;state.hp=maxHp();state.effects={};if(hour()>=21||hour()<7)state.time=Math.floor(state.time/1440)*1440+7*60;if(state.time%1440<7*60)state.time+=1440;state.home=CITIES.findIndex(c=>c.n===n);msg('Você descansou na estalagem.','#9f9');city(CITIES.find(c=>c.n===n))}

function openChest(){
 let h='<div class=title>Baú da casa</div><b>Guardar</b>';
 for(const [k,n] of Object.entries(state.inv))h+=`<div class=item>${itemName(k)} ×${n} <button onclick="stash('${k}',1)">Guardar</button></div>`;
 h+='<hr><b>Guardado</b>';
 for(const [k,n] of Object.entries(state.chest))h+=`<div class=item>${itemName(k)} ×${n} <button onclick="stash('${k}',0)">Pegar</button></div>`;
 openPanel(h);
}
window.openChest=openChest;
function stash(k,put){const from=put?state.inv:state.chest,to=put?state.chest:state.inv;if(!from[k])return;to[k]=(to[k]||0)+from[k];delete from[k];openChest()};window.stash=stash;
function buyHome(i){if(state.gold<200)return msg('Ouro insuficiente.','#f88');state.gold-=200;state.home=i;msg('Agora esta é sua casa.','#e0bd65');city(CITIES[i])}

function mount(){
 if(!state.horse)return msg('Você ainda não possui cavalo.');
 if(state.mount){state.mount=0;msg('Você desmontou.');return}
 if(!state.horsePos)state.horsePos={x:state.x+1,y:state.y};
 const d=Math.hypot(state.horsePos.x-state.x,state.horsePos.y-state.y);
 if(d<=2.5){state.mount=1;msg('Você montou.');return}
 const reach=6+state.friend*.6;
 if(d<=reach){state.horsePos={x:state.x+1,y:state.y};msg('Seu cavalo veio até você. Agora pressione C.','#e0bd65')}
 else msg(`Seu cavalo está longe. Alcance atual: ${reach.toFixed(0)}.`,'#f88');
}
window.mount=mount;
function buyHorse(n){if(state.horse)return msg('Você já possui um cavalo.');if(state.gold<150)return msg('Ouro insuficiente.','#f88');state.gold-=150;state.horse=1;state.horsePos={x:state.x+1,y:state.y};msg('Você comprou um cavalo. Pressione C para chamar ou montar.','#e0bd65');city(CITIES.find(c=>c.n===n))}

function campBuild(){if(camp)return msg('Você já tem um acampamento.');if(!state.inv.barraca||!state.inv.pederneira||(state.inv.madeira||0)<3)return msg('Precisa de Barraca, Pederneira e 3 Madeiras.','#f88');if(cityAt())return msg('Não acampe dentro da cidade.');take('barraca');take('pederneira');take('madeira',3);camp={x:state.x,y:state.y,life:360};msg('Acampamento montado. H descansa · K cozinha.','#e0bd65')}
function restCamp(){if(!camp||!near(camp,state,3))return msg('Fique perto do acampamento.');state.time+=120;state.hp=Math.min(maxHp(),state.hp+Math.round(maxHp()*.35));delete state.effects.sangramento;msg('Você descansou junto à fogueira.','#9f9')}
function cook(){if(!camp||!near(camp,state,3))return msg('Precisa estar perto da fogueira.');let h='<div class=title>Cozinha</div>';
 const rec=[['carne','assada'],['carne','erva','ensopado'],['peixe','peixe_a']];
 rec.forEach((r,i)=>{const out=r[r.length-1],need=r.slice(0,-1),ok=need.every(k=>(state.inv[k]||0)>=need.filter(x=>x===k).length);h+=`<div class=item>${need.map(itemName).join(' + ')} → ${itemName(out)} <button ${ok?'':'disabled'} onclick="craft(${i})">Fazer</button></div>`});openPanel(h)}
window.cook=cook;
function craft(i){const rec=[['carne','assada'],['carne','erva','ensopado'],['peixe','peixe_a']][i],out=rec.at(-1),need=rec.slice(0,-1);if(!need.every(k=>(state.inv[k]||0)>=need.filter(x=>x===k).length))return;need.forEach(take);give(out);cook()};window.craft=craft;

function gather(){
 let tree=null,dist=99,water=false;const px=Math.floor(state.x),py=Math.floor(state.y);
 for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++){const t=treeAt(px+x,py+y);if(t){const d=Math.hypot(t.x+t.s/2-state.x,t.y+t.s/2-state.y);if(d<dist){dist=d;tree=t}}if(Math.abs(x)<=1&&Math.abs(y)<=1&&(tl(px+x,py+y)===0||tl(px+x,py+y)===4))water=true}
 if(tree&&dist<=2.5){
   const k=tree.k,need=tree.s===2?8:3,power=state.eq.w==='machado_c'?2:1;
   state.treeHit[k]=(state.treeHit[k]||0)+power;
   if(state.treeHit[k]>=need){state.cut[k]=1;delete state.treeHit[k];give('madeira',tree.s*2);if(tree.s===2)give('tabua');msg(tree.s===2?'Árvore grande derrubada.':'Árvore derrubada.','#d6bc79')}
   else msg(`Cortando árvore... ${state.treeHit[k]}/${need}`,'#aaa');
   return;
 }
 if(water){
   const pf=state.prof.Pesca||0;const chance=Math.min(.5,.025*state.level*(1+pf*.15));
   if(Math.random()<chance){give('peixe');msg('Você pescou um peixe.','#8fc7dc')}else msg('Nada mordeu.','#888');state.prof.Pesca=(pf+.1);
   return;
 }
 if(Math.random()<.4){give('erva');msg('Você encontrou ervas.','#9f9')}else msg('Nada útil por aqui.','#888');
}

function attack(){
 if(attackCd>0||panelOpen)return;attackCd=.45;
 let target=null,best=2.4;for(const e of enemies){const d=Math.hypot(e.x-state.x,e.y-state.y);if(d<best){best=d;target=e}}
 if(!target)return;
 const w=weapon(),base=(w?.atk||2)+3+state.bonusAtk,prof=state.prof[w?.p||'Punhos']||0;
 target.hp-=Math.max(1,Math.round(base*(1+prof*.06)+Math.random()*3));
 state.prof[w?.p||'Punhos']=(prof+.08);
 if(target.hp<=0){
   enemies.splice(enemies.indexOf(target),1);state.kills++;gainXp(ENEMY[target.type].xp);const e=ENEMY[target.type];
   if(e.gold)state.gold+=e.gold[0]+Math.floor(Math.random()*(e.gold[1]-e.gold[0]+1));
   for(const [k,ch] of e.drop||[])if(Math.random()<ch)give(k);
   msg(e.n+' derrotado.','#e0bd65');
 }else msg('Acertou '+ENEMY[target.type].n+'.');
}
function gainXp(n){state.xp+=n;while(state.xp>=state.level*40){state.xp-=state.level*40;state.level++;state.hp=maxHp();msg('Nível '+state.level+'!','#e0bd65')}}

const REGION_EN={
 'Além da Muralha':['morto'],
 'O Norte':['lobo','bandido','urso'],
 'Terras Fluviais':['bandido','javali'],
 'Vale de Arryn':['gato','bandido'],
 'Terras Ocidentais':['bandido','javali'],
 'Terras da Coroa':['bandido','javali'],
 'O Alcance':['bandido','aranha'],
 'Dorne':['escorpiao','viboras','dragonete']
};
function spawnEnemy(){
 const a=Math.random()*Math.PI*2,r=13+Math.random()*8,x=state.x+Math.cos(a)*r,y=state.y+Math.sin(a)*r,t=tl(Math.floor(x),Math.floor(y));
 if(blocked(x,y)||t===4||cityAt()||CITIES.some(c=>Math.hypot(c.x-x,c.y-y)<11))return;
 let list=REGION_EN[regionAt(x,y)]||['bandido'];if(t===2&&Math.random()<.5)list=['aranha','lobo'];const type=list[Math.floor(Math.random()*list.length)];
 const e=ENEMY[type];if(!e)return;enemies.push({type,x,y,hp:e.hp,cd:0});
 state.codex.creatures[type]=1;
}
function hurt(){
 const e=enemies.find(e=>Math.hypot(e.x-state.x,e.y-state.y)<1.4);if(!e)return;
 const def=defense();state.hp-=Math.max(1,ENEMY[e.type].atk-def*.55);wear(['s','a','h','c'].find(s=>state.eq[s]));
}
function die(){
 localStorage.removeItem('cw_save_'+state.name);enemies=[];camp=null;
 const name=state.name;state=fresh();state.name=name;state.house='';
 $('login').style.display='flex';$('loginmsg').textContent='Seu personagem morreu. Crie um novo personagem.';
 msg('Seu personagem foi encerrado.','#f88');
}
function randomEvent(){
 if(cityAt()||panelOpen)return;
 const events=[
  ['Viajante perdido',()=>{state.gold+=15;gainXp(10);msg('Você ajudou um viajante e recebeu 15g.','#e0bd65')}],
  ['Caravana',()=>{give('pocao');msg('A caravana deixou uma poção com você.')}],
  ['Acampamento abandonado',()=>{give('madeira',2);give('carne');msg('Você encontrou suprimentos.')}],
  ['Tesouro',()=>{const g=30+Math.floor(Math.random()*70);state.gold+=g;msg('Você encontrou '+g+'g enterrados.','#e0bd65')}],
  ['Emboscada',()=>{for(let i=0;i<2;i++)spawnEnemy();msg('Uma emboscada!','#f88')}]
 ];
 if(night()&&Math.random()<.6)events.push(['Patrulha noturna',()=>{gainXp(10);msg('Uma patrulha passou pela estrada.')}]);
 const e=events[Math.floor(Math.random()*events.length)];state.codex.events=state.codex.events||{};state.codex.events[e[0]]=1;
 openPanel(`<div class=title>${e[0]}</div><p>Um acontecimento inesperado surgiu durante sua viagem.</p><button onclick="eventTake()">Continuar</button>`);window._event=e[1];
}
window.eventTake=()=>{window._event?.();delete window._event;closePanel()};

function quests(){
 let h='<div class=title>Quests</div>';
 if(!state.quests.hunt)h+=`<div class=item>Caçada — derrotar 5 criaturas <button onclick="startHunt()">Aceitar</button></div>`;
 else if(state.quests.hunt.done)h+='<div class=item>Caçada concluída.</div>';
 else h+=`<div class=item>Caçada: ${Math.min(5,state.kills-state.quests.hunt.start)}/5</div>`;
 openPanel(h);
}
function startHunt(){state.quests.hunt={start:state.kills,done:false};closePanel();msg('Caçada aceita.','#e0bd65')}
function compendium(){
 const c=state.codex;let h='<div class=title>Compêndio</div><b>Cidades descobertas</b>';
 h+=Object.keys(c.cities).map(k=>`<div class=item>${k}</div>`).join('')||'<div class=muted>Nenhuma ainda.</div>';
 h+='<b>Regiões</b>'+Object.keys(c.regions).map(k=>`<div class=item>${k}</div>`).join('');
 h+='<b>Criaturas</b>'+Object.keys(c.creatures).map(k=>`<div class=item>${ENEMY[k]?.n||k}</div>`).join('');
 h+='<b>Eventos</b>'+Object.keys(c.events||{}).map(k=>`<div class=item>${k}</div>`).join('');
 openPanel(h);
}
function worldMap(){
 openPanel(`<div class=title>Mapa de Westeros</div><canvas id=wm width="500" height="675" style="width:100%;max-height:62vh;image-rendering:pixelated;background:#111"></canvas><div class=muted>Somente regiões descobertas aparecem.</div>`);
 const c=$('wm').getContext('2d');c.fillStyle='#101820';c.fillRect(0,0,500,675);
 for(const k of Object.keys(state.discovered)){const [x,y]=k.split(',').map(Number),t=tl(x*8+4,y*8+4);c.fillStyle=TILE[t]?.[0]||'#223';c.fillRect(x*8,y*8,8,8)}
 c.fillStyle='#f4e4a1';for(const t of CITIES)if(state.codex.cities[t.n]){c.fillRect(t.x-2,t.y-2,4,4)}
 c.fillStyle='#fff';c.fillRect(state.x-2,state.y-2,4,4);
}
function exportSave(){
 const lines=[`Nome: ${state.name}`,`Casa: ${state.house}`,`Nível: ${state.level}`,`XP: ${state.xp}`,`HP: ${Math.ceil(state.hp)}/${maxHp()}`,`Ouro: ${state.gold}`,`Região: ${regionAt(state.x,state.y)}`,`Posição: ${state.x.toFixed(1)}, ${state.y.toFixed(1)}`,`Inventário: ${JSON.stringify(state.inv)}`,`Equipamentos: ${JSON.stringify(state.eq)}`,`Proficiências: ${JSON.stringify(state.prof)}`,`Efeitos: ${JSON.stringify(state.effects)}`,`Quests: ${JSON.stringify(state.quests)}`];
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'}));a.download='westeros-'+state.name+'.txt';a.click();
}

function interact(){
 const c=cityAt();if(c)return city(c);
 const n=npcs.find(n=>Math.hypot(n.x-state.x,n.y-state.y)<1.8);if(n)return msg(`${n.kind}: "${n.lines[Math.floor(Math.random()*n.lines.length)]}"`,'#c9b98e');
 const ch=chests.find(ch=>!state.opened[ch.id]&&Math.hypot(ch.x-state.x,ch.y-state.y)<1.8);if(ch){state.opened[ch.id]=1;const k=ch.items[Math.floor(Math.random()*ch.items.length)];give(k);state.gold+=10+Math.floor(Math.random()*30);msg('Você encontrou um baú.','#e0bd65');return}
 const q=state.quests.hunt;if(q&&!q.done&&state.kills-q.start>=5){q.done=true;state.gold+=60;gainXp(30);msg('Caçada concluída: +60g.','#e0bd65');}
}
function makeNpcs(){
 npcs=[];CITIES.forEach((c,i)=>{for(let j=0;j<4;j++)npcs.push({city:c,kind:['Morador','Soldado','Mercador','Viajante'][(i+j)%4],x:c.x+(Math.random()*8-4),y:c.y+(Math.random()*6-3),vx:0,vy:0,t:0,lines:['Bons ventos.','Cuidado nas estradas.','Os preços andam altos.','Vi viajantes passando por aqui.']})});
}
function makeChests(){
 chests=[];let seed=421;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 while(chests.length<70){const x=Math.floor(rnd()*MW),y=Math.floor(rnd()*MH),t=tl(x,y);if(![1,2,3,6].includes(t)||CITIES.some(c=>Math.hypot(c.x-x,c.y-y)<9))continue;chests.push({id:chests.length,x:x+.5,y:y+.5,items:['pocao','madeira','erva','couro','pao','carne']})}
}
makeNpcs();makeChests();

function update(dt){
 if(!logged||panelOpen)return;
 state.time+=dt*3;attackCd=Math.max(0,attackCd-dt);saveCd-=dt;spawnCd-=dt;eventCd-=dt;
 if(keys.c){keys.c=0;mount()}
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(dx||dy){const l=Math.hypot(dx,dy),s=speed()*dt/l;const nx=state.x+dx*s,ny=state.y+dy*s;if(!blocked(nx,state.y))state.x=nx;if(!blocked(state.x,ny))state.y=ny;state.face=dx||state.face||1}
 const i=Math.floor(state.y)*MW+Math.floor(state.x);
 if(tl(Math.floor(state.x),Math.floor(state.y))===4){const fx=flowX[i],fy=flowY[i];if(fx||fy){const s=.9*dt;if(!blocked(state.x+fx*s,state.y))state.x+=fx*s;if(!blocked(state.x,state.y+fy*s))state.y+=fy*s}}
 if(state.mount){state.friend=Math.min(100,state.friend+dt*.08);state.horsePos={x:state.x+0.2,y:state.y+0.2}}
 if(camp&&(--camp.life<=0)){camp=null;msg('A fogueira se apagou.','#888')}
 if(spawnCd<=0){spawnCd=night()?3:5;if(enemies.length<(night()?8:5))spawnEnemy()}
 for(const e of enemies){const d=Math.hypot(e.x-state.x,e.y-state.y),def=ENEMY[e.type];if(d<9&&d>1){const s=def.sp*dt/d,nx=e.x+(state.x-e.x)*s,ny=e.y+(state.y-e.y)*s;if(!blocked(nx,e.y))e.x=nx;if(!blocked(e.x,ny))e.y=ny}e.cd-=dt;if(d<1.3&&e.cd<=0){e.cd=1;hurt()}}
 enemies=enemies.filter(e=>Math.hypot(e.x-state.x,e.y-state.y)<35);
 for(const n of npcs){if(Math.hypot(n.x-state.x,n.y-state.y)>35)continue;n.t-=dt;if(n.t<=0){n.t=2+Math.random()*3;n.vx=Math.random()*2-1;n.vy=Math.random()*2-1}const nx=n.x+n.vx*dt,ny=n.y+n.vy*dt;if(!blocked(nx,ny)&&Math.hypot(nx-n.city.x,ny-n.city.y)<8){n.x=nx;n.y=ny}}
 if(saveCd<=0){saveCd=8;save()}
 if(eventCd<=0&&!cityAt()){eventCd=60+Math.random()*80;if(Math.random()<.45)randomEvent()}
 discover();
 if(state.hp<=0)die();
}

function draw(){
 const w=cv.width,h=cv.height,s=20*zoom;
 cx.fillStyle='#0a0c10';cx.fillRect(0,0,w,h);
 const x0=Math.floor(state.x-w/(2*s))-1,x1=Math.ceil(state.x+w/(2*s))+1,y0=Math.floor(state.y-h/(2*s))-1,y1=Math.ceil(state.y+h/(2*s))+1;
 const sx=x=>(x-state.x)*s+w/2,sy=y=>(y-state.y)*s+h/2;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const t=tl(x,y);cx.fillStyle=(TILE[t]||TILE[1])[hash(x,y)%3];cx.fillRect(Math.round(sx(x)),Math.round(sy(y)),Math.ceil(s)+1,Math.ceil(s)+1);
   if(t===2){const tr=treeAt(x,y);if(tr&&tr.s===1){cx.fillStyle='#304c25';cx.beginPath();cx.moveTo(sx(x)+s*.5,sy(y)+s*.1);cx.lineTo(sx(x)+s*.9,sy(y)+s*.9);cx.lineTo(sx(x)+s*.1,sy(y)+s*.9);cx.fill()}}
 }
 for(const c of CITIES){const X=sx(c.x),Y=sy(c.y);if(X<-100||Y<-100||X>w+100||Y>h+100)continue;
   cx.fillStyle='#50483c';cx.fillRect(X-s*1.5,Y-s,s*3,s*2);cx.fillStyle='#8b806b';cx.fillRect(X-s*.9,Y-s*1.5,s*.6,s*1.5);cx.fillRect(X+s*.3,Y-s*1.3,s*.6,s*1.3);cx.fillStyle='#201b15';cx.fillRect(X-s*.25,Y,s*.5,s);
   cx.font='bold '+Math.max(11,Math.round(12*zoom))+'px Georgia';cx.textAlign='center';cx.fillStyle='#000';cx.fillText(c.n,X+1,Y-s*1.9+1);cx.fillStyle='#eee4cf';cx.fillText(c.n,X,Y-s*1.9);
 }
 for(const n of npcs){const X=sx(n.x),Y=sy(n.y);if(X<0||Y<0||X>w||Y>h)continue;cx.fillStyle='#b68f6a';cx.fillRect(X-s*.2,Y-s*.45,s*.4,s*.35);cx.fillStyle=['#65728a','#8a6a42','#6c7650','#775b72'][n.city?CITIES.indexOf(n.city)%4:0];cx.fillRect(X-s*.3,Y-s*.1,s*.6,s*.55)}
 for(const ch of chests)if(!state.opened[ch.id]){const X=sx(ch.x),Y=sy(ch.y);if(X>-20&&Y>-20&&X<w+20&&Y<h+20){cx.fillStyle='#9b7139';cx.fillRect(X-s*.3,Y-s*.2,s*.6,s*.4)}}
 if(camp){cx.font=Math.round(s)+'px serif';cx.textAlign='center';cx.fillText('🔥',sx(camp.x),sy(camp.y)+s*.3)}
 for(const e of enemies){const X=sx(e.x),Y=sy(e.y),r=s*.38;cx.fillStyle=ENEMY[e.type].col;cx.beginPath();cx.arc(X,Y,r,0,Math.PI*2);cx.fill();cx.fillStyle='#e54';cx.fillRect(X-r,Y-r-5,2*r*(e.hp/ENEMY[e.type].hp),3)}
 // player: deliberately simple, readable, same spirit as the old prototype
 const px=w/2,py=h/2; if(state.mount){cx.fillStyle='#6a4526';cx.fillRect(px-s*.7,py+s*.1,s*1.4,s*.45);cx.fillStyle='#8b5d35';cx.fillRect(px+s*.55,py-s*.2,s*.35,s*.35)}
 cx.fillStyle='#e0b38c';cx.fillRect(px-s*.35,py-s*.7,s*.7,s*.65);cx.fillStyle=state.house==='Stark'?'#536b7e':state.house==='Lannister'?'#8b2424':state.house==='Targaryen'?'#4b4d58':'#6c4d2d';cx.fillRect(px-s*.5,py-s*.05,s,s*.8);
 if(state.eq.h) {cx.fillStyle='#6b6b63';cx.fillRect(px-s*.42,py-s*.82,s*.84,s*.25)}
 const nightAlpha=night()?.48:(hour()>=19&&hour()<21)?.2:0;if(nightAlpha){cx.fillStyle=`rgba(8,13,35,${nightAlpha})`;cx.fillRect(0,0,w,h)}
}

function hud(){
 const c=cityAt(),need=state.level*40;
 $('hud').innerHTML=`<div class=row><b>Nível ${state.level}</b><span class=gold>${state.gold}g</span></div>
 <div class=bar><i style="width:${Math.max(0,state.hp/maxHp()*100)}%;background:#b83b35"></i></div>
 <div class=muted>Vida ${Math.ceil(state.hp)}/${maxHp()} · ATQ ${(weapon()?.atk||2)+state.bonusAtk} · DEF ${defense()}</div>
 <div class=bar><i style="width:${Math.min(100,state.xp/need*100)}%;background:#c69b42"></i></div>
 <div class=muted>${String(hour()).padStart(2,'0')}:${String(Math.floor(state.time%60)).padStart(2,'0')} · ${regionAt(state.x,state.y)}</div>
 <div>${Object.keys(state.effects).map(k=>`<span style="color:#d9876b">● ${k}</span>`).join(' ')}</div>
 ${c?`<div style="color:#e2c477;margin-top:5px">E · ${c.n}</div>`:''}
 <div class=muted style="margin-top:5px">${state.name} · ${state.house}${state.horse?' · cavalo '+Math.floor(state.friend):''}</div>`;
}
function minimap(){
 const W=61,H=61;mini.width=W;mini.height=H;mini.style.width='150px';mini.style.height='150px';
 const im=mx.createImageData(W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=tl(Math.floor(state.x)-30+x,Math.floor(state.y)-30+y),col=(TILE[t]||TILE[1])[0],i=(y*W+x)*4;im.data[i]=parseInt(col.slice(1,3),16);im.data[i+1]=parseInt(col.slice(3,5),16);im.data[i+2]=parseInt(col.slice(5,7),16);im.data[i+3]=255}mx.putImageData(im,0,0);mx.fillStyle='#fff';mx.fillRect(29,29,3,3);mx.fillStyle='#e3bd55';CITIES.forEach(c=>{const x=Math.floor(c.x-state.x)+30,y=Math.floor(c.y-state.y)+30;if(x>=0&&x<W&&y>=0&&y<H)mx.fillRect(x,y,2,2)})}

function resize(){cv.width=innerWidth;cv.height=innerHeight;cx.imageSmoothingEnabled=false}addEventListener('resize',resize);resize();
addEventListener('keydown',e=>{
 if(!logged)return;
 const k=e.key.toLowerCase();
 if(k==='escape'){closePanel();return}
 if(panelOpen)return;
 if(['i','j','m','q','x'].includes(k)){if(k==='i')inventory();if(k==='j')compendium();if(k==='m')worldMap();if(k==='q')quests();if(k==='x')exportSave();return}
 if(k==='c'){mount();return}
 if(k==='e'){interact();return}
 if(k==='f'){gather();return}
 if(k==='b'){campBuild();return}
 if(k==='h'){restCamp();return}
 if(k==='k'){cook();return}
 if(k===' '){attack();e.preventDefault();return}
 if(k==='+'||k==='='){zoom=Math.min(2,zoom+.15);return}
 if(k==='-'){zoom=Math.max(.6,zoom-.15);return}
 keys[k]=1;
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
cv.addEventListener('click',()=>{if(logged&&!panelOpen)attack()});

function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(logged){update(dt);draw();hud();minimap()}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
