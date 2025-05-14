// SimulPageContainer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useKeycloak } from '@react-keycloak/web';
import SimulPageUI from './SimulPageUI';

// String.prototype.hashCode() - This is a custom method, ensure it's defined somewhere
// or use a standard library for hashing if needed for avatars.
// If not needed, just remove the avatar line or replace with a static image.
// Example simple polyfill for hashCode if not globally available:
if (!String.prototype.hashCode) {
  String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
}


export default function SimulPageContainer() {
  console.log('SimulPageContainer рендериться'); // <--- Змінено для коректності
  const { simulSessionId } = useParams();
  console.log('simulSessionId:', simulSessionId);
  const { keycloak } = useKeycloak();
  const token = keycloak.token;
  const meId = keycloak.tokenParsed?.sub;
  console.log('Token:', token ? 'присутній' : 'відсутній');
  console.log('Me ID:', meId);

  const [simulGamesData, setSimulGamesData] = useState([]);
  const [activeSimulGameId, setActiveSimulGameId] = useState(null);

  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [increment, setIncrement] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [timeControl, setTimeControl] = useState(null);
  const [gameStatus, setGameStatus] = useState('Гра йде');
  const [localColor, setLocalColor] = useState('w');
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);
  // const [players, setPlayers] = useState(null); // <--- ВИДАЛЕНО, оскільки це надлишковий стан

  const timerRefs = useRef({});
  const [stompClient, setStompClient] = useState(null);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(false);
  const autoSwitchIntervalRef = useRef(null);
  const autoSwitchIndexRef = useRef(0);

  const startAutoSwitchRef = useRef(null);

  const updateGameData = useCallback((gameIdToUpdate, newPartialData) => {
    setSimulGamesData(prevGames => {
      const updatedGames = prevGames.map(game =>
        game.gameId === gameIdToUpdate ? { ...game, ...newPartialData } : game
      );
      return updatedGames;
    });
  }, []);

  useEffect(() => {
    if (!token || !meId || !simulSessionId) return;

    fetch(`http://localhost:8082/api/games/simul/getSimulGames/${simulSessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(simulGamesResponse => {
        console.log('Отримані дані ігор:', simulGamesResponse);
        const initialSimulGames = simulGamesResponse.map(gameData => {
          const chessInstance = new Chess();
          gameData.moves.forEach(m => chessInstance.move(m));

          const localColorInGame = meId === String(gameData.whitePlayerId) ? 'w' : (meId === String(gameData.blackPlayerId) ? 'b' : null);

          let capturedByWhite = [];
          let capturedByBlack = [];
          const tempChessInstance = new Chess();
          gameData.moves.forEach(moveSan => {
            const result = tempChessInstance.move(moveSan);
            if (result && result.captured) {
              result.color === 'w'
                ? capturedByWhite.push(result.captured)
                : capturedByBlack.push(result.captured);
            }
          });

          return {
            gameId: gameData.gameId,
            fen: chessInstance.fen(),
            moves: gameData.moves,
            lastMove: gameData.moves.length > 0
              ? chessInstance.history({ verbose: true }).slice(-1)[0]
              : null,
            whiteTime: Math.ceil(gameData.whiteTimeMillis / 1000),
            blackTime: Math.ceil(gameData.blackTimeMillis / 1000),
            increment: Math.ceil(gameData.incrementMillis / 1000) || 0,
            currentPlayer: chessInstance.turn(),
            gameMode: gameData.gameMode,
            timeControl: gameData.timeControl,
            gameStatus: 'Гра йде', // Припустимо, що всі ігри починаються як "Гра йде"
            localColor: localColorInGame,
            capturedByWhite: capturedByWhite,
            capturedByBlack: capturedByBlack,
            players: { // `players` тепер частина об'єкта гри
              white: {
                name: gameData.whitePlayerName || 'Білі',
                avatar: `https://i.pravatar.cc/150?img=${Math.abs(String(gameData.whitePlayerId).hashCode() % 100)}`,
                rating: gameData.whitePlayerRating || 1450
              },
              black: {
                name: gameData.blackPlayerName || 'Чорні',
                avatar: `https://i.pravatar.cc/150?img=${Math.abs(String(gameData.blackPlayerId).hashCode() % 100)}`,
                rating: gameData.blackPlayerRating || 1500
              },
            },
            chessInstance: chessInstance,
          };
        });

        setSimulGamesData(initialSimulGames);
        if (initialSimulGames.length > 0) {
          console.log('activeSimulGameId встановлено на:', initialSimulGames[0].gameId); // <-- ДОДАЙТЕ ЦЕЙ ЛОГ
          setActiveSimulGameId(initialSimulGames[0].gameId);
        }

        initialSimulGames.forEach(game => {
          clearInterval(timerRefs.current[game.gameId]);
          timerRefs.current[game.gameId] = setInterval(() => {
            setSimulGamesData(prevGames => {
              const updatedGames = prevGames.map(g => {
                if (g.gameId === game.gameId && g.gameStatus === 'Гра йде') {
                  let newWhiteTime = g.whiteTime;
                  let newBlackTime = g.blackTime;

                  if (g.currentPlayer === 'w') {
                    newWhiteTime = Math.max(newWhiteTime - 1, 0);
                  } else {
                    newBlackTime = Math.max(newBlackTime - 1, 0);
                  }
                  if (newWhiteTime === 0 || newBlackTime === 0) {
                    clearInterval(timerRefs.current[g.gameId]);
                    return { ...g, whiteTime: newWhiteTime, blackTime: newBlackTime, gameStatus: 'Час вийшов' };
                  }
                  return { ...g, whiteTime: newWhiteTime, blackTime: newBlackTime };
                }
                return g;
              });
              return updatedGames;
            });
          }, 1000);
        });
      })
      .catch(error => {
        console.error('Помилка при отриманні ігор:', error);
      });

    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, [token, meId, simulSessionId, updateGameData]);


  useEffect(() => {
    if (activeSimulGameId && simulGamesData.length > 0) {
      const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
      if (activeGame) {
        setFen(activeGame.fen);
        setMoves(activeGame.moves);
        setLastMove(activeGame.lastMove);
        setWhiteTime(activeGame.whiteTime);
        setBlackTime(activeGame.blackTime);
        setIncrement(activeGame.increment);
        setCurrentPlayer(activeGame.currentPlayer);
        setGameMode(activeGame.gameMode);
        setTimeControl(activeGame.timeControl);
        setGameStatus(activeGame.gameStatus);
        setLocalColor(activeGame.localColor);
        setCapturedByWhite(activeGame.capturedByWhite);
        setCapturedByBlack(activeGame.capturedByBlack);
        // setPlayers(activeGame.players); // <--- ЦЕЙ РЯДОК БІЛЬШЕ НЕ ПОТРІБЕН
      }
    }
  }, [activeSimulGameId, simulGamesData]);


  useEffect(() => {
    if (!token || !simulGamesData.length > 0) return; // Залежить від наявності даних ігор для підписок

    const socket = new SockJS('http://localhost:8082/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setStompClient(client);

        simulGamesData.forEach(game => { // Перемістити підписки сюди, щоб вони виконувались після отримання даних
          client.subscribe(`/topic/game/${game.gameId}`, ({ body }) => {
            const rsp = JSON.parse(body);
            const targetGameId = rsp.gameId;

            setSimulGamesData(prevGames => {
              return prevGames.map(g => {
                if (g.gameId === targetGameId) {
                  const gameInstance = g.chessInstance;
                  const currentMoves = [...g.moves];
                  const currentLastMove = g.lastMove;
                  let newCapturedByWhite = [...g.capturedByWhite];
                  let newCapturedByBlack = [...g.capturedByBlack];
                  let newFen = g.fen;
                  let newCurrentPlayer = g.currentPlayer;

                  if (rsp.senderId !== meId && rsp.move) {
                    const result = gameInstance.move(rsp.move);
                    if (result) {
                      currentMoves.push(result.san);
                      newFen = gameInstance.fen();
                      newCurrentPlayer = gameInstance.turn();

                      if (result.captured) {
                        result.color === 'w'
                          ? newCapturedByWhite.push(result.captured)
                          : newCapturedByBlack.push(result.captured);
                      }
                    }
                  }

                  return {
                    ...g,
                    fen: newFen,
                    moves: currentMoves,
                    lastMove: rsp.move ? { from: rsp.move.substring(0, 2), to: rsp.move.substring(2, 4) } : currentLastMove,
                    whiteTime: Math.ceil(rsp.whiteTimeMillis / 1000),
                    blackTime: Math.ceil(rsp.blackTimeMillis / 1000),
                    currentPlayer: newCurrentPlayer,
                    capturedByWhite: newCapturedByWhite,
                    capturedByBlack: newCapturedByBlack,
                    gameStatus: rsp.gameStatus || g.gameStatus
                  };
                }
                return g;
              });
            });
          });

          client.subscribe(`/topic/game/${game.gameId}/conclude`, ({ body }) => {
            const concl = JSON.parse(body);
            let newGameStatus = 'Гра завершена';
            if (concl.winnerId) newGameStatus = concl.winnerId === meId ? 'Ви виграли!' : 'Ви програли.';
            else if (concl.reason) newGameStatus = concl.reason;

            updateGameData(game.gameId, { gameStatus: newGameStatus });
            clearInterval(timerRefs.current[game.gameId]);
          });
        });
      }
    });

    client.activate();
    return () => {
      client.deactivate();
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, [token, meId, simulGamesData, updateGameData]); // Додано simulGamesData в залежності


  const handleMove = useCallback((from, to) => {
    console.log('Спроба ходу:', { from, to }); // Додати цей лог
    if (!activeSimulGameId) {
      console.log('Хід заблоковано: немає activeSimulGameId'); // Додати цей лог
      return false;
    }
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    console.log('Активна гра:', activeGame); // Додати цей лог
    if (!activeGame || activeGame.gameStatus !== 'Гра йде' || activeGame.currentPlayer !== activeGame.localColor) {
      console.log('Хід заблоковано: статус гри або черга не дозволяють', {
        activeGameExists: !!activeGame,
        gameStatus: activeGame?.gameStatus,
        currentPlayer: activeGame?.currentPlayer,
        localColor: activeGame?.localColor
      }); // Додати цей лог
      return false;
    }

    const gameInstance = activeGame.chessInstance;
    const mv = gameInstance.move({ from, to, promotion: 'q' });
    console.log('Результат gameInstance.move():', mv); // Додати цей лог
    if (!mv) {
      console.log('Хід заблоковано: нелегальний хід за правилами шахів'); // Додати цей лог

      return false;
    }

    const newMoves = [...activeGame.moves, mv.san];
    const newLastMove = { from: mv.from, to: mv.to };
    let newCapturedByWhite = [...activeGame.capturedByWhite];
    let newCapturedByBlack = [...activeGame.capturedByBlack];

    if (mv.captured) {
      mv.color === 'w'
        ? (newCapturedByWhite.push(mv.captured))
        : (newCapturedByBlack.push(mv.captured));
    }

    let newWhiteTime = activeGame.whiteTime;
    let newBlackTime = activeGame.blackTime;
    if (mv.color === 'w') newWhiteTime += activeGame.increment;
    else newBlackTime += activeGame.increment;

    updateGameData(activeSimulGameId, {
      fen: gameInstance.fen(),
      moves: newMoves,
      lastMove: newLastMove,
      capturedByWhite: newCapturedByWhite,
      capturedByBlack: newCapturedByBlack,
      whiteTime: newWhiteTime,
      blackTime: newBlackTime,
      currentPlayer: gameInstance.turn(),
    });

    if (stompClient?.active) {
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({ gameId: activeSimulGameId, move: mv.san })
      });
    }
    return true;
  }, [activeSimulGameId, simulGamesData, stompClient, updateGameData]);

  const handleResign = useCallback(() => {
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeSimulGameId || !activeGame || activeGame.gameStatus !== 'Гра йде') return;
    if (stompClient?.active) {
      stompClient.publish({
        destination: `/app/game/${activeSimulGameId}/resign`,
        body: JSON.stringify({ gameId: activeSimulGameId, playerId: meId })
      });
    }
    updateGameData(activeSimulGameId, { gameStatus: 'Здаюсь' });
  }, [activeSimulGameId, meId, stompClient, updateGameData, simulGamesData]);

  const handleOfferDraw = useCallback(() => {
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeSimulGameId || !activeGame || activeGame.gameStatus !== 'Гра йде') return;
    if (stompClient?.active) {
      stompClient.publish({
        destination: `/app/game/${activeSimulGameId}/drawOffer`,
        body: JSON.stringify({ gameId: activeSimulGameId, playerId: meId })
      });
    }
    updateGameData(activeSimulGameId, { gameStatus: 'Нічия' });
  }, [activeSimulGameId, meId, stompClient, updateGameData, simulGamesData]);

  const handleMoveBack = useCallback(() => {
    if (!activeSimulGameId) return;
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeGame || activeGame.gameStatus !== 'Гра йде') return;

    const gameInstance = activeGame.chessInstance;
    gameInstance.undo();

    const currentMoves = gameInstance.history();
    let newCapturedByWhite = [];
    let newCapturedByBlack = [];
    const tempChessInstance = new Chess();
    currentMoves.forEach(moveSan => {
      const result = tempChessInstance.move(moveSan);
      if (result && result.captured) {
        result.color === 'w'
          ? newCapturedByWhite.push(result.captured)
          : newCapturedByBlack.push(result.captured);
      }
    });

    updateGameData(activeSimulGameId, {
      fen: gameInstance.fen(),
      moves: currentMoves,
      lastMove: null,
      currentPlayer: gameInstance.turn(),
      capturedByWhite: newCapturedByWhite,
      capturedByBlack: newCapturedByBlack,
    });
  }, [activeSimulGameId, simulGamesData, updateGameData]);

  const handleRestart = useCallback(() => {
    const activeGame = simulGamesData.find(game => game.gameId === activeSimulGameId);
    if (!activeSimulGameId || !activeGame || activeGame.gameStatus !== 'Гра йде') return;

    const gameInstance = activeGame.chessInstance;
    gameInstance.reset();

    updateGameData(activeSimulGameId, {
      fen: 'start',
      moves: [],
      lastMove: null,
      whiteTime: Math.ceil(activeGame.initialWhiteTimeMillis / 1000), // Припускаємо, що початковий час зберігається
      blackTime: Math.ceil(activeGame.initialBlackTimeMillis / 1000),
      gameStatus: 'Гра йде',
      currentPlayer: 'w',
      capturedByWhite: [],
      capturedByBlack: [],
    });
  }, [activeSimulGameId, simulGamesData, updateGameData]);

  const startAutoSwitch = useCallback(() => {
    if (autoSwitchIntervalRef.current) {
      clearInterval(autoSwitchIntervalRef.current);
    }
    if (simulGamesData.length > 1) {
      autoSwitchIntervalRef.current = setInterval(() => {
        autoSwitchIndexRef.current = (autoSwitchIndexRef.current + 1) % simulGamesData.length;
        setActiveSimulGameId(simulGamesData[autoSwitchIndexRef.current].gameId);
      }, 5000);
    }
  }, [simulGamesData]);

  useEffect(() => {
    startAutoSwitchRef.current = startAutoSwitch;
  }, [startAutoSwitch]);

  const handleMiniBoardClick = useCallback((gameId) => {
    setActiveSimulGameId(gameId);
    if (autoSwitchEnabled) {
      const index = simulGamesData.findIndex(game => game.gameId === gameId);
      if (index !== -1) {
        autoSwitchIndexRef.current = index;
        if (autoSwitchIntervalRef.current) {
          clearInterval(autoSwitchIntervalRef.current);
          startAutoSwitchRef.current();
        }
      }
    }
  }, [autoSwitchEnabled, simulGamesData]);

  const handleAutoSwitchToggle = useCallback(() => {
    setAutoSwitchEnabled(prev => !prev);
  }, []);

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
    return <div>Помилка: Активну гру не знайдено.</div>;
  }

  const customSquareStyles = activeGame.lastMove ? {
    [activeGame.lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
    [activeGame.lastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' },
  } : {};


  return (
    <SimulPageUI
      fen={activeGame.fen}
      onPieceDrop={handleMove}
      customSquareStyles={customSquareStyles}
      boardOrientation={activeGame.localColor === 'w' ? 'white' : 'black'}
      players={activeGame.players} // `players` береться з `activeGame.players`
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
      onMoveForward={() => console.log('Mock move forward for active game')}
      onRestart={handleRestart}

      simulGames={simulGamesData}
      activeSimulGameId={activeSimulGameId}
      onMiniBoardClick={handleMiniBoardClick}
      autoSwitchEnabled={autoSwitchEnabled}
      onAutoSwitchToggle={handleAutoSwitchToggle}
    />
  );
}