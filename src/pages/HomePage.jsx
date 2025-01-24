// HomePage.jsx
import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import './HomePage.css'; // Создадим стили для HomePage

function HomePage() {
  return (
    <div className="home-page">
      <Sidebar />
      <div className="home-content">
        <h2>Добро пожаловать в ChessApp!</h2>
        <p>Выберите "Игра" в навигационной панели слева, чтобы начать игру.</p>
      </div>
    </div>
  );
}

export default HomePage;
