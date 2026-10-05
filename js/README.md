# JavaScript — Sistemas do jogo

Esta pasta contém toda a lógica executável do RPG.

## Ordem de carregamento

O `index.html` carrega os scripts nesta ordem:

```text
assets.js
→ game.js
→ reino-frases.js
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
- cidades e regiões;
- estradas e terrenos;
- interiores;
- tiles;
- NPCs e cidadãos básicos;
- monstros;
- personagem;
- movimentação;
- combate;
- coleta e interação;
- equipamentos;
- lojas;
- inventário;
- experiência e nível;
- vida;
- save/load;
- atualização do mundo;
- renderização Canvas;
- HUD;
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

### Câmera principal

A câmera usa uma variável de altura em tiles.

Valores atuais:

```text
mínimo: 5 tiles
máximo: 30 tiles
inicial: 15 tiles
```

Menor valor = mais zoom.

Maior valor = mais área do mapa visível.

No desktop, a roda do mouse altera esse valor.

No toque, dois ponteiros são usados para medir a distância da pinça. Aumentar a distância aproxima; diminuir a distância afasta.

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
- brincar;
- reclamar;
- rumores, quando desbloqueados.

As escolhas do jogador ficam em `CHAT_CHOICES`.

As respostas são obtidas de `window.REINO_FRASES` quando disponível.

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

O projeto possui 10 escolhas do jogador para cada interação principal.

As frases são combinadas por abertura e corpo para produzir as variações usadas pelo sistema de diálogo.

Quando uma escolha específica é enviada para `chatPhrase()`, o índice da escolha é usado para selecionar sua família de resposta, enquanto a abertura fornece as variações.

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
- `Q` — poção;
- `C` — cavalo;
- `R` — reino;
- `I` — inventário.

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
