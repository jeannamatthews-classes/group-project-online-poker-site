
import { GameState, Player } from '../Backend/GameState.js'

// TODO: text element doesn't print player name


export default function Seat({ player }) {
  return (
    <>
      <h1>Player: {player.name}</h1>
      <img
        src={cardImage(player.cards[0])}
        alt=""
      />
      <img
        src={cardImage(player.cards[1])}
        alt=""
      />
    </>
  )
}


function cardImage(suit, rank) {
  return suit + rank + ".png"
}
