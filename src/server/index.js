import express from 'express'
import cors from 'cors'
const app = express()
const port = 3001

import { TexasHoldemGame, Player } from '../Backend/Logic.js'; 

/*
 *  SERVER
 *  The server will manage a list of all games being currently played, and handle requests
 *  by browsers that represent player actions. Requests and responses are JSON objects
 *  because from what little I know that seems to be somewhat standard.
 */

// Enables CORS, necessary to prevent browser blocking connections
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST']
}));

// Automatic (and safe) JSON parsing
app.use(express.json());


let games = new Map();

/* Puts a player into the game with the matching gameId if it exists. Create
 * the game before doing so if it does not.
 *
 * Expects fields 'player' and 'gameId' in the request.
 * 
 * JASON: I need a few functions for this. One just adds a player with the
 * given name into the game. Another is the constructor, which I need you to adjust
 * so that the first player has the given name. Also, maybe make it so the game starts
 * when there are at least 2 players for simplicity's sake.
 */
app.post('/game', (req, res) => {
  print(req.body)
  console.log('Recieved game join request for ' + req.body.gameId);
  /*
  if (!games.has(req.body.gameId)) {
    games.set(req.body.gameId, new TexasHoldemGame);
  }
    games.get(req.body.gameId).addPlayer(req.body.player);
  */

  res.sendStatus(200);
})

/* Sends a copy of the current game state, as a JSON object, to the client
  * that sent the request.
  *
  * This information needs to include players, their money, current pot value, etc.
  * Anything that will need to be shown by the UI.
  *
  * This information should NOT include information that the player isn't supposed to
  * have access to, for example the cards of other players. Otherwise they could see it
  * in thier browser's inspect window and cheat.
  *
  * Expects fields 'player' and 'gameId' in the request.
  *
  * JASON: I need a function TexasHoldemGame::getGameState(player) that returns all of
  * the information that needs to be on that player's UI.
  */
app.get('/state', (req, res) => {
  console.log('Client ' + req.body.player + ' requested game state.');
  // get game state, send it in response
})

/* Updates the game state in response to a call (or check) request from a player's
 * browser.
  *
  * Expects fields 'player' and 'gameId' in the request.
  *
  * JASON: I need a function TexasHoldemGame::call(player) that deals with calling on the
  * game logic side. I will deal with the case that a player tries to call when it isn't
  * thier turn, but in order to do this I will also need a function that tells me the name
  * of the player whose turn it is.
  */
app.post('/call', (req, res) => {
  console.log('Player ' + req.body.player + ' called.');
  //games.get(req.body.gameId).playerCall(req.body.player);
  res.sendStatus(200);
})

/* Updates the game state in response to a fold request from a player's browser.
  *
  * Expects fields 'player' and 'gameId' in the request.
  *
  * JASON: I need a function TexasHoldemGame::fold(player) that deals with folding in
  * the game logic.
  */
app.post('/fold', (req, res) => {
  console.log('Player ' + req.body.player + 'folded.');
  //games.get(req.body.gameId).playerFold(req.body.player);
  res.sendStatus(200);
})

/* Updates the game state in response to a raise request from a player's browser.
  *
  * Expects fields 'player', 'gameId' and 'betAmount' in the request.
  *
  * JASON: I need a function TexasHoldemGame::raise(player, amount) that deals with folding in
  * the game logic.
  */
app.post('/raise', (req, res) => {
  console.log('Player ' + req.body.player + 'bet ' + req.body.amount + ' .');
  //games.get(req.body.gameId).playerRaise(req.body.player, req.body.amount);
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('listening on port ' + port);
})
