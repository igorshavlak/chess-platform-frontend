import React from 'react';
  import './NotationComponent.css'; // Додамо стилі

  function NotationComponent({ history, currentMoveIndex, onMoveClick }) {
    // Форматуємо історію ходів
    const formattedHistory = history.reduce((acc, move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      if (index % 2 === 0) { // Хід білих
        acc.push({ number: moveNumber, white: move, black: null });
      } else { // Хід чорних
        acc[acc.length - 1].black = move;
      }
      return acc;
    }, []);

    return (
      <div className="notation-container">
        <h3>Нотація ходів</h3>
        <div className="moves-list">
          {formattedHistory.map((movePair, index) => (
            <div key={index} className="move-pair">
              <span className="move-number">{movePair.number}.</span>
              <span
                className={`move-white ${currentMoveIndex === index * 2 ? 'active-move' : ''}`}
                onClick={() => onMoveClick(index * 2)}
              >
                {movePair.white.san}
              </span>
              {movePair.black && (
                <span
                  className={`move-black ${currentMoveIndex === index * 2 + 1 ? 'active-move' : ''}`}
                  onClick={() => onMoveClick(index * 2 + 1)}
                >
                  {movePair.black.san}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Кнопки навігації (початкова, назад, вперед, кінцева) */}
         <div className="navigation-buttons">
            <button onClick={() => onMoveClick(0)}>&lt;&lt;</button> {/* До початку */}
            <button onClick={() => navigateToMove(currentMoveIndex - 1)}>&lt;</button> {/* Назад */}
            <button onClick={() => navigateToMove(currentMoveIndex + 1)}>&gt;</button> {/* Вперед */}
            <button onClick={() => navigateToMove(history.length - 1)}>&gt;&gt;</button> {/* В кінець */}
         </div>
      </div>
    );
  }

  export default NotationComponent;