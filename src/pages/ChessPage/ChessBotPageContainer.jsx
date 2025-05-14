import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessPageUI from './ChessPageUI';
import GameConclusionModal from './GameConclusionModal';
import Modal from 'react-modal'; // For pre-game settings modal
import './ChessPage.css'; // Reuse existing styles

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

export default function ChessBotPageContainer() {
  // Chess.js instance
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [gameStatus, setGameStatus] = useState('Гра йде');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  // Timers and increment (in seconds)
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [increment, setIncrement] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const timerRef = useRef(null);

  // Game settings
  const [localColor, setLocalColor] = useState('w'); // Player is white by default
  const [gameStarted, setGameStarted] = useState(false);
  const [timeControl, setTimeControl] = useState(null);
  const [botDifficulty, setBotDifficulty] = useState(null);

  // Pre-game modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(true);

  // Stockfish bot
  const stockfishRef = useRef(null);

  // Initialize Stockfish
  useEffect(() => {
    stockfishRef.current = new Worker('/stockfish.js'); // Ensure stockfish.js is in public/
    return () => stockfishRef.current.terminate();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!gameStarted || !whiteTime || !blackTime || gameStatus !== 'Гра йде') return;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (currentPlayer === 'w') {
        setWhiteTime((prev) => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            setGameStatus('Чорні виграли по часу!');
            setIsModalOpen(true);
            return 0;
          }
          return newTime;
        });
      } else {
        setBlackTime((prev) => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            setGameStatus('Білі виграли по часу!');
            setIsModalOpen(true);
            return 0;
          }
          return newTime;
        });
      }
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [currentPlayer, gameStarted, gameStatus]);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Bot move logic
  const makeBotMove = () => {
    if (game.turn() !== (localColor === 'w' ? 'b' : 'w') || gameStatus !== 'Гра йде') return;

    // Configure Stockfish difficulty
    const skillLevel = botDifficulty === 'beginner' ? 0 : botDifficulty === 'intermediate' ? 10 : 20;
    stockfishRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`);
    stockfishRef.current.postMessage(`position fen ${game.fen()}`);
    stockfishRef.current.postMessage('go movetime 1000'); // Think for 1 second

    stockfishRef.current.onmessage = (e) => {
      const message = e.data;
      if (message.startsWith('bestmove')) {
        const botMove = message.split(' ')[1];
        if (botMove && botMove !== '(none)') {
          const move = game.move({
            from: botMove.slice(0, 2),
            to: botMove.slice(2, 4),
            promotion: botMove.length > 4 ? botMove[4] : 'q',
          });
          if (move) {
            setFen(game.fen());
            setMoves((prev) => [...prev, move.san]);
            setLastMove({ from: move.from, to: move.to });
            if (move.captured) {
              if (game.turn() === 'w') {
                setCapturedByWhite((prev) => [...prev, move.captured]);
              } else {
                setCapturedByBlack((prev) => [...prev, move.captured]);
              }
            }
            setCurrentPlayer(game.turn());
            setBlackTime((prev) => prev + increment); // Apply increment for bot
            checkGameEnd();
          }
        }
      }
    };
  };

  // Check for game end
  const checkGameEnd = () => {
    if (game.isCheckmate()) {
      setGameStatus(localColor === game.turn() ? 'Ви програли (Мат)!' : 'Ви виграли (Мат)!');
      setIsModalOpen(true);
      clearInterval(timerRef.current);
    } else if (game.isStalemate()) {
      setGameStatus('Пат! Нічия.');
      setIsModalOpen(true);
      clearInterval(timerRef.current);
    } else if (game.isDraw()) {
      setGameStatus('Нічия.');
      setIsModalOpen(true);
      clearInterval(timerRef.current);
    }
  };

  // Handle player move
  const handleMove = (from, to) => {
    if (game.turn() !== localColor || gameStatus !== 'Гра йде') return false;
    const move = game.move({ from, to, promotion: 'q' });
    if (!move) return false;

    setFen(game.fen());
    setMoves((prev) => [...prev, move.san]);
    setLastMove({ from: move.from, to: move.to });
    if (move.captured) {
      if (game.turn() === 'w') {
        setCapturedByWhite((prev) => [...prev, move.captured]);
      } else {
        setCapturedByBlack((prev) => [...prev, move.captured]);
      }
    }
    setCurrentPlayer(game.turn());
    setWhiteTime((prev) => prev + increment); // Apply increment for player
    checkGameEnd();

    // Trigger bot move
    setTimeout(makeBotMove, 500); // Slight delay for natural feel
    return true;
  };

  // Handle pre-game settings submission
  const handleStartGame = () => {
    if (!timeControl || !botDifficulty) return;
    setIsSettingsModalOpen(false);
    setGameStarted(true);

    // Set timers based on time control
    const [baseTime, inc] = timeControl.split('+').map(Number);
    setWhiteTime(baseTime * 60);
    setBlackTime(baseTime * 60);
    setIncrement(inc);

    // Start game with bot move if player is black
    if (localColor === 'b') {
      setTimeout(makeBotMove, 500);
    }
  };

  // Handle resign
  const handleResign = () => {
    setGameStatus('Ви здалися!');
    setIsModalOpen(true);
    clearInterval(timerRef.current);
  };

  // Handle draw offer (not applicable vs bot, but included for UI consistency)
  const handleOfferDraw = () => {
    setGameStatus('Нічия не пропонується проти бота.');
    setIsModalOpen(true);
  };

  // Handle move backward (for analysis)
  const handleMoveBack = () => {
    game.undo();
    setFen(game.fen());
    setMoves(game.history());
    setLastMove(null);
    setCurrentPlayer((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  // Handle restart
  const handleRestart = () => {
    game.reset();
    setFen('start');
    setMoves([]);
    setLastMove(null);
    setGameStatus('Гра йде');
    setCurrentPlayer('w');
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setIsSettingsModalOpen(true);
    setGameStarted(false);
    setWhiteTime(null);
    setBlackTime(null);
    setIncrement(0);
  };

  // Mock players data for UI
  const players = {
    white: { name: localColor === 'w' ? 'Ви' : 'Бот', avatar: localColor === 'w' ? 'https://i.pravatar.cc/150?img=32' : '/bot.png', rating: localColor === 'w' ? 1500 : botDifficulty === 'beginner' ? 800 : botDifficulty === 'intermediate' ? 1600 : 2200 },
    black: { name: localColor === 'b' ? 'Ви' : 'Бот', avatar: localColor === 'b' ? 'https://i.pravatar.cc/150?img=32' : '/bot.png', rating: localColor === 'b' ? 1500 : botDifficulty === 'beginner' ? 800 : botDifficulty === 'intermediate' ? 1600 : 2200 },
  };

  return (
    <>
      {/* Pre-game settings modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onRequestClose={() => {}}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#2e2e2e',
            color: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
        }}
      >
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Налаштування гри</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Контроль часу:</label>
            <select
              value={timeControl || ''}
              onChange={(e) => setTimeControl(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="" disabled>Виберіть контроль часу</option>
              <option value="5+0">5 хвилин</option>
              <option value="10+0">10 хвилин</option>
              <option value="3+2">3 хвилини + 2 секунди</option>
              <option value="15+10">15 хвилин + 10 секунд</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Складність бота:</label>
            <select
              value={botDifficulty || ''}
              onChange={(e) => setBotDifficulty(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="" disabled>Виберіть складність</option>
              <option value="beginner">Початківець (~800)</option>
              <option value="intermediate">Середній (~1600)</option>
              <option value="advanced">Просунутий (~2200)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Колір:</label>
            <select
              value={localColor}
              onChange={(e) => setLocalColor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="w">Білі</option>
              <option value="b">Чорні</option>
            </select>
          </div>
          <button
            onClick={handleStartGame}
            disabled={!timeControl || !botDifficulty}
            style={{
              padding: '0.75rem',
              backgroundColor: timeControl && botDifficulty ? '#1e90ff' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: timeControl && botDifficulty ? 'pointer' : 'not-allowed',
              marginTop: '1rem',
            }}
          >
            Почати гру
          </button>
        </div>
      </Modal>

      {/* Main game UI */}
      {gameStarted && (
        <>
          <ChessPageUI
            fen={fen}
            onPieceDrop={handleMove}
            customSquareStyles={
              lastMove
                ? {
                    [lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
                    [lastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' },
                  }
                : {}
            }
            boardOrientation={localColor === 'w' ? 'white' : 'black'}
            players={players}
            localColor={localColor}
            whiteTime={whiteTime}
            blackTime={blackTime}
            currentPlayer={currentPlayer}
            gameMode="vsBot"
            timeControl={timeControl}
            gameStatus={gameStatus}
            moves={moves}
            capturedByWhite={capturedByWhite}
            capturedByBlack={capturedByBlack}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onMoveBackward={handleMoveBack}
            onMoveForward={() => {}}
            onRestart={handleRestart}
          />
          <GameConclusionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            message={gameStatus}
            gameId="vsBot"
          />
        </>
      )}
    </>
  );
}