import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        
        socket.on('join-tenant', (tenantId) => {
            socket.join(tenantId);
            console.log(`Socket ${socket.id} joined tenant ${tenantId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

export const notifyQueueUpdate = (tenantId: string) => {
    if (io) {
        io.to(tenantId).emit('queue-update');
        // Also broadcast to public if needed, but tenant isolation is better
        io.emit('global-queue-update'); 
    }
};
