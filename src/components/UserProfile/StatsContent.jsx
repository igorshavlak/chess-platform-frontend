// src/components/UserProfile/StatsContent.jsx
import React from 'react';
import { FaChartLine, FaChessKnight } from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css';

const StatsContent = ({ userData }) => {
  if (!userData) return null;
  const { rating, gamesPlayed, wins, losses, draws, favoriteOpenings, ratingHistory } = userData;

  return (
    <div className="stats-container">
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-header">
            <FaChartLine className="stats-icon" />
            <h3>Рейтинг</h3>
          </div>
          <div className="rating-value">{rating}</div>
          <div className="rating-chart">
            {ratingHistory.map((data, i) => (
              <div key={i} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max(0, (data.rating - 1600) / 5)}px` }}
                ></div>
                <span className="chart-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-header">
            <FaChessKnight className="stats-icon" />
            <h3>Партії</h3>
          </div>
          <div className="games-stats">
            <div className="games-played">
              <span className="games-number">{gamesPlayed}</span>
              <span className="games-label">зіграно</span>
            </div>
            <div className="games-chart">
              <div className="chart-pie">
                <div
                  className="pie-segment wins"
                  style={{ '--percentage': `${(wins / gamesPlayed) * 100}%` }}
                ></div>
                <div
                  className="pie-segment draws"
                  style={{ '--percentage': `${(draws / gamesPlayed) * 100}%` }}
                ></div>
                <div
                  className="pie-segment losses"
                  style={{ '--percentage': `${(losses / gamesPlayed) * 100}%` }}
                ></div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color wins"></span>
                  <span className="legend-label">Перемоги: {wins}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color draws"></span>
                  <span className="legend-label">Нічиї: {draws}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color losses"></span>
                  <span className="legend-label">Поразки: {losses}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-header">
            <FaChessKnight className="stats-icon" />
            <h3>Улюблені дебюти</h3>
          </div>
          <div className="openings-list">
            {favoriteOpenings.map((o, i) => (
              <div key={i} className="opening-item">
                <div className="opening-name">{o.name}</div>
                <div className="opening-stats">
                  <span className="opening-games">{o.games} партій</span>
                  <div className="opening-winrate">
                    <div className="winrate-bar" style={{ width: `${o.winRate}%` }}></div>
                    <span className="winrate-text">{o.winRate}% перемог</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsContent;
