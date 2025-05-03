import express from 'express';
import cors from 'cors';
import { TexasHoldemGame } from '../Backend/Logic.js';

const app = express();
const port = 3001;

let games = new Map();

// Enables CORS, necessary to prevent browser blocking connections
app.use(cors());

app.use(express.json());

app.post('/game', (req, res) => {
  console.log(`[REQ] Join from player ${req.body.player} for game ${req.body.gameId}`);

  if (!games.has(req.body.gameId)) {
    games.set(req.body.gameId, new TexasHoldemGame(req.body.gameId, req.body.player));
  }
  games.get(req.body.gameId).addPlayer(req.body.player);

  res.sendStatus(200);
});

app.post('/start', (req, res) => {
  console.log(`[REQ] Start game ${req.body.gameId} from ${req.body.player}`);
  const game = games.get(req.body.gameId);
  if (!game) {
    return res.status(404).json({error: 'Game not found' });
  }
  game.start();
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
app.post('/state', (req, res) => {
  //console.log(`[REQ] State request from ${req.body.player} for game ${req.body.gameId}`);
  const game = games.get(req.body.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(games.get(req.body.gameId).getGameState(req.body.player));
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
  games.get(req.body.gameId).call(req.body.player);
  res.sendStatus(200);
});


/* Updates the game state in response to a fold request from a player's browser.
  *
  * Expects fields 'player' and 'gameId' in the request.
  *
  * JASON: I need a function TexasHoldemGame::fold(player) that deals with folding in
  * the game logic.
  */
app.post('/fold', (req, res) => {
  console.log('Player ' + req.body.player + ' folded.');
  games.get(req.body.gameId).fold(req.body.player);
  res.sendStatus(200);
});

/* Updates the game state in response to a raise request from a player's browser.
  *
  * Expects fields 'player', 'gameId' and 'betAmount' in the request.
  *
  * JASON: I need a function TexasHoldemGame::raise(player, amount) that deals with folding in
  * the game logic.
  */
app.post('/raise', (req, res) => {
  console.log('Player ' + req.body.player + ' bet ' + req.body.amount + '.');
  games.get(req.body.gameId).raise(req.body.player, req.body.amount);
  res.sendStatus(200);
});


/* Keeps clients updated on game state.
 * Request expects fields 'player' and 'gameId'.
 *
 * This is probably inefficient, but I couldn't figure out how to make it better for now.
 * I don't know how to make state change trigger an event within an HTTP endpoint.
  */
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log(`[REQ] Event subscription from ${req.query.player} for game ${req.query.gameId}`);

  const interval = setInterval(() => {
    const game = games.get(req.query.gameId);
    if (!game) {
      res.write(`data: ${JSON.stringify({ error: 'Game not found' })}\n\n`);
      return;
    }

    try {
      const gameState = game.getGameState(req.query.player);
      res.write(`data: ${JSON.stringify(gameState)}\n\n`);
    } catch (e) {
      console.error(e);
      res.write(`data: ${JSON.stringify({ error: 'Failed to retrieve game state' })}\n\n`);
    }
  }, 500);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
