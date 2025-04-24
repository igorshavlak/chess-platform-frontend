// src/containers/ChessPageContainer.jsx

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
  const clientIdRef = useRef(meId);

  // === chess.js & board state ===
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // === clocks & increment (сек) ===
  const [whiteTime,  setWhiteTime]  = useState(0);
  const [blackTime,  setBlackTime]  = useState(0);
  const [increment,  setIncrement]  = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('w');

  // === матчинг & статус ===
  const [gameMode,    setGameMode]    = useState(null);
  const [timeControl, setTimeControl] = useState(null);
  const [gameStatus,  setGameStatus]  = useState('Гра йде');

  // === гравці ===
  const [players, setPlayers] = useState({
    white: { name: 'Я (білі)',       avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
    black: { name: 'Супротивник (чорні)', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
  });
  const [localColor, setLocalColor] = useState('w');
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  const timerRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // 1) Fetch initial game info + timeControl
  const fetchGameInfo = () => {
    console.log('⏳ fetchGameInfo');
    fetch(`http://localhost:8082/api/games/getGameInfo/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log('📥 GET /getGameInfo →', data);
        if (Array.isArray(data.moves)) {
          // apply past moves
          game.reset();
          data.moves.forEach(m => game.move(m));
          setFen(game.fen());
          setMoves(data.moves);
          setCurrentPlayer(game.turn());

          // assign colors from REST payload
          const whiteId = String(data.whitePlayerId);
          const blackId = String(data.blackPlayerId);
          if (meId === whiteId)  setLocalColor('w');
          else if (meId === blackId) setLocalColor('b');
        }

        // parse timeControl (якщо повертає REST)
        if (data.timeControl) {
          console.log('⏲ REST timeControl:', data.timeControl);
          setTimeControl(data.timeControl);
          const [mStr, iStr] = data.timeControl.split('+');
          const base = parseInt(mStr, 10) * 60;
          const inc  = parseInt(iStr, 10);
          setWhiteTime(base);
          setBlackTime(base);
          setIncrement(inc);
        }
      })
      .catch(err => console.error('❌ fetchGameInfo error:', err));
  };

  useEffect(() => {
    if (token && meId) fetchGameInfo();
  }, [token, meId, gameId]);

  // 2) STOMP connect & subscriptions
  useEffect(() => {
    if (!token) return;
    console.log('🔌 Connecting STOMP...');
    const socket = new SockJS('http://localhost:8082/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ STOMP connected');
        setStompClient(client);

        // a) matchmaking
        client.subscribe(
          `/topic/notifications/gameFound/${meId}`,
          ({ body }) => {
            const notif = JSON.parse(body);
            console.log('🏁 WS gameFound →', notif);
            setGameMode(notif.gameMode);
            setTimeControl(notif.timeControl);

            const [mStr, iStr] = notif.timeControl.split('+');
            const base = parseInt(mStr, 10) * 60;
            const inc  = parseInt(iStr, 10);
            setWhiteTime(base);
            setBlackTime(base);
            setIncrement(inc);

            if (meId === notif.whitePlayerId)  setLocalColor('w');
            else if (meId === notif.blackPlayerId) setLocalColor('b');
          }
        );

        // b) moves
        client.subscribe(
          `/topic/game/${gameId}`,
          ({ body }) => {
            const rsp = JSON.parse(body);
            console.log('🔄 WS MoveResponse →', rsp);
            if (rsp.senderId === meId) return;

            const now     = Date.now();
            const latency = now - rsp.serverTimestampMillis;
            const wMs     = Math.max(rsp.whiteTimeMillis - latency, 0);
            const bMs     = Math.max(rsp.blackTimeMillis - latency, 0);
            setWhiteTime(Math.ceil(wMs / 1000));
            setBlackTime(Math.ceil(bMs / 1000));
            setCurrentPlayer(rsp.isActivePlayerWhite ? 'w' : 'b');

            const moveResult = game.move(rsp.move);
            console.log('→ applied moveResult:', moveResult);
            if (moveResult) {
              setFen(game.fen());
              setMoves(prev => [...prev, moveResult.san]);
              setLastMove({ from: moveResult.from, to: moveResult.to });
              if (moveResult.captured) {
                if (moveResult.color === 'w') setCapturedByWhite(p => [...p, moveResult.captured]);
                else                          setCapturedByBlack(p => [...p, moveResult.captured]);
              }
            }
          }
        );

        // c) game conclude
        client.subscribe(
          `/topic/game/${gameId}/conclude`,
          ({ body }) => {
            console.log('🏁 WS GameConclude →', body);
            clearInterval(timerRef.current);
            const concl = JSON.parse(body);
            if (concl.winnerId) {
              setGameStatus(concl.winnerId === meId ? 'Ви виграли!' : 'Ви програли.');
            } else if (concl.reason) {
              setGameStatus(concl.reason);
            } else {
              setGameStatus('Гра завершена');
            }
          }
        );
      },
      onStompError: err => console.error('❌ STOMP error:', err),
    });

    client.activate();
    return () => {
      client.deactivate();
      setStompClient(null);
    };
  }, [token, gameId, meId, game]);

  // 3) local timer tick & status checks
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (currentPlayer === 'w') setWhiteTime(t => Math.max(t - 1, 0));
      else                        setBlackTime(t => Math.max(t - 1, 0));
    }, 1000);

    const statusCheck = setInterval(() => {
      if (game.in_checkmate()) {
        setGameStatus(currentPlayer === 'w' ? 'Чорні виграли (мат)' : 'Білі виграли (мат)');
        clearInterval(timerRef.current);
      }
      // …інші умови…
    }, 500);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(statusCheck);
    };
  }, [currentPlayer, game, whiteTime, blackTime]);

  // 4) handle our move
  const handleMove = (from, to) => {
    console.log('▶️ handleMove:', from, to, 'turn=', game.turn(), 'local=', localColor);
    if (game.turn() !== localColor) {
      console.warn('Не ваша черга');
      return false;
    }
    const mv = game.move({ from, to, promotion: 'q' });
    if (!mv) return false;

    // apply locally
    setFen(game.fen());
    setMoves(p => [...p, mv.san]);
    setLastMove({ from: mv.from, to: mv.to });
    if (mv.captured) {
      mv.color === 'w'
        ? setCapturedByWhite(p => [...p, mv.captured])
        : setCapturedByBlack(p => [...p, mv.captured]);
    }

    // add increment
    if (mv.color === 'w') setWhiteTime(t => t + increment);
    else                  setBlackTime(t => t + increment);

    // publish
    if (stompClient?.active) {
      console.log('📤 publishing move', mv.san);
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({ gameId, move: mv.san, clientId: meId }),
      });
    } else {
      console.warn('STOMP не активний, хід не відправлено');
    }

    return true;
  };

  // other controls…
  const handleResign    = () => { setGameStatus(localColor==='w'?'Білі здалися':'Чорні здалися'); clearInterval(timerRef.current); };
  const handleOfferDraw = () => { setGameStatus('Нічия за згодою'); clearInterval(timerRef.current); };
  const handleMoveBack  = () => { if (game.history().length) { game.undo(); setFen(game.fen()); setMoves(game.history()); setLastMove(null); setCurrentPlayer(game.turn()); } };
  const handleRestart   = () => { 
    game.reset(); setFen('start'); setMoves([]); setWhiteTime(0); setBlackTime(0); setIncrement(0);
    setLocalColor('w'); setLastMove(null); setGameStatus('Гра йде');
  };

  return (
    <ChessPageUI
      fen={fen}
      onPieceDrop={handleMove}
      customSquareStyles={
        lastMove
          ? { [lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' }, [lastMove.to]: { backgroundColor: 'rgba(255,255,0,0.4)' } }
          : {}
      }
      boardOrientation={localColor === 'w' ? 'white' : 'black'}
      players={players}
      whiteTime={whiteTime}
      blackTime={blackTime}
      currentPlayer={currentPlayer}
      gameStatus={gameStatus}
      moves={moves}
      capturedByWhite={capturedByWhite}
      capturedByBlack={capturedByBlack}
      gameMode={gameMode}
      timeControl={timeControl}
      onResign={handleResign}
      onOfferDraw={handleOfferDraw}
      onMoveBackward={handleMoveBack}
      onRestart={handleRestart}
    />
  );
}
