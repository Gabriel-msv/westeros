# CSS — Interface visual

Esta pasta contém o CSS responsável pela apresentação da interface HTML do jogo.

## Arquivo

### `style.css`

É a folha de estilos principal. Ela controla os elementos que ficam por cima do Canvas e também os componentes de interface usados no desktop e no celular.

## Principais áreas estilizadas

### HUD

Controla o painel de status do personagem, incluindo nome, ataque, defesa, arma, vestimenta, poções, nível, ouro, HP e XP.

Elementos relacionados incluem IDs como:

- `#hud`
- `#nm`
- `#def`
- `#atk`
- `#weapon`
- `#outfit`
- `#potions`
- `#hb`
- `#xb`

Os valores são preenchidos pelo JavaScript; o CSS apenas determina como aparecem.

### Inventário

Controla:

- `#inventory-panel`
- `#inventory-body`
- `#inventory-grid`
- cabeçalho e botão de recolher/expandir.

A lógica de itens fica no JavaScript. Não coloque regras de inventário neste arquivo.

### Terminal e horário

O bloco `#terminal` apresenta o horário do jogo, a data e o histórico de mensagens.

### Painel de missões

`#mission-panel` e classes relacionadas definem a aparência das missões ativas criadas pelo sistema de reino.

### Mapa-múndi

Os estilos de `#wmap`, `#wmc`, `#wmb` e `#wmh` controlam o mapa-múndi, seus botões e a mensagem de ajuda.

O zoom do mapa-múndi é calculado no JavaScript. O CSS apenas define sua posição, tamanho e apresentação.

### Login

`#lgn` e seus elementos internos formam a tela inicial de login/criação de conta.

### Controles móveis

A seção de controles móveis inclui:

- `#mobile-ui`
- `#mobile-dock`
- `#mobile-buttons`
- `.mobile-stick`
- `.nub`
- `#mobile-aim-line`
- `#mobile-hint`

O CSS define aparência, posição, tamanho, transparência e comportamento visual. A lógica dos toques fica em `js/mobile.js`.

## Responsividade

O projeto adapta a interface para telas menores e também possui uma preferência de dispositivo salva pelo JavaScript.

Não confunda:

- **responsividade CSS:** aparência e disposição dos elementos;
- **detecção/controle móvel:** lógica em `mobile.js`.

## Regras para alterações

- Não remova um ID usado pelo JavaScript sem procurar suas referências.
- Evite colocar lógica de jogo no CSS.
- Ao mudar o tamanho dos controles móveis, teste o jogo em uma tela de toque.
- Preserve `touch-action` nos elementos que recebem gestos diretamente.
- Ao mexer no Canvas, lembre que o jogo é desenhado pelo JavaScript; o CSS não controla a posição dos tiles dentro do Canvas.
