import React from 'react';
import ChessPageUI from './ChessPageUI';

const mockProps = {
  fen: 'start',
  onPieceDrop: (from,to) => console.log(`Move from ${from} to ${to}`),
  customSquareStyles: {},
  boardOrientation: 'white',
  players: {
    white: { name: 'Тест Белые', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
    black: { name: 'Тест Черные', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
  },
  whiteTime: 300,
  blackTime: 300,
  currentPlayer: 'w',
  gameStatus: 'Игра идет',
  moves: ['e4','e5'],
  capturedByWhite: [],
  capturedByBlack: [],
  onResign: ()=>console.log('Resign'),
  onOfferDraw: ()=>console.log('Draw'),
  onMoveBackward: ()=>console.log('Back'),
  onMoveForward: ()=>console.log('Forward'),
  onRestart: ()=>console.log('Restart')
};

const ChessPageMock = () => <ChessPageUI {...mockProps} />;

export default ChessPageMock;