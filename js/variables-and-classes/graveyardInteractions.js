import { Carta } from "./POO.js";

export const graveyardInteractions = [
  {
    id: 22,
    name: "Cientista da Morte",
    inFieldOnly: true,
    effect: (carta) => {
      let tokenCardData = cards.find((c) => c.id === 22000);
      const novaCarta = new Carta(
        tokenCardData.id,
        tokenCardData.name,
        tokenCardData.baseCost,
        tokenCardData.baseCost, // currentCost inicial é igual ao baseCost
        tokenCardData.baseAttack,
        tokenCardData.baseAttack, // currentAttack inicial é igual ao baseAttack
        tokenCardData.baseHealth,
        tokenCardData.baseHealth, // currentHealth inicial é igual ao baseHealth
        tokenCardData.baseHealth, //maxHealth inicial é igual ao baseHealth
        tokenCardData.baseSpeed,
        tokenCardData.keywords || [] // Keywords ou um array vazio
      );
      const message = {
        type: "canPlayTheCard",
        data: { novaCarta },
      };
      return message;
    },
  },
  {
    id: 66,
    name: "Diabrete Sombrio",
    inFieldOnly: true,
    effect: (carta) => {
      const message = {
        type: "cardDrawOrder",
        amount: 1,
      };
      return message;
    },
  },
  {
    id: 19,
    name: "Titânico Morcegalma",
    inFieldOnly: true,
    effect: (cartaComOEfeito, destroyedCard) => {
      if (!cartaComOEfeito.ownerId == destroyedCard.ownerId) {
        console.log('Efeito não será ativado, esta carta só tem seu efeito ativado se uma carta ALIADA for destrúída.');
        return;
      }
      const message1 = {
        type: 'askForSomething',
        requestType: 'directDamage',
        damage: 1,
        target: 'allEnemyCards'
      };
      const message2 = {
        type: 'askForSomething',
        requestType: 'directDamage',
        damage: 2,
        target: 'opponentAvatar'
      };
      return { message1 , message2};
    },
  },
  /*  {
  id: 
 } */
];