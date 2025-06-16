// src/components/UserProfile/StatsContent.jsx
import React, { useState } from 'react';
import { FaChartLine, FaChess, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css';

// Компонент для лінійного графіка
const RatingLineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="no-data">Немає даних для відображення</div>;
    }

    const width = 500;
    const height = 150;
    const padding = 30;

    const ratings = data.map(d => d.rating);
    const minRating = Math.min(...ratings) - 50;
    const maxRating = Math.max(...ratings) + 50;

    const getX = (index) => (index / (data.length - 1)) * (width - 2 * padding) + padding;
    const getY = (rating) => height - ((rating - minRating) / (maxRating - minRating)) * (height - 2 * padding) - padding;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.rating)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="rating-line-chart">
            {/* Горизонтальні лінії сітки */}
            {[...Array(5)].map((_, i) => (
                <line
                    key={i}
                    className="chart-grid-line"
                    x1={padding}
                    y1={height - padding - (i * (height - 2 * padding) / 4)}
                    x2={width - padding}
                    y2={height - padding - (i * (height - 2 * padding) / 4)}
                />
            ))}

            {/* Лінія рейтингу */}
            <path d={linePath} className="chart-line-path" fill="none" />

            {/* Точки на графіку */}
            {data.map((d, i) => (
                <circle
                    key={i}
                    cx={getX(i)}
                    cy={getY(d.rating)}
                    r="4"
                    className="chart-point"
                    data-rating={d.rating}
                />
            ))}
        </svg>
    );
};


const StatsContent = ({ userData }) => {
    const [activeMode, setActiveMode] = useState('blitz');

    if (!userData || !userData.stats) return null;

    const stats = userData.stats[activeMode];
    const { rating, highestRating, gamesPlayed, wins, losses, draws, winStreak, lossStreak, ratingHistory } = stats;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

    return (
        <div className="stats-container">
            {/* Перемикач режимів гри */}
            <div className="stats-mode-selector">
                <button onClick={() => setActiveMode('classic')} className={`mode-btn ${activeMode === 'classic' ? 'active' : ''}`}>Класика</button>
                <button onClick={() => setActiveMode('blitz')} className={`mode-btn ${activeMode === 'blitz' ? 'active' : ''}`}>Бліц</button>
                <button onClick={() => setActiveMode('bullet')} className={`mode-btn ${activeMode === 'bullet' ? 'active' : ''}`}>Куля</button>
            </div>

            <div className="stats-grid">
                {/* Картка з графіком рейтингу */}
                <div className="stats-card main-chart-card">
                    <div className="stats-header">
                        <FaChartLine className="stats-icon" />
                        <h3>Історія рейтингу ({rating})</h3>
                    </div>
                    <RatingLineChart data={ratingHistory} />
                </div>

                {/* Картка загальної статистики партій */}
                <div className="stats-card">
                    <div className="stats-header">
                        <FaChess className="stats-icon" />
                        <h3>Статистика партій</h3>
                    </div>
                    <div className="game-stats-content">
                        <p className="total-games">{gamesPlayed} <span>зіграно</span></p>
                        <div className="win-rate-bar">
                            <div className="win-rate-fill" style={{ width: `${winRate}%` }}></div>
                            <span className="win-rate-text">{winRate}% перемог</span>
                        </div>
                        <ul className="game-breakdown">
                            <li><span className="color-dot win"></span>Перемоги: <strong>{wins}</strong></li>
                            <li><span className="color-dot draw"></span>Нічиї: <strong>{draws}</strong></li>
                            <li><span className="color-dot loss"></span>Поразки: <strong>{losses}</strong></li>
                        </ul>
                    </div>
                </div>

                {/* Додаткові картки */}
                <div className="stats-card small-card">
                    <div className="stats-header">
                        <FaTrophy className="stats-icon" />
                        <h3>Найвищий рейтинг</h3>
                    </div>
                    <p className="highlight-stat">{highestRating}</p>
                </div>

                <div className="stats-card small-card">
                    <div className="stats-header">
                        <FaArrowUp className="stats-icon" />
                        <FaArrowDown className="stats-icon" />
                        <h3>Серії</h3>
                    </div>
                    <div className="streaks-info">
                        <p>Перемог: <strong className="win-streak">{winStreak}</strong></p>
                        <p>Поразок: <strong className="loss-streak">{lossStreak}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsContent;