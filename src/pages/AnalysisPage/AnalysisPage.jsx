import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { useLocation } from 'react-router-dom';
import ControlPanel from '../../components/AnalysisControlPanel/AnalysisControlPanel';
import EvalBar from '../../components/EvalBar/EvalBar';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import './AnalysisPage.css';

const STOCKFISH_JS = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';

function AnalysisPage() {
  const { state } = useLocation();
  // ============================
  // 1) Основна логіка
  // ============================
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  const [analysisType, setAnalysisType] = useState('client');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [depth, setDepth] = useState(15);

  const [evaluations, setEvaluations] = useState({});
  const [currentEval, setCurrentEval] = useState(null);
  const [bestMove, setBestMove] = useState(null);
  const [moveQuality, setMoveQuality] = useState('');
  const [showEvaluations, setShowEvaluations] = useState(false);

  const stockfishRef = useRef(null);

  // ============================
  // 2) Ефемерна (побічна) лінія
  // ============================
  const [ephemeralLineStart, setEphemeralLineStart] = useState(null);
  const [ephemeralLine, setEphemeralLine] = useState([]); // масив { san, fen }
  const [ephemeralGame] = useState(new Chess());
  // Якщо треба аналіз варіантів — можна додати 2-й движок, як у попередньому прикладі

  // ============================
  // 3) Завантаження прикладної партії
  // ============================
  useEffect(() => {
 
    const sampleMoves = [
      'e4', 'e5',
      'Nf3', 'Nc6',
      'Bb5', 'a6',
      'Ba4', 'Nf6',
      'O-O', 'Be7',
      'Re1', 'b5',
      'Bb3', 'd6'
    ];
    game.reset();
    const moves = state?.moves || [];
    const moveHistory = [];

    sampleMoves.forEach((move) => {
      try {
        const result = game.move(move);
        if (result) {
          moveHistory.push({
            san: result.san,
            fen: game.fen()
          });
        }
      } catch (error) {
        console.error(`Нелегальний хід: ${move}`, error);
      }
    });

    setFen(game.fen());
    setHistory(moveHistory);
    setCurrentMoveIndex(moveHistory.length - 1);
  }, [game]);


  useEffect(() => {
    if (analysisType !== 'client') return;

    const script = document.createElement('script');
    script.src = STOCKFISH_JS;
    script.async = true;
    script.onload = () => {
      const engine = window.STOCKFISH();
      engine.onmessage = handleStockfishMessage;
      stockfishRef.current = engine;
      stockfishRef.current.postMessage('uci');
      stockfishRef.current.postMessage('isready');
    };
    document.body.appendChild(script);

    return () => {
      if (stockfishRef.current) {
        stockfishRef.current.postMessage('quit');
      }
      document.body.removeChild(script);
    };
  }, [analysisType]);

  const handleStockfishMessage = (event) => {
    const message = event.data;

    if (message.includes('bestmove')) {
      const bestMoveMatch = message.match(/bestmove\s+(\S+)/);
      if (bestMoveMatch) {
        setBestMove(bestMoveMatch[1]);
        setIsAnalyzing(false);
        setShowEvaluations(true);
      }
    } else if (message.includes('score cp')) {
      const scoreMatch = message.match(/score cp\s+(-?\d+)/);
      const depthMatch = message.match(/depth\s+(\d+)/);
      if (scoreMatch && depthMatch) {
        const score = parseInt(scoreMatch[1], 10) / 100;
        const currDepth = parseInt(depthMatch[1], 10);

        if (currDepth >= depth - 3) {
          const currFen = game.fen();
          setCurrentEval(score);
          setEvaluations((prev) => ({
            ...prev,
            [currFen]: { score, depth: currDepth },
          }));
          determineMoveQuality(score);
        }
      }
    }
  };

  // ============================
  // 5) Аналіз основної позиції
  // ============================
  const analyzePosition = () => {
    if (analysisType === 'client') {
      if (!stockfishRef.current) return;
      setIsAnalyzing(true);
      setShowEvaluations(false);
      stockfishRef.current.postMessage(`position fen ${game.fen()}`);
      stockfishRef.current.postMessage(`go depth ${depth}`);
    } else {
      analyzePositionOnServer();
    }
  };

  const analyzePositionOnServer = async () => {
    setIsAnalyzing(true);
    setShowEvaluations(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockEval = Math.random() * 2 - 1;
      setCurrentEval(mockEval);
      setEvaluations((prev) => ({
        ...prev,
        [game.fen()]: { score: mockEval, depth: 20 },
      }));
      determineMoveQuality(mockEval);
      setShowEvaluations(true);
    } catch (error) {
      console.error('Помилка серверного аналізу:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeGame = async () => {
    setIsAnalyzing(true);
    setShowEvaluations(false);

    for (let i = 0; i < history.length; i++) {
      game.reset();
      for (let j = 0; j <= i; j++) {
        game.move(history[j].san);
      }
      if (analysisType === 'client' && stockfishRef.current) {
        await new Promise((resolve) => {
          const handleMessage = (e) => {
            if (e.data.includes('bestmove')) {
              stockfishRef.current.removeEventListener('message', handleMessage);
              resolve();
            }
          };
          stockfishRef.current.addEventListener('message', handleMessage);
          stockfishRef.current.postMessage(`position fen ${game.fen()}`);
          stockfishRef.current.postMessage(`go depth ${depth}`);
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockEval = Math.random() * 2 - 1;
        setEvaluations((prev) => ({
          ...prev,
          [game.fen()]: { score: mockEval, depth: 20 },
        }));
      }
    }

    setIsAnalyzing(false);
    setShowEvaluations(true);
    if (history.length) {
      game.reset();
      history.forEach((move) => game.move(move.san));
      setFen(game.fen());
    }
  };

  // ============================
  // 6) Якість ходу
  // ============================
  const determineMoveQuality = (score) => {
    if (currentMoveIndex < 1) {
      setMoveQuality('');
      return;
    }
    const prevFen = history[currentMoveIndex - 1]?.fen;
    if (!prevFen) {
      setMoveQuality('');
      return;
    }
    const prevEval = evaluations[prevFen]?.score || 0;
    const prevTurn = prevFen.split(' ')[1];
    const adjustedPrevEval = prevTurn === 'b' ? -prevEval : prevEval;
    const adjustedCurrentEval = prevTurn === 'b' ? score : -score;
    const evalDiff = adjustedCurrentEval - adjustedPrevEval;

    if (evalDiff > 2) {
      setMoveQuality('blunder');
    } else if (evalDiff > 1) {
      setMoveQuality('mistake');
    } else if (evalDiff > 0.5) {
      setMoveQuality('inaccuracy');
    } else if (evalDiff > -0.1) {
      setMoveQuality('neutral');
    } else if (evalDiff > -0.5) {
      setMoveQuality('good');
    } else if (evalDiff >= -2) {
      setMoveQuality('excellent');
    } else {
      setMoveQuality('brilliant');
    }
  };

  // ============================
  // 7) Навігація по історії
  // ============================
  const goToMove = (index) => {
    if (index < 0 || index >= history.length) return;
    game.reset();
    for (let i = 0; i <= index; i++) {
      game.move(history[i].san);
    }
    setFen(game.fen());
    setCurrentMoveIndex(index);

    const currFen = game.fen();
    if (evaluations[currFen]) {
      setCurrentEval(evaluations[currFen].score);
      determineMoveQuality(evaluations[currFen].score);
    } else {
      setCurrentEval(null);
      setMoveQuality('');
    }

    // При переході до іншого ходу основної лінії – скидаємо побічну
    setEphemeralLineStart(null);
    setEphemeralLine([]);
  };

  const firstMove = () => goToMove(0);
  const prevMove = () => goToMove(currentMoveIndex - 1);
  const nextMove = () => goToMove(currentMoveIndex + 1);
  const lastMove = () => goToMove(history.length - 1);

  // ============================
  // 8) Обробка DnD на дошці -> побічна гілка
  // ============================
  const handlePieceDrop = (sourceSquare, targetSquare) => {
    const moveObj = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    // Якщо ще не створено побічну лінію, ставимо початок на currentMoveIndex
    if (ephemeralLineStart === null) {
      setEphemeralLineStart(currentMoveIndex);
    }

    // 1) Зіграємо всі ходи основної лінії до currentMoveIndex
    ephemeralGame.reset();
    for (let i = 0; i <= currentMoveIndex; i++) {
      ephemeralGame.move(history[i].san);
    }
    // 2) Потім зіграємо всі ходи з ephemeralLine
    ephemeralLine.forEach((m) => {
      ephemeralGame.move(m.san);
    });

    // 3) Спробуємо зробити новий хід
    const result = ephemeralGame.move(moveObj);
    if (!result) {
      // Нелегальний хід
      return false;
    }

    // 4) Додаємо до масиву побічної лінії
    const newMove = { san: result.san, fen: ephemeralGame.fen() };
    setEphemeralLine((prev) => [...prev, newMove]);

    // 5) Тепер дошка відображатиме позицію з ephemeralGame
    //    (замість основного fen)
    return true;
  };

  // ============================
  // 9) Рендер історії основної лінії + побічної
  // ============================
  function renderMoveHistory() {
    // Розбиваємо основну історію на пари
    const movesInPairs = [];
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = i + 1 < history.length ? history[i + 1] : null;
      movesInPairs.push([whiteMove, blackMove]);
    }

    return (
      <div className="move-history">
        <table className="move-history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>White</th>
              <th>Eval</th>
              <th>Black</th>
              <th>Eval</th>
            </tr>
          </thead>
          <tbody>
            {movesInPairs.map(([whiteMove, blackMove], pairIndex) => {
              const moveNumber = pairIndex + 1;
              const whiteIndex = pairIndex * 2;
              const blackIndex = pairIndex * 2 + 1;

              const isWhiteCurrent = whiteIndex === currentMoveIndex;
              const isBlackCurrent = blackIndex === currentMoveIndex;

              const whiteEval = whiteMove && evaluations[whiteMove.fen]?.score;
              const blackEval = blackMove && evaluations[blackMove.fen]?.score;

              return (
                <React.Fragment key={pairIndex}>
                  <tr>
                    <td className="move-number">{moveNumber}</td>
                    {/* Білий хід */}
                    <td
                      className={
                        'move-cell ' + (isWhiteCurrent ? 'current-move-cell' : '')
                      }
                      onClick={() => goToMove(whiteIndex)}
                    >
                      {whiteMove?.san ?? ''}
                    </td>
                    <td className="move-eval-cell">
                      {whiteEval !== undefined && (
                        <span
                          style={{
                            color: whiteEval >= 0 ? '#4caf50' : '#f44336',
                          }}
                        >
                          {whiteEval > 0 ? '+' : ''}
                          {whiteEval.toFixed(1)}
                        </span>
                      )}
                    </td>

                    {/* Чорний хід */}
                    <td
                      className={
                        'move-cell ' + (isBlackCurrent ? 'current-move-cell' : '')
                      }
                      onClick={() => goToMove(blackIndex)}
                    >
                      {blackMove?.san ?? ''}
                    </td>
                    <td className="move-eval-cell">
                      {blackEval !== undefined && (
                        <span
                          style={{
                            color: blackEval >= 0 ? '#4caf50' : '#f44336',
                          }}
                        >
                          {blackEval > 0 ? '+' : ''}
                          {blackEval.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Якщо тут починається/знаходиться побічна лінія */}
                  {ephemeralLineStart === whiteIndex ||
                  ephemeralLineStart === blackIndex ? (
                    <tr>
                      <td colSpan={5} style={{ paddingLeft: '2rem' }}>
                        {renderEphemeralLine()}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ============================
  // 10) Рендер побічної лінії (декілька ходів)
  // ============================
  function renderEphemeralLine() {
    if (!ephemeralLine || ephemeralLine.length === 0) {
      return null;
    }
    // Розіб’ємо її на пари ходів
    const ephemeralPairs = [];
    for (let i = 0; i < ephemeralLine.length; i += 2) {
      const w = ephemeralLine[i];
      const b = i + 1 < ephemeralLine.length ? ephemeralLine[i + 1] : null;
      ephemeralPairs.push([w, b]);
    }

    // Початковий напівхід (halfmove) — ephemeralLineStart
    // moveNumber = (halfmove // 2) + 1
    const baseHalfmove = ephemeralLineStart || 0;
    return (
      <div style={{ marginTop: '0.3rem' }}>
        <strong style={{ color: '#ccc' }}>Побічна лінія:</strong>
        {ephemeralPairs.map(([whiteMove, blackMove], idx) => {
          const halfmoveWhite = baseHalfmove + idx * 2 + 1; // +1, бо перший хід у варіанті
          const halfmoveBlack = halfmoveWhite + 1;
          const moveNum = Math.floor(halfmoveWhite / 2) + 1;
          // Якщо halfmoveWhite був непарним, це білий, якщо ні — чорний, але для виводу “N...”
          // робимо приблизно так:
          const showNumber = halfmoveWhite % 2 === 1; // якщо непарне, то це білий хід
          const blackLabel = showNumber ? moveNum + '...' : '';

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1rem',
                marginLeft: '1rem',
                marginTop: '0.2rem',
              }}
            >
              {/* Білий хід (якщо він є) */}
              {whiteMove ? (
                <div
                  style={{
                    backgroundColor: '#333',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  {showNumber ? moveNum + '.' : ''} {whiteMove.san}
                </div>
              ) : null}

              {/* Чорний хід (якщо він є) */}
              {blackMove ? (
                <div
                  style={{
                    backgroundColor: '#333',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  {blackLabel} {blackMove.san}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  // ============================
  // 11) Рендер допоміжних блоків
  // ============================
  const renderAnalysisInfo = () => {
    if (currentEval === null) {
      return (
        <div className="analysis-info">
          <p>Виберіть позицію та натисніть "Аналізувати позицію"</p>
        </div>
      );
    }

    const advantage =
      Math.abs(currentEval) > 0.2
        ? (currentEval > 0 ? 'Білі' : 'Чорні') +
          ` мають перевагу: ${Math.abs(currentEval).toFixed(2)}`
        : 'Рівна позиція';

    return (
      <div className="analysis-info">
        <p>
          <strong>{advantage}</strong>
        </p>
        {bestMove && (
          <p>
            Найкращий хід: <strong>{bestMove}</strong>
          </p>
        )}
        {moveQuality && (
          <p>
            Якість останнього ходу:{' '}
            <span className={`quality-text ${moveQuality}`}>{moveQuality}</span>
          </p>
        )}
      </div>
    );
  };

  // ============================
  // 12) Головний return
  // ============================
 // ... імпорти та useState/useEffect логіка ...

return (
  <div className="app-container">
    <Sidebar />
    <div className="analysis-page">
      <div className="main-content">
        {/* Шахівниця та пов'язані елементи */}
        <div className="board-section">
          <EvalBar currentEval={currentEval} />
          <div className="chessboard-container">
            <ChessboardComponent
              fen={
                ephemeralLine.length
                  ? ephemeralLine[ephemeralLine.length - 1].fen
                  : fen
              }
              onPieceDrop={handlePieceDrop}
              boardOrientation="white"
              customSquareStyles={{}}
            />
          </div>
          {moveQuality && (
            <div className={`move-quality-badge ${moveQuality}`}>
              {moveQuality.toUpperCase()}
            </div>
          )}
        </div>

        {/* Секція для бічної панелі: ControlPanel, навігація, історія ходів, інформація про аналіз */}
        <div className="sidebar-right"> {/* Змінено клас на 'sidebar-right' */}
          <ControlPanel
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
            analyzePosition={analyzePosition}
            analyzeGame={analyzeGame}
            depth={depth}
            setDepth={setDepth}
            isAnalyzing={isAnalyzing}
          />
          <div className="navigation-buttons">
            <button onClick={firstMove} disabled={currentMoveIndex <= 0}>
              ⏮
            </button>
            <button onClick={prevMove} disabled={currentMoveIndex <= 0}>
              ◀
            </button>
            <button
              onClick={nextMove}
              disabled={currentMoveIndex >= history.length - 1}
            >
              ▶
            </button>
            <button
              onClick={lastMove}
              disabled={currentMoveIndex >= history.length - 1}
            >
              ⏭
            </button>
          </div>
          {renderMoveHistory()}
          {renderAnalysisInfo()}
        </div>
      </div>
    </div>
  </div>
);
}

export default AnalysisPage;