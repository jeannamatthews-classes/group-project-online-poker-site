class Player {
  constructor(name, isHuman = false) {
    this.name = name;
    this.isHuman = isHuman;
    this.hand = [];
    this.folded = false;
    this.chips = 1000;
    this.currentBet = 0;
  }

  resetForNewRound() {
    this.hand = [];
    this.folded = false;
    this.currentBet = 0;
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
  }

  addPlayer(name) {
    this.players.push(new Player(name));
  }

  // Get player by name
  getPlayer(name) {
    return this.players.find(player => name === player.name);
  }

  newHand() {
    if (this.players.length < 2) return; // Ensure at least 2 players

    this.resetDeck();
    this.shuffleDeck();
    this.players.forEach(player => player.resetForNewRound());
    this.dealHoleCards();
    this.bettingRound = 1;
    this.pot = 0;
    this.communityCards = [];
    this.postBlinds();
    this.currentTurnIndex = (this.dealerIndex + 3) % this.players.length;
  }

  postBlinds() {
    const sbIndex = (this.dealerIndex + 1) % this.players.length;
    const bbIndex = (this.dealerIndex + 2) % this.players.length;

    this.players[sbIndex].currentBet = this.smallBlind;
    this.players[sbIndex].chips -= this.smallBlind;

    this.players[bbIndex].currentBet = this.bigBlind;
    this.players[bbIndex].chips -= this.bigBlind;

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
    return {
      hand: player.hand,
      chips: player.chips,
      pot: this.pot,
      communityCards: this.communityCards,
      isTurn: this.players[this.currentTurnIndex] === player,
      folded: player.folded,
      otherPlayers: this.players.filter(p => p !== player).map(p => ({
        name: p.name,
        chips: p.chips,
        folded: p.folded
      }))
    };
  }

  getCurrentTurnPlayerName() {
    return this.players[this.currentTurnIndex].name;
  }

  call(playerName) {
    let player = this.getPlayer(playerName);
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    const callAmount = highestBet - player.currentBet;
    player.chips -= callAmount;
    player.currentBet += callAmount;
    this.pot += callAmount;
    this.advanceTurn();
  }

  fold(playerName) {
    let player = this.getPlayer(playerName);
    player.folded = true;
    this.advanceTurn();
  }

  raise(playerName, amount) {
    let player = this.getPlayer(playerName);
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    const raiseAmount = (highestBet - player.currentBet) + amount;
    player.chips -= raiseAmount;
    player.currentBet += raiseAmount;
    this.pot += raiseAmount;
    this.advanceTurn();
  }

  advanceTurn() {
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    } while (this.players[this.currentTurnIndex].folded);
  }
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

    const sortedValues = [...new Set(values)]
      .map(v => valuesOrder.indexOf(v))
      .sort((a, b) => b - a);

    const isFlush = Object.values(suitCounts).some(count => count >= 5);

    const straights = [];
    for (let i = 0; i <= sortedValues.length - 5; i++) {
      if (sortedValues[i] - sortedValues[i + 4] === 4) {
        straights.push(sortedValues[i]);
      }
    }
    if (sortedValues.includes(12) && sortedValues.includes(3) && sortedValues.includes(2) && sortedValues.includes(1) && sortedValues.includes(0)) {
      straights.push(3);
    }

    const counts = Object.entries(valueCounts).map(([v, c]) => [c, valuesOrder.indexOf(v)]);
    counts.sort((a, b) => b[0] - a[0] || b[1] - a[1]);

    const [count1, val1] = counts[0];
    const [count2, val2] = counts[1] || [0, 0];

    if (isFlush && straights.length) return { score: 9, description: "Straight flush" };
    if (count1 === 4) return { score: 8, description: "Four of a kind" };
    if (count1 === 3 && count2 === 2) return { score: 7, description: "Full house" };
    if (isFlush) return { score: 6, description: "Flush" };
    if (straights.length) return { score: 5, description: "Straight" };
    if (count1 === 3) return { score: 4, description: "Three of a kind" };
    if (count1 === 2 && count2 === 2) return { score: 3, description: "Two pair" };
    if (count1 === 2) return { score: 2, description: "One pair" };

    return { score: 1, description: `High card: ${valuesOrder[sortedValues[0]]}` };
  }
}

module.exports = { TexasHoldemGame };

  
