
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import InfoPanel from '../../components/InfoPanel/InfoPanel';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import RightInfoPanel from '../../components/InfoPanel/RightInfoPanel';
import './ChessPage.css'; // Використання існуючих стилів для основної структури
import './SimulPage.css'; // Нові стилі для елементів симуляції

const SimulPageUI = ({
  // Пропси для головної дошки (активної гри)
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

  // Нові пропси для симуляції
  simulGames, // Масив об'єктів, кожен представляє міні-гру зі своїм fen, id тощо.
  activeSimulGameId, // ID поточної активної гри
  onMiniBoardClick, // Коллбек при натисканні на міні-дошку
  autoSwitchEnabled, // Булеве значення для автоперемикання
  onAutoSwitchToggle, // Коллбек для перемикання автоперемикання
}) => (
  <div className="chess-page simul-page"> {/* Додаємо клас simul-page для специфічних стилів */}
    <Sidebar />
    <div className="chess-game-container">
      {/* Ліва панель */}
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

      {/* Основна дошка */}
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
          onRestart={onRestart}
        />
      </div>
    </div>

    {/* Міні-дошки та перемикач автоперемикання */}
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

    <div className="mini-boards-container">
      {simulGames.map((gameData) => (
        <div
          key={gameData.gameId}
          className={`mini-board-wrapper ${gameData.gameId === activeSimulGameId ? 'active' : ''}`}
          onClick={() => onMiniBoardClick(gameData.gameId)}
        >
          <ChessboardComponent
            fen={gameData.fen}
            boardOrientation={gameData.localColor === 'w' ? 'white' : 'black'}
            draggable={false} // Міні-дошки тільки для відображення, без взаємодії
            className="mini-chessboard"
          />
          <div className="mini-board-info">
              <p>Гра ID: {gameData.gameId}</p>
              <p>Гравці: {gameData.players?.white?.name} vs {gameData.players?.black?.name}</p>
              <p>Хід: {gameData.currentPlayer === 'w' ? 'Білі' : 'Чорні'}</p>
              {gameData.whiteTime != null && gameData.blackTime != null && (
                <p>Час: {Math.floor(gameData.whiteTime / 60).toString().padStart(2, '0')}:{(gameData.whiteTime % 60).toString().padStart(2, '0')} | {Math.floor(gameData.blackTime / 60).toString().padStart(2, '0')}:{(gameData.blackTime % 60).toString().padStart(2, '0')}</p>
              )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SimulPageUI;