// src/components/PuzzleStreakMode/PuzzleStreakMode.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessboardComponent from '../../components/ChessboardComponent/ChessboardComponent';
import PuzzleControlPanel from '../../components/PuzzleControlPanel/PuzzleControlPanel'; // Переконайтесь, що шлях правильний
import mockPuzzles from './mockPuzzles'; // Імпортуємо дані
import './ChessPuzzlePage.css'; // Створіть CSS файл для цього компонента

// Функція для перемішування масиву (алгоритм Фішера-Єйтса)
function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // swap
    }
    return shuffledArray;
}


function PuzzleStreakMode() {
    const [game, setGame] = useState(new Chess());
    const [history, setHistory] = useState([]);
    const [idx, setIdx] = useState(0);
    const [styles, setStyles] = useState({});
    const [result, setResult] = useState(null); // 'correct' | 'incorrect' | 'error' | 'streak_failed' | 'streak_complete'
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false); // В стріку підказка може коштувати стрік або не бути доступною
    const [orientation, setOrientation] = useState('white');
    const [loading, setLoading] = useState(false); // Завантаження контролюється станом 'started'

    const [step, setStep] = useState(1); // Індекс ходу в puzzle.moves, який очікується від гравця

    // === Стани для Puzzle Streak ===
    const [started, setStarted] = useState(false); // Чи почато стрік?
    const [streakCount, setStreakCount] = useState(0);
    const [streakFailed, setStreakFailed] = useState(false);
    const [puzzlesForStreak, setPuzzlesForStreak] = useState([]);
    const [currentStreakPuzzleIndex, setCurrentStreakPuzzleIndex] = useState(0);
    // === Кінець станів ===

    // Використовуємо useRef для поточної гри
    const gameRef = useRef(game);
    useEffect(() => {
        gameRef.current = game;
    }, [game]);

    // Обираємо поточну задачу зі списку для стріку
    const puzzle = puzzlesForStreak[currentStreakPuzzleIndex];


    // Ефект для завантаження задачі стріку
    useEffect(() => {
        console.log(`useEffect triggered for loading. Index: ${currentStreakPuzzleIndex}, Started: ${started}, Failed: ${streakFailed}`); // Логування для відладки
    
        // Завантажуємо задачу тільки якщо стрік почато, не провалено і не завершено
        // Перевірку result === 'streak_complete' можна залишити тут, якщо вона потрібна як умова зупинки ефекту
        if (!started || streakFailed || result === 'streak_complete') {
             setLoading(false); // Зупиняємо індикацію завантаження, якщо режим не активний або завершено
             return;
        }
    
        // Перевірка на завершення стріку, якщо задач більше немає
        if (currentStreakPuzzleIndex >= puzzlesForStreak.length) {
             // Цей блок спрацьовує, коли ефект викликався (через зміну індексу чи старту),
             // і виявилося, що задач більше немає. Встановлюємо кінцевий стан.
             setResult('streak_complete');
             setStarted(false); // Виходимо з активного режиму стріку
             setLoading(false);
             console.log("Streak completed!");
             return;
        }
    
        const currentPuzzle = puzzlesForStreak[currentStreakPuzzleIndex];
         if (!currentPuzzle) {
             console.error("Error fetching streak puzzle:", currentStreakPuzzleIndex);
             setResult('error'); // Помилка завантаження конкретної задачі в стріку
             setStarted(false); // Зупиняємо стрік через помилку задачі
             setLoading(false);
             return;
         }
    
    
        // --- Основна логіка завантаження поточної задачі за індексом ---
        setLoading(true); // <-- Встановлюємо loading = true ТІЛЬКИ при завантаженні НОВОЇ задачі
        setShowHint(false);
        setHintUsed(false);
        // *** НЕ ВИКЛИКАЙТЕ тут setResult(null); ***
        // Тимчасовий результат кроку має скидатися після ходу рушія в handlePieceDrop.
    
    
        const loadPuzzleTimeout = setTimeout(() => {
            console.log(`Loading timeout finished for puzzle index: ${currentStreakPuzzleIndex}`);
            const p = currentPuzzle;
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
                setResult('error'); // Помилка задачі
                setStarted(false); // Зупиняємо стрік
                return;
            }
    
            // Робимо перший хід комп'ютера (завжди є в правильних задачах)
            const firstEngineMoveStr = p.moves[0];
            const f = firstEngineMoveStr.slice(0, 2);
            const t = firstEngineMoveStr.slice(2, 4);
            const prom = firstEngineMoveStr.length === 5 ? firstEngineMoveStr[4] : undefined;
    
            const tempGameForFirstMove = new Chess(initialFen);
            const firstEngineMove = tempGameForFirstMove.move({ from: f, to: t, promotion: prom });
    
            if (!firstEngineMove) {
                console.error("Failed to make engine's mandated first move:", firstEngineMoveStr, "FEN:", initialFen, "Puzzle ID:", p.id);
                setResult('error'); // Помилка задачі
                setStarted(false); // Зупиняємо стрік
                setLoading(false);
                return;
            }
    
            setGame(tempGameForFirstMove); // Оновлюємо основний стан гри
    
            newHistory = [
                { fen: initialFen, last: null },
                { fen: tempGameForFirstMove.fen(), last: { from: firstEngineMove.from, to: firstEngineMove.to } }
            ];
    
            setHistory(newHistory);
            setIdx(1); // Історія має 2 кроки (початковий + перший хід рушія)
            setStep(1); // Очікуємо хід гравця (puzzle.moves[1])
            setOrientation(tempGameForFirstMove.turn() === 'w' ? 'white' : 'black');
            setStyles({ // Підсвічуємо перший хід рушія
                [firstEngineMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
                [firstEngineMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' }
            });
            setLoading(false); // <-- Встановлюємо loading = false після успішного завантаження та налаштування
    
            // Можливо, тут потрібно скинути result в null, щоб прибрати будь-який
            // залишок стану "правильно/неправильно" від попередньої задачі.
            // setResult(null); // <-- Можна додати тут, якщо flicker все ще є або потрібне очищення.
    
        }, 500);
    
        return () => clearTimeout(loadPuzzleTimeout);
    
    // Залежності: реагуємо лише на зміну індексу задачі, стан старту/провалу стріку.
    // result (для тимчасового стану "правильно/неправильно") не повинен бути тут.
    }, [currentStreakPuzzleIndex, started, streakFailed, puzzlesForStreak.length /*, result - видалено */]); // Видаліть 'result' з залежностей
     // Функція для початку стріку
    const startStreak = () => {
        setStarted(true); // Почали стрік
        setStreakCount(0);
        setStreakFailed(false);
        setResult(null);
        // setRating(1500); // Можливо, скидати рейтинг на старті стріку?
        const shuffledPuzzles = shuffleArray(mockPuzzles); // Перемішуємо всі задачі
        setPuzzlesForStreak(shuffledPuzzles);
        setCurrentStreakPuzzleIndex(0); // Починаємо з першої перемішаної задачі
        // useEffect спрацює і завантажить першу задачу стріку
    };

    // Функція для завершення стріку (провал)
    const endStreak = () => {
        setStarted(false); // Стрік більше не активний
        setStreakFailed(true); // Встановлюємо флаг, що стрік провалено
        setResult('streak_failed'); // Встановлюємо результат
        // Логіка збереження найкращого стріку може бути тут
        console.log(`Streak ended. Final score: ${streakCount}`);
    };

    // Функція для переходу до наступної задачі стріку (викликається після успішного завершення поточної)
    const moveToNextStreakPuzzle = () => {
        // Затримка перед завантаженням наступної задачі
        setTimeout(() => {
             // Просто збільшуємо індекс. useEffect сам перевірить, чи є задача, і завантажить її.
             setCurrentStreakPuzzleIndex(prevIndex => prevIndex + 1);
        }, 1000); // Затримка перед завантаженням наступної задачі
    };


    const handlePieceDrop = (from, to) => {
        // Не дозволяємо ходити, якщо стрік провалено або завершено, або задача в стані помилки, або не на останньому кроці історії
        if (!started || streakFailed || result === 'streak_complete' || result === 'error' || idx < history.length - 1) {
             console.log("Move ignored: Mode not active, Streak failed, complete, error state, or not on last history step.");
             return false;
        }

        // Перевіряємо, чи є ще ходи в рішенні, які має зробити гравець
        if (step >= puzzle.moves.length) {
            console.log("Move ignored: Puzzle already completed.");
             return false;
        }

        // *** ДОДАЙТЕ ЦЕЙ РЯДОК ***
        // Визначаємо очікуваний хід гравця на цьому кроці
        const expectedUserMove = puzzle.moves[step];
        // *************************


        // Перевіряємо, чи зроблений хід легальний взагалі
        const gameCopyForValidation = new Chess(gameRef.current.fen());
        const userMoveResult = gameCopyForValidation.move({ from, to, promotion: 'q' });

        // Якщо хід нелегальний за правилами шахів, це теж вважається помилкою в стріку
        if (!userMoveResult) {
            console.log("Illegal move attempted:", from, to); // Логуємо, що хід був нелегальним
            setResult('incorrect'); // Показуємо "Неправильно"
            highlightLastError(from, to); // Підсвічуємо помилку

            // Нелегальний хід завершує стрік
            setTimeout(() => {
                 endStreak(); // Завершуємо стрік
            }, 700); // Затримка перед завершенням стріку після помилки

            return false; // Повідомляємо компоненту шахівниці не приймати хід
        }


        // Якщо хід легальний, але НЕ є очікуваним ходом з рішення задачі
        const userMoveString = userMoveResult.from + userMoveResult.to + (userMoveResult.promotion ? userMoveResult.promotion : '');

         // Якщо хід правильний за правилами, але неправильний з точки зору рішення задачі
         if (userMoveString !== expectedUserMove) {
              console.log("Legal but incorrect puzzle move:", userMoveString, "Expected:", expectedUserMove);
              setResult('incorrect'); // Показуємо "Неправильно"
              highlightLastError(userMoveResult.from, userMoveResult.to); // Підсвічуємо помилку

              // Неправильний хід завершує стрік
              setTimeout(() => {
                 endStreak(); // Завершуємо стрік
              }, 700); // Затримка перед завершенням стріку після помилки

              return false; // Повідомляємо компоненту шахівниці не приймати хід
         }


        // --- Якщо хід правильний і відповідає рішенню задачі ---
        // Створюємо НОВИЙ об'єкт Chess на основі поточного стану для застосування ходу гравця
        const nextGameAfterUserMove = new Chess(gameRef.current.fen());
        const actualUserMoveResult = nextGameAfterUserMove.move({ from, to, promotion: 'q' });

        // Цей блок малоймовірний, якщо перевірка вище пройшла, але залишаємо для надійності
         if (!actualUserMoveResult) {
              console.error("Unexpected error applying correct move to new game object.");
              setResult('error'); // Помилка задачі
              setStarted(false); // Зупиняємо стрік
              return false;
          }

        // Оновлюємо стан React НОВИМ об'єктом після ходу гравця
        setGame(nextGameAfterUserMove);

        // Оновлюємо історію
        const h2 = [...history, { fen: nextGameAfterUserMove.fen(), last: { from: actualUserMoveResult.from, to: actualUserMoveResult.to } }];
        setHistory(h2);
        setIdx(h2.length - 1);

        // Показуємо результат "Правильно!" та підсвічуємо хід
        setResult('correct');
        highlightLast(actualUserMoveResult.from, actualUserMoveResult.to);


        // Визначаємо наступний очікуваний крок гравця (після ходу рушія)
        const nextExpectedPlayerStep = step + 2;

        // Перевіряємо, чи є ще ходи рушія після ходу гравця
        if (step + 1 < puzzle.moves.length) {
             // Рушій має зробити наступний хід
             const engineMoveStr = puzzle.moves[step + 1];

             // Зберігаємо FEN після ходу гравця, щоб використати його в таймауті
             const fenAfterUserMove = nextGameAfterUserMove.fen();

             setTimeout(() => {
                // Створюємо гру ЗНОВУ всередині таймауту з FEN після ходу гравця
                const gameBeforeEngineMove = new Chess(fenAfterUserMove);
                const f = engineMoveStr.slice(0, 2);
                const t = engineMoveStr.slice(2, 4);
                const prom = engineMoveStr.length === 5 ? engineMoveStr[4] : undefined;

                const engineMoveResult = gameBeforeEngineMove.move({ from: f, to: t, promotion: prom });

                if (!engineMoveResult) {
                    console.error("Failed to make engine's move:", engineMoveStr, "FEN:", fenAfterUserMove, "Puzzle ID:", puzzle.id);
                    setResult('error'); // Помилка задачі
                    setStarted(false); // Зупиняємо стрік
                    setStyles({});
                    return;
                }

                // Оновлюємо стан React НОВИМ об'єктом після ходу рушія
                setGame(gameBeforeEngineMove);

                // Оновлюємо історію
                const h3 = [...h2, { fen: gameBeforeEngineMove.fen(), last: { from: engineMoveResult.from, to: engineMoveResult.to } }];
                setHistory(h3);
                setIdx(h3.length - 1);
                highlightLast(engineMoveResult.from, engineMoveResult.to);

                // Оновлюємо очікуваний крок гравця
                setStep(nextExpectedPlayerStep);

                // Перевіряємо, чи задача завершена
                if (nextExpectedPlayerStep >= puzzle.moves.length) {
                    // Задача завершена успішно гравцем та рушієм
                    completePuzzle(); // Тригер для переходу до наступної задачі стріку
                } else {
                     // Задача ще не завершена, очікуємо наступний хід гравця
                    setResult(null); // Скидаємо тимчасовий результат "Правильно!"
                    setStyles({}); // Прибираємо підсвічування попередніх ходів
                }
             }, 600); // Затримка перед ходом рушія

         } else {
             // Гравець зробив останній правильний хід у задачі
             completePuzzle(); // Тригер для переходу до наступної задачі стріку
         }

         return true; // Повідомляємо ChessboardComponent, що хід був легальним і прийнятий
    };


    const highlightLast = (f, t) => {
        setStyles({
            [f]: { backgroundColor: 'rgba(144, 238, 144, 0.6)' }, // Light green for correct moves
            [t]: { backgroundColor: 'rgba(144, 238, 144, 0.6)' }
        });
    };
    const highlightLastError = (f, t) => {
        setStyles({
            [f]: { backgroundColor: 'rgba(255, 99, 71, 0.6)' }, // Tomato red for incorrect moves
            [t]: { backgroundColor: 'rgba(255, 99, 71, 0.6)' }
        });
    };

    // Ця функція викликається, коли ОДНА задача успішно розв'язана в стрік режимі
    const completePuzzle = () => {
        console.log("Puzzle solved in streak!");
        setStreakCount(prevCount => prevCount + 1); // Збільшуємо лічильник стріку
        // Можливо, тут можна додати логіку збільшення рейтингу, але зазвичай в стріку головне - рахунок
        setStyles({}); // Прибираємо підсвічування останнього ходу

        // Переходимо до наступної задачі стріку
        moveToNextStreakPuzzle();
    };


    // У режимі стріку підказка або недоступна, або коштує стрік/життя.
    // Згідно опису "Один хибний хід, і гра закінчена! Але ви можете пропустити один хід за сесію."
    // це може означати, що підказка - це "пропуск ходу" (тобто правильний хід робиться автоматично)
    // але при цьому стрік не переривається, або вона просто показує хід, але штрафує рейтинг/стрік.
    // Якщо "пропустити хід" означає, що гравець не робить хід, а комп'ютер робить правильний за нього,
    // то логіка буде складнішою. Давайте зробимо простіший варіант: підказка просто показує,
    // куди ходити, але КОШТУЄ стрік або має великий штраф. Або просто відключимо її в стріку.
    // Згідно опису "Обмеження часу немає, тому не поспішайте. Один хибний хід, і гра закінчена! Але ви можете пропустити один хід за сесію."
    // Найкраще, ймовірно, зробити підказку недоступною, а "пропустити хід" - це окрема функція,
    // яка дозволяє пропустити одну задачу або один хід ціною завершення стріку або великого штрафу.
    // Давайте поки що просто вимкнемо кнопку підказки в стрік режимі.
     const showHintHandler = () => {
         // У стрік режимі підказка не використовується або має іншу логіку
         console.log("Hint requested in Streak mode - logic TBD.");
         setStreakCount(prevCount => prevCount + 1);
         setStyles({});
         moveToNextStreakPuzzle();
          // Якщо реалізуємо "пропустити хід", то логіка буде тут
     };

     // У стрік режимі навігація по історії вимкнена
     const goPrev = () => console.log("Navigation disabled in Streak mode.");
     const goNext = () => console.log("Navigation disabled in Streak mode.");
     const nextPuzzle = () => console.log("Next puzzle button disabled in Streak mode.");


     const restartStreak = () => {
        setStreakFailed(false);
        setStarted(false);
        setResult(null);
    };

    // UI для початку стріку
     if (!started && !streakFailed && result !== 'streak_complete') {
         return (
              <div className="streak-start-screen"> {/* Додайте клас для стилізації */}
                 <h2>Режим "Puzzle Streak"</h2>
                 <p>Розв'яжіть якомога більше шахових задач поспіль!</p>
                 <p>Одна помилка - і стрік завершується.</p>
                 {/* Можливо, додати інфо про "пропустити хід" */}
                 <button onClick={startStreak} className="start-streak-button"> {/* Додайте клас для стилізації */}
                     Почати стрік!
                 </button>
              </div>
         );
     }



     // UI для успішного завершення всіх задач стріку
     if (result === 'streak_complete') {
          return (
               <div className="streak-end-screen streak-complete"> {/* Додайте клас для стилізації */}
                   <h2>Ви пройшли всі задачі в стріку!</h2>
                   <p>Розв'язано <span className="streak-score">{streakCount}</span> задач.</p>
                   <button onClick={() => { setStreakFailed(false); setStarted(false); setResult(null); }} className="start-streak-button"> {/* Кнопка повертає до стартового екрана стріку */}
                       Почати новий стрік!
                   </button>
               </div>
          );
     }

    // UI для стану завантаження
    if (loading) {
        return <div className="loading-spinner">Завантаження задачі...</div>;
    }


    // Основний UI задачі для режиму стріку
    return (
        <div className="chess-puzzle-container"> {/* Можливо, потрібен обгортаючий div */}
            <div className="chess-puzzle-content">
                 <div className="chess-puzzle-board">
                      <ChessboardComponent
                           fen={game.fen()}
                           onPieceDrop={handlePieceDrop}
                           customSquareStyles={styles}
                           boardOrientation={orientation}
                       />
                 </div>
                 <PuzzleControlPanel
                     puzzle={puzzle}
                     rating={null} // У стріку рейтинг гравця може не відображатись або мати іншу логіку
                     result={result} // Показує 'correct', 'incorrect' тимчасово
                     showHint={showHint} // Контролюється локально
                     hintUsed={hintUsed} // Контролюється локально
                     idx={idx} // Не використовується в UI панелі для стріку
                     historyLength={history.length} // Не використовується в UI панелі для стріку
                     onPrevClick={null} // Вимкнено
                     onNextClick={null} // Вимкнено
                     onShowHintClick={showHintHandler} // Вимкнено або інша логіка
                     onNextPuzzleClick={null} // Вимкнено
                     // === Передача стрік-станів ===
                     isStreakMode={true} // Завжди true для цього компонента
                     streakCount={streakCount} // Показуємо лічильник
                     streakFailed={streakFailed}
                     onRestartStreak={restartStreak}
                 />
            </div>
        </div>
    );
}

export default PuzzleStreakMode;