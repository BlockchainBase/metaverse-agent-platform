import { Router } from 'express';

const router = Router();

// Mock tasks
const mockTasks = [
  {
    id: '1',
    projectId: '1',
    title: '完成客户需求分析',
    description: '分析智慧校园系统的核心需求',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: { id: '1', name: '张三' },
    project: { id: '1', name: '智慧校园系统' },
    dueDate: '2024-02-20',
    estimatedHours: 16,
    actualHours: 8,
    completedAt: null
  },
  {
    id: '2',
    projectId: '1',
    title: '设计数据库架构',
    description: '设计项目数据库表结构',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee: { id: '1', name: '张三' },
    project: { id: '1', name: '智慧校园系统' },
    dueDate: '2024-02-25',
    estimatedHours: 12,
    actualHours: 0,
    completedAt: null
  }
];

// Get tasks by project
router.get('/project/:projectId', (req, res) => {
  const tasks = mockTasks.filter(t => t.projectId === req.params.projectId);
  res.json(tasks);
});

// Get my tasks
router.get('/my/:userId', (req, res) => {
  res.json(mockTasks);
});

// Update task status
router.put('/:id/status', (req, res) => {
  const task = mockTasks.find(t => t.id === req.params.id);
  if (task) {
    task.status = req.body.status;
    if (req.body.status === 'DONE') {
      task.completedAt = new Date().toISOString();
    }
  }
  res.json(task);
});

export { router as taskRouter };