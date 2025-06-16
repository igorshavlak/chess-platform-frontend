import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessboardComponent.css';

// --- NEW --- Винесемо конфігурацію стилів, щоб перевикористовувати її
const BOARD_THEMES = {
    classic: { light: '#eeeed2', dark: '#769656' },
    frost: { light: '#e1e1e1', dark: '#637381' },
    ocean: { light: '#c2d5e3', dark: '#5b80a6' },
    candy: { light: '#f0d9b5', dark: '#b58863' },
};

const pieceSets = {
    loadSet: (setName) => ({
      // ... (така ж функція завантаження, як у SettingsPage)
        wP: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wP.svg`} alt="wp" />,
        wR: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wR.svg`} alt="wr" />,
        wN: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wN.svg`} alt="wn" />,
        wB: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wB.svg`} alt="wb" />,
        wQ: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wQ.svg`} alt="wq" />,
        wK: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wK.svg`} alt="wk" />,
        bP: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bP.svg`} alt="bp" />,
        bR: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bR.svg`} alt="br" />,
        bN: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bN.svg`} alt="bn" />,
        bB: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bB.svg`} alt="bb" />,
        bQ: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bQ.svg`} alt="bq" />,
        bK: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bK.svg`} alt="bk" />,
    }),
};


// --- UPDATED --- Компонент тепер приймає стилі як пропси
function ChessboardComponent({
  fen,
  onPieceDrop,
  customSquareStyles,
  boardOrientation,
  boardStyle = 'classic', // Стиль дошки за замовчуванням
  pieceStyle = 'maestro',     // Стиль фігур за замовчуванням
}) {
  const boardWrapperRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    const updateBoardWidth = () => {
      if (boardWrapperRef.current) {
        setBoardWidth(boardWrapperRef.current.clientWidth);
      }
    };
    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  // --- NEW --- Визначаємо стилі на основі пропсів
  const currentTheme = BOARD_THEMES[boardStyle] || BOARD_THEMES.classic;
  const currentPieces = pieceStyle ? pieceSets.loadSet(pieceStyle) : undefined;
  
  return (
    <div className="board-wrapper" ref={boardWrapperRef}>
      {boardWidth > 0 && (
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          arePiecesDraggable={true}
          boardWidth={boardWidth}
          // --- UPDATED --- Застосовуємо динамічні стилі
          customLightSquareStyle={{ backgroundColor: currentTheme.light }}
          customDarkSquareStyle={{ backgroundColor: currentTheme.dark }}
          customPieces={currentPieces}
          customSquareStyles={customSquareStyles}
          transitionDuration={300}
          boardOrientation={boardOrientation}
        />
      )}
    </div>
  );
}

export default ChessboardComponent;
