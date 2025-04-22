// TODO: text element doesn't print player name


export default function Seat({ name, cards, chips, bet, isTurn = false, hasSmallBlind = false, hasBigBlind = false }) {
  return (
    <>
      <h2>{name}</h2>
      { isTurn && <h2>Your Turn!</h2>}
      <h4>{`Chips: ${chips} Bet: ${bet}`}</h4>
      { hasSmallBlind && <h5>Small Blind</h5> }
      { hasBigBlind && <h5>Big Blind</h5> }
      <img
        src={cardImage(cards[0])}
        width={70}
        alt=""
      />
      <img
        src={cardImage(cards[1])}
        width={70}
        alt=""
      />
    </>
  )
}


function cardImage(cardString) {

  let imagePath = '/images/Playing Cards/PNG-cards-1.3/';

  if (cardString === undefined) {
    return imagePath + 'red_joker.png';
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
