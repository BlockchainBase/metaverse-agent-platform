import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { setupRoutes } from './routes';
import { setupAgents } from './agents/setup';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.WEB_URL || 'http://localhost:3000', process.env.METAVERSE_URL || 'http://localhost:3002'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.WEB_URL || 'http://localhost:3000', process.env.METAVERSE_URL || 'http://localhost:3002']
}));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
setupRoutes(app);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    logger.info(`Socket ${socket.id} joined project ${projectId}`);
  });
  
  socket.on('join-metaverse', () => {
    socket.join('metaverse');
    logger.info(`Socket ${socket.id} joined metaverse`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible globally
export { io };

// Initialize Agents
setupAgents();

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📱 Web App: http://localhost:3000`);
  logger.info(`🌐 Metaverse: http://localhost:3002`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});