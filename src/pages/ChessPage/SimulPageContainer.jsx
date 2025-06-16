import React, { useEffect, useRef, useCallback, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useKeycloak } from '@react-keycloak/web';
import { simulReducer, initialState } from './simulReducer';
import { useSettings } from '../../context/SettingsContext';
import SimulPageUI from './SimulPageUI';
// === NEW: Імпортуємо Chess для розрахунку FEN в режимі історії ===
import { Chess } from 'chess.js';

// Хеш-функція для рядків, якщо вона не визначена
if (!String.prototype.hashCode) {
    String.prototype.hashCode = function () { let hash = 0; for (let i = 0; i < this.length; i++) { const char = this.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash |= 0; } return hash; };
}

export default function SimulPageContainer() {
  const { settings, isLoading } = useSettings();
  const { simulSessionId } = useParams();
  const { keycloak } = useKeycloak();
  const token = keycloak.token;
  const meId = keycloak.tokenParsed?.sub;

  const [state, dispatch] = useReducer(simulReducer, initialState);
  const { status, games, activeGameId, stats, modal } = state;

  const stompClientRef = useRef(null);
  const timerRef = useRef(null);

  // useEffect для завантаження даних - без змін
  useEffect(() => {
    if (!token || !meId || !simulSessionId) return;
    fetch(`http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082/api/games/simul/getSimulGames/${simulSessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(gamesData => {
        dispatch({ type: 'GAMES_FETCHED', payload: { gamesData, meId } });
      })
      .catch(error => {
        console.error('Помилка при отриманні ігор:', error);
        dispatch({ type: 'FETCH_FAILED' });
      });
  }, [token, meId, simulSessionId]);

  // useEffect для WebSocket - без змін
  useEffect(() => {
    if (status !== 'ready' || games.length === 0 || stompClientRef.current) return;

    const socket = new SockJS(`http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082/ws-game`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        stompClientRef.current = client;

        games.forEach(game => {
          client.subscribe(`/topic/game/${game.gameId}`, ({ body }) => {
            const rsp = JSON.parse(body);
            if (rsp.senderId === meId) return;
            dispatch({ type: 'WEBSOCKET_MOVE_RECEIVED', payload: rsp });
          });

          client.subscribe(`/topic/game/${game.gameId}/conclude`, ({ body }) => {
            const conclusion = JSON.parse(body);
            dispatch({ type: 'GAME_CONCLUDED', payload: { gameId: game.gameId, conclusion } });
          });
        });
      },
    });

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
      stompClientRef.current = null;
    };
  }, [status, games.length, token, meId]);

  // useEffect для таймера - без змін
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch({ type: 'UPDATE_TIMERS' });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // --- ОБРОБНИКИ ДІЙ ---

  // === MODIFIED: Обробник ходу з перевіркою на "живий" режим ===
  const handleMove = useCallback((from, to) => {
    const game = games.find(g => g.gameId === activeGameId);
    const isLive = game?.viewedMoveIndex === null;

    // Забороняємо хід, якщо не в "живому" режимі або гра завершена
    if (!game || !isLive || game.gameStatus !== 'Гра йде' || game.currentPlayer !== game.localColor) {
      return false;
    }

    const moveResult = game.chessInstance.move({ from, to, promotion: 'q' });
    if (!moveResult) return false;

    // Редюсер автоматично скине viewedMoveIndex в null після нашого ходу
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: {
        gameId: activeGameId,
        updates: {
          fen: game.chessInstance.fen(),
          moves: [...game.moves, moveResult.san],
          lastMove: { from: moveResult.from, to: moveResult.to },
          currentPlayer: game.chessInstance.turn(),
          whiteTime: moveResult.color === 'w' ? game.whiteTime + game.increment : game.whiteTime,
          blackTime: moveResult.color === 'b' ? game.blackTime + game.increment : game.blackTime,
          capturedByWhite: moveResult.captured && moveResult.color === 'w' ? [...game.capturedByWhite, moveResult.captured] : game.capturedByWhite,
          capturedByBlack: moveResult.captured && moveResult.color === 'b' ? [...game.capturedByBlack, moveResult.captured] : game.capturedByBlack,
        }
      }
    });

    if (stompClientRef.current?.active) {
      stompClientRef.current.publish({
        destination: '/app/move',
        body: JSON.stringify({ gameId: activeGameId, move: moveResult.san })
      });
    }
    return true;
  }, [games, activeGameId]);
  
  // Інші обробники без змін
  const handleResign = useCallback(() => {
     stompClientRef.current?.publish({ destination: `/app/game/${activeGameId}/resign`, body: JSON.stringify({ gameId: activeGameId, playerId: meId }) });
     dispatch({ type: 'UPDATE_GAME_STATE', payload: { gameId: activeGameId, updates: { gameStatus: 'Ви здалися' } } });
  }, [activeGameId, meId]);

  const handleMiniBoardClick = useCallback((gameId) => {
    dispatch({ type: 'SET_ACTIVE_GAME', payload: gameId });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'HIDE_MODAL' });
  }, []);
  
  // === NEW: Обробники для навігації по історії ===
  const handleMoveBackward = useCallback(() => {
    dispatch({ type: 'MOVE_HISTORY_BACK', payload: { gameId: activeGameId } });
  }, [activeGameId]);

  const handleMoveForward = useCallback(() => {
    dispatch({ type: 'MOVE_HISTORY_FORWARD', payload: { gameId: activeGameId } });
  }, [activeGameId]);


  // --- Рендер компонента ---

  const activeGame = games.find(game => game.gameId === activeGameId);

  if (status === 'loading') return <div>Завантаження сеансу...</div>;
  if (status === 'error' || !activeGame) return <div>Помилка завантаження гри. Спробуйте оновити сторінку.</div>;
  
  // === NEW: Логіка для відображення FEN та підсвітки залежно від режиму перегляду ===
  const isLive = activeGame.viewedMoveIndex === null;
  let displayFen = activeGame.fen;
  let displayLastMove = isLive ? activeGame.lastMove : null;

  if (!isLive) {
    const tempGame = new Chess();
    // Відтворюємо ходи до індексу, що переглядається (-1 для початкової позиції)
    for (let i = 0; i <= activeGame.viewedMoveIndex; i++) {
        tempGame.move(activeGame.moves[i]);
    }
    displayFen = tempGame.fen();
    const history = tempGame.history({ verbose: true });
    // Знаходимо останній хід у відтвореній історії
    if (history.length > 0) {
        const last = history[history.length - 1];
        displayLastMove = { from: last.from, to: last.to };
    }
  }

  const customSquareStyles = displayLastMove ? {
    [displayLastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
    [displayLastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' },
  } : {};

  return (
    <SimulPageUI
      // === MODIFIED: Передаємо розраховані значення для дошки та історії ===
      fen={displayFen}
      customSquareStyles={customSquareStyles}
      onMoveBackward={handleMoveBackward}
      onMoveForward={handleMoveForward}
      onPieceDrop={handleMove}
      
      // --- Решта пропсів без змін ---
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
      onOfferDraw={() => { /* ... */ }}
      onRestart={() => {}}
      simulGames={games}
      activeSimulGameId={activeGameId}
      onMiniBoardClick={handleMiniBoardClick}
      stats={stats}
      showModal={modal.show}
      modalContent={modal.content}
      onCloseModal={handleCloseModal}
      autoSwitchEnabled={false}
      onAutoSwitchToggle={() => {}}
      boardStyle={settings.boardStyle}
      pieceStyle={settings.pieceStyle}
    />
  );
}