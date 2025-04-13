// current known problems/things to be implemented later
// bots logic is not implemented, just set to fold. therefore we cannot test if betting works correctly or if the pot works correctly
// bots dont check, it just immediately goes to showdown after the player folds
//  no raising preflop, no raising allowed at all yet
// simpler version for API, will fix/implement things once front end is connected

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
    constructor() {
      this.deck = [];
      this.players = [new Player("You", true)];
      for (let i = 1; i <= 5; i++) {
        this.players.push(new Player(`Bot ${i}`));
      }
      this.communityCards = [];
      this.pot = 0;
      this.bettingRound = 0;
      this.dealerIndex = 0;
      this.smallBlind = 10;
      this.bigBlind = 20;
    }
  
    newHand() {
      this.resetDeck();
      this.shuffleDeck();
      this.players.forEach(player => player.resetForNewRound());
      this.dealHoleCards();
      this.bettingRound = 1;
      this.pot = 0;
      this.communityCards = [];
      this.postBlinds();
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
  
    handlePlayerAction(action, amount = 0) {
      const player = this.players[0];
      if (action === "fold") {
        player.folded = true;
      } else if (action === "call") {
        const highest = Math.max(...this.players.map(p => p.currentBet));
        const callAmount = highest - player.currentBet;
        player.chips -= callAmount;
        player.currentBet = highest;
        this.pot += callAmount;
      } else if (action === "bet") {
        player.chips -= amount;
        player.currentBet += amount;
        this.pot += amount;
      }
    }
  
    getGameState() {
      return {
        hand: this.players[0].hand,
        chips: this.players[0].chips,
        pot: this.pot,
        communityCards: this.communityCards,
        bots: this.players.slice(1).map(b => ({
          name: b.name,
          chips: b.chips,
          folded: b.folded
        }))
      };
    }
  }
  
  module.exports = { TexasHoldemGame };
  
