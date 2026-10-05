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
/** H(x,y,seed): hash determinístico em [0,1) usado em variações visuais e geração. */
const H=(x,y,s=0)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1442695041);h=Math.imul(h^h>>>13,1274126177);h^=h>>>16;return(h>>>0)/4294967296};
const sm=t=>t*t*(3-2*t);
/** Ruído de valor suave (value noise) para terreno. */
const VN=(x,y,s)=>{const i=Math.floor(x),j=Math.floor(y),u=sm(x-i),v=sm(y-j),a=H(i,j,s),b=H(i+1,j,s),c=H(i,j+1,s),d=H(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
/* ===== mundo ===== */
/** Lista das 33 localidades: n=nome, r=região, x/y=posição, t=tipo. Índice vira t.i. */
const TW=[
/* Terras da Coroa */
{n:'Porto Real',r:'Terras da Coroa',x:350,y:650,t:'city'},
{n:'Pedra do Dragão',r:'Terras da Coroa',x:700,y:650,t:'fort'},
{n:'Descendente',r:'Terras da Coroa',x:600,y:500,t:'town'},
/* O Norte */
{n:'Winterfell',r:'O Norte',x:-250,y:-350,t:'fort'},
{n:'Porto Branco',r:'O Norte',x:600,y:-50,t:'city'},
{n:'Forte do Pavor',r:'O Norte',x:300,y:-300,t:'fort'},
{n:'Fosso Cailin',r:'O Norte',x:-150,y:100,t:'fort'},
{n:'Muralha / Castle Black',r:'O Norte',x:0,y:-650,t:'wall'},
/* A Campina */
{n:'Vilavelha / Torralta',r:'A Campina',x:-600,y:1450,t:'city'},
{n:'Jardim de Cima',r:'A Campina',x:-150,y:1050,t:'fort'},
{n:'Monte Chifre',r:'A Campina',x:-550,y:1200,t:'fort'},
/* Terras do Oeste */
{n:'Rochedo Casterly',r:'Terras do Oeste',x:-800,y:850,t:'fort'},
{n:'Lannisporto',r:'Terras do Oeste',x:-650,y:1050,t:'city'},
{n:'Dente de Ouro',r:'Terras do Oeste',x:-1050,y:500,t:'fort'},
/* Vale de Arryn */
{n:'Ninho das Águias',r:'Vale de Arryn',x:850,y:250,t:'fort'},
{n:'Porta da Lua',r:'Vale de Arryn',x:750,y:450,t:'fort'},
{n:'Vila Gulltown',r:'Vale de Arryn',x:1050,y:500,t:'city'},
/* Terras Fluviais */
{n:'Correntexa',r:'Terras Fluviais',x:0,y:350,t:'fort'},
{n:'Harrenhal',r:'Terras Fluviais',x:300,y:300,t:'ruin'},
{n:'As Gêmeas',r:'Terras Fluviais',x:-350,y:250,t:'fort'},
{n:'Poço da Donzela',r:'Terras Fluviais',x:550,y:350,t:'town'},
/* Terras da Tempestade */
{n:'Ponta da Tempestade',r:'Terras da Tempestade',x:500,y:1000,t:'fort'},
{n:'Ninho do Corvo',r:'Terras da Tempestade',x:800,y:900,t:'fort'},
/* Dorne */
{n:'Lance do Sol / Cidade da Sombra',r:'Dorne',x:900,y:1900,t:'city'},
{n:'Jardins da Água',r:'Dorne',x:500,y:1650,t:'palace'},
{n:'Tombastelo',r:'Dorne',x:-50,y:1750,t:'fort'},
/* Ilhas de Ferro */
{n:'Pyke',r:'Ilhas de Ferro',x:-1200,y:600,t:'fort'},
/* Além da Muralha */
{n:'Ancoradouro Duro',r:'Além da Muralha',x:350,y:-1100,t:'ruin'},
{n:'Seagard',r:'Terras Fluviais',x:-320,y:80,t:'fort'},
{n:'Última Lareira',r:'O Norte',x:150,y:-450,t:'fort'},
{n:'Karhold',r:'O Norte',x:600,y:-380,t:'fort'},
{n:'Ponte Amarga',r:'Terras da Tempestade',x:350,y:800,t:'town'},
{n:'Yronwood',r:'Dorne',x:200,y:1600,t:'fort'}
].map((t,i)=>({...t,i}));
$('cs').innerHTML=TW.map(t=>`<option value=${t.i}>Cidade inicial: ${t.n}</option>`).join('');
/** Pares de índices de TW ligados por estrada. */
const RL=[];for(let i=0;i<27;i++)RL.push([i,i+1]);RL.push([28,19],[29,3],[30,29],[31,21],[32,24]);
/** Layouts próprios: índice da cidade -> [código, meia-largura, meia-altura]. */
const LS={3:['wf',14,11],7:['cb',12,8],0:['pr',16,12],11:['cr',12,10],14:['ea',10,10],18:['hh',15,11],26:['py',12,9],1:['dr',12,10]};
TW.forEach(t=>{const l=LS[t.i];t.k=l?l[0]:0;t.rx=l?l[1]:8;t.ry=l?l[2]:7});
/** Devolve a cidade cuja área (com margem m) contém (x,y), ou undefined. */
const inTown=(x,y,m=0)=>TW.find(t=>Math.abs(x-t.x)<=t.rx+m&&Math.abs(y-t.y)<=t.ry+m);
/** Gera casas 3x3 com porta (tile 17) embaixo, nos centros dados. */
const HSE=(dx,dy,L)=>{for(const[a,b]of L)if(Math.abs(dx-a)<=1&&Math.abs(dy-b)<=1)return(dx==a&&dy==b+1)?17:9;return 0};
/** Interior das casas: sala fixa 7x5 em (20000,20000). Devolve o id do tile para (x,y). */
function room(x,y){const a=x-19996,b=y-19996;if(a<0||a>14||b<0||b>10)return 0;if(a==0||a==14||b==0)return 12;if(b==10)return a==7?17:12;return(RCH[RM.t]||[[10,2]]).some(([p,q])=>p==a&&q==b)?19:14}
/** Layout dos 8 lugares emblemáticos (k = wf/cb/pr/cr/ea/hh/py/dr) em coordenadas relativas ao centro da cidade. */
function lay(k,dx,dy){const B=(a,b)=>Math.abs(dx)<=a&&Math.abs(dy)<=b,R=(a,b)=>B(a,b)&&!B(a-1,b-1),cr=(a,b)=>Math.abs(dx)==a&&Math.abs(dy)==b,W=(a,b)=>R(a,b)?(cr(a,b)?13:(dx==0||dy==0?15:12)):0;let t;
 if(k=='wf'){t=W(13,10)||W(7,5)||HSE(dx,dy,[[10,-8],[10,3],[-5,8],[5,8]]);if(t)return t;if(B(13,10)&&!B(7,5)){if(dx<-8&&dy<-4)return(dx+dy)%3?3:10;if(dx<-8&&dy>5)return 0}return B(13,10)?14:8}
 if(k=='cb'){if(dy==-7||dy==-6)return Math.abs(dx)<=1?15:18;if(dy==-8)return 4;return W(7,4)||HSE(dx,dy,[[-10,2],[10,2]])||(B(7,4)?14:8)}
 if(k=='pr'){if(dy>8)return dx%4==0&&dy<=11?16:0;t=W(15,8);if(t)return t;const a=dx-8,b=dy+4;if(Math.abs(a)<=4&&Math.abs(b)<=3){if(Math.abs(a)==4||Math.abs(b)==3)return(a==0&&b==3)?15:(Math.abs(a)==4&&Math.abs(b)==3?13:12);return(a==0&&b==0)?13:14}return HSE(dx,dy,[[-11,-5],[-11,3],[-6,-5],[-6,5],[5,4],[11,4]])||8}
 if(k=='cr'){if(dx<=-9)return 0;if(dy>=7)return dx%4==0?16:0;if(dy<=-4&&dx>=-8&&dx<=8){if(dx==0&&dy==-4)return 15;if(dy==-10&&dx==0)return 13;if(Math.abs(dx)<=3&&dy<=-5&&dy>=-8)return 14;return 5}return HSE(dx,dy,[[-6,2],[6,2],[-5,5],[5,5]])||8}
 if(k=='ea'){if([[-4,-4],[-2,-5],[2,-5],[4,-4],[-4,4],[4,4],[0,-5],[1,9],[-1,8],[1,7]].some(([a,b])=>a==dx&&b==dy))return 13;if(R(5,5))return(dx==0&&dy==5)?15:12;if(B(4,4)||(dx==0&&dy>5))return 14;return 5}
 if(k=='hh'){if(dy<=-9)return 0;if(dy==-8)return 1;if([[-10,-6],[10,-6],[-10,6],[10,6],[0,-6]].some(([a,b])=>Math.abs(dx-a)<=1&&Math.abs(dy-b)<=1))return 13;if(R(12,7))return H(dx,dy,3)>.78?14:12;return B(12,7)?((dx+dy)%7==0?8:14):8}
 if(k=='py'){for(const[a,b]of[[10,0],[-10,0],[0,-8],[0,8]]){if(dx==a&&dy==b)return 13;if(Math.abs(dx-a)<=1&&Math.abs(dy-b)<=1)return 14}if((dy==0&&Math.abs(dx)>=6&&Math.abs(dx)<=9)||(dx==0&&Math.abs(dy)>=4&&Math.abs(dy)<=7))return 16;if(R(5,3))return cr(5,3)?13:((dy==0&&Math.abs(dx)==5)||(dx==0&&Math.abs(dy)==3))?15:12;return B(5,3)?14:0}
 if(k=='dr'){if((dx/10)**2+(dy/8)**2>1)return dx==0&&dy>=9?16:0;t=W(7,4);if(t)return t;if(B(6,3))return 14;if(dy<-5&&Math.abs(dx)<=4)return 5;return 1}
 return 8}
/** Diz se (x,y) está sobre uma estrada (ligações da lista RL, em L: horizontal e depois vertical). */
function road(x,y){if((x==0||x==1)&&y<=-52&&y>=-70)return 1;for(const[p,q]of RL){const a=TW[p],b=TW[q];if(y-a.y>=0&&y-a.y<=1&&x>=Math.min(a.x,b.x)&&x<=Math.max(a.x,b.x)+1)return 1;if(x-b.x>=0&&x-b.x<=1&&y>=Math.min(a.y,b.y)&&y<=Math.max(a.y,b.y)+1)return 1}return 0}
/* ===== rios e casas rurais ===== */
/** Rios: p = pontos (x,y) em tiles. Centro fundo (tile 21, sólido); bordas e vaus (tile 20, atravessável e lento). Estradas cruzam por ponte (tile 16). */
const RV=[
{n:'Tridente',p:[[-330,260],[-180,300],[-10,352],[120,400],[240,470],[300,560],[335,640]]},
{n:'Mander',p:[[180,880],[40,960],[-60,1015],[-150,1064],[-290,1130],[-440,1200],[-560,1270]]},
{n:'Torrente',p:[[120,1480],[230,1380],[330,1290],[430,1200],[520,1110],[600,1040]]}];
RV.forEach(r=>{let L=0;r.s=[];for(let i=0;i<r.p.length-1;i++){const a=r.p[i],b=r.p[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);r.s.push({a,b,l,L0:L});L+=l}
 const xs=r.p.map(q=>q[0]),ys=r.p.map(q=>q[1]);r.bb=[Math.min(...xs)-8,Math.max(...xs)+8,Math.min(...ys)-8,Math.max(...ys)+8]});
/** Rio em (x,y): 0 = nenhum, 1 = vau (raso), 2 = fundo. Largura varia com ruído; a cada 70 tiles há um vau de 6 tiles que atravessa o centro. */
function riverAt(x,y){for(const r of RV){if(x<r.bb[0]||x>r.bb[1]||y<r.bb[2]||y>r.bb[3])continue;let best=1e9,pos=0;
  for(const g of r.s){const dx=g.b[0]-g.a[0],dy=g.b[1]-g.a[1];let t=((x-g.a[0])*dx+(y-g.a[1])*dy)/(g.l*g.l);t=t<0?0:t>1?1:t;const d=Math.hypot(x-g.a[0]-dx*t,y-g.a[1]-dy*t);if(d<best){best=d;pos=g.L0+g.l*t}}
  const hw=2.6+(VN(x/9,y/9,55)-.5)*2.4;
  if(best<hw)return(best<Math.max(.8,hw*.45)&&pos%70>6)?2:1}
 return 0}
/** Tipos de casa rural (w = peso do sorteio), células da grade, caches, camponeses neutros (RN) e estado do interior (RM.t = tipo da casa em que o jogador está; -1 = casa de cidade). */
const RT=[{n:'Fazenda',w:30},{n:'Cabana',w:30},{n:'Taverna',w:12},{n:'Moinho',w:13},{n:'Santuário',w:15}],RCELL=28,rcache=new Map(),rdead=new Map(),RN=[],RM={t:-1};
/** Posições dos baús dentro da sala (a,b) por tipo de casa; padrão (5,1). */
const RCH={0:[[5,1]],1:[[1,1]],2:[[5,1]],3:[[5,3]],4:[[3,1]]},RFV=['campones','carpinteiro','taverneiro','campones','sacerdote'],RFN=['Fazendeiro','Lenhador','Taverneiro','Moleiro','Sacerdote'];
const baseN=(x,y)=>VN(x/16,y/16,1)*.7+VN(x/6,y/6,2)*.3;
/** Casa rural da célula (i,j) de 28x28 tiles, ou null. Densidade: maior na Campina/Terras Fluviais, menor no Norte e em Dorne. Fica longe de cidades, estradas, rios e água; perto de rio vira Moinho. */
function ruralCell(i,j){const key=i*100003+j;if(rcache.has(key))return rcache.get(key);let r=null;
 const cx0=i*RCELL+5+Math.floor(H(i,j,102)*(RCELL-10)),cy0=j*RCELL+5+Math.floor(H(i,j,103)*(RCELL-10));
 const dens=cy0<-62?.12:cy0>1400?.10:(cy0>100&&cy0<1400)?.34:.24;
 if(cy0>-640&&Math.abs(cy0+60)>6&&cx0<19000&&H(i,j,101)<dens&&!inTown(cx0,cy0,10)){let ok=true;
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,0]]){const n=baseN(cx0+a,cy0+b);if(n<.37||n>.68)ok=false}
  for(let a=-2;ok&&a<=2;a++)for(let b=-2;b<=3;b++)if(road(cx0+a,cy0+b)||riverAt(cx0+a,cy0+b)){ok=false;break}
  if(ok){let ty=0,R=H(i,j,104)*100,acc=0;for(let k=0;k<RT.length;k++){acc+=RT[k].w;if(R<acc){ty=k;break}}
   if(H(i,j,105)<.7&&[[7,0],[-7,0],[0,7],[0,-7]].some(([a,b])=>riverAt(cx0+a,cy0+b)))ty=3;
   r={x:cx0,y:cy0,t:ty,i,j}}}
 if(rcache.size>5000)rcache.clear();rcache.set(key,r);return r}
/** Casa rural cuja célula contém (x,y). */
const ruralAt=(x,y)=>ruralCell(Math.floor(x/RCELL),Math.floor(y/RCELL));
/** Tile de casa rural em (x,y): 9 (parede/telhado), 17 (porta, embaixo no centro) ou 0. */
function ruralTile(x,y){if(x>=19000)return 0;const r=ruralAt(x,y);if(!r)return 0;const dx=x-r.x,dy=y-r.y;return(Math.abs(dx)<=1&&Math.abs(dy)<=1)?((dx==0&&dy==1)?17:9):0}
/** Gerador do mundo: devolve o id do tile em (x,y). Ordem: interior > cidade/layout > Muralha > estrada (ponte se cruzar rio) > rio > casa rural > ruído (água/areia/grama/floresta/neve/montanha/minério). */
function gen(x,y){if(x>=19990)return room(x,y);const t=inTown(x,y);if(t){const dx=x-t.x,dy=y-t.y;if(t.k)return lay(t.k,dx,dy);return HSE(dx,dy,[[-5,-4],[5,-4],[-5,4],[5,4]])||8}
 const w7=TW[7];if(Math.abs(y-(w7.y-6.5))<=.5&&Math.abs(x-w7.x)<=240)return Math.abs(x-w7.x)<=1?15:18;
 const n=VN(x/16,y/16,1)*.7+VN(x/6,y/6,2)*.3,rv=n>=.3?riverAt(x,y):0;if(road(x,y))return rv?16:6;if(y==-60||y==-61)return 7;if(rv)return rv==2?21:20;const rh=ruralTile(x,y);if(rh)return rh;if(n<.3)return 0;if(n<.34)return 1;if(n>.74)return H(x,y,12)>.93?11:5;
 if(y<-61)return H(x,y,9)>.86?10:4;
 if(VN(x/4,y/4,3)>.64&&H(x,y,4)>.35)return y<-15?10:3;return 2}
/** Chave numérica de (x,y) para cache e conjunto de cortes. */
const kk=(x,y)=>(x+5e4)*1e5+y+5e4,tc=new Map(),cut=new Set(),SOL=new Set([0,3,5,7,9,10,11,12,13,18,19,21]);
/** Versão com cache de gen(); aplica árvores/minérios já cortados (conjunto cut). */
function tile(x,y){const k=kk(x,y);let v=tc.get(k);if(v===undefined){v=gen(x,y);tc.set(k,v);if(tc.size>9e4)tc.clear()}return cut.has(k)&&(v==3||v==10||v==11)?(v==11?5:(v==10&&y<-61?4:2)):v}
/** NPCs fixos: ferreiro, mercador e estalajadeiro de cada cidade; Castle Black tem irmãos juramentados e guardião do portão. */
const NP=[];TW.forEach(t=>{
 if(t.i==7){NP.push({n:'Ferreiro Donal Noye',k:'f',ti:7,x:t.x-2,y:t.y},{n:'Intendente da Patrulha',k:'m',ti:7,x:t.x+2,y:t.y},{n:'Meistre Aemon',k:'e',ti:7,x:t.x,y:t.y-2})}
 else{NP.push({n:'Ferreiro de '+t.n,k:'f',ti:t.i,x:t.x-2,y:t.y},{n:'Mercador de '+t.n,k:'m',ti:t.i,x:t.x+2,y:t.y},{n:'Estalajadeiro de '+t.n,k:'e',ti:t.i,x:t.x,y:t.y-2})}
});
NP.push({n:'Patrulheiro do Portão',k:'gate',ti:7,x:0,y:-655,dx:0,dy:-655,g:'m'});
NP.forEach(n=>{n.dx=n.x;n.dy=n.y});
/* ===== dados ===== */
/** Armas (n nome, a ataque, c custo, t tipo/proficiência, q proficiência mínima, m durabilidade). */
const W=[{n:'Punhos',a:0,t:'unarmed',q:0,m:100},{n:'Adaga',a:2,c:60,t:'sword',q:0,m:80},{n:'Espada Longa',a:5,c:180,t:'sword',q:10,m:100},{n:'Espada de Aço',a:9,c:500,t:'sword',q:30,m:120},{n:'Aço Valiriano',a:16,c:2500,t:'sword',q:50,m:200}];
/** Armaduras (d defesa, c custo, m durabilidade). */
const A=[{n:'Roupas',d:0,m:100},{n:'Gibão de Couro',d:1,c:70,m:100},{n:'Cota de Malha',d:3,c:220,m:120},{n:'Armadura de Placas',d:6,c:650,m:150},{n:'Armadura Valiriana',d:10,c:2800,m:200}];
/** Escudos; HE são capacetes; IT agrupa os catálogos por slot. */
const SH=[{n:'(nenhum)',d:0,m:100},{n:'Escudo de Madeira',d:1,c:40,m:80},{n:'Escudo de Ferro',d:3,c:160,m:120}],HE=[{n:'(nenhum)',d:0,m:100},{n:'Capuz de Couro',d:1,c:30,m:80},{n:'Elmo de Ferro',d:2,c:120,m:100}],IT={w:W,a:A,s:SH,hd:HE},SL=['w','a','s','hd','b','g','c','r1','r2','am'];
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
const G={t:0,bn:0,bt:''},K=new Set(),mons=[],CZ=[],fxs=[],logs=[];let P=null,user=null,S=null;
/** Vida máxima = 100 + 15/nível (+20 Stark). */
const mh=()=>100+(P.lvl-1)*15+(P.h=='S'?20:0),nx=()=>Math.round(60*P.lvl**1.7);
/** Cidade mais próxima do jogador e a distância. */
const nearestTown=()=>TW.reduce((a,t)=>{const d=Math.hypot(P.x-t.x,P.y-t.y);return !a||d<a.d?{t,d}:a},null);
/** Ataque total = (3 + arma + 1,2*nível + bônus Targaryen) * proficiência, -20% se sobrecarregado. */
const atkV=()=>{const w=W[P.w];return(3+w.a+Math.floor(P.lvl*1.2)+(P.h=='T'?3:0))*(1+(P.pf[w.t]||0)/100)*(ov()?.8:1)},defV=()=>A[P.a].d+SH[P.s].d+HE[P.hd].d+(P.h=='B'?2:0);
/** Gasta a durabilidade de um slot; quebra em 0%. */
const wear=t=>{if(!P[t])return;const it=IT[t][P[t]];P.du[t]-=100/it.m;if(P.du[t]<=0){msg(it.n+' quebrou!','#ff8a80');P[t]=0;P.du[t]=100}};
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
const SK=['name','x','y','hp','lvl','xp','gold','inv','w','a','s','hd','b','g','c','r1','r2','am','du','pf','rp','mw','h','home','kills','pt','rt','lt','playTime'];
/** Salva o personagem em localStorage dentro da conta (campos listados em SK). */
function save(){if(!P||!user)return;const a=ld();if(!a[user])return;const o={};SK.forEach(k=>o[k]=P[k]);o.horse=!!P.horse;o.mounted=!!P.mounted;o.cut=[...cut];o.v=10;a[user].s=o;sv(a)}
/** Tela de login: entra ou cria conta (nome, cidade inicial, casa) e chama start(). */
async function auth(reg){const u=$('u').value.trim().toLowerCase(),pw=$('pw').value,e=$('err');if(u.length<3||pw.length<4){e.textContent='Use ao menos 3 letras no nome e 4 na senha.';return}
 const a=ld(),h=await hs(pw);
 if(reg){if(a[u]){e.textContent='Esse nome já existe. Entre ou escolha outro.';return}const hh=$('hs').value,ci=+$('cs').value,nm=$('cn').value.trim();if(nm.length<3||nm.length>16){e.textContent='Nome do personagem: 3 a 16 caracteres.';return}const c=TW[ci];a[u]={h,s:{name:nm,x:c.x,y:c.y+2,hp:100+(hh=='S'?20:0),lvl:1,xp:0,gold:50+(hh=='L'?250:0),inv:{pot:2},w:0,a:0,h:hh,home:ci,kills:0,pt:0,horse:false,mounted:false,cut:[],v:10}};if(!sv(a)){e.textContent='Não foi possível salvar neste navegador.';return}}
 else{if(a[u]&&typeof a[u].h==='string'&&a[u].h.length===1){a[u].h=h;sv(a);auth.rep=1}
  if(!a[u]||a[u].h!=h){e.textContent='Usuário ou senha incorretos.';return}}
 start(u,a[u].s);if(auth.rep){auth.rep=0;msg('Conta antiga reparada: esta senha agora é a da sua conta.','#e2b04a')}}
/** Inicia a sessão: preenche padrões faltantes do save (migração), zera monstros/cidadãos e mostra o jogo. */
function start(u,s){user=u;P={...s,inv:{...s.inv}};P.name=P.name||u;SL.forEach(k=>P[k]|=0);P.du={...Object.fromEntries(SL.map(k=>[k,100])),...P.du};P.pf={sword:0,axe:0,bow:0,unarmed:20,woodcut:10,fish:0,cook:0,repair:0,mining:0,...P.pf};P.rp={...P.rp};P.mw=P.mw||100;const HOME={S:3,L:11,T:1,B:21},SP={S:[TW[3].x,TW[3].y+2],L:[TW[11].x,TW[11].y+2],T:[TW[1].x,TW[1].y+2],B:[TW[21].x,TW[21].y+2]};const legacyCastle=Math.abs(P.x)<=3&&P.y>=-55&&P.y<=-49;if(!P.v&&legacyCastle&&HOME[P.h]!==undefined){P.home=HOME[P.h];P.x=SP[P.h][0];P.y=SP[P.h][1];P.dx=P.x;P.dy=P.y}if(u==='sudo'){P.gold=999999999;P.w=W.length-1;P.a=A.length-1;P.lvl=30;P.xp=0;P.hp=mh();P.horse=true;P.mounted=true;P.inv={pot:99,'Vidro de Dragão':99,'Escama de Dragão':99,'Pele de Lobo':99,'Madeira':99};}cut.clear();(s.cut||[]).forEach(k=>cut.add(k));tc.clear();Object.assign(P,{dx:P.x,dy:P.y,mv:0,cd:0,f:[0,1],tw:-1,horse:!!P.horse,mounted:!!P.mounted});mons.length=0;CZ.length=0;G.al=0;S=null;$('md').style.display='none';$('inventory-panel').style.display='flex';setInventoryOpen(true);$('hud').style.display='block';$('top-actions').style.display='flex';$('lgn').style.display='none';$('err').textContent='';logs.length=0;msg('Bem-vindo. Mova-se com <span class=k>WASD</span>, ataque com <span class=k>Espaço</span>, fale com NPCs e corte árvores com <span class=k>E</span>, cure-se com <span class=k>Q</span>, inventário em <span class=k>I</span>.','#8fd0f0');msg('Cidades são seguras. Cuidado com saqueadores nas estradas.')}
$('bi').onclick=()=>auth(0);$('br').onclick=()=>auth(1);$('pw').onkeydown=e=>{if(e.key=='Enter')auth(0)};
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
const REG={'Terras da Coroa':1.1,'O Norte':1.2,'A Campina':.9,'Terras do Oeste':1,'Vale de Arryn':1.05,'Terras Fluviais':.95,'Terras da Tempestade':1,'Dorne':1.1,'Ilhas de Ferro':1.15,'Além da Muralha':1.4},sp=k=>Math.round(LT[k]*P.inv[k]*((/^Minério/.test(k)&&['Vale de Arryn','Terras do Oeste'].includes(TW[S.ti].r))||(k=='Peixe'&&['Ilhas de Ferro','Terras da Coroa'].includes(TW[S.ti].r))?1.3:1)),tool=(k,c)=>row(`${k} — ${pc(c)}g`,`buyT('${k}',${c})`,P.inv[k]?'Possui':'Comprar',!!P.inv[k]);
/** Nomes dos slots exibidos; pm() é o fator de preço (reputação x região). */
const SN={w:'Arma',a:'Armadura',s:'Escudo',hd:'Capacete'},pm=()=>{const r=P.rp[S.ti]||0;return(r>=51?.6:r>=1?.8:r<=-50?1.5:1)*(REG[TW[S.ti].r]||1)},pc=c=>Math.round(c*pm()),rp1=()=>{P.rp[S.ti]=Math.min(100,(P.rp[S.ti]||0)+1)};
/** Desenha o painel central: inventário (k=inv), mercador (m), ferreiro (f) ou estalajadeiro (e). */
function shop(){const n=S;let h=`<h3>${n.n}</h3>`;
 if(n.k=='inv'){h+=`<div class=m>Peso ${wt().toFixed(1)}/${P.mw} kg${ov()?' — <b style="color:#ff8a80">sobrecarregado</b> (movimento −30%, ataque −20%)':''}</div>`;const ks=Object.keys(P.inv).filter(k=>P.inv[k]);h+=ks.length?ks.map(k=>`<div class=r><span>${k} ×${P.inv[k]}</span><span class=m>${(P.inv[k]*(IW[k]??1)).toFixed(1)} kg</span></div>`).join(''):'<div class=m>Vazio.</div>';h+='<h3 style="margin-top:8px">Equipado</h3>';for(const t in SN){const it=IT[t][P[t]];h+=`<div class=r><span>${SN[t]}: ${it.n}</span><span class=m>${P[t]?Math.ceil(P.du[t])+'%':'—'}</span></div>`}}
 else{const pr=pm(),pt=pr<1?' · preços −'+Math.round((1-pr)*100)+'%':pr>1?' · preços +'+Math.round((pr-1)*100)+'%':'';h+=`<div class=m>Ouro: ${P.gold}g${pt}</div>`;
  if(n.k=='m'){h+=row(`Poção de Cura (+45 vida) — ${pc(25)}g`,"buy('pot')",'Comprar')+`<div class=m>Você tem ${P.inv.pot||0}. Use com Q.</div>`;h+=tool('Vara de Pescar',35);for(const k in LT)if(P.inv[k])h+=row(`${k} ×${P.inv[k]} — ${sp(k)}g`,`sell('${k}')`,'Vender tudo')}
  if(n.k=='f'){const m=Math.min(4,n.ti+1);for(let i=1;i<=m;i++){const it=W[i],lk=P.pf[it.t]<it.q;h+=row(`${it.n} (ataque +${it.a}) — ${pc(it.c)}g`,`eq('w',${i})`,P.w>=i?'Equipado':lk?`Requer ${it.t} ${it.q}`:'Comprar',P.w>=i||lk)}
   for(const t of['a','s','hd'])for(let i=1;i<IT[t].length&&i<=(t=='a'?m:2);i++){const it=IT[t][i];h+=row(`${it.n} (defesa +${it.d}) — ${pc(it.c)}g`,`eq('${t}',${i})`,P[t]>=i?'Equipado':'Comprar',P[t]>=i)}
   for(const t in SN)if(P[t]&&P.du[t]<99){const it=IT[t][P[t]];h+=row(`Reparar ${it.n} (${Math.ceil(P.du[t])}%) — ${pc(Math.ceil(it.c*.2))}g`,`fix('${t}')`,'Reparar')}
   h+=tool('Machado de Corte',40)+tool('Picareta',60);h+=`<div class=m>Equipamentos melhores aparecem em cidades mais ao sul.</div>`}
  if(n.k=='pr'){h+=row('Receber a bênção: recuperar toda a vida — grátis','rest()','Rezar')+'<div class=m>O sacerdote cuida do santuário.</div>'}
  if(n.k=='e'){h+=row('Descansar e recuperar toda a vida — grátis','rest()','Descansar')+`<div class=m>Ao entrar numa cidade, ela vira seu ponto de retorno se você cair em combate.</div>`}}
 $('md').innerHTML='<button type="button" class="panel-close" onclick="closeShop()" aria-label="Fechar">×</button>'+h+'<div style="text-align:right;margin-top:8px"><button onclick="closeShop()">Fechar</button></div>';$('md').style.display='block'}
/** Fecha o painel central e salva. */
function closeShop(){S=null;$('md').style.display='none';save()}
/** Compra uma poção (checa ouro, peso e preço com reputação/região). */
function buy(k){const c=pc(25);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');if(wt()+.5>P.mw&&user!=='sudo')return msg('Você não aguenta mais peso.','#ff8a80');P.gold-=c;P.inv.pot=(P.inv.pot||0)+1;rp1();shop()}
/** Vende todo o stack de um item de LT no mercador atual. */
function sell(k){P.gold+=sp(k);msg(`Vendeu ${P.inv[k]}× ${k}.`,'#e2b04a');delete P.inv[k];rp1();shop();save()}
/** Compra uma ferramenta (Machado, Picareta, Vara) — só uma de cada. */
function buyT(k,c){c=pc(c);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P.inv[k]=1;rp1();msg('Comprou '+k+'.','#e2b04a');shop();save()}
/** Compra e equipa uma peça (arma, armadura, escudo, capacete) com durabilidade 100%. */
function eq(t,i){const it=IT[t][i],c=pc(it.c);if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P[t]=i;P.du[t]=100;rp1();msg('Equipou '+it.n+'.','#e2b04a');shop();save()}
/** Repara a peça equipada de um slot por 20% do preço. */
function fix(t){const c=pc(Math.ceil(IT[t][P[t]].c*.2));if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P.du[t]=100;P.pf.repair=Math.min(100,P.pf.repair+.5);msg('Equipamento reparado.','#e2b04a');shop();save()}
/** Buffer do código secreto. */
const CHT=[];
/** Código secreto 676767 (em 2,5 s): melhores itens, ferramentas e cavalo. */
function cheat(k){const n=performance.now();CHT.push([k,n]);while(CHT.length&&(n-CHT[0][1]>2500||CHT.length>6))CHT.shift();if(CHT.map(c=>c[0]).join('')=='676767'){CHT.length=0;P.w=4;P.a=4;P.s=2;P.hd=2;SL.forEach(t=>P.du[t]=100);P.horse=true;P.mounted=true;for(const t of['Machado de Corte','Picareta','Vara de Pescar'])P.inv[t]=1;P.inv.pot=(P.inv.pot||0)+10;msg('Código secreto: melhores itens e um cavalo!','#ffd24a');fx(P.x,P.y,'★','#ffd24a');save()}}
/** Estalajadeiro: recupera toda a vida. */
function rest(){P.hp=mh();msg('Você descansou e se sente renovado.','#9f9');save()}
/* ===== jogo ===== */
/** Diz se um tile é pisável: não sólido e sem NPC, monstro ou cidadão. */
const free=(x,y)=>!SOL.has(tile(x,y))&&!NP.some(n=>n.x==x&&n.y==y)&&!mons.some(m=>m.x==x&&m.y==y)&&!CZ.some(c=>!c.in&&c.x==x&&c.y==y)&&!RN.some(r=>r.x==x&&r.y==y);
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
function atk(m){if(P.cd>0)return;P.cd=.65;const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5)));wear('w');m.hp-=d;m.ht=.12;fx(m.x,m.y,'-'+d,'#fff2b0');if(m.hp<=0)kill(m)}
/** Recompensas da morte de um monstro: ouro, XP, proficiência da arma, loot (60%) e subida de nível. */
function kill(m){mons.splice(mons.indexOf(m),1);const d=MT[m.t],g=d.g[0]+Math.floor(Math.random()*(d.g[1]-d.g[0]+1));P.gold+=g;P.xp+=d.xp;P.kills++;const wp=W[P.w].t;P.pf[wp]=Math.min(100,(P.pf[wp]||0)+.5);let s=`${d.n} derrotado: +${d.xp} XP, +${g}g`;
 if(Math.random()<.6){P.inv[d.l]=(P.inv[d.l]||0)+1;s+=', '+d.l}if(Math.random()<.12){P.inv.pot=(P.inv.pot||0)+1;s+=', Poção de Cura'}msg(s,'#9f9');
 while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a');fx(P.x,P.y,'NÍVEL!','#ffd24a');save()}}
/** Morte definitiva do jogador: apaga todo o progresso e o personagem é excluído. */
function die(){
 const nm=P?P.name:'Seu personagem';const a=ld();if(user&&a[user]){delete a[user];sv(a)}
 P=null;user=null;S=null;G.al=0;mons.length=0;CZ.length=0;RN.length=0;
 $('inventory-panel').style.display='none';$('hud').style.display='none';$('top-actions').style.display='none';$('md').style.display='none';
 $('lgn').style.display='flex';$('err').textContent=`MORTE DEFINITIVA: ${nm} pereceu em combate. O personagem foi apagado.`;$('err').style.color='#ff6b5f';
}
/** Cores de roupa dos cidadãos (reserva sem sprite). */
const CC=['#6a8a5a','#8a6a4a','#5a6e9a','#9a5a5a','#7a6a8a'];
/** Mantém cidadãos e guardas de uma cidade; em Castle Black todos são irmãos juramentados da Patrulha da Noite. */
function popT(t){if(!t.dr){t.dr=[];for(let y=t.y-t.ry;y<=t.y+t.ry;y++)for(let x=t.x-t.rx;x<=t.x+t.rx;x++)if(tile(x,y)==17)t.dr.push([x,y])}
 const isCB=t.i==7,want={cit:isCB?0:(t.t=='ruin'?2:t.t=='city'?8:5),sd:isCB?8:(t.t=='wall'?6:t.t=='city'?4:t.t=='ruin'?0:3)};
 for(const k in want){let n=CZ.filter(c=>c.ti==t.i&&c.k==k).length;for(let j=0;j<6&&n<want[k];j++){const x=t.x-t.rx+1+(Math.random()*(2*t.rx-1)|0),y=t.y-t.ry+1+(Math.random()*(2*t.ry-1)|0),q=tile(x,y);if(!free(x,y)||q==17||(x==P.x&&y==P.y))continue;CZ.push({k,ti:t.i,x,y,dx:x,dy:y,mv:Math.random(),cd:0,tm:0,st:0,hp:90,g:Math.random()<.5?'f':'m',v:isCB?'soldado':['campones','campones','campones','mendigo','viajante','carpinteiro','sacerdote','maester'][Math.random()*8|0],col:isCB?'#1c1c22':CC[Math.random()*CC.length|0],pn:isCB?'Patrulheiro da Noite':null});n++}}}
/** Jogador bate em cidadão/guarda: Castle Black é imune a ataques; cidades comuns ativam alerta. */
function hitC(c){if(P.cd>0)return;if(c.ti==7)return msg('Você não pode desembainhar armas contra irmãos da Patrulha da Noite.','#9aa3b2');
 P.cd=.65;const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5))),first=!(G.al>0);wear('w');c.hp-=d;fx(c.x,c.y,'-'+d,'#fff2b0');G.al=25;G.alt=c.ti;
 if(first){msg('Os guardas de '+TW[c.ti].n+' foram alertados!','#ff8a80');if(c.k=='cit')P.rp[c.ti]=Math.max(-100,(P.rp[c.ti]||0)-10)}
 if(c.hp<=0){CZ.splice(CZ.indexOf(c),1);if(c.k=='sd'){P.xp+=30;P.gold+=12;msg('Guarda derrotado: +30 XP, +12g','#9f9')}else{G.al=40;P.rp[c.ti]=Math.max(-100,(P.rp[c.ti]||0)-15);msg('Você matou um cidadão. A reputação caiu.','#ff8a80')}
  while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a');save()}}}
/** IA dos cidadãos e guardas: passeio, entrar em casas, perseguir e atacar durante o alerta. */
function czUpd(dt){G.pc=(G.pc||0)-dt;if(G.al>0)G.al-=dt;
 if(G.pc<=0){G.pc=1;for(let i=CZ.length-1;i>=0;i--)if(Math.hypot(CZ[i].x-P.x,CZ[i].y-P.y)>50)CZ.splice(i,1);const nt=inTown(P.x,P.y,10);if(nt&&P.x<19990)popT(nt)}
 for(const c of CZ){c.mv-=dt;c.cd-=dt;if(c.in){c.tm-=dt;if(c.tm<=0)c.in=0;continue}
  c.dx+=(c.x-c.dx)*Math.min(1,dt*10);c.dy+=(c.y-c.dy)*Math.min(1,dt*10);
  const t=TW[c.ti],hunt=c.k=='sd'&&G.al>0&&G.alt==c.ti&&inTown(P.x,P.y,3),ex=P.x-c.x,ey=P.y-c.y,dist=Math.max(Math.abs(ex),Math.abs(ey));
  if(hunt&&dist<=1){if(c.cd<=0){c.cd=1.2;const h=Math.max(1,Math.round(10+Math.floor(Math.random()*5)-defV()/2));P.hp-=h;fx(P.x,P.y,'-'+h,'#ff6b5f');['a','s','hd'].forEach(wear);if(P.hp<=0){die();return}}continue}
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
/** Ação de E: corta árvore, extrai minério (Picareta) ou pesca (Vara) no tile à frente. */
function chop(){const x=P.x+P.f[0],y=P.y+P.f[1],t=tile(x,y),I=P.inv,R=Math.random();
 if(t==3||t==10){cut.add(kk(x,y));const q=1+(I['Machado de Corte']?1:0)+(R<P.pf.woodcut/100?1:0);I['Madeira']=(I['Madeira']||0)+q;P.pf.woodcut=Math.min(100,P.pf.woodcut+.5);msg('Você cortou uma árvore. +'+q+' Madeira','#c9a')}
 else if(t==11){if(!I['Picareta'])return msg('Você precisa de uma Picareta.','#9aa3b2');cut.add(kk(x,y));const o=R<.7?'Minério de Ferro':R<.95?'Minério de Cobre':'Minério de Prata',q=1+(Math.random()<P.pf.mining/100?1:0);I[o]=(I[o]||0)+q;P.pf.mining=Math.min(100,P.pf.mining+.5);msg('Você extraiu '+q+'× '+o+'.','#c9a')}
 else if(t==0||t==7||t==20||t==21){if(!I['Vara de Pescar'])return msg('Você precisa de uma Vara de Pescar.','#9aa3b2');if(G.t<(P.fc||0))return;P.fc=G.t+1.5;P.pf.fish=Math.min(100,P.pf.fish+.3);if(Math.random()<.3+P.pf.fish*.006){I['Peixe']=(I['Peixe']||0)+1;msg('Você pescou um Peixe.','#8fd0f0')}else msg('Nada mordeu a isca.','#9aa3b2')}
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
function hitR(r){if(P.cd>0)return;P.cd=.65;const d=Math.max(1,Math.round(atkV()+Math.floor(Math.random()*5)));wear('w');r.hp-=d;r.ang=10;fx(r.x,r.y,'-'+d,'#fff2b0');
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
  if(c.ang>0&&dist<=1){if(c.cd<=0){c.cd=1.4;const h=Math.max(1,Math.round(3+Math.floor(Math.random()*4)-defV()/2));P.hp-=h;fx(P.x,P.y,'-'+h,'#ff6b5f');['a','s','hd'].forEach(wear);if(P.hp<=0){die();return}}continue}
  if(c.mv>0)continue;c.mv=c.ang>0?.5:.9+Math.random()*1.2;let a=0,b=0;
  if(c.ang>0){if(Math.abs(ex)>=Math.abs(ey))a=Math.sign(ex);else b=Math.sign(ey)}else if(Math.random()<.5){const q=Math.random()*4|0;a=[1,-1,0,0][q];b=[0,0,1,-1][q]}
  const X=c.x+a,Y=c.y+b;if((a||b)&&free(X,Y)&&!(X==P.x&&Y==P.y)&&tile(X,Y)!=20&&!inTown(X,Y)&&(c.ang>0||Math.hypot(X-c.hx,Y-c.hy)<=6)){c.x=X;c.y=Y}}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT')return;if(!P||wmOpen())return;if(/^\d$/.test(k)&&!e.repeat)cheat(k);
 if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','e','q','c'].includes(k))e.preventDefault();
 if(k=='escape'&&S)return closeShop();if(S)return;if(k=='i'&&!e.repeat){toggleInventory();return}if(k=='c'&&!e.repeat){if(!P.horse)return msg('Você não possui um cavalo.','#9aa3b2');P.mounted=!P.mounted;msg(P.mounted?'Você montou a cavalo.':'Você desmontou.','#e2b04a');save();return;}K.add(k);
 if(k=='e'&&!e.repeat&&!talk())chop();
 if(k=='q'&&!e.repeat){if(P.inv.pot>0&&P.hp<mh()){P.inv.pot--;P.hp=Math.min(mh(),P.hp+45);fx(P.x,P.y,'+45','#7f7')}else msg('Sem poções ou vida cheia.','#9aa3b2')}});
addEventListener('keyup',e=>K.delete(e.key.toLowerCase()));addEventListener('blur',()=>K.clear());
cv.addEventListener('pointerdown',e=>{if(!P||S)return;const s=sc(),x=Math.round(P.dx+(e.clientX-cv.width/2)/s),y=Math.round(P.dy+(e.clientY-cv.height/2)/s);
 const n=NP.find(n=>n.x==x&&n.y==y);if(n){if(!talk())msg('Aproxime-se de '+n.n+'.','#9aa3b2');return}
 const rn=RN.find(r=>r.x==x&&r.y==y);if(rn){if(Math.max(Math.abs(rn.x-P.x),Math.abs(rn.y-P.y))<=1)hitR(rn);else msg('Alvo distante demais.','#9aa3b2');return}
 const cz=CZ.find(c=>!c.in&&c.x==x&&c.y==y);if(cz){if(Math.max(Math.abs(cz.x-P.x),Math.abs(cz.y-P.y))<=1)hitC(cz);else msg('Alvo distante demais.','#9aa3b2');return}
 const m=mons.find(m=>m.x==x&&m.y==y);if(m){if(Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))<=1)atk(m);else msg('Alvo distante demais.','#9aa3b2');return}
 const dx=x-P.x,dy=y-P.y;if(Math.abs(dx)+Math.abs(dy)==1){P.f=[dx,dy];chop()}});
/** Tamanho do tile em pixels na tela (zoom do jogo). */
const sc=()=>(cv.width<700?1.4:2)*T;
/** Atualização por quadro: entrada, movimento, portas, monstros, regeneração, alerta e autosave. */
function upd(dt){G.t+=dt;P.playTime=(P.playTime||0)+dt;P.mv-=dt;P.cd-=dt;const sf=inTown(P.x,P.y);
 P.dx+=(P.x-P.dx)*Math.min(1,dt*16);P.dy+=(P.y-P.dy)*Math.min(1,dt*16);
 if(P.mv<=0){let a=(K.has('d')||K.has('arrowright'))-(K.has('a')||K.has('arrowleft')),b=(K.has('s')||K.has('arrowdown'))-(K.has('w')||K.has('arrowup'));if(a)b=0;
  if(a||b){P.f=[a,b];const x=P.x+a,y=P.y+b;
   if(P.lvl<20&&b<0&&y<=-656&&P.y>=-656&&Math.abs(x-TW[7].x)<=2){
    msg('Patrulheiro do Portão: "Só pode passar quando for mais forte." (Requer Nível 20)','#ff8a80');
    fx(P.x,P.y,'NÍVEL 20+','#ff8a80');P.mv=.3;return;
   }
   if(free(x,y)){P.lx=P.x;P.ly=P.y;P.x=x;P.y=y;if(P.mounted&&tile(x,y)==0){P.mounted=false;msg('O cavalo não entra na água; você desmontou.','#9aa3b2')}const roadTile=tile(x,y)==6;P.mv=(P.mounted?(roadTile?.12:.20):(roadTile?.52:.62))*(ov()?1/.7:1)*(tile(x,y)==20?1.8:1)}}}
 if(K.has(' ')){const m=mons.filter(m=>Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))<=1).sort((a,b)=>a.hp-b.hp)[0];if(m)atk(m);else{const c=CZ.find(c=>!c.in&&Math.max(Math.abs(c.x-P.x),Math.abs(c.y-P.y))<=1);if(c)hitC(c);else{const r=RN.find(r=>Math.max(Math.abs(r.x-P.x),Math.abs(r.y-P.y))<=1);if(r)hitR(r)}}}
 if(tile(P.x,P.y)==17){if(P.x>=19990){const r=P.rt||[TW[P.home].x,TW[P.home].y+2];P.x=r[0];P.y=r[1];setRoom(-1,0)}else{const rh=ruralAt(P.x,P.y),ty=rh&&rh.x==P.x&&rh.y+1==P.y?rh.t:-1;P.rt=[P.lx??P.x,P.ly??P.y];setRoom(ty,nearestTown().t.i);P.x=20003;P.y=20003;if(ty>=0)msg('Você entrou: '+RT[ty].n+'.','#e2b04a')}P.dx=P.x;P.dy=P.y;mons.length=0;P.mv=.3}
 const t=inTown(P.x,P.y);if(t&&t.i!=P.tw){P.tw=t.i;P.home=t.i;G.bn=3;G.bt=t.n}if(!t)P.tw=-1;
 P.hp=Math.min(mh(),P.hp+dt*(t?6:.6));
 G.sp=(G.sp||0)-dt;if(G.sp<=0){const beyond=P.y<-656;G.sp=beyond?1.5:4.0;spawn()}
 for(let i=mons.length-1;i>=0;i--){const m=mons[i],d=MT[m.t];if(Math.max(Math.abs(m.x-P.x),Math.abs(m.y-P.y))>40){mons.splice(i,1);continue}
  m.mv-=dt;m.cd-=dt;const ex=P.x-m.x,ey=P.y-m.y,dist=Math.max(Math.abs(ex),Math.abs(ey));
  if(dist<=1){if(m.cd<=0&&!t){m.cd=1.2;const h=Math.max(1,Math.round(d.d+Math.floor(Math.random()*5)-defV()/2));P.hp-=h;['a','s','hd'].forEach(wear);fx(P.x,P.y,'-'+h,'#ff6b5f');if(P.hp<=0){die();return}}}
  else if(m.mv<=0){m.mv=d.sp;let sx=0,sy=0;if(dist<8){if(Math.abs(ex)>=Math.abs(ey))sx=Math.sign(ex);else sy=Math.sign(ey)}else if(Math.random()<.4){const r=Math.random()*4|0;sx=[1,-1,0,0][r];sy=[0,0,1,-1][r]}
   const ok=(a,b)=>(a||b)&&free(m.x+a,m.y+b)&&!(m.x+a==P.x&&m.y+b==P.y)&&!inTown(m.x+a,m.y+b)&&tile(m.x+a,m.y+b)!=20;
   if(ok(sx,sy)){m.x+=sx;m.y+=sy}else if(dist<8){const a2=sx?0:Math.sign(ex),b2=sy?0:Math.sign(ey);if(ok(a2,b2)){m.x+=a2;m.y+=b2}}}
  m.dx+=(m.x-m.dx)*Math.min(1,dt*10);m.dy+=(m.y-m.dy)*Math.min(1,dt*10);m.ht-=dt}
 czUpd(dt);rnUpd(dt);for(let i=fxs.length-1;i>=0;i--){fxs[i].l-=dt;if(fxs[i].l<=0)fxs.splice(i,1)}G.bn-=dt}
/* ===== desenho ===== */
/** Desenha uma textura pelo nome no tile atual. */
function TD(n,X,Y,s){const i=TX[n];if(!i||!i.naturalWidth)return 0;cx.drawImage(i,X,Y,s+1,s+1);return 1}
/** Desenha o tile com as texturas de assets/westeros (variantes 8:1, água animada). Devolve 0 se faltar imagem. */
function texDraw(t,x,y,X,Y,s){cx.imageSmoothingEnabled=false;const a=n=>TD(n,X,Y,s);if(!a('grama'))return 0;
 const I=x>=19990,sn=y<-61,dz=y>1400,h=H(x,y,21),tw=(t>=12&&t<=17)&&!I?inTown(x,y):0,wk=tw&&(tw.k=='cb'||tw.k=='hh')?'tijolon':tw&&tw.k=='pr'?'tijolo':'pedregulho';
 const gr=()=>sn?a('neve'):dz?a('areiadeserto'):a(h<.0555?'grama2':h<.111?'grama3':'grama');
 switch(t){
 case 0:case 7:return a('agua'+['','1','2'][Math.floor(performance.now()/WATER_MS+H(x,y,9)*3)%3]);
 case 1:if(dz){a('areiadeserto');if(H(x,y,33)>.94)a('cacto');return 1}return a(h<.111?'areia2':'areia');
 case 2:return gr();
 case 3:gr();return a(sn?'pinheiro':dz?'palmeira':'carvalho');
 case 4:return a('neve');
 case 10:a('neve');return a('pinheiro');
 case 5:return a('montanha');
 case 11:a('montanha');return a('minerio');
 case 6:return a('estrada');
 case 8:case 14:return(I&&t==14)?a('tabuas'):a(h<.111?'palA':'palN');
 case 9:{const b=tile(x,y+1);return a(b==9||b==17?'telhas':'tijolom')}
 case 12:return a(I?'tijolom':wk);
 case 13:a(wk);cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(X+s*.2,Y+s*.15,s*.6,s*.85);return 1;
 case 15:a('tabuas');cx.fillStyle='rgba(30,16,8,.45)';cx.fillRect(X+s*.44,Y,s*.14+1,s+1);return 1;
 case 16:if(!tw&&!I&&riverAt(x,y))a('agua'+['','1','2'][Math.floor(performance.now()/WATER_MS+H(x,y,9)*3)%3]);return a(tw&&(tw.k=='pr'||tw.k=='cr'||tw.k=='dr')?'porto':'tabuas');
 case 17:a('tijolom');return a('porta');
 case 18:a('neve');cx.fillStyle='rgba(120,180,220,.45)';cx.fillRect(X,Y,s+1,s+1);return 1;
 case 20:case 21:{a('agua'+['','1','2'][Math.floor(performance.now()/WATER_MS+H(x,y,9)*3)%3]);cx.fillStyle=t==20?'rgba(190,225,200,.30)':'rgba(5,30,80,.22)';cx.fillRect(X,Y,s+1,s+1);if(t==20&&H(x,y,61)>.7){cx.fillStyle='rgba(255,255,255,.35)';cx.fillRect(X+s*.3,Y+s*.5,s*.12,s*.08)}return 1}
 case 19:a('tabuas');return a('bau')}
 return 0}
/** Contexto passado do draw() para texSpr (latitude, direção, gênero, tipo). */
const SPX={y:0,f:0,g:'m',v:'campones'};
/** Desenha o sprite de personagem/monstro (região Norte/Campo/Dorne pela latitude). Monstros grandes usam 64x64. */
function texSpr(k,X,Y,s){let n;const g=SPX.g,rg=SPX.y<-61?'norte':SPX.y>1400?'dorne':'campo';
 if(k=='p')n={S:'stark',L:'lennister',T:'targeryan',B:'baratheon'}[P.h];else if(k=='f')n='ferreiro_'+g+'_'+rg;else if(k=='m')n='mercador_'+g+'_'+rg;else if(k=='e')n='taverneiro_'+g+'_'+rg;else if(k=='pr')n='sacerdote_'+g+'_'+rg;else if(k=='h'||k=='bt')n='viajante_'+g+'_'+rg;else if(k=='lord'||k=='gate')n=k=='gate'?'soldado_m_norte':'soldado_'+g+'_'+rg;
 else if(k=='sd')n='guarda_'+g+'_'+rg;else if(k=='cit')n=SPX.v+'_'+g+'_'+rg;else if(k=='lobo')n='lobo_'+(SPX.f?'dir':'esq');else if(k=='auroque')n='auroque_'+(SPX.f?'dir':'esq');else if(k=='lagarto_leao')n='lagarto_leao_'+(SPX.f?'dir':'esq');else if(k=='urso')n='urso_'+(SPX.f?'dir':'esq');else if(k=='band')n='renegado_'+rg;else if(k=='renegado')n='renegado_'+rg;else if(k=='criminoso')n='criminoso_'+rg;else if(k=='montanhes')n='montanhes_'+rg;else if(k=='selvagem')n='selvagem_norte';else if(k=='wight')n='zumbi_1_campones_'+rg;else if(k=='wight_soldado')n='zumbi_3_soldado_'+rg;else if(k=='wight_nobre')n='zumbi_4_nobre_'+rg;else if(k=='walker')n='caminhante_branco_norte';else if(k=='lobog')n='lobo_gigante_'+(SPX.f?'dir':'esq');else if(k=='urso_gigante')n='urso_gigante_'+(SPX.f?'dir':'esq');else if(k=='mamute')n='mamute_'+(SPX.f?'dir':'esq');else if(k=='gigante')n='gigante';else if(k=='gzumbi')n='gigante_zumbi_norte';
 const i=n&&TX[n];if(!i||!i.naturalWidth)return 0;cx.imageSmoothingEnabled=false;const bg=MT[k]&&MT[k].big;cx.drawImage(i,bg?X-s/2:X,bg?Y-s:Y,bg?s*2:s,bg?s*2:s);return 1}
/** Desenha um tile: tenta texDraw() e, se faltar textura, usa o desenho antigo em cores. */
function tileDraw(x,y,X,Y,s){const t=tile(x,y),sn=y<-61;if(texDraw(t,x,y,X,Y,s))return;cx.fillStyle=(t==3||t==10)?(sn?COL[4]:COL[2]):COL[t];cx.fillRect(X,Y,s+1,s+1);cx.fillStyle='rgba(0,0,0,'+H(x,y,7)*.09+')';cx.fillRect(X,Y,s+1,s+1);
 const u=s/16,r=(a,b,w,h,c)=>{cx.fillStyle=c;cx.fillRect(X+a*u,Y+b*u,w*u,h*u)};
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
/** Renderiza o quadro: tiles, entidades ordenadas por Y, textos, efeitos, escuridão da noite, neve e banner da cidade. */
function draw(dt){const w=cv.width,h=cv.height,s=sc(),si=Math.ceil(s),ox=w/2-s/2-P.dx*s,oy=h/2-s/2-P.dy*s;
 const x0=Math.floor(P.dx-w/2/s)-1,x1=Math.ceil(P.dx+w/2/s)+1,y0=Math.floor(P.dy-h/2/s)-1,y1=Math.ceil(P.dy+h/2/s)+1;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tileDraw(x,y,Math.floor(x*s+ox),Math.floor(y*s+oy),si);
 const es=[...NP.filter(n=>n.x>=x0&&n.x<=x1&&n.y>=y0&&n.y<=y1).map(n=>({k:n.k,dx:n.x,dy:n.y,n:n.n,g:n.g})),...mons.map(m=>({k:m.t,dx:m.dx,dy:m.dy,m})),...CZ.filter(c=>!c.in).map(c=>({k:c.k,dx:c.dx,dy:c.dy,c:c.col,g:c.g,v:c.v,n:c.pn||(c.k=='sd'?'Guarda':null)})),...RN.map(r=>({k:'cit',dx:r.dx,dy:r.dy,g:r.g,v:r.v,c:'#6a8a5a',n:r.n})),...(P.mounted?[{k:'horse',dx:P.dx-.02,dy:P.dy-.20,s:si*1.08}]:[]),{k:'p',dx:P.dx+.02,dy:P.dy-.20,c:HC[P.h],p:1,mounted:P.mounted}].sort((a,b)=>a.dy-b.dy);
 cx.textAlign='center';cx.font='600 11px system-ui,sans-serif';
 for(const e of es){const X=Math.floor(e.dx*s+ox),Y=Math.floor(e.dy*s+oy);SPX.y=e.dy;SPX.f=P.dx>e.dx;SPX.g=e.g||(H(Math.round(e.dx),Math.round(e.dy),41)>.5?'f':'m');SPX.v=e.v;spr(e.k,X,Y,e.s||si,e.c);
  if(e.n){cx.fillStyle='#000a';cx.fillText(e.n,X+s/2+1,Y-3);cx.fillStyle='#ffe9a8';cx.fillText(e.n,X+s/2,Y-4)}
  if(e.m){const d=MT[e.m.t],Yb=Y-(d.big?s:0);cx.fillStyle='#000a';cx.fillRect(X+s*.1,Yb-6,s*.8,5);cx.fillStyle=e.m.ht>0?'#fff':'#d9463c';cx.fillRect(X+s*.1+1,Yb-5,(s*.8-2)*Math.max(0,e.m.hp/d.hp),3);cx.fillStyle='#fff';cx.fillText(d.n,X+s/2,Yb-9)}}
 if(P.x<19000)for(let i=Math.floor(x0/RCELL);i<=Math.floor(x1/RCELL);i++)for(let j=Math.floor(y0/RCELL);j<=Math.floor(y1/RCELL);j++){const r=ruralCell(i,j);if(!r)continue;const lx=Math.floor(r.x*s+ox)+s/2,ly=Math.floor((r.y-1)*s+oy)-4;cx.fillStyle='#000a';cx.fillText(RT[r.t].n,lx+1,ly+1);cx.fillStyle='#d8f0c0';cx.fillText(RT[r.t].n,lx,ly)}
 for(const f of fxs){cx.globalAlpha=Math.min(1,f.l*1.5);cx.fillStyle=f.c;cx.font='800 15px system-ui,sans-serif';cx.fillText(f.t,(f.x-P.dx)*s+w/2,(f.y-P.dy)*s+h/2-s*.4-(1-f.l)*30)}cx.globalAlpha=1;
 const dk=.5-.5*Math.cos(G.t/150*6.283);cx.fillStyle='rgba(8,12,40,'+(.5*dk*dk)+')';cx.fillRect(0,0,w,h);
 if(P.dy<-58){cx.fillStyle='#fffc';for(let i=0;i<70;i++){const x=((H(i,1)*w+G.t*14*((i%3)-1))%w+w)%w,y=((H(i,2)*h+G.t*(40+H(i,3)*40))%h+h)%h;cx.fillRect(x,y,2,2)}}
 if(G.bn>0){cx.globalAlpha=Math.min(1,G.bn);cx.font='800 30px Cinzel,Georgia,serif';cx.fillStyle='#000a';cx.fillText(G.bt,w/2+2,102);cx.fillStyle='#e2b04a';cx.fillText(G.bt,w/2,100);cx.globalAlpha=1}}
/** Contexto do minimapa e cores MMC por id de tile. */
const mmc=$('mmc').getContext('2d'),MMC=['#2a5f8f','#d9c78a','#5f9146','#3f7a36','#e8eef2','#7b7f86','#a48a5e','#c9d6e3','#b9b3a4','#8a5a3c','#2e5a3a','#e2b04a','#8b8f98','#5d6068','#a39e92','#7a5a36','#8a6a3c','#6a4a32','#cfe6f2','#8a6a3c'];
MMC[20]='#6fb7c9';MMC[21]='#2f7fb0';
/** Atualiza painel do personagem, barras e o minimapa. */
let inventorySignature='';
function renderInventory(){
 const items=Object.entries(P.inv).filter(([,count])=>count>0),signature=items.map(([name,count])=>`${name}:${count}`).join('|');
 $('inv-weight').textContent=`${wt().toFixed(1)} kg / ${P.mw} kg`;
 if(signature===inventorySignature)return;
 inventorySignature=signature;
 const slotCount=Math.max(12,Math.ceil(items.length/4)*4);
 $('inventory-grid').innerHTML=Array.from({length:slotCount},(_,index)=>{const item=items[index];return item?`<div class="inventory-slot">${item[0]=='pot'?'Poção de cura':item[0]}<span class="item-count">${item[1]}</span></div>`:'<div class="inventory-slot" aria-hidden="true"></div>'}).join('');
}
function updateGameClock(){const totalMinutes=480+Math.floor((P.playTime||0)*9.6),dayIndex=Math.floor(totalMinutes/1440),minuteOfDay=totalMinutes%1440,hour=String(Math.floor(minuteOfDay/60)).padStart(2,'0'),minute=String(minuteOfDay%60).padStart(2,'0'),day=String(dayIndex%365+1).padStart(3,'0'),year=String(Math.floor(dayIndex/365)+1).padStart(2,'0');$('game-time').textContent=`${hour}:${minute}`;$('game-date').textContent=`DIA ${day} · ANO ${year}`}
function hud(){updateGameClock();$('nm').textContent=P.name;$('def').textContent=defV();$('atk').textContent=Math.round(atkV());$('weapon').textContent=W[P.w].n;$('outfit').textContent=[A[P.a].n,P.s?SH[P.s].n:null,P.hd?HE[P.hd].n:null].filter(Boolean).join(' · ');$('potions').textContent=P.inv.pot||0;$('level').textContent=`NÍVEL ${P.lvl}`;$('coins').textContent=`${P.gold} OURO`;$('hp-label').textContent='HP';$('hp-label').title=`${Math.ceil(P.hp)} / ${mh()}`;$('xp-label').textContent='XP';$('xp-label').title=`${P.xp} / ${nx()}`;$('hb').style.width=100*P.hp/mh()+'%';$('xb').style.width=100*P.xp/nx()+'%';renderInventory();
 for(let j=0;j<61;j++)for(let i=0;i<61;i++){mmc.fillStyle=MMC[tile(P.x-30+i,P.y-30+j)];mmc.fillRect(i,j,1,1)}
 mmc.fillStyle='#ffd24a';for(const t of TW){const i=t.x-P.x+30,j=t.y-P.y+30;if(i>=0&&i<61&&j>=0&&j<61)mmc.fillRect(i-1,j-1,3,3)}
 mmc.fillStyle='#f55';for(const m of mons){const i=m.x-P.x+30,j=m.y-P.y+30;if(i>=0&&i<61&&j>=0&&j<61)mmc.fillRect(i,j,1,1)}mmc.fillStyle='#fff';mmc.fillRect(29,29,3,3)}
/* mapa mundi */
/* O mapa usa a MESMA escala lógica das posições do mundo jogável.
   Assim, cidades, rios, estradas e o marcador do jogador nunca ficam desalinhados. */
/** Parâmetros do mapa-múndi (limites e escala). */
const WM_SCALE=10;const WX0=-125,WX1=115,WY0=-120,WY1=200,wmc=$('wmc');
/** Tamanho lógico do mapa-múndi e funções wx/wy de conversão. */
const WMW=700,WMH=900;wmc.width=WMW*2;wmc.height=WMH*2;const wmctx=wmc.getContext('2d');
const wx=x=>(x-WX0)/(WX1-WX0)*(WMW-1),wy=y=>(y-WY0)/(WY1-WY0)*(WMH-1),wmX=x=>x/WM_SCALE,wmY=y=>y/WM_SCALE;
const lerp=(a,b,t)=>a+(b-a)*t;
const WMP=[[-120,2,12],[-65,0,45],[-35,2,58],[0,5,62],[50,4,112],[90,2,100],[120,3,82],[150,10,68],[175,25,64],[195,40,58]];
/** Contorno de Westeros no mapa-múndi (largura/centro por latitude). */
function wmProfile(y){for(let i=0;i<WMP.length-1;i++){const a=WMP[i],b=WMP[i+1];if(y>=a[0]&&y<=b[0]){const t=(y-a[0])/(b[0]-a[0]);return[lerp(a[1],b[1],t),lerp(a[2],b[2],t)]}}return y<WMP[0][0]?[WMP[0][1],WMP[0][2]]:[WMP.at(-1)[1],WMP.at(-1)[2]]}
/** Diz se um ponto do mapa-múndi é terra. */
function wmLand(x,y){const[c,w]=wmProfile(y),n=VN(x/7,y/11,71),q=(x-c)/(w*(.96+n*.08));let land=q*q<1;const islands=[[70,65,9,8],[-120,60,9,7],[38,70,7,10],[16,105,7,8],[48,42,5,6],[-25,90,6,5],[41,112,7,6],[35,-110,8,6]];for(const[ix,iy,rx,ry]of islands)if(((x-ix)/rx)**2+((y-iy)/ry)**2<1)land=true;return land}
/** Cor do bioma de um ponto do mapa-múndi. */
function wmBiome(x,y){
 if(!wmLand(x,y))return '#17364e';
 const n=VN(x/4,y/6,31),n2=VN(x/2.4,y/3.2,32);
 if(y<-60)return n>.46?'#e8f0f2':'#c9dce2';
 if(y>92)return n>.62?'#d7b06b':'#c39459';
 if(y>58)return n2>.57?'#72964e':'#638749';
 if(y>-2&&y<28)return n2>.56?'#5b7e4c':'#6f8d55';
 return n2>.59?'#4b7449':'#628652';
}
/** Desenha uma linha de pontos (rios, muralha). */
function wmPath(points,dash=false){wmctx.beginPath();points.forEach((p,i)=>i?wmctx.lineTo(wx(p[0]),wy(p[1])):wmctx.moveTo(wx(p[0]),wy(p[1])));wmctx.stroke();wmctx.setLineDash(dash?[5,4]:[])}
/** Desenha uma curva de estrada no mapa-múndi. */
function wmRoad(a,b,c){wmctx.beginPath();wmctx.moveTo(wx(wmX(a[0])),wy(wmY(a[1])));wmctx.quadraticCurveTo(wx(wmX(c[0])),wy(wmY(c[1])));wmctx.lineTo(wx(wmX(b[0])),wy(wmY(b[1])));wmctx.stroke()}
/** Escreve um rótulo (região/cidade) no mapa-múndi. */
function wmLabel(t,x,y,size=10){wmctx.font=`700 ${size}px Georgia,serif`;wmctx.textAlign='center';wmctx.fillStyle='#241d16';wmctx.fillText(t,wx(x)+1,wy(y)+1);wmctx.fillStyle='#f5ead2';wmctx.fillText(t,wx(x),wy(y));wmctx.textAlign='left'}
/** Desenha um símbolo de montanha no mapa-múndi. */
function wmMountain(x,y,s=2.2){const X=wx(x),Y=wy(y),S=s*WMW/(WX1-WX0);wmctx.fillStyle='#655f59';wmctx.beginPath();wmctx.moveTo(X-S,Y+S);wmctx.lineTo(X,Y-S);wmctx.lineTo(X+S,Y+S);wmctx.closePath();wmctx.fill();wmctx.fillStyle='#ddd8d0';wmctx.beginPath();wmctx.moveTo(X,Y-S);wmctx.lineTo(X-S*.32,Y-.1*S);wmctx.lineTo(X+.3*S,Y-.1*S);wmctx.closePath();wmctx.fill()}
/** Desenha um símbolo de floresta no mapa-múndi. */
function wmTree(x,y,s=.7){const X=wx(x),Y=wy(y),S=s*WMW/(WX1-WX0);wmctx.fillStyle='#315a3d';wmctx.beginPath();wmctx.moveTo(X,Y-S*2);wmctx.lineTo(X-S,Y+S);wmctx.lineTo(X+S,Y+S);wmctx.closePath();wmctx.fill()}
/** Redesenha o mapa-múndi inteiro (terra, estradas, nomes, cidades, marcador VOCÊ). */
function worldmap(){
 wmctx.setTransform(2,0,0,2,0,0);wmctx.clearRect(0,0,WMW,WMH);wmctx.fillStyle='#142b40';wmctx.fillRect(0,0,WMW,WMH);
 /* grandes manchas de terreno — sem ruído de tile */
 for(let y=WY0;y<=WY1;y+=1)for(let x=WX0;x<=WX1;x+=1){if(!wmLand(x+.5,y+.5))continue;wmctx.fillStyle=wmBiome(x+.5,y+.5);wmctx.fillRect(wx(x),wy(y),Math.ceil(WMW/(WX1-WX0))+1,Math.ceil(WMH/(WY1-WY0))+1)}
 /* baías principais */
 wmctx.globalAlpha=.55;wmctx.fillStyle='#234b66';
 for(const b of [[28,45,10,14],[38,80,8,15],[-29,45,8,11],[-40,10,9,12]]){wmctx.beginPath();wmctx.ellipse(wx(b[0]),wy(b[1]),b[2]*WMW/(WX1-WX0),b[3]*WMH/(WY1-WY0),0,0,7);wmctx.fill()}
 wmctx.globalAlpha=1;
 /* rios principais, desenhados na mesma escala das cidades */
 wmctx.strokeStyle='#83c4d2';wmctx.lineWidth=2.5;
 RV.forEach(r=>wmPath(r.p.map(q=>[q[0]/10,q[1]/10])));
 /* estradas principais entre as localidades */
 wmctx.strokeStyle='#c9a15f';wmctx.lineWidth=1.7;
 const roads=[
  [[1,-24],[1,12],[0,27]],
  [[0,27],[20,42],[31,76]],
  [[0,27],[27,29],[43,24]],
  [[1,12],[-3,17],[2,27]],
  [[2,-24],[24,-3],[28,-25]],
  [[-3,17],[-32,55],[-44,43]],
  [[-32,55],[-29,61],[-25,83],[-5,64]],
  [[-5,64],[-20,72],[16,105]],
  [[31,76],[38,69],[41,112]],
  [[41,112],[38,105],[16,105]],
  [[36,38],[20,42],[31,30]],
  [[-47,37],[-32,55]],
  [[18,-82],[1,-53],[2,-24]]
 ];
 for(const[p,q]of RL){const a=TW[p],b=TW[q];wmctx.beginPath();wmctx.moveTo(wx(a.x/10),wy(a.y/10));wmctx.lineTo(wx(b.x/10),wy(a.y/10));wmctx.lineTo(wx(b.x/10),wy(b.y/10));wmctx.stroke()}
 /* cadeias de montanhas */
 for(let i=0;i<8;i++)wmMountain(33+i*1.6,20+i*4.2,2.2);
 for(let i=0;i<8;i++)wmMountain(-46+i*2.1,45+i*2.2,2.1);
 for(let i=0;i<9;i++)wmMountain(20+i*2.2,72+i*2.7,2.1);
 for(let i=0;i<9;i++)wmMountain(-1+i*2.0,87+i*2.1,2.0);
 /* florestas e vegetação decorativa */
 for(let i=0;i<75;i++){const y=-50+H(i,2,77)*150,x=-45+H(i,5,78)*85;if(wmLand(x,y)&&y<92&&y>-5)wmTree(x,y,.65+H(i,9,79)*.45)}
 /* Muralha */
 wmctx.strokeStyle='#e0e4e5';wmctx.lineWidth=4;wmPath([[-47,-53],[48,-53]]);
 RV.forEach(r=>{const m=r.p[r.p.length>>1];wmLabel(r.n,m[0]/10+4,m[1]/10-2,7)});wmLabel('A MURALHA',0,-68,10);const rg={};TW.forEach(t=>(rg[t.r]=rg[t.r]||[]).push(t));for(const k in rg){const l=rg[k];wmLabel(k.toUpperCase(),l.reduce((a,t)=>a+t.x,0)/l.length/10,l.reduce((a,t)=>a+t.y,0)/l.length/10-4,9)}
 /* localidades */
 wmctx.textBaseline='middle';for(const t of TW){const x=wx(wmX(t.x)),y=wy(wmY(t.y)),city=t.t==='city';wmctx.fillStyle=city?'#ffd24a':'#f0c36a';wmctx.strokeStyle='#21180d';wmctx.lineWidth=1.5;wmctx.beginPath();wmctx.arc(x,y,city?4.5:3,0,7);wmctx.fill();wmctx.stroke();wmctx.font=`${city?'700 9':'600 7'}px Georgia,serif`;wmctx.fillStyle='#211a13';wmctx.fillText(t.n,x+7,y+2);wmctx.fillStyle='#fff0cf';wmctx.fillText(t.n,x+6,y+1)}
 /* marcador do jogador: círculo vermelho + halo + cruz + etiqueta */
 if(P){const x=wx(wmX(P.x)),y=wy(wmY(P.y));const pulse=5+Math.sin(G.t*5)*2;wmctx.beginPath();wmctx.arc(x,y,pulse+5,0,7);wmctx.fillStyle='rgba(255,70,60,.22)';wmctx.fill();wmctx.beginPath();wmctx.arc(x,y,pulse,0,7);wmctx.fillStyle='#e53935';wmctx.fill();wmctx.strokeStyle='#fff';wmctx.lineWidth=2;wmctx.stroke();wmctx.beginPath();wmctx.arc(x,y,3,0,7);wmctx.fillStyle='#fff';wmctx.fill();wmctx.fillStyle='#fff';wmctx.strokeStyle='#17120e';wmctx.lineWidth=3;wmctx.font='700 10px Arial';wmctx.strokeText('VOCÊ',x+9,y-9);wmctx.fillText('VOCÊ',x+9,y-9)}
}
let wmz={s:1,x:0,y:0},wmt=0;const wmOpen=()=>$('wmap').style.display==='flex',wmClose=()=>$('wmap').style.display='none';
/** Aplica translação/zoom (CSS transform) ao canvas do mapa-múndi. */
function wmApply(){wmc.style.transform=`translate(${wmz.x}px,${wmz.y}px) scale(${wmz.s})`}
/** Dá zoom no mapa-múndi em torno de um ponto da tela. */
function wmZoom(f,x0=innerWidth/2,y0=innerHeight/2){const n=Math.min(8,Math.max(.3,wmz.s*f));f=n/wmz.s;wmz.x=x0-(x0-wmz.x)*f;wmz.y=y0-(y0-wmz.y)*f;wmz.s=n;wmApply()}
/** Abre o mapa-múndi em tela cheia, ajustado à tela. */
function wmOpenMap(){if(!P)return;K.clear();$('wmap').style.display='flex';const k=Math.min(innerWidth/WMW,innerHeight/WMH);wmz={s:k,x:(innerWidth-WMW*k)/2,y:(innerHeight-WMH*k)/2};wmc.style.width=WMW+'px';wmc.style.height=WMH+'px';wmApply();worldmap()}
$('mm').onclick=wmOpenMap;$('wz1').onclick=()=>wmZoom(1.4);$('wz2').onclick=()=>wmZoom(1/1.4);$('wx').onclick=wmClose;
$('wmap').addEventListener('wheel',e=>{e.preventDefault();wmZoom(e.deltaY<0?1.2:1/1.2,e.clientX,e.clientY)},{passive:false});
const wmp=new Map();
$('wmap').addEventListener('pointerdown',e=>{if(e.target.tagName!='BUTTON')wmp.set(e.pointerId,[e.clientX,e.clientY])});
$('wmap').addEventListener('pointermove',e=>{const o=wmp.get(e.pointerId);if(!o)return;const n=[e.clientX,e.clientY];if(wmp.size==2){const q=[...wmp.entries()].find(([k])=>k!=e.pointerId)[1],d0=Math.hypot(o[0]-q[0],o[1]-q[1]),d1=Math.hypot(n[0]-q[0],n[1]-q[1]);if(d0>0)wmZoom(d1/d0,(n[0]+q[0])/2,(n[1]+q[1])/2)}else{wmz.x+=n[0]-o[0];wmz.y+=n[1]-o[1];wmApply()}wmp.set(e.pointerId,n)});
const wmUp=e=>wmp.delete(e.pointerId);$('wmap').addEventListener('pointerup',wmUp);$('wmap').addEventListener('pointercancel',wmUp);
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT')return;if(wmOpen()){if(k=='escape'||k=='m')wmClose()}else if(k=='m'&&P&&!S&&!e.repeat)wmOpenMap()});
/** Ajusta o canvas ao tamanho da janela. */
function rs(){cv.width=innerWidth;cv.height=innerHeight;cx.imageSmoothingEnabled=false}addEventListener('resize',rs);rs();
let last=performance.now(),ht=0;
/** Laço principal (requestAnimationFrame): upd, draw, HUD e redesenho periódico do mapa. */
function loop(n){const dt=Math.min(.05,(n-last)/1e3);last=n;if(P){if(!S&&!wmOpen())upd(dt);if(P){draw(dt);ht-=dt;if(ht<=0){ht=.25;hud()}if(wmOpen()){wmt-=dt;if(wmt<=0){wmt=.8;try{worldmap()}catch(err){console.error(err)}}}}}else{cx.fillStyle='#0b0e14';cx.fillRect(0,0,cv.width,cv.height)}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
