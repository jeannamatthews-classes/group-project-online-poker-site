import express from 'express';
import cors from 'cors';
import { TexasHoldemGame } from '../Backend/Logic.js';

const app = express();
const port = 3001;

let games = new Map();

// Allow both GET and POST from your React client
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST']
}));

app.use(express.json());

app.post('/game', (req, res) => {
  console.log(req.body);
  console.log('Received game join request for ' + req.body.gameId);

  if (!games.has(req.body.gameId)) {
    games.set(req.body.gameId, new TexasHoldemGame(req.body.player));
  }
  games.get(req.body.gameId).addPlayer(req.body.player);

  res.sendStatus(200);
});

app.post('/start', (req, res) => {
  console.log('Starting game ' + req.body.gameId);
  const game = games.get(req.body.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  game.start();
  res.sendStatus(200);
});

app.get('/state', (req, res) => {
  const game = games.get(req.query.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(game.getGameState(req.query.player));
});

app.post('/call', (req, res) => {
  console.log('Player ' + req.body.player + ' called.');
  games.get(req.body.gameId).call(req.body.player);
  res.sendStatus(200);
});

app.post('/fold', (req, res) => {
  console.log('Player ' + req.body.player + ' folded.');
  games.get(req.body.gameId).fold(req.body.player);
  res.sendStatus(200);
});

app.post('/raise', (req, res) => {
  console.log('Player ' + req.body.player + ' bet ' + req.body.amount + '.');
  games.get(req.body.gameId).raise(req.body.player, req.body.amount);
  res.sendStatus(200);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log(`query: ${JSON.stringify(req.query)}`);

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
