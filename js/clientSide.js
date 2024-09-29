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
const opponentAvatar = document.querySelector("#opponent-health");
const alliedAvatar = document.querySelector("#player-health");

let starterDeck = [];
let currentDeck = [];

let deckCardCount = 0;
let handCardCount = 0;

//let totalHealed = 0;

//pontuação
let playerMatchPoints = 0;
let opponentMatchPoints = 0;
const yourScoreboard = document.querySelector("#score-player1");
const opponentScoreboard = document.querySelector("#score-player2");

//turnos
let isAmplifierActive = false;
let specialPointsMultiplier;
let healthZone = "extra";
let opponentHealthZone = "extra";

// -----------------------------------------------

// Função que lida com o clique fora de uma carta ou a confirmação de cancelamento
const handleCancel = () => {
  if (confirm("Cancelar?")) {
    return true; // Retorna true se o cancelamento ocorrer
  }
  return false; // Retorna false se não houver cancelamento
};

const cardsTextDescription = [
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
      #Grito de Guerra: “aplico *paralisia elétrica* a até duas cartas inimigas de sua escolha.” 
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
      6 de mana | 5/5
      (Elétrico | Corpo-a-corpo | Celestial |) 
      #Grito de Guerra: “Ataco todas as unidades inimigas paralisadas. Em seguida, 
      aplico *paralisia elétrica* a todas as não-elétricas em jogo. Para cada uma que foi paralisada dessa forma, você ganha +1 mana máxima somente no próximo turno.” #Constante: “não posso ter minha velocidade reduzida e nem ser afetado por Gritos de Guerra ou efeitos de dano inimigos.”`,
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
      #Último Suspiro: “ressuscito com 1 de vida e <*regeneração (100%)*>”`,
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
    #Grito de Guerra e #Início do Turno: “gero (1) de mana adicional por turno enquanto você não estiver ganhando a partida.”
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
  #Grito de Guerra: “causo 5 de dano a todas as cartas inimigas.” 
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
#Grito de Guerra: “causo 4 de dano a um alvo de sua escolha.”
“Eu só posso ser jogado se o avatar inimigo tiver 12 ou menos de vida.”`,
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

const playEffectsCards = [
  {
    id: 2,
    name: "Elemental do Fogo",
    playEffect: (
      elementalCardData,
      elementalCardElement,
      elementalSlotNumber
    ) => {
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
          return;
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
          return;
        }
      }
      addCardToField(elementalCardElement, elementalSlotNumber);
    },
  },

  {
    id: 4,
    name: "Fulgurvoltz",
    playEffect: function (fulgurvoltzData, fulgurvoltzElement, slotNumber) {
      console.log("Fulgurvoltz warCry function effect triggered.");

      const cardsInField = getCardsInField(); // Assumindo que isso retorna os elementos `.card`

      // Função para extrair o valor do ataque a partir do elemento DOM da carta
      const getAttackValue = (cardElement) => {
        const attackElement = cardElement.querySelector(".card-attack");
        return attackElement ? parseInt(attackElement.textContent, 10) : null;
      };

      // Filtrar cartas não elétricas e com ataque <= 10
      const cardsToBeDestroyed = cardsInField.filter((cardElement) => {
        const cardData = cards.find((c) => c.id == cardElement.dataset.id);

        if (cardData && !cardData.keywords.includes("elétrico")) {
          const attackValue = getAttackValue(cardElement);
          return (
            cardElement !== fulgurvoltzElement &&
            attackValue !== null &&
            attackValue <= 10
          );
        }

        return false; // Ignorar cartas elétricas ou que não existem no dataset
      });

      console.log(cardsToBeDestroyed);
      // Destruir todas cartas não-elétricas com ataque menor ou igual a 10
      cardsToBeDestroyed.forEach((targetCardElement) => {
        destroyCardRequest(targetCardElement);
      });

      addCardToField(fulgurvoltzElement, slotNumber);
    },
  },

  {
    id: 8,
    name: "Layla",
    playEffect: async function (laylaData, laylaElement, slotNumber) {
      // Filtra cartas válidas (não nulas)
      const enemyCards = getCardsInField().filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar Layla diretamente
      if (enemyCards.length === 0) {
        console.log(
          "Não há cartas inimigas para paralisar. Jogando Layla diretamente."
        );
        addCardToField(laylaElement, slotNumber);
        return; // Encerra a função aqui
      }

      alert("Escolha até duas cartas inimigas para paralisar.");
      let selectedCards = 0;

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            enemyCards.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", paralyzeCard);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const paralyzeCard = function (event) {
            event.stopPropagation();
            keywordAdditionRequest("paralisia elétrica", this);
            selectedCards++;

            // Se duas cartas forem paralisadas, resolve a promessa
            if (selectedCards >= 2) {
              removeHighlightsAndListeners();
              resolve(); // Resolve a promessa quando o jogador selecionar duas cartas
            }
          };

          if (enemyCards.length > 0) {
            enemyCards.forEach((card) => {
              card.classList.add("highlight");
              card.addEventListener("click", paralyzeCard);
            });
          }

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promessa se o jogador cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador clicar nas cartas ou cancelar
        await waitForPlayerAction();
        // Só chega aqui se o jogador tiver paralisado 2 cartas
        addCardToField(laylaElement, slotNumber);
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 10,
    name: "Rusco",
    playEffect: function (ruscoData, ruscoElement, slotNumber) {
      let cardContainer = playedCard.closest(".card-container");
      let shield = document.createElement("img");
      shield.src = "other-images/shield.png";
      shield.className = "shield";
      shield.style.width = "100%";
      cardContainer.classList.add("shielded-card");
      cardContainer.appendChild(shield, cardContainer.firstChild);

      addCardToField(ruscoElement, slotNumber);
    },
  },
  {
    id: 12,
    name: "Thorwells",
    playEffect: function (thorwellsData, thorwellsElement, slotNumber) {
      const enemyCards = getCardsInField("enemy");

      enemyCards.forEach((card) => {
        keywordAdditionRequest("paralisia elétrica", card);
      });

      /*  let message = {
          type: "nextTurnEffect",
          data: "", // completar
        };
        sendMessageToServer; */
      addCardToField(thorwellsElement, slotNumber);
    },
  },
  {
    id: 14,
    name: "Voltexz",
    playEffect: (voltexzData, voltexzElement, slotNumber) => {
      if (!voltexzElement) {
        console.error("Carta Voltexz não encontrada no DOM.");
        return;
      }

      const userInput = prompt("Você pode gastar até 4 de mana adicional para aprimorar meu grito de guerra (Máx. 7 de dano e +5/+5 para as suas outras cartas).");

      let extraManaSpent = Math.max(mana, Number(userInput));

      // Validação da entrada
      if (isNaN(extraManaSpent) || extraManaSpent < 0) {
        console.warn("Valor inválido. Nenhuma mana será gasta.");
        extraManaSpent = 0;
      } else if (extraManaSpent > 4) {
        console.warn("Você pode gastar no máximo 4 de mana adicional.");
        extraManaSpent = 4; // Limita a 4
      } else if (extraManaSpent > mana) {
        console.error("Você não possui mana suficiente.");
        alert("Você não possui mana suficiente.");
        extraManaSpent = 0;
      }

      console.log(`Mana que você possuía no instante em que Voltexz foi jogada e seu efeito ativado: ${mana}`);
      // se a mana do custo da própria Voltexz n tiver sido computada ainda, então o máximo que extraManaSpent pode ser é igual a mana - Number(voltexzElement.querySelector('.card-cost-display').textContent)

      spendMana(extraManaSpent);

      const slotsDamaged = [7, 8, 9, 10, 11, 12];
      const damage = Math.min(7, 3 + extraManaSpent); // Limita o dano a 7
      console.log(`Dano calculado: ${damage}`);

      slotsDamaged.forEach((slotId) => {
        const slotElement = document.querySelector(
          `#opponentSlot${slotId - 6}`
        );
        if (slotElement) {
          const targetCardElement = slotElement.querySelector(".carta");
          if (targetCardElement) {
            dealDirectDamageRequest(damage, targetCardElement);
          } else {
            console.warn(
              "O elemento HTML da carta não foi encontrado no DOM como filha do slotElement."
            );
          }
        } else {
          console.error(`Slot (de slotId = ${slotId}) não encontrado no DOM.`);
        }
      });

      const voltexzSlot = document.getElementById(`slot${slotNumber}`);
      if (!voltexzSlot) {
        console.error("Slot da carta Voltexz não encontrado.");
        return; // Termina a função em caso de erro
      }

      const alliedCards = getCardsInField("allied");
      const attackBuff = 1 + (extraManaSpent || 0);
      const healthBuff = 1 + (extraManaSpent || 0);

      alliedCards.forEach((card) => {
        if (card && card.parentElement !== voltexzSlot) {
          buffOrDebuffRequest({ attackBuff, healthBuff }, card);
        }
      });

      addCardToField(voltexzElement, slotNumber);
    },
  },

  {
    id: 23,
    name: "Rai'Emofitir",
    playEffect: (raiData, raiElement, slotNumber) => {
      const previousTurn = currentTurnIndex - 1;
      if (previousTurn === 0) {
        previousTurn = 1;
      }

      const previousTurnActions = playsHistory[previousTurn].actions;

      // Verifica se houve alguma ação 'playCard' do 'player1'
      const playerPlayedCard = previousTurnActions.some(
        (action) => action.type === "cardPlayed" && action.player === "player1"
      );

      // Se o jogador não jogou carta no turno anterior
      if (!playerPlayedCard) {
        // Seleciona todas as cartas dentro dos slots
        const cardsInField = document.querySelectorAll(".slots .carta");

        // Para cada carta encontrada, realiza a remoção ou envia o pedido de destruição
        cardsInField.forEach((card) => {
          destroyCardRequest(card);
        });
      }

      addCardToField(raiElement, slotNumber);
    },
  },

  {
    id: 26,
    name: "Eletroad",
    playEffect: function (eletroadData, eletroadElement, slotNumber) {
      playerMatchPoints <= opponentMatchPoints ? addMana(1) : "";
      addCardToField(eletroadElement, slotNumber);
    },
  },
  {
    id: 28,
    name: "Engenheiro Louco",
    playEffect: function (engenheiroData, engenheiroElement, slotNumber) {
      drawCard(2);
      drawForTheOpponent(2);
      addCardToField(engenheiroElement, slotNumber);
    },
  },
  {
    id: 29,
    name: "D'Lorafya",
    playEffect: function (dlorafyaData, dlorafyaElement, slotNumber) {
      // Seleciona todos os slots dinamicamente
      for (let i = 1; i <= 6; i++) {
        const slot = document.querySelector(`#opponentSlot${i}`);
        if (slot) {
          const targetCardElement = slot.querySelector(".carta");
          if (targetCardElement) {
            dealDirectDamageRequest(5, targetCardElement);
          }
        }
      }
      addCardToField(dlorafyaElement, slotNumber);
    },
  },
  /* {
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
  }, */
  {
    id: 40,
    name: "Gigante Elétrico",
    playEffect: async function (eGigantData, eGiantElement, slotNumber) {
      // Adiciona mana
      addMana(1);

      const enemyCards = getCardsInField("enemy").filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar Layla diretamente
      if (enemyCards.length === 0) {
        console.log(
          "Não há cartas inimigas para selecionar. Jogando carta diretamente."
        );
        addCardToField(eGiantElement, slotNumber);
        return; // Encerra a função aqui
      }

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            opponentCards.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", paralyzeCard);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const paralyzeCard = (event) => {
            event.stopPropagation();
            keywordAdditionRequest("paralisia elétrica", this);
            removeHighlightsAndListeners();
            resolve(); // Resolve a promessa quando uma carta for paralisada
          };

          opponentCards.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", paralyzeCard);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promessa se o jogador cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar uma carta ou cancelar
        await waitForPlayerAction();
        addCardToField(eGiantElement, slotNumber); // Chama addCardToField ao paralisar uma carta
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 50,
    name: "O Tecnomante",
    playEffect: function (tecnomanteData, tecnomanteElement, slotNumber) {
      const tenOrAboveCostCards = currentDeck.filter((c) => c.baseCost >= 10);

      // Remover essas cartas de currentDeck
      currentDeck = currentDeck.filter((c) => c.baseCost < 10);

      // Reduzir os custos em 1 para todas as cartas com cost >= 10
      tenOrAboveCostCards.forEach((c) => {
        c.cost = c.cost - 1;
      });

      // Chamar as compras de carta
      drawSpecificCards(tenOrAboveCostCards);

      addCardToField(tecnomanteElement, slotNumber);
    },
  },

  {
    id: 57,
    name: "Gigante Flamejante",
    playEffect: async function (giganteDeFData, giganteDeFElement, slotNumber) {
      alert("Escolha uma carta ou avatar para causar 4 de dano.");

      const cardsInField = getCardsInField();
      const avatars = [alliedAvatar, opponentAvatar];

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            cardsInField.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal4Damage);
            });
            avatars.forEach((avatar) => {
              avatar.classList.remove("highlight");
              avatar.removeEventListener("click", deal4Damage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const deal4Damage = (event) => {
            event.stopPropagation();
            dealDirectDamageRequest(4, event.currentTarget);
            removeHighlightsAndListeners();
            resolve(); // Resolve a promessa quando uma carta for paralisada
          };

          cardsInField.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal4Damage);
          });

          avatars.forEach((avatar) => {
            avatar.classList.add("highlight");
            avatar.addEventListener("click", deal4Damage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promessa se o jogador cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar uma carta ou cancelar
        await waitForPlayerAction();
        addCardToField(giganteDeFElement, slotNumber); // Chama addCardToField ao paralisar uma carta
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 58,
    name: "Piromante Ardente",
    playEffect: async function (piromanteData, piromanteElement, slotNumber) {
      alert("Escolha até dois alvos para causar 1 de dano a cada um.");

      const cardsInField = getCardsInField();
      const avatars = [alliedAvatar, opponentAvatar];
      let targetsSelected = 0;
      const maxTargets = 2;

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            cardsInField.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal1Damage);
            });
            avatars.forEach((avatar) => {
              avatar.classList.remove("highlight");
              avatar.removeEventListener("click", deal1Damage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const deal1Damage = function (event) {
            event.stopPropagation();
            dealDirectDamageRequest(1, this);
            targetsSelected++;
            if (targetsSelected >= maxTargets) {
              removeHighlightsAndListeners();
              resolve(); // Resolve após a seleção de dois alvos
            }
          };

          cardsInField.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal1Damage);
          });

          avatars.forEach((avatar) => {
            avatar.classList.add("highlight");
            avatar.addEventListener("click", deal1Damage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promessa ao cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar uma carta ou cancelar
        await waitForPlayerAction();
        addCardToField(piromanteElement, slotNumber); // Chama addCardToField ao causar dano
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 59,
    name: "Avatar do Fogo",
    playEffect: async function (avatarFogoData, avatarFogoElement, slotNumber) {
      alert("Escolha uma carta inimiga para causar 3 de dano.");

      const enemyCards = getCardsInField("enemy").filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar Layla diretamente
      if (enemyCards.length === 0) {
        console.log(
          "Não há cartas inimigas para selecionar. Jogando a carta diretamente."
        );
        addCardToField(avatarFogoElement, slotNumber);
        return; // Encerra a função aqui
      }

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            enemyCards.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal3Damage);
            });

            document.removeEventListener("click", cancelWarCry);
          };

          const deal3Damage = function (event) {
            event.stopPropagation();
            dealDirectDamageRequest(3, this);

            const slotNumber = Number(
              this.closest(".slots").id.replace("opponentSlot", "")
            );

            const adjacentCards = getAdjacentCards(slotNumber);
            adjacentCards.forEach((card) => {
              dealDirectDamageRequest(3, card);
            });

            removeHighlightsAndListeners();
            resolve(); // Resolve após a seleção
          };

          enemyCards.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal3Damage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promessa ao cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar uma carta ou cancelar
        await waitForPlayerAction();
        addCardToField(avatarFogoElement, slotNumber); // Chama addCardToField ao causar dano
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 60,
    name: "Irina Lança-Chamas",
    playEffect: async function (irinaData, irinaElement, slotNumber) {
      alert("Escolha uma carta ou avatar para causar 5 de dano.");

      const cardsInField = getCardsInField();
      const avatars = [alliedAvatar, opponentAvatar];

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            cardsInField.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal5Damage);
            });
            avatars.forEach((avatar) => {
              avatar.classList.remove("highlight");
              avatar.removeEventListener("click", deal5Damage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const deal5Damage = function (event) {
            event.stopPropagation();
            dealDirectDamageRequest(5, this);
            removeHighlightsAndListeners();
            resolve(); // Resolve a promise com sucesso após o dano ser causado
          };

          cardsInField.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal5Damage);
          });

          avatars.forEach((avatar) => {
            avatar.classList.add("highlight");
            avatar.addEventListener("click", deal5Damage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita a promise se o usuário cancelar
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar uma carta ou cancelar
        await waitForPlayerAction();
        addCardToField(irinaElement, slotNumber); // Chama addCardToField ao causar dano
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 62,
    name: "Brutamontes Chocante",
    playEffect: async function (
      brutamontesData,
      brutamontesElement,
      slotNumber
    ) {
      let selectionsLeft = 3; // Número de seleções restantes

      alert(
        "Escolha até três slots inimigos ocupados para causar 4 de dano *ATRAVESSANTE*."
      );

      const enemyCards = getCardsInField("enemy").filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar Layla diretamente
      if (enemyCards.length === 0) {
        console.log(
          "Não há cartas inimigas para selecionar. Jogando carta diretamente."
        );
        addCardToField(eGiantElement, slotNumber);
        return; // Encerra a função aqui
      }

      const waitForPlayerAction = () => {
        return new Promise((resolve) => {
          const removeHighlightsAndListeners = () => {
            enemyCards.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal4PiercingDamage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const deal4PiercingDamage = function (event) {
            event.stopPropagation(); // Impede que o clique no card também acione o cancelamento
            dealDirectDamageRequest(4, this);

            const slot = this.closest(".slots");
            if (slot) {
              const slotId = slot.id.replace("opponentSlot", "");
              const slotNumber = parseInt(slotId, 10);

              if (slotNumber >= 1 && slotNumber <= 3) {
                dealDirectDamageRequest(4, opponentAvatar);
              }
            }

            selectionsLeft--;

            if (selectionsLeft > 0) {
              alert(
                `Escolha outra carta inimiga. Você ainda tem ${selectionsLeft} seleção(ões) restante(s).`
              );
            } else {
              removeHighlightsAndListeners(); // Remove listeners após a terceira seleção
              resolve(); // Resolve com sucesso após a última seleção
            }
          };

          enemyCards.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal4PiercingDamage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              resolve(); // Resolve se o grito for cancelado
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar cartas ou cancelar
        await waitForPlayerAction();
        addCardToField(brutamontesElement, slotNumber); // Chama addCardToField após a seleção
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 64,
    name: "Dragãozinho Flamejante",
    playEffect: async function (
      dragaozinhoFData,
      dragaozinhoFElement,
      slotNumber
    ) {
      alert("Escolha uma carta ou avatar para causar 1 de dano.");

      const cardsInField = getCardsInField("enemy");
      const avatars = [alliedAvatar, opponentAvatar];

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            cardsInField.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", deal1Damage);
            });
            avatars.forEach((avatar) => {
              avatar.classList.remove("highlight");
              avatar.removeEventListener("click", deal1Damage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const deal1Damage = function (event) {
            event.stopPropagation();
            dealDirectDamageRequest(1, this);
            removeHighlightsAndListeners();
            resolve(); // Resolve após o dano
          };

          cardsInField.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", deal1Damage);
          });

          avatars.forEach((avatar) => {
            avatar.classList.add("highlight");
            avatar.addEventListener("click", deal1Damage);
          });

          const cancelWarCry = (event) => {
            alert("Você está cancelando o grito de guerra...");
            const cancel = handleCancel();
            if (cancel) {
              removeHighlightsAndListeners();
              reject(); // Rejeita se o grito for cancelado
            }
          };

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar cartas ou cancelar
        await waitForPlayerAction();
        addCardToField(dragaozinhoFElement, slotNumber); // Chama addCardToField após a seleção
      } catch (err) {
        console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 65,
    name: "David-The-Titanslayer",
    playEffect: function (davidData, davidElement, slotNumber) {
      const enemyCards = getCardsInField("enemy");

      enemyCards.forEach((card) => {
        const cardStatsDiv = card.querySelector(".card-stats");
        if (cardStatsDiv) {
          const cardAttackDiv = cardStatsDiv.querySelector(".card-attack");
          if (cardAttackDiv) {
            const attackValue = Number(cardAttackDiv.textContent);
            if (attackValue >= 8) {
              destroyCardRequest(card);
            }
          }
        }
      });

      addCardToField(davidElement, slotNumber);
    },
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    playEffect: function () {
      return new Promise((resolve) => {
        let amount;
        for (let i = 0; i < 4; i += amount) {
          let slotNumber = Number(
            prompt("Escolha um slot ocupado para curar.")
          );
          amount = Number(
            prompt(`Escolha uma quantidade para curar (Faltam ${4 - i})`)
          );
          healUnit(slotNumber, amount);
        }
        resolve(true); // Resolve após todas as curas
      });
    },
  },
];

const cards = [
  {
    id: 1,
    name: "A Vagante Sombria",
    baseCost: 10,
    image: "assets/cartas/obscura/A_Vagante_Sombria.png",
    baseAttack: 10,
    baseHealth: 5,
    speed: 1,
    keywords: [
      "indestrutível",
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
    image: "assets/cartas/ignea/Elemental_do_Fogo.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["grito de guerra", "ígneo", "elemental", "corpo-a-corpo"],
  },
  {
    id: 3,
    name: "Espírito Flamejante",
    baseCost: 1,
    image: "assets/cartas/ignea/Espírito_Flamejante.png",
    baseAttack: 1,
    baseHealth: 1,
    speed: 1,
    keywords: ["ígneo", "constante", "corpo-a-corpo"],
  },
  {
    id: 4,
    name: "Fulgurvoltz",
    baseCost: 13,
    image: "assets/cartas/eletrica/Fulgurvoltz.png",
    baseAttack: 10,
    baseHealth: 8,
    speed: 2,
    keywords: ["elétrico", "grito de guerra", "corpo-a-corpo", "elemental"],
  },
  {
    id: 5,
    name: "Ivan Ignisar",
    baseCost: 7,
    image: "assets/cartas/ignea/Ivan_Ignisar.png",
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
    image: "assets/cartas/ignea/Ignisar_transformado.png",
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
    image: "assets/cartas/eletrica/Jack.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 8,
    name: "Layla",
    baseCost: 5,
    image: "assets/cartas/eletrica/Layla.png",
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
    image: "assets/cartas/neutra/Mali_Magarc.png",
    baseAttack: 6,
    baseHealth: 7,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 9000,
    name: "Mali transformado",
    baseCost: 9,
    image: "assets/cartas/neutra/Mali_transformado.png",
    baseAttack: 8,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 10,
    name: "Rusco",
    baseCost: 2,
    image: "assets/cartas/neutra/Rusco.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 11,
    name: "Sabrina",
    baseCost: 4,
    image: "assets/cartas/aquatica/Sabrina.png",
    baseAttack: 4,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 12,
    name: "Thorwells",
    baseCost: 6,
    image: "assets/cartas/eletrica/Thorwells.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 6,
    keywords: ["elétrico", "grito de guerra", "corpo-a-corpo", "celestial"],
  },
  {
    id: 13,
    name: "Tony Raiturus",
    baseCost: 6,
    image: "assets/cartas/eletrica/Tony_Raiturus.png",
    baseAttack: 5,
    baseHealth: 6,
    speed: 6,
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
    image: "assets/cartas/eletrica/Voltexz.png",
    baseAttack: 10,
    baseHealth: 7,
    speed: 5,
    keywords: ["grito de guerra", "elétrico", "longa distância"],
  },
  {
    id: 15,
    name: "Necrófago Espectral",
    baseCost: 1,
    image: "assets/cartas/obscura/Necrófago_Espectral.png",
    baseAttack: 4,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 16,
    name: "O Revivente Eterno",
    baseCost: 2,
    image: "assets/cartas/obscura/O_Revivente_Eterno.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 17,
    name: "Replicador Maldito",
    baseCost: 2,
    image: "assets/cartas/obscura/Replicador_Maldito.png",
    baseAttack: 2,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 18,
    name: "Fênix das Trevas Profana",
    baseCost: 3,
    image: "assets/cartas/obscura/Fênix_das_Trevas_Profana.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 19,
    name: "Titânico Morcegalma",
    baseCost: 4,
    image: "assets/cartas/obscura/Titânico_Morcegalma.png",
    baseAttack: 5,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 20,
    name: "O Espiritomante",
    baseCost: 5,
    image: "assets/cartas/obscura/O_Espiritomante.png",
    baseAttack: 3,
    baseHealth: 6,
    speed: 1,
    keywords: [
      "obscuro",
      "último suspiro",
      "humano",
      "feiticeiro",
      "necromante",
      "longa-distância",
    ],
  },
  {
    id: 21,
    name: "Jeff-The-Death",
    baseCost: 6,
    image: "assets/cartas/obscura/Jeff-The-Death.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["obscuro", "último suspiro", "corpo-a-corpo"],
  },
  {
    id: 22,
    name: "Cientista da Morte",
    baseCost: 3,
    image: "assets/cartas/obscura/Cientista_da_Morte.png",
    baseAttack: 1,
    baseHealth: 4,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 22000,
    name: "Cadáver Reanimado",
    baseCost: 3,
    image: "assets/cartas/obscura/Cadáver_Reanimado.png",
    baseAttack: 3,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 23,
    name: "Rai'Emofitir",
    baseCost: 8,
    image: "assets/cartas/obscura/Rai'Emofitir.png",
    baseAttack: 6,
    baseHealth: 6,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 25,
    name: "Mente Destrutiva",
    baseCost: 5,
    image: "assets/cartas/neutra/Mente_Destrutiva.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 26,
    name: "Eletroad",
    baseCost: 4,
    image: "assets/cartas/eletrica/Eletroad.png",
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
    baseCost: 10,
    image: "assets/cartas/neutra/Sta._Helena_Maria_da_Cura.png",
    baseAttack: 7,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 28,
    name: "Sta. Helena transformada",
    baseCost: 10,
    image: "assets/cartas/neutra/Sta._Helena_transformada.png",
    baseAttack: 7,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 29,
    name: "D'Lorafya",
    baseCost: 6,
    image: "assets/cartas/ignea/D'Lorafya.png",
    baseAttack: 7,
    baseHealth: 5,
    speed: 1,
    keywords: ["ígneo", "grito de guerra", "longa-distância"],
  },
  {
    id: 30,
    name: "Kell",
    baseCost: 10,
    image: "assets/cartas/sagrada/Kell.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 31,
    name: "Neraqa",
    baseCost: 6,
    image: "assets/cartas/aquatica/Neraqa.png",
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
  {
    id: 34,
    name: "Leviatã",
    baseCost: 8,
    image: "assets/cartas/aquatica/Leviatã.png",
    baseAttack: 8,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 35,
    name: "Alexa",
    baseCost: 4,
    image: "assets/cartas/aquatica/Alexa.png",
    baseAttack: 3,
    baseHealth: 10,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 36,
    name: "Espírito Carregado",
    baseCost: 1,
    image: "assets/cartas/eletrica/Espírito_Carregado.png",
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
  {
    id: 39,
    name: "Dragão Ancião do Trovão",
    baseCost: 5,
    image: "assets/cartas/eletrica/Dragão_Ancião_do_Trovão.png",
    baseAttack: 7,
    baseHealth: 4,
    speed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 40,
    name: "Gigante Elétrico",
    baseCost: 5,
    image: "assets/cartas/eletrica/Gigante_Elétrico.png",
    baseAttack: 9,
    baseHealth: 8,
    speed: 2,
    keywords: ["elétrico", "corpo-a-corpo", "gigante", "grito de guerra"],
  },
  {
    id: 49,
    name: "Arcanjo Uriel",
    baseCost: 3,
    image: "assets/cartas/sagrada/Arcanjo_Uriel.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 2,
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
    image: "assets/cartas/neutra/O_Tecnomante.png",
    baseAttack: 2,
    baseHealth: 5,
    speed: 1,
    keywords: ["grito de guerra", "neutro", "longa-distância", "circuitrônico"],
  },
  {
    id: 51,
    name: "Torrente Azul",
    baseCost: 6,
    image: "assets/cartas/aquatica/Torrente_Azul.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 3,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 52,
    name: "Lucien",
    baseCost: 6,
    image: "assets/cartas/sagrada/Lucien.png",
    baseAttack: 3,
    baseHealth: 5,
    speed: 1,
    keywords: [
      "sagrado",
      "longa-distância",
      "humano",
      "monge",
      "condicional",
      "fim do turno",
    ],
  },
  {
    id: 53,
    name: "Gigante Marinho",
    baseCost: 4,
    image: "assets/cartas/aquatica/Gigante_Marinho.png",
    baseAttack: 8,
    baseHealth: 7,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 54,
    name: "Elemental de Água Gigante",
    baseCost: 10,
    image: "assets/cartas/aquatica/Elemental_de_Água_Gigante.png",
    baseAttack: 0,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55,
    name: "Ronan",
    baseCost: 3,
    image: "assets/cartas/ignea/Ronan.png",
    baseAttack: 4,
    baseHealth: 3,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55000,
    name: "Ronan transformado",
    baseCost: 3,
    image: "assets/cartas/modo_truco/Ronan_transformado.png",
    baseAttack: 6,
    baseHealth: 4,
  },
  {
    id: 56,
    name: "Zarvok",
    baseCost: 5,
    image: "assets/cartas/ignea/Zarvok.png",
    baseAttack: 5,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 57,
    name: "Gigante Flamejante",
    baseCost: 4,
    image: "assets/cartas/ignea/Gigante_Flamejante.png",
    baseAttack: 8,
    baseHealth: 7,
    speed: 1,
    keywords: ["ígneo", "corpo-a-corpo", "grito de guerra", "gigante"],
  },
  {
    id: 58,
    name: "Piromante Ardente",
    baseCost: 2,
    image: "assets/cartas/ignea/Piromante_Ardente.png",
    baseAttack: 3,
    baseHealth: 2,
    speed: 1,
    keywords: ["ígneo", "longa-distância", "grito de guerra", "humano", "mago"],
  },
  {
    id: 59,
    name: "Avatar do Fogo",
    baseCost: 5,
    image: "assets/cartas/ignea/Avatar_do_Fogo.png",
    baseAttack: 5,
    baseHealth: 4,
    speed: 1,
    keywords: ["ígneo", "grito de guerra", "longa-distância", "avatar"],
  },
  {
    id: 60,
    name: "Irina Lança-Chamas",
    baseCost: 4,
    image: "assets/cartas/ignea/Irina_Lança-Chamas.png",
    baseAttack: 5,
    baseHealth: 4,
    speed: 1,
    keywords: [
      "ígneo",
      "longa-distância",
      "grito de guerra",
      "humano",
      "mutante",
    ],
  },
  {
    id: 61,
    name: "Esther",
    baseCost: 2,
    image: "assets/cartas/ignea/Esther.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 62,
    name: "Brutamontes Chocante",
    baseCost: 8,
    image: "assets/cartas/eletrica/Brutamontes_Chocante.png",
    baseAttack: 7,
    baseHealth: 7,
    speed: 2,
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
    image: "assets/cartas/eletrica/Eletrocaçadora_Vesper.png",
    baseAttack: 7,
    baseHealth: 5,
    speed: 3,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 64,
    name: "Dragãozinho Flamejante",
    baseCost: 1,
    image: "assets/cartas/ignea/Dragãozinho_Flamejante.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 1,
    keywords: ["ígneo", "voo", "corpo-a-corpo", "dragão", "grito de guerra"],
  },
  {
    id: 65,
    name: "David-The-Titanslayer",
    baseCost: 4,
    image: "assets/cartas/neutra/David-The-Titanslayer.png",
    baseAttack: 6,
    baseHealth: 3,
    speed: 1,
    keywords: ["neutro", "corpo-a-corpo", "humano", "grito de guerra"],
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    baseCost: 1,
    image: "assets/cartas/obscura/Diabrete_Sombrio.png",
    baseAttack: 2,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 67,
    name: "Agonox",
    baseCost: 5,
    image: "assets/cartas/obscura/Agonox.png",
    baseAttack: 4,
    baseHealth: 5,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 68,
    name: "Diabrete Elétrico",
    baseCost: 1,
    image: "assets/cartas/eletrica/Diabrete_Elétrico.png",
    baseAttack: 1,
    baseHealth: 1,
    speed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 69,
    name: "Oráculo das Marés",
    baseCost: 2,
    image: "assets/cartas/aquatica/Oráculo_das_Marés.png",
    baseAttack: 0,
    baseHealth: 4,
    speed: 1,
    keywords: ["aquático", "benevolente", "grito de guerra", "condicional"],
  },
  {
    id: 70,
    name: "Thalassor",
    baseCost: 7,
    image: "assets/cartas/aquatica/Thalassor.png",
    baseAttack: 7,
    baseHealth: 9,
    speed: 1,
    keywords: ["aquático", "tritão", "corp-a-corpo", "constante"],
  },
  {
    id: 71,
    name: "Odon, Mestre das Armas",
    baseCost: 4,
    image: "assets/cartas/neutra/Odon_Mestre_das_Armas.png",
    baseAttack: 4,
    baseHealth: 4,
    speed: 1,
    keywords: ["neutro", "anão", "corpo-a-corpo", "grito de guerra"],
  },
  {
    id: 72,
    name: "Sengoku",
    baseCost: 7,
    image: "assets/cartas/neutra/Sengoku.png",
    baseAttack: 7,
    baseHealth: 7,
    speed: 3,
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
    image: "assets/cartas/neutra/Drake_Damian.png",
    baseAttack: 2,
    baseHealth: 2,
    speed: 4,
    keywords: ["neutro", "humano", "corpo-a-corpo", "esquiva", "constante"],
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    baseCost: 3,
    image: "assets/cartas/aquatica/Emissário_da_Água_da_Vida.png",
    baseAttack: 3,
    baseHealth: 4,
    speed: 1,
    keywords: ["aquático", "longa-distância", "grito de guerra"],
  },
];


const restrictedCardsToPlay = [
  {
    id: 40,
    name: "Gigante Elétrico",
    restriction: function () {
      // Ele só pode ser jogado se um total de 3+ de mana adicional foi gerada em seu favor neste turno
      const canPlayTheCard = additionalManaThisTurn >= 3 ? true : false;
      return canPlayTheCard;
    },
  },

  {
    id: 57,
    name: "Gigante Flamejante",
    restriction: function () {
      // Ele só pode ser jogado se o avatar do jogador adversário possuir 12 ou menos de vida
      const canPlayTheCard =
        Number(opponentAvatar.textContent) <= 12 ? true : false;
      return canPlayTheCard;
    },
  },
  // restante das cartas que possuem restrições
];

// -------------------------------------------------
// Mapa para armazenar os listeners de clique associados a cada cardContainer
const clickListenersMap = new Map();

//------------------------------------------------------------------------------------------

const handElement = document.getElementById("hand");

// WebSocket
const ws = new WebSocket('wss://uclagamewsserver.onrender.com');
//const ws = new WebSocket("ws://192.168.0.13:8081");

ws.onopen = () => {
  console.log("Eu sou um cliente e estou conectado ao servidor.");
};

ws.onmessage = (event) => {
  console.log("Mensagem recebida do servidor:", event.data);
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

const endTurnButton = document.querySelector("#endTurn");

function handleMessageFromServer(message) {
  console.log("Mensagem recebida do servidor");
  console.log("Tipo da mensagem:", message.type);

  switch (message.type) {
    case "yourUserId":
      console.table(message);
      player.id = message.data;
      break;
    case "nicknameInUse":
      const message2 = message.message;
      if (message2) {
        alert(message2);
      }
      break;

    case "requestDeckCode":
      console.log(message.message);
      askForDeckCode();
      break;

    case "deckShuffled":
      currentDeck = message.data;
      starterDeck = currentDeck;
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
      if (message.data.slotNumber) {
        const card = message.data.novaCarta;
        selectBattlefieldSlot({ card }, message.data.slotNumber);
      } else {
        handCardCount--;
        selectBattlefieldSlot(message.data);
      }
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
        "Adicionar carta ao campo de batalha do inimigo para os dados: "
      );
      console.table(message.data);
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
    case "applyHealingToCard":
    case "applyDamageToCard":
    case "destroyCardOrder":
      updateCardStats(message.data);
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

    case "keywordAdded":
      updateCardKeywords(message.data.keyword, message.data.cardData);
      break;

    case "turnEndRequestDenied":
      if (message.type) {
        turnEndRequested = false;
        endTurnButton.disabled = false;
      }
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

  const shuffleCardsSound = soundEffects.find(
    (s) => s.name === "shufflingSound"
  );
  shuffleCardsSound.src = shuffleCardsSound.soundFile;
  shuffleCardsSound.play = function () {
    let audio = new Audio(shuffleCardsSound.src);
    audio.play();
  };
  shuffleCardsSound.play();

  drawCard(6);
  addMana(1, false);
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

      const cardDrawSound = soundEffects.find(
        (s) => s.name === "cardDrawSound"
      );
      cardDrawSound.src = cardDrawSound.soundFile;
      cardDrawSound.play = function () {
        let audio = new Audio(cardDrawSound.src);
        audio.play();
      };
      cardDrawSound.play();

      // Atualiza o contador de cartas no deck
      deckCardCount = currentDeck.length;
      console.log("Quantidade de cartas no deck atualmente:", deckCardCount);

      console.log("Current Deck depois de comprar uma carta: ");
      console.table(currentDeck);

      // Exibe a carta comprada na mão do jogador
      displayCardInHand({ cardData: cardDrawn, cardElement: undefined });

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

function opponentPickCardInHand(amount, whatToDo) {
  const message = {
    type: "opponentPickCardInHand",
    data: { amount },
    whatToDo, // Indica o que fazer com as cartas não escolhidas
  };
  sendMessageToServer(JSON.stringify(message));
}

//------------------------------------------------------------------------------------------

// Função para adicionar o listener do botão "Jogar"
const playCardListener = (cardContainer) => {
  if (turnEndRequested) {
    alert(
      "Você não pode fazer isto agora, uma vez que já solicitou finalização de turno."
    );
    return;
  }

  const playCardButton = cardContainer.querySelector(".playCard-button");

  // Verifica se o botão já existe para evitar duplicação
  if (!playCardButton) {
    console.log('Botão "Jogar" não existe, criando novo botão.');
    const newPlayCardButton = document.createElement("button");
    newPlayCardButton.className = "playCard-button";
    newPlayCardButton.innerHTML = "Jogar";
    cardContainer.appendChild(newPlayCardButton);
    console.log(
      'Botão "Jogar" criado e adicionado ao DOM para a carta:',
      cardContainer
    );

    // Adiciona o event listener para jogar a carta
    newPlayCardButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Impede a propagação do clique para o documento
      newPlayCardButton.remove(); // Remove o botão após clicar
      playCardRequest(cardContainer); // Função para processar a jogada da carta
      console.log(
        'Botão "Jogar" clicado e removido para a carta:',
        cardContainer
      );
    });
  } else {
    console.log('Botão "Jogar" já existe, não criando outro botão.');
  }
};

//------------------------------------------------------------------------------------------

function displayCardInHand({ cardData, cardElement }) {
  // Verifica se cardData ou cardElement estão presentes
  if (!cardData && !cardElement) {
    console.error("Nenhum dado de carta recebido.");
    return;
  }

  // Se cardData não estiver presente, tente buscar com base no cardElement
  if (!cardData && cardElement) {
    cardData = cards.find((card) => card.id == cardElement.dataset.id);
  }

  // Cria o elemento da carta se não estiver presente
  cardElement = cardElement || createCardElement(cardData);

  // Verifica se a mão já está cheia
  if (handCardCount >= 9) {
    console.warn("A mão já está cheia. A carta não será adicionada.");
    return;
  }

  // Incrementa o contador de cartas na mão
  handCardCount++;

  console.log("Exibir carta na mão.");
  console.log("Dados da carta recebidos como argumento: ");
  console.table(cardData);

  // Define o handleClick específico para cada carta
  const handleClick = () => {
    console.log("HandleClick ativado para a carta:", cardElement);
    playCardListener(cardElement);
  };

  // Adiciona o listener de clique para exibir o botão "Jogar"
  cardElement.addEventListener("click", handleClick);
  console.log(
    "Listener de clique adicionado para a carta com os dados:",
    JSON.stringify(cardData)
  );

  // Armazena o listener no mapa
  clickListenersMap.set(cardElement, handleClick);

  // Adiciona um listener de hover à carta
  addHoverListenerToCard(cardElement);

  // Define a posição inicial fora da tela ou fora da área visível
  cardElement.style.transform = "translateX(200px)";
  cardElement.style.opacity = "0"; // Invisível no início

  // Adiciona a carta ao elemento da mão
  handElement.appendChild(cardElement);

  // Usa um pequeno delay para garantir que o browser registre a mudança de estado (para a animação funcionar)
  setTimeout(() => {
    // Aplica a classe de animação para deslizar a carta
    cardElement.classList.add("slide-in-animation");
  }, 10); // Pequeno atraso para garantir que o elemento já está no DOM e o browser registra sua inserção

  // Remove a classe de animação e redefine os estilos depois que a animação terminar
  cardElement.addEventListener(
    "animationend",
    () => {
      // Remova a classe de animação
      cardElement.classList.remove("slide-in-animation");

      // Redefina os estilos finais
      cardElement.style.transform = "translateX(0)";
      cardElement.style.opacity = "1";
    },
    { once: true }
  ); // O evento será acionado apenas uma vez
}

//------------------------------------------------------------------------------------------

function createCardElement(cardInstanceData) {
  // Criação do elemento da carta
  const cardContainer = document.createElement("div");
  cardContainer.className = "carta";
  cardContainer.dataset.id = cardInstanceData.id;
  cardContainer.dataset.instanceId = cardInstanceData.instanceId;

  const cardData = cards.find((c) => c.id === Number(cardInstanceData.id));

  // Adiciona a imagem
  if (cardData) {
    const imagem = document.createElement("img");
    imagem.src = cardData.image;
    imagem.alt = cardInstanceData.name;
    imagem.classList.add("card-image");
    cardContainer.appendChild(imagem);
  } else {
    console.error(
      `Dados da carta não encontrados no array cards para a id: ${cardInstanceData.id}`
    );
  }

  // Adiciona o custo
  const cost = document.createElement("div");
  cost.textContent = `${cardInstanceData.currentCost}`;
  cost.style.color =
    cardInstanceData.currentCost > cardInstanceData.baseCost
      ? "red"
      : cardInstanceData.currentCost < cardInstanceData.baseCost
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
  attack.textContent = `${cardInstanceData.currentAttack}`;
  attack.style.color =
    cardInstanceData.currentAttack > cardInstanceData.baseAttack
      ? "red"
      : cardInstanceData.currentAttack < cardInstanceData.baseAttack
      ? "lightgreen"
      : "white";
  statsDisplay.appendChild(attack);

  // Adiciona a vida
  const health = document.createElement("div");
  health.classList.add("card-health");
  health.textContent = `${cardInstanceData.currentHealth}`;
  health.style.color =
    cardInstanceData.currentHealth > cardInstanceData.baseHealth
      ? "red"
      : cardInstanceData.currentHealth < cardInstanceData.baseHealth
      ? "lightgreen"
      : "white";
  statsDisplay.appendChild(health);

  cardContainer.appendChild(statsDisplay);

  return cardContainer;
}

function playCardRequest(cardContainer) {
  console.log(
    "Enviar ao servidor pedido para jogar carta para a carta: ",
    cardContainer
  );

  const cardInstanceId = cardContainer.dataset.instanceId;

  let message = {
    type: "playCardRequest",
    data: cardInstanceId,
  };
  sendMessageToServer(JSON.stringify(message));
}

//-------------------------------------------------------------------------------------
// ADIÇÃO DE CARTA AO CAMPO DE BATALHA ALIADO

/* // Função para obter o card container
const getCardContainer = (data) =>  {
  let carta, cardContainer;
  console.log("Valor da variável data recebida como parâmetro:");
  console.table(data);

  if (Object.prototype.hasOwnProperty.call(data, "novaCarta")) {
    carta = data.novaCarta;
    if (carta.id) {
      cardContainer = createCardElement(carta);
    } else {
      console.error("A variável carta não possui um valor de id válido.");
      console.table("carta:", carta);
    }
  } else {
    carta = data.card;
    if (handElement) {
      console.log(`Procurando card com instanceId: ${carta.instanceId}`);
      cardContainer = handElement.querySelector(
        `.carta[data-instance-id="${carta.instanceId}"]`
      );
      console.log("Hand Element HTML:", handElement.innerHTML);
    }
  }
  console.log(`Card container encontrado: ${cardContainer ? "Sim" : "Não"}`);
  return { carta, cardContainer };
}
 */
// Função para verificar e executar grito de guerra
function checkAndExecuteWarCry(cardData, cardElement, slotNumber) {
  if (cardData.keywords.includes("grito de guerra")) {
    const playEffect = playEffectsCards.find(
      (c) => c.id === Number(cardData.id)
    );
    if (playEffect) {
      if (typeof playEffect.playEffect === "function") {
        console.log("Executando playEffect para a carta:", cardData.name);
        playEffect.playEffect(cardData, cardElement, slotNumber);
      } else {
        console.error("playEffect não é uma função.");
      }
    } else {
      console.error(
        `Efeito de jogo não encontrado para a carta com id ${cardData.id}.`
      );
    }
  } else {
    console.log(
      `A carta ${cardData.name}, de id ${cardData.id} não possui grito de guerra.`
    );
    addCardToField(cardElement, slotNumber);
  }
}

// Função global para lidar com o clique no slot
function handleSlotClick(event, cardData, cardElement) {
  console.log("cardData: " + cardData);
  event.stopPropagation();

  const selectedSlot = event.target;
  if (selectedSlot instanceof HTMLElement) {
    const slotNumber = Number(selectedSlot.id.replace("slot", ""));
    if (!isNaN(slotNumber)) {
      // Verificar restrições de carta
      const cardHasRestriction = restrictedCardsToPlay.find(
        (c) => c.id === Number(cardData.id)
      );
      if (cardHasRestriction && !cardHasRestriction.restriction(slotNumber)) {
        alert("Você não pode jogar isto agora.");
        return;
      }
      checkAndExecuteWarCry(cardData, cardElement, slotNumber);
    } else {
      console.error(`slotNumber: ${slotNumber} não é um número válido.`);
    }
  } else {
    console.error("selectedSlot não é um elemento HTML/do DOM válido.");
  }
}

// Função global para lidar com cliques fora dos slots destacados
function handleOutsideClick(event, availableSlots, slotClickListener) {
  if (![...availableSlots].some((slot) => slot.contains(event.target))) {
    console.log(
      "Jogada cancelada. Por favor, escolha um slot válido e tente novamente."
    );
    cleanupListenersAndHighlights(availableSlots, slotClickListener);
  }
}

// Função global para limpar ouvintes e destaques
function cleanupListenersAndHighlights(slots, listenerFunction) {
  slots.forEach((slot) => {
    if (slot.classList.contains("highlight")) {
      slot.classList.remove("highlight");
      slot.removeEventListener("click", listenerFunction);
    }
  });
}

// Função global para selecionar o slot do campo de batalha
function selectBattlefieldSlot({ card }, slotNumber = null) {
  const cardData = card;
  console.log(
    "selectBattlefieldSlot triggered.",
    "cardData: " + JSON.stringify(cardData) + " slotNumber: " + slotNumber
  );

  let cardElement = document.querySelector(
    `.carta[data-instance-id="${cardData.instanceId}"]`
  );

  // Verifica se o cardElement é um nó válido
  if (!(cardElement instanceof Node)) {
    console.warn("Card element não encontrado.");

    // Se slotNumber for válido, invocação direta identificada
    if (!isNaN(Number(slotNumber))) {
      console.log(
        "Invocação direta identificada, criando o elemento da carta a ser invocado."
      );
      cardElement = createCardElement(cardData);
    } else {
      console.error("Card element não encontrado e slotNumber é indefinido.");
      return;
    }
  }

  if (slotNumber === null) {
    const availableSlots = document.querySelectorAll(
      ".slots:not(.opponentSlots)"
    );

    // Declara o slotClickListener fora de setupSlotListeners para garantir que a referência seja a mesma
    let slotClickListener;

    // Função para adicionar ouvintes de clique aos slots
    const setupSlotListeners = (slots) => {
      slotClickListener = (event) => {
        event.stopPropagation();
        handleSlotClick(event, cardData, cardElement);
        cleanupListenersAndHighlights(slots, slotClickListener);
      };

      slots.forEach((slot) => {
        slot.classList.add("highlight");
        slot.addEventListener("click", slotClickListener);
      });
    };

    setupSlotListeners(availableSlots);

    // Função para lidar com cliques fora dos slots
    const handleOutsideClickListener = (event) => {
      handleOutsideClick(event, availableSlots, slotClickListener);
      document.removeEventListener("click", handleOutsideClickListener);
    };

    // Adiciona ouvinte global para cliques fora dos slots
    document.addEventListener("click", handleOutsideClickListener);
  } else if (!isNaN(Number(slotNumber))) {
    // Verifica restrições de carta antes de executar WarCry
    const cardHasRestriction = restrictedCardsToPlay.find(
      (c) => c.id === Number(cardData.id) // Corrigido para usar cardData
    );
    if (cardHasRestriction && !cardHasRestriction.restriction(slotNumber)) {
      alert("Você não pode jogar isto agora.");
      return;
    }
    checkAndExecuteWarCry(cardData, cardElement, slotNumber);
  }

  console.log("cardElement:", cardElement);
}

// Função principal de adição de carta ao lado aliado do campo de batalha
function addCardToField(cardElement, slotNumber) {
  const playListener = clickListenersMap.get(cardElement);
  if (playListener) {
    cardElement.removeEventListener("click", playListener);
  }

  if (!(cardElement instanceof Node)) {
    console.error(`cardElement (${cardElement}) não é um Node válido.`);
    console.log(`typeOf cardElement = ${typeof cardElement}`);
    console.table(cardElement);
    console.log(JSON.stringify(cardElement));
    return;
  }

  const selectedSlot = document.getElementById(`slot${slotNumber}`);
  if (selectedSlot) {
    selectedSlot.innerHTML = "";
    selectedSlot.appendChild(cardElement);
  } else {
    console.error(`selectedSlot inválido.)`);
    return;
  }

  addAttackListeners(cardElement);
  addHoverListenerToCard(cardElement);
  const cardCostDisplay = cardElement.querySelector(".card-cost-display");
  const cardCost = Number(cardCostDisplay.textContent);
  spendMana(cardCost);

  const cardInstanceId = cardElement.dataset.instanceId;

  // Ajusta o tamanho das fontes dos elementos de status da carta
  const cardStats = cardElement.querySelector(".card-stats");
  cardStats.querySelector(".card-attack").style.fontSize = "18px";
  cardStats.querySelector(".card-health").style.fontSize = "18px";

  cardElement.style.maxWidth = "100%";

  // Enviar mensagem ao servidor sobre a adição da carta
  const message = {
    type: "addCardToOpponentField",
    data: { cardInstanceId, slotNumber },
  };
  sendMessageToServer(JSON.stringify(message));
}

// --------------------------------------------------------------

const summonCardRequest = (cardContainer, cardSummonedSlot) => {
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
};

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
  const attackListener = (event) => {
    event.stopPropagation();
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
      const allHighlightedElements = document.querySelectorAll(".highlight");
      allHighlightedElements.forEach((highlightedElement) => {
        highlightedElement.classList.remove("highlight");
      });
    }
  });

  // Adiciona o listener ao mapa e ao cardContainer
  clickListenersMap.set(cardContainer, attackListener);
  cardContainer.addEventListener("click", attackListener);
}

// ------------------------------------------------------------
function highlightAttackOption(alvoElement, atacanteElement) {
  if (turnEndRequested) {
    alert(
      "Você não pode fazer isto agora, uma vez que já solicitou finalização de turno."
    );
    return;
  }

  let opponentAvatar = document.getElementById("opponent-health");

  // Destaca o alvo
  alvoElement.classList.add("highlight");

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

    const allAttackButtons = document.querySelectorAll(".attack-button");
    allAttackButtons.forEach((attackButton) => {
      attackButton.remove();
    });
    const allHighlightedElements = document.querySelectorAll(".highlight");
    allHighlightedElements.forEach((highlightedElement) => {
      highlightedElement.classList.remove("highlight");
    });
    attackButton.remove();
  });

  // Adiciona o botão de ataque ao alvo
  alvoElement.appendChild(attackButton);
}

// ------------------------------------------------------------

function getCardsInField(side = "both") {
  const cardsInField = [];

  switch (side) {
    case "both":
      const allCards = battlefield.querySelectorAll(".carta");
      allCards.forEach((cardElement) => {
        cardsInField.push(cardElement);
      });
      break;

    case "allied":
      alliedField = battlefield.querySelectorAll(".slots:not(.opponentSlots)");
      alliedField.forEach((alliedSlot) => {
        const cardElement = alliedSlot.querySelector(".carta");
        if (cardElement) {
          cardsInField.push(cardElement);
        }
      });
      break;

    case "enemy":
      enemyField = battlefield.querySelectorAll(".opponentSlots");
      enemyField.forEach((opponentSlot) => {
        const cardElement = opponentSlot.querySelector(".carta");
        if (cardElement) {
          cardsInField.push(cardElement);
        }
      });
      break;
  }

  console.log("cardsInField =");
  console.table(cardsInField);
  return cardsInField;
}

function getAdjacentCards(slotNumber) {
  const adjacentCards = [];

  switch (slotNumber) {
    case 1:
      adjacentCards.push(document.querySelector("#opponentSlot2"));
      break;
    case 2:
      adjacentCards.push(document.querySelector("#opponentSlot1"));
      adjacentCards.push(document.querySelector("#opponentSlot3"));
      break;
    case 3:
      adjacentCards.push(document.querySelector("#opponentSlot2"));
      break;
    case 4:
      adjacentCards.push(document.querySelector("#opponentSlot5"));
      break;
    case 5:
      adjacentCards.push(document.querySelector("#opponentSlot4"));
      adjacentCards.push(document.querySelector("#opponentSlot6"));
      break;
    case 6:
      adjacentCards.push(document.querySelector("#opponentSlot5"));
      break;
  }

  // Filtra e retorna apenas os slots que possuem uma carta
  return adjacentCards
    .map((slot) => (slot ? slot.querySelector(".carta") : null))
    .filter((card) => card !== null);
}

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

// Constantes para as zonas de saúde e cores correspondentes
const HEALTH_ZONES = [
  { zone: "extra", threshold: 25, color: "lightgreen" },
  { zone: "safe", threshold: 20, color: "darkgreen" },
  { zone: "alarming", threshold: 15, color: "orange" },
  { zone: "risky", threshold: 7, color: "darkred" },
  { zone: "critical", threshold: 1, color: "red" },
];

// Função para determinar a zona de saúde e cor com base nos pontos de saúde
function getHealthZone(health) {
  for (let i = 0; i < HEALTH_ZONES.length; i++) {
    if (health >= HEALTH_ZONES[i].threshold) {
      return HEALTH_ZONES[i];
    }
  }
  // Retorna a zona "critical" por padrão
  return { zone: "critical", color: "red" };
}

// Função para aplicar dano ao avatar
function applyDamageToAvatar({ target, avatarData }) {

  const avatarHealth = Number(avatarData.health);

  console.log(
    `applyDamageToAvatar triggered com target: ${target}, e avatarHealth = ${avatarHealth}`
  );

  let avatarElement;
  let healthZoneVar;

  // Determina o avatar a ser atualizado
  if (target === "ally") {
    avatarElement = alliedAvatar;
    healthZoneVar = "healthZone";
  } else if (target === "enemy" || target === "opponent") {
    avatarElement = opponentAvatar;
    healthZoneVar = "opponentHealthZone";
  } else {
    console.error(`target inválido: ${target}`);
    return;
  }

  // Atualiza o valor de saúde do avatar
  avatarElement.textContent = avatarHealth;

  const hitSound = soundEffects.find((s) => s.name === "hitSound");
  hitSound.src = hitSound.soundFile;
  hitSound.play = function () {
    let audio = new Audio(hitSound.src);
    audio.play();
  };
  hitSound.play();

  // Determina a zona de saúde e cor
  const { zone, color } = getHealthZone(avatarHealth);

  // Atualiza a zona de saúde e a cor do avatar
  if (target === "ally") {
    healthZone = zone;
  } else {
    opponentHealthZone = zone;
  }
  avatarElement.style.color = color;
}

// Função para aplicar a cura ao avatar
function applyHealingToAvatar(newHealth, avatarType) {
  console.log("applyHealingToAvatar chamada.");
  console.log(`newHealth = ${newHealth}, avatarType = ${avatarType}`);

  let avatarElement;

  // Determina o avatar a ser atualizado
  if (avatarType === "allied") {
    avatarElement = alliedAvatar;
  } else if (avatarType === "enemy") {
    avatarElement = opponentAvatar;
  } else {
    console.error(`avatarType inválido: ${avatarType}`);
    return;
  }

  // Atualiza o valor de saúde do avatar
  avatarElement.textContent = newHealth;

  const healthIncreaseSound = soundEffects.find(
    (s) => s.name === "healthIncreaseSound"
  );
  healthIncreaseSound.play = function () {
    let audio = new Audio(healthIncreaseSound.soundFile);
    audio.play();
  };
  healthIncreaseSound.play();

  // Determina a zona de saúde e cor
  const { zone, color } = getHealthZone(newHealth);

  // Atualiza a zona de saúde e a cor do avatar
  if (avatarType === "allied") {
    healthZone = zone;
  } else {
    opponentHealthZone = zone;
  }
  avatarElement.style.color = color;
}

// ----------------------------------------------------------------

function dealDirectDamageRequest(damage, targetElement) {
  console.log(
    `dealDirectDamageRequest chamada com damage = ${damage} e targetElement = ${targetElement}`
  );

  let message = {};

  console.log(targetElement.classList);
  undefined;

  if (targetElement.classList.contains("carta")) {
    const cardInstanceId = targetElement.dataset.instanceId;

    message = {
      type: "directDamageRequest",
      data: { damage, cardInstanceId },
    };
  } else if (targetElement.classList.contains("avatar")) {
    const avatarId = targetElement.id; // Obtém o ID diretamente

    if (avatarId === "opponent-health" || avatarId === "player-health") {
      message = {
        type: "directDamageToAvatar",
        data: { damage, avatarId },
      };
    }
  }

  // Envia a mensagem ao servidor apenas se a mensagem foi preenchida
  if (Object.keys(message).length > 0) {
    sendMessageToServer(JSON.stringify(message));
  }
}

// ----------------------------------------------------------------

function keywordAdditionRequest(keyword, cardElement) {
  console.log("keywordAdditionRequest triggered.");
  console.table(`keyword = ${keyword}, cardElement = ${cardElement}`);

  const cardInstanceId = cardElement.dataset.instanceId;

  const message = {
    type: "keywordAdditionRequest",
    data: { keyword: keyword, instanceId: cardInstanceId },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ----------------------------------------------------------------



// -------------------------------------------------------------------------------------

function pickCardInHand(amount) {
  let chosenCards = [];
  let unchosenCards = [];

  const cardsInHand = handElement.querySelectorAll(".carta");

  // Criação do modal para escolha das cartas
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Escolha uma carta da mão:";
  modalContent.appendChild(modalTitle);

  // Adiciona botões para cada carta
  cardsInHand.forEach((cardElement) => {
    const card = starterDeck.find((c) => c.id == cardElement.dataset.id);
    const cardButton = document.createElement("button");
    cardButton.textContent = card.name;
    cardButton.classList.add("card-button");

    const cardImage = document.createElement("img");
    cardImage.src = card.image;
    cardImage.alt = `Carta ${card.id}`;
    cardButton.appendChild(cardImage);

    // Seleciona a carta ao clicar no botão
    cardButton.addEventListener("click", () => {
      chosenCards.push(card);
      moveToTopAndDraw(card); // Move a carta selecionada e a desenha
      cardButton.remove(); // Remove o botão após escolha

      // Verifica se atingiu a quantidade necessária
      if (chosenCards.length === amount) {
        finalizeSelection();
      }
    });

    modalContent.appendChild(cardButton);
  });

  // Botão de "Pular"
  const skipButton = document.createElement("button");
  skipButton.textContent = "Pular";
  skipButton.classList.add("skip-button");
  skipButton.addEventListener("click", finalizeSelection);

  modalContent.appendChild(skipButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Função para finalizar a escolha
  function finalizeSelection() {
    cardsInHand.forEach((cardElement) => {
      const card = starterDeck.find((c) => c.id == cardElement.dataset.id);
      if (!chosenCards.includes(card)) {
        unchosenCards.push(card); // Adiciona às cartas não escolhidas
      }
    });
    closeModal();
    return { chosenCards, unchosenCards }; // Retorna as cartas escolhidas e não escolhidas
  }

  // Função para fechar o modal
  function closeModal() {
    modal.remove();
  }

  return { chosenCards, unchosenCards };
}

// -------------------------------------------------------------------------------------
// TURNO RELATED

let turnEndRequested = false;
let currentTurnIndex = 1;
let isLastTurn;


/* EXEMPLO DE UM OBJETO DE AÇÃO DO TURNO {
  type: 'cardPlayed',  // Tipo da ação (ex: jogar carta)
  card: carta1,      // Carta jogada
  player: 'player1'  // Jogador que realizou a ação
}, */

const playsHistory = [
  {
    turn: 1,  // Número do turno
    actions: []
  },
  // outros turnos...
  {
  }
]


const endTurnEffectsCards = [
  {
    id: 4,
    name: "Fulgurvoltz",
    inFieldOnly: false,
    effect: (card, origin) => {
      let previousCost;
      let newCost;
      let instanceId;

      if (origin === "DOM") {
        const cardElement = card;
        if (cardElement.dataset.instanceId) {
          instanceId = cardElement.dataset.instanceId;
          previousCost = Number(
            cardElement.querySelector(".card-cost-display").textContent
          );
          console.log(`Custo do Fulgurvoltz antes: ${previousCost}`);
          newCost = Math.max(4, previousCost - unspentManaThisTurn); // Garante que o custo não fique menor que 4
          console.log(`Custo do Fulgurvoltz depois: ${newCost}`);

          const cardCostDisplay =
            cardElement.querySelector(".card-cost-display");
          if (cardCostDisplay) {
            cardCostDisplay.textContent = newCost;
            cardCostDisplay.style.color = "lightgreen";
          }
        } else {
          console.error("Elemento da carta não encontrado no DOM.");
        }
      } else if (origin === "deck") {
        const cardObject = currentDeck.find((c) => c.id === 4); // Obtém a carta do deck
        if (cardObject) {
          instanceId = cardObject.instanceId;
          previousCost = cardObject.currentCost;
          console.log(`Custo do Fulgurvoltz antes: ${previousCost}`);
          newCost = Math.max(4, previousCost - unspentManaThisTurn); // Garante que o custo não fique menor que 2
          console.log(`Custo do Fulgurvoltz depois: ${newCost}`);

          // Atualiza o custo no objeto da carta
          cardObject.currentCost = newCost;
        } else {
          console.error("Carta não encontrada no deck.");
        }
      }

      // Envia mensagem ao servidor
      const message = {
        type: "cardCostUpdated",
        data: { instanceId, newCost },
      };
      sendMessageToServer(JSON.stringify(message));
    },
  },

  {
    id: 14,
    name: "Voltexz",
    inFieldOnly: false,
    effect: (card, origin) => {
      let previousCost;
      let newCost;
      let instanceId;

      if (origin === "DOM") {
        const cardElement = card;
        if (cardElement.dataset.instanceId) {
          instanceId = cardElement.dataset.instanceId;
          previousCost = Number(
            cardElement.querySelector(".card-cost-display").textContent
          );
          console.log(`Custo da Voltexz antes: ${previousCost}`);
          newCost = Math.max(2, previousCost - 2 * unspentManaThisTurn); // Garante que o custo não fique menor que 2
          console.log(`Custo da Voltexz depois: ${newCost}`);

          const cardCostDisplay =
            cardElement.querySelector(".card-cost-display");
          if (cardCostDisplay) {
            cardCostDisplay.textContent = newCost;
            cardCostDisplay.style.color = "lightgreen";
          }
        } else {
          console.error("Elemento da carta não encontrado no DOM.");
        }
      } else if (origin === "deck") {
        const cardObject = currentDeck.find((c) => c.id === 14); // Obtém a carta do deck
        if (cardObject) {
          instanceId = cardObject.instanceId;
          previousCost = cardObject.currentCost;
          console.log(`Custo da Voltexz antes: ${previousCost}`);
          newCost = Math.max(2, previousCost - 2 * unspentManaThisTurn); // Garante que o custo não fique menor que 2
          console.log(`Custo da Voltexz depois: ${newCost}`);

          // Atualiza o custo no objeto da carta
          cardObject.currentCost = newCost;
        } else {
          console.error("Carta não encontrada no deck.");
        }
      }

      // Envia mensagem ao servidor
      const message = {
        type: "cardCostUpdated",
        data: { instanceId, newCost },
      };
      sendMessageToServer(JSON.stringify(message)); 

    },
  },

  // outras cartas de efeito de fim de turno
];

function endTheTurn() {
  console.log("endTheTurn chamada.");

  unspentManaThisTurn = 0;
  additionalManaThisTurn = 0;
  unspentManaTotal += mana;
  unspentManaThisTurn += mana;
  mana = 0;
  if (currentTurnIndex >= 5) {
    calculateTurnScore();
  }

  if (!isLastTurn) {
    currentTurnIndex++;
    startTheTurn();
  }

  console.log(
    `Mana não gasta do turno atual antes de chamar os efeitos de fim de turno: ${unspentManaThisTurn}`
  );
  console.log(
    `Mana total não gasta antes de chamar os efeitos de fim de turno: ${unspentManaTotal}`
  );
  checkForEndTurnEffects();
  endTurnButton.disabled = false;
}

function checkForEndTurnEffects() {
  // Obtém todas as cartas do DOM
  const cardsInDOM = Array.from(document.querySelectorAll(".carta"));

  // 1. Processar cartas que estão no DOM
  cardsInDOM.forEach((cardElement) => {
    const instanceId = cardElement.dataset.instanceId;
    const cardId = Number(cardElement.dataset.id);

    // Recupera o efeito de fim de turno correspondente à carta
    const endTurnEffect = endTurnEffectsCards.find((c) => c.id === cardId);

    // Verifica se o efeito de fim de turno foi encontrado e se é uma função
    if (endTurnEffect && typeof endTurnEffect.effect === "function") {
      // Aplica o efeito passando o elemento do DOM e um indicador de origem
      console.log(
        `Aplicando efeito de fim de turno da carta ${cardId} que está no DOM.`
      );
      endTurnEffect.effect(cardElement, "DOM"); // Indica que a origem é o DOM
    } else {
      console.warn(
        `Efeito de fim de turno não encontrado ou não é uma função para a carta ${cardId}.`
      );
    }
  });

  // 2. Processar cartas que estão no deck, apenas se inFieldOnly for true
  currentDeck.forEach((card) => {
    const endTurnEffect = endTurnEffectsCards.find((c) => c.id === card.id);

    if (endTurnEffect && typeof endTurnEffect.effect === "function") {
      if (endTurnEffect.inFieldOnly) {
        // Verifica se a carta está no campo
        const cardElement = document.querySelector(
          `.carta[data-instance-id="${card.instanceId}"]`
        );
        if (cardElement && cardElement.closest(".slots")) {
          console.log(
            `Aplicando efeito de fim de turno da carta ${card.id} que está no campo.`
          );
          endTurnEffect.effect(cardElement, "deck"); // Indica que a origem é o deck
        } else {
          console.warn(
            `A carta ${card.id} não está em campo. Efeito de fim de turno não aplicado.`
          );
        }
      }
    } else {
      console.warn(
        `Efeito de fim de turno não encontrado ou não é uma função para a carta ${card.id}.`
      );
    }
  });
}

function startTheTurn() {
  console.log("New turn has started.");

  showBigTurnDisplay();

  const currentTurnDisplay = document.getElementById("currentTurnDisplay");
  currentTurnDisplay.textContent = `Turno ${currentTurnIndex}`;

  const normalTurnMana = currentTurnIndex;

  addMana(normalTurnMana, false);
}

function showBigTurnDisplay() {
  //Display do turno grande
  let bigTurnDisplay = document.createElement("div");

  bigTurnDisplay.id = "big__turn__display";

  bigTurnDisplay.textContent = `Turno ${currentTurnIndex}`;

  bigTurnDisplay.classList.add("active");

  document.body.appendChild(bigTurnDisplay);

  //remover ele
  setTimeout(() => {
    bigTurnDisplay.remove();
  }, 3500);
}

// -------------------------------------------------------------------------------------

// Constantes para os pontos de saúde
const HEALTH_POINTS = {
  extra: 20,
  safe: 15,
  alarming: 10,
  risky: 5,
  critical: 0,
};

// Função para calcular o total de pontos de ataque das cartas em campo
function getTotalAttackPoints(cards) {
  let totalAttack = 0;

  cards.forEach((card) => {
    if (!card) {
      console.warn("Slot sem carta encontrada.");
      return;
    }

    const statsDiv = card.querySelector(".card-stats");
    if (!statsDiv) {
      console.warn("Elemento '.card-stats' não encontrado:", card);
      return;
    }

    const attackDiv = statsDiv.querySelector(".card-attack");
    if (!attackDiv) {
      console.warn("Elemento '.card-attack' não encontrado:", card);
      return;
    }

    totalAttack += Number(attackDiv.textContent);
  });

  return totalAttack;
}

// Função para calcular os pontos do avatar com base em sua saúde
function getAvatarHealthPoints(healthZone) {
  return HEALTH_POINTS[healthZone] || 0;
}

// Função para calcular a pontuação de um turno
function calculateTurnScore() {
  console.log("calculateTurnScore chamada.");

  const alliedAttackTotal = getTotalAttackPoints(getCardsInField("allied"));
  const opponentAttackTotal = getTotalAttackPoints(getCardsInField("enemy"));

  console.log("Pontos conquistados com o ataque das cartas em campo:");
  console.log(`You: ${alliedAttackTotal} | Opponent: ${opponentAttackTotal}`);

  const alliedAvatarHPPoints = getAvatarHealthPoints(healthZone);
  const opponentAvatarHPPoints = getAvatarHealthPoints(opponentHealthZone);

  console.log("Pontos conquistados com a vida do avatar:");
  console.log(
    `You: ${alliedAvatarHPPoints} | Opponent: ${opponentAvatarHPPoints}`
  );

  const yourTurnScore = alliedAttackTotal + alliedAvatarHPPoints;
  const opponentTurnScore = opponentAttackTotal + opponentAvatarHPPoints;

  console.log("Pontos de cada jogador neste turno:");
  console.log(`Você: ${yourTurnScore} | Oponente: ${opponentTurnScore}`);

  determineTurnWinner(yourTurnScore, opponentTurnScore);
}

// Função para determinar o vencedor do turno
function determineTurnWinner(yourScore, opponentScore) {
  if (yourScore > opponentScore) {
    updateMatchScore("me");
  } else if (opponentScore > yourScore) {
    updateMatchScore("opponent");
  } else {
    alert("Este turno resultou em um empate.");
  }
}

function updateMatchScore(winnerOfTheTurn) {
  console.log(
    "Atualizar pontuação da partida chamada. Vencedor do turno:",
    winnerOfTheTurn
  );
  if (winnerOfTheTurn === "me") {
    //!isAmplifierActive ?
    playerMatchPoints += 2;
    yourScoreboard.textContent = playerMatchPoints;

    alert("Muito bem. Você VENCEU este turno!");
  } else if (winnerOfTheTurn === "opponent") {
    opponentMatchPoints += 2;
    opponentScoreboard.textContent = opponentMatchPoints;

    alert("Cuidado. Você PERDEU este turno!");
  } else {
    console.error(
      "Vencedor do turno não especificado ou não é uma string válida."
    );
    return;
  }

  alert(
    `Resultado do turno: Você:${playerMatchPoints} x Oponente: ${opponentMatchPoints}`
  );

  let message = {
    type: "myUpdatedScore",
    username: player.username,
    data: { playerMatchPoints },
  };

  console.log(
    `Enviando ao servidor a pontuação ${playerMatchPoints} de ${player.username}`
  );

  if (playerMatchPoints >= 6 || opponentMatchPoints >= 6) {
    isLastTurn = true;
  }

  sendMessageToServer(JSON.stringify(message));
}

// -------------------------------------------------------------------------------------

function gameOver(result) {
  alert("Fim de jogo.");
  if (result === "winner") {
    console.log("Parabéns! Você venceu a partida!");

    const victorySound = soundEffects.find((s) => s.name === "victorySound");
    victorySound.src = victorySound.soundFile;
    victorySound.play = function () {
      let audio = new Audio(victorySound.src);
      audio.play();
    };
    victorySound.play();
    alert("Parabéns!! Você ganhou a partida.");
    victoryScreen();
  } else if (result === "loser") {
    console.log(
      "Essa não. Você perdeu a partida. Mais sorte da próxima vez..."
    );

    const defeatSound = soundEffects.find((s) => s.name === "defeatSound");
    defeatSound.src = defeatSound.soundFile;
    defeatSound.play = function () {
      let audio = new Audio(defeatSound.src);
      audio.play();
    };
    defeatSound.play();
    alert("Ah, não. Você perdeu. Mais sorte na próxima vez...");
    defeatScreen();
  }
}

function defeatScreen() {
  // Limpa a página
  let pageElements = Array.from(document.body.children);
  pageElements.forEach((pageElement) => {
    pageElement.style.display = "none";
  });
  // Adiciona um fundo vermelho
  document.body.style = "";
  document.body.style.backgroundColor = "red";
  let defeatHeading = document.createElement("div");
  defeatHeading.id = "defeatHeading";
  defeatHeading.innerHTML = "Derrota";
  defeatHeading.style.fontSize = "6rem";
  defeatHeading.style.color = "darkred";
  defeatHeading.style.marginBottom = "100px";
  document.body.style.display = "flex";
  document.body.style.alignItems = "center";
  document.body.style.justifyContent = "center";
  document.body.appendChild(defeatHeading);

  let restartButton = document.createElement("button");
  restartButton.id = "restartButton";
  restartButton.innerHTML = "Começar Novo Jogo";
  restartButton.style.height = "6%";
  restartButton.style.width = "13%";
  restartButton.addEventListener("click", () => {
    location.reload();
  });
  document.body.appendChild(restartButton);
}

function victoryScreen() {
  // Limpa a página
  let pageElements = Array.from(document.body.children);
  pageElements.forEach((pageElement) => {
    pageElement.style.display = "none";
  });
  // Adiciona um fundo vermelho
  document.body.style = "";
  document.body.style.backgroundColor = "red";
  let victoryHeading = document.createElement("div");
  victoryHeading.innerHTML = "Vitória";
  victoryHeading.style.fontSize = "6rem";
  victoryHeading.style.color = "darkblue";
  victoryHeading.style.marginBottom = "100px";
  document.body.style.display = "flex";
  document.body.style.alignItems = "center";
  document.body.style.justifyContent = "center";
  document.body.appendChild(victoryHeading);

  let restartButton = document.createElement("button");
  restartButton.innerHTML = "Começar Novo Jogo";
  restartButton.style.height = "6%";
  restartButton.style.width = "13%";
  restartButton.addEventListener("click", function () {
    victoryHeading.remove();
    restartButton.remove();
    let deckSelectAndCodeInput =
      document.querySelectorAll(".codigoeselecionar");
    deckSelectAndCodeInput.forEach(function (element) {
      element.style.display = "flex";
    });
    let titleContainer = document.getElementById("title-container");
    titleContainer.style.display = "block";
  });
  document.body.appendChild(restartButton);
}

// -------------------------------------------------------------------------------------

// MANA RELATED

let mana = 0;
let manaContainer = document.getElementById("manaContainer");
let manaCounter = manaContainer.querySelector("#manaCounter");
let manaIconsDiv = manaContainer.querySelector("#manaIcons");
let unspentManaTotal = 0;
let unspentManaThisTurn = 0;
let additionalManaThisTurn = 0;
let additionalManaTotal = 0;

function addMana(amount = 1, additionalMana = true) {
  console.log("Mana", mana);
  console.log("Amount", amount);
  // atualiza a variável de mana
  mana += amount;
  console.log("Mana depois da adição", mana);

  if (additionalMana) {
    additionalManaTotal += amount;
    additionalManaThisTurn += amount;
  }

  manaIconsDiv.innerHTML = "";
  for (let i = 0; i < mana; i++) {
    const manaIcon = document.createElement("img");
    manaIcon.className = "mana-icon";
    manaIcon.src = "../frontend/assets/other-images/icone-mana.png";
    manaIcon.style.width = "3%";
    manaIcon.style.height = "auto";
    manaIcon.style.margin = "2px";
    manaIconsDiv.appendChild(manaIcon);
  }
  manaCounter.innerHTML = "Mana (" + mana + "):";

  let message = {
    type: "updateManaAmount",
    data: { mana },
  };

  sendMessageToServer(JSON.stringify(message));
}

function spendMana(manaSpent = 0) {
  // Atualiza a variável de mana
  console.log(`Mana antes: ${mana}`);
  mana -= manaSpent;
  mana = mana <= 0 ? 0 : mana;
  console.log(`Mana gasta: ${manaSpent}`);
  console.log(`Mana depois: ${mana}`);

  const manaIcons = manaIconsDiv.children; // Obtenha todos os filhos da div

  // Remove a quantidade de ícones correspondente à mana gasta
  for (let i = 0; i < manaSpent; i++) {
    if (manaIcons.length > 0) {
      manaIcons[manaIcons.length - 1].remove(); // Remove o último ícone
    }
  }

  manaCounter.innerHTML = "Mana (" + mana + "):";

  let message = {
    type: "updateManaAmount",
    data: { mana },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ---------------------------------------------------------------------------------------

function addCardToOpponentField({ carta, slotNumber }) {
  console.table("carta:", carta);

  const cardContainer = createCardElement(carta);

  cardContainer.style.maxWidth = "100%";

  cardContainer
    .querySelector(".card-stats")
    .querySelector(".card-health").style.fontSize = "18px";
  cardContainer
    .querySelector(".card-stats")
    .querySelector(".card-attack").style.fontSize = "18px";

  addHoverListenerToCard(cardContainer);

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
    displayCardInHand({
      cardData: cardData,
      cardElement: cardContainerElement,
    });
  } else {
    console.warn(
      "Elemento de carta não encontrado no DOM ou não está no campo de batalha."
    );
  }
}

// ------------------------------------------------------------------------------------

function destroyCardRequest(cardElement) {
  console.log("destroyCardRequest chamada.");
  console.table("cardElement a ser destruído:", cardElement);

  const cardInstanceId = cardElement.dataset.instanceId;

  let message = {
    type: "destroyCardRequest",
    data: { instanceId: cardInstanceId },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------------------------------

function updateCardKeywords(keyword, cardData) {
  const { instanceId } = cardData;
  const cardElement = document.querySelector(
    `.carta[data-instance-id="${instanceId}"]`
  );

  if (!cardElement) {
    console.error(`Carta com ID ${instanceId} não encontrada.`);
    return;
  }

  const slot = cardElement.closest(".slots");

  // Mapeamento de keywords para imagens de fundo ou ações futuras
  const keywordActions = {
    "paralisia elétrica": () => {
      slot.style.backgroundImage =
        "url(../assets/other-images/paralyzed-background.png)";
      console.log(`Aplicada paralisia elétrica à carta ${instanceId}.`);
    },
    // Adicionar mais keywords aqui futuramente
    // 'nova keyword': () => { ... }
  };

  // Verifica se a keyword existe no mapeamento e aplica a ação correspondente
  if (keywordActions[keyword]) {
    keywordActions[keyword]();
  } else {
    console.warn(`Keyword '${keyword}' não possui ação definida.`);
  }
}

// ------------------------------------------------------------------------------------

function updateFieldAfterCombat(cartaAlvoData, cartaAtacanteData) {
  console.log("Função updateFieldAfterCombat chamada.");
  console.log("Dados recebidos para a carta alvo:", cartaAlvoData);
  console.log("Dados recebidos para a carta atacante:", cartaAtacanteData);

  // Atualiza as cartas (primeiro sempre atualiza visualmente, depois decide o que remover)
  const cartaAtacanteElement = updateCardDisplay(cartaAtacanteData);
  const cartaAlvoElement = updateCardDisplay(cartaAlvoData);

  // Verifica se ambas as cartas foram encontradas no DOM
  if (!cartaAtacanteElement) {
    console.warn("Carta atacante não encontrada no DOM.");
  }

  if (!cartaAlvoElement) {
    console.warn("Carta alvo não encontrada no DOM.");
  }

  // Adiciona um pequeno delay para garantir que as animações e atualizações visuais ocorram antes da remoção
  setTimeout(() => {
    // Agora lida com a morte das cartas, se necessário
    if (cartaAtacanteElement && cartaAtacanteData.currentHealth <= 0) {
      console.log("Carta atacante morreu. Removendo do DOM.");
      handleCardDeath(cartaAtacanteElement);
    }

    if (cartaAlvoElement && cartaAlvoData.currentHealth <= 0) {
      console.log("Carta alvo morreu. Removendo do DOM.");
      handleCardDeath(cartaAlvoElement);
    }
  }, 1800); // Delay de 100ms para garantir que as atualizações visuais sejam processadas antes de remover o DOM
}


function updateCardDisplay(cartaData) {
  console.log("updateCardDisplay chamada para:", cartaData);
  const cartaElement = document.querySelector(`.carta[data-instance-id="${cartaData.instanceId}"]`);
  if (!cartaElement) {
    console.error(`Elemento da carta com instanceId ${cartaData.instanceId} não encontrado.`);
    return null;
  }

  console.log(`Elemento da carta encontrado:`, cartaElement);
  cartaElement.classList.add("damageUnit", "shake");
  setTimeout(() => {
    cartaElement.classList.remove("damageUnit", "shake");
  }, 4700);

  const statsDisplay = cartaElement.querySelector(".card-stats");
  if (!statsDisplay) {
    console.warn(`Display (div) de stats da carta não encontrado no DOM.`);
    return cartaElement;
  }

  updateCardStats(cartaData);
  return cartaElement;
}

function updateCardStats(cardData) {
  console.log("updateCardStats chamada para:", cardData);
  // Extrai o ID da instância da carta dos dados recebidos e converte para número
  const instanceId = Number(cardData.instanceId);
  
  // Seleciona o elemento da carta no DOM que corresponde ao ID de instância
  const cardElement = document.querySelector(`.carta[data-instance-id="${instanceId}"]`);

  // Verifica se o ID da instância é válido
  if (!instanceId) {
    console.error("instanceId com valor inválido.");
    return;
  }

  // Verifica se o elemento da carta foi encontrado
  if (!cardElement) {
    console.error(`Elemento no DOM não encontrado para a carta de instanceId = ${instanceId}`);
    return;
  }

  console.log(`Carta encontrada:`, cardElement);
  
  // Seleciona o contêiner de estatísticas da carta
  const statsDivDisplay = cardElement.querySelector(".card-stats");
  
  // Verifica se o contêiner de estatísticas existe
  if (!statsDivDisplay) {
    console.error("Div de exibição de stats da carta não encontrado no DOM.");
    return;
  }

  console.log(`Contêiner de estatísticas encontrado:`, statsDivDisplay);
  
  // Seleciona os elementos de ataque e vida dentro do contêiner de estatísticas
  const healthDisplay = statsDivDisplay.querySelector(".card-health");
  const attackDisplay = statsDivDisplay.querySelector(".card-attack");

  // Atualiza a vida
  if (healthDisplay) {
    console.log("Health Display:", healthDisplay);
    console.log(`Atualizando saúde da carta ${cardData.name} para ${cardData.currentHealth}.`);
    healthDisplay.textContent = cardData.currentHealth;
    healthDisplay.style.color = getHealthColor(cardData);
    console.log(`Vida da carta atualizada para: ${cardData.currentHealth}`);

    // Toca o som apropriado ao alterar a vida
    if (cardData.currentHealth > cardData.baseHealth) {
      playSound("healthIncreaseSound");
    } else if (cardData.currentHealth < cardData.baseHealth) {
      playSound("hitSound");
      cardElement.classList.add("damageUnit", "shake");
      setTimeout(() => {
        cardElement.classList.remove("damageUnit", "shake");
      }, 1200);
    }
  } else {
    console.error("Elemento de exibição de vida da carta não encontrado.");
  }

  // Atualiza o ataque
  if (attackDisplay) {
    console.log("Attack Display:", attackDisplay);
    attackDisplay.textContent = cardData.currentAttack;
    attackDisplay.style.color = getAttackColor(cardData);
    console.log(`Ataque da carta atualizado para: ${cardData.currentAttack}`);
  } else {
    console.error("Elemento de exibição de ataque da carta não encontrado.");
  }

  // Verifica se a carta morreu
  if (cardData.currentHealth <= 0) {
    console.log("A carta morreu! Removendo do DOM.");
    handleCardDeath(cardElement);
  }

  console.log(`Estatísticas atualizadas: Ataque = ${cardData.currentAttack}, Vida = ${cardData.currentHealth}`);
}

function getHealthColor(cartaData) {
  if (cartaData.currentHealth < cartaData.baseHealth) return "red";
  if (cartaData.currentHealth > cartaData.baseHealth) return "lightgreen";
  return "white";
}

function getAttackColor(cartaData) {
  if (cartaData.currentAttack < cartaData.baseAttack) return "red";
  if (cartaData.currentAttack > cartaData.baseAttack) return "lightgreen";
  return "white";
}

function handleCardDeath(cartaElement) {
    const slotDaCarta = cartaElement.closest(".slots");
    const deadCardFrame = document.createElement("img");
    deadCardFrame.src = "./assets/other-images/dead-card-frame.png";
    slotDaCarta.appendChild(deadCardFrame);

    const slotId = slotDaCarta.id.replace(/slot|opponentSlot/, "");
    setTimeout(() => {
      slotDaCarta.innerHTML = slotId;
    }, 1500);

    cartaElement.remove();
}

function playSound(soundName) {
  const soundEffect = soundEffects.find(s => s.name === soundName);
  if (soundEffect) {
    let audio = new Audio(soundEffect.soundFile);
    audio.play();
  } else {
    console.error(`Efeito sonoro '${soundName}' não encontrado.`);
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

// ----------------------------------------------------------------------------------------

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
    type: "endTurnRequest",
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
  const confirmation = confirm(
    "Você está finalizando o turno. Dê 'OK' e aguarde para ver se seu oponente deseja fazer o mesmo."
  );
  if (confirmation) {
    handleEndTurnButtonClick();
    endTurnButton.disabled = true;
  }
});
