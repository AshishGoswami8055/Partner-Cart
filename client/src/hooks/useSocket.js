import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '@/api/client';

let socketRef = null;

export const getSocket = () => socketRef;

export const useSocket = (enabled = true) => {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  const ref = useRef(null);
  const token = getAccessToken();

  useEffect(() => {
    if (!enabled || !token) return undefined;
    const socket = io(url, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef = socket;
    ref.current = socket;

    return () => {
      socket.disconnect();
      socketRef = null;
    };
  }, [enabled, url, token]);

  return ref.current;
};
