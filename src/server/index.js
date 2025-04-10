import express from 'express'
import cors from 'cors'
const app = express()
const port = 3001

import { TexasHoldemGame, Player } from '../Backend/Logic.js'; 

// Enables CORS, necessary to prevent browser blocking connections
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST']
}));

// Automatic (and safe) JSON parsing
app.use(express.json());


let games = new Map();


app.get('/', (req, res) => {
  res.send('Hello, world!');
})

// add a player to a game if it exists. if not, create it.
app.post('/game', (req, res) => {
  print(req.body)
  console.log('Recieved game join request for ' + req.body.gameId);
  if (!games.has(req.body.gameId)) {
    games.set(req.body.gameId, new TexasHoldemGame);
  }
    games.get(req.body.gameId).addPlayer(req.body.player);

  res.sendStatus(200);
})

// player call
app.post('/call', (req, res) => {
  console.log('Player ' + req.body.player + ' called.');
  games.get(req.body.gameId).playerCall(req.body.player);
  res.sendStatus(200);
})

// player fold
app.post('/fold', (req, res) => {
  console.log('Player ' + req.body.player + 'folded.');
  games.get(req.body.gameId).playerFold(req.body.player);
  res.sendStatus(200);
})

// player raise
app.post('/raise', (req, res) => {
  console.log('Player ' + req.body.player + 'bet ' + req.body.amount + ' .');
  games.get(req.body.gameId).playerRaise(req.body.player, req.body.amount);
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('listening on port ' + port);
})
