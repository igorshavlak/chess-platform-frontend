// src/pages/Settings/SettingsPage.jsx

import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { User, Palette, CheckCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext'; 
import Sidebar from '../../components/Sidebar/Sidebar';
import './SettingsPage.css';

// --- Дані для кастомізації (залишаються без змін) ---
const BOARD_THEMES = {
    classic: { name: 'Класична', light: '#eeeed2', dark: '#769656' },
    frost: { name: 'Мороз', light: '#e1e1e1', dark: '#637381' },
    ocean: { name: 'Океан', light: '#c2d5e3', dark: '#5b80a6' },
    candy: { name: 'Солодка', light: '#f0d9b5', dark: '#b58863' },
};

const pieceSets = {
    loadSet: (setName) => ({
        wP: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wP.svg`} alt="wp" />,
        wR: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wR.svg`} alt="wr" />,
        wN: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wN.svg`} alt="wn" />,
        wB: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wB.svg`} alt="wb" />,
        wQ: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wQ.svg`} alt="wq" />,
        wK: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/wK.svg`} alt="wk" />,
        bP: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bP.svg`} alt="bp" />,
        bR: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bR.svg`} alt="br" />,
        bN: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bN.svg`} alt="bn" />,
        bB: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bB.svg`} alt="bb" />,
        bQ: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bQ.svg`} alt="bq" />,
        bK: ({ squareWidth }) => <img style={{ width: squareWidth, height: squareWidth }} src={`/src/assets/pieces/${setName}/bK.svg`} alt="bk" />,
    }),
};

const PIECE_SETS_OPTIONS = {
    cooke: { name: 'cooke', preview: '/src/assets/pieces/cooke/wK.svg' },
    alpha: { name: 'alpha', preview: '/src/assets/pieces/alpha/wK.svg' },
    kosal: { name: 'kosal', preview: '/src/assets/pieces/kosal/wK.svg' },
    celtic: { name: 'celtic', preview: '/src/assets/pieces/celtic/wK.svg' },
    firi: { name: 'firi', preview: '/src/assets/pieces/firi/wK.svg' },
    horsey: { name: 'horsey', preview: '/src/assets/pieces/horsey/wK.svg' },
};

// --- Компоненти вкладок ---

function ProfileTab() {
    return (
        <div className="profile-content">
            <h2>Профіль користувача</h2>
            <p>Цей розділ знаходиться у розробці.</p>
        </div>
    );
}

// 2. Вкладка кастомізації тепер самодостатня і використовує контекст
function CustomizationTab() {
    const { settings, updateSettings, isLoading } = useSettings();
    const [isSaving, setIsSaving] = useState(false);
    const { boardStyle, pieceStyle } = settings;

    // Обробник, який викликає функцію оновлення з контексту
    const handleUpdate = async (newSettings) => {
        setIsSaving(true);
        await updateSettings(newSettings);
        // Невелика затримка для UX, щоб користувач побачив індикатор
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleBoardSelect = (key) => {
        handleUpdate({ ...settings, boardStyle: key });
    };

    const handlePieceSelect = (key) => {
        handleUpdate({ ...settings, pieceStyle: key });
    };

    if (isLoading) {
        return <div>Завантаження налаштувань...</div>;
    }

    const currentBoardTheme = BOARD_THEMES[boardStyle] || BOARD_THEMES.classic;
    const currentPieceSet = pieceStyle ? pieceSets.loadSet(pieceStyle) : undefined;

    return (
        <div className="customization-content">
            <div className="saving-indicator">
                {isSaving && <span><CheckCircle size={16} /> Збереження...</span>}
            </div>
            <div className="customization-grid">
                <div className="options-panel">
                    <div>
                        <h3>Стиль дошки</h3>
                        <div className="options-list">
                            {Object.entries(BOARD_THEMES).map(([key, theme]) => (
                                <div
                                    key={key}
                                    className={`board-option ${boardStyle === key ? 'selected' : ''}`}
                                    onClick={() => handleBoardSelect(key)}
                                >
                                    <div className="board-swatch">
                                        <div className="board-swatch-light" style={{ backgroundColor: theme.light }}></div>
                                        <div className="board-swatch-dark" style={{ backgroundColor: theme.dark }}></div>
                                    </div>
                                    <div className="option-name">{theme.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3>Стиль фігур</h3>
                        <div className="options-list">
                            {Object.entries(PIECE_SETS_OPTIONS).map(([key, pieceSet]) => (
                                <div
                                    key={key}
                                    className={`piece-option ${pieceStyle === key ? 'selected' : ''}`}
                                    onClick={() => handlePieceSelect(key)}
                                >
                                    <img src={pieceSet.preview} alt={pieceSet.name} className="piece-preview-img" />
                                    <div className="option-name">{pieceSet.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="preview-panel">
                    <h3>Попередній перегляд</h3>
                    <Chessboard
                        position="start"
                        customLightSquareStyle={{ backgroundColor: currentBoardTheme.light }}
                        customDarkSquareStyle={{ backgroundColor: currentBoardTheme.dark }}
                        customPieces={currentPieceSet}
                        arePiecesDraggable={false}
                    />
                </div>
            </div>
        </div>
    );
}

// --- 3. Основний компонент сторінки тепер значно простіший ---
function SettingsPage() {
    const [activeTab, setActiveTab] = useState('customization');
    
    // Вся логіка роботи з даними тепер у `CustomizationTab` та `SettingsContext`.
    // Цей компонент відповідає лише за UI та перемикання вкладок.

    return (
  
        <div className="settings-page-container">
               <Sidebar />
            <div className="settings-card">
                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === 'customization' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customization')}
                    >
                        <Palette size={18} />
                        <span>Вигляд</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} />
                        <span>Профіль</span>
                    </button>
                </div>
                <div className="settings-content">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'customization' && <CustomizationTab />}
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;