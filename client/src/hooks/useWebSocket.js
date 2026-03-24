import { useEffect, useState } from 'react';
import wsService from '../services/websocket';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [liveData, setLiveData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    wsService.connect();

    const offConn = wsService.on('connection', ({ connected }) => setConnected(connected));
    const offLive = wsService.on('live_update', ({ data, timestamp }) => {
      setLiveData(data);
      setLastUpdated(new Date(timestamp));
    });

    return () => {
      offConn();
      offLive();
    };
  }, []);

  return { connected, liveData, lastUpdated };
}
