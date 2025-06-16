// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';

const API_BASE = `http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082`;

const defaultSettings = {
  boardStyle: 'classic',
  pieceStyle: 'kosal',
};

// 1. Створюємо контекст
const SettingsContext = createContext({
  settings: defaultSettings,
  updateSettings: async () => {},
  isLoading: true,
});

// 2. Створюємо провайдер
export const SettingsProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const userId = keycloak?.tokenParsed?.sub;
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Функція для завантаження налаштувань
  const fetchSettings = useCallback(async () => {
    if (userId) {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/api/users/settings/${userId}`);
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Failed to load user settings:", error);
        // Залишаємо налаштування за замовчуванням у разі помилки
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false); // Немає користувача, завантаження завершено
    }
  }, [userId]);

  // Завантажуємо налаштування при ініціалізації
  useEffect(() => {
    if (initialized) {
        fetchSettings();
    }
  }, [initialized, fetchSettings]);

  // Функція для оновлення налаштувань
  const updateSettings = async (newSettings) => {
    if (!userId) return;
    try {
      setSettings(newSettings); // Оновлюємо локально для миттєвого відгуку
      await axios.put(`${API_BASE}/api/users/settings/${userId}`, newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      // У разі помилки можна відкотити зміни
      fetchSettings(); 
    }
  };

  const value = { settings, updateSettings, isLoading };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// 3. Створюємо хук для зручного доступу до контексту
export const useSettings = () => {
  return useContext(SettingsContext);
};