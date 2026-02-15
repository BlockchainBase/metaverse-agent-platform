import { Router } from 'express';
import { agentController } from '@/controllers';
import { authenticate, validateAgentCreate, validateLogin } from '@/middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: 获取 Agent 列表
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 状态筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: Agent 列表
 */
router.get('/', agentController.getAll);

/**
 * @swagger
 * /api/v1/agents:
 *   post:
 *     summary: 创建 Agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *               - name
 *             properties:
 *               agentId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               password:
 *                 type: string
 *               certFingerprint:
 *                 type: string
 *               metadata:
 *                 type: object
 */
router.post('/', validateAgentCreate, agentController.create);

/**
 * @swagger
 * /api/v1/agents/login:
 *   post:
 *     summary: Agent 登录
 *     tags: [Auth]
 */
router.post('/login', validateLogin, agentController.login);

/**
 * @swagger
 * /api/v1/agents/refresh:
 *   post:
 *     summary: 刷新令牌
 *     tags: [Auth]
 */
router.post('/refresh', agentController.refreshToken);

// 需要认证的路由
router.use(authenticate);

/**
 * @swagger
 * /api/v1/agents/me:
 *   get:
 *     summary: 获取当前 Agent 信息
 *     tags: [Agents]
 */
router.get('/me', agentController.getMe);

/**
 * @swagger
 * /api/v1/agents/me/status:
 *   put:
 *     summary: 更新当前 Agent 状态
 *     tags: [Agents]
 */
router.put('/me/status', agentController.updateStatus);

/**
 * @swagger
 * /api/v1/agents/logout:
 *   post:
 *     summary: 登出
 *     tags: [Auth]
 */
router.post('/logout', agentController.logout);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   get:
 *     summary: 获取指定 Agent
 *     tags: [Agents]
 */
router.get('/:id', agentController.getById);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   put:
 *     summary: 更新 Agent
 *     tags: [Agents]
 */
router.put('/:id', agentController.update);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   delete:
 *     summary: 删除 Agent
 *     tags: [Agents]
 */
router.delete('/:id', agentController.delete);

export default router;