import React from 'react';
import './AnalysisControlPanel.css';

const ControlPanel = ({
  analysisType,
  setAnalysisType,
  analyzePosition,
  analyzeGame,
  depth,
  setDepth,
  isAnalyzing,
}) => {
  return (
    <div className="control-panel">
      <div className="control-panel-section">
        <h3>Engine Analysis</h3>
        <div className="analysis-type-buttons">
          <button
            onClick={() => setAnalysisType('client')}
            className={analysisType === 'client' ? 'active' : ''}
          >
            Browser Engine
          </button>
          <button
            onClick={() => setAnalysisType('server')}
            className={analysisType === 'server' ? 'active' : ''}
          >
            Server Engine
          </button>
        </div>
      </div>
      
      <div className="control-panel-section">
        <div className="analysis-buttons">
          <button onClick={analyzePosition} disabled={isAnalyzing}>
            Analyze Position
          </button>
          <button onClick={analyzeGame} disabled={isAnalyzing}>
            Analyze Full Game
          </button>
        </div>
      </div>
      
      {analysisType === 'client' && (
        <div className="control-panel-section">
          <div className="depth-control">
            <label htmlFor="depth-range">Depth:</label>
            <input
              id="depth-range"
              type="range"
              min="8"
              max="25"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value, 10))}
            />
            <span>{depth}</span>
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="analyzing-indicator">
          <div className="spinner"></div>
          <span>Analyzing...</span>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;