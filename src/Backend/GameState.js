export class GameState {

  constructor(gameID, initiator) {
    this.gameID = gameID;
    this.players = [new Player(initiator), {}, {}, {}, {}, {}, {}, {}];
    this.turn = 1;
  }
}

export class Player {
  constructor(name) {
    this.name = username;
    this.cards = [ null, null ];
  }
}
