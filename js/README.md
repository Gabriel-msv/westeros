# JavaScript — Sistemas do jogo

Esta pasta contém toda a lógica executável do RPG.

## Ordem de carregamento

O `index.html` carrega os scripts nesta ordem:

```text
assets.js
→ game.js
→ reino-frases.js
→ reino-conteudo.js
→ reino.js
→ mobile.js
```

A ordem é importante. Evite trocar a posição dos scripts sem verificar as dependências.

---

## `assets.js`

Responsável pelo catálogo e carregamento das imagens usadas pelo jogo.

### Responsabilidades

- definir o caminho dos assets;
- registrar imagens em `TX`;
- organizar nomes de texturas;
- carregar sprites de personagens, monstros, terrenos, objetos e menus;
- fornecer constantes usadas pelo renderizador.

### Principais estruturas

- `ASSET_MANIFEST` — mapa entre nome lógico e caminho do arquivo;
- `TX` — imagens carregadas para uso no Canvas;
- `asset()` — registra um asset;
- `TXload()` — cria e carrega uma imagem.

### Ao alterar assets

Se o nome lógico mudar, procure todas as chamadas desse nome em `game.js` antes de concluir a alteração.

---

## `game.js`

É o **núcleo principal do jogo**.

### Responsabilidades

- geração do mundo;
- filtro visual regional com tons frios azulados no Norte e tons quentes no sul, graduados pela latitude;
- cidades e regiões, com dez formatos determinísticos de casas aplicados a todas as localidades; os bairros têm áreas ampliadas, as casas evitam estradas e estruturas, cada porta recebe um caminho contínuo até a rua e NPCs fixos/moradores recém-gerados não ocupam essas rotas;
- estradas e terrenos;
- árvores em posições pseudoaleatórias dentro de setores de 3 × 3 tiles, com copas que podem se sobrepor, troncos sem adjacência, terreno válido e menor densidade perto de cidades; o clima de campo também recebe arbustos decorativos, e Dorne gera palmeiras e cactos de dois tamanhos com colisão danosa;
- interiores;
- pontos de spawn de cidade são validados para evitar telhados e portas; ao sair
  de uma casa, o jogador retorna a um tile caminhável fora da porta. Saves antigos
  com posição inválida são corrigidos ao carregar;
- tiles;
- NPCs e cidadãos básicos;
- monstros;
- drops de árvores e inimigos espalhados no chão, com salto ao cair e atração ao jogador próximo;
- personagem;
- movimentação, nado em todos os corpos d'água e navegação em barco;
- combate;
- coleta e interação;
- equipamentos;
- lojas;
- ferramentas em três níveis: compra inicial no mercador, melhorias no ferreiro e eficiência progressiva;
- inventário, incluindo arraste para equipar, retirar equipamento e descartar itens;
- experiência e nível;
- vida;
- save/load;
- atualização do mundo;
- renderização Canvas;
- HUD;
- inventário com ícones dos itens em `assets/westeros/itens`;
- minimapa;
- mapa-múndi;
- câmera principal.

### Estado principal

`P` representa o estado do jogador.

`G` guarda estado global do jogo.

Outras estruturas importantes incluem listas de monstros, NPCs, cidadãos, cidades e efeitos.

### Renderização

A função `draw()` calcula a área visível e desenha os tiles e entidades no Canvas.

O tamanho do tile visível é determinado pela câmera e pela altura virtual da tela.

O terreno é composto em canvases temporários de 8 × 8 tiles, limitados a 24 blocos
em memória. Blocos sem água são reutilizados até a câmera/zoom ou o terreno mudar;
blocos com água são atualizados quando a animação troca de quadro. Minerar,
derrubar árvores e carregar outro save invalidam o cache para manter o mapa correto.
As três texturas de água ficam estáveis por um segundo e fazem uma transição suave
de um segundo entre quadros.

### Câmera principal

A câmera normal mantém a altura fixa em 10 tiles. A roda do mouse e a pinça de
toque só alteram o zoom na sessão especial `sudo`.

Valores atuais:

```text
normal: 10 tiles fixos
sudo: zoom ajustável entre 5 e 30 tiles
```

Menor valor = mais zoom. Maior valor = mais área do mapa visível.

No desktop, a roda do mouse altera esse valor somente em `sudo`.

No toque, a pinça altera esse valor somente em `sudo`. Na câmera normal, o
personagem sempre é exibido com 10 tiles de altura. Ao caminhar em água rasa, o personagem é desenhado parcialmente submerso.

Em interiores, a câmera ignora o zoom configurado e enquadra a sala inteira de 7 × 5 tiles. A roda e a pinça não alteram o zoom até o personagem sair da casa.

### Mapa-múndi

O mapa-múndi possui um sistema separado (`wmz`, `wmZoom`, `wmApply` etc.). Não altere esse sistema quando a intenção for modificar somente a câmera principal.

---

## `reino.js`

É a camada de **NPCs, relações, diálogos, missões e política do reino** construída sobre o núcleo de `game.js`.

### Responsabilidades

- personalidades dos NPCs;
- nomes dos NPCs;
- amizade/reputação;
- conversas;
- escolhas do jogador;
- respostas dos NPCs;
- presentes;
- rumores;
- missões;
- recompensas;
- lordes;
- domínio de cidades;
- guarnições;
- exército;
- marchas;
- painel de missões;
- interface de reino.

### Diálogos

O sistema possui ações como:

- conversar;
- elogiar;
- contar piada;
- provocar;
- pedir rumor regional.

Cada ação sorteia uma abordagem do jogador e uma resposta da personalidade do
NPC. Rumores incluem uma dica sorteada da região atual.

As saudações e frases legadas usam `window.REINO_FRASES`; abordagens,
respostas das cinco ações e rumores regionais usam `window.REINO_CONTEUDO`.

### Limite diário

O sistema mantém contagem diária por NPC em `P.chatDaily`.

O limite atual é de **3 interações por NPC por dia real**, sendo a data comparada pelo calendário do navegador.

Se essa regra for alterada para um dia do calendário do jogo, a lógica deverá passar a usar o relógio interno do RPG em vez de `new Date()`.

### Missões

As missões são armazenadas em `P.qs`.

Elas podem envolver coleta de itens ou derrotar inimigos. O painel de missões acompanha o progresso.

---

## `reino-frases.js`

É o banco de conteúdo textual das personalidades.

### Responsabilidades

- personalidades;
- frases de abertura;
- corpos das respostas;
- frases de saudação;
- respostas por tipo de interação;
- faixas de amizade para cada personalidade.

O arquivo transforma os conjuntos de frases em `window.REINO_FRASES`, que é consumido por `reino.js`.

### Sistema de variações

O banco antigo mantém frases de saudação e variações de personalidade.

As abordagens e respostas das cinco interações principais ficam em
`reino-conteudo.js`.

## `reino-conteudo.js`

Contém 15 abordagens e 10 respostas por personalidade para cada interação
(conversar, elogiar, piada, provocar e rumor), além de 100 rumores para cada
uma das 10 regiões. `reino.js` sorteia as falas e filtra os rumores pela região
atual; o tom da personalidade acompanha a dica regional.

### Personalidades ativas

Atualmente o sistema ativo usa cinco personalidades:

1. amigável;
2. rabugento;
3. medroso;
4. ganancioso;
5. devoto.

O conteúdo textual é separado da lógica para facilitar a expansão sem reescrever o sistema de diálogo.

---

## `mobile.js`

Controla a interface de toque para celular/tablet.

### Responsabilidades

- detectar/preferir modo móvel;
- analógico de movimento;
- analógico de interação/mira;
- botões de ação rápida;
- integração com WASD e teclas do jogo;
- atualização visual dos analógicos;
- suporte a pointer events.

### Analógico esquerdo

Controla o movimento do personagem simulando as teclas direcionais esperadas pelo núcleo.

### Analógico direito

Define a direção de interação. Ao soltar, pode atacar ou executar uma interação dependendo do alvo.

### Botões rápidos

Os botões móveis acionam teclas existentes do jogo, como:

- `E` — usar/interagir;
- clique/toque em um baú visível no interior para abri-lo (alcance de até 2 tiles);
- `Q` — poção;
- `C` — cavalo;
- `B` — lançar/embarcar no barco ou desembarcar;
- `R` — reino;
- `I` — inventário.
- Digite `gold` durante o jogo para definir seu ouro para o máximo.

Barqueiros são posicionados em localidades próximas de rios ou costa e vendem o
barco. O barco ocupa uma área de colisão de 3 × 3 tiles, usa sprites nos quatro
sentidos e navega a 1,5× a velocidade normal do cavalo; o jogador se posiciona
no assento de popa correspondente à direção do barco. Sem barco, o jogador pode
nadar pelos corpos d'água.

### Importante

A câmera por pinça fica implementada no `game.js`, pois é uma propriedade da câmera do Canvas. O `mobile.js` cuida dos controles móveis de personagem e interação.

---

## `dialogs.js`

Arquivo de diálogo **legado**.

Ele contém um sistema antigo/genérico de frases de NPC, mas **não é carregado pelo `index.html` atual**.

O sistema ativo de diálogos está em:

```text
reino.js
+
reino-frases.js
```

Não confunda os dois sistemas ao fazer alterações.

---

# Dependências entre os arquivos

```text
assets.js
   ↓
game.js
   ↓
reino-frases.js
   ↓
reino.js
   ↓
mobile.js
```

Na prática, `reino.js` aproveita muitas funções e estruturas globais criadas pelo núcleo, enquanto `mobile.js` conversa com o núcleo através das entradas do jogo.

# Regra geral de manutenção

Antes de modificar uma função importante:

1. procure onde ela é chamada;
2. procure quais variáveis globais ela usa;
3. verifique se outro arquivo sobrescreve ou envolve essa função;
4. altere o mínimo necessário;
5. execute uma checagem de sintaxe;
6. teste no navegador;
7. teste novamente no celular se a alteração envolver toque, câmera ou interface.
