import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaArrowRight,
    FaLightbulb,
    FaCheck,
    FaTimes,
    FaChevronRight,
    FaTrophy,
    FaFire // Іконка для стріку
} from 'react-icons/fa';
import './PuzzleControlPanel.css';

function PuzzleControlPanel({ // Перейменовано з PuzzleInfoPanel
    puzzle,
    rating,
    result, // 'correct' | 'incorrect' | 'error' | 'streak_failed' | 'streak_complete'
    showHint,
    hintUsed,
    idx,
    historyLength,
    onPrevClick,
    onNextClick,
    onShowHintClick,
    onNextPuzzleClick,
    // === Нові пропси для стріку ===
    isStreakMode,
    streakCount,
    streakFailed,
    onRestartStreak
}) {


    const [prevRating, setPrevRating] = useState(rating);
    const [ratingChangeClass, setRatingChangeClass] = useState('');

    useEffect(() => {
        if (rating > prevRating) {
            setRatingChangeClass('increased');
        } else if (rating < prevRating) {
            setRatingChangeClass('decreased');
        } else {
            setRatingChangeClass('');
        }

        const timer = setTimeout(() => {
            setRatingChangeClass('');
        }, 300); // Забираємо клас через 0.3 секунди

        setPrevRating(rating);

        return () => clearTimeout(timer);
    }, [rating]);
    // Визначаємо, чи активна задача (не стрік провалено, не стрік завершено, не помилка задачі)
    const isPuzzleActive = result !== 'streak_failed' && result !== 'streak_complete' && result !== 'error';

    return (
        <div className="chess-puzzle-info-panel">
            <div className="puzzle-header">
                <h2>{isStreakMode ? 'Puzzle Streak' : 'Шахова задача'}</h2>
                <div className="puzzle-stats">
                    <div className="player-rating">
                        <FaTrophy className="trophy-icon" />
                        <span>Ваш рейтинг:</span>
                        <span className={`rating-value player ${ratingChangeClass}`}>{rating}</span>
                    </div>
                    {isStreakMode && (
                        <div className="streak-counter"> {/* Додайте клас для стилізації */}
                            <FaFire className="streak-icon" />
                            <span>Стрік:</span>
                            <span className="rating-value streak">{streakCount}</span>
                        </div>
                    )}
                </div>
            </div>


            {isStreakMode && result === 'streak_failed' && (
                <div className="streak-end-message incorrect">
                    <FaTimes />
                    <p>Стрік завершено! Ви розв'язали {streakCount} задач.</p>
                    <button onClick={onRestartStreak} className="start-streak-button">
                        Спробувати ще раз
                    </button>
                </div>
            )}



            {/* Приховуємо опис задачі в режимі стріку, або показуємо коротший */}
            {!isStreakMode && puzzle && puzzle.description && (
                <div className="puzzle-description">
                    <p>{puzzle.description}</p>
                </div>
            )}


            {/* Відображення результату */}
            {result && isPuzzleActive && ( // Показуємо результат тільки якщо задача активна
                <div className={`move-result ${result}`}>
                    {result === 'correct' ? (
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

            {/* Повідомлення про підказку */}
            {showHint && !streakFailed && result !== 'streak_complete' && (
                <div className="puzzle-hint">
                    <p>{puzzle.hint}</p>
                </div>
            )}

            {/* Керуючі кнопки */}
            {isPuzzleActive && ( // Показуємо кнопки тільки якщо задача активна
                <div className="puzzle-controls">
                    {/* Навігація по ходах - прихована в режимі стріку */}
                    {!isStreakMode && (
                        <div className="move-navigation">
                            <button onClick={onPrevClick} disabled={idx === 0} className="nav-button">
                                <FaArrowLeft />
                            </button>
                            <span>{idx}/{historyLength - 1}</span> {/* Можливо, показати поточний хід */}
                            <button onClick={onNextClick} disabled={idx >= historyLength - 1} className="nav-button">
                                <FaArrowRight />
                            </button>
                        </div>
                    )}

                    <div className="action-buttons">
                        {/* Кнопка підказки */}
                        <button
                            onClick={onShowHintClick}
                            className="hint-button"
                            disabled={hintUsed || streakFailed || result === 'streak_complete'} // Вимкнено, якщо підказка використана або стрік завершено
                        >
                            <FaLightbulb />
                            <span>{hintUsed ? 'Підказка використана' : 'Показати підказку'}</span>
                        </button>

                        {/* Кнопка "Наступна задача" - прихована в режимі стріку */}
                        {!isStreakMode && (
                            <button onClick={onNextPuzzleClick} className="next-puzzle-button">
                                <span>Наступна задача</span>
                                <FaChevronRight />
                            </button>
                        )}
                        {/* У режимі стріку перехід до наступної задачі відбувається автоматично */}
                        {/* Або можна показати кнопку "Далі", якщо задача успішно вирішена */}
                        {isStreakMode && result === 'correct' && !streakFailed && (
                            // Кнопка для переходу до наступної задачі стріку
                            // Вона буде викликати moveToNextStreakPuzzle в батьківському компоненті,
                            // але ми її тут не рендеримо, бо перехід автоматичний через setTimeout.
                            // Якщо потрібна кнопка "Далі", можна додати тут.
                            // <button className="next-puzzle-button" disabled={true}>Наступна задача (Авто)</button>
                            null // Приховуємо кнопку, бо перехід автоматичний
                        )}
                    </div>
                </div>
            )}
            {result === 'streak_complete' && (
                <div className="streak-end-message correct"> {/* Використовуємо клас correct для зеленого кольору */}
                    <FaCheck />
                    <p>Стрік завершено успішно!</p>
                    <p>Ви пройшли всі доступні задачі.</p>
                    {/* Кнопка "Почати новий стрік" буде на головному екрані стріку */}
                </div>
            )}

        </div>
    );
}

export default PuzzleControlPanel;