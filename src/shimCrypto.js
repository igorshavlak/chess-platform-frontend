// src/shimCrypto.js
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.getRandomValues)) {
  window.crypto = {
    getRandomValues(buf) {
      for (let i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
      }
      return buf;
    }
  };
}
