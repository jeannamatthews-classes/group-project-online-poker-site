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

module.exports = { TexasHoldemGame };

  
