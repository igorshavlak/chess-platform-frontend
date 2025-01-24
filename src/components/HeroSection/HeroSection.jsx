// src/components/HeroSection/HeroSection.jsx
import React from 'react';
import './HeroSection.css';

function HeroSection({ onStartGame }) {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Ласкаво просимо до ChessApp</h1>
        <p>Ваше місце для захоплюючих шахових змагань.</p>
        <button className="hero-button" onClick={onStartGame} aria-label="Почати гру">
          Почати гру
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
