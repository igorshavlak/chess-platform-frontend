import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Sidebar from '../../components/Sidebar/Sidebar';
import ProfileHeader from '../../components/UserProfile/ProfileHeader';
import ProfileTabs from '../../components/UserProfile/ProfileTabs';
import StatsContent from '../../components/UserProfile/StatsContent';
import GamesContent from '../../components/UserProfile/GamesContent';
import AchievementsContent from '../../components/UserProfile/AchievementsContent';
import FriendsContent from '../../components/UserProfile/FriendsContent';
import ClubsContent from '../../components/UserProfile/ClubsContent';



import * as friendService from './friendService';
import './UserProfilePage.css';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { keycloak } = useKeycloak();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [friendsData, setFriendsData] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [clubsData, setClubsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [friendsFilter, setFriendsFilter] = useState('all');
  const [searchNickname, setSearchNickname] = useState('');
const [searchResults, setSearchResults] = useState([]);

  const currentUser = keycloak.tokenParsed && {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    avatar: keycloak.tokenParsed.picture || null,
  };
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    if (!keycloak.authenticated) return;
    setLoading(false);
    setTimeout(() => {
      const mockUserData = {
        id: profileUserId,
        username: isOwnProfile ? currentUser.username : 'ШахматистПро',
        avatar: isOwnProfile ? currentUser.avatar : null,
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
      setUserData(mockUserData);


      const mockClubs = [
        { id: 1, name: 'Київський шаховий клуб', members: 156, rating: 1950, role: 'Учасник', avatar: null },
        { id: 2, name: 'Львівські шахісти', members: 78, rating: 1820, role: 'Адміністратор', avatar: null },
        { id: 3, name: 'Українська шахова ліга', members: 412, rating: 2100, role: 'Учасник', avatar: null },
        { id: 4, name: 'Турнірні гравці', members: 64, rating: 1930, role: 'Модератор', avatar: null }
      ];
      setClubsData(mockClubs);

      setLoading(false);
    }, 1000);
  }, [keycloak.authenticated, profileUserId, isOwnProfile, currentUser]);

  useEffect(() => {
    if (!keycloak.authenticated) return;
    setLoading(true);

    friendService.listFriends(profileUserId)
      .then(data => setFriendsData(data))
      .finally(() => setLoading(false));

    if (isOwnProfile) {
      friendService.listRequests(profileUserId)
        .then(data => setFriendRequests(data));
    }
  }, [keycloak.authenticated, profileUserId, isOwnProfile]);



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
            <button onClick={() => keycloak.login()} className="login-button">
              Увійти
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleSearchUsers = () => {
    if (!searchNickname.trim()) return;
    friendService.searchUsers(searchNickname.trim(), currentUser.id)
      .then(data => setSearchResults(data));
  };

  const handleAccept = id => {
    friendService.acceptRequest(id).then(() =>
      setFriendRequests(reqs => reqs.filter(r => r.id !== id))
    );
  };
  const handleReject = id => {
    friendService.rejectRequest(id).then(() =>
      setFriendRequests(reqs => reqs.filter(r => r.id !== id))
    );
  };
  const handleAddFriend = id => {
    console.log(id)
    friendService.sendRequest(currentUser.id, id);
  };
  const handleRemoveFriend = id => {
    friendService.removeFriend(profileUserId, id).then(() =>
      setFriendsData(fr => fr.filter(f => f.id !== id))
    );
  };

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
                isOwnProfile={isOwnProfile}
                friendsData={friendsData}
                friendRequests={friendRequests}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                friendsFilter={friendsFilter}
                setFriendsFilter={setFriendsFilter}

                searchNickname={searchNickname}
                setSearchNickname={setSearchNickname}
                searchResults={searchResults}
                onSearchUsers={handleSearchUsers}

                onAcceptRequest={handleAccept}
                onRejectRequest={handleReject}
                onAddFriend={handleAddFriend}
                onRemoveFriend={handleRemoveFriend}
              />
            )}
            {activeTab === 'clubs' && (
              <ClubsContent clubsData={clubsData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
