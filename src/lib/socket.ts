import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');

export const socket = io(SOCKET_URL);

export const joinTenantRoom = (tenantId: string) => {
  socket.emit('join-tenant', tenantId);
};
