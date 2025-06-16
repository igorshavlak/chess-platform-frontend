// src/components/StandardPuzzleMode/StandardPuzzleMode.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import PuzzleControlPanel from '../../components/PuzzleControlPanel/PuzzleControlPanel';
import { useSettings } from '../../context/SettingsContext';
import mockPuzzles from './mockPuzzles';
import './ChessPuzzlePage.css';

function StandardPuzzleMode() {
    const { settings, isLoading } = useSettings();
    const [game, setGame] = useState(new Chess());
    const [history, setHistory] = useState([]);
    const [idx, setIdx] = useState(0);
    const [styles, setStyles] = useState({});
    const [result, setResult] = useState(null); // 'correct' | 'incorrect' | 'error'
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [orientation, setOrientation] = useState('white');
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(1500); // Рейтинг гравця

    const [step, setStep] = useState(1); // Індекс ходу в puzzle.moves, який очікується від гравця
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0); // Індекс поточної задачі

    // --- Новий стан для відстеження штрафу за неправильний хід ---
    const [ratingDecreasedForPuzzle, setRatingDecreasedForPuzzle] = useState(false);

    const puzzle = mockPuzzles[currentPuzzleIndex];

    const gameRef = useRef(game);
    useEffect(() => {
        gameRef.current = game;
    }, [game]);

    useEffect(() => {
        if (!puzzle) {
            console.error("No puzzle found at index:", currentPuzzleIndex);
            setResult('error');
            setLoading(false);
            return;
        }

        setLoading(true);
        setShowHint(false);
        setHintUsed(false);
        setResult(null); // Скидаємо результат для нової задачі
        // --- Скидаємо стан штрафу при завантаженні нової задачі ---
        setRatingDecreasedForPuzzle(false);

        const loadPuzzleTimeout = setTimeout(() => {
            const p = puzzle;
            const g = new Chess(p.fen);
            const initialFen = g.fen();

            let newHistory = [];

            if (p.moves.length === 0) {
                console.error("Puzzle has no moves:", p.id);
                newHistory = [{ fen: initialFen, last: null }];
                setHistory(newHistory);
                setIdx(0);
                setStep(0);
                setOrientation(g.turn() === 'w' ? 'white' : 'black');
                setStyles({});
                setLoading(false);
                setResult('error');
                return;
            }

            const firstEngineMoveStr = p.moves[0];
            const f = firstEngineMoveStr.slice(0, 2);
            const t = firstEngineMoveStr.slice(2, 4);
            const prom = firstEngineMoveStr.length === 5 ? firstEngineMoveStr[4] : undefined;

            const tempGameForFirstMove = new Chess(initialFen);
            const firstEngineMove = tempGameForFirstMove.move({ from: f, to: t, promotion: prom });

            if (!firstEngineMove) {
                console.error("Failed to make engine's mandated first move:", firstEngineMoveStr, "FEN:", initialFen, "Puzzle ID:", p.id);
                setResult('error');
                setLoading(false);
                return;
            }

            setGame(tempGameForFirstMove);

            newHistory = [
                { fen: initialFen, last: null },
                { fen: tempGameForFirstMove.fen(), last: { from: firstEngineMove.from, to: firstEngineMove.to } }
            ];

            setHistory(newHistory);
            setIdx(1);
            setStep(1); // Очікуємо хід гравця (puzzle.moves[1])
            setOrientation(tempGameForFirstMove.turn() === 'w' ? 'white' : 'black');
            setStyles({
                [firstEngineMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
                [firstEngineMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' }
            });
            setLoading(false);

        }, 500);

        return () => clearTimeout(loadPuzzleTimeout);

    }, [currentPuzzleIndex, puzzle]); // Додаємо puzzle в залежності, хоча воно по суті змінюється тільки при зміні currentPuzzleIndex

    const handlePieceDrop = (from, to) => {
        if (idx < history.length - 1 || result === 'correct' || result === 'error') {
             console.log("Move ignored: not on last history step or puzzle solved/errored.");
             return false;
        }

        if (step >= puzzle.moves.length) {
             console.log("Move ignored: Puzzle already completed.");
             return false;
        }

        const gameCopyForValidation = new Chess(gameRef.current.fen());
        const userMoveResult = gameCopyForValidation.move({ from, to, promotion: 'q' });

        if (!userMoveResult) {
            console.log("Invalid move:", from, to);
            return false;
        }

        const userMoveString = userMoveResult.from + userMoveResult.to + (userMoveResult.promotion ? userMoveResult.promotion : '');

        const actualUserMoveResult = game.move({ from, to, promotion: 'q' });
         if (!actualUserMoveResult) {
              console.error("Unexpected error making move on main game object.");
              return false;
           }

        const h2 = [...history, { fen: game.fen(), last: { from: actualUserMoveResult.from, to: actualUserMoveResult.to } }];
        setHistory(h2);
        setIdx(h2.length - 1);

        if (userMoveString === puzzle.moves[step]) {
            // Правильний хід гравця
            setResult('correct');
            highlightLast(actualUserMoveResult.from, actualUserMoveResult.to);

            const nextExpectedPlayerStep = step + 2;

            if (step + 1 < puzzle.moves.length) {
                 // Комп'ютер має зробити наступний хід
                 const engineMoveStr = puzzle.moves[step + 1];

                 setTimeout(() => {
                     const currentGameState = new Chess(gameRef.current.fen());
                     const f = engineMoveStr.slice(0, 2);
                     const t = engineMoveStr.slice(2, 4);
                     const prom = engineMoveStr.length === 5 ? engineMoveStr[4] : undefined;

                     const engineMoveResult = currentGameState.move({ from: f, to: t, promotion: prom });

                     if (!engineMoveResult) {
                         console.error("Failed to make engine's move:", engineMoveStr, "FEN:", gameRef.current.fen(), "Puzzle ID:", puzzle.id);
                         setResult('error');
                         setStyles({});
                         return;
                     }

                     setGame(currentGameState);

                     const h3 = [...h2, { fen: currentGameState.fen(), last: { from: engineMoveResult.from, to: engineMoveResult.to } }];
                     setHistory(h3);
                     setIdx(h3.length - 1);
                     highlightLast(engineMoveResult.from, engineMoveResult.to);

                     setStep(nextExpectedPlayerStep);

                     if (nextExpectedPlayerStep >= puzzle.moves.length) {
                         // Задача завершена успішно
                         completePuzzle();
                     } else {
                         setResult(null);
                         setStyles({});
                     }
                 }, 600);

             } else {
                 // Гравець зробив останній правильний хід у задачі
                 completePuzzle();
             }

         } else {
             // Неправильний хід гравця
             setResult('incorrect');
             highlightLastError(actualUserMoveResult.from, actualUserMoveResult.to);

             // Штраф за неправильний хід
             // Зменшуємо рейтинг ТІЛЬКИ якщо це перша помилка в задачі
             if (!ratingDecreasedForPuzzle && !hintUsed) {
               setRating(r => Math.max(0, r - 10));
               setRatingDecreasedForPuzzle(true); // Позначаємо, що рейтинг вже зменшено
             }


             // Повертаємо до стану перед неправильним ходом
             setTimeout(() => {
                 const prevHistoryEntry = h2[h2.length - 2];
                 const gameAfterError = new Chess(prevHistoryEntry.fen);

                 setGame(gameAfterError);
                 setHistory(h2.slice(0, -1));
                 setIdx(h2.length - 2);

                 setResult(null); // Скидаємо результат
                 setStyles({}); // Прибираємо підсвічування
             }, 700); // Час затримки перед поверненням до попереднього ходу
         }

         return true; // Indicate that a move was attempted
    };

    // Ця функція викликається, коли ОДНА задача успішно розв'язана
    const completePuzzle = () => {
        console.log("Puzzle solved!");
        // Збільшуємо рейтинг тільки якщо підказка не використовувалася
        // І якщо не було попередніх неправильних ходів у цій задачі
        if (!hintUsed && !ratingDecreasedForPuzzle) { // <-- Змінена умова
            setRating(r => r + 15);
            console.log("Рейтинг збільшено на 15 за успішне вирішення без помилок та підказок.");
        } else if (ratingDecreasedForPuzzle) {
            console.log("Задачу вирішено, але рейтинг не збільшено через попередні неправильні ходи.");
        } else if (hintUsed) {
             console.log("Задачу вирішено, але рейтинг не збільшено через використання підказки.");
        }
        setResult('correct');
        setStyles({}); // Прибираємо підсвічування останнього ходу
         // У стандартному режимі задача просто завершується, не відбувається автоматичний перехід
         // Користувач натискає "Наступна задача" або навігує
    };

    const highlightLast = (f, t) => {
        setStyles({
            [f]: { backgroundColor: 'rgba(144, 238, 144, 0.6)' },
            [t]: { backgroundColor: 'rgba(144, 238, 144, 0.6)' }
        });
    };
    const highlightLastError = (f, t) => {
        setStyles({
            [f]: { backgroundColor: 'rgba(255, 99, 71, 0.6)' },
            [t]: { backgroundColor: 'rgba(255, 99, 71, 0.6)' }
        });
    };

    const showHintHandler = () => {
        if (step < puzzle.moves.length && !hintUsed) {
            const nextPlayerMoveStart = puzzle.moves[step].slice(0, 2);
            setHintUsed(true);
            setShowHint(true);
            setStyles(prevStyles => ({
                 ...prevStyles,
                 [nextPlayerMoveStart]: {
                      ...prevStyles[nextPlayerMoveStart],
                      boxShadow: 'inset 0 0 0 4px rgba(255,255,0,0.8)'
                 }
            }));
            // Штраф за підказку
            setRating(r => Math.max(0, r - 5));
            // При використанні підказки, ми не будемо зменшувати рейтинг за неправильні ходи пізніше
            // і не будемо збільшувати рейтинг за успішне завершення.
            // Тому можна також відзначити, що штраф за помилку в цій задачі вже не застосовуватиметься:
            // setRatingDecreasedForPuzzle(true); // Можна додати, якщо потрібна сувора логіка,
                                                  // але поточна перевірка !hintUsed в handlePieceDrop теж працює.
        }
    };

    const goPrev = () => {
        if (idx === 0) return;
        const i = idx - 1;
        setIdx(i);
        const g2 = new Chess(history[i].fen);
        setGame(g2);
        if (history[i].last) highlightLast(history[i].last.from, history[i].last.to);
        else setStyles({});

        setResult(null);
        setShowHint(false);
    };

    const goNext = () => {
        if (idx >= history.length - 1) return;

        const i = idx + 1;
        setIdx(i);
        const g2 = new Chess(history[i].fen);
        setGame(g2);
        if (history[i].last) highlightLast(history[i].last.from, history[i].last.to);
        else setStyles({});

        setResult(null);
        setShowHint(false);
    };

    const nextPuzzle = () => {
         // Перевірка, чи є ще задачі
         if (currentPuzzleIndex < mockPuzzles.length - 1) {
              setCurrentPuzzleIndex((i) => i + 1);
         } else {
              console.log("No more puzzles available.");
              // Можна показати повідомлення про завершення списку задач
              // Або повернутися до першої задачі: setCurrentPuzzleIndex(0);
         }
    };

    if (loading) {
        return <div className="loading-spinner">Завантаження задачі...</div>;
    }

    return (
        <div className="chess-puzzle-container">
            <div className="chess-puzzle-content">
                 <div className="chess-puzzle-board">
                      <ChessboardComponent
                           fen={game.fen()}
                           onPieceDrop={handlePieceDrop}
                           customSquareStyles={styles}
                           boardOrientation={orientation}
                           boardStyle={settings.boardStyle}
                           pieceStyle={settings.pieceStyle}
                       />
                 </div>
                 <PuzzleControlPanel
                      puzzle={puzzle}
                      rating={rating}
                      result={result}
                      showHint={showHint}
                      hintUsed={hintUsed}
                      idx={idx}
                      historyLength={history.length}
                      onPrevClick={goPrev}
                      onNextClick={goNext}
                      onShowHintClick={showHintHandler}
                      onNextPuzzleClick={nextPuzzle}
                      isStreakMode={false}
                      streakCount={0}
                      streakFailed={false}
                      // onRestartStreak не потрібен в стандартному режимі
                 />
            </div>
        </div>
    );
}

export default StandardPuzzleMode;