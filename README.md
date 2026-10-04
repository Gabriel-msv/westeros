# Crônicas de Westeros

RPG top-down em HTML5 Canvas puro (sem bibliotecas). Save local (localStorage).

## Como rodar
1. Descompacte o `westeros.zip` **dentro de `assets/`**, de modo que exista `assets/westeros/gramas/grama.png`, `assets/westeros/vivos/player/stark.png` etc.
2. Sirva a pasta por HTTP (GitHub Pages, ou `python3 -m http.server`) e abra `index.html`. Abrir direto por `file://` funciona para as imagens, mas alguns navegadores bloqueiam o localStorage.
3. Sem as imagens o jogo ainda roda, com os tiles antigos em cores (o console lista o que faltou).

## Estrutura
| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura: canvas, HUD, minimapa, log, painel central, mapa-múndi, login e controles de toque |
| `css/style.css` | Todo o visual, incluindo o bloco "Controles de toque" no fim |
| `js/assets.js` | Manifesto das imagens (`ASSET_MANIFEST`) e carregador `TXload`. Primeiro script |
| `js/game.js` | Toda a lógica. Cada função/constante tem um comentário `/** */` explicando |
| `js/mobile.js` | Analógicos e botões de toque |
| `assets/westeros/` | Onde entram as imagens |

Os scripts são clássicos (sem módulos) e compartilham o escopo global; a ordem em `index.html` importa: `assets.js`, `game.js`, `mobile.js`.

## Mapa do `game.js` (em ordem)
1. **Utilidades:** `H` (hash), `VN` (ruído).
2. **Mundo:** `TW` (33 localidades), `RL` (estradas), `LS`/`lay` (desenhos dos 8 lugares emblemáticos), `HSE` (casas), `room` (interior), `road`, `gen`, `tile` (cache).
3. **Dados:** `W`/`A`/`SH`/`HE`/`IT` (equipamentos), `LT` (preços de venda), `MT` (monstros), `IW` (pesos), `REG` (preço por região).
4. **Estado:** `G`, `P` (jogador), `mons`, `CZ` (cidadãos/guardas), `NP` (NPCs fixos).
5. **Contas e save:** `hs`, `auth`, `start`, `save`, `SK`.
6. **Lojas:** `shop`, `buy`, `sell`, `buyT`, `eq`, `fix`, `rest`.
7. **Combate:** `spawn`, `atk`, `kill`, `die`, `wear`, `atkV`/`defV`.
8. **Cidades vivas:** `popT`, `czUpd`, `hitC` (alerta dos guardas).
9. **Ações:** `talk`, `chop` (árvore, minério, pesca), `cheat`.
10. **Quadro:** `upd`, `draw`, `tileDraw`/`texDraw`, `spr`/`texSpr`.
11. **Interface:** `hud`, minimapa, mapa-múndi (`wm*`, `worldmap`).
12. **Laço:** `rs`, `loop`.

## IDs de tile
0 água · 1 areia · 2 grama · 3 floresta · 4 neve · 5 montanha · 6 estrada · 7 rio · 8 chão de cidade · 9 casa · 10 pinheiro nevado · 11 minério · 12 muralha · 13 torre · 14 piso · 15 portão · 16 ponte/cais · 17 porta · 18 gelo · 19 baú.
Sólidos: 0,3,5,7,9,10,11,12,13,18,19 (conjunto `SOL`).

## Texturas (regras do spec)
- Variantes estáticas escolhidas por `H(x,y,seed)` (nunca por quadro): grama 8:1 (`grama2`/`grama3`), areia 8:1, paralelepípedo 8:1.
- Água: 3 quadros, fase por tile, velocidade em `WATER_MS`.
- Latitude define a região dos sprites e árvores: `y < -61` Norte (neve, pinheiro), `y > 1400` Dorne (deserto, palmeira, cacto), resto Campo.

## Monstros
Em `MT`. Grandes têm `big:1` (sprite 64x64 desenhado em 2x2 tiles, colisão de 1 tile): Lobo Gigante, Urso Gigante, Mamute (Norte), Gigante e Gigante Zumbi (além da Muralha, `y < -660`). O Dragonete foi removido.

## Controles
Teclado: WASD mover · Espaço atacar · E usar/falar/cortar/minerar/pescar · Q poção · C cavalo · I inventário · M mapa.
Toque: analógico esquerdo move; direito mira e, ao soltar, ataca ou interage; botões E Q C I M ⚔.
Código secreto: digite `676767` rápido para ganhar os melhores itens e um cavalo.

## Como estender
- **Novo monstro:** entrada em `MT` + regra em `spawn` + sprite em `texSpr` + nome no `ASSET_MANIFEST`.
- **Nova textura:** nome em `ASSET_MANIFEST` e uso em `texDraw`.
- **Nova cidade:** objeto em `TW` (no fim, para não deslocar índices) e par em `RL`.
- **Layout próprio:** entrada em `LS` e ramo em `lay`.

## Save
Chave `got_contas_v2` (migra de `got_contas_v1`). Campos em `SK`.
