// InfoPanel.jsx
import React from 'react';
import { FaFire, FaChessKing } from 'react-icons/fa';
import './InfoPanel.css';

// Компонент для відображення інформації про одного гравця
function PlayerInfo({ player, time, isActive, color }) {
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className={`player-info ${isActive ? 'active' : ''}`}>
      <div className="player-top">
        <div className="player-avatar">
          <img src={player.avatar} alt={player.name} />
        </div>
        <div className="player-details">
          <h3 className="player-name">{player.name}</h3>
          <p className="player-rating">{player.rating} lł</p>
          <div className="player-stats">
            <FaFire className="icon-stats" />
            <span>+1</span>
          </div>
        </div>
      </div>

      <div className="player-time-container">
        <div className="player-time-label">{color}</div>
        <div className="player-time-value">{formatTime(time)}</div>
      </div>
    </div>
  );
}

// Компонент для відображення статусу гри
function GameStatus({ status }) {
  return (
    <div className="game-status">
      <h4>Rated mode • Challenge 3 min</h4>
      <p>{status}</p>
    </div>
  );
}

// Секція “захоплені фігури” (хто що побив)
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

// Допоміжна компонента: “захоплені фігури” -> Юнікод-символи
function CapturedIcons({ pieces, captorColor }) {
  const pieceToUnicode = (pieceType) => {
    const isWhite = captorColor === 'white';
    // “p”,”r”,”n”,”b”,”q”,”k”
    switch (pieceType.toLowerCase()) {
      case 'p': return isWhite ? '♟' : '♙';
      case 'r': return isWhite ? '♜' : '♖';
      case 'n': return isWhite ? '♞' : '♘';
      case 'b': return isWhite ? '♝' : '♗';
      case 'q': return isWhite ? '♛' : '♕';
      case 'k': return isWhite ? '♚' : '♔';
      default:  return '?';
    }
  };

  return (
    <div className="captured-icons">
      {pieces.map((p, idx) => (
        <span key={idx} className="captured-piece">
          {pieceToUnicode(p)}
        </span>
      ))}
    </div>
  );
}

// Основна панель, яка збирає все разом
function InfoPanel({
  players,
  whiteTime,
  blackTime,
  currentPlayer,
  gameStatus,
  // Додаємо пропси для захоплених фігур
  capturedByWhite,
  capturedByBlack
}) {
  return (
    <div className="left-panel">
      {/* Шапка панелі */}
      <div className="panel-header">
        <FaChessKing size={24} />
        <span>Rated mode - Challenge 3 min</span>
      </div>

      {/* Блок з обома гравцями */}
      <div className="players-wrapper">
        <PlayerInfo
          player={players.white}
          time={whiteTime}
          isActive={currentPlayer === 'w'}
          color="White"
        />
        <div className="vs-label">VS</div>
        <PlayerInfo
          player={players.black}
          time={blackTime}
          isActive={currentPlayer === 'b'}
          color="Black"
        />
      </div>

      {/* Статус гри */}
      <GameStatus status={gameStatus} />

      {/* Захоплені фігури */}
      <CapturedSection
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
      />
    </div>
  );
}

export default InfoPanel;
