import { io, Socket } from 'socket.io-client';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(WEBHOOK_URL, {
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (userId?: string, isAdmin?: boolean) => {
  const socketInstance = initSocket();

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  if (userId) {
    socketInstance.emit('join-user-room', userId);
  }

  if (isAdmin) {
    socketInstance.emit('join-admin-room');
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export { socket };
