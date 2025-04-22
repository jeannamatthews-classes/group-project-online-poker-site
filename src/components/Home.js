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
              navigate('/game/' + gameId + '/' + username);
        
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
        <div className="background-blur" /* Dont remove, as it neeeded for CSS Styling*/></div> 
        <div className="foreground-content">
            <div className="home-box">
              <h1 className="home-title">Welcome!</h1>
              <div className="username-join-container">
                <input
                type="text"
                className="user-input"
                placeholder="Enter Your Username"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
                />
                <input
                type="text"
                className="user-input" /* I changed this to user input, so it would be formated the same as the other text box. I can change back if necessary*/
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e)=> setGameId(e.target.value)}
                />
                <button className="join-button" onClick={handleJoinGame}>
                Join Game
                </button>
              </div>
            </div>
        </div>
        <h1 className="title-text">Online Poker Game</h1>
      </div>
  );
}

export default Home;
