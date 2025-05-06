import React from 'react';
import {
  FaSearch,
  FaUserFriends,
  FaLink,
  FaFacebookF,
  FaEnvelope,
  FaChessKnight,
  FaCommentDots,
  FaUserTimes,
  FaUserPlus,
  FaUserCheck
} from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css';

export default function FriendsContent({
  isOwnProfile,
  friendsData,
  friendRequests,
  searchTerm,
  setSearchTerm,
  friendsFilter,
  setFriendsFilter,
  onAcceptRequest,
  onRejectRequest,
  onAddFriend,
  onRemoveFriend
}) {
  const filteredFriends = friendsData.filter(f => {
    const matchSearch = f.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      friendsFilter === 'all' ||
      (friendsFilter === 'online' && f.online) ||
      (friendsFilter === 'offline' && !f.online);
    return matchSearch && matchFilter;
  });

  const inviteActions = [
    { icon: <FaLink />, label: 'Friend Link', onClick: () => {} },
    { icon: <FaFacebookF />, label: 'Find Friends', onClick: () => {} },
    { icon: <FaEnvelope />, label: 'Email Invite', onClick: () => {} },
    { icon: <FaLink />, label: 'Challenge Link', onClick: () => {} }
  ];

  return (
    <div className="friends-container">
      {isOwnProfile && (
        <div className="friend-requests">
          <h3>Запити на дружбу ({friendRequests.length})</h3>
          <div className="friends-list">
            {friendRequests.length > 0 ? (
              friendRequests.map(r => (
                <div key={r.id} className="friend-card">
                  <div className="friend-avatar">
                    {r.avatar ? (
                      <img src={r.avatar} alt={r.username} />
                    ) : (
                      <div className="default-avatar small">{r.username.charAt(0)}</div>
                    )}
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{r.username}</div>
                  </div>
                  <div className="friend-actions">
                    <button className="friend-action-icon" title="Прийняти" onClick={() => onAcceptRequest(r.id)}>
                      <FaUserCheck />
                    </button>
                    <button className="friend-action-icon" title="Відхилити" onClick={() => onRejectRequest(r.id)}>
                      <FaUserTimes />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Немає нових запитів.</p>
            )}
          </div>
        </div>
      )}

      <h3>
        <FaUserFriends /> Друзі ({friendsData.length})
      </h3>

      <div className="invite-links">
        {inviteActions.map((a, idx) => (
          <div key={idx} className="invite-link-card" onClick={a.onClick}>
            <div className="invite-icon">{a.icon}</div>
            <div className="invite-text">{a.label}</div>
          </div>
        ))}
      </div>

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
          {['all', 'online', 'offline'].map(f => (
            <button
              key={f}
              className={`filter-btn ${friendsFilter === f ? 'active' : ''}`}
              onClick={() => setFriendsFilter(f)}
            >
              {f === 'all' ? 'Всі' : f === 'online' ? 'Онлайн' : 'Офлайн'}
            </button>
          ))}
        </div>
      </div>

      <div className="friends-list">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(f => (
            <div key={f.id} className="friend-card">
              <div className={`friend-status-indicator ${f.online ? 'online' : 'offline'}`} />
              <div className="friend-avatar">
                {f.avatar ? (
                  <img src={f.avatar} alt={f.username} />
                ) : (
                  <div className="default-avatar small">{f.username.charAt(0)}</div>
                )}
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
                {isOwnProfile ? (
                  <button className="friend-action-icon" title="Видалити друга" onClick={() => onRemoveFriend(f.id)}>
                    <FaUserTimes />
                  </button>
                ) : (
                  <button className="friend-action-icon" title="Додати в друзі" onClick={() => onAddFriend(f.id)}>
                    <FaUserPlus />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>Нічого не знайдено.</p>
          </div>
        )}
      </div>

      {filteredFriends.length > 0 && filteredFriends.length < friendsData.length && (
        <button className="load-more-btn">Показати більше друзів</button>
      )}
    </div>
  );
}
