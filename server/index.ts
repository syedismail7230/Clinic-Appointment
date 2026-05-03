import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import morgan from 'morgan';
import routes from './routes.js';
import { initSocket } from './socket.js';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

// HTTP Request Logging
app.use(morgan('dev'));

// CORS Security - Allows frontend access
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api', routes);

// Initialize Socket.io
initSocket(httpServer);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Unhandled Error]:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const server = httpServer.listen(port, () => {
    console.log(`Backend server with Real-time support running at http://localhost:${port}`);
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Received shutdown signal. Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed. Process exiting.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
