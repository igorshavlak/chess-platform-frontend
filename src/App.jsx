// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ChessPage from './pages/ChessPage.jsx';
import StartPage from './pages/StartPage.jsx';
import './App.css'; // Общие стили для приложения
import './pages/ChessPage.css'


function App() {
  return (
    
    <Router>
      
      <Routes>
    
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<ChessPage />} />
        <Route path="/start" element={<StartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
