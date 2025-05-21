// Оновлений App.jsx з додаванням маршрутів для шахових задач
import React, { useEffect, useState, createContext } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChessPageMock from './pages/ChessPage/ChessPageMock.jsx';
import ChessPageContainer from './pages/ChessPage/ChessPageContainter.jsx';
import StartPage from './pages/StartPage.jsx';
import TasksModePage from './pages/TasksModesPage.jsx';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage.jsx';
import SocialPage from './pages/SocialPage.jsx';
import AnalysisPage from './pages/AnalysisPage/AnalysisPage.jsx';
import ChessPuzzlePage from './pages/ChessPuzzlePage/ChessPuzzlePage.jsx'; // Додаємо новий компонент
import NotificationComponent from './components/NotificationComponent.jsx';
import ChatsPage from './pages/ChatsPage/ChatsPage.jsx';
import GameRequestsPage from './pages/GameRequestsPage/GameRequestsPage.jsx';
import websocketService from './components/websocketService.js';
import ChessBotPageContainer from './pages/ChessPage/ChessBotPageContainer'; // Нова сторінка з ботом




import './App.css';
import './pages/ChessPage/ChessPage.css';
import SimulLobbyPage from './pages/SimulLobbyPage/SimulLobbyPage.jsx';
import SimulPageContainer from './pages/ChessPage/SimulPageContainer.jsx'
import SimulPageMock from './pages/ChessPage/SimulPageMock.jsx'

const PrivateRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak(); // <--- Отримуємо також 'initialized'

  // 1. Якщо Keycloak ще не ініціалізований, показуємо завантажувач або null.
  // Це запобігає передчасному перенаправленню.
  if (!initialized) {
    return <div>Завантаження аутентифікації...</div>;
  }

  // 2. Keycloak ініціалізований. Тепер перевіряємо статус аутентифікації.
  if (initialized && !keycloak.authenticated) {
    // Якщо не аутентифікований, перенаправляємо на сторінку входу.
    // Переконайтеся, що '/login' - це ваш реальний шлях до сторінки входу.
    return <Navigate to="/login" />;
  }

  // 3. Якщо Keycloak ініціалізований та користувач аутентифікований, відображаємо дочірні компоненти.
  return children;
};

export const WSSContext = createContext({
  service: null,
  connected: false
});

function App() {
  const { keycloak } = useKeycloak();
  const userId = keycloak?.tokenParsed?.sub;
  const token = keycloak.token;
  const useMock = 'false';
  const WS_URL = 'http://localhost:8082/ws-notifications';
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (token && userId) {
      websocketService.connect({
        url: WS_URL,
        token,
        onConnect: () => {
          console.log('WS connected');
          setWsConnected(true);
        },
        onError: err => console.error('WS Error', err),
      });
    }
    return () => websocketService.disconnect();
  }, [token, userId]);

  return (
    <WSSContext.Provider value={{
      service: websocketService,
      connected: wsConnected
    }}>
      <Router>
        <Routes>
          <Route path="/requests" element={<GameRequestsPage />} />
          <Route path="/simul/lobby/:lobbyId" element={
            <PrivateRoute>
            <SimulLobbyPage />
            </PrivateRoute>
            } /> {/* <-- Додано параметр */}
          <Route path="/tasks" element={<TasksModePage />} />
          <Route path="/play/bot" element={<ChessBotPageContainer />} /> {/* Новий маршрут */}
        
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/analyze/:gameId" element={<AnalysisPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={<ChessPageContainer />} />
          <Route path="/simul/mock" element={<SimulPageMock />} />

          {/*<Route path="/game/:gameId" element={<ChessPageMock />} />*/}
          {/* Маршрути для шахових задач */}
          <Route path="/tasks/:mode" element={<ChessPuzzlePage />} />

          <Route path="/simul/:simulSessionId/simulPage" element={
            <PrivateRoute>
              <SimulPageContainer />
            </PrivateRoute>
          } />

          {/* Маршрути для профілю користувача */}
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          } />
          <Route path="/profile/:userId" element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          } />
          <Route path="/start" element={<StartPage />} />
        </Routes>
        {keycloak.authenticated && keycloak.token && (
          <NotificationComponent
            userId={keycloak.tokenParsed?.sub}
            token={keycloak.token}
            wsConnected={wsConnected} 
          />
        )}
      </Router>
    </WSSContext.Provider>
  );
}

export default App;