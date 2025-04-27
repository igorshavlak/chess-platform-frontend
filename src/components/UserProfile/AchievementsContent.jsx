import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import '../../pages/UserProfilePage.css'

const AchievementsContent = ({ achievements }) => (
  <div className="achievements-container">
    <h3><FaTrophy /> Досягнення</h3>
    <div className="achievements-grid">
      {achievements.map(a => (
        <div key={a.id} className="achievement-card">
          <div className="achievement-icon">{a.icon}</div>
          <div className="achievement-details">
            <div className="achievement-name">{a.name}</div>
            <div className="achievement-date">{a.date}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default AchievementsContent;