import crypto from 'isomorphic-webcrypto';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './index.css'
import Modal from 'react-modal'; 
import keycloak from './keycloak';
import App from './App.jsx'

Modal.setAppElement('#root');


const handleOnEvent = (event, error) => {
  console.log('Keycloak event', event, error);
  if (event === 'onTokenExpired') {
    keycloak.updateToken(70) // Попробовать обновить токен за 70 секунд до истечения
      .then((refreshed) => {
        if (refreshed) {
          console.log('Токен обновлен');
        } else {
          console.log('Токен еще действителен');
        }
      })
      .catch(() => {
        console.error('Не удалось обновить токен');
        keycloak.logout();
      });
  }
};

const handleOnTokens = (tokens) => {
  console.log('Tokens', tokens);
  // Здесь можно сохранить токены в локальное хранилище или другой безопасный источник
};

createRoot(document.getElementById('root')).render(
    <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: 'check-sso',
      pkceMethod: false, 
      checkLoginIframe: false, // Отключаем проверку через iframe
    }}
    onEvent={handleOnEvent}
    onTokens={(tokens) => {
      console.log('Tokens', tokens);
    }}
    autoRefreshToken={true}
  >
    <App />
  </ReactKeycloakProvider>

)
