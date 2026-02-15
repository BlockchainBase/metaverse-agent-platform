import { Router } from 'express';
import agentRoutes from './agent.routes';
import taskRoutes from './task.routes';
import systemRoutes from './system.routes';

const router = Router();

// 健康检查根路径
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API 路由
router.use('/agents', agentRoutes);
router.use('/tasks', taskRoutes);
router.use('/system', systemRoutes);

export default router;