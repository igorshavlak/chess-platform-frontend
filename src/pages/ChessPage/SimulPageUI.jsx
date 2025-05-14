import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import InfoPanel from '../../components/InfoPanel/InfoPanel';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import RightInfoPanel from '../../components/InfoPanel/RightInfoPanel';
import Modal from './Modal';
import clsx from 'clsx';

import './ChessPage.css';
import './SimulPage.css';

const SimulPageUI = ({
  fen,
  onPieceDrop,
  customSquareStyles,
  boardOrientation,
  players,
  localColor,
  whiteTime,
  blackTime,
  currentPlayer,
  gameMode,
  timeControl,
  gameStatus,
  moves,
  capturedByWhite,
  capturedByBlack,
  onResign,
  onOfferDraw,
  onMoveBackward,
  onMoveForward,
  onRestart,
  simulGames,
  activeSimulGameId,
  onMiniBoardClick,
  autoSwitchEnabled,
  onAutoSwitchToggle,
  stats, // { wins, losses, draws }
  showModal, // Boolean to show modal
  modalContent, // { title, message, outcome }
  onCloseModal, // Callback to close modal
}) => (
  <div className="chess-page simul-page">
    <Sidebar />
    <div className="chess-game-container">
      {/* Left Panel */}
      <div className="left-panel-wrapper">
        <InfoPanel
          players={players}
          localColor={localColor}
          whiteTime={whiteTime}
          blackTime={blackTime}
          currentPlayer={currentPlayer}
          gameMode={gameMode}
          timeControl={timeControl}
          gameStatus={gameStatus}
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />
      </div>

      {/* Main Board */}
      <div className="board-wrapper">
        <ChessboardComponent
          fen={fen}
          onPieceDrop={onPieceDrop}
          customSquareStyles={customSquareStyles}
          boardOrientation={boardOrientation}
          isDraggablePiece={({ piece }) => {
            if (gameStatus !== 'Гра йде') return false;
            const pieceColor = piece.startsWith('w') ? 'w' : 'b';
            return currentPlayer === localColor && pieceColor === localColor;
          }}
        />
      </div>

      {/* Right Panel */}
      <div className="right-panel-wrapper">
        <RightInfoPanel
          moves={moves}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onMoveBackward={onMoveBackward}
          onMoveForward={onMoveForward}
          onRestart={onRestart}
          gameStatus={gameStatus}
        />
      </div>
    </div>

    {/* Statistics Display */}
    <div className="simul-stats-container">
      <h3>Статистика сеансу:</h3>
      <p className="stats-win">Перемоги: {stats.wins}</p>
      <p className="stats-loss">Поразки: {stats.losses}</p>
      <p className="stats-draw">Нічиї: {stats.draws}</p>
    </div>

    {/* Auto-Switch Controls */}
    <div className="simul-controls">
      <div className="auto-switch-toggle">
        <label htmlFor="auto-switch">Автоперемикання дошок:</label>
        <input
          type="checkbox"
          id="auto-switch"
          checked={autoSwitchEnabled}
          onChange={onAutoSwitchToggle}
        />
      </div>
    </div>

    {/* Mini-Boards */}
    <div className="mini-boards-container">
      {simulGames.map((gameData) => (
        <div
          key={gameData.gameId}
          className={clsx('mini-board-wrapper', {
            active: gameData.gameId === activeSimulGameId,
            'outcome-win': gameData.outcome === 'win',
            'outcome-loss': gameData.outcome === 'loss',
            'outcome-draw': gameData.outcome === 'draw',
          })}
          onClick={() => onMiniBoardClick(gameData.gameId)}
        >
          <ChessboardComponent
            fen={gameData.fen}
            boardOrientation={gameData.localColor === 'w' ? 'white' : 'black'}
            isDraggablePiece={() => false} // Disable dragging on mini-boards
            className="mini-chessboard"
          />
          <div className="mini-board-info">
            <p>{gameData.players.white.name} vs {gameData.players.black.name}</p>
            <p>Статус: {gameData.gameStatus}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Modal for Game Conclusion */}
    {showModal && (
      <Modal
        title={modalContent.title}
        message={modalContent.message}
        outcome={modalContent.outcome}
        onClose={onCloseModal}
      />
    )}
  </div>
);

export default SimulPageUI;