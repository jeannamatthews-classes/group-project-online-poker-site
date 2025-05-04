import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Game.css';
import Seat from './Seat.js';



function Game() {
    const serverUrl = `http://${process.env.REACT_APP_SERVER_IP}:3001/`;
    const { gameId, username } = useParams();
    const [gameState, setGameState] = useState({ started: false, numPlayers: 0 }); // Local copy of game state
    
    //const [username, setUsername] = useState(''); //Username that is stored for later use
    const [gameStarted, setGameStarted] = useState(false); //Variable that lets us know whether the game has started
    const [showBetInput, setShowBetInput] = useState(false); // Boolean variable that decides if the input box for betting should appear or not
    const [betAmount, setBetAmount] = useState(''); //Displayed as the amount the user types in
    const [submittedBet, setSubmittedBet] = useState(null); //The bet amount that is stored for later use
    let [Pot, setPot] = useState(Number(0));

    // Know when turn is defined and if it's this user's turn
    const turnDefined = gameState.whoseTurn !== undefined;
    const isMyTurn = gameState.whoseTurn === username;
    const TOTAL_SEATS = 6;
    const seats = Array(gameState.numPlayers).fill(null);
    // Subscribe to SSE updates
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

    (gameState.players || []).forEach(p => {
        let idx;
        // If the server already gave them a seatNumber, honor it:
        if (p.seatNumber != null && seats[p.seatNumber - 1] == null) {
            idx = p.seatNumber - 1;
        } else {
            // Otherwise find the first empty chair
            idx = seats.findIndex(s => s == null);
        }
        if (idx !== -1) {
            seats[idx] = { ...p, seatNumber: idx + 1 };
        }
    });

    // Handle starting the game
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

            setGameStarted(true); // There's a 'started' variable in the gameState obj, is this one redundant?

        } catch (error) {
            console.error(error);
        }
    };

    // Handle raising
    const handleRaise = async () => {
        try {
            await fetch(serverUrl + 'raise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId, player: username, amount: betAmount }),
            });
            setSubmittedBet(betAmount);
            setShowBetInput(false);
            setBetAmount('');
        } catch (error) {
            console.error(error);
        }
    };

    // Handle calling/checking
    const handleCall = async () => {
        try {
            await fetch(serverUrl + 'call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId, player: username }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Handle folding
    const handleFold = async () => {
        try {
            await fetch(serverUrl + 'fold', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId, player: username }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="game-container">
            {!(gameState.started || gameStarted) ? (
                <div className="bottom-content">
                    <h1 className="username-text">
                      { username || 'Guest' },
                      { (gameState.numPlayers >= 2) ?
                      'Press start to begin the game.' :
                      'Need one more player.'
                      }
                    </h1>
                    { ( gameState.numPlayers >= 2) && (
                    <div className="button-container">
                        <button className="game-button" onClick={handleStartGame}>
                          Start
                        </button>
                    </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Community cards */}
                    <div className="community-card-display">
                        {gameState.communityCards?.map((card, i) => (
                            <img key={i} src={cardImage(card)} width={70} alt=""/>
                        ))}
                    </div>

                    {/* Pot and last bet */}
                    <div className="center-display">
                        <h1>Pot: ${gameState.pot || 0}</h1>
                        {submittedBet !== null && <h3>Your Last Bet: ${submittedBet}</h3>}
                    </div>

                    {/* Seats */}

                    <div className="players-info">
                        {seats.map((player, i) => (
                            <Seat
                                key={i}
                                seatNumber={i + 1}
                                name={player?.name}
                                cards={player?.hand}
                                chips={player?.chips}
                                bet={player?.currentBet}
                                isTurn={player?.name === gameState.whoseTurn}
                                hasSmallBlind={player?.name === gameState.smallBlind}
                                hasLargeBlind={player?.name === gameState.largeBlind}
                                showCards={player?.name === username}
                                backImagePath="/images/Playing Cards/PNG-cards-1.3/back.png"
                            />
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="bottom-content">
                        <h1 className="username-text">{username}</h1>
                        <div className="gameplay-buttons">
                            <button
                                className="game-button"
                                onClick={handleFold}
                                disabled={turnDefined ? !isMyTurn : false}
                            >
                                Fold
                            </button>
                            <button
                                className="game-button"
                                onClick={() => setShowBetInput((v) => !v)}
                                disabled={turnDefined ? !isMyTurn : false}
                            >
                                Raise
                            </button>
                            <button
                                className="game-button"
                                onClick={handleCall}
                                disabled={turnDefined ? !isMyTurn : false}
                            >
                                Call/Check
                            </button>
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
                                    disabled={
                                        !turnDefined ? false : !isMyTurn || Number(betAmount) <= 0
                                    }
                                    onClick={handleRaise}
                                >
                                    Bet
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Helper to render a card image path
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



// function cardImage(cardString) {
//     const base = '/images/Playing Cards/PNG-cards-1.3/';
//     if (!cardString || cardString === 'hidden') return base + 'back.png';
//     const rankMap = { T: '10', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
//     const rank = rankMap[cardString[0]] || cardString[0];
//     const suitMap = { s: 'spades', h: 'hearts', c: 'clubs', d: 'diamonds' };
//     const suit = suitMap[cardString[1]] || 'oopsies';
//     return `${base}${rank}_of_${suit}.png`;
// }
//
// export default Game;
