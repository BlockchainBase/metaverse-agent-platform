import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/config';
import { prisma } from '@/config/prisma';
import routes from '@/routes';
import { errorHandler, notFoundHandler, requestLogger } from '@/middleware';
import { initializeWebSocket } from '@/websocket';
import { taskService } from '@/services';
import { heartbeatService } from '@/services';

// 创建 Express 应用
const app: Application = express();
const server = http.createServer(app);

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Metaverse Platform API',
      version: '1.0.0',
      description: 'Digital Human Metaverse Platform API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 安全中间件
app.use(helmet());
app.use(cors());

// 限流
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use(limiter);

// 日志中间件
app.use(morgan(config.logFormat));
app.use(requestLogger);

// 解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 路由
app.use('/api/v1', routes);

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 初始化 WebSocket
initializeWebSocket(server);

// 启动定时任务
const startBackgroundServices = () => {
  // 启动任务调度器
  taskService.startScheduler(5000);

  // 启动心跳监控
  heartbeatService.startMonitoring(config.heartbeat.intervalMs);

  console.log('Background services started');
};

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // 停止后台服务
  taskService.stopScheduler();
  heartbeatService.stopMonitoring();

  // 关闭 WebSocket 连接
  const io = (await import('@/websocket')).getIO();
  if (io) {
    io.close(() => {
      console.log('WebSocket server closed');
    });
  }

  // 关闭 HTTP 服务器
  server.close(() => {
    console.log('HTTP server closed');
  });

  // 断开数据库连接
  await prisma.$disconnect();
  console.log('Database connection closed');

  process.exit(0);
};

// 监听进程信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('Database connected successfully');

    // 启动后台服务
    startBackgroundServices();

    // 启动 HTTP 服务器
    server.listen(config.port, config.host, () => {
      console.log(`🚀 Server running on http://${config.host}:${config.port}`);
      console.log(`📚 API Documentation: http://${config.host}:${config.port}/api-docs`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动
startServer();

export { app, server };