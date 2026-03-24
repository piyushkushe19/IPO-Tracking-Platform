class WSService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.reconnectDelay = 3000;
    this.maxReconnectDelay = 30000;
    this.isIntentionalClose = false;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.isIntentionalClose = false;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = import.meta.env.PROD ? window.location.host : 'localhost:5000';
    this.ws = new WebSocket(`${protocol}://${host}/ws`);

    this.ws.onopen = () => {
      this.reconnectDelay = 3000;
      this._emit('connection', { connected: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._emit(data.type, data);
        this._emit('*', data);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    this.ws.onclose = () => {
      this._emit('connection', { connected: false });
      if (!this.isIntentionalClose) this._scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  _scheduleReconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    this.isIntentionalClose = true;
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
}

export const wsService = new WSService();
export default wsService;
