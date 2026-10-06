/* ============================================================================
 * js/reino.js — NPCs com nome/personalidade, interações (amizade), missões, itens de drop,
 * dominação de cidades (lord + exército), reinos, cavalos e barcos. Carrega DEPOIS de game.js.
 * Só acrescenta: reaproveita S, P, NP, CZ, RN, shop, talk, kill, start, SK do game.js.
 * ========================================================================== */
(function(){
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.random()*a.length|0],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hs2=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const reg=y=>y<-61?'norte':y>1400?'dorne':'campo',cd={};
const FM=['Aldric','Bran','Corwin','Doran','Edric','Garrick','Haldon','Jory','Kellan','Lothar','Marek','Osric','Piers','Rowan','Tomard','Wylis'],FF=['Alysa','Brienne','Cersa','Dalla','Elinor','Fenna','Gwyn','Hanna','Isolde','Jeyne','Lyra','Mirel','Nysa','Ora','Rhea','Sansa'];
const SUR={norte:['Stone','Cerwyn','Flint','Hornwood','Ryder','Locke'],campo:['Fairbrook','Mills','Tanner','Hollis','Marsh','Cooper'],dorne:['Sand','Dalt','Fowler','Vaith','Qorgyle','Blackmont']};
/* ---- personalidades: 0 amigável, 1 rabugento, 2 medroso, 3 ganancioso, 4 devoto ---- */
const PN=['amigável','rabugento','medroso','ganancioso','devoto'];
const PH=[
[['Bom dia, viajante! Não costumo vê-lo por aqui.','Que os Sete o guardem, forasteiro.','Olá! Precisa de alguma coisa?'],['Ora, se não é você de novo! Como vai?','Sempre bom ver um rosto conhecido.','Tem passado bem? Por aqui está tudo calmo.'],['Meu amigo! Entre, o que é meu é seu.','Você é bem-vindo em qualquer lar daqui.','Dei boas risadas pensando em você ontem!']],
[['Hunf. O que você quer?','Não tenho tempo para forasteiros.','Se vai atrapalhar, siga em frente.'],['Ah, você. Pelo menos não fala demais.','Ainda por aqui? Tudo bem, fale logo.','Você até que não é tão ruim.'],['Não conte a ninguém, mas gosto de você.','Para você faço uma exceção, mas só uma.','Sente-se. Reclamo menos com amigos.']],
[['Ah! Não me machuque, por favor...','Os tempos andam perigosos, forasteiro.','Fale baixo, as paredes têm ouvidos.'],['Ainda bem que é você e não um saqueador.','Fico mais calmo quando você está por perto.','Ouvi barulhos na estrada esta noite...'],['Perto de você me sinto seguro, de verdade.','Se algo acontecer, conto com você, amigo.','Você é a pessoa mais corajosa que conheço.']],
[['Tempo é dinheiro. Vai comprar algo?','Tudo tem preço, forasteiro.','Fale rápido, moedas não esperam.'],['Bons negócios com você, sim, sim.','Tenho uma oferta para clientes de confiança.','Sempre há lugar para um bom pagador.'],['Para você, só preço de amigo!','Dividimos o lucro se me der uma boa dica.','Entre nós, sempre há um desconto.']],
[['Que os Sete abençoem seu caminho.','A fé guia os passos do viajante.','Reze, e a estrada fica mais leve.'],['A luz dos Sete o acompanha, de novo.','Você cumpre bem seus deveres, filho.','Rezei pelos viajantes, inclusive você.'],['Você é família na fé, meu amigo.','Sempre há lugar à mesa para você.','Os deuses sorriram quando você chegou.']]];
const RE={piada:['Ha ha ha! Boa essa!','Que piada sem graça...','Hihi... espero que ninguém tenha ouvido.','Ha! Essa vale uma moeda.','Cuidado com o que diz, até com piadas.'],
elo:['Você é gentil demais, obrigado!','Elogios não pagam as contas.','Oh... obrigado, não esperava.','Gostei do tom, continue assim.','Que os Sete lhe devolvam essa bondade.'],
pre:['Que lindo! Muito obrigado!','Hum. Está bom, aceito.','Para mim? Nossa, obrigado!','Isso vale uma boa moeda, aceito!','Receberei com gratidão.'],
prov:['Ora, que grosseria!','Suma daqui antes que eu chame os guardas!','Socorro! Deixe-me em paz!','Vou lembrar disso, forasteiro...','Que os deuses perdoem sua língua.']};
const person=(key,g,r)=>{const f=i=>hs2(key+':'+i);return{key,g,p:f(3)%5,n:(g=='f'?FF:FM)[f(1)%16]+' '+SUR[r][f(2)%6]}};
const tier=f=>f>=50?2:f>=15?1:0,fr=k=>P.fr[k]||0,addF=(k,d)=>{P.fr[k]=clamp(fr(k)+d,-100,100)};
/* ---- dominação ---- */
const DOM=TW.filter(t=>t.t!='ruin'&&t.t!='wall'),TR=t=>t.t=='town'?1:t.t=='fort'?2:3;
const KG={'O Norte':'Reino do Norte','Vale de Arryn':'Reino do Vale','Ilhas de Ferro':'Reino das Ilhas','Terras do Oeste':'Reino do Rochedo','A Campina':'Reino da Campina','Terras da Tempestade':'Reino da Tempestade','Dorne':'Reino de Dorne'};
const KN=[...new Set(Object.values(KG))],kof=t=>KG[t.r]||'Terras do Trono';
const sup=ti=>{let s=0;for(const k in P.fr)if(k.startsWith(ti+'.')||(k.startsWith('r')&&k.endsWith('.'+ti)))s+=Math.max(0,P.fr[k]);return Math.min(100,Math.round(s/6+Math.max(0,P.rp[ti]||0)/2))};
const AU={s:['Soldado',40,6],a:['Arqueiro',70,8],k:['Cavaleiro',160,14]};
const UP=u=>u.s*6+u.a*8+u.k*14,gu=ti=>P.gar[ti]||(P.gar[ti]={s:0,a:0,k:0}),gN=g=>g.s+g.a+g.k,MING=5,allU=()=>[P.army,...Object.values(P.gar)];
const armyN=()=>allU().reduce((a,u)=>a+gN(u),0),cap=()=>20+15*Object.keys(P.dom).length,armyPw=()=>allU().reduce((a,u)=>a+UP(u),0);
const myPw=()=>Math.round(atkV()*8+defV()*10+P.lvl*15+armyPw());
const lord=ti=>{const t=TW[ti],h=hs2('lord'+ti),g=h%2?'f':'m';return{g,army:t.n.includes('Porto Real')?100:TR(t)==1?10+h%11:TR(t)==2?25+h%21:50+h%26,pw:Math.round(300*TR(t)*(.9+(h%30)/100)),n:(g=='f'?'Lady ':'Lord ')+(g=='f'?FF:FM)[h%16]+' de '+t.n.split(' / ')[0]}};
const lordPw=ti=>Math.round(lord(ti).pw*(1-sup(ti)/200)),need=ti=>50+TR(TW[ti])*5;
/* ---- posicionamento dos NPCs novos (lord, estribeiro, barqueiro) ---- */
const LD=[],occ=(x,y)=>NP.some(n=>n.x==x&&n.y==y)||LD.some(n=>n&&n.x==x&&n.y==y)||SOL.has(tile(x,y))||tile(x,y)==17;
function spot(t,list){for(const[a,b]of list)if(!occ(t.x+a,t.y+b))return[t.x+a,t.y+b];for(let r=1;r<8;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(!occ(t.x+a,t.y+b))return[t.x+a,t.y+b];return null}
const ROLE={f:'Ferreiro',m:'Mercador',e:'Estalajadeiro',pr:'Sacerdote',h:'Estribeiro',bt:'Barqueiro'};
const PORTS=TW.filter(t=>['Porto Real','Pedra do Dragão','Porto Branco','Gulltown','Pyke','Lannisporto','Vilavelha','Ponta da Tempestade','Lance do Sol','Seagard'].some(p=>t.n.includes(p)));
function mkNP(t,k,list,extra){const p=spot(t,list);if(!p)return null;const key=t.i+'.v'+k,g=hs2(key)%2?'f':'m',pe=person(key,g,reg(t.y));return Object.assign({n:pe.n+' ('+ROLE[k]+')',k,ti:t.i,x:p[0],y:p[1],dx:p[0],dy:p[1],g,key,pe},extra)}
NP.forEach(n=>{if(n.tmp||!ROLE[n.k])return;n.key=n.ti+'.v'+n.k;n.g=hs2(n.key)%2?'f':'m';n.pe=person(n.key,n.g,reg(TW[n.ti].y));n.n=n.pe.n+' ('+ROLE[n.k]+')'});
DOM.forEach(t=>{const h=mkNP(t,'h',[[-2,2],[-3,1],[-2,3]]);if(h)NP.push(h);if(PORTS.includes(t)){const b=mkNP(t,'bt',[[2,2],[3,1],[2,3]]);if(b)NP.push(b)}
 const L=lord(t.i),p=spot(t,[[0,4],[0,3],[3,0],[-3,0],[-3,3],[3,3]]);if(p)LD[t.i]={n:L.n,k:'lord',ti:t.i,x:p[0],y:p[1],dx:p[0],dy:p[1],g:L.g,lord:1}});
function syncLords(){for(let i=NP.length-1;i>=0;i--)if(NP[i].lord)NP.splice(i,1);DOM.forEach(t=>{if(!P.dom[t.i]&&LD[t.i])NP.push(LD[t.i])})}
/* ---- ganchos no game.js ---- */
SK.push('fr','qs','dom','army','tax','gar','mar');
const _start=start;start=function(u,s){_start(u,s);P.fr=P.fr||{};P.qs=P.qs||[];P.dom=P.dom||{};P.army=P.army||{s:0,a:0,k:0};P.tax=P.tax||0;P.gar=P.gar||{};P.mar=P.mar||[];syncLords();marchTick()};
const _kill=kill;kill=function(m){const k=m.t;_kill(m);(P.qs||[]).forEach(q=>{if(q.t=='h'&&q.m==k&&q.got<q.n){q.got++;msg('Missão: '+q.got+'/'+q.n+' '+MT[k].n,'#e2b04a')}})};
const _talk=talk;talk=function(){if(_talk())return 1;const near=o=>Math.max(Math.abs(o.x-P.x),Math.abs(o.y-P.y))<=1,c=CZ.find(c=>!c.in&&near(c))||RN.find(near);if(!c)return 0;const e=ident(c);S={k:'soc',ti:c.ti!==undefined?c.ti:nearestTown().t.i,key:c.key,pe:e,n:e.n};shop();return 1};
function ident(c){if(!c.key){if(typeof c.id=='string'){const ti=c.ti!==undefined?c.ti:nearestTown().t.i;c.ti=ti;c.key='r'+c.id+'.'+ti}else{const u=new Set(CZ.filter(z=>z.ti==c.ti&&z.sl!==undefined).map(z=>z.sl));let j=0;while(u.has(j))j++;c.sl=j;c.key=c.ti+'.c'+j}}
 if(!c.pe)c.pe=person(c.key,c.g||'m',reg(c.y));if(!c.pn)c.pn=c.k=='sd'?'Guarda '+c.pe.n.split(' ')[0]:c.pe.n;return c.pe}
setInterval(()=>{if(P)CZ.forEach(c=>{if(!c.pe)ident(c)})},700);
setInterval(()=>{if(P)for(const k in P.dom)P.tax=(P.tax||0)+TR(TW[k])*2},10000);
const KINDS=['soc','reino','lord','h','bt','war'];
const _shop=shop;shop=function(){if(S&&KINDS.includes(S.k))return render();_shop();if(!S)return;let x='';
 if(S.k=='inv'){const u=Object.keys(USE).filter(k=>P.inv[k]);x=u.length?'<h3 style="margin-top:8px">Usar itens</h3>'+u.map(k=>row(`${k} — ${USE[k]}`,`RK.use('${k}')`,'Usar')).join(''):''}
 else if(S.pe&&S.key)x=row('Conversar com '+S.pe.n.split(' ')[0],'RK.openSoc()','Interagir');
 if(x){const m=$('md'),h=m.innerHTML,i=h.lastIndexOf('<div style="text-align');m.innerHTML=h.slice(0,i)+x+h.slice(i)}};
addEventListener('keydown',e=>{if(e.key.toLowerCase()!='r'||e.repeat||!P||S||e.target.tagName=='INPUT'||(typeof wmOpen=='function'&&wmOpen()))return;S={k:'reino',n:'Reino e Exército'};shop()});
const bR=$('btn-reino');if(bR)bR.onclick=()=>{if(!P||S||(typeof wmOpen=='function'&&wmOpen()))return;S={k:'reino',n:'Reino e Exército'};shop()};
/* ---- itens de drop com função ---- */
const USE={Carne:'+25 vida',Peixe:'+15 vida','Coração Gelado':'+50 vida','Pele de Lobo':'+25% durabilidade da armadura','Pele de Urso':'+40% durabilidade da armadura','Presa de Mamute':'+40% durabilidade da arma','Osso de Gigante':'+50% durabilidade da arma','Adaga Enferrujada':'+10% durabilidade da arma','Vidro de Dragão':'arma como nova','Escama de Dragão':'restaura todo o equipamento','Osso Amaldiçoado':'+120 XP'};
const lvl=()=>{while(P.xp>=nx()){P.xp-=nx();P.lvl++;P.hp=mh();msg('Você alcançou o nível '+P.lvl+'!','#ffd24a')}};
const RK=window.RK={
 use(k){if(!P.inv[k])return;if(['Carne','Peixe','Coração Gelado'].includes(k)&&P.hp>=mh())return msg('Sua vida já está cheia.','#9aa3b2');const heal=n=>{P.hp=Math.min(mh(),P.hp+n);fx(P.x,P.y,'+'+n,'#7f7')},du=(s,n)=>{if(!P[s])return 0;P.du[s]=Math.min(100,P.du[s]+n);return 1};let ok=1;
  if(k=='Carne')heal(25);else if(k=='Peixe')heal(15);else if(k=='Coração Gelado')heal(50);
  else if(k=='Pele de Lobo')ok=du('a',25);else if(k=='Pele de Urso')ok=du('a',40);else if(k=='Presa de Mamute')ok=du('w',40);else if(k=='Osso de Gigante')ok=du('w',50);else if(k=='Adaga Enferrujada')ok=du('w',10);else if(k=='Vidro de Dragão')ok=du('w',100);
  else if(k=='Escama de Dragão'){ok=0;SL.forEach(s=>{if(P[s]){P.du[s]=100;ok=1}})}else if(k=='Osso Amaldiçoado'){P.xp+=120;lvl()}
  if(!ok)return msg('Você não tem esse equipamento equipado.','#9aa3b2');P.inv[k]--;msg('Usou '+k+': '+USE[k]+'.','#8fd0f0');save();shop()},
 openSoc(){const v=S;S={k:'soc',ti:v.ti,key:v.key,pe:v.pe,n:v.pe.n,back:v};render()},
 back(){S=S.back;shop()},
 back2(){S={k:'reino',n:'Reino e Exército'};render()},
 act(a){const e=S,pe=e.pe,f=fr(e.key),ck=e.key+a,content=window.REINO_CONTEUDO?.actions?.[a],send={conv:'Oi, como você está?',elo:'Você parece uma pessoa muito boa.',piada:'Posso contar uma piada?',rum:'Tem ouvido algo interessante por aí?',prov:'Você não é muito agradável.'};if(cd[ck]&&G.t-cd[ck]<15){chatPush(e,'me',send[a]);chatPush(e,'them',pe.n.split(' ')[0]+' ainda quer falar de outra coisa. Espere um pouco.');render();return msg(pe.n.split(' ')[0]+' ainda quer falar de outra coisa. Espere um pouco.','#9aa3b2')}if(a=='rum'&&f<10)return msg('Ainda não confia em você para falar disso.','#9aa3b2');if(content?.approaches?.length){e.choosing=a;render();return}RK.finishAction(a,0)},
 finishAction(a,i){const e=S,pe=e,ck=e.key+a,content=window.REINO_CONTEUDO?.actions?.[a],send=content?.approaches?.[i]||{conv:'Oi, como você está?',elo:'Você parece uma pessoa muito boa.',piada:'Posso contar uma piada?',rum:'Tem ouvido algo interessante por aí?',prov:'Você não é muito agradável.'}[a];if(a=='rum'&&fr(e.key)<10)return msg('Ainda não confia em você para falar disso.','#9aa3b2');let d=0,l='',data={_approach:i};if(a=='conv'){d=friendshipDelta(pe.p,a,3);l=chatPhrase(e,a,data)}else if(a=='elo'){d=friendshipDelta(pe.p,a,2);l=chatPhrase(e,a,data)}else if(a=='piada'){d=friendshipDelta(pe.p,a,1);l=chatPhrase(e,a,data)}else if(a=='prov'){d=friendshipDelta(pe.p,a,-12);l=chatPhrase(e,a,data)}else if(a=='rum'){const L=lord(e.ti);d=friendshipDelta(pe.p,a,1);l=chatPhrase(e,a,{lord:L.n,army:L.army,city:TW[e.ti].n,_approach:i})}e.choosing=null;cd[ck]=G.t;addF(e.key,d);e.line=l;chatPush(e,'me',send);chatPush(e,'them',l);msg(`${pe.n} (${d>=0?'+':''}${d} amizade)`,d>=0?'#9f9':'#ff8a80');render()},
 gift(k){if(!P.inv[k])return;P.inv[k]--;const e=S,d=friendshipDelta(e.pe.p,'gift',3);addF(e.key,d);e.line=chatPhrase(e,'gift',{item:k});chatPush(e,'me','Enviei um presente: '+k+'.');chatPush(e,'them',e.line);msg(`Você deu ${k} a ${e.pe.n} (+${d} amizade).`,'#9f9');render()},
 ask(){const e=S,r=reg(TW[e.ti].y);let q;if(Math.random()<.5){const i=pick(['Madeira','Peixe','Trigo','Carne','Pele de Lobo','Minério de Ferro']),n=R(3,8);q=Math.random()<.65?{t:'f',i,n,rg:Math.round(LT[i]*n*1.5)+10}:{t:'f',i,n,ri:'pot',rq:R(2,4)}}
  else{const m=pick(r=='norte'?['lobo','wight','urso']:['lobo','band']),n=R(3,6),d=MT[m];q={t:'h',m,n,got:0,rg:Math.round(d.xp*n*.9+d.g[1]*n*.5)}}
  q.key=e.key;q.who=e.pe.n;q.ti=e.ti;P.qs.push(q);chatPush(e,'me','Você tem alguma missão para mim?');chatPush(e,'them',chatPhrase(e,'mission',{task:dq(q)}));msg(e.pe.n+': '+dq(q),'#e2b04a');render()},
 turn(){const e=S,q=P.qs.find(q=>q.key==e.key);if(!q)return;if(q.t=='f'){if((P.inv[q.i]||0)<q.n)return msg('Faltam itens.','#ff8a80');P.inv[q.i]-=q.n}else if(q.got<q.n)return msg('Missão incompleta.','#ff8a80');
  if(q.ri)P.inv[q.ri]=(P.inv[q.ri]||0)+q.rq;else P.gold+=q.rg;P.qs.splice(P.qs.indexOf(q),1);addF(e.key,10);chatPush(e,'me','Concluí a missão.');chatPush(e,'them',chatPhrase(e,'mission_done'));msg('Missão cumprida! Recompensa recebida.','#9f9');save();render()},
 buyHorse(){const c=pc(600);if(P.horse)return;if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');P.gold-=c;P.horse=true;msg('Você comprou um cavalo! Monte com C.','#e2b04a');save();render()},
 sail(i,c){if(P.gold<c)return msg('Ouro insuficiente.','#ff8a80');const t=TW[i];P.gold-=c;P.x=t.x;P.y=t.y+2;P.dx=P.x;P.dy=P.y;P.mounted=false;mons.length=0;CZ.length=0;closeShop();msg('Você navegou até '+t.n+'.','#8fd0f0')},
 rec(k){const t=inTown(P.x,P.y);if(!t||!P.dom[t.i])return msg('Só é possível recrutar numa cidade que você domina.','#9aa3b2');if(armyN()>=cap())return msg('Limite do exército atingido. Domine mais cidades.','#ff8a80');if(P.gold<AU[k][1])return msg('Ouro insuficiente.','#ff8a80');P.gold-=AU[k][1];P.army[k]=(P.army[k]||0)+1;msg(`Recrutou 1× ${AU[k][0]} para a sua comitiva.`,'#e2b04a');save();render()},
 war(){S={k:'war',n:'Mesa de Guerra',st:'tgt',send:{}};render()},
 wtgt(ti){S.to=ti;S.st='src';S.send={};render()},
 wst(st){S.st=st;render()},
 wsel(id,k,d){const g=id=='p'?P.army:gu(id),mn=id=='p'?0:MING,u=S.send[id]||(S.send[id]={s:0,a:0,k:0}),tot=gN(u);let v=clamp(u[k]+d,0,g[k]);v=Math.min(v,u[k]+Math.max(0,gN(g)-mn-tot));u[k]=v;render()},
 wall(){wsrc().forEach(o=>{const u={s:0,a:0,k:0};let left=Math.max(0,gN(o.g)-o.min);for(const k of ['k','a','s']){u[k]=Math.min(o.g[k],left);left-=u[k]}S.send[o.id]=u});render()},
 wgo(){const e=S,tot=sendTot(e.send);if(!gN(tot))return msg('Selecione tropas.','#ff8a80');const c=gN(tot)*3;if(P.gold<c)return msg('Ouro insuficiente para suprimentos ('+c+'g).','#ff8a80');if(P.dom[e.to]||P.mar.some(m=>m.to==e.to))return msg('Alvo inválido.','#ff8a80');
  P.gold-=c;for(const id in e.send){const g=id=='p'?P.army:gu(id);for(const k in AU)g[k]-=e.send[id][k]}const sec=tt(e.to,e.send),now=Date.now();P.mar.push({to:e.to,u:tot,t0:now,t1:now+sec*1000});msg('Seu exército partiu rumo a '+TW[e.to].n+' ('+gN(tot)+' homens, '+sec+'s).','#e2b04a');save();S={k:'reino',n:'Reino e Exército'};render()},
 tax(){const g=Math.floor(P.tax);P.gold+=g;P.tax-=g;msg('Você coletou '+g+'g em impostos.','#e2b04a');save();render()},
 surr(ti){if(sup(ti)<need(ti))return msg('O povo ainda não o apoia o bastante (precisa de '+need(ti)+'%).','#ff8a80');take(ti,1)},
 fight(ti){const L=lordPw(ti),M=myPw(),lose=f=>{allU().forEach(u=>{for(const k in AU)u[k]=Math.floor(u[k]*(1-f))})};
  if(Math.random()<M/(M+L)){lose(.15);take(ti,0)}else{lose(.5);P.gold=Math.floor(P.gold*.75);P.hp=Math.ceil(mh()*.3);msg('Derrota! Seu exército foi dizimado e você perdeu 25% do ouro.','#ff8a80');closeShop()}}};
function take(ti,peace,sv){const t=TW[ti],tr=TR(t);P.dom[ti]=1;syncLords();const g=gu(ti);if(sv){for(const k in AU)g[k]+=sv[k]||0}else{g.s+=3*tr;g.a+=tr}if(gN(g)<MING)g.s+=MING-gN(g);P.xp+=150*tr;P.gold+=100*tr;lvl();msg(peace?`${lord(ti).n} se rendeu! ${t.n} é sua.`:`Vitória! ${t.n} caiu em suas mãos.`,'#ffd24a');
 const kn=kof(t),l=DOM.filter(x=>kof(x)==kn);if(l.every(x=>P.dom[x.i]))msg(kn+' conquistado!','#ffd24a');if(DOM.every(x=>P.dom[x.i]))msg('Westeros é sua! Você dominou todas as '+DOM.length+' cidades.','#ffd24a');if(!sv)closeShop();else save()}
const sendTot=sd=>{const t={s:0,a:0,k:0};for(const id in sd)for(const k in AU)t[k]+=sd[id][k];return t},clk=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+'m'+String(s%60).padStart(2,'0')+'s'};
const wsrc=()=>{const l=[];if(gN(P.army))l.push({id:'p',n:'Comitiva (com você)',g:P.army,min:0,x:P.x,y:P.y});for(const i in P.dom){const g=gu(i);if(gN(g)>MING)l.push({id:i,n:TW[i].n.split(' / ')[0],g,min:MING,x:TW[i].x,y:TW[i].y})}return l};
const tt=(to,sd)=>{const T=TW[to];let d=0;for(const id in sd)if(gN(sd[id])){const o=id=='p'?P:TW[id];d=Math.max(d,Math.hypot(o.x-T.x,o.y-T.y))}const t=sendTot(sd),sp=t.s+t.a?3:6;return clamp(Math.round(d/sp),20,240)};
const Ew=ti=>lordPw(ti)+lord(ti).army*6;
function marchTick(){if(!P||!P.mar)return;const now=Date.now();for(let i=P.mar.length-1;i>=0;i--){const m=P.mar[i];if(now<m.t1)continue;P.mar.splice(i,1);const t=TW[m.to],M=UP(m.u),E=Ew(m.to),L=lord(m.to);
 if(P.dom[m.to]){for(const k in AU)gu(m.to)[k]+=m.u[k];continue}
 if(Math.random()<M/(M+E)){const f=.55+Math.random()*.3,sv={};for(const k in AU)sv[k]=Math.floor(m.u[k]*f);msg('Seu exército tomou '+t.n+'! '+L.n+' caiu.','#ffd24a');take(m.to,0,sv)}
 else{msg('Seu exército foi derrotado diante de '+t.n+'. Todos os homens foram perdidos.','#ff8a80');save()}}}
setInterval(marchTick,1000);
const dq=q=>(q.t=='f'?`Traga ${q.n}× ${q.i}`:`Derrote ${q.n}× ${MT[q.m].n}`)+' — recompensa: '+(q.ri?q.rq+'× Poção':q.rg+'g'),LV=['desconhecido','conhecido','amigo'];
const chatEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chatPush(e,from,text){e.chat=e.chat||[];e.chat.push({from,text,at:Date.now()});if(e.chat.length>40)e.chat.shift()}
function chatPhrase(e,action,data={}){const content=window.REINO_CONTEUDO?.actions?.[action],options=window.REINO_FRASES?.[e.pe.p]?.phrases?.[action];let text;if(content?.replies?.[e.pe.p]?.length){const pool=content.replies[e.pe.p],start=Number.isInteger(data._approach)?data._approach*10:0,part=pool.slice(start,start+10);text=pick(part.length?part:pool)}else if(options&&options.length){e.lastPhrase=e.lastPhrase||{};let i=R(0,options.length-1);if(options.length>1&&i==e.lastPhrase[action])i=(i+R(1,options.length-1))%options.length;e.lastPhrase[action]=i;text=options[i]}else{const fallback={greet:()=>pick(PH[e.pe.p][tier(fr(e.key))]),conv:()=>pick(PH[e.pe.p][tier(fr(e.key))]),elo:()=>RE.elo[e.pe.p],piada:()=>RE.piada[e.pe.p],prov:()=>RE.prov[e.pe.p],gift:()=>RE.pre[e.pe.p]};text=fallback[action]?.()||''}return text.replace(/\{(\w+)\}/g,(match,key)=>data[key]??match)}
function friendshipDelta(personality,action,fallback){const range=window.REINO_FRASES?.[personality]?.friendship?.[action];return range?R(range[0],range[1]):fallback}
function render(){const e=S;let h='';$('md').classList.toggle('chat-mode',e.k=='soc');
 if(e.k=='soc'){const f=fr(e.key),pe=e.pe;if(!e.chat)chatPush(e,'them',chatPhrase(e,'greet'));
  const quick=[['conv','Conversar'],['elo','Elogiar'],['piada','Piada'],['prov','Provocar']];if(f>=10)quick.splice(3,0,['rum','Rumor']);const approaches=e.choosing&&window.REINO_CONTEUDO?.actions?.[e.choosing]?.approaches;
  h=`<div class="chat-view"><header class="chat-header">${e.back?'<button type="button" class="chat-back" onclick="RK.back()" aria-label="Voltar à loja">‹</button>':''}<div class="chat-avatar">${chatEsc(pe.n.slice(0,1))}</div><div class="chat-contact"><strong>${chatEsc(pe.n)}</strong><span>${chatEsc(PN[pe.p])} · ${chatEsc(TW[e.ti].n)} · Amizade ${f}/100</span></div><button type="button" class="chat-close" onclick="closeShop()" aria-label="Fechar conversa">×</button></header><div class="chat-feed" id="chat-feed" aria-live="polite">${e.chat.map(m=>`<div class="chat-bubble ${m.from=='me'?'chat-sent':'chat-received'}">${chatEsc(m.text)}<small>agora</small></div>`).join('')}</div><div class="chat-prompt">${approaches?'Escolha uma das 15 formas de dizer isso:':'Escolha uma interação para continuar.'}</div><div class="chat-quick-replies">${approaches?approaches.map((label,i)=>`<button type="button" onclick="RK.finishAction('${e.choosing}',${i})">${chatEsc(label)}</button>`).join('')+`<button type="button" class="chat-task" onclick="S.choosing=null;render()">Voltar às interações</button>`:quick.map(([a,label])=>`<button type="button" onclick="RK.act('${a}')">${chatEsc(label)}</button>`).join('')}`;
  Object.keys(P.inv).filter(k=>LT[k]&&P.inv[k]>0).slice(0,3).forEach(k=>h+=`<button type="button" onclick="RK.gift('${k}')">Presentear: ${chatEsc(k)}</button>`);
  const q=P.qs.find(q=>q.key==e.key);if(q){const ok=q.t=='f'?(P.inv[q.i]||0)>=q.n:q.got>=q.n;h+=`<button type="button" class="chat-task" onclick="RK.turn()"${ok?'':' disabled'}>${chatEsc(dq(q))}${q.t=='h'?' ('+q.got+'/'+q.n+')':''} · Entregar</button>`}
  else if(f>=10&&P.qs.length<3)h+='<button type="button" class="chat-task" onclick="RK.ask()">Pedir uma missão</button>';
  if(e.back)h+='<button type="button" class="chat-task" onclick="RK.back()">Voltar à loja</button>';
  h+='</div></div>'}
 else if(e.k=='lord'){const L=lord(e.ti),s=sup(e.ti),M=myPw(),Lp=lordPw(e.ti);h=`<h3>${L.n}</h3><div class=m>Exército: ${L.army} soldados · Poder do lord: ${Lp} · Seu poder: ${M} · Chance de vitória: ${Math.round(100*M/(M+Lp))}%</div><div class=m>Apoio do povo: ${s}% (rendição exige ${need(e.ti)}%). Cada amizade na cidade enfraquece o lord.</div>`+row('Exigir rendição (com apoio do povo)',`RK.surr(${e.ti})`,'Exigir',s<need(e.ti))+row('Desafiar para a batalha (risco de derrota)',`RK.fight(${e.ti})`,'Batalhar')}
 else if(e.k=='h')h=`<h3>${e.n}</h3><div class=m>Ouro: ${P.gold}g</div>`+row('Cavalo de viagem (mais rápido, sobe na estrada) — '+pc(600)+'g','RK.buyHorse()',P.horse?'Você já tem':'Comprar',!!P.horse)+'<div class=m>Monte e desmonte com C. O cavalo não entra na água.</div>'+row('Conversar com '+e.pe.n.split(' ')[0],'RK.openSoc()','Interagir');
 else if(e.k=='bt'){h=`<h3>${e.n}</h3><div class=m>Ouro: ${P.gold}g · Destinos (preço por distância)</div>`;PORTS.filter(t=>t.i!=e.ti).forEach(t=>{const c=Math.round(Math.hypot(t.x-TW[e.ti].x,t.y-TW[e.ti].y)/4)+25;h+=row(`${t.n} — ${c}g`,`RK.sail(${t.i},${c})`,'Embarcar',P.gold<c)});h+=row('Conversar com '+e.pe.n.split(' ')[0],'RK.openSoc()','Interagir')}
 else if(e.k=='war'){const sd=e.send,tot=sendTot(sd);
  if(e.st=='tgt'){h='<h3>Mesa de Guerra — escolha o alvo</h3><div class=m>Cidades ainda não dominadas, da mais próxima à mais distante de você.</div>';DOM.filter(t=>!P.dom[t.i]&&!P.mar.some(m=>m.to==t.i)).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).forEach(t=>{const L=lord(t.i);h+=row(`${t.n.split(' / ')[0]} <span class=m>(${kof(t).replace('Reino d','d')}) · guarnição ${L.army} · apoio ${sup(t.i)}%</span>`,`RK.wtgt(${t.i})`,'Atacar')});h+=row('Voltar','RK.back2()','Voltar')}
  else if(e.st=='src'){const l=wsrc();h=`<h3>Atacar ${TW[e.to].n.split(' / ')[0]}</h3><div class=m>Guarnição inimiga: ${lord(e.to).army} · Escolha quantos homens enviar (cada cidade mantém ${MING} de guarda).</div>`;if(!l.length)h+='<div class=m>Você não tem tropas disponíveis. Recrute em cidades dominadas (R).</div>';
   l.forEach(o=>{const u=sd[o.id]||{s:0,a:0,k:0};h+=`<div class=m style="margin-top:6px;color:#efc76a">${o.n}</div>`;for(const k in AU)if(o.g[k])h+=`<div class=r><span>${AU[k][0]}s ${u[k]}/${o.g[k]}</span><span><button onclick="RK.wsel('${o.id}','${k}',-5)">−5</button> <button onclick="RK.wsel('${o.id}','${k}',-1)">−</button> <button onclick="RK.wsel('${o.id}','${k}',1)">+</button> <button onclick="RK.wsel('${o.id}','${k}',5)">+5</button></span></div>`});
   h+=`<div class=m style="margin-top:6px">Total: ${gN(tot)} homens · poder ${UP(tot)}</div>`+(l.length?row('Enviar o máximo disponível','RK.wall()','Todos'):'')+row('Revisar ataque','RK.wst(\'rev\')','Revisar',!gN(tot))+row('Trocar alvo','RK.war()','Voltar')}
  else{const M=UP(tot),E=Ew(e.to),sec=tt(e.to,sd),L=lord(e.to);h=`<h3>Revisão do ataque</h3><div class=m>Alvo: ${TW[e.to].n.split(' / ')[0]} — ${L.n}</div><div class=m>Enviados: ${tot.s} soldados, ${tot.a} arqueiros, ${tot.k} cavaleiros (poder ${M})</div><div class=m>Defesa: ${L.army} guardas + lord (poder ${E}) · apoio do povo ${sup(e.to)}%</div><div class=m>Marcha: ${clk(sec*1000)} · Suprimentos: ${gN(tot)*3}g (você tem ${P.gold}g)</div><div class=m>Chance de vitória: ${Math.round(100*M/(M+E))}%. Se perder, todos os homens enviados morrem.</div>`+row('Ordenar a marcha','RK.wgo()','Partir',P.gold<gN(tot)*3)+row('Ajustar tropas','RK.wst(\'src\')','Voltar')}}
 else{const n=Object.keys(P.dom).length;h=`<h3>Reino e Exército</h3><div class=m>Cidades dominadas: ${n}/${DOM.length} · Seu poder: ${M0()}</div>${n==DOM.length?'<div style="color:#ffd24a">Westeros é sua!</div>':'<div class=m>Faça amizades nas cidades (E nos cidadãos) e enfrente o lord de cada uma.</div>'}<h3 style="margin-top:8px">Reinos</h3>`;
  KN.concat(['Terras do Trono']).forEach(k=>{const l=DOM.filter(t=>kof(t)==k),d=l.filter(t=>P.dom[t.i]).length;h+=`<div class=r><span>${k}</span><span class=m>${d}/${l.length}${l.length&&d==l.length?' ✔':''}</span></div>`});
  h+=`<h3 style="margin-top:8px">Exército (${armyN()}/${cap()})</h3>`;for(const k in AU)h+=row(`${AU[k][0]}s: ${P.army[k]} — ${AU[k][1]}g`,`RK.rec('${k}')`,'Recrutar');
  h+=row('Planejar ataque a uma cidade','RK.war()','Mesa de Guerra');if(P.mar.length)h+='<h3 style="margin-top:8px">Exércitos em marcha</h3>'+P.mar.map(m=>`<div class=r><span>${TW[m.to].n.split(' / ')[0]}: ${gN(m.u)} homens</span><span class=m>chega em ${clk(m.t1-Date.now())}</span></div>`).join('');
  h+=`<h3 style="margin-top:8px">Guarnições</h3>`+(Object.keys(P.dom).map(i=>`<div class=r><span>${TW[i].n.split(' / ')[0]}</span><span class=m>${gN(gu(i))} (S${gu(i).s} A${gu(i).a} C${gu(i).k})</span></div>`).join('')||'<div class=m>Nenhuma cidade dominada.</div>')+(gN(P.army)?`<div class=r><span>Comitiva</span><span class=m>${gN(P.army)}</span></div>`:'');
  h+=row('Impostos acumulados: '+Math.floor(P.tax)+'g','RK.tax()','Coletar',P.tax<1);
  if(P.qs.length)h+='<h3 style="margin-top:8px">Missões</h3>'+P.qs.map(q=>`<div class=r><span>${q.who}: ${dq(q)}${q.t=='h'?' ('+q.got+'/'+q.n+')':''}</span></div>`).join('')}
 $('md').innerHTML=h+(e.k=='soc'?'':'<div style="text-align:right;margin-top:8px"><button onclick="closeShop()">Fechar</button></div>');$('md').style.display='block';if(e.k=='soc')requestAnimationFrame(()=>{const feed=$('chat-feed');if(feed)feed.scrollTop=feed.scrollHeight})}
const M0=()=>myPw();RK.mt=marchTick;
})();
