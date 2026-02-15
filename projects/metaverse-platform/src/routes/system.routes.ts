import { Router } from 'express';
import { systemController } from '@/controllers';
import { authenticate, validateHeartbeat } from '@/middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/system/health:
 *   get:
 *     summary: 健康检查
 *     tags: [System]
 *     responses:
 *       200:
 *         description: 系统健康状态
 */
router.get('/health', systemController.healthCheck);

/**
 * @swagger
 * /api/v1/system/status:
 *   get:
 *     summary: 获取系统状态
 *     tags: [System]
 */
router.get('/status', authenticate, systemController.getSystemStatus);

/**
 * @swagger
 * /api/v1/system/agents/online:
 *   get:
 *     summary: 获取在线 Agents
 *     tags: [System]
 */
router.get('/agents/online', authenticate, systemController.getOnlineAgents);

// 需要认证的路由
router.use(authenticate);

/**
 * @swagger
 * /api/v1/system/heartbeat:
 *   post:
 *     summary: 发送心跳
 *     tags: [System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, BUSY, AWAY, ERROR]
 *               cpuUsage:
 *                 type: number
 *               memoryUsage:
 *                 type: number
 *               networkLatency:
 *                 type: number
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *                   z:
 *                     type: number
 *               metadata:
 *                 type: object
 */
router.post('/heartbeat', validateHeartbeat, systemController.heartbeat);

/**
 * @swagger
 * /api/v1/system/heartbeats:
 *   get:
 *     summary: 获取当前 Agent 的心跳历史
 *     tags: [System]
 */
router.get('/heartbeats', systemController.getMyHeartbeats);

/**
 * @swagger
 * /api/v1/system/heartbeats/{agentId}:
 *   get:
 *     summary: 获取指定 Agent 的心跳历史
 *     tags: [System]
 */
router.get('/heartbeats/:agentId', systemController.getAgentHeartbeats);

/**
 * @swagger
 * /api/v1/system/heartbeats/{agentId}/latest:
 *   get:
 *     summary: 获取指定 Agent 的最新心跳
 *     tags: [System]
 */
router.get('/heartbeats/:agentId/latest', systemController.getLatestHeartbeat);

export default router;