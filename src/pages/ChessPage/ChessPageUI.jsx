import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import InfoPanel from '../../components/InfoPanel/InfoPanel';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import RightInfoPanel from '../../components/InfoPanel/RightInfoPanel';
import './ChessPage.css';

const ChessPageUI = ({
  fen,
  onPieceDrop,
  customSquareStyles,
  boardOrientation,
  players,
  whiteTime,
  blackTime,
  currentPlayer,
  gameStatus,
  moves,
  capturedByWhite,
  capturedByBlack,
  onResign,
  onOfferDraw,
  onMoveBackward,
  onMoveForward,
  onRestart,
}) => (
  <div className="chess-page">
    <Sidebar />
    <div className="chess-game-container">
      {/* Ліва панель */}
      <div className="left-panel-wrapper">
        <InfoPanel
          players={players}
          whiteTime={whiteTime}
          blackTime={blackTime}
          currentPlayer={currentPlayer}
          gameStatus={gameStatus}
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />
      </div>

      {/* Середня колонка з дошкою */}
      <div className="board-wrapper">
        <ChessboardComponent
          fen={fen}
          onPieceDrop={onPieceDrop}
          customSquareStyles={customSquareStyles}
          boardOrientation={boardOrientation}
        />
      </div>

      {/* Права панель */}
      <div className="right-panel-wrapper">
        <RightInfoPanel
          moves={moves}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onMoveBackward={onMoveBackward}
          onMoveForward={onMoveForward}
        />
      </div>
    </div>
  </div>
);

export default ChessPageUI;