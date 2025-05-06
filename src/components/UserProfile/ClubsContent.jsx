import React from 'react';
import { FaSearch, FaChess, FaChessRook, FaUserFriends, FaStar } from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css'
const ClubsContent = ({ clubsData, searchTerm, setSearchTerm }) => {
  const filteredClubs = clubsData.filter(c=>c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="clubs-container">
      <h3><FaChessRook /> Шахові клуби</h3>
      <div className="filter-search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Пошук клубів..."
            value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="find-clubs-btn"><FaChess /> Знайти нові клуби</button>
      </div>
      <div className="clubs-list">
        {filteredClubs.length>0 ? filteredClubs.map(c=>(
          <div key={c.id} className="club-card">
            <div className="club-avatar">
              {c.avatar ? <img src={c.avatar} alt={`${c.name} avatar`} /> : <div className="default-avatar club">{c.name.charAt(0).toUpperCase()}</div>}
            </div>
            <div className="club-info">
              <div className="club-name">
                {c.name}
                {c.role==='Адміністратор' && <span className="club-role admin">Адмін</span>}
                {c.role==='Модератор' && <span className="club-role mod">Модератор</span>}
              </div>
              <div className="club-stats">
                <div className="club-members"><FaUserFriends className="club-icon" /> {c.members} учасників</div>
                <div className="club-avg-rating"><FaStar className="club-icon" /> Середній рейтинг: {c.rating}</div>
              </div>
            </div>
            <div className="club-actions"><button className="club-action-btn visit">Відвідати клуб</button></div>
          </div>
        )) : <div className="no-results"><p>Клубів не знайдено. Спробуйте змінити пошуковий запит.</p></div>}
      </div>
      {filteredClubs.length>0 && <button className="create-club-btn"><FaChessRook /> Створити новий клуб</button>}
    </div>
  );
};
export default ClubsContent;
