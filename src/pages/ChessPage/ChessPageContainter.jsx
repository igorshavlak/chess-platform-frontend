// src/pages/ChessPageContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useKeycloak } from '@react-keycloak/web';
import ChessPageUI from './ChessPageUI';

export default function ChessPageContainer() {
  const { gameId } = useParams();
  const { keycloak } = useKeycloak();
  const token = keycloak.token;
  const meId = keycloak.tokenParsed?.sub;

  // === chess.js та стан дошки ===
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // === таймери та інкремент (в секундах) ===
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [increment, setIncrement] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('w');

  // === ігрові налаштування ===
  const [gameMode, setGameMode] = useState(null);
  const [timeControl, setTimeControl] = useState(null);
  const [gameStatus, setGameStatus] = useState('Гра йде');
  const [localColor, setLocalColor] = useState('w');
  const [players, setPlayers] = useState({
    white: { name: 'Я (білі)', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
    black: { name: 'Супротивник (чорні)', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
  });
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  const timerRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // 1) Fetch початкових даних і налаштування часу
  useEffect(() => {
    if (!token || !meId) return;
    fetch(`http://localhost:8082/api/games/getGameInfo/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        game.reset();
        data.moves.forEach(m => game.move(m));
        setFen(game.fen());
        setMoves(data.moves);
        setCurrentPlayer(game.turn());

        // колір локального гравця
        if (meId === String(data.whitePlayerId)) setLocalColor('w');
        else if (meId === String(data.blackPlayerId)) setLocalColor('b');


        // якщо бекенд віддає час у мс:
        if (data.whiteTimeMillis != null) {
          setWhiteTime(Math.ceil(data.whiteTimeMillis / 1000));
          setBlackTime(Math.ceil(data.blackTimeMillis / 1000));
        } else {
          // або парсити timeControl “5+2” → 300 сек
          const [base, inc] = data.timeControl.split('+').map(Number);
          setWhiteTime(base * 60);
          setBlackTime(base * 60);
          setIncrement(inc);
        }
        setGameMode(data.gameMode);
      })
      .catch(console.error);
  }, [token, meId, gameId, game]);

  // 2) STOMP: обробка ходів від сервера
  useEffect(() => {
    if (!token) return;
    const socket = new SockJS('http://localhost:8082/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setStompClient(client);

        client.subscribe(`/topic/game/${gameId}`, ({ body }) => {
          const rsp = JSON.parse(body);
          if (rsp.senderId !== meId) {
            setWhiteTime(Math.ceil(rsp.whiteTimeMillis / 1000));
            setBlackTime(Math.ceil(rsp.blackTimeMillis / 1000));
            setCurrentPlayer(rsp.isActivePlayerWhite ? 'w' : 'b');

            const result = game.move(rsp.move);
            if (result) {
              setFen(game.fen());
              setMoves(prev => [...prev, result.san]);
              setLastMove({ from: result.from, to: result.to });
              if (result.captured) {
                result.color === 'w'
                  ? setCapturedByWhite(p => [...p, result.captured])
                  : setCapturedByBlack(p => [...p, result.captured]);
              }
            }
          }
        });

        client.subscribe(`/topic/game/${gameId}/conclude`, ({ body }) => {
          clearInterval(timerRef.current);
          const concl = JSON.parse(body);
          if (concl.winnerId) setGameStatus(concl.winnerId === meId ? 'Ви виграли!' : 'Ви програли.');
          else if (concl.reason) setGameStatus(concl.reason);
          else setGameStatus('Гра завершена');
        });
      }
    });

    client.activate();
    return () => client.deactivate();
  }, [token, gameId, meId, game]);

  // 3) Локальний таймер — стартує коли 1) час ініціалізовано або 2) змінився currentPlayer
  useEffect(() => {
    if (whiteTime == null || blackTime == null) return;
  
    clearInterval(timerRef.current);
    console.log('Starting timer for', currentPlayer);
  
    timerRef.current = setInterval(() => {
      if (currentPlayer === 'w') {
        setWhiteTime(prev => Math.max(prev - 1, 0));
      } else {
        setBlackTime(prev => Math.max(prev - 1, 0));
      }
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [currentPlayer]);

  // додатково: при розмонтуванні компонента одразу прибираємо інтервал
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // 4) Обробка власного ходу
  const handleMove = (from, to) => {
    if (game.turn() !== localColor) return false;
    const mv = game.move({ from, to, promotion: 'q' });
    if (!mv) return false;

    setFen(game.fen());
    setMoves(prev => [...prev, mv.san]);
    setLastMove({ from: mv.from, to: mv.to });
    if (mv.captured) {
      mv.color === 'w'
        ? setCapturedByWhite(p => [...p, mv.captured])
        : setCapturedByBlack(p => [...p, mv.captured]);
    }

    // додаємо інкремент
    if (mv.color === 'w') setWhiteTime(prev => prev + increment);
    else setBlackTime(prev => prev + increment);

    // перемикаємо
    setCurrentPlayer(game.turn());

    // відсилаємо на сервер
    if (stompClient?.active) {
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({ gameId, move: mv.san })
      });
    }
    return true;
  };

  const handleResign = () => { setGameStatus('Здаюсь'); clearInterval(timerRef.current); };
  const handleOfferDraw = () => { setGameStatus('Нічия'); clearInterval(timerRef.current); };
  const handleMoveBack = () => {
    game.undo();
    setFen(game.fen());
    setMoves(game.history());
    setLastMove(null);
    setCurrentPlayer(game.turn());
  };
  const handleRestart = () => {
    game.reset();
    setFen('start');
    setMoves([]);
    setWhiteTime(null);
    setBlackTime(null);
    setIncrement(0);
    setLocalColor('w');
    setLastMove(null);
    setGameStatus('Гра йде');
    setCurrentPlayer('w');
  };

  return (
    <ChessPageUI
      fen={fen}
      onPieceDrop={handleMove}
      customSquareStyles={lastMove ? {
        [lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
        [lastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' },
      } : {}}
      boardOrientation={localColor === 'w' ? 'white' : 'black'}
      players={players}
      localColor={localColor}
      whiteTime={whiteTime}
      blackTime={blackTime}
      currentPlayer={currentPlayer}
      gameMode={gameMode}
      timeControl={timeControl}
      gameStatus={gameStatus}
      moves={moves}
      capturedByWhite={capturedByWhite}
      capturedByBlack={capturedByBlack}
      onResign={handleResign}
      onOfferDraw={handleOfferDraw}
      onMoveBackward={handleMoveBack}
      onMoveForward={() => { }}
      onRestart={handleRestart}
    />
  );
}
