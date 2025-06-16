import React from 'react';
import {
    FaSearch, FaUserFriends, FaUsers, FaUserPlus, FaUserCheck, FaUserTimes,
    FaChessKnight, FaCommentDots, FaBell
} from 'react-icons/fa';
// Додамо стилі окремо, щоб не змішувати їх з загальними
import '../../pages/UserProfilePage/UserProfilePage.css';

// Допоміжний компонент для "порожніх" станів
const EmptyState = ({ icon, message }) => (
    <div className="empty-state">
        <div className="empty-state__icon">{icon}</div>
        <p className="empty-state__message">{message}</p>
    </div>
);

export default function FriendsContent({
    isOwnProfile,
    friendsData,
    friendRequests,
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
    onAddFriend,
    onRemoveFriend,
}) {

    const filteredFriends = friendsData.filter(f => {
        const matchSearch = f.friendProfile.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter =
            friendsFilter === 'all' ||
            (friendsFilter === 'online' && f.friendProfile.online) ||
            (friendsFilter === 'offline' && !f.friendProfile.online);
        return matchSearch && matchFilter;
    });

    const isAlreadyFriend = (userId) => friendsData.some(friend => friend.friendProfile.id === userId);

    return (
        <div className={`friends-page-layout ${isOwnProfile ? '' : 'single-column'}`}>
            {/* --- ОСНОВНИЙ КОНТЕНТ (СПИСОК ДРУЗІВ) --- */}
            <div className="friends-page-layout__main">
                <div className="friends-list-container">
                    <h3 className="section-title"><FaUserFriends /> Друзі ({friendsData.length})</h3>

                    <div className="filter-search-container-modern">
                        <div className="search-box-modern">
                            <FaSearch className="search-box-modern__icon" />
                            <input
                                type="text"
                                placeholder="Пошук серед друзів..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-box-modern__input"
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

                    <div className="friends-list-modern">
                        {filteredFriends.length > 0 ? (
                            filteredFriends.map(f => (
                                <div key={f.friendProfile.id} className={`friend-card-modern ${f.friendProfile.online ? 'online' : 'offline'}`}>
                                    <div className="friend-card-modern__avatar">
                                        <img src={f.friendProfile.avatar || `https://ui-avatars.com/api/?name=${f.friendProfile.username}&background=random`} alt={f.friendProfile.username} />
                                        <div className="status-indicator"></div>
                                    </div>
                                    <div className="friend-card-modern__info">
                                        <span className="friend-card-modern__name">{f.friendProfile.username}</span>
                                        <span className="friend-card-modern__meta">
                                            {f.friendProfile.online ? 'Онлайн' : `Рейтинг: ${f.friendProfile.rating || 'N/A'}`}
                                        </span>
                                    </div>
                                    <div className="friend-card-modern__actions">
                                        <button className="action-btn" title="Виклик"><FaChessKnight /></button>
                                        <button className="action-btn" title="Повідомлення"><FaCommentDots /></button>
                                        {isOwnProfile && (
                                            <button className="action-btn action-btn--reject" title="Видалити друга" onClick={() => onRemoveFriend(f.id)}>
                                                <FaUserTimes />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={<FaSearch />} message="Друзів не знайдено за вашим запитом" />
                        )}
                    </div>
                </div>
            </div>

            {/* --- БІЧНА ПАНЕЛЬ (ПОШУК ТА ЗАПИТИ) --- */}
            {isOwnProfile && (
                <div className="friends-page-layout__sidebar">
                    {/* Віджет пошуку користувачів */}
                    <div className="friends-widget">
                        <h4 className="widget-title"><FaSearch /> Знайти друга</h4>
                        <div className="find-user-form">
                            <input
                                type="text"
                                placeholder="Введіть нікнейм..."
                                value={searchNickname}
                                onChange={e => setSearchNickname(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') onSearchUsers(); }}
                            />
                            <button onClick={onSearchUsers}><FaSearch /></button>
                        </div>
                        <div className="search-results-list">
                            {searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div key={user.id} className="friend-card-modern compact">
                                        <div className="friend-card-modern__avatar">
                                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} />
                                        </div>
                                        <div className="friend-card-modern__info">
                                            <span className="friend-card-modern__name">{user.username}</span>
                                        </div>
                                        <div className="friend-card-modern__actions">
                                            {isAlreadyFriend(user.id) ? (
                                                <span className="status-text"><FaUserCheck /> В друзях</span>
                                            ) : (
                                                <button className="action-btn action-btn--add" title="Додати в друзі" onClick={() => onAddFriend(user.id)}>
                                                    <FaUserPlus />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="widget-placeholder">Введіть ім'я для пошуку нових друзів.</p>
                            )}
                        </div>
                    </div>

                    {/* Віджет запитів на дружбу */}
                    <div className="friends-widget">
                        <h4 className="widget-title"><FaBell /> Запити на дружбу ({friendRequests.length})</h4>
                        <div className="requests-list">
                            {friendRequests.length > 0 ? (
                                friendRequests.map(r => (
                                    <div key={r.id} className="friend-card-modern compact">
                                        <div className="friend-card-modern__avatar">
                                            <img src={r.profileDTO.avatar || `https://ui-avatars.com/api/?name=${r.profileDTO.username}&background=random`} alt={r.profileDTO.username} />
                                        </div>
                                        <div className="friend-card-modern__info">
                                            <span className="friend-card-modern__name">{r.profileDTO.username}</span>
                                        </div>
                                        <div className="friend-card-modern__actions">
                                            <button className="action-btn action-btn--accept" title="Прийняти" onClick={() => onAcceptRequest(r.id)}><FaUserCheck /></button>
                                            <button className="action-btn action-btn--reject" title="Відхилити" onClick={() => onRejectRequest(r.id)}><FaUserTimes /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<FaUsers />} message="Немає нових запитів" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}