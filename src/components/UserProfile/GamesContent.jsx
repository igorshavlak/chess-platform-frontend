import React from 'react';
import { FaHistory, FaCalendarAlt } from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css'

const GamesContent = ({ recentGames }) => (
  <div className="games-history">
    <h3><FaHistory /> Останні партії</h3>
    <div className="games-list">
      {recentGames.map(g => (
        <div key={g.id} className={`game-card ${g.result}`}>
          <div className="game-result-indicator"></div>
          <div className="game-details">
            <div className="game-opponent"><strong>Суперник:</strong> {g.opponent}</div>
            <div className="game-date"><FaCalendarAlt /> {g.date}</div>
          </div>
          <div className="game-result-info">
            <div className={`result-badge ${g.result}`}>{g.result==='win'?'Перемога':g.result==='loss'?'Поразка':'Нічия'}</div>
            <div className={`rating-change ${g.rating_change.startsWith('+')?'positive':g.rating_change.startsWith('-')?'negative':'neutral'}`}>{g.rating_change}</div>
          </div>
          <button className="view-game-btn">Переглянути партію</button>
        </div>
      ))}
    </div>
    <button className="load-more-btn">Завантажити більше партій</button>
  </div>
);
export default GamesContent;