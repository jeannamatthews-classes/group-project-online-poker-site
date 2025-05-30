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

  resetForNewHand() {
    this.hand = [];
    this.hasActed = false;
    this.folded = false;
    this.currentBet = 0;
  }

  resetForNewRound() {
    this.currentBet = 0;
    this.hasActed = false;
  }
}

class TexasHoldemGame {
  constructor(gameId, playerName = "You") {
    this.gameId = gameId;
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

    console.log(`[GAME ${this.gameId}] Game initialized.`);
  }

  addPlayer(name) {
    if (!(this.players.some(p => p.name === name))) {
      this.players.push(new Player(name));
      console.log(`[GAME ${this.gameId}] Added player ${name}.`);
    }
  }

  getPlayer(name) {
    return this.players.find(player => name === player.name);
  }

  start() {
    console.log(`[GAME ${this.gameId}] Starting game.`);
    this.started = true;
    this.newHand();
  }

  nextTurn() {
    if (this.isBettingRoundOver()) {
      this.nextRound();
      return;
    }
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    } while (this.players[this.currentTurnIndex].folded);
    console.log(`[GAME ${this.gameId}] Waiting for ${this.players[this.currentTurnIndex].name}...`);
  }

  isBettingRoundOver() {
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    return this.players.every(player =>
      player.folded ||
      (player.hasActed && player.currentBet === highestBet)
    );
  }

  nextRound() {
    console.log(`[GAME ${this.gameId}] Starting betting round ${this.bettingRound}`);

    switch (this.bettingRound) {
      case 1: //preflop
        this.communityCards.push(this.deck.pop());
        this.communityCards.push(this.deck.pop());
        this.communityCards.push(this.deck.pop());
        console.log(`[GAME ${this.gameId}] Flop dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
        this.bettingRound++;
        break;
      case 2: //postflop
        this.communityCards.push(this.deck.pop());
        console.log(`[GAME ${this.gameId}] Turn dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
        this.bettingRound++;
        break;
      case 3: //postturn
        this.communityCards.push(this.deck.pop());
        console.log(`[GAME ${this.gameId}] River dealt. Community cards: ${JSON.stringify(this.communityCards)}`);
        this.bettingRound++;
        break;
      case 4:
        let winners = this.getWinners();
        let prize = this.pot / winners.length;
        console.log(this.pot);
        winners.forEach((p) => {
          p.chips += prize;
        });
        this.newHand();
        break;
    }

    this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;
    this.players.forEach(player => player.resetForNewRound());
  }

  newHand() {
    console.log(`[GAME ${this.gameId}] Starting new hand...`);
    if (this.players.length < 2) return;

    this.resetDeck();
    this.shuffleDeck();
    this.players.forEach(player => player.resetForNewHand());
    this.dealHoleCards();
    this.bettingRound = 1;
    this.pot = 0;
    this.communityCards = [];
    this.postBlinds();
    this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;

    console.log(`[GAME ${this.gameId}] Dealer is now ${this.players[this.dealerIndex].name}`);
    console.log(`[GAME ${this.gameId}] Waiting for ${this.players[this.currentTurnIndex].name}...`);
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
    if (typeof player === "undefined") {
      console.log(`[ERROR] Player ${playerName} was not found.`);
      return { started: false, numPlayers: this.players.length };
    }

    const playerInfo = this.players.map((p) => {
      if ((p.name !== player.name) && !p.revealed) {
        return {
          ...p,
          hand: ['hidden', 'hidden']
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
      players: playerInfo,
      numPlayers: this.players.length
    };
  }

  getCurrentTurnPlayerName() {
    return this.players[this.currentTurnIndex].name;
  }

  call(playerName) {
    if (playerName !== this.players[this.currentTurnIndex].name) return;

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
    if (playerName !== this.players[this.currentTurnIndex].name) return;

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

  compareHands(handA, handB) {
    if (handA.score > handB.score) return 1;
    if (handA.score < handB.score) return -1;

    for (let i = 0; i < Math.max(handA.tiebreaker.length, handB.tiebreaker.length); i++) {
      const a = handA.tiebreaker[i] ?? -1;
      const b = handB.tiebreaker[i] ?? -1;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  getWinners() {
    const activePlayers = this.players.filter(p => !p.folded);
    let bestHands = activePlayers.map(p => ({
      player: p,
      handEval: this.evaluateHand([...p.hand, ...this.communityCards])
    }));

    bestHands.sort((a, b) => this.compareHands(b.handEval, a.handEval));

    const topHand = bestHands[0].handEval;
    const winners = bestHands.filter(h => this.compareHands(h.handEval, topHand) === 0).map(h => h.player);

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
        score: 160 + valuesOrder.indexOf(val1),
        description: "Straight flush",
        tiebreaker: [valuesOrder.indexOf(val1)]
      };
    }

    if (count1 === 4) {
      return {
        score: 140 + val1,
        description: "Four of a kind",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1)]
      };
    }

    if (count1 === 3 && count2 === 2) {
      return {
        score: 120 + val1,
        description: "Full house",
        tiebreaker: [val1, val2]
      };
    }

    if (isFlush) {
      const flushCards = cards.filter(card => suitCounts[card[1]] >= 5);
      const flushValues = flushCards.map(card => valuesOrder.indexOf(card[0])).sort((a, b) => b - a);
      return {
        score: 100 + flushValues[0],
        description: "Flush",
        tiebreaker: flushValues
      };
    }

    if (straights.length) {
      return {
        score: 80 + straights[0],
        description: "Straight",
        tiebreaker: [straights[0]]
      };
    }

    if (count1 === 3) {
      return {
        score: 60 + val1,
        description: "Three of a kind",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1).slice(0, 2)]
      };
    }

    if (count1 === 2 && count2 === 2) {
      const val3 = kickers.find(v => v !== val1 && v !== val2);
      const pairs = [val1, val2].sort((a, b) => b - a);
      return {
        score: 40 + pairs[0],
        description: "Two pair",
        tiebreaker: [...pairs, val3]
      };
    }

    if (count1 === 2) {
      return {
        score: 20 + val1,
        description: "One pair",
        tiebreaker: [val1, ...kickers.filter(v => v !== val1).slice(0, 3)]
      };
    }

    return {
      score: 0 + sortedIndices[0],
      description: `High card: ${valuesOrder[sortedIndices[0]]}`,
      tiebreaker: sortedIndices.slice(0, 5)
    };
  }
}

module.exports = { TexasHoldemGame };
