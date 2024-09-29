// Login related
const loginDiv = document.querySelector(".login-container");

const loginForm = loginDiv.querySelector(".login-form");

//const loginButton = document.querySelector('.login__button');

const mainGameSection = document.querySelector("#main-game-section");
mainGameSection.style.display = "none";

const deckCodeNSelectSection = document.querySelector("#codigoESelecionar");

const interpretButton = document.getElementById("interpretButton");

const battlefield = document.querySelector("#battlefield");

// -----------------------------------------------

// Variáveis globais relacionadas ao jogador
let player = {
  ip: "",
  id: "",
  username: "",
};

// Avatar
let opponentAvatar = document.querySelector("#opponent-health");
let alliedAvatar = document.querySelector("#player-health");

/* let starterDeck = []; */
let currentDeck = [];

let deckCardCount = 0;
/* let handCardCount = 0; */

//let totalHealed = 0;

//pontuação
let playerMatchPoints = 0;
let opponentMatchPoints = 0;
let yourScoreboard = document.querySelector('#score-player1');
let opponentScoreboard = document.querySelector('#score-player2');

//turnos
let isAmplifierActive = false;
let specialPointsMultiplier;
let healthZone = "extra";
let opponentHealthZone = "extra";

// -----------------------------------------------

let cardsTextDescription = [
  {
    id: 1,
    description: `A Vagante Sombria
      9 de mana | 10/5
      (Obscuro | Corpo-a-Corpo | [Morto-Vivo] Espírito [Alma Penada] |) 
      *Indestrutível*
      “Custo (1) a menos para cada duas cartas aliadas destruídas ao longo desta partida.” 
      `,
  },
  {
    id: 2,
    description: `Elemental do Fogo 
      2 de mana | 2/2
      (Ígneo | Corpo-a-corpo | Elemental |)
      #Grito de Guerra: “invoco duas cópias de ‘Espírito Flamejante’ aliadas.”`,
  },

  {
    id: 3,
    description: `Espírito Flamejante 
      1 de mana | 1/1
      (Ígneo | Corpo-a-corpo | Elemental |) 
     *Queimar (1)*`,
  },
  {
    id: 4,
    description: function (cardElement) {
      return `Fulgurvoltz 
      ${cardElement.getAttribute("data-cost")} de mana | 8/11 
      (Elétrico | Corpo-a-corpo |Elemental | Corpo-a-Corpo |)
      “Custo (1) a menos para cada mana não gasta por você ao longo desta partida (Mín.4).” 
      #Grito de Guerra: “destruo todas as cartas não-elétricas com menos de 8 de ataque.”`;
    },
  },
  {
    id: 5,
    description: `Ivan Ignisar
      7 de mana | 7/6 
      (Ígneo | Corpo-a-corpo | Humano | Dragão [Dragão Primordial]) 
      *Intimidador*, *Velocidade (2)* 
      #Condicional: “quando eu causar dano e destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
      #Transformar: (1 turno para carregar) “se eu e/ou outra carta ígnea tivermos causado um total de 10+ de dano neste turno.”`,
  },
  {
    id: 6,
    description: `Ignisar transformado 
      7 de mana | 9/7
      (Ígneo | Corpo-a-corpo | Humano | Dragão [Dragão Primordial]) 
      *Intimidador*, *Voo*, *Velocidade (2)* 
      #Condicional: “quando eu atacar, ataco também à longa-distância causando dano em área, 6 ao alvo principal e 4 de respingo. Quando eu destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
      #Transformado: “destransformo no final do turno.”`,
  },

  {
    id: 7,
    description: `Jack 
      2 de mana | 2/2
      (Elétrico | Longa-distância | Humano | Nulifária |)
      *Paralisante* 
      #Grito de Guerra: “ganho +1/+1 se houver pelo menos uma unidade elétrica aliada no campo de batalha.” 
      #Condicional: “depois que eu ou uma unidade elétrica aliada causar dano, ganho +1/+1 e +1 de Velocidade [Máx.4].”`,
  },

  {
    id: 8,
    description: `Layla 
      5 de mana | 5/5
      (Elétrico| Longa-distância | Humano | Nulifária |) 
      #Grito de Guerra: “aplico *paralisia elétrica* a até duas cartas alvo.” 
      #Condicional: “sempre que uma carta do oponente for marcada com *paralisia elétrica*, causo metade do meu ataque (arredondado para cima) como dano *atravessante*.”
      #Final do Turno: “ataco sem sofrer dano todas as unidades paralisadas sobreviventes no final do turno.”`,
  },
  {
    id: 9,
    description: `Mali Magarc
      9 de mana | 6/7
      (Corpo-a-corpo | Humano | Dragão [Dragão Primordial] | Nulifária) 
      *Dano Mágico (+2)*, *Barreira Anti-Mágica*, *Velocidade (3)*
      #Constante: “nunca perco *barreira anti-mágica*.”
      #Condicional: “a cada dois feitiços lançados, ganho ‘+1 de *dano mágico*’.”
      #Transformar: (1 turno para carregar) “se eu tiver acumulado *dano mágico +5* ou superior.”`,
  },

  {
    id: 10,
    description: `Rusco 
      2 de mana | 2/2
      (Corpo-a-corpo | Fera | Humano |) 
      *Escudo* 
      #Condicional-#Fim do Turno: “se você jogou uma carta de custo, ataque ou vida igual a 2 neste turno e eu estiver no seu deck no fim do turno, invoque-me no seu campo de batalha.”`,
  },

  {
    id: 11,
    description: `Sabrina 
      4 de mana | 4/5
      (Aquático| Longa-distância | Humano | Aldeia do Rio |) 
      #Condicional: “quando eu causar ou sofrer dano de combate e a outra unidade sobreviver, em vez do dano de revide, a outra carta retorna para a mão do dono se você tiver alguma mana não gasta.”`,
  },

  {
    id: 12,
    description: `Thorwells 
      7 de mana | 8/6
      (Elétrico | Corpo-a-corpo | Celestial |) 
      #Grito de Guerra: “aplico *paralisia elétrica* a todas as cartas não-elétricas em jogo. Para cada uma que estiver paralisada, você ganha +1 mana máxima somente no próximo turno. Além disso, ataco todas que já estavam paralisadas antes do meu <#Grito de Guerra>.” #Constante: “não posso ter minha velocidade reduzida e nem ser afetado por Gritos de Guerra ou efeitos de dano inimigos.”`,
  },
  {
    id: 13,
    description: `Tony Raiturus 
      6 de mana | 5/6
      (Elétrico | Humano | Dragão [Dragão Primordial]) 
      #Constante: “não posso ser afetado por Gritos de Guerra ou efeitos de dano inimigos.” 
      #Condicional: “cada terceiro ataque meu é de <longa-distância> e causa 7 de dano <atravessante>.”`,
  },
  {
    id: 14,
    description: function (carta) {
      return `Voltexz 
       ${carta.currentCost} de mana | 10/7
      (Elétrico | Longa-Distância |) 
      “Custo (2) a menos para cada mana não gasta por você ao longo da partida. (Mín.2)” #Grito de Guerra: “causo 3 de dano a todas as cartas inimigas e concedo +1/+1 às suas outras cartas até o final do turno. Além disso, você pode gastar até 4 de mana adicional. Para cada mana gasta dessa forma, aprimore o efeito do meu grito de guerra. (Máx. 7 de dano e +5/+5).”`;
    },
  },
  {
    id: 15,
    description: `Necrófago Espectral
      1 de mana | 4/3 
      (Corpo-a-corpo | Fera | Morto-Vivo [Cadáver Reanimado] |) 
      #Grito de Guerra: “destruo uma carta aliada à sua escolha. Não posso ser jogado se o seu lado do campo de batalha estiver vazio.”`,
  },
  {
    id: 16,
    description: `O Revivente Eterno 
      2 de mana | 3/3
      (Corpo-a-corpo | Morto-Vivo |) 
      #Último Suspiro: “ressuscito no turno seguinte.”`,
  },
  {
    id: 17,
    description: `Replicador Maldito 
      2 de mana | 2/3
      (Corpo-a-corpo | ?? ) 
      #Último Suspiro: “invoco duas cópias minhas sem esta habilidade.”`,
  },
  {
    id: 18,
    description: `Fênix das Trevas Profana
      3 de mana 3/3
      (Corpo-a-corpo | Fera |) 
      *Voo*
      #Condicional: “eu sou destruído se você estiver ganhando a partida.” #Último Suspiro: “ressuscito no turno seguinte com +1/+1.”`,
  },
  {
    id: 19,
    description: `Titânico Morcegalma 
      4 mana | 5/3
      (Corpo-a-corpo | ?? |) 
      *Vínculo Curativo (50%)* 
      #Condicional: “sempre que uma carta aliada é destruída, causo 1 de dano a todas as cartas do oponente e 2 ao avatar dele.”`,
  },
  {
    id: 20,
    description: `O Espiritomante 
      5 de mana | 3/6
      (Longa-distância | Humano [Feiticeiro] |)  
      *Indestrutível*
      #Grito de Guerra: “torno uma carta aliada no campo de batalha <*indestrutível*> até o final do turno. 
      #Constante: “não posso ser jogado na linha de frente.”`,
  },
  {
    id: 21,
    description: `Jeff, The Death
      6 de mana | 2/2 
      (Obscuro | Entidade |) 
      #Constante: “tenho +2/+2 para cada carta aliada destruída ao longo desta partida.”
      #Condicional: “se eu fosse ser destruído, em vez disso, retorno à sua mão.”`,
  },
  {
    id: 22,
    description: `Cientista da Morte 
      3 de mana | 1/4 
      #Condicional: “sempre que uma carta aliada for destruída, invoco um cadáver reanimado 3/3.”`,
  },
  {
    id: 22,
    description: `Cadáver Reanimado
      3 de mana | 3/3 
      (Obscuro | Corpo-a-corpo | Morto-Vivo|)`,
  },
  {
    id: 23,
    description: `RaiEmofitir 
      6 de mana | 6/6 
      (Sagrado? | Obscuro? | Corpo-a-corpo |Celestial [Precursor] | Cidade Celestial | Terráver) 
      #Grito de Guerra: “destruo todas as cartas em ambos os campos de batalha. Este efeito não se ativa se você jogou alguma carta no último turno.”`,
  },
  {
    id: 24,
    description: function () {
      return `Fonte da Água da vida
          3 de mana | -/6 
          (Aquático | Paisagem |)
          #Grito de Guerra: “gero (3) de mana de estoque para você.” 
          #Condicional: “você pode ou não usar meu poder. Se usar, perco 1 de durabilidade e invoco um 'Elemental de Água Gigante' com atributos baseados no total de vida curado de suas cartas e avatar.” 
          #Início do turno: “curo 1 de vida de todos os aliados.”
          Condicional: “se eu tiver visto seu avatar e/ou suas cartas sendo curadas em um total de 38+ de vida, vença o jogo imediatamente. ({totalHealed}/36).”`;
    },
  },
  {
    id: 25,
    description: `Mente Destrutiva
    5 de mana | 2/5 
    (Longa-distância | Humano | Desarranjado |) 
    #Condicional: “você pode usar meu poder antes de cada combate. Se usar, eu sofro 1 de dano, causo 3 a todas as cartas e devolvo as que custam 3 ou menos às mãos dos donos. Se não usar, sofro 4 de dano. Se não usar por duas vezes consecutivas, destruo todas as cartas que custam 5 ou menos, causo 5 de dano a TODO MUNDO e não sofro dano.”`,
  },
  {
    id: 26,
    description: `Eletroad
    4 de mana | 3/6 (Elétrico | Corpo-a-corpo | Fera |) 
    #Constante: “gero (1) de mana adicional por turno enquanto você não estiver ganhando a partida.”
`,
  },
  {
    id: 27,
    name: "Sta. Helena Maria da Cura",
    description: `Sta. Helena Maria Da Cura 
  5 de mana | -/10 
  (Sagrada | Humano | Santo |)  
  *Benevolente* (não pode atacar), *Regeneração (100%)* 
  #Grito de Guerra: “curo 4 pontos de vida da carta aliada ferida com menos vida.” 
  Condicional: “em vez de eu atacar, escolha uma entre as cartas aliadas de menor vida; a carta escolhida não pode ter sua vida reduzida abaixo de 1 e nem ser destruída enquanto durar a fase de combate; quando esta acabar, restaure toda a vida da carta escolhida.”`,
  },
  {
    id: 28,
    name: "Engenheiro Louco",
    description: `Engenheiro Louco
  2 de mana | 1/3 
  (Gnomo | Corpo-a-Corpo)
  #Grito de Guerra: “os dois jogadores compram duas cartas.” `,
  },
  {
    id: 29,
    name: "D'Lorafya",
    description: `D’Lorafya, O Fulgor Inextinguível 
  6 de mana | 7/5
  (Ígneo | Celestial | Corpo-a-Corpo/Ranged?)  
  #Grito de Guerra: “causo 5 de dano a TODAS as outras cartas no campo de batalha. As cartas ígneas sofrem o dano pela metade (arredondado para baixo). Também aplico *queimadura (1)* a todas não-ígneas.” 
  Constante: “ataques de longa-distância, feitiços e efeitos ígneos não podem me ferir.”`,
  },
  {
    id: 30,
    name: "Kell",
    description: `Kell, Capitão Querubim 
  10 de mana | 5/5 
  (Anjo | Sagrado | Cidade Celestial | Corpo-a-Corpo)  
  *Voo* 
  #Grito de Guerra: “removo do jogo as 3 cartas não-sagradas mais caras do oponente.” 
  “Custo (1) a menos por cada carta sagrada aliada no campo de batalha.”`,
  },
  {
    id: 31,
    name: "Neraqa",
    description: `Neraqa 
  6 de mana | -/12 
  (Aquático | Celestial |)  
  *Benevolente (não pode atacar)*, *Invulnerável (dano de combate)* 
  #Grito de Guerra e #Início do Turno: “escolha um entre: 
  >Uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
  >Uma carta aliada à sua escolha ganha *proteção divina* até o fim do turno.  
  >Uma carta aliada à sua escolha é curada em 4 de vida.”`,
  },
  {
    id: 32,
    name: "Frasco Grande de Águas Curativas",
    description: `Frasco Grande de Águas Curativas
  (Feitiço [Imediato])
  “Escolha qualquer alvo para curar 7 de vida dele, se for o avatar, ele ganha 6 de vida.”`,
  },
  {
    id: 33,
    name: "Rejeição de Neraqa",
    description: `Rejeição de Neraqa 
  3 de mana  
  (Feitiço [Rápido]) 
  “Você canaliza a fúria do oceano tempestuoso de Neraqa, manifestando sua vontade como uma barreira anti-magia, ou , alternativamente arrancando o alvo do tecido da realidade para devolvê-lo ao domínio de seu dono.”
  “Escolha um entre: 
  >Contrafeitiço, a menos que o invocador pague (5); 
  >Anule a invocação de uma unidade de até 5 de custo, a menos que o invocador pague (3).”`,
  },
  {
    id: 34,
    name: "Leviatã",
    description: `Leviatã 
  8 de mana | 8/10 
  (Aquático | Fera | Corpo-a-Corpo ) 
  *Dano Excessivo*, *Intimidador* 
  #Constante: “as outras cartas aquáticas aliadas têm +1 de vida.”`,
  },
  {
    id: 35,
    name: "Alexa",
    description: `Alexa 
  4 de mana |3/10 
  (Aquático | Celestial | Longa-distância |)  
  *Invulnerável* , *Transformar* 
  #Grito de Guerra: “uma carta inimiga de sua escolha fica silenciada.” 
  #Início do Turno: “escolha entre uma carta aliada e seu avatar. A opção escolhida ganha 2 de vida.”`,
  },
  {
    id: 36,
    name: "Espírito Carregado",
    description: `Espírito Carregado 
  1 de mana | 1/1 
  (Elétrico | Elemental | Corpo-a-Corpo)  
  *Ataque Relâmpago* 
  “(Esta habilidade leva um turno para carregar) Antes de cada combate, você pode me sacrificar. Se fizer isso, escolha um entre: 
  • Causar 2 de dano a qualquer alvo de sua escolha.
  • Ganhar +2 de mana máxima somente no próximo turno. 
  • Conceder meus atributos e palavras-chave a um aliado elétrico (a *velocidade* não é somada).”`,
  },
  {
    id: 37,
    name: "Dilúvio",
    description: `Dilúvio 
  (Feitiço [Lento]) 
  “Começa a chover forte. No final do próximo turno, todas as unidades morrem afogadas, exceto as que têm *Voo* e as aquáticas não-humanas.”`,
  },
  {
    id: 38,
    name: "Fim das Sombras",
    description: `Fim das Sombras 
  3 de mana  
  (Sagrado | Feitiço [Lento]) 
  “Destrua 3 cartas obscuras aleatórias em ambos os campos de batalha.”`,
  },
  {
    id: 39,
    name: "Dragão Ancião do Trovão",
    description: `Dragão Ancião do Trovão 
  5 de mana | 7/4
  (Elétrico| Corpo-a-corpo | Dragão |)
  *Voo* 
  #Condicional: “sempre que eu atacar duas vezes, na terceira meu ataque é de longa-distância e causa 10 de dano a um slot ocupado (exceto o do avatar) e 6 de dano aos vizinhos adjacentes (isso tem *paralisante*).”`,
  },
  {
    id: 40,
    name: "Gigante Elétrico",
    description: `Gigante Elétrico 
  4 de mana | 8/7
  (Elétrico | Corpo-a-Corpo | Gigante | )  
  #Grito de Guerra: “aplico *paralisia elétrica* em uma carta do oponente à sua escolha e gero (1) de mana adicional somente neste turno.” 
  “Eu só posso ser jogado se um total de 3+ de mana adicional foi gerada em seu favor neste turno.”`,
  },
  {
    id: 41,
    name: "Afogar",
    description: `Afogar 
  3 de mana
  (Aquático | Feitiço [Rápido])
  “Escolha uma unidade humana ou não-aquática com até 5 de vida para destrui-la.”`,
  },
  {
    id: 42,
    name: "Tsunami",
    description: `Tsunami 
  4 de mana 
  (Aquático | Feitiço [Lento])
          __________________________________
"Como as ondas implacáveis do mar, o Tsunami letre tudo em seu caminho, devolvendo os intrusos ao abraço salgado das águas." 
          __________________________________
“Retorne todas as unidades inimigas para a mão do dono, exceto aquelas que tiverem *voo*.”`,
  },
  {
    id: 43,
    name: "Invocar a Escuridão",
    description: `Invocar a Escuridão 
  4 de mana 
  (Obscuro | Feitiço [Rápido]) 
  “A carta obscura aliada mais forte morta nesta partida é ressuscitada.”`,
  },
  {
    id: 44,
    name: "Últimas Palavras",
    description: `Últimas Palavras 
  4 de mana 
  (Obscuro | Feitiço [Imediato])
  “Concede o seguinte último suspiro a uma carta: ʽcauso dano ao avatar inimigo igual ao meu ataque.’”`,
  },
  {
    id: 45,
    name: "Renascimento Sombrio",
    description: `Renascimento Sombrio 
  3 de mana 
  (Obscuro | Feitiço [Imediato]) 
  “Uma carta obscura aliada à sua escolha é sacrificada para ressuscitar logo em seguida.”`,
  },
  {
    id: 46,
    name: "Velocidade do Relâmpago",
    description: `Velocidade do Relâmpago 
  5 de mana
  (Elétrico | Feitiço [Imediato] |) 
  “Conceda +2/+1 e *velocidade (4)* a uma carta aliada.”`,
  },
  {
    id: 47,
    name: "Armadura Faiscante",
    description: `Armadura Faiscante 
2 de mana
(Elétrico | Feitiço Imediato]) 
“Conceda +1/+1 e *paralisante* a uma carta aliada.”`,
  },
  {
    id: 48,
    name: "Campo de Batalha Tempestuoso",
    description: `Campo de Batalha Tempestuoso 
Paisagem 
2 de mana | 4 de Durabilidade
#Grito de Guerra: “gero (2) de mana de estoque para você.”  
#Início do Turno: “você ganha 1 de mana adicional. Uma carta aliada aleatória sofre 3 de dano; se for uma não-elétrica, ela recebe o dobro de dano. Eu perco 1 de durabilidade.”`,
  },
  {
    id: 49,
    name: "Arcanjo Uriel",
    description: `Arcanjo Uriel  
3 de mana | 2/5 
(Sagrado | Corpo-a-corpo | Anjo [Grande Arcanjo] |)  
*Voo*, *Vínculo Curativo (100%)* 
#Condicional: “uma vez por turno, a primeira carta aliada ferida que fosse morrer tem sua vida curada o suficiente para sobreviver, se possível.”`,
  },
  {
    id: 50,
    name: "O Tecnomante",
    description: `O Tecnomante
3 de mana |2/5 
(Humano [Ciborgue]| Circuitron | Longa-distância |)  
#Grito de Guerra: “você compra todas as cartas no seu deck que custam (10) ou mais; elas custam (1) a menos.”`,
  },
  {
    id: 51,
    name: "Torrente Azul",
    description: `Torrente Azul
6 de mana |5/5 
(Aquático | Corpo-a-corpo | Humano [mutante])  
#Condicional-#Fim do Turno: “se o oponente não tiver causado dano de combate ao seu avatar neste turno, todas as cartas dele retornam para a mão.”`,
  },
  {
    id: 52,
    name: "Lucien",
    description: `Lucien, O Portador da Luz Sagrada
4 de mana | 3/5
(Sagrado | Longa-distância | Humano [monge] |)
#Condicional: “nas duas primeiras vezes por turno que outra carta aliada curar algo, causo 9 de dano *atravessante* à carta obscura mais forte do oponente, se isso for o suficiente para destrui-la, remova-a do jogo em vez disso; se não houver cartas obscuras, causo 6 de dano *atravessante* à carta mais forte do oponente.”
#Fim do Turno: “uma carta é curada em 3 de vida e seu avatar, em 2.”`,
  },
  {
    id: 53,
    name: "Gigante Marinho",
    description: `Gigante Marinho 
4 de mana | 8/7 
(Aquático | Corpo-a-corpo | Gigante |)  
#Grito de Guerra: “seu avatar ganha 3 de vida.” 
“Só posso ser jogado se suas cartas tiverem curado um total de 5+ desde o último turno.”`,
  },
  {
    id: 54,
    name: "Elemental de Água Gigante",
    description: function () {
      return `Elemental de Água Gigante 
10 de mana | 0/1
(Aquático | Corpo-a-corpo | Elemental |)
“Se suas cartas tiverem curado 8+ de vida, eu custo (5).”#Constante: “eu tenho +1/+1 para cada 2 pontos de vida que suas cartas curaram (arredondado para cima) (Math.ceil(totalHealed / 2)}).”`;
    },
  },
  {
    id: 55,
    name: "Ronan",
    description: `Ronan 
3 de mana | 4/3 
(Ígneo | Corpo-a-corpo | Humano | Dragão [dragonóide]) 
*Regeneração (50%)* , *Intimidador* , *Transformar*
#Grito de Guerra: “se houver alguma unidade aliada ferida em jogo, posso ganhar +1/+0 até o fim do turno. 
#Condicional: “se algum dano reduzir minha vida abaixo da metade, ganho +1/+1 e *queimar (1)* 
#Transformar: (1 turno para carregar) “se eu tiver sobrevivido a dano neste turno.”`,
  },
  {
    id: 56,
    name: "Zarvok",
    description: `Marechal Zarvok Belthram
5 de mana | 5/5
(Ígneo | Corpo-a-corpo | Lagumverrano)
*Intimidador*
#Grito de Guera: “todos os inimigos são marcados com *queimadura (1)*, dentre eles, as cartas cujo valor de ataque + vida total for menor ou igual a 9 são marcadas com *frágil* e têm -2/-0 até o final do turno.” 
#Condicional: “quando eu for atacar uma carta, causo 1 de dano e aplico *queimadura (1)* e *frágil* a ela.”`,
  },
  {
    id: 57,
    name: "Gigante Flamejante",
    description: `Gigante Flamejante
4 de mana | 8/7
(Ígneo | Corpo-a-Corpo | Gigante | ) 
#Grito de Guerra: “causo 3 de dano a um alvo de sua escolha.”
“Eu só posso ser jogado se no final do último turno o oponente tinha menos que 12 de vida.”`,
  },
  {
    id: 58,
    name: "Piromante Ardente",
    description: `Piromante Ardente 
2 de mana | 3/2
(Ígneo | Longa-distância | Humano [Mago] |)
*Queimar*
#Grito de Guerra: “causo 1 de dano a até dois alvos diferentes de sua escolha (não aplica queimadura).”`,
  },
  {
    id: 59,
    name: "Avatar do Fogo",
    description: `Avatar do Fogo
5 de mana | 5/4
(Ígneo| Longa-distância | Avatar |)
*Voo*
#Grito de Guerra: “causo 3 de dano a uma carta inimiga de sua escolha e às adjacentes a ela.”
#Condicional: “sempre que outra carta ígnea causar dano, ganho +1/+0 até o final do turno.”`,
  },
  {
    id: 60,
    name: "Irina Lança-Chamas",
    description: `Irina Lança-Chamas 
4 de mana | 5/4 
(Ígneo | Longa-distância | Humano [mutante] | )
#Grito de Guerra: “causo 5 de dano a um alvo de sua escolha, 2 a mim mesma e 1 às cartas adjacentes a mim.”`,
  },
  {
    id: 61,
    name: "Esther",
    description: `Esther
2 de mana | 2/2
(Ígneo | Longa-distância | Humano | Dragão [dragonóide] |) 
#Grito de Guerra e #Início do turno: ”escolha um dos seguintes modos:
• Modo Chama Agressiva -> eu ganho +1/+0 e *Queimar (2)* até o final da rodada. 
• Modo Eclipse Estratégico -> eu ganho +0/+1 e *regeneração (100%)* até o final da rodada.”`,
  },
  {
    id: 62,
    name: "Brutamontes Chocante",
    description: `Brutamontes Chocante
8 de mana | 7/7
(Elétrico | Corpo-a-corpo| Humano |) 
*Paralisante*
#Grito de Guerra: “escolha um slot ocupado até três vezes (o mesmo ou outro). Eu causo 4 de dano *atravessante* ao(s) slot(s) escolhido(s).”`,
  },
  {
    id: 63,
    name: "Eletrocaçadora Vesper",
    description: `Eletrocaçadora Vesper 
6 de mana | 7/5
(Elétrico | Longa-distância | Humano |) 
#Condicional: “a primeira vez por turno que uma carta com velocidade inferior à minha me atacar, eu esquivo o dano (causo o dano de revide normalmente).”`,
  },
  {
    id: 64,
    name: "Dragãozinho Flamejante",
    description: `Dragãozinho Flamejante
1 de mana | 2/2
(Ígneo | Corpo-a-corpo | Dragão |) 
#Grito de Guerra: “causo 1 de dano a qualquer alvo e aplico *queimadura (1)* a ele.”
#Condicional: “cada segundo ataque meu é de *longa-distância*.”`,
  },
  {
    id: 65,
    name: "David-The-Titanslayer",
    description: `David, The Titanslayer
4 de mana | 6/3
(Neutro| Corpo-a-corpo | Humano |) 
#Grito de Guerra: “destruo até três cartas inimigas com ataque maior ou igual a 8.”`,
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    description: `Diabrete Sombrio
1 de mana | 2/1
(Obscuro | Corpo-a-corpo | Lagumverrano [Diabrete] |) 
#Condicional: “sempre que uma carta aliada destruir outra, você compra uma carta.”`,
  },
  {
    id: 67,
    name: "Agonox",
    description: `Agonox, Soberano da Dor
5 de mana | 4/5
(Obscuro| Corpo-a-corpo | ?? |) 
*Intimidador*, *Provocar*
#Condicional:
• “Quando eu for atacar, sacrifique uma carta ou cause 3 de dano a mim para destruir até duas cartas inimigas.”
• “Destrua qualquer carta que me causar dano de combate.”
#Último Suspiro: ”destrua a carta mais forte do  oponente.”`,
  },
  {
    id: 68,
    name: "Diabrete Elétrico",
    description: `Diabrete Elétrico
1 de mana | 2/1
(Elétrico | Corpo-a-corpo | Lagumverrano [Diabrete] |) 
#Grito de Guerra (#Condicional): “se houver uma carta elétrica aliada no campo de batalha, ganho +2 de ‘Velocidade’.”
#Início do turno: “se sua carta de maior velocidade no campo de batalha tiver velocidade superior à de maior velocidade do oponente, gero (1) de mana adicional somente neste turno.”`,
  },
  {
    id: 69,
    name: "Oráculo das Marés",
    description: `Oráculo das Marés
2 de mana | -/4
(Aquático| ?? |) 
*Benevolente*
#Grito de Guerra: “olhe as três cartas no topo do seu deck. Se você revelar uma delas, adicione-a à sua mão, depois, o deck é embaralhado.”
#Condicional: “na primeira vez por turno que uma carta aliada curar qualquer coisa,  você compra uma carta.”`,
  },
  {
    id: 70,
    name: "Thalassor",
    description: `Thalassor, Rei das Sereias do 3o Mar
7 de mana | 7/9
(Aquático | Tritão | Corpo-a-Corpo )
“Se você tiver pelo menos três outras cartas aquáticas aliadas (sereias e tritões valem por dois), eu custo (4) a menos.”
#Constante: “as outras cartas aquáticas aliadas têm +1/+2.”`,
  },
  {
    id: 71,
    name: "Odon, Mestre dsa Armas",
    description: `Odon, Mestre das Armas
4 de mana |4/4
(Neutro | Corpo-a-corpo | Anão |) 
#Grito de Guerra: “escolha um entre:
• Conceder +4+/2 a uma carta aliada.
• Conceder *provocar* e +0/+2 a uma carta aliada.
• Conceder *esquiva* a uma carta aliada.
”`,
  },
  {
    id: 72,
    name: "Sengoku",
    description: `Sengoku Valkai
7 de mana | 7/7
(Neutro | Humano | Dragão [Dragão Primordial])
*Intimidador*, *Regeneração (50%)*
*Velocidade (3)*
#Transformar: (1 turno para carregar) “se eu e/ou outro dragão aliado tivermos sobrevivido a um total de 10+ de dano.”`,
  },
  {
    id: 73,
    name: "Drake Damian",
    description: `Drake Damian
  3 de mana | 2/2
  (Neutro | Corpo-a-corpo | Humano |) 
  *Velocidade (4)*
  #Constante: “suas cartas de maior velocidade têm *esquiva* permanentemente e golpeiam duas vezes seguidas. Minha *esquiva* não tem restrições e vale para qualquer coisa.”
  “Antes do turno 5, não posso ser jogado na linha de frente.”`,
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    description: `Emissário da Água da Vida
  3 de mana |3/4
  (Aquático| Longa-distância | ??) 
  #Grito de Guerra: “distribua como quiser até 4 pontos de cura entre cartas aliadas.”`,
  },
];

/* const playEffectsCards = [
  {
    id: 2,
    name: "Elemental do Fogo",
    playEffect: (elementalSlotNumber) => {
      console.log("Grito de Guerra do Elemental do Fogo ativado.");
      console.log(`elementalSlotNumber = ${elementalSlotNumber}`);

      for (let i = 1; i <= 2; i++) {
        const espiritoData = cards.find(({ id }) => id === 3); // Encontrar os dados da carta do Espírito

        if (!espiritoData) {
          console.error(`Dados não encontrados para a carta de id 3`);
          return;
        }

        const cardContainer = createCardElement(espiritoData); // Criar o elemento HTML da carta
        if (!cardContainer) {
          console.error("Erro: cardContainer não pôde ser criado.");
          return;
        }

        const espiritoSlotNumber = Number(Number(elementalSlotNumber) + i); // Um slot à direita do Elemental
        if (espiritoSlotNumber < 1 || espiritoSlotNumber > 6) {
          console.warn(
            `Número do slot (${espiritoSlotNumber}) fora dos limites permitidos.`
          );
          continue;
        }

        const espiritoSlot = document.getElementById(
          `slot${espiritoSlotNumber}`
        );
        if (espiritoSlot) {
          console.log(`Invocando Espírito no slot ${espiritoSlotNumber}.`);
          summonCardRequest(cardContainer, espiritoSlot); // Chamar a função de invocação da carta
        } else {
          console.error(
            `Erro: Slot de número ${espiritoSlotNumber} não encontrado.`
          );
        }
      }
    },
  },
  {
    id: 10,
    name: "Rusco",
    //target: 'self',
    playEffect: function (playedCard) {
      let cardContainer = playedCard.closest(".card-container");
      let shield = document.createElement("img");
      shield.src = "other-images/shield.png";
      shield.className = "shield";
      shield.style.width = "100%";
      cardContainer.classList.add("shielded-card");
      cardContainer.appendChild(shield, cardContainer.firstChild);
    },
  },
  {
    id: 12,
    name: "Thorwells",
    //target: 'self',
    playEffect: function () {
      let number = Number(
        prompt("Quantas cartas do oponente estão paralisadas agora?")
      );
      let nextTurnEffect = () => {
        addMana(number);
      };
      let message = {
        type: "nextTurnEffect",
        data: "", // completar
      };
      sendMessageToServer;
    },
  },
  {
    id: 14,
    name: "Voltexz",
    // target: 'self',
    playEffect: (voltexzCardContainer) => {
      // console.log('Efeito de grito de guerra ativado para Voltexz');
      let extraManaSpent = Number(
        prompt(
          "Você pode gastar até 4 de mana adicional, para cada mana gasta dessa forma, aprimore meu grito de guerra (Máx. 7 de dano e +5/+5 para as suas outras cartas)."
        )
      );
      console.log(`Mana extra gasta: ${extraManaSpent}`);

      if (!extraManaSpent) {
        extraManaSpent = 0;
      } else if (extraManaSpent > mana) {
        console.error("Você não possui mana suficiente.");
        alert("Você não possui mana suficiente.");
        extraManaSpent = 0;
      }

      spendMana(extraManaSpent);

      let slotsDamaged = [7, 8, 9, 10, 11, 12];
      let damage = 3 + extraManaSpent;
      console.log(`Dano calculado: ${damage}`);

      for (let i = 0; i < slotsDamaged.length; i++) {
        directDamageRequest(damage, slotsDamaged[i]);
      }

      if (!voltexzCardContainer) {
        console.error("Carta Voltexz não encontrada no DOM.");
        return;
      }

      // Encontra o slot onde a carta Voltexz está localizada
      let voltexzSlot = voltexzCardContainer.closest(".slots");
      if (!voltexzSlot) {
        console.error("Slot da carta Voltexz não encontrado.");
        return;
      }

      // Coleta todos os slots aliados
      let alliedSlots = document.querySelectorAll(
        "#slot1, #slot2, #slot3, #slot4, #slot5, #slot6"
      );

      // Remove o slot onde a Voltexz está localizada da lista de slots buffados
      let slotsBuffed = Array.from(alliedSlots)
        .filter((slot) => slot !== voltexzSlot) // Remove o próprio slot
        .filter((slot) => slot.querySelector(".carta")) // Apenas slots que contêm uma carta
        .map((slot) => {
          let slotId = slot.id; // 'slot1', 'slot2', etc.
          if (slotId) {
            return parseInt(slotId.replace("slot", ""), 10); // Coleta o número do slot
          }
          console.error("Slot sem ID encontrado:", slot);
          return null;
        })
        .filter((slotNumber) => slotNumber !== null); // Remove valores nulos

      // Define o buff de ataque e saúde
      let attackBuff = 1 + extraManaSpent;
      let healthBuff = 1 + extraManaSpent;

      // Chama a função de buff com os slots restantes
      buffRequest(slotsBuffed, attackBuff, healthBuff);
    },
  },

  {
    id: 26,
    name: "Eletroad",
    //target: 'self',
    playEffect: function () {
      playerMatchPoints <= opponentMatchPoints ? addMana(1) : "";
    },
  },
  {
    id: 28,
    name: "Engenheiro Louco",
    //target: 'self',
    playEffect: function () {
      drawCard(2);
      drawForTheOpponent(2);
    },
  },
  {
    id: 29,
    name: "D'Lorafya",
    //target: 'opponent',
    playEffect: function () {
      toDamageAnEnemy([1, 2, 3, 4, 5, 6, 7], 5);
    },
  },
  {
    id: 31,
    name: "Neraqa",
    //target: 'self',
    playEffect: function () {
      let choice = Number(
        prompt(`Escolha um:
        1.uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
        2.uma carta aliada à sua escolha ganha *proteção divina* até o fim do turno. 
        3.uma carta aliada à sua escolha é curada em 4 de vida.
        `)
      );
      if (choice === 1) {
        console.log(
          "Lógica para silenciar uma carta e, se for do oponente, também retorná-la para a mão."
        );
      } else if (choice === 2) {
        console.log(
          "Lógica para conceder proteção divina a uma carta aliada até o fim do turno."
        );
      } else if (choice === 3) {
        let alliedSlots = document.querySelectorAll(
          "#slot1, #slot2, #slot3, #slot4, #slot5, #slot6"
        );
        // Verifica se algum slot contém uma carta aliada
        let hasAlliedCard = Array.from(alliedSlots).some((slot) => {
          return slot.querySelector(".carta") !== null;
        });

        if (!hasAlliedCard) {
          console.error("Nenhum slot contém uma carta aliada.");
          return; // Encerra a função se não houver cartas aliadas
        }

        const promptUser = () => {
          // Solicita ao usuário que escolha uma opção
          let choice = Number(
            prompt(`Escolha um:
            1. Uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
            2. Uma carta aliada à sua escolha ganha *proteção divina* até o fim do turno.
            3. Uma carta aliada à sua escolha é curada em 4 de vida.
            `)
          );

          // Processa a escolha do usuário
          if (choice === 1) {
            console.log(
              "Lógica para silenciar uma carta e, se for do oponente, também retorná-la para a mão."
            );
          } else if (choice === 2) {
            console.log(
              "Lógica para conceder proteção divina a uma carta aliada até o fim do turno."
            );
          } else if (choice === 3) {
            // Solicita o slot para curar 4 de vida
            let slotNumber = Number(
              prompt("Escolha um slot ocupado para curar 4 de vida.")
            );
            if (slotNumber >= 1 && slotNumber <= 6) {
              let slot = document.querySelector(`#slot${slotNumber}`);
              if (slot) {
                let isSlotOccupied = slot.querySelector(".carta");
                if (isSlotOccupied) {
                  let slot = isSlotOccupied.closest(".slots");
                  healRequest(4, slot);
                } else {
                  console.error(
                    `O slot escolhido não possui uma carta. Por favor, escolha um slot válido e ocupado.`
                  );
                  if (confirm("Deseja tentar novamente?")) {
                    promptUser(); // Repetir a função
                  } else {
                    console.log("Efeito cancelado.");
                  }
                }
              } else {
                console.error(
                  `Slot não encontrado para o slotNumber: ${slotNumber}`
                );
                if (confirm("Deseja tentar novamente?")) {
                  promptUser(); // Repetir a função
                } else {
                  console.log("Efeito cancelado.");
                }
              }
            } else {
              console.error("Por favor, escolha um slot válido.");
              if (confirm("Deseja tentar novamente?")) {
                promptUser(); // Repetir a função
              } else {
                console.log("Efeito cancelado.");
              }
            }
          } else {
            console.error("Escolha inválida. Por favor, tente novamente.");
            if (confirm("Deseja tentar novamente?")) {
              promptUser(); // Repetir a função
            } else {
              console.log("Efeito cancelado.");
            }
          }
        };

        // Inicializa a função
        promptUser();
      }
    },
  },

  {
    id: 35,
    name: "Alexa",
    //target: 'self',
    playEffect: function () {
      //console.log("Nada.");
    },
  },

  {
    id: 50,
    name: "O Tecnomante",
    //target: 'self',
    playEffect: function () {
      const tenOrAboveCostCards = currentDeck.filter((c) => c.baseCost >= 10);

      // Remover essas cartas de currentDeck
      currentDeck = currentDeck.filter((c) => c.baseCost < 10);

      // Reduzir os custos em 1 para todas as cartas com cost >= 10
      tenOrAboveCostCards.forEach((c) => {
        c.cost = c.cost - 1;
      });

      // Chamar as compras de carta
      drawSpecificCards(tenOrAboveCostCards);

      return currentDeck; // retornar o deck atualizado
    },
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    //target: 'self',
    playEffect: function () {
      let amount;
      for (let i = 0; i < 4; i += amount) {
        let slotNumber = Number(prompt("Escolha um slot ocupado para curar."));
        amount = Number(
          prompt(`Escolha uma quantidade para curar (Faltam ${4 - i})`)
        );
        healUnit(slotNumber, amount);
      }
    },
  },
]; */

const cards = [
  {
    id: 1,
    name: "A Vagante Sombria",
    baseCost: 10,
    image: "../frontend/assets/cartas/obscura/A Vagante Sombria.png",
    baseAttack: 10,
    baseHealth: 5,
    speed: 1,
    keywords: [
      "último suspiro",
      "obscuro",
      "morto-vivo",
      "constante",
      "corpo-a-corpo",
    ],
  },
  {
    id: 2,
    name: "Elemental do Fogo",
    baseCost: 2,
    image: "../frontend/assets/cartas/ignea/Elemental do Fogo.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["grito de guerra", "ígneo", "elemental", "corpo-a-corpo"],
  },
  {
    id: 3,
    name: "Espírito Flamejante",
    baseCost: 1,
    image: "../frontend/assets/cartas/ignea/Espírito Flamejante.png",
    baseAttack: 1,
    baseHealth: 1,
    speed: 1,
    keywords: ["ígneo", "constante", "corpo-a-corpo"],
  },
  {
    id: 4,
    name: "Fulgurvoltz",
    baseCost: 13,
    image: "../frontend/assets/cartas/eletrica/Fulgurvoltz.png",
    baseAttack: 10,
    baseHealth: 8,
    speed: 2,
    keywords: ["elétrico", "grito de guerra", "corpo-a-corpo", "elemental"],
  },
  {
    id: 5,
    name: "Ivan Ignisar",
    baseCost: 7,
    image: "../frontend/assets/cartas/ignea/Ivan Ignisar.png",
    baseAttack: 7,
    baseHealth: 6,
    speed: 2,
    keywords: [
      "ígneo",
      "humano",
      "dragão",
      "dragão primordial",
      "transformar",
      "condicional",
    ],
  },
  {
    id: 6,
    name: "Ignisar transformado",
    baseCost: 7,
    image: "../frontend/assets/cartas/ignea/Ignisar transformado.png",
    baseAttack: 9,
    baseHealth: 7,
    speed: 2,
    keywords: [
      "ígneo",
      "humano",
      "dragão",
      "dragão primordial",
      "transformado",
      "condicional",
    ],
  },
  {
    id: 7,
    name: "Jack",
    baseCost: 2,
    image: "../frontend/assets/cartas/eletrica/Jack.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 8,
    name: "Layla",
    baseCost: 5,
    image: "../frontend/assets/cartas/eletrica/Layla.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 2,
    keywords: [
      "elétrico",
      "grito de guerra",
      "condicional",
      "final do turno",
      "longa-distância",
      "humano",
    ],
  },
  {
    id: 9,
    name: "Mali Magarc",
    baseCost: 9,
    image: "../frontend/assets/cartas/neutra/Mali Magarc.png",
    baseAttack: 6,
    baseHealth: 7,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 9000,
    name: "Mali transformado",
    baseCost: 9,
    image: "../frontend/assets/cartas/neutra/Mali transformado.png",
    baseAttack: 8,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 10,
    name: "Rusco",
    baseCost: 2,
    image: "../frontend/assets/cartas/neutra/Rusco.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 11,
    name: "Sabrina",
    baseCost: 4,
    image: "../frontend/assets/cartas/aquatica/Sabrina.png",
    baseAttack: 4,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 12,
    name: "Thorwells",
    baseCost: 7,
    image: "../frontend/assets/cartas/eletrica/Thorwells.png",
    baseAttack: 8,
    baseHealth: 6,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 13,
    name: "Tony Raiturus",
    baseCost: 6,
    image: "../frontend/assets/cartas/eletrica/Tony Raiturus.png",
    baseAttack: 5,
    baseHealth: 6,
    speed: 1,
    keywords: [
      "elétrico",
      "humano",
      "dragão",
      "dragão primordial",
      "corpo-a-corpo",
      "constante",
      "condicional",
    ],
  },
  {
    id: 14,
    name: "Voltexz",
    baseCost: 20,
    image: "../frontend/assets/cartas/eletrica/Voltexz.png",
    baseAttack: 10,
    baseHealth: 7,
    speed: 1,
    keywords: ["grito de guerra", "elétrico", "longa distância"],
  },
  {
    id: 15,
    name: "Necrófago Espectral",
    baseCost: 1,
    image: "../frontend/assets/cartas/obscura/Necrófago Espectral.png",
    baseAttack: 4,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 16,
    name: "O Revivente Eterno",
    baseCost: 2,
    image: "../frontend/assets/cartas/obscura/O Revivente Eterno.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 17,
    name: "Replicador Maldito",
    baseCost: 2,
    image: "../frontend/assets/cartas/obscura/Replicador Maldito.png",
    baseAttack: 2,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 18,
    name: "Fênix das Trevas Profana",
    baseCost: 3,
    image: "../frontend/assets/cartas/obscura/Fênix das Trevas Profana.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 19,
    name: "Titânico Morcegalma",
    baseCost: 4,
    image: "../frontend/assets/cartas/obscura/Titânico Morcegalma.png",
    baseAttack: 5,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 20,
    name: "O Espiritomante",
    baseCost: 5,
    image: "../frontend/assets/cartas/obscura/O Espiritomante.png",
    baseAttack: 3,
    baseHealth: 6,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 21,
    name: "Jeff-The-Death",
    baseCost: 6,
    image: "../frontend/assets/cartas/obscura/Jeff-The-Death.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 22,
    name: "Cientista da Morte",
    baseCost: 3,
    image: "../frontend/assets/cartas/obscura/Cientista da Morte.png",
    baseAttack: 1,
    baseHealth: 4,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 22000,
    name: "Cadáver Reanimado",
    baseCost: 3,
    image: "../frontend/assets/cartas/obscura/Cadáver Reanimado.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 23,
    name: "Rai'Emofitir",
    baseCost: 8,
    image: "../frontend/assets/cartas/obscura/Rai'Emofitir.png",
    baseAttack: 6,
    baseHealth: 6,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  //{id: 24, name: "Fonte-Da-Vida", baseCost: 3, image: "../frontend/assets/cartas/Fonte-Da-Vida.png", baseAttack: 0, baseHealth: 6},
  {
    id: 25,
    name: "Mente Destrutiva",
    baseCost: 5,
    image: "../frontend/assets/cartas/neutra/Mente Destrutiva.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 26,
    name: "Eletroad",
    baseCost: 4,
    image: "../frontend/assets/cartas/eletrica/Eletroad.png",
    baseAttack: 3,
    baseHealth: 6,
    speed: 1,
    keywords: [
      "elétrico",
      "corpo-a-corpo",
      "fera",
      "grito de guerra",
      "início do turno",
    ],
  },
  {
    id: 27,
    name: "Sta. Helena Maria da Cura",
    baseCost: 6,
    image: "../frontend/assets/cartas/sagrada/Sta. Helena Maria da Cura.png",
    baseAttack: 0,
    baseHealth: 10,
    speed: 1,
    keywords: [
      "sagrado, humano, santo, benevolente, grito de guerra, condicional, regeneraçã",
    ],
  },
  {
    id: 28,
    name: "Engenheiro Louco",
    baseCost: 2,
    image: "../frontend/assets/cartas/neutra/Engenheiro Louco.png",
    baseAttack: 1,
    baseHealth: 3,
    speed: 1,
    keywords: ["neutro", "grito de guerra", "corpo-a-corpo"],
  },
  {
    id: 29,
    name: "D'Lorafya",
    baseCost: 6,
    image: "../frontend/assets/cartas/ignea/D'Lorafya.png",
    baseAttack: 7,
    baseHealth: 5,
    speed: 1,
    keywords: ["ígneo", "grito de guerra", "longa-distância"],
  },
  {
    id: 30,
    name: "Kell",
    baseCost: 10,
    image: "../frontend/assets/cartas/sagrada/Kell.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 31,
    name: "Neraqa",
    baseCost: 6,
    image: "../frontend/assets/cartas/aquatica/Neraqa.png",
    baseAttack: 0,
    baseHealth: 12,
    speed: 1,
    keywords: [
      "grito de guerra",
      "aquático",
      "benevolente",
      "celestial",
      "invulnerável",
    ],
  },
  //{id: 32, name: "Frasco Grande de Águas Curativas", baseCost: 2, image: "../frontend/assets/cartas/Frasco Grande de Águas Curativas.png",},
  //{id: 33, name: "Rejeição de Neraqa", baseCost: 3, image: "../frontend/assets/cartas/Rejeição de Neraqa.png",},
  {
    id: 34,
    name: "Leviatã",
    baseCost: 8,
    image: "../frontend/assets/cartas/aquatica/Leviatã.png",
    baseAttack: 8,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 35,
    name: "Alexa",
    baseCost: 4,
    image: "../frontend/assets/cartas/aquatica/Alexa.png",
    baseAttack: 3,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 36,
    name: "Espírito Carregado",
    baseCost: 1,
    image: "../frontend/assets/cartas/eletrica/Espírito Carregado.png",
    baseAttack: 1,
    baseHealth: 1,
    speed: 3,
    keywords: [
      "elétrico",
      "elemental",
      "corpo-a-corpo",
      "ataque relâmpago",
      "grito de guerra",
    ],
  },
  //{id: 37, name: "Dilúvio", baseCost: 2, image: "../frontend/assets/cartas/Dilúvio.png"},
  //{id: 38, name: "Fim das Sombras", baseCost: 3, image: "../frontend/assets/cartas/Fim das Sombras.png"},
  {
    id: 39,
    name: "Dragão Ancião do Trovão",
    baseCost: 5,
    image: "../frontend/assets/cartas/eletrica/Dragão Ancião do Trovão.png",
    baseAttack: 7,
    baseHealth: 4,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 40,
    name: "Gigante Elétrico",
    baseCost: 5,
    image: "../frontend/assets/cartas/eletrica/Gigante Elétrico.png",
    baseAttack: 9,
    baseHealth: 8,
    speed: 2,
    keywords: ["elétrico", "corpo-a-corpo", "gigante", "grito de guerra"],
  },
  //{id: 41, name: "Afogar", baseCost: 3, image: "../frontend/assets/cartas/Afogar.png"},
  //{id: 42, name: "Tsunami", baseCost: 4, image: "../frontend/assets/cartas/Tsunami.png"},
  //{id: 43, name: "Invocar a Escuridão", baseCost: 4, image: "../frontend/assets/cartas/Invocar a Escuridão.png"},
  //{id: 44, name: "Últimas Palavras", baseCost: 4, image: "../frontend/assets/cartas/Últimas Palavras.png"},
  //{id: 45, name: "Renascimento Sombrio", baseCost: 3, image: "../frontend/assets/cartas/Renascimento Sombrio.png" },
  //{id: 46, name: "Velocidade do Relâmpago", baseCost: 5, image: "../frontend/assets/cartas/Velocidade do Relâmpago.png"},
  //{id: 47, name: "Armadura Faiscante", baseCost: 2, image: "../frontend/assets/cartas/Armadura Faiscante.png"},
  // {id: 48, name: "Campo de Batalha Tempestuoso", baseCost: 2, image: "../frontend/assets/cartas/Campo de Batalha Tempestuoso.png"},
  {
    id: 49,
    name: "Arcanjo Uriel",
    baseCost: 3,
    image: "../frontend/assets/cartas/sagrada/Arcanjo Uriel.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 1,
    keywords: [
      "sagrado",
      "voo",
      "anjo",
      "arcanjo",
      "celestial",
      "corpo-a-corpo",
      "vínculo curativo",
      "condicional",
    ],
  },
  {
    id: 50,
    name: "O Tecnomante",
    baseCost: 3,
    image: "../frontend/assets/cartas/neutra/O Tecnomante.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 1,
    keywords: ["grito de guerra", "neutro", "longa-distância", "circuitrônico"],
  },
  {
    id: 51,
    name: "Torrente Azul",
    baseCost: 6,
    image: "../frontend/assets/cartas/aquatica/Torrente Azul.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 52,
    name: "Lucien",
    baseCost: 6,
    image: "../frontend/assets/cartas/sagrada/Lucien.png",
    baseAttack: 3,
    baseHealth: 5,
    speed: 1,
    keywords: [
      "sagrado, longa-distância, humano, monge, condicional, fim do turno",
    ],
  },
  {
    id: 53,
    name: "Gigante Marinho",
    baseCost: 4,
    image: "../frontend/assets/cartas/aquatica/Gigante Marinho.png",
    baseAttack: 8,
    baseHealth: 7,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 54,
    name: "Elemental de Água Gigante",
    baseCost: 10,
    image: "../frontend/assets/cartas/aquatica/Elemental de Água Gigante.png",
    baseAttack: 0,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55,
    name: "Ronan",
    baseCost: 3,
    image: "../frontend/assets/cartas/ignea/Ronan.png",
    baseAttack: 4,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55000,
    name: "Ronan transformado",
    baseCost: 3,
    image: "../frontend/assets/cartas/modo-truco/Ronan transformado.png",
    baseAttack: 6,
    baseHealth: 4,
  },
  {
    id: 56,
    name: "Zarvok",
    baseCost: 5,
    image: "../frontend/assets/cartas/ignea/Zarvok.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 57,
    name: "Gigante Flamejante",
    baseCost: 4,
    image: "../frontend/assets/cartas/ignea/Gigante Flamejante.png",
    baseAttack: 8,
    baseHealth: 7,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 58,
    name: "Piromante Ardente",
    baseCost: 2,
    image: "../frontend/assets/cartas/ignea/Piromante Ardente.png",
    baseAttack: 3,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 59,
    name: "Avatar do Fogo",
    baseCost: 5,
    image: "../frontend/assets/cartas/ignea/Avatar do Fogo.png",
    baseAttack: 5,
    baseHealth: 4,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 60,
    name: "Irina Lança-Chamas",
    baseCost: 4,
    image: "../frontend/assets/cartas/ignea/Irina Lança-Chamas.png",
    baseAttack: 5,
    baseHealth: 4,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 61,
    name: "Esther",
    baseCost: 2,
    image: "../frontend/assets/cartas/ignea/Esther.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 62,
    name: "Brutamontes Chocante",
    baseCost: 8,
    image: "../frontend/assets/cartas/eletrica/Brutamontes Chocante.png",
    baseAttack: 7,
    baseHealth: 7,
    speed: 1,
    keywords: [
      "elétrico",
      "corpo-a-corpo",
      "humano",
      "paralisante",
      "grito de guerra",
    ],
  },
  {
    id: 63,
    name: "Eletrocaçadora Vesper",
    baseCost: 6,
    image: "../frontend/assets/cartas/eletrica/Eletrocaçadora Vesper.png",
    baseAttack: 7,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 64,
    name: "Dragãozinho Flamejante",
    baseCost: 1,
    image: "../frontend/assets/cartas/ignea/Dragãozinho Flamejante.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 65,
    name: "David-The-Titanslayer",
    baseCost: 4,
    image: "../frontend/assets/cartas/neutra/David-The-Titanslayer.png",
    baseAttack: 6,
    baseHealth: 3,
    speed: 1,
    keywords: ["neutro", "corpo-a-corpo", "humano", "grito de guerra"],
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    baseCost: 1,
    image: "../frontend/assets/cartas/obscura/Diabrete Sombrio.png",
    baseAttack: 2,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 67,
    name: "Agonox",
    baseCost: 5,
    image: "../frontend/assets/cartas/obscura/Agonox.png",
    baseAttack: 4,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 68,
    name: "Diabrete Elétrico",
    baseCost: 1,
    image: "../frontend/assets/cartas/eletrica/Diabrete Elétrico.png",
    baseAttack: 2,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 69,
    name: "Oráculo das Marés",
    baseCost: 2,
    image: "../frontend/assets/cartas/aquatica/Oráculo das Marés.png",
    baseAttack: 0,
    baseHealth: 4,
    speed: 1,
    keywords: ["aquático", "benevolente", "grito de guerra", "condicional"],
  },
  {
    id: 70,
    name: "Thalassor",
    baseCost: 7,
    image: "../frontend/assets/cartas/aquatica/Thalassor.png",
    baseAttack: 7,
    baseHealth: 9,
    speed: 1,
    keywords: ["aquático", "tritão", "corpo-a-corpo", "constante"],
  },
  {
    id: 71,
    name: "Odon, Mestre das Armas",
    baseCost: 4,
    image: "../frontend/assets/cartas/neutra/Odon, Mestre das Armas.png",
    baseAttack: 4,
    baseHealth: 4,
    speed: 1,
    keywords: ["neutro", "anão", "corpo-a-corpo", "grito de guerra"],
  },
  {
    id: 72,
    name: "Sengoku",
    baseCost: 7,
    image: "../frontend/assets/cartas/neutra/Sengoku.png",
    baseAttack: 7,
    baseHealth: 7,
    speed: 1,
    keywords: [
      "neutro",
      "humano",
      "dragão",
      "dragão primordial",
      "corpo-a-corpo",
      "intimidador",
      "regeneração",
      "transformar",
    ],
  },
  {
    id: 73,
    name: "Drake Damian",
    baseCost: 3,
    image: "../frontend/assets/cartas/neutra/Drake Damian.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 4,
    keywords: ["neutro", "humano", "corpo-a-corpo", "esquiva", "constante"],
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    baseCost: 3,
    image: "../frontend/assets/cartas/aquatica/Emissário da Água da Vida.png",
    baseAttack: 3,
    baseHealth: 4,
    speed: 1,
    keywords: ["aquático", "longa-distância", "grito de guerra"],
  },
];

// Verifica se as ../frontend/assets/cartas foram carregadas corretamente
//console.log(cards);

// -------------------------------------------------
// Mapa para armazenar os listeners de clique associados a cada cardContainer
const clickListenersMap = new Map();

//------------------------------------------------------------------------------------------

const handElement = document.getElementById("hand");

// WebSocket
//const ws = new WebSocket('wss://uclagamewsserver.onrender.com');
const ws = new WebSocket("ws://192.168.0.12:8081");

ws.onopen = () => {
  console.log("Eu sou um cliente e estou conectado ao servidor.");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessageFromServer(message);
};

ws.onerror = (error) => {
  console.error("Erro na conexão WebSocket:", error);
};

//------------------------------------------------------------------------------------------

function handleSubmit(event) {
  event.preventDefault(); // Previne o comportamento padrão do formulário
  let username = loginForm.querySelector("#username").value;
  console.log("Usuário:", username);

  player.username = username;
  console.log("Usuário:", username);
  loginDiv.innerHTML = "";
  let welcomeAndWaitMsg = document.createElement("p");
  welcomeAndWaitMsg.innerHTML = `${username}, por favor aguarde pelo seu oponente...`;
  welcomeAndWaitMsg.style.color = "black";
  welcomeAndWaitMsg.style.fontSize = "1.25rem";
  welcomeAndWaitMsg.style.fontWeight = "bold";
  loginDiv.appendChild(welcomeAndWaitMsg);

  let message = {
    type: "newUserLogin",
    nickname: username,
  };

  sendMessageToServer(JSON.stringify(message));
}

function sendMessageToServer(message) {
  ws.send(message);
  console.log("Enviando mensagem para o servidor");
  console.table(message);
}

//------------------------------------------------------------------------------------------

const endTurnButton = document.querySelector('#endTurn');

function handleMessageFromServer(message) {
  console.log("Mensagem recebida do servidor");
  console.log("Tipo da mensagem:", message.type);

  switch (message.type) {

    case "yourUserId":
      console.table(message);
      player.id = message.data;

    case "requestDeckCode":
      console.log(message.message);
      askForDeckCode();
      break;

    case "deckShuffled":
      currentDeck = message.data;
      console.log("currentDeck atualizado:");
      console.table(currentDeck);
      break;

    case "startGame":
      console.log(message.message);
      theGameStarts();
      break;

    case "cardDrawOrder":
      console.table(message);
      drawCard(message.amount);
      break;

    case "canPlayTheCard":
      console.log(
        "Mensagem do servidor. Adição de carta ao campo de batalha autorizada para a carta com os dados (message.data): ",
        JSON.stringify(message.data)
      );
      addCardToField(message.data.card, message.data.slotNumber);
      break;

    case "cannotPlayTheCard": {
      alert("Você não pode jogar isso agora.");
      let playCardButtons = document.querySelectorAll(".playCard-button");
      playCardButtons.forEach((playCardButton) => {
        playCardButton.remove();
      });
      break;
    }

    case "addCardToOpponentField":
      console.log(
        "Adicionar carta ao campo de batalha do inimigo para os dados: ",
        message.data
      );
      addCardToOpponentField(message.data);
      break;

    case "cardsCombatsResults":
      console.log("Resultados dos combates recebidos pelo servidor.");
      updateFieldAfterCombat(
        message.data.cartaAlvo,
        message.data.cartaAtacante
      );
      break;

    /* case "directDamageOrder":
      apllyDirectDamage(message.data.slot, message.data.damage);
      break; */

    case "applyDamageToAvatar":
      applyDamageToAvatar(message.data);
      break;

    case "buffCard":
      updateCardStats(message.data);
      break;

    case "applyHealingToCard":
      updateCardStats(message.data.carta);
      break;

    case "applyHealingToAvatar":
      applyHealingToAvatar(message.data.newHealth, message.data.avatarType);
      break;

    case "recallCardOrder":
      recallCard(message.data);
      break;

    case "removeCardFromTheField":
      removeCardFromTheField(message.data);
      break;

    case "turnEndRequestDenied":
      if (message.type) {
        turnEndRequested = false;
        endTurnButton.disabled = false;
      };
      break;

    case "endTheTurnOrder":
      endTheTurn();
      break;

    case "gameOver":
      gameOver(message.data);
      break;

    case "playerDisconnected":
      alert(
        "Um jogador foi desconectado. Saindo da partida e atualizando a página..."
      );
      setTimeout(() => {
        location.reload();
      }, 1000);
      break;

    default:
      console.log("Tipo de mensagem desconhecido:", message.type);
      break;
  }
}

//------------------------------------------------------------------------------------------

const editMode = false;

//------------------------------------------------------------------------------------------

function theGameStarts() {
  // Manipule o DOM para mostrar a tela principal
  mainGameSection.style.display = "flex";
  document.body.style.backgroundImage = "none";
  deckCodeNSelectSection.style.display = "none";
  if (editMode) {
    drawCard(1);
    return;
  }
  drawCard(6);
  addMana(1);
}

function askForDeckCode() {
  loginDiv.style.display = "none";
  deckCodeNSelectSection.style.display = "flex";
}

function drawCard(amount = 1) {
  console.log("Current Deck antes de comprar cartas: ");
  console.table(currentDeck);

  if (currentDeck.length > 0) {
    // Corrigido para verificar o tamanho do array
    for (let i = 0; i < amount; i++) {
      const cardDrawn = currentDeck.shift(); // Remove a primeira carta do deck

      if (!cardDrawn) {
        console.error("Erro ao tentar comprar uma carta: o deck está vazio.");
        return;
      }

      // Atualiza o contador de cartas no deck
      deckCardCount = currentDeck.length;
      console.log("Quantidade de cartas no deck atualmente:", deckCardCount);

      console.log("Current Deck depois de comprar uma carta: ");
      console.table(currentDeck);

      // Exibe a carta comprada na mão do jogador
      displayCardInHand(cardDrawn);

      // Envia a carta comprada de volta ao servidor
      const message = {
        type: "cardDrawn",
        cardData: cardDrawn,
        state: "hand",
      };
      sendMessageToServer(JSON.stringify(message));
    }
  } else {
    console.warn("Não há mais cartas no deck para comprar.");
  }
}

//-------------------------------------------------------------------------------------------

const drawForTheOpponent = (amount = 1) => {
  console.log("drawForTheOpponent triggered.");
  // Envia a carta comprada de volta ao servidor
  const message = {
    type: "drawForTheOpponent",
    amount: amount,
  };

  sendMessageToServer(JSON.stringify(message));
};

//------------------------------------------------------------------------------------------

// Função para adicionar o listener do botão "Jogar"
const playCardListener = (cardContainer) => {

  if (turnEndRequested) {
    alert('Você não pode fazer isto agora, uma vez que já solicitou finalização de turno.');
    return;
  };
  
  const yourFieldSlots = document.querySelectorAll('.slots:not(.opponentSlots)');
  yourFieldSlots.forEach( (slot) => {
    if (!slot.querySelector('.carta')) {
      slot.classList.add('highlight');
      slot.addEventListener('dragenter', () => {
  
      });
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
  
      slot.addEventListener('drop', (event) => {
        playCardRequest(cardContainer, event.target); // Função para processar a jogada da carta
      })
  
    }
  });

};

//------------------------------------------------------------------------------------------

function displayCardInHand(cardData) {
  if (!cardData) {
    console.error("Nenhum dado de carta recebido.");
    return;
  }

  console.log("Exibir carta na mão.");
  console.log("Dados da carta recebido como argumento: ");
  console.table(cardData);

  const cardContainer = createCardElement(cardData);

  cardContainer.draggable = true;
  cardContainer.style.userSelect = 'none';

  // Define o handleClick específico para cada carta
  const handleDragStart = () => {
    console.log("HandleDragStart ativado para a carta:", cardContainer);
    playCardListener(cardContainer);
  };

  // Adiciona o listener de clique para exibir o botão "Jogar"
  cardContainer.addEventListener("dragstart", handleDragStart);
  console.log(
    "Listener de arrastamento adicionado para a carta com os dados:",
    JSON.stringify(cardData)
  );

  // para garantir que não apareça o menu contexto padrão com o "abrir imagem em nova guia" dentre outras opções
  cardContainer.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  
  cardContainer.querySelector('img').addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  // Armazena o listener no mapa
  clickListenersMap.set(cardContainer, handleDragStart);

  addHoverListenerToCard(cardContainer);

  handElement.appendChild(cardContainer);
};

//------------------------------------------------------------------------------------------

function createCardElement(cardData) {
  // Criação do elemento da carta
  const cardContainer = document.createElement("div");
  cardContainer.className = "carta";
  cardContainer.dataset.id = cardData.id;
  cardContainer.dataset.instanceId = cardData.instanceId;

  // Adiciona a imagem
  const imagem = document.createElement("img");
  imagem.src = cards.find((c) => c.id === cardData.id).image;
  imagem.alt = cardData.name;
  imagem.classList.add("card-image");
  cardContainer.appendChild(imagem);

  // Adiciona o custo
  const cost = document.createElement("div");
  cost.textContent = `${cardData.currentCost}`;
  cost.style.color =
    cardData.currentCost > cardData.baseCost
      ? "red"
      : cardData.currentCost < cardData.baseCost
      ? "lightgreen"
      : "white";
  cost.classList.add("card-cost-display");
  cardContainer.appendChild(cost);

  // Adiciona a div dos stats
  const statsDisplay = document.createElement("div");
  statsDisplay.classList.add("card-stats");

  // Adiciona o ataque
  const attack = document.createElement("div");
  attack.classList.add("card-attack");
  attack.textContent = `${cardData.currentAttack}`;
  attack.style.color =
    cardData.currentAttack > cardData.baseAttack
      ? "red"
      : cardData.currentAttack < cardData.baseAttack
      ? "lightgreen"
      : "white";
  statsDisplay.appendChild(attack);

  // Adiciona a vida
  const health = document.createElement("div");
  health.classList.add("card-health");
  health.textContent = `${cardData.currentHealth}`;
  health.style.color =
    cardData.currentHealth > cardData.baseHealth
      ? "red"
      : cardData.currentHealth < cardData.baseHealth
      ? "lightgreen"
      : "white";
  statsDisplay.appendChild(health);

  cardContainer.appendChild(statsDisplay);

  return cardContainer;
}
function playCardRequest(cardContainer, slotElement) {
  console.log(
    "Enviar ao servidor pedido para jogar carta para a carta: ",
    cardContainer
  );

  const slotNumber = slotElement.id.replace("slot", "");

  const cardInstanceId = cardContainer.dataset.instanceId;

  let message = {
    type: "playCardRequest",
    data: {cardInstanceId, slotNumber}
  };
  sendMessageToServer(JSON.stringify(message));
}

//------------------------------------------------------------------------------------------

function addCardToField(cardData, slotNumber) {
  console.log("addCardToField triggered.");

  let carta = cardData;
  let selectedSlot = null; // Inicializa como null
  let cardContainer = handElement.querySelector(`.carta[data-instance-id="${carta.instanceId}"]`);

  if (!cardContainer) {
    cardContainer = createCardElement(carta);
  };

  if (!slotNumber) {
    console.warn('slotNumber não possui um valor válido.');
    return;
  }
    // Seleciona os slots que não são slots do oponente
    const availableSlots = document.querySelectorAll(
      ".slots:not(.opponentSlots)"
    );
    console.log(
      `Número de slots disponíveis encontrados: ${availableSlots.length}`
    );

    // Função para limpar listeners e highlights
    const cleanupListenersAndHighlights = () => {
      availableSlots.forEach((slot) => {
        slot.classList.remove("highlight");
        slot.removeEventListener("click", handleSlotClick);
      });
      document.removeEventListener("click", handleOutsideClick);
    };

    // Função para lidar com o clique fora dos slots destacados
    const handleOutsideClick = (event) => {
      if (![...availableSlots].some((slot) => slot.contains(event.target))) {
        cleanupListenersAndHighlights();
      }
    };

    // Função para lidar com o clique no slot
    const handleSlotClick = (event) => {
      selectedSlot = event.currentTarget;
      console.log(
        `Slot clicado: ${selectedSlot ? selectedSlot.id : "Não definido"}`
      );

      // Verifica se o slot já está ocupado
      if (selectedSlot.children.length > 0) {
        console.error(
          `O slot ${selectedSlot.id} está ocupado. Por favor, escolha um slot válido.`
        );
        alert("O slot está ocupado. Por favor, escolha um slot válido.");
        return;
      }

      // Adiciona a carta ao slot clicado
  
        console.log(`Carta encontrada no handElement: ${carta.instanceId}`);

        selectedSlot.innerHTML = ""; // Limpar o slot antes de adicionar a carta
        selectedSlot.appendChild(cardContainer);

        cardContainer
          .querySelector(".card-stats")
          .querySelector(".card-attack").style.fontSize = "18px";

        cardContainer
          .querySelector(".card-stats")
          .querySelector(".card-health").style.fontSize = "18px";

        slotNumber = selectedSlot.id.replace("slot", "");

      // Remover o ouvinte que cria o botão de jogar carta
      cardContainer.removeEventListener(
        "click",
        clickListenersMap.get(cardContainer)
      );

      // Remover o ouvinte do mapa
      clickListenersMap.delete(cardContainer);

      // Adicionar o novo ouvinte à carta no campo (o que cria o botão de atacar)
      addAttackListeners(cardContainer);

      cardContainer.style.maxWidth = "100%";

      // Adiciona o listener de hover
      addHoverListenerToCard(cardContainer);

      // Gastar a mana referente ao custo da carta
      spendMana(carta.currentCost);

      // Remove o botão "Jogar" se ele existir
      const playCardButton = cardContainer.querySelector(".playCard-button");
      if (playCardButton) {
        playCardButton.remove();
        console.log('Botão "Jogar" removido.');
      }

      // Remove o destaque e os ouvintes de eventos após a carta ser jogada
      cleanupListenersAndHighlights();

      // Envia mensagem para o servidor
      let message = {
        type: "addCardToOpponentField",
        data: { carta, slotNumber },
      };
      sendMessageToServer(JSON.stringify(message));
      /*  } else {
        console.error("Card container não encontrado.");
      } */
    };

    // Adiciona o listener para detectar cliques fora dos slots destacados
    document.addEventListener("click", handleOutsideClick, { once: true });


};


// --------------------------------------------------------------

/* const summonCardRequest = (cardContainer, cardSummonedSlot) => {
  console.log("summonCardRequest triggered.");

  // Seleciona todos os slots do jogador
  const yourSlots = document.querySelectorAll(".slots:not(.opponentSlots)");

  // Filtra os slots que não têm nenhum elemento filho (independentemente de terem texto ou não)
  const yourEmptySlots = Array.from(yourSlots).filter(
    (slot) => slot.children.length === 0
  );

  if (yourEmptySlots.length <= 0) {
    console.error("O campo de batalha está cheio.");
    return;
  }

  let cardId = cardContainer.dataset.id;

  let slotId;
  let slotNumber;

  if (cardSummonedSlot instanceof HTMLElement) {
    slotId = cardSummonedSlot.id;
    slotNumber = Number(slotId.replace("slot", ""));
  } else {
    console.error("cardSummonedSlot não é um elemento HTML.");
    return;
  }

  if (slotNumber) {
    let message = {
      type: "summonCardRequest",
      data: { cardId, slotNumber },
    };

    console.log(
      "Enviando mensagem para o servidor com requisição de invocação direta de carta."
    );
    console.table("message: ", message);
    sendMessageToServer(JSON.stringify(message));
  } else {
    console.error("slotNumber é null ou undefined.");
  }
}; */

// --------------------------------------------------------------

// Adicionar listener de mouseover ao cardContainer
const addHoverListenerToCard = (cardContainer) => {
  const handleMouseOver = () => showCardDescription(cardContainer);

  // Remova o listener antigo antes de adicionar um novo
  cardContainer.removeEventListener("mouseover", handleMouseOver);

  // Adiciona o novo listener de mouseover
  cardContainer.addEventListener("mouseover", handleMouseOver);
};

function showCardDescription(cardContainer) {
  // Função de callback para mover o hover
  const updateHoverPosition = (event) => {
    const hoverRect = hoverContainer.getBoundingClientRect();

    let top = event.clientY + 10; // Ajuste o valor 10 conforme necessário
    let left = event.clientX + 10; // Ajuste o valor 10 conforme necessário

    // Ajuste a posição se o container ultrapassar a borda da tela
    if (top + hoverRect.height > window.innerHeight) {
      top = window.innerHeight - hoverRect.height - 10;
    }

    // Ajuste a posição se o container ultrapassar a borda da tela
    if (left + hoverRect.width > window.innerWidth) {
      left = window.innerWidth - hoverRect.width - 10;
    }

    hoverContainer.className = "hover__container";
    hoverContainer.style.top = `${top}px`;
    hoverContainer.style.left = `${left}px`;
  };

  // Função de callback para remover o hoverContainer
  const removeHoverContainer = () => {
    hoverContainer.remove();
    cardContainer.removeEventListener("mousemove", updateHoverPosition);
    cardContainer.removeEventListener("mouseout", removeHoverContainer);
  };

  // Remova os listeners antigos, se existirem
  cardContainer.removeEventListener("mouseover", showCardDescription);
  cardContainer.removeEventListener("mousemove", updateHoverPosition);
  cardContainer.removeEventListener("mouseout", removeHoverContainer);

  // Adiciona o hoverContainer
  const hoverContainer = document.createElement("div");
  const hoverText = document.createElement("p");

  // Encontra o card pelo id e acessa a propriedade 'description'
  let cardDescription = cardsTextDescription.find(
    (c) => c.id === Number(cardContainer.dataset.id)
  );

  if (cardDescription) {
    hoverText.textContent =
      typeof cardDescription.description === "function"
        ? cardDescription.description(cardContainer)
        : cardDescription.description;
  } else {
    hoverText.textContent = "Descrição não encontrada";
  }
  hoverText.className = "hover__text";

  const hoverImage = document.createElement("img");
  hoverImage.classList.add("hover__image");
  hoverImage.src = cardContainer.querySelector("img").src;

  hoverContainer.appendChild(hoverImage);
  hoverContainer.appendChild(hoverText);
  document.body.appendChild(hoverContainer);

  // Adiciona os event listeners atualizados
  cardContainer.addEventListener("mousemove", updateHoverPosition);
  cardContainer.addEventListener("mouseout", removeHoverContainer);

  // Inicializa a posição do hoverContainer para que ele apareça imediatamente
  updateHoverPosition({
    clientX: cardContainer.offsetLeft,
    clientY: cardContainer.offsetTop,
  });
}

// ------------------------------------------------------------

// Adicionar listener de ataque às cartas no campo de batalha
function addAttackListeners(cardContainer) {
  const attackListener = () => {
    console.log("Listener de clique adicionado para a carta:", cardContainer);

    let opponentFrontlineSlots = document.querySelectorAll(
      "#opponentSlot1, #opponentSlot2, #opponentSlot3"
    );
    let opponentSlots = document.querySelectorAll(
      "#opponentSlot1, #opponentSlot2, #opponentSlot3, #opponentSlot4, #opponentSlot5, #opponentSlot6"
    );
    let opponentAvatar = document.getElementById("opponent-health");

    let frontlineOccupied = Array.from(opponentFrontlineSlots).some((slot) =>
      slot.querySelector(".carta")
    );

    let attackTargets = frontlineOccupied
      ? opponentFrontlineSlots
      : opponentSlots;

    attackTargets.forEach((slot) => {
      if (slot.querySelector(".carta")) {
        highlightAttackOption(slot.querySelector(".carta"), cardContainer);
      }
    });

    if (!frontlineOccupied) {
      highlightAttackOption(opponentAvatar, cardContainer);
    }
  };

  // Adiciona o listener ao mapa e ao cardContainer
  clickListenersMap.set(cardContainer, attackListener);
  cardContainer.addEventListener("click", attackListener);
}

// ------------------------------------------------------------
function highlightAttackOption(alvoElement, atacanteElement) {
  
  if (turnEndRequested) {
    alert('Você não pode fazer isto agora, uma vez que já solicitou finalização de turno.');
    return;
  };

  let opponentAvatar = document.getElementById("opponent-health");

  // Cria o botão de ataque
  let attackButton = document.createElement("button");
  attackButton.innerText = "Atacar";
  attackButton.classList.add("attack-button");

  // Adiciona um listener de clique ao botão de ataque
  attackButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Evita que o clique no botão dispare o listener do cardContainer
    if (alvoElement === opponentAvatar) {
      attackTheAvatarRequest(atacanteElement, "enemy");
      alvoElement.classList.remove("highlight");
    } else {
      attackCardRequest(atacanteElement, alvoElement); // Função que realiza o ataque
      alvoElement.classList.remove("highlight");
    }

    attackButton.remove();
  });

  // Adiciona o botão de ataque ao alvo
  alvoElement.appendChild(attackButton);

  // Destaca o alvo
  alvoElement.classList.add("highlight");
};

// ------------------------------------------------------------

function getCardsInField(side = "both") {
  let cardsInField = [];

  switch (side) {
    case "both":
      cardsInField = battlefield.querySelectorAll(".carta");

      break;

    case "allied":
      alliedField = battlefield.querySelectorAll(".slots:not(.opponentSlots)");
      alliedField.forEach((alliedSlot) => {
        const cardElement = alliedSlot.querySelector(".carta");
        cardsInField.push(cardElement);
      });
      break;

    case "enemy":
      enemyField = battlefield.querySelectorAll(".opponentSlots");
      enemyField.forEach((opponentSlot) => {
        const cardElement = opponentSlot.querySelector(".carta");
        cardsInField.push(cardElement);
      });
      break;
  };

  console.log(`cardsInField = ${cardsInField}`);
  return cardsInField;
};

// ------------------------------------------------------------

function attackCardRequest(cartaAtacanteElement, cartaAlvoElement) {
  // Remover destaque e botão de ataque após o ataque
  cartaAlvoElement.querySelector(".attack-button").remove();
  cartaAlvoElement.classList.remove("highlight");

  // Certifique-se de que está acessando os `instanceId`s corretamente
  const cartaAtacanteInstanceId = cartaAtacanteElement.dataset.instanceId;
  const cartaAlvoInstanceId = cartaAlvoElement.dataset.instanceId;

  console.log(
    "InstanceId's da cartaAlvo e da cartaAtacante - respectivamente - recebido como argumento em attackCardRequest"
  );
  console.log(cartaAlvoInstanceId); // Verifique o valor
  console.log(cartaAtacanteInstanceId); // Verifique o valor

  let message = {
    type: "attackCardRequest",
    data: {
      cartaAtacanteInstanceId: cartaAtacanteInstanceId,
      cartaAlvoInstanceId: cartaAlvoInstanceId,
    },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------

function attackTheAvatarRequest(cartaAtacante, target) {
  console.log("attackTheAvatarRequest triggered.");
  console.table(cartaAtacante);

  const cartaAtacanteInstanceId = cartaAtacante.dataset.instanceId;

  let message = {
    type: "attackTheAvatar",
    data: { cartaAtacanteInstanceId, target },
  };

  console.log("Valor da variável message em attackTheAvatarRequest:");
  console.table(message);

  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------

function applyDamageToAvatar(data) {
  const target = data.target;
  const avatarHealth = data.avatarHealth;

  console.log(`applyDamageToAvatar triggered com target: ${target}, e avatarHealth = ${avatarHealth}`);

  if (target === "enemy") {
    opponentAvatar.textContent = avatarHealth;

    switch (true) {
      case avatarHealth >= 25:
        opponentHealthZone = "extra";
        opponentAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 20:
        opponentHealthZone = "safe";
        opponentAvatar.style.color = "darkgreen";
        break;
      case avatarHealth >= 25:
        opponentHealthZone = "extra";
        opponentAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 15:
        opponentHealthZone = "alarming";
        opponentAvatar.style.color = "orange";
        break;
      case avatarHealth >= 7:
        opponentHealthZone = "risky";
        opponentAvatar.style.color = "darkred";
        break;
      case avatarHealth >= 1:
        opponentHealthZone = "critical";
        opponentAvatar.style.color = "red";
    }
  } else if (target === "ally") {
    alliedAvatar.textContent = avatarHealth;

    switch (true) {
      case avatarHealth >= 25:
        healthZone = "extra";
        alliedAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 20:
        healthZone = "safe";
        alliedAvatar.style.color = "darkgreen";
        break;
      case avatarHealth >= 25:
        healthZone = "extra";
        alliedAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 15:
        healthZone = "alarming";
        alliedAvatar.style.color = "orange";
        break;
      case avatarHealth >= 7:
        healthZone = "risky";
        alliedAvatar.style.color = "darkred";
        break;
      case avatarHealth >= 1:
        healthZone = "critical";
        alliedAvatar.style.color = "red";
    }
  }
};

// ----------------------------------------------------------------

function updateCardStats(cardData) {
  // Extrai o ID da instância da carta dos dados recebidos e converte para número
  const instanceId = Number(cardData.instanceId);

  // Verifica se o ID da instância é válido
  if (instanceId) {
    console.log(`Procurando carta com ID de instância: ${instanceId}`);

    // Seleciona o elemento da carta no DOM que corresponde ao ID de instância
    let cardElement = document.querySelector(
      `.carta[data-instance-id="${instanceId}"]`
    );

    // Verifica se o elemento da carta foi encontrado
    if (cardElement) {
      console.log(`Carta encontrada: ${cardElement}`);

      // Seleciona o contêiner de estatísticas da carta
      let cardStatsDiv = cardElement.querySelector(".card-stats");

      // Verifica se o contêiner de estatísticas existe
      if (cardStatsDiv) {
        console.log(`Contêiner de estatísticas encontrado: ${cardStatsDiv}`);

        // Seleciona os elementos de ataque e vida dentro do contêiner de estatísticas
        let cardAttackDiv = cardStatsDiv.querySelector(".card-attack");
        let cardHealthDiv = cardStatsDiv.querySelector(".card-health");

        // Atualiza os valores de ataque e vida com base nos dados recebidos
        if (cardAttackDiv && cardHealthDiv) {
          cardAttackDiv.textContent = cardData.currentAttack;
          cardAttackDiv.fontSize = "16px";
          cardAttackDiv.style.color =
            cardData.currentAttack > cardData.baseAttack
              ? "lightgreen"
              : "white";
          cardHealthDiv.textContent = cardData.currentHealth;
          cardHealthDiv.fontSize = "16px";
          cardHealthDiv.style.color =
            cardData.currentHealth > cardData.baseHealth
              ? "lightgreen"
              : "white";

          console.log(
            `Estatísticas atualizadas: Ataque = ${cardData.currentAttack}, Vida = ${cardData.currentHealth}`
          );
        } else {
          console.warn(
            `Elementos de ataque ou vida não encontrados na carta ID: ${instanceId}`
          );
        }
      } else {
        console.warn(
          `Contêiner de estatísticas não encontrado na carta ID: ${instanceId}`
        );
      }
    } else {
      console.warn(
        `Nenhuma carta encontrada no DOM com o ID de instância: ${instanceId}`
      );
    }
  } else {
    console.error("ID de instância inválido ou não fornecido.");
  }
}

// -------------------------------------------------------------------------------------

function applyHealingToAvatar(newHealth, avatarType) {
  console.log("applyHealingToAvatar chamada.");
  console.log(`newHealth = ${newHealth}, avatarType = ${avatarType}`);

  if (avatarType === "allied") {
    alliedAvatar.textContent = newHealth;
    switch (true) {
      case avatarHealth >= 25:
        healthZone = "extra";
        alliedAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 20:
        healthZone = "safe";
        alliedAvatar.style.color = "darkgreen";
        break;
      case avatarHealth >= 25:
        healthZone = "extra";
        alliedAvatar.style.color = "lightgreen";
        break;
      case avatarHealth >= 15:
        healthZone = "alarming";
        alliedAvatar.style.color = "orange";
        break;
      case avatarHealth >= 7:
        healthZone = "risky";
        alliedAvatar.style.color = "darkred";
        break;
      case avatarHealth >= 1:
        healthZone = "critical";
        alliedAvatar.style.color = "red";
    }
  } else if (avatarType === "enemy") {
    opponentAvatar.textContent = newHealth;

    switch (true) {
      case newHealth >= 25:
        opponentHealthZone = "extra";
        opponentAvatar.style.color = "lightgreen";
        break;
      case newHealth >= 20:
        opponentHealthZone = "safe";
        opponentAvatar.style.color = "darkgreen";
        break;
      case newHealth >= 25:
        opponentHealthZone = "extra";
        opponentAvatar.style.color = "lightgreen";
        break;
      case newHealth >= 15:
        opponentHealthZone = "alarming";
        opponentAvatar.style.color = "orange";
        break;
      case newHealth >= 7:
        opponentHealthZone = "risky";
        opponentAvatar.style.color = "darkred";
        break;
      case newHealth >= 1:
        opponentHealthZone = "critical";
        opponentAvatar.style.color = "red";
    }
  } else {
    console.error(`avatarType inválido para o dado: ${avatarType}`);
  }
};

// -------------------------------------------------------------------------------------
// TURNO RELATED

let turnEndRequested = false;
let currentTurnIndex = 1;

function endTheTurn() {
  console.log("endTheTurn chamada.");
  currentTurnIndex++
  calculateTurnScore();

  endTurnButton.disabled = false;

  
};

function calculateTurnScore() {
  console.log('calculateTurnScore chamada.');
  // Initialize the variables
  let yourTurnScore = 0;
  let opponentTurnScore = 0;
  
  let alliedAttackTotal = 0;
  let opponentAttackTotal = 0;
  
  let alliedAvatarHPPoints = 0;
  let opponentAvatarHPPoints = 0;
  
  // points earned with the attack of your cards
  const cardsInYourField = getCardsInField("allied");
  cardsInYourField.forEach((alliedCard) => {
    // Verifica se alliedCard não é nulo antes de tentar acessar suas propriedades
    if (alliedCard) {
      const statsDiv = alliedCard.querySelector(".card-stats");
  
      // Verifica se statsDiv existe antes de acessar suas propriedades
      if (statsDiv) {
        const attackDiv = statsDiv.querySelector(".card-attack");
  
        // Verifica se attackDiv existe antes de acessar seu conteúdo
        if (attackDiv) {
          const attackValue = Number(attackDiv.textContent);
          alliedAttackTotal += attackValue;
        } else {
          console.warn("Elemento '.card-attack' não encontrado:", alliedCard);
        }
      } else {
        console.warn("Elemento '.card-stats' não encontrado:", alliedCard);
      }
    } else {
      console.warn("Slot sem carta encontrada no campo aliado.");
    }
  });
  
  // points earned with the attack of opponent's cards
  const cardsInOpponentField = getCardsInField("enemy");
  cardsInOpponentField.forEach((enemyCard) => {
    // Verifica se enemyCard não é nulo antes de tentar acessar suas propriedades
    if (enemyCard) {
      const statsDiv = enemyCard.querySelector(".card-stats");
  
      // Verifica se statsDiv existe antes de acessar suas propriedades
      if (statsDiv) {
        const attackDiv = statsDiv.querySelector(".card-attack");
  
        // Verifica se attackDiv existe antes de acessar seu conteúdo
        if (attackDiv) {
          const attackValue = Number(attackDiv.textContent);
          opponentAttackTotal += attackValue;
        } else {
          console.warn("Elemento '.card-attack' não encontrado:", enemyCard);
        }
      } else {
        console.warn("Elemento '.card-stats' não encontrado:", enemyCard);
      }
    } else {
      console.warn("Slot sem carta encontrada no campo aliado.");
    }
  });

  console.log('Pontos conquistados com o ataque das cartas em campo:');
  console.log(`You: ${alliedAttackTotal} | Opponent: ${opponentAttackTotal}`);
  
  // Add-up the score made with the attack value of your cards
  yourTurnScore += alliedAttackTotal;
  opponentTurnScore += opponentAttackTotal;
  
  // points earned with the avatars health
  // your avatar
  switch(healthZone) {
    case 'extra':
      alliedAvatarHPPoints = 20;
      break;
    case 'safe':
      alliedAvatarHPPoints = 15;
      break;
    case 'alarming':
      alliedAvatarHPPoints = 10;
      break;
    case 'risky':
      alliedAvatarHPPoints = 5;
      break;
    case 'critical':
      alliedAvatarHPPoints = 0;        
  };

  //opponent's avatar
  switch(opponentHealthZone) {
    case 'extra':
      opponentAvatarHPPoints = 20;
      break;
    case 'safe':
      opponentAvatarHPPoints = 15;
      break;
    case 'alarming':
      opponentAvatarHPPoints = 10;
      break;
    case 'risky':
      opponentAvatarHPPoints = 5;
      break;
    case 'critical':
      opponentAvatarHPPoints = 0;        
  };

  console.log(`opponentHealthZone: ${opponentHealthZone}`);

  console.log('Pontos conquistados com a vida do avatar:');
  console.log(`You: ${alliedAvatarHPPoints} | Opponent: ${opponentAvatarHPPoints}`);

  // Add-up the score made with the attack value of your cards
  yourTurnScore += alliedAvatarHPPoints;
  opponentTurnScore += opponentAvatarHPPoints;
  
  console.log("Pontos de cada jogador neste turno:");
  console.log(`Você: ${yourTurnScore} | Oponente: ${opponentTurnScore}`);

  yourTurnScore > opponentTurnScore ? updateMatchScore("me") : opponentTurnScore > yourTurnScore ? updateMatchScore("opponent") : alert("Este turno resultou em um empate.");

};

function updateMatchScore(winnerOfTheTurn) {
  console.log("Atualizar pontuação da partida chamada. Vencedor do turno:", winnerOfTheTurn);
  if (winnerOfTheTurn === "me") {
    //!isAmplifierActive ? 
    playerMatchPoints += 2
    yourScoreboard.textContent = playerMatchPoints;

    alert("Muito bem. Você VENCEU este turno!");

  } else if (winnerOfTheTurn === "opponent") {
    opponentMatchPoints += 2;
    opponentScoreboard.textContent = opponentMatchPoints;

    alert("Cuidado. Você PERDEU este turno!");

  } else {
    console.error("Vencedor do turno não especificado ou não é uma string válida.");
    return;
  };

  alert(`Resultado do turno: Você:${playerMatchPoints} x Oponente: ${opponentMatchPoints}`);

  let message = {
    type: 'myUpdatedScore',
    username: (player.username),
    data: playerMatchPoints
  };

  console.log(`Enviando ao servidor a pontuação ${playerMatchPoints} de ${player.username}`);

  sendMessageToServer(JSON.stringify(message));

};

// Exemplo de uso

//calculateTurnScore;

// -------------------------------------------------------------------------------------

function gameOver(result) {
  if (result === "winner") {
    console.log("Parabéns! Você venceu a partida!");
  } else if (result === "loser") {
    console.log("Essa não. Você perdeu a partida. Mais sorte da próxima vez...");
  }
};

// -------------------------------------------------------------------------------------

// MANA RELATED

let mana = 0;
let manaContainer = document.getElementById("manaContainer");
let manaCounter = manaContainer.querySelector("#manaCounter");
let manaIconsDiv = manaContainer.querySelector("#manaIcons");
//let unspentMana = 0;

function addMana(amount = 1) {
  console.log("Mana", mana);
  console.log("Amount", amount);
  // atualiza a variável de mana
  mana += amount;
  console.log("Mana depois da adição", mana);

  const manaIcon = document.createElement("img");
  manaIcon.className = "mana-icon";
  manaIcon.src = "assets/other-images/icone-mana.png";
  manaIcon.style.width = "3%";
  manaIcon.style.height = "auto";
  manaIcon.style.margin = "2px";

  manaIconsDiv.innerHTML = "";
  for (let i = 0; i < mana; i++) {
    manaIconsDiv.appendChild(manaIcon);
  }
  manaCounter.innerHTML = "Mana (" + mana + "):";
}

function spendMana(manaSpent = 0) {
  // atualiza a variável de mana
  console.log(`Mana antes: ${mana}`);
  mana -= manaSpent;
  console.log(`Mana gasta: ${manaSpent}`);
  console.log(`Mana depois: ${mana}`);

  const manaIcon = document.createElement("img");
  manaIcon.className = "mana-icon";
  manaIcon.src = "other-images/icone-mana.png";
  manaIcon.style.width = "15%";
  manaIcon.style.height = "auto";
  manaIcon.style.margin = "2px";

  manaIconsDiv.innerHTML = "";
  for (let i = 0; i < mana; i++) {
    manaIconsDiv.removeChild(manaIcon);
  }
  manaCounter.innerHTML = "Mana (" + mana + "):";
}

// ---------------------------------------------------------------------------------------

/* const directDamageRequest = (damage, slot) => {
  console.log(
    "directDamageRequest triggered with damage:",
    damage,
    "slots:",
    slot
  );

  let message;
  console.log("Enviando mensagem de dano direto para o slot:", slot);

  message = {
    type: "directDamageRequest",
    data: { slot, damage },
  };

  sendMessageToServer(JSON.stringify(message));
}; */

// -----------------------------------------------------------------------------------------
/* const apllyDirectDamage = (slot, damage) => {
  //console.log(`applyDirectDamage chamado para slot: ${slot} com dano: ${damage}`);

  let slotId = slot;
  let selectedSlot = document.querySelector(`#${slotId}`);

  if (selectedSlot) {
    let cardContainer = selectedSlot.querySelector(".carta");
    if (cardContainer) {
      let carta = cartasMap.get(Number(cardContainer.dataset.instanceId));
      if (carta) {
        //console.log(`Dano aplicado à carta: ${carta.name}, ID da Instância: ${carta.instanceId}`);
        carta.takeDamage(damage);
      } else {
        //console.error('Carta não encontrada no mapa:', cardContainer.dataset.instanceId);
      }
    } else {
      //console.error('Nenhuma carta encontrada no slot:', slotId);
    }
  } else {
    //  console.error('Slot inválido:', slotId);
  }
}; */

// -----------------------------------------------------------------------------------------

function addCardToOpponentField(data) {
  let card = data.carta;

  console.table("data: ", data);

  const cardContainer = createCardElement(card);

  cardContainer.style.maxWidth = "100%";

  cardContainer
    .querySelector(".card-stats")
    .querySelector(".card-health").style.fontSize = "18px";
  cardContainer
    .querySelector(".card-stats")
    .querySelector(".card-attack").style.fontSize = "18px";

  addHoverListenerToCard(cardContainer);

  let slotNumber = data.slotNumber;

  let selectedSlot = document.getElementById(`opponentSlot${slotNumber}`);
  selectedSlot.innerHTML = "";

  selectedSlot.appendChild(cardContainer);
}

// -----------------------------------------------------------------------------------------

function removeCardFromTheField(cardData) {
  console.log("removeCardFromTheField chamada.");
  console.table("cardData:", cardData);

  let cardContainerElement = document.querySelector(
    `.carta[data-instance-id="${cardData.instanceId}"]`
  );

  if (cardContainerElement && cardContainerElement.closest(".slots")) {
    cardContainerElement.remove();
  } else {
    console.warn(
      "Elemento de carta não encontrado no DOM ou não está no campo de batalha."
    );
  }
}

// -----------------------------------------------------------------------------------------

function recallCard(cardData) {
  console.log("recallCard chamada.");
  console.table("cardData:", cardData);

  let cardContainerElement = document.querySelector(
    `.carta[data-instance-id="${cardData.instanceId}"]`
  );

  if (cardContainerElement && cardContainerElement.closest(".slots")) {
    document.querySelector("#hand").appendChild(cardContainerElement);
  } else {
    console.warn(
      "Elemento de carta não encontrado no DOM ou não está no campo de batalha."
    );
  }
}

// -----------------------------------------------------------------------------------------

function updateFieldAfterCombat(cartaAlvoData, cartaAtacanteData) {
  console.log("Função updateFieldAfterCombat chamada.");

  // Exibindo os dados das cartas recebidas como argumento
  console.log("Dados recebidos para a carta alvo:", cartaAlvoData);
  console.log("Dados recebidos para a carta atacante:", cartaAtacanteData);

  // CARTA ALVO

  // Localizando o elemento HTML correspondente à carta alvo pelo instanceId
  const cartaAlvoElement = document.querySelector(
    `.carta[data-instance-id="${cartaAlvoData.instanceId}"]`
  );
  if (!cartaAlvoElement) {
    console.error(
      `Elemento da carta alvo com instanceId ${cartaAlvoData.instanceId} não encontrado.`
    );
    return;
  }
  console.log("Elemento da carta alvo encontrado:", cartaAlvoElement);

  // Atualizando a exibição dos atributos da carta alvo
  const alvoStatsDisplay = cartaAlvoElement.querySelector(".card-stats");
  if (alvoStatsDisplay) {
    const alvoHealthDisplayElement =
      alvoStatsDisplay.querySelector(".card-health");
    const alvoAttackDisplayElement =
      alvoStatsDisplay.querySelector(".card-attack");

    if (alvoHealthDisplayElement) {
      alvoHealthDisplayElement.textContent = cartaAlvoData.currentHealth;
      alvoHealthDisplayElement.style.color =
        cartaAlvoData.currentHealth < cartaAlvoData.baseHealth
          ? "red"
          : cartaAlvoData.currentHealth > cartaAlvoData.currentHealth
          ? "lightgreen"
          : "white";

      // Adicionar classe para animação
      cartaAlvoElement.classList.add("damageUnit", "shake");
      setTimeout(() => {
        cartaAlvoElement.classList.remove("damageUnit", "shake");
      }, 4700);

      console.log(
        `Vida da carta alvo atualizada para: ${cartaAlvoData.currentHealth}`
      );
      // Remover a carta do DOM se ela tiver morrido
      if (cartaAlvoData.currentHealth <= 0) {
        if (cartaAlvoElement.closest(".opponentSlots")) {
          slotDaCartaAlvo = cartaAlvoElement.closest(".opponentSlots");
          const slotId = slotDaCartaAlvo.id.replace("opponentSlot", "");
          slotDaCartaAlvo.innerHTML = slotId;
        } else {
          slotDaCartaAlvo = cartaAlvoElement.closest(".slots");
          const slotId = slotDaCartaAlvo.id.replace("slot", "");
          slotDaCartaAlvo.innerHTML = slotId;
        }

        cartaAlvoElement.remove();
      }

      if (alvoAttackDisplayElement) {
        alvoAttackDisplayElement.textContent = cartaAlvoData.currentAttack;
        alvoAttackDisplayElement.style.color =
          cartaAlvoData.currentAttack < cartaAlvoData.baseAttack
            ? "red"
            : cartaAlvoData.currentAttack > cartaAlvoData.currentAttack
            ? "lightgreen"
            : "white";
        console.log(
          `Ataque da carta alvo atualizado para: ${cartaAlvoData.currentAttack}`
        );
      } else {
        console.error(
          "Elemento de exibição de ataque da carta alvo não encontrado."
        );
      }
    } else {
      console.error(
        "Elemento de exibição de status da carta alvo não encontrado."
      );
    }
  } else {
    console.warn("Display (div) de stats da carta alvo não encontrado no DOM.");
  }
  // Localizando o elemento HTML correspondente à carta atacante pelo instanceId
  const cartaAtacanteElement = document.querySelector(
    `.carta[data-instance-id="${cartaAtacanteData.instanceId}"]`
  );
  if (!cartaAtacanteElement) {
    console.error(
      `Elemento da carta atacante com instanceId ${cartaAtacanteData.instanceId} não encontrado.`
    );
    return;
  }
  // Adicionar classe para animação
  cartaAtacanteElement.classList.add("damageUnit", "shake");
  setTimeout(() => {
    cartaAtacanteElement.classList.remove("damageUnit", "shake");
  }, 4700);

  console.log("Elemento da carta atacante encontrado:", cartaAtacanteElement);

  // CARTA ATACANTE
  // Atualizando a exibição dos atributos da carta atacante
  const atacanteStatsDisplay =
    cartaAtacanteElement.querySelector(".card-stats");
  if (atacanteStatsDisplay) {
    const atacanteHealthDisplayElement =
      atacanteStatsDisplay.querySelector(".card-health");
    const atacanteAttackDisplayElement =
      atacanteStatsDisplay.querySelector(".card-attack");

    if (atacanteHealthDisplayElement) {
      atacanteHealthDisplayElement.textContent =
        cartaAtacanteData.currentHealth;
      atacanteHealthDisplayElement.style.color =
        cartaAtacanteData.currentHealth < cartaAtacanteData.baseHealth
          ? "red"
          : cartaAtacanteData.currentHealth > cartaAtacanteData.currentHealth
          ? "lightgreen"
          : "white";
      console.log(
        `Vida da carta atacante atualizada para: ${cartaAtacanteData.currentHealth}`
      );
      if (cartaAtacanteData.currentHealth <= 0) {
        let slotDaCartaAtacante;
        let slotId;
        if (cartaAtacanteElement.closest(".opponentSlots")) {
          slotDaCartaAtacante = cartaAtacanteElement.closest(".opponentSlots");
          slotId = slotDaCartaAtacante.id.replace("opponentSlot", "");
        } else {
          slotDaCartaAtacante = cartaAtacanteElement.closest(".slots");
          slotId = slotDaCartaAtacante.id.replace("slot", "");
        }

        slotDaCartaAtacante.innerHTML = slotId;

        cartaAtacanteElement.remove();

        const deadCardFrame = document.createElement("img");
        deadCardFrame.src = "";
      }
    } else {
      console.error(
        "Elemento de exibição de vida da carta atacante não encontrado."
      );
    }

    if (atacanteAttackDisplayElement) {
      atacanteAttackDisplayElement.textContent =
        cartaAtacanteData.currentAttack;
      atacanteAttackDisplayElement.style.color =
        cartaAtacanteData.currentAttack < cartaAtacanteData.baseAttack
          ? "red"
          : cartaAtacanteData.currentAttack > cartaAtacanteData.currentAttack
          ? "lightgreen"
          : "white";
      console.log(
        `Ataque da carta atacante atualizado para: ${cartaAtacanteData.currentAttack}`
      );
    } else {
      console.error(
        "Elemento de exibição de ataque da carta atacante não encontrado."
      );
    }
  } else {
    console.error(
      "Elemento de exibição de status da carta atacante não encontrado."
    );
  }
}

// -----------------------------------------------------------------------------------------

function buffOrDebuffRequest({ attackChange, healthChange }, card) {
  console.log("buffOrDebuffRequest triggered.");
  console.table("card:", card);

  if (!attackChange || !healthChange) {
    console.error("Valor de attackChange ou healthChange nulos.");
    return;
  }

  const cardInstanceId = card.dataset.instanceId;

  let message = {
    type: "buffOrDebuffRequest",
    data: { cardInstanceId, attackChange, healthChange },
  };

  sendMessageToServer(JSON.stringify(message));
}

// -----------------------------------------------------------------------------------------

// Função para enviar a solicitação de cura para a carta
function healCardRequest(healingAmount, cardElement) {
  console.log("healCardRequest triggered.");
  console.table("card:", cardElement);
  console.log(`healingAmount = ${healingAmount}`);

  if (isNaN(healingAmount) || healingAmount <= 0) {
    console.error("Valor de healingAmount inválido.");
    return;
  }

  const cardInstanceId = cardElement.dataset.instanceId;

  let message = {
    type: "healCardRequest",
    data: { cardInstanceId, healingAmount },
  };

  sendMessageToServer(JSON.stringify(message));
}

// -----------------------------------------------------------------------------------------

// Função para enviar a solicitação de cura para o avatar
function healAvatarRequest(healingAmount, avatarType) {
  console.log("healAvatarRequest triggered for:", avatarType);

  if (isNaN(healingAmount) || healingAmount <= 0) {
    console.error("Valor de healingAmount inválido.");
    return;
  }

  let message = {
    type: "healAvatarRequest",
    data: { healingAmount, avatarType },
  };

  sendMessageToServer(JSON.stringify(message));
}

// -----------------------------------------------------------------------------------------

/* const applyHealing = (cardData) => {
  console.log("applyHealing triggered.");
  let carta = cartasMap.get(cardData.instanceId);
  if (carta) {
    let healthBefore = Number(carta.currentHealth);
    let healthAfter = Number(cardData.currentHealth);
    let healAmount = healthBefore - healthAfter;
    console.log(
      "Aplicando cura no DOM para a carta de id global único: ",
      cardData.instanceId,
      " , com healAmount = ",
      healAmount
    );
    carta.healCard(healAmount);
  }
}; */

const handleBuffOrDebuffButtonClick = () => {
  const cardsInField = getCardsInField();

  if (cardsInField.length === 0) {
    alert("O campo de batalha está vazio.");
    return;
  }

  cardsInField.forEach((card) => {
    card.classList.add("highlight"); // Adiciona a classe 'highlight' para destaque

    // Define o listener de buff ou debuff
    const buffOrDebuffListener = (event) => {
      event.stopPropagation();
      const buffDebuffInput = prompt(
        "Digite o buff (+) ou debuff (-) desejado para ataque e vida (Ex: +1/+0):"
      );

      if (!buffDebuffInput) {
        // Remove destaque e listener se o prompt for cancelado
        card.classList.remove("highlight");
        card.removeEventListener("click", buffOrDebuffListener);
        return;
      }

      // Divide o input em ataque e vida
      const [attackChange, healthChange] = buffDebuffInput
        .split("/")
        .map((value) => parseInt(value));

      // Verifica se o input está no formato correto
      if (isNaN(attackChange) || isNaN(healthChange)) {
        alert("Erro: Formato inválido. Use o formato '+X/+Y' ou '-X/-Y'.");
        card.classList.remove("highlight");
        card.removeEventListener("click", buffOrDebuffListener);
        return;
      }

      // Aplica o buff ou debuff na carta
      buffOrDebuffRequest({ attackChange, healthChange }, card);

      // Remove destaque e listener após aplicação
      card.classList.remove("highlight");
      card.removeEventListener("click", buffOrDebuffListener);
      addAttackListeners(card);
    };

    // Adiciona o event listener diretamente
    card.addEventListener("click", buffOrDebuffListener);

    // Remover o listener de ataque para não causar interferência
    const attackListener = clickListenersMap.get(card);

    // Remove o listener do elemento card
    card.removeEventListener("click", attackListener);
  });
};

const handleHealButtonClick = () => {
  const cardsInField = getCardsInField();

  // Destaca os avatares
  alliedAvatar.classList.add("highlight");
  opponentAvatar.classList.add("highlight");

  const healListener = (event) => {
    event.stopPropagation();

    // Solicita o valor de cura
    const healingAmount = Number(prompt("Digite o valor que deseja curar."));

    if (isNaN(healingAmount) || healingAmount <= 0) {
      alert("Por favor, digite um número válido para curar.");
      removeHealListeners();
      return;
    }

    // Determina o alvo do clique
    if (event.target.classList.contains("carta")) {
      healCardRequest(healingAmount, event.target);
    } else if (event.target === alliedAvatar) {
      healAvatarRequest(healingAmount, "allied");
    } else if (event.target === opponentAvatar) {
      healAvatarRequest(healingAmount, "enemy");
    }

    removeHealListeners();
  };

  const removeHealListeners = () => {
    // Remove destaque dos avatares
    alliedAvatar.classList.remove("highlight");
    opponentAvatar.classList.remove("highlight");

    // Remove listeners de cura das cartas
    cardsInField.forEach((card) => {
      card.removeEventListener("click", healListener);
    });

    // Remove listeners de cura dos avatares
    alliedAvatar.removeEventListener("click", healListener);
    opponentAvatar.removeEventListener("click", healListener);
  };

  // Remove listeners de ataque antes de adicionar o de cura
  cardsInField.forEach((card) => {
    const attackListener = clickListenersMap.get(card);
    if (attackListener) {
      card.removeEventListener("click", attackListener);
    }
    card.addEventListener("click", healListener);
  });
  // Adiciona o listener de cura aos avatares
  alliedAvatar.addEventListener("click", healListener);
  opponentAvatar.addEventListener("click", healListener);
};

const handleRecallButtonClick = () => {
  const cardsInField = getCardsInField();

  if (cardsInField.length === 0) {
    alert("O campo de batalha está vazio.");
    return;
  }

  cardsInField.forEach((card) => {
    card.classList.add("highlight"); // Adiciona a classe 'highlight' para destaque

    const recallListener = (event) => {
      event.stopPropagation();

      const cardInstanceId = card.dataset.instanceId;

      const cardOwner = card.closest(".opponentSlots") ? "opponent" : "me";

      let message = {
        type: "recallRequest",
        data: { cardInstanceId, cardOwner },
      };
      sendMessageToServer(JSON.stringify(message));

      // Remove destaque e listener após aplicação
      card.classList.remove("highlight");
      card.removeEventListener("click", recallListener);
      addAttackListeners(card);
    };

    card.addEventListener("click", recallListener);

    // Remover o listener de ataque para não causar interferência
    const attackListener = clickListenersMap.get(card);

    // Remove o listener do elemento card
    card.removeEventListener("click", attackListener);
  });
};

const handleEndTurnButtonClick = () => {
  console.log("Botão de finalizar turno foi clicado pelo jogador.");

  let message = {
    type: 'endTurnRequest'
  };

  sendMessageToServer(JSON.stringify(message));




};


// ------------------------------------------------------------------------
// Algumas variáveis pra se colocar eventListener
const buffOrDebuffButton = document.querySelector("#buffOrDebuffButton");
const healButton = document.querySelector("#healButton");
const recallButton = document.querySelector("#recallButton");

// fazer um event listener do form on submit com prevent default
loginForm.addEventListener("submit", handleSubmit);

// ao clicar no botão de selecionar deck
interpretButton.addEventListener("click", () => {
  let deckCode = document.getElementById("deckCodeInput").value;
  let message = {
    type: "deckCode",
    deckCode: deckCode,
  };
  console.log(
    `Deck (${message.deckCode}) enviado para o servidor com sucesso. Aguardar pelo oponente e pela respota do servidor.`
  );
  message = JSON.stringify(message);
  sendMessageToServer(message);
});

// Event listener para remover os botões quando clicar em algum lugar fora deles
document.addEventListener("click", (event) => {
  if (!event.target.closest(".carta")) {
    //console.log('Clique fora de uma carta, removendo botões existentes.');
    let playCardButtons = document.querySelectorAll(".playCard-button");
    playCardButtons.forEach((playCardButton) => {
      console.log('Removendo botão "Jogar":', playCardButton);
      playCardButton.remove();
    });
    let attackButtons = document.querySelectorAll(".attack-button");
    attackButtons.forEach((attackButton) => {
      console.log('Removendo botão "Atacar":', attackButton);
      attackButton.remove();
    });
  }
});

document.addEventListener("mouseover", (event) => {
  if (!event.target.closest(".carta")) {
    //console.log('Mouse por cima de um elemento qualquer que não uma carta, removendo os containers de descrição.');
    let hoverContainers = document.querySelectorAll(".hover__container");
    hoverContainers.forEach((hoverContainer) => {
      hoverContainer.remove();
    });
  }
});

buffOrDebuffButton.addEventListener("click", handleBuffOrDebuffButtonClick);

healButton.addEventListener("click", handleHealButtonClick);

recallButton.addEventListener("click", handleRecallButtonClick);

endTurnButton.addEventListener("click", () => {
  const confirmation = confirm("Você está finalizando o turno. Dê 'OK' e aguarde para ver se seu oponente deseja fazer o mesmo.");
  if (confirmation) {
    handleEndTurnButtonClick();
    endTurnButton.disabled = true;
  }
});
