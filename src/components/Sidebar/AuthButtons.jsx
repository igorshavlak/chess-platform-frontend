// src/components/AuthButtons.jsx
import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './AuthButtons.css';

const AuthButtons = () => {
  const { keycloak } = useKeycloak();

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  if (keycloak.authenticated && keycloak.tokenParsed) {
    const user = {
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      avatar: keycloak.tokenParsed.picture || null,
    };

    return (
      <div className="user-info">
        {user.avatar ? (
          <img src={user.avatar} alt="User Avatar" className="user-avatar" />
        ) : (
          <FaUserCircle className="default-avatar" />
        )}
        <div className="user-details">
          <span className="username">{user.username}</span>
          <span className="email">{user.email}</span>
        </div>
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <button onClick={login} className="auth-button">
        Войти
      </button>
    </div>
  );
};

export default AuthButtons;
