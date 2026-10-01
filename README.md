# GDD — PROJETO RPG TOP-DOWN

### Documento Mestre de Design — versão 1.0

A ideia é transformar o protótipo atual em um **RPG 2D top-down de mundo aberto**, inspirado na liberdade de exploração de MMORPGs clássicos como Tibia, mas com **mundo, regras, itens, criaturas, cidades, história e sistemas próprios**. Jogos desse estilo costumam combinar exploração, progressão, habilidades, quests, NPCs, economia, casas, guildas e eventos em um mundo persistente. ([Tibia][1])

---

# 1. VISÃO DO JOGO

## 1.1 Conceito

O jogador controla um personagem em um enorme mundo 2D visto de cima.

Não existe uma única maneira correta de jogar.

O jogador pode:

* explorar;
* coletar recursos;
* cortar árvores;
* pescar;
* cultivar;
* cozinhar;
* fabricar itens;
* negociar;
* completar quests;
* descobrir segredos;
* lutar contra criaturas;
* enfrentar chefes;
* melhorar habilidades;
* construir sua reputação;
* possuir uma casa;
* participar de guildas;
* viajar;
* descobrir regiões escondidas;
* ajudar ou prejudicar NPCs;
* participar de eventos;
* jogar sozinho ou com outros jogadores.

A filosofia principal será:

> **"Se o jogador pensar em algo razoável, provavelmente deve existir alguma maneira de fazer isso."**

---

# 2. PILARES DO JOGO

O projeto terá 6 pilares.

### 1. Exploração

O mundo deve recompensar curiosidade.

Uma parede aparentemente inútil pode esconder:

* passagem;
* caverna;
* NPC;
* tesouro;
* puzzle;
* quest;
* evento.

---

### 2. Liberdade

O jogador não precisa seguir uma linha única.

Pode passar horas simplesmente:

> cortar árvores → vender madeira → comprar uma casa → decorar → explorar uma floresta.

Ou:

> explorar → encontrar uma ruína → descobrir uma quest → entrar numa dungeon → enfrentar um boss.

---

### 3. Progressão

Tudo que o jogador faz pode desenvolver alguma habilidade.

---

### 4. Mundo vivo

NPCs, criaturas, clima, comércio e eventos devem fazer o mundo parecer independente do jogador.

---

### 5. Descoberta

Nem tudo deve aparecer no mapa.

O jogo deve possuir:

* áreas secretas;
* quests escondidas;
* NPCs secretos;
* itens secretos;
* combinações;
* eventos raros;
* enigmas;
* referências;
* easter eggs.

---

### 6. Consequência

As ações do jogador podem alterar:

* reputação;
* NPCs;
* quests;
* preços;
* acesso a regiões;
* estado de cidades;
* relações entre facções.

---

# 3. CÂMERA

## Visão

Top-down 2D.

A câmera:

* acompanha o jogador;
* possui zoom;
* suaviza movimentos;
* pode mostrar minimapa;
* pode futuramente permitir diferentes níveis de zoom.

### Zoom

Exemplo:

```text
0.75x  → visão estratégica
1.00x  → normal
1.50x  → aproximado
2.35x  → atual
3.00x  → extremamente próximo
```

O zoom máximo pode ser limitado em regiões específicas.

---

# 4. MUNDO

## 4.1 Mundo extremamente grande

O mapa será dividido em **chunks**.

```text
WORLD
│
├── Chunk
│   ├── terreno
│   ├── árvores
│   ├── pedras
│   ├── criaturas
│   ├── NPCs
│   └── objetos
│
├── Chunk
├── Chunk
└── ...
```

Isso permite criar um mundo enorme sem carregar tudo ao mesmo tempo.

---

# 5. BIOMAS

O mundo possuirá diferentes ambientes.

## Floresta

Recursos:

* madeira;
* frutas;
* plantas;
* cogumelos;
* animais;
* ervas.

Segredos:

* árvores ocas;
* cabanas abandonadas;
* trilhas;
* cavernas;
* ruínas.

---

## Planície

Recursos:

* plantas;
* flores;
* pequenos animais;
* recursos agrícolas.

---

## Montanha

Características:

* terrenos elevados;
* cavernas;
* minas;
* caminhos estreitos;
* áreas escondidas.

---

## Deserto

Características:

* ruínas;
* oásis;
* tempestades de areia;
* estruturas enterradas.

---

## Pântano

Características:

* água;
* plantas raras;
* criaturas;
* neblina;
* caminhos falsos.

---

## Neve

Características:

* gelo;
* cavernas;
* lagos congelados;
* tempestades.

---

## Costa

Características:

* praias;
* portos;
* pesca;
* ilhas;
* naufrágios.

---

## Subterrâneo

Um segundo mundo praticamente independente.

Possui:

* cavernas;
* minas;
* ruínas;
* rios subterrâneos;
* cidades abandonadas;
* regiões extremamente perigosas.

---

# 6. TERRENO

O terreno pode possuir diferentes propriedades.

```text
GRASS
ROAD
SAND
WATER
DEEP_WATER
MUD
SNOW
ICE
ROCK
LAVA
SWAMP
```

Cada tipo pode modificar:

* velocidade;
* passagem;
* pesca;
* agricultura;
* criaturas;
* temperatura;
* interação.

---

# 7. MOVIMENTO

Controles:

```text
W
A S
D
```

ou:

```text
↑
← ↓ →
```

Futuramente:

* controle mobile;
* gamepad;
* clique para andar;
* pathfinding automático.

---

# 8. AÇÕES UNIVERSAIS

O jogador poderá interagir com objetos através de:

### Aproximar

Chegar perto de algo.

### Observar

Examinar.

### Interagir

Executar a ação principal.

### Pegar

Adicionar ao inventário.

### Usar

Utilizar um item em algo.

### Usar em

```text
ITEM → OBJETO
```

Exemplo:

```text
chave → porta
```

### Falar

Interagir com NPC.

### Inspecionar

Mostrar informações.

### Empurrar

Objetos específicos.

### Puxar

Objetos específicos.

### Abrir

Baús, portas, gavetas etc.

### Fechar

Objetos interativos.

### Ativar

Alavancas, mecanismos, cristais etc.

### Quebrar

Objetos destrutíveis.

### Cortar

Árvores.

### Coletar

Recursos.

### Plantar

Agricultura.

### Colher

Recursos cultivados.

### Pescar

Pesca.

### Escavar

Locais específicos.

---

# 9. ÁRVORES

A árvore será nosso primeiro sistema de coleta.

Cada árvore possui:

```text
ID
tipo
HP
posição
estado
idade
```

Exemplo:

```text
Oak Tree
HP: 3
Recurso: Madeira de Carvalho
```

Ao atingir HP 0:

```text
Árvore
   ↓
desaparece
   ↓
dropa madeira
   ↓
entra em cooldown
   ↓
cresce novamente
```

---

# 10. RECURSOS

Categorias:

### Naturais

* madeira;
* pedra;
* areia;
* argila;
* fibras;
* folhas;
* frutas;
* flores;
* cogumelos;
* ervas.

### Minerais

* cobre;
* ferro;
* prata;
* ouro;
* cristais;
* minérios raros.

### Criaturas

* couro;
* penas;
* escamas;
* presas;
* essências;
* materiais especiais.

---

# 11. INVENTÁRIO

O inventário terá:

```text
┌──────────────────────────┐
│ INVENTÁRIO               │
├──────────────────────────┤
│ [ ] [ ] [ ] [ ] [ ]      │
│ [ ] [ ] [ ] [ ] [ ]      │
│ [ ] [ ] [ ] [ ] [ ]      │
│ [ ] [ ] [ ] [ ] [ ]      │
└──────────────────────────┘
```

Cada item terá:

```js
{
    id,
    name,
    description,
    category,
    stackable,
    quantity,
    weight,
    rarity
}
```

---

# 12. PESO

Cada item pode possuir peso.

Exemplo:

```text
Galho       0.2
Pedra       1.0
Madeira     2.0
Minério     3.0
Objeto raro 0.5
```

O jogador possui:

```text
CAPACIDADE
25 / 50 kg
```

Se exceder:

* movimentação reduzida;
* impossibilidade de pegar novos objetos;
* necessidade de armazenar/vender.

---

# 13. HOTBAR

Slots rápidos:

```text
[1] [2] [3] [4] [5] [6] [7] [8]
```

Itens podem ser atribuídos aos números.

---

# 14. EQUIPAMENTO

Slots:

```text
Cabeça
Corpo
Acessório 1
Acessório 2
Mãos
Pernas
Pés
```

Cada equipamento pode possuir:

* atributos;
* resistência;
* efeitos;
* requisitos;
* durabilidade;
* raridade.

---

# 15. DURABILIDADE

Equipamentos podem se desgastar.

```text
100%
75%
50%
25%
0%
```

Ao chegar a 0:

> "Este item precisa ser reparado."

---

# 16. CRAFTING

Sistema dividido em profissões.

## Carpintaria

Produz:

* tábuas;
* móveis;
* caixas;
* ferramentas;
* estruturas.

## Ferraria

Produz equipamentos.

## Alquimia

Produz:

* poções;
* elixires;
* antídotos;
* consumíveis.

## Cozinha

Produz alimentos.

## Costura

Produz:

* roupas;
* mochilas;
* acessórios.

---

# 17. RECEITAS

Cada receita terá:

```text
Receita
├── ingredientes
├── estação necessária
├── nível
├── tempo
└── resultado
```

Exemplo:

```text
Tábua

2 Madeira
↓
Carpintaria
↓
1 Tábua
```

---

# 18. COZINHA

Comida pode fornecer efeitos temporários.

Exemplo:

```text
Pão
+ recuperação

Ensopado
+ regeneração

Comida especial
+ bônus temporário
```

---

# 19. AGRICULTURA

O jogador poderá:

```text
preparar solo
↓
plantar
↓
regar
↓
esperar
↓
colher
```

Plantações podem crescer mesmo quando o jogador estiver fora da área.

---

# 20. PESCA

O sistema terá:

* pontos de pesca;
* diferentes peixes;
* horários;
* clima;
* regiões;
* equipamentos;
* peixes raros.

Alguns peixes só aparecem:

```text
durante chuva
à noite
em determinado lago
em determinada estação
```

---

# 21. NPCs

NPCs não serão apenas "máquinas de quest".

Cada NPC possuirá:

```text
nome
profissão
personalidade
rotina
localização
relações
memória
inventário
diálogos
quests
```

---

# 22. ROTINA DOS NPCs

Exemplo:

```text
06:00 → acorda
07:00 → abre loja
12:00 → almoça
14:00 → trabalha
18:00 → fecha loja
20:00 → vai para casa
23:00 → dorme
```

Isso cria oportunidades.

Um NPC pode dizer:

> "Não posso falar agora."

Mas às 23h pode estar em outro lugar.

---

# 23. DIÁLOGOS

Diálogo não será apenas:

```text
NPC
Olá.
[OK]
```

Haverá:

```text
NPC:
"Você está procurando alguma coisa?"

[Estou procurando trabalho.]
[Quero informações.]
[Quem é você?]
[Nada.]
```

As respostas podem alterar:

* quests;
* reputação;
* relações;
* preços;
* informações disponíveis.

---

# 24. MEMÓRIA DOS NPCs

NPCs poderão lembrar:

```text
"Você me ajudou."

"Você mentiu para mim."

"Você comprou isso ontem."

"Você ainda não devolveu meu objeto."
```

---

# 25. REPUTAÇÃO

Cada cidade/facção pode possuir reputação:

```text
Hostil
Desconfiado
Neutro
Conhecido
Aliado
Honrado
```

Isso pode alterar:

* diálogos;
* preços;
* acesso;
* quests;
* recompensas.

---

# 26. ECONOMIA

Moeda principal:

```text
Gold
```

O jogador pode:

* vender;
* comprar;
* negociar;
* guardar;
* trocar.

---

# 27. LOJAS

Tipos:

* mercado;
* ferreiro;
* alquimista;
* carpinteiro;
* taverna;
* alfaiate;
* pescador;
* comerciante geral.

Cada loja possui estoque.

---

# 28. ECONOMIA DINÂMICA

O preço pode mudar conforme:

```text
oferta
demanda
eventos
região
reputação
escassez
```

Exemplo:

Uma tempestade destrói plantações.

Resultado:

```text
comida ↑
sementes ↑
madeira ↑
```

---

# 29. BANCO

O jogador poderá guardar:

* dinheiro;
* itens;
* recursos.

Cada cidade pode possuir uma agência conectada.

---

# 30. BAÚS

Tipos:

```text
comum
raro
quest
secreto
trancado
armadilha
respawnável
```

---

# 31. QUESTS

Categorias:

### Principal

História do mundo.

### Secundária

Histórias menores.

### Oculta

Descoberta através de exploração.

### Repetível

Pode ser feita novamente.

### Dinâmica

Surge de eventos.

### Coletiva

Vários jogadores podem participar.

### Temporária

Existe durante um evento.

---

# 32. QUESTS COM CONSEQUÊNCIAS

Exemplo:

Uma vila precisa de madeira.

Você pode:

### Ajudar

A vila cresce.

### Ignorar

Nada muda.

### Ajudar outra cidade

A vila pode perder influência.

A ideia é evitar escolhas puramente cosméticas.

---

# 33. SISTEMA DE QUEST LOG

Cada quest possui:

```text
OBJETIVO
DESCRIÇÃO
PROGRESSO
LOCAL
RECOMPENSA
ESTADO
```

Estados:

```text
LOCKED
AVAILABLE
ACTIVE
COMPLETED
FAILED
HIDDEN
```

---

# 34. SEGREDOS

Essa será uma das partes mais importantes do jogo.

## Segredo de ambiente

Uma árvore específica pode ser interativa.

## Segredo temporal

Uma porta só abre durante determinado horário.

## Segredo climático

Uma área aparece somente durante chuva.

## Segredo de item

Usar determinado item em determinado lugar.

## Segredo de sequência

Ativar:

```text
Alavanca 3
→ Alavanca 1
→ Alavanca 4
→ Alavanca 2
```

## Segredo geográfico

Um caminho escondido atrás de uma montanha.

---

# 35. EASTER EGGS

O mundo terá referências escondidas.

Exemplos:

* mensagens;
* NPCs estranhos;
* objetos inúteis;
* nomes;
* salas secretas;
* eventos extremamente raros.

Alguns podem nunca ser explicados oficialmente.

---

# 36. PUZZLES

Tipos:

### Ambiental

Mover objetos.

### Lógico

Sequência.

### Matemático

Resolver código.

### Musical

Sequência sonora.

### Temporal

Executar ações em determinado período.

### Exploração

Encontrar símbolos espalhados pelo mapa.

---

# 37. PORTAS

Tipos:

```text
aberta
fechada
trancada
secreta
mágica
quest
```

Uma porta pode exigir:

* chave;
* quest;
* reputação;
* horário;
* puzzle;
* item específico.

---

# 38. BAÚS E INTERAÇÃO AMBIENTAL

Quase tudo pode possuir interação.

Exemplos:

```text
Livro → ler
Mesa → examinar
Cama → dormir
Cadeira → sentar
Barril → abrir
Forno → cozinhar
Poço → coletar água
Placa → ler
Estátua → examinar
Árvore → cortar
Pedra → coletar
```

---

# 39. COMBATE

O combate será baseado em:

* posicionamento;
* tempo;
* habilidades;
* atributos;
* criaturas;
* efeitos;
* ambiente.

O jogador poderá:

```text
atacar
defender
esquivar
usar habilidade
usar item
fugir
```

---

# 40. CRIATURAS

Cada criatura terá:

```text
HP
nível
velocidade
visão
alcance
dano
defesa
resistências
comportamento
loot
experiência
```

---

# 41. IA

Comportamentos:

```text
IDLE
PATROL
WANDER
CHASE
ATTACK
FLEE
SEARCH
RETURN
SLEEP
```

Uma criatura pode:

* fugir;
* perseguir;
* proteger território;
* dormir;
* procurar comida;
* reagir ao clima.

---

# 42. AGGRO

Cada criatura possui uma área de percepção.

```text
          visão
       ┌─────────┐
       │    👁   │
       │         │
       └─────────┘
```

O jogador pode evitar uma criatura simplesmente não entrando em sua área de percepção.

---

# 43. BOSS

Bosses possuirão:

* fases;
* padrões;
* arena;
* mecânicas únicas;
* recompensas;
* história.

Não será simplesmente:

> "Boss = criatura com 10x HP."

---

# 44. PROGRESSÃO

O personagem possui:

```text
LEVEL
XP
HP
MANA
ENERGY
```

O XP pode vir de:

* combate;
* quests;
* exploração;
* profissões;
* descoberta;
* desafios.

---

# 45. ATRIBUTOS

Exemplo:

```text
Vitalidade
Força
Agilidade
Intelecto
Resistência
Sorte
```

Cada atributo afeta sistemas diferentes.

---

# 46. SKILLS

As habilidades podem melhorar através do uso.

Exemplo:

```text
Corte
Mineração
Pesca
Agricultura
Culinária
Carpintaria
Alquimia
```

Isso cria uma progressão paralela ao nível.

---

# 47. MAGIA

Sistema separado de habilidades.

Categorias:

```text
Natureza
Fogo
Gelo
Luz
Sombra
Arcano
Cura
Movimento
Proteção
```

Feitiços podem possuir:

* cooldown;
* custo;
* alcance;
* área;
* efeitos;
* requisitos.

---

# 48. EFEITOS DE STATUS

Exemplos:

```text
Poison
Burning
Frozen
Slow
Stunned
Regeneration
Shielded
Haste
Weakness
Confusion
```

Cada efeito possui:

```text
tipo
duração
intensidade
origem
```

---

# 49. MORTE

Ao morrer:

```text
HP → 0
↓
estado de morte
↓
respawn
```

A penalidade será configurável.

Possibilidades:

* perda parcial de XP;
* perda de recursos carregados;
* retorno à cidade;
* cooldown;
* recuperação de parte dos itens.

A intenção é criar risco sem tornar o jogo frustrante.

---

# 50. RESPAWN

Locais possíveis:

* cidade;
* templo;
* casa;
* checkpoint;
* acampamento.

---

# 51. VIAGEM

O mundo terá:

* estradas;
* pontes;
* barcos;
* portais;
* transporte público;
* montarias.

Viagens rápidas podem exigir:

* descoberta do local;
* pagamento;
* quest;
* item.

---

# 52. MONTARIAS

Tipos:

* terrestres;
* aquáticas;
* especiais.

Cada uma pode alterar:

```text
velocidade
capacidade
acesso
```

---

# 53. CASAS

O jogador poderá possuir uma residência.

Pode:

* decorar;
* guardar itens;
* colocar móveis;
* exibir troféus;
* criar estação de crafting;
* plantar;
* receber NPCs.

---

# 54. DECORAÇÃO

Objetos:

* mesas;
* cadeiras;
* camas;
* estantes;
* baús;
* plantas;
* quadros;
* troféus;
* luminárias;
* tapetes;
* objetos colecionáveis.

---

# 55. OBJETOS FUNCIONAIS

Uma decoração pode realmente funcionar.

Exemplo:

```text
Forno → cozinha
Baú → armazenamento
Cama → descanso
Mesa → crafting
Estante → livros
Mapa → navegação
```

---

# 56. LIVROS

Livros podem conter:

* história;
* pistas;
* receitas;
* mapas;
* lendas;
* códigos.

Alguns livros serão essenciais para resolver segredos.

---

# 57. COLECIONÁVEIS

Categorias:

```text
livros
relíquias
moedas antigas
pedras
plantas
peixes
criaturas
artefatos
```

---

# 58. BESTIÁRIO

Cada criatura descoberta entra no bestiário.

Informações:

```text
nome
habitat
comportamento
drops
fraquezas
descrição
quantidade derrotada
```

---

# 59. HERBÁRIO

Mesma lógica para plantas.

O jogador precisa descobrir:

* localização;
* horário;
* estação;
* utilização.

---

# 60. CONQUISTAS

Exemplos:

```text
Primeira árvore cortada
Primeira cidade descoberta
Primeiro boss
Primeira casa
100 peixes
1000 árvores
Primeiro segredo
Primeira dungeon
```

Algumas conquistas serão ocultas.

---

# 61. MAPA

O mapa inicialmente aparece:

```text
████████████████
████░░░░░░██████
███░░░░░░░░█████
██░░░░░░░░░░░███
```

Exploração revela áreas.

---

# 62. FOG OF WAR

Regiões não visitadas ficam ocultas.

Depois:

```text
não explorado
↓
visitado
↓
mapeado
```

---

# 63. MINIMAPA

O minimapa atual será expandido para mostrar:

* jogador;
* árvores;
* NPCs;
* criaturas;
* cidades;
* dungeons;
* pontos descobertos;
* quests;
* membros do grupo.

---

# 64. CICLO DIA/NOITE

```text
06:00 amanhecer
12:00 dia
18:00 entardecer
00:00 noite
```

Isso modifica:

* NPCs;
* criaturas;
* lojas;
* quests;
* iluminação;
* segredos.

---

# 65. CLIMA

Tipos:

```text
sol
nublado
chuva
tempestade
neve
neblina
```

O clima pode afetar:

* agricultura;
* pesca;
* criaturas;
* visibilidade;
* eventos.

---

# 66. ESTAÇÕES

Opcional para uma fase avançada.

```text
Primavera
Verão
Outono
Inverno
```

Plantas, clima e eventos mudam.

---

# 67. DUNGEONS

Cada dungeon terá:

```text
entrada
salas
inimigos
puzzles
loot
segredos
boss
saída
```

Algumas serão procedurais.

---

# 68. DUNGEONS SECRETAS

Nunca aparecem no mapa.

Entrada descoberta por:

* puzzle;
* NPC;
* livro;
* item;
* exploração.

---

# 69. EVENTOS MUNDIAIS

Eventos podem surgir dinamicamente.

Exemplo:

```text
ALERTA
Uma criatura foi avistada ao norte!
```

Outro:

```text
A tempestade destruiu parte da estrada.
```

---

# 70. RAIDS

Um evento pode fazer criaturas atacarem uma cidade.

Jogadores podem:

* defender;
* evacuar NPCs;
* reconstruir;
* derrotar líder;
* procurar causa do ataque.

---

# 71. FACÇÕES

Exemplo:

```text
Guardiões da Floresta
Ordem dos Exploradores
Mercadores
Mineradores
Arcanistas
Nômades
```

Cada uma possui:

* reputação;
* quests;
* itens;
* NPCs;
* áreas.

---

# 72. GUILDA

Jogadores podem criar guildas.

Recursos:

* nome;
* símbolo;
* membros;
* cargos;
* banco;
* território;
* chat;
* missões.

---

# 73. GRUPOS

Party:

```text
Líder
Membro
Membro
Membro
```

Recursos:

* XP compartilhado;
* localização;
* chat;
* buffs;
* quests cooperativas.

---

# 74. SOCIAL

Sistema de:

* amigos;
* bloqueados;
* mensagens;
* grupos;
* guildas;
* lista online.

---

# 75. CHAT

Canais:

```text
Global
Local
Guilda
Party
Privado
Sistema
```

---

# 76. COMÉRCIO ENTRE JOGADORES

O jogador poderá:

```text
trocar item
trocar recurso
vender
comprar
negociar
```

Para evitar problemas:

* confirmação dupla;
* janela de troca;
* bloqueio após confirmação.

---

# 77. MARKETPLACE

Mercado global:

```text
ITEM
QUANTIDADE
PREÇO
VENDEDOR
TEMPO
```

Isso cria uma economia controlada pelos jogadores.

---

# 78. PVP

Sistema opcional.

Modos:

```text
Duelo
Arena
Guerra de guildas
Evento PvP
```

O mundo principal pode permanecer seguro para evitar que jogadores sejam obrigados a participar.

---

# 79. ARENAS

Áreas específicas para combate competitivo.

Rankings:

```text
Vitórias
Derrotas
Pontuação
Temporada
```

---

# 80. MISSÕES DIÁRIAS

Exemplo:

```text
Corte 10 árvores
Pesque 5 peixes
Explore uma área
Ajude um NPC
Complete uma dungeon
```

---

# 81. RECOMPENSAS

Tipos:

* XP;
* dinheiro;
* itens;
* cosméticos;
* títulos;
* receitas;
* reputação;
* acesso.

---

# 82. TÍTULOS

Exemplo:

```text
Explorador
Lenhador
Pescador
Arqueólogo
Guardião
Caçador de Segredos
```

O título aparece próximo ao nome.

---

# 83. SISTEMA DE TÍTULOS OCULTOS

Alguns títulos só podem ser descobertos.

Exemplo:

> "Aquele que abriu a porta."

O jogo não explica como conseguir.

---

# 84. ITENS RAROS

Raridades:

```text
Comum
Incomum
Raro
Épico
Lendário
Mítico
Secreto
```

**Importante:** raridade não significa necessariamente poder.

Um item comum pode ter uma função extremamente específica.

---

# 85. ITENS COM HISTÓRIA

Exemplo:

```text
Relógio quebrado

"Ele parou exatamente às 03:17."
```

Se o jogador descobrir onde 03:17 é importante, o item ganha função.

---

# 86. ITENS COMPORTAMENTAIS

Alguns itens reagem ao mundo.

Exemplo:

```text
bússola
↓
aponta para algo
```

ou:

```text
cristal
↓
brilha perto de determinada região
```

---

# 87. ITENS COMBINAÇÃO

Itens podem ser combinados.

```text
A + B = C
```

Algumas combinações serão descobertas pelo jogador.

---

# 88. SEGREDO DE ITENS

Um objeto aparentemente inútil pode:

```text
ser usado em uma estátua
↓
abrir passagem
↓
desbloquear dungeon
```

---

# 89. QUESTS SEM MARCADOR

Algumas quests não terão:

```text
!
?
```

O jogador precisa perceber que existe um problema.

---

# 90. QUESTS COM MÚLTIPLAS SOLUÇÕES

Exemplo:

NPC precisa de comida.

Você pode:

```text
comprar
pescar
cozinhar
roubar
caçar
plantar
```

Todas podem resolver a quest.

---

# 91. MUNDO REATIVO

Se uma ponte quebrar:

```text
NPCs mudam caminho
comércio muda
rota muda
criaturas aparecem
```

---

# 92. RECONSTRUÇÃO

O jogador pode ajudar a reconstruir:

* pontes;
* casas;
* estradas;
* lojas;
* muralhas.

---

# 93. OBJETIVOS DE LONGO PRAZO

Não existe somente "zerar".

Objetivos:

```text
descobrir 100% do mapa
colecionar tudo
maximizar profissão
ter casa
criar guilda
descobrir todos os segredos
completar história
derrotar todos os bosses
```

---

# 94. SISTEMA DE LORE

O mundo terá história espalhada.

Não apenas através de cutscenes.

Lore estará em:

* livros;
* ruínas;
* diálogos;
* objetos;
* mapas;
* nomes;
* arquitetura;
* eventos.

---

# 95. MISTÉRIOS DE LONGO PRAZO

O jogo terá mistérios que podem levar dezenas de horas.

Exemplo:

```text
Livro 1
 ↓
símbolo
 ↓
estátua
 ↓
NPC
 ↓
local
 ↓
item
 ↓
porta
 ↓
dungeon
 ↓
verdade sobre o mundo
```

---

# 96. SISTEMA DE MEMÓRIA DO MUNDO

O servidor registra:

```text
árvore destruída
porta aberta
boss derrotado
quest concluída
cidade modificada
NPC morto/ausente
evento concluído
```

Isso permite um mundo persistente.

---

# 97. PERSISTÊNCIA

Banco de dados:

```text
players
characters
inventory
items
quests
world_states
npcs
guilds
houses
market
logs
```

---

# 98. ARQUITETURA FUTURA

### Front-end

```text
HTML
CSS
JavaScript
Canvas
```

### Backend

Possibilidade:

```text
Node.js
WebSocket
REST API
```

### Banco

```text
MySQL
```

Isso conversa muito bem com o que você já sabe de MySQL.

---

# 99. CLIENTE

```text
Game
├── Renderer
├── Input
├── Camera
├── World
├── Player
├── Inventory
├── UI
├── Audio
├── Network
└── Effects
```

---

# 100. SERVIDOR

```text
Server
├── Authentication
├── Players
├── World
├── NPC
├── Monsters
├── Quests
├── Inventory
├── Economy
├── Guilds
├── Chat
└── Persistence
```

---

# 101. SISTEMA DE ENTIDADES

Tudo pode ser uma entidade:

```js
Entity
├── Player
├── NPC
├── Monster
├── Tree
├── Item
├── Projectile
├── Resource
└── Object
```

Isso facilita muito a expansão.

---

# 102. SISTEMA DE INTERAÇÃO

A longo prazo:

```js
entity.interact(player)
```

Assim uma árvore pode:

```js
tree.interact(player)
```

Um NPC:

```js
npc.interact(player)
```

Uma porta:

```js
door.interact(player)
```

---

# 103. SISTEMA DE EVENTOS

Eventos internos:

```text
PLAYER_MOVED
TREE_CUT
ITEM_PICKED
QUEST_STARTED
QUEST_COMPLETED
NPC_TALKED
PLAYER_DIED
BOSS_DEFEATED
AREA_DISCOVERED
```

Isso permite sistemas desacoplados.

---

# 104. LOG DO JOGADOR

Histórico:

```text
14:31 Você encontrou Madeira.
14:32 Você descobriu Floresta Norte.
14:34 Você iniciou uma missão.
14:37 Você encontrou uma passagem secreta.
```

---

# 105. NOTIFICAÇÕES

Exemplos:

```text
+3 Madeira
+15 XP
Nova missão!
Nova região descoberta!
Novo item!
Segredo descoberto!
```

---

# 106. ÁUDIO

Categorias:

```text
música
ambiente
passos
água
vento
chuva
interação
combate
UI
NPC
```

O áudio também pode indicar segredos.

---

# 107. MÚSICA DINÂMICA

A música muda conforme:

```text
cidade
floresta
perigo
dungeon
boss
evento
noite
```

---

# 108. SISTEMA DE CONQUISTA OCULTA

Algumas ações absurdamente específicas podem desbloquear coisas.

Exemplo:

> Examinar a mesma estátua 100 vezes.

Resultado:

> "Você percebeu alguma coisa..."

Isso é exatamente o tipo de maluquice que combina com o projeto.

---

# 109. SEGREDOS ABSURDOS

O jogo pode ter coisas que parecem bugs propositalmente.

Exemplo:

```text
andar contra uma parede
+
usar determinado emote
+
horário específico
=
sala secreta
```

---

# 110. EMOTES

Jogador pode:

```text
/hello
/wave
/sit
/laugh
/dance
/cry
```

Emotes podem ser usados em puzzles.

---

# 111. INTERAÇÃO SOCIAL

NPCs podem reagir aos emotes.

Exemplo:

Você acena.

NPC:

> "Olá."

---

# 112. SISTEMA DE RELACIONAMENTO

NPC:

```text
0 → desconhecido
20 → conhecido
50 → amigo
80 → aliado
100 → confiança máxima
```

Isso pode desbloquear:

* histórias;
* presentes;
* quests;
* áreas.

---

# 113. PRESENTES

Itens podem ser entregues a NPCs.

Cada NPC possui preferências.

---

# 114. FAVORITOS

NPC pode gostar de:

```text
flores
comida
livros
minérios
artefatos
```

---

# 115. REPUTAÇÃO GLOBAL

Além da reputação por facção:

```text
Honra
Comércio
Exploração
Criminalidade
Ajuda
```

Isso permite diferentes estilos de personagem sem obrigar uma classe.

---

# 116. CLASSES

Opcional.

O jogador pode escolher uma especialização:

```text
Guerreiro
Arcanista
Explorador
Guardião
Curandeiro
```

Mas o sistema pode continuar permitindo evolução híbrida.

---

# 117. BUILD LIVRE

Um jogador pode misturar:

```text
Exploração
+
Magia
+
Alquimia
+
Combate
```

Sem ficar preso permanentemente a uma classe.

---

# 118. ÁRVORE DE HABILIDADES

Exemplo:

```text
EXPLORAÇÃO
│
├── Rastreamento
├── Coleta
├── Sobrevivência
└── Navegação
```

---

# 119. SISTEMA DE EXPERIÊNCIA POR USO

Exemplo:

Corta árvores:

```text
XP de Carpintaria
```

Pesca:

```text
XP de Pesca
```

Explora:

```text
XP de Exploração
```

Resolve puzzle:

```text
XP de Conhecimento
```

---

# 120. FINAL DO JOGO

Não haverá necessariamente um "fim".

O mundo continua.

O jogador pode chegar ao estado:

```text
história principal concluída
+
todas as regiões
+
todos os bosses
+
todos os segredos
```

e continuar jogando.

---

# 121. ROADMAP DE DESENVOLVIMENTO

## FASE 1 — FUNDAÇÃO

Atual:

* Canvas;
* jogador;
* movimento;
* câmera;
* mapa;
* zoom.

---

## FASE 2 — MUNDO

* chunks;
* geração procedural;
* biomas;
* rios;
* montanhas;
* estradas.

---

## FASE 3 — INTERAÇÃO

* árvores;
* colisão;
* coleta;
* objetos;
* portas;
* baús.

---

## FASE 4 — RECURSOS

* inventário;
* madeira;
* mineração;
* coleta;
* peso;
* crafting.

---

## FASE 5 — RPG

* XP;
* níveis;
* atributos;
* skills;
* equipamentos;
* NPCs.

---

## FASE 6 — QUESTS

* diálogo;
* quest log;
* objetivos;
* recompensas;
* reputação.

---

## FASE 7 — COMBATE

* criaturas;
* IA;
* habilidades;
* bosses;
* dungeons.

---

## FASE 8 — MUNDO VIVO

* dia/noite;
* clima;
* eventos;
* economia;
* NPCs com rotina.

---

## FASE 9 — SOCIAL

* contas;
* multiplayer;
* chat;
* grupos;
* comércio;
* guildas.

---

## FASE 10 — PERSISTÊNCIA

* servidor;
* MySQL;
* personagens;
* mundo persistente;
* casas;
* economia.

---

# 122. ESTRUTURA FINAL DO PROJETO

A estrutura pode evoluir para:

```text
game/
│
├── index.html
│
├── css/
│   ├── style.css
│   ├── hud.css
│   ├── inventory.css
│   ├── dialogue.css
│   └── map.css
│
├── js/
│   │
│   ├── main.js
│   │
│   ├── core/
│   │   ├── game.js
│   │   ├── loop.js
│   │   ├── config.js
│   │   └── events.js
│   │
│   ├── world/
│   │   ├── world.js
│   │   ├── chunk.js
│   │   ├── biome.js
│   │   ├── terrain.js
│   │   └── generation.js
│   │
│   ├── entities/
│   │   ├── entity.js
│   │   ├── player.js
│   │   ├── npc.js
│   │   ├── monster.js
│   │   └── object.js
│   │
│   ├── systems/
│   │   ├── combat.js
│   │   ├── inventory.js
│   │   ├── crafting.js
│   │   ├── quests.js
│   │   ├── dialogue.js
│   │   ├── economy.js
│   │   ├── reputation.js
│   │   ├── weather.js
│   │   ├── daynight.js
│   │   └── achievements.js
│   │
│   ├── rendering/
│   │   ├── renderer.js
│   │   ├── camera.js
│   │   ├── sprites.js
│   │   └── effects.js
│   │
│   ├── ui/
│   │   ├── hud.js
│   │   ├── inventory.js
│   │   ├── minimap.js
│   │   ├── dialogue.js
│   │   └── questlog.js
│   │
│   └── input/
│       └── input.js
│
├── assets/
│   ├── sprites/
│   ├── tiles/
│   ├── audio/
│   ├── music/
│   └── fonts/
│
└── server/
    ├── api/
    ├── websocket/
    ├── database/
    ├── world/
    └── authentication/
```

---

# 123. REGRA DE OURO DO PROJETO

A regra mais importante do GDD seria:

> **O mundo não deve parecer um conjunto de fases. Deve parecer um lugar.**

Se existe uma casa, ela deve ter motivo para existir.

Se existe um NPC, ele deve ter uma vida.

Se existe uma porta, pode haver algo atrás dela.

Se existe uma montanha, talvez exista uma maneira de atravessá-la.

Se existe um objeto aparentemente inútil, talvez **não seja inútil**.

E se o jogador descobrir algo que você nunca imaginou que alguém tentaria...

**o jogo deveria conseguir lidar com isso.**

---

# 124. LOOP PRINCIPAL

No fundo, todo o jogo gira em torno disso:

```text
                ┌──────────────┐
                │   EXPLORAR   │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │   DESCOBRIR  │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │   INTERAGIR  │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │    OBTER     │
                │ RECURSOS/XP  │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │    EVOLUIR   │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │  EXPLORAR    │
                │    MAIS      │
                └──────────────┘
```

E por cima desse loop ficam **quests, economia, NPCs, crafting, segredos, dungeons, bosses, casas, guildas e multiplayer**.

Isso dá ao projeto uma base grande o suficiente para começar como o protótipo atual de **jogador + árvore + mapa**, mas crescer gradualmente até virar um MMORPG completo, sem precisar jogar fora a arquitetura inicial. ([Tibia][1])

[1]: https://www.tibia.com/abouttibia/?subtopic=gamefeatures&utm_source=chatgpt.com "Tibia - Free Multiplayer Online Role Playing Game - About Tibia"
