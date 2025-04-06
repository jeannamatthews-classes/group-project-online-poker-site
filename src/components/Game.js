import React, { useEffect, useState } from 'react';
import './Game.css';

function Game(){
    const [username, setUsername] = useState(''); //Username that is stored for later use
    const [gameStarted, setGameStarted] = useState(false); //Variable that lets us know whether the game has started
    const[showBetInput, setShowBetInput] = useState(false); // Boolean variable that decides if the input box for betting should appear or not
    const[betAmount, setBetAmount] = useState(''); //Displayed as the amount the user types in
    const[submittedBet, setSubmittedBet] = useState(null); //The bet amount that is stored for later use



    useEffect(() => { const storedUsername = localStorage.getItem('username'); //Storing the username
        if(storedUsername){setUsername(storedUsername);}
    }, []);

    const handleStartGame = ()=> setGameStarted(true); //Starting the game after start game button is pressed

    const handleRaise = () => { //Stores the amount of money bet, and clears the input box
        setSubmittedBet(Number(betAmount));
        setBetAmount(''); 
        setShowBetInput(false);
    }
    const handleCall = () => {} // Implemented in Backend
    const handleFold = () => {} //Implemented in backend

    return(
        <div className="game-container">
            {!gameStarted ? (
            <div className="bottom-content">
                <h1 className="username-text">{username || 'Guest'}, Press start to begin the game</h1>
                <div className="button-container">
                    <button className="game-button" onClick={handleStartGame}>
                        Start
                    </button>
                </div>
            </div>
            ) : (
                <div className="bottom-content">
                    <h1 className="username-text">{username || 'Guest'}</h1>
                    <div className="gameplay-buttons">
                        <button className="game-button">Fold</button>
                        <button className="game-button"
                        onClick={() => setShowBetInput(prev => !prev)}>Raise</button>
                        <button className="game-button">Call</button>
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
                            >Bet</button>
                        </div>
                    )}
                    {/*for testing purposes */}
                    {submittedBet !== null && (
                        <p className="submitted-bet-text">You bet: ${submittedBet}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Game;
