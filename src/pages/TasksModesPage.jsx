import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { 
  FaTrophy, 
  FaChessKnight, 
  FaRandom, 
  FaCalendarDay,
  FaChartBar,
  FaArrowLeft,
  FaInfoCircle,
  FaFire
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import './TasksModesPage.css';

// Компонент для вибору теми/дебюту
const ThemeSelector = ({ onBack, onSelect }) => {
  const themes = [
    { id: 'fork', name: 'Вилка', description: 'Атака на дві або більше фігури одночасно' },
    { id: 'pin', name: 'Зв\'язка', description: 'Обмеження руху фігури через загрозу більш цінній фігурі' },
    { id: 'discovered-attack', name: 'Відкритий шах', description: 'Атака, що розкривається після руху іншої фігури' },
    { id: 'skewer', name: 'Шампур', description: 'Атака на дві фігури на одній лінії' },
    { id: 'zwischenzug', name: 'Проміжний хід', description: 'Неочікуваний хід перед очікуваним ходом' }
  ];
  
  const openings = [
    { id: 'sicilian', name: 'Сицилійський захист', description: 'e4 c5' },
    { id: 'french', name: 'Французький захист', description: 'e4 e6' },
    { id: 'ruy-lopez', name: 'Іспанська партія', description: 'e4 e5 Nf3 Nc6 Bb5' },
    { id: 'queens-gambit', name: 'Ферзевий гамбіт', description: 'd4 d5 c4' },
    { id: 'kings-indian', name: 'Захист Німцовича', description: 'd4 Nf6 c4 g6' }
  ];
  
  const [activeTab, setActiveTab] = useState('themes');
  
  return (
    <div className="theme-selector">
      <div className="theme-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Назад
        </button>
        <h2>Вибір {activeTab === 'themes' ? 'теми' : 'дебюту'}</h2>
      </div>
      
      <div className="theme-tabs">
        <button 
          className={`theme-tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          Теми
        </button>
        <button 
          className={`theme-tab ${activeTab === 'openings' ? 'active' : ''}`}
          onClick={() => setActiveTab('openings')}
        >
          Дебюти
        </button>
      </div>
      
      <div className="theme-list">
        {(activeTab === 'themes' ? themes : openings).map(item => (
          <div key={item.id} className="theme-item" onClick={() => onSelect(item.id, activeTab)}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент статистики
const StatsComponent = ({ onBack }) => {
  // Демо-дані для статистики
  const stats = {
    solved: 254,
    attempted: 312,
    successRate: 81.4,
    averageTime: '1:24',
    streakDays: 7,
    ratingChange: '+42',
    bestTheme: 'Вилка (92%)',
    worstTheme: 'Відкритий шах (64%)'
  };
  
  return (
    <div className="stats-container">
      <div className="stats-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Назад
        </button>
        <h2>Статистика вирішення задач</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stats-card">
          <h3>Загальна статистика</h3>
          <div className="stats-item">
            <span>Вирішено задач:</span>
            <span className="stats-value">{stats.solved}</span>
          </div>
          <div className="stats-item">
            <span>Спроб:</span>
            <span className="stats-value">{stats.attempted}</span>
          </div>
          <div className="stats-item">
            <span>Успішність:</span>
            <span className="stats-value highlight">{stats.successRate}%</span>
          </div>
        </div>
        
        <div className="stats-card">
          <h3>Продуктивність</h3>
          <div className="stats-item">
            <span>Середній час:</span>
            <span className="stats-value">{stats.averageTime}</span>
          </div>
          <div className="stats-item">
            <span>Днів поспіль:</span>
            <span className="stats-value highlight">{stats.streakDays}</span>
          </div>
          <div className="stats-item">
            <span>Зміна рейтингу:</span>
            <span className="stats-value positive">{stats.ratingChange}</span>
          </div>
        </div>
        
        <div className="stats-card">
          <h3>Найкращі і найгірші теми</h3>
          <div className="stats-item">
            <span>Найкраща тема:</span>
            <span className="stats-value positive">{stats.bestTheme}</span>
          </div>
          <div className="stats-item">
            <span>Найгірша тема:</span>
            <span className="stats-value negative">{stats.worstTheme}</span>
          </div>
        </div>
      </div>
      
      <div className="stats-chart">
        <h3>Прогрес по днях</h3>
        <div className="chart-placeholder">
          {/* В реальному додатку тут буде справжній графік */}
          <div className="placeholder-text">
            Графік прогресу буде відображено тут
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksModesPage = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const taskModes = [
    {
      id: 'tactical-duel',
      title: 'Тактична дуель',
      description: 'Змагайтеся зі своїми друзями або випадковими суперниками у вирішенні тактичних завдань. Хто вирішить швидше і точніше?',
      icon: <FaTrophy />,
      color: '#ff7043'
    },
    {
      id: 'themes-openings',
      title: 'Задачі за темами/дебютами',
      description: 'Відточуйте свої навички у конкретних тактичних темах або вивчайте типові тактичні мотиви у ваших улюблених дебютах.',
      icon: <FaChessKnight />,
      color: '#5c6bc0',
      hasSubmenu: true
    },
    {
      id: 'random',
      title: 'Випадкові задачі',
      description: 'Вирішуйте різноманітні задачі різних рівнів складності для всебічного розвитку тактичного бачення.',
      icon: <FaRandom />,
      color: '#66bb6a'
    },
    {
      id: 'daily',
      title: 'Задача дня',
      description: 'Щодня нова цікава задача. Не пропустіть жодного дня для підтримки вашої шахової форми.',
      icon: <FaCalendarDay />,
      color: '#ffa726'
    },
    {
      id: 'puzzle-streak',
      title: 'Puzzle streak',
      description: 'Вирішуйте щораз важчі задачі та створюйте серію перемог. Обмеження часу немає, тому не поспішайте. Один хибний хід, і гра закінчена! Але ви можете пропустити один хід за сесію.',
      icon: <FaFire />,
      color: '#8e1df2'
    }
    
  ];
  
  const handleModeSelect = (modeId) => {
    if (modeId === 'themes-openings') {
      setShowThemeSelector(true);
    }  else if (modeId === 'random' || modeId === 'puzzle-streak') { // <-- Додайте перевірку на ваші режими задач
  
      navigate(`/tasks/${modeId}`); // <-- Змінено шлях навігації
    }
  };
  
  const handleThemeSelect = (themeId, type) => {
    // Навігація до відповідної сторінки з задачами за темою/дебютом
    navigate(`/tasks/themed/${type}/${themeId}`);
  };
  
  const handleShowStats = () => {
    setShowStats(true);
  };
  
  // Якщо відображається селектор тем або статистика, повертаємо відповідний компонент
  if (showThemeSelector) {
    return (
      <div className="page-container">
        <Sidebar />
        <div className="content-container">
          <ThemeSelector 
            onBack={() => setShowThemeSelector(false)} 
            onSelect={handleThemeSelect} 
          />
        </div>
      </div>
    );
  }
  
  if (showStats) {
    return (
      <div className="page-container">
        <Sidebar />
        <div className="content-container">
          <StatsComponent onBack={() => setShowStats(false)} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <div className="tasks-header">
          <h1>Шахові задачі</h1>
          <p className="tasks-description">
            Покращуйте своє тактичне бачення та аналітичні навички, вирішуючи шахові задачі різних типів та рівнів складності. Виберіть режим, який найкраще підходить для ваших цілей.
          </p>
          <button className="stats-button" onClick={handleShowStats}>
            <FaChartBar /> Моя статистика
          </button>
        </div>
        
        <div className="modes-container">
          {taskModes.map(mode => (
            <div 
              key={mode.id} 
              className="mode-card" 
              style={{ borderColor: mode.color }}
              onClick={() => handleModeSelect(mode.id)}
            >
              <div className="mode-icon" style={{ backgroundColor: mode.color }}>
                {mode.icon}
              </div>
              <h2>{mode.title}</h2>
              <p>{mode.description}</p>
              <div className="mode-footer">
                {mode.hasSubmenu ? (
                  <span className="submenu-indicator">Вибрати тему/дебют <FaArrowLeft className="arrow-right" /></span>
                ) : (
                  <span className="start-indicator">Почати <FaArrowLeft className="arrow-right" /></span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="help-section">
          <FaInfoCircle className="info-icon" />
          <div>
            <h3>Як працюють задачі?</h3>
            <p>
              Кожна задача має оптимальний хід або серію ходів, які ви повинні знайти. У вас буде обмежений час на кожну задачу. 
              Чим швидше ви знаходите правильне рішення, тим більше очків отримуєте. За невдалі спроби очки знімаються.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksModesPage;