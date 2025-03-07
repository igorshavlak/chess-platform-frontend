// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8888/',
  realm: 'chess-platform-realm',
  clientId: 'chessapp-frontend',
});


export default keycloak;
