import React from 'react';
import './Game.css';

export default function Seat({
                                 name,
                                 cards = [],
                                 chips,
                                 bet,
                                 isTurn,
                                 hasSmallBlind,
                                 hasLargeBlind,
                                 showCards = false,
                                 seatNumber, // New prop to determine position
                                 backImagePath = '/images/Playing Cards/PNG-cards-1.3/back.png'
                             }) {
    // Guard against missing player data
    if (!name) {
        return <div className="seat seat--missing">No player data!</div>;
    }

    // Guard against missing or incomplete cards
    if (!Array.isArray(cards) || cards.length < 2) {
        return <div className="seat seat--missing">Waiting on cards…</div>;
    }

    const [card1, card2] = cards;

    // Extract suit and rank from codes like '2s' or 'Kc'
    const suit1 = card1.slice(-1).toLowerCase();
    const rank1 = card1.slice(0, card1.length - 1);
    const suit2 = card2.slice(-1).toLowerCase();
    const rank2 = card2.slice(0, card2.length - 1);

    // Determine which image to show (face vs. back)
    const src1 = showCards ? cardImage(card1) : backImagePath;
    const src2 = showCards ? cardImage(card2) : backImagePath;
    console.log('Loading cards for', name, { card1, src1, card2, src2 });

    return (
        <div className={`seat seat-${seatNumber} ${isTurn ? 'seat--active' : ''}`}>
            <h2 className="seat__name">
                {name}
                {isTurn && ' (Your Turn)'}
                {hasSmallBlind && ' [SB]'}
                {hasLargeBlind && ' [BB]'}
            </h2>

            <div className="seat__cards">
                <img
                    src={src1}
                    //alt={showCards ? `${rank1} of ${fullSuitName(suit1)}` : 'Hidden Card'}
                    onError={() => console.error(`Failed to load ${src1}`)}
                />
                <img
                    src={src2}
                    //alt={showCards ? `${rank2} of ${fullSuitName(suit2)}` : 'Hidden Card'}
                    onError={() => console.error(`Failed to load ${src2}`)}
                />
            </div>

            <div className="seat__info">
                <p>Chips: {chips}</p>
                <p>Current Bet: {bet}</p>
            </div>
        </div>
    );
}
//I made this new function (incorrectly) before realizing that we literally already had one
//THis is what they call a big brain maneuver
// Returns path like '/images/Playing Cards/PNG-cards-1.3/2_of_spades.png'
// function cardImage(suit, rank) {
//     const suitMap = {
//         s: 'spades',
//         h: 'hearts',
//         d: 'diamonds',
//         c: 'clubs'
//     };
//     const fullSuit = suitMap[suit] || suit;
//     return `../../images/Playing Cards/PNG-cards-1.3/${rank}_of_${fullSuit}.png`;
// }
//
// function fullSuitName(suit) {
//     const suitMap = {
//         s: 'spades',
//         h: 'hearts',
//         d: 'diamonds',
//         c: 'clubs'
//     };
//     return suitMap[suit] || suit;
// }

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