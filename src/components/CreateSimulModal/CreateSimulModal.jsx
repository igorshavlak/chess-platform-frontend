// src/components/CreateSimulModal/CreateSimulModal.js
import React, { useState } from 'react';
import './CreateSimulModal.css'; // Стилі для модалки

function CreateSimulModal({ isOpen, onClose, onCreateSimul }) {
  const [playerColor, setPlayerColor] = useState('random'); // 'white', 'black', 'random'
  const [initialTime, setInitialTime] = useState(10); // in minutes, default 10
  const [increment, setIncrement] = useState(0); // in seconds, default 0
  const [organizerExtraTime, setOrganizerExtraTime] = useState(0); // in seconds, -60 to +60
  const [minRating, setMinRating] = useState(''); // '' for no restriction, otherwise number
  const [approxStartTime, setApproxStartTime] = useState(''); // Datetime string

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Валідація та збір даних
    const simulData = {
      playerColor: playerColor,
      timeControl: `${initialTime}+${increment}`,
      gameMode: 'SIMUL',
      initialTime: parseInt(initialTime, 10),
      increment: parseInt(increment, 10),
      organizerExtraTime: parseInt(organizerExtraTime, 10),
      minRating: minRating === '' ? null : parseInt(minRating, 10),
      startTime: approxStartTime,
    };
    console.log("Створення сеансу з даними:", simulData);
    // Передаємо дані до батьківського компонента
    onCreateSimul(simulData);
    // Закриваємо модалку
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Організувати сеанс одночасної гри</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playerColor">Колір гравця:</label>
            <select
              id="playerColor"
              value={playerColor}
              onChange={(e) => setPlayerColor(e.target.value)}
              required
            >
              <option value="random">Рандом</option>
              <option value="white">Білий</option>
              <option value="black">Чорний</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="initialTime">Початковий час (хв):</label>
            <input
              type="number"
              id="initialTime"
              value={initialTime}
              onChange={(e) => setInitialTime(e.target.value)}
              min="5"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="increment">Приріст часу (сек):</label>
            <input
              type="number"
              id="increment"
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              min="0"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="organizerExtraTime">Додатковий час організатора (сек):</label>
            <input
              type="number"
              id="organizerExtraTime"
              value={organizerExtraTime}
              onChange={(e) => setOrganizerExtraTime(e.target.value)}
              min="-60"
              max="60"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="minRating">Мінімальний рейтинг гравця:</label>
            <input
              type="number"
              id="minRating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              min="0" // Можна встановити більш реалістичний мінімум, наприклад, 100
              max="2600" // Вказаний максимум
              placeholder="Без обмежень"
            />
          </div>

          <div className="form-group">
            <label htmlFor="approxStartTime">Приблизний час початку:</label>
            <input
              type="datetime-local"
              id="approxStartTime"
              value={approxStartTime}
              onChange={(e) => setApproxStartTime(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="button primary">Створити запит</button>
            <button type="button" className="button secondary outline" onClick={onClose}>Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSimulModal;