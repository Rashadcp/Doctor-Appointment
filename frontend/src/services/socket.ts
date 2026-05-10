import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

if (typeof window !== 'undefined') {
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
  });
}

export default socket;
