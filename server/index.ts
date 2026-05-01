import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import routes from './routes';
import { initSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(port, () => {
    console.log(`Backend server with Real-time support running at http://localhost:${port}`);
});
