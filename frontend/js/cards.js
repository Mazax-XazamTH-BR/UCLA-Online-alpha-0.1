const cards = [ 
  {
    id:1, name:"A Vagante Sombria", baseCost: 10, image:"assets/cartas/obscura/A_Vagante_Sombria.png", baseAttack:10, baseHealth:5, speed: 1, keywords: ["indestrutível", "obscuro", "morto-vivo", "constante", "corpo-a-corpo"] 
  },
  {
    id: 2, name:"Elemental do Fogo", baseCost:2, image:"assets/cartas/ignea/Elemental_do_Fogo.png", baseAttack:2, baseHealth:2, speed: 1, keywords: ["grito de guerra", "ígneo", "elemental", "corpo-a-corpo"]
  },
  {
    id:3, name: "Espírito Flamejante", baseCost: 1,image: "assets/cartas/ignea/Espírito_Flamejante.png", baseAttack: 1, baseHealth: 1, speed: 1, keywords: ["ígneo", "constante", "corpo-a-corpo"]
  },
  {
    id: 4, name: "Fulgurvoltz", baseCost: 13, image: "assets/cartas/eletrica/Fulgurvoltz.png", baseAttack: 10, baseHealth: 8, speed: 2, keywords:["elétrico", "grito de guerra", "corpo-a-corpo", "elemental"]
  },
  {
    id:5,name:"Ivan Ignisar",baseCost:7,image:"assets/cartas/ignea/Ivan_Ignisar.png", baseAttack:7, baseHealth:6, speed: 2, keywords:["ígneo", "humano", "dragão", "dragão primordial", "transformar", "condicional"]
  },
  {
    id:6,name:"Ignisar transformado",baseCost:7,image:"assets/cartas/ignea/Ignisar_transformado.png", baseAttack:9, baseHealth:7, speed: 2, keywords:["ígneo", "humano", "dragão", "dragão primordial", "transformado", "condicional"]
  },
  {
    id: 7, name:"Jack", baseCost: 2, image:"assets/cartas/eletrica/Jack.png",baseAttack:2, baseHealth:2, speed: 2, keywords:["nadaporenquanto"]
  },
  {
    id: 8, name: "Layla", baseCost: 5, image: "assets/cartas/eletrica/Layla.png", baseAttack:5, baseHealth:5, speed: 2, keywords:["elétrico", "grito de guerra", "condicional", "final do turno", "longa-distância", "humano"]
  },
  {
    id: 9, name:"Mali Magarc", baseCost: 9, image: "assets/cartas/neutra/Mali_Magarc.png", baseAttack: 6, baseHealth: 7, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 9000, name:"Mali transformado", baseCost: 9, image: "assets/cartas/neutra/Mali_transformado.png", baseAttack: 8, baseHealth: 10, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 10, name: "Rusco", baseCost: 2, image: "assets/cartas/neutra/Rusco.png", baseAttack: 2, baseHealth: 2, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 11, name: "Sabrina", baseCost: 4, image: "assets/cartas/aquatica/Sabrina.png", baseAttack: 4, baseHealth: 5, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 12, name: "Thorwells", baseCost: 6, image: "assets/cartas/eletrica/Thorwells.png", baseAttack: 5, baseHealth: 5, speed: 6, keywords:["elétrico", "grito de guerra", "corpo-a-corpo", "celestial"]
  },
  {
    id: 13, name: "Tony Raiturus", baseCost: 6, image: "assets/cartas/eletrica/Tony_Raiturus.png", baseAttack: 5, baseHealth: 6, speed: 6, keywords:["elétrico", "humano", "dragão", "dragão primordial", "corpo-a-corpo", "constante", "condicional"]
  },
  {
    id: 14, name: "Voltexz", baseCost: 20, image: "assets/cartas/eletrica/Voltexz.png", baseAttack: 10, baseHealth: 7, speed: 5, keywords:["grito de guerra", "elétrico", "longa distância"]
  },
  {
    id: 15, name: "Necrófago Espectral", baseCost: 1, image: "assets/cartas/obscura/Necrófago_Espectral.png", baseAttack: 4, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 16, name: "O Revivente Eterno", baseCost: 2, image: "assets/cartas/obscura/O_Revivente_Eterno.png", baseAttack: 3, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 17, name: "Replicador Maldito", baseCost: 2, image: "assets/cartas/obscura/Replicador_Maldito.png", baseAttack: 2, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 18, name: "Fênix das Trevas Profana", baseCost: 3, image: "assets/cartas/obscura/Fênix_das_Trevas_Profana.png", baseAttack: 3, baseHealth: 3, speed: 2, keywords:["nadaporenquanto"]
  },
  {
    id: 19, name: "Titânico Morcegalma", baseCost: 4, image: "assets/cartas/obscura/Titânico_Morcegalma.png", baseAttack: 5, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 20, name: "O Espiritomante", baseCost: 5, image: "assets/cartas/obscura/O_Espiritomante.png", baseAttack: 3, baseHealth: 6, speed: 1, keywords:["obscuro", "último suspiro", "humano", "feiticeiro", "necromante", "longa-distância"]
  },
  {
    id: 21, name: "Jeff-The-Death", baseCost: 6, image: "assets/cartas/obscura/Jeff-The-Death.png", baseAttack: 2, baseHealth: 2, speed: 1, keywords:["obscuro", "último suspiro", "corpo-a-corpo"]
  },
  {
    id: 22, name: "Cientista da Morte", baseCost: 3, image: "assets/cartas/obscura/Cientista_da_Morte.png", baseAttack: 1, baseHealth: 4, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 22000, name: "Cadáver Reanimado", baseCost: 3, image: "assets/cartas/obscura/Cadáver_Reanimado.png", baseAttack: 3, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 23, name: "Rai'Emofitir", baseCost: 8, image: "assets/cartas/obscura/Rai'Emofitir.png", baseAttack: 6, baseHealth: 6, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 25, name: "Mente Destrutiva", baseCost: 5, image: "assets/cartas/neutra/Mente_Destrutiva.png", baseAttack: 2, baseHealth: 5, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 26, name: "Eletroad", baseCost: 4, image: "assets/cartas/eletrica/Eletroad.png", baseAttack: 3, baseHealth: 6, speed: 1, keywords:["elétrico", "corpo-a-corpo", "fera", "grito de guerra", "início do turno"]
  },
  {
    id: 27, name: "Sta. Helena Maria da Cura", baseCost: 10, image: "assets/cartas/neutra/Sta._Helena_Maria_da_Cura.png", baseAttack: 7, baseHealth: 10, speed: 1, keywords:["nadaporenquanto"]
  },
  {
    id: 28, name: "Sta. Helena transformada", baseCost: 10, image: "assets/cartas/neutra/Sta._Helena_transformada.png", baseAttack: 7, baseHealth: 10, speed: 1, keywords:["nadaporenquanto"]
  },
{
    id: 29, name: "D'Lorafya", baseCost: 6, image: "assets/cartas/ignea/D'Lorafya.png", baseAttack: 7, baseHealth: 5, speed: 1, keywords:["ígneo", "grito de guerra", "longa-distância"]
},
{
    id: 30, name: "Kell", baseCost: 10, image: "assets/cartas/sagrada/Kell.png", baseAttack: 5, baseHealth: 5, speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 31, name: "Neraqa", baseCost: 6, image: "assets/cartas/aquatica/Neraqa.png", baseAttack: 0, baseHealth: 12, speed: 1, keywords:["grito de guerra", "aquático", "benevolente", "celestial", "invulnerável"]
},
//{id: 32, name: "Frasco Grande de Águas Curativas", baseCost: 2, image: "assets/cartas/Frasco Grande de Águas Curativas.png",},
//{id: 33, name: "Rejeição de Neraqa", baseCost: 3, image: "assets/cartas/Rejeição de Neraqa.png",},
{
    id: 34, name: "Leviatã", baseCost: 8, image: "assets/cartas/aquatica/Leviatã.png", baseAttack: 8, baseHealth: 10, speed: 1, keywords:["nadaporenquanto"]
},
{
    id: 35, name: "Alexa", baseCost: 4, image: "assets/cartas/aquatica/Alexa.png", baseAttack: 3, baseHealth: 10, speed: 1, keywords:["nadaporenquanto"]
},
{
    id: 36, name: "Espírito Carregado", baseCost: 1, image: "assets/cartas/eletrica/Espírito Carregado.png", baseAttack: 1, baseHealth: 1, speed: 3, keywords:["elétrico", "elemental", "corpo-a-corpo", "ataque relâmpago", "grito de guerra"]
},
{
    id: 39, name: "Dragão Ancião do Trovão", baseCost: 5, image: "assets/cartas/eletrica/Dragão Ancião do Trovão.png", baseAttack: 7, baseHealth: 4, speed: 2, keywords:["nadaporenquanto"]
},
{
    id: 40, name: "Gigante Elétrico", baseCost: 5, image: "assets/cartas/eletrica/Gigante Elétrico.png", baseAttack: 9, baseHealth: 8, speed: 2, keywords:["elétrico", "corpo-a-corpo", "gigante", "grito de guerra"]
},

{
    id: 49, name: "Arcanjo Uriel", baseCost: 3, image: "assets/cartas/sagrada/Arcanjo Uriel.png", baseAttack: 2, baseHealth: 5, speed: 2, keywords:["sagrado", "voo", "anjo", "arcanjo", "celestial", "corpo-a-corpo", "vínculo curativo", "condicional"]
},
{
    id: 50, name: "O Tecnomante", baseCost: 3, image: "assets/cartas/neutra/O Tecnomante.png", baseAttack: 2, baseHealth: 5, speed: 1, keywords:["grito de guerra", "neutro", "longa-distância", "circuitrônico"]
},
{
    id: 51, name: "Torrente Azul", baseCost: 6, image: "assets/cartas/aquatica/Torrente Azul.png", baseAttack: 5, baseHealth: 5, speed: 3, keywords:["nadaporenquanto"]
},
{
    id: 52, name: "Lucien", baseCost: 6, image: "assets/cartas/sagrada/Lucien.png", baseAttack: 3, baseHealth: 5, speed: 1, keywords:["sagrado, longa-distância, humano, monge, condicional, fim do turno"]
},
{
    id: 53, name: "Gigante Marinho", baseCost: 4, image: "assets/cartas/aquatica/Gigante Marinho.png", baseAttack: 8, baseHealth: 7, speed: 1, keywords:["nadaporenquanto"]
},
{
    id: 54, name: "Elemental de Água Gigante", baseCost: 10, image: "assets/cartas/aquatica/Elemental de Água Gigante.png", baseAttack: 0, baseHealth: 1, speed: 1,keywords:["nadaporenquanto"] 
},
{
  id: 55, name: "Ronan", baseCost: 3, image: "assets/cartas/ignea/Ronan.png", baseAttack: 4, baseHealth: 3, speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 55000, name: "Ronan transformado", baseCost: 3, image: "assets/cartas/modo-truco/Ronan transformado.png", baseAttack: 6, baseHealth: 4
},
{
  id: 56, name: "Zarvok", baseCost: 5, image: "assets/cartas/ignea/Zarvok.png", baseAttack: 5, baseHealth: 5, speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 57, name: "Gigante Flamejante", baseCost: 4, image: "assets/cartas/ignea/Gigante Flamejante.png", baseAttack: 8, baseHealth: 7, speed: 1, keywords:["ígneo", "corpo-a-corpo", "grito de guerra", "gigante"]
},
{
  id: 58, name: "Piromante Ardente", baseCost: 2, image: "assets/cartas/ignea/Piromante Ardente.png", baseAttack: 3, baseHealth: 2, speed: 1, keywords:["ígneo", "longa-distância", "grito de guerra", "humano", "mago"]
},
{
  id: 59, name: "Avatar do Fogo", baseCost: 5, image: "assets/cartas/ignea/Avatar do Fogo.png", baseAttack: 5, baseHealth: 4, speed: 1,keywords:["ígneo", "grito de guerra", "longa-distância", "avatar"]
},
{
  id: 60, name: "Irina Lança-Chamas", baseCost: 4, image: "assets/cartas/ignea/Irina Lança-Chamas.png", baseAttack: 5, baseHealth: 4, speed: 1, keywords:["ígneo", "longa-distância", "grito de guerra", "humano", "mutante"]
},
{
  id: 61, name: "Esther", baseCost: 2, image: "assets/cartas/ignea/Esther.png", baseAttack: 2, baseHealth: 2, speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 62, name: "Brutamontes Chocante", baseCost: 8, image: "assets/cartas/eletrica/Brutamontes Chocante.png", baseAttack: 7, baseHealth: 7, speed: 2, keywords:["elétrico", "corpo-a-corpo", "humano", "paralisante", "grito de guerra"]
},
{
  id: 63, name: "Eletrocaçadora Vesper", baseCost: 6, image: "assets/cartas/eletrica/Eletrocaçadora Vesper.png", baseAttack: 7, baseHealth: 5, speed: 3, keywords:["nadaporenquanto"]
},
{
  id: 64, name: "Dragãozinho Flamejante", baseCost: 1, image: "assets/cartas/ignea/Dragãozinho Flamejante.png", baseAttack: 2, baseHealth: 2, speed: 1, keywords:["ígneo", "voo", "corpo-a-corpo", "dragão", "grito de guerra"]
},
{
  id: 65, name: "David-The-Titanslayer", baseCost: 4, image: "assets/cartas/neutra/David-The-Titanslayer.png", baseAttack: 6, baseHealth: 3 , speed: 1, keywords:["neutro", "corpo-a-corpo", "humano", "grito de guerra"]
},
{
  id: 66, name: "Diabrete Sombrio", baseCost: 1, image: "assets/cartas/obscura/Diabrete Sombrio.png", baseAttack: 2, baseHealth: 1 , speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 67, name: "Agonox", baseCost: 5, image: "assets/cartas/obscura/Agonox.png", baseAttack: 4, baseHealth: 5, speed: 1, keywords:["nadaporenquanto"]
},
{
  id: 68, name: "Diabrete Elétrico", baseCost: 1, image: "assets/cartas/eletrica/Diabrete Elétrico.png", baseAttack: 2, baseHealth: 1, speed: 2, keywords:["nadaporenquanto"]
},
{
  id: 69, name: "Oráculo das Marés", baseCost: 2, image: "assets/cartas/aquatica/Oráculo das Marés.png", baseAttack: 0, baseHealth: 4, speed: 1, keywords:["aquático", "benevolente", "grito de guerra", "condicional"]
},
{
  id: 70, name: "Thalassor", baseCost: 7, image: "assets/cartas/aquatica/Thalassor.png", baseAttack: 7, baseHealth: 9, speed: 1, keywords:["aquático", "tritão", "corpo-a-corpo", "constante"]
},
{
  id: 71, name: "Odon, Mestre das Armas", baseCost: 4, image: "assets/cartas/neutra/Odon, Mestre das Armas.png", baseAttack: 4, baseHealth: 4, speed: 1, keywords:["neutro", "anão", "corpo-a-corpo", "grito de guerra"]
},
{
  id: 72, name: "Sengoku", baseCost: 7, image: "assets/cartas/neutra/Sengoku.png", baseAttack: 7, baseHealth: 7, speed: 3, keywords:["neutro", "humano", "dragão", "dragão primordial", "corpo-a-corpo", "intimidador", "regeneração", "transformar"]
},
{
  id: 73, name: "Drake Damian", baseCost: 3, image: "assets/cartas/neutra/Drake Damian.png", baseAttack: 2, baseHealth: 2, speed: 4, keywords:["neutro", "humano", "corpo-a-corpo", "esquiva", "constante"]
},
{
  id: 74, name: "Emissário da Água da Vida", baseCost: 3, image: "assets/cartas/aquatica/Emissário da Água da Vida.png", baseAttack: 3, baseHealth: 4, speed: 1, keywords:["aquático", "longa-distância", "grito de guerra"]
}



  ];
  

export { cards };
