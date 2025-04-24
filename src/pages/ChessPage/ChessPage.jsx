import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Sidebar from '../components/Sidebar/Sidebar';
import { useKeycloak } from '@react-keycloak/web';
import InfoPanel from '../components/InfoPanel/InfoPanel';
import ChessboardComponent from '../components/ChessboardComponent/ChessboardComponent';
import RightInfoPanel from '../components/InfoPanel/RightInfoPanel';
import './ChessPage.css';

function ChessPage() {
  const { gameId } = useParams();
  const { keycloak } = useKeycloak();
  const token = keycloak.token;

  // Використовуємо id користувача із Keycloak як унікальний ідентифікатор клієнта
  const clientIdRef = useRef(keycloak.subject);

  // STOMP-клієнт для ігрового сервісу
  const [gameClient, setGameClient] = useState(null);

  // Ініціалізація chess.js
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState([]);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [gameStatus, setGameStatus] = useState('Ігра йде');
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const timerRef = useRef(null);

  // Стан для збереження кольору, який визначається з сервера
  const [localColor, setLocalColor] = useState('w'); // за замовчуванням – білими

  // Налаштування даних про гравців (буде оновлено після отримання інформації з сервера)
  const [players, setPlayers] = useState({
    white: { name: 'Я (білі)', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
    black: { name: 'Супротивник (чорні)', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
  });

  const fetchGameInfo = () => {
    fetch(`http://localhost:8082/api/games/getGameInfo/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.moves)) {
          // Відновлюємо історію ходів у chess.js
          game.reset();
          data.moves.forEach((move) => {
            game.move(move);
          });
          setFen(game.fen());
          setMoves(data.moves);
          setCurrentPlayer(game.turn());
  
          // Отримуємо id гравців як рядки
          const whitePlayerId = data.whitePlayerId.toString();
          const blackPlayerId = data.blackPlayerId.toString();
          const currentUserId = keycloak.tokenParsed?.sub;
  
          console.log('currentUserId:', currentUserId);
          console.log('whitePlayerId:', whitePlayerId);
          console.log('blackPlayerId:', blackPlayerId);
  
          if (currentUserId === whitePlayerId) {
            setLocalColor('w');
            setPlayers({
              white: { name: 'Я (білі)', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
              black: { name: 'Супротивник (чорні)', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
            });
          } else if (currentUserId === blackPlayerId) {
            setLocalColor('b');
            setPlayers({
              white: { name: 'Супротивник (білі)', avatar: 'https://i.pravatar.cc/150?img=32', rating: 1500 },
              black: { name: 'Я (чорні)', avatar: 'https://i.pravatar.cc/150?img=12', rating: 1450 },
            });
          } else {
            console.error('Current user is not a player in this game');
          }
        }
      })
      .catch((error) => console.error('Error fetching game info:', error));
  };

  // Завантаження інформації про гру при завантаженні компонента
  useEffect(() => {
    if (!token) return;
    fetchGameInfo();
  }, [gameId, token]);

  // Підключення до STOMP-сервісу для отримання ходів від супротивника
  useEffect(() => {
    if (!token) return;
    const socket = new SockJS('http://localhost:8082/ws-game');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Підключено до ігрового сервісу');
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const moveData = JSON.parse(message.body);
          // Якщо хід походить від цього ж клієнта, пропускаємо обробку
          if (moveData.clientId && moveData.clientId === clientIdRef.current) {
            return;
          }
          if (lastMove && moveData.move.from === lastMove.from && moveData.move.to === lastMove.to) {
            console.log('Пропускаємо дубльований хід:', moveData.move);
            return;
          }
          const moveResult = game.move(moveData.move);
          if (moveResult) {
            setFen(game.fen());
            setMoves((prev) => [...prev, moveResult.san]);
            setLastMove({ from: moveResult.from, to: moveResult.to });
            setCurrentPlayer(game.turn());
            if (moveResult.captured) {
              if (moveResult.color === 'w') {
                setCapturedByWhite((prev) => [...prev, moveResult.captured]);
              } else {
                setCapturedByBlack((prev) => [...prev, moveResult.captured]);
              }
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP помилка:', frame);
      },
    });
    client.activate();
    setGameClient(client);
    return () => client.deactivate();
  }, [token, gameId, game]);

  // Логіка відліку часу та перевірка стану гри
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (currentPlayer === 'w') {
        setWhiteTime((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setBlackTime((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    const statusInterval = setInterval(() => {
      if (game.in_checkmate()) {
        setGameStatus(currentPlayer === 'w' ? 'Чорні виграли (мат)' : 'Білі виграли (мат)');
        clearInterval(timerRef.current);
      } else if (game.in_stalemate()) {
        setGameStatus('Нічия (пат)');
        clearInterval(timerRef.current);
      } else if (game.in_threefold_repetition()) {
        setGameStatus('Нічия (3-кратне повторення)');
        clearInterval(timerRef.current);
      } else if (game.insufficient_material()) {
        setGameStatus('Нічия (недостатньо матеріалу)');
        clearInterval(timerRef.current);
      } else if (whiteTime === 0) {
        setGameStatus('Чорні виграли (час білих вичерпано)');
        clearInterval(timerRef.current);
      } else if (blackTime === 0) {
        setGameStatus('Білі виграли (час чорних вичерпано)');
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(statusInterval);
    };
  }, [currentPlayer, game, whiteTime, blackTime]);

  // Обробка ходу локального гравця
  const handleMove = (sourceSquare, targetSquare) => {
    if (game.turn() !== localColor) {
      console.warn('Не ваша черга!');
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (!move) return false;

    setFen(game.fen());
    setMoves((prev) => [...prev, move.san]);
    setLastMove({ from: move.from, to: move.to });
    setCurrentPlayer(game.turn());

    if (move.captured) {
      if (move.color === 'w') {
        setCapturedByWhite((prev) => [...prev, move.captured]);
      } else {
        setCapturedByBlack((prev) => [...prev, move.captured]);
      }
    }

    if (gameClient?.connected && gameId) {
      gameClient.publish({
        destination: '/app/move',
        body: JSON.stringify({
          gameId: gameId,
          move: move.san,
          clientId: clientIdRef.current,
        }),
      });
    } else {
      console.warn('STOMP з’єднання не встановлено. Хід не відправлено на сервер');
    }

    // Збереження нового стану гри після ходу (якщо потрібне)
    // saveGameState();

    return true;
  };

  const getSquareStyles = () => {
    if (!lastMove) return {};
    return {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    };
  };

  const handleResign = () => {
    setGameStatus(
      currentPlayer === 'w'
        ? 'Білі здалися. Перемога чорних.'
        : 'Чорні здалися. Перемога білих.'
    );
    clearInterval(timerRef.current);
  };

  const handleOfferDraw = () => {
    setGameStatus('Нічия (за згодою)');
    clearInterval(timerRef.current);
  };

  const handleMoveBackward = () => {
    if (game.history().length > 0) {
      game.undo();
      setFen(game.fen());
      setMoves(game.history());
      setLastMove(null);
      setCurrentPlayer(game.turn());
      // saveGameState();
    }
  };

  const handleMoveForward = () => {
    // Реалізуйте, якщо потрібно
  };

  const restartGame = () => {
    game.reset();
    setFen('start');
    setMoves([]);
    setWhiteTime(300);
    setBlackTime(300);
    setCurrentPlayer('w');
    setLastMove(null);
    setGameStatus('Ігра йде');
    // saveGameState();
  };

  return (
    <div className="chess-page">
      <Sidebar />
      <div className="chess-game-container">
        <InfoPanel
          players={players}
          whiteTime={whiteTime}
          blackTime={blackTime}
          currentPlayer={currentPlayer}
          gameStatus={gameStatus}
          moves={moves}
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />
        <ChessboardComponent
          fen={fen}
          onPieceDrop={handleMove}
          customSquareStyles={getSquareStyles()}
          boardOrientation={localColor === 'w' ? 'white' : 'black'}
        />
      </div>
    </div>
  );
}

export default ChessPage;
