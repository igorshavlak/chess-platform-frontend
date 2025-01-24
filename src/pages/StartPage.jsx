// src/components/StartPage/StartPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection/HeroSection.jsx';
import GameModal from '../components/GameModal/GameModal.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import './StartPage.css';

function StartPage() {
  const navigate = useNavigate();

  // Стан для модального вікна
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Стан для вибору параметрів гри
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [isRated, setIsRated] = useState(false);

  // Функція для відкриття модального вікна
  const openModal = () => {
    setModalIsOpen(true);
  };

  // Функція для закриття модального вікна
  const closeModal = () => {
    setModalIsOpen(false);
    // Скидання вибору при закритті
    setSelectedMode(null);
    setSelectedTime(null);
    setSelectedOpponent(null);
    setIsRated(false);
  };

  const startNewGame = () => {
    if (!selectedMode) {
      alert("Будь ласка, виберіть режим гри.");
      return;
    }

    const modesRequiringTime = ['blitz', 'bullet', 'custom'];
    if (modesRequiringTime.includes(selectedMode) && !selectedTime) {
      alert("Будь ласка, виберіть час для гри.");
      return;
    }

    if (!selectedOpponent) {
      alert("Будь ласка, виберіть опонента.");
      return;
    }

    // Перенаправлення до гри з обраними параметрами
    navigate('/game', {
      state: {
        mode: selectedMode,
        time: selectedTime,
        opponent: selectedOpponent,
        isRated: isRated
      }
    });

    // Закриття модального вікна після старту гри
    closeModal();
  };

  // Функція для відображення опцій часу
  const renderTimeOptions = () => {
    if (!selectedMode) return null;

    const timeOptions = {
      blitz: ['3+1', '3+2', '3'],
      bullet: ['1+0', '2+1', '3+0'],
      classic: [], // Не потребує вибору часу
      custom: ['Кастомний час']
    };

    if (timeOptions[selectedMode].length === 0) return null;

    return (
      <div className="time-selection">
        <h3>Виберіть час:</h3>
        <div className="time-options">
          {timeOptions[selectedMode].map((time, index) => (
            <label key={index} className="time-option">
              <input
                type="radio"
                name="time"
                value={time}
                checked={selectedTime === time}
                onChange={() => setSelectedTime(time)}
              />
              {time}
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="start-page">
      {/* Декоративні SVG елементи */}

      {/* Додавання Sidebar */}
      <Sidebar />

      {/* Героїчний розділ */}
      <HeroSection onStartGame={openModal} />

      <div className="content-section">
        <div className="start-page-sections">
          {/* Інші секції можуть бути тут, якщо потрібно */}
        </div>
      </div>

      {/* Модальне вікно */}
      <GameModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        selectedOpponent={selectedOpponent}
        setSelectedOpponent={setSelectedOpponent}
        isRated={isRated}
        setIsRated={setIsRated}
        startNewGame={startNewGame}
        renderTimeOptions={renderTimeOptions}
      />
    </div>
  );
}

export default StartPage;
