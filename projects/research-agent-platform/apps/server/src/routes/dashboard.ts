import { Router } from 'express';

const router = Router();

// Mock dashboard stats
router.get('/stats', (req, res) => {
  res.json({
    projects: {
      total: 12,
      active: 8,
      completed: 3,
      delayed: 1
    },
    customers: {
      total: 15,
      newThisMonth: 3
    },
    finance: {
      revenue: 2500000,
      pendingPayments: 800000
    },
    tasks: {
      total: 45,
      overdue: 3,
      completedToday: 8
    }
  });
});

// Get recent activities
router.get('/activities', (req, res) => {
  res.json([
    { id: '1', type: 'PROJECT_CREATED', title: '新项目创建', description: '智慧校园系统项目已创建', createdAt: '2024-02-13T09:00:00Z' },
    { id: '2', type: 'TASK_COMPLETED', title: '任务完成', description: '需求分析任务已完成', createdAt: '2024-02-13T08:30:00Z' }
  ]);
});

export { router as dashboardRouter };