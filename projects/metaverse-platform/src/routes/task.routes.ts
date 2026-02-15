import { Router } from 'express';
import { taskController } from '@/controllers';
import { 
  authenticate, 
  validateTaskCreate, 
  validateTaskUpdate 
} from '@/middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: 获取任务列表
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 */
router.get('/', authenticate, taskController.getAll);

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: 获取任务统计
 *     tags: [Tasks]
 */
router.get('/stats', authenticate, taskController.getStats);

/**
 * @swagger
 * /api/v1/tasks/my:
 *   get:
 *     summary: 获取我的任务
 *     tags: [Tasks]
 */
router.get('/my', authenticate, taskController.getMyTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: 创建任务
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CHAT, ACTION, NAVIGATION, CUSTOM, SYSTEM]
 *               priority:
 *                 type: integer
 *               agentId:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               payload:
 *                 type: object
 *               maxRetries:
 *                 type: integer
 *               metadata:
 *                 type: object
 */
router.post('/', authenticate, validateTaskCreate, taskController.create);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: 获取指定任务
 *     tags: [Tasks]
 */
router.get('/:id', authenticate, taskController.getById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: 更新任务
 *     tags: [Tasks]
 */
router.put('/:id', authenticate, validateTaskUpdate, taskController.update);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: 删除任务
 *     tags: [Tasks]
 */
router.delete('/:id', authenticate, taskController.delete);

/**
 * @swagger
 * /api/v1/tasks/{id}/claim:
 *   post:
 *     summary: 领取任务
 *     tags: [Tasks]
 */
router.post('/:id/claim', authenticate, taskController.claim);

/**
 * @swagger
 * /api/v1/tasks/{id}/complete:
 *   post:
 *     summary: 完成任务
 *     tags: [Tasks]
 */
router.post('/:id/complete', authenticate, taskController.complete);

/**
 * @swagger
 * /api/v1/tasks/{id}/fail:
 *   post:
 *     summary: 标记任务失败
 *     tags: [Tasks]
 */
router.post('/:id/fail', authenticate, taskController.fail);

export default router;