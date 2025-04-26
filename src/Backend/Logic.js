class Player {
  constructor(name, isHuman = false) {
    this.name = name;
    this.isHuman = isHuman;
    this.hand = [];
    this.folded = false;
    this.chips = 1000;
    this.currentBet = 0;
    this.revealed = false;
    this.hasActed = false;
  }

  resetForNewRound() {
    this.hand = [];
    this.folded = false;
    this.currentBet = 0;
    this.hasActed = false;
  }
}

class TexasHoldemGame {
  constructor(playerName = "You") {
    this.deck = [];
    this.players = [new Player(playerName, true)];
    this.communityCards = [];
    this.pot = 0;
    this.bettingRound = 0;
    this.dealerIndex = 0;
    this.smallBlind = 10;
    this.bigBlind = 20;
    this.currentTurnIndex = 0;
    this.sbIndex = 0;
    this.bbIndex = 0;
    this.started = false;

    console.log('New game created.');
  }

  addPlayer(name) {
    if (!(this.players.some(p => p.name === name))) {
    this.players.push(new Player(name));
    console.log(`Added player ${name} to the game.`);
      }
  }

  // Get player by name
  getPlayer(name) {
    return this.players.find(player => name === player.name);
  }

  start() {
      this.started = true;
      this.newHand();
  }
  
  nextTurn() {
    if (this.isBettingRoundOver()) {
      this.nextRound(); // betting round ends
      return;
    }
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    } while (this.players[this.currentTurnIndex].folded);
    console.log(`Waiting for ${this.players[this.currentTurnIndex].name}...`);
  }

  isBettingRoundOver() {
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
  
    return this.players.every(player => 
      player.folded || 
      (player.hasActed && player.currentBet === highestBet)
    );
  }  

  nextRound() {
        console.log(`Starting betting round ${this.bettingRound}`);

        switch (this.bettingRound) {
          case 1: //preflop
            this.communityCards.push(this.deck.pop());
            this.communityCards.push(this.deck.pop());
            this.communityCards.push(this.deck.pop());
            console.log(`Flop dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
            this.bettingRound++;
            break;
          case 2: //postflop
            this.communityCards.push(this.deck.pop());
            console.log(`Flop dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
            this.bettingRound++;
            break;
          case 3: //postturn
            this.communityCards.push(this.deck.pop());
            console.log(`Flop dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
            this.bettingRound++;
            break;
          case 4:
            let winners = this.getWinners();
            let prize = this.pot / winners.length;
            winners.forEach((p) => {
              p.chips += prize;
            });
            this.newHand();
            break;

      }

      this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;

  }


  newHand() {

    console.log('Starting new hand...');
    if (this.players.length < 2) return; // Ensure at least 2 players

    this.resetDeck();
    console.log(JSON.stringify(this.deck));
    this.shuffleDeck();
    console.log(JSON.stringify(this.deck));
    this.players.forEach(player => player.resetForNewRound());
    this.dealHoleCards();
    this.bettingRound = 1;
    this.pot = 0;
    this.communityCards = [];
    this.postBlinds();
    this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;

    console.log(`Dealer is now ${this.players[this.dealerIndex].name}`);
    console.log(`Now waiting for ${this.players[this.currentTurnIndex].name}`);
    this.players.map((p) => {
        console.log(p.hand);
      });
  }

  postBlinds() {
    this.sbIndex = (this.dealerIndex + 2) % this.players.length;
    this.bbIndex = (this.dealerIndex + 3) % this.players.length;

    this.players[this.sbIndex].currentBet = this.smallBlind;
    this.players[this.sbIndex].chips -= this.smallBlind;

    this.players[this.bbIndex].currentBet = this.bigBlind;
    this.players[this.bbIndex].chips -= this.bigBlind;

    this.pot += this.smallBlind + this.bigBlind;
  }

  dealHoleCards() {
    for (let player of this.players) {
      player.hand = [this.deck.pop(), this.deck.pop()];
    }
  }

  resetDeck() {
    this.deck = [];
    const suits = ['s', 'h', 'd', 'c'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    for (let suit of suits) {
      for (let value of values) {
        this.deck.push(`${value}${suit}`);
      }
    }
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  getGameState(playerName) {
    let player = this.getPlayer(playerName);
    if ( typeof player === "undefined") {
      console.log(`Player ${playerName} was not found.`);
    }

    const playerInfo = this.players.map((p) => {
          if ( (p.name !== player.name) && !p.revealed ) {
            return {
              ...p,
              hand: [ 'hidden', 'hidden' ]
            };
          } else {
            return { ...p };
          }
    });


    return {
      started: this.started,
      pot: this.pot,
      communityCards: this.communityCards,
      whoseTurn: this.players[this.currentTurnIndex].name,
      smallBlind: this.players[this.sbIndex].name,
      largeBlind: this.players[this.bbIndex].name,
      players: playerInfo
    };
  }

  getCurrentTurnPlayerName() {
    return this.players[this.currentTurnIndex].name;
  }

  call(playerName) {

    if(playerName !== this.players[this.currentTurnIndex].name) { return }

    let player = this.getPlayer(playerName);
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    const callAmount = highestBet - player.currentBet;
    player.chips -= callAmount;
    player.currentBet += callAmount;
    player.hasActed = true;
    this.pot += callAmount;
    this.nextTurn();
  }

  fold(playerName) {
    if(playerName !== this.players[this.currentTurnIndex].name) { return }

    let player = this.getPlayer(playerName);
    player.folded = true;
    player.hasActed = true;
    this.nextTurn();
  }

  raise(playerName, amount) {
    if (playerName !== this.players[this.currentTurnIndex].name) return;
  
    const player = this.getPlayer(playerName);
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    const newBet = highestBet + Number(amount);
    let raiseAmount = newBet - player.currentBet;
  
    if (player.chips < raiseAmount) {
      raiseAmount = player.chips;
    }
  
    player.chips -= raiseAmount;
    player.currentBet += raiseAmount;
    player.hasActed = true;
    this.pot += raiseAmount;
    this.players.forEach(p => {
      if (!p.folded && p.name !== player.name) {
        p.hasActed = false;
      }
    });
    this.nextTurn();
  }

  advanceTurn() {
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    } while (this.players[this.currentTurnIndex].folded);
  }

  getWinners() {
      
      let winners = [];

      this.players.forEach((p) => {
        if (winners.length === 0) {
          winners.push(p);
          return;
        } else if (this.evaluateHand(p.hand).score === this.evaluateHand(winners[0].hand).score) {
          winners.push(p);
        } else if (this.evaluateHand(p.hand).score > this.evaluateHand(winners[0].hand).score) {
            winners = [ p ];
        }
      });

      return winners;

  }

  evaluateHand(cards) {
    const valuesOrder = '23456789TJQKA';
    const valueCounts = {};
    const suitCounts = {};
    const values = [];
  
    for (const card of cards) {
      const [value, suit] = [card[0], card[1]];
      valueCounts[value] = (valueCounts[value] || 0) + 1;
      suitCounts[suit] = (suitCounts[suit] || 0) + 1;
      values.push(value);
    }
  
    const uniqueValues = [...new Set(values)];
    const sortedIndices = uniqueValues.map(v => valuesOrder.indexOf(v)).sort((a, b) => b - a);
    const isFlush = Object.values(suitCounts).some(count => count >= 5);
  
    const straights = [];
    for (let i = 0; i <= sortedIndices.length - 5; i++) {
      if (sortedIndices[i] - sortedIndices[i + 4] === 4) {
        straights.push(sortedIndices[i]);
      }
    }
  
    if ([12, 0, 1, 2, 3].every(v => sortedIndices.includes(v))) {
      straights.push(3);
    }
  
    const counts = Object.entries(valueCounts).map(([v, c]) => [c, valuesOrder.indexOf(v)]);
    counts.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  
    const [count1, val1] = counts[0];
    const [count2, val2] = counts[1] || [0, 0];
    const kickers = counts.map(([c, v]) => v);
  
    if (isFlush && straights.length) {
      return {
        score: 9,
        description: "Straight flush",
        tiebreaker: [straights[0]]
      };
    }
  
    if (count1 === 4) {
      return {
        score: 8,
        description: "Four of a kind",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1)]
      };
    }
  
    if (count1 === 3 && count2 === 2) {
      return {
        score: 7,
        description: "Full house",
        tiebreaker: [val1, val2]
      };
    }
  
    if (isFlush) {
      const flushCards = cards.filter(card => suitCounts[card[1]] >= 5);
      const flushValues = flushCards.map(card => valuesOrder.indexOf(card[0])).sort((a, b) => b - a);
      return {
        score: 6,
        description: "Flush",
        tiebreaker: flushValues.slice(0, 5)
      };
    }
  
    if (straights.length) {
      return {
        score: 5,
        description: "Straight",
        tiebreaker: [straights[0]]
      };
    }
  
    if (count1 === 3) {
      return {
        score: 4,
        description: "Three of a kind",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1).slice(0, 2)]
      };
    }
  
    if (count1 === 2 && count2 === 2) {
      const val3 = kickers.find(v => v !== val1 && v !== val2);
      const pairs = [val1, val2].sort((a, b) => b - a);
      return {
        score: 3,
        description: "Two pair",
        tiebreaker: [...pairs, val3]
      };
    }
  
    if (count1 === 2) {
      return {
        score: 2,
        description: "One pair",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1).slice(0, 3)]
      };
    }
  
    return {
      score: 1,
      description: `High card: ${valuesOrder[sortedIndices[0]]}`,
      tiebreaker: sortedIndices.slice(0, 5)
    };
  }
  
}

module.exports = { TexasHoldemGame };
  
