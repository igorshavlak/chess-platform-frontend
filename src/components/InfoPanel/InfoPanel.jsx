// src/components/InfoPanel.jsx
import React from 'react';
import { FaFire, FaChessKing } from 'react-icons/fa';
import './InfoPanel.css';

// Форматирование секунд в MM:SS
const formatTime = t => {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Одиночная карточка игрока
function PlayerInfo({ player, time, isActive, colorLabel }) {
  return (
    <div className={`player-info ${isActive ? 'active' : ''}`}>
      <div className="player-top">
        <div className="player-avatar">
          <img src={player.avatar} alt={player.name} />
        </div>
        <div className="player-details">
          <h3 className="player-name">{player.name}</h3>
          <p className="player-rating">{player.rating} 𝚕ł</p>
          <div className="player-stats">
            <FaFire className="icon-stats" />
            <span>+1</span>
          </div>
        </div>
      </div>
      <div className="player-time-container">
        <div className="player-time-label">{colorLabel}</div>
        <div className="player-time-value">{formatTime(time)}</div>
      </div>
    </div>
  );
}

// Статус игры (заголовок + текст)
function GameStatus({ gameMode, timeControl, status }) {
  return (
    <div className="game-status">
      <h4>{gameMode} • {timeControl}</h4>
      <p>{status}</p>
    </div>
  );
}

// Захваченные фигуры
function CapturedSection({ capturedByWhite, capturedByBlack }) {
  return (
    <div className="captured-section">
      <h3>Captured Pieces</h3>
      <div className="captured-row">
        <span>by White:</span>
        <CapturedIcons pieces={capturedByWhite} captorColor="white" />
      </div>
      <div className="captured-row">
        <span>by Black:</span>
        <CapturedIcons pieces={capturedByBlack} captorColor="black" />
      </div>
    </div>
  );
}

function CapturedIcons({ pieces, captorColor }) {
  const pieceToUnicode = pt => {
    const w = captorColor === 'white';
    switch (pt.toLowerCase()) {
      case 'p': return w ? '♟' : '♙';
      case 'r': return w ? '♜' : '♖';
      case 'n': return w ? '♞' : '♘';
      case 'b': return w ? '♝' : '♗';
      case 'q': return w ? '♛' : '♕';
      case 'k': return w ? '♚' : '♔';
      default:  return '?';
    }
  };

  return (
    <div className="captured-icons">
      {pieces.map((p, i) => <span key={i} className="captured-piece">{pieceToUnicode(p)}</span>)}
    </div>
  );
}

// Основной InfoPanel
export default function InfoPanel({
  players,
  localColor,      // 'w' или 'b'
  whiteTime,
  blackTime,
  currentPlayer,   // 'w' или 'b'
  gameMode,
  timeControl,
  gameStatus,
  capturedByWhite,
  capturedByBlack
}) {
  // Определяем порядок: сначала локальный игрок
  const isLocalWhite = localColor === 'w';
  const firstColor   = isLocalWhite ? 'white' : 'black';
  const secondColor  = isLocalWhite ? 'black' : 'white';

  const firstPlayer   = players[firstColor];
  const secondPlayer  = players[secondColor];
  const firstTime     = firstColor === 'white' ? whiteTime : blackTime;
  const secondTime    = secondColor === 'white' ? whiteTime : blackTime;
  const firstActive   = currentPlayer === (firstColor === 'white' ? 'w' : 'b');
  const secondActive  = currentPlayer === (secondColor === 'white' ? 'w' : 'b');

  return (
    <div className="left-panel">
      {/* Заголовок с режимом и контролем */}
      <div className="panel-header">
        <FaChessKing size={24} />
        <span>{gameMode} • {timeControl}</span>
      </div>

      {/* Две карточки: сначала локальный игрок, потом оппонент */}
      <div className="players-wrapper">
        <PlayerInfo
          player={firstPlayer}
          time={firstTime}
          isActive={firstActive}
          colorLabel={firstColor === 'white' ? 'White' : 'Black'}
        />
        <div className="vs-label">VS</div>
        <PlayerInfo
          player={secondPlayer}
          time={secondTime}
          isActive={secondActive}
          colorLabel={secondColor === 'white' ? 'White' : 'Black'}
        />
      </div>

      {/* Статус игры */}
      <GameStatus
        gameMode={gameMode}
        timeControl={timeControl}
        status={gameStatus}
      />

      {/* Захваченные фигуры */}
      <CapturedSection
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
      />
    </div>
  );
}
