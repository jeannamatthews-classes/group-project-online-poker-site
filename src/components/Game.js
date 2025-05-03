import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Game.css';
import Seat from './Seat.js'

import Test from './Test.js';

function Game(){

    const serverUrl = 'http://localhost:3001/';
    const { gameId, username } = useParams();
    const [gameState, setGameState] = useState({ started: false, numPlayers: 0 }); // Local copy of game state
    
    //const [username, setUsername] = useState(''); //Username that is stored for later use
    const [gameStarted, setGameStarted] = useState(false); //Variable that lets us know whether the game has started
    const [showBetInput, setShowBetInput] = useState(false); // Boolean variable that decides if the input box for betting should appear or not
    const [betAmount, setBetAmount] = useState(''); //Displayed as the amount the user types in
    const [submittedBet, setSubmittedBet] = useState(null); //The bet amount that is stored for later use
    let [Pot, setPot] = useState(Number(0));

    // Subscribe to game state updates from the server
    useEffect(() => {
    /*
      async function fetchState() {
        const eventSrc = new EventSource(serverUrl + `events?player=${username}&gameId=${gameId}`);
      
        eventSrc.onmessage = function (event) {
          setGameState(JSON.parse(event.data)); // TODO: adjust once data format is decided
          //console.log(JSON.parse(event.data));
        }
      }

      fetchState();
      */

      async function fetchState() {

      console.log(`gameId: ${gameId}, username: ${username}`);
      try {
        const response = await fetch(serverUrl + 'state', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({gameId: gameId, player: username })
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Error getting state: ' + data.error);
        } else {
          setGameState(data);
        }
      } catch (error) {
        console.error('Error sending state request: ' + error);
      }
      }


      
      const interval = setInterval(() => {
        fetchState();
      }, 500);

    }, []);

    const handleStartGame = async () => {

        console.log(`[REQ] Sending start request...`);
      
        try {

            const response = await fetch(serverUrl + 'start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameId: gameId, player: username})
            });

            const data = await response.json();
            if (!response.ok) {
              console.error(`Game start request failed: ${data.error}`);
              return;
            }

        } catch (error) {
            console.log(error);
        }

      setGameStarted(true); //Starting the game after start game button is pressed
    }

    const handleRaise = async () => { //Stores the amount of money bet, and clears the input box
        //setSubmittedBet(Number(betAmount));
        //setBetAmount('');
        //setShowBetInput(false);
        //setPot(Pot+=Number(betAmount));
        try {

            const response = await fetch(serverUrl + 'raise', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameId: gameId, player: username, amount: betAmount})
            });

        } catch (error) {
            console.log(error);
        }
    }


    const handleCall = async () => {
        try {

            const response = await fetch(serverUrl + 'call', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameId: gameId, player: username})
            });

        } catch (error) {
            console.log(error);
        }
    }


    const handleFold = async () => {
        try {

            const response = await fetch(serverUrl + 'fold', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameId: gameId, player: username})
            });

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="game-container">
            {!gameState.started ? (
                <div className="bottom-content">
                    <h1 className="username-text">
                      { username || 'Guest' },
                      { (gameState.numPlayers >= 2) ?
                      'Press start to begin the game.' :
                      'Need one more player.'
                      }
                    </h1>
                    { ( gameState.numPlayers >= 2) &&
                    <div className="button-container">
                        <button className="game-button" onClick={handleStartGame}>Start</button>
                    </div>
                    }
                </div>
            ) : (
                <>
                    <div className="community-card-display">
                      <img
                        src={cardImage(gameState.communityCards[0])}
                        width={70}
                        alt=""
                      />
                      <img
                        src={cardImage(gameState.communityCards[1])}
                        width={70}
                        alt=""
                      />
                      <img
                        src={cardImage(gameState.communityCards[2])}
                        width={70}
                        alt=""
                      />
                      <img
                        src={cardImage(gameState.communityCards[3])}
                        width={70}
                        alt=""
                      />
                      <img
                        src={cardImage(gameState.communityCards[4])}
                        width={70}
                        alt=""
                      />
                    </div>
                    {/* Top Center Display: Pot and Current Bet */}
                    <div className="center-display">
                        <h1>Pot: ${gameState.pot || 0}</h1>
                        {submittedBet !== null && <h3>Your Last Bet: ${submittedBet}</h3>}
                    </div>

                    <div className="players-info">
                        {gameState.players.map((player) => (
                          <Seat 
                            name={player.name}
                            cards={player.hand}
                            chips={player.chips}
                            bet={player.currentBet}
                            isTurn={player.name === gameState.whoseTurn}
                            hasSmallBlind={player.name === gameState.smallBlind}
                            hasLargeBlind={player.name === gameState.largeBlind}
                          /> 
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="bottom-content">
                        <h1 className="username-text">{username}</h1>
                        <div className="gameplay-buttons">
                            <button
                              className="game-button"
                              onClick={handleFold}
                              disabled={gameState.whoseTurn !== username}
                            >Fold</button>
                            <button 
                              className="game-button" 
                              onClick={() => setShowBetInput(prev => !prev)}
                              disabled={gameState.whoseTurn !== username}
                            >Raise</button>
                            <button 
                              className="game-button" 
                              onClick={handleCall}
                              disabled={gameState.whoseTurn !== username }
                            >Call/Check</button>
                        </div>

                        {showBetInput && (
                            <div className="bet-input-container">
                                <input
                                    type="number"
                                    min="1"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    className="bet-input"
                                    placeholder="Enter Amount"
                                />
                                <button
                                    className="bet-submit-button"
                                    disabled={Number(betAmount) <= 0 || gameState.whoseTurn !== username }
                                    onClick={handleRaise}
                                >Bet
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}


function cardImage(cardString) {

  let imagePath = '/images/Playing Cards/PNG-cards-1.3/';

  if (cardString === null) {
    return imagePath + 'back.png';
  }

  if (cardString === undefined) {
    return imagePath + 'back.png';
  }

  if (cardString === 'hidden') {
    return imagePath + 'back.png';
  }

  switch (cardString[0]) {
    case 'T':
      imagePath += '10';
      break;
    case 'J':
      imagePath += 'jack';
      break;
    case 'Q':
      imagePath += 'queen';
      break;
    case 'K':
      imagePath += 'king';
      break;
    case 'A':
      imagePath += 'ace';
      break;
    default: // its just a number
      imagePath += cardString[0].toString();
  }

  imagePath += '_of_';

  switch (cardString[1]) {
    case 's':
      imagePath += 'spades';
      break;
    case 'h':
      imagePath += 'hearts';
      break;
    case 'c':
      imagePath += 'clubs';
      break;
    case 'd':
      imagePath += 'diamonds';
      break;
    default:
      imagePath += 'oopsies';
      break;
  }

  // comment this line out to use face cards without royals on them
  if ((cardString[0] === 'J') || (cardString[0] === 'Q') || (cardString[0] === 'K')) {
    imagePath += '2';
  }

  return imagePath + '.png';

}
    export default Game;
