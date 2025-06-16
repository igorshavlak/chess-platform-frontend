  // src/pages/ChessPageContainer.jsx
  import React, { useState, useEffect, useRef } from 'react';
  import { Chess } from 'chess.js';
  import { useParams, useNavigate } from 'react-router-dom';
  import SockJS from 'sockjs-client';
  import { Client } from '@stomp/stompjs';
  import { useKeycloak } from '@react-keycloak/web';
  import ChessPageUI from './ChessPageUI';
  import { useSettings } from '../../context/SettingsContext';
  import GameConclusionModal from './GameConclusionModal'; 

  export default function ChessPageContainer() {
    const { settings, isLoading } = useSettings();
    const { gameId } = useParams();
    const { keycloak } = useKeycloak();
    const token = keycloak.token;
    const meId = keycloak.tokenParsed?.sub;
    const navigate = useNavigate()

    // === chess.js та стан дошки ===
    const [game] = useState(new Chess()); 
    const [fen, setFen] = useState('start');
    const [moves, setMoves] = useState([]);
    const [lastMove, setLastMove] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // === NEW: Стан для перегляду історії ходів ===
    // null означає "живий" режим (поточна позиція), число - індекс ходу, що переглядається
    const [viewedMoveIndex, setViewedMoveIndex] = useState(null); 
    const isLive = viewedMoveIndex === null; // Зручний прапорець для перевірки, чи ми в "живому" режимі

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

    // 1) Fetch початкових даних
    useEffect(() => {
      if (!token || !meId) return;
      fetch(`http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082/api/games/getGameInfo/${gameId}`, {
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
          setViewedMoveIndex(null); // Завжди починаємо в "живому" режимі

          setCurrentPlayer(game.turn());

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

    // === NEW: Ефект для оновлення FEN та підсвітки ходу під час перегляду історії ===
    useEffect(() => {
      let history;
      // Якщо ми в "живому" режимі, показуємо стан з основного об'єкта гри
      if (isLive) {
        setFen(game.fen());
        history = game.history({ verbose: true });
      } else {
        // Якщо переглядаємо історію, створюємо тимчасову гру і відтворюємо ходи
        const tempGame = new Chess();
        // Індекс -1 відповідає початковій позиції
        for (let i = 0; i <= viewedMoveIndex; i++) {
          tempGame.move(moves[i]);
        }
        setFen(tempGame.fen());
        history = tempGame.history({ verbose: true });
      }

      // Оновлюємо підсвітку останнього ходу
      if (history && history.length > 0) {
        const last = history[history.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null); // Немає ходів для підсвітки
      }
    }, [viewedMoveIndex, moves, game, isLive]);

    // 2) STOMP: обробка ходів від сервера
    useEffect(() => {
      if (!token) return;
      const socket = new SockJS(`http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082/ws-game`);
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          setStompClient(client);

          client.subscribe(`/topic/game/${gameId}`, ({ body }) => {
            const rsp = JSON.parse(body);

            setWhiteDeadline(rsp.whiteDeadline);
            setBlackDeadline(rsp.blackDeadline);
            setWhiteTime(Math.max(0, Math.ceil(rsp.whiteTimeMillis / 1000)));
            setBlackTime(Math.max(0, Math.ceil(rsp.blackTimeMillis / 1000)));
          
            // ЗАВЖДИ оновлюємо основний об'єкт гри, навіть якщо користувач переглядає історію
            const moveResult = game.move(rsp.move); 
            if (moveResult) {
              setMoves(prevMoves => [...prevMoves, moveResult.san]);
              setCurrentPlayer(game.turn());
              if (moveResult.captured) {
                  if (game.turn() === 'w') { 
                    setCapturedByWhite(prevCaptured => [...prevCaptured, moveResult.captured]);
                  } else { 
                    setCapturedByBlack(prevCaptured => [...prevCaptured, moveResult.captured]);
                  }
              }
            } else {
              console.error("Помилковий хід отримано від сервера:", rsp.move);
            }
          });

          client.subscribe(`/topic/game/${gameId}/conclude`, ({ body }) => {
            clearInterval(timerRef.current);
            const concl = JSON.parse(body);
            let finalStatus = 'Гра завершена';
            if (concl.winnerId) {
              finalStatus = concl.winnerId === meId ? 'Ви виграли!' : 'Ви програли.';
            } else if (concl.reason) {
              switch (concl.reason) {
                case 'DRAW_AGREED': finalStatus = 'Нічия за згодою'; break;
                case 'STALEMATE': finalStatus = 'Пат! Нічия.'; break;
                case 'RESIGNATION': finalStatus = 'Суперник здався'; break;
                case 'TIMEOUT':
                  finalStatus = concl.winnerId === meId ? 'Ви виграли по часу!' : 'Ви програли по часу.';
                  break;
                case 'CHECKMATE':
                  finalStatus = concl.winnerId === meId ? 'Мат! Ви виграли!' : 'Мат! Ви програли.';
                  break;
                default: finalStatus = `Гра завершена: ${concl.reason}`; break;
              }
            }
            setGameStatus(finalStatus);
            setIsModalOpen(true);
          });
        }
      });

      client.activate();
      return () => client.deactivate();
    }, [token, gameId, meId, game]); // Залежність 'game' важлива

    // 3) Таймер (без змін)
    useEffect(() => {
      if (!whiteDeadline || !blackDeadline || !currentPlayer || moves.length === 0 || gameStatus !== 'Гра йде') return;
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
  }, [whiteDeadline, blackDeadline, currentPlayer, moves, gameStatus]);

    useEffect(() => () => clearInterval(timerRef.current), []);

    // === MODIFIED: Обробка власного ходу ===
    const handleMove = (from, to) => {
      // ЗАБОРОНА робити хід, якщо користувач не в "живому" режимі
      if (!isLive) return false;
      
      if (game.turn() !== localColor) return false;
      const mv = game.move({ from, to, promotion: 'q' });
      if (!mv) return false;

      // Оптимістичне оновлення стану
      setMoves(prev => [...prev, mv.san]);
      setCurrentPlayer(game.turn());
      // `fen` та `lastMove` оновляться автоматично через useEffect
      
      // Ми щойно зробили хід, тому переконуємося, що ми в "живому" режимі.
      setViewedMoveIndex(null); 
      
      // Інкремент локально не додаємо, чекаємо на відповідь сервера
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({ gameId, move: mv.san })
      });
      return true;
    };
    
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };
    
    const handleResign = () => { /* ... логіка відправки на сервер ... */ };
    const handleOfferDraw = () => { /* ... логіка відправки на сервер ... */ };

    // === MODIFIED: Навігація історією ===
    const handleMoveBack = () => {
      let newIndex;
      if (isLive) {
        // Якщо ми в "живому" режимі, переходимо до передостаннього ходу
        newIndex = moves.length - 2;
      } else {
        // Інакше, просто рухаємось назад
        newIndex = viewedMoveIndex - 1;
      }
      // Індекс може бути -1, щоб показати початкову позицію (до першого ходу)
      if (newIndex >= -1) {
        setViewedMoveIndex(newIndex);
      }
    };
  
    // === NEW: Функція для руху вперед по історії ===
    const handleMoveForward = () => {
      // Якщо ми вже в "живому" режимі, нічого не робимо
      if (isLive) return;

      const newIndex = viewedMoveIndex + 1;

      // Якщо наступний індекс - це останній хід, повертаємось в "живий" режим
      if (newIndex >= moves.length - 1) {
        setViewedMoveIndex(null);
      } else {
        setViewedMoveIndex(newIndex);
      }
    };
    
    const handleRestart = () => {
      game.reset();
      setFen('start');
      setMoves([]);
      setWhiteTime(null);
      setBlackTime(null);
      setLastMove(null);
      setGameStatus('Гра йде');
      setCurrentPlayer('w');
      setViewedMoveIndex(null); // Скидаємо перегляд історії
    };

    if (!players || whiteTime == null || blackTime == null) {
      return <div>Loading…</div>;
    }

      return (
          <> 
            <ChessPageUI
              fen={fen}
              onPieceDrop={handleMove}
              customSquareStyles={lastMove ? {
                [lastMove.from]: { backgroundColor: 'rgba(255,255,0,0.4)' },
                [lastMove.to]:   { backgroundColor: 'rgba(255,255,0,0.4)' },
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
              onMoveForward={handleMoveForward} // === MODIFIED: передаємо нову функцію
              onRestart={handleRestart}
              boardStyle={settings.boardStyle}
              pieceStyle={settings.pieceStyle}
            />
      
            <GameConclusionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              message={gameStatus}
              gameId={gameId}
              moves={moves}
            />
          </>
        );
      }