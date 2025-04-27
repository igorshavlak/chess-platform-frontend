import React from 'react';
import { FaChartLine, FaHistory, FaMedal, FaUserFriends, FaChessRook } from 'react-icons/fa';
import '../../pages/UserProfilePage.css'

const tabs = [
  { key: 'stats', label: 'Статистика', icon: <FaChartLine /> },
  { key: 'games', label: 'Історія партій', icon: <FaHistory /> },
  { key: 'achievements', label: 'Досягнення', icon: <FaMedal /> },
  { key: 'friends', label: 'Друзі', icon: <FaUserFriends /> },
  { key: 'clubs', label: 'Клуби', icon: <FaChessRook /> },
];

const ProfileTabs = ({ activeTab, setActiveTab }) => (
  <div className="profile-tabs">
    {tabs.map(tab => (
      <button
        key={tab.key}
        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
        onClick={() => setActiveTab(tab.key)}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);
export default ProfileTabs;