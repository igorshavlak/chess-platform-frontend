import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WSSContext } from '../App';


const NotificationsComponent = ({ userId, wsConnected }) => {
  const { service: wss } = useContext(WSSContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // тільки коли є юзер і WS підключений — створюємо підписки
    if (!userId || !wsConnected) return;

    const unsub1 = wss.subscribe(
      `/topic/notifications/${userId}`,
      ({ message }) => setNotifications(prev => [...prev, message])
    );

    const unsub2 = wss.subscribe(
      `/topic/notifications/gameFound/${userId}`,
      notif => {
        const isWhite = String(notif.whitePlayerId) === String(userId);
        const summary = `Нова гра ${notif.gameId}: ви ${isWhite ? 'білими' : 'чорними'}`;
        setNotifications(prev => [...prev, summary]);
        navigate(`/game/${notif.gameId}`, { state: { color: isWhite ? 'w' : 'b' } });
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId, wsConnected, wss, navigate]);

  return (
    /*
    <div className="notifications">
      <h2>Сповіщення</h2>
      {!wsConnected && (
        <p className="warning">Очікую підключення до WebSocket...</p>
      )}
      {notifications.length === 0 ? (
        <p>{wsConnected ? 'Немає нових сповіщень' : ''}</p>
      ) : (
        <ul>
          {notifications.map((n, i) => (
            <li key={i}>{typeof n === 'string' ? n : JSON.stringify(n)}</li>
          ))}
        </ul>
      )}
    </div>
    */
    <></>
  );
};

export default NotificationsComponent;
