import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const NOTIFICATIONS_URL = 'http://localhost:8082/ws-notifications';
const GAME_SERVICE_URL = 'http://localhost:8082/ws-game';

const NotificationsComponent = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [gameClient, setGameClient] = useState(null); // Missing state declaration

  useEffect(() => {

    const socket = new SockJS(NOTIFICATIONS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
       connectHeaders: {
        Authorization: `Bearer ${token}`,
         
       },
      reconnectDelay: 5000,
      onConnect: () => {  
        console.log('Підключення до сервера нотифікацій встановлено');
        // Підписка на канал повідомлень для конкретного користувача
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          if (message.body) {
            console.log('Отримано повідомлення:', message.body);
            setNotifications((prev) => [...prev, message.body]);
          }
        });
        stompClient.subscribe(`/topic/notifications/gameFound/${userId}`, (message) => {
          if (message.body) {
            console.log('Отримано повідомлення:', message.body);
            setNotifications((prev) => [...prev, message.body]);
            const gameId = message.body.split("Game was found:")[1].trim();
              //createGameWebSocketSession(gameId);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Stomp помилка:', frame);
      },
    });

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [userId, token]);

  const createGameWebSocketSession = (gameId) => {
    console.log("Створення сесії для гри:", gameId);
    const gameSocket = new SockJS(GAME_SERVICE_URL);
    const gameStompClient = new Client({
      webSocketFactory: () => gameSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`Підключення до сервісу гри для гри ${gameId} встановлено`);
        gameStompClient.subscribe(`/topic/game/${gameId}`, (message) => {
          console.log("Оновлення гри:", message.body);
        });
      },
      onStompError: (frame) => {
        console.error("Game Stomp помилка:", frame);
      },
    });
    gameStompClient.activate();
    setGameClient(gameStompClient);
  };

  return (
    <div>
      <h2>Нотифікації</h2>
      {notifications.length === 0 ? (
        <p>Немає нових повідомлень</p>
      ) : (
        <ul>
          {notifications.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsComponent;
