import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebsocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  connect({ url, token, onConnect, onError }) {
    if (this.client) return; 

    const socket = new SockJS(url);
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 15000,
      onConnect: frame => onConnect?.(frame),
      onStompError: err => onError?.(err),
    });

    this.client.activate();
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) {
        console.warn(`WS не підключений — пропускаємо підписку на ${topic}`);
        return () => {};
    }
    const sub = this.client.subscribe(topic, msg => callback(JSON.parse(msg.body)));
    this.subscriptions.set(topic, sub);
    return () => {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
    };
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions.clear();
    }
  }
}

export default new WebsocketService();