let opponentAvatarLifeSpan =  document.getElementById('opponent-health');
        opponentAvatarLifeSpan.style.color = 'lightgreen';
      
let yourAvatarLifeSpan = document.getElementById('player-health');
        yourAvatarLifeSpan.style.color = 'lightgreen';
//------------------------------------------------------------//
let playerId; // ID do jogador (para diferenciar entre os dois lados)

let editMode = true; 
console.log(`editModeOn?${editMode}`);
// Variáveis globais
    //deck e mao
let starterDeck = []; // Deck de cartas inicial
let currentDeck = []; // Começa como um conjunto vazio
let deckCardCount = 0; // Contador de cartas atualmente no deck
let handCardCount = 0;
    //outros contadores e conjuntos
let graveyard = [];
let graveyardArea = null;
let cardsPlayed = [];
    //pontuação
let playerMatchPoints = 0;
let opponentMatchPoints = 0;
    //turnos
let currentTurnIndex = 5;
let isAmplifierActive = false;
let specialPointsMultiplier;
let lastTurn = false;
    //life
let currentPlayerLife = 25;
let totalHealed = 0;
let healPerTurn = []
let yourHealthZone = 'extra';
let opponentHealthZone = 'extra';
//--ARRAYS DE CARTAS--//
// Todas as cartas do jogo (ordenado por ID)



let cards = [ 
  {
    id:1, name:"A Vagante Sombria", baseCost: 10, image:"../cartas/obscura/A Vagante Sombria.png", baseAttack:10, baseLife:5,  keywords: ["último suspiro", "obscuro", "morto-vivo", "constante", "corpo-a-corpo"] 
  },
  {
    id: 2, name:"Elemental do Fogo", baseCost:2, image:"../cartas/ignea/Elemental do Fogo.png", baseAttack:2, baseLife:2, keywords: ["grito de guerra", "ígneo", "elemental", "corpo-a-corpo"]
  },
  {
    id:3, name: "Espírito Flamejante", baseCost: 1,image: "../cartas/ignea/Espírito Flamejante.png",baseAttack: 1, baseLife: 1, keywords: ["ígneo", "constante", "corpo-a-corpo"]
  },
  {
    id: 4, name: "Fulgurvoltz", baseCost: 13, image: "../cartas/eletrica/Fulgurvoltz.png", baseAttack: 10, baseLife: 8, keywords:["elétrico", "grito de guerra", "corpo-a-corpo"]
  },
  {
    id:5,name:"Ivan Ignisar",baseCost:7,image:"../cartas/ignea/Ivan Ignisar.png", baseAttack:7, baseLife:6, keywords:["ígneo", "humano", "dragão", "dragão primordial", "transformar", "condicional"]
  },
  {
    id:6,name:"Ignisar transformado",baseCost:7,image:"../cartas/ignea/Ignisar transformado.png", baseAttack:9, baseLife:7, keywords:["ígneo", "humano", "dragão", "dragão primordial", "transformado", "condicional"]
  },
  {
    id: 7, name:"Jack", baseCost: 2, image:"../cartas/eletrica/Jack.png",baseAttack:2, baseLife:2, keywords:["nadaporenquanto"]
  },
  {
    id: 8, name: "Layla", baseCost: 5, image: "../cartas/eletrica/Layla.png", baseAttack:5, baseLife:5, keywords:["nadaporenquanto"]
  },
  {
    id: 9, name:"Mali Magarc", baseCost: 9, image: "../cartas/neutra/Mali Magarc.png", baseAttack: 6, baseLife: 7, keywords:["nadaporenquanto"]
  },
  {
    id: 9000, name:"Mali transformado", baseCost: 9, image: "../cartas/neutra/Mali transformado.png", baseAttack: 8, baseLife: 10, keywords:["nadaporenquanto"]
  },
  {
    id: 10, name: "Rusco", baseCost: 2, image: "../cartas/neutra/Rusco.png", baseAttack: 2, baseLife: 2, keywords:["nadaporenquanto"]
  },
  {
    id: 11, name: "Sabrina", baseCost: 4, image: "../cartas/aquatica/Sabrina.png", baseAttack: 4, baseLife: 5, keywords:["nadaporenquanto"]
  },
  {
    id: 12, name: "Thorwells", baseCost: 7, image: "../cartas/eletrica/Thorwells.png", baseAttack: 8, baseLife: 6, keywords:["nadaporenquanto"]
  },
  {
    id: 13, name: "Tony Raiturus", baseCost: 6, image: "../cartas/eletrica/Tony Raiturus.png", baseAttack: 5, baseLife: 6, keywords:["nadaporenquanto"]
  },
  {
    id: 14, name: "Voltexz", baseCost: 20, image: "../cartas/eletrica/Voltexz.png", baseAttack: 10, baseLife: 7, keywords:["nadaporenquanto"]
  },
{
    id: 15, name: "Necrófago Espectral", baseCost: 1, image: "../cartas/obscura/Necrófago Espectral.png", baseAttack: 4, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 16, name: "O Revivente Eterno", baseCost: 2, image: "../cartas/obscura/O Revivente Eterno.png", baseAttack: 3, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 17, name: "Replicador Maldito", baseCost: 2, image: "../cartas/obscura/Replicador Maldito.png", baseAttack: 2, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 18, name: "Fênix das Trevas Profana", baseCost: 3, image: "../cartas/obscura/Fênix das Trevas Profana.png", baseAttack: 3, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 19, name: "Titânico Morcegalma", baseCost: 4, image: "../cartas/obscura/Titânico Morcegalma.png", baseAttack: 5, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 20, name: "O Espiritomante", baseCost: 5, image: "../cartas/obscura/O Espiritomante.png", baseAttack: 3, baseLife: 6, keywords:["nadaporenquanto"]
},
{
    id: 21, name: "Jeff-The-Death", baseCost: 6, image: "../cartas/obscura/Jeff-The-Death.png", baseAttack: 2, baseLife: 2, keywords:["nadaporenquanto"]
},
{
    id: 22, name: "Cientista da Morte", baseCost: 3, image: "../cartas/obscura/Cientista da Morte.png", baseAttack: 1, baseLife: 4, keywords:["nadaporenquanto"]
},
{
    id: 22000, name: "Cadáver Reanimado", baseCost: 3, image: "../cartas/obscura/Cadáver Reanimado.png", baseAttack: 3, baseLife: 3, keywords:["nadaporenquanto"]
},
{
    id: 23, name: "Rai'Emofitir", baseCost: 8, image: "../cartas/obscura/Rai'Emofitir.png", baseAttack: 6, baseLife: 6, keywords:["nadaporenquanto"]
},
//{id: 24, name: "Fonte-Da-Vida", baseCost: 3, image: "../cartas/Fonte-Da-Vida.png", baseAttack: 0, baseLife: 6},
{
    id: 25, name: "Mente Destrutiva", baseCost: 5, image: "../cartas/neutra/Mente Destrutiva.png", baseAttack: 2, baseLife: 5, keywords:["nadaporenquanto"]
},
{
    id: 26, name: "Eletroad", baseCost: 4, image: "../cartas/eletrica/Eletroad.png", baseAttack: 3, baseLife: 6, keywords:["nadaporenquanto"]
},
{
    id: 27, name: "Sta. Helena Maria da Cura", baseCost: 6, image: "../cartas/sagrada/Sta. Helena Maria da Cura.png", baseAttack: 0, baseLife: 10,keywords:["sagrado, humano, santo, benevolente, grito de guerra, condicional, regeneraçã"] 
},
{
    id: 28, name: "Engenheiro Louco", baseCost: 2, image: "../cartas/neutra/Engenheiro Louco.png", baseAttack: 1, baseLife: 3, 
},
{
    id: 29, name: "D'Lorafya", baseCost: 6, image: "../cartas/ignea/D'Lorafya.png", baseAttack: 7, baseLife: 5, keywords:["nadaporenquanto"]
},
{
    id: 30, name: "Kell", baseCost: 10, image: "../cartas/sagrada/Kell.png", baseAttack: 5, baseLife: 5, keywords:["nadaporenquanto"]
},
{
    id: 31, name: "Neraqa", baseCost: 6, image: "../cartas/aquatica/Neraqa.png", baseAttack: 0, baseLife: 12, keywords:["nadaporenquanto"]
},
//{id: 32, name: "Frasco Grande de Águas Curativas", baseCost: 2, image: "../cartas/Frasco Grande de Águas Curativas.png",},
//{id: 33, name: "Rejeição de Neraqa", baseCost: 3, image: "../cartas/Rejeição de Neraqa.png",},
{
    id: 34, name: "Leviatã", baseCost: 8, image: "../cartas/aquatica/Leviatã.png", baseAttack: 8, baseLife: 10, keywords:["nadaporenquanto"]
},
{
    id: 35, name: "Alexa", baseCost: 4, image: "../cartas/aquatica/Alexa.png", baseAttack: 3, baseLife: 10, keywords:["nadaporenquanto"]
},
{
    id: 36, name: "Espírito Carregado", baseCost: 1, image: "../cartas/eletrica/Espírito Carregado.png", baseAttack: 1, baseLife: 1, keywords:["nadaporenquanto"]
},
//{id: 37, name: "Dilúvio", baseCost: 2, image: "../cartas/Dilúvio.png"},
//{id: 38, name: "Fim das Sombras", baseCost: 3, image: "../cartas/Fim das Sombras.png"},
{
    id: 39, name: "Dragão Ancião do Trovão", baseCost: 5, image: "../cartas/eletrica/Dragão Ancião do Trovão.png", baseAttack: 7, baseLife: 4, keywords:["nadaporenquanto"]
},
{
    id: 40, name: "Gigante Elétrico", baseCost: 5, image: "../cartas/eletrica/Gigante Elétrico.png", baseAttack: 9, baseLife: 8, keywords:["nadaporenquanto"]
},
//{id: 41, name: "Afogar", baseCost: 3, image: "../cartas/Afogar.png"},
//{id: 42, name: "Tsunami", baseCost: 4, image: "../cartas/Tsunami.png"},
//{id: 43, name: "Invocar a Escuridão", baseCost: 4, image: "../cartas/Invocar a Escuridão.png"},
//{id: 44, name: "Últimas Palavras", baseCost: 4, image: "../cartas/Últimas Palavras.png"},
//{id: 45, name: "Renascimento Sombrio", baseCost: 3, image: "../cartas/Renascimento Sombrio.png" },
//{id: 46, name: "Velocidade do Relâmpago", baseCost: 5, image: "../cartas/Velocidade do Relâmpago.png"},
//{id: 47, name: "Armadura Faiscante", baseCost: 2, image: "../cartas/Armadura Faiscante.png"},
// {id: 48, name: "Campo de Batalha Tempestuoso", baseCost: 2, image: "../cartas/Campo de Batalha Tempestuoso.png"},
{
    id: 49, name: "Arcanjo Uriel", baseCost: 3, image: "../cartas/sagrada/Arcanjo Uriel.png", baseAttack: 2, baseLife: 5, keywords:["sagrado", "voo", "anjo", "arcanjo", "celestial", "corpo-a-corpo", "vínculo curativo", "condicional"]
},
{
    id: 50, name: "O Tecnomante", baseCost: 3, image: "../cartas/neutra/O Tecnomante.png", baseAttack: 2, baseLife: 5, keywords:["nadaporenquanto"]
},
{
    id: 51, name: "Torrente Azul", baseCost: 6, image: "../cartas/aquatica/Torrente Azul.png", baseAttack: 5, baseLife: 5, keywords:["nadaporenquanto"]
},
{
    id: 52, name: "Lucien", baseCost: 6, image: "../cartas/sagrada/Lucien.png", baseAttack: 3, baseLife: 5, keywords:["sagrado, longa-distância, humano, monge, condicional, fim do turno"]
},
{
    id: 53, name: "Gigante Marinho", baseCost: 4, image: "../cartas/aquatica/Gigante Marinho.png", baseAttack: 8, baseLife: 7, keywords:["nadaporenquanto"]
},
{
    id: 54, name: "Elemental de Água Gigante", baseCost: 10, image: "../cartas/aquatica/Elemental de Água Gigante.png", baseAttack: 0, baseLife: 1,keywords:["nadaporenquanto"] 
},
{
  id: 55, name: "Ronan", baseCost: 3, image: "../cartas/ignea/Ronan.png", baseAttack: 4, baseLife: 3, keywords:["nadaporenquanto"]
},
{
  id: 55000, name: "Ronan transformado", baseCost: 3, image: "../cartas/modo-truco/Ronan transformado.png", baseAttack: 6, baseLife: 4
},
{
  id: 56, name: "Zarvok", baseCost: 5, image: "../cartas/ignea/Zarvok.png", baseAttack: 5, baseLife: 5, keywords:["nadaporenquanto"]
},
{
  id: 57, name: "Gigante Flamejante", baseCost: 4, image: "../cartas/ignea/Gigante Flamejante.png", baseAttack: 8, baseLife: 7, keywords:["nadaporenquanto"]
},
{
  id: 58, name: "Piromante Ardente", baseCost: 2, image: "../cartas/ignea/Piromante Ardente.png", baseAttack: 3, baseLife: 2, keywords:["nadaporenquanto"]
},
{
  id: 59, name: "Avatar do Fogo", baseCost: 5, image: "../cartas/ignea/Avatar do Fogo.png", baseAttack: 5, baseLife: 4,keywords:["nadaporenquanto"]
},
{
  id: 60, name: "Irina Lança-Chamas", baseCost: 4, image: "../cartas/ignea/Irina Lança-Chamas.png", baseAttack: 5, baseLife: 4, keywords:["nadaporenquanto"]
},
{
  id: 61, name: "Esther", baseCost: 2, image: "../cartas/ignea/Esther.png", baseAttack: 2, baseLife: 2, keywords:["nadaporenquanto"]
},
{
  id: 62, name: "Brutamontes Chocante", baseCost: 8, image: "../cartas/eletrica/Brutamontes Chocante.png", baseAttack: 7, baseLife: 7, keywords:["nadaporenquanto"]
},
{
  id: 63, name: "Eletrocaçadora Vesper", baseCost: 6, image: "../cartas/eletrica/Eletrocaçadora Vesper.png", baseAttack: 7, baseLife: 5, keywords:["nadaporenquanto"]
},
{
  id: 64, name: "Dragãozinho Flamejante", baseCost: 1, image: "../cartas/ignea/Dragãozinho Flamejante.png", baseAttack: 2, baseLife: 2, keywords:["nadaporenquanto"]
},
{
  id: 65, name: "David-The-Titanslayer", baseCost: 4, image: "../cartas/neutra/David-The-Titanslayer.png", baseAttack: 6, baseLife: 3 , keywords:["nadaporenquanto"]
},
{
  id: 66, name: "Diabrete Sombrio", baseCost: 1, image: "../cartas/obscura/Diabrete Sombrio.png", baseAttack: 2, baseLife: 1 , keywords:["nadaporenquanto"]
},
{
  id: 67, name: "Agonox", baseCost: 5, image: "../cartas/obscura/Agonox.png", baseAttack: 4, baseLife: 5, keywords:["nadaporenquanto"]
},
{
  id: 68, name: "Diabrete Elétrico", baseCost: 1, image: "../cartas/eletrica/Diabrete Elétrico.png", baseAttack: 2, baseLife: 1, keywords:["nadaporenquanto"]
},
{
  id: 69, name: "Oráculo das Marés", baseCost: 2, image: "../cartas/aquatica/Oráculo das Marés.png", baseAttack: 0, baseLife: 4, keywords:["aquático", "benevolente", "grito de guerra", "condicional"]
},
{
  id: 70, name: "Thalassor", baseCost: 7, image: "../cartas/aquatica/Thalassor.png", baseAttack: 7, baseLife: 9, keywords:["aquático", "tritão", "corpo-a-corpo", "constante"]
},
{
  id: 71, name: "Odon, Mestre das Armas", baseCost: 4, image: "../cartas/neutra/Odon, Mestre das Armas.png", baseAttack: 4, baseLife: 4, keywords:["neutro", "anão", "corpo-a-corpo", "grito de guerra"]
},
{
  id: 72, name: "Sengoku", baseCost: 7, image: "../cartas/neutra/Sengoku.png", baseAttack: 7, baseLife: 7, keywords:["neutro", "humano", "dragão", "dragão primordial", "corpo-a-corpo", "intimidador", "regeneração", "transformar"]
},
{
  id: 73, name: "Drake Damian", baseCost: 3, image: "../cartas/neutra/Drake Damian.png", baseAttack: 2, baseLife: 2, keywords:["neutro", "humano", "corpo-a-corpo", "esquiva", "constante"]
},
{
  id: 74, name: "Emissário da Água da Vida", baseCost: 3, image: "../cartas/aquatica/Emissário da Água da Vida.png", baseAttack: 3, baseLife: 4, keywords:["aquático", "longa-distância", "grito de guerra"]
}



  ];
  
  // Verifica se as cartas foram carregadas corretamente
  //console.log(cards);


let cardsTextDescription = [
    
    { 
        id: 1, 
        description: `A Vagante Sombria
        9 de mana | 10/5
        (Obscuro | Corpo-a-Corpo | [Morto-Vivo] Espírito [Alma Penada] |) 
        *Indestrutível*
        “Custo (1) a menos para cada duas cartas aliadas destruídas ao longo desta partida.” 
        ` 

    },
    { 
        id: 2, 
        description: `Elemental do Fogo 
        2 de mana | 2/2
        (Ígneo | Corpo-a-corpo | Elemental |)
        #Grito de Guerra: “invoco duas cópias de ‘Espírito Flamejante’ aliadas.”` 
    },

    { 
        id: 3, 
        description: `Espírito Flamejante 
        1 de mana | 1/1
        (Ígneo | Corpo-a-corpo | Elemental |) 
       *Queimar (1)*` 
    },
    { 
        id: 4, 
        description: function(cardElement) {
          return `Fulgurvoltz 
        ${cardElement.getAttribute('data-cost')} de mana | 8/11 
        (Elétrico | Corpo-a-corpo |Elemental | Corpo-a-Corpo |)
        “Custo (1) a menos para cada mana não gasta por você ao longo desta partida (Mín.4). [${unspentMana}].” 
        #Grito de Guerra: “destruo todas as cartas não-elétricas com menos de 8 de ataque.”`
      } 
    },
    { 
        id: 5, 
        description: `Ivan Ignisar
        7 de mana | 7/6 
        (Ígneo | Corpo-a-corpo | Humano | Dragão [Dragão Primordial]) 
        *Intimidador*, *Velocidade (2)* 
        #Condicional: “quando eu causar dano e destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
        #Transformar: (1 turno para carregar) “se eu e/ou outra carta ígnea tivermos causado um total de 10+ de dano neste turno.”` 
    },
    { 
        id: 6, 
        description: `Ignisar transformado 
        7 de mana | 9/7
        (Ígneo | Corpo-a-corpo | Humano | Dragão [Dragão Primordial]) 
        *Intimidador*, *Voo*, *Velocidade (2)* 
        #Condicional: “quando eu atacar, ataco também à longa-distância causando dano em área, 6 ao alvo principal e 4 de respingo. Quando eu destruir uma carta, causo dano ao avatar inimigo igual à metade do meu ataque (arredondado para cima).” 
        #Transformado: “destransformo no final do turno.”` 
    },

    { 
        id: 7, 
        description: `Jack 
        2 de mana | 2/2
        (Elétrico | Longa-distância | Humano | Nulifária |)
        *Paralisante* 
        #Grito de Guerra: “ganho +1/+1 se houver pelo menos uma unidade elétrica aliada no campo de batalha.” 
        #Condicional: “depois que eu ou uma unidade elétrica aliada causar dano, ganho +1/+1 e +1 de Velocidade [Máx.4].”`
    },

    { 
        id: 8, 
        description: `Layla 
        5 de mana | 5/5
        (Elétrico| Longa-distância | Humano | Nulifária |) 
        #Grito de Guerra: “aplico *paralisia elétrica* a até duas cartas alvo.” 
        #Condicional: “sempre que uma carta do oponente for marcada com *paralisia elétrica*, causo metade do meu ataque (arredondado para cima) como dano *atravessante*.”
        #Final do Turno: “ataco sem sofrer dano todas as unidades paralisadas sobreviventes no final do turno.”` 
    },
    { 
        id: 9, 
        description: `Mali Magarc
        9 de mana | 6/7
        (Corpo-a-corpo | Humano | Dragão [Dragão Primordial] | Nulifária) 
        *Dano Mágico (+2)*, *Barreira Anti-Mágica*, *Velocidade (3)*
        #Constante: “nunca perco *barreira anti-mágica*.”
        #Condicional: “a cada dois feitiços lançados, ganho ‘+1 de *dano mágico*’.”
        #Transformar: (1 turno para carregar) “se eu tiver acumulado *dano mágico +5* ou superior.”` 
    },

    { 
        id: 10, 
        description: `Rusco 
        2 de mana | 2/2
        (Corpo-a-corpo | Fera | Humano |) 
        *Escudo* 
        #Condicional-#Fim do Turno: “se você jogou uma carta de custo, ataque ou vida igual a 2 neste turno e eu estiver no seu deck no fim do turno, invoque-me no seu campo de batalha.”` 
    },

    { 
        id: 11, 
        description: `Sabrina 
        4 de mana | 4/5
        (Aquático| Longa-distância | Humano | Aldeia do Rio |) 
        #Condicional: “quando eu causar ou sofrer dano de combate e a outra unidade sobreviver, em vez do dano de revide, a outra carta retorna para a mão do dono se você tiver alguma mana não gasta.”` 
    },
  
    { 
        id: 12, 
        description: `Thorwells 
        7 de mana | 8/6
        (Elétrico | Corpo-a-corpo | Celestial |) 
        #Grito de Guerra: “aplico *paralisia elétrica* a todas as cartas não-elétricas em jogo. Para cada uma que estiver paralisada, você ganha +1 mana máxima somente no próximo turno. Além disso, ataco todas que já estavam paralisadas antes do meu <#Grito de Guerra>.” #Constante: “não posso ter minha velocidade reduzida e nem ser afetado por Gritos de Guerra ou efeitos de dano inimigos.”`
    },
    { 
        id: 13, 
        description: `Tony Raiturus 
        6 de mana | 5/6
        (Elétrico | Humano | Dragão [Dragão Primordial]) 
        #Constante: “não posso ser afetado por Gritos de Guerra ou efeitos de dano inimigos.” 
        #Condicional: “cada terceiro ataque meu é de <longa-distância> e causa 7 de dano <atravessante>.”`
    },
    { 
        id: 14, 
        description: function(cardElement) {
          return `Voltexz 
         ${cardElement.getAttribute('data-cost')} de mana | 10/7
        (Elétrico | Longa-Distância |) 
        “Custo (2) a menos para cada mana não gasta por você ao longo da partida. (Mín.2) (${unspentMana})” #Grito de Guerra: “causo 3 de dano a todas as cartas inimigas e concedo +1/+1 às suas outras cartas até o final do turno. Além disso, você pode gastar até 4 de mana adicional. Para cada mana gasta dessa forma, aprimore o efeito do meu grito de guerra. (Máx. 7 de dano e +5/+5).”`
      } 
    },
    { 
        id: 15, 
        description: `Necrófago Espectral
        1 de mana | 4/3 
        (Corpo-a-corpo | Fera | Morto-Vivo [Cadáver Reanimado] |) 
        #Grito de Guerra: “destruo uma carta aliada à sua escolha. Não posso ser jogado se o seu lado do campo de batalha estiver vazio.”` 
    },
    { 
        id: 16, description: `O Revivente Eterno 
        2 de mana | 3/3
        (Corpo-a-corpo | Morto-Vivo |) 
        #Último Suspiro: “ressuscito no turno seguinte.”`
    },
    { 
        id: 17, description: `Replicador Maldito 
        2 de mana | 2/3
        (Corpo-a-corpo | ?? ) 
        #Último Suspiro: “invoco duas cópias minhas sem esta habilidade.”`
    },
    { 
        id: 18, description: `Fênix das Trevas Profana
        3 de mana 3/3
        (Corpo-a-corpo | Fera |) 
        *Voo*
        #Condicional: “eu sou destruído se você estiver ganhando a partida.” #Último Suspiro: “ressuscito no turno seguinte com +1/+1.”`
    },
    { 
        id: 19, description: `Titânico Morcegalma 
        4 mana | 5/3
        (Corpo-a-corpo | ?? |) 
        *Vínculo Curativo (50%)* 
        #Condicional: “sempre que uma carta aliada é destruída, causo 1 de dano a todas as cartas do oponente e 2 ao avatar dele.”`
    },
    { 
        id: 20, description: `O Espiritomante 
        5 de mana | 3/6
        (Longa-distância | Humano [Feiticeiro] |)  
        *Indestrutível*
        #Grito de Guerra: “torno uma carta aliada no campo de batalha <*indestrutível*> até o final do turno. 
        #Constante: “não posso ser jogado na linha de frente.”`
    },
    { 
        id: 21, description: `Jeff, The Death
        6 de mana | 2/2 
        (Obscuro | Entidade |) 
        #Constante: “tenho +2/+2 para cada carta aliada destruída ao longo desta partida.”
        #Condicional: “se eu fosse ser destruído, em vez disso, retorno à sua mão.”`
    },
    { 
        id: 22, description: `Cientista da Morte 
        3 de mana | 1/4 
        #Condicional: “sempre que uma carta aliada for destruída, invoco um cadáver reanimado 3/3.”`
    },
    { 
        id: 22, description: `Cadáver Reanimado
        3 de mana | 3/3 
        (Obscuro | Corpo-a-corpo | Morto-Vivo|)`
    },
    { 
        id: 23, description: `RaiEmofitir 
        6 de mana | 6/6 
        (Sagrado? | Obscuro? | Corpo-a-corpo |Celestial [Precursor] | Cidade Celestial | Terráver) 
        #Grito de Guerra: “destruo todas as cartas em ambos os campos de batalha. Este efeito não se ativa se você jogou alguma carta no último turno.”`
    },
    { 
        id: 24, description: function() {
            return `Fonte da Água da vida
            3 de mana | -/6 
            (Aquático | Paisagem |)
            #Grito de Guerra: “gero (3) de mana de estoque para você.” 
            #Condicional: “você pode ou não usar meu poder. Se usar, perco 1 de durabilidade e invoco um 'Elemental de Água Gigante' com atributos baseados no total de vida curado de suas cartas e avatar.” 
            #Início do turno: “curo 1 de vida de todos os aliados.”
            Condicional: “se eu tiver visto seu avatar e/ou suas cartas sendo curadas em um total de 38+ de vida, vença o jogo imediatamente. (${totalHealed}/36).”`
        }
    },
    { 
      id: 25, description: `Mente Destrutiva
      5 de mana | 2/5 
      (Longa-distância | Humano | Desarranjado |) 
      #Condicional: “você pode usar meu poder antes de cada combate. Se usar, eu sofro 1 de dano, causo 3 a todas as cartas e devolvo as que custam 3 ou menos às mãos dos donos. Se não usar, sofro 4 de dano. Se não usar por duas vezes consecutivas, destruo todas as cartas que custam 5 ou menos, causo 5 de dano a TODO MUNDO e não sofro dano.”`
  },
    { 
      id: 26, description: `Eletroad
      4 de mana | 3/6 (Elétrico | Corpo-a-corpo | Fera |) 
      #Constante: “gero (1) de mana adicional por turno enquanto você não estiver ganhando a partida.”
`
  },
  {
    id: 27, name: "Sta. Helena Maria da Cura", description: `Sta. Helena Maria Da Cura 
    5 de mana | -/10 
    (Sagrada | Humano | Santo |)  
    *Benevolente* (não pode atacar), *Regeneração (100%)* 
    #Grito de Guerra: “curo 4 pontos de vida da carta aliada ferida com menos vida.” 
    Condicional: “em vez de eu atacar, escolha uma entre as cartas aliadas de menor vida; a carta escolhida não pode ter sua vida reduzida abaixo de 1 e nem ser destruída enquanto durar a fase de combate; quando esta acabar, restaure toda a vida da carta escolhida.”`
},
{
    id: 28, name: "Engenheiro Louco", description: `Engenheiro Louco
    2 de mana | 1/3 
    (Gnomo | Corpo-a-Corpo)
    #Grito de Guerra: “os dois jogadores compram duas cartas.” `
},
{
    id: 29, name: "D'Lorafya", description: `D’Lorafya, O Fulgor Inextinguível 
    6 de mana | 7/5
    (Ígneo | Celestial | Corpo-a-Corpo/Ranged?)  
    #Grito de Guerra: “causo 5 de dano a TODAS as outras cartas no campo de batalha. As cartas ígneas sofrem o dano pela metade (arredondado para baixo). Também aplico *queimadura (1)* a todas não-ígneas.” 
    Constante: “ataques de longa-distância, feitiços e efeitos ígneos não podem me ferir.”`
},
{
    id: 30, name: "Kell", description: `Kell, Capitão Querubim 
    10 de mana | 5/5 
    (Anjo | Sagrado | Cidade Celestial | Corpo-a-Corpo)  
    *Voo* 
    #Grito de Guerra: “removo do jogo as 3 cartas não-sagradas mais caras do oponente.” 
    “Custo (1) a menos por cada carta sagrada aliada no campo de batalha.”`
},
{
    id: 31, name: "Neraqa", description: `Neraqa 
    6 de mana | -/12 
    (Aquático | Celestial |)  
    *Benevolente (não pode atacar)*, *Invulnerável (dano de combate)* 
    #Grito de Guerra e #Início do Turno: “escolha um entre: 
    >Uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
    >Uma carta aliada à sua escolha ganha *proteção divina* até o fim do turno.  
    >Uma carta aliada à sua escolha é curada em 4 de vida.”`
},
{
    id: 32, name: "Frasco Grande de Águas Curativas", description: `Frasco Grande de Águas Curativas
    (Feitiço [Imediato])
    “Escolha qualquer alvo para curar 7 de vida dele, se for o avatar, ele ganha 6 de vida.”`
},
{
    id: 33, name: "Rejeição de Neraqa", description: `Rejeição de Neraqa 
    3 de mana  
    (Feitiço [Rápido]) 
    “Você canaliza a fúria do oceano tempestuoso de Neraqa, manifestando sua vontade como uma barreira anti-magia, ou , alternativamente arrancando o alvo do tecido da realidade para devolvê-lo ao domínio de seu dono.”
    “Escolha um entre: 
    >Contrafeitiço, a menos que o invocador pague (5); 
    >Anule a invocação de uma unidade de até 5 de custo, a menos que o invocador pague (3).”`
},
{
    id: 34, name: "Leviatã", description: `Leviatã 
    8 de mana | 8/10 
    (Aquático | Fera | Corpo-a-Corpo ) 
    *Dano Excessivo*, *Intimidador* 
    #Constante: “as outras cartas aquáticas aliadas têm +1 de vida.”`
},
{
    id: 35, name: "Alexa", description: `Alexa 
    4 de mana |3/10 
    (Aquático | Celestial | Longa-distância |)  
    *Invulnerável* , *Transformar* 
    #Grito de Guerra: “uma carta inimiga de sua escolha fica silenciada.” 
    #Início do Turno: “escolha entre uma carta aliada e seu avatar. A opção escolhida ganha 2 de vida.”`
},
{
    id: 36, name: "Espírito Carregado", description: `Espírito Carregado 
    1 de mana | 1/1 
    (Elétrico | Elemental | Corpo-a-Corpo)  
    *Ataque Relâmpago* 
    “(Esta habilidade leva um turno para carregar) Antes de cada combate, você pode me sacrificar. Se fizer isso, escolha um entre: 
    • Causar 2 de dano a qualquer alvo de sua escolha.
    • Ganhar +2 de mana máxima somente no próximo turno. 
    • Conceder meus atributos e palavras-chave a um aliado elétrico (a *velocidade* não é somada).”`
},
{
    id: 37, name: "Dilúvio", description: `Dilúvio 
    (Feitiço [Lento]) 
    “Começa a chover forte. No final do próximo turno, todas as unidades morrem afogadas, exceto as que têm *Voo* e as aquáticas não-humanas.”`
},
{
    id: 38, name: "Fim das Sombras", description: `Fim das Sombras 
    3 de mana  
    (Sagrado | Feitiço [Lento]) 
    “Destrua 3 cartas obscuras aleatórias em ambos os campos de batalha.”`
},
{
    id: 39, name: "Dragão Ancião do Trovão", description: `Dragão Ancião do Trovão 
    5 de mana | 7/4
    (Elétrico| Corpo-a-corpo | Dragão |)
    *Voo* 
    #Condicional: “sempre que eu atacar duas vezes, na terceira meu ataque é de longa-distância e causa 10 de dano a um slot ocupado (exceto o do avatar) e 6 de dano aos vizinhos adjacentes (isso tem *paralisante*).”`
},
{
    id: 40, name: "Gigante Elétrico", description: `Gigante Elétrico 
    4 de mana | 8/7
    (Elétrico | Corpo-a-Corpo | Gigante | )  
    #Grito de Guerra: “aplico *paralisia elétrica* em uma carta do oponente à sua escolha e gero (1) de mana adicional somente neste turno.” 
    “Eu só posso ser jogado se um total de 3+ de mana adicional foi gerada em seu favor neste turno.”`
},
{
    id: 41, name: "Afogar", description: `Afogar 
    3 de mana
    (Aquático | Feitiço [Rápido])
    “Escolha uma unidade humana ou não-aquática com até 5 de vida para destrui-la.”`
},
{
    id: 42, name: "Tsunami", description: `Tsunami 
    4 de mana 
    (Aquático | Feitiço [Lento])
            __________________________________
"Como as ondas implacáveis do mar, o Tsunami letre tudo em seu caminho, devolvendo os intrusos ao abraço salgado das águas." 
            __________________________________
“Retorne todas as unidades inimigas para a mão do dono, exceto aquelas que tiverem *voo*.”`
},
{
    id: 43, name: "Invocar a Escuridão", description: `Invocar a Escuridão 
    4 de mana 
    (Obscuro | Feitiço [Rápido]) 
    “A carta obscura aliada mais forte morta nesta partida é ressuscitada.”`
},
{
    id: 44, name: "Últimas Palavras", description: `Últimas Palavras 
    4 de mana 
    (Obscuro | Feitiço [Imediato])
    “Concede o seguinte último suspiro a uma carta: ʽcauso dano ao avatar inimigo igual ao meu ataque.’”`
},
{
    id: 45, name: "Renascimento Sombrio", description: `Renascimento Sombrio 
    3 de mana 
    (Obscuro | Feitiço [Imediato]) 
    “Uma carta obscura aliada à sua escolha é sacrificada para ressuscitar logo em seguida.”`
},
{
    id: 46, name: "Velocidade do Relâmpago", description:`Velocidade do Relâmpago 
    5 de mana
    (Elétrico | Feitiço [Imediato] |) 
    “Conceda +2/+1 e *velocidade (4)* a uma carta aliada.”`
},
{
  id: 47, name: "Armadura Faiscante", description: `Armadura Faiscante 
  2 de mana
  (Elétrico | Feitiço Imediato]) 
  “Conceda +1/+1 e *paralisante* a uma carta aliada.”`
},
{
  id: 48, name: "Campo de Batalha Tempestuoso", description: `Campo de Batalha Tempestuoso 
  Paisagem 
  2 de mana | 4 de Durabilidade
  #Grito de Guerra: “gero (2) de mana de estoque para você.”  
  #Início do Turno: “você ganha 1 de mana adicional. Uma carta aliada aleatória sofre 3 de dano; se for uma não-elétrica, ela recebe o dobro de dano. Eu perco 1 de durabilidade.”`
},
{
  id: 49, name: "Arcanjo Uriel", description: `Arcanjo Uriel  
  3 de mana | 2/5 
  (Sagrado | Corpo-a-corpo | Anjo [Grande Arcanjo] |)  
  *Voo*, *Vínculo Curativo (100%)* 
  #Condicional: “uma vez por turno, a primeira carta aliada ferida que fosse morrer tem sua vida curada o suficiente para sobreviver, se possível.”`
},
{
  id: 50, name: "O Tecnomante", description: `O Tecnomante
  3 de mana |2/5 
  (Humano [Ciborgue]| Circuitron | Longa-distância |)  
  #Grito de Guerra: “você compra todas as cartas no seu deck que custam (10) ou mais; elas custam (1) a menos.”`
},
{
  id: 51, name: "Torrente Azul", description: `Torrente Azul
  6 de mana |5/5 
  (Aquático | Corpo-a-corpo | Humano [mutante])  
  #Condicional-#Fim do Turno: “se o oponente não tiver causado dano de combate ao seu avatar neste turno, todas as cartas dele retornam para a mão.”`
},
{
  id: 52, name: "Lucien", description: `Lucien, O Portador da Luz Sagrada
  4 de mana | 3/5
  (Sagrado | Longa-distância | Humano [monge] |)
  #Condicional: “nas duas primeiras vezes por turno que outra carta aliada curar algo, causo 9 de dano *atravessante* à carta obscura mais forte do oponente, se isso for o suficiente para destrui-la, remova-a do jogo em vez disso; se não houver cartas obscuras, causo 6 de dano *atravessante* à carta mais forte do oponente.”
  #Fim do Turno: “uma carta é curada em 3 de vida e seu avatar, em 2.”`
},
{
  id: 53, name: "Gigante Marinho", description: `Gigante Marinho 
  4 de mana | 8/7 
  (Aquático | Corpo-a-corpo | Gigante |)  
  #Grito de Guerra: “seu avatar ganha 3 de vida.” 
  “Só posso ser jogado se suas cartas tiverem curado um total de 5+ desde o último turno.”`
},
{
  id: 54, name: "Elemental de Água Gigante", description: function() {
   return `Elemental de Água Gigante 
  10 de mana | 0/1
  (Aquático | Corpo-a-corpo | Elemental |)
  “Se suas cartas tiverem curado 8+ de vida, eu custo (5).”#Constante: “eu tenho +1/+1 para cada 2 pontos de vida que suas cartas curaram (arredondado para cima) (${Math.ceil(totalHealed / 2)}).”` 
  }
},
{
  id: 55, name: "Ronan", description: `Ronan 
  3 de mana | 4/3 
  (Ígneo | Corpo-a-corpo | Humano | Dragão [dragonóide]) 
  *Regeneração (50%)* , *Intimidador* , *Transformar*
  #Grito de Guerra: “se houver alguma unidade aliada ferida em jogo, posso ganhar +1/+0 até o fim do turno. 
  #Condicional: “se algum dano reduzir minha vida abaixo da metade, ganho +1/+1 e *queimar (1)* 
  #Transformar: (1 turno para carregar) “se eu tiver sobrevivido a dano neste turno.”`
 
}, 
{
  id: 56, name: "Zarvok", description: `Marechal Zarvok Belthram
  5 de mana | 5/5
  (Ígneo | Corpo-a-corpo | Lagumverrano)
  *Intimidador*
  #Grito de Guera: “todos os inimigos são marcados com *queimadura (1)*, dentre eles, as cartas cujo valor de ataque + vida total for menor ou igual a 9 são marcadas com *frágil* e têm -2/-0 até o final do turno.” 
  #Condicional: “quando eu for atacar uma carta, causo 1 de dano e aplico *queimadura (1)* e *frágil* a ela.”`
},
{
  id: 57, name: "Gigante Flamejante", description: `Gigante Flamejante
  4 de mana | 8/7
  (Ígneo | Corpo-a-Corpo | Gigante | ) 
  #Grito de Guerra: “causo 3 de dano a um alvo de sua escolha.”
  “Eu só posso ser jogado se no final do último turno o oponente tinha menos que 12 de vida.”`
},
{
  id: 58, name: "Piromante Ardente", description: `Piromante Ardente 
  2 de mana | 3/2
  (Ígneo | Longa-distância | Humano [Mago] |)
  *Queimar*
  #Grito de Guerra: “causo 1 de dano a até dois alvos diferentes de sua escolha (não aplica queimadura).”`
},   
{
  id: 59, name: "Avatar do Fogo", description: `Avatar do Fogo
  5 de mana | 5/4
  (Ígneo| Longa-distância | Avatar |)
  *Voo*
  #Grito de Guerra: “causo 3 de dano a uma carta inimiga de sua escolha e às adjacentes a ela.”
  #Condicional: “sempre que outra carta ígnea causar dano, ganho +1/+0 até o final do turno.”`
},   
{
  id: 60, name: "Irina Lança-Chamas", description: `Irina Lança-Chamas 
  4 de mana | 5/4 
  (Ígneo | Longa-distância | Humano [mutante] | )
  #Grito de Guerra: “causo 5 de dano a um alvo de sua escolha, 2 a mim mesma e 1 às cartas adjacentes a mim.”`
},   
{
  id: 61, name: "Esther", description: `Esther
  2 de mana | 2/2
  (Ígneo | Longa-distância | Humano | Dragão [dragonóide] |) 
  #Grito de Guerra e #Início do turno: ”escolha um dos seguintes modos:
  • Modo Chama Agressiva -> eu ganho +1/+0 e *Queimar (2)* até o final da rodada. 
  • Modo Eclipse Estratégico -> eu ganho +0/+1 e *regeneração (100%)* até o final da rodada.”`
},   
{
  id: 62, name: "Brutamontes Chocante", description: `Brutamontes Chocante
  8 de mana | 7/7
  (Elétrico | Corpo-a-corpo| Humano |) 
  *Paralisante*
  #Grito de Guerra: “escolha um slot ocupado até três vezes (o mesmo ou outro). Eu causo 4 de dano *atravessante* ao(s) slot(s) escolhido(s).”`
},    
{
  id: 63, name: "Eletrocaçadora Vesper", description: `Eletrocaçadora Vesper 
  6 de mana | 7/5
  (Elétrico | Longa-distância | Humano |) 
  #Condicional: “a primeira vez por turno que uma carta com velocidade inferior à minha me atacar, eu esquivo o dano (causo o dano de revide normalmente).”`
},    
{
  id: 64, name: "Dragãozinho Flamejante", description: `Dragãozinho Flamejante
  1 de mana | 2/2
  (Ígneo | Corpo-a-corpo | Dragão |) 
  #Grito de Guerra: “causo 1 de dano a qualquer alvo e aplico *queimadura (1)* a ele.”
  #Condicional: “cada segundo ataque meu é de *longa-distância*.”`
},    
{
  id: 65, name: "David-The-Titanslayer", description: `David, The Titanslayer
  4 de mana | 6/3
  (Neutro| Corpo-a-corpo | Humano |) 
  #Grito de Guerra: “destruo até três cartas inimigas com ataque maior ou igual a 8.”`
},
{
  id: 66, name: "Diabrete Sombrio", description: `Diabrete Sombrio
  1 de mana | 2/1
  (Obscuro | Corpo-a-corpo | Lagumverrano [Diabrete] |) 
  #Condicional: “sempre que uma carta aliada destruir outra, você compra uma carta.”`
},
{
  id: 67, name: "Agonox", description: `Agonox, Soberano da Dor
  5 de mana | 4/5
  (Obscuro| Corpo-a-corpo | ?? |) 
  *Intimidador*, *Provocar*
  #Condicional:
  • “Quando eu for atacar, sacrifique uma carta ou cause 3 de dano a mim para destruir até duas cartas inimigas.”
  • “Destrua qualquer carta que me causar dano de combate.”
  #Último Suspiro: ”destrua a carta mais forte do  oponente.”`
},
{
  id: 68, name: "Diabrete Elétrico", description: `Diabrete Elétrico
  1 de mana | 2/1
  (Elétrico | Corpo-a-corpo | Lagumverrano [Diabrete] |) 
  #Grito de Guerra (#Condicional): “se houver uma carta elétrica aliada no campo de batalha, ganho +2 de ‘Velocidade’.”
  #Início do turno: “se sua carta de maior velocidade no campo de batalha tiver velocidade superior à de maior velocidade do oponente, gero (1) de mana adicional somente neste turno.”`
},
{
  id: 69, name: "Oráculo das Marés", description: `Oráculo das Marés
  2 de mana | -/4
  (Aquático| ?? |) 
  *Benevolente*
  #Grito de Guerra: “olhe as três cartas no topo do seu deck. Se você revelar uma delas, adicione-a à sua mão, depois, o deck é embaralhado.”
  #Condicional: “na primeira vez por turno que uma carta aliada curar qualquer coisa,  você compra uma carta.”`
},
{
  id: 70, name: "Thalassor", description: `Thalassor, Rei das Sereias do 3o Mar
  7 de mana | 7/9
  (Aquático | Tritão | Corpo-a-Corpo )
  “Se você tiver pelo menos três outras cartas aquáticas aliadas (sereias e tritões valem por dois), eu custo (4) a menos.”
  #Constante: “as outras cartas aquáticas aliadas têm +1/+2.”`
},
{
  id: 71, name: "Odon, Mestre dsa Armas", description: `Odon, Mestre das Armas
  4 de mana |4/4
  (Neutro | Corpo-a-corpo | Anão |) 
  #Grito de Guerra: “escolha um entre:
  • Conceder +4+/2 a uma carta aliada.
  • Conceder *provocar* e +0/+2 a uma carta aliada.
  • Conceder *esquiva* a uma carta aliada.
”`
},
{
  id: 72, name: "Sengoku", description: `Sengoku Valkai
  7 de mana | 7/7
  (Neutro | Humano | Dragão [Dragão Primordial])
  *Intimidador*, *Regeneração (50%)*
  *Velocidade (3)*
  #Transformar: (1 turno para carregar) “se eu e/ou outro dragão aliado tivermos sobrevivido a um total de 10+ de dano.”`
},
{
    id: 73, name: "Drake Damian", description: `Drake Damian
    3 de mana | 2/2
    (Neutro | Corpo-a-corpo | Humano |) 
    *Velocidade (4)*
    #Constante: “suas cartas de maior velocidade têm *esquiva* permanentemente e golpeiam duas vezes seguidas. Minha *esquiva* não tem restrições e vale para qualquer coisa.”
    “Antes do turno 5, não posso ser jogado na linha de frente.”`
},
{
    id: 74, name: "Emissário da Água da Vida", description: `Emissário da Água da Vida
    3 de mana |3/4
    (Aquático| Longa-distância | ??) 
    #Grito de Guerra: “distribua como quiser até 4 pontos de cura entre cartas aliadas.”`
},

   
];


// arrays de cartas especiais
const giantWaterElementalCard = {
    id: 54,
    name: 'Elemental de Água Gigante',
    effect: function(cardElement) {
        
        // ATAQUE 
        let previousAttack = Number(cardElement.dataset.attack);
        
        let attackBuffs = Number(cardElement.dataset.attackbuff);

        let baseAttack = attackBuffs ? (previousAttack - attackBuffs) : previousAttack;

        //console.log(`attackBuffs antes do buff: ${attackBuffs}`); // Depuração

        cardElement.setAttribute('data-attack', (baseAttack + Math.floor(totalHealed / 2)));
        // se o buff não for um número, considerar 0
        attackBuffs = isNaN(attackBuffs) ? 0 : attackBuffs;
        attackBuffs = Math.floor(totalHealed / 2);
        cardElement.setAttribute('data-attackbuff', attackBuffs);

        //console.log(`attackBuffs depois do buff: ${attackBuffs}`);

        // VIDA
        let previousLife = Number(cardElement.dataset.life);

        let lifeBuffs = Number(cardElement.dataset.lifebuff);

        let baseLife = lifeBuffs ? (previousLife - lifeBuffs) : previousLife;

        cardElement.setAttribute('data-life', (baseLife + Math.floor(totalHealed / 2)));
        // se o buff não for um número, considerar 0
        lifeBuffs = isNaN(lifeBuffs) ? 0 : lifeBuffs;
        lifeBuffs = Math.floor(totalHealed / 2);
        cardElement.setAttribute('data-lifebuff', lifeBuffs);

    // Encontra os elementos relevantes no slot
    let cardContainer = cardElement.closest('.card-container');
    let statsSpan = cardContainer.querySelector('.card-stats2');
    let attackSpan = statsSpan.querySelector('.attack2');
    let lifeSpan = statsSpan.querySelector('.life2');

    attackSpan.textContent = ` ${cardElement.dataset.attack}`;
    lifeSpan.textContent = `${cardElement.dataset.life} `;
    
    // deixar o texto verde se o buff realmente tiver acontecido
    if (attackBuffs && attackBuffs > 0) {
      attackSpan.style.color = 'lightgreen';
      if (lifeBuffs && lifeBuffs > 0) {
        lifeSpan.style.color = 'lightgreen';    
      }  
    }
    // Recriando os ícones
    let lifeIcon = document.createElement('img');
      lifeIcon.src = 'other-images/heart-icon.png';
      lifeIcon.className = 'life-icon';

    let attackIcon = document.createElement('img');
      attackIcon.src = 'other-images/attack-icon.png';
      attackIcon.className = 'attack-icon';
      
     // Insere o ícone de ataque antes do texto de ataque
     attackSpan.insertBefore(attackIcon, attackSpan.firstChild);
    
     // Adiciona o ícone de vida ao final do texto de vida
     lifeSpan.appendChild(lifeIcon);


  },
effect2: function() {
  if (totalHealed >= 8) {
    let waterEllyInDeck = currentDeck.find(c => c.id === 54);
  if (waterEllyInDeck) {
    waterEllyInDeck.currentCost = 5; // reduzir o custo dele (o objeto no array currentDeck)
  } 
  
  //tem que acessar todos os objetos iguais, não só o primeiro, o find só acha o primeiro
  }
},
effect3: function(cardElement) {
  if (cardElement && totalHealed >= 8) {
    cardElement.setAttribute('data-cost', 5)
    updateCheaperCostDisplay(cardElement);
  }
}  
}

const kellCard = {
    id: 30,
    name: "Kell",
    effect: function() {
        let kellInHand = document.querySelector('.card[data-unique-id="30"]');
        if (!kellInHand) {
            console.error("Carta 'Kell' não encontrada na mão.");
            return;
        }

        let cardsInField = getCardsInField();
        
        // Procurar as cartas no campo com a keyword "sagrado"
        let sacredCardsInField = cardsInField.filter(card => {
            let keywords = card.getAttribute('data-keywords');
            if (keywords) {
                let keywordArray = keywords.split(','); // Divide as palavras-chave em um array
                return keywordArray.includes('sagrado'); // Verifica se 'sagrado' está no array de palavras-chave
            }
            return false; // Retorna falso se não houver keywords definidas
        });
        
        let sacredCardsCount = sacredCardsInField.length;
        if (sacredCardsCount > 0 ) {
           // Ajustar o custo de 'Kell' com base no número de cartas sagradas no campo
        let currentCost = Number(kellInHand.getAttribute('data-cost'));
        currentCost -= sacredCardsCount;
        kellInHand.setAttribute('data-cost', currentCost);
        updateCheaperCostDisplay(kellInHand);
        //console.log(`Custo de 'Kell' ajustado para ${currentCost} com base em cartas sagradas no campo.`);
        }
    }
};

const reductibleCostCards = [
  {id: 4, name: 'Fulgurvoltz'},
  {id: 14, name: 'Voltexz'},
  {id: 54, name: 'Elemental de Água Gigante'},
  {id: 30, name: 'Kell'},

]
 
  
  

  
let specialDrawCards = [
  {id: 69, name: 'Oráculo das Marés', effect: function() {
      //console.log('Função do efeito da carta "Oráculo das Marés" chamada.');
      
     lookAndPickTopDeck(3);
      ////console.log(`A carta foi escolhida? ${cardChosen}`);
      
      //se uma carta foi escolhida para comprar, embaralhar o deck
      //if (cardChosen) {
          ///shuffleDeck();
          //alert('O deck foi embaralhado novamente.');
      //}
}
      },
  // restante das cartas de compra especiais
];

let arrayNextTurnEffects = [];

  let lastBreathCards = [
    {
      id: 16, name: "O Revivente Eterno",
      effect: function() {
        alert(`Último suspiro ativado (“Ressucito no turno seguinte.”). Escolha um slot para ressucitá-lo.`)
        // Armazenar a invocação da criatura com ID 16 para o próximo turno
        let nexTurnEffect = () => {
          return summonCreature(16);
        } 
        arrayNextTurnEffects.push(nexTurnEffect);
      },
      activated: false
    },
    {
      id: 17, name: "Replicador Maldito",
      effect: function() {
        alert(`Último suspiro ativado ("Invoco duas cópias minhas sem esta habilidade."). Escolha dois slots, um de cada vez para invocar as cópias.`);
        for (let i = 0; i < 2; i++) {
          summonCreature(17, true);
        }
      },
      activated: false
    },
    {
      id: 18, name: "Fênix das Trevas Profana",
      effect: function(cardElement) {
        alert(`Último suspiro ativado (“Ressucito no turno seguinte com +1/+1.”). Escolha um slot para ressucitá-lo.`)
        const currentAttack = Number(cardElement.getAttribute('data-attack'));
        const currentLife = Number(cardElement.getAttribute('data-life'));
        ////console.log(`currentAttack antes do buff ${currentAttack}`);
        ////console.log(`currentLife antes do buff ${currentLife}`);
        newAttack = currentAttack + 1;
        ////console.log(`NewAttack ${newAttack}`);
        newLife = currentLife + 1;
      
        // ressucitá-la com +1/+1 em relação a quando morreu
        let nextTurnEffect = () => {
          return summonCreature(18, false, newAttack, newLife);
        }
        arrayNextTurnEffects.push(nextTurnEffect);
        
      },
       activated: false 
      },
    
    {
      id: 21, name: "Jeff-The-Death",
      effect: function(cardElement, slot) {
        // Chamando a função para exibir a carta de volta na mão
        let cardUniqueId = Number(cardElement.getAttribute('data-unique-id'));

        let cardCost = Number(cardElement.getAttribute('data-cost'));

        let cardObject = starterDeck.find(c => c.id === cardUniqueId);
          cardObject.currentCost = cardCost;
          cardObject.attack = (Number(cardElement.dataset.attack));
          cardObject.life = Number(cardElement.dataset.life);  

        displayInHand(cardObject);
        
        let cardContainer = cardElement.closest('.card-container');

        // Removendo o card-container
        slot.removeChild(cardContainer);
  
        // Ocultando os botões do slot
        let slotButtons = slot.querySelectorAll('.cardStatsButtons');
        slotButtons.forEach(button => {
          button.style.display = 'none';
        });
  
        // Removendo os stats
        let stats = slot.querySelectorAll('.card-stats');
        stats.forEach(stat => {
          stat.remove();
        });
  
        // Atualizando a contagem da mão
        handCardCount++;
        //updateHandCounter();
      },
      activated: false
    },
    {
      id: 36,
      name: 'Espírito Carregado',
      effect: function() {
        let choice = Number(prompt("Escolha: 1 -> causar 2 de dano a qualquer alvo | 2 -> ganhar +2 de mana somente no próximo turno | 3 -> conceder meus atributos e palavras-chave a um aliado elétrico"));
        if (choice === 2) {
          let nextTurnEffect = () => {
          return addMana(2);
          }
          arrayNextTurnEffects.push(nextTurnEffect);
        }
      },
      activated: false
    }
  ];

  const transformableCreatures = [
    {id: 9, transformed: 9000},
    {id: 9000, transformed: 9},
    {id: 5, transformed: 6},
    {id: 6, transformed: 5},
    {id: 35, transformed: 35000},
    {id: 35000, transformed: 35},
    {id: 55, transformed: 55000},
    {id: 55000, transformed: 55},


  ]

let endTurnCards = [

  { 
      id: 10, name: "Rusco",
        effect: function() {
          let ruscoInTheDeck = false;
          let ruscoInTheDeckIndex = currentDeck.findIndex(card => card.id === 10);
          //console.log(`ruscoInTheDeckIndex (${ruscoInTheDeckIndex})`);

            cardsPlayed.forEach(card => {
                //console.log(`Verificando carta: ${JSON.stringify(card)}`); // Log para depuração
                
                // Converte os valores de custo, ataque e defesa para números
                let cardCost = parseInt(card.cost, 10);
                let cardAttack = parseInt(card.attack, 10);
                let cardLife = parseInt(card.life, 10);
                
                //console.log('Custo, ataque e defesa encontrados: ' + cardCost, typeof cardCost, cardAttack, typeof cardAttack, cardLife, typeof cardLife);

                // Verifica se o card tem custo, ataque ou defesa igual a 2 e se foi jogado no turno atual
                if (
                    (cardCost === 2 || cardAttack === 2 || cardLife === 2) &&
                    card.turnPlayed === currentTurnIndex
                ) { 

                    // Se Rusco não estiver mais no deck, encerrar a função
                    if (!ruscoInTheDeckIndex || ruscoInTheDeckIndex <= 0) {
                      //console.log('Rusco não está no deck.');
                      ruscoInTheDeck = false;
                      return;
                    } else {
                      alert(`Rusco -> #Condicional-#Fim do Turno: “se você jogou uma carta de custo, ataque ou vida igual a 2 neste turno e eu estiver no seu deck no fim do turno, invoque-me no seu campo de batalha.”`)
                      ruscoInTheDeck = true;
                      
                    }

                }

            });

            if (ruscoInTheDeck) {
               // Move Rusco pro campo
            summonCreature(10);
            //remover Rusco do deck
            currentDeck.splice(ruscoInTheDeckIndex, 1);
            updateDeckCounter();
            showDeckSidebar();
            }
        }
  },
  {   id: 4, name: "Fulgurvoltz",
      effect: function() {
         // Reduz o custo da carta em (1) para cada mana não gasta ao longo do jogo ao encerrar os turnos
         //console.log("Executando a função de redução de custo de 'Fulgurvoltz'.");
         let FulgurvoltzInTheDeck = currentDeck.find(c => c.id === 4) // eu sei que a id de Fulgurvoltz no array gobal com tds cartas do jogo é 4, então em currentDeck também é, porque é assim que está configurado
         let FulgurvoltzInHand = document.querySelector('.card[data-unique-id="4"]');
         console.log(`unspentMana ${unspentMana}`);

         let fulgurvoltzBaseCardObject = cards.find(c => c.id === 4);
            let baseCost = fulgurvoltzBaseCardObject.baseCost;
            console.log(`baseCost ${baseCost}`);

         //reduzir currentCost em currentDeck faz sentido se a carta estiver em currentDeck, mas e quando não estiver? E se ele estiver na mão ?
          if (FulgurvoltzInTheDeck) {
            if (unspentMana > 0) {
             currentCost = (baseCost - unspentMana);
             currentCost = Math.max(currentCost, 4); // Garante que não custe menos que 4
             FulgurvoltzInTheDeck.currentCost = currentCost;
            }
          } else if (FulgurvoltzInHand) { // se ele estiver na mão, é um elemento HTML
            let currentCost = Number(FulgurvoltzInHand.getAttribute('data-cost'));
            //console.log(`Valor de currentCost inicialmente ${currentCost}`);
            if (unspentMana > 0) {
              currentCost = (baseCost - unspentMana)
              currentCost = Math.max(currentCost, 4) // garante que ele não custe mais que 4
              FulgurvoltzInHand.setAttribute('data-cost', currentCost);
              //console.log(`Mana não gasta ${unspentMana}`);
              //console.log(`Valor de currentCost depois da redução ${currentCost}`);
              updateCheaperCostDisplay(FulgurvoltzInHand);
             }
          } else {
            console.error('Fulgurvoltz não encontrado no deck atual e nem na mão.');
          }
    }

  },
{
    id: 14, name: "Voltexz",
    effect: function() {
      // Reduz o custo da carta em (2) para cada mana não gasta ao longo do jogo ao encerrar os turnos
      //console.log("Executando a função de redução de custo de 'Voltexz'.");
      let VoltexzInTheDeck = currentDeck.find(c => c.id === 14) // eu sei que a id de Voltexz no array gobal com tds cartas do jogo é 14, então em currentDeck também é, porque é assim que está configurado
      let VoltexzInHand = document.querySelector('.card[data-unique-id="14"]');

      let voltexzBaseCardObject = cards.find(c => c.id === 14);
            let baseCost = voltexzBaseCardObject.baseCost;
            console.log(`baseCost ${baseCost}`);

      //reduzir currentCost em currentDeck faz sentido se a carta estiver em currentDeck, mas e quando não estiver? E se ele estiver na mão ?
       if (VoltexzInTheDeck) {
         let currentCost = Number(VoltexzInTheDeck.currentCost);
         if (unspentMana > 0) {
          currentCost = (baseCost - (2 * unspentMana)); 
          currentCost = Math.max(currentCost, 2) // garante que ele não custe mais que 2
          VoltexzInTheDeck.currentCost = currentCost;
         }
       } else if (VoltexzInHand) { // se ele estiver na mão, é um elemento HTML
         let currentCost = Number(VoltexzInHand.getAttribute('data-cost'));
         //console.log(`Valor de currentCost inicialmente ${currentCost}`);
         if (unspentMana > 0) {
           currentCost = (baseCost - (2 * unspentMana)); 
           currentCost = Math.max(currentCost, 2) // garante que ele não custe mais que 2
           VoltexzInHand.setAttribute('data-cost', currentCost);
           //console.log(`Mana não gasta ${unspentMana}`);
           //console.log(`Valor de currentCost depois da redução ${currentCost}`);
           updateCheaperCostDisplay(VoltexzInHand);
          }
       } else {
         console.error('Voltexz não encontrado no deck atual e nem na mão.');
       }
    
    }
},
{
  id: 27, name: 'Sta. Helena Maria da Cura',
  effect: function() {
    let cardsInField = getCardsInField();
    let staHelenaInField = cardsInField.some(c => c.id === 27) 
    if (staHelenaInField) {
      let slotNumber = Number(prompt("Digite o slot da carta que deseja curar."));
      healUnit(slotNumber, 1, fullHeal = true);
    }
    
  }
}
   
];

let startOfTheTurnCards = [
  {
    id: 26,
    name: 'Eletroad',
    effect: function() {
      (playerMatchPoints <= opponentMatchPoints) ? addMana(1) : ''
    }
  },
  {
    id: 35,
    name: 'Alexa',
    effect: function() {
        console.log('Executando efeito para a carta Alexa (id 35)');
        let choice = Number(prompt("Escolha o avatar ou uma carta aliada para curar 2 pontos (Digitar 4 para o avatar ou um número de 1 a 7 para uma carta, o número do slot correspondente.)"));
        //console.log('Escolha do usuário:', choice);

      if (choice === 4) {
       increasePlayerLife(2);       
      } else {
        let slotNumber = choice;
        healUnit(slotNumber);
      }
      
     
      

    }

  },
  {
    id: 68,
    name: 'Diabrete Elétrico',
    effect: function() {
      let speed = Number(prompt("Qual a velocidade da carta de maior velocidade do oponente?"));
      (speed < 2) ? addMana(1) : '';
    }
  }


]



let graveyardInteractionsCards = [
  {
    id: 1,
    name: "A Vagante Sombria",
    effect: function() {
      const cardElements = document.querySelectorAll('.card[data-unique-id="1"]');
      cardElements.forEach(cardElement => {
        let cardCost = Number(cardElement.dataset.cost);
        let cheaperCost = cardCost - Math.floor(graveyard.length / 2);
        cardElement.setAttribute('data-cost', cheaperCost);
        updateCheaperCostDisplay(cardElement);
      });
    }
  },
            {
                id: 22,
                name: "Cientista da Morte",
                effect: function() {
                    // Adicionar a animação à todas cartas que são Cientistas
                    const cardElements = document.querySelectorAll('.card[data-unique-id="22"]');
                    if (cardElements) {
                        cardElements.forEach(cardElement => {
                            cardElement.classList.remove('scientistOfDeathEffect');
                            void cardElement.offsetWidth;
                            cardElement.classList.add('scientistOfDeathEffect');
                        }); 
                    }
                    summonCreature(22000);
                },
                trigger: 'graveyardIncrease',
            },
            { 
                id: 21,
                name: 'Jeff-The-Death',
                effect: function() {
                  //console.log('Função de buf de Jeff chamada.')
                    let allJeffCards = document.querySelectorAll('.card[data-unique-id="21"]');
                    if (allJeffCards) {
                        allJeffCards.forEach(jeffCardElement => {
                            attackValue = Number(jeffCardElement.dataset.attack) + 2;
                            jeffCardElement.setAttribute('data-attack', attackValue);
                            lifeValue = Number(jeffCardElement.dataset.life) + 2;
                            jeffCardElement.setAttribute('data-life', lifeValue);
                            
                            let jeffCardContainer = jeffCardElement.closest('.card-container');
                            
                            let statsSpan = jeffCardContainer.querySelector('.card-stats2');
                            
                            if (!statsSpan) {
                                console.error('Elemento span com a classe "card-stats2" não encontrado ou não é filho do elemento que a letiável jeffCardContainer está armazenando como valor.');
                            }
                            
                            let attackSpan = statsSpan.querySelector('.attack2');
                            let lifeSpan = statsSpan.querySelector('.life2');

                            attackSpan.textContent = ` ${jeffCardElement.dataset.attack}`;
                            lifeSpan.textContent = `${jeffCardElement.dataset.life} `;
                            
                            attackSpan.style.color = 'lightgreen';
                            lifeSpan.style.color = 'lightgreen';

                            let lifeIcon = document.createElement('img');
                            lifeIcon.src = 'other-images/heart-icon.png';
                            lifeIcon.className = 'life-icon';

                            let attackIcon = document.createElement('img');
                            attackIcon.src = 'other-images/attack-icon.png';
                            attackIcon.className = 'attack-icon';
                            
                            attackSpan.insertBefore(attackIcon, attackSpan.firstChild);
                            lifeSpan.appendChild(lifeIcon);
                        })
                    }         
                },
                trigger: 'graveyardIncrease',
            },
            {
              id: 66,
              name: "Diabrete Sombrio",
              effect: function() {
                  // Adicionar a animação à todas cartas que são Diabretes Sombrios
                  const cardElements = document.querySelectorAll('.card[data-unique-id="66"]');
                  if (cardElements) {
                      cardElements.forEach(cardElement => {
                          let cardContainer = cardElement.closest('.card-container');
                          if (cardContainer.classList.contains('diabreteSombrioEffect')) {
                            cardContainer.classList.remove('diabreteSombrioEffect');
                          }
                          void cardContainer.offsetWidth;
                         cardContainer.classList.add('diabreteSombrioEffect');
                      }); 
                 }
                  drawCard(1);
              },
              trigger: 'graveyardIncrease',
          },
        ];
    

const playEffectsCards = [ 
{
  id: 2,
  name: 'Elemental do Fogo',
  //target: 'self',
  playEffect: function() {
    for (let i = 1; i <= 2; i++) {
      summonCreature(3);
    }
  }

},
{
  id: 10,
  name: 'Rusco',
  //target: 'self',
  playEffect: function(playedCard) {
    let cardContainer = playedCard.closest('.card-container');
    let shield = document.createElement('img');
      shield.src = 'other-images/shield.png';
      shield.className = 'shield';
      shield.style.width = '100%';
    cardContainer.classList.add('shielded-card');
      cardContainer.appendChild(shield, cardContainer.firstChild);
  }

},
{
  id: 12,
  name: 'Thorwells',
  //target: 'self',
  playEffect: function() {
    let number = Number(prompt("Quantas cartas do oponente estão paralisadas agora?"));
    let nextTurnEffect = () => {
      return addMana(number);
    }
    arrayNextTurnEffects.push(nextTurnEffect);
  }
},
{
  id: 14, name: 'Voltexz',
  //target: 'self',
  playEffect: function() {
    let extraManaSpent = Number(prompt("Você pode gastar até 4 de mana adicional, para cada mana gasta dessa forma, aprimore meu grito de guerra (Máx. 7 de dano e +5/+5 para as suas outras cartas)."));
    spendMana(extraManaSpent);
  }
},
{
  id: 26, 
  name: 'Eletroad',
  //target: 'self',
  playEffect: function() {
    (playerMatchPoints <= opponentMatchPoints) ? addMana(1) : ''
  }
},
{
  id: 29,
  name: "D'Lorafya",
  //target: 'opponent',
  playEffect: function() {
    toDamageAnEnemy([1,2,3,4,5,6,7], 5);
}
},
{
  id: 31,
  name: 'Neraqa',
  //target: 'self',
  playEffect: function() {
    let choice = Number(prompt(`Escolha um:
      1.uma carta de sua escolha fica silenciada; se for do oponente, ela também retorna à mão dele custando (1) a mais.
      2.uma carta aliada à sua escolha ganha *proteção divina* até o fim do turno. 
      3.uma carta aliada à sua escolha é curada em 4 de vida.
      `));
    if (choice === 3) {
      let slotNumber = Number(prompt("Escolha um slot ocupado para curar 4 de vida."));
      healUnit(slotNumber, 4);
    }  
  }
},

{
  id: 35,
  name: "Alexa",
  //target: 'self',
  playEffect: function() {
    //console.log("Nada.");
  }
},

{
    id: 50,
    name: "O Tecnomante",
    //target: 'self',
    playEffect: function() {
        const tenOrAboveCostCards = currentDeck.filter(c => c.baseCost >= 10);

        // Remover essas cartas de currentDeck
        currentDeck = currentDeck.filter(c => c.baseCost < 10);

        // Reduzir os custos em 1 para todas as cartas com cost >= 10
        tenOrAboveCostCards.forEach(c => {
            c.cost = c.cost - 1;
        });

        // Chamar as compras de carta
        drawSpecificCards(tenOrAboveCostCards);

        return currentDeck; // retornar o deck atualizado
    }
},
{
  id: 74,
  name: "Emissário da Água da Vida",
  //target: 'self',
  playEffect: function() {
    let amount;
    for (let i = 0; i < 4; i += amount) {
    let slotNumber = Number(prompt("Escolha um slot ocupado para curar."));
    amount = Number(prompt(`Escolha uma quantidade para curar (Faltam ${4 - i})`));
    healUnit(slotNumber, amount);
    }
  }
}


]

let restrictedCardsToPlay = [
  {
    id: 40, name: "Gigante Elétrico",
    restriction: function() {
      //console.log(`Função de restrição de 'Gigante Elétrico' chamada.`)
      //console.log(`mana gerada neste turno: ${manaGeneratedThisTurn}, mana normal do turno: ${manaNormalDoTurno} `);
      let manaNormalDoTurno = currentTurnIndex;
      if (manaGeneratedThisTurn >= (manaNormalDoTurno + 3)) {
      return false;
      } else {
        return true;
      }
    }
  },
  {
    id: 53, name: "Gigante Marinho",
    restriction: function() {

      let relevantTurns = [currentTurnIndex, currentTurnIndex - 1];

      let relevantHeals = healPerTurn.filter(heal =>  relevantTurns.includes(heal.turn));

      let totalRelevantHeal = 0;
      for (let i= 0; i < relevantHeals.length; i++) {
        totalRelevantHeal += relevantHeals[i].amountHealed;
      }
      return totalRelevantHeal < 5;
    }
  },
  {
    id: 73, name: "Drake",
    restriction: function() {
      let slotNumber = prompt("Escolha o slot (de 1 a 6) em que deseja jogar a carta.");
    }
  }

  

];

//-------------------------------------------------//


//function test() {
  //let cardData = {
   // id: 19,
    //name: "Titânico Morcegalma",
    //cost: "4",
    //image: null,
    //attack: "5",
    //life: "3",
    //slot: 1
  //}
  //addCardToOpponentField(cardData);
//}

//test();


//----------------------------------------------------------//

//WebSocket
let ws;

  ws = new WebSocket("ws://192.168.0.12:8081");
  
  ws.onopen = () => {
  console.log('Conectado ao servidor WebSocket');
};

  ws.onmessage = (event) => {
    // Verifica o tipo da mensagem e chama a função apropriada
    try {
      const message = JSON.parse(event.data);
      console.log("Mensagem recebida do cliente...");
      
      switch (message.type) {
      case 'cardAdded':
          // Se for do tipo 'cardAdded', adiciona a carta ao campo de batalha do oponente
          addCardToOpponentField(message);
          break;
      case 'attack':
          // Se for do tipo 'attack', processa o ataque
          console.log("case 'attack'");
          attackHandler(message);
          break;
      case 'directDamage':
        // Se for do tipo 'directDamage', processar os danos
          console.log("case 'directDamage'");
          let parsedMessage = JSON.parse(JSON.stringify(message));
          toDamageAnAlly(parsedMessage.target, parsedMessage.damage);
          break;    
      default:
          console.error('Tipo de mensagem desconhecido:', message.type);
          break;
  }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
  }
};

ws.onerror = (error) => {
  console.error('Erro na conexão WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexão com o servidor WebSocket fechada');
};
    



//-------------------------------------------------//

// Função para enviar mensagens ao servidor WebSocket
function sendMessageToServer(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    console.log(`Mensagem do cliente enviada ${message}`)
  } else {
    console.error('Erro ao enviar mensagem: WebSocket não está aberto.');
  }
}


// VIDA DO JOGADOR //
function increasePlayerLife(quantity = 1) {
    //let quantity = parseInt(prompt("Insira a quantidade de vida que quer aumentar"));
    if (isNaN(quantity) || quantity <= 0) {
        alert("Por favor, insira um número válido maior que zero.");
        return;
    }

    let healthIncreaseSound = soundEffects.find(s => s.name === 'healthIncreaseSound');
      healthIncreaseSound.play = function() {
      let audio = new Audio(healthIncreaseSound.soundFile);
        audio.play();
    }
    healthIncreaseSound.play();
    
    // animação de brilho
    let iconeAvatar = document.getElementById('iconeAvatar');
      //console.log(iconeAvatar);
    //if (iconeAvatar.classList.contains('healingUnit')) {
      //iconeAvatar.classList.remove('healingUnit')
   // }
   iconeAvatar.classList.add('healingUnit');

   let avatarSlot = document.querySelector('.avatarSlot');
   let displayIncreaseText = document.createTextNode(`+${quantity}`);
   let displayIncrease = document.createElement('p');
    displayIncrease.appendChild(displayIncreaseText);
    displayIncrease.style.fontSize = '40px'
    displayIncrease.style.fontWeight = 'bold';
    displayIncrease.style.color = 'green';
    displayIncrease.style.position = 'absolute';
    displayIncrease.style.top = '45px';
    avatarSlot.appendChild(displayIncrease);
   setTimeout( () => {
    displayIncrease.remove()
    }, 1500 ) // remove depois de 1 segundo e meio
    

    let PlayerLifeCounter = document.getElementById('lifeCounter');

    let previousLife = currentPlayerLife;
    let newLife = currentPlayerLife + quantity;
    PlayerLifeCounter.textContent = newLife;
    if (newLife >= 25) {
      healthZone = 'extra';
      PlayerLifeCounter.style.color = 'lightgreen';
    } else if (newLife >= 20) {
      healthZone = 'safe';
      PlayerLifeCounter.style.color = 'darkgreen';
    } else if (newLife >= 15) {
      healthZone = 'alarming';
      PlayerLifeCounter.style.color = 'yellow';
    } else if (newLife >= 7) {
      healthZone = 'risky';
      PlayerLifeCounter.style.color = 'darkred';
    } else if (newLife >= 1) {
        healthZone = 'critical';
        PlayerLifeCounter.style.color = 'lightred';
    }
    currentPlayerLife = newLife;
    console.log(healthZone);

    //INCREMENTAR A VARIÁVEL DE VIDA TOTAL CURADA
    totalHealed += quantity;
    //console.log("Total de vida curada do seu avatar ao longo desta partida: " + totalHealed);
    healPerTurn.push({amountHealed: quantity, turn: currentTurnIndex});

    // Verifica se há cartas específicas na mão e aplica efeitos
    let cardContainers = document.querySelectorAll('.card-container');
    cardContainers.forEach(cardContainer => {
      let giantWaterEllyElement = cardContainer.querySelector('.card[data-unique-id="54"]');
        if (giantWaterEllyElement) {
            giantWaterElementalCard.effect(giantWaterEllyElement);
        }
    });

    // efeito de redução de custo do elemental de água gigante 
      // verificando o elemental gigante no deck
      let waterElementalsInDeck = currentDeck.some(c => c.id === 54);
      if (waterElementalsInDeck) {
        giantWaterElementalCard.effect2();       
      }

      
      let cardContainersInHand = document.getElementById('hand').querySelectorAll('.card-container');
      cardContainersInHand.forEach(cardContainerInHand => {
        let waterElementalsInHand = cardContainerInHand.querySelector('.card[data-unique-id="54"]');
        //console.log('waterElementalsInHand' , waterElementalsInHand);
        giantWaterElementalCard.effect3(waterElementalsInHand);
      })


}


function decreasePlayerLife() {
    let quantity = parseInt(prompt("Digite o dano sofrido por seu avatar (quantidade de vida a ser diminuída)."));
    if (isNaN(quantity) || quantity <= 0) {
        alert("Por favor, insira um número válido maior que zero.");
        return;
    }
    let hitSound = soundEffects.find(s => s.name === 'hitSound');
      hitSound.src = hitSound.soundFile
      hitSound.play = function() {
        let audio = new Audio(hitSound.src);
          audio.play();
      };
      hitSound.play();

    let iconeAvatar = document.getElementById('iconeAvatar');
      //if (iconeAvatar.classList.contains('damageUnit')) {
        //iconeAvatar.classList.remove('damageUnit');
      //}  
      // Forçando a execução da animação removendo e adicionando a classe
      void iconeAvatar.offsetWidth; // Força um reflow
      iconeAvatar.classList.add('damageUnit');

    let PlayerLifeCounter = document.getElementById('lifeCounter');

    let previousLife = currentPlayerLife;
    let newLife = currentPlayerLife - quantity;
    if (newLife < 0) newLife = 0;
    PlayerLifeCounter.textContent = newLife;

    switch(true) {
      case (newLife >= 25):
        healthZone = 'extra';
        PlayerLifeCounter.style.color = 'lightgreen';
        break;
      case (newLife >= 20):
        healthZone = 'safe';
        PlayerLifeCounter.style.color = 'darkgreen';
        break;
      case (newLife >= 25):
        healthZone = 'extra';
        PlayerLifeCounter.style.color = 'lightgreen';
        break;
      case (newLife >= 15):
        healthZone = 'alarming';
        PlayerLifeCounter.style.color = 'orange'; 
        break;
      case (newLife >= 7):
        healthZone = 'risky';
        PlayerLifeCounter.style.color = 'darkred'; 
        break;
      case (newLife >= 1):
        healthZone = 'critical';
        PlayerLifeCounter.style.color = 'red'; 
    }

    currentPlayerLife = newLife;
    console.log(healthZone);
    

    if (newLife <= 0) {
        gameOver('opponent');
    }
}

  // COMPRA DE CARTAS //

  function shuffleDeck() {
    for (let i = currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    let shuffleCardsSound = soundEffects.find( s => s.name === 'shufflingSound');
    shuffleCardsSound.src = shuffleCardsSound.soundFile;
    shuffleCardsSound.play = function() {
      let audio = new Audio(shuffleCardsSound.src);
        audio.play();
    }
      shuffleCardsSound.play();
    //console.log("Deck embaralhado:", currentDeck);
}

function lookAndPickTopDeck(numCardsToLook = 0) {
  // Verifica se o número de cartas para olhar é igual a zero

  let cardChosen = false;

  if (numCardsToLook === 0) {
    // Se for, solicita ao usuário a quantidade de cartas para olhar
    numCardsToLook = prompt("Quantas cartas do topo do deck você deseja olhar?");
    if (numCardsToLook <= 0 || isNaN (numCardsToLook)) {
      console.error('Número inválido de cartas para olhar.');
      return;
    }
  } 
    // Cria um array com as cartas do topo do deck
    let topCards = currentDeck.slice(0, numCardsToLook);

    // Cria e configura o modal
    let modal = document.createElement('div');
    modal.classList.add('modal');

    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    let modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Escolha uma carta do topo do deck:';
    modalContent.appendChild(modalTitle);

    // Adiciona botões para cada carta do topo
    topCards.forEach(function(card) {
      let cardButton = document.createElement('button');
      cardButton.textContent = card.name;
      cardButton.classList.add('card-button');

      let cardImage = document.createElement('img');
      cardImage.src = card.image;
      cardImage.alt = `Carta ${card.id}`;
      cardButton.appendChild(cardImage);

      // Adiciona evento de clique para a seleção da carta
      cardButton.addEventListener('click', function() {
        moveToTopAndDraw(card);
        cardChosen = true;
        closeModal();
        return (cardChosen);
      });

      modalContent.appendChild(cardButton);
    });

    // Adiciona botão de pular
    let skipButton = document.createElement('button');
    skipButton.textContent = 'Pular';
    skipButton.classList.add('skip-button');

    // Adiciona evento de clique para pular
    skipButton.addEventListener('click', function() {
      closeModal();
      return (cardChosen);
    });

    modalContent.appendChild(skipButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return cardChosen
  }

  
    // Função para fechar o modal
    function closeModal() {
        let modal = document.body.querySelector('.modal');
        //console.log(`modal.parentNode ${modal.parentNode}`);
        document.body.removeChild(modal);
    }


  // Função para selecionar a carta e movê-la para o topo do deck
  function moveToTopAndDraw(selectedCard) {
    // Remove a carta selecionada do deck atual
    let index = currentDeck.indexOf(selectedCard);
    if (index !== -1) {
        currentDeck.splice(index, 1);
    }

    // Coloca a carta selecionada no topo do deck
    currentDeck.unshift(selectedCard);

    // Informa ao jogador que a carta foi escolhida e está no topo do deck
    alert(`Você escolheu a carta ${selectedCard.name}. Ela está agora no topo do deck. Você irá comprá-la agora.`);
    //console.log("Carta escolhida e retornada ao topo do deck:", selectedCard);
    // Chamando a função para comprar a carta escolhida
    drawCard();
  }

function drawCard(cardsAmount = 1) {
  if (currentDeck.length === 0) {
    console.error('O deck está vazio.');
    alert('O deck está vazio.');
    return;
  }
  if (handCardCount < 9) {
    for (let i = 0; i < cardsAmount; i++) {
      if (currentDeck.length === 0) {
        console.error('O deck está vazio.');
        alert('O deck está vazio.');
        break; // Sai do loop se o deck estiver vazio
      }
        let card = currentDeck[0];
        displayInHand(card);

        let cardDrawSound = soundEffects.find(s => s.name === 'cardDrawSound');
          cardDrawSound.src = cardDrawSound.soundFile;
          cardDrawSound.play = function() {
            let audio = new Audio(cardDrawSound.src);
              audio.play();
          }  
          cardDrawSound.play();

        currentDeck.shift(); // Remove o primeiro elemento do array
        handCardCount++;
        ////updateHandCounter();
        //updateDeckCounter();
        //showDeckSidebar();
    } 
    } else {
      alert('Sua mão já está cheia.');
      return;
    }
    //console.log("array currentDeck:", JSON.stringify(currentDeck));
} 



  function drawSpecificCards(deck) {
    while (deck.length > 0) {
      // Compra a próxima carta do topo do deck
      let card = deck.shift(); // Remove o primeiro elemento do array
      displayInHand(card);
      //console.log("Carta comprada:", card);
      //console.log("../Cartas atualmente no deck: ", deck);
      handCardCount++;
      ////updateHandCounter();
      //updateDeckCounter();
      //showDeckSidebar();
      //console.log("../Cartas atualmente na mão: " + handCardCount);
  }
  if (deck.length === 0) {
      //console.log("Não há mais cartas no deck especificado.");
  }
  //console.log("array currentDeck:", JSON.stringify(currentDeck));
}

//-------------------------------------------------------------------------------//

    // MANA RELATED // 
    let mana = 0;
    let initialMana = 1;
    let unspentMana = 0;
    let manaGeneratedThisTurn = 0;
    
    //chamando addMana para a mana inicial
    addMana(initialMana);

    function updateManaDisplay() {
        const manaIcons = document.getElementById('manaIcons');
        manaIcons.innerHTML = '';
        for (let i = 0; i < mana; i++) {
            const img = document.createElement('img');
            img.src = 'other-images/icone-mana.png';
            img.style.width = '15%';
            img.style.height = 'auto';
            img.style.margin = '2px';
            manaIcons.appendChild(img);
        }
        const manaCounter = document.getElementById('manaCounter');
        manaCounter.innerHTML = "Mana (" + mana + "):";
    }
    
    function addMana(amount) {
      if (mana === 10) {
        alert('Máximo de Mana atingido');
        //console.log('Máximo de Mana atingido');
        return;
    }
        mana += amount;
        manaGeneratedThisTurn += amount;
        updateManaDisplay();
        //console.log("Mana Disponível: " + mana);
    }
    
    function spendMana(amount) {
        //console.log("Mana disponível: " + mana);
        
        if (mana >= amount) {
            mana -= amount;
            //console.log("Mana suficiente disponível. Novo total de mana: " + mana);
        } else {
            //console.log("Não há mana suficiente. Mana disponível: " + mana);
            alert('Não há mana suficiente.');
            return;
        }
        
        updateManaDisplay();
    }
    
    function clearMana() {
        mana = 0;
        updateManaDisplay();
    }



    //--------------------------------------------------------------// 


    //--------------------------------------------------------//

    // EXIBIÇÃO DE CARTAS  //
    
    function findCardById(cardUniqueId) {
        let card = cards.find(c => c.id === parseInt(cardUniqueId));
        //console.log('findCardById:', cardUniqueId, '->', card);
        return card;
    }
    
    // Definindo a função clickHandler globalmente
      let clickHandler = function(event) {
      clickedCard = this;
      showContextMenu2(event);
    }
  
  
    // Função de exibir as cartas na mão
    function displayInHand(cardObject) {
  
      let cardUniqueId = cardObject.id;
  
      if (!cardObject) {
        cardObject = findCardById(cardUniqueId);
        if (!cardObject) {
          console.error('Card not found with this ID: ', cardUniqueId);
          return;
        }
      }
  
      let baseCard = cards.find(c => c.id === cardUniqueId);
      let baseCardCost = baseCard.baseCost;
      //console.log(`baseCardCost: ${baseCardCost}`);
      let baseCardAttack = baseCard.baseAttack;
      //console.log(`baseCardAttack: ${baseCardAttack}`);
      let baseCardLife = baseCard.baseLife;
      //console.log(`baseCardLife: ${baseCardLife}`);
  
      
  
      let kellInHand = document.querySelector('.card[data-unique-id="30"]');
      if (kellInHand) {
        kellCard.effect(); // Verifica o efeito imediatamente ao entrar na mão
      }
      
      let handElement = document.getElementById('hand');
  
     
  
      //console.log('card.id:', cardObject.id);
      
      // Cria o contêiner para a carta, seu custo e etc
      let cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        cardContainer.style.width = '11%';
        cardContainer.style.position = 'relative';
  
      handElement.style.display = 'flex';
      handElement.style.padding = '15px';
      handElement.style.marginBottom = '15px';
      
      //console.log(`card.baseCost = ${cardObject.baseCost}`);
      
      let cardElement = document.createElement('img');
      cardElement.classList.add('card');
      cardElement.src = cardObject.image;
      cardElement.alt = cardObject.name;
      cardElement.setAttribute('data-unique-id', cardObject.id);
      cardElement.setAttribute('data-image', cardElement.src);
      //console.log('is Card In Deck?', cardObject);
  
      cardElement.setAttribute('data-cost', cardObject.baseCost);
      cardElement.setAttribute('data-attack', cardObject.attack);
      cardElement.setAttribute('data-life', cardObject.life);
      cardElement.setAttribute('data-keywords', cardObject.keywords);

      cardElement.style.width = '100%';
  
      let attributeNames = cardElement.getAttributeNames();
      //console.log("Atributos da carta na mão:");
      attributeNames.forEach(function(attrName) {
          let attrValue = cardElement.getAttribute(attrName);
          //console.log(`${attrName}: ${attrValue}`);
      });
  
      clickHandler = function(event) {
        clickedCard = this;
        showContextMenu2(event);
      }
      
      // mostrar o menu de contexto para jogar a carta
      cardElement.addEventListener('click', clickHandler);
  
  
    let cardCostDisplay = document.createElement('div');
      cardCostDisplay.classList.add('card-cost-display');
      cardCostDisplay.textContent = cardObject.currentCost;
      if (cardObject.currentCost < baseCardCost) {
        cardCostDisplay.style.color = 'lightgreen';
      }
    cardContainer.appendChild(cardCostDisplay);
  
  // criando o display dos stats
  let statsElement = document.createElement('div');
    statsElement.classList.add('card-stats2');
  
  let attackIcon = document.createElement('img');
    attackIcon.src = 'other-images/attack-icon.png';
    attackIcon.className = 'attack-icon';
    
  let lifeIcon = document.createElement('img');
    lifeIcon.src = 'other-images/heart-icon.png';
    lifeIcon.className = 'life-icon';
  
  let attackSpan = document.createElement('span');
    attackSpan.classList.add('attack2');
    attackSpan.appendChild(attackIcon);
    attackSpan.innerHTML += ` ${cardElement.dataset.attack}`;
    attackSpan.style.color = (cardElement.dataset.attack) > (baseCardAttack) ? 'lightgreen' : 'white';
  
  let lifeSpan = document.createElement('span');
    lifeSpan.classList.add('life2');
    lifeSpan.innerHTML = `${cardElement.dataset.life} `;
    lifeSpan.style.color = (cardElement.dataset.life) > (baseCardLife) ? 'lightgreen' : 'white';
    lifeSpan.appendChild(lifeIcon);
  
  statsElement.style.display = 'flex'; 
      statsElement.style.justifyContent = 'center'; 
      statsElement.style.alignItems = 'center'; 
      statsElement.style.fontSize = '20px';
      statsElement.style.color = 'white';
  // colocando ataque, vida e a barra dentro do display de stats
  statsElement.appendChild(attackSpan);
  statsElement.appendChild(lifeSpan);
  
      
    // colocando o display de stats dentro do container da carta  
    cardContainer.appendChild(statsElement);  
  
  
    // colocando a carta dentro do container e o container dentro da mão
    cardContainer.appendChild(cardElement);
    handElement.appendChild(cardContainer);
    
    // se for uma carta do array de cartas que podem reduzir seu próprio custo...
    if (reductibleCostCards.some(c => c.id === Number(cardUniqueId))) {
      updateCheaperCostDisplay(cardElement);
    }
  
      // Adiciona eventos para hover
      cardElement.addEventListener('mouseover', function(event) {
          showHoverDescription(event, cardElement, cardObject.id);
      });//pra dispositivos móveis
      cardElement.addEventListener('touchstart', function(event) {
        showHoverDescription(event, cardElement, cardObject.id);
      });
  
      // Chama a função para posicionar as cartas
      //positionCards();
  }
  
  //---------------------------------------------------------------------
  
  function showHoverDescription(event, cardElement, cardUniqueId) {
    // Criação do container para a imagem e descrição
    
    let hoverContainer = document.createElement('div'); 
    hoverContainer.style.display = 'flex';
    hoverContainer.style.flexDirection = 'column';
    hoverContainer.style.backgroundColor = 'black';
    hoverContainer.style.border = 'solid white 2px';
    hoverContainer.style.justifyContent = 'center';
    hoverContainer.style.alignItems = 'center';
    hoverContainer.style.fontWeight = 'bold';
    hoverContainer.style.fontSize = '14px';
    hoverContainer.style.height = '300px';
    hoverContainer.style.width = '220px';
  
    let hoverImage = document.createElement('img');
    hoverImage.style.width = '50%';
    hoverImage.src = cardElement.src;
    
    let hoverText = document.createElement('div');
    hoverText.classList.add('hover-text');
  
    // Encontra o card pelo id e acessa a propriedade 'description'
    let cardDescription = cardsTextDescription.find(c => c.id === Number(cardUniqueId));
  
    if (cardDescription) {
      const slotElement = cardElement.closest('.slots');
        hoverText.textContent = typeof cardDescription.description === 'function'
              ? cardDescription.description(cardElement)
              : cardDescription.description;
        if (slotElement) {
           let isSilenced = slotElement.querySelector('.silenced-symbol') !== null;
        if (isSilenced) {
          hoverText.textContent = '<SILENCIADO>'; // Define o texto para <SILENCIADO> se estiver silenciado
        } else {
          hoverText.textContent = typeof cardDescription.description === 'function'
              ? cardDescription.description()
              : cardDescription.description;
        }
      }
      } else {
      hoverText.textContent = 'Descrição não encontrada';
    }
  
    hoverContainer.appendChild(hoverImage);
    hoverContainer.appendChild(hoverText);
    document.body.appendChild(hoverContainer);
  
    // Posiciona o hoverContainer
    hoverContainer.style.left = event.pageX + 1 + 'px'; // Exibe à direita do cursor
    hoverContainer.style.top = event.pageY - 200 + 'px';
    hoverContainer.style.display = 'flex';
    
    //remover o container
    cardElement.addEventListener('mouseout', function() {
      removeHoverContainer(hoverContainer);
    });
    cardElement.addEventListener('touchend', function() {
      removeHoverContainer(hoverContainer);
    });
  
  
  }
  
  // Função para remover o hoverContainer
  function removeHoverContainer(hoverContainer) {
    if (hoverContainer && hoverContainer.parentNode) {
      hoverContainer.parentNode.removeChild(hoverContainer); // Remove o hoverContainer ao tirar o mouse;
    } else {
      //console.error('hoverContainer ou parentNode não encontrado', hoverContainer);
    }
  }
  
  
  
  // Função para posicionar as cartas na mão
  function positionCards() {
    let handElement = document.getElementById('hand');
    if (!handElement) {
      console.error('Elemento com id "hand" não encontrado.');
      return;
    }
    
    let cardContainers = handElement.querySelectorAll('.card-container');
    let cardCount = cardContainers.length;
    
    if (cardCount === 0) {
      //console.log('Nenhuma carta encontrada na mão.');
      return;
    }
    
    //console.log(`Reposicionando as cartas na mão. Quantidade (${cardCount})`);
  
     //Espaço entre as cartas sobrepostas (em pixels)
    let overlap = 75; // Ajuste o valor conforme necessário para aumentar ou diminuir a sobreposição
    
     //Ângulo de inclinação das cartas (em graus)
    let tiltAngle = 2; // Inclinação para a direita em 2 graus
    
     //Posição inicial da primeira carta
    let initialPosition = -((cardCount - 1) * overlap) / 2;
    
    cardContainers.forEach(function(card, index) {
      // Ajusta a posição da carta atual
      let translateX = initialPosition + index * overlap;
      let rotateZ = (index - Math.floor(cardCount / 2)) * tiltAngle; // Inclinação progressiva
      
      // Aplica transformações CSS
      card.style.transform = `translateX(${translateX}px) rotateZ(${rotateZ}deg)`;
      
      // Define z-index para sobreposição
      card.style.zIndex = cardCount - index;
  
      card.addEventListener('mouseover', function() {
        card.style.zIndex = '1006';
      })
  
      card.addEventListener('mouseout',function() {
        card.style.zIndex = cardCount - index;
      }) 
      //para dispositivos móveis
      card.addEventListener('touchstart', function() {
        card.style.zIndex = '1006';
      })
  
      card.addEventListener('touchend',function() {
        card.style.zIndex = cardCount - index;
      }) 
  
  
    });
  }

  //---------------------------------------------------------------------

  // Função para exibir o menu de contexto
function showContextMenu2(event) {
    removeContextMenu();
    let contextMenu2 = document.createElement('div');
    contextMenu2.style.fontSize = '25px';
    
    contextMenu2.classList.add('context-menu2');
  // Opção 'Jogar'
  
    let playOption = document.createElement('div');
      playOption.textContent = "Jogar";
  
    contextMenu2.appendChild(playOption);
  
    playOption.onclick = function() {
        let cardPlayed = clickedCard;
        //console.log(JSON.stringify(cardPlayed));
        playCard(cardPlayed);
    };
    //-----
    //if (allowDiscard) {
    // Opção 'Remover' 
    //let removeOption = document.createElement('div');
      //removeOption.textContent = "Descartar";
      //contextMenu2.appendChild(removeOption);
      //removeOption.onclick = function() {
        //let cardUniqueId = clickedCard.getAttribute('data-unique-id');
          //removeCardFromHand(cardUniqueId) 
      //};
   // }
      
    contextMenu2.style.left = event.pageX + 'px';
    contextMenu2.style.top = event.pageY - 20 + 'px';
    contextMenu2.style.display = 'flex';
    contextMenu2.style.flexDirection = 'column';
  
  // Append contextMenu2 to the body, but 
    document.body.appendChild(contextMenu2);
  }
 
 //---------------------------------------------------------------------

 function playCard(cardPlayed) {
    let cardUniqueId = Number(cardPlayed.getAttribute('data-unique-id'));
    //console.log('Id da carta selecionada para jogar: ' + cardUniqueId);
  
    let cardCost = Number(cardPlayed.getAttribute('data-cost'));
    let totalManaAvailable = mana;
    let isManaEnoughToPlay = totalManaAvailable >= cardCost;
    console.log(`isManaEnoughToPlay ${isManaEnoughToPlay}`);
    let cardContainer = cardPlayed.closest('.card-container');

    if (editMode) {
      isManaEnoughToPlay = true;
      console.log(`isManaEnoughToPlay ${isManaEnoughToPlay}`);
    }
    console.log(`isManaEnoughToPlay ${isManaEnoughToPlay}`);
    if (isManaEnoughToPlay) {
        if (addCardToOwnField(cardContainer)) {
            spendMana(cardCost);
            updateManaDisplay();
            handCardCount--;
            //positionCards();
            //updateHandCounter();
      }
  
      // Verifica se é uma carta de efeito
      let playEffectCard = playEffectsCards.find(c => c.id === cardUniqueId);
      if (playEffectCard) {
        if (playEffectCard.playEffect.length > 0) {
          playEffectCard.playEffect(cardPlayed);
        } else {
          playEffectCard.playEffect();
        }
      }
  
      let cartaCompradoraDeCarta = specialDrawCards.find(c => c.id === cardUniqueId);
      //console.log(`cartaCompradoraDeCarta ${cartaCompradoraDeCarta}`);
      if (cartaCompradoraDeCarta) {
        cartaCompradoraDeCarta.effect();
      }
    // Adiciona evento de mouseover para mostrar descrição da carta
      cardPlayed.addEventListener('mouseover', function(event) {
          showHoverDescription(event, cardPlayed, cardUniqueId);
        });

      let kellInHand = document.querySelector('.card[data-unique-id="30"]');
      if (kellInHand) {
        kellCard.effect(); // Verifica o efeito imediatamente ao entrar na mão
    }
  
  //positionCards();
  
      return true;
    } else {
      alert('Mana insuficiente para jogar a carta.');
      //console.log('Mana insuficiente para jogar a carta.');
      //console.log(`Total de mana disponível ${totalManaAvailable}`);
      //console.log(`Custo atual da carta ${cardCost}`);
      return false;
    }
  }

//---------------------------------------------------------------------

    // Função para remover o menu de contexto
    function removeContextMenu() {
      let contextMenu = document.querySelector('.context-menu2');
      if (contextMenu) {
        contextMenu.parentNode.removeChild(contextMenu);
      }
    }
  
    document.addEventListener('click', function(event) {
      let clickedElement = event.target;
      
      // Check if the clicked element is not a card
      if (!clickedElement.classList.contains('card')) {
          removeContextMenu();
      }
  });

  //---------------------------------------------------------------------


  //Battlefield//

// Função para enviar mensagem ao servidor quando uma carta for adicionada ao seu próprio campo


// Função para adicionar carta ao seu próprio campo de batalha
function addCardToOwnField(cardContainer) {
  // Implemente a lógica para adicionar a carta ao seu próprio campo de batalha
  // Exemplo básico: adicionar a carta em um slot específico
  let cardElement = cardContainer.querySelector('.card');
  let cardId = Number(cardElement.getAttribute('data-unique-id'));
  let cardName = cards.find(c => c.id === cardId).name;
  let cardCost = cardElement.getAttribute('data-cost');
  let cardImgUrl = cardElement.getAttribute('data-image');
  let cardAttack = cardElement.getAttribute('data-attack');
  let cardLife = cardElement.getAttribute('data-life');

   // Solicita ao usuário o slot onde deseja adicionar a carta
   let slotNumber = Number(prompt("Em qual slot você quer adicionar a carta? (1-6)"));
   if (!slotNumber || isNaN(slotNumber) || slotNumber < 1 || slotNumber > 6) {
     alert("Por favor, escolha um slot válido de 1 a 6.");
     return;
   }
  let slotElement = document.getElementById('slot' + slotNumber);
   slotElement.style.position = 'relative';
  
  // Crie o elemento da carta e adicione ao slot próprio
  //let cardElement = document.createElement('div');
  //cardElement.textContent = cardData.cardName; // Supondo que 'cardName' seja um campo na mensagem
  
   // removendo o eventListener que faz exibir o menu de contexto
   cardElement.removeEventListener('click', clickHandler);
    
   cardContainer.style.transform = '';
   cardContainer.style.width = '100%';
   cardContainer.style.position = 'relative';

   cardContainer.addEventListener('click', () => {
      let attackButton = document.createElement('button');
        attackButton.className = 'attack-button';
        attackButton.innerHTML = 'Atacar';
        attackButton.innerHTML = 'Atacar';
        attackButton.classList.add('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'w-4', 'text-lg');
        attackButton.addEventListener('click', () => {
          attackSth(cardAttack, cardLife, cardContainer)
          attackButton.remove();
        });
      slotElement.appendChild(attackButton);  
   })

  slotElement.innerHTML = ''; // Limpa o slot antes de adicionar a nova carta
  slotElement.appendChild(cardContainer);

   // Cria o objeto de mensagem com os dados da carta
   let cardData = {
    type: 'cardAdded',
    id: cardId,
    name: cardName,
    cost: cardCost,
    image: cardImgUrl,
    attack: cardAttack,
    life: cardLife,
    slot: slotNumber // Inclua outros dados conforme necessário
  };

// Converte o objeto para JSON
let message = JSON.stringify(cardData);
console.log(`cardData ${cardData}`);
console.log(`message ${message}`);
// Envia a mensagem para o servidor WebSocket
sendMessageToServer(message);

}

function addCardToOpponentField(cardData) {
  let slot = document.getElementById(`opponentSlot${cardData.slot}`);
  if (!slot) {
      console.error(`Slot ${cardData.slot} não encontrado.`);
      return;
  }

  let cardContainer = document.createElement('div');
  cardContainer.classList.add('card-container');
  cardContainer.style.width = '95%';
  cardContainer.style.position = 'relative';

let cardElement = document.createElement('img');  
  cardElement.classList.add('card');
  cardElement.src = cardData.image;
  cardElement.alt = cardData.name;
  cardElement.setAttribute('data-unique-id', cardData.id);
  cardElement.setAttribute('data-image', cardElement.src);
  cardElement.setAttribute('data-cost', cardData.cost);
  cardElement.setAttribute('data-attack', cardData.attack);
  cardElement.setAttribute('data-life', cardData.life);
  cardElement.setAttribute('data-keywords', cardData.keywords);

cardElement.style.width = '100%';

//let baseCardCost = cards.find(c => c.id === cardData.id).baseCost;

let cardCostDisplay = document.createElement('div');
cardCostDisplay.classList.add('card-cost-display');
cardCostDisplay.textContent = cardData.cost;
//if (cardElement.cost < baseCardCost) {
  //cardCostDisplay.style.color = 'lightgreen';
//}
cardContainer.appendChild(cardCostDisplay);
// criando o display dos stats
let statsElement = document.createElement('div');
statsElement.classList.add('card-stats2');

let attackIcon = document.createElement('img');
attackIcon.src = 'other-images/attack-icon.png';
attackIcon.className = 'attack-icon';

let lifeIcon = document.createElement('img');
lifeIcon.src = 'other-images/heart-icon.png';
lifeIcon.className = 'life-icon';

let attackSpan = document.createElement('span');
attackSpan.classList.add('attack2');
attackSpan.appendChild(attackIcon);
attackSpan.innerHTML += ` ${cardElement.dataset.attack}`;
//attackSpan.style.color = (cardElement.dataset.attack) > (baseCardAttack) ? 'lightgreen' : 'white';

let lifeSpan = document.createElement('span');
lifeSpan.classList.add('life2');
lifeSpan.innerHTML = `${cardElement.dataset.life} `;
//lifeSpan.style.color = (cardElement.dataset.life) > (baseCardLife) ? 'lightgreen' : 'white';
lifeSpan.appendChild(lifeIcon);

statsElement.style.display = 'flex'; 
statsElement.style.justifyContent = 'center'; 
statsElement.style.alignItems = 'center'; 
statsElement.style.fontSize = '20px';
statsElement.style.color = 'white';
// colocando ataque, vida e a barra dentro do display de stats
statsElement.appendChild(attackSpan);
statsElement.appendChild(lifeSpan);


// colocando o display de stats dentro do container da carta  
cardContainer.appendChild(statsElement);  


// colocando a carta dentro do container e o container dentro da mão
cardContainer.appendChild(cardElement);

slot.innerHTML = '';

slot.appendChild(cardContainer);


}

// Função para atacar
function attackSth(cardAttack, cardLife, yourCardContainer) {
  let message = {};
  // Solicita ao usuário o slot que deseja atacar
  let target = Number(prompt('Qual slot você deseja atacar? (1-6) Digite 7 para o avatar.'));
  let chosenSlot;

  let frontlineSlots = ['opponentSlot1', 'opponentSlot2', 'opponentSlot3'];

     // Verifica se qualquer slot da linha de frente está ocupado
     let isAnyFrontlineSlotOccupied = frontlineSlots.some(slotId => {
      let slotElement = document.getElementById(slotId);
      return slotElement && slotElement.querySelector('.card-container');
  });

  // Valida o slot selecionado
  
  if (target === 7) {
    if (isAnyFrontlineSlotOccupied) {
      alert('Você não pode atacar o avatar do oponente enquanto houver cartas dele na linha de frente.');
      return;
    }
      // Lógica para atacar o avatar, se necessário
      console.log('Atacando o avatar...');
      let opponentAvatarLife = Number(document.getElementById('opponent-health').innerHTML);
      console.log(`opponentAvatarLife ${opponentAvatarLife}`);
      console.log(`cardAttack ${cardAttack}`);
      let newLife = opponentAvatarLife - cardAttack;
      let opponentAvatarLifeSpan =  document.getElementById('opponent-health');
          opponentAvatarLifeSpan.innerHTML = newLife;
          opponentAvatarLifeSpan.style.color = 'lightgreen';
      message = {
        type: 'attack',
        target: 'avatar',
        vidaDoAvatarDoDestinatário: newLife
      };    

        switch(true) {
          case (newLife >= 25):
            opponentHealthZone = 'extra';
            opponentAvatarLifeSpan.style.color = 'lightgreen';
            break;
          case (newLife >= 20):
            opponentHealthZone = 'safe';
            opponentAvatarLifeSpan.style.color = 'darkgreen';
            break;
          case (newLife >= 25):
            opponentHealthZone = 'extra';
            opponentAvatarLifeSpan.style.color = 'lightgreen';
            break;
          case (newLife >= 15):
            opponentHealthZone = 'alarming';
            opponentAvatarLifeSpan.style.color = 'orange'; 
            break;
          case (newLife >= 7):
            opponentHealthZone = 'risky';
            opponentAvatarLifeSpan.style.color = 'darkred'; 
            break;
          case (newLife >= 1):
            opponentHealthZone = 'critical';
            opponentAvatarLifeSpan.style.color = 'red'; 
        }

  } else if (target >= 1 && target <= 6) {
      chosenSlot = document.getElementById(`opponentSlot${target}`);
      
      let cardContainer = chosenSlot.querySelector('.card-container');

      // Verifica se o chosenSlot contém um elemento com a classe 'card-container' como filho
      if (chosenSlot && cardContainer) {
          // Lógica para ataque no slot escolhido
          console.log(`Atacando o slot ${target}...`);
          let cardStats = cardContainer.querySelector('.card-stats2')
          let targetCardLife = Number(cardStats.querySelector('.life2').innerHTML);
          // a carta alvo sofre dano igual ao valor de ataque da sua carta
            targetCardLife -= cardAttack;
            targetCardLife.innerHTML = targetCardLife;
          // a carta alvo revida  
          let targetCardAttack = Number(cardStats.querySelector('.attack2').innerHTML);
          let yourCardLife = Number(cardLife);
            yourCardLife -= targetCardAttack;
          let yourCardStatsSpan = yourCardContainer.querySelector('.card-stats2');
          let yourCardLifeSpan = yourCardStatsSpan.querySelector('.life-2');  
            yourCardLifeSpan.innerHTML = yourCardLife;

             // Configura a mensagem para o servidor
      message = {
        type: 'attack',
        target: target,
        vidaDoDestinatário: targetCardLife,
        vidaDoAtacante: yourCardLife
      };
          

          // Adicione aqui o código para realizar o ataque no slot escolhido
      } else {
          // Mensagem de erro se o slot não estiver ocupado
          alert('Por favor, escolha um slot ocupado.');
      }

  } else {
      // Mensagem de erro se a escolha for inválida
      alert('Escolha um número de slot válido (1-6) ou 7 para o avatar.');
  }
  message = JSON.stringify(message);
  sendMessageToServer(message);  
 
}

// função para causar dano direto a um inimigo
function toDamageAnEnemy(target = [], damage = 0) {
  if (target === null) {
    target = Number(prompt("Escolha o alvo (1-6, 7 para o avatar)"));
  }

  console.log(`target.length ${target.length}`);

  if (target.includes(7)) {
    // Aplica dano ao avatar
    let opponentAvatarLifeSpan = document.getElementById('opponent-health');
    let opponentAvatarLife = Number(opponentAvatarLifeSpan.innerHTML);
    opponentAvatarLife -= damage;
    opponentAvatarLifeSpan.innerHTML = opponentAvatarLife;

    // Envia mensagem ao servidor
    let message = {
      type: 'directDamage',
      target: [7],
      damage: damage
    };
    sendMessageToServer(JSON.stringify(message));

    // Remove o '7' do array target
    target = target.filter(num => num !== 7);
  }

   // Verifica se existe alguma carta inimiga no campo
   let hasEnemyCard = false;
   for (let i = 1; i <= 6; i++) {
     let opponentSlot = document.getElementById(`opponentSlot${i}`);
     if (opponentSlot && opponentSlot.querySelector('.card-container')) {
       hasEnemyCard = true;
       break;
     }
   } 

  if (target.length >= 1 && hasEnemyCard) {
    for (let i = 0; i < target.length; i++) {
      let opponentSlot = document.getElementById(`opponentSlot${target[i]}`);
      if (opponentSlot) {
        let cardContainer = opponentSlot.querySelector('.card-container');
        if (cardContainer) {
          let statsSpan = cardContainer.querySelector('.card-stats2');
          let lifeSpan = statsSpan.querySelector('.life2');
            console.log(`lifeSpan.textContent: ${lifeSpan.textContent}`);
            console.log(`typeof lifeSpan.textContent ${typeof(lifeSpan.textContent)}`);
            let life = Number(lifeSpan.textContent);
            let newLife = life - damage;

            if (newLife <= 0) {
              cardContainer.remove();
            }

              lifeSpan.textContent = `${newLife} `;
            let lifeIcon = document.createElement('img');
              lifeIcon.src = 'other-images/heart-icon.png';
              lifeIcon.className = 'life-icon';
             // Adiciona o ícone de vida ao final do texto de vida
             lifeSpan.appendChild(lifeIcon);
          }


          
        }
        
      }
      let message = {
        type: 'directDamage',
        target: [target],
        damage: damage
  };
      sendMessageToServer(JSON.stringify(message));
      
    }
  }



function toDamageAnAlly(target = [], damage = 0) {
  if (target.includes(7)) {
    // Aplica dano ao avatar
    let yourAvatarLifeSpan = document.getElementById('player-health'); 
    let yourAvatarLife = Number(yourAvatarLifeSpan.innerHTML);
    yourAvatarLife -= damage;
    yourAvatarLifeSpan.innerHTML = yourAvatarLife;
    // remover o avatar do array
    target = target.filter(num => num !== 7);
  }

    for (let i = 0; i < target.length; i++) {
      let yourSlot = document.getElementById(`slot${target}`);

      let cardContainer = yourSlot.querySelector('.card-container');

      let statsSpan = cardContainer.querySelector('.card-stats2');

      let lifeSpan = statsSpan.querySelector('.life2');

      console.log(`lifeSpan.textContent: ${lifeSpan.textContent}`);
      console.log(`typeof lifeSpan.textContent ${typeof(lifeSpan.textContent)}`);

      let life = Number(lifeSpan.textContent);
      
      let newLife = life - damage;

      if (newLife <= 0) {
        cardContainer.remove();
      }

      lifeSpan.textContent = `${newLife} `;

      let lifeIcon = document.createElement('img');
       lifeIcon.src = 'other-images/heart-icon.png';
        lifeIcon.className = 'life-icon';

     // Adiciona o ícone de vida ao final do texto de vida
     lifeSpan.appendChild(lifeIcon);
    }
    
 
  }



  //---------------------------------------------------------------------

  function attackHandler(message) {
    // valor de target 
    let slot = document.getElementById(`slot${message.target}`);
    //let attackingCard;
    if (message.target !== 'avatar') {
    let defenderCard = slot.querySelector('.card-container');
    let defenderCardStatsSpan = defenderCard.querySelector('.card-stats2');
    let defenderCardLifeSpan = defenderCardStatsSpan.querySelector('.life2');
      defenderCardLifeSpan.innerHTML = message.vidaDoDestinatário;  
    } else if (message.target === 'avatar') {
    let attackedAvatar = document.getElementById('player-health');
      attackedAvatar.innerHTML =  message.vidaDoAvatarDoDestinatário;
    }
    
  }




function interpretDeckCode(deckCode) {
    let cardIds = deckCode.split('|');
    starterDeck = [];
    currentDeck = [];
    deckCardCount = cardIds.length;
    handCardCount = 0;

    if (!editMode && deckCardCount < 30) {
      alert('Tamanho do deck inválido.');
      return;
    }
    cardIds.forEach(function(cardId) {
      let card = cards.find(function(c) {
        return c.id === parseInt(cardId);
      });
        if (card) {
            starterDeck.push({ name: card.name, id: card.id, cost: card.cost, image: card.image, attack: card.baseAttack, life: card.baseLife });
            currentDeck.push({ name: card.name, id: card.id, currentCost: card.baseCost, baseCost: card.baseCost, image: card.image, attack: card.baseAttack, life: card.baseLife });
            startTheGame();
            shuffleDeck();
            //updateDeckCounter();

         

          } else {
            console.error("ID de carta inválida:", cardId);
            console.error("Por favor, insira um código de deck válido!");
            // alert("ID de carta inválida. Por favor, insira um código de deck válido!");
          }
          
        
    })
    if (!editMode) {
      // Comprar a mão inciial
      drawCard(6);  
    }
  }

   //--------------------------------------------------------------//

  function startTheGame() {
    let deckSelectAndCodeInput = document.getElementById('codigoESelecionar');
      deckSelectAndCodeInput.style.display = 'none';

    let handElement = document.getElementById('hand');
      handElement.style.display = 'flex';

    let mainContent = document.querySelector('#main-content');
     mainContent.style.display = 'flex';
    mainContent.style.width = '100%';
  
    //let thisTurnValue = document.getElementById('specialTurn');
    //thisTurnValue.style.display = 'flex';
  
   let manaContainer = document.getElementById('manaContainer');
    manaContainer.style.display = 'flex';

    //let allowDiscardDiv = document.getElementById('allow-discard-div');
      //allowDiscardDiv.style.display = 'block'

      // let opponentAvatarLifeSpan =  document.getElementById('opponent-health');
       // opponentAvatarLifeSpan.style.color = 'lightgreen';
      
     // let yourAvatarLifeSpan = document.getElementById('player-health');
       // yourAvatarLifeSpan.style.color = 'lightgreen';
  }

//---------------------------------------------------------------------

    // EVENTOS DE CLIQUES ETC //
    // Adiciona um ouvinte de eventos de clique no documento inteiro
    document.addEventListener('click', function(event) {
        let contextMenu = document.querySelector('.context-menu');
        if (contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.remove();
        }
    });
//BOTÕES PRINCIPAIS//
    document.getElementById('interpretButton').addEventListener('click', function() {
      let deckCode = document.getElementById('deckCodeInput').value;
      interpretDeckCode(deckCode);
      //showDeckSidebar();
    })

    document.getElementById('drawButton').addEventListener('click', function() {
      drawCard(1)
    });
document.getElementById('endTurn').addEventListener('click', function() {
      if (currentTurnIndex >= 5) {
        pointsAmplifier(); 
      }
      endTurn(); 
    });
//PLAYER-life RELATED//
//document.getElementById('btn-decrease').addEventListener('click', decreasePlayerLife);