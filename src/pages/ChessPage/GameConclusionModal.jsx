import React from 'react';
import { Link } from 'react-router-dom';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    flexDirection: 'column',
    gap: '15px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
  },
  closeButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
  }
};

export default function GameConclusionModal({ isOpen, onClose, message, gameId, moves }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.message}>{message}</div>
        <div style={modalStyles.buttonContainer}>
          <Link
            to={{
              pathname: `/analyze/${gameId}`,
              state: { moves } // Передаємо список ходів у state
            }}
            style={{ ...modalStyles.button, ...modalStyles.analyzeButton }}
            onClick={onClose}
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