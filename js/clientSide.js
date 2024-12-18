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

// contadores de mão e deck
let starterDeck = [];
let currentDeck = [];

let deckCardCount = 0;
let handCardCount = 0;

//pontuação
let playerMatchPoints = 0;
let opponentMatchPoints = 0;
const yourScoreboard = document.querySelector("#score-player1");
const opponentScoreboard = document.querySelector("#score-player2");

//rodadas
let isAmplifierActive = false;
let firstToPlay;
let yourTurn;
let specialPointsMultiplier;
let healthZone = "extra";
let opponentHealthZone = "extra";

// outros contadores
let cardsDestroyedByEffects = 0;
let totalHealed = 0;
let totalcardsFrozen = 0;
let cardsFrozenThisRound = 0;
// -----------------------------------------------

// Função que lida com o clique fora de uma carta ou a confirmação de cancelamento
const handleCancel = () => {
  if (confirm("Cancelar?")) {
    return true; // Retorna true se o cancelamento ocorrer
  }
  return false; // Retorna false se não houver cancelamento
};

// Mapa para armazenar os efeitos a serem aplicados no próximo rodada
const nextRoundEffects = new Map();

// Função para aplicar os efeitos armazenados no próximo rodada
function applyNextRoundEffects() {
  //console.log('Aplicando efeitos armazenados.');
  //console.log('Tamanho do set de efeitos armzenados: ', Array.from(nextRoundEffects.entries()).length);
  nextRoundEffects.forEach((effect, key) => {
    effect(); // Chama a função armazenada para aplicar o efeito
    nextRoundEffects.delete(key); // Remove o efeito após a aplicação
  });
}

const cardsTextDescription = [
  {
    id: 1,
    description: `A Vagante Sombria
      9 de mana | 10/5
      (Obscuro | [Morto-Vivo] Espírito [Alma Penada] |) 
      *Indestrutível*
      “Custo (1) a menos para cada duas cartas aliadas destruídas ao longo desta partida.” 
      `,
  },
  {
    id: 2,
    description: `Elemental do Fogo 
      2 de mana | 2/2
      (Ígneo | Elemental |)
      #Grito de Guerra: “invoco duas cópias de ‘Espírito Flamejante’ aliadas.”`,
  },

  {
    id: 3,
    description: `Espírito Flamejante 
      1 de mana | 1/1
      (Ígneo | Elemental |) 
     *Queimar (1)*`,
  },
  {
    id: 4,
    description: function (cardElement) {
      return `Fulgurvoltz 
      ${cardElement.getAttribute("data-cost")} de mana | 8/11 
      (Elétrico | Elemental |)
      “Custo (1) a menos para cada mana não gasta por você ao longo desta partida (Mín.4).” 
      #Grito de Guerra: “destruo todas as cartas não-elétricas com menos de 8 de ataque.”`;
    },
  },
  {
    id: 5,
    description: `Ivan Ignisar
      7 de mana | 7/6 
      (Ígneo | Humano | Dragão [Dragão Primordial]) 
      *Intimidador*, *Velocidade (2)* 
      #Condicional: “quando eu causar dano e destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
      #Transformar: (1 rodada para carregar) “se eu e/ou outra carta ígnea tivermos causado um total de 10+ de dano neste rodada.”`,
  },
  {
    id: 6,
    description: `Ignisar transformado 
      7 de mana | 9/7
      (Ígneo | Humano | Dragão [Dragão Primordial]) 
      *Intimidador*, *Voo*, *Velocidade (2)* 
      #Condicional: “quando eu atacar, ataco também à Alcance causando dano em área, 6 ao alvo principal e 4 de respingo. Quando eu destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
      #Transformado: “destransformo no final da rodada.”`,
  },

  {
    id: 7,
    description: `Jack 
      2 de mana | 2/2
      (Elétrico | Alcance | Humano | Nulifária |)
      *Paralisante* 
      #Grito de Guerra: “ganho +1/+1 se houver pelo menos uma unidade elétrica aliada no campo de batalha.” 
      #Condicional: “depois que eu ou uma unidade elétrica aliada causar dano ao avatar inimigo, ganho +1/+1 e +1 de Velocidade [Máx.4].”`,
  },

  {
    id: 8,
    description: `Layla 
      5 de mana | 5/5
      (Elétrico| Alcance | Humano | Nulifária |) 
      #Grito de Guerra: “aplico *paralisia elétrica* a até duas cartas inimigas de sua escolha.” 
      #Condicional: “sempre que uma carta do oponente for marcada com *paralisia elétrica*, causo metade do meu ataque (arredondado para cima) como dano *atravessante*.”
      #Final da Rodada: “ataco sem sofrer dano todas as unidades paralisadas sobreviventes no final da rodada.”`,
  },
  {
    id: 9,
    description: `Mali Magarc
      9 de mana | 6/7
      (Humano | Dragão [Dragão Primordial] | Nulifária) 
      *Dano Mágico (+2)*, *Barreira Anti-Mágica*, *Velocidade (3)*
      #Constante: “nunca perco *barreira anti-mágica*.”
      #Condicional: “a cada dois feitiços lançados, ganho ‘+1 de *dano mágico*’.”
      #Transformar: (1 rodada para carregar) “se eu tiver acumulado *dano mágico +5* ou superior.”`,
  },

  {
    id: 10,
    description: `Rusco 
      2 de mana | 2/2
      (Fera | Humano |) 
      *Escudo* 
      #Condicional-#Fim da Rodada: “se você tiver uma carta em campo de custo, ataque ou vida igual a 2 e eu estiver no seu deck no fim da rodada, invoque-me no seu campo de batalha.”`,
  },

  {
    id: 11,
    description: `Sabrina 
      4 de mana | 4/5
      (Aquático| Alcance | Humano | Aldeia do Rio |) 
      #Condicional: “quando eu causar ou sofrer dano de combate e a outra unidade sobreviver, em vez do dano de revide, a outra carta retorna para a mão do dono se você tiver alguma mana não gasta.”`,
  },

  {
    id: 12,
    description: `Thorwells 
      6 de mana | 5/5
      (Elétrico | Celestial |) 
      #Grito de Guerra: “Ataco todas as unidades inimigas paralisadas. Em seguida, 
      aplico *paralisia elétrica* a todas as não-elétricas em jogo. Para cada uma que foi paralisada dessa forma, você ganha +1 mana máxima somente no próximo rodada.” #Constante: “não posso ter minha velocidade reduzida e nem ser afetado por Gritos de Guerra ou efeitos de dano inimigos.”`,
  },
  {
    id: 13,
    description: `Tony Raiturus 
      6 de mana | 5/6
      (Elétrico | Humano | Dragão [Dragão Primordial]) 
      #Constante: “não posso ser afetado por Gritos de Guerra ou efeitos de dano inimigos.” 
      #Condicional: “cada terceiro ataque meu é de <Alcance> e causa 7 de dano <atravessante>.”`,
  },
  {
    id: 14,
    description: function (carta) {
      return `Voltexz 
       20 de mana | 10/7
      (Elétrico | Alcance |) 
      “Custo (2) a menos para cada mana não gasta por você ao longo da partida. (Mín.2)” #Grito de Guerra: “causo 3 de dano a todas as cartas inimigas e concedo +1/+1 às suas outras cartas até o final da rodada. Além disso, você pode gastar até 4 de mana adicional. Para cada mana gasta dessa forma, aprimore o efeito do meu grito de guerra. (Máx. 7 de dano e +5/+5).”`;
    },
  },
  {
    id: 15,
    description: `Necrófago Espectral
      1 de mana | 4/3 
      (Fera | Morto-Vivo [Cadáver Reanimado] |) 
      #Grito de Guerra: “destruo uma carta aliada à sua escolha. Não posso ser jogado se o seu lado do campo de batalha estiver vazio.”`,
  },
  {
    id: 16,
    description: `O Revivente Eterno 
      2 de mana | 3/3
      ( Morto-Vivo |) 
      #Último Suspiro: “ressuscito no rodada seguinte.”`,
  },
  {
    id: 17,
    description: `Replicador Maldito 
      2 de mana | 2/3
      ( Obscuro |) 
      #Último Suspiro: “invoco duas cópias minhas sem esta habilidade.”`,
  },
  {
    id: 18,
    description: `Fênix das Trevas Profana
      3 de mana 3/3
      ( Fera |) 
      *Voo*
      #Condicional: “eu sou destruído se você estiver ganhando a partida.” #Último Suspiro: “ressuscito no rodada seguinte com +1/+1.”`,
  },
  {
    id: 19,
    description: `Titânico Morcegalma 
      4 mana | 5/3
      ( Obscuro |) 
      *Vínculo Curativo (50%)* 
      #Condicional: “sempre que uma carta aliada é destruída, causo 1 de dano a todas as cartas do oponente e 2 ao avatar dele.”`,
  },
  {
    id: 20,
    description: `O Espiritomante 
      5 de mana | 3/6
      (Alcance | Humano [Feiticeiro] |)  
      #Grito de Guerra: “torno uma carta aliada no campo de batalha <*indestrutível*> até o final da rodada. 
      #Último Suspiro: “ressuscito com 1 de vida e <*regeneração (100%)*>”`,
  },
  {
    id: 21,
    description: `Jeff, The Death
      5 de mana | 2/2 
      (Obscuro | Entidade |) 
      *Indestrutível*
      #Grito de Guerra: “ganho +1/+1 para cada carta que foi destruída sem ser por dano ao longo desta partida.”`,
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
      (Obscuro | Morto-Vivo|)`,
  },
  {
    id: 23,
    description: `RaiEmofitir 
      6 de mana | 6/6 
      (Sagrado | Obscuro | Celestial [Precursor] | Cidade Celestial | Terráver) 
      #Grito de Guerra: “destruo todas as cartas em ambos os campos de batalha. Este efeito não se ativa se você jogou alguma carta no último rodada.”`,
  },
  {
    id: 24,
    description: function () {
      return `Fonte da Água da vida
          3 de mana | -/6 
          (Aquático | Paisagem |)
          #Grito de Guerra: “gero (3) de mana de estoque para você.” 
          #Condicional: “você pode ou não usar meu poder. Se usar, perco 1 de durabilidade e invoco um 'Elemental de Água Gigante' com atributos baseados no total de vida curado de suas cartas e avatar.” 
          #Início da rodada: “curo 1 de vida de todos os aliados.”
          Condicional: “se eu tiver visto seu avatar e/ou suas cartas sendo curadas em um total de 38+ de vida, vença o jogo imediatamente.”`;
    },
  },
  {
    id: 25,
    description: `Mente Destrutiva
    5 de mana | 2/5 
    (Alcance | Humano | Desarranjado |) 
    #Condicional: “você pode usar meu poder antes de cada combate. Se usar, eu sofro 1 de dano, causo 3 a todas as cartas e devolvo as que custam 3 ou menos às mãos dos donos. Se não usar, sofro 4 de dano. Se não usar por duas vezes consecutivas, destruo todas as cartas que custam 5 ou menos, causo 5 de dano a TODO MUNDO e não sofro dano.”`,
  },
  {
    id: 26,
    description: `Eletroad
    4 de mana | 3/6 
    (Elétrico | Fera |) 
    #Grito de Guerra e #Início da Rodada: “gero (1) de mana adicional por rodada enquanto você não estiver ganhando a partida.”
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
  ( Gnomo )
  #Grito de Guerra: “os dois jogadores compram duas cartas.” `,
  },
  {
    id: 29,
    name: "D'Lorafya",
    description: `D’Lorafya, O Fulgor Inextinguível 
  6 de mana | 7/5
  (Ígneo | Celestial | Alcance)  
  #Grito de Guerra: “causo 5 de dano a todas as cartas inimigas.” 
  Constante: “ataques de Alcance, feitiços e efeitos ígneos não podem me ferir.”`,
  },
  {
    id: 30,
    name: "Kell",
    description: `Kell, Capitão Querubim 
  10 de mana | 5/5 
  (Anjo | Sagrado | Cidade Celestial | )  
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
  #Grito de Guerra e #Início da Rodada: “escolha um entre: 
  >Uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
  >Uma carta aliada à sua escolha ganha *proteção divina* até o fim da rodada.  
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
  (Aquático | Fera |  ) 
  *Dano Excessivo*, *Intimidador* 
  #Constante: “as outras cartas aquáticas aliadas têm +1 de vida.”`,
  },
  {
    id: 35,
    name: "Alexa",
    description: `Alexa 
  4 de mana |3/10 
  (Aquático | Celestial | Alcance |)  
  *Invulnerável* , *Transformar* 
  #Grito de Guerra: “uma carta inimiga de sua escolha fica silenciada.” 
  #Início da Rodada: “escolha entre uma carta aliada e seu avatar. A opção escolhida ganha 2 de vida.”`,
  },
  {
    id: 36,
    name: "Espírito Carregado",
    description: `Espírito Carregado 
  1 de mana | 1/1 
  (Elétrico | Elemental | )  
  Último Suspiro: “você ganha +1 de mana adicional somente na próxima rodada.”`,
  },
  {
    id: 37,
    name: "Dilúvio",
    description: `Dilúvio 
  (Feitiço [Lento]) 
  “Começa a chover forte. No final do próximo rodada, todas as unidades morrem afogadas, exceto as que têm *Voo* e as aquáticas não-humanas.”`,
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
  (Elétrico|  | Dragão |)
  *Voo* 
  #Condicional: “sempre que eu atacar duas vezes, na terceira meu ataque é de Alcance e causa 10 de dano a um slot ocupado (exceto o do avatar) e 6 de dano aos vizinhos adjacentes (isso tem *paralisante*).”`,
  },
  {
    id: 40,
    name: "Gigante Elétrico",
    description: `Gigante Elétrico 
  4 de mana | 8/7
  (Elétrico |  | Gigante | )  
  #Grito de Guerra: “aplico *paralisia elétrica* em uma carta do oponente à sua escolha e gero (1) de mana adicional somente neste rodada.” 
  “Eu só posso ser jogado se um total de 3+ de mana adicional foi gerada em seu favor nesta rodada.”`,
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
#Início da Rodada: “você ganha 1 de mana adicional. Uma carta aliada aleatória sofre 3 de dano; se for uma não-elétrica, ela recebe o dobro de dano. Eu perco 1 de durabilidade.”`,
  },
  {
    id: 49,
    name: "Arcanjo Uriel",
    description: `Arcanjo Uriel  
3 de mana | 2/5 
(Sagrado |  | Anjo [Grande Arcanjo] |)  
*Voo*, *Vínculo Curativo (100%)* 
#Condicional: “uma vez por rodada, a primeira carta aliada ferida que fosse morrer tem sua vida curada o suficiente para sobreviver, se possível.”`,
  },
  {
    id: 50,
    name: "O Tecnomante",
    description: `O Tecnomante
3 de mana |2/5 
(Humano [Ciborgue]| Circuitron |)  
#Grito de Guerra: “você compra todas as cartas no seu deck que custam (10) ou mais; elas custam (1) a menos.”`,
  },
  {
    id: 51,
    name: "Torrente Azul",
    description: `Torrente Azul
6 de mana |5/5 
(Aquático | Humano [mutante])  
#Condicional-#Fim da Rodada: “se o oponente não tiver causado dano de combate ao seu avatar neste rodada, todas as cartas dele retornam para a mão.”`,
  },
  {
    id: 52,
    name: "Lucien",
    description: `Lucien, O Portador da Luz Sagrada
4 de mana | 3/5
( Sagrado | Humano [monge] |)
#Condicional: “nas duas primeiras vezes por rodada que outra carta aliada curar algo, causo 9 de dano *atravessante* à carta obscura mais forte do oponente, se isso for o suficiente para destrui-la, remova-a do jogo em vez disso; se não houver cartas obscuras, causo 6 de dano *atravessante* à carta mais forte do oponente.”
#Fim da Rodada: “uma carta é curada em 3 de vida e seu avatar, em 2.”`,
  },
  {
    id: 53,
    name: "Gigante Marinho",
    description: `Gigante Marinho 
4 de mana | 8/7 
(Aquático |  | Gigante |)  
#Grito de Guerra: “seu avatar ganha 3 de vida.” 
“Eu só posso ser jogado se suas cartas tiverem curado um total de 4+ nesta rodada.”`,
  },
  {
    id: 54,
    name: "Elemental de Água Gigante",
    description: function () {
      return `Elemental de Água Gigante 
10 de mana | 0/1
(Aquático |  | Elemental |)
“Se suas cartas tiverem curado 8+ de vida, eu custo (5).”#Constante: “eu tenho +1/+1 para cada 2 pontos de vida que suas cartas curaram (arredondado para cima).”`;
    },
  },
  {
    id: 55,
    name: "Ronan",
    description: `Ronan 
3 de mana | 4/3 
(Ígneo |  | Humano | Dragão [dragonóide]) 
*Regeneração (50%)* , *Intimidador* , *Transformar*
#Grito de Guerra: “se houver alguma unidade aliada ferida em jogo, posso ganhar +1/+0 até o fim da rodada. 
#Condicional: “se algum dano reduzir minha vida abaixo da metade, ganho +1/+1 e *queimar (1)* 
#Transformar: (1 rodada para carregar) “se eu tiver sobrevivido a dano neste rodada.”`,
  },
  {
    id: 56,
    name: "Zarvok",
    description: `Marechal Zarvok Belthram
5 de mana | 5/5
(Ígneo |  | Lagumverrano)
*Intimidador*
#Grito de Guera: “todos os inimigos são marcados com *queimadura (1)*, dentre eles, as cartas cujo valor de ataque + vida total for menor ou igual a 9 são marcadas com *frágil* e têm -2/-0 até o final da rodada.” 
#Condicional: “quando eu for atacar uma carta, causo 1 de dano e aplico *queimadura (1)* e *frágil* a ela.”`,
  },
  {
    id: 57,
    name: "Gigante Flamejante",
    description: `Gigante Flamejante
4 de mana | 8/7
(Ígneo |  | Gigante | ) 
#Grito de Guerra: “causo 4 de dano a um alvo de sua escolha.”
“Eu só posso ser jogado se o avatar inimigo tiver 12 ou menos de vida.”`,
  },
  {
    id: 58,
    name: "Piromante Ardente",
    description: `Piromante Ardente 
2 de mana | 3/2
(Ígneo | Alcance | Humano [Mago] |)
*Queimar*
#Grito de Guerra: “causo 1 de dano a até dois alvos diferentes de sua escolha (não aplica queimadura).”`,
  },
  {
    id: 59,
    name: "Avatar do Fogo",
    description: `Avatar do Fogo
5 de mana | 5/4
(Ígneo| Alcance | Avatar |)
*Voo*
#Grito de Guerra: “causo 3 de dano a uma carta inimiga de sua escolha e às adjacentes a ela.”
#Condicional: “sempre que outra carta ígnea causar dano, ganho +1/+0 até o final da rodada.”`,
  },
  {
    id: 60,
    name: "Irina Lança-Chamas",
    description: `Irina Lança-Chamas 
4 de mana | 5/4 
(Ígneo | Alcance | Humano [mutante] | )
#Grito de Guerra: “causo 5 de dano a um alvo de sua escolha, 2 a mim mesma e 1 às cartas adjacentes a mim.”`,
  },
  {
    id: 61,
    name: "Esther",
    description: `Esther
2 de mana | 2/2
(Ígneo | Alcance | Humano | Dragão [dragonóide] |) 
#Grito de Guerra e #Início da rodada: ”escolha um dos seguintes modos:
• Modo Chama Agressiva -> eu ganho +1/+0 e *Queimar (2)* até o final da rodada. 
• Modo Eclipse Estratégico -> eu ganho +0/+1 e *regeneração (100%)* até o final da rodada.”`,
  },
  {
    id: 62,
    name: "Brutamontes Chocante",
    description: `Brutamontes Chocante
8 de mana | 7/7
(Elétrico | | Humano |) 
*Paralisante*
#Grito de Guerra: “escolha um slot ocupado até três vezes (o mesmo ou outro). Eu causo 4 de dano *atravessante* ao(s) slot(s) escolhido(s).”`,
  },
  {
    id: 63,
    name: "Eletrocaçadora Vesper",
    description: `Eletrocaçadora Vesper 
6 de mana | 7/5
(Elétrico | Alcance | Humano |) 
#Condicional: “a primeira vez por rodada que uma carta com velocidade inferior à minha me atacar, eu esquivo o dano (causo o dano de revide normalmente).”`,
  },
  {
    id: 64,
    name: "Dragãozinho Flamejante",
    description: `Dragãozinho Flamejante
1 de mana | 2/2
(Ígneo |  | Dragão |) 
#Grito de Guerra: “causo 1 de dano a qualquer alvo e aplico *queimadura (1)* a ele.”
#Condicional: “cada segundo ataque meu é de *Alcance*.”`,
  },
  {
    id: 65,
    name: "David-The-Titanslayer",
    description: `David, The Titanslayer
4 de mana | 6/3
(Neutro|  | Humano |) 
#Grito de Guerra: “destruo até três cartas inimigas com ataque maior ou igual a 8.”`,
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    description: `Diabrete Sombrio
1 de mana | 2/1
(Obscuro |  | Lagumverrano [Diabrete] |) 
#Condicional: “sempre que uma carta aliada destruir outra, você compra uma carta.”`,
  },
  {
    id: 67,
    name: "Agonox",
    description: `Agonox, Soberano da Dor
5 de mana | 4/5
(Obscuro|  | ?? |) 
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
(Elétrico |  | Lagumverrano [Diabrete] |) 
#Grito de Guerra (#Condicional): “se houver uma carta elétrica aliada no campo de batalha, ganho +2 de ‘Velocidade’.”
#Início da rodada: “se sua carta de maior velocidade no campo de batalha tiver velocidade superior à de maior velocidade do oponente, gero (1) de mana adicional somente neste rodada.”`,
  },
  {
    id: 69,
    name: "Oráculo das Marés",
    description: `Oráculo das Marés
2 de mana | -/4
(Aquático| ?? |) 
*Benevolente*
#Grito de Guerra: “olhe as três cartas no topo do seu deck. Se você revelar uma delas, adicione-a à sua mão, depois, o deck é embaralhado.”
#Condicional: “na primeira vez por rodada que uma carta aliada curar qualquer coisa,  você compra uma carta.”`,
  },
  {
    id: 70,
    name: "Thalassor",
    description: `Thalassor, Rei das Sereias do 3o Mar
7 de mana | 7/9
(Aquático | Tritão |  )
“Se você tiver pelo menos três outras cartas aquáticas aliadas (sereias e tritões valem por dois), eu custo (4) a menos.”
#Constante: “as outras cartas aquáticas aliadas têm +1/+2.”`,
  },
  {
    id: 71,
    name: "Odon, Mestre das Armas",
    description: `Odon, Mestre das Armas
4 de mana |4/4
(Neutro |  | Anão |) 
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
#Transformar: (1 rodada para carregar) “se eu e/ou outro dragão aliado tivermos sobrevivido a um total de 10+ de dano.”`,
  },
  {
    id: 73,
    name: "Drake Damian",
    description: `Drake Damian
  3 de mana | 2/2
  (Neutro |  | Humano |) 
  *Velocidade (4)*
  #Constante: “suas cartas de maior velocidade têm *esquiva* permanentemente e golpeiam duas vezes seguidas. Minha *esquiva* não tem restrições e vale para qualquer coisa.”
  “Antes da rodada 5, não posso ser jogado na linha de frente.”`,
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    description: `Emissário da Água da Vida
  3 de mana |3/4
  ( Aquático ) 
  #Grito de Guerra: “distribua como quiser até 4 pontos de cura entre cartas aliadas.”`,
  },
  {
    id: 75,
    name: "Fada do Fogo",
    description: `Fada do Fogo
1 de mana | 1/3
(Ígneo | Elemental |) 
*Voo*`,
  },
  {
    id: 76,
    name: "Estrondador Ígneo",
    description: `Estrondador Ígneo
2 de mana | 2/3
 (Ígneo |  |) 
*Dano Excessivo*
Condicional: “quando eu atacar o avatar inimigo, causo 1 de dano às cartas na retaguarda dele.”`,
  },
  {
    id: 77,
    name: "Lady Vultrixanna, do Trovão Ardente",
    description: `Lady Vultrixanna, do Trovão Ardente
5 de mana | 5/5
 (Ígneo | Elétrico|) 
Grito de Guerra: “causo 1 de dano e aplico "paralisia elétrica" a todas as cartas inimigas. Para cada uma afetada, causo 1 de dano ao avatar inimigo.”`,
  },
  {
    id: 78,
    name: "Voltráviris Sibilante",
    description: `Voltráviris Sibilante
3 de mana | 2/2
 (Elétrico) 
*Voo*
#Grito de Guerra: “gero (1) de mana adicional permanente a partir da rodada seguinte.”
`,
  },
  {
    id: 79,
    name: "Zevran, o Arco Trovejante",
    description: `Zevran, o Arco Trovejante
8 de mana | 13/6
(Elétrico | Humano |) 
*Alcance*`,
  },
  {
    id: 80,
    name: "Bruno, A Neblina Gelada do Outono",
    description: `Bruno, A Neblina Gelada do Outono
4 de mana | 5/4
(Glacial | Humano [Mago] |) 
*Congelante* 
#Grito de Guerra: “congelo a carta inimiga mais fraca em jogo. ”
#Condicional: “quando eu for atacar, ganho +1/+0 para cada carta que foi congelada nesta rodada.”
#Fim do turno: “causo 3 de dano a todas as cartas congeladas no campo de batalha.”
`,
  },
  {
    id: 81,
    name: "Dragãozinho Congelante",
    description: `Dragãozinho Congelante
1 de mana |2/2
 (Glacial| Dragão) 
*Congelante*
#Grito de Guerra: “congelo a carta inimiga mais fraca em campo.” `,
  },
  {
    id: 82,
    name: "Espectro do Gelo Aprisionante",
    description: `Espectro do Gelo Aprisionante
3 de mana | 2/2
(Glacial | Espectro |) 
*Congelante* , *Voo*.
#Grito de Guerra: “congelo todas as cartas no campo de batalha e ganho +1/+1 para cada carta inimiga congelada dessa forma.”
`,
  },
  {
    id: 83,
    name: "Espírito da Aurora",
    description: `Espírito da Aurora
1 de mana |2/2
 (Glacial | Espírito) 
*Congelante*`,
  },
  {
    id: 84,
    name: "Gigante Glacial",
    cost: 4,
    description: `Gigante Glacial
4 de mana | 8/7
(Glacial |Gigante)
#Grito de Guerra: “escolha uma carta inimiga para eu congelar ou causar 2 de dano caso já esteja congelada.”
“Eu só posso ser jogado se 2+ cartas inimigas foram congeladas nesta rodada.”`,
  },
  {
    id: 85,
    name: "Maga da Nevasca",
    description: `Maga da Nevasca
4 de mana | 4/4
(Glacial | Humano [Mago] |) 
#Grito de Guerra: “olhe as cinco cartas do topo do seu deck; escolha uma para comprar.” `,
  },
  {
    id: 86,
    name: "Pequena Floco de Neve",
    description: `Pequena Floco de Neve
3 de mana | 2/4
(Glacial | Humano)
#Condicional(1): “quando eu for atacar uma carta inimiga, reduzo a velocidade dela em 1.”
#Condicional(2): “depois que eu for atacada, meu atacante é congelado.”
`,
  },
  {
    id: 87,
    name: "Princesa Wanessa",
    description: `Princesa Wanessa
4 de mana | 5/4
(Glacial | Humano [Mago] |) 
???`,
  },
  {
    id: 88,
    name: "Rei Gelado",
    description: `Rei Gelado
6 de mana | 6/5
(Glacial) 
*Congelante*.
#Fim do turno: “causo 2 de dano a todos os inimigos para cada carta inimiga congelada em campo [Máx. 6].”

`,
  },
  {
    id: 89,
    name: "Vigia do Farol do Norte",
    description: `Vigia do Farol do Norte
2 de mana | 2/2
(Glacial | Corpo-a-corpo | Humano |) 
#Grito de Guerra e #Último Suspiro: “você compra uma carta.”
`,
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
      //console.log("Grito de Guerra do Elemental do Fogo ativado.");
      //console.log(`elementalSlotNumber = ${elementalSlotNumber}`);

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
          //console.log(`Invocando Espírito no slot ${espiritoSlotNumber}.`);
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
      //console.log("Fulgurvoltz warCry function effect triggered.");

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

      //console.log(cardsToBeDestroyed);
      // Destruir todas cartas não-elétricas com ataque menor ou igual a 10
      cardsToBeDestroyed.forEach((targetCardElement) => {
        destroyCardRequest(targetCardElement);
      });

      addCardToField(fulgurvoltzElement, slotNumber);
    },
  },

  {
    id: 7,
    name: "Jack",
    playEffect: function (cardData, cardElement, slotNumber) {
      const alliedCards = getCardsInField("allied");
      console.table(alliedCards);
      const hasElectricAllies = Array.from(alliedCards).some((card) => {
        const keywords = JSON.parse(card.dataset.keywords || "[]"); // Transforma a string em array
        return keywords.includes("elétrico"); // Verifica se contém "elétrico"
      });
      hasElectricAllies
        ? buffOrDebuffRequest({ attackChange: 1, healthChange: 1 }, cardElement)
        : console.log("Não há aliados elétricos em campo.");
      addCardToField(cardElement, slotNumber);
    },
  },

  {
    id: 8,
    name: "Layla",
    playEffect: async function (laylaData, laylaElement, slotNumber) {
      // Filtra cartas válidas (não nulas)
      const enemyCards = getCardsInField("enemy").filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar Layla diretamente
      if (enemyCards.length === 0) {
        /* console.log(
          "Não há cartas inimigas para paralisar. Jogando Layla diretamente."
        ); */
        addCardToField(laylaElement, slotNumber);
        return; // Encerra a função aqui
      }

      // Paralisa diretamente as cartas inimigas, se houver uma ou duas
      if (enemyCards.length <= 2) {
        enemyCards.forEach((card) =>
          keywordAdditionRequest("paralisia elétrica", card)
        );
        addCardToField(laylaElement, slotNumber);
        return;
      }

      alert("Escolha até duas cartas inimigas para paralisar.");
      let selectedCards = 0;
      const selectedCardIds = new Set(); // Armazena os IDs das cartas selecionadas

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
            const cardId = this.dataset.id;

            // Verifica se a carta já foi selecionada
            if (selectedCardIds.has(cardId)) {
              alert("Você já selecionou essa carta. Escolha outra.");
              return; // Não permite selecionar a mesma carta
            }

            keywordAdditionRequest("paralisia elétrica", this);
            selectedCards++;
            selectedCardIds.add(cardId); // Adiciona o ID da carta selecionada

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
        //console.log("Grito de guerra cancelado");
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
      let paralyzedCount = 0; // Contador para cartas paralisadas

      enemyCards.forEach((card) => {
        if (keywordAdditionRequest("paralisia elétrica", card)) {
          paralyzedCount++; // Incrementa se a paralisia for aplicada com sucesso
        }
      });

      // Armazenar o efeito de adicionar mana no próximo rodada
      if (paralyzedCount > 0) {
        nextRoundEffects.set(thorwellsElement.dataset.instanceId, () =>
          addMana(paralyzedCount)
        );
      }
      //console.log(`paralyzedCount = ${paralyzedCount}`);
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

      const userInput = prompt(
        "Você pode gastar até 4 de mana adicional para aprimorar meu grito de guerra (Máx. 7 de dano e +5/+5 para as suas outras cartas)."
      );

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

      /*   console.log(
        `Mana que você possuía no instante em que Voltexz foi jogada e seu efeito ativado: ${mana}`
      ); */
      // se a mana do custo da própria Voltexz n tiver sido computada ainda, então o máximo que extraManaSpent pode ser é igual a mana - Number(voltexzElement.querySelector('.card-cost-display').textContent)

      spendMana(extraManaSpent);

      const slotsDamaged = [7, 8, 9, 10, 11, 12];
      const damage = Math.min(7, 3 + extraManaSpent); // Limita o dano a 7
      //console.log(`Dano calculado: ${damage}`);

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
          console.log("attackBuff: ", attackBuff, "healthBuff: ", healthBuff);
          buffOrDebuffRequest(
            { attackChange: attackBuff, healthChange: healthBuff },
            card
          );
        }
      });

      addCardToField(voltexzElement, slotNumber);
    },
  },

  {
    id: 21,
    name: "Jeff-The-Death",
    playEffect: function (jeffData, jeffElement, slotNumber) {
      // Adiciona a carta ao campo
      addCardToField(jeffElement, slotNumber);

      const instanceId = jeffData.instanceId;

      const message = {
        type: "specialBuffRequest",
        condition: "cards-destroyed-by-effects",
        data: { instanceId },
      };
      sendMessageToServer(JSON.stringify(message));
    },
  },

  {
    id: 23,
    name: "Rai'Emofitir",
    playEffect: (raiData, raiElement, slotNumber) => {
      const previousRound = currentRoundIndex - 1;

      // Seleciona todas as cartas no campo
      const cardsInField = getCardsInField();

      // Se a rodada anterior for maior ou igual a 1, verifica se o player1 jogou uma carta
      if (previousRound >= 1) {
        const previousRoundData = playsHistory.find(
          (roundData) => roundData.round === previousRound
        );
        if (previousRoundData) {
          const previousRoundActions = previousRoundData.actions;
          const playerPlayedCard = previousRoundActions.some(
            (action) =>
              action.type === "cardPlayed" && action.player === "player1"
          );

          // Se player1 não jogou, destrói as cartas
          if (!playerPlayedCard) cardsInField.forEach(destroyCardRequest);
        }
      } else if (previousRound === 0) {
        // Se a rodada atual for a primeira, destrói diretamente
        cardsInField.forEach(destroyCardRequest);
      } else {
        console.error("Não foi possível definir qual foi a rodada anterior.");
        return;
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
        2.uma carta aliada à sua escolha ganha *proteção divina* até o fim da rodada. 
        3.uma carta aliada à sua escolha é curada em 4 de vida.
        `)
      );
      if (choice === 1) {
        //console.log(
          "Lógica para silenciar uma carta e, se for do oponente, também retorná-la para a mão."
        );
      } else if (choice === 2) {
        //console.log(
          "Lógica para conceder proteção divina a uma carta aliada até o fim da rodada."
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
            2. Uma carta aliada à sua escolha ganha *proteção divina* até o fim da rodada.
            3. Uma carta aliada à sua escolha é curada em 4 de vida.
            `)
          );

          // Processa a escolha do usuário
          if (choice === 1) {
            //console.log(
              "Lógica para silenciar uma carta e, se for do oponente, também retorná-la para a mão."
            );
          } else if (choice === 2) {
            //console.log(
              "Lógica para conceder proteção divina a uma carta aliada até o fim da rodada."
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
                    //console.log("Efeito cancelado.");
                  }
                }
              } else {
                console.error(
                  `Slot não encontrado para o slotNumber: ${slotNumber}`
                );
                if (confirm("Deseja tentar novamente?")) {
                  promptUser(); // Repetir a função
                } else {
                  //console.log("Efeito cancelado.");
                }
              }
            } else {
              console.error("Por favor, escolha um slot válido.");
              if (confirm("Deseja tentar novamente?")) {
                promptUser(); // Repetir a função
              } else {
                //console.log("Efeito cancelado.");
              }
            }
          } else {
            console.error("Escolha inválida. Por favor, tente novamente.");
            if (confirm("Deseja tentar novamente?")) {
              promptUser(); // Repetir a função
            } else {
              //console.log("Efeito cancelado.");
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

      // Se não houver cartas inimigas válidas, permite jogar a carta diretamente
      if (enemyCards.length === 0) {
        /* console.log(
          "Não há cartas inimigas para selecionar. Jogando carta diretamente."
        ); */
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
        //console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 50,
    name: "O Tecnomante",
    playEffect: function (tecnomanteData, tecnomanteElement, slotNumber) {
      // Filtra as cartas no currentDeck com currentCost >= 10
      console.log("currentDeck antes da filtragem: ", currentDeck);
      const eligibleCards = currentDeck.filter(
        (card) => card.currentCost >= 10
      );
      console.log("Cartas filtradas: ", eligibleCards);

      // Reduz o custo das cartas elegíveis e notifica o servidor
      eligibleCards.forEach((card) => {
        card.currentCost -= 1;

        const message = {
          type: "cardCostUpdated",
          data: { instanceId: card.instanceId, newCost: card.currentCost },
        };
        sendMessageToServer(JSON.stringify(message));
      });

      // Chama a função drawSpecificCards para processar as cartas elegíveis
      drawSpecificCards(eligibleCards);

      // Adiciona o Tecnomante ao campo de jogo
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
        //console.log("Grito de guerra cancelado");
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
        //console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 59,
    name: "Avatar do Fogo",
    playEffect: async function (avatarFogoData, avatarFogoElement, slotNumber) {
      const enemyCards = getCardsInField("enemy").filter(
        (card) => card !== null && card !== undefined
      );

      // Se não houver cartas inimigas válidas, permite jogar a carta diretamente
      if (enemyCards.length === 0) {
        /*  console.log(
          "Não há cartas inimigas para selecionar. Jogando a carta diretamente."
        ); */
        addCardToField(avatarFogoElement, slotNumber);
        return; // Encerra a função aqui
      }

      alert("Escolha uma carta inimiga para causar 3 de dano.");

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
        //console.log("Grito de guerra cancelado");
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
        //console.log("Grito de guerra cancelado");
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

      // Se não houver cartas inimigas válidas, permite jogar a carta diretamente
      if (enemyCards.length === 0) {
        /* console.log(
          "Não há cartas inimigas para selecionar. Jogando carta diretamente."
        ); */
        addCardToField(brutamontesElement, slotNumber);
        return; // Encerra a função aqui
      }

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
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

            // Utiliza requestAnimationFrame para garantir que o DOM foi realmente atualizado
            requestAnimationFrame(() => {
              const updatedEnemyCards = getCardsInField("enemy").filter(
                (card) => card !== null && card !== undefined
              );

              console.log(updatedEnemyCards.length);

              // Se não houver cartas inimigas válidas, permite jogar a carta diretamente
              if (updatedEnemyCards.length === 0) {
                removeHighlightsAndListeners(); // Remove highlights e listeners se não restarem inimigos
                resolve(); // Encerra a ação
                return;
              }

              if (selectionsLeft > 0) {
                alert(
                  `Escolha outra carta inimiga. Você ainda tem ${selectionsLeft} seleção(ões) restante(s).`
                );
              } else {
                removeHighlightsAndListeners(); // Remove listeners após a terceira seleção
                resolve(); // Resolve com sucesso após a última seleção
              }
            }, 0); // O timeout de 0ms garante que o DOM foi atualizado
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
              reject(); // Resolve se o grito for cancelado
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
        //console.log("Grito de guerra cancelado");
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
        //console.log("Grito de guerra cancelado");
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
    id: 68,
    name: "Diabrete Elétrico",
    playEffect: function (diabreteData, diabreteElement, slotNumber) {
      const alliedCards = getCardsInField("allied");
      if (alliedCards.length <= 0) {
        console.warn("O campo de batalha está vazio.");
        addCardToField(diabreteElement, slotNumber);
        return;
      }

      // Filtra aliados com a palavra-chave "elétrico"
      const electricAllies = alliedCards.filter((card) => {
        const alliedCardData = cards.find((c) => c.id === card.id);
        return alliedCardData.keywords.includes("elétrico");
      });

      if (electricAllies.length > 0) {
        updateCardSpeedRequest(diabreteElement, {
          change: "increase",
          amount: 2,
        });
      }
      addCardToField(diabreteElement, slotNumber);
    },
  },

  {
    id: 71,
    name: "Odon, Mestre das Armas",
    playEffect: async function (odonData, odonElement, slotNumber) {
      const alliedCardsInField = getCardsInField("allied");
      if (alliedCardsInField.length === 0) {
        console.warn("Sem alvos válidos.");
        addCardToField(odonElement, slotNumber);
        return;
      }

      const options = [
        "Conceder +4/+2 a uma carta aliada.",
        "Conceder *provocar* a uma carta aliada",
        "Conceder *esquiva* a uma carta aliada.",
      ];

      const overlayOptions = createAndShowOptionsOverlay(options);

      if (overlayOptions) {
        const optionsDiv = overlayOptions.firstElementChild;
        if (optionsDiv) {
          const optionsButtons = optionsDiv.querySelectorAll("div"); // Seleciona os elementos div que representam as opções

          const waitForPlayerAction = () => {
            return new Promise((resolve) => {
              optionsButtons.forEach((optionButton, index) => {
                optionButton.innerHTML = options[index];
                optionButton.addEventListener("click", () => {
                  // Resolve a promessa com o índice da opção clicada
                  resolve(index);
                  overlayOptions.remove(); // Remove o overlay após a escolha
                });
              });
            });
          };

          // Espera pela ação do jogador
          const selectedOptionIndex = await waitForPlayerAction();

          switch (selectedOptionIndex) {
            case 0:
              // Caso 1: Conceder +4/+2 a uma carta aliada
              const attackChange = 4; // Defina o valor do ataque
              const healthChange = 2; // Defina o valor da vida
              handleBuffOrDebuffButtonClick({ attackChange, healthChange });
              break;
            case 1:
              // Caso 2: Conceder *provocar* a uma carta aliada
              console.log("Provocar concedido a uma carta aliada.");
              break;
            case 2:
              // Caso 3: Conceder *esquiva* a uma carta aliada
              console.log("Esquiva concedida a uma carta aliada.");
              break;
            default:
              console.log("Opção inválida.");
          }

          // Adiciona a carta ao campo após a ação do jogador
          addCardToField(odonElement, slotNumber);
        }
      }
    },
  },

  {
    id: 74,
    name: "Emissário da Água da Vida",
    playEffect: async function (emissarioData, cardElement, slotNumber) {
      // Obtém as cartas aliadas que estão feridas (currentHealth < maxHealth)
      const alliedCards = getCardsInField("allied").filter((card) => {
        const currentHealth = parseInt(card.dataset.currentHealth, 10);
        const maxHealth = parseInt(card.dataset.maxHealth, 10);
        return currentHealth < maxHealth; // Considera apenas cartas feridas
      });

      // Se não houver cartas aliadas elegíveis para cura, permite jogar diretamente
      if (alliedCards.length === 0) {
        addCardToField(cardElement, slotNumber);
        removeHighlightsAndListeners();
        return; // Encerra a função aqui
      }

      alert("Escolha uma carta para curar 1 de vida (até 4 vezes).");

      let remainingHealing = 4;

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            alliedCards.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", healCard);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const healCard = function (event) {
            event.stopPropagation(); // Impede que o clique no card também acione o cancelamento
            const targetCard = event.currentTarget;

            // Incrementa a vida atual no dataset e envia a solicitação de cura
            const currentHealth = parseInt(
              targetCard.dataset.currentHealth,
              10
            );
            const maxHealth = parseInt(targetCard.dataset.maxHealth, 10);
            const healAmount = Math.min(
              remainingHealing,
              1,
              maxHealth - currentHealth
            );

            if (healAmount > 0) {
              healCardRequest(healAmount, targetCard);
              targetCard.dataset.currentHealth = currentHealth + healAmount;
              remainingHealing -= healAmount;

              // Exibe a quantidade restante de cura
              alert(
                `Você curou ${healAmount} ponto(s). Restam ${remainingHealing} ponto(s) para distribuir.`
              );

              if (remainingHealing <= 0) {
                removeHighlightsAndListeners();
                resolve(); // Finaliza a promessa ao distribuir toda a cura
              }
            }
          };

          const cancelWarCry = (event) => {
            if (!event.target.closest(".card")) {
              // Cancela se clicar fora de uma carta
              alert("Você está cancelando a cura...");
              const cancel = handleCancel();
              if (cancel) {
                removeHighlightsAndListeners();
                reject(); // Rejeita a promessa se a cura for cancelada
              }
            }
          };

          alliedCards.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", healCard);
          });

          setTimeout(() => {
            document.addEventListener("click", cancelWarCry);
          }, 0);
        });
      };

      try {
        // Espera o jogador selecionar cartas ou cancelar
        await waitForPlayerAction();
        addCardToField(cardElement, slotNumber); // Chama addCardToField após a seleção
      } catch (err) {
        // Caso o jogador cancele, não faz nada adicional
        console.log("Cura cancelada.");
      }
    },
  },

  {
    id: 77,
    name: "Lady Vultrixanna, do Trovão Ardente",
    playEffect: (cardData, cardElement, slotNumber) => {
      // Seleciona todos os slots dinamicamente
      for (let i = 1; i <= 6; i++) {
        const slot = document.querySelector(`#opponentSlot${i}`);
        if (slot) {
          const targetCardElement = slot.querySelector(".carta");
          if (targetCardElement) {
            dealDirectDamageRequest(1, targetCardElement);
            keywordAdditionRequest("paralisia elétrica", targetCardElement);
            dealDirectDamageRequest(1, opponentAvatar);
          }
        }
      }
      addCardToField(cardElement, slotNumber);
    },
  },

  {
    id: 78,
    name: "Voltráviris Sibilante",
    playEffect: (cardData, cardElement, slotNumber) => {
      totalMana++;
      addCardToField(cardElement, slotNumber);
    },
  },

  {
    id: 80,
    name: "Bruno, A Neblina Gelada do Outono",
    playEffect: (cardData, cardElement, slotNumber) => {
      const enemyCardsInField = getCardsInField("enemy");
      if (!enemyCardsInField || enemyCardsInField.length === 0) {
        console.log("Nenhuma carta inimiga encontrada no campo.");
        addCardToField(cardElement, slotNumber);
        return; // Sai da função se não houver cartas inimigas
      }
      //console.table(enemyCardsInField);
      // Mapeia as cartas inimigas para obter os valores de ataque
      const cardsWithAttack = enemyCardsInField.map((card) => ({
        element: card,
        attack: parseInt(card.dataset.currentAttack, 10) || 0, // Garante que currentAttack seja um número válido
      }));
      //console.table(cardsWithAttack);

      // Encontra o menor valor de ataque entre as cartas inimigas
      const minAttack = Math.min(...cardsWithAttack.map((c) => c.attack));
      //console.log(minAttack);

      // Filtra as cartas que possuem o menor ataque
      const lowestAttackCards = cardsWithAttack.filter(
        (c) => c.attack === minAttack
      );
      //console.table(lowestAttackCards);

      // Sorteia uma carta caso haja empate
      const targetEnemyCard =
        lowestAttackCards[Math.floor(Math.random() * lowestAttackCards.length)];
      // Aplica o efeito de "congelamento" à carta sorteada
      //console.log(targetEnemyCard);

      if (targetEnemyCard) {
        keywordAdditionRequest("congelamento", targetEnemyCard.element);
        console.log(
          `Efeito aplicado: Congelamento na carta ${targetEnemyCard.element.dataset.instanceId}`
        );
      } else {
        console.log(
          "Não foi possível aplicar o efeito de congelamento. Variável targetEnemyCard não possui um valor válido."
        );
      }
      addCardToField(cardElement, slotNumber);
    },
  },

  {
    id: 81,
    name: "Dragãozinho Congelante",
    playEffect: (cardData, cardElement, slotNumber) => {
      const enemyCardsInField = getCardsInField("enemy");
      if (!enemyCardsInField || enemyCardsInField.length === 0) {
        console.log("Nenhuma carta inimiga encontrada no campo.");
        addCardToField(cardElement, slotNumber);
        return; // Sai da função se não houver cartas inimigas
      }
      console.table(enemyCardsInField);
      // Mapeia as cartas inimigas para obter os valores de ataque
      const cardsWithAttack = enemyCardsInField.map((card) => ({
        element: card,
        attack: parseInt(card.dataset.currentAttack, 10) || 0, // Garante que currentAttack seja um número válido
      }));
      console.table(cardsWithAttack);

      // Encontra o menor valor de ataque entre as cartas inimigas
      const minAttack = Math.min(...cardsWithAttack.map((c) => c.attack));
      console.log(minAttack);

      // Filtra as cartas que possuem o menor ataque
      const lowestAttackCards = cardsWithAttack.filter(
        (c) => c.attack === minAttack
      );
      console.table(lowestAttackCards);

      // Sorteia uma carta caso haja empate
      const targetEnemyCard =
        lowestAttackCards[Math.floor(Math.random() * lowestAttackCards.length)];
      // Aplica o efeito de "congelamento" à carta sorteada
      console.log(targetEnemyCard);

      if (targetEnemyCard) {
        keywordAdditionRequest("congelamento", targetEnemyCard.element);
        console.log(
          `Efeito aplicado: Congelamento na carta ${targetEnemyCard.element.dataset.instanceId}`
        );
      } else {
        console.log(
          "Não foi possível aplicar o efeito de congelamento. Variável targetEnemyCard não possui um valor válido."
        );
      }
      addCardToField(cardElement, slotNumber);
    },
  },

  {
    id: 82,
    name: "Espectro do Gelo Aprisionante",
    playEffect: (cardData, cardElement, slotNumber) => {
      const allCardsInField = getCardsInField();
      if (!allCardsInField || allCardsInField.length === 0) {
        console.log("Nenhuma carta encontrada no campo.");
        addCardToField(cardElement, slotNumber);
        return; // Sai da função se não houver cartas em campo
      }
      let cardsFrozen = 0;

      allCardsInField.forEach((targetCard) => {
        keywordAdditionRequest("congelamento", targetCard);
        if (targetCard.closest(".opponentSlots")) {
          cardsFrozen++;
        }
      });
      addCardToField(cardElement, slotNumber);
      const attackChange = cardsFrozen;
      const healthChange = cardsFrozen;
      buffOrDebuffRequest({ attackChange, healthChange }, cardElement);
    },
  },

  {
    id: 84,
    name: "Gigante Glacial",
    playEffect: async function (cardData, cardElement, slotNumber) {
      alert(
        "Escolha uma carta inimiga para congelar ou causar 3 de dano se já estiver congelada."
      );

      const enemyCardsInField = getCardsInField("enemy");

      if (!enemyCardsInField || enemyCardsInField.length === 0) {
        console.log("Nenhuma carta inimiga encontrada no campo.");
        addCardToField(cardElement, slotNumber);
        return; // Sai da função se não houver cartas inimigas
      }

      const waitForPlayerAction = () => {
        return new Promise((resolve, reject) => {
          const removeHighlightsAndListeners = () => {
            enemyCardsInField.forEach((card) => {
              card.classList.remove("highlight");
              card.removeEventListener("click", freezeOrDeal3Damage);
            });
            document.removeEventListener("click", cancelWarCry);
          };

          const freezeOrDeal3Damage = (event) => {
            event.stopPropagation();
            const targetCardElement = event.currentTarget.closest(".slots")
              ? event.currentTarget
              : event.currentTarget.closest(".carta");
            const keywords = JSON.parse(targetCardElement.dataset.keywords);
            if (!keywords.includes("congelamento")) {
              keywordAdditionRequest("congelamento", targetCardElement);
            } else {
              dealDirectDamageRequest(3, targetCardElement);
            }
            removeHighlightsAndListeners();
            resolve(); // Resolve a promessa quando uma carta for congelada/danificada
          };

          enemyCardsInField.forEach((card) => {
            card.classList.add("highlight");
            card.addEventListener("click", freezeOrDeal3Damage);
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
        addCardToField(cardElement, slotNumber); // Chama addCardToField ao congelar/causar dano direto a uma carta
      } catch (err) {
        //console.log("Grito de guerra cancelado");
      }
    },
  },

  {
    id: 85,
    name: "Maga da Nevasca",
    playEffect: async function (cardData, cardElement, slotNumber) {
      try {
        // Exibe as cartas do topo do deck e permite ao jogador escolher
        const cardsChosen = await lookAndPickTopDeck(5, 1);

        if (cardsChosen && cardsChosen.length === 1) {
          const cardChosen = cardsChosen[0];
          if (cardChosen) {
            displayCardInHand({ cardData: cardChosen, cardElement: undefined });
            const magaIndex = currentDeck.findIndex(
              (c) => c.instanceId == cardChosen.instanceId
            );
            if (magaIndex !== -1) {
              currentDeck.splice(magaIndex, 1);
            }
          } else {
            console.error("Carta escolhida não encontrada.");
            return;
          }
        } else {
          console.error("Nenhuma carta escolhida.");
          return;
        }
        // Adiciona a "Maga da Nevasca" ao campo
        addCardToField(cardElement, slotNumber);
      } catch (error) {
        console.error(
          "Houve um erro ao usar a habilidade da Maga da Nevasca:",
          error
        );
      }
    },
  },

  {
    id: 89,
    name: "Vigia do Farol do Norte",
    playEffect: (cardData, cardElement, slotNumber) => {
      drawCard();
      addCardToField(cardElement, slotNumber);
    },
  },

  {},
];

const cards = [
  {
    id: 1,
    name: "A Vagante Sombria",
    baseCost: 10,
    image: "assets/cartas/obscura/A_Vagante_Sombria.png",
    baseAttack: 10,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["indestrutível", "obscuro", "morto-vivo", "constante"],
  },
  {
    id: 2,
    name: "Elemental do Fogo",
    baseCost: 2,
    image: "assets/cartas/ignea/Elemental_do_Fogo.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["grito de guerra", "ígneo", "elemental"],
  },
  {
    id: 3,
    name: "Espírito Flamejante",
    baseCost: 1,
    image: "assets/cartas/ignea/Espírito_Flamejante.png",
    baseAttack: 1,
    baseHealth: 1,
    baseSpeed: 1,
    keywords: ["ígneo", "constante"],
  },
  {
    id: 4,
    name: "Fulgurvoltz",
    baseCost: 13,
    image: "assets/cartas/eletrica/Fulgurvoltz.png",
    baseAttack: 10,
    baseHealth: 8,
    baseSpeed: 2,
    keywords: ["elétrico", "grito de guerra", "elemental"],
  },
  {
    id: 5,
    name: "Ivan Ignisar",
    baseCost: 7,
    image: "assets/cartas/ignea/Ivan_Ignisar.png",
    baseAttack: 7,
    baseHealth: 6,
    baseSpeed: 2,
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
    baseSpeed: 2,
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
    baseSpeed: 2,
    keywords: ["elétrico", "grito de guerra", "humano", "nulifária"],
  },
  {
    id: 8,
    name: "Layla",
    baseCost: 5,
    image: "assets/cartas/eletrica/Layla.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 2,
    keywords: [
      "elétrico",
      "grito de guerra",
      "condicional",
      "final da rodada",
      "alcance",
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
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 9000,
    name: "Mali transformado",
    baseCost: 9,
    image: "assets/cartas/neutra/Mali_transformado.png",
    baseAttack: 8,
    baseHealth: 10,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 10,
    name: "Rusco",
    baseCost: 2,
    image: "assets/cartas/neutra/Rusco.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 11,
    name: "Sabrina",
    baseCost: 4,
    image: "assets/cartas/aquatica/Sabrina.png",
    baseAttack: 4,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 12,
    name: "Thorwells",
    baseCost: 6,
    image: "assets/cartas/eletrica/Thorwells.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 6,
    keywords: ["elétrico", "grito de guerra", "celestial"],
  },
  {
    id: 13,
    name: "Tony Raiturus",
    baseCost: 6,
    image: "assets/cartas/eletrica/Tony_Raiturus.png",
    baseAttack: 5,
    baseHealth: 6,
    baseSpeed: 6,
    keywords: [
      "elétrico",
      "humano",
      "dragão",
      "dragão primordial",
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
    baseSpeed: 5,
    keywords: ["grito de guerra", "elétrico", "alcance"],
  },
  {
    id: 15,
    name: "Necrófago Espectral",
    baseCost: 1,
    image: "assets/cartas/obscura/Necrófago_Espectral.png",
    baseAttack: 4,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 16,
    name: "O Revivente Eterno",
    baseCost: 2,
    image: "assets/cartas/obscura/O_Revivente_Eterno.png",
    baseAttack: 3,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 17,
    name: "Replicador Maldito",
    baseCost: 2,
    image: "assets/cartas/obscura/Replicador_Maldito.png",
    baseAttack: 2,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 18,
    name: "Fênix das Trevas Profana",
    baseCost: 3,
    image: "assets/cartas/obscura/Fênix_das_Trevas_Profana.png",
    baseAttack: 3,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 19,
    name: "Titânico Morcegalma",
    baseCost: 4,
    image: "assets/cartas/obscura/Titânico_Morcegalma.png",
    baseAttack: 5,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 20,
    name: "O Espiritomante",
    baseCost: 5,
    image: "assets/cartas/obscura/O_Espiritomante.png",
    baseAttack: 3,
    baseHealth: 6,
    baseSpeed: 1,
    keywords: [
      "obscuro",
      "último suspiro",
      "humano",
      "feiticeiro",
      "necromante",
      "alcance",
    ],
  },
  {
    id: 21,
    name: "Jeff-The-Death",
    baseCost: 5,
    image: "assets/cartas/obscura/Jeff-The-Death.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["grito de guerra", "indestrutível", "obscuro"],
  },
  {
    id: 22,
    name: "Cientista da Morte",
    baseCost: 3,
    image: "assets/cartas/obscura/Cientista_da_Morte.png",
    baseAttack: 1,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 22000,
    name: "Cadáver Reanimado",
    baseCost: 3,
    image: "assets/cartas/obscura/Cadáver_Reanimado.png",
    baseAttack: 3,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 23,
    name: "Rai'Emofitir",
    baseCost: 8,
    image: "assets/cartas/obscura/Rai'Emofitir.png",
    baseAttack: 6,
    baseHealth: 6,
    baseSpeed: 1,
    keywords: ["grito de guerra", "obscuro", "celestial", "precursor"],
  },
  {
    id: 25,
    name: "Mente Destrutiva",
    baseCost: 5,
    image: "assets/cartas/neutra/Mente_Destrutiva.png",
    baseAttack: 2,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 26,
    name: "Eletroad",
    baseCost: 4,
    image: "assets/cartas/eletrica/Eletroad.png",
    baseAttack: 3,
    baseHealth: 6,
    baseSpeed: 1,
    keywords: ["elétrico", "fera", "grito de guerra", "início da rodada"],
  },
  {
    id: 27,
    name: "Sta. Helena Maria da Cura",
    baseCost: 10,
    image: "assets/cartas/neutra/Sta._Helena_Maria_da_Cura.png",
    baseAttack: 7,
    baseHealth: 10,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 28,
    name: "Engenheiro Louco",
    baseCost: 2,
    image: "assets/cartas/neutra/Engenheiro_Louco.png",
    baseAttack: 1,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["grito de guerra", "neutro", "anão"],
  },
  {
    id: 29,
    name: "D'Lorafya",
    baseCost: 6,
    image: "assets/cartas/ignea/D'Lorafya.png",
    baseAttack: 7,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["ígneo", "grito de guerra", "alcance"],
  },
  {
    id: 30,
    name: "Kell",
    baseCost: 10,
    image: "assets/cartas/sagrada/Kell.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 31,
    name: "Neraqa",
    baseCost: 6,
    image: "assets/cartas/aquatica/Neraqa.png",
    baseAttack: 0,
    baseHealth: 12,
    baseSpeed: 1,
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
    baseSpeed: 1,
    keywords: ["aquático", "dano excessivo"],
  },
  {
    id: 35,
    name: "Alexa",
    baseCost: 4,
    image: "assets/cartas/aquatica/Alexa.png",
    baseAttack: 3,
    baseHealth: 10,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 36,
    name: "Espírito Carregado",
    baseCost: 1,
    image: "assets/cartas/eletrica/Espírito_Carregado.png",
    baseAttack: 1,
    baseHealth: 1,
    baseSpeed: 3,
    keywords: ["elétrico", "elemental", "ataque relâmpago", "último suspiro"],
  },
  {
    id: 39,
    name: "Dragão Ancião do Trovão",
    baseCost: 5,
    image: "assets/cartas/eletrica/Dragão_Ancião_do_Trovão.png",
    baseAttack: 7,
    baseHealth: 4,
    baseSpeed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 40,
    name: "Gigante Elétrico",
    baseCost: 5,
    image: "assets/cartas/eletrica/Gigante_Elétrico.png",
    baseAttack: 9,
    baseHealth: 8,
    baseSpeed: 2,
    keywords: ["elétrico", , "gigante", "grito de guerra"],
  },
  {
    id: 49,
    name: "Arcanjo Uriel",
    baseCost: 3,
    image: "assets/cartas/sagrada/Arcanjo_Uriel.png",
    baseAttack: 2,
    baseHealth: 5,
    baseSpeed: 2,
    keywords: [
      "sagrado",
      "voo",
      "anjo",
      "arcanjo",
      "celestial",
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
    baseSpeed: 1,
    keywords: ["grito de guerra", "neutro", "circuitrônico"],
  },
  {
    id: 51,
    name: "Torrente Azul",
    baseCost: 6,
    image: "assets/cartas/aquatica/Torrente_Azul.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 3,
    keywords: ["aquático"],
  },
  {
    id: 52,
    name: "Lucien",
    baseCost: 6,
    image: "assets/cartas/sagrada/Lucien.png",
    baseAttack: 3,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["sagrado", "humano", "monge", "condicional", "fim da rodada"],
  },
  {
    id: 53,
    name: "Gigante Marinho",
    baseCost: 4,
    image: "assets/cartas/aquatica/Gigante_Marinho.png",
    baseAttack: 8,
    baseHealth: 7,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 54,
    name: "Elemental de Água Gigante",
    baseCost: 10,
    image: "assets/cartas/aquatica/Elemental_de_Água_Gigante.png",
    baseAttack: 0,
    baseHealth: 1,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55,
    name: "Ronan",
    baseCost: 3,
    image: "assets/cartas/ignea/Ronan.png",
    baseAttack: 4,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 55000,
    name: "Ronan transformado",
    baseCost: 3,
    image: "assets/cartas/modo_truco/Ronan_transformado.png",
    baseAttack: 6,
    baseHealth: 4,
    baseSpeed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 56,
    name: "Zarvok",
    baseCost: 5,
    image: "assets/cartas/ignea/Zarvok.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 57,
    name: "Gigante Flamejante",
    baseCost: 4,
    image: "assets/cartas/ignea/Gigante_Flamejante.png",
    baseAttack: 8,
    baseHealth: 7,
    baseSpeed: 1,
    keywords: ["ígneo", , "grito de guerra", "gigante"],
  },
  {
    id: 58,
    name: "Piromante Ardente",
    baseCost: 2,
    image: "assets/cartas/ignea/Piromante_Ardente.png",
    baseAttack: 3,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["ígneo", "alcance", "grito de guerra", "humano", "mago"],
  },
  {
    id: 59,
    name: "Avatar do Fogo",
    baseCost: 5,
    image: "assets/cartas/ignea/Avatar_do_Fogo.png",
    baseAttack: 5,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["ígneo", "grito de guerra", "alcance", "avatar"],
  },
  {
    id: 60,
    name: "Irina Lança-Chamas",
    baseCost: 4,
    image: "assets/cartas/ignea/Irina_Lança-Chamas.png",
    baseAttack: 5,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["ígneo", "alcance", "grito de guerra", "humano", "mutante"],
  },
  {
    id: 61,
    name: "Esther",
    baseCost: 2,
    image: "assets/cartas/ignea/Esther.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 62,
    name: "Brutamontes Chocante",
    baseCost: 8,
    image: "assets/cartas/eletrica/Brutamontes_Chocante.png",
    baseAttack: 7,
    baseHealth: 7,
    baseSpeed: 2,
    keywords: ["elétrico", "humano", "paralisante", "grito de guerra"],
  },
  {
    id: 63,
    name: "Eletrocaçadora Vesper",
    baseCost: 6,
    image: "assets/cartas/eletrica/Eletrocaçadora_Vesper.png",
    baseAttack: 7,
    baseHealth: 5,
    baseSpeed: 3,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 64,
    name: "Dragãozinho Flamejante",
    baseCost: 1,
    image: "assets/cartas/ignea/Dragãozinho_Flamejante.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["ígneo", "voo", "dragão", "grito de guerra"],
  },
  {
    id: 65,
    name: "David-The-Titanslayer",
    baseCost: 4,
    image: "assets/cartas/neutra/David-The-Titanslayer.png",
    baseAttack: 6,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["neutro", "humano", "grito de guerra"],
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    baseCost: 1,
    image: "assets/cartas/obscura/Diabrete_Sombrio.png",
    baseAttack: 2,
    baseHealth: 1,
    baseSpeed: 1,
    keywords: ["obscuro", "lagumverrano", "diabrete"],
  },
  {
    id: 67,
    name: "Agonox",
    baseCost: 5,
    image: "assets/cartas/obscura/Agonox.png",
    baseAttack: 4,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 68,
    name: "Diabrete Elétrico",
    baseCost: 1,
    image: "assets/cartas/eletrica/Diabrete_Elétrico.png",
    baseAttack: 2,
    baseHealth: 1,
    baseSpeed: 2,
    keywords: ["nadaporenquanto"],
  },
  {
    id: 69,
    name: "Oráculo das Marés",
    baseCost: 2,
    image: "assets/cartas/aquatica/Oráculo_das_Marés.png",
    baseAttack: 0,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["aquático", "benevolente", "grito de guerra", "condicional"],
  },
  {
    id: 70,
    name: "Thalassor",
    baseCost: 7,
    image: "assets/cartas/aquatica/Thalassor.png",
    baseAttack: 7,
    baseHealth: 9,
    baseSpeed: 1,
    keywords: ["aquático", "tritão", "constante"],
  },
  {
    id: 71,
    name: "Odon, Mestre das Armas",
    baseCost: 4,
    image: "assets/cartas/neutra/Odon,_Mestre_das_Armas.png",
    baseAttack: 4,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["neutro", "anão", "grito de guerra"],
  },
  {
    id: 72,
    name: "Sengoku",
    baseCost: 7,
    image: "assets/cartas/neutra/Sengoku.png",
    baseAttack: 7,
    baseHealth: 7,
    baseSpeed: 3,
    keywords: [
      "neutro",
      "humano",
      "dragão",
      "dragão primordial",
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
    baseSpeed: 4,
    keywords: ["neutro", "humano", "esquiva", "constante"],
  },
  {
    id: 74,
    name: "Emissário da Água da Vida",
    baseCost: 3,
    image: "assets/cartas/aquatica/Emissário_da_Água_da_Vida.png",
    baseAttack: 3,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["aquático", "grito de guerra"],
  },
  {
    id: 75,
    name: "Fada do Fogo",
    baseCost: 1,
    image: "assets/cartas/ignea/Fada_do_Fogo.png",
    baseAttack: 1,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["ígneo", "voo"],
  },
  {
    id: 76,
    name: "Estrondador Ígneo",
    baseCost: 2,
    image: "assets/cartas/ignea/Estrondador_Ígneo.png",
    baseAttack: 2,
    baseHealth: 3,
    baseSpeed: 1,
    keywords: ["ígneo", "dano excessivo"],
  },
  {
    id: 77,
    name: "Lady Vultrixanna, do Trovão Ardente",
    baseCost: 5,
    image: "assets/cartas/ignea/Lady_Vultrixanna.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 3,
    keywords: ["ígneo", "elétrico", "grito de guerra"],
  },
  {
    id: 78,
    name: "Voltráviris Sibilante",
    baseCost: 3,
    image: "assets/cartas/eletrica/Voltráviris_Sibilante.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 2,
    keywords: ["elétrico", "grito de guerra", "voo"],
  },
  {
    id: 79,
    name: "Zevran, o Arco Trovejante",
    baseCost: 8,
    image: "assets/cartas/eletrica/Zevran,_o_Arco_Trovejante.png",
    baseAttack: 13,
    baseHealth: 6,
    baseSpeed: 4,
    keywords: ["elétrico", "alcance"],
  },
  {
    id: 80,
    name: "Bruno, A Neblina Gelada do Outono",
    baseCost: 4,
    image: "assets/cartas/glacial/Bruno,_A_Neblina_Gelada_do_Outono.png",
    baseAttack: 5,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["glacial", "congelante", "grito de guerra"],
  },
  {
    id: 81,
    name: "Dragãozinho Congelante",
    baseCost: 1,
    image: "assets/cartas/glacial/Dragãozinho_Congelante.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["glacial", "grito de guerra", "congelante"],
  },
  {
    id: 82,
    name: "Espectro do Gelo Aprisionante",
    baseCost: 3,
    image: "assets/cartas/glacial/Espectro_do_Gelo_Aprisionante.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: [
      "glacial",
      "grito de guerra",
      "congelante",
      "voo",
      "espectro",
      "espírito",
    ],
  },
  {
    id: 83,
    name: "Espírito da Aurora",
    baseCost: 1,
    image: "assets/cartas/glacial/Espírito_da_Aurora.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["glacial", "congelante", "espectro", "espírito"],
  },
  {
    id: 84,
    name: "Gigante Glacial",
    baseCost: 4,
    image: "assets/cartas/glacial/Gigante_Glacial.png",
    baseAttack: 8,
    baseHealth: 7,
    baseSpeed: 1,
    keywords: ["glacial", "grito de guerra", "gigante"],
  },
  {
    id: 85,
    name: "Maga da Nevasca",
    baseCost: 4,
    image: "assets/cartas/glacial/Maga_da_Nevasca.png",
    baseAttack: 4,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["glacial", "grito de guerra", "humano", "mago"],
  },
  {
    id: 86,
    name: "Pequena Floco de Neve",
    baseCost: 3,
    image: "assets/cartas/glacial/Pequena_Floco_de_Neve.png",
    baseAttack: 2,
    baseHealth: 4,
    baseSpeed: 1,
    keywords: ["glacial", "humano", "mago"],
  },
  {
    id: 87,
    name: "Princesa Wanessa",
    baseCost: 5,
    image: "assets/cartas/glacial/Princesa_Wanessa.png",
    baseAttack: 5,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["glacial", "grito de guerra", "humano", "mago"],
  },
  {
    id: 88,
    name: "Rei Gelado",
    baseCost: 6,
    image: "assets/cartas/glacial/Rei_Gelado.png",
    baseAttack: 6,
    baseHealth: 5,
    baseSpeed: 1,
    keywords: ["glacial", "congelante"],
  },
  {
    id: 89,
    name: "Vigia do Farol do Norte",
    baseCost: 2,
    image: "assets/cartas/glacial/Vigia_do_Farol_do_Norte.png",
    baseAttack: 2,
    baseHealth: 2,
    baseSpeed: 1,
    keywords: ["glacial", "grito de guerra", "humano", "último suspiro"],
  },
];

const restrictedCardsToPlay = [
  {
    id: 40,
    name: "Gigante Elétrico",
    restriction: function () {
      // Ele só pode ser jogado se um total de 3+ de mana adicional foi gerada em seu favor neste rodada
      const canPlayTheCard = additionalManaThisRound >= 3 ? true : false;
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

  {
    id: 84,
    name: "Gigante Glacial",
    restriction: function () {
      const canPlayTheCard = cardsFrozenThisRound >= 2 ? true : false;
      return canPlayTheCard;
    },
  },
  // restante das cartas que possuem restrições
];

const conditionalEffectsCards = [
  {
    id: 7,
    name: "Jack",
    effect: (jackCardElement) => {
      // Cria um proxy específico para monitorar mensagens do servidor
      const proxy = new Proxy(handleMessageFromServer, {
        apply(target, thisArg, argumentsList) {
          const [message] = argumentsList;

          console.log("Mensagem recebida:", message);
          console.log("Data da mensagem:", message.data);

          // Verifica se a mensagem é do tipo "applyDamageToAvatar" e atende às condições

          // Função para verificar se a mensagem é do tipo esperado
          function isMessageTypeApplyDamage(message) {
            const result = message.type === "applyDamageToAvatar";
            if (!result)
              console.log(
                "Falha: Tipo de mensagem não é 'applyDamageToAvatar'."
              );
            return result;
          }

          if (!isMessageTypeApplyDamage) {
            console.log(
              "Mensagem não é do tipo que interage com o efeito condicional de Jack."
            );
            return;
          }

          // Função para garantir que a carta e keywords existam
          function hasValidCartaKeywords(message) {
            const keywords = message.data?.carta?.keywords;
            if (!keywords) {
              console.log("Falha: 'keywords' não encontrado na carta.");
              return false;
            }
            const result =
              Array.isArray(keywords) && keywords.includes("elétrico");
            if (!result)
              console.log("Falha: 'keywords' não contém 'elétrico'.");
            return result;
          }

          // Função para verificar se o alvo é inimigo
          function isTargetEnemy(message) {
            const result = message.data?.targetAvatar === "enemy";
            if (!result) console.log("Falha: 'targetAvatar' não é 'enemy'.");
            return result;
          }

          // Função principal para validar todas as condições
          function shouldActivateEffect(message) {
            console.debug("Iniciando validação das condições...");
            const checks = [
              isMessageTypeApplyDamage(message),
              hasValidCartaKeywords(message),
              isTargetEnemy(message),
            ];

            // Registra qual condição falhou, se necessário
            const allConditionsMet = checks.every((check, index) => {
              if (!check) console.debug(`Condição ${index + 1} falhou.`);
              return check;
            });

            if (allConditionsMet) {
              console.log("Todas as condições foram atendidas!");
            } else {
              console.warn("Nem todas as condições foram atendidas.");
            }

            return allConditionsMet;
          }

          // Uso no fluxo principal
          if (shouldActivateEffect(message)) {
            // Verifica se Jack ainda está em campo
            if (!document.contains(jackCardElement)) {
              console.log("Jack não está mais no campo de batalha.");
              return Reflect.apply(target, thisArg, argumentsList);
            }

            console.log(
              `Jack recebe buff devido ao ataque elétrico na carta ${message.data.carta.instanceId}!`
            );

            jackCardElement.classList.add("jackEffect");

            // Escuta o evento 'animationend' para remover a classe ao final da animação
            jackCardElement.addEventListener(
              "animationend",
              function () {
                jackCardElement.classList.remove("jackEffect");
              },
              { once: true }
            ); // O { once: true } garante que o evento será executado apenas uma vez

            // Aplica o buff a Jack
            const attackChange = 1;
            const healthChange = 1;
            buffOrDebuffRequest(
              { attackChange, healthChange },
              jackCardElement
            );
            if (jackCardElement.dataset.speed < 4) {
              console.log("Velocidade de Jack é menor que 4, aumentando-a.");
              const options = { change: "increase", amount: 1 };
              updateCardSpeedRequest(jackCardElement, options);
            } else {
              console.warn("Velocidade de Jack já é a máxima permitida.");
            }
          } else {
            console.warn(
              "Não cumpre os requisitos para ativação do efeito condicional de Jack."
            );
          }

          // Continua chamando a função original
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });

      // Associa o proxy à instância de Jack
      jackCardElement.proxy = proxy;

      // Substitui a função handleMessageFromServer apenas enquanto Jack estiver em campo
      const originalFunction = handleMessageFromServer;
      handleMessageFromServer = function (...args) {
        // Se Jack ainda estiver no campo, usa o proxy
        if (document.contains(jackCardElement)) {
          return jackCardElement.proxy.apply(this, args);
        } else {
          // Se Jack sair do campo, volta para a função original
          handleMessageFromServer = originalFunction;
          return Reflect.apply(originalFunction, this, args);
        }
      };
    },
  },

  {
    id: 8,
    name: "Layla",
    effect: (laylaCardElement) => {
      // Cria um proxy específico para monitorar keywordAdditionRequest de forma independente
      const proxy = new Proxy(keywordAdditionRequest, {
        apply(target, thisArg, argumentsList) {
          const [keyword, cardElement] = argumentsList;

          // Se o primeiro argumento for "paralisia elétrica"
          if (keyword === "paralisia elétrica") {
            // Verifica se a Layla que gerou o proxy ainda está viva (ainda no DOM)
            if (!document.contains(laylaCardElement)) {
              //console.log("Layla não está mais no campo de batalha.");
              return Reflect.apply(target, thisArg, argumentsList);
            }

            /*   console.log(
              `Layla causa 3 de dano à carta de instanceId = ${cardElement.dataset.instanceId}!`
            ); */

            // Causar 3 de dano ao cardElement
            dealDirectDamageRequest(3, cardElement);
            // Adiciona a classe para iniciar a animação
            laylaCardElement.classList.add("laylaEffect");

            // Escuta o evento 'animationend' para remover a classe ao final da animação
            laylaCardElement.addEventListener(
              "animationend",
              function () {
                laylaCardElement.classList.remove("laylaEffect");
              },
              { once: true }
            ); // O { once: true } garante que o evento será executado apenas uma vez
          }

          // Continua chamando a função original
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });

      // Associa o proxy à instância de Layla, sem substituir a função global
      laylaCardElement.proxy = proxy;

      // Monitora quando a função keywordAdditionRequest for chamada
      const originalFunction = keywordAdditionRequest;
      keywordAdditionRequest = function (...args) {
        // Se a Layla correspondente ainda estiver em campo, ativa o proxy
        if (document.contains(laylaCardElement)) {
          return laylaCardElement.proxy.apply(this, args);
        } else {
          // Se Layla já saiu do campo, volta para a função original
          return Reflect.apply(originalFunction, this, args);
        }
      };
    },
  },
  {
    id: 73,
    name: "Drake",
    effect: (drakeElement) => {
      const proxy = new Proxy(attackCardRequest, {
        apply(target, thisArg, argumentsList) {
          const [cartaAtacanteElement, cartaAlvoElement] = argumentsList;

          // Pega as cartas aliadas em campo
          const alliedCardsInField = getCardsInField("allied");

          // Encontra a maior velocidade entre as cartas aliadas
          let maxAlliedSpeed = 0;
          alliedCardsInField.forEach((card) => {
            const cardSpeed = parseInt(card.dataset.speed, 10);
            if (cardSpeed > maxAlliedSpeed) {
              maxAlliedSpeed = cardSpeed;
            }
          });

          // Se a velocidade da carta atacante for maior ou igual à maior velocidade das cartas aliadas, aplica o efeito
          if (
            parseInt(cartaAtacanteElement.dataset.speed, 10) >= maxAlliedSpeed
          ) {
            // Aqui você pode definir a lógica do efeito, por exemplo, permitir um ataque extra imediato
            console.log(
              `Efeito de Drake ativado! Velocidade do atacante: ${cartaAtacanteElement.dataset.speed}, Velocidade máxima das aliadas: ${maxAlliedSpeed}`
            );

            // Envia a mensagem 'enableAttackRequest' para permitir que a carta atacante realize um ataque adicional
            const message = {
              type: "enableAttackRequest",
              data: { instanceId: cartaAtacanteElement.dataset.instanceId },
            };
            sendMessageToServer(JSON.stringify(message));

            // Chama a função original de ataque para permitir o ataque
            Reflect.apply(target, thisArg, argumentsList);

            // Agora, executa o ataque adicional imediatamente
            console.log("Ataque extra de Drake ativado!");
            // Chama o ataque novamente, desta vez como um ataque extra
            return Reflect.apply(target, thisArg, argumentsList);
          }

          // Se a condição não for atendida, apenas chama a função original de ataque
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });

      // Associa o proxy à instância de Drake, sem substituir a função global
      drakeElement.proxy = proxy;

      // Monitora quando a função attackCardRequest for chamada
      const originalFunction = attackCardRequest;
      attackCardRequest = function (...args) {
        // Se o Drake ainda estiver em campo, ativa o proxy
        if (document.contains(drakeElement)) {
          return drakeElement.proxy.apply(this, args);
        } else {
          // Se Drake já saiu do campo, volta para a função original
          return Reflect.apply(originalFunction, this, args);
        }
      };
    },
  },

  {
    id: 76,
    name: "Estrondador Ígneo",
    effect: (estrondadorElement) => {
      // Cria um proxy específico para monitorar a chamada da função attackTheAvatarRequest
      const proxy = new Proxy(attackTheAvatarRequest, {
        apply(target, thisArg, argumentsList) {
          const [cartaAtacante, targetAvatar] = argumentsList;

          // Se o primeiro argumento for igual ao próprio Estrondador
          if (
            cartaAtacante === estrondadorElement &&
            targetAvatar === opponentAvatar
          ) {
            // Causar 1 de dano às cartas na retaguarda do oponente
            // Seletor para encontrar apenas os slots com os IDs opponentSlot4, opponentSlot5 e opponentSlot6 (retaguarda)
            const opponentSlots = document.querySelectorAll(
              "#opponentSlot4, #opponentSlot5, #opponentSlot6"
            );

            // Iterar sobre os slots do oponente selecionados
            opponentSlots.forEach((slot) => {
              // Encontrar a carta no slot atual
              const backlineCard = slot.querySelector(".carta");
              dealDirectDamageRequest(1, backlineCard);
            });
          };

          // Continua chamando a função original
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });

      // Associa o proxy à instância do Estrondador, sem substituir a função global
      estrondadorElement.proxy = proxy;

      // Monitora quando a função attackTheAvatarRequest for chamada
      const originalFunction = attackTheAvatarRequest;
      attackTheAvatarRequest = function (...args) {
        // Ativa o proxy ao chamar a função, sempre que o Estrondador estiver atacando
        return estrondadorElement.proxy.apply(this, args);
      };
    },
  },

  {
    id: 80,
    name: "Bruno, A Neblina Gelada do Outono",
    effect: (brunoCardElement) => {
      // Referência às funções originais
      const originalAttackTheAvatarRequest = attackTheAvatarRequest;
      const originalAttackCardRequest = attackCardRequest;

      // Cria um proxy para monitorar attackTheAvatarRequest e attackCardRequest
      const monitorAttackRequests = (requestFunction) => {
        return new Proxy(requestFunction, {
          apply(target, thisArg, argumentsList) {
            const [cartaAtacante] = argumentsList;

            // Verifica se o Bruno ainda está no DOM
            if (!document.contains(brunoCardElement)) {
              // Restaura a função original
              attackTheAvatarRequest = originalAttackTheAvatarRequest;
              attackCardRequest = originalAttackCardRequest;
              return Reflect.apply(target, thisArg, argumentsList);
            }

            // Verifica se o atacante é o Bruno
            if (
              cartaAtacante.dataset.instanceId ===
              brunoCardElement.dataset.instanceId
            ) {
              console.log(
                `cardsFrozenThisRound = ${cardsFrozenThisRound} ao ativar o efeito de ataque do Bruno`
              );
              const attackChange = cardsFrozenThisRound;
              const healthChange = 0;
              buffOrDebuffRequest(
                { attackChange, healthChange },
                brunoCardElement
              );
              // Adiciona a classe para iniciar a animação
              brunoCardElement.classList.add("glacial-aura-effect-trigger");

              // Remove a classe ao final da animação
              brunoCardElement.addEventListener(
                "animationend",
                () => {
                  brunoCardElement.classList.remove(
                    "glacial-aura-effect-trigger"
                  );
                },
                { once: true }
              );
            }

            // Continua chamando a função original
            return Reflect.apply(target, thisArg, argumentsList);
          },
        });
      };

      // Substitui as funções originais por proxies
      attackTheAvatarRequest = monitorAttackRequests(attackTheAvatarRequest);
      attackCardRequest = monitorAttackRequests(attackCardRequest);
    },
  },

  {
    id: 86,
    name: "Pequena Floco de Neve",
    effect: (cardElement) => {
      // Referência às funções originais
      const originalAttackCardRequest = attackCardRequest;
      const originalUpdateFieldAfterCombat = updateFieldAfterCombat;

      // Função genérica para monitorar e aplicar lógica a funções
      const monitorRequests = (requestFunction, functionName) => {
        return new Proxy(requestFunction, {
          apply(target, thisArg, argumentsList) {
            // Lógica para attackCardRequest
            if (functionName === "attackCardRequest") {
              const [cartaAtacante, cartaAlvoElement] = argumentsList;

              // Verifica se a Pequena ainda está no DOM
              if (!document.contains(cardElement)) {
                attackCardRequest = originalAttackCardRequest;
                return Reflect.apply(target, thisArg, argumentsList);
              }

              // Verifica se o atacante é a Pequena
              if (
                cartaAtacante.dataset.instanceId ===
                cardElement.dataset.instanceId
              ) {
                updateCardSpeedRequest(cartaAlvoElement, {
                  change: "decrease",
                  amount: 1,
                });
              }
            }

            // Lógica para updateFieldAfterCombat
            if (functionName === "updateFieldAfterCombat") {
              const [cartaAlvoData, cartaAtacanteData] = argumentsList;

              // Verifica se a Pequena ainda está no DOM
              if (!document.contains(cardElement)) {
                updateFieldAfterCombat = originalUpdateFieldAfterCombat;
                return Reflect.apply(target, thisArg, argumentsList);
              }

              if (
                Number(cartaAlvoData.instanceId) ===
                Number(cardElement.dataset.instanceId)
              ) {
                const cardToFreeze = document.querySelector(
                  `.carta[data-instance-id="${cartaAtacanteData.instanceId}"]`
                );
                if (cardToFreeze) {
                  keywordAdditionRequest("congelamento", cardToFreeze);
                }
              }
            }

            // Continua chamando a função original
            return Reflect.apply(target, thisArg, argumentsList);
          },
        });
      };

      // Substitui as funções originais por proxies
      attackCardRequest = monitorRequests(
        attackCardRequest,
        "attackCardRequest"
      );
      updateFieldAfterCombat = monitorRequests(
        updateFieldAfterCombat,
        "updateFieldAfterCombat"
      );
    },
  },
];

// -------------------------------------------------
// Mapa para armazenar os listeners de clique associados a cada cardContainer
const clickListenersMap = new Map();

//--------------------------------------------------------------------------------------
const handElement = document.getElementById("hand");

// WebSocket
//const ws = new WebSocket("wss://uclagamewsserver.onrender.com");
const ws = new WebSocket("ws://localhost:8081");

ws.onopen = () => {
  console.log("Eu sou um cliente e estou conectado ao servidor.");
};

ws.onmessage = (event) => {
  //console.log("Mensagem recebida do servidor:", event.data);
  const message = JSON.parse(event.data);
  handleMessageFromServer(message);
};

ws.onerror = (error) => {
  console.error("Erro na conexão WebSocket:", error);
};

//-------------------------------------------------------------------------------------

function handleSubmit(event) {
  event.preventDefault(); // Previne o comportamento padrão do formulário
  let username = loginForm.querySelector("#username").value;
  //console.log("Usuário:", username);

  player.username = username;
  //console.log("Usuário:", username);
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
  //console.table(message);
}

//--------------------------------------------------------------------------------------

const endRoundButton = document.querySelector("#endRound");

function handleMessageFromServer(message) {
  //console.log("Mensagem recebida do servidor");
  //console.log("Tipo da mensagem:", message.type);
  if (message.type === "nextRoundEffect") {
    console.log("Mensagem do tipo nextRoundEffect detectada.");
  }

  switch (message.type) {
    case "yourUserId":
      //console.table(message);
      player.id = message.data;
      break;
    case "nicknameInUse":
      const message2 = message.message;
      if (message2) {
        alert(message2);
      }
      break;

    case "requestDeckCode":
      //console.log(message.message);
      askForDeckCode();
      break;

    case "deckShuffled":
      currentDeck = message.data;
      starterDeck = currentDeck;
      showDeckPreview();
      //console.log("currentDeck atualizado:");
      //console.table(currentDeck);
      break;

    case "startGame":
      //console.log(message.message);
      theGameStarts();
      break;

    case "whoPlaysFirstDecided":
      const { data } = message;
      if (data === "you play first") {
        setTimeout(() => {
          alert("Você joga PRIMEIRO.");
        }, 1000);
        firstToPlay = true;
        yourTurn = true;
      } else {
        setTimeout(() => {
          alert("Você joga SEGUNDO.");
        }, 1000);
        firstToPlay = false;
        yourTurn = false;
        endRoundButton.disabled = true; // Desabilita o botão se você joga em segundo
      }
      break;

    case "yourTurn":
      alert("Sua vez. Você pode jogar agora.");
      yourTurn = true;
      endRoundButton.disabled = false; // Habilitar o botão se é a sua vez de jogar
      break;

    case "notYourTurn":
      yourTurn = false;
      endRoundButton.disabled = true; // Desabilita o botão se não é a sua vez
      break;

    case "cardDrawOrder":
      //console.table(message);
      drawCard(message.amount);
      break;

    case "canPlayTheCard":
      /*  console.log(
        "Mensagem do servidor. Adição de carta ao campo de batalha autorizada para a carta com os dados (message.data): ",
        JSON.stringify(message.data)
      ); */
      if (message.data.novaCarta) {
        const card = message.data.novaCarta;
        if (message.data.slotNumber) {
          selectBattlefieldSlot({ card }, message.data.slotNumber);
          // se for uma invocação direta, mas sem um slot definido
        } else {
          alert("Escolha um slot para invocar a carta.");
          selectBattlefieldSlot({ card });
        }
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
      /* console.log(
        "Adicionar carta ao campo de batalha do inimigo para os dados: "
      ); */
      //console.table(message.data);
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

    case "cardCantAttack":
      message.explanation
        ? alert(message.explanation)
        : alert(
            "A carta já atacou ou não pode atacar agora (tente aguardar até a próxima rodada)."
          );
      break;

    case "card Attack enabled":
      const cardData = message.data.carta;
      const name = cardData.name;
      const instanceId = cardData.instanceId;
      console.log(
        `Carta ${name} de instanceId ${instanceId} agora pode atacar`
      );
      break;

    case "applyDamageToAvatar":
      if (message.data.carta) {
        applyDamageToAvatar(message.data, message.data.carta);
      } else {
        applyDamageToAvatar(message.data);
      }
      break;

    case "buffCard":
    case "applyHealingToCard":
    case "applyDamageToCard":
    case "destroyCardOrder":
    case "cardSpeedUpdated":
      updateCardStats(message.data);
      if (message.type === "destroyCardOrder") cardsDestroyedByEffects++;
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

    case "keywordRemoved":
    case "keywordAdded":
      const { operation } = message.data;
      updateCardKeywords(
        message.data.keyword,
        message.data.cardData,
        operation
      );
      break;

    case "endTheRoundOrder":
      endTheRound();
      break;

    case "nextRoundEffect":
      nextRoundEffectAddition(message);
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
      //console.log("Tipo de mensagem desconhecido:", message.type);
      break;
  }
}

//--------------------------------------------------------------------------------------

const editMode = false;

let totalMana = 1;

//--------------------------------------------------------------

function theGameStarts() {
  // Manipule o DOM para mostrar a tela principal e remover/ocultar todo o resto não mais relevante
  const deckPreviewContainer = document.querySelector(
    "#deck-preview-container"
  );
  if (deckPreviewContainer) {
    deckPreviewContainer.remove();
  }
  mainGameSection.style.display = "flex";
  document.body.style.backgroundImage = "none";
  deckCodeNSelectSection.style.display = "none";
  if (editMode) {
    drawCard(1);
    return;
  }

  document.getElementById(
    "yourScore"
  ).textContent = `Você (${player.username}): `;

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

function showDeckPreview() {
  // Esconde a tela de código de deck
  deckCodeNSelectSection.style.display = "none";

  // Cria um container para o preview do deck
  const deckPreviewContainer = document.createElement("div");
  deckPreviewContainer.id = "deck-preview-container";
  deckPreviewContainer.classList.add(
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "w-full",
    "max-w-lg",
    "p-4",
    "bg-white",
    "shadow-lg",
    "rounded-lg",
    "border",
    "border-gray-200"
  );

  // Adiciona a mensagem de que o deck foi selecionado
  const infoMessage = document.createElement("p");
  infoMessage.textContent =
    "Deck selecionado. Aguarde o oponente confirmar a seleção do deck dele.";
  infoMessage.classList.add(
    "text-center",
    "text-gray-700",
    "font-semibold",
    "text-lg"
  );
  deckPreviewContainer.appendChild(infoMessage);

  // Cria um container para as cartas
  const cardsContainer = document.createElement("div");
  cardsContainer.id = "card-container";
  cardsContainer.classList.add(
    "flex",
    "flex-wrap",
    "items-center",
    "justify-center",
    "w-full",
    "p-1"
  );

  deckPreviewContainer.appendChild(cardsContainer);

  // Agora vamos adicionar as cartas do deck como elementos criados pela função createCardElement
  currentDeck.forEach((cardInstanceData) => {
    const cardElement = createCardElement(cardInstanceData); // Cria a carta
    cardElement.classList.remove("carta");
    cardElement.classList.add(
      "mini-card",
      "overflow-visible",
      "flex",
      "flex-wrap",
      "relative",
      "justify-center",
      "items-center"
    );

    // Adiciona o card ao container
    cardsContainer.appendChild(cardElement);
  });

  // Se já existir uma área de visualização do deck, podemos substituí-la
  const existingPreview = document.querySelector("#deck-preview-container");
  if (existingPreview) {
    existingPreview.replaceWith(deckPreviewContainer);
  } else {
    document.body.appendChild(deckPreviewContainer); // Se não, adicionamos a nova área à página
  }
}

function drawCard(amount = 1) {
  //console.log("Current Deck antes de comprar cartas: ");
  //console.table(currentDeck);

  if (currentDeck.length > 0) {
    // Corrigido para verificar o tamanho do array
    for (let i = 0; i < amount; i++) {
      //console.log("Current Deck antes:", JSON.stringify(currentDeck));
      const cardDrawn = currentDeck.shift(); // Remove a primeira carta do deck
      //console.log("Current Deck depois de shift:", JSON.stringify(currentDeck));

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
      //console.log("Quantidade de cartas no deck atualmente:", deckCardCount);

      //console.log("Current Deck depois de comprar uma carta: ");
      //console.table(currentDeck);

      // Exibe a carta comprada na mão do jogador
      if (displayCardInHand({ cardData: cardDrawn, cardElement: undefined })) {
        // Envia a carta comprada de volta ao servidor
        const message = {
          type: "cardDrawn",
          cardData: cardDrawn,
          state: "hand",
        };
        sendMessageToServer(JSON.stringify(message));
      } else {
        // Se não conseguimos exibir a carta na mão, colocamos cardDrawn de volta em currentDeck
        currentDeck.unshift(cardDrawn); // Adiciona a carta de volta ao início do deck
        console.warn("Carta devolvida ao deck:", cardDrawn);
      }
    }
  } else {
    console.warn("Não há mais cartas no deck para comprar.");
  }
}

function drawSpecificCards(cardsToDraw) {
  // Toca o som de compra de carta
  const playCardDrawSound = () => {
    const cardDrawSound = soundEffects.find((s) => s.name === "cardDrawSound");
    if (cardDrawSound) {
      const audio = new Audio(cardDrawSound.soundFile);
      audio.play();
    }
  };

  cardsToDraw.forEach((cardDrawn) => {
    // Exibe a carta comprada na mão do jogador
    if (displayCardInHand({ cardData: cardDrawn, cardElement: undefined })) {
      // Encontra a carta no currentDeck
      const cardIndexInDeck = currentDeck.findIndex(
        (c) => c.instanceId === cardDrawn.instanceId
      );

      // Verifica se o índice foi encontrado
      if (cardIndexInDeck !== -1) {
        // Remove a carta do currentDeck no índice encontrado
        currentDeck.splice(cardIndexInDeck, 1);
      } else {
        console.warn(
          `Carta com instanceId ${cardDrawn.instanceId} não encontrada no currentDeck.`
        );
      }

      // Envia a carta comprada de volta ao servidor
      const message = {
        type: "cardDrawn",
        cardData: cardDrawn,
        state: "hand",
      };
      sendMessageToServer(JSON.stringify(message));
    } else {
      console.log(
        "Não foi possível adicionar a carta à mão, ela será mantida no deck."
      );
    }
  });

  // Atualiza o contador de cartas no deck
  deckCardCount = currentDeck.length;

  playCardDrawSound(); // Toca o som da carta
}

//------------------------------------------------------------------------------------

const drawForTheOpponent = (amount = 1) => {
  //console.log("drawForTheOpponent triggered.");
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

//-------------------------------------------------------------------------------------

// Função para adicionar o listener do botão "Jogar"
const playCardListener = (cardContainer) => {
  if (roundEndRequested) {
    alert(
      "Você não pode fazer isto agora, uma vez que já solicitou finalização de rodada."
    );
    return;
  }

  if (!yourTurn) {
    alert(
      "Você não pode fazer isto agora. Espere pelo oponente finalizar seu turno."
    );
    return;
  }

  const playCardButton = cardContainer.querySelector(".playCard-button");

  // Verifica se o botão já existe para evitar duplicação
  if (!playCardButton) {
    //console.log('Botão "Jogar" não existe, criando novo botão.');
    const newPlayCardButton = document.createElement("button");
    newPlayCardButton.className = "playCard-button";
    newPlayCardButton.classList.add(
      "absolute",
      "z-10",
      "flex",
      "justify-center",
      "items-center",
      "top-1/4",
      "bottom-1/4",
      "right-1/4",
      "left-1/4",
      "w-3/5",
      "h-10",
      "p-1",
      "rounded",
      "text-lg", // Tamanho da fonte maior
      "font-semibold", // Texto semibold
      "text-white", // Cor branca
      "bg-green-500"
    );
    newPlayCardButton.innerHTML = "Jogar";
    cardContainer.appendChild(newPlayCardButton);
    /*  console.log(
      'Botão "Jogar" criado e adicionado ao DOM para a carta:',
      cardContainer
    ); */

    // Adiciona o event listener para jogar a carta
    newPlayCardButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Impede a propagação do clique para o documento
      newPlayCardButton.remove(); // Remove o botão após clicar
      playCardRequest(cardContainer); // Função para processar a jogada da carta
      /*  console.log(
        'Botão "Jogar" clicado e removido para a carta:',
        cardContainer
      ); */
    });
  } else {
    //console.log('Botão "Jogar" já existe, não criando outro botão.');
  }
};

//------------------------------------------------------------------------------------

function displayCardInHand({ cardData, cardElement }) {
  // Verifica se cardData ou cardElement estão presentes
  if (!cardData && !cardElement) {
    console.error("Nenhum dado de carta recebido.");
    return false;
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
    alert("A mão já está cheia. A carta não será adicionada.");
    return false;
  } else {
    //console.log("Contagem de cartas antes de adicionar:", handCardCount);
  }

  // Incrementa o contador de cartas na mão
  handCardCount++;

  //console.log("Exibir carta na mão.");
  //console.log("Dados da carta recebidos como argumento: ");
  //console.table(cardData);

  // Define o handleClick específico para cada carta
  const handleClick = () => {
    //console.log("HandleClick ativado para a carta:", cardElement);
    playCardListener(cardElement);
  };

  // Adiciona o listener de clique para exibir o botão "Jogar"
  cardElement.addEventListener("click", handleClick);
  /*   console.log(
    "Listener de clique adicionado para a carta com os dados:",
    JSON.stringify(cardData)
  ); */

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

  return true;
}

//-----------------------------------------------------------------------------------

function createCardElement(cardInstanceData) {
  // Criação do elemento da carta
  console.log("cardInstanceData:");
  console.table(cardInstanceData);
  const cardContainer = document.createElement("div");
  cardContainer.className = "carta";
  cardContainer.dataset.id = cardInstanceData.id;
  cardContainer.dataset.instanceId = cardInstanceData.instanceId;
  cardContainer.dataset.keywords = JSON.stringify(cardInstanceData.keywords);
  cardContainer.dataset.speed =
    cardInstanceData.currentSpeed || cardInstanceData.baseSpeed;
  cardContainer.dataset.baseHealth = cardInstanceData.baseHealth;
  cardContainer.dataset.currentHealth =
    cardInstanceData.currentHealth || cardInstanceData.baseHealth;
  cardContainer.dataset.maxHealth =
    cardInstanceData.maxHealth || cardInstanceData.baseHealth;
  cardContainer.dataset.baseAttack = cardInstanceData.baseAttack;
  cardContainer.dataset.currentAttack =
    cardInstanceData.currentAttack || cardInstanceData.baseAttack;

  const cardData = cards.find((c) => c.id == cardInstanceData.id);

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

  // Adiciona a div de exibição da velcoidade
  const speed = document.createElement("div");
  speed.textContent = `${cardInstanceData.currentSpeed}`;
  speed.style.color = "white";
  speed.classList.add("card-speed-display");
  cardContainer.appendChild(speed);

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
  /* console.log(
    "Enviar ao servidor pedido para jogar carta para a carta: ",
    cardContainer
  ); */

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
  //console.log("Valor da variável data recebida como parâmetro:");
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
      //console.log(`Procurando card com instanceId: ${carta.instanceId}`);
      cardContainer = handElement.querySelector(
        `.carta[data-instance-id="${carta.instanceId}"]`
      );
      //console.log("Hand Element HTML:", handElement.innerHTML);
    }
  }
  //console.log(`Card container encontrado: ${cardContainer ? "Sim" : "Não"}`);
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
        //console.log("Executando playEffect para a carta:", cardData.name);
        playEffect.playEffect(cardData, cardElement, slotNumber);
      } else {
        console.error("playEffect não é uma função.");
      }
    } else {
      /* console.error(
        `Efeito de jogo não encontrado para a carta com id ${cardData.id}.`
      ); */
    }
  } else {
    /*   console.log(
      `A carta ${cardData.name}, de id ${cardData.id} não possui grito de guerra.`
    ); */
    addCardToField(cardElement, slotNumber);
  }
}

function checkAndExecuteConditionalEffects(cardData, cardElement) {
  //console.log(cardElement);
  // Encontra a carta com o efeito condicional pelo ID
  const cardWithEffect = conditionalEffectsCards.find(
    (c) => c.id === parseInt(cardElement.dataset.id)
  );

  // Verifica se a carta tem efeito condicional
  if (!cardWithEffect) {
    console.log(
      `A carta ${cardData.name} de id: ${cardData.id} e instanceId: ${cardElement.dataset.instanceId} não possui um efeito especial condicional.`
    );
    return;
  }

  // Verifica se o efeito existe e executa
  if (typeof cardWithEffect.effect === "function") {
    cardWithEffect.effect(cardElement); // Passa o cardElement se o efeito precisar de referência ao elemento
    console.log(`Efeito condicional da carta ${cardData.name} foi executado.`);
  } else {
    console.warn(
      `A carta ${cardData.name} não possui um efeito condicional válido.`
    );
  }
}

// Função global para lidar com o clique no slot
function handleSlotClick(event, cardData, cardElement) {
  ////console.log("cardData: " + cardData);
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
    /* console.log(
      "Jogada cancelada. Por favor, escolha um slot válido e tente novamente."
    ); */
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
  /* console.log(
    "selectBattlefieldSlot triggered.",
    "cardData: " + JSON.stringify(cardData) + " slotNumber: " + slotNumber
  );
 */
  let cardElement = document.querySelector(
    `.carta[data-instance-id="${cardData.instanceId}"]`
  );

  // Verifica se o cardElement é um nó válido
  if (!(cardElement instanceof Node)) {
    console.warn("Card element não encontrado.");

    // Se slotNumber for válido, invocação direta identificada
    if (!isNaN(Number(slotNumber))) {
      //Invocação direta identificada, criar o elemento da carta a ser invocado
      cardElement = createCardElement(cardData);
    } else {
      console.error("Card element não encontrado e slotNumber é indefinido.");
      return;
    }
  }

  if (slotNumber === null) {
    const availableSlots = Array.from(
      document.querySelectorAll(".slots:not(.opponentSlots)")
    ).filter((slot) => !slot.querySelector(".carta"));

    // Verifica se o cardElement é um nó válido
    if (!(cardElement instanceof Node)) {
      cardElement = createCardElement(cardData);
    }

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

  //console.log("cardElement:", cardElement);
}

// Função principal de adição de carta ao lado aliado do campo de batalha
function addCardToField(cardElement, slotNumber) {
  const playListener = clickListenersMap.get(cardElement);
  if (playListener) {
    cardElement.removeEventListener("click", playListener);
  }

  if (!(cardElement instanceof Node)) {
    console.error(`cardElement (${cardElement}) não é um Node válido.`);
    //console.log(`typeOf cardElement = ${typeof cardElement}`);
    //console.table(cardElement);
    //console.log(JSON.stringify(cardElement));
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

  const play = {
    type: "cardPlayed",
    card: cardElement,
    player: "player1",
  };

  updatePlaysHistory(play);

  addAttackListeners(cardElement);
  addHoverListenerToCard(cardElement);
  const cardCostDisplay = cardElement.querySelector(".card-cost-display");
  const cardCost = Number(cardCostDisplay.textContent);
  spendMana(cardCost);

  const cardInstanceId = Number(cardElement.dataset.instanceId);

  const cardId = Number(cardElement.dataset.id);

  const cardData = cards.find((c) => c.id == cardId);

  if (!cardData) {
    console.error(`cardData não encontrado para a id ${cardId}`);
    return;
  }

  checkAndExecuteConditionalEffects(cardData, cardElement);

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

function summonCardRequest(cardContainer, cardSummonedSlot) {
  //console.log("summonCardRequest triggered.");

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

  const cardId = cardContainer.dataset.id;
  const cardInstanceId = cardContainer.dataset.instanceId;

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
      data: { cardId, cardInstanceId, slotNumber },
    };

    /*  console.log(
      "Enviando mensagem para o servidor com requisição de invocação direta de carta."
    ); */
    //console.table("message: ", message);
    sendMessageToServer(JSON.stringify(message));
  } else {
    console.error("slotNumber é null ou undefined.");
  }
}

// --------------------------------------------------------------

function updatePlaysHistory(play) {
  if (currentRoundIndex !== 1) {
    // Verifica se a rodada já existe no histórico
    if (!playsHistory[currentRoundIndex]) {
      // Adiciona uma nova rodada no índice específico do currentRoundIndex
      playsHistory[currentRoundIndex] = {
        round: currentRoundIndex,
        actions: [],
      };
    }
    playsHistory[currentRoundIndex].actions.push(play);
  } else {
    // Garante que playsHistory[0] exista antes de tentar acessar
    if (!playsHistory[0]) {
      playsHistory[0] = {
        round: 1,
        actions: [],
      };
    }
    playsHistory[0].actions.push(play);
  }
}

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

// Função para criar e exibir o overlay de opções
function createAndShowOptionsOverlay(options) {
  // Cria o overlay
  const optionsOverlay = document.createElement("div");
  optionsOverlay.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "bg-opacity-50",
    "flex",
    "items-center",
    "justify-center",
    "z-10"
  );
  optionsOverlay.style.width = "100vw";
  optionsOverlay.style.height = "100vh";
  optionsOverlay.style.backgroundColor = "rgba(0, 0, 50, 0.85)";

  // Cria o container das opções
  const optionsDiv = document.createElement("div");
  optionsDiv.classList.add(
    "bg-white",
    "rounded-lg",
    "shadow-lg",
    "p-4",
    "space-y-4",
    "max-w-sm",
    "text-center"
  );

  options.forEach((option) => {
    // Cria o elemento para cada opção
    const optionDiv = document.createElement("div");
    optionDiv.innerHTML = option;
    optionDiv.classList.add(
      "bg-blue-500",
      "hover:bg-blue-700",
      "text-white",
      "font-bold",
      "py-2",
      "px-4",
      "rounded",
      "cursor-pointer"
    );

    optionsDiv.appendChild(optionDiv);
  });

  // Adiciona o container de opções ao overlay
  optionsOverlay.appendChild(optionsDiv);

  // Adiciona o overlay ao body
  document.body.appendChild(optionsOverlay);

  return optionsOverlay; // Retorna o overlay para que possamos adicionar listeners
}

// ------------------------------------------------------------

// Adicionar listener de ataque às cartas no campo de batalha
function addAttackListeners(cardContainer) {
  const attackListener = (event) => {
    event.stopPropagation();
    //console.log("Listener de clique adicionado para a carta:", cardContainer);

    if (!yourTurn) {
      alert(
        "Você não pode fazer isto agora. Espere pelo oponente finalizar seu turno."
      );
      return;
    }

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
      ////console.log('Clique fora de uma carta, removendo botões existentes.');
      let attackButtons = document.querySelectorAll(".attack-button");
      attackButtons.forEach((attackButton) => {
        //console.log('Removendo botão "Atacar":', attackButton);
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
  if (roundEndRequested) {
    alert(
      "Você não pode fazer isto agora, uma vez que já solicitou finalização de rodada."
    );
    return;
  }

  if (!yourTurn) {
    alert(
      "Você não pode fazer isto agora. Espere pelo oponente finalizar seu turno."
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

  //console.log("cardsInField =");
  //console.table(cardsInField);
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

  /* console.log(
    "InstanceId's da cartaAlvo e da cartaAtacante - respectivamente - recebido como argumento em attackCardRequest"
  ); */
  //console.log(cartaAlvoInstanceId); // Verifique o valor
  //console.log(cartaAtacanteInstanceId); // Verifique o valor

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

function attackTheAvatarRequest(cartaAtacante, targetAvatar) {
  //console.log("attackTheAvatarRequest triggered.");
  //console.table(cartaAtacante);

  const cartaAtacanteInstanceId = cartaAtacante.dataset.instanceId;

  let message = {
    type: "attackTheAvatar",
    data: { cartaAtacanteInstanceId, targetAvatar },
  };

  //console.log("Valor da variável message em attackTheAvatarRequest:");
  //console.table(message);

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
function applyDamageToAvatar(
  { targetAvatar, avatarData, directDamage },
  carta = null
) {
  const avatarHealth = Number(avatarData.health);
  console.log(`carta = ${carta}`);
  console.log(`directDamage or not?: ${directDamage}`);

  /* console.log(
    `applyDamageToAvatar triggered com target: ${target}, e avatarHealth = ${avatarHealth}`
  );
 */
  let avatarElement;

  // Determina o avatar a ser atualizado
  if (targetAvatar === "ally") {
    avatarElement = alliedAvatar;
  } else if (targetAvatar === "enemy") {
    avatarElement = opponentAvatar;
  } else {
    console.error(`targetAvatar inválido: ${targetAvatar}`);
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
  if (targetAvatar === "ally") {
    healthZone = zone;
  } else {
    opponentHealthZone = zone;
  }
  avatarElement.style.color = color;

  if (!directDamage) {
    console.log("directDamage é falso, animando o ataque ao avatar.");
    const cartaAtacante = document.querySelector(
      `.carta[data-instance-id="${carta.instanceId}"]`
    );
    animateAttack(cartaAtacante, avatarElement);
  }

  setTimeout(() => {
    if (avatarHealth <= 0) {
      let message;
      if (avatarElement === opponentAvatar) {
        message = {
          type: "gameOver",
          data: { result: "winner" },
        };
      }
      sendMessageToServer(JSON.stringify(message));
    }
  }, 1800);
}

// Função para aplicar a cura ao avatar
function applyHealingToAvatar(newHealth, avatarType) {
  //console.log("applyHealingToAvatar chamada.");
  //console.log(`newHealth = ${newHealth}, avatarType = ${avatarType}`);

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
  /*   console.log(
    `dealDirectDamageRequest chamada com damage = ${damage} e targetElement = ${targetElement}`
  ); */

  let message = {};

  //console.log(targetElement.classList);
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
  //console.log("keywordAdditionRequest triggered.");
  //console.table(`keyword = ${keyword}, cardElement = ${cardElement}`);

  const cardInstanceId = cardElement.dataset.instanceId;

  const message = {
    type: "keywordAdditionRequest",
    data: { keyword: keyword, instanceId: cardInstanceId },
  };

  sendMessageToServer(JSON.stringify(message));
  return true;
}

// ----------------------------------------------------------------

function resetCardsNegativeStatus() {
  //console.log("resetCardsNegativeStatus triggered.");
  const negativeStatus = ["paralisia elétrica", "congelamento"];

  const alliedCardsInField = getCardsInField("allied");

  alliedCardsInField.forEach((cardElement) => {
    // Pega as keywords que estão no dataset
    const keywords = JSON.parse(cardElement.dataset.keywords);

    // Verifica se alguma das keywords da carta está em negativeStatus
    const hasNegativeStatus = negativeStatus.some((status) =>
      keywords.includes(status)
    );

    if (hasNegativeStatus) {
      const cardInstanceId = Number(cardElement.dataset.instanceId);

      // Remover todas as negativas
      const updatedKeywords = keywords.filter(
        (keyword) => !negativeStatus.includes(keyword)
      );
      cardElement.dataset.keywords = JSON.stringify(updatedKeywords); // Atualiza o keywords no dataset

      // Mensagem para o servidor
      const message = {
        type: "negativeKeywordRemoved",
        data: { cardInstanceId, removedKeywords: negativeStatus },
      };
      sendMessageToServer(JSON.stringify(message));
    } else {
      console.log("Carta não tem efeito negativo.");
    }
  });
}

// -------------------------------------------------------------------------------------

function enableAllAtackkers() {
  const alliedCardsInField = getCardsInField("allied");

  alliedCardsInField.forEach((card) => {
    const instanceId = card.dataset.instanceId;
    if (instanceId) {
      const message = {
        type: "enableAttackRequest",
        data: { instanceId },
      };
      sendMessageToServer(JSON.stringify(message));
    } else {
      console.error(`instanceId não encontrado: ${instanceId}`);
    }
  });
}

// -------------------------------------------------------------------------------------

async function lookAndPickTopDeck(amountToLook, amountToPick) {
  // Recupera as cartas do topo do deck
  const topCards = currentDeck.slice(0, amountToLook);
  const chosenCards = [];
  const unchosenCards = [];

  // Cria o modal e seu conteúdo
  const modal = document.createElement("div");
  modal.classList.add(
    "fixed",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
    "bg-black",
    "bg-opacity-50",
    "z-50"
  );

  const modalContent = document.createElement("div");
  modalContent.classList.add(
    "bg-white",
    "p-6",
    "rounded",
    "shadow-lg",
    "w-11/12",
    "max-w-4xl",
    "text-center"
  );

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Escolha suas cartas:";
  modalTitle.classList.add("text-lg", "font-bold", "mb-4");
  modalContent.appendChild(modalTitle);

  const cardContainer = document.createElement("div");
  cardContainer.classList.add(
    "grid",
    "grid-cols-2",
    "sm:grid-cols-3",
    "gap-4",
    "mb-4"
  );

  // Adiciona as cartas ao modal
  topCards.forEach((card) => {
    const cardButton = document.createElement("button");
    cardButton.classList.add(
      "flex",
      "justify-center",
      "items-center",
      "relative",
      "border",
      "border-gray-300",
      "rounded",
      "p-2",
      "hover:border-blue-500",
      "hover:shadow-md",
      "transition"
    );

    const cardImageContainer = createCardElement(card);
    cardImageContainer.alt = `Carta ${card.name}`;
    cardImageContainer.classList.add("modal", "object-cover", "rounded");

    cardButton.appendChild(cardImageContainer);

    cardButton.addEventListener("click", () => {
      chosenCards.push(card);
      cardButton.remove(); // Remove a carta do modal após escolha

      // Finaliza a escolha quando atingir o limite
      if (chosenCards.length === amountToPick) {
        finalizeSelection();
      }
    });

    cardContainer.appendChild(cardButton);
  });

  modalContent.appendChild(cardContainer);

  // Botão de cancelar
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add(
    "bg-red-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded",
    "hover:bg-red-600",
    "transition"
  );

  cancelButton.addEventListener("click", () => {
    closeModal();
  });

  modalContent.appendChild(cancelButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Finaliza a escolha
  function finalizeSelection() {
    topCards.forEach((card) => {
      if (!chosenCards.includes(card)) {
        unchosenCards.push(card); // Adiciona as cartas não escolhidas
      }
    });
    closeModal();
  }

  // Fecha o modal
  function closeModal() {
    modal.remove();
  }

  // Retorna uma promessa para aguardar a interação do jogador
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (
        chosenCards.length === amountToPick ||
        !document.body.contains(modal)
      ) {
        observer.disconnect();
        console.log("chosenCards: ", chosenCards);
        resolve(chosenCards);
      }
    });

    observer.observe(document.body, { childList: true });
  });
}

// -------------------------------------------------------------------------------------
// TURNO RELATED

let roundEndRequested = false;
let currentRoundIndex = 1;
let isLastRound;

/* EXEMPLO DE UM OBJETO DE AÇÃO DO TURNO {
  type: 'cardPlayed',  // Tipo da ação (ex: jogar carta)
  card: carta1,      // Carta jogada
  player: 'player1'  // Jogador que realizou a ação
}, */

const playsHistory = [
  {
    round: 1, // Número da rodada
    actions: [],
  },
  // outros rodadas...
  {},
];

const endRoundEffectsCards = [
  {
    id: 4,
    name: "Fulgurvoltz",
    inFieldOnly: false,
    effect: (card, origin) => {
      let previousCost;
      let newCost;
      let instanceId;

      console.log(`origin = ${origin}`);

      if (origin === "DOM") {
        const cardElement = card;
        if (cardElement.dataset.instanceId) {
          instanceId = cardElement.dataset.instanceId;
          console.log(`instanceId = ${instanceId}`);
          previousCost = Number(
            cardElement.querySelector(".card-cost-display").textContent
          );
          console.log(`Custo do Fulgurvoltz antes: ${previousCost}`);
          console.log("unspentManaThisRound: ", unspentManaThisRound);
          newCost = Math.max(4, previousCost - unspentManaThisRound); // Garante que o custo não fique menor que 4
          console.log(`Custo do Fulgurvoltz depois: ${newCost}`);

          const cardCostDisplay =
            cardElement.querySelector(".card-cost-display");
          if (cardCostDisplay) {
            cardCostDisplay.textContent = newCost;
            unspentManaThisRound > 0
              ? (cardCostDisplay.style.color = "lightgreen")
              : "";
            console.log(
              `Novo custo exibido no DOM: ${cardCostDisplay.textContent}`
            );
          } else {
            console.error(
              "Elemento do display de custo da carta não encontrado no DOM ou não é filho de cardElement."
            );
          }
        } else {
          console.error("Elemento da carta não encontrado no DOM.");
        }
      } else if (origin === "deck") {
        const cardObject = currentDeck.find(
          (c) => c.instanceId == card.instanceId
        ); // Obtém a carta do deck
        if (cardObject) {
          instanceId = cardObject.instanceId;
          console.log(`instanceId = ${instanceId}`);
          previousCost = cardObject.currentCost;
          console.log(`Custo do Fulgurvoltz antes: ${previousCost}`);
          console.log("unspentManaThisRound: ", unspentManaThisRound);
          newCost = Math.max(4, previousCost - unspentManaThisRound); // Garante que o custo não fique menor que 2
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

      console.log("Voltexz cost reduction effect triggered.");
      console.log(`origin = ${origin}`);

      if (origin === "DOM") {
        const cardElement = card;
        if (cardElement.dataset.instanceId) {
          instanceId = cardElement.dataset.instanceId;
          console.log(`instanceId: ${instanceId}`);
          previousCost = Number(
            cardElement.querySelector(".card-cost-display").textContent
          );
          console.log(`Custo da Voltexz antes: ${previousCost}`);
          console.log("unspentManaThisRound: ", unspentManaThisRound);
          newCost = Math.max(2, previousCost - 2 * unspentManaThisRound); // Garante que o custo não fique menor que 2
          console.log(`Custo da Voltexz depois: ${newCost}`);

          const cardCostDisplay =
            cardElement.querySelector(".card-cost-display");
          if (cardCostDisplay) {
            cardCostDisplay.textContent = newCost;
            unspentManaThisRound > 0
              ? (cardCostDisplay.style.color = "lightgreen")
              : "";
            console.log(
              `Novo custo exibido no DOM: ${cardCostDisplay.textContent}`
            );
          } else {
            console.error(
              "Elemento do display de custo da carta não encontrado no DOM ou não é filho de cardElement."
            );
          }
        } else {
          console.error("Elemento da carta não encontrado no DOM.");
        }
      } else if (origin === "deck") {
        const cardObject = currentDeck.find(
          (c) => c.instanceId == card.instanceId
        ); // Obtém a carta do deck
        if (cardObject) {
          instanceId = cardObject.instanceId;
          console.log(`instanceId: ${instanceId}`);
          previousCost = cardObject.currentCost;
          console.log(`Custo da Voltexz antes: ${previousCost}`);
          console.log("unspentManaThisRound: ", unspentManaThisRound);
          newCost = Math.max(2, previousCost - 2 * unspentManaThisRound); // Garante que o custo não fique menor que 2
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

  {
    id: 80,
    name: "Bruno",
    inFieldOnly: true,
    effect: (cardElement, origin) => {
      if (origin !== "DOM") {
        console.debug(
          "Este efeito só se ativa se a carta estiver no campo de batalha."
        );
        return;
      }

      if (cardElement.closest("#hand")) {
        console.debug(
          "Este efeito só se ativa se a carta estiver no campo de batalha."
        );
        return;
      }

      const enemyCardsInField = getCardsInField("enemy");
      enemyCardsInField.forEach((enemyCard) => {
        const keywords = JSON.parse(enemyCard.dataset.keywords);
        if (keywords.includes("congelamento")) {
          console.log(
            `Ativando efeito de fim de rodada da carta Bruno de instance-id: ${cardElement.dataset.instanceId}.`
          );
          dealDirectDamageRequest(3, enemyCard);

          // Adiciona a classe para iniciar a animação
          cardElement.classList.add("glacial-aura-effect-trigger");

          // Remove a classe ao final da animação
          cardElement.addEventListener(
            "animationend",
            () => {
              cardElement.classList.remove("glacial-aura-effect-trigger");
            },
            { once: true }
          );
        }
      });
    },
  },

  {
    id: 88,
    name: "Rei Gelado",
    inFieldOnly: true,
    effect: (cardElement, origin) => {
      if (origin !== "DOM") {
        console.debug(
          "Este efeito só se ativa se a carta estiver no campo de batalha."
        );
        return;
      }

      if (cardElement.closest("#hand")) {
        console.debug(
          "Este efeito só se ativa se a carta estiver no campo de batalha."
        );
        return;
      }

      const enemyCardsInField = getCardsInField("enemy");

      // Calcula o total de cartas congeladas usando reduce
      const enemyCardsFrozen = enemyCardsInField.reduce((count, enemyCard) => {
        const keywords = JSON.parse(enemyCard.dataset.keywords);
        return keywords.includes("congelamento") ? count + 1 : count;
      }, 0);

      // Define o dano com base no número de cartas congeladas, limitado a 6
      const damage = Math.min(enemyCardsFrozen * 2, 6);

      // Aplica o dano direto a cada carta inimiga
      enemyCardsInField.forEach((enemyCard) => {
        dealDirectDamageRequest(damage, enemyCard);
      });

      console.log(
        `Ativando efeito de fim de rodada da carta Rei Gelado de instance-id: ${cardElement.dataset.instanceId}.`
      );

      // Aplica o dano direto ao avatar do oponente
      dealDirectDamageRequest(damage, opponentAvatar);
    },
  },

  // outras cartas de efeito de fim de rodada
];

const startRoundEffectsCards = [
  {
    id: 68,
    name: "Diabrete Elétrico",
    inFieldOnly: true,
    effect: (card) => {
      const alliedCards = getCardsInField("allied"); // Obtém as cartas aliadas no campo
      const enemyCards = getCardsInField("enemy"); // Obtém as cartas inimigas no campo

      if (enemyCards.length === 0) {
        console.debug(
          "Oponente não controla nenhuma carta no campo, adicionando a mana diretamente."
        );
        addMana(1, true); // Adiciona mana
        return; // Encerra a função de forma prematura
      }

      // Obtém a maior currentSpeed das cartas aliadas
      const maxAlliedSpeed = alliedCards.reduce((maxSpeed, currentCard) => {
        const speed = parseInt(currentCard.dataset.currentSpeed, 10);
        return speed > maxSpeed ? speed : maxSpeed;
      }, 0);

      // Obtém a maior currentSpeed das cartas inimigas
      const maxEnemySpeed = enemyCards.reduce((maxSpeed, currentCard) => {
        const speed = parseInt(currentCard.dataset.currentSpeed, 10);
        return speed > maxSpeed ? speed : maxSpeed;
      }, 0);

      console.log(`Velocidade máxima aliada: ${maxAlliedSpeed}`);
      console.log(`Velocidade máxima inimiga: ${maxEnemySpeed}`);

      // Verifica se a maior velocidade aliada é maior que a inimiga
      if (maxAlliedSpeed > maxEnemySpeed) {
        console.log("Condição satisfeita: Aliados têm maior velocidade.");
        addMana(1, true); // Adiciona mana
      } else {
        console.log(
          "Condição não satisfeita: Velocidade inimiga é igual ou maior."
        );
      }
    },
  },
  {
    id: 10,
    name: "Rusco",
    inFieldOnly: false,
    effect: (card, origin) => {
      const alliedCards = getCardsInField("allied"); // Obtém as cartas aliadas no campo

      // Verifica se existe alguma carta com custo, ataque ou vida igual a 2
      const hasCostAttackOrHealthEqual2 = alliedCards.some((c) => {
        const cost = parseInt(
          c.querySelector(".card-cost-display").textContent,
          10
        );
        const attack = parseInt(c.dataset.currentAttack, 10);
        const health = parseInt(c.dataset.currentHealth, 10);

        return cost === 2 || attack === 2 || health === 2; // Verifica a condição
      });

      if (hasCostAttackOrHealthEqual2) {
        if (origin === "DOM" || card instanceof HTMLElement) {
          console.log("Rusco está no campo ou na mão, cancelar a função.");
          return;
        }
        const cardInstanceData = currentDeck.find(
          (c) => c.instanceId == card.instanceId
        );
        if (!cardInstanceData) {
          console.warn(
            "Dados da carta no deck não encontrados. Não será possível criar o cardElement, cancelando restante da função."
          );
          return;
        }
        console.log("cardInstanceData: ", cardInstanceData);
        const cardContainer = createCardElement(cardInstanceData);
        const cardSummonedSlot = findEmptySlot("highest");
        summonCardRequest(cardContainer, cardSummonedSlot);
        // Buscando o índice da carta 'Rusco' no currentDeck com base no instanceId
        const cardIndex = currentDeck.findIndex(
          (c) => c.instanceId == card.instanceId
        );

        // Se encontrar o Rusco no currentDeck, removê-lo
        if (cardIndex !== -1) {
          currentDeck.splice(cardIndex, 1); // Remove a carta do deck
          console.log(
            `Rusco com instanceId ${card.instanceId} removido do deck.`
          );
        } else {
          console.error("Rusco não encontrado no deck.");
        }
      } else {
        console.log(
          "Nenhuma carta com custo, ataque ou vida igual a 2 foi encontrada."
        );
      }
    },
  },
];

function endTheRound() {
  console.log("endTheRound chamada.");
  if (currentRoundIndex >= 5) {
    calculateRoundScore();
  }

  unspentManaThisRound += mana;
  unspentManaTotal += mana;

  console.log("unspentManaThisRound: ", unspentManaThisRound);
  console.log("unspentManaTotal: ", unspentManaTotal);

  checkForEndRoundEffects();

  unspentManaThisRound = 0;
  additionalManaThisRound = 0;
  mana = 0;

  if (!isLastRound) {
    currentRoundIndex++;
    startTheRound();
  }

  /* //console.log(
    `Mana não gasta da rodada atual antes de chamar os efeitos de fim de rodada: ${unspentManaThisRound}`
  );
  //console.log(
    `Mana total não gasta antes de chamar os efeitos de fim de rodada: ${unspentManaTotal}`
  ); */
  endRoundButton.disabled = false;
}

function checkForEndRoundEffects() {
  // Seleciona todas as cartas com a classe .carta que não sejam filhas de um .opponentSlots
  const cardsInDOM = document.querySelectorAll(
    ".carta:not(.opponentSlots .carta)"
  );

  // 1. Processar cartas que estão no DOM
  cardsInDOM.forEach((cardElement) => {
    const cardId = Number(cardElement.dataset.id);

    // Recupera o efeito de fim de rodada correspondente à carta
    const endRoundEffect = endRoundEffectsCards.find((c) => c.id === cardId);

    // Verifica se o efeito de fim de rodada foi encontrado e se é uma função
    if (endRoundEffect && typeof endRoundEffect.effect === "function") {
      // Aplica o efeito passando o elemento do DOM e um indicador de origem
      /*       console.log(
        `Aplicando efeito de fim de rodada da carta ${cardId} que está no DOM.`
      ); */
      endRoundEffect.effect(cardElement, "DOM"); // Indica que a origem é o DOM
    } else {
      /*       console.warn(
        `Efeito de fim de rodada não encontrado ou não é uma função para a carta ${cardId}.`
      ); */
    }
  });

  // 2. Processar cartas que estão no deck, apenas se inFieldOnly for false
  currentDeck.forEach((card) => {
    const endRoundEffect = endRoundEffectsCards.find((c) => c.id === card.id);

    if (endRoundEffect && typeof endRoundEffect.effect === "function") {
      if (!endRoundEffect.inFieldOnly) {
        endRoundEffect.effect(card, "deck"); // Indica que a origem é o deck
      } else {
        console.warn(
          `A carta ${card.id} não está em campo. Efeito de fim de rodada não aplicado.`
        );
      }
    } else {
      /*       console.warn(
        `Efeito de fim de rodada não encontrado ou não é uma função para a carta ${card.id}.`
      ); */
    }
  });
}

function checkForStartRoundEffects() {
  // Seleciona todas as cartas com a classe .carta que não sejam filhas de um .opponentSlots
  const cardsInDOM = document.querySelectorAll(
    ".carta:not(.opponentSlots .carta)"
  );

  // 1. Processar cartas que estão no DOM
  cardsInDOM.forEach((cardElement) => {
    const cardId = Number(cardElement.dataset.id);

    // Recupera o efeito de início de rodada correspondente à carta
    const startRoundEffect = startRoundEffectsCards.find(
      (c) => c.id === cardId
    );

    // Verifica se o efeito de início de rodada foi encontrado e se é uma função
    if (startRoundEffect && typeof startRoundEffect.effect === "function") {
      // Aplica o efeito passando o elemento do DOM e um indicador de origem
      console.log(
        `Aplicando efeito de início de rodada da carta ${cardId} que está no DOM.`
      );
      startRoundEffect.effect(cardElement, "DOM"); // Indica que a origem é o DOM
    } else {
      /*       console.warn(
        `Efeito de início de rodada não encontrado ou não é uma função para a carta ${cardId}.`
      ); */
    }
  });

  // 2. Processar cartas que estão no deck, apenas se inFieldOnly for false
  currentDeck.forEach((card) => {
    const startRoundEffect = startRoundEffectsCards.find(
      (c) => c.id === card.id
    );

    if (startRoundEffect && typeof startRoundEffect.effect === "function") {
      if (!startRoundEffect.inFieldOnly) {
        startRoundEffect.effect(card, "deck"); // Indica que a origem é o deck
      } else {
        console.warn(
          `A carta ${card.id} não está em campo. Efeito de início de rodada não aplicado.`
        );
      }
    } else {
      /*       console.warn(
        `Efeito de início de rodada não encontrado ou não é uma função para a carta ${card.id}.`
      ); */
    }
  });
}

function startTheRound() {
  console.log("New round has started.");

  showBigRoundDisplay();

  //console.log(`currentRoundIndex agora (startTheRound): ${currentRoundIndex}`);

  resetCardsNegativeStatus();

  applyNextRoundEffects();

  checkForStartRoundEffects();

  cardsFrozenThisRound = 0;

  enableAllAtackkers();

  const currentRoundDisplay = document.getElementById(
    "current__round__display"
  );
  currentRoundDisplay.textContent = `Rodada ${currentRoundIndex}`;

  totalMana++;

  addMana(totalMana, false);
}

function showBigRoundDisplay() {
  //Display da rodada grande
  let bigRoundDisplay = document.createElement("div");

  bigRoundDisplay.id = "big__round__display";

  bigRoundDisplay.textContent = `Rodada ${currentRoundIndex}`;

  bigRoundDisplay.classList.add("active");

  document.body.appendChild(bigRoundDisplay);

  //remover ele
  setTimeout(() => {
    bigRoundDisplay.remove();
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

// Função para encontrar o slot vazio de número mais alto
function findEmptySlot(type = "highest") {
  if (type === "highest") {
    const slots = Array.from(
      document.querySelectorAll(".slots:not(.opponentSlots)")
    ); // Seleciona todos os slots válidos
    let highestSlot = null;

    slots.forEach((slot) => {
      // Verifica se o slot não tem filhos com a classe .carta
      if (!slot.querySelector(".carta")) {
        const slotNumber = parseInt(slot.textContent.trim(), 10); // Pega o número do slot
        if (
          highestSlot === null ||
          slotNumber > parseInt(highestSlot.textContent.trim(), 10)
        ) {
          highestSlot = slot; // Atualiza para o slot com o número mais alto
        }
      }
    });

    return highestSlot;
  }
}

// Função para calcular a pontuação de um rodada
function calculateRoundScore() {
  //console.log("calculateRoundScore chamada.");

  const alliedAttackTotal = getTotalAttackPoints(getCardsInField("allied"));
  const opponentAttackTotal = getTotalAttackPoints(getCardsInField("enemy"));

  //console.log("Pontos conquistados com o ataque das cartas em campo:");
  //console.log(`You: ${alliedAttackTotal} | Opponent: ${opponentAttackTotal}`);

  const alliedAvatarHPPoints = getAvatarHealthPoints(healthZone);
  const opponentAvatarHPPoints = getAvatarHealthPoints(opponentHealthZone);

  //console.log("Pontos conquistados com a vida do avatar:");
  /*  console.log(
    `You: ${alliedAvatarHPPoints} | Opponent: ${opponentAvatarHPPoints}`
  ); */

  const yourTurnScore = alliedAttackTotal + alliedAvatarHPPoints;
  const opponentRoundScore = opponentAttackTotal + opponentAvatarHPPoints;

  //console.log("Pontos de cada jogador neste rodada:");
  //console.log(`Você: ${yourTurnScore} | Oponente: ${opponentRoundScore}`);

  determineRoundWinner(yourTurnScore, opponentRoundScore);
}

// Função para determinar o vencedor da rodada
function determineRoundWinner(yourScore, opponentScore) {
  if (yourScore > opponentScore) {
    updateMatchScore("me");
  } else if (opponentScore > yourScore) {
    updateMatchScore("opponent");
  } else {
    alert("Este rodada resultou em um empate.");
  }
}

function updateMatchScore(winnerOfTheRound) {
  /* console.log(
    "Atualizar pontuação da partida chamada. Vencedor da rodada:",
    winnerOfTheRound
  ); */
  if (winnerOfTheRound === "me") {
    //!isAmplifierActive ?
    playerMatchPoints += 2;
    yourScoreboard.textContent = playerMatchPoints;

    alert("Muito bem. Você VENCEU este rodada!");
  } else if (winnerOfTheRound === "opponent") {
    opponentMatchPoints += 2;
    opponentScoreboard.textContent = opponentMatchPoints;

    alert("Cuidado. Você PERDEU este rodada!");
  } else {
    console.error(
      "Vencedor da rodada não especificado ou não é uma string válida."
    );
    return;
  }

  alert(
    `Resultado da rodada: Você:${playerMatchPoints} x Oponente: ${opponentMatchPoints}`
  );

  let message = {
    type: "myUpdatedScore",
    username: player.username,
    data: { playerMatchPoints },
  };

  /* console.log(
    `Enviando ao servidor a pontuação ${playerMatchPoints} de ${player.username}`
  ); */

  if (playerMatchPoints >= 6 || opponentMatchPoints >= 6) {
    isLastRound = true;
  }

  sendMessageToServer(JSON.stringify(message));
}

// -------------------------------------------------------------------------------------

function gameOver(result) {
  alert("Fim de jogo.");
  if (result === "winner") {
    //console.log("Parabéns! Você venceu a partida!");

    const victorySound = soundEffects.find((s) => s.name === "victorySound");
    victorySound.src = victorySound.soundFile;
    victorySound.play = function () {
      let audio = new Audio(victorySound.src);
      audio.play();
    };

    alert("Parabéns!! Você ganhou a partida.");

    // Usar um pequeno delay antes de aparecer a tela de vitória
    setTimeout(() => {
      victorySound.play();
      victoryScreen();
    }, 1650);
  } else if (result === "loser") {
    /*     console.log(
      "Essa não. Você perdeu a partida. Mais sorte da próxima vez..."
    ); */

    const defeatSound = soundEffects.find((s) => s.name === "defeatSound");
    defeatSound.src = defeatSound.soundFile;
    defeatSound.play = function () {
      let audio = new Audio(defeatSound.src);
      audio.play();
    };

    alert("Ah, não. Você perdeu. Mais sorte na próxima vez...");

    // Usar um pequeno delay antes de aparecer a tela de derrota
    setTimeout(() => {
      defeatSound.play();
      defeatScreen();
    }, 1650);
  }
}

function defeatScreen() {
  // Cria um overlay sem remover o conteúdo da página
  const overlay = document.createElement("div");
  overlay.id = "defeatOverlay";

  // Cria o título "Derrota"
  const defeatHeading = document.createElement("div");
  defeatHeading.id = "defeatHeading";
  defeatHeading.innerHTML = "Derrota";

  // Botão para reiniciar o jogo
  let restartButton = document.createElement("button");
  restartButton.id = "restartButtonDefeat";
  restartButton.innerHTML = "Começar Novo Jogo";

  // Evento para reiniciar o jogo
  restartButton.addEventListener("click", function () {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      location.reload();
    }, 1250); // Tempo para a animação de fade out
  });

  // Adiciona o título e o botão ao overlay
  overlay.appendChild(defeatHeading);
  overlay.appendChild(restartButton);

  // Adiciona o overlay ao body
  document.body.appendChild(overlay);
}

function victoryScreen() {
  // Cria um overlay transparente sem remover o conteúdo da página
  const overlay = document.createElement("div");
  overlay.id = "victoryOverlay";

  // Cria o título "Vitória"
  const victoryHeading = document.createElement("div");
  victoryHeading.id = "victoryHeading";
  victoryHeading.innerHTML = "Vitória";

  // Botão de reiniciar jogo
  let restartButton = document.createElement("button");
  restartButton.id = "restartButton";
  restartButton.innerHTML = "Começar Novo Jogo";

  // Evento para reiniciar o jogo
  restartButton.addEventListener("click", function () {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      location.reload();
    }, 1250); // Tempo para a animação de fade out
  });

  // Adiciona o título e o botão ao overlay
  overlay.appendChild(victoryHeading);
  overlay.appendChild(restartButton);

  // Adiciona o overlay ao body
  document.body.appendChild(overlay);
}

// -------------------------------------------------------------------------------------

// MANA RELATED

let mana = 0;
let manaContainer = document.getElementById("manaContainer");
let manaCounter = manaContainer.querySelector("#manaCounter");
let manaIconsDiv = manaContainer.querySelector("#manaIcons");
let unspentManaTotal = 0;
let unspentManaThisRound = 0;
let additionalManaThisRound = 0;
let additionalManaTotal = 0;

function addMana(amount = 1, additionalMana = true) {
  //console.log("Mana", mana);
  //console.log("Amount", amount);
  // atualiza a variável de mana
  mana += amount;

  if (mana >= 10) {
    console.error(
      "Limite máximo de mana atingido, jogador não pode ganhar mais que isso."
    );
    mana = 10;
  }

  //console.log("Mana depois da adição", mana);

  if (additionalMana) {
    additionalManaTotal += amount;
    additionalManaThisRound += amount;
  }

  manaIconsDiv.innerHTML = "";
  for (let i = 0; i < mana; i++) {
    const manaIcon = document.createElement("img");
    manaIcon.className = "mana-icon";
    manaIcon.src = "assets/other-images/icone-mana.png";
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
  //console.log(`Mana antes: ${mana}`);
  mana -= manaSpent;
  mana = mana <= 0 ? 0 : mana;
  //console.log(`Mana gasta: ${manaSpent}`);
  //console.log(`Mana depois: ${mana}`);

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
  //console.table("carta:", carta);

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

  const play = {
    type: "cardPlayed",
    card: cardContainer,
    player: "player2",
  };

  updatePlaysHistory(play);
}

// -----------------------------------------------------------------------------------------

function removeCardFromTheField(cardData) {
  //console.log("removeCardFromTheField chamada.");
  //console.table("cardData:", cardData);

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
  //console.log("recallCard chamada.");
  //console.table("cardData:", cardData);

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
  //console.log("destroyCardRequest chamada.");
  //console.table("cardElement a ser destruído:", cardElement);

  const cardInstanceId = cardElement.dataset.instanceId;

  let message = {
    type: "destroyCardRequest",
    data: { instanceId: cardInstanceId },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------------------------------

function updateCardKeywords(keyword, cardData, operation) {
  const { instanceId } = cardData;
  const cardElement = document.querySelector(
    `.carta[data-instance-id="${instanceId}"]`
  );

  if (!cardElement) {
    console.error(`Carta com ID ${instanceId} não encontrada.`);
    return;
  }

  const slot = cardElement.closest(".slots");

  if (!slot) {
    console.error(`Slot ${slot} não encontrado.`);
    return;
  }

  // Pega o valor atual de data-keywords, que é uma string no formato de array
  //console.log("Keywords antes da operação:", cardElement.dataset.keywords);
  //console.log(typeof cardElement.dataset.keywords);
  let currentKeywords = JSON.parse(cardElement.dataset.keywords);
  //console.log("currentKeywords: ", currentKeywords);
  //console.log("É um array?", Array.isArray(currentKeywords)); // Verifica se currentKeywords é um array

  // Mapeamento de keywords para imagens de fundo ou ações futuras
  const keywordActions = {
    "paralisia elétrica": () => {
      // Cria o overlay
      const overlay = document.createElement("div");
      overlay.className = "keyword__overlay";
      overlay.classList.add(
        "absolute", // Posiciona o overlay no topo da carta
        "inset-0", // Faz com que o overlay cubra 100% da largura e altura
        "bg-cover", // Faz a imagem de fundo cobrir toda a área do overlay
        "bg-center", // Centraliza a imagem de fundo
        "opacity-50", // Define a opacidade em 50%
        "pointer-events-none", // Evita que o overlay interfira nas interações do usuário
        "z-10" // Define que o overlay ficará sobre a carta
      );
      overlay.style.backgroundImage =
        "url(../assets/other-images/paralyzed-background.png)"; // A imagem da paralisia elétrica
      // Adiciona o overlay sobre a carta
      cardElement.appendChild(overlay);
      //console.log(`Aplicada paralisia elétrica à carta ${instanceId}.`);
    },
    congelamento: () => {
      // Cria o overlay
      const overlay = document.createElement("div");
      overlay.className = "keyword__overlay";
      overlay.classList.add(
        "absolute", // Posiciona o overlay no topo da carta
        "inset-0", // Faz com que o overlay cubra 100% da largura e altura
        "bg-cover", // Faz a imagem de fundo cobrir toda a área do overlay
        "bg-center", // Centraliza a imagem de fundo
        "opacity-50", // Define a opacidade em 50%
        "pointer-events-none", // Evita que o overlay interfira nas interações do usuário
        "z-10" // Define que o overlay ficará sobre a carta
      );
      overlay.style.backgroundImage =
        "url(../assets/other-images/frozen-background.png)"; // A imagem da congelamento
      // Adiciona o overlay sobre a carta
      cardElement.appendChild(overlay);
      //console.log("Overlay adicionado ao elemento:", overlay, cardElement);
      //console.log(`Aplicado congelamento à carta ${instanceId}.`);
      cardsFrozenThisRound++;
      totalcardsFrozen++;
    },
    // Adicionar mais keywords aqui futuramente
    // 'nova keyword': () => { ... }
  };

  // Verifica se a keyword existe no mapeamento e aplica a ação correspondente
  if (keywordActions[keyword]) {
    console.log(`Chamando ação para keyword: ${keyword}`);
    if (operation === "addition") {
      if (!currentKeywords.includes(keyword)) {
        keywordActions[keyword]();
        //console.log("Before push:", currentKeywords);
        currentKeywords.push(keyword);
        //console.log("After push:", currentKeywords);
      } else {
        console.log(`A carta já possui a keyword: ${keyword}`);
      }
    } else if (operation === "removal") {
      currentKeywords = currentKeywords.filter(
        (existingKeyword) => existingKeyword !== keyword
      );
      const overlay = slot.querySelector(".keyword__overlay");
      if (overlay) {
        overlay.remove();
      } else {
        //console.error("overlay não encontrado.");
      }
    } else {
      console.warn("Tipo de operação (adição/remoção) inválido.");
    }

    // Atualiza o valor de data-keywords no elemento, convertendo o array de volta para string
    cardElement.dataset.keywords = JSON.stringify(currentKeywords);

    // Log para verificar a atualização
    console.log(`Updated keywords for card:`, cardElement.dataset.keywords);

    // Atualizar as divs de display dos stats, pq algumas keywords negativas modificam stats
    updateCardStats(cardData);
  } else {
    console.warn(`Keyword '${keyword}' não possui ação definida.`);
  }
}

// --------------------------------------------------------------------------------

function animateAttack(attackerElement, targetElement) {
  // Posição inicial e final
  const attackerPos = attackerElement.getBoundingClientRect();
  const targetPos = targetElement.getBoundingClientRect();

  // Calcular a distância a ser percorrida
  const deltaX = targetPos.left - attackerPos.left;
  const deltaY = targetPos.top - attackerPos.top;

  // Animação: mover a carta atacante para a posição da carta alvo
  attackerElement.style.zIndex = "50";
  attackerElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  // Após a animação, a carta volta à posição original
  setTimeout(() => {
    attackerElement.style.transform = ""; // Volta à posição original
  }, 800); // Tempo igual ao definido no 'transition'
}

// -------------------------------------

function updateFieldAfterCombat(cartaAlvoData, cartaAtacanteData) {
  console.log("Dados recebidos para a carta alvo:", cartaAlvoData);
  console.log("Dados recebidos para a carta atacante:", cartaAtacanteData);

  let cartaAtacanteElement = document.querySelector(
    `.carta[data-instance-id="${cartaAtacanteData.instanceId}"]`
  );

  let cartaAlvoElement = document.querySelector(
    `.carta[data-instance-id="${cartaAlvoData.instanceId}"]`
  );

  if (!cartaAlvoElement && !cartaAtacanteElement) {
    console.error(
      "Elemento da carta atacante ou da alvo não encontrados no DOM."
    );
    return;
  }

  animateAttack(cartaAtacanteElement, cartaAlvoElement);

  // Atualiza as cartas (primeiro sempre atualiza visualmente, depois decide o que remover)
  setTimeout(() => {
    cartaAtacanteElement = updateCardDisplay(cartaAtacanteData);
    cartaAlvoElement = updateCardDisplay(cartaAlvoData);
  }, 1000);

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
      //console.log("Carta atacante morreu. Removendo do DOM.");
      handleCardDeath(cartaAtacanteElement);
    }

    if (cartaAlvoElement && cartaAlvoData.currentHealth <= 0) {
      //console.log("Carta alvo morreu. Removendo do DOM.");
      handleCardDeath(cartaAlvoElement);
    }
  }, 1800); // Delay de 100ms para garantir que as atualizações visuais sejam processadas antes de remover o DOM
}

function updateCardDisplay(cardData) {
  if (
    !cardData ||
    !("instanceId" in cardData) ||
    !("currentHealth" in cardData)
  ) {
    console.error(
      "Dados inválidos fornecidos para updateCardDisplay:",
      cardData
    );
    return null;
  }

  // Seleciona o elemento da carta pelo instanceId
  const cardElement = document.querySelector(
    `.carta[data-instance-id="${cardData.instanceId}"]`
  );
  if (!cardElement) {
    console.error(
      `Elemento da carta com instanceId ${cardData.instanceId} não encontrado.`
    );
    return null;
  }

  const statsDisplay = cardElement.querySelector(".card-stats");

  if (!statsDisplay) {
    console.warn(`Display (div) de stats da carta não encontrado no DOM.`);
    return cardElement;
  }

  const healthDisplayDiv = statsDisplay.querySelector(".card-health");
  const trueHealthValue = parseInt(cardData.currentHealth, 10);
  const healthDisplayed = parseInt(healthDisplayDiv?.textContent || "0", 10);

  if (trueHealthValue !== healthDisplayed) {
    cardElement.classList.add("damageUnit", "shake");
    setTimeout(() => {
      cardElement.classList.remove("damageUnit", "shake");
    }, 4700);
  }
  updateCardStats(cardData);
  return cardElement;
}

function updateCardStats(cardData) {
  const instanceId = Number(cardData.instanceId);
  if (!instanceId) {
    console.error("instanceId com valor inválido.");
    return;
  }

  const cardElement = document.querySelector(
    `.carta[data-instance-id="${instanceId}"]`
  );

  if (!cardElement) {
    console.error(
      `Elemento no DOM não encontrado para a carta de instanceId = ${instanceId}`
    );
    return;
  }

  // Atualiza os atributos específicos
  updateCardHealth(cardData, cardElement);
  updateCardAttack(cardData, cardElement);
  updateCardSpeed(cardData, cardElement);

  // Verifica se a carta morreu
  if (cardData.currentHealth <= 0) {
    handleCardDeath(cardElement);
  }
}

function updateCardHealth(cardData, cardElement) {
  const healthDisplay = cardElement.querySelector(".card-health");
  if (healthDisplay) {
    healthDisplay.textContent = cardData.currentHealth;
    healthDisplay.style.color = getStatColor(
      cardData.currentHealth,
      cardData.baseHealth
    );
    cardElement.dataset.currentHealth = cardData.currentHealth;

    // Toca sons e animações com base na alteração da vida
    if (cardData.currentHealth > cardData.baseHealth) {
      playSound("healthIncreaseSound");
      cardElement.dataset.maxHealth = cardData.currentHealth;
    } else if (cardData.currentHealth < cardData.baseHealth) {
      playSound("hitSound");
      cardElement.classList.add("damageUnit", "shake");
      setTimeout(() => {
        cardElement.classList.remove("damageUnit", "shake");
      }, 1200);
    }
  } else {
    console.error("Elemento de exibição de VIDA da carta não encontrado.");
  }
}

function updateCardAttack(cardData, cardElement) {
  const attackDisplay = cardElement.querySelector(".card-attack");
  if (attackDisplay) {
    attackDisplay.textContent = cardData.currentAttack;
    attackDisplay.style.color = getStatColor(
      cardData.currentAttack,
      cardData.baseAttack
    );
    cardElement.dataset.currentAttack = cardData.currentAttack;
  } else {
    console.error("Elemento de exibição de ATAQUE da carta não encontrado.");
  }
}

function updateCardSpeed(cardData, cardElement) {
  const speedDisplay = cardElement.querySelector(".card-speed-display");
  if (speedDisplay) {
    speedDisplay.textContent = cardData.currentSpeed;
    speedDisplay.style.color = getStatColor(
      cardData.currentSpeed,
      cardData.baseSpeed
    );
    cardElement.dataset.speed = cardData.currentSpeed;
  } else {
    console.error(
      "Elemento de exibição de VELOCIDADE da carta não encontrado."
    );
  }
}

function getStatColor(currentValue, baseValue) {
  if (currentValue < baseValue) return "red";
  if (currentValue > baseValue) return "lightgreen";
  return "white";
}

function handleCardDeath(cartaElement) {
  const slotDaCarta = cartaElement.closest(".slots");

  // Verifica se o slotDaCarta existe antes de tentar adicionar o deadCardFrame
  if (!slotDaCarta) {
    console.error("Erro: Não foi possível encontrar o slot da carta.");
    return;
  }

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
  const soundEffect = soundEffects.find((s) => s.name === soundName);
  if (soundEffect) {
    let audio = new Audio(soundEffect.soundFile);
    audio.play();
  } else {
    console.error(`Efeito sonoro '${soundName}' não encontrado.`);
  }
}

// ------------------------------------------------------------------------------------

function buffOrDebuffRequest({ attackChange, healthChange }, cardElement) {
  console.log("buffOrDebuffRequest triggered.");
  console.table("cardElement:", cardElement);

  if (!attackChange && !healthChange) {
    console.error("Valor de attackChange e healthChange nulos.");
    return;
  }

  const cardInstanceId = cardElement.dataset.instanceId;

  if (cardInstanceId) {
    let message = {
      type: "buffOrDebuffRequest",
      data: { cardInstanceId, attackChange, healthChange },
    };
    console.log(`Enviando ${JSON.stringify(message)} para o servidor.`);
    sendMessageToServer(JSON.stringify(message));
  } else {
    console.error("cardInstanceId não encontrada: ", cardInstanceId);
  }
}

// ------------------------------------------------------------------------------------

function updateCardSpeedRequest(cardElement, options) {
  //console.log("updateCardSpeedRequest triggered.");
  //console.table(options);
  const { change, amount } = options;
  //console.log(`change = ${change}`);
  //console.log(`amount = ${amount}`);
  //console.log(`cardElement = ${cardElement}`);

  const cardInstanceId = cardElement.dataset.instanceId;

  let message;

  if (change === "increase") {
    message = {
      type: "increaseCardSpeedRequest",
      data: { cardInstanceId, amount },
    };
  } else if (change === "decrease") {
    message = {
      type: "decreaseCardSpeedRequest",
      data: { cardInstanceId, amount },
    };
  } else {
    console.error(
      "Tipo de mudança de velocidade (valor da var change) desconhecido."
    );
    return;
  }
  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------------------------------

// Função para enviar a solicitação de cura para a carta
function healCardRequest(healingAmount, cardElement) {
  //console.log("healCardRequest triggered.");
  //console.table("card:", cardElement);
  //console.log(`healingAmount = ${healingAmount}`);

  if (isNaN(healingAmount) || healingAmount <= 0) {
    console.error("Valor de healingAmount inválido.");
    return;
  }

  const cardInstanceId = cardElement.dataset.instanceId;

  let message = {
    type: "healRequest",
    data: { cardInstanceId, healingAmount },
  };

  sendMessageToServer(JSON.stringify(message));
}

// ------------------------------------------------------------------------------------

// Função para enviar a solicitação de cura para o avatar
function healAvatarRequest(healingAmount, avatarType) {
  //console.log("healAvatarRequest triggered for:", avatarType);

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

// ------------------------------------------------------------------------------------
function nextRoundEffectAddition(message) {
  const { cardData } = message.data;
  const effectType = message.effectType;

  switch (effectType) {
    case "resurrection":
      const cardContainer = createCardElement(cardData);
      if (cardContainer) {
        nextRoundEffects.set(cardContainer.dataset.instanceId, () =>
          addCardToField(cardContainer, (slotNumber = undefined))
        );
      } else {
        console.error(
          "cardContainer não encontrado ou não foi possível criá-lo."
        );
      }
      break;
    case "manaAddition":
      const amount = message.data.amount;
      nextRoundEffects.set(cardData.instanceId, () => addMana(amount));
      break;
    default:
      console.warn("effectType não identificado:", effectType);
  }
}

const handleBuffOrDebuffButtonClick = ({ attackChange, healthChange }) => {
  const cardsInField = getCardsInField("allied");

  if (cardsInField.length === 0) {
    alert("O campo de batalha está vazio.");
    return;
  }

  // Define a função que remove os listeners e o destaque
  const removeListenersAndHighlights = () => {
    cardsInField.forEach((card) => {
      card.classList.remove("highlight"); // Remove o destaque
      card.removeEventListener("click", buffOrDebuffListener); // Remove o listener de buff/debuff
    });
    document.removeEventListener("click", handleOutsideClick); // Remove o listener do documento
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest(".carta")) {
      console.log("Clique fora detectado, removendo os listeners e highlights");
      removeListenersAndHighlights();
    }
  };

  // Define o listener de buff ou debuff
  const buffOrDebuffListener = (event) => {
    event.stopPropagation();
    const card = event.target.closest(".carta");
    console.log(event.target);

    // Se o buff ou debuff vier do clique no botão e nao estiver definido, como em algum efeito de grito de guerra
    if (!attackChange || !healthChange) {
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
      [attackChange, healthChange] = buffDebuffInput
        .split("/")
        .map((value) => parseInt(value));

      // Verifica se o input está no formato correto
      if (isNaN(attackChange) || isNaN(healthChange)) {
        alert("Erro: Formato inválido. Use o formato '+X/+Y' ou '-X/-Y'.");
        card.classList.remove("highlight");
        card.removeEventListener("click", buffOrDebuffListener);
        return;
      }
    }

    // Aplica o buff ou debuff na carta
    buffOrDebuffRequest({ attackChange, healthChange }, card);

    // Remove destaque e listener após aplicação
    removeListenersAndHighlights();
    addAttackListeners(card);
    document.removeEventListener("click", handleOutsideClick);
  };

  cardsInField.forEach((card) => {
    setTimeout(() => {
      card.classList.add("highlight"); // Adiciona a classe 'highlight' para destaque
    }, 30);

    // Adiciona o event listener diretamente
    card.addEventListener("click", buffOrDebuffListener);

    // Remover o listener de ataque para não causar interferência
    const attackListener = clickListenersMap.get(card);

    // Remove o listener do elemento card
    card.removeEventListener("click", attackListener);
  });

  // Remove o listener do documento antes de adicionar para evitar duplicatas
  document.removeEventListener("click", handleOutsideClick);

  // Adiciona o listener ao documento para remover os listeners de buff/debuff quando um clique fora for detectado
  // Usa um setTimeout para evitar que o clique no botão seja capturado como "clique fora"
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 50);
};

// -----------------------------------------

const handleHealButtonClick = (event) => {
  event.stopPropagation();

  console.log("handleHealButtonClick triggered.");
  const cardsInField = getCardsInField();

  // Verificação básica para garantir que temos cartas e avatares
  if (cardsInField.length === 0 && (!alliedAvatar || !opponentAvatar)) {
    console.error(
      "Erro: Lista de cartas vazia e elementos dos avatares não encontrados no DOM."
    );
    return;
  }

  // Destaca os avatares
  alliedAvatar.classList.add("highlight");
  opponentAvatar.classList.add("highlight");

  // Função para remover os listeners de cura
  const removeHealListeners = () => {
    console.log("Removendo listeners de cura.");

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

    // Remove o listener do documento para cliques fora das cartas/avatares
    document.removeEventListener("click", handleDocumentClick);
  };

  // Listener de cura
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
      addAttackListeners(event.target);
    } else if (event.target === alliedAvatar) {
      healAvatarRequest(healingAmount, "allied");
    } else if (event.target === opponentAvatar) {
      healAvatarRequest(healingAmount, "enemy");
    }

    // Após aplicar a cura, remover os listeners de cura
    removeHealListeners();
  };

  // Listener para detectar cliques fora das cartas/avatares e cancelar a cura
  const handleDocumentClick = (event) => {
    if (
      !event.target.closest(".carta") &&
      event.target !== alliedAvatar &&
      event.target !== opponentAvatar
    ) {
      console.log("Clique fora detectado. Removendo listeners.");
      removeHealListeners();
    }
  };

  // Remove o listener do documento antes de adicionar para evitar duplicatas
  document.removeEventListener("click", handleDocumentClick);

  // Adiciona o listener ao documento para detectar cliques fora dos alvos de cura
  document.addEventListener("click", handleDocumentClick);

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

// ----

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

      let message = {
        type: "recallRequest",
        data: { cardInstanceId },
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

const handleDamageButtonClick = (event) => {
  event.stopPropagation();

  const cardsInField = getCardsInField();

  // Verificação básica para garantir que temos cartas e avatares
  if (cardsInField.length === 0 && (!alliedAvatar || !opponentAvatar)) {
    console.error(
      "Erro: Lista de cartas vazia e elementos dos avatares não encontrados no DOM."
    );
    return;
  }

  // Destaca os avatares
  alliedAvatar.classList.add("highlight");
  opponentAvatar.classList.add("highlight");

  // Função para remover os listeners de dano
  const removeDamageListeners = () => {
    console.log("Removendo listeners de dano.");

    // Remove destaque dos avatares
    alliedAvatar.classList.remove("highlight");
    opponentAvatar.classList.remove("highlight");

    // Remove listeners de dano das cartas
    cardsInField.forEach((card) => {
      card.removeEventListener("click", damageListener);
      card.classList.remove("highlight");
    });

    // Remove listeners de dano dos avatares
    alliedAvatar.removeEventListener("click", damageListener);
    opponentAvatar.removeEventListener("click", damageListener);

    // Remove o listener do documento para cliques fora das cartas/avatares
    document.removeEventListener("click", handleDocumentClick);
  };

  // Listener de dano
  const damageListener = (event) => {
    event.stopPropagation();

    // Solicita o valor de cura
    const damageAmount = Number(
      prompt("Digite o valor que deseja causar de dano.")
    );

    if (isNaN(damageAmount) || damageAmount <= 0) {
      alert("Por favor, digite um número válido para causar de dano.");
      removeDamageListeners();
      return;
    }

    // Determina o alvo do clique
    const cardElement = event.target.closest(".carta");
    if (cardElement) {
      dealDirectDamageRequest(damageAmount, cardElement);
      addAttackListeners(cardElement);
    } else if (event.target === alliedAvatar) {
      dealDirectDamageRequest(damageAmount, alliedAvatar);
    } else if (event.target === opponentAvatar) {
      dealDirectDamageRequest(damageAmount, opponentAvatar);
    }

    // Após aplicar a cura, remover os listeners de cura
    removeDamageListeners();
  };

  // Listener para detectar cliques fora das cartas/avatares e cancelar a cura
  const handleDocumentClick = (event) => {
    if (
      !event.target.closest(".carta") &&
      event.target !== alliedAvatar &&
      event.target !== opponentAvatar
    ) {
      console.log("Clique fora detectado. Removendo listeners.");
      removeDamageListeners();
    }
  };

  // Remove o listener do documento antes de adicionar para evitar duplicatas
  document.removeEventListener("click", handleDocumentClick);

  // Adiciona o listener ao documento para detectar cliques fora dos alvos de cura
  document.addEventListener("click", handleDocumentClick);

  // Remove listeners de ataque antes de adicionar o de cura
  cardsInField.forEach((card) => {
    const attackListener = clickListenersMap.get(card);
    if (attackListener) {
      card.removeEventListener("click", attackListener);
    }
    card.classList.add("highlight");
    card.addEventListener("click", damageListener);
  });

  // Adiciona o listener de cura aos avatares
  alliedAvatar.addEventListener("click", damageListener);
  opponentAvatar.addEventListener("click", damageListener);
};

const handleEndRoundButtonClick = () => {
  //console.log("Botão de finalizar rodada foi clicado pelo jogador.");

  let message = {
    type: "endRoundRequest",
  };

  sendMessageToServer(JSON.stringify(message));
};

// ------------------------------------------------------------------------
// Algumas variáveis pra se colocar eventListener
const buffOrDebuffButton = document.querySelector("#buffOrDebuffButton");
const healButton = document.querySelector("#healButton");
const recallButton = document.querySelector("#recallButton");
const damageButton = document.querySelector("#damageButton");

// fazer um event listener do form on submit com prevent default
loginForm.addEventListener("submit", handleSubmit);

// ao clicar no botão de selecionar deck
interpretButton.addEventListener("click", () => {
  let deckCode = document.getElementById("deckCodeInput").value;
  let message = {
    type: "deckCode",
    deckCode: deckCode,
  };
  /*  console.log(
    `Deck (${message.deckCode}) enviado para o servidor com sucesso. Aguardar pelo oponente e pela respota do servidor.`
  ); */
  message = JSON.stringify(message);
  sendMessageToServer(message);
});

document.addEventListener("mouseover", (event) => {
  if (!event.target.closest(".carta")) {
    ////console.log('Mouse por cima de um elemento qualquer que não uma carta, removendo os containers de descrição.');
    let hoverContainers = document.querySelectorAll(".hover__container");
    hoverContainers.forEach((hoverContainer) => {
      hoverContainer.remove();
    });
  }
});

buffOrDebuffButton.addEventListener("click", handleBuffOrDebuffButtonClick);

healButton.addEventListener("click", handleHealButtonClick);

recallButton.addEventListener("click", handleRecallButtonClick);

damageButton.addEventListener("click", handleDamageButtonClick);

endRoundButton.addEventListener("click", () => {
  const confirmation = confirm(
    "Tem certeza que deseja finalizar seu turno nesta rodada? (Esta ação não pode ser desfeita)."
  );
  if (confirmation) {
    handleEndRoundButtonClick();
    endRoundButton.disabled = true;
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".slots") && !event.target.closest(".carta")) {
    let playCardButtons = document.querySelectorAll(".playCard-button");
    playCardButtons.forEach((playCardButton) => {
      //console.log('Removendo botão "Jogar":', playCardButton);
      playCardButton.remove();
    });
  }
});
