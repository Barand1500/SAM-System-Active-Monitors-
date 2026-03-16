import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

export const connectRealtime = ({ companyId, userId, token }) => {
  if (!token || !companyId || !userId) return null;

  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      auth: { token },
      withCredentials: true,
    });

    socket.on('company:data-changed', (payload) => {
      window.dispatchEvent(new CustomEvent('company:data-changed', { detail: payload || {} }));
    });
  }

  socket.emit('join_company', companyId);
  socket.emit('join_user', userId);

  return socket;
};

export const disconnectRealtime = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
