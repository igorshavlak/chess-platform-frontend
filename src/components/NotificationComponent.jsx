import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS_URL = 'http://localhost:8082/ws-notifications';

const NotificationsComponent = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const stompRef = useRef(null);

  useEffect(() => {
    if (!token || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(NOTIFICATIONS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, ({ body }) => {
          if (body) setNotifications(prev => [...prev, body]);
        });
        client.subscribe(`/topic/notifications/gameFound/${userId}`, ({ body }) => {
          if (!body) return;
          try {
            const notif = JSON.parse(body);
            const isWhite = String(notif.whitePlayerId) === String(userId);
            const summary = `Нова гра ${notif.gameId}: ви ${isWhite?'білими':'чорними'}, режим ${notif.gameMode}, контроль ${notif.timeControl}`;
            setNotifications(prev => [...prev, summary]);
            navigate(`/game/${notif.gameId}`, { state: { color: isWhite?'w':'b' } });
          } catch(e) {
            console.error(e);
          }
        });
      }
    });

    stompRef.current = client;
    client.activate();
    return () => stompRef.current?.deactivate();
  }, [userId, token, navigate]);

  return (
    <div className="notifications">
      <h2>Уведомления</h2>
      {notifications.length === 0
        ? <p>Нет новых уведомлений</p>
        : <ul>{notifications.map((n,i)=><li key={i}>{n}</li>)}</ul>
      }
    </div>
  );
};

export default NotificationsComponent;