// js/dialogs.js — Frases de NPC para Crônicas de Westeros
// Pack completo de diálogos medievais com tom de Westeros

const DIALOGS = {

  // ══════════════════════════════════════════════════════
  // FERREIRO
  // ══════════════════════════════════════════════════════
  f: {
    hostil: [
      'Saia da minha forja antes que eu use você como bigorna.',
      'Não forjo para forasteiros sem reputação. Vá embora.',
      'Minhas lâminas não são para qualquer um que aparece de nariz empinado.',
      'Ouvi falar de você, {nome}. Nada de bom, garanto.',
      'Prefiro forjar ferraduras a olhar para sua cara.',
      'O fogo da forja é quente, e minha paciência com você, fria como o Norte.',
      'Que quer aqui? Comprar ou me irritar? Porque o segundo não tem preço.',
      'Até minha bigorna tem mais charme do que você.',
      'Em {cidade} não gostamos de gente com sua fama.',
      'Vá tentar a sorte com outro ferreiro. Aqui sua moeda não tem valor.',
      'Já ouvi dizer que você deixa rastro de problemas onde quer que vá.',
      'Trabalho com ferro e fogo, não com canalhas.',
      'Essa espada que carrega parece tão torta quanto seu caráter.',
      'O Inverno está chegando, e você deveria ir junto com ele — para longe daqui.',
      'Nem os Lannister pagariam o suficiente para me fazer confiar em você.',
      'Tenho ferros no fogo mais valiosos do que sua presença aqui.',
      'Forjei armas para lordos e cavaleiros. Para sua laia? Nem uma faca de pão.',
      'Se sua reputação fosse aço, não prestaria nem para enxada.',
      'Venha com outro rosto e talvez eu atenda. Com esse não.',
      'A última pessoa com sua reputação que entrou aqui saiu sem uma orelha.',
      'Não sirvo traidores. E o que ouço sobre você não é lisonjeiro.',
      'Cada golpe nessa bigorna vale mais do que qualquer palavra sua.',
      'Em nome dos Sete, suma daqui antes que eu perca a paciência.',
      'Minha forja é sagrada. Presenças como a sua a contaminam.',
      'Já trabalhei para Baratheons e Starks. Para gente como você? Jamais.',
      'Seu nível {nivel} não me impressiona. Já vi escudeiros melhores.',
      'Vai procurar um ferreiro em Porto Real. Lá aceitam qualquer tipo.',
      'O fogo purifica o ferro. Pena que não faz o mesmo com sua reputação.',
      'Não gosto da sua cara, não gosto do seu nome, não gosto de você.',
      'Se fosse para eu forjar algo para você, seria uma gaiola.'
    ],
    neutro: [
      'Bom dia, viajante. O que precisa?',
      'Espera um momento, estou terminando esta lâmina.',
      'O ferro não mente — ou é bom ou não é. O que quer?',
      'Temos espadas, machados, lanças e armaduras. Fale logo.',
      'Forjei até manhã cedo. Mas ainda atendo quem tiver moedas.',
      'O aço de {cidade} é dos melhores dos Sete Reinos. Pode crer.',
      'Viajante, os preços são justos aqui. Não pechinche demais.',
      'Você parece que carrega peso nas costas. Precisa de armadura melhor?',
      'O Inverno está chegando, dizem os Stark. Melhor ter uma boa lâmina.',
      'Sou ferreiro há trinta anos. Sei o que um aventureiro precisa.',
      'Essa espada sua parece cansada de batalha. Quer que eu a afie?',
      'Tenho materiais novos chegando de Altojardim. Se quiser esperar...',
      'Um ferreiro honesto numa cidade honesta. O que posso fazer por você?',
      'Nível {nivel}, hein? Já passou por muita coisa, imagino.',
      'Aqui não faço perguntas sobre o passado. Só sobre o que precisa comprar.',
      'Cada espada que forjo tem uma alma. Qual se encaixa na sua?',
      'Trabalho em {cidade} há anos. Conheço cada pedra dessa cidade.',
      'Bom equilíbrio numa lâmina pode salvar sua vida. Sabia disso?',
      'Já forjei para lordes, mercenários e até um Guardião do Norte.',
      'O dragão no brasão não faz o cavaleiro. Faz a lâmina que ele carrega.',
      'Venho de uma família de ferreiros. Meu avô forjou para os Targaryen.',
      'Posso temperar sua armadura por um preço razoável.',
      'O fogo da forja nunca mente sobre a qualidade do aço.',
      'Cuidado com vendedores baratos na Beira Oriental. O aço deles enferruja.',
      'Se precisar de reparos após a batalha, volte. Sou rápido.',
      'Ouvi dizer que há movimento de tropas ao sul. Boa hora pra se armar.',
      'Tenho uma cota de malha que ficou pronta essa semana. Quer ver?',
      'O trabalho honesto é o único trabalho que conheço.',
      'Seja bem-vindo, {nome}. O que o traz até minha forja hoje?',
      'Não sou o mais barato, mas sou o melhor em {cidade}. Isso tem valor.'
    ],
    amigo: [
      'Ora, {nome}! Já estava esperando você por aqui!',
      'Amigo, tenho uma lâmina separada especialmente para você.',
      'Sabia que você voltaria. Os bons clientes sempre voltam.',
      '{nome}, seu nome é respeitado nessa forja. O que precisa?',
      'Para você, tenho um desconto especial. Não conta pra ninguém.',
      'Que bom ver um rosto amigo entre tanto forasteiro.',
      'Lembro quando você chegou aqui pela primeira vez, nível {nivel}. Como cresceu!',
      'A lâmina que você comprou aqui te serviu bem? Espero que sim.',
      'Para um amigo de {cidade}, o melhor do estoque fica reservado.',
      'Sente-se, tome um copo d\'água. Depois vemos o que precisa.',
      'Meu filho me perguntou sobre você semana passada. Sua fama cresceu, {nome}.',
      'Tenho aço Valiriano em quantidade. Para você, separo o melhor.',
      'Ouvi que você se saiu bem na última batalha. Orgulho de {cidade}!',
      'Ferreiros e aventureiros: sem um, o outro não sobrevive. Obrigado, {nome}.',
      'Sua reputação em {cidade} é das melhores. Isso me faz feliz.',
      '{nome}, se precisar de algo forjado sob medida, é só pedir.',
      'O Rei da Noite que se cuide — com as armas que eu te vendi!',
      'Tenho uma armadura nova que parece feita para você. Quer experimentar?',
      'Para os amigos de {cidade}, o preço é sempre o melhor possível.',
      'Você é o tipo de aventureiro que essa cidade precisa. Continue assim.',
      'Já falei pra minha esposa sobre você, {nome}. Ela quer te conhecer!',
      'Cada vez que você entra aqui, eu sei que vai sair mais forte.',
      'Um guerreiro do seu calibre merece o melhor aço de Westeros.',
      'Tenho uma espada que forjei sonhando com um herói. Acho que é sua, {nome}.',
      'Lannister paga bem, mas amigos como você valem mais.',
      'Se um dia precisar de armas numa crise, minha forja está aberta para você.',
      'O Inverno está chegando, {nome}. Mas com suas armas, ele que se prepare.',
      'Forjei essa adaga pensando em você. Toma, é um presente de {cidade}.',
      'Você já provou seu valor aqui. Minha forja é sua quando precisar.',
      'Que os Sete te protejam em batalha, {nome}. E o meu aço também!'
    ]
  },

  // ══════════════════════════════════════════════════════
  // MERCADOR
  // ══════════════════════════════════════════════════════
  m: {
    hostil: [
      'Não faço negócios com gente de reputação duvidosa. Siga em frente.',
      'Meu estoque não é para qualquer um. Especialmente não para você.',
      'Já ouvi seu nome, {nome}. Em contextos nada favoráveis.',
      'Vá tentar enganar outro mercador. Aqui você não passa.',
      'Posso farejar um mau negócio a léguas de distância. Você é um.',
      'Em {cidade} a gente cuida de quem trata a cidade bem. Você não tratou.',
      'Nem por ouro dos Lannister eu faria negócio com alguém como você.',
      'Minha família mercantil tem orgulho. Você não combina com ele.',
      'Até minha mercadoria mais velha vale mais do que sua reputação.',
      'Não perco tempo com forasteiros mal afamados.',
      'Suas moedas podem ser boas, mas sua companhia não.',
      'Dobre o canto ali e some. Não há negócio aqui para você.',
      'Vi um ladrão hoje mais honesto do que o que ouço sobre você.',
      'Prefiro perder a venda do que ganhar problemas.',
      'Meu avô dizia: mau cliente, pior inimigo. Você prova ele certo.',
      'Sua fama chegou antes de você. E não me agradou.',
      'Os Sete me avisaram com um pressentimento ruim quando você entrou.',
      'Em Porto Real te dariam atenção. Aqui, não.',
      'Não há mercadoria suficientemente barata para vender a você.',
      'Essa cara de inocente não me engana, {nome}.',
      'Meu sócio me avisou sobre você. Ele estava certo.',
      'Cada real que você gastaria aqui me custaria o dobro em dor de cabeça.',
      'Já tive problemas com aventureiros. Com você, prefiro não arriscar.',
      'Nível {nivel} e essa reputação toda? Impressionante, no pior sentido.',
      'Minhas rotas comerciais passam longe de gente como você.',
      'Se fosse vender problemas, você seria meu melhor fornecedor.',
      'Não comercializo com quem não é bem-vindo em {cidade}.',
      'Sua presença já está me custando clientes honestos.',
      'Vá embora antes que eu chame a guarda.',
      'Não há desconto, não há venda, não há conversa. Boa tarde.'
    ],
    neutro: [
      'Bem-vindo! O que posso oferecer a um viajante hoje?',
      'Temos mercadorias de todas as terras dos Sete Reinos.',
      'Os preços aqui são justos. Não encontrará melhor em {cidade}.',
      'Venho de Braavos — aprendi a negociar desde criança.',
      'O que necessita, {nome}? Temos poções, itens e mantimentos.',
      'Um mercador honesto vale seu peso em ouro. E eu sou honesto.',
      'Ouvi que o tempo está ficando difícil nas estradas. Vai se armar?',
      'Tenho itens raros, se tiver as moedas para eles.',
      'Todo viajante precisa de provisões. Aqui está o lugar certo.',
      'Nível {nivel} já! Os itens que tenho combinam com sua experiência.',
      'O inverno encarece tudo — aproveite os preços de agora.',
      'Rotas comerciais da Beira Oriental chegaram ontem. Novidades no estoque.',
      'Um bom mercador sabe o que cada aventureiro precisa. Deixa eu adivinhar...',
      'Comprou aqui antes? Primeira vez é especial em minha loja.',
      'Minhas mercadorias viajaram mais do que muitos cavaleiros.',
      'Não sou como esses mercadores desonestos de Porto Real.',
      'Se precisar de algo específico, posso encomendá-lo.',
      'O comércio mantém os Sete Reinos unidos. Mais do que qualquer rei.',
      'Tenho itens de Dorne, do Norte e até das Cidades Livres.',
      'Um cliente satisfeito é propaganda mais barata do que qualquer item.',
      'Sabe o que dizem: quem poupa na viagem, paga caro no hospital.',
      'Posso oferecer bom preço se comprar em quantidade.',
      'Venha cá, {nome}. Tem algo guardado que acho que você vai gostar.',
      'Os negócios em {cidade} estão bons. Enquanto há paz, há lucro.',
      'Não faço crédito, mas faço bom preço. Combinado?',
      'Cada moeda gasta aqui fica em {cidade}. Pense nisso.',
      'Tenho mapa de mercadoria rara, se o interesse for alto.',
      'Um mercador sem clientes é como um cavaleiro sem cavalo.',
      'Já vendi para Starks, Lannisters e até um representante Targaryen.',
      'O que os olhos não veem, o bolso não sente. Mas o meu estoque compensa!'
    ],
    amigo: [
      '{nome}! Meu melhor cliente! Entre, entre!',
      'Sabia que você voltaria. Os espertos sempre voltam.',
      'Para você tenho desconto especial — não conta pra ninguém, tá?',
      'Guardo as melhores mercadorias para os amigos de {cidade}.',
      'Sua reputação aqui é de ouro, {nome}. E ouro tem desconto.',
      'Meu lucro do mês? Metade é graças a você, {nome}!',
      'Que os Sete te abençoem, {nome}! Está ótimo de se ver.',
      'Tenho um item novo que chegou de Essos pensando em você.',
      'O melhor preço da cidade, reservado para os melhores clientes.',
      'Lembro da primeira vez que comprou aqui. Como cresceu, {nome}!',
      'Para um aventureiro do seu calibre, o estoque especial fica aberto.',
      'Minha família te agradece, {nome}. Você sustentou metade dela esse mês.',
      'Falo bem de você em toda reunião de mercadores de {cidade}.',
      'Até os Lannister precisam de bons preços às vezes. Para você é melhor ainda.',
      'Nível {nivel} e crescendo! Preciso ampliar meu estoque pra te acompanhar.',
      'Tem algo que sempre quis, {nome}? Posso encomendá-lo especialmente.',
      'Um cliente como você é raro como aço Valiriano.',
      'O ouro das suas moedas brilha diferente quando vem de um amigo.',
      'Fique à vontade para ver tudo. Para você, portas abertas.',
      'Sei exatamente o que você precisa antes de você falar.',
      'Meu melhor vinho de Dorne reservado para a sua próxima visita, {nome}.',
      'Em {cidade} todo mundo conhece o nome de {nome}. E eu com orgulho digo que é meu cliente.',
      'Se algum dia precisar de crédito, faço questão de ajudar.',
      'Você já comprou mais da metade do meu estoque premium. Bom gosto!',
      'Tenho rotas especiais de Braavos. Os melhores itens chegam primeiro para você.',
      'Fiz um pacote especial pensando nas suas aventuras, {nome}.',
      'O negócio da semana? Reservado para os amigos. Como você!',
      'Vou ser honesto: você é o motivo pelo qual ainda amo ser mercador.',
      'Um brinde a {nome} — o melhor cliente que {cidade} já viu!',
      'A cada aventura sua, meu estoque cresce para te atender melhor, {nome}!'
    ]
  },

  // ══════════════════════════════════════════════════════
  // ESTALAJADEIRO / TAVERNEIRO
  // ══════════════════════════════════════════════════════
  e: {
    hostil: [
      'Não sirvo gente problemática. Saia antes que chame a guarda.',
      'Ouvi histórias sobre você, {nome}. Nenhuma boa.',
      'Minha estalagem tem reputação. Não vai arruiná-la.',
      'Não há quarto, não há cerveja, não há nada para você aqui.',
      'Já tive confusão uma vez com seu tipo. Não vai se repetir.',
      'Vá dormir no celeiro, se algum fazendeiro aceitar você.',
      'Meu estabelecimento é para gente honesta. Vá procurar outro.',
      'Em {cidade} sua fama chegou antes de você. E não me agradou.',
      'Não importa quantas moedas tenha, não há lugar para você aqui.',
      'Já expulsei gente pior do que você. Não quero ter que fazer isso.',
      'Minhas outras hospedes merecem paz. Você não traz isso.',
      'Nem a pior cerveja do barril merece ser bebida por alguém como você.',
      'Ouvi dizer que você causa problemas onde quer que vá. Não aqui.',
      'O Inverno está chegando, dizem. Mas você é o frio que não quero por aqui.',
      'Vá para Porto Real. Lá aceitam qualquer tipo nas tabernas.',
      'Minha estalagem sobreviveu a guerras. Não vai sucumbir à sua visita.',
      'Já servi cavaleiros, lordes e até um dragão disfarçado. A você, não.',
      'Saia agora ou a próxima bebida que você toma vem pelo funil da guarda.',
      'Não preciso do seu dinheiro mais do que da minha tranquilidade.',
      'Tenho crianças nessa estalagem. Presença como a sua não é bem-vinda.',
      'Meu avô dizia que homem de má fama traz má sorte. Creia.',
      'Nem o pior barril de cerveja azeda merece ser bebido em sua companhia.',
      'Você tem cara de confusão. E aqui não há espaço para confusão.',
      'Expulsei um Lannister bêbado uma vez. Você não me assusta.',
      'Não é questão de preço. É questão de caráter. E o seu está em falta.',
      'Vá embora, {nome}. Essa é minha última palavra gentil.',
      'Minha estalagem, minhas regras. E a regra é: não para você.',
      'Há um celeiro a duas léguas. Talvez os cavalos te tolerem.',
      'O fogo da lareira aqui não aquece todo tipo de pessoa.',
      'Saia antes que o meu sócio volte. Ele é menos paciente que eu.'
    ],
    neutro: [
      'Bem-vindo à estalagem! O que vai ser: quarto, refeição ou cerveja?',
      'Temos o melhor hidromel ao norte das Montanhas da Lua.',
      'Viajante cansado precisa de cama boa. Temos as melhores em {cidade}.',
      'O ensopado de hoje está excelente. Fiz com receita da minha avó.',
      'Cerveja fresca do barril ou vinho de Dorne? A escolha é sua.',
      'Ouvi tantas histórias de viajantes que poderia escrever um livro.',
      'O tempo lá fora está difícil. Aqui dentro, é quente e seguro.',
      'Nível {nivel}? Já viu bastante coisa, imagino. Conta algumas histórias?',
      'Temos quartos simples e quartos de lordes. Cada um no seu preço.',
      'Em {cidade} a nossa estalagem é a mais antiga e a melhor.',
      'Um bardo passou por aqui ontem — cantou sobre o Muro. Arrepiou.',
      'Os Guardas da Noite às vezes param aqui. Gente séria, aquela.',
      'Dizem que o Inverno está chegando. Bom momento para uma cerveja quente.',
      'Se quiser um banho, temos banheira de madeira e água do poço.',
      'Tenho informações sobre as estradas, se isso interessar a um viajante.',
      'Um grupo de mercadores de Braavos passou aqui anteontem. Mundo pequeno.',
      'A lareira nunca se apaga nessa estalagem. Em trinta anos, nunca.',
      'Precisando de informações sobre {cidade}? Sou o melhor guia daqui.',
      'O pão de hoje saiu do forno há uma hora. Ainda quente.',
      'Um cavaleiro solitário não é tão incomum por aqui. Seja bem-vindo.',
      'Guardo segredos como guardo bom vinho: com cuidado.',
      'Minha estalagem já hospedou gente de todos os Sete Reinos.',
      'Tem lugar no salão principal ou quer algo mais reservado?',
      'O serviço aqui é honesto. Não cobramos pelo ar, mas pelo conforto sim.',
      'Já servi Starks, Baratheons e até um Targaryen disfarçado, dizem.',
      'Noite fria lá fora. Um ensopado quente resolve qualquer problema.',
      'Viajante, {nome}, se quiser indicação de rotas, posso ajudar.',
      'Meu marido era aventureiro. Sei bem o que vocês precisam após a estrada.',
      'Aqui dentro não há política, não há guerra. Só cerveja e descanso.',
      'O que vai ser, {nome}? Temos o que o corpo e a alma precisam.'
    ],
    amigo: [
      '{nome}! Minha estalagem fica melhor quando você aparece!',
      'O quarto favorito já está reservado para você, {nome}!',
      'Já sabia que você voltaria. Guardei o melhor barril!',
      'Para um amigo de {cidade}, a primeira cerveja é por conta da casa.',
      'Que bom te ver de volta, {nome}! Todo mundo aqui perguntava por você.',
      'Sente-se no seu lugar favorito. Está guardado, como sempre.',
      'Meu cozinheiro já está preparando seu prato preferido, {nome}.',
      'Sua cama está pronta, seu vinho está abrindo, e a lareira está acesa.',
      'As histórias que você conta animam minha estalagem por semanas!',
      '{nome} está de volta! Alguém avisa o bardo pra celebrar!',
      'Nível {nivel} agora! Cada vez que você sobe de nível, a cerveja fica mais forte aqui.',
      'Para você, os preços são de amigo. Não de aventureiro famoso.',
      'Minha filha vai ficar feliz em saber que você está em {cidade}.',
      'O melhor ensopado de {cidade} está esperando por você, {nome}.',
      'Você é a razão pela qual minha estalagem é conhecida nos Sete Reinos.',
      'Guardo as melhores histórias de outros viajantes para te contar.',
      'Um herói de {cidade} merece tratamento de rei. E você vai ter.',
      'Já falei sobre você para os Guardas da Noite que passaram por aqui.',
      'Tenho um vinho especial de Dorne que cheguei hoje. Seu, {nome}.',
      'A estalagem estava quieta sem você. Agora vai animar!',
      'Para {nome}, até o pão fica mais gostoso de assar.',
      'Há um grupo de aventureiros no salão querendo ouvir suas histórias.',
      'Meu marido sempre dizia: quando {nome} aparece, é sinal de boa sorte.',
      'Você já dormiu nessa cama mais vezes do que eu. Ela é quase sua.',
      'A lareira acende mais forte quando você chega. Juro que não é coincidência.',
      'Tenho novidades frescas das estradas. Mas primeiro a cerveja, {nome}.',
      'Um amigo como você vale mais do que cem clientes comuns.',
      'O Inverno que venha — com você aqui, a estalagem está protegida.',
      'Minha estalagem é sua casa em {cidade}, {nome}. Sempre.',
      'Que os Sete te abençoem, {nome}. E a segunda cerveja também é grátis!'
    ]
  },

  // ══════════════════════════════════════════════════════
  // SACERDOTE (Rh'llor — O Senhor da Luz)
  // ══════════════════════════════════════════════════════
  pr: {
    hostil: [
      'O fogo de Rh\'llor não ilumina almas corrompidas. Afaste-se.',
      'O Senhor da Luz me revelou sua natureza, {nome}. Não é digna.',
      'A escuridão que carrega não é bem-vinda neste templo.',
      'Suas ações em {cidade} chegaram aos ouvidos de Rh\'llor. Ele não aprova.',
      'Fui advertido em visão sobre alguém como você. Saia daqui.',
      'O fogo purifica, mas nem toda chama pode te salvar.',
      'Seus pecados criam sombra sobre este lugar sagrado.',
      'Não invoque o nome de Rh\'llor se sua vida é de trevas.',
      'A profecia não fala de heróis com sua reputação.',
      'Seus atos sombrios chegaram até mim nas chamas. Afaste-se.',
      'O templo está fechado para os que caminham na escuridão.',
      'A vontade do Senhor da Luz não incluiu sua presença aqui.',
      'Até as chamas recuam diante de sua sombra, {nome}.',
      'Seu nível {nivel} não significa nada diante do julgamento de Rh\'llor.',
      'Fui ordenado para guiar as almas. A sua está além do meu alcance.',
      'Em nome do Senhor da Luz, peço que se retire deste lugar.',
      'O fogo sagrado vacila quando você se aproxima. Sinal claro.',
      'Já rezei pela sua redenção. Mas Rh\'llor não respondeu.',
      'Afaste-se antes que a sombra que carrega apague a luz deste templo.',
      'Azor Ahai lutou contra a escuridão. Você a representa.',
      'O Rei da Noite teria melhor reputação em {cidade} do que você.',
      'Não há bênção suficiente para purificar o que fizeste.',
      'A chama da verdade mostra quem você realmente é. E não é bonito.',
      'Suas moedas não compram graça divina aqui.',
      'Prefiro enfrentar os Espectros do que sua presença aqui.',
      'A profecia do Príncipe Prometido não tem lugar para alguém assim.',
      'O fogo de Rh\'llor revela mentiras. E você está cheio delas.',
      'Saiba que suas ações reverberam além desta vida, {nome}.',
      'Vá fazer penitência antes de ousar entrar em meu templo.',
      'Até as sombras rejeitam algumas almas. Descubra onde se encaixa.'
    ],
    neutro: [
      'Paz, viajante. O fogo de Rh\'llor ilumina todos que buscam a luz.',
      'O Senhor da Luz vê todos os caminhos. Qual o seu, {nome}?',
      'Seja bem-vindo ao templo. Aqui o fogo nunca se apaga.',
      'A noite é escura e cheia de terrores — mas a luz de Rh\'llor é eterna.',
      'Toda alma tem um propósito. O fogo me mostrará o seu.',
      'Você veio em busca de bênção, cura ou resposta?',
      'O Inverno que se aproxima é mais do que neve, viajante.',
      'Rh\'llor me sussurrou nas chamas que alguém importante chegaria hoje.',
      'Nível {nivel} — você sobreviveu muito. A luz te guiou até aqui.',
      'Azor Ahai voltará quando a escuridão for mais densa. Esteja preparado.',
      'A profecia é clara: o príncipe prometido virá do fogo e sangue.',
      'O Rei da Noite avança, e somente a luz pode detê-lo.',
      'Em {cidade}, mantemos a chama acesa há gerações.',
      'Ofereça uma prece, viajante. O fogo ouve tudo.',
      'Vi nas chamas uma grande batalha. Você estará nela, {nome}?',
      'O sangue de dragão e o fogo de Rh\'llor andam juntos desde o início.',
      'Bênção ou informação? Posso oferecer ambas em nome do Senhor da Luz.',
      'Cada vida é uma chama. Cuide para que a sua não se apague.',
      'As sombras crescem além do Muro. Rh\'llor nos dará força.',
      'Venho de Asshai, terra de sombras. Sei reconhecer a escuridão.',
      'A guerra dos Cinco Reis foi prevista nas chamas muito antes.',
      'O fogo é o único deus verdadeiro. Os Sete são apenas estátuas de pedra.',
      'Todo aquele que serve à luz serve a uma causa maior que si mesmo.',
      'Posso ler o fogo por você, {nome}. O que deseja saber?',
      'A chama nunca mente, mas o homem nem sempre entende o que ela mostra.',
      'Há poder na sua trajetória, {nome}. O fogo me mostrou fragmentos.',
      'A noite longa voltará. Mas Rh\'llor prometeu que o amanhecer também.',
      'Cada ritual aqui tem um propósito além do que os olhos veem.',
      'Posso abençoar sua arma com o fogo sagrado, se desejar.',
      'Venha, sente-se perto da chama. Ouça o que ela tem a dizer.'
    ],
    amigo: [
      '{nome}! O fogo me mostrou sua chegada. Bem-vindo, servo da luz!',
      'Rh\'llor sorri para os que trilham o caminho certo. Como você, {nome}.',
      'Vi nas chamas que você voltaria. O fogo raramente erra.',
      'A luz de {cidade} brilha mais forte com sua presença, {nome}.',
      'Você é um dos escolhidos de Rh\'llor. Sinto isso nas chamas.',
      'Para os servos da luz, tenho bênçãos especiais reservadas.',
      'Sua jornada é parte da grande profecia, {nome}. Tenho certeza.',
      'Nível {nivel} — cada batalha sua é uma batalha pela luz.',
      'As chamas me mostraram grandes feitos em seu futuro, {nome}.',
      'Você poderia ser o Príncipe Prometido. Ou conhecê-lo.',
      'A noite é escura — mas sua chama, {nome}, ilumina o caminho.',
      'Rezo por você todas as noites. O fogo me diz que chega com segurança.',
      'Para um servo da luz como você, o templo está sempre aberto.',
      'O Rei da Noite teme pessoas como você, {nome}. E bem que deve.',
      'Cada sacrifício que fez pela luz foi visto e reconhecido por Rh\'llor.',
      'Tenho uma profecia registrada sobre alguém com seu nome. Interessante.',
      'O fogo purifica o ferro; as batalhas purificam os guerreiros. Você brilha.',
      '{nome}, sua fama em {cidade} chegou ao templo. Rh\'llor aprova.',
      'Posso abençoar sua arma com fogo sagrado. Para um amigo, de graça.',
      'Vi no fogo que você trará grande vitória para {cidade}. Logo.',
      'A profecia se cumpre através de almas como a sua, {nome}.',
      'Que a luz de Rh\'llor te guie em cada batalha que vier.',
      'Fique à vontade no templo, {nome}. É a sua segunda casa.',
      'O sangue de Azor Ahai corre nas veias de quem serve à luz. Talvez o seu.',
      'Em toda a minha vida de sacerdote, poucas almas me impressionaram tanto.',
      'Tenho um amuleto abençoado reservado especialmente para você.',
      'As chamas cantam quando você entra, {nome}. Sinal dos maiores.',
      'Rh\'llor me disse que sua chama jamais se apagará prematuramente.',
      'Você é a prova de que a luz sempre vence a escuridão, {nome}.',
      'Que o Senhor da Luz te guarde — e que eu possa continuar nessa jornada com você.'
    ]
  },

  // ══════════════════════════════════════════════════════
  // PATRULHEIRO DO PORTÃO DA MURALHA
  // ══════════════════════════════════════════════════════
  gate: {
    neutro: [
      // Nível < 20 — Impede passagem
      'Pare aí! O portão não está aberto para aventureiros verdes.',
      'Você parece novo demais para o que há além da Muralha.',
      'Nível {nivel}? Criança, volte quando tiver mais experiência.',
      'Além desse portão mora a morte. Volte quando for digno de enfrenta-la.',
      'A Muralha não é passeio de verão. Precisa provar valor primeiro.',
      'Guardas da Noite não deixam qualquer um passar. Não hoje.',
      'Você já enfrentou um Espectro? Não? Então não passa.',
      'O Rei da Noite está além. Você está pronto? Nível {nivel} diz que não.',
      'O frio além da Muralha mata mais rápido do que qualquer inimigo.',
      'Volte com mais batalhas nas costas, {nome}. Aí a conversa muda.',
      'Não ponho aventureiros iniciantes no caminho dos Caminhantes Brancos.',
      'A noite é escura e cheia de terrores, {nome}. E você ainda é verde.',
      'Para além desse portão, os mortos andam. Você está pronto para isso?',
      'Castle Black tem regras. Uma delas é não deixar fracos passarem.',
      'O Lorde Comandante não aprovaria deixar alguém de nível {nivel} passar.',
      'Meu dever é proteger os vivos. Isso inclui te impedir de suicidar.',
      'Volte depois de mais batalhas. Esse portão abrirá quando você merecer.',
      'Já vi homens experientes morrer além da Muralha. Você não chegaria longe.',
      'O Inverno está chegando. Você não está pronto para recebê-lo aí fora.',
      'Quando o Olho Corvos te aceitar, o portão abre. Por enquanto, não.'
    ],
    amigo: [
      // Nível >= 20 — Libera passagem
      'Guardas da Noite reconhecem um guerreiro de verdade. Pode passar, {nome}.',
      'Nível {nivel}. Você provou seu valor. O portão está aberto.',
      'Vejo cicatrizes de batalha em você. Merece atravessar a Muralha.',
      'Ouvi falar de {nome}. Seu nome é respeitado entre os Guardas da Noite.',
      'Passe com cuidado. O que há além da Muralha não perdoa erros.',
      'Um guerreiro do seu calibre pode enfrentar o que mora lá fora.',
      'O Lorde Comandante autorizou sua passagem. Seja rápido e cauteloso.',
      'Bem-vindo ao fim do mundo conhecido, {nome}. Cuidado com os mortos.',
      'Já vi menos preparados tentar o que você vai tentar. Poucos voltaram.',
      'O portão abre para os dignos. Você é digno, {nome}.',
      'Castle Black te saúda! Que a sua lâmina seja mais rápida do que o frio.',
      'Os Espectros respeitam só uma coisa: vidro de dragão e fogo. Tem algum?',
      'Seu nome já chegou aqui antes de você. Boa reputação abre muitos portões.',
      'Passe, {nome}. E que os Sete te guardem além da Muralha.',
      'Um guerreiro de verdade. Finalmente alguém digno de cruzar esse portão.',
      'O que há além é para os corajosos. Você claramente é um deles.',
      'Guarda a chave desse portão há anos. Raro ver quem a mereça. Você merece.',
      'Que o fogo de Rh\'llor te guie na escuridão além da Muralha, {nome}.',
      'Nível {nivel}? Impressionante. Você está pronto para o que vem.',
      'O portão da Muralha está aberto para você, {nome}. Honre esse privilégio.'
    ]
  }

};

// ══════════════════════════════════════════════════════
// Função que retorna uma frase aleatória formatada
// ══════════════════════════════════════════════════════

/**
 * Retorna uma frase de diálogo de NPC formatada.
 * @param {string} k     - Tipo de NPC: 'f', 'm', 'e', 'pr', 'gate'
 * @param {number} rp    - Reputação com a cidade (-100 a +100)
 * @param {string} nome  - Nome do personagem do jogador
 * @param {string} cidade - Nome da cidade atual
 * @param {number} nivel - Nível atual do personagem
 * @returns {string|null} Frase formatada ou null se NPC não encontrado
 */
function npcDialog(k, rp, nome, cidade, nivel) {
  var pool = DIALOGS[k];
  if (!pool) return null;

  var tier;
  if (k === 'gate') {
    // Patrulheiro usa nível em vez de reputação
    tier = (nivel >= 20) ? 'amigo' : 'neutro';
  } else {
    tier = (rp >= 30) ? 'amigo' : (rp < -10) ? 'hostil' : 'neutro';
  }

  var list = pool[tier] || pool['neutro'] || [];
  if (!list.length) return null;

  var raw = list[Math.floor(Math.random() * list.length)];
  return raw
    .replace(/{nome}/g, nome || 'viajante')
    .replace(/{cidade}/g, cidade || 'esta cidade')
    .replace(/{nivel}/g, nivel != null ? nivel : '?');
}
