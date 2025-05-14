import React from 'react';
  import './AnalysisPanelComponent.css'; // Додамо стилі

  function AnalysisPanelComponent({ evaluation, pv, thinking, loading, error }) {
    if (loading) {
      return <div className="analysis-panel">Завантаження рушія...</div>;
    }

    if (error) {
      return <div className="analysis-panel error">Помилка рушія: {error.message}</div>;
    }

    return (
      <div className="analysis-panel">
        <h3>Аналіз Stockfish</h3>
        {thinking ? (
          <div className="thinking-indicator">Рушій думає...</div>
        ) : (
          <>
            <div className="evaluation">
              Оцінка: {evaluation !== null ? evaluation.toFixed(2) : 'N/A'} {evaluation > 0 ? ' advantage White' : evaluation < 0 ? ' advantage Black' : ''}
            </div>
            <div className="principal-variation">
              PV: {pv || 'N/A'}
            </div>
             {/* Можна додати візуальну оціночну смугу тут */}
          </>
        )}
      </div>
    );
  }

  export default AnalysisPanelComponent;