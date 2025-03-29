import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Sidebar from '../components/Sidebar/Sidebar';
import { 
  FaTrophy, 
  FaChessKnight, 
  FaChartLine, 
  FaHistory, 
  FaMedal, 
  FaCalendarAlt, 
  FaUserFriends
} from 'react-icons/fa';
import './UserProfilePage.css';

function UserProfilePage() {
  const { userId } = useParams();
  const { keycloak } = useKeycloak();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  
  // Извлечение информации о текущем пользователе
  const currentUser = keycloak.tokenParsed
    ? {
        id: keycloak.tokenParsed.sub,
        username: keycloak.tokenParsed.preferred_username,
        email: keycloak.tokenParsed.email,
        avatar: keycloak.tokenParsed.picture || null,
      }
    : null;

  // Проверка, смотрит ли пользователь свой профиль или чужой
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  // Эмуляция загрузки данных пользователя с сервера
  useEffect(() => {
    const fetchUserData = async () => {
      //setLoading(false);
      
      // В реальном проекте здесь был бы API-запрос
      setTimeout(() => {
        // Симуляция данных с сервера
        const mockUserData = {
          id: profileUserId,
          username: isOwnProfile ? currentUser?.username : "ШахматистПро",
          avatar: isOwnProfile ? currentUser?.avatar : null,
          rating: 1842,
          gamesPlayed: 387,
          wins: 186,
          losses: 146,
          draws: 55,
          achievements: [
            { id: 1, name: "Перша перемога", icon: "🏆", date: "2023-05-15" },
            { id: 2, name: "5 перемог поспіль", icon: "🔥", date: "2023-07-22" },
            { id: 3, name: "Рейтинг 1800+", icon: "⭐", date: "2023-10-05" },
            { id: 4, name: "100 партій", icon: "🎮", date: "2023-08-30" },
            { id: 5, name: "Турнірний переможець", icon: "🥇", date: "2024-01-12" }
          ],
          recentGames: [
            { id: "game1", opponent: "Гросмейстер42", result: "win", date: "2024-03-15", rating_change: "+8" },
            { id: "game2", opponent: "ЧемпіонЛьвова", result: "loss", date: "2024-03-14", rating_change: "-5" },
            { id: "game3", opponent: "ШаховийКороль", result: "draw", date: "2024-03-12", rating_change: "0" },
            { id: "game4", opponent: "Новачок123", result: "win", date: "2024-03-10", rating_change: "+4" },
            { id: "game5", opponent: "МайстерМат", result: "win", date: "2024-03-08", rating_change: "+7" }
          ],
          memberSince: "2023-04-10",
          lastOnline: "2024-03-17",
          friends: 24,
          favoriteOpenings: [
            { name: "Сицилійський захист", games: 78, winRate: 62 },
            { name: "Дебют ферзевих пішаків", games: 45, winRate: 55 },
            { name: "Захист Каро-Канн", games: 37, winRate: 48 }
          ],
          ratingHistory: [
            { month: "Вер", rating: 1650 },
            { month: "Жов", rating: 1720 },
            { month: "Лис", rating: 1695 },
            { month: "Гру", rating: 1750 },
            { month: "Січ", rating: 1780 },
            { month: "Лют", rating: 1815 },
            { month: "Бер", rating: 1842 }
          ]
        };
        
        setUserData(mockUserData);
        setLoading(false);
      }, 1000);
    };
    
    if (keycloak.authenticated) {
      fetchUserData();
    }
  }, [keycloak.authenticated, profileUserId, isOwnProfile, currentUser]);

  // Рендер загрузки
  if (loading) {
    return (
      <div className="page-container">
        <Sidebar />
        <main className="content-area">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Завантаження профілю...</p>
          </div>
        </main>
      </div>
    );
  }

  // Если пользователь не аутентифицирован
  if (!keycloak.authenticated) {
    return (
      <div className="page-container">
        <Sidebar />
        <main className="content-area">
          <div className="auth-required">
            <h2>Необхідна авторизація</h2>
            <p>Для перегляду профілю необхідно увійти в систему.</p>
            <button onClick={() => keycloak.login()} className="login-button">
              Увійти
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Рендер статистики
  const renderStats = () => (
    <div className="stats-container">
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-header">
            <FaChartLine className="stats-icon" />
            <h3>Рейтинг</h3>
          </div>
          <div className="rating-value">{userData.rating}</div>
          <div className="rating-chart">
            {userData.ratingHistory.map((data, index) => (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.max(0, (data.rating - 1600) / 5)}px`
                  }}
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
              <span className="games-number">{userData.gamesPlayed}</span>
              <span className="games-label">зіграно</span>
            </div>
            <div className="games-chart">
              <div className="chart-pie">
                <div className="pie-segment wins" style={{ '--percentage': `${(userData.wins / userData.gamesPlayed) * 100}%` }}></div>
                <div className="pie-segment draws" style={{ '--percentage': `${(userData.draws / userData.gamesPlayed) * 100}%` }}></div>
                <div className="pie-segment losses" style={{ '--percentage': `${(userData.losses / userData.gamesPlayed) * 100}%` }}></div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color wins"></span>
                  <span className="legend-label">Перемоги: {userData.wins}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color draws"></span>
                  <span className="legend-label">Нічиї: {userData.draws}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color losses"></span>
                  <span className="legend-label">Поразки: {userData.losses}</span>
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
            {userData.favoriteOpenings.map((opening, index) => (
              <div key={index} className="opening-item">
                <div className="opening-name">{opening.name}</div>
                <div className="opening-stats">
                  <span className="opening-games">{opening.games} партій</span>
                  <div className="opening-winrate">
                    <div className="winrate-bar" style={{ width: `${opening.winRate}%` }}></div>
                    <span className="winrate-text">{opening.winRate}% перемог</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Рендер истории игр
  const renderGames = () => (
    <div className="games-history">
      <h3><FaHistory /> Останні партії</h3>
      <div className="games-list">
        {userData.recentGames.map((game) => (
          <div key={game.id} className={`game-card ${game.result}`}>
            <div className="game-result-indicator"></div>
            <div className="game-details">
              <div className="game-opponent">
                <strong>Суперник:</strong> {game.opponent}
              </div>
              <div className="game-date">
                <FaCalendarAlt /> {game.date}
              </div>
            </div>
            <div className="game-result-info">
              <div className={`result-badge ${game.result}`}>
                {game.result === 'win' ? 'Перемога' : game.result === 'loss' ? 'Поразка' : 'Нічия'}
              </div>
              <div className={`rating-change ${game.rating_change.startsWith('+') ? 'positive' : game.rating_change.startsWith('-') ? 'negative' : 'neutral'}`}>
                {game.rating_change}
              </div>
            </div>
            <button className="view-game-btn">Переглянути партію</button>
          </div>
        ))}
      </div>
      <button className="load-more-btn">Завантажити більше партій</button>
    </div>
  );

  // Рендер достижений
  const renderAchievements = () => (
    <div className="achievements-container">
      <h3><FaTrophy /> Досягнення</h3>
      <div className="achievements-grid">
        {userData.achievements.map((achievement) => (
          <div key={achievement.id} className="achievement-card">
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-details">
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-date">{achievement.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Sidebar />
      <main className="content-area">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar-section">
              {userData.avatar ? (
                <img src={userData.avatar} alt="User Avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar default-avatar">
                  {userData.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-rating">
                <span className="rating-number">{userData.rating}</span>
                <span className="rating-label">ELO</span>
              </div>
            </div>
            
            <div className="profile-info">
              <h2 className="profile-username">{userData.username}</h2>
              <div className="profile-meta">
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span>На платформі з {userData.memberSince}</span>
                </div>
                <div className="meta-item">
                  <FaUserFriends className="meta-icon" />
                  <span>{userData.friends} друзів</span>
                </div>
              </div>
              {isOwnProfile ? (
                <button className="edit-profile-btn">Редагувати профіль</button>
              ) : (
                <div className="profile-actions">
                  <button className="add-friend-btn">Додати в друзі</button>
                  <button className="challenge-btn">Викликати на гру</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <FaChartLine /> Статистика
            </button>
            <button 
              className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
              onClick={() => setActiveTab('games')}
            >
              <FaHistory /> Історія партій
            </button>
            <button 
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              <FaMedal /> Досягнення
            </button>
          </div>
          
          <div className="profile-content">
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'games' && renderGames()}
            {activeTab === 'achievements' && renderAchievements()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfilePage;