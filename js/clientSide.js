import { cardsTextDescription, cards } from "./variables-and-classes/cards.js";

import soundEffects from "./soundEffects.js";

document.addEventListener("DOMContentLoaded", () => {
  // Login related
  const loginDiv = document.querySelector(".login-container");

  const loginForm = loginDiv.querySelector(".login-form");

  //const loginButton = document.querySelector('.login__button');

  const mainGameSection = document.querySelector("#main-game-section");
  mainGameSection.style.display = "none";

  const deckCodeNSelectSection = document.querySelector("#codigoESelecionar");

  const interpretButton = document.getElementById("interpretButton");

  const battlefield = document.getElementById("battlefield");

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
  const yourScoreboard = document.querySelector("#yourScore");
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
      console.log(
        'Executando efeito de "próxima rodada" armazenado associado à seguinte chave: '
      );
      console.table(key);
      console.table('efeito: ', effect);
      nextRoundEffects.delete(key); // Remove o efeito após a aplicação
    });
  }

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
          ? buffOrDebuffRequest(
              { attackChange: 1, healthChange: 1 },
              cardElement
            )
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
                card.classList.remove("red-highlight");
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
                card.classList.add("red-highlight");
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

        let extraManaSpent = Math.min(mana, Number(userInput));

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
          extraManaSpent = mana;
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
            console.error(
              `Slot (de slotId = ${slotId}) não encontrado no DOM.`
            );
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
        console.log(
          `playerMatchPoints <= opponentMatchPoints?: ${
            playerMatchPoints <= opponentMatchPoints
          }.`
        );
        if (playerMatchPoints <= opponentMatchPoints) {
          console.log("Adicionando 1 mana.");
          addMana(1);
        }
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
                card.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
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
      playEffect: async function (
        giganteDeFData,
        giganteDeFElement,
        slotNumber
      ) {
        alert("Escolha uma carta ou avatar para causar 4 de dano.");

        const cardsInField = getCardsInField();
        const avatars = [alliedAvatar, opponentAvatar];

        const waitForPlayerAction = () => {
          return new Promise((resolve, reject) => {
            const removeHighlightsAndListeners = () => {
              cardsInField.forEach((card) => {
                card.classList.remove("red-highlight");
                card.removeEventListener("click", deal4Damage);
              });
              avatars.forEach((avatar) => {
                avatar.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
              card.addEventListener("click", deal4Damage);
            });

            avatars.forEach((avatar) => {
              avatar.classList.add("red-highlight");
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
                card.classList.remove("red-highlight");
                card.removeEventListener("click", deal1Damage);
              });
              avatars.forEach((avatar) => {
                avatar.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
              card.addEventListener("click", deal1Damage);
            });

            avatars.forEach((avatar) => {
              avatar.classList.add("red-highlight");
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
      playEffect: async function (
        avatarFogoData,
        avatarFogoElement,
        slotNumber
      ) {
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
                card.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
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
                card.classList.remove("red-highlight");
                card.removeEventListener("click", deal5Damage);
              });
              avatars.forEach((avatar) => {
                avatar.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
              card.addEventListener("click", deal5Damage);
            });

            avatars.forEach((avatar) => {
              avatar.classList.add("red-highlight");
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
                card.classList.remove("red-highlight");
                card.removeEventListener("click", deal4PiercingDamage);
              });
              document.removeEventListener("click", cancelWarCry);
            };

            const deal4PiercingDamage = function (event) {
              event.stopPropagation(); // Impede que o clique no card também acione o cancelamento
              dealDirectDamageRequest(4, this);

              const slot = this.closest(".slots");
              //console.log('slot: ', slot);
              if (slot) {
                const slotId = slot.id.replace("opponentSlot", "");
                const slotNumber = parseInt(slotId, 10);
                //console.log('slotNumber: ', slotNumber);
                if (slotNumber >= 1 && slotNumber <= 3) {
                  //console.log(slotNumber >= 1 && slotNumber <= 3);
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
              card.classList.add("red-highlight");
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
                card.classList.remove("red-highlight");
                card.removeEventListener("click", deal1Damage);
              });
              avatars.forEach((avatar) => {
                avatar.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
              card.addEventListener("click", deal1Damage);
            });

            avatars.forEach((avatar) => {
              avatar.classList.add("red-highlight");
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
                card.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
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
          lowestAttackCards[
            Math.floor(Math.random() * lowestAttackCards.length)
          ];
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
          lowestAttackCards[
            Math.floor(Math.random() * lowestAttackCards.length)
          ];
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
                card.classList.remove("red-highlight");
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
              card.classList.add("red-highlight");
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
              displayCardInHand({
                cardData: cardChosen,
                cardElement: undefined,
              });
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
            }

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
  const ws = new WebSocket("wss://uclagamewsserver.onrender.com");
  //const ws = new WebSocket("ws://localhost:8081");

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
    //console.log("Enviando mensagem para o servidor");
    //console.table(message);
  }

  //--------------------------------------------------------------------------------------

  const endRoundButton = document.querySelector("#endRound");

  function handleMessageFromServer(message) {
    console.log("Mensagem recebida do servidor");
    console.log("Tipo da mensagem:", message.type);
    if (message.type === "nextRoundEffect") {
      console.log("Mensagem do tipo nextRoundEffect detectada.");
      console.table(message.effectType, message.data.cardData);
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

      case "askForSomething":
        handleAskForSomethingOrder(message);
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
        const alliedCardsInField = getCardsInField("allied");
        alliedCardsInField.forEach((c) => {
          c.dataset.ready ? c.classList.add("highlight") : '';
        });
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
        const cardElement = document.querySelector(
          `.carta[data-instance-id="${instanceId}"]`
        );
        if (cardElement) {
          cardElement.dataset.ready = true;
          if (yourTurn) {
            cardElement.classList.add("highlight");
          };
        }
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
    ).textContent = `Você (${player.username}): 0`;

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
        if (
          displayCardInHand({ cardData: cardDrawn, cardElement: undefined })
        ) {
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
      const cardDrawSound = soundEffects.find(
        (s) => s.name === "cardDrawSound"
      );
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

    if (!cardContainer.dataset.ready) {
      alert(
        "A carta já atacou ou não pode atacar agora (tente aguardar até a próxima rodada)."
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
        "z-20",
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
    //console.log("cardInstanceData:");
    //console.table(cardInstanceData);
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
    cardContainer.dataset.ready = false;

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
    const costDiv = document.createElement("div");
    const manaCrystalIcon = document.createElement("img");
    manaCrystalIcon.src = "assets/other-images/icone-mana.png";

    const cardCost = document.createElement("p");
    cardCost.textContent = `${cardInstanceData.currentCost}`;
    cardCost.style.color =
      cardInstanceData.currentCost > cardInstanceData.baseCost
        ? "red"
        : cardInstanceData.currentCost < cardInstanceData.baseCost
        ? "lightgreen"
        : "white";
    cardCost.classList.add(
      "card-cost-text",
      "flex",
      "aspect-square",
      "justify-center",
      "items-center",
      "font-bold"
    );
    costDiv.classList.add("card-cost-display");
    costDiv.appendChild(manaCrystalIcon);
    costDiv.appendChild(cardCost);
    cardContainer.appendChild(costDiv);

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
      console.log(
        `Efeito condicional da carta ${cardData.name} foi executado.`
      );
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
    const cardCostDisplay = cardElement.querySelector(".card-cost-text");
    const cardCost = Number(cardCostDisplay.innerHTML);
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

  function handleAskForSomethingOrder(message) {
    const { requestType } = message;
    console.log('requestType: ', requestType);

    switch(requestType) {
      case "directDamage":
        const { damage, target } = message;
        console.log('damage: ', damage);
        console.log('target: ', target);
        if (target === "allEnemyCards") {
          const enemyCardsInField = getCardsInField("enemy");
          enemyCardsInField.forEach((c) => {
            dealDirectDamageRequest(damage, c);
          });
        } else if (target === "opponentAvatar") {
          dealDirectDamageRequest(damage, opponentAvatar);
        }
        break;
    }
  };

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
        const highlightedTargets = document.querySelectorAll(
          ".opponentSlots .highlight"
        );
        highlightedTargets.forEach((highlightedElement) => {
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
      const highlightedTargetCards = document.querySelectorAll(
        ".opponentSlots .highlight"
      );
      highlightedTargetCards.forEach((highlightedElement) => {
        highlightedElement.classList.remove("highlight");
      });
      opponentAvatar.classList.remove("highlight");
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
        const alliedField = battlefield.querySelectorAll(
          ".slots:not(.opponentSlots)"
        );
        alliedField.forEach((alliedSlot) => {
          const cardElement = alliedSlot.querySelector(".carta");
          if (cardElement) {
            cardsInField.push(cardElement);
          }
        });
        break;

      case "enemy":
        const enemyField = battlefield.querySelectorAll(".opponentSlots");
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

    if (avatarHealth < 10) {
      avatarElement.style.width = "100%";
      avatarElement.style.height = avatarElement.style.width;
      avatarElement.style.borderRadius = "50%";
    }

    if (!directDamage) {
      console.log("directDamage é falso, animando o ataque ao avatar.");
      const cartaAtacante = document.querySelector(
        `.carta[data-instance-id="${carta.instanceId}"]`
      );
      animateAttack(cartaAtacante, avatarElement);
      cartaAtacante.dataset.ready = false;
      cartaAtacante.classList.remove("highlight");
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

    if (newHealth < 10) {
      avatarElement.style.width = "100%";
      avatarElement.style.height = avatarElement.style.width;
      avatarElement.style.borderRadius = "50%";
    }
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
              cardElement.querySelector(".card-cost-text").innerHTML
            );
            console.log(`Custo do Fulgurvoltz antes: ${previousCost}`);
            console.log("unspentManaThisRound: ", unspentManaThisRound);
            newCost = Math.max(4, previousCost - unspentManaThisRound); // Garante que o custo não fique menor que 4
            console.log(`Custo do Fulgurvoltz depois: ${newCost}`);

            const cardCostDisplay =
              cardElement.querySelector(".card-cost-display");
            if (cardCostDisplay) {
              const cardCostText =
                cardCostDisplay.querySelector(".card-cost-text");
              cardCostText.innerHTML = newCost;
              if (unspentManaThisRound > 0) {
                cardCostText.style.color = "lightgreen";
              }
              console.log(
                `Novo custo exibido no DOM: ${cardCostText.innerHTML}`
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
            const cardCostDiv = cardElement.querySelector(".card-cost-display");
            previousCost = Number(
              cardCostDiv.querySelector(".card-cost-text").innerHTML
            );
            console.log(`Custo da Voltexz antes: ${previousCost}`);
            console.log("unspentManaThisRound: ", unspentManaThisRound);
            newCost = Math.max(2, previousCost - 2 * unspentManaThisRound); // Garante que o custo não fique menor que 2
            console.log(`Custo da Voltexz depois: ${newCost}`);

            const cardCostDisplay =
              cardElement.querySelector(".card-cost-display");
            if (cardCostDisplay) {
              const cardCostText =
                cardCostDisplay.querySelector(".card-cost-text");
              cardCostText.innerHTML = newCost;
              if (unspentManaThisRound > 0) {
                cardCostText.style.color = "lightgreen";
              }
              console.log(
                `Novo custo exibido no DOM: ${cardCostText.innerHTML}`
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
        const enemyCardsFrozen = enemyCardsInField.reduce(
          (count, enemyCard) => {
            const keywords = JSON.parse(enemyCard.dataset.keywords);
            return keywords.includes("congelamento") ? count + 1 : count;
          },
          0
        );

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
      id: 26,
      name: "Eletroad",
      inFieldOnly: true,
      effect: (card) => {
        console.log(
          `playerMatchPoints <= opponentMatchPoints?: ${
            playerMatchPoints <= opponentMatchPoints
          }.`
        );
        if (origin === "deck" || !card instanceof HTMLElement) {
          console.log("Diabrete Elétrico não está no campo.");
          return;
        } else if (card instanceof HTMLElement && card.closest("#hand")) {
          console.log(
            "Diabrete Elétrico não está no deck, mas não está no campo."
          );
          return;
        }
        if (playerMatchPoints <= opponentMatchPoints) {
          console.log(
            "Adicionando 1 mana pelo efeito do Eletroad em campo no início da rodada."
          );
          addMana(1, true);
        }
      },
    },

    {
      id: 68,
      name: "Diabrete Elétrico",
      inFieldOnly: true,
      effect: (card, origin) => {
        const alliedCards = getCardsInField("allied"); // Obtém as cartas aliadas no campo
        const enemyCards = getCardsInField("enemy"); // Obtém as cartas inimigas no campo

        console.log("origin: ", origin);
        console.log(
          `card instanceof HTMLElement?: ${card instanceof HTMLElement}.`
        );

        if (origin === "deck" || !card instanceof HTMLElement) {
          console.log("Diabrete Elétrico não está no campo.");
          return;
        } else if (card instanceof HTMLElement && card.closest("#hand")) {
          console.log(
            "Diabrete Elétrico não está no deck, mas não está no campo."
          );
          return;
        }

        if (enemyCards.length === 0) {
          console.log(
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
            c
              .querySelector(".card-cost-display")
              .querySelector(".card-cost-text").innerHTML,
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

    checkForStartRoundEffects();

    cardsFrozenThisRound = 0;

    enableAllAtackkers();

    applyNextRoundEffects();

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
      yourScoreboard.textContent = `Você (${player.username}): ${playerMatchPoints}`;
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
    console.log("Elemento da carta atacante encontrado:", cartaAtacanteElement);

    let cartaAlvoElement = document.querySelector(
      `.carta[data-instance-id="${cartaAlvoData.instanceId}"]`
    );

    if (!cartaAlvoElement && !cartaAtacanteElement) {
      console.error(
        "Elemento da carta atacante ou da alvo não encontrados no DOM."
      );
      return;
    }

    console.log("player.id:", player.id);
    console.log("cartaAtacanteData.ownerId:", cartaAtacanteData.ownerId);
    if (player.id == cartaAtacanteData.ownerId) {
      // nesse caso o jogador é o dono da carta atacante
      console.log("Classes da carta atacante:", cartaAtacanteElement.classList);
      if (cartaAtacanteElement.classList.contains("highlight")) {
        console.log(`Removendo highlight da carta: ${cartaAtacanteElement}`);
        cartaAtacanteElement.classList.remove("highlight");
        cartaAtacanteElement.dataset.ready = false;
      }
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
      if (
        cartaAtacanteElement &&
        (cartaAtacanteData.currentHealth <= 0 ||
          cartaAtacanteData.state === "graveyard")
      ) {
        //console.log("Carta atacante morreu. Removendo do DOM.");
        handleCardDeath(cartaAtacanteElement);
      }

      if (
        cartaAlvoElement &&
        (cartaAlvoData.currentHealth <= 0 ||
          cartaAlvoData.state === "graveyard")
      ) {
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
          // obtendo o elemento HTML de slot aliado de número mais alto
          const slotElement = findEmptySlot();
          if (!slotElement) {
            console.error("Erro: slotElement não pôde ser encontrado.");
            return;
          }
          // extraindo apenas o número do slot encontrado
          const slotNumber = parseInt(slotElement.id.replace("slot", ""), 10);
          // Função de ressureição p/ invocar a carta ressucitada na rodada seguinte:
          nextRoundEffects.set(cardContainer.dataset.instanceId, () => {
            if (!slotElement.querySelector(".carta")) {
              addCardToField(cardContainer, slotNumber);
            }
          });
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
        card.classList.remove("blue-highlight"); // Remove o destaque
        card.removeEventListener("click", buffOrDebuffListener); // Remove o listener de buff/debuff
      });
      document.removeEventListener("click", handleOutsideClick); // Remove o listener do documento
    };

    const handleOutsideClick = (event) => {
      if (!event.target.closest(".carta")) {
        console.log(
          "Clique fora detectado, removendo os listeners e highlights"
        );
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
          card.classList.remove("blue-highlight");
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
          card.classList.remove("blue-highlight");
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
        card.classList.add("blue-highlight"); // Adiciona a classe 'highlight' para destaque
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
    alliedAvatar.classList.add("blue-highlight");
    opponentAvatar.classList.add("blue-highlight");

    // Função para remover os listeners de cura
    const removeHealListeners = () => {
      console.log("Removendo listeners de cura.");

      // Remove destaque dos avatares
      alliedAvatar.classList.remove("blue-highlight");
      opponentAvatar.classList.remove("blue-highlight");

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
      card.classList.add("red-highlight"); // Adiciona a classe 'red-highlight' para destaque

      const recallListener = (event) => {
        event.stopPropagation();

        const cardInstanceId = card.dataset.instanceId;

        let message = {
          type: "recallRequest",
          data: { cardInstanceId },
        };
        sendMessageToServer(JSON.stringify(message));

        // Remove destaque e listener após aplicação
        card.classList.remove("red-highlight");
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
    alliedAvatar.classList.add("red-highlight");
    opponentAvatar.classList.add("red-highlight");

    // Função para remover os listeners de dano
    const removeDamageListeners = () => {
      console.log("Removendo listeners de dano.");

      // Remove destaque dos avatares
      alliedAvatar.classList.remove("red-highlight");
      opponentAvatar.classList.remove("red-highlight");

      // Remove listeners de dano das cartas
      cardsInField.forEach((card) => {
        card.removeEventListener("click", damageListener);
        card.classList.remove("red-highlight");
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
      card.classList.add("red-highlight");
      card.addEventListener("click", damageListener);
    });

    // Adiciona o listener de cura aos avatares
    alliedAvatar.addEventListener("click", damageListener);
    opponentAvatar.addEventListener("click", damageListener);
  };

  // -------------------------------------------------

  const handleExileButtonClick = (event) => {
    event.stopPropagation();

    const cardsInField = getCardsInField();

    // Verificação básica para garantir que temos cartas e avatares
    if (cardsInField.length === 0) {
      console.error("Erro: Lista de cartas vazia.");
      return;
    }

    if (
      !confirm(
        "Você está a remover uma carta do jogo permanentemente. Esta ação não pode ser desfeita... Tem certeza que deseja remover uma carta do jogo?"
      )
    ) {
      return;
    }

    // Listener de exílio
    const exileListener = (event) => {
      event.stopPropagation();
      // Determina o alvo do clique
      const cardElement = event.target.closest(".carta");
      if (cardElement) {
        exileCardRequest(cardElement);
        addAttackListeners(cardElement);
        removeExileListeners();
      } else {
        console.error(
          "Erro: elemento HTML da carta inválido ou não encontrado no DOM."
        );
      }
    };

    // Função para remover os listeners de dano
    const removeExileListeners = () => {
      console.log("Removendo listeners de dano.");

      // Remove listeners de dano das cartas
      cardsInField.forEach((card) => {
        card.removeEventListener("click", exileListener);
        card.classList.remove("red-highlight");
      });

      // Remove listeners de dano dos avatares
      alliedAvatar.removeEventListener("click", exileListener);
      opponentAvatar.removeEventListener("click", exileListener);

      // Remove o listener do documento para cliques fora das cartas/avatares
      document.removeEventListener("click", handleDocumentClick);
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
      card.classList.add("red-highlight");
      card.addEventListener("click", exileListener);
    });
  };

  function exileCardRequest(cardElement) {
    const instanceId = cardElement.dataset.instanceId;
    const message = {
      type: "removeCardFromTheGame",
      data: { instanceId },
    };
    sendMessageToServer(JSON.stringify(message));
  }

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
  const exileCardButton = document.querySelector("#exileCardButton");

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

  exileCardButton.addEventListener("click", handleExileButtonClick);

  endRoundButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Tem certeza que deseja finalizar seu turno nesta rodada? (Esta ação não pode ser desfeita)."
    );
    if (confirmation) {
      handleEndRoundButtonClick();
      endRoundButton.disabled = true;
      const alliedCardsInField = getCardsInField("allied");
      alliedCardsInField.forEach((c) => {
        if (c.classList.contains("highlight")) {
          c.classList.remove("highlight")
        };
      });
    };
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
});
