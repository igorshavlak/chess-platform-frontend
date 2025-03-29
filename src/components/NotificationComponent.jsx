import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS_URL = 'http://localhost:8082/ws-notifications';
const GAME_SERVICE_URL = 'http://localhost:8082/ws-game';

const NotificationsComponent = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = new SockJS(NOTIFICATIONS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Подключение к серверу уведомлений установлено');

        // Подписка на личные уведомления
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          if (message.body) {
            console.log('Получено уведомление:', message.body);
            setNotifications((prev) => [...prev, message.body]);
          }
        });

        // Подписка на уведомления о создании/поиске игры
        stompClient.subscribe(`/topic/notifications/gameFound/${userId}`, (message) => {
          if (message.body) {
            console.log('Получено уведомление о найденной игре:', message.body);
            setNotifications((prev) => [...prev, message.body]);
            const afterPrefix = message.body.split('Game was found:')[1];
            if (afterPrefix) {
              const [rawGameId, color] = afterPrefix.split(':');
              const gameId = rawGameId.trim();

              // Переходим на страницу игры, передаём color через state
              navigate(`/game/${gameId}`, { state: { color } });
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP ошибка:', frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [userId, token, navigate]);

  return (
    <div>
      <h2>Уведомления</h2>
      {notifications.length === 0 ? (
        <p>Нет новых уведомлений</p>
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
