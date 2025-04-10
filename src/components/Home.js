import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {

    const[username, setUsername] = useState('');
    const[gameId, setGameId] = useState('');
    const navigate = useNavigate();

    const handleJoinGame = () => { 
        if(username.trim() !== ''){
            localStorage.setItem('username', username);
            navigate('/game/' + gameId);
        }
        else{
            alert('Please Enter A Username Before Joining the Game');
        }
    }

  return (
    <div className="home-container">
      <h1 className="home-title">Poker Game</h1>
      <div className="username-join-container">
        <input
            type="text"
            className="username-input"
            placeholder="Enter Your Username"
            value={username}
            onChange={(e)=> setUsername(e.target.value)}
        />
        <input
            type="text"
            className="gameid-input"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e)=> setGameId(e.target.value)}
        />
        <button className="join-button" onClick={handleJoinGame}>
            Join Game
        </button>
        </div>
    </div>
  );
}

export default Home;
