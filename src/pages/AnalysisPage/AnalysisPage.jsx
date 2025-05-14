import React, { useState, useEffect, useRef } from 'react';
  import { Chess } from 'chess.js'; // Потрібна бібліотека для логіки гри
  import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent.jsx';
  import NotationComponent from '../../components/NotationAnalysis/NotationComponent.jsx';
  import AnalysisPanelComponent from '../../components/NotationAnalysis/AnalysisPanelComponent.jsx'; // Створимо цей компонент
  import useStockfish from './useStockfish.js'; // Створимо цей хук
  import Sidebar from '../../components/Sidebar/Sidebar.jsx'; // Якщо сайдбар потрібен на цій сторінці
  import './AnalysisPage.css'; // Додамо стилі для лейауту

  
  function AnalysisPage() {
    // Гра починається зі стандартної початкової позиції як "мок-дані"
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [history, setHistory] = useState(game.history({ verbose: true }));
    const [boardOrientation, setBoardOrientation] = useState('white'); // 'white' або 'black'
    const [currentMoveIndex, setCurrentMoveIndex] = useState(null); // Для навігації по історії
  
    // Хук для Stockfish
    const {
      evaluation,
      pv,
      thinking,
      analyzeFen,
      stopAnalysis,
      loading: stockfishLoading,
      error: stockfishError
    } = useStockfish();
  
    // Оновлення історії та FEN при зміні гри
    useEffect(() => {
      const currentFen = game.fen();
      setFen(currentFen);
      setHistory(game.history({ verbose: true }));
      // Переходимо в кінець історії після кожного ходу або завантаження
      setCurrentMoveIndex(game.history().length > 0 ? game.history().length - 1 : null);
  
      // Аналіз поточної позиції Stockfish
      // Запускаємо аналіз лише якщо гра не закінчилася і рушій не думає/завантажується
      if (!game.isGameOver() && !game.isDraw() && !thinking && !stockfishLoading) {
          analyzeFen(currentFen);
      } else if (game.isGameOver() || game.isDraw()) {
          stopAnalysis(); // Зупиняємо аналіз, якщо гра закінчилася
      }
  
    }, [game, thinking, stockfishLoading, analyzeFen, stopAnalysis]); // Додаємо game як залежність
  
  
    const onPieceDrop = (sourceSquare, targetSquare, piece) => {
      try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: piece.toLowerCase() === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1')
            ? 'q'
            : undefined,
        });
  
        if (move === null) return false; // Недопустимий хід
  
        setGame(gameCopy);
        return true; // Хід успішний
      } catch (e) {
        console.error('Invalid move:', e);
        return false; // Хід недопустимий
      }
    };
  
    // Функція для навігації по ходам
    const navigateToMove = (index) => {
       // Індекс може бути null для скидання
       if (index === null) {
          setGame(new Chess()); // Повертаємось до початкової позиції
          setCurrentMoveIndex(null);
          return;
       }
       if (index < 0 || index >= history.length) return;
  
       const gameCopy = new Chess();
       for (let i = 0; i <= index; i++) {
          gameCopy.move(history[i].san);
       }
       setGame(gameCopy);
       setCurrentMoveIndex(index);
    };
  
    // Визначення стилів для підсвічування останнього ходу або ходу Stockfish
    const customSquareStyles = {};
     // Підсвічування останнього зробленого/переглянутого ходу
     if (currentMoveIndex !== null && history.length > 0 && history[currentMoveIndex]) {
       const lastMove = history[currentMoveIndex];
       customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
       customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
     }
  
    // Підсвічування найкращого ходу Stockfish ТІЛЬКИ якщо ми на останньому ході і рушій дав PV
     if (!thinking && pv && pv.length > 0 && currentMoveIndex === history.length - 1) {
        const gameForMoveParsing = new Chess(game.fen());
        // Парсимо from/to для першого ходу з PV
        try {
            const moves = gameForMoveParsing.moves({ verbose: true });
            const bestMoveSan = pv.split(' ')[0]; // Беремо тільки перший хід з PV
            const bestMove = moves.find(m => m.san === bestMoveSan || m.lan === bestMoveSan);
            if (bestMove) {
                 customSquareStyles[bestMove.from] = { backgroundColor: 'rgba(0, 150, 0, 0.5)' }; // Зелений, більш насичений
                 customSquareStyles[bestMove.to] = { backgroundColor: 'rgba(0, 150, 0, 0.5)' };
            }
        } catch (e) {
            console.error("Error parsing Stockfish best move for highlighting:", e);
        }
     }
  
  
    return (
      <div className="analysis-page-container">
        <Sidebar />
        <div className="analysis-content">
           <div className="analysis-board-area">
              <ChessboardComponent
                fen={fen}
                onPieceDrop={onPieceDrop}
                boardOrientation={boardOrientation}
                customSquareStyles={customSquareStyles}
              />
               <div className="board-controls">
                  <button onClick={() => setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')}>
                     Перевернути дошку
                  </button>
                  {/* Кнопка Нова партія для повернення до початкової позиції */}
                   <button onClick={() => navigateToMove(null)}>Нова партія</button>
               </div>
           </div>
  
           <div className="analysis-info-area">
              {/* Прибираємо компоненти PGNInput та FENInput */}
              {/* <div className="analysis-input-area">
                 <PGNInput onLoadPGN={handleLoadPGN} />
                 <FENInput onLoadFEN={handleLoadFEN} />
              </div> */}
  
              <AnalysisPanelComponent
                 evaluation={evaluation}
                 pv={pv}
                 thinking={thinking}
                 loading={stockfishLoading}
                 error={stockfishError}
              />
  
              <NotationComponent
                 history={history}
                 currentMoveIndex={currentMoveIndex}
                 onMoveClick={navigateToMove}
              />
           </div>
        </div>
      </div>
    );
  }
  
  export default AnalysisPage;