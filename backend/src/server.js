console.log("Servidor está iniciando...");

import { WebSocketServer } from "ws";

import crypto from "crypto";

const wss = new WebSocketServer({ port: 8081 });

let players = [];

wss.on("connection", (ws) => {
  console.log("Nova conexão estabelecida.");
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
    console.log("Mensagem recebida no servidor:", data);
    try {
      let parsedMessage = JSON.parse(data);
      handleMessageFromPlayer(parsedMessage, player);
    } catch (error) {
      console.error("Erro ao processar mensagem JSON:", error);
    }
  });

  ws.on("close", () => {
    players = players.filter((p) => p.id !== player.id);
    console.log(`Jogador ${player.id} desconectado.`);
    console.log(`players.length ${players.length}`);

    let message = {
      type: "playerDisconnected",
    };
    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
    players = [];
    enemyAvatar.health = 25;
    alliedAvatar.health = 25;
  });

  console.log("O Servidor está ligado.");
});

console.log("Servidor WebSocket escutando na porta 8081...");

// -----------------------------------------------------------------------

let turnEndRequests = 0;

function handleMessageFromPlayer(parsedMessage, player) {
  console.log("Mensagem recebida do jogador:");
  console.log(player.nickname);
  console.log("Tipo da mensagem:", parsedMessage.type);

  switch (parsedMessage.type) {
    case "newUserLogin":
      if (parsedMessage.nickname) {
        // Verifica se o nickname já está em uso
        const nicknameExists = players.some(
          (existingPlayer) => existingPlayer.nickname === parsedMessage.nickname
        );

        if (nicknameExists) {
          console.error(
            `O nickname "${parsedMessage.nickname}" já está em uso.`
          );
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
        players.push(player);
        console.log(
          `Jogador ${player.nickname} conectado com ID ${player.id} e IP ${player.ip}`
        );

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
        console.error(
          "Mensagem de login recebida sem nickname:",
          parsedMessage
        );
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
        console.log(
          "Pedido de jogada de carta recebido do jogador para a carta com a instanceId: ",
          cardInstanceId
        );

        playCard(cardInstanceId, slotNumber, player);

        if (turnEndRequests === 1) {
          let message = {
            type: "turnEndRequestDenied",
          };
          console.log(
            "Um jogador não aceitou a finalização de turno e realizou uma ação, enviando mensagem para o outro jogador para que ele desbloqueie suas ações."
          );
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
        console.log(`parsedMessage${parsedMessage}`);
        battlefieldUpdateOrder(parsedMessage, player);
      }
      break;

    case "attackCardRequest":
      if (parsedMessage.data) {
        console.log(`parsedMessage.data ${JSON.stringify(parsedMessage.data)}`);
        attackCard(
          parsedMessage.data.cartaAlvoInstanceId,
          parsedMessage.data.cartaAtacanteInstanceId,
          player
        );

        if (turnEndRequests === 1) {
          let message = {
            type: "turnEndRequestDenied",
          };
          console.log(
            "Um jogador não aceitou a finalização de turno e realizou uma ação, enviando mensagem para o outro jogador para que ele desbloqueie suas ações."
          );
          const theOtherPlayer = players.find((p) => p.id !== player.id);
          theOtherPlayer.ws.send(JSON.stringify(message));
        }
      }
      break;

    case "attackTheAvatar":
      if (parsedMessage.data) {
        damageAvatar(parsedMessage.data, player);

        if (turnEndRequests === 1) {
          let message = {
            type: "turnEndRequestDenied",
          };
          console.log(
            "Um jogador não aceitou a finalização de turno e realizou uma ação, enviando mensagem para o outro jogador para que ele desbloqueie suas ações."
          );
          const theOtherPlayer = players.find((p) => p.id !== player.id);
          theOtherPlayer.ws.send(JSON.stringify(message));
        }
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
        console.warn(
          "Variável damage e/ou variável cardInstanceId recebidas do jogador não possuem valores válidos."
        );
      }
      break;

    case "directDamageToAvatar":
      if (parsedMessage.data.damage && parsedMessage.data.avatarId) {
        const damage = parsedMessage.data.damage;
        const avatarId = parsedMessage.data.avatarId;
        directDamageToAvatar(damage, avatarId, player);
      } else {
        console.warn(
          `Variável damage e/ou variável cardInstanceId recebidas do jogador não possuem valores válidos`
        );
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
          let message = {
            type: "destroyCardOrder",
            data: carta,
          };
          players.forEach((p) => {
            p.ws.send(JSON.stringify(message));
          });
        }
      }
      break;

    case "keywordAdditionRequest":
      if (parsedMessage.data.keyword && parsedMessage.data.instanceId) {
        const instanceId = parsedMessage.data.instanceId;
        const keyword = parsedMessage.data.keyword;

        keywordAddition(instanceId, keyword);
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
              console.log(`Custo da carta ${carta.name} (instanceId: ${instanceId}) atualizado para ${newCost}.`);
              cartasMap.set(Number(carta.instanceId), carta);
            } else {
              // Log de erro caso a carta não seja encontrada no mapa
              console.error(`Instância-objeto carta não encontrada no mapa para a instanceId ${instanceId}.`);
            }
          } else {
            // Log de erro caso instanceId não seja um número válido
            console.error(`instanceId ${instanceId} não possui um valor válido.`);
          }
        } else {
          // Log de erro se os dados necessários não estiverem presentes na mensagem
          console.error(`Dados insuficientes na mensagem para atualizar o custo da carta: ${JSON.stringify(parsedMessage.data)}`);
        }
        break;
      
    case "nextTurnEffect":
      if (parsedMessage.data) {
        let effectFunction = new Function("return " + parsedMessage.data)();
        addNextTurnEffect(effectFunction);
      }
      break;

    case "updateManaAmount":
      if (parsedMessage.data.mana) {
        const { mana } = parsedMessage.data;
        if (!isNaN(Number(mana))) {
          player.mana = mana;
          console.log(
            `Mana do jogador (${player.nickname}) atualizada para: ${player.mana}`
          );
        }
      }
      break;

    case "endTurnRequest":
      handleEndTurnRequest(player);
      break;

    case "myUpdatedScore":
      if (parsedMessage.data.playerMatchPoints) {
        const { playerMatchPoints } = parsedMessage.data;
        player.score = playerMatchPoints;
        if (player.score >= 6) {
          gameOver(player);
        }
      } else {
        console.error(
          `A variável playerMatchPoints ${playerMatchPoints} recebida do jogador ${parsedMessage.username} não contém um valor válido`
        );
      }
      break;

    default:
      console.log("Tipo de mensagem desconhecido:", parsedMessage.type);
      break;
  }
}

// ---------------------------------------------

import { cards } from "../../frontend/js/cards.js"; // importando as cartas

import { Carta, Avatar } from "../../frontend/js/POO.js";

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

//----------------------------------------------------------------

let editMode = false;

// ----------------------------------------------------------------

// Mapa para armazenar instâncias das cartas
export const cartasMap = new Map();

// Função para adicionar uma nova carta ao mapa
function addCartaToMap(carta) {
  if (cartasMap.has(carta.instanceId)) {
    console.error(
      `Tentativa de adicionar uma carta já existente no mapa com InstanceID: ${carta.instanceId}`
    );
  } else {
    cartasMap.set(carta.instanceId, carta);
    console.log(
      `Carta ${carta.name} de id ${carta.id} adicionada ao mapa para a key instanceId: ${carta.instanceId}`
    );
  }
  console.log("Current cartasMap:", Array.from(cartasMap.keys()));
}

// ----------------------------------------------------------------

const lastBreathEffectsCards = [
  {
    id: 16,
    name: "O Revivente Eterno",
    lastBreath: () => {},
  },

  {
    id: 17,
    name: "Replicador Maldito",
    lastBreath: () => {},
  },

  {
    id: 18,
    name: "Fênix das Trevas Profana",
    lastBreath: () => {},
  },

  {
    id: 20,
    name: "O Espiritomante",
    lastBreath: () => {},
  },

  {
    id: 21,
    name: "Jeff-The-Death",
    ressurrection: true,
    lastBreath: (cardObject, owner) => {
      const messageData = { 
        cardObject : cardObject,
        cardInstanceId : cardObject.instanceId
      };
      recallCard(messageData, owner);
      const healingAmount = cardObject.maxHealth - cardObject.currentHealth;
      healCard(cardObject.instanceId, healingAmount);
      // fazê-lo custar 3 a menos
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
        cardData.speed,
        cardData.keywords || [] // Keywords ou um array vazio
      );
      // Adiciona a carta ao mapa usando o instanceId como chave
      player.deck.set(cardInstance.instanceId, cardInstance);
      addCartaToMap(cardInstance);
    } else {
      console.error("ID de carta inválida:", cardId);
      console.error("Por favor, insira um código de deck válido!");
    }
  });

  console.log(`Deck do jogador ${player.id} antes do embaralhamento:`);
  console.table(Array.from(player.deck.entries()));

  shuffleDeck(player.deck, player);
}

//-------------

function shuffleDeck(deck, player) {
  // Verifica se o modo de edição está ativo
  console.log("editMode?", editMode);

  // Converte o Map em um array de pares [chave, valor] e embaralha-o usando o algoritmo Fisher-Yates
  const deckArray = Array.from(deck.entries());
  console.log("Deck como array antes do embaralhamento:");
  console.table(deckArray);

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

  console.log("Enviando deck embaralhado reformatado/convertido para um array");
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
  console.log(
    "Enviando mensagem de ordem de compra de carta para jogador. Quantidade e jogador respectivamente:"
  );
  //console.table({ amount }, { player });
  player.ws.send(JSON.stringify(message));
  console.log("A mensagem foi enviada ao jogador.");
}

function updateCardState(cardData, state) {
  const carta = cartasMap.get(Number(cardData.instanceId));
  carta.changeState(state);
}

//-----------------------------

function playCard(cardInstanceId, slotNumber, player) {
  let message = {};

  console.log("playCard (serverSide) triggered.");

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
      console.error("Mana do jogador insuficiente para jogar a carta.");
      console.log(
        `Mana necessária: ${requiredMana}. Mana disponível: ${availableMana}`
      );
      message = {
        type: "cannotPlayTheCard",
        message: "Mana do jogador insuficiente. Jogada negada pelo servidor.",
      };
    }
    player.ws.send(JSON.stringify(message));
  } else {
    console.error(
      `Carta instância da classe Carta não encontrada para a instanceId: ${Number(
        cardInstanceId
      )}`
    );
  }
}

//-----------------------------

function attackCard(cartaAlvoInstanceId, cartaAtacanteInstanceId, player) {
  // Recupera a instância da carta atacabte a partir do mapa usando o ID
  const cartaAtacante = cartasMap.get(Number(cartaAtacanteInstanceId));

  // Recupera a instância da carta alvo a partir do mapa usando o ID
  const cartaAlvo = cartasMap.get(Number(cartaAlvoInstanceId));

  if (!cartaAtacante || !cartaAlvo) {
    console.error(
      `Erro ao encontrar as cartas pelos instanceId's (${
        (cartaAlvoInstanceId, cartaAtacanteInstanceId)
      }). Verifique se os IDs estão corretos.`
    );
    return;
  }

  // Função auxiliar para verificar morte e mover para o graveyard
  function checkDeathAndAddToGraveyard(carta) {
    if (carta.currentHealth <= 0) {
      console.log(
        `A carta ${carta.name} morreu e será movida para o graveyard.`
      );

      // Verifica se a carta tem o efeito "último suspiro"
      if (carta.keywords.includes("último suspiro")) {
        const lastBreathEffectCard = lastBreathEffectsCards.find(
          (card) => card.id == carta.id
        );
        if (
          lastBreathEffectCard &&
          typeof lastBreathEffectCard.lastBreath === "function"
        ) {
          console.log(
            `Executando efeito de último suspiro para a carta ${carta.name}.`
          );
          lastBreathEffectCard.lastBreath(carta, player); // Chama o efeito da carta

          if (lastBreathEffectCard.ressurrection) {
            console.log('A adição da carta à graveyard não ocorrerá, porque o último suspiro se trata de alguma espécie de ressureição.');
            return;
          }

        }
      }

      // Determina o graveyard correto com base em isAlly
      if (carta.isAlly) {
        console.log(
          `Movendo carta ${carta.name} para o graveyard do jogador aliado.`
        );
        player.graveyard.set(carta.instanceId, carta);
      } else {
        console.log(
          `Movendo carta ${carta.name} para o graveyard do oponente.`
        );
        const opposingPlayer = players.find((p) => p.id !== player.id);
        opposingPlayer.graveyard.set(carta.instanceId, carta);
      }
    }
  }

  const atacantePreviousHealth = cartaAtacante.currentHealth;
  const alvoPreviousHealth = cartaAlvo.currentHealth;
  cartaAtacante.attack(cartaAlvo);
  const atacanteNewHealth = cartaAtacante.currentHealth;
  const alvoNewHealth = cartaAlvo.currentHealth;

  if (atacanteNewHealth === atacantePreviousHealth && alvoNewHealth === alvoPreviousHealth) {
    return;
  }

  // atualizar, substituir, sobrescrever entradas das instâncias das cartas para novos valores de vida após o combate
  cartasMap.set(Number(cartaAtacanteInstanceId), cartaAtacante);
  cartasMap.set(Number(cartaAlvoInstanceId), cartaAlvo);

  // Verificar se as cartas morreram
  checkDeathAndAddToGraveyard(cartaAtacante);
  checkDeathAndAddToGraveyard(cartaAlvo);

  console.log(
    `Vida da carta atacante após o ataque: ${cartaAtacante.currentHealth}`
  );
  console.log(`Vida da carta alvo após o ataque: ${cartaAlvo.currentHealth}`);

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

function damageAvatar(data, player) {
  let messageToPlayer;
  let messageToTheOtherPlayer;

  const target = data.target;
  const cartaAtacanteInstanceId = data.cartaAtacanteInstanceId;

  // Verifica se há um alvo e uma carta atacante válida
  if (target && cartaAtacanteInstanceId) {
    const carta = cartasMap.get(Number(cartaAtacanteInstanceId));

    if (carta) {
      const damage = carta.currentAttack;

      // Log inicial para identificar a função sendo chamada
      console.log(
        `damageAvatar foi chamado. Damage: ${damage}, Target: ${target}, Player ID: ${player.id}`
      );

      if (target === "enemy") {
        // Aplica dano ao avatar inimigo
        enemyAvatar.takeDamage(damage);

        // Log para verificar a saúde do inimigo após o dano
        console.log(
          `Inimigo recebeu dano. Nova saúde do inimigo: ${enemyAvatar.health}`
        );

        // Mensagem enviada ao jogador atual, indicando que o inimigo tomou dano
        messageToPlayer = {
          type: "applyDamageToAvatar",
          data: {
            avatarData: enemyAvatar,
            target: "enemy", // O jogador está atacando o inimigo
          },
        };

        // Mensagem enviada ao OUTRO jogador, indicando que o avatar dele tomou dano
        messageToTheOtherPlayer = {
          type: "applyDamageToAvatar",
          data: {
            avatarData: enemyAvatar,
            target: "ally", // O outro jogador vê seu avatar sendo danificado
          },
        };
      } else {
        // Aplica dano ao avatar aliado
        alliedAvatar.takeDamage(damage);

        // Log para verificar a saúde do aliado após o dano
        console.log(
          `Aliado recebeu dano. Nova saúde do aliado: ${alliedAvatar.health}`
        );

        // Mensagem enviada ao jogador atual, indicando que o aliado tomou dano
        messageToPlayer = {
          type: "applyDamageToAvatar",
          data: {
            avatarData: alliedAvatar,
            target: "ally", // O jogador vê seu avatar sendo danificado
          },
        };

        // Mensagem enviada ao outro jogador, indicando que o inimigo dele tomou dano
        messageToTheOtherPlayer = {
          type: "applyDamageToAvatar",
          data: {
            avatarData: alliedAvatar,
            target: "enemy", // O outro jogador vê seu inimigo sendo danificado
          },
        };
      }

      // Envia a mensagem ao jogador atual
      player.ws.send(JSON.stringify(messageToPlayer));

      // Encontra o outro jogador e envia a mensagem correspondente
      const otherPlayer = players.find((p) => p.id !== player.id);
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
  console.log("dealDirectDamage chamada.");
  const carta = cartasMap.get(Number(cardInstanceId));
  if (carta instanceof Carta) {
    carta.takeDamage(damage);

    let message = {
      type: "applyDamageToCard",
      data: carta,
    };

    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
  } else {
    console.warn(
      `Não foi possível encontrar a carta no mapa de cartas para o instanceId (${cardInstanceId})`
    );
  }
}

//-----------------------------

function directDamageToAvatar(damage, avatarId, player) {
  console.log(
    `directDamageToAvatar chamada. Damage: ${damage}, avatarId: ${avatarId}, Player: ${player.nickname}`
  );

  let messageToPlayer;
  let messageToTheOtherPlayer;

  // Encontra o outro jogador e envia a mensagem
  const theOtherPlayer = players.find((p) => p.id !== player.id);

  // Aplica dano ao avatar correspondente
  if (avatarId === "player-health") {
    console.log("Aplicando dano ao avatar aliado.");
    console.log(`Vida do avatar antes: ${alliedAvatar.health}`);
    alliedAvatar.takeDamage(damage);
    console.log(`Vida do avatar depois: ${alliedAvatar.health}`);

    // Prepara a mensagem a ser enviada para o jogador atual
    messageToPlayer = {
      type: "applyDamageToAvatar",
      data: { target: "ally", avatarData: alliedAvatar },
    };

    // Prepara a mensagem a ser enviada para o outro jogador
    messageToTheOtherPlayer = {
      type: "applyDamageToAvatar",
      data: { target: "opponent", avatarData: alliedAvatar },
    };

    // Envia a mensagem ao jogador atual
    console.log(`Enviando mensagem de dano para o jogador: ${player.nickname}`);
    player.ws.send(JSON.stringify(messageToPlayer));

    if (theOtherPlayer) {
      console.log(
        `Enviando mensagem de dano para o outro jogador: ${theOtherPlayer.nickname}`
      );
      theOtherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
    } else {
      console.error("Outro jogador não encontrado.");
    }
  } else if (avatarId === "opponent-health") {
    console.log("Aplicando dano ao avatar inimigo.");
    console.log(`Vida do avatar antes: ${enemyAvatar.health}`);
    enemyAvatar.takeDamage(damage);
    console.log(`Vida do avatar depois: ${enemyAvatar.health}`);

    // Prepara a mensagem a ser enviada para o jogador atual
    messageToPlayer = {
      type: "applyDamageToAvatar",
      data: { target: "opponent", avatarData: enemyAvatar },
    };

    // Prepara a mensagem a ser enviada para o outro jogador
    messageToTheOtherPlayer = {
      type: "applyDamageToAvatar",
      data: { target: "ally", avatarData: enemyAvatar },
    };

    // Envia a mensagem ao jogador atual
    console.log(`Enviando mensagem de dano para o jogador: ${player.nickname}`);
    player.ws.send(JSON.stringify(messageToPlayer));

    if (theOtherPlayer) {
      console.log(
        `Enviando mensagem de dano para o outro jogador: ${theOtherPlayer.nickname}`
      );
      theOtherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));
    } else {
      console.error("Outro jogador não encontrado.");
    }
  } else {
    console.error(`avatarId inválido: ${avatarId}`);
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

    console.log(
      "Enviando mensagem de ordem de aplicação de cura a carta do servior para os jogadores."
    );

    players.forEach((p) => {
      p.ws.send(JSON.stringify(message));
    });
  } else {
    console.warn(
      `Carta não encontrada no mapa para a instanceId: ${instanceId}`
    );
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
  console.log("recallCard (server-side) chamada.");

  const cardInstanceId = Number(messageData.cardInstanceId);

  const cardOwner = messageData.cardOwner;

  const otherPlayer = players.find((p) => p.id !== player.id);

  let carta = cartasMap.get(cardInstanceId);

  if (carta instanceof Carta) {
    carta.changeState("hand");

    if (cardOwner === "me") {
      let messageToPlayer = {
        type: "recallCardOrder",
        data: carta,
      };

      let messageToTheOtherPlayer = {
        type: "removeCardFromTheField",
        data: carta,
      };

      player.ws.send(JSON.stringify(messageToPlayer));
      otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));

      console.log("Mensagens enviadas do servidor de volta para os jogadores.");
    } else {
      let messageToPlayer = {
        type: "removeCardFromTheField",
        data: carta,
      };

      let messageToTheOtherPlayer = {
        type: "recallCardOrder",
        data: carta,
      };

      player.ws.send(JSON.stringify(messageToPlayer));
      otherPlayer.ws.send(JSON.stringify(messageToTheOtherPlayer));

      console.log("Mensagens enviadas do servidor de volta para os jogadores.");
    }
  } else {
    console.error(
      `Carta não encontrada ou não é uma instância de carta para a instanceId: ${cardInstanceId}`
    );
  }
}

//------------------------------

function keywordAddition(instanceId, keyword) {
  const carta = cartasMap.get(Number(instanceId));
  if (carta instanceof Carta) {
    carta.addKeyword(keyword);
  }
  const message = {
    type: "keywordAdded",
    data: { cardData: carta, keyword },
  };

  players.forEach((p) => {
    p.ws.send(JSON.stringify(message));
  });
}

function gameOver(winner) {
  console.log("gameOver chamada.");
  console.log(`winner: ${winner}`);

  let messageToTheWinner = {
    type: "gameOver",
    data: "winner",
  };

  winner.ws.send(JSON.stringify(messageToTheWinner));
  console.log("Mensagem enviada ao vencedor da partida.");

  let messageToTheLoser = {
    type: "gameOver",
    data: "loser",
  };

  const loser = players.find((p) => p.id !== winner.id);
  loser.ws.send(JSON.stringify(messageToTheLoser));
  console.log("Mensagem enviada ao perdedor da partida.");
}

//------------------------------

let currentTurnIndex = 1;

function handleEndTurnRequest(player) {
  if (player.id) {
    turnEndRequests++;
    if (turnEndRequests === 2) {
      let message = {
        type: "endTheTurnOrder",
      };

      players.forEach((p) => {
        drawCardOrder(1, p);
        p.ws.send(JSON.stringify(message));
      });

      console.log("Turno finalizado. Enviando mensagem para os jogadores.");
      currentTurnIndex++;
      turnEndRequests = 0;

      executeNextTurnEffects();

    } else {
      console.log("turnEndRequests ainda não é igual a 2.");
    }
  }
}


//------------------------------

function battlefieldUpdateOrder(message, player) {
  console.log("battlefieldUpdateOrder triggered.");
  console.log("Mensagem recebida:", message);
  console.log("Tipo da mensagem:", message.type);

  let newMessage;

  if (message.type === "addCardToOpponentField") {
    console.log("Tipo de mensagem é addCardToOpponentField.");

    // Verifica se a carta está no mapa de cartas
    const carta = cartasMap.get(Number(message.data.cardInstanceId));
    if (!carta) {
      console.error(
        `Carta com instanceId ${message.data.carta.instanceId} não encontrada no mapa de cartas.`
      );
      return;
    }

    console.log("Carta encontrada:", carta);

    // Atualiza o estado da carta
    carta.changeState("field");
    console.log('Estado da carta alterado para "field".');

    // Remove a carta do deck do jogador
    player.deck.delete(Number(message.data.cardInstanceId));
    console.log("Carta removida do deck do jogador.");

    const slotNumber = message.data.slotNumber;

    // Prepara a mensagem para enviar ao oponente
    newMessage = {
      type: "addCardToOpponentField",
      data: { carta, slotNumber },
    };
    console.log("Mensagem preparada para enviar ao oponente:", newMessage);

    // Envia a mensagem para o outro jogador
    const opponent = players.find((p) => p.id !== player.id);
    if (opponent) {
      console.log(`Enviando mensagem para oponente ${opponent.id}.`);
      opponent.ws.send(JSON.stringify(newMessage));
    } else {
      console.error("Oponente não encontrado.");
    }
  } else if (message.type === "buffOrDebuffRequest") {
    console.log("Tipo de mensagem é buffOrDebuffRequest.");

    const data = message.data;
    if (data) {
      const cardInstanceId = Number(data.cardInstanceId);

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
          console.log(
            "Mensagem preparada para enviar ao oponente:",
            newMessage
          );

          // Envia a mensagem para os jogadores atualizarem seus DOM's de modo a refletir a carta agora buffada
          players.forEach((p) => {
            p.ws.send(JSON.stringify(newMessage));
          });
        } else {
          console.error(
            "Objeto de carta não encontrado para a instanceId:",
            cardInstanceId
          );
        }
      } else {
        console.error(
          "message.data não possui uma propriedade chamada cardInstanceId."
        );
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
        baseCardData.speed,
        baseCardData.keywords || [] // Keywords ou um array vazio
      );
      addCartaToMap(novaCarta);

      const slotNumber = message.data.slotNumber;

      newMessage = {
        type: "canPlayTheCard",
        data: { novaCarta, slotNumber },
      };

      player.ws.send(JSON.stringify(newMessage));
    } else {
      console.error(`Dados da carta não encontrados para a id: ${cardId}`);
    }
  } else {
    console.error("Tipo de mensagem desconhecido:", message.type);
  }
}

// Defina um Set global para armazenar funções a serem executadas no próximo turno
let nextTurnEffects = new Set();

// Função para adicionar uma função ao Set de efeitos do próximo turno
function addNextTurnEffect(effectFunction) {
  nextTurnEffects.add(effectFunction);
}

// Função para executar todas as funções armazenadas no Set e limpar o Set após a execução
function executeNextTurnEffects() {
  nextTurnEffects.forEach((effectFunction) => effectFunction());
  nextTurnEffects.clear(); // Limpa o Set após a execução
}

// Simula a transição para o próximo turno
function onTurnEnd() {
  executeNextTurnEffects(); // Executa todas as funções armazenadas
}
