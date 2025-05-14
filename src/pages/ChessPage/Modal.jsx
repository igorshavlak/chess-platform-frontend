import React from 'react';
import clsx from 'clsx';
import './Modal.css';

const Modal = ({ title, message, outcome, onClose }) => (
  <div className="modal-overlay">
    <div className={clsx('modal-content', {
      'modal-win': outcome === 'win',
      'modal-loss': outcome === 'loss',
      'modal-draw': outcome === 'draw',
    })}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onClose}>Закрити</button>
    </div>
  </div>
);

export default Modal;