// src/components/UserProfile/FriendsContent.jsx
import React from 'react';
import { 
  FaSearch, 
  FaUserFriends, 
  FaLink, 
  FaFacebookF, 
  FaEnvelope, 
  FaChessKnight, 
  FaCommentDots, 
  FaUserTimes 
} from 'react-icons/fa';
import '../../pages/UserProfilePage.css';

const FriendsContent = ({ friendsData, searchTerm, setSearchTerm, friendsFilter, setFriendsFilter }) => {
  const filteredFriends = friendsData.filter(f => {
    const mS = f.username.toLowerCase().includes(searchTerm.toLowerCase());
    const mF = friendsFilter==='all'
      || (friendsFilter==='online' && f.online)
      || (friendsFilter==='offline' && !f.online);
    return mS && mF;
  });

  // Дії «Запросити друзів»
  const inviteActions = [
    { icon: <FaLink />,     label: 'Friend Link',   onClick: () => {/* копіювати посилання */} },
    { icon: <FaFacebookF />,label: 'Find Friends',  onClick: () => {/* пошук по FB */} },
    { icon: <FaEnvelope />, label: 'Email Invite',  onClick: () => {/* відкрити email */} },
    { icon: <FaLink />,     label: 'Challenge Link',onClick: () => {/* копіювати лінк на виклик */} },
  ];

  return (
    <div className="friends-container">
      {/* Секція запрошень */}
      <div className="invite-links">
        {inviteActions.map((a, idx) => (
          <div 
            key={idx} 
            className="invite-link-card" 
            onClick={a.onClick}
          >
            <div className="invite-icon">{a.icon}</div>
            <div className="invite-text">{a.label}</div>
          </div>
        ))}
      </div>

      <h3><FaUserFriends /> Друзі ({friendsData.length})</h3>
      <div className="filter-search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Пошук друзів..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          {['all','online','offline'].map(f => (
            <button
              key={f}
              className={`filter-btn ${friendsFilter===f?'active':''}`}
              onClick={() => setFriendsFilter(f)}
            >
              {f==='all' ? 'Всі' : f==='online' ? 'Онлайн' : 'Офлайн'}
            </button>
          ))}
        </div>
      </div>

      <div className="friends-list">
        {filteredFriends.length > 0 ? filteredFriends.map(f => (
          <div key={f.id} className="friend-card">
            <div className={`friend-status-indicator ${f.online?'online':'offline'}`} />
            <div className="friend-avatar">
              {f.avatar
                ? <img src={f.avatar} alt={`${f.username}'s avatar`} />
                : <div className="default-avatar small">{f.username.charAt(0).toUpperCase()}</div>
              }
            </div>
            <div className="friend-info">
              <div className="friend-name">{f.username}</div>
              <div className="friend-rating">Рейтинг: {f.rating}</div>
              <div className="friend-last-seen">
                {f.online ? 'Онлайн' : `Був(ла): ${f.lastSeen}`}
              </div>
            </div>
            <div className="friend-actions">
              <button className="friend-action-icon" title="Виклик">
                <FaChessKnight />
              </button>
              <button className="friend-action-icon" title="Повідомлення">
                <FaCommentDots />
              </button>
              <button className="friend-action-icon" title="Видалити друга">
                <FaUserTimes />
              </button>
            </div>
          </div>
        )) : (
          <div className="no-results">
            <p>Нічого не знайдено. Спробуйте змінити пошуковий запит.</p>
          </div>
        )}
      </div>
      {filteredFriends.length > 0 && filteredFriends.length < friendsData.length && (
        <button className="load-more-btn">Показати більше друзів</button>
      )}
    </div>
  );
};

export default FriendsContent;
