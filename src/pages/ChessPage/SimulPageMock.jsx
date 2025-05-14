
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import SimulChessPageUI from './SimulPageUI'; // Import the real UI component

const generateMockGame = (gameId, movesArray = [], isWhiteLocal = true, initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') => {
  const chessInstance = new Chess();
  chessInstance.load(initialFen);
  const appliedMoves = [];
  let lastMove = null;
  let capturedByWhite = [];
  let capturedByBlack = [];

  movesArray.forEach(moveSan => {
    const result = chessInstance.move(moveSan);
    if (result) {
      appliedMoves.push(result.san);
      lastMove = { from: result.from, to: result.to };
      if (result.captured) {
        result.color === 'w'
          ? capturedByWhite.push(result.captured)
          : capturedByBlack.push(result.captured);
      }
    }
  });

  const whiteTime = Math.floor(Math.random() * 300) + 100; // 100-400 seconds
  const blackTime = Math.floor(Math.random() * 300) + 100;

  return {
    gameId: `mock-game-${gameId}`,
    fen: chessInstance.fen(),
    moves: appliedMoves,
    lastMove: lastMove,
    whiteTime: whiteTime,
    blackTime: blackTime,
    increment: 2, 
    currentPlayer: chessInstance.turn(),
    gameMode: 'Rapid',
    timeControl: '10+2',
    gameStatus: 'Гра йде',
    localColor: isWhiteLocal ? 'w' : 'b',
    capturedByWhite: capturedByWhite,
    capturedByBlack: capturedByBlack,
    players: {
      white: { name: `Player ${gameId}W`, avatar: `https://i.pravatar.cc/150?img=${gameId * 2}`, rating: 1500 + gameId * 10 },
      black: { name: `Player ${gameId}B`, avatar: `https://i.pravatar.cc/150?img=${gameId * 2 + 1}`, rating: 1500 - gameId * 10 },
    },
    chessInstance: chessInstance, // Keep the instance
  };
};

const mockSimulGamesData = [
  generateMockGame(1, ['e4', 'e5', 'Nf3', 'Nc6']),
  generateMockGame(2, ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7']),
  generateMockGame(3, ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5']),
  generateMockGame(4, ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6']),
  generateMockGame(5, ['Nf3', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'O-O', 'O-O']),
  generateMockGame(6, ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5']),
  generateMockGame(7, ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5']),
  generateMockGame(8, ['e4', 'e5', 'Bc4', 'Nf6', 'd3', 'Nc6']),
  // Add more games if needed to test scrolling/multiple rows
  generateMockGame(9, ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3', 'Nc6']),
  generateMockGame(10, ['d4', 'f5', 'c4', 'Nf6', 'Nc3', 'g6']),
];

export default function SimulPageMock() {
  const [simulGamesData, setSimulGamesData] = useState(mockSimulGamesData);
  const [activeSimulGameId, setActiveSimulGameId] = useState(mockSimulGamesData[0].gameId);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(false);
  const autoSwitchIntervalRef = useRef(null);
  const autoSwitchIndexRef = useRef(0);

  // Mock timer for each game
  const timerRefs = useRef({});

  useEffect(() => {
    simulGamesData.forEach(game => {
      clearInterval(timerRefs.current[game.gameId]);
      timerRefs.current[game.gameId] = setInterval(() => {
        setSimulGamesData(prevGames => {
          return prevGames.map(g => {
            if (g.gameId === game.gameId) {
              let newWhiteTime = g.whiteTime;
              let newBlackTime = g.blackTime;
              if (g.currentPlayer === 'w') {
                newWhiteTime = Math.max(newWhiteTime - 1, 0);
              } else {
                newBlackTime = Math.max(newBlackTime - 1, 0);
              }
              return { ...g, whiteTime: newWhiteTime, blackTime: newBlackTime };
            }
            return g;
          });
        });
      }, 1000);
    });

    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, [simulGamesData]); // Re-run if simulGamesData changes (e.g., game state updates)

  // Mock handler for piece drop
  const handleMove = useCallback((from, to) => {
    console.log(`Mock move: ${from}-${to} on active game ${activeSimulGameId}`);
    // In a real scenario, this would interact with a Chess.js instance
    // and then potentially publish via STOMP.
    // For mock, we can simulate a local move or do nothing.
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeGame || activeGame.currentPlayer !== activeGame.localColor) return false;

    const gameInstance = activeGame.chessInstance;
    const mv = gameInstance.move({ from, to, promotion: 'q' });
    if (!mv) return false;

    const newMoves = [...activeGame.moves, mv.san];
    const newLastMove = { from: mv.from, to: mv.to };
    let newCapturedByWhite = activeGame.capturedByWhite;
    let newCapturedByBlack = activeGame.capturedByBlack;

    if (mv.captured) {
      mv.color === 'w'
        ? (newCapturedByWhite = [...activeGame.capturedByWhite, mv.captured])
        : (newCapturedByBlack = [...activeGame.capturedByBlack, mv.captured]);
    }

    // Apply increment
    let newWhiteTime = activeGame.whiteTime;
    let newBlackTime = activeGame.blackTime;
    if (mv.color === 'w') newWhiteTime += activeGame.increment;
    else newBlackTime += activeGame.increment;

    setSimulGamesData(prevGames => prevGames.map(game =>
      game.gameId === activeSimulGameId
        ? {
            ...game,
            fen: gameInstance.fen(),
            moves: newMoves,
            lastMove: newLastMove,
            capturedByWhite: newCapturedByWhite,
            capturedByBlack: newCapturedByBlack,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime,
            currentPlayer: gameInstance.turn(),
          }
        : game
    ));
    return true;
  }, [activeSimulGameId, simulGamesData]);


  const handleResign = useCallback(() => {
    console.log(`Mock resign for game ${activeSimulGameId}`);
    setSimulGamesData(prevGames => prevGames.map(game =>
      game.gameId === activeSimulGameId ? { ...game, gameStatus: 'Здаюсь' } : game
    ));
  }, [activeSimulGameId]);

  const handleOfferDraw = useCallback(() => {
    console.log(`Mock draw offer for game ${activeSimulGameId}`);
    setSimulGamesData(prevGames => prevGames.map(game =>
      game.gameId === activeSimulGameId ? { ...game, gameStatus: 'Нічия' } : game
    ));
  }, [activeSimulGameId]);

  const handleMoveBack = useCallback(() => {
    console.log(`Mock move backward for game ${activeSimulGameId}`);
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeGame) return;

    const gameInstance = activeGame.chessInstance;
    gameInstance.undo();

    setSimulGamesData(prevGames => prevGames.map(game =>
      game.gameId === activeSimulGameId
        ? {
            ...game,
            fen: gameInstance.fen(),
            moves: gameInstance.history(),
            lastMove: null, // Simplified for mock
            currentPlayer: gameInstance.turn(),
          }
        : game
    ));
  }, [activeSimulGameId, simulGamesData]);

  const handleRestart = useCallback(() => {
    console.log(`Mock restart for game ${activeSimulGameId}`);
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeGame) return;

    const gameInstance = activeGame.chessInstance;
    gameInstance.reset();

    setSimulGamesData(prevGames => prevGames.map(game =>
      game.gameId === activeSimulGameId
        ? {
            ...game,
            fen: 'start',
            moves: [],
            lastMove: null,
            whiteTime: 600, // Reset to initial mock time
            blackTime: 600,
            gameStatus: 'Гра йде',
            currentPlayer: 'w',
            capturedByWhite: [],
            capturedByBlack: [],
          }
        : game
    ));
  }, [activeSimulGameId, simulGamesData]);

  const handleMiniBoardClick = useCallback((gameId) => {
    setActiveSimulGameId(gameId);
    if (autoSwitchEnabled) {
      const index = simulGamesData.findIndex(game => game.gameId === gameId);
      if (index !== -1) {
        autoSwitchIndexRef.current = index;
        if (autoSwitchIntervalRef.current) {
          clearInterval(autoSwitchIntervalRef.current);
          startAutoSwitch();
        }
      }
    }
  }, [autoSwitchEnabled, simulGamesData]);

  const handleAutoSwitchToggle = useCallback(() => {
    setAutoSwitchEnabled(prev => !prev);
  }, []);

  const startAutoSwitch = useCallback(() => {
    if (autoSwitchIntervalRef.current) {
      clearInterval(autoSwitchIntervalRef.current);
    }
    if (simulGamesData.length > 1) {
      autoSwitchIntervalRef.current = setInterval(() => {
        autoSwitchIndexRef.current = (autoSwitchIndexRef.current + 1) % simulGamesData.length;
        setActiveSimulGameId(simulGamesData[autoSwitchIndexRef.current].gameId);
      }, 5000); // Switch every 5 seconds
    }
  }, [simulGamesData]);

  useEffect(() => {
    if (autoSwitchEnabled) {
      startAutoSwitch();
    } else {
      clearInterval(autoSwitchIntervalRef.current);
    }
    return () => clearInterval(autoSwitchIntervalRef.current);
  }, [autoSwitchEnabled, startAutoSwitch]);

  const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);

  if (!activeGame) {
    return <div>Loading mock simul games...</div>;
  }

  return (
    <SimulChessPageUI
      fen={activeGame.fen}
      onPieceDrop={handleMove}
      customSquareStyles={activeGame.lastMove ? {
        [activeGame.lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
        [activeGame.lastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' },
      } : {}}
      boardOrientation={activeGame.localColor === 'w' ? 'white' : 'black'}
      players={activeGame.players}
      localColor={activeGame.localColor}
      whiteTime={activeGame.whiteTime}
      blackTime={activeGame.blackTime}
      currentPlayer={activeGame.currentPlayer}
      gameMode={activeGame.gameMode}
      timeControl={activeGame.timeControl}
      gameStatus={activeGame.gameStatus}
      moves={activeGame.moves}
      capturedByWhite={activeGame.capturedByWhite}
      capturedByBlack={activeGame.capturedByBlack}
      onResign={handleResign}
      onOfferDraw={handleOfferDraw}
      onMoveBackward={handleMoveBack}
      onMoveForward={() => console.log('Mock move forward')}
      onRestart={handleRestart}

      simulGames={simulGamesData}
      activeSimulGameId={activeSimulGameId}
      onMiniBoardClick={handleMiniBoardClick}
      autoSwitchEnabled={autoSwitchEnabled}
      onAutoSwitchToggle={handleAutoSwitchToggle}
    />
  );
}
