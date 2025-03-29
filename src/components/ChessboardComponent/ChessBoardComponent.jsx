// src/components/ChessboardComponent/ChessboardComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessboardComponent.css';

function ChessboardComponent({ fen, onPieceDrop, customSquareStyles, boardOrientation }) {
  const boardWrapperRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    const updateBoardWidth = () => {
      if (boardWrapperRef.current) {
        const width = boardWrapperRef.current.clientWidth;
        setBoardWidth(width);
      }
    };

    // Встановити початкову ширину
    updateBoardWidth();

    // Оновити ширину при зміні розміру вікна
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  return (
    <div className="board-wrapper" ref={boardWrapperRef}>
      {boardWidth > 0 && (
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          arePiecesDraggable={true}
          boardWidth={boardWidth}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
          customSquareStyles={customSquareStyles}
          transitionDuration={300}
          boardOrientation={boardOrientation}  
        />
      )}
    </div>
  );
}

export default ChessboardComponent;
