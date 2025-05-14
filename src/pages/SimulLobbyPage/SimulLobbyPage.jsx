import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useSimulApi } from './simulApi';
import { WSSContext } from '../../App';
import {
  FaUserCircle,
  FaChessBoard,
  FaClock,
  FaPlusCircle,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaInfoCircle,
} from 'react-icons/fa';
import './SimulLobbyPage.css';

function SimulLobbyPage() {
  const { lobbyId } = useParams();
  const { keycloak } = useKeycloak();
  const { service: websocketService, connected: wsConnected } = useContext(WSSContext);
  const {
    getSimulLobbyDetails,
    joinSimulLobby,
    sendSimulLobbyMessage,
    confirmSimulPlayer,
    startSimulSession
  } = useSimulApi();

  // Стейт
  const navigate = useNavigate(); // Для навігації між сторінками
  const [sessionDetails, setSessionDetails] = useState(null);
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [approvedPlayers, setApprovedPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  // Поточний користувач
  const currentUserId = keycloak?.tokenParsed?.sub;
  const currentUserNickname = keycloak?.tokenParsed?.preferred_username || 'User';
  let currentUserIsOrganizer = sessionDetails?.masterId === currentUserId;

  // Завантаження деталей лобі
  useEffect(() => {
    const fetchLobbyDetails = async () => {
      try {
        const data = await getSimulLobbyDetails(lobbyId);
        setSessionDetails({
          simulId: data.simulId,
          masterId: data.masterId,
          masterNickname: data.masterInfo.nickname,
          masterRating: data.masterInfo.rating,
          mode: data.gameMode,
          timeControl: data.timeControl, // Наприклад, "15+10"
          extraTime: data.additionalMasterTime ? `${data.additionalMasterTime} хв` : 'Немає',
          rating: data.rating,
          status: data.status,
        });
        const msgsMap = data.playersMessage || {};  
        const initialMessages = Object.entries(msgsMap).map(([id, msg]) => ({
          id: id + '-' + msg.timestamp,
          sender:   msg.playerInfo.nickname,
          text:     msg.message,
        }));
        setChatMessages(initialMessages);
        currentUserIsOrganizer = data.masterId === currentUserId;
               // Отримуємо мапу інформації про всіх гравців з DTO
               const allPlayersInfo = data.playersInfo || {};

               // Формуємо список гравців, що очікують
               const pending = (data.joinedPlayerIds || []).map((id) => ({
                 id,
                 nickname: allPlayersInfo[id]?.nickname || `Гравець (${id.slice(0, 4)})`, // Використовуємо реальний нікнейм або заглушку
                 rating: allPlayersInfo[id]?.rating || 0, // Використовуємо реальний рейтинг або заглушку
               }));
       
               // Формуємо список підтверджених гравців
               const approved = (data.opponentIds || []).map((id) => ({
                 id,
                 nickname: allPlayersInfo[id]?.nickname || `Гравець (${id.slice(0, 4)})`,
                 rating: allPlayersInfo[id]?.rating || 0,
               }));
       
               setPendingPlayers(pending);
               setApprovedPlayers(approved);
       
             } catch (error) {
               console.error('Не вдалося завантажити деталі лобі:', error);
               // Можливо, відобразіть повідомлення про помилку користувачу
             }
        
    };

    if (lobbyId) {
      fetchLobbyDetails();
    }
  }, [lobbyId, getSimulLobbyDetails]);

  // Підключення до WebSocket-топіків
  useEffect(() => {
    if (!wsConnected || !websocketService || !lobbyId) return;

    const subscriptions = [];

    // Топік для повідомлень чату
    subscriptions.push(
      websocketService.subscribe(
        `/topic/simul/lobby/${lobbyId}/message`,
        (message) => {
          const playerMessage = message;
          setChatMessages((prev) => [
            ...prev,
            {
              id: `m${Date.now()}`,
              sender: playerMessage.playerInfo.nickname,
              text: playerMessage.message,
              timestamp: Date.now(),
            },
          ]);
        }
      )
    );

    // Топік для нових гравців
    subscriptions.push(
      websocketService.subscribe(
        `/topic/simul/lobby/${lobbyId}/newPlayer`,
        (message) => {
          const playerInfo = message;
          setPendingPlayers((prev) => [
            ...prev,
            {
              id: playerInfo.playerId,
              nickname: playerInfo.nickname,
              rating: playerInfo.rating,
            },
          ]);
        }
      )
    );

    // Топік для підтверджених гравців
    subscriptions.push(
      websocketService.subscribe(
        `/topic/simul/lobby/${lobbyId}/confirm`,
        (message) => {
          const playerInfo = message;
          setPendingPlayers((prev) =>
            prev.filter((p) => p.id !== playerInfo.playerId)
          );
          setApprovedPlayers((prev) => [
            ...prev,
            {
              id: playerInfo.playerId,
              nickname: playerInfo.nickname,
              rating: playerInfo.rating,
            },
          ]);
        }
      )
    );
  

      subscriptions.push(
        websocketService.subscribe(`/topic/simul/lobby/${currentUserId}/start`, (gameId) => {
         console.log('Отримали start для', currentUserId, '— перенаправляємо в гру', gameId);
         navigate(`/game/${gameId}`);
       })
     );
    
    
    return () => {
      subscriptions.forEach((unsub, idx) => {
        if (typeof unsub === 'function') {
          unsub();            
          console.log('Unsab', idx, unsub);
        } else {
          console.warn('Unexpected subscription at', idx, unsub);
        }
      });
    };
  }, [wsConnected, websocketService, lobbyId]);

  // Автоматичне приєднання до лобі
  useEffect(() => {
    if (!currentUserId || !lobbyId || !sessionDetails) return;

    const isPlayerInLobby =
      pendingPlayers.some((p) => p.id === currentUserId) ||
      approvedPlayers.some((p) => p.id === currentUserId);

    if (!isPlayerInLobby && !currentUserIsOrganizer) {
      joinSimulLobby(lobbyId, currentUserId)
        .then(() => {
          console.log('Joined simul lobby');
        })
        .catch((error) => {
          console.error('Failed to join simul lobby:', error);
        });
    }
  }, [
    currentUserId,
    lobbyId,
    sessionDetails,
    pendingPlayers,
    approvedPlayers,
    joinSimulLobby,
    currentUserIsOrganizer,
  ]);

  // Автопрокрутка чату
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Обробники

  const handleStartSimul = async () => {
    try {
      const simulGamesDTO = await startSimulSession(lobbyId); // Викликаємо API для старту сесії
      const { masterId, gamesPlayerIds } = simulGamesDTO;

      if (currentUserId === masterId) {
        navigate(`/simul/${lobbyId}/simulPage`);
      } else {
        navigate(`/game/${Object.keys(gamesPlayerIds).find(gameId => gamesPlayerIds[gameId] === currentUserId)}`);
      }
    } catch (error) {
      console.error('Не вдалося почати сесію:', error);
    }
  };

  const handleApprovePlayer = async (playerId) => {
    try {
      await confirmSimulPlayer(lobbyId, playerId);
      // Оновлення станів відбудеться через WebSocket
    } catch (error) {
      console.error('Failed to approve player:', error);
    }
  };

  const handleRemovePlayer = (playerId) => {
    // TODO: Реалізувати API для видалення гравця
    console.log(`Removing player: ${playerId}`);
    setApprovedPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setPendingPlayers((prev) => [
      ...prev,
      approvedPlayers.find((p) => p.id === playerId),
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await sendSimulLobbyMessage(lobbyId, currentUserId, chatInput.trim());
      setChatInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Рендеринг, якщо деталі ще не завантажились
  if (!sessionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="simul-lobby-page">
      <Sidebar />
      <main className="lobby-content-area">
        {/* Секція зі списками гравців */}
        <section className="player-lists-section">
          <h2 className="section-title">Учасники сеансу ({approvedPlayers.length + pendingPlayers.length})</h2>
          <div className="player-columns">
            {/* Колонка гравців, що очікують */}
            <div className="player-column pending">
              <h3>Очікують ({pendingPlayers.length})</h3>
              <ul className="player-list">
                {pendingPlayers.length > 0 ? (
                  pendingPlayers.map((player) => (
                    <li key={player.id} className="player-item">
                      <div className="player-info">
                        <span className="player-nickname">{player.nickname}</span>
                        <span className="player-rating">({player.rating})</span>
                      </div>
                      {currentUserIsOrganizer && (
                        <div className="player-actions">
                          <button
                            className="action-btn approve-btn"
                            title="Підтвердити"
                            onClick={() => handleApprovePlayer(player.id)}
                          >
                            <FaCheck />
                          </button>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="empty-list-msg">Немає гравців в очікуванні</li>
                )}
              </ul>
            </div>

            {/* Колонка підтверджених гравців */}
            <div className="player-column approved">
              <h3>Підтверджені ({approvedPlayers.length})</h3>
              <ul className="player-list">
                {approvedPlayers.length > 0 ? (
                  approvedPlayers.map((player) => (
                    <li key={player.id} className="player-item">
                      <div className="player-info">
                        <span className="player-nickname">{player.nickname}</span>
                        <span className="player-rating">({player.rating})</span>
                      </div>
                      {currentUserIsOrganizer &&
                        player.id !== sessionDetails.masterId && (
                          <div className="player-actions">
                            <button
                              className="action-btn remove-btn"
                              title="Видалити"
                              onClick={() => handleRemovePlayer(player.id)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                    </li>
                  ))
                ) : (
                  <li className="empty-list-msg">Ще немає підтверджених гравців</li>
                )}
              </ul>
            </div>
          </div>
          {/* Кнопка "Почати сеанс" */}
          {currentUserIsOrganizer && approvedPlayers.length > 0 && (
            <button onClick={handleStartSimul}>Почати сеанс</button>
          )}
        </section>

        {/* Секція інформації та чату */}
        <section className="info-chat-section">
          {/* Блок інформації про сеанс */}
          <div className="session-info-box">
            <h3>
              <FaInfoCircle /> Інформація про сеанс
            </h3>
            <div className="info-item">
              <FaUserCircle className="info-icon" />
              <span>
                <strong>Організатор:</strong> {sessionDetails.masterNickname} (
                {sessionDetails.masterRating})
              </span>
            </div>
            <div className="info-item">
              <FaChessBoard className="info-icon" />
              <span>
                <strong>Режим:</strong> {sessionDetails.mode}
              </span>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <span>
                <strong>Контроль часу:</strong> {sessionDetails.timeControl}
              </span>
            </div>
            <div className="info-item">
              <FaPlusCircle className="info-icon" />
              <span>
                <strong>Додатковий час (орг.):</strong> {sessionDetails.extraTime}
              </span>
            </div>
          </div>

          {/* Блок чату */}
          <div className="chat-box">
            <h3>Чат лоббі</h3>
            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === currentUserNickname ? 'my-message' : ''}`}
                >
                  <span className="message-sender">
                    {msg.sender === currentUserNickname ? 'Ви' : msg.sender}:
                  </span>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Введіть повідомлення..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                aria-label="Поле вводу повідомлення чату"
              />
              <button type="submit" className="send-button" title="Відправити">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SimulLobbyPage;