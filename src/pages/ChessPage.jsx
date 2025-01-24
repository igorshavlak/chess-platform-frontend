// src/pages/ChessPage/ChessPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import Sidebar from '../components/Sidebar/Sidebar';
import InfoPanel from '../components/InfoPanel/InfoPanel';
import ChessboardComponent from '../components/ChessboardComponent/ChessboardComponent';
import RightInfoPanel from '../components/InfoPanel/RightInfoPanel';
import './ChessPage.css';

function ChessPage() {
  // 1) Ініціалізація chess.js
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);

  // 2) Таймери та статус
  const [whiteTime, setWhiteTime] = useState(300); // 5 хв
  const [blackTime, setBlackTime] = useState(300); // 5 хв
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [gameStatus, setGameStatus] = useState('Гра триває');

  // 3) Захоплені фігури
  const [capturedByWhite, setCapturedByWhite] = useState([]); // масив фігур чорних
  const [capturedByBlack, setCapturedByBlack] = useState([]); // масив фігур білих

  // 4) Останній хід (для підсвітки)
  const [lastMove, setLastMove] = useState(null);

  // 5) Реф для таймерів
  const timerRef = useRef(null);

  // 6) Ваші дані про гравців
  const players = {
    white: {
      name: 'Гравець 1',
      avatar: 'https://i.pravatar.cc/150?img=32',
      rating: 1500,
    },
    black: {
      name: 'Гравець 2',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 1450,
    },
  };

  // Запуск таймеру та перевірки статусу гри
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Зменшуємо час для поточного гравця щосекунди
    timerRef.current = setInterval(() => {
      if (currentPlayer === 'w') {
        setWhiteTime((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setBlackTime((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    // Окремий інтервал для перевірки умов кінця гри
    const statusInterval = setInterval(() => {
      if (game.in_checkmate()) {
        setGameStatus(
          currentPlayer === 'w'
            ? 'Чорні виграли (мат)'
            : 'Білі виграли (мат)'
        );
        clearInterval(timerRef.current);
      } else if (game.in_stalemate()) {
        setGameStatus('Нічия (пат)');
        clearInterval(timerRef.current);
      } else if (game.in_threefold_repetition()) {
        setGameStatus('Нічия (3-разове повторення)');
        clearInterval(timerRef.current);
      } else if (game.insufficient_material()) {
        setGameStatus('Нічия (недостатньо матеріалу)');
        clearInterval(timerRef.current);
      } else if (whiteTime === 0) {
        setGameStatus('Чорні виграли (час білих вийшов)');
        clearInterval(timerRef.current);
      } else if (blackTime === 0) {
        setGameStatus('Білі виграли (час чорних вийшов)');
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(statusInterval);
    };
  }, [currentPlayer, game, whiteTime, blackTime]);

  // Обробка ходу
  const handleMove = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (move === null) return false; // Невірний хід

    setFen(game.fen());
    setMoves((prev) => [...prev, move.san]);
    setLastMove({ from: move.from, to: move.to });
    setCurrentPlayer(game.turn());

    // Якщо фігуру захопили
    if (move.captured) {
      if (move.color === 'w') {
        // білі захопили чорну фігуру
        setCapturedByWhite((prev) => [...prev, move.captured]);
      } else {
        // чорні захопили білу фігуру
        setCapturedByBlack((prev) => [...prev, move.captured]);
      }
    }

    return true;
  };

  // Підсвітка останнього ходу
  const getSquareStyles = () => {
    if (!lastMove) return {};
    return {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    };
  };

  // Кнопки правої панелі
  const handleResign = () => {
    if (currentPlayer === 'w') {
      setGameStatus('Білі здалися. Перемога чорних.');
    } else {
      setGameStatus('Чорні здалися. Перемога білих.');
    }
    clearInterval(timerRef.current);
  };

  const handleOfferDraw = () => {
    setGameStatus('Нічия (за згодою)');
    clearInterval(timerRef.current);
  };

  const handleMoveBackward = () => {
    if (game.history().length > 0) {
      game.undo();
      setFen(game.fen());
      setMoves(game.history());
      setLastMove(null);
      setCurrentPlayer(game.turn());
    }
  };

  const handleMoveForward = () => {
    // Потрібна логіка redo; для прикладу лишимо пустим
  };

  // Приклад перезапуску гри
  const restartGame = () => {
    game.reset();
    setFen('start');
    setMoves([]);
    setWhiteTime(300);
    setBlackTime(300);
    setCurrentPlayer('w');
    setLastMove(null);
    setGameStatus('Гра триває');
  };

  return (
    <div className="chess-page">
      <Sidebar />

      <div className="chess-game-container">
        {/* Ліва панель: тепер з “захопленими” фігурами */}
        <InfoPanel
          players={players}
          whiteTime={whiteTime}
          blackTime={blackTime}
          currentPlayer={currentPlayer}
          gameStatus={gameStatus}
          moves={moves}
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />

        {/* Шахівниця */}
        <ChessboardComponent
          fen={fen}
          onPieceDrop={handleMove}
          customSquareStyles={getSquareStyles()}
        />

        {/* Права панель */}
        <RightInfoPanel
          moves={moves}
          onResign={handleResign}
          onOfferDraw={handleOfferDraw}
          onMoveBackward={handleMoveBackward}
          onMoveForward={handleMoveForward}
        />
      </div>
    </div>
  );
}

export default ChessPage;
