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
  FaUserCheck,
} from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css';

export default function FriendsContent({
  isOwnProfile,
  friendsData,
  friendRequests,

  // Props for user search
  searchNickname,
  setSearchNickname,
  searchResults,
  onSearchUsers,

  searchTerm,
  setSearchTerm,
  friendsFilter,
  setFriendsFilter,
  onAcceptRequest,
  onRejectRequest,
  onAddFriend, // Used for sending request from search results
  onRemoveFriend,
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
    { icon: <FaFacebookF />, label: 'Find Friends', onClick: () => {} }, // Можливо, цей пункт буде замінений на пошук за нікнеймом
    { icon: <FaEnvelope />, label: 'Email Invite', onClick: () => {} },
    { icon: <FaLink />, label: 'Challenge Link', onClick: () => {} }, // Це, можливо, не стосується додавання друзів
  ];

  // Helper to check if a user is already a friend or has an outgoing request
  const isAlreadyFriendOrRequested = (userId) => {
      // Check if user is in friendsData
      if (friendsData.some(friend => friend.id === userId)) {
          return 'friend';
      }
      // Check if there is an outgoing request (this logic would need to be implemented in parent component
      // and passed down, as we only have incoming requests here).
      // For simplicity, let's assume we can't send a request if they are already friends.
      return null; // Indicate neither friend nor requested (based on available data)
  };

  return (
    <div className="friends-container">
      {isOwnProfile && (
        <>
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

          {/* Section for finding new users */}
          <div className="find-user-section">
            <h3>Знайти користувача</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Введіть нікнейм..."
                value={searchNickname}
                onChange={e => setSearchNickname(e.target.value)}
                className="search-input"
                onKeyPress={(e) => { // Allow searching on Enter key press
                    if (e.key === 'Enter') {
                        onSearchUsers();
                    }
                }}
              />
              <button onClick={onSearchUsers} className="search-button" title="Шукати користувача">
                <FaSearch /> Шукати
              </button>
            </div>

            {/* Display search results */}
            {searchResults.length > 0 && (
              <div className="search-results friends-list">
                <h4>Результати пошуку:</h4>
                {searchResults.map(user => {
                    const friendStatus = isAlreadyFriendOrRequested(user.id);
                    return (
                  <div key={user.id} className="friend-card">
                     <div className={`friend-status-indicator ${user.online ? 'online' : 'offline'}`} /> {/* Assuming search results include online status */}
                    <div className="friend-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="default-avatar small">{user.username.charAt(0)}</div>
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{user.username}</div>
                       <div className="friend-rating">Рейтинг: {user.rating || '-'}</div> {/* Assuming search results include rating */}
                       {/* Optional: Display last seen/online status if available in search results */}
                        <div className="friend-last-seen">
                         {user.online ? 'Онлайн' : (user.lastSeen ? `Був(ла): ${user.lastSeen}` : '')}
                        </div>
                    </div>
                    <div className="friend-actions">
                        {/* Add friend button if not already friend or requested */}
                        {friendStatus === 'friend' ? (
                           <span className="friend-status-text">Друг</span>
                        ) : friendStatus === 'request_sent' ? ( // This state needs to be managed/checked
                            <span className="friend-status-text">Запит відправлено</span>
                        ) : (
                           <button
                              className="friend-action-icon"
                              title="Додати в друзі"
                              onClick={() => onAddFriend(user.userId) }
                            >
                    
                              <FaUserPlus />
                            </button>
                        )}
                    </div>
                  </div>
                )})}
              </div>
            )}
            {searchResults.length === 0 && searchNickname.trim() && ( // Show message if search was performed but no results
                 <p>Користувачів за запитом "{searchNickname}" не знайдено.</p>
            )}
             {searchResults.length === 0 && !searchNickname.trim() && ( // Show message if search input is empty
                 <p>Введіть нікнейм для пошуку.</p>
            )}
          </div>

        </>
      )}

      <h3>
        <FaUserFriends /> Друзі ({friendsData.length})
      </h3>

      {/* Invite links section remains */}
      {/* <div className="invite-links">
        {inviteActions.map((a, idx) => (
          <div key={idx} className="invite-link-card" onClick={a.onClick}>
            <div className="invite-icon">{a.icon}</div>
            <div className="invite-text">{a.label}</div>
          </div>
        ))}
      </div> */}

      <div className="filter-search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Пошук серед друзів..." // Changed placeholder for clarity
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
            <div key={f.userId} className="friend-card">
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
                {/* Actions for existing friends */}
                <button className="friend-action-icon" title="Виклик">
                  <FaChessKnight />
                </button>
                <button className="friend-action-icon" title="Повідомлення">
                  <FaCommentDots />
                </button>
                {isOwnProfile && ( // Only show remove button on own profile for existing friends
                  <button className="friend-action-icon" title="Видалити друга" onClick={() => onRemoveFriend(f.id)}>
                    <FaUserTimes />
                  </button>
                )}
                 {/* The add friend button here is for *other* profiles, which is handled in UserProfilePage */}
                 {/* Keeping the original logic for clarity, but the add friend button in search results is new */}
                {/* {!isOwnProfile && (
                   <button className="friend-action-icon" title="Додати в друзі" onClick={() => onAddFriend(f.id)}>
                     <FaUserPlus />
                   </button>
                )} */}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>Нічого не знайдено.</p>
          </div>
        )}
      </div>

      {/* {filteredFriends.length > 0 && filteredFriends.length < friendsData.length && (
        <button className="load-more-btn">Показати більше друзів</button>
      )} */}
    </div>
  );
}