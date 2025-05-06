import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar'; 
import {
  FaUserCircle,
  FaChessBoard,
  FaClock,
  FaPlusCircle,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaInfoCircle
} from 'react-icons/fa';
import './SimulLobbyPage.css'; 

// --- Приклад даних (замініть реальними даними з API/стейту) ---
const mockSessionDetails = {
  organizerNickname: 'SimulMaster',
  organizerRating: 2100,
  mode: 'Рапід',
  timeControl: '15+10',
  extraTime: '5 хв',
  id: 'simul-123' 
};

const mockPendingPlayers = [
  { id: 'p1', nickname: 'PlayerOne', rating: 1550 },
  { id: 'p2', nickname: 'HopefulPlayer', rating: 1400 },
  { id: 'p3', nickname: 'ChessFanatic', rating: 1620 },
];

const mockApprovedPlayers = [
  { id: 'a1', nickname: 'AcceptedPlayer', rating: 1700 },
  { id: 'a2', nickname: 'ReadyToPlay', rating: 1810 },
];

const mockChatMessages = [
  { id: 'm1', sender: 'SimulMaster', text: 'Вітаю всіх у лоббі!', timestamp: Date.now() - 60000 },
  { id: 'm2', sender: 'AcceptedPlayer', text: 'Дякую за організацію!', timestamp: Date.now() - 45000 },
  { id: 'm3', sender: 'PlayerOne', text: 'Чекаю на підтвердження :)', timestamp: Date.now() - 30000 },
];

// Припускаємо, що ми отримуємо ID поточного користувача
const currentUserId = 'SimulMaster'; // ID організатора для тестування кнопок
// --- Кінець прикладу даних ---


function SimulLobbyPage() {

  
  // --- Стейт (приклади, ви будете керувати ними через props або Redux/Context) ---
  const [sessionDetails, setSessionDetails] = useState(mockSessionDetails);
  const [pendingPlayers, setPendingPlayers] = useState(mockPendingPlayers);
  const [approvedPlayers, setApprovedPlayers] = useState(mockApprovedPlayers);
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null); // Для автопрокрутки чату

  // Визначаємо, чи є поточний користувач організатором
  // У реальному додатку ви б порівнювали ID поточного користувача з ID організатора сесії
  const currentUserIsOrganizer = sessionDetails.organizerNickname === currentUserId;

  // Функції-обробники (мають викликати логіку оновлення даних на бекенді/в стейті)
  const handleApprovePlayer = (playerId) => {
    console.log(`Approving player: ${playerId}`);
    // Логіка: Перемістити гравця з pending в approved
    const playerToApprove = pendingPlayers.find(p => p.id === playerId);
    if (playerToApprove) {
      setApprovedPlayers([...approvedPlayers, playerToApprove]);
      setPendingPlayers(pendingPlayers.filter(p => p.id !== playerId));
    }
     // + відправити запит на сервер
  };

  const handleRemovePlayer = (playerId) => {
    console.log(`Removing player: ${playerId}`);
    // Логіка: Видалити гравця з approved (або перемістити назад в pending?)
    const playerToRemove = approvedPlayers.find(p => p.id === playerId);
    if (playerToRemove) {
      setPendingPlayers(prev => [...prev, playerToRemove]);
      setApprovedPlayers(prev => prev.filter(p => p.id !== playerId));
    }
     // + відправити запит на сервер
  };

  const handleSendMessage = (e) => {
    e.preventDefault(); // Запобігти перезавантаженню, якщо використовується форма
    if (chatInput.trim()) {
      console.log(`Sending message: ${chatInput}`);
      const newMessage = {
        id: `m${Date.now()}`, // Простий генератор ID
        sender: currentUserId, // Ім'я поточного користувача
        text: chatInput.trim(),
        timestamp: Date.now(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
      // + відправити повідомлення на сервер (через WebSocket?)
    }
  };

  // Автопрокрутка чату до останнього повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);


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
                  pendingPlayers.map(player => (
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
                    approvedPlayers.map(player => (
                      <li key={player.id} className="player-item">
                        <div className="player-info">
                          <span className="player-nickname">{player.nickname}</span>
                          <span className="player-rating">({player.rating})</span>
                        </div>
                        {currentUserIsOrganizer && player.nickname !== sessionDetails.organizerNickname && ( // Організатора не можна видалити
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
           {/* Кнопка "Почати сеанс" (для організатора) */}
           {currentUserIsOrganizer && approvedPlayers.length > 0 && (
              <button className="start-simul-button action-button primary">
                  Почати сеанс
              </button>
           )}
        </section>

        {/* Секція інформації та чату */}
        <section className="info-chat-section">
          {/* Блок інформації про сеанс */}
          <div className="session-info-box">
            <h3><FaInfoCircle /> Інформація про сеанс</h3>
            <div className="info-item">
              <FaUserCircle className="info-icon" />
              <span><strong>Організатор:</strong> {sessionDetails.organizerNickname} ({sessionDetails.organizerRating})</span>
            </div>
            <div className="info-item">
              <FaChessBoard className="info-icon" />
              <span><strong>Режим:</strong> {sessionDetails.mode}</span>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <span><strong>Контроль часу:</strong> {sessionDetails.timeControl}</span>
            </div>
            <div className="info-item">
              <FaPlusCircle className="info-icon" />
              <span><strong>Додатковий час (орг.):</strong> {sessionDetails.extraTime}</span>
            </div>
          </div>

          {/* Блок чату */}
          <div className="chat-box">
            <h3>Чат лоббі</h3>
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`message ${msg.sender === currentUserId ? 'my-message' : ''}`}>
                  <span className="message-sender">{msg.sender === currentUserId ? 'Ви' : msg.sender}:</span>
                  <p className="message-text">{msg.text}</p>
                  {/* Можна додати timestamp */}
                  {/* <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Елемент для автопрокрутки */}
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