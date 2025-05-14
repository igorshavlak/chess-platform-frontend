// src/pages/GameRequestsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import CreateSimulModal from '../../components/CreateSimulModal/CreateSimulModal';
import { FaPlus, FaBolt, FaUserFriends, FaRobot, FaPencilAlt, FaSignInAlt, FaUsers } from 'react-icons/fa';
import './GameRequestsPage.css';

import useSimulLobbyApi from './useSimulLobbyApi'; // Імпортуємо наш новий хук

// Цей мок даних залишаємо, якщо логіка для лоббі запитів буде іншою або пізніше
const lobbyRequestsData = [
  { id: 1, nickname: 'ChessMaster', rating: 1850, timeControl: '10+5', mode: 'Бліц' },
  { id: 2, nickname: 'RookRider', rating: 1600, timeControl: '15+10', mode: 'Рапід' },
  { id: 3, nickname: 'PawnPusher', rating: 1400, timeControl: '3+2', mode: 'Куля' },
  { id: 4, nickname: 'QueenGambitFan', rating: 2000, timeControl: '30+0', mode: 'Класика' },
  { id: 5, nickname: 'LongThinker', rating: 1750, timeControl: '60+10', mode: 'Класика' },
];

// Helper function to map backend GameMode enum string to Ukrainian display string
const mapGameModeToUkrainian = (gameMode) => {
    switch (gameMode) {
        case 'BLITZ': return 'Бліц';
        case 'RAPID': return 'Рапід';
        case 'CLASSIC': return 'Класика';
        case 'BULLET': return 'Куля';
        case 'CHESS960': return 'Шахи-960'; // Додайте, якщо є
        case 'SIMUL': return 'Сеанс';     // Додайте, якщо є
        default: return gameMode; // Fallback
    }
};

function GameRequestsPage() {
    const navigate = useNavigate();
    // Використовуємо наш хук для отримання даних, стану завантаження та функції API
    const { simulSessions, loading, error, createSimul, joinSimul } = useSimulLobbyApi();

    const [activeTab, setActiveTab] = useState('lobby'); // 'lobby' або 'simul'
    const [isSimulModalOpen, setIsSimulModalOpen] = useState(false); // Стан для модалки

    // Функція, яка обробляє дані з модалки та викликає функцію створення через хук
    const handleCreateSimulRequest = async (simulDataFromModal) => {
        try {
            // Викликаємо функцію createSimul з нашого хука, яка робить API запит
            await createSimul(simulDataFromModal);
            // Якщо запит успішний (не викинув помилку), закриваємо модалку
            setIsSimulModalOpen(false);
            // Можна показати сповіщення про успіх
            // alert("Сеанс успішно створено!"); // Хук вже може показувати alert, або можна тут
        } catch (err) {
            // Помилка оброблена і, можливо, показана користувачеві всередині createSimul в хуці
            console.error("Error submitting simul creation:", err);
            // Не закриваємо модалку, щоб користувач міг виправити помилку
            // Якщо помилка не показана в хуці, покажіть її тут: alert(`Помилка: ${err.message}`);
        }
    };

    const handleJoinSimul = async (lobbyId) => {
        try {
            await joinSimul(lobbyId);
            navigate(`/simul/lobby/${lobbyId}`); // Перенаправлення на сторінку лобі
        } catch (err) {
            console.error("Error joining simul:", err);
            alert(`Помилка приєднання до сеансу: ${err.message}`);
        }
    };

    // --- Render Functions (Updated) ---
    // Note: Lobby rendering still uses mock data structure as its API wasn't provided
    const renderLobbyRequest = (request) => (
     <div key={request.id} className="request-card lobby-card">
       <div className="card-header">
         <span className="card-nickname">{request.nickname}</span>
         <span className="card-rating">({request.rating})</span>
       </div>
       <div className="card-details">
         <p><strong>Контроль:</strong> {request.timeControl}</p>
         <p><strong>Режим:</strong> {request.mode}</p>
       </div>
       <button className="join-button">
         <FaSignInAlt /> Приєднатись {/* TODO: Implement join logic */}
       </button>
     </div>
   );

    const renderSimulSession = (session) => {
        // Use SimulSessionDTO properties
        const playerCount = session.joinedPlayerIds ? session.joinedPlayerIds.length : 0;
        const gameModeUkrainian = mapGameModeToUkrainian(session.gameMode); // Map game mode
        const { nickname: masterNickname, rating: masterRating } = session.masterInfo ?? {};

        return (
            <div key={session.simulId} className="request-card simul-card">
                <div className="card-header">
                    {/* Use masterNickname and masterRating from DTO */}
                   <span className="card-nickname">
                  {masterNickname} ({masterRating})
                </span>
                </div>
                <div className="card-details">
                    {/* Use timeControl and mapped gameMode */}
                    <p><strong>Контроль/Режим:</strong> {session.timeControl} / {gameModeUkrainian}</p>
                    {/* Use playerCount from joinedPlayerIds */}
                    <p><strong><FaUsers className="details-icon"/> Гравців:</strong> {playerCount}</p>
                    {/* Display other relevant simul details */}
                     {session.playerColor && <p><strong>Колір орг.:</strong> {session.playerColor}</p>} {/* Відображаємо колір організатора */}
                    {session.minRating > 0 && <p><strong>Мін. рейтинг:</strong> {session.minRating}</p>}

                    {session.startTime && <p><strong>Старт:</strong> {new Date(session.startTime).toLocaleString()}</p>}
                     {/* TODO: Відобразити maxOpponents */}
                </div>
             <button
                    className="join-button"
                    onClick={() => handleJoinSimul(session.simulId)}
                >
                    <FaSignInAlt /> До сеансу
                </button>
            </div>
        );
    };


    return (
        <div className="game-requests-page">
            <Sidebar />
            <main className="content-area">
                <h1 className="page-title">Знайти гру</h1>

                <div className="action-buttons-main">
                    <button className="action-button primary">
                        <FaBolt className="button-icon" /> Швидкий старт {/* TODO: Implement quick start logic */}
                    </button>
                    <button className="action-button secondary outline">
                        <FaPencilAlt className="button-icon" /> Створити гру (Лоббі) {/* TODO: Implement create lobby logic */}
                    </button>
                    <button className="action-button secondary outline">
                        <FaUserFriends className="button-icon" /> Грати з другом {/* TODO: Implement play with friend logic */}
                    </button>
                    <button className="action-button secondary outline">
                        <FaRobot className="button-icon" /> Грати з комп'ютером {/* TODO: Implement play with AI logic */}
                    </button>
                </div>

                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === 'lobby' ? 'active' : ''}`}
                            onClick={() => setActiveTab('lobby')}
                        >
                            Лоббі
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'simul' ? 'active' : ''}`}
                            onClick={() => setActiveTab('simul')}
                        >
                            Сеанс
                        </button>
                    </div>
                    {activeTab === 'simul' && (
                        <button className="simul-button secondary" onClick={() => setIsSimulModalOpen(true)}>
                            <FaPlus className="button-icon" /> Організувати сеанс
                        </button>
                    )}
                </div>

                <div className="request-list">
                    {/* Render Lobby requests (using mock data for now) */}
                    {activeTab === 'lobby' && lobbyRequestsData.length > 0 && lobbyRequestsData.map(renderLobbyRequest)}

                    {/* Render Simul sessions */}
                    {activeTab === 'simul' && (
                        loading ? (
                            <div className="loading-message">Завантаження сеансів...</div>
                        ) : error ? (
                            <div className="error-message">Помилка завантаження сеансів: {error.message}</div>
                        ) : simulSessions.length > 0 ? (
                            simulSessions.map(renderSimulSession)
                        ) : (
                            <div className="no-requests">
                                <p>Немає активних сеансів одночасної гри.</p>
                                <button className="simul-button secondary" onClick={() => setIsSimulModalOpen(true)}>
                                    <FaPlus className="button-icon" /> Організувати новий сеанс
                                </button>
                            </div>
                        )
                    )}

                    {/* Повідомлення про відсутність запитів у лоббі (залишаємо для прикладу) */}
                    {activeTab === 'lobby' && lobbyRequestsData.length === 0 && (
                        <div className="no-requests">
                            <p>Немає доступних запитів у лоббі.</p>
                            <button className="action-button secondary" onClick={() => {/* Логіка створення гри */ }}> {/* TODO: Додати функцію створення гри */}
                                <FaPencilAlt className="button-icon" /> Створити свою гру
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Рендеримо модалку, передаючи пропси */}
            {/* Передаємо handleCreateSimulRequest як обробник submit модалки */}
            <CreateSimulModal
                isOpen={isSimulModalOpen}
                onClose={() => setIsSimulModalOpen(false)}
                onCreateSimul={handleCreateSimulRequest} // Викликає функцію, яка використовує createSimul з хука
            />
        </div>
    );
}

export default GameRequestsPage;

// ... (Mock Lobby Data)