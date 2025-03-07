// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaChess,
  FaCog,
  FaInfoCircle,
  FaTasks,
  FaEye,
  FaChartLine,
  FaBars,
  FaTimes,
  FaUserCircle
} from 'react-icons/fa';
import { useKeycloak } from '@react-keycloak/web';
import './Sidebar.css';


function Sidebar() {
  const [isActive, setIsActive] = useState(false);
  const sidebarRef = useRef(null);
  const { keycloak } = useKeycloak();

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  // Закрытие меню при клике вне сайдбара
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive]);

  // Извлечение информации о пользователе из токена
  const user = keycloak.tokenParsed
    ? {
        username: keycloak.tokenParsed.preferred_username,
        email: keycloak.tokenParsed.email,
        // Предполагаем, что URL фото хранится в поле "picture" или аналогичном
        // Если такого поля нет, можно использовать иное или установить дефолтное фото
        avatar: keycloak.tokenParsed.picture || null,
      }
    : null;

  return (
    <nav className={`sidebar ${isActive ? 'active' : ''}`} ref={sidebarRef}>
      <h1>ChessApp</h1>
      <button className="menu-button" onClick={toggleMenu} aria-label="Toggle Menu">
        {isActive ? <FaTimes /> : <FaBars />}
      </button>
      <ul>
        <li>
          <NavLink to="/start" className="nav-link" onClick={() => setIsActive(false)}>
            <FaHome className="icon" />
            <span>Головна</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/game" className="nav-link" onClick={() => setIsActive(false)}>
            <FaChess className="icon" />
            <span>Гра</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className="nav-link" onClick={() => setIsActive(false)}>
            <FaTasks className="icon" />
            <span>Задачі</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/view" className="nav-link" onClick={() => setIsActive(false)}>
            <FaEye className="icon" />
            <span>Перегляд</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/stats" className="nav-link" onClick={() => setIsActive(false)}>
            <FaChartLine className="icon" />
            <span>Статистика</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="nav-link" onClick={() => setIsActive(false)}>
            <FaCog className="icon" />
            <span>Налаштування</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className="nav-link" onClick={() => setIsActive(false)}>
            <FaInfoCircle className="icon" />
            <span>Про нас</span>
          </NavLink>
        </li>
      </ul>
      {/* Добавляем секцию с информацией о пользователе */}
      {keycloak.authenticated && user && (
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
          <button onClick={() => keycloak.logout()} className="logout-button">
            Выйти
          </button>
        </div>
      )}
      {/* Если пользователь не аутентифицирован, показываем кнопки аутентификации */}
      {!keycloak.authenticated && (
        <div className="auth-buttons">
          <button onClick={() => keycloak.login()} className="auth-button">
            Войти
          </button>
        </div>
      )}
    </nav>
  );
}

export default Sidebar;
