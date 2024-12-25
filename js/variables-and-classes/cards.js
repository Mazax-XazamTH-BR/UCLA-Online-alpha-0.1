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
    keywords: ["último suspiro", "obscuro", "morto-vivo"],
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
    keywords: ["último suspiro", "voo", "obscuro"],
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
    baseCost: 4,
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
    keywords: ["glacial", "voo", "grito de guerra", "congelante"],
  },
  {
    id: 82,
    name: "Espectro do Gelo Aprisionante",
    baseCost: 4,
    image: "assets/cartas/glacial/Espectro_do_Gelo_Aprisionante.png",
    baseAttack: 2,
    baseHealth: 3,
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

export { cards, cardsTextDescription };

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
      #Condicional: “sempre que uma carta do oponente for marcada com *paralisia elétrica*, causo 3 de dano a ela.”
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
      #Grito de Guerra: “ganho +1/+1 para cada carta que foi destruída por efeitos ou habilidades ao longo desta partida, exceto por dano.”`,
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
