// current known problems/things to be implemented later
// bots logic is not implemented, just set to fold. therefore we cannot test if betting works correctly or if the pot works correctly
// bots dont check, it just immediately goes to showdown after the player folds
//  no raising preflop, probably no raising allowed at all yet

const readline = require('readline');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

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

  async startGame() {
    while (true) {
      await this.newHand();
      const cont = await askQuestion("Next hand? (y/n): ");
      if (cont.toLowerCase() !== 'y') break;
      this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
    }
  }

  async newHand() {
    console.clear();
    console.log("\nNew hand starting...");
    this.resetDeck();
    this.shuffleDeck();
    this.players.forEach(player => player.resetForNewRound());
    this.dealHoleCards();
    this.bettingRound = 1;
    this.pot = 0;
    this.communityCards = [];

    this.postBlinds();
    await this.bettingPhase();
    this.displayChipCounts();
  }

  postBlinds() {
    const smallBlindIndex = (this.dealerIndex + 1) % this.players.length;
    const bigBlindIndex = (this.dealerIndex + 2) % this.players.length;

    const smallBlindPlayer = this.players[smallBlindIndex];
    const bigBlindPlayer = this.players[bigBlindIndex];

    smallBlindPlayer.currentBet = this.smallBlind;
    smallBlindPlayer.chips -= this.smallBlind;

    bigBlindPlayer.currentBet = this.bigBlind;
    bigBlindPlayer.chips -= this.bigBlind;

    this.pot += this.smallBlind + this.bigBlind;

    console.log(`${smallBlindPlayer.name} posts small blind of ${this.smallBlind}`);
    console.log(`${bigBlindPlayer.name} posts big blind of ${this.bigBlind}`);
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

  dealHoleCards() {
    for (let player of this.players) {
      player.hand = [this.deck.pop(), this.deck.pop()];
    }
    console.log("Your hand:", this.players[0].hand.join(' '));
  }

  displayChipCounts() {
    console.log("\n--- Chip Counts ---");
    for (let player of this.players) {
      console.log(`${player.name}: ${player.chips} chips`);
    }
    console.log();
  }

  async bettingPhase() {
    const highestBet = Math.max(...this.players.map(p => p.currentBet));
    let player = this.players[0];

    if (!player.folded) {
      if (player.currentBet < highestBet) {
        const action = await askQuestion(`call (${highestBet - player.currentBet}), fold? (call/fold): `);

        if (action === 'call') {
          const callAmount = highestBet - player.currentBet;
          player.chips -= callAmount;
          player.currentBet = highestBet;
          this.pot += callAmount;
        } else {
          player.folded = true;
          console.log("You folded.");
        }
      } else {
        if (this.bettingRound > 1) {
          const action = await askQuestion("check, bet or fold? (check/bet/fold): ");

          if (action === 'check') {
            console.log("You check.");
          } else if (action === 'bet') {
            const betAmountStr = await askQuestion("Enter your bet amount: ");
            let betAmount = parseInt(betAmountStr, 10);
            if (isNaN(betAmount) || betAmount <= 0) {
              console.log("Invalid bet amount. You fold by default.");
              player.folded = true;
            } else {
              player.currentBet += betAmount;
              player.chips -= betAmount;
              this.pot += betAmount;
              this.players.slice(1).forEach(bot => {
                if (bot.currentBet < player.currentBet) {
                  bot.folded = true;
                  console.log(`${bot.name} folds.`);
                }
              });
            }
          } else {
            player.folded = true;
            console.log("You folded.");
          }
        } else {
          const action = await askQuestion("bet or fold? (bet/fold): ");

          if (action === 'bet') {
            const betAmountStr = await askQuestion("Enter your bet amount: ");
            let betAmount = parseInt(betAmountStr, 10);
            if (isNaN(betAmount) || betAmount <= 0) {
              console.log("Invalid bet amount. You fold by default.");
              player.folded = true;
            } else {
              player.currentBet += betAmount;
              player.chips -= betAmount;
              this.pot += betAmount;
              this.players.slice(1).forEach(bot => {
                if (bot.currentBet < player.currentBet) {
                  bot.folded = true;
                  console.log(`${bot.name} folds.`);
                }
              });
            }
          } else {
            player.folded = true;
            console.log("You folded.");
          }
        }
      }
    }

    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      if (!bot.folded) {
        const callAmount = highestBet - bot.currentBet;
        if (callAmount <= this.bigBlind) {
          bot.chips -= callAmount;
          bot.currentBet = highestBet;
          this.pot += callAmount;
          console.log(`${bot.name} calls.`);
        } else {
          bot.folded = true;
          console.log(`${bot.name} folds.`);
        }
      }
    }

    const activePlayers = this.players.filter(p => !p.folded);

    if (activePlayers.length === 1) {
      this.showdown();
      return;
    }

    if (this.bettingRound < 4) {
      this.dealCommunityCards();
      this.bettingRound++;
      await this.bettingPhase();
    } else {
      this.showdown();
    }
  }

  dealCommunityCards() {
    if (this.communityCards.length === 0) {
      this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    } else {
      this.communityCards.push(this.deck.pop());
    }
    console.log("Community Cards:", this.communityCards.join(' '));
  }

  getHandDescription(score, valueCount) {
    const valueNames = {
      '2': '2s', '3': '3s', '4': '4s', '5': '5s', '6': '6s',
      '7': '7s', '8': '8s', '9': '9s', 'T': '10s', 'J': 'Jacks',
      'Q': 'Queens', 'K': 'Kings', 'A': 'Aces'
    };
    const pairs = Object.entries(valueCount).filter(([k, v]) => v === 2).map(([k]) => k).sort();
    const threes = Object.entries(valueCount).filter(([k, v]) => v === 3).map(([k]) => k);
    const fours = Object.entries(valueCount).filter(([k, v]) => v === 4).map(([k]) => k);

    switch (score) {
      case 8: return 'a Straight Flush';
      case 7: return `Four of a Kind, ${valueNames[fours[0]]}`;
      case 6: return `a Full House, ${valueNames[threes[0]]} over ${valueNames[pairs[0]]}`;
      case 5: return 'a Flush';
      case 4: return 'a Straight';
      case 3: return `Three of a Kind, ${valueNames[threes[0]]}`;
      case 2: return `Two Pair, ${valueNames[pairs[1]]} and ${valueNames[pairs[0]]}`;
      case 1: return `One Pair, ${valueNames[pairs[0]]}`;
      default: return 'High Card';
    }
  }

  rankHand(cards) {
    const values = '23456789TJQKA';
    const valueCount = {};
    const suits = {};

    for (let card of cards) {
      let val = card[0];
      let suit = card[1];
      valueCount[val] = (valueCount[val] || 0) + 1;
      suits[suit] = (suits[suit] || 0) + 1;
    }

    const isFlush = Object.values(suits).some(c => c >= 5);

    const sortedVals = Array.from(new Set(cards.map(c => c[0])))
      .map(v => values.indexOf(v))
      .sort((a, b) => b - a);

    const isStraight = (() => {
      for (let i = 0; i <= sortedVals.length - 5; i++) {
        if (sortedVals.slice(i, i + 5).every((v, j, arr) => j === 0 || arr[j - 1] === v + 1)) {
          return true;
        }
      }
      if (sortedVals.includes(12) && sortedVals.includes(0) && sortedVals.includes(1) && sortedVals.includes(2) && sortedVals.includes(3)) {
        return true;
      }
      return false;
    })();

    const counts = Object.values(valueCount).sort((a, b) => b - a);

    let score = 0;
    if (isStraight && isFlush) score = 8;
    else if (counts[0] === 4) score = 7;
    else if (counts[0] === 3 && counts[1] >= 2) score = 6;
    else if (isFlush) score = 5;
    else if (isStraight) score = 4;
    else if (counts[0] === 3) score = 3;
    else if (counts[0] === 2 && counts[1] === 2) score = 2;
    else if (counts[0] === 2) score = 1;

    return { score, valueCount };
  }

  async showdown() {
    console.log("\nShowdown!");
    console.log("Community Cards:", this.communityCards.join(' '));
    let activePlayers = this.players.filter(p => !p.folded);

    if (activePlayers.length === 1) {
      let winner = activePlayers[0];
      winner.chips += this.pot;
      console.log(`\n${winner.name} wins the pot of ${this.pot} chips by default!`);
    } else {
      let bestScore = -1;
      let winner = null;
      let winnerDesc = '';
      activePlayers.forEach(p => {
        const allCards = [...p.hand, ...this.communityCards];
        const result = this.rankHand(allCards);
        const score = result.score;
        const handDesc = this.getHandDescription(score, result.valueCount);
        console.log(`${p.name}'s hand: ${p.hand.join(' ')}, Score: ${score} (${handDesc})`);
        if (score > bestScore) {
          bestScore = score;
          winner = p;
          winnerDesc = handDesc;
        }
      });

      winner.chips += this.pot;
      console.log(`\n${winner.name} wins the pot of ${this.pot} chips with ${winnerDesc}!`);
    }

    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

  }
}

(async () => {
  const game = new TexasHoldemGame();
  await game.startGame();
})();
