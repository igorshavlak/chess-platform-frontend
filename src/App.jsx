// App.jsx
import React from 'react';
import { useKeycloak } from '@react-keycloak/web'; 
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChessPage from './pages/ChessPage.jsx';
import StartPage from './pages/StartPage.jsx';
import NotificationComponent from './components/NotificationComponent.jsx'; 

import './App.css'; 
import './pages/ChessPage.css'

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<ChessPage />} />
        <Route path="/start" element={ <StartPage />} />
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
