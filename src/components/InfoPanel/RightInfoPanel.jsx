// src/components/RightInfoPanel/RightInfoPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import './RightInfoPanel.css';
import {
  FaFlag,
  FaHandshake,
  FaStepBackward,
  FaStepForward,
  FaComments,
} from 'react-icons/fa';

function RightInfoPanel({
  moves,
  onResign,
  onOfferDraw,
  onMoveBackward,
  onMoveForward,
}) {
  // Проста логіка чату
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      sender: 'Me',
      text: newMessage,
      time: new Date(),
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  // Формат історії ходів
  const formattedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    formattedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteMove: moves[i],
      blackMove: moves[i + 1] || '',
    });
  }

  return (
    <div className="right-panel">
      {/* Історія ходів */}
      <div className="moves-section">
        <h3>Moves</h3>
        <div className="moves-list">
          <ol>
            {formattedMoves.map((m, idx) => (
              <li key={idx}>
                <span className="move-number">{m.moveNumber}.</span>
                <span className="white-move">{m.whiteMove}</span>
                <span className="black-move">{m.blackMove}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Кнопки (здатися, нічия, промотування) */}
      <div className="control-buttons">
        <button onClick={onResign} className="btn-resign">
          <FaFlag /> Resign
        </button>
        <button onClick={onOfferDraw} className="btn-offer-draw">
          <FaHandshake /> Offer Draw
        </button>
        <div className="move-navigation">
          <button onClick={onMoveBackward}>
            <FaStepBackward /> Back
          </button>
          <button onClick={onMoveForward}>
            Fwd <FaStepForward />
          </button>
        </div>
      </div>

      {/* Чат */}
      <div className="chat-section">
        <div className="chat-header">
          <FaComments />
          <span>Chat</span>
        </div>
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <div className="message-sender">{msg.sender}</div>
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default RightInfoPanel;
