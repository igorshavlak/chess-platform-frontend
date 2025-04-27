// src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Sidebar from '../components/Sidebar/Sidebar';
import ProfileHeader from '../components/UserProfile/ProfileHeader';
import ProfileTabs from '../components/UserProfile/ProfileTabs';
import StatsContent from '../components/UserProfile/StatsContent';
import GamesContent from '../components/UserProfile/GamesContent';
import AchievementsContent from '../components/UserProfile/AchievementsContent';
import FriendsContent from '../components/UserProfile/FriendsContent';
import ClubsContent from '../components/UserProfile/ClubsContent';
import './UserProfilePage.css';

function UserProfilePage() {
  const { userId } = useParams();
  const { keycloak } = useKeycloak();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [friendsData, setFriendsData] = useState([]);
  const [clubsData, setClubsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [friendsFilter, setFriendsFilter] = useState('all');

  const currentUser = keycloak.tokenParsed
    ? {
        id: keycloak.tokenParsed.sub,
        username: keycloak.tokenParsed.preferred_username,
        avatar: keycloak.tokenParsed.picture || null,
      }
    : null;
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      // В реальному проекті тут був би API-запит
      setTimeout(() => {
        // Mock користувача
        const mockUserData = {
          id: profileUserId,
          username: isOwnProfile ? currentUser?.username : 'ШахматистПро',
          avatar: isOwnProfile ? currentUser?.avatar : null,
          rating: 1842,
          gamesPlayed: 387,
          wins: 186,
          losses: 146,
          draws: 55,
          achievements: [
            { id: 1, name: 'Перша перемога', icon: '🏆', date: '2023-05-15' },
            { id: 2, name: '5 перемог поспіль', icon: '🔥', date: '2023-07-22' },
            { id: 3, name: 'Рейтинг 1800+', icon: '⭐', date: '2023-10-05' },
            { id: 4, name: '100 партій', icon: '🎮', date: '2023-08-30' },
            { id: 5, name: 'Турнірний переможець', icon: '🥇', date: '2024-01-12' }
          ],
          recentGames: [
            { id: 'game1', opponent: 'Гросмейстер42', result: 'win', date: '2024-03-15', rating_change: '+8' },
            { id: 'game2', opponent: 'ЧемпіонЛьвова', result: 'loss', date: '2024-03-14', rating_change: '-5' },
            { id: 'game3', opponent: 'ШаховийКороль', result: 'draw', date: '2024-03-12', rating_change: '0' },
            { id: 'game4', opponent: 'Новачок123', result: 'win', date: '2024-03-10', rating_change: '+4' },
            { id: 'game5', opponent: 'МайстерМат', result: 'win', date: '2024-03-08', rating_change: '+7' }
          ],
          memberSince: '2023-04-10',
          lastOnline: '2024-03-17',
          friends: 24,
          favoriteOpenings: [
            { name: 'Сицилійський захист', games: 78, winRate: 62 },
            { name: 'Дебют ферзевих пішаків', games: 45, winRate: 55 },
            { name: 'Захист Каро-Канн', games: 37, winRate: 48 }
          ],
          ratingHistory: [
            { month: 'Вер', rating: 1650 },
            { month: 'Жов', rating: 1720 },
            { month: 'Лис', rating: 1695 },
            { month: 'Гру', rating: 1750 },
            { month: 'Січ', rating: 1780 },
            { month: 'Лют', rating: 1815 },
            { month: 'Бер', rating: 1842 }
          ]
        };
        // Mock друзі
        const mockFriends = [
          { id: 1, username: 'ChessMaster2000', rating: 2156, online: true, lastSeen: 'зараз', avatar: null },
          { id: 2, username: 'КороляваПартія', rating: 1932, online: false, lastSeen: '5 годин тому', avatar: null },
          { id: 3, username: 'ГросмейстерЛьвів', rating: 2250, online: true, lastSeen: 'зараз', avatar: null },
          { id: 4, username: 'ЧемпіонКиєва', rating: 2045, online: false, lastSeen: '2 дні тому', avatar: null },
          { id: 5, username: 'ШаховаЛегенда', rating: 1876, online: false, lastSeen: '1 тиждень тому', avatar: null },
          { id: 6, username: 'ФерзевийГамбіт', rating: 1756, online: true, lastSeen: 'зараз', avatar: null },
          { id: 7, username: 'ТактикМайстер', rating: 1920, online: false, lastSeen: '3 години тому', avatar: null },
          { id: 8, username: 'ДебютКороля', rating: 1845, online: true, lastSeen: 'зараз', avatar: null }
        ];
        // Mock клуби
        const mockClubs = [
          { id: 1, name: 'Київський шаховий клуб', members: 156, rating: 1950, role: 'Учасник', avatar: null },
          { id: 2, name: 'Львівські шахісти', members: 78, rating: 1820, role: 'Адміністратор', avatar: null },
          { id: 3, name: 'Українська шахова ліга', members: 412, rating: 2100, role: 'Учасник', avatar: null },
          { id: 4, name: 'Турнірні гравці', members: 64, rating: 1930, role: 'Модератор', avatar: null }
        ];
        setUserData(mockUserData);
        setFriendsData(mockFriends);
        setClubsData(mockClubs);
        setLoading(false);
      }, 1000);
    };
    if (keycloak.authenticated) fetchUserData();
  }, [keycloak.authenticated, profileUserId, isOwnProfile, currentUser]);

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
  if (!keycloak.authenticated) {
    return (
      <div className="page-container">
        <Sidebar />
        <main className="content-area">
          <div className="auth-required">
            <h2>Необхідна авторизація</h2>
            <p>Для перегляду профілю необхідно увійти в систему.</p>
            <button onClick={() => keycloak.login()} className="login-button">Увійти</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Sidebar />
      <main className="content-area">
        <div className="profile-container">
          <ProfileHeader userData={userData} isOwnProfile={isOwnProfile} />
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="profile-content">
            {activeTab === 'stats' && <StatsContent userData={userData} />}
            {activeTab === 'games' && <GamesContent recentGames={userData.recentGames} />}
            {activeTab === 'achievements' && <AchievementsContent achievements={userData.achievements} />}
            {activeTab === 'friends' && (
              <FriendsContent
                friendsData={friendsData}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                friendsFilter={friendsFilter}
                setFriendsFilter={setFriendsFilter}
              />
            )}
            {activeTab === 'clubs' && (
              <ClubsContent
                clubsData={clubsData}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfilePage;
