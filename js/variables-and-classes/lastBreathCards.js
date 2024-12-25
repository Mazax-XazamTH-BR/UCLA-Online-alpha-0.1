export const lastBreathEffectsCards = [
  {
    id: 16,
    name: "O Revivente Eterno",
    resurrection: true,
    lastBreath: (cardObject, owner) => {
      cardObject.currentHealth = cardObject.maxHealth;
      const message = {
        type: "nextRoundEffect",
        effectType: "resurrection",
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
        effectType: "resurrection",
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
        data: { cardData: cardObject, amount: 1 },
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
        amount: 1,
      };
      owner.ws.send(JSON.stringify(message));
    },
  },
];