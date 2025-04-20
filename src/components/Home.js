import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {

    const serverUrl = 'http://localhost:3001/';

    const[username, setUsername] = useState('');
      const[gameId, setGameId] = useState('');
      const navigate = useNavigate();

      const handleJoinGame = async () => { 
          if(username.trim() !== ''){
              localStorage.setItem('username', username);
              navigate('/game/' + gameId);
        
            try {
              
              const response = await fetch(serverUrl + 'game', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify({ gameId: gameId, player: username })
              });

            } catch (error) {
              console.log(error);
            }
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
