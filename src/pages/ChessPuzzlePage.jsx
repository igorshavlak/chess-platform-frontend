import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessboardComponent from '../components/ChessboardComponent/ChessboardComponent';
import Sidebar from '../components/Sidebar/Sidebar'; // Імпортуємо sidebar з вашого коду
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaLightbulb, 
  FaCheck, 
  FaTimes, 
  FaChevronRight 
} from 'react-icons/fa';
import './ChessPuzzlePage.css';

function ChessPuzzlePage() {
  const [game, setGame] = useState(new Chess());
  const [puzzle, setPuzzle] = useState(null);
  const [puzzleHistory, setPuzzleHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [squareStyles, setSquareStyles] = useState({});
  const [moveResult, setMoveResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [loading, setLoading] = useState(true);
  
  const examplePuzzle = {
    id: 'puzzle1',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    rating: 1800,
    moves: ['d2d4', 'g8f6', 'c2c4'],
    description: 'Знайдіть найкращий стратегічний хід для білих',
    hint: 'Зверніть увагу на контроль центру дошки'
  };

  useEffect(() => {
    setTimeout(() => {
      setPuzzle(examplePuzzle);
      const newGame = new Chess(examplePuzzle.fen);
      setGame(newGame);
      setPuzzleHistory([{ fen: newGame.fen(), lastMove: null }]);
      setCurrentMoveIndex(0);
      setMoveResult(null);
      setShowHint(false);
      setLoading(false);
      
      const turnColor = newGame.turn() === 'w' ? 'white' : 'black';
      setBoardOrientation(turnColor);
    }, 1000);
  }, []);

  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (moveResult === 'correct' || currentMoveIndex < puzzleHistory.length - 1) {
      return false;
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      const correctMove = puzzle.moves[0];
      const userMove = move.from + move.to;
      
      const isCorrect = userMove === correctMove;
      
      const newHistory = [...puzzleHistory, { fen: game.fen(), lastMove: { from: sourceSquare, to: targetSquare } }];
      setPuzzleHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      
      highlightLastMove(sourceSquare, targetSquare);
      
      if (isCorrect) {
        setMoveResult('correct');
        setSquareStyles({
          [sourceSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.3)' },
          [targetSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.3)' }
        });
      } else {
        setMoveResult('incorrect');
        setSquareStyles({
          [sourceSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.3)' },
          [targetSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.3)' }
        });
      }

      return true;
    } catch (error) {
      console.error('Помилка при виконанні ходу:', error);
      return false;
    }
  };

  const highlightLastMove = (from, to) => {
    setSquareStyles({
      [from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    });
  };

  const goToPreviousMove = () => {
    if (currentMoveIndex > 0) {
      const newIndex = currentMoveIndex - 1;
      setCurrentMoveIndex(newIndex);
      const newGame = new Chess(puzzleHistory[newIndex].fen);
      setGame(newGame);
      
      if (newIndex > 0) {
        const lastMove = puzzleHistory[newIndex].lastMove;
        highlightLastMove(lastMove.from, lastMove.to);
      } else {
        setSquareStyles({});
      }
    }
  };

  const goToNextMove = () => {
    if (currentMoveIndex < puzzleHistory.length - 1) {
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      const newGame = new Chess(puzzleHistory[newIndex].fen);
      setGame(newGame);
      
      const lastMove = puzzleHistory[newIndex].lastMove;
      highlightLastMove(lastMove.from, lastMove.to);
    }
  };

  const showHintHandler = () => {
    setShowHint(!showHint);
  };

  const nextPuzzle = () => {
    setLoading(true);
    setTimeout(() => {
      const newGame = new Chess(examplePuzzle.fen);
      setGame(newGame);
      setPuzzleHistory([{ fen: newGame.fen(), lastMove: null }]);
      setCurrentMoveIndex(0);
      setMoveResult(null);
      setShowHint(false);
      setSquareStyles({});
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="content-wrapper">
          <div className="loading-spinner">Завантаження задачі...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-wrapper">
        <div className="chess-puzzle-container">
          <div className="chess-puzzle-content">
            <div className="chess-puzzle-board">
              <ChessboardComponent
                fen={game.fen()}
                onPieceDrop={handlePieceDrop}
                customSquareStyles={squareStyles}
                boardOrientation={boardOrientation}
              />
            </div>
            
            <div className="chess-puzzle-info-panel">
              <div className="puzzle-header">
                <h2>Шахова задача</h2>
                <div className="puzzle-rating">
                  <span>Рейтинг:</span>
                  <span className="rating-value">{puzzle?.rating || 'Невідомо'}</span>
                </div>
              </div>
              
              <div className="puzzle-description">
                <p>{puzzle?.description || 'Опис задачі відсутній'}</p>
              </div>
              
              {moveResult && (
                <div className={`move-result ${moveResult}`}>
                  {moveResult === 'correct' ? (
                    <>
                      <FaCheck />
                      <span>Правильно!</span>
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      <span>Неправильно. Спробуйте ще раз!</span>
                    </>
                  )}
                </div>
              )}
              
              {showHint && (
                <div className="puzzle-hint">
                  <p>{puzzle?.hint || 'Підказка відсутня'}</p>
                </div>
              )}
              
              <div className="puzzle-controls">
                <div className="move-navigation">
                  <button 
                    onClick={goToPreviousMove} 
                    disabled={currentMoveIndex === 0}
                    className="nav-button"
                  >
                    <FaArrowLeft />
                  </button>
                  <span className="move-counter">
                    Хід {currentMoveIndex} / {puzzleHistory.length - 1}
                  </span>
                  <button 
                    onClick={goToNextMove} 
                    disabled={currentMoveIndex === puzzleHistory.length - 1}
                    className="nav-button"
                  >
                    <FaArrowRight />
                  </button>
                </div>
                
                <div className="action-buttons">
                  <button onClick={showHintHandler} className="hint-button">
                    <FaLightbulb />
                    <span>{showHint ? 'Сховати підказку' : 'Показати підказку'}</span>
                  </button>
                  
                  <button onClick={nextPuzzle} className="next-puzzle-button">
                    <span>Наступна задача</span>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessPuzzlePage;