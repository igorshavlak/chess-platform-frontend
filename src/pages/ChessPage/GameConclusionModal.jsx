// src/components/GameConclusionModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Прості стилі для прикладу. Ви можете використовувати CSS Modules, Styled Components тощо.
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Напівпрозорий чорний фон
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Переконайтеся, що модальне вікно поверх усього
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  message: {
    fontSize: '1.5em',
    marginBottom: '20px',
    color: '#333',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column', // Кнопки одна під одною
    gap: '15px', // Відстань між кнопками
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none', // Для Link
    display: 'block', // Для Link, щоб поводився як блок
  },
  analyzeButton: {
    backgroundColor: '#4CAF50', // Зелений колір
    color: 'white',
    border: 'none',
  },
  closeButton: {
    backgroundColor: '#f44336', // Червоний колір
    color: 'white',
    border: 'none',
  }
};

export default function GameConclusionModal({ isOpen, onClose, message, gameId }) {
  if (!isOpen) {
    return null; // Не рендеримо, якщо isOpen false
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}> {/* Закриття при кліку по оверлею */}
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}> {/* Зупиняємо спливання кліку, щоб не закривалось */}
        <div style={modalStyles.message}>{message}</div>
        <div style={modalStyles.buttonContainer}>
          {/* Приклад посилання на сторінку аналізу. Вам потрібно буде реалізувати цей маршрут */}
          <Link
            to={`/analyze/${gameId}`}
            style={{ ...modalStyles.button, ...modalStyles.analyzeButton }}
            onClick={onClose} // Закрити модальне вікно при переході
          >
            Аналізувати партію
          </Link>
          <button
            style={{ ...modalStyles.button, ...modalStyles.closeButton }}
            onClick={onClose}
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}