import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import { SocketService } from './services/SocketService';
import logger from './utils/logger';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Socket service
new SocketService(io);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Server running on http://${config.host}:${config.port}`);
});
