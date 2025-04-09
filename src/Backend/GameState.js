export class GameState {

  constructor(gameID, creator) {
    this.gameID = gameID;
    this.players = [creator, {}, {}, {}, {}, {}, {}, {}];
    this.turn = 1;
  }
}

export class Player {
  name = null;
  cards = [ null, null ];
}
