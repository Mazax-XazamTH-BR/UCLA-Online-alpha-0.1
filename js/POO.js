let globalCardId = 1; 

export class Carta {
  constructor(id, name, baseCost, currentCost, baseAttack, currentAttack, baseHealth, currentHealth, maxHealth, speed, keywords, instanceId = null, state = 'deck') {
    this.instanceId = instanceId !== null ? instanceId : globalCardId++ // Use o instanceId fornecido ou incremente globalCardId
    this.id = id;
    this.name = name;
    this.baseCost = baseCost;
    this.currentCost = currentCost
    this.baseAttack = baseAttack;
    this.currentAttack = currentAttack || baseAttack;
    this.baseHealth = baseHealth;
    this.currentHealth = currentHealth || baseHealth;
    this.maxHealth = maxHealth || baseHealth,
    this.speed = speed || 1
    this.keywords = keywords;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.killCount = 0;
    this.state = state;
  }

    // Método para atualizar o custo da carta
    updateCost(newCost) {
      this.currentCost = newCost;
      //this.updateDOM();
}

healCard(healAmount) {
  // Calcula a nova saúde com base na cura
  let newHealth = Math.min(
      Number(this.baseHealth), // Limite máximo baseado na saúde base
      Number(this.currentHealth) + Number(healAmount) // Saúde atual mais a cura
  );
  // Atualiza as estatísticas da carta com a nova saúde
  this.updateStats(this.currentAttack, newHealth);
}

  // Método para atualizar ataque e vida da carta
  updateStats(newAttack, newHealth) {
      this.currentAttack = newAttack;
      this.currentHealth = newHealth;
      this.currentHealth <= 0 ? this.morrer() : '';
  }


// Método para atualizar a carta no mapa
/* updateMap() {
  cartasMap.set(this.instanceId, this);
} */

  // Método para alterar o 'estado' (local) da carta
  changeState(newState) {
    this.state = newState;
  }

  // Método para atacar a cartaAlvo
  attack(cartaAlvo) {
    console.log(`Atacando ${cartaAlvo.name} com ${this.name}`);

    const { speed: alvoSpeed, keywords: alvoKeywords } = cartaAlvo;
    const { speed: atacanteSpeed, keywords: atacanteKeywords } = this;

    console.log(`Velocidade do atacante (${this.name}): ${atacanteSpeed}`);
    console.log(`Velocidade do alvo (${cartaAlvo.name}): ${alvoSpeed}`);

    // Condição para ataque aéreo
    if (alvoKeywords.includes('voo') && !(atacanteKeywords.includes('voo') || atacanteKeywords.includes('longa-distância'))) {
      console.log('Ataque cancelado: alvo tem *voo* e atacante não pode atingi-lo.');
      return;
    }
    
    // Condição para velocidade do atacante
    if (atacanteSpeed < 0) {
      console.log('Ataque cancelado: atacante não pode causar dano devido à sua velocidade menor que 0 - independentemente da velocidade do alvo.');
      return;
    } else if (atacanteSpeed === 0 && alvoSpeed > atacanteSpeed) {
      console.log('Esta carta atacante não consegue causar dano, pois sua velocidade é igual a 0 e a velocidade do alvo é maior que a dele.');
      return;
    }

    cartaAlvo.takeDamage(this.currentAttack);

    // Verificar se o atacante recebe dano
    if (atacanteSpeed <= alvoSpeed) {
      console.log('Atacante recebe dano de retorno.');
      this.takeDamage(cartaAlvo.currentAttack);
    } else {
      console.log('Atacante é mais veloz e esquiva do dano do alvo.');
    }
  }

  takeDamage(dano) {
    console.log(`Recebendo dano: ${dano} para a carta: ${this.name}, Vida Atual: ${this.currentHealth}`);

    // Verifica se a carta tem as palavras-chave "invulnerável" ou "indestrutível"
    if (this.keywords.includes('invulnerável') || this.keywords.includes('indestrutível')) {
        console.log('Esta carta não pode receber dano dessa forma agora.');
        return;
    // Se tiver proteção divina, removê-la    
    } else if (this.keywords.includes('proteção divina')) {
      console.log('A proteção divina foi removida.');
      // Remover a keyword 'proteção divina' do array
      const index = this.keywords.indexOf('proteção divina');
      if (index !== -1) {
          this.keywords.splice(index, 1);
      }
    }
  

    // Calcula a nova vida da carta após receber dano
    const newHealth = this.currentHealth - dano;

    // Se a vida da carta chegar a 0 ou menos, a carta "morre"
    if (newHealth <= 0) {
        console.log(`Carta ${this.name} morreu.`);
        this.morrer(); // Chama o método para "morrer"
        return true; // Retorna verdadeiro indicando que a carta morreu
    } else {
        // Se a carta ainda tem vida, atualiza sua vida
        console.log(`Atualizando vida da carta ${this.name} para ${newHealth}`);
        this.updateStats(this.currentAttack, newHealth); // Atualiza os atributos da carta
        return false; // Retorna falso indicando que a carta não morreu
    }
}

  morrer() {
    this.currentHealth = 0;
    // Aumentar o killCount apenas se for um ataque bem-sucedido (já incrementado na função attack)
    this.changeState('graveyard');
  }

  silence() {
    // Esvaziar as keywords
    this.keywords = [];

    // Resetar currentHealth e currentAttack para baseHealth e baseAttack
    this.currentHealth = this.baseHealth;
    this.currentAttack = this.baseAttack;

    this.updateDOM();
}

addKeyword(keyword) {
  // Verifica se a keyword já está no array para evitar duplicatas
  if (!this.keywords.includes(keyword)) {
    this.keywords.push(keyword);

    // Se for paralisia, a velocidade da carta alvo afeta com essa tag é zerada
    if (keyword === 'paralisia elétrica') {
      this.speed = 0;
    }

  }
}

warCry(cardContainer) {
  if (this.keywords.includes('grito de guerra')) {
    console.log('Grito de guerra encontrado para a carta:', this.name);
    let playEffectCard = playEffectsCards.find(c => c.id === this.id);
    if (playEffectCard) {
      console.log('Efeito de carta encontrado:', playEffectCard.name);
      if (typeof playEffectCard.playEffect === 'function') {
        playEffectCard.playEffect(this, cardContainer);
      } else {
        console.error('playEffect não é uma função para a carta:', playEffectCard.name);
      }
    } else {
      console.error('Grito de guerra não encontrado para a carta com a id ', this.id);
    }
  } else {
    console.log('A carta não possui grito de guerra:', this.name);
  }
}

    }
  
// Classe Avatar (POO)

export class Avatar {
  constructor(isAlly, health) {
    this.isAlly = isAlly;
    this.health = health;
  }

  takeDamage(damage) {
    this.health -= damage;
    //this.updateDOM();

    if (this.health <= 0) {
      this.morrer();
    }
  }

  heal(amount) {
    this.health += amount;
    //this.updateDOM();
  }

  updateDOM() {
    // Determina o seletor com base em isAlly
    const healthSelector = this.isAlly ? '#player-health' : '#opponent-health';
    const avatarHealthContainer = document.querySelector(healthSelector);

    if (avatarHealthContainer) {
      avatarHealthContainer.innerHTML = this.health;
    } else {
      console.error(`Elemento DOM para ${healthSelector} não encontrado.`);
    }
  }

  morrer() {
    if (this.isAlly) {
      console.log('Seu avatar morreu.');
      gameOver(false); // Verifique se gameOver está implementado
    } else {
      console.log('O avatar inimigo morreu.');
      gameOver(true); // Verifique se gameOver está implementado
    }
  }
}

