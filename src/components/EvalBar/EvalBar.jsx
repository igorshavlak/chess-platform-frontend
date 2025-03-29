import React from 'react';
import './EvalBar.css';

const EvalBar = ({ currentEval }) => {
  if (currentEval === null) {
    return <div className="eval-bar-placeholder">Немає оцінки</div>;
  }

  // Розрахунок відсотка заповнення смуги (50% – нейтральне положення)
  let percentage = 50 - currentEval * 5;
  percentage = Math.max(5, Math.min(95, percentage));
  const whiteWinning = currentEval > 0;
  const fillColor = whiteWinning ? '#f0d9b5' : '#4d4d4d';

  return (
    <div className="eval-bar" title={`Оцінка: ${currentEval.toFixed(2)}`}>
      <div
        className="eval-bar-fill"
        style={{ height: `${percentage}%`, backgroundColor: fillColor }}
      ></div>
      <div className="eval-bar-text">{currentEval.toFixed(2)}</div>
    </div>
  );
};

export default EvalBar;
