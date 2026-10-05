# Crônicas de Westeros

## O que é este projeto

**Crônicas de Westeros** é um RPG 2D executado diretamente no navegador, construído com **HTML, CSS e JavaScript puro**, usando **Canvas 2D** para desenhar o mundo e JavaScript para controlar as mecânicas do jogo.

O projeto reúne exploração de Westeros, cidades, NPCs, combate, inventário, equipamentos, missões, diálogo com personalidade, relações de amizade, domínio de territórios, exército, mapa-múndi, save local e controles para computador e celular.

Este README é propositalmente **geral e estável**. Ele explica o projeto inteiro. A documentação específica de cada parte fica dentro da pasta correspondente.

## Estrutura geral

```text
/
├── README.md              # Visão geral do projeto inteiro
├── index.html              # Estrutura da interface e carregamento dos scripts
├── css/
│   ├── README.md           # Documentação do sistema visual
│   └── style.css           # Estilos da interface
├── js/
│   ├── README.md           # Documentação dos sistemas JavaScript
│   ├── assets.js           # Carregamento e catálogo de imagens
│   ├── dialogs.js          # Sistema antigo/legado de diálogos
│   ├── game.js             # Núcleo principal do jogo
│   ├── mobile.js           # Controles de toque
│   ├── reino.js            # NPCs, diálogos, missões e sistema de reino
│   └── reino-frases.js     # Banco de frases e personalidades
└── assets/
    └── westeros/           # Imagens usadas pelo jogo, quando presentes no pacote
```

## Como o jogo funciona

O `index.html` cria o Canvas, HUD, inventário, terminal, menus, mapa-múndi, login e controles móveis. Depois carrega os scripts na ordem necessária.

A ordem atual é:

```html
assets.js
→ game.js
→ reino-frases.js
→ reino.js
→ mobile.js
```

Essa ordem é importante porque alguns sistemas estendem ou usam funções criadas anteriormente.

### Núcleo do jogo

`game.js` é o centro do RPG. Ele concentra a geração do mundo, cidades, terrenos, entidades, estado do jogador, movimentação, combate, coleta, lojas, equipamentos, atualização do jogo, renderização, HUD, minimapa e mapa-múndi.

### Reino e NPCs

`reino.js` adiciona a camada de vida social e política ao jogo: NPCs, personalidades, amizade, conversas, presentes, missões, domínio de cidades, lordes, guarnições e exército.

`reino-frases.js` mantém o conteúdo textual das personalidades e suas respostas.

### Celular

`mobile.js` adapta os controles para telas de toque. Há analógico de movimento, analógico de interação, ações rápidas e integração com as teclas usadas pelo jogo.

### Visual

`style.css` controla a interface HTML: HUD, inventário, terminal, menus, mapa-múndi, painel de missões e controles móveis.

## Câmera

A câmera principal usa uma altura virtual em tiles:

- **5 tiles:** maior aproximação;
- **30 tiles:** maior área visível;
- **15 tiles:** valor inicial.

No computador, a roda do mouse altera a altura da câmera. No celular, o gesto de pinça altera o mesmo valor: abrir a pinça aproxima e fechar a pinça afasta.

O mapa-múndi possui seu próprio zoom e não deve ser confundido com a câmera do mapa principal.

## Salvamento

O progresso é armazenado no `localStorage` do navegador. Isso inclui dados do personagem e sistemas persistentes do jogo.

Por isso, limpar os dados do navegador pode apagar o progresso local.

## Como executar

O projeto é um site estático, mas é recomendado executá-lo por um servidor HTTP local em vez de abrir o HTML diretamente.

Exemplo:

```bash
python3 -m http.server
```

Depois, abra no navegador o endereço indicado pelo servidor.

Também é compatível com hospedagem estática, como GitHub Pages, desde que a estrutura de arquivos e a pasta de assets sejam mantidas.

## Regras importantes para manutenção

1. **Não remova IDs do `index.html` sem procurar onde eles são usados no JavaScript.** Muitos elementos são acessados diretamente por `getElementById`.
2. **Mantenha a ordem dos scripts.** `game.js` precisa dos recursos preparados por `assets.js`, e `reino.js` depende do núcleo criado antes dele.
3. **Não altere nomes de assets sem atualizar `assets.js` e os locais que os procuram.**
4. **Ao alterar a câmera, diferencie a câmera principal do zoom do mapa-múndi.** São sistemas separados.
5. **Ao alterar controles móveis, preserve os eventos usados pelo jogo.** O `mobile.js` simula as entradas esperadas pelo núcleo.
6. **Ao alterar diálogos, verifique `reino.js` e `reino-frases.js` juntos.** Um contém a lógica; o outro contém grande parte do conteúdo textual.
7. **Teste no computador e no celular após mudanças de entrada, câmera ou interface.**
8. **Faça uma cópia/commit antes de mudanças grandes.** O projeto possui muitos sistemas interdependentes.

## Documentação por pasta

- [`css/README.md`](css/README.md) — explica toda a camada visual.
- [`js/README.md`](js/README.md) — explica cada arquivo JavaScript e suas responsabilidades.

## Estado do projeto

Este arquivo documenta a arquitetura geral. Detalhes de implementação devem ficar nos READMEs das respectivas pastas para que o README principal não precise ser alterado a cada pequena mudança de código.
