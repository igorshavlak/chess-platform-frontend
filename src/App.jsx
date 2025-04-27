// Оновлений App.jsx з додаванням маршрутів для шахових задач
import React from 'react';
import { useKeycloak } from '@react-keycloak/web'; 
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChessPageMock from './pages/ChessPage/ChessPageMock.jsx';
import ChessPageContainer from './pages/ChessPage/ChessPageContainter.jsx';
import StartPage from './pages/StartPage.jsx';
import TasksModePage from './pages/TasksModesPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import SocialPage from './pages/SocialPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import ChessPuzzlePage from './pages/ChessPuzzlePage.jsx'; // Додаємо новий компонент
import NotificationComponent from './components/NotificationComponent.jsx'; 
import ChatsPage from './pages/ChatsPage/ChatsPage.jsx';

import './App.css'; 
import './pages/ChessPage/ChessPage.css';
import './pages/ChessPuzzlePage.css'; // Додаємо новий CSS

const PrivateRoute = ({ children }) => {
  const { keycloak } = useKeycloak();

  if (keycloak.authenticated) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  const { keycloak } = useKeycloak();
  const userId = keycloak?.tokenParsed?.sub; 
  const useMock  = 'false';

  return (
    <Router>
      <Routes>
        <Route path="/tasks" element={<TasksModePage/>} />
        <Route path="/chats" element={<ChatsPage/>} />
        <Route path="/analysis" element={<AnalysisPage/>} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<ChessPageContainer />} />
        
        {/*<Route path="/game/:gameId" element={<ChessPageMock />} />*/}
        {/* Маршрути для шахових задач */}
        <Route path="/puzzle/:puzzleId/:mode" element={<ChessPuzzlePage />} />
        <Route path="/puzzles/theme/:themeId" element={
          <Navigate to={`/puzzle/theme1/theme`} replace />
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
        />
      )}
    </Router>
  );
}

export default App;