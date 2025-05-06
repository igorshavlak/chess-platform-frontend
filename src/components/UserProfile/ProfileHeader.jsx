// src/components/UserProfile/ProfileHeader.jsx
import React from 'react';
import { FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import '../../pages/UserProfilePage/UserProfilePage.css';

const ProfileHeader = ({ userData, isOwnProfile }) => {
  if (!userData) return null;
  const { avatar, username, rating, memberSince, friends } = userData;

  return (
    <div className="profile-header">
      <div className="profile-avatar-section">
        {avatar ? (
          <img src={avatar} alt="User Avatar" className="profile-avatar" />
        ) : (
          <div className="profile-avatar default-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-rating">
          <span className="rating-number">{rating}</span>
          <span className="rating-label">ELO</span>
        </div>
      </div>

      <div className="profile-info">
        <h2 className="profile-username">{username}</h2>
        <div className="profile-meta">
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>На платформі з {memberSince}</span>
          </div>
          <div className="meta-item">
            <FaUserFriends className="meta-icon" />
            <span>{friends} друзів</span>
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
  );
};

export default ProfileHeader;
