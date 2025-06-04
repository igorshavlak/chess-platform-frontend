// src/keycloak.js
import Keycloak from 'keycloak-js';

Keycloak.prototype.createUUID = function() {
  // простая JS-реализация UUID v4 (не криптостойкая, но для dev подойдёт)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


const keycloak = new Keycloak({
  
  url: `http://192.168.0.105:8888/`,
  realm: 'chess-platform-realm',
  clientId: 'chessapp-frontend',
   
});


export default keycloak;
