import './App.css';
import {Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  return (
    <Routes>
      <Route path="/" element={
      <Home />
      } />
      <Route path="/game/:gameId" element={
      <Game />
      } />

    </Routes>
  );
}

export default App;

// TODO: Sanitize game Id input for security 
