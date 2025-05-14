// src/pages/ChessPageContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useKeycloak } from '@react-keycloak/web';
import ChessPageUI from './ChessPageUI';
import GameConclusionModal from './GameConclusionModal'; 

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
  const [isModalOpen, setIsModalOpen] = useState(false);
// Можливо, вам також знадобиться зберігати повідомлення для модалки,
// але ви вже використовуєте gameStatus для цього.
// const [modalMessage, setModalMessage] = useState('');

  

  // === таймери та інкремент (в секундах) ===
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [increment, setIncrement] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  // === ігрові налаштування ===
  const [gameMode, setGameMode] = useState(null);
  const [timeControl, setTimeControl] = useState(null);
  const [gameStatus, setGameStatus] = useState('Гра йде');
  const [localColor, setLocalColor] = useState('w');
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);
  const [players, setPlayers] = useState(null);

  const timerRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  const [whiteDeadline, setWhiteDeadline] = useState(null);
  const [blackDeadline, setBlackDeadline] = useState(null);

  // 1) Fetch початкових даних і налаштування часу
  useEffect(() => {
    if (!token || !meId) return;
    fetch(`http://localhost:8082/api/games/getGameInfo/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlayers({
          white: { name: 'white', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1450 },
          black: { name: 'black', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1500 },
        });
      
        game.reset();
        data.moves.forEach(m => game.move(m));
        setFen(game.fen());
        setMoves(data.moves);

        
        // встановлюємо початкового гравця
        setCurrentPlayer(game.turn());

        // колір локального гравця
        if (meId === String(data.whitePlayerId)) setLocalColor('w');
        else if (meId === String(data.blackPlayerId)) setLocalColor('b');

        if (data.whiteDeadline && data.blackDeadline) {
          setWhiteDeadline(data.whiteDeadline);
          setBlackDeadline(data.blackDeadline);
          const now = Date.now();
          if (data.activePlayerIsWhite) {
            setWhiteTime(Math.max(0, Math.ceil((data.whiteDeadline - now) / 1000)));
            setBlackTime(Math.max(0, Math.ceil(data.blackTimeMillis / 1000))); 
        } else {
            setWhiteTime(Math.max(0, Math.ceil(data.whiteTimeMillis / 1000)));
            setBlackTime(Math.max(0, Math.ceil((data.blackDeadline - now) / 1000)));
        }
      }
  
        
        setGameMode(data.gameMode);
        setTimeControl(data.timeControl);
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

          // 1. ЗАВЖДИ оновлюємо авторитетні дедлайни від сервера
          setWhiteDeadline(rsp.whiteDeadline);
          setBlackDeadline(rsp.blackDeadline);
        
          // 2. ЗАВЖДИ оновлюємо відображуваний час на основі *Millis з відповіді сервера.
          // Ці значення є актуальними залишком часу після ходу та інкременту.
          // Таймер setInterval потім продовжить відлік для активного гравця.
          setWhiteTime(Math.max(0, Math.ceil(rsp.whiteTimeMillis / 1000)));
          setBlackTime(Math.max(0, Math.ceil(rsp.blackTimeMillis / 1000)));
        
          // 3. Якщо це хід суперника, застосовуємо його до локальної дошки
          // та оновлюємо поточного гравця на основі стану chess.js.
          if (rsp.senderId !== meId) {
            const moveResult = game.move(rsp.move); // Переконайтеся, що rsp.move у форматі, який розуміє chess.js (наприклад, SAN)
            if (moveResult) {
              setFen(game.fen());
              setMoves(prevMoves => [...prevMoves, moveResult.san]);
              setLastMove({ from: moveResult.from, to: moveResult.to });
              if (moveResult.captured) {
                // 'color' у moveResult вказує на колір фігури, яка зробила хід.
                // Отже, якщо білі походили і взяли фігуру, moveResult.color === 'w'.
                // Захоплена фігура буде кольору суперника.
                if (game.turn() === 'w') { // Якщо після ходу хід чорних, значить білі щойно захопили
                  setCapturedByWhite(prevCaptured => [...prevCaptured, moveResult.captured]);
                } else { // Якщо після ходу хід білих, значить чорні щойно захопили
                  setCapturedByBlack(prevCaptured => [...prevCaptured, moveResult.captured]);
                }
              }
              // Оновлюємо поточного гравця на основі стану бібліотеки chess.js
              setCurrentPlayer(game.turn());
            } else {
              console.error("Помилковий хід отримано від сервера:", rsp.move);
              // Тут можна додати логіку запиту повної синхронізації стану гри, якщо потрібно
            }
          }
          // Якщо це був наш власний хід (rsp.senderId === meId),
          // стан гри (fen, moves, lastMove, currentPlayer) вже був оптимістично оновлений у handleMove.
          // Ми щойно синхронізували наші дедлайни та відображення часу з авторитетним станом сервера.
        });

        client.subscribe(`/topic/game/${gameId}/conclude`, ({ body }) => {
          clearInterval(timerRef.current); // Зупиняємо таймер
          const concl = JSON.parse(body);
          let finalStatus = 'Гра завершена'; // Значення за замовчуванням
          if (concl.winnerId) {
            finalStatus = concl.winnerId === meId ? 'Ви виграли!' : 'Ви програли.';
          } else if (concl.reason) {
            // Обробляємо інші причини, такі як нічия, здача суперника тощо.
            // Можливо, вам захочеться більш детально обробляти різні reason'и
            // Наприклад: 'DRAW_AGREED', 'STALEMATE', 'RESIGNATION', 'TIMEOUT'
            switch (concl.reason) {
                case 'DRAW_AGREED': finalStatus = 'Нічия за згодою'; break;
                case 'STALEMATE': finalStatus = 'Пат! Нічия.'; break;
                case 'RESIGNATION':
                     finalStatus = 'Гра завершена: Здача'; // Або складніша логіка, якщо потрібно
                     break;
                case 'TIMEOUT':
                     finalStatus = concl.winnerId === meId ? 'Ви виграли по часу!' : 'Ви програли по часу.';
                     break;
                case 'CHECKMATE':
                     finalStatus = concl.winnerId === meId ? 'Мат! Ви виграли!' : 'Мат! Ви програли.';
                     break;
                default: finalStatus = `Гра завершена: ${concl.reason}`; break;
            }
          }
        
          setGameStatus(finalStatus); // Оновлюємо статус гри
          // setModalMessage(finalStatus); // Якщо використовуєте окремий стан для модалки
          setIsModalOpen(true); // Відкриваємо модальне вікно
        });
      }
    });

    client.activate();
    return () => client.deactivate();
  }, [token, gameId, meId, game]);

  useEffect(() => {
    if (!whiteDeadline || !blackDeadline || !currentPlayer || moves.length === 0) return;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
        const now = Date.now();
        if (currentPlayer === 'w') {
            const sec = Math.max(0, Math.ceil((whiteDeadline - now) / 1000));
            setWhiteTime(sec);
        } else {
            const sec = Math.max(0, Math.ceil((blackDeadline - now) / 1000));
            setBlackTime(sec);
        }
    }, 100);

    return () => clearInterval(timerRef.current);
}, [whiteDeadline, blackDeadline, currentPlayer, moves]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // 4) Обробка власного ходу — без локального інкременту!
  const handleMove = (from, to) => {
    if (game.turn() !== localColor) return false;
    const mv = game.move({ from, to, promotion: 'q' });
    if (!mv) return false;

    setFen(game.fen());
    setMoves(prev => [...prev, mv.san]);
    setLastMove({ from: mv.from, to: mv.to });
    setCurrentPlayer(game.turn());

    if (localColor === 'w') {
      setWhiteTime((prev) => prev + increment);
  } else {
      setBlackTime((prev) => prev + increment);
  }

    // шлемо на сервер — сервер пришле нам нові дедлайни
    stompClient.publish({
      destination: '/app/move',
      body: JSON.stringify({ gameId, move: mv.san })
    });
    return true;
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Можливо, тут ви захочете перенаправити користувача
    // на іншу сторінку після закриття модалки, наприклад, useNavigate('/')
  };
  
  const handleResign = () => { setGameStatus('Здаюсь'); clearInterval(timerRef.current); };
  const handleOfferDraw = () => { setGameStatus('Нічия'); clearInterval(timerRef.current); };
  const handleMoveBack = () => {
    game.undo();
    setFen(game.fen());
    setMoves(game.history());
    setLastMove(null);
    setCurrentPlayer(prev => (prev === 'w' ? 'b' : 'w'));
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

  if (!players || whiteDeadline == null || blackDeadline == null) {
    return <div>Loading…</div>;
  }

    return (
        <> {/* Використовуйте Fragment як один батьківський елемент */}
          <ChessPageUI
            fen={fen}
            onPieceDrop={handleMove}
            customSquareStyles={lastMove ? {
              [lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
              [lastMove.to]:   { backgroundColor: 'rgba(255,255,0,0.4)' },
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
            onMoveForward={() => {}}
            onRestart={handleRestart}
          />
    
          {/* Модальне вікно завершення гри */}
          <GameConclusionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            message={gameStatus}
            gameId={gameId}
          />
        </>
      );
    }