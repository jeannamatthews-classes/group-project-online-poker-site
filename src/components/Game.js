import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Game.css';

function Game() {

    const serverUrl = 'http://localhost:3001/';
    const {gameId} = useParams();
    const [gameState, setGameState] = useState({}); // Local copy of game state

    const [username, setUsername] = useState(''); //Username that is stored for later use
    const [gameStarted, setGameStarted] = useState(false); //Variable that lets us know whether the game has started
    const [showBetInput, setShowBetInput] = useState(false); // Boolean variable that decides if the input box for betting should appear or not
    const [betAmount, setBetAmount] = useState(''); //Displayed as the amount the user types in
    const [submittedBet, setSubmittedBet] = useState(null); //The bet amount that is stored for later use
    let [Pot, setPot] = useState(Number(0));

    useEffect(() => {
        const storedUsername = localStorage.getItem('username'); //Storing the username
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Subscribe to game state updates from the server
    useEffect(() => {
        const eventSrc = new EventSource(serverUrl + 'events');

        eventSrc.onmessage = function (event) {
            const data = JSON.parse(event.data);
            setGameState(data);
            // setGameState(event.data); // TODO: adjust once data format is decided
            // console.log(JSON.stringify(event.data));
        }
    }, []);

    const handleStartGame = () => setGameStarted(true); //Starting the game after start game button is pressed

    const handleRaise = async () => { //Stores the amount of money bet, and clears the input box
        setSubmittedBet(Number(betAmount));
        setBetAmount('');
        setShowBetInput(false);
        setPot(Pot+=Number(betAmount));
        try {

            const response = await fetch(serverUrl + 'bet', {
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
            {!gameStarted ? (
                <div className="bottom-content">
                    <h1 className="username-text">{username || 'Guest'}, Press start to begin the game</h1>
                    <div className="button-container">
                        <button className="game-button" onClick={handleStartGame}>Start</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Top Center Display: Pot and Current Bet */}
                    <div className="center-display">
                        <h1>Pot: ${Pot || 0}</h1>
                        {submittedBet !== null && <h3>Your Last Bet: ${submittedBet}</h3>}
                    </div>


                    <div className="players-info">
                        {gameState.players?.map((player, index) => (
                            <div
                                key={player.name}
                            >
                                <p><strong>{player.name}</strong></p>
                                <p>Chips: ${player.chips}</p>
                                <p>Bet: ${player.currentBet || 0}</p>

                                {/* Show cards only for self (optional security) */}
                                {player.name === username && (
                                    <div className="cards">
                                        {player.cards?.map((card, idx) => (
                                            <div key={idx} className="card">{card}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="bottom-content">
                        <h1 className="username-text">{username}</h1>
                        <div className="gameplay-buttons">
                            <button className="game-button" onClick={handleFold}>Fold</button>
                            <button className="game-button" onClick={() => setShowBetInput(prev => !prev)}>Raise
                            </button>
                            <button className="game-button" onClick={handleCall}>Call</button>
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
                                    disabled={Number(betAmount) <= 0}
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
    export default Game;