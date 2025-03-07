// src/components/GameModal/GameModal.jsx
import React from 'react';
import Modal from 'react-modal';
import { FaChess, FaChessKnight, FaHistory, FaCog, FaUsers } from 'react-icons/fa'; // Додано FaUsers для випадкового гравця
import './GameModal.css';

function GameModal({
  isOpen,
  onRequestClose,
  selectedMode,
  setSelectedMode,
  selectedTime,
  setSelectedTime,
  selectedOpponent,
  setSelectedOpponent,
  isRated,
  setIsRated,
  startNewGame,
  renderTimeOptions,
  isLoading // Додано проп для стану завантаження
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Вибір параметрів гри"
      className="game-modal"
      overlayClassName="game-modal-overlay"
    >
      <h2>Виберіть параметри гри</h2>
      <button className="close-button" onClick={onRequestClose} aria-label="Закрити">&times;</button>
      
          {/* Секція вибору режиму гри */}
          <div className="modal-section">
        <h3>Виберіть режим гри</h3>
        <div className="cards-container">
          <div
            className={`card ${selectedMode === 'classic' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('classic')}
          >
            <FaChess className="card-icon" />
            <h4>Класична гра</h4>
            <p>Традиційний режим гри з необмеженим часом.</p>
          </div>
          <div
            className={`card ${selectedMode === 'blitz' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('blitz')}
          >
            <FaChessKnight className="card-icon" />
            <h4>Блиц</h4>
            <p>Швидкі ходи з обмеженим часом.</p>
          </div>
          <div
            className={`card ${selectedMode === 'bullet' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('bullet')}
          >
            <FaHistory className="card-icon" />
            <h4>Bullet</h4>
            <p>Найшвидший режим гри з дуже обмеженим часом.</p>
          </div>
          <div
            className={`card ${selectedMode === 'custom' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('custom')}
          >
            <FaCog className="card-icon" />
            <h4>Кастомний</h4>
            <p>Налаштуйте параметри гри за своїм бажанням.</p>
          </div>
        </div>
        {renderTimeOptions()}
      </div>

      {/* Секція вибору опонента */}
      <div className="modal-section">
        <h3>Виберіть опонента</h3>
        <div className="cards-container opponent-selection">
          <div
            className={`card ${selectedOpponent === 'ai' ? 'selected' : ''}`}
            onClick={() => setSelectedOpponent('ai')}
          >
            <FaChess className="card-icon" />
            <h4>Грати проти AI</h4>
            <p>Змагайтеся зі штучним інтелектом різних рівнів складності.</p>
          </div>
          <div
            className={`card ${selectedOpponent === 'player' ? 'selected' : ''}`}
            onClick={() => setSelectedOpponent('player')}
          >
            <FaChessKnight className="card-icon" />
            <h4>Грати з другом</h4>
            <p>Змагайтеся з іншим гравцем на тому ж пристрої.</p>
          </div>
          <div
            className={`card ${selectedOpponent === 'random' ? 'selected' : ''}`}
            onClick={() => setSelectedOpponent('random')}
          >
            <FaUsers className="card-icon" />
            <h4>Випадковий гравець</h4>
            <p>Знайдіть випадкового онлайн опонента.</p>
          </div>
        </div>
      </div>
      
      {/* Вибір рейтингу гри */}
      <div className="modal-section">
        <h3>Рейтинговий режим</h3>
        <label className="rating-option">
          <input
            type="checkbox"
            checked={isRated}
            onChange={() => setIsRated(!isRated)}
          />
          Це рейтинговий матч
        </label>
      </div>

      {/* Індикатор завантаження */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Пошук опонента...</p>
        </div>
      )}

      {/* Кнопка старту гри */}
      <div className="modal-actions">
        <button className="start-game-button" onClick={startNewGame} disabled={isLoading}>
          Старт
        </button>
      </div>
    </Modal>
  );
}

export default GameModal;
