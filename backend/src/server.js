console.log("Servidor está iniciando...");

import { WebSocketServer } from "ws";

import crypto from "crypto";

const wss = new WebSocketServer({ port: 8081 });

let players = [];

let player1;
let player2;

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  console.log("Servidor online e rodando na porta 8081.");

  const playerId = crypto.randomUUID();
  const clientIp = ws._socket.remoteAddress;
  let now = new Date();
  console.log(
    `Novo cliente conectado: Cliente ${playerId} com IP ${clientIp} ${now.toLocaleString()}`
  );

  // Inicializa o jogador
  let player = {
    id: playerId,
    ip: clientIp,
    nickname: "",
    deck: [],
    avatarLife: 25,
    mana: 1,
    score: 0,
    graveyard: new Map(),
    ws: ws,
  };

  ws.on("message", (message) => {
    const data = message.toString(); // Garante que a mensagem seja uma string
    //console.log("Mensagem recebida no servidor:", data);
    try {
      let parsedMessage = JSON.parse(data);
      handleMessageFromPlayer(parsedMessage, player);
    } catch (error) {
      //console.error("Erro ao processar mensagem JSON:", error);
    }
  });

  ws.on("close", () => {
    players = players.filter((p) => p.id !== player.id);
    //console.log(`Jogador ${player.id} desconectado.`);
    //console.log(`players.length ${players.length}`);

    let message = {
      type: "playerDisconnected",
    };
    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
    players = [];
    enemyAvatar.health = 25;
    alliedAvatar.health = 25;
    whoPlaysFirst = null;
    roundEndRequests = 0;
    currentRoundIndex = 1;

    // Redefine cardsDestroyed ao estado inicial
    cardsDestroyed = {
      byAllMeans: {
        byPlayer1: 0,
        byPlayer2: 0,
      },
      combatDamageOnly: {
        byPlayer1: 0,
        byPlayer2: 0,
      },
      allDamageSources: {
        byPlayer1: 0,
        byPlayer2: 0,
      },
      directDamageOnly: {
        byPlayer1: 0,
        byPlayer2: 0,
      },
      destructionEffects: {
        byPlayer1: 0,
        byPlayer2: 0,
      },
    };
  });

  //console.log("O Servidor está ligado.");
});

//console.log("Servidor WebSocket escutando na porta 8081...");

// -----------------------------------------------------------------------

let roundEndRequests = 0;
let whoPlaysFirst = null;

function handleMessageFromPlayer(parsedMessage, player) {
  //console.log("Mensagem recebida do jogador:");
  //console.log(player.nickname);
  console.log("Tipo da mensagem:", parsedMessage.type);

  switch (parsedMessage.type) {
    case "newUserLogin":
      if (parsedMessage.nickname) {
        // Verifica se o nickname já está em uso
        const nicknameExists = players.some(
          (existingPlayer) => existingPlayer.nickname === parsedMessage.nickname
        );

        if (nicknameExists) {
          /* console.error(
            `O nickname "${parsedMessage.nickname}" já está em uso.`
          ); */
          // Você pode enviar uma mensagem de erro ao jogador aqui, se desejar
          player.ws.send(
            JSON.stringify({
              type: "nicknameInUse",
              message: "Esse nome de usuário já está em uso.",
            })
          );
          return; // Sai da função se o nickname já estiver em uso
        }

        // Se o nickname não estiver em uso, atribui o nickname ao jogador
        player.nickname = parsedMessage.nickname;

        // Atribui o jogador como player1 ou player2
        if (players.length === 0) {
          player1 = player;
        } else if (players.length === 1) {
          player2 = player;
        }
        players.push(player);
        /*   console.log(
          `Jogador ${player.nickname} conectado com ID ${player.id} e IP ${player.ip}`
        ); */

        let message = {
          type: "yourUserId",
          data: player.id,
        };
        player.ws.send(JSON.stringify(message));

        console.log(`players.length ${players.length}`);
        if (players.length > 1) {
          requestDeckCode();
        }
      } else {
        /*         console.error(
          "Mensagem de login recebida sem nickname:",
          parsedMessage
        ); */
      }
      break;

    case "deckCode":
      if (parsedMessage.deckCode) {
        interpretDeckCode(parsedMessage.deckCode, player);
      }
      break;

    case "cardDrawn":
      updateCardState(parsedMessage.cardData, parsedMessage.state);
      break;

    case "drawForTheOpponent":
      {
        let player2 = players.find((p) => p.id !== player.id);
        const { amount } = parsedMessage;
        drawCardOrder(amount, player2);
      }

      break;

    case "playCardRequest":
      if (parsedMessage.data) {
        let cardInstanceId = parsedMessage.data;
        let slotNumber = parsedMessage.data.slotNumber;
        /* console.log(
          "Pedido de jogada de carta recebido do jogador para a carta com a instanceId: ",
          cardInstanceId
        ); */

        playCard(cardInstanceId, slotNumber, player);

        if (roundEndRequests === 1) {
          let message = {
            type: "undefined",
          };

          const theOtherPlayer = players.find((p) => p.id !== player.id);
          theOtherPlayer.ws.send(JSON.stringify(message));
        }
      }
      break;

    case "summonCardRequest":
      if (parsedMessage.data.cardId && parsedMessage.data.slotNumber) {
        battlefieldUpdateOrder(parsedMessage, player);
      }
      break;

    case "addCardToOpponentField":
      if (parsedMessage.data.cardInstanceId && parsedMessage.data.slotNumber) {
        //console.log(`parsedMessage${parsedMessage}`);
        battlefieldUpdateOrder(parsedMessage, player);
      }
      break;

    case "enableAttackRequest":
      if (parsedMessage.data.instanceId) {
        enableAttackForTheCard(parsedMessage.data, player);
      } else {
        //console.error('instanceId não recebido ou não contém um valor válido.');
      }
      break;

    case "attackCardRequest":
      if (parsedMessage.data) {
        //console.log(`parsedMessage.data ${JSON.stringify(parsedMessage.data)}`);
        attackCard(
          parsedMessage.data.cartaAlvoInstanceId,
          parsedMessage.data.cartaAtacanteInstanceId,
          player
        );
      }
      break;

    case "attackTheAvatar":
      if (parsedMessage.data) {
        attackAvatar(parsedMessage.data, player);
      }
      break;

    case "summonCardRequest":
      if (parsedMessage.data) {
        battlefieldUpdateOrder(parsedMessage, player);
      }
      break;

    case "directDamageRequest":
      if (parsedMessage.data.damage && parsedMessage.data.cardInstanceId) {
        const damage = parsedMessage.data.damage;
        const cardInstanceId = parsedMessage.data.cardInstanceId;
        dealDirectDamage(damage, cardInstanceId);
      } else {
        /* console.warn(
          "Variável damage e/ou variável cardInstanceId recebidas do jogador não possuem valores válidos."
        ); */
      }
      break;

    case "directDamageToAvatar":
      if (parsedMessage.data.damage && parsedMessage.data.avatarId) {
        const damage = parsedMessage.data.damage;
        console.log(`damage: ${damage}`);
        const avatarId = parsedMessage.data.avatarId;
        directDamageToAvatar(damage, avatarId, player);
      } else {
        /* console.warn(
          `Variável damage e/ou variável cardInstanceId recebidas do jogador não possuem valores válidos`
        ); */
      }
      break;

    case "buffOrDebuffRequest":
      if (parsedMessage.data) {
        battlefieldUpdateOrder(parsedMessage, player);
      }
      break;

    case "healRequest":
      if (parsedMessage.data) {
        healCard(
          parsedMessage.data.cardInstanceId,
          parsedMessage.data.healingAmount
        );
      }
      break;

    case "healAvatarRequest":
      if (parsedMessage.data) {
        healAvatar(
          parsedMessage.data.avatarType,
          parsedMessage.data.healingAmount,
          player
        );
      }
      break;

    case "recallRequest":
      if (parsedMessage.data) {
        recallCard(parsedMessage.data, player);
      }
      break;

    case "destroyCardRequest":
      if (parsedMessage.data) {
        const cardInstanceId = parsedMessage.data.instanceId;
        const carta = cartasMap.get(Number(cardInstanceId));
        if (carta instanceof Carta) {
          carta.morrer();
          if (checkDeathAndAddToGraveyard(carta)) {
            checkAndExecuteGraveyardEffects();
            const cause = 'destructionEffect'
            updateCardsDestroyed(carta, cause);
          }
          let message = {
            type: "destroyCardOrder",
            data: carta,
            destructionEffect: true
          };
          players.forEach((p) => {
            p.ws.send(JSON.stringify(message));
          });
        }
      }
      break;

    case "increaseCardSpeedRequest":
      if (parsedMessage.data.cardInstanceId && parsedMessage.data.amount) {
        handleSpeedUpdateRequest(parsedMessage.data, "increase", player);
      } else {
        /*   console.error(
          "Valores da variável cardInstanceId ou da variável amount recebida do cliente inválidos ou inexistentes."
        ); */
      }
      break;

    case "decreaseCardSpeedRequest":
      if (parsedMessage.data.cardInstanceId && parsedMessage.data.amount) {
        handleSpeedUpdateRequest(parsedMessage.data, "decrease", player);
      } else {
        /*    console.error(
          "Valores da variável cardInstanceId ou da variável amount recebida do cliente inválidos ou inexistentes."
        ); */
      }
      break;

    case "keywordAdditionRequest":
      if (parsedMessage.data.keyword && parsedMessage.data.instanceId) {
        const instanceId = parsedMessage.data.instanceId;
        const keyword = parsedMessage.data.keyword;

        keywordAddition(instanceId, keyword);
      }
      break;

    case "negativeKeywordRemoved":
      if (
        parsedMessage.data.cardInstanceId &&
        parsedMessage.data.removedKeywords
      ) {
        removeCardKeyword(parsedMessage.data);
      }
      break;

    case "cardCostUpdated":
      // Verifica se a mensagem recebida contém instanceId e newCost
      if (parsedMessage.data.instanceId && parsedMessage.data.newCost) {
        const { instanceId, newCost } = parsedMessage.data;

        // Verifica se instanceId é um número válido
        if (!isNaN(Number(instanceId))) {
          // Recupera a carta correspondente ao instanceId do mapa
          const carta = cartasMap.get(Number(instanceId));

          // Verifica se a carta é uma instância válida da classe Carta
          if (carta instanceof Carta) {
            // Atualiza o custo da carta e registra a mudança
            carta.updateCost(newCost);
            /*             console.log(
              `Custo da carta ${carta.name} (instanceId: ${instanceId}) atualizado para ${newCost}.`
            ); */
            cartasMap.set(Number(carta.instanceId), carta);
          } else {
            // Log de erro caso a carta não seja encontrada no mapa
            /*             console.error(
              `Instância-objeto carta não encontrada no mapa para a instanceId ${instanceId}.`
            ); */
          }
        } else {
          // Log de erro caso instanceId não seja um número válido
          //console.error(`instanceId ${instanceId} não possui um valor válido.`);
        }
      } else {
        // Log de erro se os dados necessários não estiverem presentes na mensagem
        /*         console.error(
          `Dados insuficientes na mensagem para atualizar o custo da carta: ${JSON.stringify(
            parsedMessage.data
          )}`
        ); */
      }
      break;

    case "updateManaAmount":
      if (parsedMessage.data.mana) {
        const { mana } = parsedMessage.data;
        if (!isNaN(Number(mana))) {
          player.mana = mana;
          /*           console.log(
            `Mana do jogador (${player.nickname}) atualizada para: ${player.mana}`
          ); */
        }
      }
      break;

    case "specialBuffRequest":
      if (parsedMessage.data?.instanceId) {
        // Verifica se instanceId existe
        handleSpecialBuffRequest(
          parsedMessage.data.instanceId,
          parsedMessage.condition
        );
      } else {
        console.error(
          "specialBuffRequest recebido sem instanceId válido:",
          parsedMessage
        );
      }
      break;

    case "endRoundRequest":
      handleEndRoundRequest(player);
      break;

    case "myUpdatedScore":
      if (parsedMessage.data.playerMatchPoints) {
        const { playerMatchPoints } = parsedMessage.data;
        player.score = playerMatchPoints;
        if (player.score >= 6) {
          gameOver(player);
        }
      } else {
        /*         console.error(
          `A variável playerMatchPoints ${playerMatchPoints} recebida do jogador ${parsedMessage.username} não contém um valor válido`
        ); */
      }
      break;

    case "gameOver":
      if (parsedMessage.data.result) {
        const { result } = parsedMessage.data;
        if (result === "winner") {
          gameOver(player);
        }
      }
      break;

    default:
      console.log("Tipo de mensagem desconhecido:", parsedMessage.type);
      break;
  }
}

// ---------------------------------------------

import { cards, graveyardInteractions } from "../../js/cards.js";

import { Carta, Avatar } from "../../js/POO.js";

// Instância de Avatar para o inimigo e aliado
const enemyAvatar = new Avatar(false, 25);
const alliedAvatar = new Avatar(true, 25);

//console.log(cards);
//console.log(cardsTextDescription);

function startTheGame() {
  console.log(
    "Tudo pronto para começar a partida! Enviando isto para ambos os jogadores, para que procedam à tela principal da partida."
  );
  players.forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "startGame",
        message: "Tudo pronto para começar a partida!",
      })
    );
  });
  console.log("whoPlaysFirst = ", whoPlaysFirst);
  whoPlaysFirstDecider();
}

function requestDeckCode() {
  players.forEach((player) =>
    player.ws.send(
      JSON.stringify({
        type: "requestDeckCode",
        message:
          "Dois jogadores conectados e devidamente identificados. Selecionem seus decks.",
      })
    )
  );
}

function whoPlaysFirstDecider() {
  // Função para sortear quem joga primeiro
  const randomPick = () => (Math.random() < 0.5 ? player1 : player2);

  if (whoPlaysFirst === null) {
    if (currentRoundIndex === 1) {
      // Sorteio para determinar quem joga primeiro
      console.log("É a primeira rodada, sorteando quem joga primeiro.");
      whoPlaysFirst = randomPick();
    }
  }

  // Define mensagens para ambos os jogadores
  const messageToPlayer1 = {
    type: "whoPlaysFirstDecided",
    data:
      whoPlaysFirst.id === player1.id ? "you play first" : "you play second",
  };

  const messageToPlayer2 = {
    type: "whoPlaysFirstDecided",
    data:
      whoPlaysFirst.id === player2.id ? "you play first" : "you play second",
  };

  // Envia as mensagens
  player1.ws.send(JSON.stringify(messageToPlayer1));
  player2.ws.send(JSON.stringify(messageToPlayer2));

  console.log(`Quem joga primeiro: ${whoPlaysFirst.nickname}`);
}

//----------------------------------------------------------------

let editMode = true;

// ----------------------------------------------------------------

// Mapa para armazenar instâncias das cartas
export const cartasMap = new Map();

// Função para adicionar uma nova carta ao mapa
function addCartaToMap(carta) {
  if (cartasMap.has(carta.instanceId)) {
    /*     console.error(
      `Tentativa de adicionar uma carta já existente no mapa com InstanceID: ${carta.instanceId}`
    ); */
  } else {
    cartasMap.set(carta.instanceId, carta);
    /*   //console.log(
      `Carta ${carta.name} de id ${carta.id} adicionada ao mapa para a key instanceId: ${carta.instanceId}`
    ); */
  }
  //console.log("Current cartasMap:", Array.from(cartasMap.keys()));
}

// ----------------------------------------------------------------

const lastBreathEffectsCards = [
  {
    id: 16,
    name: "O Revivente Eterno",
    resurrection: true,
    lastBreath: (cardObject, owner) => {
      cardObject.currentHealth = cardObject.maxHealth;
      const message = {
        type: "nextRoundEffect",
        effect: "resurrection",
        data: { cardData: cardObject },
      };
      owner.ws.send(JSON.stringify(message));
    },
  },

  {
    id: 17,
    name: "Replicador Maldito",
    lastBreath: () => {},
  },

  {
    id: 18,
    name: "Fênix das Trevas Profana",
    resurrection: true,
    lastBreath: (cardObject, owner) => {
      const newAttack = Number(cardObject.currentAttack) + 1;
      const newHealth = Number(cardObject.maxHealth) + 1;
      cardObject.updateStats(newAttack, newHealth);
      const message = {
        type: "nextRoundEffect",
        effect: "resurrection",
        data: { cardData: cardObject },
      };
      owner.ws.send(JSON.stringify(message));
    },
  },

  {
    id: 20,
    name: "O Espiritomante",
    resurrection: true,
    lastBreath: (cardObject, owner) => {
      cardObject.currentHealth = 1;
      const message = {
        type: "canPlayTheCard",
        data: { novaCarta: cardObject },
      };
      owner.ws.send(JSON.stringify(message));
    },
  },

  {
    id: 36,
    name: "Espírito Carregado",
    lastBreath: (cardObject, owner) => {
      const message = {
        type: "nextRoundEffect",
        effectType: "manaAddition",
        data: { cardData: cardObject , amount: 1},
      };
      owner.ws.send(JSON.stringify(message));
    },
  },
  {
    id: 89,
    name: "Vigia do Farol do Norte",
    lastBreath: (cardObject, owner) => {
      const message = {
        type: "cardDrawOrder",
        amount: 1
      };
      owner.ws.send(JSON.stringify(message));
    },
  },
];

// ----------------------------------------------------------------

function interpretDeckCode(deckCode, player) {
  //...
  let cardIds = deckCode.split("|");
  //let deckCardCount = cardIds.length;
  //let handCardCount = 0;

  //if (!editMode && deckCardCount < 30) {
  //alert('Tamanho do deck inválido.');
  //return;
  //}

  player.deck = new Map();

  cardIds.forEach((cardId) => {
    let cardData = cards.find((c) => c.id === parseInt(cardId));
    if (cardData) {
      // Instancia a carta usando a classe Carta
      let cardInstance = new Carta(
        cardData.id,
        cardData.name,
        cardData.baseCost,
        cardData.baseCost, // currentCost inicial é igual ao baseCost
        cardData.baseAttack,
        cardData.baseAttack, // currentAttack inicial é igual ao baseAttack
        cardData.baseHealth,
        cardData.baseHealth, // currentHealth inicial é igual ao baseHealth
        cardData.baseHealth, //maxHealth inicial é igual ao baseHealth
        cardData.baseSpeed,
        cardData.baseSpeed, // currentSpeed inicial é igual ao baseSpeed inicialmente
        cardData.keywords || [], // Keywords ou um array vazio
        player.id // OwnerId igual ao id do jogador
      );
      // Adiciona a carta ao mapa usando o instanceId como chave
      player.deck.set(cardInstance.instanceId, cardInstance);
      addCartaToMap(cardInstance);
    } else {
      //console.error("ID de carta inválida:", cardId);
      //console.error("Por favor, insira um código de deck válido!");
    }
  });

  //console.log(`Deck do jogador ${player.id} antes do embaralhamento:`);
  //console.table(Array.from(player.deck.entries()));

  shuffleDeck(player.deck, player);
}

//-------------

function shuffleDeck(deck, player) {
  // Verifica se o modo de edição está ativo
  //console.log("editMode?", editMode);

  // Converte o Map em um array de pares [chave, valor] e embaralha-o usando o algoritmo Fisher-Yates
  const deckArray = Array.from(deck.entries());
  //console.log("Deck como array antes do embaralhamento:");
  //console.table(deckArray);

  for (let i = deckArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckArray[i], deckArray[j]] = [deckArray[j], deckArray[i]];
  }

  // Cria um novo Map a partir do array embaralhado e atualiza o deck do jogador
  const shuffledDeck = new Map(deckArray);

  player.deck = shuffledDeck;

  console.log("Deck atual após embaralhamento:");
  console.table(Array.from(player.deck.entries()));

  // Prepara e envia a mensagem com o deck embaralhado para o cliente
  const message = {
    type: "deckShuffled",
    data: Array.from(player.deck.values()),
  };

  //console.log("Enviando deck embaralhado reformatado/convertido para um array");
  player.ws.send(JSON.stringify(message));

  console.log("Tamanho do deck de cada jogador:");
  players.forEach((p) => {
    console.log(`Jogador ${p.id}: ${p.deck.size} cartas`);
  });

  if (players.every((p) => p.deck.size === 24)) {
    console.log("Ambos os jogadores têm decks prontos, o jogo pode começar.");
    startTheGame();
  } else if (editMode && players.every((p) => p.deck.size > 0)) {
    startTheGame();
  }
}

//-----------------------------

function drawCardOrder(amount, player) {
  // Envia a carta comprada de volta ao servidor
  const message = {
    type: "cardDrawOrder",
    amount: amount,
  };
  /*   console.log(
    "Enviando mensagem de ordem de compra de carta para jogador. Quantidade e jogador respectivamente:"
  ); */
  ////console.table({ amount }, { player });
  player.ws.send(JSON.stringify(message));
  //console.log("A mensagem foi enviada ao jogador.");
}

function updateCardState(cardData, state) {
  const carta = cartasMap.get(Number(cardData.instanceId));
  carta.changeState(state);
}

//-----------------------------

function playCard(cardInstanceId, slotNumber, player) {
  let message = {};

  //console.log("playCard (serverSide) triggered.");

  const card = cartasMap.get(Number(cardInstanceId));

  if (card instanceof Carta) {
    let cardCost = card.currentCost;

    let availableMana = player.mana;

    let requiredMana = cardCost;

    let isManaEnoughToPlay = availableMana >= requiredMana ? true : false;

    isManaEnoughToPlay = editMode ? true : availableMana >= requiredMana;
    if (isManaEnoughToPlay) {
      message = {
        type: "canPlayTheCard",
        message: "O jogador pode escolher um slot para jogar a carta.",
        data: { card, slotNumber },
      };
    } else {
      //console.error("Mana do jogador insuficiente para jogar a carta.");
      /*    console.log(
        `Mana necessária: ${requiredMana}. Mana disponível: ${availableMana}`
      ); */
      message = {
        type: "cannotPlayTheCard",
        message: "Mana do jogador insuficiente. Jogada negada pelo servidor.",
      };
    }
    player.ws.send(JSON.stringify(message));
  } else {
    /*     console.error(
      `Carta instância da classe Carta não encontrada para a instanceId: ${Number(
        cardInstanceId
      )}`
    ); */
  }
}

//-----------------------------

function enableAttackForTheCard(messageData, player) {
  const { instanceId } = messageData;

  if (instanceId) {
    const carta = cartasMap.get(Number(instanceId));
    if (carta instanceof Carta) {
      carta.ready = true;

      const message = {
        type: "card Attack enabled",
        data: { carta },
      };

      player.ws.send(JSON.stringify(message));
    } else {
      //console.error('Instância-objeto carta não encontrado ou não é instância da classe Carta.');
    }
  } else {
    //console.error(`instanceId: ${instanceId} inválido.`);
  }
}

//-----------------------------

// Função para verificar morte e mover para o graveyard
function checkDeathAndAddToGraveyard(carta) {
  if (carta.currentHealth > 0) return false; // Se a carta não morreu, sai da função

  const cardOwner = players.find((p) => p.id === carta.ownerId);

  if (!cardOwner) {
    console.error(
      `Erro: jogador de ID (${carta.ownerId}) não encontrado para a carta ${carta.name} ${carta.instanceId}.`
    );
    return false;
  }

  if (carta.keywords.includes("último suspiro")) {
    const lastBreathEffectCard = lastBreathEffectsCards.find(
      (card) => card.id == carta.id
    );

    if (lastBreathEffectCard?.lastBreath) {
      console.log(
        `Executando efeito de último suspiro para a carta ${carta.name}.`
      );
      console.log(`Dono da carta: ${cardOwner.nickname}`);
      lastBreathEffectCard.lastBreath(carta, cardOwner); // Executa o efeito de último suspiro

      if (lastBreathEffectCard.resurrection) {
        console.log(
          "A adição da carta à graveyard não ocorrerá, porque o último suspiro se trata de alguma espécie de ressureição."
        );
        return false;
      }
    }
  }

  cardOwner.graveyard.set(carta.instanceId, carta); // Move a carta para o graveyard
  return true;
}

function checkAndExecuteGraveyardEffects() {
  console.log("Checando e executando efeitos de interação com a graveyard.");
  const allCardsInCurrentGame = Array.from(cartasMap.values());

  allCardsInCurrentGame.forEach((card) => {
    const cardWithEffect = graveyardInteractions.find((c) => c.id == card.id);

    if (!cardWithEffect) return; // Se não houver interação, pula para a próxima carta

    const { effect, inFieldOnly } = cardWithEffect;

    if (typeof effect !== "function") {
      console.error(
        `Efeito de interação com graveyard não é uma função para a carta: ${card.name} de id: ${card.id} e instanceId: ${card.instanceId}.`
      );
      return;
    }

    const carta = cartasMap.get(Number(card.instanceId));

    if (!inFieldOnly || card.state === "field") {
      const message = effect(carta);
      players.forEach((p) => {
        p.ws.send(JSON.stringify(message));
      });
    }
  });
}

// variável para controlar as cartas destruídas ao longo da partida
let cardsDestroyed = {
  byAllMeans: {
    byPlayer1: 0,
    byPlayer2: 0,
  },
  combatDamageOnly: {
    byPlayer1: 0,
    byPlayer2: 0,
  },
  allDamageSources: {
    byPlayer1: 0,
    byPlayer2: 0,
  },
  directDamageOnly: {
    byPlayer1: 0,
    byPlayer2: 0,
  },
  destructionEffects: {
    byPlayer1: 0,
    byPlayer2: 0,
  },
};

// Função para atualizar contadores de cartas destruídas
function updateCardsDestroyed(carta, cause) {
  const ownerId = carta.ownerId;
  const isPlayer1 = ownerId === player1.id;

  // Usar switch para lidar com diferentes causas
  switch (cause) {
    case "combatDamage":
      if (isPlayer1) {
        cardsDestroyed.combatDamageOnly.byPlayer1 += 1;
        cardsDestroyed.allDamageSources.byPlayer1 += 1;
      } else {
        cardsDestroyed.combatDamageOnly.byPlayer2 += 1;
        cardsDestroyed.allDamageSources.byPlayer2 += 1;
      }
      break;

    case "directDamage":  
    if (isPlayer1) {
      cardsDestroyed.directDamageOnlybyPlayer1 += 1;
      cardsDestroyed.allDamageSources.byPlayer1 += 1;
    } else {
      cardsDestroyed.directDamageOnlybyPlayer2 += 1;
      cardsDestroyed.allDamageSources.byPlayer2 += 1;
    }
    break;

    case "destructionEffect":
      if (isPlayer1) {
        cardsDestroyed.destructionEffects.byPlayer1 += 1;
      } else {
        cardsDestroyed.destructionEffects.byPlayer2 += 1;
      }
      break;

    default:
      console.warn(`Causa desconhecida: ${cause}`);
      break;
  }

  // Incrementa "byAllMeans" para todas as causas
  if (isPlayer1) {
    cardsDestroyed.byAllMeans.byPlayer1 += 1;
  } else {
    cardsDestroyed.byAllMeans.byPlayer2 += 1;
  }
  console.log('cardsDestroyed: ');
  console.table(cardsDestroyed);
}


function attackCard(cartaAlvoInstanceId, cartaAtacanteInstanceId, player) {
  // Recupera a instância da carta atacabte a partir do mapa usando o ID
  const cartaAtacante = cartasMap.get(Number(cartaAtacanteInstanceId));

  // Recupera a instância da carta alvo a partir do mapa usando o ID
  const cartaAlvo = cartasMap.get(Number(cartaAlvoInstanceId));

  if (!cartaAtacante || !cartaAlvo) {
    return;
  }

  if (!cartaAtacante.ready) {
    const message = {
      type: "cardCantAttack",
      data: { cartaAtacanteInstanceId },
    };

    player.ws.send(JSON.stringify(message));
    return;
  }

  const atacantePreviousHealth = cartaAtacante.currentHealth;
  const alvoPreviousHealth = cartaAlvo.currentHealth;

  const ataqueDoAtacante = cartaAtacante.currentAttack;

  // Carta atacante ataca carta alvo
  const attackResult = cartaAtacante.attack(cartaAlvo);

  // Se o resultado retornado pela função/método possuir a propriedade `type`, então o ataque não foi bem-sucedido.
  if (attackResult?.hasOwnProperty("type")) {
    player.ws.send(JSON.stringify(attackResult)); // Enviar a mensagem, valor retornado pela função de ataque
    return;
  }

  if (
    cartaAtacante.keywords.includes("dano excessivo") &&
    cartaAlvo.currentHealth <= 0
  ) {
    const targetHealthAfterHit = alvoPreviousHealth - ataqueDoAtacante;
    const excessDamage = Math.abs(targetHealthAfterHit);
    console.log(`excessDamage: ${excessDamage}.`);
    const avatarId = cartaAtacante.ownerId == player.id ? "opponent-health" : "player-health";
    directDamageToAvatar(excessDamage, avatarId, player);
  }

  if (cartaAtacante.keywords.includes("congelante")) {
    cartaAlvo.addKeyword("congelamento");
    const message = {
      type: 'keywordAdded',
      data: {cardData: cartaAlvo, keyword: 'congelamento', operation: 'addition'}
    }
    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    })
  }

  cartaAtacante.ready = false;
  const atacanteNewHealth = cartaAtacante.currentHealth;
  const alvoNewHealth = cartaAlvo.currentHealth;

  if (
    atacanteNewHealth === atacantePreviousHealth &&
    alvoNewHealth === alvoPreviousHealth
  ) {
    console.warn("Vida do atacante e vida do alvo são iguais aos valores de vida anteriores.");
    return;
  }

  // atualizar, substituir, sobrescrever entradas das instâncias das cartas para novos valores de vida após o combate
  cartasMap.set(Number(cartaAtacanteInstanceId), cartaAtacante);
  cartasMap.set(Number(cartaAlvoInstanceId), cartaAlvo);

  // Verificar se as cartas morreram
  [cartaAtacante, cartaAlvo].forEach((carta, index) => {
    if (checkDeathAndAddToGraveyard(carta)) {
      checkAndExecuteGraveyardEffects();
      updateCardsDestroyed(carta, "combatDamage");
    }
  });

  /*   console.log(
    `Vida da carta atacante após o ataque: ${cartaAtacante.currentHealth}`
  ); */
  //console.log(`Vida da carta alvo após o ataque: ${cartaAlvo.currentHealth}`);

  // Cria a mensagem para enviar ao cliente
  let message = {
    type: "cardsCombatsResults",
    data: {
      cartaAtacante,
      cartaAlvo,
    },
  };
  players.forEach((player) => {
    player.ws.send(JSON.stringify(message));
  });
}

//-----------------------------

function attackAvatar(data, player) {
  let messageToPlayer;
  let messageToTheOtherPlayer;

  console.table(data);
  const { cartaAtacanteInstanceId, targetAvatar } = data;

  // Inicializar o outro jogador
  const otherPlayer = players.find((p) => p.id !== player.id);

  const directDamage = false;

  // Verifica se há um alvo e uma carta atacante válida
  if (targetAvatar && cartaAtacanteInstanceId) {
    const carta = cartasMap.get(Number(cartaAtacanteInstanceId));

    if (carta) {
      if (!carta.ready) {
        //console.warn(`A carta ${carta.name} de instanceId ${carta.instanceId} não está pronta para atacar.`);

        const message = {
          type: "cardCantAttack",
          data: { cartaAtacanteInstanceId },
        };
        player.ws.send(JSON.stringify(message));
        return;
      }

      const damage = carta.currentAttack;

      // Log inicial para identificar a função sendo chamada
      console.log(
        `attackAvatar foi chamado. Damage: ${damage}, Target: ${targetAvatar}, Player ID: ${player.id}`
      );

      if (targetAvatar === "enemy") {
        // Aplica dano ao avatar inimigo
        enemyAvatar.takeDamage(damage);

        // Log para verificar a saúde do inimigo após o dano
        console.log(
          `Inimigo recebeu dano. Nova saúde do inimigo: ${enemyAvatar.health}`
        );

        otherPlayer.avatarLife = enemyAvatar.health;

        // Mensagem enviada ao jogador atual, indicando que o inimigo tomou dano
        messageToPlayer = {
          type: "applyDamageToAvatar",
          data: {
            carta,
            avatarData: enemyAvatar,
            targetAvatar: "enemy", // O jogador está atacando o inimigo
            directDamage,
          },
        };

        // Mensagem enviada ao OUTRO jogador, indicando que o avatar dele tomou dano
        messageToTheOtherPlayer = {
          type: "applyDamageToAvatar",
          data: {
            carta,
            avatarData: enemyAvatar,
            targetAvatar: "ally", // O outro jogador vê seu avatar sendo danificado
            directDamage,
          },
        };
      } else {
        // Aplica dano ao avatar aliado
        alliedAvatar.takeDamage(damage);

        // Log para verificar a saúde do aliado após o dano
        console.log(
          `Aliado recebeu dano. Nova saúde do aliado: ${alliedAvatar.health}`
        );

        player.avatarLife = alliedAvatar.health;

        // Mensagem enviada ao jogador atual, indicando que o aliado tomou dano
        messageToPlayer = {
          type: "applyDamageToAvatar",
          data: {
            carta,
            avatarData: alliedAvatar,
            targetAvatar: "ally", // O jogador vê seu avatar sendo danificado
            directDamage,
          },
        };

        // Mensagem enviada ao outro jogador, indicando que o inimigo dele tomou dano
        messageToTheOtherPlayer = {
          type: "applyDamageToAvatar",
          data: {
            carta,
            avatarData: alliedAvatar,
            targetAvatar: "enemy", // O outro jogador vê seu inimigo sendo danificado
            directDamage,
          },
        };
      }

      carta.ready = false;
      //console.log(`A carta ${carta.name} de instanceId ${carta.instanceId} não pode mais atacar nesta rodada (carta.ready = ${carta.ready})`);

      // Envia a mensagem ao jogador atual
      player.ws.send(JSON.stringify(messageToPlayer));

      otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));

      // Log para confirmar o envio das mensagens
      console.log(
        `Mensagens de dano enviadas para o jogador atual e o outro jogador.`
      );
    } else {
      console.warn("Carta atacante não encontrada.");
    }
  } else {
    console.warn("Target ou cartaAtacanteInstanceId inválidos.");
  }
}

//-----------------------------

function dealDirectDamage(damage, cardInstanceId) {
  //console.log("dealDirectDamage chamada.");
  const carta = cartasMap.get(Number(cardInstanceId));
  if (carta instanceof Carta) {
    if (carta.takeDamage(damage)) {
      if (checkDeathAndAddToGraveyard(carta)) {
        updateCardsDestroyed(carta, 'directDamage');
      };  
    };

    let message = {
      type: "applyDamageToCard",
      data: carta,
    };

    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
  } else {
    /*     console.warn(
      `Não foi possível encontrar a carta no mapa de cartas para o instanceId (${cardInstanceId})`
    ); */
  }
}

//-----------------------------

function directDamageToAvatar(damage, avatarId, player) {
  /*   console.log(
    `directDamageToAvatar chamada. Damage: ${damage}, avatarId: ${avatarId}, Player: ${player.nickname}`
  );
 */
  let messageToPlayer;
  let messageToTheOtherPlayer;

  // Encontra o outro jogador e envia a mensagem
  const theOtherPlayer = players.find((p) => p.id !== player.id);

  const directDamage = true;

  // Aplica dano ao avatar correspondente
  if (avatarId === "player-health") {
    //console.log("Aplicando dano ao avatar aliado.");
    //console.log(`Vida do avatar antes: ${alliedAvatar.health}`);
    alliedAvatar.takeDamage(damage);
    //console.log(`Vida do avatar depois: ${alliedAvatar.health}`);

    // Prepara a mensagem a ser enviada para o jogador atual
    messageToPlayer = {
      type: "applyDamageToAvatar",
      data: { targetAvatar: "ally", avatarData: alliedAvatar, directDamage },
    };

    // Prepara a mensagem a ser enviada para o outro jogador
    messageToTheOtherPlayer = {
      type: "applyDamageToAvatar",
      data: { targetAvatar: "opponent", avatarData: alliedAvatar, directDamage },
    };

    // Envia a mensagem ao jogador atual
    //console.log(`Enviando mensagem de dano para o jogador: ${player.nickname}`);
    player.ws.send(JSON.stringify(messageToPlayer));

    if (theOtherPlayer) {
      /*     console.log(
        `Enviando mensagem de dano para o outro jogador: ${theOtherPlayer.nickname}`
      ); */
      theOtherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
    } else {
      //console.error("Outro jogador não encontrado.");
    }
  } else if (avatarId === "opponent-health") {
    //console.log("Aplicando dano ao avatar inimigo.");
    //console.log(`Vida do avatar antes: ${enemyAvatar.health}`);
    enemyAvatar.takeDamage(damage);
    //console.log(`Vida do avatar depois: ${enemyAvatar.health}`);

    // Prepara a mensagem a ser enviada para o jogador atual
    messageToPlayer = {
      type: "applyDamageToAvatar",
      data: { targetAvatar: "enemy", avatarData: enemyAvatar, directDamage },
    };

    // Prepara a mensagem a ser enviada para o outro jogador
    messageToTheOtherPlayer = {
      type: "applyDamageToAvatar",
      data: { targetAvatar: "ally", avatarData: enemyAvatar, directDamage },
    };

    // Envia a mensagem ao jogador atual
    //console.log(`Enviando mensagem de dano para o jogador: ${player.nickname}`);
    player.ws.send(JSON.stringify(messageToPlayer));

    if (theOtherPlayer) {
      /*     console.log(
        `Enviando mensagem de dano para o outro jogador: ${theOtherPlayer.nickname}`
      ); */
      theOtherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
    } else {
      //console.error("Outro jogador não encontrado.");
    }
  } else {
    //console.error(`avatarId inválido: ${avatarId}`);
    return; // Sai da função caso o avatarId não seja válido
  }
}

//-----------------------------

function healCard(instanceId, healingAmount) {
  let carta = cartasMap.get(Number(instanceId));

  if (carta) {
    carta.healCard(healingAmount);

    let message = {
      type: "applyHealingToCard",
      data: carta,
    };

    /*     console.log(
      "Enviando mensagem de ordem de aplicação de cura a carta do servior para os jogadores."
    ); */

    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
  } else {
    /*     console.warn(
      `Carta não encontrada no mapa para a instanceId: ${instanceId}`
    ); */
  }
}

//-----------------------------

function healAvatar(avatarType, healingAmount, player) {
  // Encontre o outro jogador
  const otherPlayer = players.find((p) => p.id !== player.id);

  if (avatarType === "allied") {
    // Cure o avatar aliado
    alliedAvatar.heal(healingAmount);

    // Mensagem para o jogador que fez a solicitação
    let messageToPlayer = {
      type: "applyHealingToAvatar",
      data: {
        avatarType: "allied",
        newHealth: alliedAvatar.health,
      },
    };
    player.ws.send(JSON.stringify(messageToPlayer));

    // Mensagem para o outro jogador
    let messageToTheOtherPlayer = {
      type: "applyHealingToAvatar",
      data: {
        avatarType: "enemy",
        newHealth: alliedAvatar.health,
      },
    };
    otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
  } else if (avatarType === "enemy") {
    // Cure o avatar inimigo
    enemyAvatar.heal(healingAmount);

    // Mensagem para o jogador que fez a solicitação
    let messageToPlayer = {
      type: "applyHealingToAvatar",
      data: {
        avatarType: "enemy",
        newHealth: enemyAvatar.health,
      },
    };
    player.ws.send(JSON.stringify(messageToPlayer));

    // Mensagem para o outro jogador
    let messageToTheOtherPlayer = {
      type: "applyHealingToAvatar",
      data: {
        avatarType: "allied",
        newHealth: enemyAvatar.health,
      },
    };
    otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
  }
}

//------------------------------

function recallCard(messageData, player) {
  //console.log("recallCard (server-side) chamada.");

  const cardInstanceId = Number(messageData.cardInstanceId);

  const cardOwner = player;

  const otherPlayer = players.find((p) => p.id !== player.id);

  const carta = cartasMap.get(cardInstanceId);

  if (carta instanceof Carta) {
    const messageToTheOwner = {
      type: "recallCardOrder",
      data: carta,
    };

    const messageToTheOtherPlayer = {
      type: "removeCardFromTheField",
      data: carta,
    };
    cardOwner.ws.send(JSON.stringify(messageToTheOwner));
    otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
  }
}

//------------------------------
function handleSpeedUpdateRequest(data, requestType, player) {
  const { cardInstanceId, amount } = data;

  if (!cardInstanceId || isNaN(amount)) {
    /*     console.error(
      "Valores da variável cardInstanceId ou da variável amount recebidos do cliente inválidos ou inexistentes."
    ); */
    return;
  }

  const carta = cartasMap.get(Number(cardInstanceId));

  if (!(carta instanceof Carta)) {
    console.error(
      `Carta com instanceId ${cardInstanceId} não encontrada no mapa ou não é instância da classe Carta.`
    );
    return;
  }

  console.log(
    `Velocidade da carta ${carta.name}, de instanceId = ${carta.instanceId} ANTES: ${carta.currentSpeed}`
  );

  if (requestType === "increase") {
    // Aumenta a velocidade, limitando a um máximo de 6
    carta.currentSpeed = Math.min(carta.currentSpeed + Number(amount), 6);
  } else if (requestType === "decrease") {
    // Diminui a velocidade, limitando a um mínimo de -1
    carta.currentSpeed = Math.max(carta.currentSpeed - Number(amount), -1);
  } else {
    console.error(`Valor de requestType = ${requestType} indefinido/inválido.`);
    return;
  }

  console.log(
    `Velocidade da carta ${carta.name}, de instanceId = ${carta.instanceId} DEPOIS: ${carta.currentSpeed}`
  );

  const message = {
    type: "cardSpeedUpdated",
    data: carta,
  };

  console.log("Tentando enviar mensagem ao cliente...");
  player.ws.send(JSON.stringify(message));
  console.log("Mensagem enviada com sucesso.");
}

//------------------------------

function keywordAddition(instanceId, keyword) {
  const carta = cartasMap.get(Number(instanceId));
  if (!carta instanceof Carta) {
    /*     console.error(
      `Objeto de carta inválido - não encontrado no mapa para a instanceId (${instanceId}) ou não é instância da classe Carta.`
    ); */
    return;
  }

  carta.addKeyword(keyword);

  console.log("CardData enviado ao cliente:", carta);

  const message = {
    type: "keywordAdded",
    data: { cardData: carta, keyword, operation: "addition" },
  };

  players.forEach((p) => {
    p.ws.send(JSON.stringify(message));
  });
}

function removeCardKeyword(data) {
  const { cardInstanceId, removedKeywords } = data;

  const carta = cartasMap.get(Number(cardInstanceId));

  // Verifique se a carta foi encontrada
  if (carta) {
    // Remover as keywords negativas do objeto carta
    removedKeywords.forEach((keyword) => {
      console.log("Removendo keyword:", keyword);
      carta.removeKeyword(keyword);

      const message = {
        type: "keywordRemoved",
        data: { cardData: carta, keyword, operation: "removal" },
      };

      players.forEach((p) => {
        p.ws.send(JSON.stringify(message));
      });
    });
    console.log("Keywords após remoção:", carta.keywords);

    // Você pode adicionar aqui qualquer lógica adicional, como notificar o cliente
    //console.log(`Removed keywords: ${removedKeywords.join(', ')} from card ID: ${carta.id}`);
  } else {
    //console.warn(`Carta com ID ${cardInstanceId} não encontrada.`);
  }
}

//------------------------------

function battlefieldUpdateOrder(message, player) {
  //console.log("battlefieldUpdateOrder triggered.");
  //console.log("Mensagem recebida:", message);
  //console.log("Tipo da mensagem:", message.type);

  let newMessage;

  if (message.type === "addCardToOpponentField") {
    //console.log("Tipo de mensagem é addCardToOpponentField.");

    // Verifica se a carta está no mapa de cartas
    const carta = cartasMap.get(Number(message.data.cardInstanceId));
    if (!carta) {
      /*       console.error(
        `Carta com instanceId ${message.data.carta.instanceId} não encontrada no mapa de cartas.`
      ); */
      return;
    }

    //console.log("Carta encontrada:", carta);

    // Atualiza o estado da carta
    carta.changeState("field");
    //console.log('Estado da carta alterado para "field".');

    // Remove a carta do deck do jogador
    player.deck.delete(Number(message.data.cardInstanceId));
    //console.log("Carta removida do deck do jogador.");

    const slotNumber = message.data.slotNumber;

    // Prepara a mensagem para enviar ao oponente
    newMessage = {
      type: "addCardToOpponentField",
      data: { carta, slotNumber },
    };
    //console.log("Mensagem preparada para enviar ao oponente:", newMessage);

    // Envia a mensagem para o outro jogador
    const opponent = players.find((p) => p.id !== player.id);
    if (opponent) {
      //console.log(`Enviando mensagem para oponente ${opponent.id}.`);
      opponent.ws.send(JSON.stringify(newMessage));
    } else {
      //console.error("Oponente não encontrado.");
    }
  } else if (message.type === "buffOrDebuffRequest") {
    //console.log("Tipo de mensagem é buffOrDebuffRequest.");

    const { data } = message;
    if (data) {
      let { cardInstanceId } = data;
      cardInstanceId = Number(cardInstanceId);

      if (cardInstanceId) {
        let carta = cartasMap.get(cardInstanceId);

        if (carta) {
          const attackChange = Number(message.data.attackChange);
          const newAttack = Number(carta.currentAttack + attackChange);
          const healthChange = Number(message.data.healthChange);
          const newHealth = Number(carta.currentHealth + healthChange);
          carta.updateStats(newAttack, newHealth);

          // Prepara a mensagem para enviar ao oponente
          newMessage = {
            type: "buffCard",
            data: carta,
          };
          /*           console.log(
            "Mensagem preparada para enviar ao oponente:",
            newMessage
          ); */

          // Envia a mensagem para os jogadores atualizarem seus DOM's de modo a refletir a carta agora buffada
          players.forEach((p) => {
            p.ws.send(JSON.stringify(newMessage));
          });
        } else {
          /*           console.error(
            "Objeto de carta não encontrado para a instanceId:",
            cardInstanceId
          ); */
        }
      } else {
        /*         console.error(
          "message.data não possui uma propriedade chamada cardInstanceId."
        ); */
      }
    }
  } else if (message.type === "summonCardRequest") {
    const cardId = Number(message.data.cardId);
    const baseCardData = cards.find((c) => c.id === cardId);

    if (baseCardData) {
      const novaCarta = new Carta(
        baseCardData.id,
        baseCardData.name,
        baseCardData.baseCost,
        baseCardData.baseCost, // currentCost inicial é igual ao baseCost
        baseCardData.baseAttack,
        baseCardData.baseAttack, // currentAttack inicial é igual ao baseAttack
        baseCardData.baseHealth,
        baseCardData.baseHealth, // currentHealth inicial é igual ao baseHealth
        baseCardData.baseHealth, //maxHealth inicial é igual ao baseHealth
        baseCardData.baseSpeed,
        baseCardData.baseSpeed, // currentSpeed inicial é igual à baseSpeed
        baseCardData.keywords || [], // Keywords ou um array vazio
        player.id // ownerId é igual a id do jogador que solicitou a invocação da carta
      );
      addCartaToMap(novaCarta);

      const slotNumber = message.data.slotNumber;

      newMessage = {
        type: "canPlayTheCard",
        data: { novaCarta, slotNumber },
      };

      player.ws.send(JSON.stringify(newMessage));
    } else {
      //console.error(`Dados da carta não encontrados para a id: ${cardId}`);
    }
  } else {
    //console.error("Tipo de mensagem desconhecido:", message.type);
  }
}

//------------------------------

function handleSpecialBuffRequest(cardInstanceId, condition) {
  //console.log(`Processando specialBuffRequest para cardInstanceId: ${cardInstanceId}, condição: ${condition}`);

  const carta = cartasMap.get(Number(cardInstanceId));
  if (!carta) {
    console.error(
      `Carta com instanceId ${cardInstanceId} não encontrada no cartasMap.`
    );
    return;
  }

  let newAttack = 0;
  let newHealth = 0;

  switch (condition) {
    case "both-graveyard-size":
      if (
        players.length < 2 ||
        !players[0].graveyard ||
        !players[1].graveyard
      ) {
        console.error(
          "Requisição falhou: Não há jogadores suficientes ou cemitérios não inicializados."
        );
        return;
      }

      const graveyard1 = Array.from(players[0].graveyard.entries()).length;
      const graveyard2 = Array.from(players[1].graveyard.entries()).length;
      const graveyardSize = graveyard1 + graveyard2;

      //console.log(`Tamanho dos cemitérios: Jogador 1 = ${graveyard1}, Jogador 2 = ${graveyard2}, Total = ${graveyardSize}`);

      newAttack = carta.currentAttack + graveyardSize;
      newHealth = carta.currentHealth + graveyardSize;

      carta.updateStats(newAttack, newHealth);

      //console.log(`Nova carta: Ataque = ${newAttack}, Vida = ${newHealth}`);

      break;
    
    case "cards-destroyed-by-effects":
      const buff = cardsDestroyed.destructionEffects.byPlayer1 + cardsDestroyed.destructionEffects.byPlayer2;
      newAttack = carta.currentAttack + buff;
      newHealth = carta.currentHealth + buff;
      carta.updateStats(newAttack, newHealth)
      break;

    default:
      console.warn(`Condição desconhecida no specialBuffRequest: ${condition}`);
      break;
  }

  const message = {
    type: "buffCard",
    data: carta,
  };

  players.forEach((p, index) => {
    console.log(
      `Enviando buffCard para Jogador ${index + 1}:`,
      JSON.stringify(message)
    );
    p.ws.send(JSON.stringify(message));
  });

}

function gameOver(winner) {
  //console.log("gameOver chamada.");
  //console.log(`winner: ${winner}`);

  let messageToTheWinner = {
    type: "gameOver",
    data: "winner",
  };

  winner.ws.send(JSON.stringify(messageToTheWinner));
  //console.log("Mensagem enviada ao vencedor da partida.");

  let messageToTheLoser = {
    type: "gameOver",
    data: "loser",
  };

  const loser = players.find((p) => p.id !== winner.id);
  loser.ws.send(JSON.stringify(messageToTheLoser));
  //console.log("Mensagem enviada ao perdedor da partida.");
}

//------------------------------

let currentRoundIndex = 1;

function handleEndRoundRequest(player) {
  if (player.id) {
    roundEndRequests++;

    if (roundEndRequests === 1) {
      const message2 = {
        type: "yourTurn",
        data: "you can play now.",
      };
      const theOtherPlayer = players.find((p) => p.id !== player.id);
      theOtherPlayer.ws.send(JSON.stringify(message2));

      const message1 = {
        type: "notYourTurn",
        data: "you cannot play now.",
      };
      player.ws.send(JSON.stringify(message1));
    }

    if (roundEndRequests === 2) {
      const message = {
        type: "endTheRoundOrder",
      };

      players.forEach((p) => {
        drawCardOrder(1, p);
        p.ws.send(JSON.stringify(message));
      });

      //console.log("Rodada finalizada. Enviando mensagem para os jogadores.");
      currentRoundIndex++;
      roundEndRequests = 0;

      const message1 = {
        type: "yourTurn",
        data: "you can play now.",
      };

      const message2 = {
        type: "notYourTurn",
        data: "you cannot play now.",
      };

      whoPlaysFirst.ws.send(JSON.stringify(message1));
      const secondToPlay = players.find((p) => p.id !== whoPlaysFirst.id);
      secondToPlay.ws.send(JSON.stringify(message2));
    } else {
      //console.log("roundEndRequests ainda não é igual a 2.");
    }
  }
}
