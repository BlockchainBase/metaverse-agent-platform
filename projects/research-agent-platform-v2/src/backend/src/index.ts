import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Research Agent Platform Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
setupRoutes(app);

// WebSocket
const wss = new WebSocketServer({ server });
setupWebSocket(wss, prisma);

const PORT = process.env.PORT || 9876;

server.listen(PORT, () => {
  logger.info(`🚀 完整后端服务启动`);
  logger.info(`📡 HTTP API: http://localhost:${PORT}`);
  logger.info(`🌐 WebSocket: ws://localhost:${PORT}`);
  logger.info(`💾 Database: PostgreSQL`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

export { prisma };