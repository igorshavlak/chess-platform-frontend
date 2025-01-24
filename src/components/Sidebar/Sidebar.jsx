// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaChess, FaCog, FaInfoCircle, FaTasks, FaEye, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
    const [isActive, setIsActive] = useState(false);
    const sidebarRef = useRef(null);

    const toggleMenu = () => {
        setIsActive(!isActive);
    };

    // Закриття меню при натисканні поза сайдбаром
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
        </nav>
    );
}

export default Sidebar;
